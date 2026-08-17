import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { isUuid } from '../utils/ids.js';

const SERVICE_SELECT = `
  id, name, category, description, base_price, image_url, created_at
`;

// GET /api/services
export const getAllServices = async (req, res, next) => {
  try {
    const {
      category,
      q,
      sort = 'featured',
      page = 1,
      limit = 100,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 100);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('services')
      .select(SERVICE_SELECT, { count: 'exact' });

    if (category) {
      // Case-insensitive so slugs ('plumbing') and display names ('Plumbing')
      // both match - the seeded data stores display names.
      query = query.ilike('category', category);
    }

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (sort === 'price-low') {
      query = query.order('base_price', { ascending: true });
    } else if (sort === 'price-high') {
      query = query.order('base_price', { ascending: false });
    } else if (sort === 'name') {
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return successResponse(res, {
      services: data || [],
      total: count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/services/:id
export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isUuid(id)) {
      return errorResponse(res, 'Service not found', 404);
    }

    const { data, error } = await supabase
      .from('services')
      .select(SERVICE_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return errorResponse(res, 'Service not found', 404);
    }

    return successResponse(res, { service: data });
  } catch (err) {
    return next(err);
  }
};
