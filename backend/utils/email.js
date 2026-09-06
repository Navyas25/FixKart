import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// =====================================================
// TRANSPORT CONFIGURATION
// =====================================================
// In development without SMTP configured, emails are logged to console
// instead of being sent. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS
// in backend/.env for real delivery.

let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: parseInt(SMTP_PORT || '587', 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  } else {
    // Development fallback: create a JSON transport that logs emails
    console.warn(
      '[email] SMTP not configured. Emails will be logged to console. ' +
      'Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in backend/.env for real delivery.'
    );
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
};

// =====================================================
// SEND EMAIL
// =====================================================

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transport = createTransporter();

    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || '"FixKart" <noreply@fixkart.dev>',
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, '').trim(),
    });

    // In dev with jsonTransport, log the email
    if (!process.env.SMTP_HOST) {
      console.log('[email] DEV MODE - Email logged (not sent):');
      console.log('  To:', to);
      console.log('  Subject:', subject);
      console.log('  Preview:', info.message ? JSON.parse(info.message)?.text?.substring(0, 200) : '(sent)');
    }

    return { success: true, messageId: info.messageId || 'dev-logged' };
  } catch (error) {
    console.error('[email] Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
};

// =====================================================
// EMAIL TEMPLATES
// =====================================================

const FIXKART_BRAND = {
  primary: '#2563EB',
  accent: '#F59E0B',
  dark: '#0F172A',
  light: '#F8FAFC',
  text: '#334155',
  muted: '#64748B',
};

const baseTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${FIXKART_BRAND.light};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${FIXKART_BRAND.light};padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="display:inline-flex;align-items:center;gap:8px;">
                <div style="width:40px;height:40px;background-color:${FIXKART_BRAND.accent};border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🔧</div>
                <span style="font-size:24px;font-weight:800;color:${FIXKART_BRAND.dark};letter-spacing:-0.5px;">Fix<span style="color:${FIXKART_BRAND.accent};">Kart</span></span>
              </div>
            </td>
          </tr>
          <!-- Main Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:40px 36px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 36px;text-align:center;">
              <p style="margin:0;font-size:12px;color:${FIXKART_BRAND.muted};">
                © ${new Date().getFullYear()} FixKart Technologies Pvt. Ltd. All rights reserved.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:${FIXKART_BRAND.muted};">
                This email was sent to ${'{email}'} because you have an account on FixKart.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// =====================================================
// VENDOR APPROVED / WELCOME EMAIL
// =====================================================

export const vendorApprovedEmail = ({ vendorName, shopName, loginUrl }) => ({
  subject: 'Welcome to FixKart – You are now a Verified Vendor! 🎉',
  html: baseTemplate('Welcome to FixKart – Vendor Approved!', `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background-color:#DCFCE7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">✅</div>
      <h1 style="margin:0;font-size:22px;font-weight:800;color:${FIXKART_BRAND.dark};">
        Welcome to FixKart!
      </h1>
      <p style="margin:8px 0 0;font-size:16px;font-weight:600;color:#16A34A;">
        You are now a Verified Vendor
      </p>
    </div>

    <p style="font-size:15px;color:${FIXKART_BRAND.text};line-height:1.6;margin:0 0 20px;">
      Hi <strong>${vendorName}</strong>,
    </p>

    <p style="font-size:15px;color:${FIXKART_BRAND.text};line-height:1.6;margin:0 0 20px;">
      Great news! Your vendor application for <strong>${shopName}</strong> has been reviewed and approved by our team. 
      You are officially a verified seller on FixKart! 🎉
    </p>

    <p style="font-size:15px;color:${FIXKART_BRAND.text};line-height:1.6;margin:0 0 20px;">
      You can now start listing your products, managing orders, and reaching thousands of customers on FixKart.
    </p>

    <!-- What's Next Box -->
    <div style="background-color:${FIXKART_BRAND.light};border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:${FIXKART_BRAND.dark};text-transform:uppercase;letter-spacing:0.5px;">
        What's Next?
      </h3>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${FIXKART_BRAND.text};">📦</td>
          <td style="padding:6px 0 6px 8px;font-size:14px;color:${FIXKART_BRAND.text};">
            <strong>Add your first product</strong> – List your products with images, descriptions, and pricing
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${FIXKART_BRAND.text};">🏪</td>
          <td style="padding:6px 0 6px 8px;font-size:14px;color:${FIXKART_BRAND.text};">
            <strong>Set up your store</strong> – Add your logo, banner, and business details
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:${FIXKART_BRAND.text};">📊</td>
          <td style="padding:6px 0 6px 8px;font-size:14px;color:${FIXKART_BRAND.text};">
            <strong>Track your sales</strong> – Monitor orders, revenue, and customer reviews from your dashboard
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin:32px 0 16px;">
      <a href="${loginUrl || 'https://fixkart.dev/vendor/dashboard'}" 
         style="display:inline-block;background-color:${FIXKART_BRAND.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
        Go to Vendor Dashboard →
      </a>
    </div>

    <p style="font-size:14px;color:${FIXKART_BRAND.muted};text-align:center;margin:0;">
      If you have any questions, reply to this email or contact us at <strong>support@fixkart.dev</strong>
    </p>
  `),
});

// =====================================================
// VENDOR REJECTED EMAIL
// =====================================================

export const vendorRejectedEmail = ({ vendorName, shopName, reason }) => ({
  subject: 'FixKart Vendor Application Update',
  html: baseTemplate('Vendor Application Update', `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background-color:#FEE2E2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">📋</div>
      <h1 style="margin:0;font-size:22px;font-weight:800;color:${FIXKART_BRAND.dark};">
        Application Update
      </h1>
    </div>

    <p style="font-size:15px;color:${FIXKART_BRAND.text};line-height:1.6;margin:0 0 20px;">
      Hi <strong>${vendorName}</strong>,
    </p>

    <p style="font-size:15px;color:${FIXKART_BRAND.text};line-height:1.6;margin:0 0 20px;">
      Thank you for applying to become a vendor on FixKart for <strong>${shopName}</strong>.
    </p>

    <p style="font-size:15px;color:${FIXKART_BRAND.text};line-height:1.6;margin:0 0 20px;">
      After reviewing your application, we were unable to approve it at this time.
      ${reason ? `<br><br><strong>Reason:</strong> ${reason}` : ''}
    </p>

    <p style="font-size:15px;color:${FIXKART_BRAND.text};line-height:1.6;margin:0 0 20px;">
      You can reapply with updated details, or contact our support team for more information.
    </p>

    <div style="text-align:center;margin:32px 0 16px;">
      <a href="mailto:support@fixkart.dev" 
         style="display:inline-block;background-color:${FIXKART_BRAND.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;">
        Contact Support
      </a>
    </div>
  `),
});

// =====================================================
// NEW ORDER NOTIFICATION (to vendor)
// =====================================================

export const vendorNewOrderEmail = ({ vendorName, shopName, orderId, customerName, totalAmount, itemCount }) => ({
  subject: `New Order #${orderId?.slice(0, 8)} on ${shopName} – FixKart`,
  html: baseTemplate('New Order Received!', `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;background-color:#DBEAFE;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">🛒</div>
      <h1 style="margin:0;font-size:22px;font-weight:800;color:${FIXKART_BRAND.dark};">New Order Received!</h1>
    </div>

    <p style="font-size:15px;color:${FIXKART_BRAND.text};line-height:1.6;margin:0 0 16px;">
      Hi <strong>${vendorName}</strong>,
    </p>

    <p style="font-size:15px;color:${FIXKART_BRAND.text};line-height:1.6;margin:0 0 20px;">
      You've received a new order on <strong>${shopName}</strong>.
    </p>

    <div style="background-color:${FIXKART_BRAND.light};border-radius:12px;padding:20px;margin:20px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="padding:4px 0;font-size:14px;color:${FIXKART_BRAND.muted};">Order ID</td>
          <td style="padding:4px 0;font-size:14px;color:${FIXKART_BRAND.dark};font-weight:700;text-align:right;">#${orderId?.slice(0, 8) || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:${FIXKART_BRAND.muted};">Customer</td>
          <td style="padding:4px 0;font-size:14px;color:${FIXKART_BRAND.dark};font-weight:700;text-align:right;">${customerName || 'Customer'}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:${FIXKART_BRAND.muted};">Items</td>
          <td style="padding:4px 0;font-size:14px;color:${FIXKART_BRAND.dark};font-weight:700;text-align:right;">${itemCount || 1}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:14px;color:${FIXKART_BRAND.muted};font-weight:700;">Total</td>
          <td style="padding:4px 0;font-size:16px;color:#16A34A;font-weight:800;text-align:right;">₹${totalAmount || 0}</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin:28px 0 16px;">
      <a href="${process.env.CLIENT_URL || 'https://fixkart.dev'}/vendor/dashboard" 
         style="display:inline-block;background-color:${FIXKART_BRAND.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;">
        View Order in Dashboard →
      </a>
    </div>
  `),
});
