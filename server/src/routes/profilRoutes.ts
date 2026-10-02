import { Router } from 'express';
import { getProfil, downloadCv, update } from '../controllers/profilController.js';
import { requireAuth } from '../middlewares/auth.js';
import { uploadCv } from '../middlewares/upload.js';

const router = Router();

// Public
router.get('/', getProfil);
router.get('/cv', downloadCv);

// Admin uniquement (requireAuth avant uploadCv)
router.put('/', requireAuth, uploadCv, update);

export default router;