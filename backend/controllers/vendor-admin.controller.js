import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';
import { sendEmail, vendorApprovedEmail, vendorRejectedEmail } from '../utils/email.js';

const VENDOR_SELECT_ADMIN = `
  id, user_id, shop_name, shop_description, shop_location,
  logo_url, banner_url, rating, total_sales,
  verification_status, created_at, updated_at,
  category, gst_number, business_address, business_phone,
  bank_account_number, bank_ifsc, bank_name, upi_id,
  profile:profiles(full_name, phone, avatar_url, email)
`;

const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected', 'suspended'];

// =====================================================
// LIST ALL VENDORS (ADMIN)
// GET /api/vendors/admin
// =====================================================

export const getAllVendorsAdmin = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('vendors')
      .select(VENDOR_SELECT_ADMIN)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return successResponse(res, { vendors: data || [] });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// VERIFY / REJECT / SUSPEND A VENDOR (ADMIN)
// PATCH /api/vendors/:id/verify
// =====================================================

export const verifyVendor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { verification_status, reason } = req.body || {};

    if (!VERIFICATION_STATUSES.includes(verification_status)) {
      return errorResponse(
        res,
        `verification_status must be one of: ${VERIFICATION_STATUSES.join(', ')}`,
        400
      );
    }

    const db = getUserSupabase(req);

    // First, get the current vendor data
    const { data: currentVendor, error: fetchError } = await db
      .from('vendors')
      .select('id, user_id, shop_name, profile:profiles(full_name, email)')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!currentVendor) {
      return errorResponse(res, 'Vendor not found', 404);
    }

    // Update verification status
    const { data, error } = await db
      .from('vendors')
      .update({ verification_status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    // Send email notification based on status change
    const vendorEmail = currentVendor.profile?.email || req.user?.email;
    const vendorName = currentVendor.profile?.full_name || 'Vendor';
    const shopName = currentVendor.shop_name || 'Your Shop';

    if (verification_status === 'verified' && vendorEmail) {
      // Send approval email
      await sendEmail({
        to: vendorEmail,
        ...vendorApprovedEmail({
          vendorName,
          shopName,
          loginUrl: `${process.env.CLIENT_URL || 'https://fixkart.dev'}/vendor/dashboard`,
        }),
      });
    } else if (verification_status === 'rejected' && vendorEmail) {
      // Send rejection email
      await sendEmail({
        to: vendorEmail,
        ...vendorRejectedEmail({
          vendorName,
          shopName,
          reason,
        }),
      });
    }

    return successResponse(res, {
      message: `Vendor verification status set to "${verification_status}"`,
      vendor: data,
    });
  } catch (err) {
    return next(err);
  }
};
