import { supabase } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';

const REVIEW_SELECT = `
  id, user_id, item_type, item_id, rating, comment, created_at,
  profile:profiles(full_name, avatar_url)
`;

// Cached capability check: the reviews table comes from migration 003. Until
// it is applied, GET returns an empty list so the UI shows "no reviews yet"
// instead of erroring; POST returns 503 so the form stays honest.
let reviewsCapable = null;
async function hasReviewsTable() {
  if (reviewsCapable !== null) return reviewsCapable;
  const { error } = await supabase.from('reviews').select('id').limit(1);
  reviewsCapable = !error;
  return reviewsCapable;
}

// GET /api/reviews?type=product&item_id=<uuid>
// Public: anyone can read reviews for an item.
export const getReviews = async (req, res, next) => {
  try {
    const { type, item_id } = req.query;

    if (!['product', 'service'].includes(type)) {
      return errorResponse(res, 'type must be "product" or "service"', 400);
    }
    if (!item_id) {
      return errorResponse(res, 'item_id is required', 400);
    }

    if (!(await hasReviewsTable())) {
      return successResponse(res, { reviews: [], count: 0, average: 0 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .select(REVIEW_SELECT)
      .eq('item_type', type)
      .eq('item_id', item_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const reviews = data || [];
    const count = reviews.length;
    const average = count
      ? Math.round((reviews.reduce((sum, r) => sum + Number(r.rating), 0) / count) * 10) / 10
      : 0;

    return successResponse(res, { reviews, count, average });
  } catch (err) {
    return next(err);
  }
};

// POST /api/reviews
// Authenticated. One review per user per item - posting again UPDATES the
// existing review (upsert on user_id + item_type + item_id).
export const createReview = async (req, res, next) => {
  try {
    if (!(await hasReviewsTable())) {
      return res.status(503).json({
        success: false,
        message:
          'Reviews are not set up yet. Run backend/scripts/migrations/003_reviews.sql in the Supabase SQL editor.',
      });
    }

    const userId = req.user.id;
    const { item_type, item_id, rating, comment } = req.body;
    const db = getUserSupabase(req);

    // Verify the item actually exists before attaching a review to it.
    const table = item_type === 'product' ? 'products' : 'services';
    const { data: item } = await supabase
      .from(table)
      .select('id')
      .eq('id', item_id)
      .maybeSingle();

    if (!item) {
      return errorResponse(res, `${item_type} not found`, 404);
    }

    const { data, error } = await db
      .from('reviews')
      .upsert(
        {
          user_id: userId,
          item_type,
          item_id,
          rating,
          comment: comment || null,
        },
        { onConflict: 'user_id,item_type,item_id' }
      )
      .select(REVIEW_SELECT)
      .single();

    if (error) throw error;

    return successResponse(res, { review: data }, 201);
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/reviews/:id
// Authenticated. Only the author can delete their own review (enforced by the
// user_id filter - a mismatch simply deletes nothing).
export const deleteReview = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('reviews')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id');

    if (error) throw error;

    if (!data || data.length === 0) {
      return errorResponse(res, 'Review not found', 404);
    }

    return successResponse(res, { message: 'Review deleted' });
  } catch (err) {
    return next(err);
  }
};
