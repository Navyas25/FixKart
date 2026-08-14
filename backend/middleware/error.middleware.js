import { errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// Handles any request that didn't match a route.
export const notFound = (req, res, next) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

// Centralized error handler. Must be registered last, after all routes.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  // Never leak stack traces, file paths, or Supabase/DB internals to the client.
  const message =
    process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong';

  return errorResponse(res, message, statusCode);
};
