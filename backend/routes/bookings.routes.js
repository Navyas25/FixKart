import { Router } from 'express';
import {
  getMyBookings,
  createBooking,
  autoAssignBooking,
  respondToBooking,
  updateBookingStatus,
} from '../controllers/bookings.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireProfessional } from '../middleware/role.middleware.js';
import { validate, createBookingSchema } from '../validators/booking.validator.js';

const router = Router();

router.get('/', requireAuth, getMyBookings);
router.post('/', requireAuth, validate(createBookingSchema), createBooking);
router.post('/auto-assign', requireAuth, autoAssignBooking);

// Professional-only actions on their own bookings.
router.patch('/:id/respond', requireAuth, requireProfessional, respondToBooking);
router.patch('/:id/status', requireAuth, requireProfessional, updateBookingStatus);

export default router;
