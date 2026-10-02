import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Fabrique un middleware d'upload pour un champ des format et une taille max donnee
function createUpload(
    field: string,
    extensions: Record<string, string>,
    maxMo: number,
    formatMessage: string
    ): RequestHandler {
    const upload = multer({
        storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => cb(null, crypto.randomUUID() + extensions[file.mimetype]),
        }),
        limits: { fileSize: maxMo * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
        if (file.mimetype in extensions) cb(null, true);
        else cb(new Error(formatMessage));
        },
    }).single(field);

    return (req: Request, res: Response, next: NextFunction): void => {
        upload(req, res, (err: unknown) => {
        if (err) {
            const message =
            err instanceof multer.MulterError
                ? `Fichier invalide (${maxMo} Mo maximum)`
                : (err as Error).message;
            res.status(400).json({ message });
            return;
        }
        next();
        });
    };
}

export const uploadImage = createUpload(
    'image',
    { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' },
    2,
    'Format accepté : JPEG, PNG ou WebP'
);

export const uploadCv = createUpload('cv', { 'application/pdf': '.pdf' }, 5, 'Format accepté : PDF');