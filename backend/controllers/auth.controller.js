import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabase.js";
import { admin, hasAdmin } from "../config/admin.js";
import { isAdminEmail } from "../config/admins.js";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

// =====================================================
// REGISTER
// =====================================================
//
// One endpoint, two flows. The validated `role` (customer | professional,
// never anything else) decides what rows get created:
//   - customer     -> profiles row with role = "customer"
//   - professional -> profiles row with role = "professional" AND a
//                     professionals row with verification_status = "pending".
//
// The role is assigned by the SERVER from validated input - a client can
// request a role, but it is never read from JWT metadata or raw body fields.

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
      phone,
      role = "customer",
      service_category,
      experience_years,
      service_location,
      bio,
    } = result.data;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // A session is returned when email confirmation is disabled. Only then
    // can we create rows. When email confirmation is on, a trigger or admin
    // hook should create the profile.
    // Assigning a professional role is a privileged write - RLS must not
    // trust a client-supplied role, so it requires the server-side
    // service-role key. Without it we refuse rather than create a broken
    // account whose role never sticks.
    if (role === "professional" && !hasAdmin) {
      return res.status(503).json({
        success: false,
        message:
          "Professional registration needs SUPABASE_SERVICE_ROLE_KEY set in backend/.env (server-side only - never expose it to the frontend).",
      });
    }

    if (data?.user && data?.session) {
      try {
        // Roles are assigned through the SERVER-SIDE service-role client.
        // RLS cannot be trusted to set a role from a client-supplied insert,
        // so this is the one place the privileged client is used. If the
        // service key is not configured we fall back to the user's JWT
        // (customer role only, via the RLS owner_insert_profile policy).
        const writer = hasAdmin
          ? admin
          : createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
              global: {
                headers: {
                  Authorization: `Bearer ${data.session.access_token}`,
                },
              },
            });

        // Profile row - role is set server-side, never from a client field.
        // A database trigger (handle_new_user) usually creates the profile
        // row at sign-up with the DEFAULT role. The role-change trigger then
        // blocks updating that row, so with the privileged service client we
        // DELETE the default row and INSERT it with the correct role instead
        // (inserts are not role-gated). Without the service key we upsert
        // via the user's JWT, where RLS only permits role='customer'.
        const profilePayload = {
          id: data.user.id,
          full_name: name,
          role,
        };
        if (phone) profilePayload.phone = phone;

        let profileError = null;
        if (hasAdmin) {
          await writer.from("profiles").delete().eq("id", data.user.id);
          const res = await writer.from("profiles").insert(profilePayload);
          profileError = res.error;
        } else {
          const res = await writer
            .from("profiles")
            .upsert(profilePayload, { onConflict: "id" });
          profileError = res.error;
        }

        if (profileError) {
          console.error("[auth] Could not set profile role:", profileError.message);
        }

        // Professional row with pending verification.
        if (role === "professional") {
          const { error: professionalError } = await writer
            .from("professionals")
            .insert({
              user_id: data.user.id,
              experience_years: experience_years ?? 0,
              rating: 0,
              bio: bio || "",
              service_categories: service_category
                ? [service_category]
                : [],
              service_locations: service_location
                ? [service_location]
                : [],
              verification_status: "pending",
            });

          if (professionalError) {
            console.error(
              "[auth] Could not create professional row:",
              professionalError.message
            );
          }
        }
      } catch (profileError) {
        // Non-fatal for the customer flow; for professionals the missing
        // profile row is surfaced by /api/professionals/me as a 403.
        console.error("[auth] Could not create profile:", profileError.message);
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

    const { email, password } = result.data;

    const { data, error } = await supabase.auth.signInWithPassword({
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
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = userData.user;

    // Create a Supabase client using the user's JWT so RLS scopes the read.
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

    const { data: profile, error: profileError } = await userSupabase
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

    // A profile row saying role='admin' is not enough - the account must be
    // one of the four allowlisted admin emails. Anyone else is reported as
    // their real (non-admin) role so the UI never shows admin surfaces.
    if (profile.role === "admin" && !isAdminEmail(user.email)) {
      profile.role = "customer";
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
// FORGOT PASSWORD (request a reset email)
// =====================================================
// Always returns the same message whether or not the account exists, so the
// endpoint cannot be used to enumerate registered emails.

export const forgotPassword = async (req, res, next) => {
  try {
    const result = forgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { email } = result.data;
    const CLIENT_URL = process.env.CLIENT_URL || "http://127.0.0.1:5173";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${CLIENT_URL}/reset-password`,
    });

    if (error) {
      // A common cause is the redirect URL not being allowlisted in
      // Supabase -> Authentication -> URL Configuration -> Redirect URLs.
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// RESET PASSWORD (via the email link)
// =====================================================
// The access_token embedded in the Supabase recovery link IS the credential
// here - no Authorization header is needed. The token is verified first, then
// used to set the new password scoped to that recovery session.

export const resetPassword = async (req, res, next) => {
  try {
    const result = resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { token, new_password } = result.data;

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({
        success: false,
        message:
          "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    // The recovery token was verified above - it IS the credential. Apply the
    // new password with the server-side admin client (recovery sessions are
    // one-shot, so there is no session juggling involved).
    if (!hasAdmin) {
      return res.status(503).json({
        success: false,
        message:
          "Password reset needs SUPABASE_SERVICE_ROLE_KEY set in backend/.env (server-side only).",
      });
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(
      userData.user.id,
      { password: new_password }
    );

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Password updated. You can now sign in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CHANGE PASSWORD (signed-in user, from settings)
// =====================================================
// Requires the current password (verified server-side) so a stolen session
// token alone cannot take over an account. Other sessions are signed out.

export const changePassword = async (req, res, next) => {
  try {
    const result = changePasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid password data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const { current_password, new_password } = result.data;

    // Verify the current password before allowing the change. The returned
    // session is then used for the password write - least privilege, no
    // service key involved in this path.
    const { data: verified, error: verifyError } =
      await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: current_password,
      });

    if (verifyError || !verified?.session) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // supabase-js auth methods need an internal session (the global
    // Authorization header only applies to storage/PostgREST calls), so load
    // the verified session into a dedicated client.
    const userClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    await userClient.auth.setSession({
      access_token: verified.session.access_token,
      refresh_token: verified.session.refresh_token,
    });

    const { error: updateError } = await userClient.auth.updateUser({
      password: new_password,
    });

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message,
      });
    }

    // Revoke sessions on every other device for good measure.
    try {
      await userClient.auth.signOut({ scope: "others" });
    } catch {
      // Non-fatal - the password change itself succeeded.
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
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
    // Supabase sessions are managed on the client. The frontend clears its
    // local session; this endpoint exists so the client has a consistent
    // sign-out API. Optionally revoke the refresh token server-side here.
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};
