import { supabase } from '../config/supabase.js';
import { successResponse } from '../utils/response.js';

// GET /api/professionals
export const getAllProfessionals = async (req, res, next) => {
  try {
    // TODO: query the `professionals` table in Supabase, with support for
    // pagination (page/limit) and filtering via req.query.
    return successResponse(res, { professionals: [] });
  } catch (err) {
    return next(err);
  }
};

// GET /api/professionals/:id
export const getProfessionalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: query the `professionals` table in Supabase for a single row by id
    // and return 404 via errorResponse if it does not exist.
    return successResponse(res, { professional: null });
  } catch (err) {
    return next(err);
  }
};
