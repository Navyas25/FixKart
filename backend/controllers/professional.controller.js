import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';
import { isUuid } from '../utils/ids.js';

// =====================================================
// HELPERS
// =====================================================

const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected', 'suspended'];

const PROFESSIONAL_EDITABLE = [
  'bio', 'experience_years', 'service_categories', 'service_locations',
  'availability', 'service_radius_km', 'max_jobs_per_day', 'hourly_rate',
  'bank_account_number', 'bank_ifsc', 'bank_name', 'upi_id',
];

const getOwnProfessional = async (req) => {
  const db = getUserSupabase(req);
  const { data, error } = await db
    .from('professionals')
    .select('*')
    .eq('user_id', req.user.id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
};

// =====================================================
// GET MY PROFESSIONAL PROFILE
// GET /api/professionals/me
// =====================================================

export const getMyProfessionalProfile = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);
    const professional = await getOwnProfessional(req);

    if (!professional) {
      return errorResponse(res, 'No professional profile found.', 403);
    }

    const { data: profile } = await db
      .from('profiles')
      .select('full_name, phone, avatar_url, email')
      .eq('id', req.user.id)
      .maybeSingle();

    return successResponse(res, {
      professional,
      profile: profile || null,
      email: req.user.email,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET COMPREHENSIVE DASHBOARD
// GET /api/professionals/me/dashboard
// =====================================================

export const getProfessionalDashboard = async (req, res, next) => {
  try {
    const professional = await getOwnProfessional(req);
    if (!professional) {
      return errorResponse(res, 'No professional profile found.', 403);
    }

    const db = getUserSupabase(req);

    // Get profile info
    const { data: profile } = await db
      .from('profiles')
      .select('full_name, phone, avatar_url, email')
      .eq('id', req.user.id)
      .maybeSingle();

    // Get all bookings (user_id = customer FK)
    const { data: bookings } = await db
      .from('bookings')
      .select(`
        id, status, scheduled_at, created_at, notes, customer_notes,
        address, service_id, professional_id, user_id,
        service:services(id, name, base_price, description, estimated_duration)
      `)
      .eq('professional_id', professional.id)
      .order('created_at', { ascending: false });

    // Attach customer profiles separately (avoids FK name issues)
    const userIds = [...new Set((bookings || []).map(b => b.user_id).filter(Boolean))];
    let customerMap = {};
    if (userIds.length > 0) {
      const { data: customers } = await db
        .from('profiles')
        .select('id, full_name, phone, avatar_url')
        .in('id', userIds);
      customerMap = Object.fromEntries((customers || []).map(c => [c.id, c]));
    }
    if (bookings) {
      bookings.forEach(b => {
        b.customer = customerMap[b.user_id] || null;
      });
    }

    const allBookings = bookings || [];

    // Calculate stats
    const pending = allBookings.filter(b => b.status === 'pending');
    const confirmed = allBookings.filter(b => b.status === 'confirmed');
    const inProgress = allBookings.filter(b => b.status === 'in_progress');
    const completed = allBookings.filter(b => b.status === 'completed');
    const cancelled = allBookings.filter(b => b.status === 'cancelled');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = allBookings.filter(b => {
      if (!b.scheduled_at) return false;
      const d = new Date(b.scheduled_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const monthBookings = completed.filter(b => new Date(b.created_at) >= thisMonth);

    const totalEarnings = completed.reduce((sum, b) => sum + (b.service?.base_price || 0), 0);
    const monthEarnings = monthBookings.reduce((sum, b) => sum + (b.service?.base_price || 0), 0);

    // Pending payments (conservative estimate: 5% commission held)
    const pendingPayments = completed
      .reduce((sum, b) => sum + (b.service?.base_price || 0), 0) * 0.05;

    // Reviews (safe query with fallback)
    let reviewCount = 0;
    let avgRating = professional.rating || 0;
    let reviews = [];
    try {
      const { data: reviewData, error: reviewErr } = await db
        .from('reviews')
        .select('id, rating, comment, created_at, user_id')
        .eq('item_type', 'service')
        .eq('item_id', professional.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!reviewErr && reviewData) {
        reviews = reviewData;
        reviewCount = reviews.length;
        // Attach reviewer profiles
        const reviewerIds = [...new Set(reviews.map(r => r.user_id).filter(Boolean))];
        if (reviewerIds.length > 0) {
          const { data: reviewers } = await db
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', reviewerIds);
          const reviewerMap = Object.fromEntries((reviewers || []).map(r => [r.id, r]));
          reviews.forEach(r => { r.profile = reviewerMap[r.user_id] || null; });
        }
        if (reviewCount > 0) {
          const { data: allReviews } = await db
            .from('reviews')
            .select('rating')
            .eq('item_type', 'service')
            .eq('item_id', professional.id);
          if (allReviews && allReviews.length > 0) {
            avgRating = Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 10) / 10;
          }
        }
      }
    } catch {
      // reviews table might not exist
    }

    // Services offered
    let services = [];
    try {
      const { data: svcData } = await db
        .from('services')
        .select('id, name, base_price, description, estimated_duration, category')
        .eq('professional_id', professional.id);
      services = svcData || [];
    } catch {
      // services table might not exist
    }

    return successResponse(res, {
      professional,
      profile: profile || null,
      email: req.user.email,
      stats: {
        today_bookings: todayBookings.length,
        pending_requests: pending.length,
        upcoming_jobs: confirmed.length + inProgress.length,
        completed_jobs: completed.length,
        cancelled_jobs: cancelled.length,
        total_jobs: allBookings.length,
        total_earnings: totalEarnings,
        this_month_earnings: monthEarnings,
        pending_payments: pendingPayments,
        available_balance: totalEarnings * 0.95, // After 5% commission
        rating: avgRating,
        review_count: reviewCount,
        is_online: professional.is_online ?? true,
      },
      bookings: allBookings.slice(0, 20),
      reviews,
      services,
      recent_bookings: allBookings.slice(0, 5),
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// UPDATE MY PROFESSIONAL PROFILE
// PATCH /api/professionals/me
// =====================================================

export const updateMyProfessionalProfile = async (req, res, next) => {
  try {
    const existing = await getOwnProfessional(req);
    if (!existing) {
      return errorResponse(res, 'No professional profile found.', 403);
    }

    const updates = {};
    for (const field of PROFESSIONAL_EDITABLE) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (!Object.keys(updates).length) {
      return errorResponse(res, 'No valid fields to update', 400);
    }

    const db = getUserSupabase(req);
    const { data, error } = await db
      .from('professionals')
      .update(updates)
      .eq('user_id', req.user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return errorResponse(res, 'Could not update profile.', 403);
    }

    return successResponse(res, { professional: data });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// TOGGLE ONLINE/OFFLINE AVAILABILITY
// PATCH /api/professionals/me/availability
// =====================================================

export const toggleAvailability = async (req, res, next) => {
  try {
    const { is_online } = req.body;
    if (typeof is_online !== 'boolean') {
      return errorResponse(res, 'is_online must be a boolean', 400);
    }

    const db = getUserSupabase(req);
    const { data, error } = await db
      .from('professionals')
      .update({ is_online })
      .eq('user_id', req.user.id)
      .select('id, is_online')
      .maybeSingle();

    if (error) throw error;
    if (!data) return errorResponse(res, 'Professional not found', 404);

    return successResponse(res, {
      is_online: data.is_online,
      message: is_online ? 'You are now online' : 'You are now offline',
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// MY EARNINGS + STATS
// GET /api/professionals/me/earnings
// =====================================================

export const getMyEarnings = async (req, res, next) => {
  try {
    const professional = await getOwnProfessional(req);
    if (!professional) {
      return errorResponse(res, 'No professional profile found.', 403);
    }

    const db = getUserSupabase(req);

    const { data: bookings, error } = await db
      .from('bookings')
      .select('id, status, scheduled_at, created_at, service:services(id, base_price, name)')
      .eq('professional_id', professional.id);

    if (error) throw error;

    const completed = (bookings || []).filter(b => b.status === 'completed');
    const upcoming = (bookings || []).filter(b =>
      ['pending', 'confirmed', 'in_progress'].includes(b.status)
    );
    const cancelled = (bookings || []).filter(b => b.status === 'cancelled');

    const totalEarnings = completed.reduce(
      (sum, b) => sum + (b.service?.base_price || 0), 0
    );

    // Conservative: assume 5% commission is held until payout
    const paidOut = 0;
    const pendingPayment = totalEarnings;

    // This month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const monthEarnings = completed
      .filter(b => new Date(b.created_at) >= thisMonth)
      .reduce((sum, b) => sum + (b.service?.base_price || 0), 0);

    // Earnings history (last 30 days grouped by day)
    const dailyEarnings = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const b of completed) {
      const d = new Date(b.created_at);
      if (d < thirtyDaysAgo) continue;
      const key = d.toISOString().split('T')[0];
      if (!dailyEarnings[key]) dailyEarnings[key] = { date: key, revenue: 0, jobs: 0 };
      dailyEarnings[key].revenue += b.service?.base_price || 0;
      dailyEarnings[key].jobs += 1;
    }

    return successResponse(res, {
      earnings: {
        total: totalEarnings,
        paid_out: paidOut,
        pending_payment: pendingPayment,
        this_month: monthEarnings,
        commission: Math.round(totalEarnings * 0.05),
        net_earnings: Math.round(totalEarnings * 0.95),
        completedJobs: completed.length,
        upcomingJobs: upcoming.length,
        cancelledJobs: cancelled.length,
        totalJobs: (bookings || []).length,
        avgRating: professional.rating,
        verificationStatus: professional.verification_status,
      },
      daily_earnings: Object.values(dailyEarnings).sort((a, b) => a.date.localeCompare(b.date)),
      bank_details: {
        bank_account_number: professional.bank_account_number || null,
        bank_ifsc: professional.bank_ifsc || null,
        bank_name: professional.bank_name || null,
        upi_id: professional.upi_id || null,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET BOOKINGS WITH FILTERS
// GET /api/professionals/me/bookings
// =====================================================

export const getMyBookings = async (req, res, next) => {
  try {
    const professional = await getOwnProfessional(req);
    if (!professional) return errorResponse(res, 'No professional profile found.', 403);

    const db = getUserSupabase(req);
    const { status } = req.query;

    let query = db
      .from('bookings')
      .select(`
        id, status, scheduled_at, created_at, notes, customer_notes, address, user_id,
        service:services(id, name, base_price, description, estimated_duration, category)
      `)
      .eq('professional_id', professional.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Attach customer profiles separately
    const bookings = data || [];
    const userIds = [...new Set(bookings.map(b => b.user_id).filter(Boolean))];
    let customerMap = {};
    if (userIds.length > 0) {
      const { data: customers } = await db
        .from('profiles')
        .select('id, full_name, phone, avatar_url')
        .in('id', userIds);
      customerMap = Object.fromEntries((customers || []).map(c => [c.id, c]));
    }
    bookings.forEach(b => { b.customer = customerMap[b.user_id] || null; });

    return successResponse(res, { bookings });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET NOTIFICATIONS
// GET /api/professionals/me/notifications
// =====================================================

export const getMyNotifications = async (req, res, next) => {
  try {
    const professional = await getOwnProfessional(req);
    if (!professional) return errorResponse(res, 'No professional profile found.', 403);

    const db = getUserSupabase(req);
    const notifications = [];

    // Pending booking requests
    const { data: pendingBookings } = await db
      .from('bookings')
      .select('id, created_at, user_id, service:services(name)')
      .eq('professional_id', professional.id)
      .eq('status', 'pending');

    // Fetch customer names for pending bookings
    const pendingUserIds = [...new Set((pendingBookings || []).map(b => b.user_id).filter(Boolean))];
    let pendingCustomerMap = {};
    if (pendingUserIds.length > 0) {
      const { data: c } = await db.from('profiles').select('id, full_name').in('id', pendingUserIds);
      pendingCustomerMap = Object.fromEntries((c || []).map(x => [x.id, x]));
    }
    (pendingBookings || []).forEach(b => {
      notifications.push({
        type: 'new_request',
        title: 'New Job Request',
        message: `${pendingCustomerMap[b.user_id]?.full_name || 'Customer'} requested ${b.service?.name || 'a service'}`,
        severity: 'info',
        created_at: b.created_at,
      });
    });

    // Completed bookings awaiting review
    const { data: completedRecent } = await db
      .from('bookings')
      .select('id, created_at, service:services(name)')
      .eq('professional_id', professional.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(3);

    (completedRecent || []).forEach(b => {
      notifications.push({
        type: 'job_completed',
        title: 'Job Completed',
        message: `${b.service?.name || 'Service'} marked as completed`,
        severity: 'success',
        created_at: b.created_at,
      });
    });

    // Payments (last 3 completed jobs)
    const { data: paidBookings } = await db
      .from('bookings')
      .select('id, created_at, service:services(base_price)')
      .eq('professional_id', professional.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(3);

    (paidBookings || []).forEach(b => {
      notifications.push({
        type: 'payment',
        title: 'Payment Received',
        message: `₹${b.service?.base_price || 0} deposited to your account`,
        severity: 'success',
        created_at: b.created_at,
      });
    });

    // New reviews
    try {
      const { data: newReviews } = await db
        .from('reviews')
        .select('id, rating, created_at, user_id')
        .eq('item_type', 'service')
        .eq('item_id', professional.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const reviewerIds = [...new Set((newReviews || []).map(r => r.user_id).filter(Boolean))];
      let reviewerMap = {};
      if (reviewerIds.length > 0) {
        const { data: revs } = await db.from('profiles').select('id, full_name').in('id', reviewerIds);
        reviewerMap = Object.fromEntries((revs || []).map(r => [r.id, r]));
      }
      (newReviews || []).forEach(r => {
        notifications.push({
          type: 'new_review',
          title: 'New Review',
          message: `${reviewerMap[r.user_id]?.full_name || 'Customer'} left a ${r.rating}-star review`,
          severity: 'info',
          created_at: r.created_at,
        });
      });
    } catch {
      // reviews table might not exist
    }

    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return successResponse(res, { notifications, unread_count: notifications.length });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET REVIEWS
// GET /api/professionals/me/reviews
// =====================================================

export const getMyReviews = async (req, res, next) => {
  try {
    const professional = await getOwnProfessional(req);
    if (!professional) return errorResponse(res, 'No professional profile found.', 403);

    let reviews = [];
    let count = 0;
    let average = professional.rating || 0;

    try {
      const db = getUserSupabase(req);
      const { data } = await db
        .from('reviews')
        .select(`
          id, rating, comment, created_at,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('item_type', 'service')
        .eq('item_id', professional.id)
        .order('created_at', { ascending: false });

      reviews = data || [];
      count = reviews.length;

      if (count > 0) {
        const allReviews = await db
          .from('reviews')
          .select('rating')
          .eq('item_type', 'service')
          .eq('item_id', professional.id);
        if (allReviews.data && allReviews.data.length > 0) {
          average = Math.round(
            (allReviews.data.reduce((s, r) => s + r.rating, 0) / allReviews.data.length) * 10
          ) / 10;
        }
      }
    } catch {
      // reviews table might not exist
    }

    // Rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const stars = Math.round(r.rating);
      if (breakdown[stars] !== undefined) breakdown[stars]++;
    });

    return successResponse(res, { reviews, count, average, breakdown });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET SERVICES
// GET /api/professionals/me/services
// =====================================================

export const getMyServices = async (req, res, next) => {
  try {
    const professional = await getOwnProfessional(req);
    if (!professional) return errorResponse(res, 'No professional profile found.', 403);

    const db = getUserSupabase(req);
    const { data, error } = await db
      .from('services')
      .select('id, name, base_price, description, estimated_duration, category, is_active')
      .eq('professional_id', professional.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return successResponse(res, { services: data || [] });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// UPDATE SERVICE
// PATCH /api/professionals/me/services/:id
// =====================================================

export const updateService = async (req, res, next) => {
  try {
    const professional = await getOwnProfessional(req);
    if (!professional) return errorResponse(res, 'No professional profile found.', 403);

    const { id } = req.params;
    const { name, base_price, description, estimated_duration, is_active } = req.body;

    const db = getUserSupabase(req);

    // Verify service belongs to this professional
    const { data: existing } = await db
      .from('services')
      .select('id, professional_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.professional_id !== professional.id) {
      return errorResponse(res, 'Service not found', 404);
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (base_price !== undefined) updates.base_price = parseFloat(base_price);
    if (description !== undefined) updates.description = description;
    if (estimated_duration !== undefined) updates.estimated_duration = estimated_duration;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await db
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return successResponse(res, { service: data });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// UPLOAD VERIFICATION DOCUMENT
// POST /api/professionals/document
// =====================================================

const ALLOWED_DOC_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};
const MAX_DOC_BYTES = 2 * 1024 * 1024;

export const uploadDocument = async (req, res, next) => {
  try {
    const professional = await getOwnProfessional(req);
    if (!professional) {
      return errorResponse(res, 'No professional profile found.', 403);
    }

    const { document_b64, filename, mime } = req.body || {};

    if (!document_b64 || typeof document_b64 !== 'string') {
      return errorResponse(res, 'document_b64 (base64) is required', 400);
    }

    const ext = (filename || '').split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      return errorResponse(res, 'Only PDF, JPG, JPEG or PNG documents are allowed', 400);
    }

    if (!mime || !ALLOWED_DOC_TYPES[mime]) {
      return errorResponse(res, 'Unsupported document type', 400);
    }

    let buffer;
    try {
      buffer = Buffer.from(document_b64, 'base64');
    } catch {
      return errorResponse(res, 'Invalid document data', 400);
    }

    if (buffer.length === 0) return errorResponse(res, 'Document is empty', 400);
    if (buffer.length > MAX_DOC_BYTES) return errorResponse(res, 'Document must be 2 MB or smaller', 400);

    const db = getUserSupabase(req);
    const storagePath = `${req.user.id}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const { error: uploadError } = await db.storage
      .from('professional-docs')
      .upload(storagePath, buffer, {
        contentType: mime,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return errorResponse(res, `Document upload failed (${uploadError.message}).`, 400);
    }

    const { data: publicUrl } = db.storage
      .from('professional-docs')
      .getPublicUrl(storagePath);

    const { data: updated, error: updateError } = await db
      .from('professionals')
      .update({ id_document_url: publicUrl?.publicUrl || storagePath })
      .eq('user_id', req.user.id)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    return successResponse(res, {
      message: 'Document uploaded. It will be reviewed by our team.',
      professional: updated,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// LIST ALL PROFESSIONALS (ADMIN ONLY)
// GET /api/professionals/admin
// =====================================================

export const getAllProfessionalsAdmin = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);

    // Try full query first (needs verification columns)
    let { data, error } = await db
      .from('professionals')
      .select(`
        id, user_id, experience_years, rating, bio, created_at,
        verification_status, service_categories, service_locations,
        availability, id_document_url, is_online
      `)
      .order('created_at', { ascending: false });

    // If columns are missing, fall back to basic columns
    if (error && /column .* does not exist/i.test(error.message)) {
      const fallback = await db
        .from('professionals')
        .select('id, user_id, experience_years, rating, bio, created_at')
        .order('created_at', { ascending: false });
      data = fallback.data || [];
      error = null;
    }

    if (error) throw error;

    // Attach profiles separately to avoid FK issues
    const professionals = data || [];
    const userIds = [...new Set(professionals.map(p => p.user_id).filter(Boolean))];
    if (userIds.length > 0) {
      const { data: profiles } = await db.from('profiles').select('id, full_name, phone, avatar_url').in('id', userIds);
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
      professionals.forEach(p => { p.profile = profileMap[p.user_id] || null; });
    }

    return successResponse(res, { professionals });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// VERIFY / SUSPEND A PROFESSIONAL (ADMIN ONLY)
// PATCH /api/professionals/:id/verify
// =====================================================

export const verifyProfessional = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isUuid(id)) {
      return errorResponse(res, 'Professional not found', 404);
    }

    const { verification_status } = req.body || {};

    if (!VERIFICATION_STATUSES.includes(verification_status)) {
      return errorResponse(res, `verification_status must be one of: ${VERIFICATION_STATUSES.join(', ')}`, 400);
    }

    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('professionals')
      .update({ verification_status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return errorResponse(res, 'Professional not found', 404);

    return successResponse(res, {
      message: `Professional verification status set to "${verification_status}"`,
      professional: data,
    });
  } catch (err) {
    return next(err);
  }
};
