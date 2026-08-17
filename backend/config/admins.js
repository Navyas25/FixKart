// =====================================================
// THE ONLY 4 ADMIN ACCOUNTS
// =====================================================
//
// Exactly these four emails may hold the admin role. Every other account -
// even one whose profiles.role was manually set to 'admin' - is denied by
// the requireAdmin middleware and the DB trigger in
// backend/scripts/migrations/001_professional_verification.sql.
//
// To change who the admins are, edit this list AND the matching list in the
// migration SQL (keep them in sync).

export const ADMIN_EMAILS = [
  "admin@fixkart.dev",
  "ops@fixkart.dev",
  "support@fixkart.dev",
  "finance@fixkart.dev",
];

export const isAdminEmail = (email) =>
  ADMIN_EMAILS.includes(String(email || "").trim().toLowerCase());
