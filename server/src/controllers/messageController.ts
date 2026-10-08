import type { Request, Response } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db.js';

interface MessageInput {
    nom: string;
    email: string;
    contenu: string;
}

function validate(body: any): MessageInput | null {
    const nom = typeof body?.nom === 'string' ? body.nom.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const contenu = typeof body?.contenu === 'string' ? body.contenu.trim() : '';

    if (!nom || nom.length > 100) return null;
    if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    if (!contenu || contenu.length > 2000) return null;

    return { nom, email, contenu };
}

function serverError(error: unknown, res: Response): void {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
}

export async function create(req: Request, res: Response): Promise<void> {
    // Champ piège "website" : invisible pour un humain, rempli par les robots.
    // On répond comme si tout allait bien, sans rien enregistrer.
    if (req.body?.website) {
        res.status(201).json({ message: 'Message envoyé' });
        return;
    }
    const data = validate(req.body);
    if (!data) {
        res.status(400).json({ message: 'Données invalides' });
        return;
    }
    try {
        await pool.query('INSERT INTO message (nom, email, contenu) VALUES (?, ?, ?)', [
        data.nom,
        data.email,
        data.contenu,
        ]);
        res.status(201).json({ message: 'Message envoyé' });
    } catch (error) {
        serverError(error, res);
    }
}

export async function getAll(_req: Request, res: Response): Promise<void> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id_message, nom, email, contenu, date_envoi, est_lu FROM message ORDER BY date_envoi DESC, id_message DESC'
        );
        res.json(rows.map((row) => ({ ...row, est_lu: Boolean(row.est_lu) })));
    } catch (error) {
        serverError(error, res);
    }
}

export async function setRead(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const estLu = req.body?.est_lu;
    if (!Number.isInteger(id) || typeof estLu !== 'boolean') {
        res.status(400).json({ message: 'Données invalides' });
        return;
    }
    try {
        const [result] = await pool.query<ResultSetHeader>(
        'UPDATE message SET est_lu = ? WHERE id_message = ?',
        [estLu, id]
        );
        if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Message introuvable' });
        return;
        }
        res.json({ id_message: id, est_lu: estLu });
    } catch (error) {
        serverError(error, res);
    }
}

export async function remove(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Identifiant invalide' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM message WHERE id_message = ?', [id]);
        if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Message introuvable' });
        return;
        }
        res.json({ message: 'Message supprimé' });
    } catch (error) {
        serverError(error, res);
    }
}