import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';

// GET /api/orders/frequent
// Returns the products the authenticated user orders most often, with the
// number of times ordered, for "Frequently ordered" / "Order again" sections.
export const getFrequentProducts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('orders')
      .select(
        'items:order_items(product_id, quantity, product:products(id, name, price, image_url))'
      )
      .eq('user_id', userId);

    if (error) throw error;

    const counts = new Map();
    for (const order of data || []) {
      for (const item of order.items || []) {
        const entry = counts.get(item.product_id) || {
          product: item.product,
          count: 0,
        };
        entry.count += Number(item.quantity) || 0;
        counts.set(item.product_id, entry);
      }
    }

    const products = [...counts.values()]
      .filter((entry) => entry.product)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return successResponse(res, { products });
  } catch (err) {
    return next(err);
  }
};

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
    const { items, address_id, points_redeemed = 0 } = req.body;
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

    // Points redemption (1 point = Rs 1). The database trigger verifies the
    // wallet actually has the balance and deducts it - a client can never
    // redeem more than they own.
    const redeemed = Math.min(
      Math.max(0, Math.floor(Number(points_redeemed) || 0)),
      total
    );

    // Create the order (server-calculated total only - never trust the client).
    const { data: order, error: orderError } = await db
      .from('orders')
      .insert({
        user_id: userId,
        address_id,
        total_amount: total - redeemed,
        points_redeemed: redeemed,
        status: 'confirmed',
      })
      .select()
      .single();

    if (orderError) {
      // Surface the wallet trigger's "insufficient points" exception cleanly.
      const message = String(orderError.message || '');
      if (/insufficient wallet points/i.test(message)) {
        return errorResponse(res, 'You do not have enough FixKart points for this redemption.', 400);
      }
      throw orderError;
    }

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
