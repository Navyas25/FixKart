import { z } from 'zod';
import { errorResponse } from '../utils/response.js';

// Wraps a Zod schema into an Express middleware. On failure, responds with a
// 400 and the first validation issue instead of trusting the client.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return errorResponse(res, firstIssue?.message || 'Invalid request body', 400);
  }

  req.body = result.data;
  return next();
};

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum([
    'PLUMBING',
    'ELECTRICAL',
    'HARDWARE',
    'HAND_TOOLS',
    'POWER_TOOLS',
    'AUTOMOTIVE',
    'SAFETY_EQUIPMENT',
    'OTHER',
  ]),
  price: z.number().positive('Price must be a positive number'),
  stock_quantity: z.number().int().nonnegative('Stock quantity cannot be negative'),
});

export const updateProductSchema = createProductSchema.partial();
