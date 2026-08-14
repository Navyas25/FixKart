import { successResponse } from '../utils/response.js';

// GET /api/bookings
// Returns bookings belonging to the authenticated user only.
export const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // TODO: query the `bookings` table in Supabase, scoped to userId
    // (or to professional_id, for a professional's own bookings view).
    return successResponse(res, { bookings: [] });
  } catch (err) {
    return next(err);
  }
};

// POST /api/bookings
export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { professional_id, service_id, scheduled_date, address, notes } = req.body;

    // TODO: check professional availability, then insert into `bookings`.
    return successResponse(
      res,
      { userId, professional_id, service_id, scheduled_date, address, notes },
      201
    );
  } catch (err) {
    return next(err);
  }
};
