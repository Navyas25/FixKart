import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { isUuid } from '../utils/ids.js';

const VENDOR_SELECT = `
  id, user_id, shop_name, shop_description, shop_location,
  logo_url, banner_url, rating, total_sales,
  verification_status, created_at, updated_at
`;

// GET /api/vendors
export const getAllVendors = async (req, res, next) => {
  try {
    const {
      q,
      sort = 'rating',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('vendors')
      .select(VENDOR_SELECT, { count: 'exact' })
      .eq('verification_status', 'verified');

    if (q) {
      query = query.or(`shop_name.ilike.%${q}%,shop_description.ilike.%${q}%`);
    }

    if (sort === 'sales') {
      query = query.order('total_sales', { ascending: false });
    } else if (sort === 'name') {
      query = query.order('shop_name', { ascending: true });
    } else {
      query = query.order('rating', { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return successResponse(res, {
      vendors: data || [],
      total: count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/vendors/:id
export const getVendorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isUuid(id)) {
      return errorResponse(res, 'Vendor not found', 404);
    }

    const { data, error } = await supabase
      .from('vendors')
      .select(VENDOR_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return errorResponse(res, 'Vendor not found', 404);
    }

    // Only show verified vendors to public
    if (data.verification_status !== 'verified') {
      // Allow admins and the vendor themselves to see unverified shops
      return errorResponse(res, 'Vendor not found', 404);
    }

    return successResponse(res, { vendor: data });
  } catch (err) {
    return next(err);
  }
};

// GET /api/vendors/me/dashboard
export const getVendorDashboard = async (req, res, next) => {
  try {
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select(VENDOR_SELECT)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (vendorError) throw vendorError;

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    // Get product count
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id);

    // Get recent products
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, image_url, featured, created_at')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return successResponse(res, {
      vendor,
      stats: {
        product_count: productCount ?? 0,
        total_sales: vendor.total_sales,
        rating: vendor.rating,
      },
      recent_products: products || [],
    });
  } catch (err) {
    return next(err);
  }
};
