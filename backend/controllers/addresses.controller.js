import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';

// GET /api/addresses
export const getMyAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return successResponse(res, { addresses: data || [] });
  } catch (err) {
    return next(err);
  }
};

// POST /api/addresses
export const createAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = getUserSupabase(req);

    const { address_line, city, state, postal_code, is_default } = req.body;

    // Only one default address per user.
    if (is_default) {
      await db
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await db
      .from('addresses')
      .insert({
        user_id: userId,
        address_line,
        city,
        state: state || '',
        postal_code,
        is_default: Boolean(is_default),
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(res, { address: data }, 201);
  } catch (err) {
    return next(err);
  }
};

// PATCH /api/addresses/:id
export const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const db = getUserSupabase(req);

    const { address_line, city, state, postal_code, is_default } = req.body;

    const updates = {};
    if (address_line !== undefined) updates.address_line = address_line;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (postal_code !== undefined) updates.postal_code = postal_code;
    if (is_default !== undefined) updates.is_default = Boolean(is_default);

    if (!Object.keys(updates).length) {
      return errorResponse(res, 'No valid fields to update', 400);
    }

    if (updates.is_default) {
      await db
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await db
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return errorResponse(res, 'Address not found', 404);
    }

    return successResponse(res, { address: data });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/addresses/:id
export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return errorResponse(res, 'Address not found', 404);
    }

    return successResponse(res, { address: data });
  } catch (err) {
    return next(err);
  }
};
