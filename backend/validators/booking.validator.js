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

export const createBookingSchema = z.object({
  professional_id: z.string().uuid('Invalid professional id'),
  service_id: z.string().uuid('Invalid service id'),
  scheduled_date: z.string().datetime({ message: 'scheduled_date must be a valid ISO date' }),
  address: z.string().min(5, 'Address is required'),
  notes: z.string().max(1000).optional(),
});
