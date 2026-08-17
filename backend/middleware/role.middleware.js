import { getUserSupabase } from '../utils/supabaseUser.js';
import { isAdminEmail } from '../config/admins.js';

// =====================================================
// DATABASE-BACKED ROLE AUTHORIZATION
// =====================================================
//
// Roles are NEVER trusted from the client. The JWT identifies the user,
// but the role is read from the `profiles` table in the database. This
// means a user cannot escalate their role by tampering with the request
// body or even with their own auth metadata - the DB is the source of
// truth, and RLS scopes the read to the authenticated user's own row.

const ROLE_ALIASES = ['customer', 'professional', 'admin'];

const loadDbRole = async (req) => {
  if (req.dbRole !== undefined) return req.dbRole;

  if (!req.user || !req.accessToken) {
    req.dbRole = null;
    return null;
  }

  try {
    const db = getUserSupabase(req);
    const { data } = await db
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .maybeSingle();

    req.dbRole = data?.role || null;
  } catch {
    // Any error (RLS, missing row, network) means "no role" - fail closed.
    req.dbRole = null;
  }

  return req.dbRole;
};

export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Authentication required' },
        });
      }

      const role = await loadDbRole(req);

      if (!role) {
        return res.status(403).json({
          success: false,
          error: { message: 'User role not found. Profile may not exist yet.' },
        });
      }

      if (!ROLE_ALIASES.includes(role)) {
        return res.status(403).json({
          success: false,
          error: { message: 'Unknown user role' },
        });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          error: { message: 'You do not have permission to access this resource' },
        });
      }

      // Admin is limited to the exact allowlist in config/admins.js. A DB
      // row saying role='admin' is not enough - the email must be one of the
      // four authorized accounts, otherwise the request is refused.
      if (role === 'admin' && !isAdminEmail(req.user.email)) {
        return res.status(403).json({
          success: false,
          error: { message: 'You do not have permission to access this resource' },
        });
      }

      req.userRole = role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Convenience aliases
export const requireCustomer = requireRole('customer');
export const requireProfessional = requireRole('professional');
export const requireAdmin = requireRole('admin');

// Backward-compatible alias for existing code that imports authorizeRoles.
export const authorizeRoles = requireRole;
