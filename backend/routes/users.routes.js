import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/users.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', requireAuth, getProfile);
router.patch('/profile', requireAuth, updateProfile);

export default router;
