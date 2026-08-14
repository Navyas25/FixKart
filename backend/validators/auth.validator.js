import { z } from "zod";

export const registerSchema = z.object({
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