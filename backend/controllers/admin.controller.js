import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';

// =====================================================
// ADMIN DASHBOARD OVERVIEW
// GET /api/admin/dashboard
// =====================================================

export const getAdminDashboard = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);

    // Parallel queries for dashboard stats
    const [
      usersResult,
      professionalsResult,
      vendorsResult,
      productsResult,
      ordersResult,
      bookingsResult,
    ] = await Promise.allSettled([
      db.from('profiles').select('id', { count: 'exact', head: true }),
      db.from('professionals').select('id, verification_status, rating'),
      db.from('vendors').select('id, verification_status, total_sales'),
      db.from('products').select('id, status, stock'),
      db.from('orders').select('id, status, total_amount, created_at'),
      db.from('bookings').select('id, status, scheduled_at, created_at'),
    ]);

    const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0;

    const professionals = professionalsResult.status === 'fulfilled' ? (professionalsResult.value.data || []) : [];
    const totalProfessionals = professionals.length;
    const pendingProfessionals = professionals.filter(p => p.verification_status === 'pending').length;

    const vendors = vendorsResult.status === 'fulfilled' ? (vendorsResult.value.data || []) : [];
    const totalVendors = vendors.length;
    const pendingVendors = vendors.filter(v => v.verification_status === 'pending').length;

    const products = productsResult.status === 'fulfilled' ? (productsResult.value.data || []) : [];
    const totalProducts = products.length;

    const orders = ordersResult.status === 'fulfilled' ? (ordersResult.value.data || []) : [];
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => ['delivered', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const bookings = bookingsResult.status === 'fulfilled' ? (bookingsResult.value.data || []) : [];
    const totalBookings = bookings.length;

    // Pending actions
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

    // Recent activity (last 10 items)
    const recentOrders = orders.slice(0, 5).map(o => ({
      type: 'order',
      title: `Order #${o.id.slice(0, 8)}`,
      status: o.status,
      amount: o.total_amount,
      created_at: o.created_at,
    }));

    const recentBookings = bookings.slice(0, 5).map(b => ({
      type: 'booking',
      title: `Booking #${b.id.slice(0, 8)}`,
      status: b.status,
      created_at: b.created_at,
    }));

    const recentActivity = [...recentOrders, ...recentBookings]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Revenue by day (last 30 days)
    const revenueByDay = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    orders.forEach(o => {
      if (['delivered', 'completed'].includes(o.status)) {
        const date = new Date(o.created_at).toISOString().split('T')[0];
        if (new Date(date) >= thirtyDaysAgo) {
          if (!revenueByDay[date]) revenueByDay[date] = 0;
          revenueByDay[date] += o.total_amount || 0;
        }
      }
    });

    const revenueChart = Object.entries(revenueByDay)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return successResponse(res, {
      stats: {
        total_revenue: totalRevenue,
        total_users: totalUsers,
        total_professionals: totalProfessionals,
        total_vendors: totalVendors,
        total_products: totalProducts,
        total_orders: totalOrders,
        total_bookings: totalBookings,
        pending_professionals: pendingProfessionals,
        pending_vendors: pendingVendors,
        pending_bookings: pendingBookings,
        pending_orders: pendingOrdersCount,
        platform_commission: Math.round(totalRevenue * 0.05),
      },
      revenue_chart: revenueChart,
      recent_activity: recentActivity,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// ADMIN USER MANAGEMENT
// GET /api/admin/users
// =====================================================

export const getAllUsers = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);
    const { page = 1, limit = 50, q, role } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = db
      .from('profiles')
      .select('id, full_name, phone, role, avatar_url, created_at, updated_at', { count: 'exact' });

    if (q) {
      query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return successResponse(res, {
      users: data || [],
      total: count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// ADMIN ORDERS (all orders)
// GET /api/admin/orders
// =====================================================

export const getAllOrders = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);
    const { page = 1, limit = 50, status, q } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = db
      .from('orders')
      .select(`
        id, status, total_amount, created_at, updated_at,
        user_id,
        items:order_items(id, quantity, unit_price, product:products(id, name, image_url))
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (q) {
      query = query.ilike('id', `%${q}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    // Attach customer profiles
    const orders = data || [];
    const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];
    if (userIds.length > 0) {
      const { data: customers } = await db.from('profiles').select('id, full_name, phone').in('id', userIds);
      const customerMap = Object.fromEntries((customers || []).map(c => [c.id, c]));
      orders.forEach(o => { o.profile = customerMap[o.user_id] || null; });
    }

    return successResponse(res, {
      orders,
      total: count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// ADMIN BOOKINGS (all bookings)
// GET /api/admin/bookings
// =====================================================

export const getAllBookings = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);
    const { page = 1, limit = 50, status } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = db
      .from('bookings')
      .select(`
        id, status, scheduled_at, created_at, notes, user_id, professional_id,
        service:services(id, name, base_price, category)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    // Attach customer and professional profiles separately
    const bookings = data || [];
    const userIds = [...new Set(bookings.map(b => b.user_id).filter(Boolean))];
    const proIds = [...new Set(bookings.map(b => b.professional_id).filter(Boolean))];

    let customerMap = {};
    let proMap = {};
    if (userIds.length > 0) {
      const { data: customers } = await db.from('profiles').select('id, full_name, phone').in('id', userIds);
      customerMap = Object.fromEntries((customers || []).map(c => [c.id, c]));
    }
    if (proIds.length > 0) {
      const { data: pros } = await db.from('professionals').select('id, rating, user_id').in('id', proIds);
      const proUserIds = [...new Set((pros || []).map(p => p.user_id).filter(Boolean))];
      let proProfileMap = {};
      if (proUserIds.length > 0) {
        const { data: proProfiles } = await db.from('profiles').select('id, full_name, phone').in('id', proUserIds);
        proProfileMap = Object.fromEntries((proProfiles || []).map(p => [p.id, p]));
      }
      proMap = Object.fromEntries((pros || []).map(p => [
        p.id, { ...p, profile: proProfileMap[p.user_id] || null }
      ]));
    }
    bookings.forEach(b => {
      b.customer = customerMap[b.user_id] || null;
      b.professional = proMap[b.professional_id] || null;
    });

    return successResponse(res, {
      bookings,
      total: count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// ADMIN ANALYTICS
// GET /api/admin/analytics
// =====================================================

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);

    const [ordersResult, bookingsResult, productsResult, usersResult] = await Promise.allSettled([
      db.from('orders').select('id, status, total_amount, created_at'),
      db.from('bookings').select('id, status, scheduled_at, created_at, service:services(base_price)'),
      db.from('products').select('id, name, stock, status, created_at'),
      db.from('profiles').select('id, role, created_at'),
    ]);

    const orders = ordersResult.status === 'fulfilled' ? (ordersResult.value.data || []) : [];
    const bookings = bookingsResult.status === 'fulfilled' ? (bookingsResult.value.data || []) : [];
    const products = productsResult.status === 'fulfilled' ? (productsResult.value.data || []) : [];
    const users = usersResult.status === 'fulfilled' ? (usersResult.value.data || []) : [];

    // Orders by day (last 30 days)
    const ordersByDay = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    orders.forEach(o => {
      const date = new Date(o.created_at).toISOString().split('T')[0];
      if (new Date(date) >= thirtyDaysAgo) {
        if (!ordersByDay[date]) ordersByDay[date] = { date, orders: 0, revenue: 0 };
        ordersByDay[date].orders++;
        if (['delivered', 'completed'].includes(o.status)) {
          ordersByDay[date].revenue += o.total_amount || 0;
        }
      }
    });

    // Bookings by day
    const bookingsByDay = {};
    bookings.forEach(b => {
      const date = new Date(b.created_at).toISOString().split('T')[0];
      if (new Date(date) >= thirtyDaysAgo) {
        if (!bookingsByDay[date]) bookingsByDay[date] = { date, bookings: 0, revenue: 0 };
        bookingsByDay[date].bookings++;
        if (b.status === 'completed') {
          bookingsByDay[date].revenue += b.service?.base_price || 0;
        }
      }
    });

    // User growth by day (last 30 days)
    const usersByDay = {};
    users.forEach(u => {
      const date = new Date(u.created_at).toISOString().split('T')[0];
      if (new Date(date) >= thirtyDaysAgo) {
        if (!usersByDay[date]) usersByDay[date] = { date, count: 0 };
        usersByDay[date].count++;
      }
    });

    // Top products by stock
    const topProducts = products
      .filter(p => p.status === 'active')
      .sort((a, b) => (b.stock || 0) - (a.stock || 0))
      .slice(0, 10)
      .map(p => ({ id: p.id, name: p.name, stock: p.stock }));

    // Role distribution
    const roleDistribution = {};
    users.forEach(u => {
      const role = u.role || 'customer';
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });

    // Order status distribution
    const orderStatusDist = {};
    orders.forEach(o => {
      orderStatusDist[o.status] = (orderStatusDist[o.status] || 0) + 1;
    });

    // Booking status distribution
    const bookingStatusDist = {};
    bookings.forEach(b => {
      bookingStatusDist[b.status] = (bookingStatusDist[b.status] || 0) + 1;
    });

    // Summary stats
    const completedOrders = orders.filter(o => ['delivered', 'completed'].includes(o.status));
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalBookingRevenue = completedBookings.reduce((sum, b) => sum + (b.service?.base_price || 0), 0);
    const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;
    const cancellationRate = orders.length > 0
      ? Math.round((orders.filter(o => o.status === 'cancelled').length / orders.length) * 100)
      : 0;

    return successResponse(res, {
      charts: {
        orders_by_day: Object.values(ordersByDay).sort((a, b) => a.date.localeCompare(b.date)),
        bookings_by_day: Object.values(bookingsByDay).sort((a, b) => a.date.localeCompare(b.date)),
        users_by_day: Object.values(usersByDay).sort((a, b) => a.date.localeCompare(b.date)),
      },
      distributions: {
        roles: roleDistribution,
        order_statuses: orderStatusDist,
        booking_statuses: bookingStatusDist,
      },
      summary: {
        total_revenue: totalRevenue,
        total_booking_revenue: totalBookingRevenue,
        avg_order_value: avgOrderValue,
        cancellation_rate: cancellationRate,
        total_orders: orders.length,
        total_bookings: bookings.length,
        total_users: users.length,
        total_products: products.length,
      },
      top_products: topProducts,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// ADMIN REVIEWS (all reviews)
// GET /api/admin/reviews
// =====================================================

export const getAllReviews = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);

    let reviews = [];
    try {
      const { data } = await db
        .from('reviews')
        .select('id, rating, comment, item_type, item_id, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(200);

      reviews = data || [];

      // Attach reviewer profiles
      const reviewerIds = [...new Set(reviews.map(r => r.user_id).filter(Boolean))];
      if (reviewerIds.length > 0) {
        const { data: reviewers } = await db.from('profiles').select('id, full_name, avatar_url').in('id', reviewerIds);
        const reviewerMap = Object.fromEntries((reviewers || []).map(r => [r.id, r]));
        reviews.forEach(r => { r.profile = reviewerMap[r.user_id] || null; });
      }
    } catch {
      // reviews table might not exist
    }

    const count = reviews.length;
    const average = count > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0;

    return successResponse(res, { reviews, count, average });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// ADMIN SUPPORT (placeholder - returns empty for now)
// GET /api/admin/support
// =====================================================

export const getSupportTickets = async (req, res, next) => {
  try {
    // Support tickets would come from a support_tickets table
    // For now return empty
    return successResponse(res, { tickets: [], total: 0 });
  } catch (err) {
    return next(err);
  }
};
