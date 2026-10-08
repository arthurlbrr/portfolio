import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
    'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    'image/webp': (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
    'application/pdf': (b) => b.subarray(0, 5).toString('latin1') === '%PDF-',
};

async function hasValidSignature(file: Express.Multer.File): Promise<boolean> {
    const handle = await fs.open(file.path, 'r');
    try {
        const buffer = Buffer.alloc(12);
        await handle.read(buffer, 0, 12, 0);
        return SIGNATURES[file.mimetype]?.(buffer) ?? false;
    } finally {
        await handle.close();
    }
}

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
        upload(req, res, async (err: unknown) => {
        if (err) {
            const message =
            err instanceof multer.MulterError
                ? `Fichier invalide (${maxMo} Mo maximum)`
                : (err as Error).message;
            res.status(400).json({ message });
            return;
        }
        try {
            if (req.file && !(await hasValidSignature(req.file))) {
            await fs.unlink(req.file.path).catch(() => {});
            res.status(400).json({ message: 'Le contenu du fichier ne correspond pas à son format' });
            return;
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur serveur' });
        }
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