import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { MessageSquare, X, Send, Bot, Headphones, ExternalLink, User, Phone, Video } from "lucide-react";
import { apiPost, apiGet } from "../../lib/api";

interface Message {
  role: "bot" | "user" | "agent";
  text: string;
  suggestions?: string[];
  escalate?: boolean;
}

const PAGE_LINKS: { pattern: RegExp; label: string; to: string }[] = [
  { pattern: /My Orders/gi, label: "My Orders", to: "/orders" },
  { pattern: /My Bookings/gi, label: "My Bookings", to: "/bookings" },
  { pattern: /Professional Dashboard/gi, label: "Professional Dashboard", to: "/professional/dashboard" },
  { pattern: /Vendor Dashboard/gi, label: "Vendor Dashboard", to: "/vendor/dashboard" },
  { pattern: /browse professionals/gi, label: "browse professionals", to: "/professionals" },
  { pattern: /My Profile/gi, label: "My Profile", to: "/profile" },
  { pattern: /Settings/gi, label: "Settings", to: "/settings" },
  { pattern: /login page/gi, label: "login page", to: "/login" },
];

function renderBotText(text: string) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        let lineContent: React.ReactNode[] = [];
        let remaining = line;
        let key = 0;

        for (const link of PAGE_LINKS) {
          link.pattern.lastIndex = 0;
          const match = link.pattern.exec(remaining);
          if (match) {
            const before = remaining.slice(0, match.index);
            const after = remaining.slice(match.index + match[0].length);
            if (before) lineContent.push(before);
            lineContent.push(
              <Link key={key++} to={link.to} className="text-[#2563EB] dark:text-blue-400 font-bold underline underline-offset-2 hover:text-blue-600 dark:hover:text-blue-300 inline-flex items-center gap-0.5">
                {match[0]} <ExternalLink className="w-3 h-3" />
              </Link>
            );
            remaining = after;
          }
        }
        if (lineContent.length === 0) lineContent.push(remaining);

        return (
          <span key={i}>
            {i > 0 && <br />}
            {lineContent}
          </span>
        );
      })}
    </>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"bot" | "live">("bot");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hello! I'm the FixKart support assistant. I can help with orders, returns, bookings, payments, and more. What can I help you with?",
      suggestions: ["Track my order", "I want a refund", "Connect to support", "Account help"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Poll for agent messages when in live mode
  useEffect(() => {
    if (!sessionId || mode !== "live") return;
    setPolling(true);

    const interval = setInterval(async () => {
      try {
        const data = await apiGet<{ messages: any[] }>(`/support/chat/${sessionId}/messages`);
        const agentMsgs = (data.messages || []).filter((m: any) => m.sender_role === "agent");
        if (agentMsgs.length > 0) {
          setMessages(prev => {
            const existingBotMsgs = prev.filter(m => m.role !== "agent");
            const agentMsgsFormatted: Message[] = agentMsgs.map((m: any) => ({
              role: "agent" as const,
              text: m.message,
            }));
            // Only add new ones
            const lastBotMsg = existingBotMsgs[existingBotMsgs.length - 1];
            const combined = [...existingBotMsgs, ...agentMsgsFormatted];
            return combined;
          });
        }
      } catch {
        // Ignore polling errors
      }
    }, 2000);

    return () => { clearInterval(interval); setPolling(false); };
  }, [sessionId, mode]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // If in live mode, send to chat session
    if (mode === "live" && sessionId) {
      try {
        await apiPost("/support/chat/message", { session_id: sessionId, message: text.trim() });
      } catch {
        // Silently fail — polling will pick up agent responses
      }
      return;
    }

    // Bot mode — process through chatbot
    setLoading(true);
    try {
      const data = await apiPost<{ reply: string; category: string; escalate: boolean; suggestions: string[] }>(
        "/support/chatbot",
        { message: text.trim() }
      );

      if (data.escalate) {
        // Show connect button
        setMessages(prev => [
          ...prev,
          {
            role: "bot",
            text: data.reply,
            suggestions: ["Connect to support"],
            escalate: true,
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: "bot",
            text: data.reply,
            suggestions: data.suggestions || [],
          },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again or email support@fixkart.dev" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const connectToSupport = async () => {
    setLoading(true);
    setMessages(prev => [
      ...prev,
      { role: "user", text: "Connect to support" },
      { role: "bot", text: "Connecting you to our support team..." },
    ]);

    try {
      const data = await apiPost<{ session: any }>("/support/chat/session", {
        message: "Customer connected via chatbot",
      });
      const session = data.session;
      setSessionId(session.id);
      setMode("live");
      setMessages(prev => [
        ...prev,
        {
          role: "agent",
          text: "You're now connected to FixKart Support. A team member will respond shortly. You can describe your issue here.",
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "bot",
          text: "Couldn't connect to live support right now. Please email support@fixkart.dev or try again later.",
          suggestions: ["Try again", "Email support"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (text: string) => {
    if (text === "Connect to support" || text === "Connect to support") {
      connectToSupport();
    } else if (text === "Email support") {
      window.open("mailto:support@fixkart.dev", "_blank");
    } else if (text === "Try again") {
      connectToSupport();
    } else {
      sendMessage(text);
    }
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
          <div className={`${mode === "live" ? "bg-[#16A34A]" : "bg-[#2563EB]"} text-white px-5 py-4 flex items-center gap-3`}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              {mode === "live" ? <Headphones className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-sm">
                {mode === "live" ? "Live Support" : "FixKart Support"}
              </p>
              <p className="text-xs text-white/70">
                {mode === "live" ? (polling ? "Agent is online" : "Connecting...") : "Instant replies"}
              </p>
            </div>
            {mode === "live" && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              </div>
            )}
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%]`}>
                  {msg.role === "bot" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">Support Bot</span>
                    </div>
                  )}
                  {msg.role === "agent" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 bg-[#16A34A] rounded-full flex items-center justify-center">
                        <Headphones className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">Support Agent</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-[#2563EB] text-white rounded-br-md"
                        : msg.role === "agent"
                        ? "bg-[#16A34A]/10 dark:bg-[#16A34A]/5 text-[#0F172A] dark:text-white rounded-bl-md border border-[#16A34A]/20 dark:border-[#16A34A]/10"
                        : "bg-gray-100 dark:bg-white/5 text-[#0F172A] dark:text-white rounded-bl-md border border-gray-100 dark:border-white/10"
                    }`}
                  >
                    {msg.role === "bot" ? renderBotText(msg.text) : msg.text}
                  </div>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestions.map((s, j) => (
                        <button
                          key={j}
                          onClick={() => handleSuggestion(s)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
                            s === "Connect to support"
                              ? "text-white bg-[#16A34A] hover:bg-green-600"
                              : "text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                          }`}
                        >
                          {s === "Connect to support" ? "🎧 Connect to support" : s}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.escalate && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>This needs human support</span>
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
                placeholder={mode === "live" ? "Type your message..." : "Ask a question..."}
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
            {mode === "live" && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => { setMode("bot"); setSessionId(null); setMessages([{
                    role: "bot",
                    text: "Chat ended. You can start a new conversation anytime.",
                    suggestions: ["Track my order", "I want a refund", "Connect to support"],
                  }]); }}
                  className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  End chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
