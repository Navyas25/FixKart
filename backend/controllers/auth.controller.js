import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabase.js";

import {
    registerSchema,
    loginSchema,
} from "../validators/auth.validator.js";


// =====================================================
// REGISTER
// =====================================================

export const register = async (req, res, next) => {
    try {
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration data",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const {
            email,
            password,
            name,
        } = result.data;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        // Best-effort: create a matching row in `profiles` so the profile,
        // orders and bookings flows have somewhere to store user data.
        // Only possible when signUp returns a session (email confirmation off).
        if (data?.user && data?.session) {
            try {
                const userSupabase = createClient(
                    process.env.SUPABASE_URL,
                    process.env.SUPABASE_ANON_KEY,
                    {
                        global: {
                            headers: {
                                Authorization: `Bearer ${data.session.access_token}`,
                            },
                        },
                    }
                );

                await userSupabase.from("profiles").insert({
                    id: data.user.id,
                    full_name: name,
                    role: "customer",
                });
            } catch (profileError) {
                // Non-fatal: a DB trigger or post-email-confirmation hook
                // may create the profile row instead.
                console.error("[auth] Could not create profile:", profileError);
            }
        }

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                user: data.user,
                session: data.session,
            },
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// LOGIN
// =====================================================

export const login = async (req, res, next) => {
    try {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid login data",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const {
            email,
            password,
        } = result.data;

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

        if (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: data.user,
                session: data.session,
            },
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET CURRENT USER
// =====================================================

export const getCurrentUser = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing",
            });
        }


        // Verify the JWT with Supabase
        const {
            data: userData,
            error: userError,
        } = await supabase.auth.getUser(token);

        if (userError || !userData?.user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        const user = userData.user;


        // Create a Supabase client using the user's JWT.
        // This allows RLS to work using auth.uid().
        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            }
        );


        // Get the user's profile
        const {
            data: profile,
            error: profileError,
        } = await userSupabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


        if (profileError) {
            return res.status(200).json({
                success: true,
                message: "User authenticated",
                data: {
                    user,
                    profile: null,
                },
            });
        }


        return res.status(200).json({
            success: true,
            message: "User authenticated",
            data: {
                user,
                profile,
            },
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// LOGOUT
// =====================================================

export const logout = async (req, res, next) => {
    try {

        /*
         * Supabase sessions are managed on the client.
         * The frontend will remove/clear its local session.
         *
         * We return success here so the frontend has
         * a consistent API endpoint.
         */

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });

    } catch (error) {
        next(error);
    }
};