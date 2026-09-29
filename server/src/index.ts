import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { pool } from './config/db.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/health/db', async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ db: 'ok' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ db: 'error' });
    }
});

app.listen(port, () => {
    console.log(`API démarrée sur http://localhost:${port}`);
});