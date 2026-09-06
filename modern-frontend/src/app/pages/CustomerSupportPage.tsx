import { useEffect, useState } from "react";
import {
  Headphones,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  Tag,
  ArrowLeft,
  Loader2,
  BarChart3,
  TrendingUp,
  Inbox,
  RefreshCw,
  X,
  Send,
  Eye,
  UserCircle,
} from "lucide-react";
import { apiGet, apiPatch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "../components/PageHeader";
import { Link } from "react-router";

const CARD = "bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm";

const STATUS_BADGE: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  in_review: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  waiting_response: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  resolved: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400",
};

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400",
  normal: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

const CATEGORIES = ["all", "general", "refund", "returns", "payment", "booking", "defective", "account", "verification", "complaint", "technical"];

export default function CustomerSupportPage() {
  const { isLoggedIn, user, isAdmin } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"tickets" | "stats">("tickets");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [ticketData, statsData] = await Promise.allSettled([
        apiGet<any>("/support/admin/tickets"),
        apiGet<any>("/support/admin/stats"),
      ]);

      if (ticketData.status === "fulfilled") {
        setTickets(ticketData.value.tickets || []);
      }
      if (statsData.status === "fulfilled") {
        setStats(statsData.value);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load support data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) load();
  }, [isLoggedIn]);

  const updateTicket = async (id: string, updates: any) => {
    try {
      await apiPatch(`/support/admin/tickets/${id}`, updates);
      await load();
      if (selectedTicket?.id === id) {
        setSelectedTicket({ ...selectedTicket, ...updates });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = tickets.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.subject?.toLowerCase().includes(q) ||
        t.ticket_id?.toLowerCase().includes(q) ||
        t.profile?.full_name?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!isLoggedIn) {
    return (
      <>
        <PageHeader eyebrow="Support" title="Customer Support" subtitle="Manage support tickets" />
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

  const statCards = stats?.stats || {};
  const categoryBreakdown = stats?.by_category || {};

  return (
    <>
      <PageHeader eyebrow="FixKart Support" title="Customer Support Dashboard" subtitle="Manage tickets, help customers, resolve issues" />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {error && (
            <div className="mb-5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total Tickets" value={String(statCards.total ?? tickets.length)} icon={<Inbox className="w-4 h-4" style={{ color: "#2563EB" }} />} color="#2563EB" />
            <StatCard label="Open" value={String(statCards.open ?? 0)} icon={<MessageSquare className="w-4 h-4" style={{ color: "#F59E0B" }} />} color="#F59E0B" />
            <StatCard label="In Review" value={String(statCards.in_review ?? 0)} icon={<Eye className="w-4 h-4" style={{ color: "#7C3AED" }} />} color="#7C3AED" />
            <StatCard label="Waiting" value={String(statCards.waiting_response ?? 0)} icon={<Clock className="w-4 h-4" style={{ color: "#D97706" }} />} color="#D97706" />
            <StatCard label="Resolved" value={String(statCards.resolved ?? 0)} icon={<CheckCircle2 className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[{ key: "tickets" as const, label: "Tickets", icon: <Inbox className="w-4 h-4" /> }, { key: "stats" as const, label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> }].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]"
                    : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white/10 hover:border-gray-200"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "tickets" ? (
            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
              {/* Ticket list */}
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tickets..."
                      className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-sm font-medium pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-[#2563EB] text-[#0F172A] dark:text-white"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-xs font-bold px-3 py-2.5 rounded-xl outline-none text-[#0F172A] dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_review">In Review</option>
                    <option value="waiting_response">Waiting Response</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-xs font-bold px-3 py-2.5 rounded-xl outline-none text-[#0F172A] dark:text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Ticket list */}
                {loading ? (
                  <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
                ) : filtered.length === 0 ? (
                  <div className={`${CARD} py-16 text-center`}>
                    <Inbox className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
                    <p className="font-extrabold text-[#0F172A] dark:text-white">No tickets found</p>
                    <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Tickets from customers will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filtered.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full text-left ${CARD} hover:shadow-md transition-shadow cursor-pointer ${selectedTicket?.id === ticket.id ? "ring-2 ring-[#2563EB]" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-400">{ticket.ticket_id}</p>
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[ticket.status] || STATUS_BADGE.open}`}>
                                {ticket.status?.replace("_", " ")}
                              </span>
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${PRIORITY_BADGE[ticket.priority] || PRIORITY_BADGE.normal}`}>
                                {ticket.priority}
                              </span>
                            </div>
                            <p className="font-extrabold text-[#0F172A] dark:text-white text-sm line-clamp-1">{ticket.subject}</p>
                            <div className="flex items-center gap-3 mt-1">
                              {ticket.profile?.full_name && (
                                <p className="text-xs text-[#64748B] dark:text-slate-400 flex items-center gap-1">
                                  <User className="w-3 h-3" /> {ticket.profile.full_name}
                                </p>
                              )}
                              <p className="text-xs text-[#64748B] dark:text-slate-400 flex items-center gap-1">
                                <Tag className="w-3 h-3" /> {ticket.category}
                              </p>
                              <p className="text-xs text-[#64748B] dark:text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(ticket.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 flex-shrink-0 mt-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ticket detail panel */}
              <div className="lg:sticky lg:top-24 h-fit">
                {selectedTicket ? (
                  <TicketDetail ticket={selectedTicket} onUpdate={updateTicket} />
                ) : (
                  <div className={`${CARD} py-16 text-center`}>
                    <Headphones className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
                    <p className="font-extrabold text-[#0F172A] dark:text-white">Select a ticket</p>
                    <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Click a ticket to view details and respond.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Analytics Tab */
            <AnalyticsTab stats={stats} />
          )}
        </div>
      </section>
    </>
  );
}

/* ─── Ticket Detail Panel ──────────────────────────────────────────────── */

function TicketDetail({ ticket, onUpdate }: { ticket: any; onUpdate: (id: string, updates: any) => void }) {
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRespond = async () => {
    if (!response.trim()) return;
    setSubmitting(true);
    await onUpdate(ticket.id, {
      status: "in_review",
      agent_response: response.trim(),
    });
    setResponse("");
    setSubmitting(false);
  };

  return (
    <div className={`${CARD} space-y-4`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">Ticket Details</h3>
        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[ticket.status] || STATUS_BADGE.open}`}>
          {ticket.status?.replace("_", " ")}
        </span>
      </div>

      <div className="space-y-3">
        <InfoRow label="Ticket ID" value={ticket.ticket_id} />
        <InfoRow label="Subject" value={ticket.subject} />
        <InfoRow label="Category" value={<span className="capitalize">{ticket.category}</span>} />
        <InfoRow label="Priority" value={<span className={`capitalize font-bold ${ticket.priority === "urgent" ? "text-red-500" : ticket.priority === "high" ? "text-amber-600" : ""}`}>{ticket.priority}</span>} />
        <InfoRow label="Created" value={new Date(ticket.created_at).toLocaleString()} />
      </div>

      {/* Customer info */}
      <div className="border-t border-gray-100 dark:border-white/10 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 mb-2">Customer</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white">{ticket.profile?.full_name || "Customer"}</p>
            {ticket.profile?.phone && <p className="text-xs text-[#64748B] dark:text-slate-400">{ticket.profile.phone}</p>}
          </div>
        </div>
      </div>

      {/* Description */}
      {ticket.description && (
        <div className="border-t border-gray-100 dark:border-white/10 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 mb-1">Description</p>
          <p className="text-sm text-[#0F172A] dark:text-white whitespace-pre-line">{ticket.description}</p>
        </div>
      )}

      {/* Previous response */}
      {ticket.agent_response && (
        <div className="border-t border-gray-100 dark:border-white/10 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 mb-1">Agent Response</p>
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl px-4 py-3 text-sm text-[#0F172A] dark:text-white whitespace-pre-line">{ticket.agent_response}</div>
        </div>
      )}

      {/* Action buttons */}
      <div className="border-t border-gray-100 dark:border-white/10 pt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {ticket.status !== "resolved" && (
            <>
              <button onClick={() => onUpdate(ticket.id, { status: "in_review" })} className="flex items-center gap-1.5 text-[11px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-2 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">
                <Eye className="w-3.5 h-3.5" /> Mark In Review
              </button>
              <button onClick={() => onUpdate(ticket.id, { status: "waiting_response" })} className="flex items-center gap-1.5 text-[11px] font-bold bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 px-3 py-2 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors">
                <Clock className="w-3.5 h-3.5" /> Waiting Response
              </button>
              <button onClick={() => onUpdate(ticket.id, { status: "resolved" })} className="flex items-center gap-1.5 text-[11px] font-bold bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-2 rounded-xl hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
              </button>
            </>
          )}
        </div>

        {/* Response form */}
        <div>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response..."
            rows={3}
            className="w-full bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-white/15 text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] text-[#0F172A] dark:text-white resize-none"
          />
          <button
            onClick={handleRespond}
            disabled={!response.trim() || submitting}
            className="mt-2 flex items-center gap-2 bg-[#2563EB] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send Response
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Analytics Tab ──────────────────────────────────────────────────── */

function AnalyticsTab({ stats }: { stats: any }) {
  const categoryBreakdown = stats?.by_category || {};
  const priorityBreakdown = stats?.by_priority || {};
  const statCards = stats?.stats || {};

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Avg Resolution Time" value={`${statCards.avg_resolution_hours ?? 0}h`} icon={<Clock className="w-4 h-4" style={{ color: "#7C3AED" }} />} color="#7C3AED" />
        <StatCard label="Resolution Rate" value={`${statCards.total ? Math.round(((statCards.resolved ?? 0) / statCards.total) * 100) : 0}%`} icon={<TrendingUp className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" />
        <StatCard label="Open Tickets" value={String(statCards.open ?? 0)} icon={<Inbox className="w-4 h-4" style={{ color: "#F59E0B" }} />} color="#F59E0B" subtitle="Needs attention" />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* By Category */}
        <div className={CARD}>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">By Category</h3>
          {Object.keys(categoryBreakdown).length === 0 ? (
            <p className="text-sm text-[#64748B] dark:text-slate-400 py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([, a]: any, [, b]: any) => b - a)
                .map(([cat, count]: any) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white capitalize">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${Math.min(100, (count / Math.max(...Object.values(categoryBreakdown) as number[])) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* By Priority */}
        <div className={CARD}>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">By Priority</h3>
          {Object.keys(priorityBreakdown).length === 0 ? (
            <p className="text-sm text-[#64748B] dark:text-slate-400 py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(priorityBreakdown).map(([pri, count]: any) => (
                <div key={pri} className="flex items-center justify-between">
                  <span className={`text-xs font-bold capitalize ${pri === "urgent" ? "text-red-500" : pri === "high" ? "text-amber-600" : "text-[#0F172A] dark:text-white"}`}>{pri}</span>
                  <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Components ──────────────────────────────────────────────── */

function StatCard({ label, value, icon, color = "#2563EB", subtitle }: {
  label: string; value: string; icon: React.ReactNode; color?: string; subtitle?: string;
}) {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>{icon}</div>
      </div>
      <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{value}</p>
      {subtitle && <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">{label}</p>
      <p className="text-sm font-medium text-[#0F172A] dark:text-white mt-0.5">{value}</p>
    </div>
  );
}
