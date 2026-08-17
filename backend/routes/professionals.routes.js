import { Router } from 'express';
import {
  getAllProfessionals,
  getProfessionalById,
} from '../controllers/professionals.controller.js';
import {
  getMyProfessionalProfile,
  updateMyProfessionalProfile,
  getMyEarnings,
  uploadDocument,
  getAllProfessionalsAdmin,
  verifyProfessional,
} from '../controllers/professional.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireProfessional, requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// --- Professional portal (own data only) ------------------------
// Registered BEFORE the public /:id route so "me" is never captured as an id.
router.get('/me', requireAuth, requireProfessional, getMyProfessionalProfile);
router.patch('/me', requireAuth, requireProfessional, updateMyProfessionalProfile);
router.get('/me/earnings', requireAuth, requireProfessional, getMyEarnings);
router.post('/document', requireAuth, requireProfessional, uploadDocument);

// --- Admin --------------------------------------------------------
router.get('/admin', requireAuth, requireAdmin, getAllProfessionalsAdmin);
router.patch('/:id/verify', requireAuth, requireAdmin, verifyProfessional);

// --- Public catalog ---------------------------------------------
router.get('/', getAllProfessionals);
router.get('/:id', getProfessionalById);

export default router;
