import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET as string);
        next();
    } catch {
        res.status(401).json({ message: 'Session invalide ou expirée' });
    }
}