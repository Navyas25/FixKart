import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';

// GET /api/users/profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return errorResponse(res, 'Profile not found', 404);
    }

    return successResponse(res, { profile: data });
  } catch (err) {
    return next(err);
  }
};

// PATCH /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = getUserSupabase(req);

    // Whitelist editable fields - role and id can never be changed here.
    const { full_name, phone, avatar_url } = req.body;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    if (!Object.keys(updates).length) {
      return errorResponse(res, 'No valid fields to update', 400);
    }

    const { data, error } = await db
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return errorResponse(res, 'Profile not found', 404);
    }

    return successResponse(res, { profile: data });
  } catch (err) {
    return next(err);
  }
};
