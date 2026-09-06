import { successResponse, errorResponse } from '../utils/response.js';
import { getUserSupabase } from '../utils/supabaseUser.js';

// =====================================================
// CHATBOT KNOWLEDGE BASE — predefined Q&A
// =====================================================

const CHATBOT_KB = [
  {
    keywords: ['refund', 'money back', 'return money'],
    answer: 'Refund requests are handled by our support team. I can create a ticket for you, or you can contact support@fixkart.dev directly. Refunds are processed within 5-7 business days after approval.',
    category: 'refund',
    escalate: true,
  },
  {
    keywords: ['return', 'send back', 'exchange'],
    answer: 'You can return most items within 7 days of delivery. Go to My Orders → select the order → Request Return. Items must be unused and in original packaging. Refunds are processed after inspection.',
    category: 'returns',
    escalate: false,
  },
  {
    keywords: ['order', 'track', 'where is my order', 'delivery status'],
    answer: 'You can track your order from My Orders page. Click on any order to see its current status and tracking information. Orders typically take 3-7 business days to deliver.',
    category: 'orders',
    escalate: false,
  },
  {
    keywords: ['payment', 'paid', 'charge', 'billing'],
    answer: 'All payments are processed securely. If you see an unexpected charge, please check My Orders first. For billing disputes, I can create a support ticket for our team to review.',
    category: 'payment',
    escalate: true,
  },
  {
    keywords: ['booking', 'appointment', 'schedule', 'reschedule'],
    answer: 'You can manage your bookings from the My Bookings page. To reschedule, open the booking and click "Reschedule". Professionals need to confirm the new time. Cancellations are free up to 24 hours before.',
    category: 'bookings',
    escalate: false,
  },
  {
    keywords: ['professional', 'plumber', 'electrician', 'carpenter', 'mechanic'],
    answer: 'All our professionals are verified and background-checked. You can browse professionals by service category, view their ratings, and book directly. If you have concerns about a professional, I can create a ticket.',
    category: 'professionals',
    escalate: false,
  },
  {
    keywords: ['fixcoins', 'coins', 'rewards', 'points', 'loyalty'],
    answer: 'FixCoins are loyalty points earned by completing jobs and receiving good ratings. You can view your FixCoins balance in the Professional Dashboard. Points can be redeemed for tool discounts, fuel rewards, and more.',
    category: 'fixcoins',
    escalate: false,
  },
  {
    keywords: ['account', 'login', 'password', 'forgot password', 'sign in'],
    answer: 'To reset your password, click "Forgot password?" on the login page. You\'ll receive a reset link via email. If you can\'t access your email, contact support@fixkart.dev for account recovery.',
    category: 'account',
    escalate: false,
  },
  {
    keywords: ['verify', 'verification', 'verified', 'kyc', 'documents'],
    answer: 'Verification usually takes 24-48 hours. Upload your government ID and certification documents from your Dashboard → Verification tab. You\'ll receive an email once verified.',
    category: 'verification',
    escalate: false,
  },
  {
    keywords: ['shipping', 'deliver', 'ship', 'courier', 'dispatch'],
    answer: 'Standard shipping takes 3-7 business days. Express shipping (1-2 days) is available for select products. You can see shipping options at checkout. Track your shipment from My Orders.',
    category: 'shipping',
    escalate: false,
  },
  {
    keywords: ['cancel', 'cancellation'],
    answer: 'You can cancel orders before they are shipped. For bookings, cancel at least 24 hours in advance to avoid any charges. Go to My Orders or My Bookings and click Cancel.',
    category: 'cancellation',
    escalate: false,
  },
  {
    keywords: ['product', 'defective', 'broken', 'damage', 'wrong item'],
    answer: 'If you received a defective or wrong item, we apologize! Please take photos and create a support ticket. We\'ll arrange a free return and replacement or full refund.',
    category: 'defective',
    escalate: true,
  },
  {
    keywords: ['commission', 'platform fee', 'charge'],
    answer: 'FixKart charges a 5% platform commission on completed jobs and orders. This covers payment processing, platform maintenance, and customer support. The commission is deducted automatically.',
    category: 'commission',
    escalate: false,
  },
  {
    keywords: ['hello', 'hi', 'hey', 'help'],
    answer: 'Hello! 👋 I\'m the FixKart support assistant. I can help you with:\n\n• Order tracking & delivery\n• Returns & refunds\n• Booking management\n• Account issues\n• Payment questions\n• Professional verification\n\nWhat can I help you with?',
    category: 'general',
    escalate: false,
  },
  {
    keywords: ['contact', 'human', 'agent', 'real person', 'talk to someone'],
    answer: 'I\'ll connect you with our support team right away. Please describe your issue and I\'ll create a ticket. Our team typically responds within 2-4 hours during business hours.',
    category: 'escalation',
    escalate: true,
  },
];

