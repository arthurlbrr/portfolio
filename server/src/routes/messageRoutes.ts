import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { create, getAll, setRead, remove } from '../controllers/messageController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: { message: "Trop d'envois, réessayez plus tard" },
});

// Public
router.post('/', contactLimiter, create);

// Admin uniquement
router.get('/', requireAuth, getAll);
router.patch('/:id', requireAuth, setRead);
router.delete('/:id', requireAuth, remove);

export default router;