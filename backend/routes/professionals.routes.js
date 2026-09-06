import { Router } from 'express';
import {
  getAllProfessionals,
  getProfessionalById,
} from '../controllers/professionals.controller.js';
import {
  getMyProfessionalProfile,
  updateMyProfessionalProfile,
  getMyEarnings,
  getProfessionalDashboard,
  getMyBookings,
  toggleAvailability,
  getMyNotifications,
  getMyReviews,
  getMyServices,
  updateService,
  uploadDocument,
  getAllProfessionalsAdmin,
  verifyProfessional,
} from '../controllers/professional.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireProfessional, requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// --- Professional portal (own data only) ------------------------
router.get('/me/dashboard', requireAuth, requireProfessional, getProfessionalDashboard);
router.get('/me', requireAuth, requireProfessional, getMyProfessionalProfile);
router.patch('/me', requireAuth, requireProfessional, updateMyProfessionalProfile);
router.get('/me/earnings', requireAuth, requireProfessional, getMyEarnings);
router.get('/me/bookings', requireAuth, requireProfessional, getMyBookings);
router.patch('/me/availability', requireAuth, requireProfessional, toggleAvailability);
router.get('/me/notifications', requireAuth, requireProfessional, getMyNotifications);
router.get('/me/reviews', requireAuth, requireProfessional, getMyReviews);
router.get('/me/services', requireAuth, requireProfessional, getMyServices);
router.patch('/me/services/:id', requireAuth, requireProfessional, updateService);
router.post('/document', requireAuth, requireProfessional, uploadDocument);

// --- Admin --------------------------------------------------------
router.get('/admin', requireAuth, requireAdmin, getAllProfessionalsAdmin);
router.patch('/:id/verify', requireAuth, requireAdmin, verifyProfessional);

// --- Public catalog ---------------------------------------------
router.get('/', getAllProfessionals);
router.get('/:id', getProfessionalById);

export default router;
