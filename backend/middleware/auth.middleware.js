import { supabase } from "../config/supabase.js";


// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const token = authHeader.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing",
            });
        }


        // Verify token with Supabase
        const {
            data,
            error,
        } = await supabase.auth.getUser(token);


        if (error || !data?.user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token",
            });
        }


        // Store authenticated user on request
        req.user = data.user;

        // Store token so later middleware can use
        // the user's authenticated Supabase session.
        req.accessToken = token;


        next();

    } catch (error) {
        next(error);
    }
};


// =====================================================
// BACKWARD-COMPATIBLE ALIAS
// =====================================================
//
// Some existing routes use:
//
// import { requireAuth } from "../middleware/auth.middleware.js";
//
// Keep this alias so those routes continue working.

export const requireAuth = authenticate;