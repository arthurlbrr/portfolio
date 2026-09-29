import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
    console.error('ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans .env');
    process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

await pool.query(
    'INSERT INTO admin (email, mot_de_passe) VALUES (?, ?) ON DUPLICATE KEY UPDATE mot_de_passe = VALUES(mot_de_passe)',
    [email, hash]
);

console.log('Compte admin créé ou mis à jour');
await pool.end();