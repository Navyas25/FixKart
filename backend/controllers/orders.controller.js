import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';

// GET /api/orders
// Returns orders belonging to the authenticated user only.
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('orders')
      .select(
        `*,
        items:order_items(*, product:products(id, name, price, image_url)),
        address:addresses(*)`
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return successResponse(res, { orders: data || [] });
  } catch (err) {
    return next(err);
  }
};

// POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items, address_id } = req.body;
    const db = getUserSupabase(req);

    const productIds = items.map((item) => item.product_id);

    const { data: products, error: productError } = await db
      .from('products')
      .select('id, name, price, stock')
      .in('id', productIds);

    if (productError) throw productError;

    // Validate every item: it must exist and have enough stock.
    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = (products || []).find((p) => p.id === item.product_id);

      if (!product) {
        return errorResponse(
          res,
          `Product ${item.product_id} does not exist`,
          400
        );
      }

      if (product.stock < item.quantity) {
        return errorResponse(
          res,
          `Insufficient stock for "${product.name}" (only ${product.stock} left)`,
          400
        );
      }

      total += product.price * item.quantity;

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price,
      });
    }

    // Create the order (server-calculated total only - never trust the client).
    const { data: order, error: orderError } = await db
      .from('orders')
      .insert({
        user_id: userId,
        address_id,
        total_amount: total,
        status: 'confirmed',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert line items.
    const { error: itemsError } = await db
      .from('order_items')
      .insert(
        orderItems.map((item) => ({
          order_id: order.id,
          ...item,
        }))
      );

    if (itemsError) throw itemsError;

    // Best-effort stock decrement (no DB transaction available over REST).
    for (const item of orderItems) {
      const product = (products || []).find((p) => p.id === item.product_id);
      await db
        .from('products')
        .update({ stock: Math.max(0, product.stock - item.quantity) })
        .eq('id', item.product_id);
    }

    return successResponse(res, { order }, 201);
  } catch (err) {
    return next(err);
  }
};
