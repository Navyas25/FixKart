import { supabase } from '../config/supabase.js';
import { successResponse } from '../utils/response.js';

// GET /api/services
export const getAllServices = async (req, res, next) => {
  try {
    // TODO: query the `services` table in Supabase, with support for
    // pagination (page/limit) and filtering via req.query.
    return successResponse(res, { services: [] });
  } catch (err) {
    return next(err);
  }
};

// GET /api/services/:id
export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: query the `services` table in Supabase for a single row by id
    // and return 404 via errorResponse if it does not exist.
    return successResponse(res, { service: null });
  } catch (err) {
    return next(err);
  }
};
