import { Router } from 'express';
import {
  getAllVendors,
  getVendorById,
  getVendorDashboard,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyOrders,
  updateOrderStatus,
  getMyReviews,
  getMyAnalytics,
  getMyInventory,
  updateStock,
  updateStoreProfile,
  updateBankDetails,
  getMyNotifications,
} from '../controllers/vendors.controller.js';
import {
  getAllVendorsAdmin,
  verifyVendor,
} from '../controllers/vendor-admin.controller.js';
import { authenticate, requireAuth } from '../middleware/auth.middleware.js';
import { requireVendor, requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// --- Admin routes ---
router.get('/admin', requireAuth, requireAdmin, getAllVendorsAdmin);
router.patch('/:id/verify', requireAuth, requireAdmin, verifyVendor);

// --- Vendor portal (own data only) ---
router.get('/me/dashboard', requireAuth, requireVendor, getVendorDashboard);
router.get('/me/products', requireAuth, requireVendor, getMyProducts);
router.post('/me/products', requireAuth, requireVendor, createProduct);
router.patch('/me/products/:id', requireAuth, requireVendor, updateProduct);
router.delete('/me/products/:id', requireAuth, requireVendor, deleteProduct);
router.get('/me/orders', requireAuth, requireVendor, getMyOrders);
router.patch('/me/orders/:id/status', requireAuth, requireVendor, updateOrderStatus);
router.get('/me/reviews', requireAuth, requireVendor, getMyReviews);
router.get('/me/analytics', requireAuth, requireVendor, getMyAnalytics);
router.get('/me/inventory', requireAuth, requireVendor, getMyInventory);
router.patch('/me/inventory/:id', requireAuth, requireVendor, updateStock);
router.patch('/me/store', requireAuth, requireVendor, updateStoreProfile);
router.patch('/me/bank', requireAuth, requireVendor, updateBankDetails);
router.get('/me/notifications', requireAuth, requireVendor, getMyNotifications);

// --- Public routes ---
router.get('/', getAllVendors);
router.get('/:id', getVendorById);

export default router;
