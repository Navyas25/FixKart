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

export const orderItemSchema = z.object({
  product_id: z.string().uuid('Invalid product id'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  address_id: z.string().uuid('Invalid address id'),
  points_redeemed: z.number().int().min(0).max(1_000_000).optional().default(0),
});