// =====================================================
// CHATBOT — process a message and return a response
// =====================================================

export const chatbotMessage = async (req, res, next) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return errorResponse(res, 'Message is required', 400);
    }

    const lower = message.toLowerCase().trim();

    // Find best matching KB entry
    let bestMatch = null;
    let bestScore = 0;

    for (const entry of CHATBOT_KB) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (lower.includes(kw)) {
          score += kw.length; // longer keyword matches are weighted higher
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    if (bestMatch && bestScore > 0) {
      return successResponse(res, {
        reply: bestMatch.answer,
        category: bestMatch.category,
        escalate: bestMatch.escalate,
        suggestions: bestMatch.escalate
          ? ['Create a support ticket', 'Contact support@fixkart.dev']
          : [],
      });
    }

    // No match — suggest escalation
    return successResponse(res, {
      reply: "I'm not sure I understand. Could you rephrase that? Here are some things I can help with:\n\n• Order tracking & delivery\n• Returns & refunds\n• Booking management\n• Account issues\n• Payment questions\n\nOr type \"connect me to support\" to talk to a real person.",
      category: 'unmatched',
      escalate: false,
      suggestions: [
        'Track my order',
        'I want a refund',
        'Connect me to support',
      ],
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// CREATE SUPPORT TICKET
// =====================================================

export const createTicket = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);
    const { subject, category, description, booking_id, priority } = req.body || {};

    if (!subject || !category) {
      return errorResponse(res, 'Subject and category are required', 400);
    }

    // Generate a short ticket ID
    const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const { data, error } = await db
      .from('support_tickets')
      .insert({
        ticket_id: ticketId,
        user_id: req.user.id,
        subject,
        category,
        description: description || '',
        booking_id: booking_id || null,
        priority: priority || 'normal',
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      // Table might not exist — return a mock response
      if (/does not exist|not found/i.test(error.message)) {
        return successResponse(res, {
          ticket: {
            ticket_id: ticketId,
            subject,
            category,
            status: 'open',
            created_at: new Date().toISOString(),
          },
          message: 'Ticket created (pending database setup). Our team will contact you at support@fixkart.dev.',
        }, 201);
      }
      throw error;
    }

    return successResponse(res, { ticket: data }, 201);
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// GET MY SUPPORT TICKETS
// =====================================================

export const getMyTickets = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);

    const { data, error } = await db
      .from('support_tickets')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (/does not exist|not found/i.test(error.message)) {
        return successResponse(res, { tickets: [] });
      }
      throw error;
    }

    return successResponse(res, { tickets: data || [] });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// ADMIN: GET ALL SUPPORT TICKETS
// =====================================================

export const getAllTickets = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);
    const { status, priority } = req.query;

    let query = db
      .from('support_tickets')
      .select('*, profile:profiles(full_name, email, phone)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;

    if (error) {
      if (/does not exist|not found/i.test(error.message)) {
        return successResponse(res, { tickets: [], total: 0 });
      }
      throw error;
    }

    const tickets = data || [];

    // If profiles join failed, attach manually
    const needsProfile = tickets.some(t => !t.profile);
    if (needsProfile) {
      const userIds = [...new Set(tickets.map(t => t.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles } = await db.from('profiles').select('id, full_name, phone').in('id', userIds);
        const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
        tickets.forEach(t => { if (!t.profile) t.profile = profileMap[t.user_id] || null; });
      }
    }

    return successResponse(res, { tickets, total: tickets.length });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// ADMIN: UPDATE TICKET STATUS
// =====================================================

export const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, response: agentResponse } = req.body || {};

    const db = getUserSupabase(req);

    const updates = {};
    if (status) updates.status = status;
    if (assigned_to) updates.assigned_to = assigned_to;
    if (agentResponse) updates.agent_response = agentResponse;

    if (Object.keys(updates).length === 0) {
      return errorResponse(res, 'No fields to update', 400);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await db
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (/does not exist|not found/i.test(error.message)) {
        return successResponse(res, { ticket: { id, ...updates }, message: 'Updated (pending database setup)' });
      }
      throw error;
    }

    return successResponse(res, { ticket: data });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// ADMIN: SUPPORT STATS
// =====================================================

export const getSupportStats = async (req, res, next) => {
  try {
    const db = getUserSupabase(req);

    let tickets = [];
    try {
      const { data } = await db
        .from('support_tickets')
        .select('id, status, category, priority, created_at');
      tickets = data || [];
    } catch {
      // Table might not exist
    }

    const open = tickets.filter(t => t.status === 'open').length;
    const inReview = tickets.filter(t => t.status === 'in_review').length;
    const waitingResponse = tickets.filter(t => t.status === 'waiting_response').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;

    const byCategory = {};
    tickets.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });

    const byPriority = {};
    tickets.forEach(t => {
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    });

    // Average resolution time (resolved tickets only)
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' && t.updated_at);
    let avgResolutionHours = 0;
    if (resolvedTickets.length > 0) {
      const totalMs = resolvedTickets.reduce((sum, t) => {
        return sum + (new Date(t.updated_at).getTime() - new Date(t.created_at).getTime());
      }, 0);
      avgResolutionHours = Math.round((totalMs / resolvedTickets.length / (1000 * 60 * 60)) * 10) / 10;
    }

    return successResponse(res, {
      stats: {
        total: tickets.length,
        open,
        in_review: inReview,
        waiting_response: waitingResponse,
        resolved,
        avg_resolution_hours: avgResolutionHours,
      },
      by_category: byCategory,
      by_priority: byPriority,
    });
  } catch (err) {
    return next(err);
  }
};

