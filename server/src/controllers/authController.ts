import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/db.js';

const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', 12);
interface AdminRow extends RowDataPacket {
    id_admin: number;
    email: string;
    mot_de_passe: string;
}

export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string' || password.length > 200) {
        res.status(400).json({ message: 'Email et mot de passe requis' });
        return;
    }

    try {
        const [rows] = await pool.query<AdminRow[]>(
        'SELECT id_admin, email, mot_de_passe FROM admin WHERE email = ?',
        [email]
        );
    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin?.mot_de_passe ?? DUMMY_HASH);

    if (!admin || !valid) {
        res.status(401).json({ message: 'Identifiants invalides' });
        return;
    }

    const token = jwt.sign({ id: admin.id_admin }, process.env.JWT_SECRET as string, {
        expiresIn: '2h',
    });

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 2 * 60 * 60 * 1000,
    });
    res.json({ message: 'Connecté' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

export function logout(_req: Request, res: Response): void {
    res.clearCookie('token');
    res.json({ message: 'Déconnecté' });
}

export function me(_req: Request, res: Response): void {
    res.json({ authenticated: true });
}   