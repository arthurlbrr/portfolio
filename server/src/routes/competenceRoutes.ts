import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/competenceController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Public
router.get('/', getAll);

// Admin uniquement
router.post('/', requireAuth, create);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

export default router;