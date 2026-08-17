import { z } from 'zod';
import { errorResponse } from '../utils/response.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return errorResponse(res, firstIssue?.message || 'Invalid request body', 400);
  }

  req.body = result.data;
  return next();
};

export const reviewSchema = z.object({
  item_type: z.enum(['product', 'service'], 'item_type must be "product" or "service"'),
  item_id: z.string().uuid('Invalid item id'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().max(1000, 'Comment must be under 1000 characters').optional(),
});
