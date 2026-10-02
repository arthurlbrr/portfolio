import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../config/db.js';
import { UPLOAD_DIR } from '../middlewares/upload.js';

interface ProfilInput {
    nom: string;
    prenom: string;
    titre: string;
    bio: string | null;
    email: string;
    telephone: string | null;
    ville: string | null;
    linkedin: string | null;
    github: string | null;
}

// Renvoie la valeur nettoyee ou null si vide
function clean(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

// Valide le corps de la requête renvoie null si invalide
function validate(body: any): ProfilInput | null {
    const nom = clean(body?.nom);
    const prenom = clean(body?.prenom);
    const titre = clean(body?.titre);
    const email = clean(body?.email);
    const bio = clean(body?.bio);
    const telephone = clean(body?.telephone);
    const ville = clean(body?.ville);
    const linkedin = clean(body?.linkedin);
    const github = clean(body?.github);

    if (!nom || nom.length > 100 || !prenom || prenom.length > 100) return null;
    if (!titre || titre.length > 150) return null;
    if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    if (telephone && telephone.length > 20) return null;
    if (ville && ville.length > 100) return null;
    for (const url of [linkedin, github]) {
        if (url && (url.length > 255 || !/^https?:\/\//.test(url))) return null;
    }

    return { nom, prenom, titre, bio, email, telephone, ville, linkedin, github };
}

// Supprime un fichier du dossier uploads (basename empêche de sortir du dossier)
async function deleteFile(filePath: string | null | undefined): Promise<void> {
    if (!filePath) return;
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(filePath))).catch(() => {});
}

export async function getProfil(_req: Request, res: Response): Promise<void> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT nom, prenom, titre, bio, email, telephone, ville, cv_path, linkedin, github
        FROM profil WHERE id_profil = 1`
        );
        if (rows.length === 0) {
        res.status(404).json({ message: 'Profil non renseigné' });
        return;
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

export async function downloadCv(_req: Request, res: Response): Promise<void> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT prenom, nom, cv_path FROM profil WHERE id_profil = 1'
        );
        const profil = rows[0];
        if (!profil?.cv_path) {
        res.status(404).json({ message: 'CV indisponible' });
        return;
        }
        const filename = `CV-${profil.prenom}-${profil.nom}.pdf`.replace(/[^\w.-]/g, '_');
        res.download(path.join(UPLOAD_DIR, path.basename(profil.cv_path)), filename, (err) => {
        if (err && !res.headersSent) res.status(404).json({ message: 'CV indisponible' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

export async function update(req: Request, res: Response): Promise<void> {
    const data = validate(req.body);
    const newCv = req.file ? `/uploads/${req.file.filename}` : null;
    if (!data) {
        await deleteFile(newCv);
        res.status(400).json({ message: 'Données invalides' });
        return;
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT cv_path FROM profil WHERE id_profil = 1');
        const oldCv: string | null = rows[0]?.cv_path ?? null;

        await pool.query(
        `INSERT INTO profil (id_profil, nom, prenom, titre, bio, email, telephone, ville, cv_path, linkedin, github)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE nom = VALUES(nom), prenom = VALUES(prenom), titre = VALUES(titre),
            bio = VALUES(bio), email = VALUES(email), telephone = VALUES(telephone), ville = VALUES(ville),
            cv_path = VALUES(cv_path), linkedin = VALUES(linkedin), github = VALUES(github)`,
        [data.nom, data.prenom, data.titre, data.bio, data.email, data.telephone, data.ville, newCv ?? oldCv, data.linkedin, data.github]
        );

        if (newCv) await deleteFile(oldCv);
        res.json({ message: 'Profil mis à jour' });
    } catch (error) {
        await deleteFile(newCv);
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}