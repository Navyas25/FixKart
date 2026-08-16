import { Router } from 'express';
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/addresses.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  validate,
  createAddressSchema,
  updateAddressSchema,
} from '../validators/address.validator.js';

const router = Router();

router.get('/', requireAuth, getMyAddresses);
router.post('/', requireAuth, validate(createAddressSchema), createAddress);
router.patch('/:id', requireAuth, validate(updateAddressSchema), updateAddress);
router.delete('/:id', requireAuth, deleteAddress);

export default router;
