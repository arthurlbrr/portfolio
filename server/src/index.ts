import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { pool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import competenceRoutes from './routes/competenceRoutes.js';
import projetRoutes from './routes/projetRoutes.js';
import { UPLOAD_DIR } from './middlewares/upload.js';
import experienceRoutes from './routes/experienceRoutes.js';
import profilRoutes from './routes/profilRoutes.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/competences', competenceRoutes);
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api/projets', projetRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/profil', profilRoutes);

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