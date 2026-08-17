import { Router } from 'express';
import { getReviews, createReview, deleteReview } from '../controllers/reviews.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate, reviewSchema } from '../validators/review.validator.js';

const router = Router();

router.get('/', getReviews);
router.post('/', requireAuth, validate(reviewSchema), createReview);
router.delete('/:id', requireAuth, deleteReview);

export default router;
