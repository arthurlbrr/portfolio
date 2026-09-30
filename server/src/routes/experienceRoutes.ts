import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/experienceController.js';
import { requireAuth } from '../middlewares/auth.js';
import { uploadImage } from '../middlewares/upload.js';

const router = Router();

// Public
router.get('/', getAll);
router.get('/:id', getOne);

// Admin uniquement (requireAuth AVANT uploadImage)
router.post('/', requireAuth, uploadImage, create);
router.put('/:id', requireAuth, uploadImage, update);
router.delete('/:id', requireAuth, remove);

export default router;