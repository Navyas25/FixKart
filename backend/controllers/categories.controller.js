import { supabase } from '../config/supabase.js';
import { successResponse } from '../utils/response.js';

// GET /api/categories
// Returns every product category with a live product count so the filter
// dropdowns can be built from real data instead of hardcoded lists.
export const getCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, products(count)')
      .order('name', { ascending: true });

    if (error) throw error;

    const categories = (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      product_count:
        Array.isArray(c.products) && c.products.length
          ? c.products[0]?.count || 0
          : 0,
    }));

    return successResponse(res, { categories });
  } catch (err) {
    return next(err);
  }
};
