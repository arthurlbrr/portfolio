import './config/env.js';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import competenceRoutes from './routes/competenceRoutes.js';
import projetRoutes from './routes/projetRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import profilRoutes from './routes/profilRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { UPLOAD_DIR } from './middlewares/upload.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(
    '/api',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        message: { message: 'Trop de requêtes, réessayez plus tard' },
    })
);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/competences', competenceRoutes);
app.use('/api/projets', projetRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/profil', profilRoutes);
app.use('/api/messages', messageRoutes);
app.use('/uploads', express.static(UPLOAD_DIR));

app.use((_req, res) => {
    res.status(404).json({ message: 'Route introuvable' });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err?.type === 'entity.parse.failed') {
        res.status(400).json({ message: 'JSON invalide' });
        return;
    }
    if (err?.type === 'entity.too.large') {
        res.status(413).json({ message: 'Requête trop volumineuse' });
        return;
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
});

app.listen(port, () => {
    console.log(`API démarrée sur http://localhost:${port}`);
});