import { Router } from 'express';
import { getMyOrders, getFrequentProducts, createOrder } from '../controllers/orders.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../validators/order.validator.js';
import { createOrderSchema } from '../validators/order.validator.js';

const router = Router();

router.get('/', requireAuth, getMyOrders);
router.get('/frequent', requireAuth, getFrequentProducts);
router.post('/', requireAuth, validate(createOrderSchema), createOrder);

export default router;
