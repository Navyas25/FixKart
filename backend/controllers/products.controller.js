import { supabase } from '../config/supabase.js';
import { successResponse } from '../utils/response.js';

// GET /api/products
export const getAllProducts = async (req, res, next) => {
  try {
    // TODO: query the `products` table in Supabase, with support for
    // pagination (page/limit) and filtering via req.query.
    return successResponse(res, { products: [] });
  } catch (err) {
    return next(err);
  }
};

// GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: query the `products` table in Supabase for a single row by id
    // and return 404 via errorResponse if it does not exist.
    return successResponse(res, { product: null });
  } catch (err) {
    return next(err);
  }
};
