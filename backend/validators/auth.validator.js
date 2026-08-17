import { z } from "zod";

const baseFields = {
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .optional(),
};

// Registration schema. The role field defaults to "customer" so a request
// without a role can never register as anything else, and the only allowed
// values are customer | professional (never admin). Professional-only fields
// are validated via superRefine below: required for professionals, stripped
// for customers.
export const registerSchema = z
  .object({
    ...baseFields,

    role: z.enum(["customer", "professional"]).default("customer"),

    service_category: z
      .string()
      .trim()
      .min(2, "Service category is required")
      .max(60)
      .optional(),

    experience_years: z
      .number()
      .int("Experience must be a whole number")
      .min(0)
      .max(60)
      .optional(),

    service_location: z
      .string()
      .trim()
      .min(2, "Service location is required")
      .max(120)
      .optional(),

    bio: z
      .string()
      .trim()
      .min(10, "Bio must be at least 10 characters")
      .max(1000)
      .optional(),
  })
  .superRefine((val, ctx) => {
    if (val.role === "professional" && !val.service_category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["service_category"],
        message: "Service category is required for professional registration",
      });
    }
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254),

  password: z
    .string()
    .min(1, "Password is required")
    .max(72),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254),
});

// Token = the access_token carried by the Supabase recovery email link.
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required").max(72),
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),
});
