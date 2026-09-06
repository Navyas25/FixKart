import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Headphones, ExternalLink } from "lucide-react";
import { apiPost } from "../../lib/api";

interface Message {
  role: "bot" | "user";
  text: string;
  suggestions?: string[];
  escalate?: boolean;
  category?: string;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hello! 👋 I'm the FixKart support assistant. I can help you with orders, returns, bookings, payments, and more. What can I help you with?",
      suggestions: ["Track my order", "I want a refund", "Book a professional", "Account help"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "general", description: "" });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiPost<{ reply: string; category: string; escalate: boolean; suggestions: string[] }>("/support/chatbot", { message: text.trim() });

      const botMsg: Message = {
        role: "bot",
        text: data.reply,
        suggestions: data.suggestions || [],
        escalate: data.escalate,
        category: data.category,
      };
      setMessages((prev) => [...prev, botMsg]);

      if (data.escalate) {
        // Show ticket form after a brief delay
        setTimeout(() => setShowTicketForm(true), 500);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again or email support@fixkart.dev" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async () => {
    if (!ticketForm.subject.trim()) return;
    try {
      await apiPost("/support/tickets", ticketForm);
      setTicketSubmitted(true);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "✅ Support ticket created! Our team will get back to you within 2-4 hours. You can also email support@fixkart.dev for immediate assistance." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Couldn't create ticket. Please email support@fixkart.dev directly." },
      ]);
    }
    setShowTicketForm(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#2563EB] hover:bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-110"
        aria-label="Open support chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden" style={{ height: "520px" }}>
          {/* Header */}
          <div className="bg-[#2563EB] text-white px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-sm">FixKart Support</p>
              <p className="text-xs text-blue-100">We typically reply instantly</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : ""}`}>
                  {msg.role === "bot" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">Support Bot</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-[#2563EB] text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-white/5 text-[#0F172A] dark:text-white rounded-bl-md border border-gray-100 dark:border-white/10"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {/* Suggestion chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestions.map((s, j) => (
                        <button
                          key={j}
                          onClick={() => sendMessage(s)}
                          className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Escalation badge */}
                  {msg.escalate && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>This requires human support</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-white/5 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-100 dark:border-white/10">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-300 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-300 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ticket form (slides up when escalation needed) */}
          {showTicketForm && !ticketSubmitted && (
            <div className="border-t border-gray-100 dark:border-white/10 px-4 py-3 bg-amber-50 dark:bg-amber-500/5">
              <p className="text-xs font-extrabold text-amber-700 dark:text-amber-400 mb-2">Create a Support Ticket</p>
              <input
                type="text"
                placeholder="Subject (e.g., Refund for order #123)"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                className="w-full text-xs font-medium bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 rounded-lg px-3 py-2 mb-2 outline-none focus:border-[#2563EB] text-[#0F172A] dark:text-white"
              />
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                className="w-full text-xs font-medium bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 rounded-lg px-3 py-2 mb-2 outline-none text-[#0F172A] dark:text-white"
              >
                <option value="general">General</option>
                <option value="refund">Refund Request</option>
                <option value="returns">Return Request</option>
                <option value="payment">Payment Issue</option>
                <option value="booking">Booking Issue</option>
                <option value="defective">Defective Product</option>
                <option value="account">Account Issue</option>
                <option value="complaint">Complaint</option>
              </select>
              <textarea
                placeholder="Describe your issue..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                rows={2}
                className="w-full text-xs font-medium bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 rounded-lg px-3 py-2 mb-2 outline-none focus:border-[#2563EB] text-[#0F172A] dark:text-white resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={submitTicket}
                  disabled={!ticketForm.subject.trim()}
                  className="flex-1 bg-[#2563EB] text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  Submit Ticket
                </button>
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="px-3 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 dark:border-white/10 px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-sm font-medium bg-gray-100 dark:bg-white/5 border-0 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#2563EB]/30 text-[#0F172A] dark:text-white placeholder-gray-400"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-[#2563EB] text-white rounded-xl flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
