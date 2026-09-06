import { Router } from 'express';
import {
  getAdminDashboard,
  getAllUsers,
  getAllOrders,
  getAllBookings,
  getAdminAnalytics,
  getAllReviews,
  getSupportTickets,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

router.get('/dashboard', requireAuth, requireAdmin, getAdminDashboard);
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.get('/orders', requireAuth, requireAdmin, getAllOrders);
router.get('/bookings', requireAuth, requireAdmin, getAllBookings);
router.get('/analytics', requireAuth, requireAdmin, getAdminAnalytics);
router.get('/reviews', requireAuth, requireAdmin, getAllReviews);
router.get('/support', requireAuth, requireAdmin, getSupportTickets);

export default router;
