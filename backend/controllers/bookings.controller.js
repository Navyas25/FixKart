import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';

const BOOKING_SELECT = `
  *,
  service:services(id, name, category, base_price),
  professional:professionals(
    id, experience_years, rating, verification_status,
    profile:profiles(full_name, avatar_url)
  )
`;

const BOOKING_STATUSES = ['pending', 'confirmed', 'rejected', 'in_progress', 'completed', 'cancelled'];

// Attach the customer's profile (name, phone) to bookings so professionals
// can reach the customer for a job. RLS keeps this to the rows the caller
// already owns.
const attachCustomerProfiles = async (db, bookings) => {
  if (!bookings?.length) return bookings;

  const customerIds = [...new Set(bookings.map((b) => b.user_id))];

  const { data: customers } = await db
    .from('profiles')
    .select('id, full_name, phone, avatar_url')
    .in('id', customerIds);

  const byId = new Map((customers || []).map((c) => [c.id, c]));

  return bookings.map((booking) => ({
    ...booking,
    customer: byId.get(booking.user_id) || null,
  }));
};

// =====================================================
// GET MY BOOKINGS
// GET /api/bookings
// =====================================================
//
// Returns bookings belonging to the authenticated user. Professionals also
// receive the bookings customers made with them (their "jobs"), including
// the customer's name/phone so they can perform the service.

export const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('bookings')
      .select(BOOKING_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const bookings = data || [];

    // If this user has a professional profile, also return received bookings.
    const { data: professional } = await db
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (professional) {
      const { data: received, error: receivedError } = await db
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      const seen = new Set(bookings.map((b) => b.id));
      for (const booking of received || []) {
        if (!seen.has(booking.id)) {
          seen.add(booking.id);
          bookings.push(booking);
        }
      }

      const withCustomers = await attachCustomerProfiles(db, bookings);
      return successResponse(res, { bookings: withCustomers });
    }

    return successResponse(res, { bookings });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// CREATE BOOKING
// POST /api/bookings
// =====================================================
//
// New bookings are created as "pending" - the professional must accept them
// from their dashboard before the job is confirmed.

export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { professional_id, service_id, scheduled_at, address, notes } = req.body;
    const db = getUserSupabase(req);

    const notesWithAddress = [address && `Service address: ${address}`, notes]
      .filter(Boolean)
      .join(' | ');

    const { data, error } = await db
      .from('bookings')
      .insert({
        user_id: userId,
        professional_id,
        service_id,
        scheduled_at,
        notes: notesWithAddress,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, { booking: data }, 201);
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// RESPOND TO A BOOKING (PROFESSIONAL)
// PATCH /api/bookings/:id/respond
// =====================================================
//
// Accept or reject a booking. The professional must own the professional
// profile the booking was made with - enforced server-side by looking up
// the caller's professional row.

export const respondToBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body || {};

    if (action !== 'accept' && action !== 'reject') {
      return errorResponse(res, 'action must be "accept" or "reject"', 400);
    }

    const db = getUserSupabase(req);

    const { data: professional } = await db
      .from('professionals')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!professional) {
      return errorResponse(res, 'Only professionals can respond to bookings', 403);
    }

    const { data: booking } = await db
      .from('bookings')
      .select('id, status')
      .eq('id', id)
      .eq('professional_id', professional.id)
      .maybeSingle();

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    if (booking.status !== 'pending') {
      return errorResponse(
        res,
        `This booking is already "${booking.status}" and can no longer be ${action}ed`,
        409
      );
    }

    const nextStatus = action === 'accept' ? 'confirmed' : 'rejected';

    const { data, error } = await db
      .from('bookings')
      .update({ status: nextStatus })
      .eq('id', id)
      .eq('professional_id', professional.id)
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, {
      message: action === 'accept' ? 'Booking accepted' : 'Booking rejected',
      booking: data,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// UPDATE BOOKING STATUS (PROFESSIONAL)
// PATCH /api/bookings/:id/status
// =====================================================

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
      return errorResponse(
        res,
        'status must be one of: in_progress, completed, cancelled',
        400
      );
    }

    const db = getUserSupabase(req);

    const { data: professional } = await db
      .from('professionals')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!professional) {
      return errorResponse(res, 'Only professionals can update job status', 403);
    }

    const { data: booking } = await db
      .from('bookings')
      .select('id, status')
      .eq('id', id)
      .eq('professional_id', professional.id)
      .maybeSingle();

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    if (booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'rejected') {
      return errorResponse(
        res,
        `This booking is "${booking.status}" and can no longer be changed`,
        409
      );
    }

    const { data, error } = await db
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .eq('professional_id', professional.id)
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, { booking: data });
  } catch (err) {
    return next(err);
  }
};

// Utility export for validators
export const BOOKING_STATUSES_LIST = BOOKING_STATUSES;
