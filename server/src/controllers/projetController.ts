import type { Request, Response } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../config/db.js';
import { UPLOAD_DIR } from '../middlewares/upload.js';

interface ProjetInput {
    titre: string;
    description: string;
    lien: string | null;
    date_realisation: string | null;
    competences: number[];
}

const SELECT_PROJET = `SELECT id_projet, titre, description, lien, image_path,
    DATE_FORMAT(date_realisation, '%Y-%m-%d') AS date_realisation FROM projet`;

// Valide les champs texte du formulaire, renvoie null si invalide
function validate(body: any): ProjetInput | null {
    const titre = typeof body?.titre === 'string' ? body.titre.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const lien = body?.lien ? String(body.lien).trim() : null;
    const date = body?.date_realisation ? String(body.date_realisation).trim() : null;

    if (!titre || titre.length > 150 || !description) return null;
    if (lien && (lien.length > 255 || !/^https?:\/\//.test(lien))) return null;
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    let competences: number[] = [];
    if (body?.competences) {
        try {
        competences = JSON.parse(body.competences);
        } catch {
        return null;
        }
        if (!Array.isArray(competences) || !competences.every(Number.isInteger)) return null;
    }

    return { titre, description, lien, date_realisation: date, competences: [...new Set(competences)] };
}

// Supprime un fichier du dossier uploads (basename empêche de sortir du dossier)
async function deleteFile(imagePath: string | null | undefined): Promise<void> {
    if (!imagePath) return;
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(imagePath))).catch(() => {});
}

async function linkCompetences(conn: PoolConnection, idProjet: number, ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await conn.query('INSERT INTO projet_competence (id_projet, id_competence) VALUES ?', [
        ids.map((id) => [idProjet, id]),
    ]);
}

async function withCompetences(projets: RowDataPacket[]) {
    if (projets.length === 0) return [];
    const [links] = await pool.query<RowDataPacket[]>(
        `SELECT pc.id_projet, c.id_competence, c.nom, c.type, c.niveau
        FROM projet_competence pc
        JOIN competence c ON c.id_competence = pc.id_competence
        WHERE pc.id_projet IN (?)`,
        [projets.map((p) => p.id_projet)]
    );
    return projets.map((p) => ({
        ...p,
        competences: links
        .filter((l) => l.id_projet === p.id_projet)
        .map(({ id_competence, nom, type, niveau }) => ({ id_competence, nom, type, niveau })),
    }));
}

function handleError(error: any, res: Response): void {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        res.status(400).json({ message: 'Une des compétences n\'existe pas' });
        return;
    }
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
}

export async function getAll(_req: Request, res: Response): Promise<void> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
        `${SELECT_PROJET} ORDER BY date_realisation DESC, id_projet DESC`
        );
        res.json(await withCompetences(rows));
    } catch (error) {
        handleError(error, res);
    }
}

export async function getOne(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Identifiant invalide' });
        return;
    }
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`${SELECT_PROJET} WHERE id_projet = ?`, [id]);
        if (rows.length === 0) {
        res.status(404).json({ message: 'Projet introuvable' });
        return;
        }
        const [projet] = await withCompetences(rows);
        res.json(projet);
    } catch (error) {
        handleError(error, res);
    }
}

export async function create(req: Request, res: Response): Promise<void> {
    const data = validate(req.body);
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    if (!data) {
        await deleteFile(imagePath);
        res.status(400).json({ message: 'Données invalides' });
        return;
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.query<ResultSetHeader>(
        'INSERT INTO projet (titre, description, lien, image_path, date_realisation) VALUES (?, ?, ?, ?, ?)',
        [data.titre, data.description, data.lien, imagePath, data.date_realisation]
        );
        await linkCompetences(conn, result.insertId, data.competences);
        await conn.commit();
        res.status(201).json({ id_projet: result.insertId });
    } catch (error) {
        await conn.rollback();
        await deleteFile(imagePath);
        handleError(error, res);
    } finally {
        conn.release();
    }
}

export async function update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const data = validate(req.body);
    const newImage = req.file ? `/uploads/${req.file.filename}` : null;
    if (!Number.isInteger(id) || !data) {
        await deleteFile(newImage);
        res.status(400).json({ message: 'Données invalides' });
        return;
    }

    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.query<RowDataPacket[]>('SELECT image_path FROM projet WHERE id_projet = ?', [id]);
        if (rows.length === 0) {
        await deleteFile(newImage);
        res.status(404).json({ message: 'Projet introuvable' });
        return;
        }
        const oldImage: string | null = rows[0].image_path;

        await conn.beginTransaction();
        await conn.query(
        'UPDATE projet SET titre = ?, description = ?, lien = ?, image_path = ?, date_realisation = ? WHERE id_projet = ?',
        [data.titre, data.description, data.lien, newImage ?? oldImage, data.date_realisation, id]
        );
        await conn.query('DELETE FROM projet_competence WHERE id_projet = ?', [id]);
        await linkCompetences(conn, id, data.competences);
        await conn.commit();

        if (newImage) await deleteFile(oldImage);
        res.json({ id_projet: id });
    } catch (error) {
        await conn.rollback();
        await deleteFile(newImage);
        handleError(error, res);
    } finally {
        conn.release();
    }
}

export async function remove(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Identifiant invalide' });
        return;
    }
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT image_path FROM projet WHERE id_projet = ?', [id]);
        if (rows.length === 0) {
        res.status(404).json({ message: 'Projet introuvable' });
        return;
        }
        await pool.query('DELETE FROM projet WHERE id_projet = ?', [id]);
        await deleteFile(rows[0].image_path);
        res.json({ message: 'Projet supprimé' });
    } catch (error) {
        handleError(error, res);
    }
}