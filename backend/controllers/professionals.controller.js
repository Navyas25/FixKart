import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { isUuid } from '../utils/ids.js';

const PROFESSIONAL_SELECT = `
  id, user_id, experience_years, rating, bio, created_at,
  profile:profiles(full_name, avatar_url, phone)
`;

// GET /api/professionals
export const getAllProfessionals = async (req, res, next) => {
  try {
    const {
      q,
      min_rating,
      sort = 'rating',
      page = 1,
      limit = 100,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 100);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('professionals')
      .select(PROFESSIONAL_SELECT, { count: 'exact' });

    if (min_rating !== undefined && min_rating !== '') {
      query = query.gte('rating', Number(min_rating));
    }

    if (q) {
      query = query.or(`bio.ilike.%${q}%`);
    }

    if (sort === 'experience') {
      query = query.order('experience_years', { ascending: false });
    } else {
      query = query.order('rating', { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return successResponse(res, {
      professionals: data || [],
      total: count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/professionals/:id
export const getProfessionalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isUuid(id)) {
      return errorResponse(res, 'Professional not found', 404);
    }

    const { data, error } = await supabase
      .from('professionals')
      .select(PROFESSIONAL_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return errorResponse(res, 'Professional not found', 404);
    }

    return successResponse(res, { professional: data });
  } catch (err) {
    return next(err);
  }
};
