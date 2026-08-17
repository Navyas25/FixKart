import { Router } from 'express';
import { getMyWallet } from '../controllers/wallet.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, getMyWallet);

export default router;
