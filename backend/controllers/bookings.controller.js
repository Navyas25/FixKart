import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';

const BOOKING_SELECT = `
  *,
  service:services(id, name, category, base_price),
  professional:professionals(
    id, experience_years, rating,
    profile:profiles(full_name, avatar_url)
  )
`;

// GET /api/bookings
// Returns bookings belonging to the authenticated user only. If the user is
// themselves a professional, their received bookings are included too so the
// professional dashboard has something meaningful to show.
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

    // If this user has a professional profile, also return the bookings
    // customers made with them.
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
    }

    return successResponse(res, { bookings });
  } catch (err) {
    return next(err);
  }
};

// POST /api/bookings
export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { professional_id, service_id, scheduled_at, address, notes } = req.body;
    const db = getUserSupabase(req);

    // The `bookings` table has no dedicated address column, so the service
    // address is folded into the notes field when provided.
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
        status: 'confirmed',
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, { booking: data }, 201);
  } catch (err) {
    return next(err);
  }
};
