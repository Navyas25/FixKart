import { useEffect, useState, useRef } from "react";
import {
  Headphones,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  Search,
  ChevronRight,
  Calendar,
  Loader2,
  Send,
  X,
  Inbox,
  Circle,
  UserCircle,
} from "lucide-react";
import { apiGet, apiPatch, apiPost } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "../components/PageHeader";
import { Link } from "react-router";

const CARD = "bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm";

const STATUS_COLORS: Record<string, string> = {
  waiting: "text-amber-500",
  active: "text-green-500",
  closed: "text-gray-400",
};

export default function CustomerSupportPage() {
  const { isLoggedIn, isAdmin } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ sessions: any[] }>("/support/admin/sessions");
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) load();
  }, [isLoggedIn]);

  // Load messages when session is selected
  useEffect(() => {
    if (!selectedSession?.id || selectedSession.id.startsWith("mock-")) return;

    const loadMessages = async () => {
      try {
        const data = await apiGet<{ messages: any[] }>(`/support/chat/${selectedSession.id}/messages`);
        setChatMessages(data.messages || []);
      } catch {
        // Session might be mock
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedSession?.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const sendAgentMessage = async () => {
    if (!chatInput.trim() || !selectedSession) return;
    setSending(true);
    try {
      await apiPost("/support/chat/message", {
        session_id: selectedSession.id,
        message: chatInput.trim(),
      });
      setChatInput("");
      // Reload messages
      const data = await apiGet<{ messages: any[] }>(`/support/chat/${selectedSession.id}/messages`);
      setChatMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const updateSessionStatus = async (id: string, status: string) => {
    try {
      await apiPatch(`/support/admin/sessions/${id}`, { status });
      await load();
      if (selectedSession?.id === id) {
        setSelectedSession({ ...selectedSession, status });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = sessions.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.guest_name?.toLowerCase().includes(q) ||
        s.id?.toLowerCase().includes(q) ||
        s.last_message?.message?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeSessions = filtered.filter((s) => s.status === "active");
  const waitingSessions = filtered.filter((s) => s.status === "waiting");
  const closedSessions = filtered.filter((s) => s.status === "closed");
  const totalActive = activeSessions.length + waitingSessions.length;

  if (!isLoggedIn) {
    return (
      <>
        <PageHeader eyebrow="Support" title="Customer Support" subtitle="Live chat support dashboard" />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <Headphones className="w-10 h-10 text-[#F59E0B] mx-auto mb-3" />
            <p className="text-[#64748B] dark:text-slate-400 mb-6">Sign in to access the support dashboard.</p>
            <Link to="/login?next=/support" className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors">Sign In</Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="FixKart Support" title="Customer Support" subtitle="Live chat with customers in real-time" />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {error && (
            <div className="mb-5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={CARD + " flex items-center gap-3"}>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{waitingSessions.length}</p>
                <p className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase">Waiting</p>
              </div>
            </div>
            <div className={CARD + " flex items-center gap-3"}>
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{activeSessions.length}</p>
                <p className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase">Active</p>
              </div>
            </div>
            <div className={CARD + " flex items-center gap-3"}>
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{closedSessions.length}</p>
                <p className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase">Closed</p>
              </div>
            </div>
          </div>

          {/* Main layout */}
          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
            {/* Session list */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sessions..."
                  className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-sm font-medium pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-[#2563EB] text-[#0F172A] dark:text-white"
                />
              </div>

              {loading ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
              ) : filtered.length === 0 ? (
                <div className={`${CARD} py-12 text-center`}>
                  <Inbox className="w-8 h-8 text-[#64748B] dark:text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#64748B] dark:text-slate-400">No active sessions</p>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Customers will appear here when they start a chat</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-[500px] overflow-y-auto">
                  {/* Waiting first */}
                  {waitingSessions.map((s) => (
                    <SessionItem key={s.id} session={s} selected={selectedSession?.id === s.id} onClick={() => setSelectedSession(s)} onAccept={() => updateSessionStatus(s.id, "active")} />
                  ))}
                  {activeSessions.map((s) => (
                    <SessionItem key={s.id} session={s} selected={selectedSession?.id === s.id} onClick={() => setSelectedSession(s)} />
                  ))}
                  {closedSessions.length > 0 && (
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-wide px-2 pt-2">Closed</p>
                  )}
                  {closedSessions.map((s) => (
                    <SessionItem key={s.id} session={s} selected={selectedSession?.id === s.id} onClick={() => setSelectedSession(s)} />
                  ))}
                </div>
              )}
            </div>

            {/* Chat area */}
            <div className="lg:sticky lg:top-24 h-fit">
              {selectedSession ? (
                <div className={`${CARD} flex flex-col`} style={{ height: "520px" }}>
                  {/* Chat header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-[#0F172A] dark:text-white">{selectedSession.guest_name || "Customer"}</p>
                        <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-400">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${STATUS_COLORS[selectedSession.status] === "text-amber-500" ? "bg-amber-500" : STATUS_COLORS[selectedSession.status] === "text-green-500" ? "bg-green-500" : "bg-gray-400"}`} />
                          {selectedSession.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedSession.status === "waiting" && (
                        <button
                          onClick={() => updateSessionStatus(selectedSession.id, "active")}
                          className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors"
                        >
                          <Headphones className="w-3.5 h-3.5" /> Accept
                        </button>
                      )}
                      {selectedSession.status !== "closed" && (
                        <button
                          onClick={() => updateSessionStatus(selectedSession.id, "closed")}
                          className="flex items-center gap-1.5 border border-gray-200 dark:border-white/15 text-[#64748B] dark:text-slate-400 text-xs font-bold px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 dark:text-slate-500">No messages yet</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender_role === "agent" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%]`}>
                            {msg.sender_role !== "agent" && (
                              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1">{msg.sender_role === "customer" ? (selectedSession.guest_name || "Customer") : "System"}</p>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              msg.sender_role === "agent"
                                ? "bg-[#2563EB] text-white rounded-br-md"
                                : "bg-gray-100 dark:bg-white/5 text-[#0F172A] dark:text-white rounded-bl-md border border-gray-100 dark:border-white/10"
                            }`}>
                              {msg.message}
                            </div>
                            <p className="text-[9px] text-gray-400 dark:text-slate-600 mt-0.5">{new Date(msg.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Agent input */}
                  {selectedSession.status !== "closed" && (
                    <div className="border-t border-gray-100 dark:border-white/10 pt-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendAgentMessage()}
                          placeholder="Type your response..."
                          className="flex-1 text-sm font-medium bg-gray-100 dark:bg-white/5 border-0 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#2563EB]/30 text-[#0F172A] dark:text-white"
                          disabled={sending}
                        />
                        <button
                          onClick={sendAgentMessage}
                          disabled={!chatInput.trim() || sending}
                          className="w-10 h-10 bg-[#2563EB] text-white rounded-xl flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 transition-colors"
                        >
                          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`${CARD} py-16 text-center`}>
                  <Headphones className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
                  <p className="font-extrabold text-[#0F172A] dark:text-white">Select a conversation</p>
                  <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Click a session to start chatting with the customer.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Session List Item ──────────────────────────────────────────────── */

function SessionItem({ session, selected, onClick, onAccept }: {
  session: any;
  selected: boolean;
  onClick: () => void;
  onAccept?: () => void;
}) {
  const isWaiting = session.status === "waiting";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left ${CARD} hover:shadow-md transition-shadow cursor-pointer py-3 ${selected ? "ring-2 ring-[#2563EB]" : ""} ${isWaiting ? "border-l-4 border-l-amber-400" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${session.status === "waiting" ? "bg-amber-500 animate-pulse" : session.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
            <p className="text-sm font-extrabold text-[#0F172A] dark:text-white truncate">{session.guest_name || "Customer"}</p>
          </div>
          {session.last_message && (
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 truncate ml-4">
              {session.last_message.sender_role === "agent" ? "You: " : ""}{session.last_message.message}
            </p>
          )}
          <p className="text-[10px] text-[#64748B] dark:text-slate-500 ml-4 mt-0.5">
            {new Date(session.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
          </p>
        </div>
        {isWaiting && onAccept ? (
          <button
            onClick={(e) => { e.stopPropagation(); onAccept(); }}
            className="bg-[#16A34A] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors flex-shrink-0"
          >
            Accept
          </button>
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 flex-shrink-0" />
        )}
      </div>
    </button>
  );
}
