import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';
import { isUuid } from '../utils/ids.js';

// =====================================================
// HELPERS
// =====================================================

const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected', 'suspended'];

const PROFESSIONAL_EDITABLE = [
  'bio',
  'experience_years',
  'service_categories',
  'service_locations',
  'availability',
];

// Fetch the caller's own professional row (by user_id). Returns null if the
// user has no professional row.
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
      return errorResponse(
        res,
        'No professional profile found. Register as a professional to get started.',
        403
      );
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
// UPDATE MY PROFESSIONAL PROFILE
// PATCH /api/professionals/me
// =====================================================
//
// Whitelist-only: verification_status, rating, user_id and id can never be
// changed through this endpoint - they are set by the server/admin.

export const updateMyProfessionalProfile = async (req, res, next) => {
  try {
    const existing = await getOwnProfessional(req);

    if (!existing) {
      return errorResponse(
        res,
        'No professional profile found. Register as a professional to get started.',
        403
      );
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
      return errorResponse(
        res,
        'Could not update profile. If this just registered, run the RLS migration (backend/scripts/migrations) first.',
        403
      );
    }

    return successResponse(res, { professional: data });
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
      return errorResponse(
        res,
        'No professional profile found. Register as a professional to get started.',
        403
      );
    }

    const db = getUserSupabase(req);

    // All bookings for this professional with the service price attached.
    const { data: bookings, error } = await db
      .from('bookings')
      .select('id, status, scheduled_at, created_at, service:services(id, base_price, name)')
      .eq('professional_id', professional.id);

    if (error) throw error;

    const completed = (bookings || []).filter((b) => b.status === 'completed');
    const upcoming = (bookings || []).filter((b) =>
      ['pending', 'confirmed', 'in_progress'].includes(b.status)
    );

    const totalEarnings = completed.reduce(
      (sum, b) => sum + (b.service?.base_price || 0),
      0
    );

    return successResponse(res, {
      earnings: {
        total: totalEarnings,
        completedJobs: completed.length,
        upcomingJobs: upcoming.length,
        totalJobs: (bookings || []).length,
        avgRating: professional.rating,
        verificationStatus: professional.verification_status,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// UPLOAD VERIFICATION DOCUMENT
// POST /api/professionals/document
// =====================================================
//
// Accepts a base64 document (PDF/JPEG/PNG), validates type + size, uploads it
// to the Supabase Storage bucket "professional-docs" under the user's own
// folder, and records the URL on the professional row. Requires the storage
// bucket + policy from backend/scripts/migrations.

const ALLOWED_DOC_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};
const MAX_DOC_BYTES = 2 * 1024 * 1024; // 2 MB

export const uploadDocument = async (req, res, next) => {
  try {
    const professional = await getOwnProfessional(req);

    if (!professional) {
      return errorResponse(
        res,
        'No professional profile found. Register as a professional to get started.',
        403
      );
    }

    const { document_b64, filename, mime } = req.body || {};

    if (!document_b64 || typeof document_b64 !== 'string') {
      return errorResponse(res, 'document_b64 (base64) is required', 400);
    }

    const ext = (filename || '').split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      return errorResponse(
        res,
        'Only PDF, JPG, JPEG or PNG documents are allowed',
        400
      );
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

    if (buffer.length === 0) {
      return errorResponse(res, 'Document is empty', 400);
    }
    if (buffer.length > MAX_DOC_BYTES) {
      return errorResponse(
        res,
        'Document must be 2 MB or smaller',
        400
      );
    }

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
      return errorResponse(
        res,
        `Document upload failed (${uploadError.message}). Make sure the "professional-docs" bucket exists - run backend/scripts/migrations/001_professional_verification.sql.`,
        400
      );
    }

    const { data: publicUrl } = db.storage
      .from('professional-docs')
      .getPublicUrl(storagePath);

    // Record the document URL. `verification_status` is deliberately left as
    // pending until an admin reviews and verifies the professional.
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
//
// Full rows including verification status and document URL so the admin UI
// can review and act. The public catalog endpoint deliberately excludes
// verification_status / id_document_url.

export const getAllProfessionalsAdmin = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('professionals')
      .select(
        `
        id, user_id, experience_years, rating, bio, created_at,
        verification_status, service_categories, service_locations,
        availability, id_document_url,
        profile:profiles(full_name, phone, avatar_url)
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      if (/column .* does not exist/i.test(error.message)) {
        return errorResponse(
          res,
          'Professional verification columns are missing. Run backend/scripts/migrations/001_professional_verification.sql in the Supabase SQL editor first.',
          503
        );
      }
      throw error;
    }

    return successResponse(res, { professionals: data || [] });
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
      return errorResponse(
        res,
        `verification_status must be one of: ${VERIFICATION_STATUSES.join(', ')}`,
        400
      );
    }

    // Run as the authenticated admin (their JWT), so RLS sees auth.uid() and
    // the admin-update policy applies. The shared anon client would be
    // filtered out by RLS and silently update zero rows.
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('professionals')
      .update({ verification_status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return errorResponse(res, 'Professional not found', 404);
    }

    return successResponse(res, {
      message: `Professional verification status set to "${verification_status}"`,
      professional: data,
    });
  } catch (err) {
    return next(err);
  }
};