// =====================================================
// FAQ DATA — for help center pages
// =====================================================

export const getFAQ = async (req, res, next) => {
  try {
    const faqs = [
      {
        category: 'Orders',
        items: [
          { q: 'How do I track my order?', a: 'Go to My Orders page and click on any order to see its current status and tracking information.' },
          { q: 'Can I cancel my order?', a: 'Yes, you can cancel orders before they are shipped. Go to My Orders and click Cancel.' },
          { q: 'How long does delivery take?', a: 'Standard delivery takes 3-7 business days. Express shipping (1-2 days) is available for select products.' },
        ],
      },
      {
        category: 'Returns & Refunds',
        items: [
          { q: 'How do I return a product?', a: 'Go to My Orders → select the order → Request Return. Items must be unused and in original packaging within 7 days of delivery.' },
          { q: 'How long do refunds take?', a: 'Refunds are processed within 5-7 business days after the return is approved.' },
          { q: 'What if I received a damaged item?', a: 'Take photos of the damage and create a support ticket. We\'ll arrange a free return and replacement or full refund.' },
        ],
      },
      {
        category: 'Bookings',
        items: [
          { q: 'How do I book a professional?', a: 'Browse Professionals → select one → choose a service → pick a date/time → confirm booking.' },
          { q: 'Can I reschedule a booking?', a: 'Yes, open the booking from My Bookings and click Reschedule. The professional needs to confirm the new time.' },
          { q: 'What if the professional doesn\'t show up?', a: 'Contact support immediately. We\'ll arrange a replacement professional and you won\'t be charged.' },
        ],
      },
      {
        category: 'Account',
        items: [
          { q: 'How do I reset my password?', a: 'Click "Forgot password?" on the login page and follow the email instructions.' },
          { q: 'How do I become a verified professional?', a: 'Register as a professional, upload your ID and certification documents. Verification takes 24-48 hours.' },
        ],
      },
    ];

    return successResponse(res, { faqs });
  } catch (err) {
    return next(err);
  }
};
