import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { isUuid } from '../utils/ids.js';

const PROFESSIONAL_SELECT = `
  id, user_id, experience_years, rating, bio, created_at,
  service_categories, service_locations,
  profile:profiles(full_name, avatar_url, phone)
`;

// GET /api/professionals
// Public catalog: only verified professionals, filterable by service category
// (service_categories array), minimum rating, and a free-text search that
// matches bio, name, and category.
export const getAllProfessionals = async (req, res, next) => {
  try {
    const {
      q,
      category,
      min_rating,
      sort = 'rating',
      page = 1,
      limit = 100,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 100);

    let query = supabase
      .from('professionals')
      .select(PROFESSIONAL_SELECT, { count: 'exact' })
      .eq('verification_status', 'verified');

    if (category) {
      // Exact display-name match against the service_categories array, e.g.
      // ?category=Plumbing. The frontend sends the values shown in the UI.
      query = query.contains('service_categories', [String(category)]);
    }

    if (min_rating !== undefined && min_rating !== '') {
      query = query.gte('rating', Number(min_rating));
    }

    // The free-text search is applied in JS below (bio OR full name OR
    // categories) - it can't be expressed in one PostgREST or() with the
    // embedded profile relation, so don't narrow the query here.

    if (sort === 'experience') {
      query = query.order('experience_years', { ascending: false });
    } else {
      query = query.order('rating', { ascending: false });
    }

    // Name search can't be expressed in one PostgREST or() with the embedded
    // profile relation, so when searching we fetch all matching rows (the
    // public catalog is small) and finish bio + full_name matching in JS
    // before slicing the requested page.
    const { data, error } = await query;

    if (error) throw error;

    let rows = data || [];
    if (q) {
      const needle = String(q).toLowerCase();
      rows = rows.filter((p) => {
        const haystack = [
          p.bio || '',
          p.profile?.full_name || '',
          ...(p.service_categories || []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      });
    }

    const from = (pageNum - 1) * limitNum;
    const paged = rows.slice(from, from + limitNum);

    return successResponse(res, {
      professionals: paged,
      total: rows.length,
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
