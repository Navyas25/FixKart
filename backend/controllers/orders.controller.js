import { successResponse } from '../utils/response.js';

// GET /api/orders
// Returns orders belonging to the authenticated user only.
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // TODO: query the `orders` (+ `order_items`) tables in Supabase,
    // scoped to userId. Never accept a user id from the request body/query
    // for this endpoint.
    return successResponse(res, { orders: [] });
  } catch (err) {
    return next(err);
  }
};

// POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items, address_id } = req.body;

    // TODO: validate stock, calculate totals server-side, insert into
    // `orders` + `order_items` inside a Supabase transaction/RPC.
    return successResponse(res, { userId, items, address_id }, 201);
  } catch (err) {
    return next(err);
  }
};
