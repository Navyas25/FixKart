import { Router } from 'express';
import { getMyBookings, createBooking } from '../controllers/bookings.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../validators/booking.validator.js';
import { createBookingSchema } from '../validators/booking.validator.js';

const router = Router();

router.get('/', requireAuth, getMyBookings);
router.post('/', requireAuth, validate(createBookingSchema), createBooking);

export default router;
