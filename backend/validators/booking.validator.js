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
  // A booking can be placed straight from a professional's profile without
  // choosing a specific service, so service_id is optional.
  service_id: z.string().uuid('Invalid service id').optional(),
  scheduled_at: z
    .string()
    .datetime({ message: 'scheduled_at must be a valid ISO date-time' }),
  address: z.string().min(5, 'Address is required').optional(),
  notes: z.string().max(1000).optional(),
});
