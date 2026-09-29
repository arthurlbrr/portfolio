import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const EXTENSIONS: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

const upload = multer({
    storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => cb(null, crypto.randomUUID() + EXTENSIONS[file.mimetype]),
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype in EXTENSIONS) cb(null, true);
        else cb(new Error('Format accepté : JPEG, PNG ou WebP'));
    },
}).single('image');

export function uploadImage(req: Request, res: Response, next: NextFunction): void {
    upload(req, res, (err: unknown) => {
        if (err) {
        const message = err instanceof multer.MulterError ? 'Fichier invalide (2 Mo maximum)' : (err as Error).message;
        res.status(400).json({ message });
        return;
        }
        next();
    });
}