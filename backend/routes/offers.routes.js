import { Router } from 'express';
import {
  getVendorOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/offers.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireVendor } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', requireAuth, requireVendor, getVendorOffers);
router.post('/', requireAuth, requireVendor, createOffer);
router.patch('/:id', requireAuth, requireVendor, updateOffer);
router.delete('/:id', requireAuth, requireVendor, deleteOffer);

export default router;
