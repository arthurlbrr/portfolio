import type { Request, Response } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db.js';

const TYPES = ['technique', 'transversale'];

interface CompetenceInput {
  nom: string;
  type: string;
  niveau: number | null;
}

// Valide le corps de la requête, renvoie null si invalide
function validate(body: any): CompetenceInput | null {
    const nom = typeof body?.nom === 'string' ? body.nom.trim() : '';
    const type = body?.type;
    const niveau = body?.niveau ?? null;

    if (!nom || nom.length > 100) return null;
    if (!TYPES.includes(type)) return null;
    if (niveau !== null && (!Number.isInteger(niveau) || niveau < 1 || niveau > 5)) return null;

    return { nom, type, niveau };
}

export async function getAll(_req: Request, res: Response): Promise<void> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id_competence, nom, type, niveau FROM competence ORDER BY type, nom'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

export async function create(req: Request, res: Response): Promise<void> {
    const data = validate(req.body);
    if (!data) {
        res.status(400).json({ message: 'Données invalides' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO competence (nom, type, niveau) VALUES (?, ?, ?)',
        [data.nom, data.type, data.niveau]
        );
        res.status(201).json({ id_competence: result.insertId, ...data });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ message: 'Cette compétence existe déjà' });
        return;
        }
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

export async function update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const data = validate(req.body);
    if (!Number.isInteger(id) || !data) {
        res.status(400).json({ message: 'Données invalides' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
        'UPDATE competence SET nom = ?, type = ?, niveau = ? WHERE id_competence = ?',
        [data.nom, data.type, data.niveau, id]
        );
        if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Compétence introuvable' });
        return;
        }
        res.json({ id_competence: id, ...data });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ message: 'Cette compétence existe déjà' });
        return;
        }
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

export async function remove(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Identifiant invalide' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM competence WHERE id_competence = ?',
        [id]
        );
        if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Compétence introuvable' });
        return;
        }
        res.json({ message: 'Compétence supprimée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}