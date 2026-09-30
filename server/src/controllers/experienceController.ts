import type { Request, Response } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../config/db.js';
import { UPLOAD_DIR } from '../middlewares/upload.js';

const CONTRATS = ['stage', 'alternance', 'emploi', 'freelance'];

interface ExperienceInput {
    poste: string;
    entreprise: string;
    lieu: string | null;
    type_contrat: string;
    date_debut: string;
    date_fin: string | null;
    description: string;
    lien: string | null;
    competences: number[];
}

const SELECT_EXPERIENCE = `SELECT id_experience, poste, entreprise, lieu, type_contrat,
    DATE_FORMAT(date_debut, '%Y-%m-%d') AS date_debut,
    DATE_FORMAT(date_fin, '%Y-%m-%d') AS date_fin,
    description, lien, image_path FROM experience`;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Valide les champs texte du formulaire, renvoie null si invalide
function validate(body: any): ExperienceInput | null {
    const poste = typeof body?.poste === 'string' ? body.poste.trim() : '';
    const entreprise = typeof body?.entreprise === 'string' ? body.entreprise.trim() : '';
    const lieu = body?.lieu ? String(body.lieu).trim() : null;
    const type_contrat = body?.type_contrat;
    const date_debut = typeof body?.date_debut === 'string' ? body.date_debut.trim() : '';
    const date_fin = body?.date_fin ? String(body.date_fin).trim() : null;
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const lien = body?.lien ? String(body.lien).trim() : null;

    if (!poste || poste.length > 150 || !entreprise || entreprise.length > 150) return null;
    if (lieu && lieu.length > 100) return null;
    if (!CONTRATS.includes(type_contrat)) return null;
    if (!DATE_REGEX.test(date_debut)) return null;
    if (date_fin && (!DATE_REGEX.test(date_fin) || date_fin < date_debut)) return null;
    if (!description) return null;
    if (lien && (lien.length > 255 || !/^https?:\/\//.test(lien))) return null;

    let competences: number[] = [];
    if (body?.competences) {
        try {
        competences = JSON.parse(body.competences);
        } catch {
        return null;
        }
        if (!Array.isArray(competences) || !competences.every(Number.isInteger)) return null;
    }

    return {
        poste,
        entreprise,
        lieu,
        type_contrat,
        date_debut,
        date_fin,
        description,
        lien,
        competences: [...new Set(competences)],
    };
}

// Supprime un fichier du dossier uploads (basename empêche de sortir du dossier)
async function deleteFile(imagePath: string | null | undefined): Promise<void> {
    if (!imagePath) return;
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(imagePath))).catch(() => {});
}

async function linkCompetences(conn: PoolConnection, idExperience: number, ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await conn.query('INSERT INTO experience_competence (id_experience, id_competence) VALUES ?', [
        ids.map((id) => [idExperience, id]),
    ]);
}

async function withCompetences(experiences: RowDataPacket[]) {
    if (experiences.length === 0) return [];
    const [links] = await pool.query<RowDataPacket[]>(
        `SELECT ec.id_experience, c.id_competence, c.nom, c.type, c.niveau
        FROM experience_competence ec
        JOIN competence c ON c.id_competence = ec.id_competence
        WHERE ec.id_experience IN (?)`,
        [experiences.map((e) => e.id_experience)]
    );
    return experiences.map((e) => ({
        ...e,
        competences: links
        .filter((l) => l.id_experience === e.id_experience)
        .map(({ id_competence, nom, type, niveau }) => ({ id_competence, nom, type, niveau })),
    }));
}

function handleError(error: any, res: Response): void {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        res.status(400).json({ message: "Une des compétences n'existe pas" });
        return;
    }
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
}

export async function getAll(_req: Request, res: Response): Promise<void> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
        `${SELECT_EXPERIENCE} ORDER BY date_debut DESC, id_experience DESC`
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
        const [rows] = await pool.query<RowDataPacket[]>(`${SELECT_EXPERIENCE} WHERE id_experience = ?`, [id]);
        if (rows.length === 0) {
        res.status(404).json({ message: 'Expérience introuvable' });
        return;
        }
        const [experience] = await withCompetences(rows);
        res.json(experience);
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
        `INSERT INTO experience (poste, entreprise, lieu, type_contrat, date_debut, date_fin, description, lien, image_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.poste, data.entreprise, data.lieu, data.type_contrat, data.date_debut, data.date_fin, data.description, data.lien, imagePath]
        );
        await linkCompetences(conn, result.insertId, data.competences);
        await conn.commit();
        res.status(201).json({ id_experience: result.insertId });
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
        const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT image_path FROM experience WHERE id_experience = ?',
        [id]
        );
        if (rows.length === 0) {
        await deleteFile(newImage);
        res.status(404).json({ message: 'Expérience introuvable' });
        return;
        }
        const oldImage: string | null = rows[0].image_path;

        await conn.beginTransaction();
        await conn.query(
        `UPDATE experience SET poste = ?, entreprise = ?, lieu = ?, type_contrat = ?, date_debut = ?,
        date_fin = ?, description = ?, lien = ?, image_path = ? WHERE id_experience = ?`,
        [data.poste, data.entreprise, data.lieu, data.type_contrat, data.date_debut, data.date_fin, data.description, data.lien, newImage ?? oldImage, id]
        );
        await conn.query('DELETE FROM experience_competence WHERE id_experience = ?', [id]);
        await linkCompetences(conn, id, data.competences);
        await conn.commit();

        if (newImage) await deleteFile(oldImage);
        res.json({ id_experience: id });
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
        const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT image_path FROM experience WHERE id_experience = ?',
        [id]
        );
        if (rows.length === 0) {
        res.status(404).json({ message: 'Expérience introuvable' });
        return;
        }
        await pool.query('DELETE FROM experience WHERE id_experience = ?', [id]);
        await deleteFile(rows[0].image_path);
        res.json({ message: 'Expérience supprimée' });
    } catch (error) {
        handleError(error, res);
    }
}