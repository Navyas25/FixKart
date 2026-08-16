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

export const createAddressSchema = z.object({
  address_line: z.string().trim().min(5, 'Address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().optional().default(''),
  postal_code: z.string().trim().min(3, 'Postal code is required'),
  is_default: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
