import { Router } from 'express';
import { getAllVendors, getVendorById, getVendorDashboard } from '../controllers/vendors.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireVendor } from '../middleware/role.middleware.js';

const router = Router();

// Public routes
router.get('/', getAllVendors);
router.get('/:id', getVendorById);

// Vendor-only routes
router.get('/me/dashboard', authenticate, requireVendor, getVendorDashboard);

export default router;
