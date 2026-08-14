export const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            const role = req.user.user_metadata?.role;

            if (!role) {
                return res.status(403).json({
                    success: false,
                    message: "User role not found",
                });
            }

            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to access this resource",
                });
            }

            req.userRole = role;

            next();

        } catch (error) {
            next(error);
        }
    };
};