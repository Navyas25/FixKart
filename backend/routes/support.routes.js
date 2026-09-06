import { Router } from 'express';
import {
  chatbotMessage,
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket,
  getSupportStats,
  getFAQ,
} from '../controllers/support.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// --- Public / Chatbot ---
router.post('/chatbot', chatbotMessage);
router.get('/faq', getFAQ);

// --- Authenticated user ---
router.post('/tickets', requireAuth, createTicket);
router.get('/tickets', requireAuth, getMyTickets);

// --- Admin / Support agent ---
router.get('/admin/tickets', requireAuth, requireAdmin, getAllTickets);
router.patch('/admin/tickets/:id', requireAuth, requireAdmin, updateTicket);
router.get('/admin/stats', requireAuth, requireAdmin, getSupportStats);

export default router;
