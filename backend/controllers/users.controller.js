import { successResponse } from '../utils/response.js';

// GET /api/users/profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // TODO: fetch the profile row from the `users` table by userId.
    return successResponse(res, { userId });
  } catch (err) {
    return next(err);
  }
};

// PATCH /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // TODO: validate the incoming fields and update the `users` table row
    // for userId. Never let the client update their own role from here.
    return successResponse(res, { userId, ...req.body });
  } catch (err) {
    return next(err);
  }
};
