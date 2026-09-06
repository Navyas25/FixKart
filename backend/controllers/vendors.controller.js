import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';
import { isUuid } from '../utils/ids.js';

const VENDOR_SELECT = `
  id, user_id, shop_name, shop_description, shop_location,
  logo_url, banner_url, rating, total_sales, total_orders,
  verification_status, created_at, updated_at,
  category, gst_number, business_address, business_phone,
  business_hours, bank_account_number, bank_ifsc, bank_name, upi_id,
  profile:profiles(full_name, phone, avatar_url, email)
`;

const PRODUCT_SELECT = `
  id, name, description, price, discount_price, stock, unit, brand,
  sku, image_url, featured, status, category_id,
  category:categories(id, name),
  created_at, updated_at
`;

// =====================================================
// GET /api/vendors
// Public catalog: only verified vendors
// =====================================================

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

// =====================================================
// GET /api/vendors/:id
// Public: vendor store page
// =====================================================

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

    if (data.verification_status !== 'verified') {
      return errorResponse(res, 'Vendor not found', 404);
    }

    // Get product count and recent products
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', id)
      .eq('status', 'active');

    const { data: products } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('vendor_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12);

    return successResponse(res, {
      vendor: data,
      product_count: productCount ?? 0,
      products: products || [],
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET /api/vendors/me/dashboard
// Vendor's own dashboard with comprehensive stats
// =====================================================

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

    const db = getUserSupabase(req);

    // Product stats
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id);

    const { count: activeProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .eq('status', 'active');

    const { count: outOfStock } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .lte('stock', 0);

    const { count: lowStock } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .gt('stock', 0)
      .lte('stock', 5);

    // Order stats - get orders that contain this vendor's products
    const vendorProductIds = [];
    const { data: vendorProducts } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendor.id);

    (vendorProducts || []).forEach(p => vendorProductIds.push(p.id));

    let totalOrders = 0;
    let pendingOrders = 0;
    let totalRevenue = 0;
    let todaySales = 0;
    let recentOrders = [];

    if (vendorProductIds.length > 0) {
      // Get order items for this vendor's products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id, quantity, unit_price, product_id')
        .in('product_id', vendorProductIds);

      if (orderItems && orderItems.length > 0) {
        // Deduplicate order IDs
        const orderIds = [...new Set(orderItems.map(i => i.order_id))];
        totalOrders = orderIds.length;

        // Calculate revenue from this vendor's items
        totalRevenue = orderItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

        // Get order details
        const { data: orders } = await supabase
          .from('orders')
          .select('id, status, total_amount, created_at, user_id')
          .in('id', orderIds)
          .order('created_at', { ascending: false });

        const orderMap = {};
        (orders || []).forEach(o => { orderMap[o.id] = o; });

        pendingOrders = (orders || []).filter(o => ['confirmed', 'pending'].includes(o.status)).length;

        // Today's sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayItems = orderItems.filter(i => {
          const order = orderMap[i.order_id];
          return order && new Date(order.created_at) >= today;
        });
        todaySales = todayItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

        // Recent orders (last 10)
        recentOrders = (orders || []).slice(0, 10).map(order => {
          const items = orderItems.filter(i => i.order_id === order.id);
          return {
            ...order,
            vendor_total: items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0),
            item_count: items.length,
          };
        });
      }
    }

    // Reviews count
    let reviewCount = 0;
    let avgRating = vendor.rating || 0;

    if (vendorProductIds.length > 0) {
      try {
        const { count: reviews } = await supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .eq('item_type', 'product')
          .in('item_id', vendorProductIds);
        reviewCount = reviews || 0;

        if (reviewCount > 0) {
          const { data: reviewData } = await supabase
            .from('reviews')
            .select('rating')
            .eq('item_type', 'product')
            .in('item_id', vendorProductIds);

          if (reviewData && reviewData.length > 0) {
            avgRating = Math.round((reviewData.reduce((s, r) => s + r.rating, 0) / reviewData.length) * 10) / 10;
          }
        }
      } catch {
        // reviews table might not exist
      }
    }

    // Low stock products
    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('id, name, stock, image_url, price')
      .eq('vendor_id', vendor.id)
      .lte('stock', 5)
      .order('stock', { ascending: true })
      .limit(10);

    // Recent products
    const { data: recentProducts } = await supabase
      .from('products')
      .select('id, name, price, stock, image_url, status, featured, created_at')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return successResponse(res, {
      vendor,
      stats: {
        today_sales: todaySales,
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        product_count: productCount ?? 0,
        active_products: activeProducts ?? 0,
        out_of_stock: outOfStock ?? 0,
        low_stock: lowStock ?? 0,
        review_count: reviewCount,
        rating: avgRating,
        total_sales: vendor.total_sales || 0,
      },
      recent_orders: recentOrders,
      low_stock_products: lowStockProducts || [],
      recent_products: recentProducts || [],
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET /api/vendors/me/products
// Vendor's products with pagination
// =====================================================

export const getMyProducts = async (req, res, next) => {
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    const { page = 1, limit = 20, status, q } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT, { count: 'exact' })
      .eq('vendor_id', vendor.id);

    if (status) {
      query = query.eq('status', status);
    }

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

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

// =====================================================
// POST /api/vendors/me/products
// Create a new product
// =====================================================

export const createProduct = async (req, res, next) => {
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, verification_status')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    if (vendor.verification_status !== 'verified') {
      return errorResponse(res, 'Your vendor account must be verified to add products', 403);
    }

    const {
      name, description, price, discount_price, stock, unit, brand,
      sku, image_url, category_id, status, specifications
    } = req.body;

    if (!name || !price) {
      return errorResponse(res, 'Product name and price are required', 400);
    }

    const db = getUserSupabase(req);

    const productData = {
      name,
      description: description || '',
      price: parseFloat(price),
      discount_price: discount_price ? parseFloat(discount_price) : null,
      stock: parseInt(stock || '0', 10),
      unit: unit || 'piece',
      brand: brand || '',
      sku: sku || '',
      image_url: image_url || '',
      vendor_id: vendor.id,
      category_id: category_id || null,
      status: status || 'active',
      specifications: specifications || null,
    };

    const { data, error } = await db
      .from('products')
      .insert(productData)
      .select(PRODUCT_SELECT)
      .single();

    if (error) throw error;

    return successResponse(res, { product: data }, 201);
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// PATCH /api/vendors/me/products/:id
// Update a product
// =====================================================

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    // Verify the product belongs to this vendor
    const { data: existing } = await supabase
      .from('products')
      .select('id, vendor_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.vendor_id !== vendor.id) {
      return errorResponse(res, 'Product not found', 404);
    }

    const db = getUserSupabase(req);

    const allowed = [
      'name', 'description', 'price', 'discount_price', 'stock', 'unit',
      'brand', 'sku', 'image_url', 'category_id', 'status', 'featured',
      'specifications'
    ];

    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.price !== undefined) updates.price = parseFloat(updates.price);
    if (updates.discount_price !== undefined) updates.discount_price = updates.discount_price ? parseFloat(updates.discount_price) : null;
    if (updates.stock !== undefined) updates.stock = parseInt(updates.stock, 10);

    if (!Object.keys(updates).length) {
      return errorResponse(res, 'No valid fields to update', 400);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await db
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(PRODUCT_SELECT)
      .maybeSingle();

    if (error) throw error;

    return successResponse(res, { product: data });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// DELETE /api/vendors/me/products/:id
// Deactivate / soft-delete a product
// =====================================================

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    const { data: existing } = await supabase
      .from('products')
      .select('id, vendor_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.vendor_id !== vendor.id) {
      return errorResponse(res, 'Product not found', 404);
    }

    const db = getUserSupabase(req);

    // Soft delete: set status to 'deleted'
    const { error } = await db
      .from('products')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return successResponse(res, { message: 'Product removed' });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET /api/vendors/me/orders
// Vendor's orders
// =====================================================

export const getMyOrders = async (req, res, next) => {
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    // Get vendor's product IDs
    const { data: vendorProducts } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendor.id);

    const vendorProductIds = (vendorProducts || []).map(p => p.id);

    if (vendorProductIds.length === 0) {
      return successResponse(res, { orders: [], total: 0 });
    }

    const { page = 1, limit = 20, status } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    // Get order items for this vendor's products
    let orderItemsQuery = supabase
      .from('order_items')
      .select('order_id, quantity, unit_price, product_id, product:products(id, name, image_url)')
      .in('product_id', vendorProductIds);

    const { data: orderItems } = await orderItemsQuery;

    if (!orderItems || orderItems.length === 0) {
      return successResponse(res, { orders: [], total: 0 });
    }

    const orderIds = [...new Set(orderItems.map(i => i.order_id))];

    // Get full order details
    let ordersQuery = supabase
      .from('orders')
      .select('*, address:addresses(*), profile:profiles(full_name, phone, email)')
      .in('id', orderIds)
      .order('created_at', { ascending: false });

    if (status) {
      ordersQuery = ordersQuery.eq('status', status);
    }

    const { data: orders, count } = await ordersQuery;

    // Attach vendor-specific items to each order
    const enrichedOrders = (orders || []).map(order => {
      const items = orderItems.filter(i => i.order_id === order.id);
      return {
        ...order,
        vendor_items: items,
        vendor_total: items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0),
      };
    });

    return successResponse(res, {
      orders: enrichedOrders,
      total: enrichedOrders.length,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// PATCH /api/vendors/me/orders/:id/status
// Update order status (confirm, ship, etc.)
// =====================================================

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, courier_name, estimated_delivery } = req.body;

    const VALID_STATUSES = ['confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (!VALID_STATUSES.includes(status)) {
      return errorResponse(res, `Status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    const db = getUserSupabase(req);

    const updates = { status };
    if (tracking_number) updates.tracking_number = tracking_number;
    if (courier_name) updates.courier_name = courier_name;
    if (estimated_delivery) updates.estimated_delivery = estimated_delivery;

    const { data, error } = await db
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return successResponse(res, { order: data });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET /api/vendors/me/reviews
// Reviews for the vendor's products
// =====================================================

export const getMyReviews = async (req, res, next) => {
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    const { data: vendorProducts } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendor.id);

    const vendorProductIds = (vendorProducts || []).map(p => p.id);

    if (vendorProductIds.length === 0) {
      return successResponse(res, { reviews: [], count: 0, average: 0 });
    }

    let reviews = [];
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          id, rating, comment, created_at,
          profile:profiles(full_name, avatar_url),
          product:products(id, name, image_url)
        `)
        .eq('item_type', 'product')
        .in('item_id', vendorProductIds)
        .order('created_at', { ascending: false });

      reviews = data || [];
    } catch {
      // reviews table might not exist
    }

    const count = reviews.length;
    const average = count
      ? Math.round((reviews.reduce((sum, r) => sum + Number(r.rating), 0) / count) * 10) / 10
      : 0;

    return successResponse(res, { reviews, count, average });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET /api/vendors/me/analytics
// Sales analytics data
// =====================================================

export const getMyAnalytics = async (req, res, next) => {
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    const { data: vendorProducts } = await supabase
      .from('products')
      .select('id, name, price')
      .eq('vendor_id', vendor.id);

    const vendorProductIds = (vendorProducts || []).map(p => p.id);

    if (vendorProductIds.length === 0) {
      return successResponse(res, {
        daily_sales: [],
        top_products: [],
        summary: { total_revenue: 0, total_orders: 0, avg_order_value: 0 },
      });
    }

    // Get all order items for this vendor's products
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('order_id, quantity, unit_price, product_id')
      .in('product_id', vendorProductIds);

    const orderIds = [...new Set((orderItems || []).map(i => i.order_id))];

    let orders = [];
    if (orderIds.length > 0) {
      const { data } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .in('id', orderIds);
      orders = data || [];
    }

    const orderMap = {};
    orders.forEach(o => { orderMap[o.id] = o; });

    // Daily sales (last 30 days)
    const dailySales = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const item of (orderItems || [])) {
      const order = orderMap[item.order_id];
      if (!order) continue;
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (new Date(date) < thirtyDaysAgo) continue;

      if (!dailySales[date]) {
        dailySales[date] = { date, revenue: 0, orders: new Set(), items: 0 };
      }
      dailySales[date].revenue += item.unit_price * item.quantity;
      dailySales[date].orders.add(item.order_id);
      dailySales[date].items += item.quantity;
    }

    const dailySalesArray = Object.values(dailySales)
      .map(d => ({ ...d, orders: d.orders.size }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top products
    const productSales = {};
    for (const item of (orderItems || [])) {
      const order = orderMap[item.order_id];
      if (!order) continue;
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = { product_id: item.product_id, quantity: 0, revenue: 0 };
      }
      productSales[item.product_id].quantity += item.quantity;
      productSales[item.product_id].revenue += item.unit_price * item.quantity;
    }

    const topProducts = Object.values(productSales)
      .map(p => {
        const prod = (vendorProducts || []).find(vp => vp.id === p.product_id);
        return { ...p, name: prod?.name || 'Unknown', price: prod?.price || 0 };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Summary
    const totalRevenue = (orderItems || []).reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);
    const totalOrders = orderIds.length;
    const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

    return successResponse(res, {
      daily_sales: dailySalesArray,
      top_products: topProducts,
      summary: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        avg_order_value: avgOrderValue,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET /api/vendors/me/inventory
// Inventory management data
// =====================================================

export const getMyInventory = async (req, res, next) => {
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    const { data: products } = await supabase
      .from('products')
      .select('id, name, stock, sku, price, image_url, status, unit')
      .eq('vendor_id', vendor.id)
      .order('stock', { ascending: true });

    const allProducts = products || [];

    const outOfStock = allProducts.filter(p => p.stock <= 0);
    const lowStock = allProducts.filter(p => p.stock > 0 && p.stock <= 5);
    const inStock = allProducts.filter(p => p.stock > 5);

    return successResponse(res, {
      products: allProducts,
      summary: {
        total: allProducts.length,
        out_of_stock: outOfStock.length,
        low_stock: lowStock.length,
        in_stock: inStock.length,
      },
      out_of_stock: outOfStock,
      low_stock: lowStock,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// PATCH /api/vendors/me/inventory/:id
// Update stock for a product
// =====================================================

export const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock, min_stock_alert } = req.body;

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    const { data: existing } = await supabase
      .from('products')
      .select('id, vendor_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.vendor_id !== vendor.id) {
      return errorResponse(res, 'Product not found', 404);
    }

    const db = getUserSupabase(req);
    const updates = {};
    if (stock !== undefined) updates.stock = parseInt(stock, 10);
    if (min_stock_alert !== undefined) updates.min_stock_alert = parseInt(min_stock_alert, 10);
    updates.updated_at = new Date().toISOString();

    const { data, error } = await db
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('id, name, stock, min_stock_alert')
      .maybeSingle();

    if (error) throw error;

    return successResponse(res, { product: data });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// PATCH /api/vendors/me/store
// Update store profile
// =====================================================

export const updateStoreProfile = async (req, res, next) => {
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    const allowed = [
      'shop_name', 'shop_description', 'shop_location', 'logo_url',
      'banner_url', 'category', 'business_address', 'business_phone',
      'business_hours', 'gst_number'
    ];

    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (!Object.keys(updates).length) {
      return errorResponse(res, 'No valid fields to update', 400);
    }

    const db = getUserSupabase(req);
    updates.updated_at = new Date().toISOString();

    const { data, error } = await db
      .from('vendors')
      .update(updates)
      .eq('user_id', req.user.id)
      .select(VENDOR_SELECT)
      .maybeSingle();

    if (error) throw error;

    return successResponse(res, { vendor: data });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// PATCH /api/vendors/me/bank
// Update bank / payment details
// =====================================================

export const updateBankDetails = async (req, res, next) => {
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    const { bank_account_number, bank_ifsc, bank_name, upi_id } = req.body;

    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('vendors')
      .update({
        bank_account_number: bank_account_number || null,
        bank_ifsc: bank_ifsc || null,
        bank_name: bank_name || null,
        upi_id: upi_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', req.user.id)
      .select('id, bank_account_number, bank_ifsc, bank_name, upi_id')
      .maybeSingle();

    if (error) throw error;

    return successResponse(res, { bank_details: data });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET /api/vendors/me/notifications
// Vendor notifications
// =====================================================

export const getMyNotifications = async (req, res, next) => {
  try {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!vendor) {
      return errorResponse(res, 'Vendor profile not found', 404);
    }

    const notifications = [];

    // Low stock alerts
    const { data: lowStock } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('vendor_id', vendor.id)
      .lte('stock', 5)
      .gt('stock', 0);

    (lowStock || []).forEach(p => {
      notifications.push({
        type: 'low_stock',
        title: `Low Stock: ${p.name}`,
        message: `Only ${p.stock} units remaining`,
        severity: 'warning',
        created_at: new Date().toISOString(),
      });
    });

    // Out of stock alerts
    const { data: outOfStock } = await supabase
      .from('products')
      .select('id, name')
      .eq('vendor_id', vendor.id)
      .lte('stock', 0);

    (outOfStock || []).forEach(p => {
      notifications.push({
        type: 'out_of_stock',
        title: `Out of Stock: ${p.name}`,
        message: 'This product is currently out of stock',
        severity: 'error',
        created_at: new Date().toISOString(),
      });
    });

    // Pending orders count
    const { data: vendorProducts } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendor.id);

    const vendorProductIds = (vendorProducts || []).map(p => p.id);

    if (vendorProductIds.length > 0) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id')
        .in('product_id', vendorProductIds);

      const orderIds = [...new Set((orderItems || []).map(i => i.order_id))];

      if (orderIds.length > 0) {
        const { data: pendingOrders } = await supabase
          .from('orders')
          .select('id, created_at')
          .in('id', orderIds)
          .eq('status', 'confirmed');

        (pendingOrders || []).forEach(o => {
          notifications.push({
            type: 'new_order',
            title: 'New Pending Order',
            message: `Order #${o.id.slice(0, 8)} awaiting processing`,
            severity: 'info',
            created_at: o.created_at,
          });
        });
      }
    }

    // Sort by created_at descending
    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return successResponse(res, { notifications, unread_count: notifications.length });
  } catch (err) {
    return next(err);
  }
};
