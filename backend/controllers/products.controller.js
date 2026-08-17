import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { isUuid } from '../utils/ids.js';

// Fields returned for every product. Category is embedded via the FK.
const PRODUCT_SELECT = `
  id, name, description, price, stock, unit, brand, image_url,
  category:categories(id, name),
  created_at
`;

// Extra fields added when the engagement migration (002) has been applied.
const ENGAGEMENT_FIELDS = `
  featured, discount_price
`;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Cached capability check: the migration adds featured/discount_price. Until
// it is applied, keep serving the catalog with the base fields so the site
// never breaks - the featured/offers filters are simply ignored.
let engagementCapable = null;
async function hasEngagementFields() {
  if (engagementCapable !== null) return engagementCapable;
  const { error } = await supabase.from('products').select('featured').limit(1);
  engagementCapable = !error;
  return engagementCapable;
}

// GET /api/products
export const getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      q,
      min_price,
      max_price,
      sort = 'featured',
      featured,
      offers,
      page = 1,
      limit = 100,
      ids,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 100);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const capable = await hasEngagementFields();

    let query = supabase
      .from('products')
      .select(
        capable ? `${PRODUCT_SELECT}, ${ENGAGEMENT_FIELDS}` : PRODUCT_SELECT,
        { count: 'exact' }
      );

    // Featured / offers filters only apply once the engagement migration has
    // added the columns.
    if (capable) {
      if (featured === 'true') {
        query = query.eq('featured', true);
      }
      if (offers === 'true') {
        query = query.not('discount_price', 'is', null);
      }
    }

    // Fetch specific products by id, e.g. for the cart page (?ids=a,b,c).
    if (ids) {
      const idList = String(ids)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (idList.length) {
        query = query.in('id', idList);
      }
    }

    // Filter by category - accepts either a category id or a display name
    // (case-insensitive, e.g. "tools" or "Plumbing Supplies").
    if (category) {
      if (UUID_RE.test(category)) {
        query = query.eq('category_id', category);
      } else {
        const { data: categories } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', category);

        const categoryIds = (categories || []).map((c) => c.id);

        if (!categoryIds.length) {
          return successResponse(res, {
            products: [],
            total: 0,
            page: pageNum,
            limit: limitNum,
          });
        }

        query = query.in('category_id', categoryIds);
      }
    }

    if (min_price !== undefined && min_price !== '') {
      query = query.gte('price', Number(min_price));
    }

    if (max_price !== undefined && max_price !== '') {
      query = query.lte('price', Number(max_price));
    }

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (sort === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-high') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'name') {
      query = query.order('name', { ascending: true });
    } else if (capable && featured === 'true') {
      // Featured first, then newest.
      query = query
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });
    } else {
      // featured / default - newest first
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return successResponse(res, {
      products: data || [],
      total: count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isUuid(id)) {
      return errorResponse(res, 'Product not found', 404);
    }

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return errorResponse(res, 'Product not found', 404);
    }

    return successResponse(res, { product: data });
  } catch (err) {
    return next(err);
  }
};
