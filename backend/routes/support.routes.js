import { Router } from 'express';
import {
  chatbotMessage,
  createChatSession,
  sendChatMessage,
  getChatMessages,
  getAllChatSessions,
  updateChatSession,
  getSupportStats,
  getFAQ,
} from '../controllers/support.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// --- Public / Chatbot ---
router.post('/chatbot', chatbotMessage);
router.get('/faq', getFAQ);

// --- Live Chat (anyone can start, messages are public within session) ---
router.post('/chat/session', createChatSession);
router.post('/chat/message', sendChatMessage);
router.get('/chat/:session_id/messages', getChatMessages);

// --- Admin ---
router.get('/admin/sessions', requireAuth, requireAdmin, getAllChatSessions);
router.patch('/admin/sessions/:id', requireAuth, requireAdmin, updateChatSession);
router.get('/admin/stats', requireAuth, requireAdmin, getSupportStats);

export default router;
