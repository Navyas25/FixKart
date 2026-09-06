import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  UserCircle,
  LogOut,
  Loader2,
  Wrench,
  Check,
  X,
  Play,
  Upload,
  Star,
  IndianRupee,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Bell,
  MessageSquare,
  Settings,
  HelpCircle,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Phone,
  Mail,
  FileText,
  Award,
  Ban,
  CheckCircle2,
  Eye,
  Navigation,
  Clock3,
  Package,
  AlertTriangle,
} from "lucide-react";
import { apiGet, apiPost, apiPatch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "../components/PageHeader";

type Tab =
  | "dashboard"
  | "requests"
  | "calendar"
  | "bookings"
  | "earnings"
  | "fixcoins"
  | "availability"
  | "services"
  | "profile"
  | "reviews"
  | "notifications"
  | "support"
  | "settings"
  | "verification";

const VERIFICATION_META: Record<string, { label: string; badge: string; note: string }> = {
  pending: {
    label: "Pending Verification",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    note: "Your application is under review. You'll be able to accept jobs once verified.",
  },
  verified: {
    label: "Verified",
    badge: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    note: "You're verified and can accept jobs.",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    note: "Your application was not approved. Please update your details or contact support.",
  },
  suspended: {
    label: "Suspended",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    note: "Your account is suspended. Contact support for more information.",
  },
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  in_progress: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400",
};

const inputClass =
  "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

const CARD =
  "bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm";

const SERVICES_LIST = [
  "Plumbing", "Electrical", "Carpentry", "AC Repair", "Appliance Repair",
  "Painting", "Roofing", "Flooring", "Tiling", "Welding",
];

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ProfessionalDashboardPage() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [confirmLogout, setConfirmLogout] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      await apiGet("/professionals/me/dashboard");
    } catch (err: any) {
      setError(err.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    logout();
    navigate("/");
  };

  if (!isLoggedIn) {
    return (
      <>
        <PageHeader eyebrow="FixKart Pro" title="Professional Dashboard" subtitle="Manage your jobs and earnings" />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <Wrench className="w-10 h-10 text-[#F59E0B] mx-auto mb-3" />
            <p className="text-[#64748B] dark:text-slate-400 mb-6">
              Sign in to your professional account to manage jobs and earnings.
            </p>
            <Link
              to="/login?next=/professional/dashboard"
              className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
            >
              Professional Sign In
            </Link>
          </div>
        </section>
      </>
    );
  }

  const [isOnline, setIsOnline] = useState(true);

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "requests", label: "Job Requests", icon: <Bell className="w-4 h-4" /> },
    { key: "calendar", label: "Calendar", icon: <Calendar className="w-4 h-4" /> },
    { key: "bookings", label: "Bookings", icon: <CalendarCheck className="w-4 h-4" /> },
    { key: "earnings", label: "Earnings", icon: <DollarSign className="w-4 h-4" /> },
    { key: "fixcoins", label: "FixCoins", icon: <Award className="w-4 h-4" /> },
    { key: "services", label: "My Services", icon: <Briefcase className="w-4 h-4" /> },
    { key: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
    { key: "profile", label: "Profile", icon: <UserCircle className="w-4 h-4" /> },
    { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { key: "support", label: "Support", icon: <HelpCircle className="w-4 h-4" /> },
    { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="FixKart Pro"
        title="Professional Dashboard"
        subtitle={user?.email || "Manage your jobs, earnings and profile"}
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/10 p-4 shadow-sm">
              <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-gray-100 dark:border-white/10 mb-3">
                <div className="w-9 h-9 bg-[#F59E0B] rounded-xl flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-extrabold text-[#0F172A] dark:text-white text-sm leading-tight">
                    FixKart <span className="text-[#F59E0B]">Pro</span>
                  </p>
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400 font-semibold">
                    Professional portal
                  </p>
                </div>
              </div>
              <nav className="space-y-0.5">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { setTab(item.key); setSaveMsg(""); setError(""); }}
                    className={`w-full flex items-center gap-2.5 text-sm font-bold px-3 py-2.5 rounded-xl transition-colors ${
                      tab === item.key
                        ? "bg-[#2563EB] text-white"
                        : "text-[#64748B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 space-y-2">
                {/* Online Status Indicator */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-[#16A34A] animate-pulse" : "bg-gray-400"}`} />
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white">{isOnline ? "ONLINE" : "OFFLINE"}</span>
                  </div>
                  <button
                    onClick={() => setIsOnline(!isOnline)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isOnline ? "bg-[#16A34A]" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isOnline ? "left-[calc(100%-18px)]" : "left-0.5"}`} />
                  </button>
                </div>
                <p className="px-3 text-[10px] font-semibold text-[#64748B] dark:text-slate-400">
                  {isOnline ? "Accepting Jobs" : "Not accepting jobs"}
                </p>
                {confirmLogout ? (
                  <div className="space-y-1.5">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-red-500 transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Confirm logout
                    </button>
                    <button onClick={() => setConfirmLogout(false)} className="w-full text-xs font-bold text-[#64748B] dark:text-slate-400 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 text-sm font-bold text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div>
            {error && (
              <div className="mb-5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            {saveMsg && (
              <div className="mb-5 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 rounded-xl px-4 py-3 flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" /> {saveMsg}
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                <div className="h-28 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
                <div className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
              </div>
            ) : (
              <>
                {tab === "dashboard" && <DashboardTab setError={setError} />}
                {tab === "requests" && <RequestsTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "calendar" && <CalendarTab setError={setError} />}
                {tab === "bookings" && <BookingsTab setError={setError} />}
                {tab === "earnings" && <EarningsTab setError={setError} />}
                {tab === "fixcoins" && <FixCoinsTab setError={setError} />}
                {tab === "availability" && <AvailabilityTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "services" && <ServicesTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "profile" && <ProfileTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "reviews" && <ReviewsTab setError={setError} />}
                {tab === "notifications" && <NotificationsTab />}
                {tab === "verification" && <VerificationTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "support" && <SupportTab />}
                {tab === "settings" && <SettingsTab setError={setError} setSaveMsg={setSaveMsg} />}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SHARED COMPONENTS                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */

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

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function BookingCard({ booking, onRespond, onStatus, onDetail }: {
  booking: any;
  onRespond?: (id: string, action: "accept" | "reject") => void;
  onStatus?: (id: string, status: string) => void;
  onDetail?: (booking: any) => void;
}) {
  const statusBadge = STATUS_BADGE[booking.status] || STATUS_BADGE.pending;
  const date = booking.scheduled_at
    ? new Date(booking.scheduled_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Not scheduled";

  const nextStatus: Record<string, string> = {
    confirmed: "in_progress",
    in_progress: "completed",
  };

  return (
    <div className="border border-gray-100 dark:border-white/10 rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <p className="font-extrabold text-[#0F172A] dark:text-white text-sm">
              {booking.service?.name || "Service booking"}
            </p>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${statusBadge}`}>
              {booking.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {date}
          </p>
          {booking.customer && (
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 flex items-center gap-1">
              <UserCircle className="w-3 h-3" />
              <span className="font-bold text-[#0F172A] dark:text-white">{booking.customer.full_name || "Customer"}</span>
              {booking.customer.phone && <span>· {booking.customer.phone}</span>}
            </p>
          )}
          {booking.address && (
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {booking.address}
            </p>
          )}
          {booking.notes && (
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 line-clamp-2 italic">"{booking.notes}"</p>
          )}
          {booking.service?.base_price != null && (
            <p className="text-xs font-bold text-[#16A34A] mt-1.5 flex items-center gap-1">
              <IndianRupee className="w-3 h-3" /> ₹{booking.service.base_price}
              {booking.service?.estimated_duration && <span className="text-[#64748B] dark:text-slate-400 font-normal">· {booking.service.estimated_duration}</span>}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {onRespond && booking.status === "pending" && (
            <>
              <button onClick={() => onRespond(booking.id, "accept")} className="flex items-center justify-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors">
                <Check className="w-3.5 h-3.5" /> Accept
              </button>
              <button onClick={() => onRespond(booking.id, "reject")} className="flex items-center justify-center gap-1.5 border border-red-200 dark:border-red-500/30 text-red-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}
          {onStatus && nextStatus[booking.status] && (
            <button onClick={() => onStatus(booking.id, nextStatus[booking.status])} className="flex items-center justify-center gap-1.5 bg-[#7C3AED] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-violet-600 transition-colors">
              {booking.status === "confirmed" ? <Play className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              {booking.status === "confirmed" ? "Start Job" : "Complete"}
            </button>
          )}
          {onDetail && (
            <button onClick={() => onDetail(booking)} className="flex items-center justify-center gap-1.5 border border-gray-200 dark:border-white/15 text-[#64748B] dark:text-slate-400 text-xs font-bold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <Eye className="w-3.5 h-3.5" /> Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 1: DASHBOARD / OVERVIEW                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

function DashboardTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/professionals/me/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = data?.stats || {};
  const pro = data?.professional || {};
  const meta = VERIFICATION_META[pro.verification_status] || VERIFICATION_META.pending;

  return (
    <div className="space-y-6">
      {/* Verification Banner */}
      {pro.verification_status !== "verified" && (
        <div className={`rounded-2xl p-5 border ${
          pro.verification_status === "pending"
            ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
            : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
        }`}>
          <div className="flex items-center gap-3">
            {pro.verification_status === "pending" ? <Clock className="w-6 h-6 text-amber-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
            <div>
              <h3 className={`font-bold ${pro.verification_status === "pending" ? "text-amber-800 dark:text-amber-400" : "text-red-800 dark:text-red-400"}`}>
                {meta.label}
              </h3>
              <p className={`text-sm ${pro.verification_status === "pending" ? "text-amber-700 dark:text-amber-400/80" : "text-red-700 dark:text-red-400/80"}`}>
                {meta.note}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Bookings" value={String(stats.today_bookings ?? 0)} icon={<CalendarCheck className="w-4 h-4" style={{ color: "#2563EB" }} />} color="#2563EB" />
        <StatCard label="Pending Requests" value={String(stats.pending_requests ?? 0)} icon={<Bell className="w-4 h-4" style={{ color: "#D97706" }} />} color="#D97706" subtitle="Awaiting your response" />
        <StatCard label="Completed Jobs" value={String(stats.completed_jobs ?? 0)} icon={<Check className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" />          <StatCard label="Total Earnings" value={`₹${stats.total_earnings ?? 0}`} icon={<IndianRupee className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" subtitle={`This month: ₹${stats.this_month_earnings ?? 0}`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Upcoming" value={String(stats.upcoming_jobs ?? 0)} icon={<Clock className="w-4 h-4" style={{ color: "#7C3AED" }} />} color="#7C3AED" />
        <StatCard label="Rating" value={Number(stats.rating ?? 0).toFixed(1)} icon={<Star className="w-4 h-4" style={{ color: "#F59E0B" }} />} color="#F59E0B" subtitle={`${stats.review_count ?? 0} reviews`} />
        <StatCard label="Total Jobs" value={String(stats.total_jobs ?? 0)} icon={<Briefcase className="w-4 h-4" style={{ color: "#06B6D4" }} />} color="#06B6D4" />
        <StatCard label="Net Earnings" value={`₹${stats.available_balance ?? 0}`} icon={<TrendingUp className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" subtitle="After 5% commission" />
      </div>

      {/* Recent Bookings */}
      <div className={CARD}>
        <SectionHeader title="Recent Bookings" subtitle={`${data?.recent_bookings?.length || 0} recent`} />
        {!data?.recent_bookings?.length ? (
          <p className="text-sm text-[#64748B] dark:text-slate-400 py-8 text-center">No bookings yet. Job requests will appear here.</p>
        ) : (
          <div className="space-y-3">
            {data.recent_bookings.map((b: any) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Rating */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className={CARD}>
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 mb-2">Rating</p>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-3xl font-extrabold text-[#0F172A] dark:text-white">{Number(stats.rating ?? 0).toFixed(1)}</span>
            <span className="text-sm text-[#64748B] dark:text-slate-400">/ 5</span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{stats.review_count ?? 0} customer reviews</p>
        </div>
        <div className={CARD}>
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 mb-2">Service Areas</p>
          <div className="flex flex-wrap gap-1.5">
            {pro.service_locations?.length ? pro.service_locations.map((loc: string) => (
              <span key={loc} className="text-xs font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded-full">{loc}</span>
            )) : <span className="text-xs text-[#64748B]">Not set</span>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {pro.service_categories?.length ? pro.service_categories.map((cat: string) => (
              <span key={cat} className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full">{cat}</span>
            )) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 2: JOB REQUESTS                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

function RequestsTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailBooking, setDetailBooking] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/professionals/me/bookings?status=pending");
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const respond = async (id: string, action: "accept" | "reject") => {
    try {
      await apiPatch(`/bookings/${id}/respond`, { action });
      setSaveMsg(action === "accept" ? "Booking accepted!" : "Booking rejected.");
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Job Requests" subtitle={`${bookings.length} pending requests`} />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <Bell className="w-10 h-10 text-[#16A34A] mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No pending requests</p>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">New job requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} onRespond={respond} onDetail={setDetailBooking} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detailBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailBooking(null)}>
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white">Job Details</h3>
              <button onClick={() => setDetailBooking(null)} className="text-[#64748B] hover:text-[#0F172A]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <InfoRow label="Service" value={detailBooking.service?.name || "Service"} />
              <InfoRow label="Status" value={<span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[detailBooking.status]}`}>{detailBooking.status.replace("_", " ")}</span>} />
              <InfoRow label="Customer" value={detailBooking.customer?.full_name || "Customer"} />
              <InfoRow label="Phone" value={detailBooking.customer?.phone || "Not provided"} />
              <InfoRow label="Date" value={detailBooking.scheduled_at ? new Date(detailBooking.scheduled_at).toLocaleString() : "Not scheduled"} />
              <InfoRow label="Address" value={detailBooking.address || "Not provided"} />
              <InfoRow label="Price" value={`₹${detailBooking.service?.base_price || 0}`} />
              <InfoRow label="Duration" value={detailBooking.service?.estimated_duration || "Not specified"} />
              {detailBooking.notes && <InfoRow label="Notes" value={detailBooking.notes} />}
              {detailBooking.customer_notes && <InfoRow label="Customer Notes" value={detailBooking.customer_notes} />}
            </div>
            <div className="flex gap-3 mt-6">
              {detailBooking.status === "pending" && (
                <>
                  <button onClick={() => { respond(detailBooking.id, "accept"); setDetailBooking(null); }} className="flex-1 flex items-center justify-center gap-2 bg-[#16A34A] text-white font-bold text-sm py-3 rounded-xl hover:bg-green-600 transition-colors">
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button onClick={() => { respond(detailBooking.id, "reject"); setDetailBooking(null); }} className="flex-1 flex items-center justify-center gap-2 border border-red-200 dark:border-red-500/30 text-red-500 font-bold text-sm py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <X className="w-4 h-4" /> Reject
                  </button>
                </>
              )}
              {detailBooking.customer?.phone && (
                <a href={`tel:${detailBooking.customer.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] text-white font-bold text-sm py-3 rounded-xl hover:bg-blue-500 transition-colors">
                  <Phone className="w-4 h-4" /> Call Customer
                </a>
              )}
            </div>
          </div>
        </div>
      )}
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

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 3: BOOKINGS                                                          */
/* ═══════════════════════════════════════════════════════════════════════════ */

function BookingsTab({ setError }: { setError: (s: string) => void }) {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/professionals/me/bookings");
      setAllBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const respond = async (id: string, action: "accept" | "reject") => {
    try {
      await apiPatch(`/bookings/${id}/respond`, { action });
      await load();
    } catch (err: any) { setError(err.message); }
  };

  const setStatus = async (id: string, status: string) => {
    try {
      await apiPatch(`/bookings/${id}/status`, { status });
      await load();
    } catch (err: any) { setError(err.message); }
  };

  const filtered = filter ? allBookings.filter((b) => b.status === filter) : allBookings;
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, confirmed: 0, in_progress: 0, completed: 0, cancelled: 0 };
    allBookings.forEach((b) => { if (c[b.status] !== undefined) c[b.status]++; });
    return c;
  }, [allBookings]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Bookings" subtitle={`${allBookings.length} total`} />

      <div className="flex flex-wrap gap-2">
        {[{ k: "", l: "All" }, { k: "pending", l: "Pending" }, { k: "confirmed", l: "Confirmed" }, { k: "in_progress", l: "In Progress" }, { k: "completed", l: "Completed" }, { k: "cancelled", l: "Cancelled" }].map((f) => (
          <button key={f.k} onClick={() => setFilter(f.k)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
            filter === f.k ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]" : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white/10"
          }`}>
            {f.l} {f.k ? `(${statusCounts[f.k] || 0})` : `(${allBookings.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <CalendarCheck className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} onRespond={respond} onStatus={setStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 4: EARNINGS & PAYMENTS                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function EarningsTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/professionals/me/earnings")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>;

  const earnings = data?.earnings || {};
  const bank = data?.bank_details || {};

  return (
    <div className="space-y-6">
      <SectionHeader title="Earnings & Payments" subtitle="Track your income and payouts" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earnings" value={`₹${earnings.total ?? 0}`} icon={<IndianRupee className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" />
        <StatCard label="This Month" value={`₹${earnings.this_month ?? 0}`} icon={<TrendingUp className="w-4 h-4" style={{ color: "#2563EB" }} />} color="#2563EB" />
        <StatCard label="Pending Payment" value={`₹${earnings.pending_payment ?? 0}`} icon={<Clock className="w-4 h-4" style={{ color: "#D97706" }} />} color="#D97706" subtitle="Awaiting payout" />
        <StatCard label="Net Earnings" value={`₹${earnings.net_earnings ?? 0}`} icon={<Check className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" subtitle={`After ${earnings.commission ?? 0} commission`} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="Completed Jobs" value={String(earnings.completedJobs ?? 0)} icon={<Check className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" />
        <StatCard label="Cancelled Jobs" value={String(earnings.cancelledJobs ?? 0)} icon={<Ban className="w-4 h-4" style={{ color: "#EF4444" }} />} color="#EF4444" />
      </div>

      {/* Payout Info */}
      <div className={CARD}>
        <SectionHeader title="Payout Schedule" />
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/15 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">Weekly Payouts</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Earnings settled every Monday via bank transfer or UPI</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">5% Platform Commission</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">A 5% commission is deducted from each completed job</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className={CARD}>
        <SectionHeader title="Bank Details" />
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Bank Name" value={bank.bank_name || "Not set"} />
          <InfoRow label="Account Number" value={bank.bank_account_number ? `****${bank.bank_account_number.slice(-4)}` : "Not set"} />
          <InfoRow label="IFSC" value={bank.bank_ifsc || "Not set"} />
          <InfoRow label="UPI" value={bank.upi_id || "Not set"} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 5: AVAILABILITY & SCHEDULE                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

function AvailabilityTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [form, setForm] = useState({ availability: "", service_radius_km: "", max_jobs_per_day: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/professionals/me");
      setData(res);
      setForm({
        availability: res.professional?.availability || "",
        service_radius_km: String(res.professional?.service_radius_km ?? ""),
        max_jobs_per_day: String(res.professional?.max_jobs_per_day ?? ""),
      });
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleOnline = async () => {
    setToggling(true);
    try {
      const res = await apiPatch("/professionals/me/availability", { is_online: !data.professional?.is_online });
      setData((d: any) => ({ ...d, professional: { ...d.professional, is_online: res.is_online } }));
      setSaveMsg(res.message);
    } catch (err: any) { setError(err.message); }
    finally { setToggling(false); }
  };

  const saveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = { availability: form.availability };
      if (form.service_radius_km) body.service_radius_km = parseInt(form.service_radius_km, 10);
      if (form.max_jobs_per_day) body.max_jobs_per_day = parseInt(form.max_jobs_per_day, 10);
      await apiPatch("/professionals/me", body);
      setSaveMsg("Schedule updated.");
    } catch (err: any) { setError(err.message); }
  };

  if (loading) return <div className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />;

  const isOnline = data?.professional?.is_online ?? true;

  return (
    <div className="space-y-6">
      <SectionHeader title="Availability & Schedule" subtitle="Manage your working hours and online status" />

      {/* Online/Offline Toggle */}
      <div className={CARD}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOnline ? "bg-green-100 dark:bg-green-500/15" : "bg-gray-100 dark:bg-white/10"}`}>
              <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-[#16A34A] animate-pulse" : "bg-gray-400"}`} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0F172A] dark:text-white">
                {isOnline ? "You are Online" : "You are Offline"}
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isOnline ? "Customers can find and book you" : "You won't receive new requests"}
              </p>
            </div>
          </div>
          <button onClick={toggleOnline} disabled={toggling} className={`relative w-14 h-7 rounded-full transition-colors ${isOnline ? "bg-[#16A34A]" : "bg-gray-300 dark:bg-gray-600"}`}>
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isOnline ? "left-[calc(100%-26px)]" : "left-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Schedule Form */}
      <form onSubmit={saveSchedule} className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Working Hours</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Availability</label>
            <input type="text" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={inputClass} placeholder="e.g. Mon-Sat, 9 AM - 6 PM" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Service Radius (km)</label>
              <input type="number" min="1" max="100" value={form.service_radius_km} onChange={(e) => setForm({ ...form, service_radius_km: e.target.value })} className={inputClass} placeholder="e.g. 25" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Max Jobs Per Day</label>
              <input type="number" min="1" max="20" value={form.max_jobs_per_day} onChange={(e) => setForm({ ...form, max_jobs_per_day: e.target.value })} className={inputClass} placeholder="e.g. 5" />
            </div>
          </div>

          {/* Weekly Schedule */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-3 uppercase tracking-wide">Weekly Schedule</label>
            <div className="grid grid-cols-7 gap-1.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <button key={day} type="button" className="py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/15 text-[#64748B] dark:text-slate-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                  {day}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors">
            Save Schedule
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 6: SERVICES                                                          */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ServicesTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", base_price: "", description: "", estimated_duration: "" });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/professionals/me/services");
      setServices(data.services || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name || "", base_price: String(s.base_price || ""), description: s.description || "", estimated_duration: s.estimated_duration || "" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await apiPatch(`/professionals/me/services/${editing.id}`, {
        name: form.name, base_price: parseFloat(form.base_price), description: form.description, estimated_duration: form.estimated_duration,
      });
      setSaveMsg("Service updated.");
      setEditing(null);
      await load();
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Services" subtitle={`${services.length} services offered`} />

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : services.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <Briefcase className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No services yet</p>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Services you offer will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className={CARD}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-[#0F172A] dark:text-white text-sm">{s.name}</p>
                    {s.is_active === false && <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                    ₹{s.base_price} · {s.estimated_duration || "Duration TBD"}
                  </p>
                  {s.description && <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>}
                </div>
                <button onClick={() => startEdit(s)} className="text-xs font-bold text-[#2563EB] hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Service Types */}
      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-3">Available Service Types</h3>
        <div className="flex flex-wrap gap-2">
          {SERVICES_LIST.map((svc) => {
            const isOffered = services.some((s) => s.name?.toLowerCase() === svc.toLowerCase());
            return (
              <span key={svc} className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                isOffered ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-gray-100 dark:bg-white/10 text-[#64748B] dark:text-slate-400"
              }`}>
                {isOffered && "✓ "}{svc}
              </span>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white">Edit Service</h3>
              <button onClick={() => setEditing(null)} className="text-[#64748B] hover:text-[#0F172A]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Price (₹)</label>
                  <input type="number" step="0.01" min="0" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Duration</label>
                  <input type="text" value={form.estimated_duration} onChange={(e) => setForm({ ...form, estimated_duration: e.target.value })} className={inputClass} placeholder="e.g. 1-2 hours" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} rows={3} />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white font-bold text-sm py-3 rounded-xl hover:bg-blue-500 transition-colors">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 7: PROFILE                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ProfileTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/professionals/me");
      setData(res);
      setForm({
        bio: res.professional?.bio || "",
        experience_years: res.professional?.experience_years ?? 0,
        service_categories: res.professional?.service_categories?.join(", ") || "",
        service_locations: res.professional?.service_locations?.join(", ") || "",
        availability: res.professional?.availability || "",
        hourly_rate: res.professional?.hourly_rate ?? "",
        bank_account_number: res.professional?.bank_account_number || "",
        bank_ifsc: res.professional?.bank_ifsc || "",
        bank_name: res.professional?.bank_name || "",
        upi_id: res.professional?.upi_id || "",
      });
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: any = {
        bio: form.bio,
        experience_years: form.experience_years ? parseInt(form.experience_years, 10) : 0,
        availability: form.availability,
      };
      if (form.hourly_rate) body.hourly_rate = parseFloat(form.hourly_rate);
      if (form.service_categories.trim()) body.service_categories = form.service_categories.split(",").map((s: string) => s.trim()).filter(Boolean);
      if (form.service_locations.trim()) body.service_locations = form.service_locations.split(",").map((s: string) => s.trim()).filter(Boolean);

      // Bank details
      if (form.bank_account_number !== undefined) body.bank_account_number = form.bank_account_number || null;
      if (form.bank_ifsc !== undefined) body.bank_ifsc = form.bank_ifsc || null;
      if (form.bank_name !== undefined) body.bank_name = form.bank_name || null;
      if (form.upi_id !== undefined) body.upi_id = form.upi_id || null;

      await apiPatch("/professionals/me", body);
      setSaveMsg("Profile updated.");
      await load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "jpg", "jpeg", "png"].includes(ext)) { setError("Only PDF, JPG, JPEG or PNG accepted."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Document must be 2 MB or smaller."); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setError("");
        await apiPost("/professionals/document", {
          document_b64: String(reader.result || "").split(",")[1] || "",
          filename: file.name,
          mime: file.type,
        });
        setSaveMsg("Document uploaded for review.");
        await load();
      } catch (err: any) { setError(err.message || "Upload failed."); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (loading) return <div className="h-60 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />;

  const pro = data?.professional || {};
  const profile = data?.profile || {};

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className={CARD}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-2xl font-extrabold text-[#0F172A]">
            {profile.full_name?.slice(0, 1) || "?"}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white">{profile.full_name || "Professional"}</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">{data?.email || ""}</p>
            {profile.phone && <p className="text-xs text-[#64748B] dark:text-slate-400">{profile.phone}</p>}
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Bio & Experience */}
        <div className={CARD}>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Professional Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Short bio</label>
              <textarea value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className={inputClass} placeholder="Tell customers about your expertise..." />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Years of experience</label>
                <input type="number" min={0} max={60} value={form.experience_years ?? 0} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Hourly Rate (₹)</label>
                <input type="number" min="0" step="50" value={form.hourly_rate ?? ""} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} className={inputClass} placeholder="e.g. 500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Availability</label>
              <input type="text" value={form.availability || ""} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={inputClass} placeholder="e.g. Mon-Sat, 9 AM - 6 PM" />
            </div>
          </div>
        </div>

        {/* Skills & Locations */}
        <div className={CARD}>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Skills & Locations</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Service categories</label>
              <input type="text" value={form.service_categories || ""} onChange={(e) => setForm({ ...form, service_categories: e.target.value })} className={inputClass} placeholder="Plumbing, Electrical (comma separated)" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Service locations</label>
              <input type="text" value={form.service_locations || ""} onChange={(e) => setForm({ ...form, service_locations: e.target.value })} className={inputClass} placeholder="Bengaluru, Mysuru (comma separated)" />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className={CARD}>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Bank / Payment Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Bank Name</label>
              <input type="text" value={form.bank_name || ""} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className={inputClass} placeholder="e.g. HDFC Bank" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Account Number</label>
              <input type="text" value={form.bank_account_number || ""} onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">IFSC Code</label>
              <input type="text" value={form.bank_ifsc || ""} onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">UPI ID</label>
              <input type="text" value={form.upi_id || ""} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} className={inputClass} placeholder="e.g. name@upi" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Profile
        </button>
      </form>

      {/* Document Upload */}
      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-1">Verification Document</h3>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mb-4">
          {pro.id_document_url ? "Document on file — upload a new one to replace it." : "No document uploaded yet. Add your government ID to speed up verification."}
        </p>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDoc} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 border border-dashed border-gray-200 dark:border-white/15 rounded-xl px-5 py-3 text-sm font-bold text-[#64748B] dark:text-slate-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
          <Upload className="w-4 h-4" /> {pro.id_document_url ? "Replace document" : "Upload document"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 8: REVIEWS                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ReviewsTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/professionals/me/reviews")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>;

  const reviews = data?.reviews || [];
  const average = data?.average ?? 0;
  const count = data?.count ?? 0;
  const breakdown = data?.breakdown || {};

  return (
    <div className="space-y-6">
      <SectionHeader title="Ratings & Reviews" subtitle={`${count} reviews · ${average} avg rating`} />

      {/* Rating Summary */}
      <div className={CARD}>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-4xl font-extrabold text-[#0F172A] dark:text-white">{average}</p>
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(average) ? "text-[#F59E0B] fill-[#F59E0B]" : "text-gray-200 dark:text-gray-700"}`} />
              ))}
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{count} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const cnt = breakdown[stars] || 0;
              const pct = count > 0 ? (cnt / count) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 w-8">{stars} ★</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 w-8 text-right">{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <Star className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No reviews yet</p>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Customer reviews will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r.id} className={CARD}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-extrabold text-[#D97706]">{r.profile?.full_name?.slice(0, 1) || "?"}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-[#0F172A] dark:text-white">{r.profile?.full_name || "Customer"}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-gray-200 dark:text-gray-700"}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">{r.comment}</p>}
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 9: NOTIFICATIONS                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

function NotificationsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/professionals/me/notifications")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const notifications = data?.notifications || [];

  const SEVERITY_STYLE: Record<string, string> = {
    warning: "border-l-4 border-amber-400",
    error: "border-l-4 border-red-400",
    info: "border-l-4 border-blue-400",
    success: "border-l-4 border-green-400",
  };

  const SEVERITY_ICON: Record<string, React.ReactNode> = {
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    info: <Bell className="w-4 h-4 text-blue-500" />,
    success: <Check className="w-4 h-4 text-green-500" />,
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" subtitle={`${notifications.length} alerts`} />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <CheckCircle2 className="w-10 h-10 text-[#16A34A] mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">All caught up!</p>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">No new notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any, i: number) => (
            <div key={i} className={`${CARD} ${SEVERITY_STYLE[n.severity] || ""}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{SEVERITY_ICON[n.severity] || <Bell className="w-4 h-4 text-[#64748B]" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0F172A] dark:text-white">{n.title}</p>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{n.message}</p>
                </div>
                <span className="text-[10px] text-[#64748B] dark:text-slate-400 flex-shrink-0">
                  {n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 10: VERIFICATION CENTER                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

function VerificationTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/professionals/me");
      setData(res);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "jpg", "jpeg", "png"].includes(ext)) { setError("Only PDF, JPG, JPEG or PNG accepted."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Document must be 2 MB or smaller."); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setError("");
        await apiPost("/professionals/document", {
          document_b64: String(reader.result || "").split(",")[1] || "",
          filename: file.name,
          mime: file.type,
        });
        setSaveMsg("Document uploaded for review.");
        await load();
      } catch (err: any) { setError(err.message || "Upload failed."); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (loading) return <div className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />;

  const pro = data?.professional || {};
  const status = pro.verification_status || "pending";
  const meta = VERIFICATION_META[status] || VERIFICATION_META.pending;

  const steps = [
    { label: "Identity Verification", desc: "Government-issued photo ID", done: !!pro.id_document_url },
    { label: "Skill/Certification Documents", desc: "Professional qualifications", done: !!pro.id_document_url },
    { label: "Address Verification", desc: "Proof of business address", done: false },
    { label: "Bank/Payment Details", desc: "Bank account for payouts", done: !!(pro.bank_account_number || pro.upi_id) },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Verification Center" subtitle="Complete verification to start accepting jobs" />

      {/* Status Banner */}
      <div className={CARD}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            status === "verified" ? "bg-green-100 dark:bg-green-500/15" : status === "pending" ? "bg-amber-100 dark:bg-amber-500/15" : "bg-red-100 dark:bg-red-500/15"
          }`}>
            {status === "verified" ? <ShieldCheck className="w-6 h-6 text-green-600" /> : status === "pending" ? <Clock className="w-6 h-6 text-amber-600" /> : <ShieldAlert className="w-6 h-6 text-red-600" />}
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#0F172A] dark:text-white">{meta.label}</p>
            <p className="text-xs text-[#64748B] dark:text-slate-400">{meta.note}</p>
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Verification Steps</h3>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.done ? "bg-[#16A34A]" : "bg-gray-100 dark:bg-white/10"
              }`}>
                {step.done ? <Check className="w-4 h-4 text-white" /> : <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">{i + 1}</span>}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${step.done ? "text-[#16A34A]" : "text-[#0F172A] dark:text-white"}`}>{step.label}</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">{step.desc}</p>
              </div>
              {step.done && <span className="text-[10px] font-bold text-[#16A34A] bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">Uploaded</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-1">Upload Documents</h3>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mb-4">
          Upload your government ID, certifications, and proof of address. Accepted formats: PDF, JPG, PNG (max 2 MB each).
        </p>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDoc} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-white/15 rounded-2xl px-6 py-8 hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition-colors">
          <Upload className="w-6 h-6 text-[#64748B] dark:text-slate-400" />
          <span className="text-sm font-bold text-[#64748B] dark:text-slate-400">Click to upload document</span>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 11: SUPPORT                                                          */
/* ═══════════════════════════════════════════════════════════════════════════ */

function SupportTab() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Support" subtitle="Get help and contact FixKart" />

      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Help Center</h3>
        <div className="space-y-3">
          {[
            { icon: <HelpCircle className="w-5 h-5 text-[#2563EB]" />, title: "FAQs", desc: "Common questions and answers" },
            { icon: <Mail className="w-5 h-5 text-[#16A34A]" />, title: "Contact Support", desc: "Email us at support@fixkart.dev" },
            { icon: <FileText className="w-5 h-5 text-[#7C3AED]" />, title: "Report a Customer", desc: "Report inappropriate behavior" },
            { icon: <DollarSign className="w-5 h-5 text-[#D97706]" />, title: "Dispute a Payment", desc: "Report payment discrepancies" },
            { icon: <AlertCircle className="w-5 h-5 text-[#EF4444]" />, title: "Report an Issue", desc: "Report app bugs or technical issues" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl px-3 -mx-3 transition-colors">
              {item.icon}
              <div className="flex-1">
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">{item.title}</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] dark:text-slate-400" />
            </div>
          ))}
        </div>
      </div>

      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-2">Emergency Contact</h3>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mb-3">For urgent issues, reach us directly:</p>
        <div className="flex flex-wrap gap-3">
          <a href="mailto:support@fixkart.dev" className="flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
            <Mail className="w-3.5 h-3.5" /> support@fixkart.dev
          </a>
          <a href="tel:+911800123456" className="flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
            <Phone className="w-3.5 h-3.5" /> 1800-123-456
          </a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB: CALENDAR                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

function CalendarTab({ setError }: { setError: (s: string) => void }) {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    apiGet("/professionals/me/bookings")
      .then((data) => setBookings(data.bookings || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const startPad = monthStart.getDay();

  const daysInMonth: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) daysInMonth.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) daysInMonth.push(new Date(year, month, d));

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const bookingsForDay = (d: Date) => bookings.filter(b => b.scheduled_at && isSameDay(new Date(b.scheduled_at), d));

  const STATUS_COLOR: Record<string, string> = {
    pending: "bg-[#F59E0B]",
    confirmed: "bg-[#2563EB]",
    in_progress: "bg-[#7C3AED]",
    completed: "bg-[#16A34A]",
    cancelled: "bg-gray-400",
  };

  const navigate = (dir: number) => {
    const next = new Date(currentDate);
    if (view === "month") next.setMonth(next.getMonth() + dir);
    else if (view === "week") next.setDate(next.getDate() + dir * 7);
    else next.setDate(next.getDate() + dir);
    setCurrentDate(next);
  };

  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayHours = Array.from({ length: 12 }, (_, i) => i + 8);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Calendar"
        subtitle="Manage your schedule and availability"
        action={
          <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold text-[#2563EB] border border-[#2563EB] px-3 py-1.5 rounded-xl hover:bg-[#2563EB]/5 transition-colors">Today</button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-white/10 rounded-xl p-1">
          {(["month", "week", "day"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
              view === v ? "bg-white dark:bg-[#111827] text-[#0F172A] dark:text-white shadow-sm" : "text-[#64748B] dark:text-slate-400"
            }`}>{v}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white">‹</button>
          <p className="text-sm font-extrabold text-[#0F172A] dark:text-white min-w-[160px] text-center">
            {currentDate.toLocaleDateString(undefined, view === "month" ? { month: "long", year: "numeric" } : view === "week" ? { month: "short", day: "numeric", year: "numeric" } : { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          <button onClick={() => navigate(1)} className="w-8 h-8 rounded-xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white">›</button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
      ) : view === "month" ? (
        <div className={CARD}>
          <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="bg-gray-50 dark:bg-white/[0.03] p-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">{d}</span>
              </div>
            ))}
            {daysInMonth.map((d, i) => {
              if (!d) return <div key={`pad-${i}`} className="bg-white dark:bg-[#111827] min-h-[80px]" />;
              const dayBookings = bookingsForDay(d);
              const isToday = isSameDay(d, today);
              return (
                <div key={i} className={`bg-white dark:bg-[#111827] min-h-[80px] p-1.5 ${isToday ? "ring-2 ring-[#2563EB] ring-inset" : ""} hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors`}>
                  <p className={`text-xs font-bold mb-1 ${isToday ? "text-[#2563EB]" : "text-[#0F172A] dark:text-white"}`}>{d.getDate()}</p>
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map((b: any) => (
                      <button key={b.id} onClick={() => setSelectedBooking(b)} className={`w-full text-left px-1.5 py-0.5 rounded text-[9px] font-bold text-white truncate ${STATUS_COLOR[b.status] || "bg-gray-400"}`}>{b.service?.name?.slice(0, 10) || "Job"}</button>
                    ))}
                    {dayBookings.length > 3 && <p className="text-[9px] text-[#64748B] dark:text-slate-400 px-1">+{dayBookings.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : view === "week" ? (
        <div className={CARD}>
          <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden">
            {weekDays.map((d, i) => {
              const isToday = isSameDay(d, today);
              const dayBookings = bookingsForDay(d);
              return (
                <div key={i} className={`bg-white dark:bg-[#111827] ${isToday ? "ring-2 ring-[#2563EB] ring-inset" : ""}`}>
                  <div className="p-2 text-center border-b border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-bold uppercase text-[#64748B] dark:text-slate-400">{d.toLocaleDateString(undefined, { weekday: "short" })}</p>
                    <p className={`text-lg font-extrabold ${isToday ? "text-[#2563EB]" : "text-[#0F172A] dark:text-white"}`}>{d.getDate()}</p>
                  </div>
                  <div className="p-1 space-y-1 min-h-[200px]">
                    {dayBookings.map((b: any) => (
                      <button key={b.id} onClick={() => setSelectedBooking(b)} className={`w-full text-left p-1.5 rounded-lg text-[10px] font-bold text-white ${STATUS_COLOR[b.status] || "bg-gray-400"}`}>
                        <p className="truncate">{b.service?.name || "Job"}</p>
                        <p className="text-white/70">{b.scheduled_at ? new Date(b.scheduled_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={CARD}>
          <div className="space-y-0">
            {dayHours.map((hour) => {
              const hourBookings = bookings.filter(b => {
                if (!b.scheduled_at) return false;
                const d = new Date(b.scheduled_at);
                return isSameDay(d, currentDate) && d.getHours() === hour;
              });
              return (
                <div key={hour} className="flex border-b border-gray-100 dark:border-white/5 last:border-0">
                  <div className="w-16 py-3 pr-3 text-right flex-shrink-0">
                    <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400">{hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}</span>
                  </div>
                  <div className="flex-1 py-2 pl-3 border-l border-gray-100 dark:border-white/5 min-h-[48px]">
                    {hourBookings.map((b: any) => (
                      <button key={b.id} onClick={() => setSelectedBooking(b)} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-white mb-1 ${STATUS_COLOR[b.status] || "bg-gray-400"}`}>{b.service?.name || "Job"} · {b.customer?.full_name || "Customer"}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {["pending", "confirmed", "in_progress", "completed", "cancelled"].map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLOR[s]}`} />
            <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 capitalize">{s.replace("_", " ")}</span>
          </div>
        ))}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-[#64748B] hover:text-[#0F172A]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <InfoRow label="Service" value={selectedBooking.service?.name || "Service"} />
              <InfoRow label="Status" value={<span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[selectedBooking.status]}`}>{selectedBooking.status.replace("_", " ")}</span>} />
              <InfoRow label="Customer" value={selectedBooking.customer?.full_name || "Customer"} />
              <InfoRow label="Phone" value={selectedBooking.customer?.phone || "Not provided"} />
              <InfoRow label="Date" value={selectedBooking.scheduled_at ? new Date(selectedBooking.scheduled_at).toLocaleString() : "Not scheduled"} />
              <InfoRow label="Address" value={selectedBooking.address || "Not provided"} />
              <InfoRow label="Price" value={`₹${selectedBooking.service?.base_price || 0}`} />
              {selectedBooking.notes && <InfoRow label="Notes" value={selectedBooking.notes} />}
            </div>
            <div className="flex gap-3 mt-6">
              {selectedBooking.status === "pending" && (
                <><button onClick={() => { apiPatch(`/bookings/${selectedBooking.id}/respond`, { action: "accept" }).then(() => setSelectedBooking(null)); }} className="flex-1 flex items-center justify-center gap-2 bg-[#16A34A] text-white font-bold text-sm py-3 rounded-xl hover:bg-green-600 transition-colors"><Check className="w-4 h-4" /> Accept</button><button onClick={() => { apiPatch(`/bookings/${selectedBooking.id}/respond`, { action: "reject" }).then(() => setSelectedBooking(null)); }} className="flex-1 flex items-center justify-center gap-2 border border-red-200 dark:border-red-500/30 text-red-500 font-bold text-sm py-3 rounded-xl"><X className="w-4 h-4" /> Reject</button></>
              )}
              {selectedBooking.customer?.phone && (<a href={`tel:${selectedBooking.customer.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] text-white font-bold text-sm py-3 rounded-xl hover:bg-blue-500 transition-colors"><Phone className="w-4 h-4" /> Call Customer</a>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB: FIXCOINS REWARDS                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */

function FixCoinsTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"overview" | "history" | "rewards">("overview");

  useEffect(() => {
    Promise.allSettled([apiGet("/professionals/me/dashboard"), apiGet("/professionals/me/earnings")])
      .then(([dashRes, earnRes]) => {
        setData({ dashboard: dashRes.status === "fulfilled" ? dashRes.value : null, earnings: earnRes.status === "fulfilled" ? earnRes.value : null });
      })
      .catch(() => setError("Could not load FixCoins data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>;

  const stats = data?.dashboard?.stats || {};
  const completedJobs = stats.completed_jobs ?? 0;

  const fixCoinsBalance = (completedJobs * 25) + (completedJobs > 5 ? 50 : 0) + (completedJobs > 20 ? 200 : 0) + (completedJobs > 50 ? 500 : 0);
  const earnedThisMonth = Math.min(completedJobs, 30) * 25;

  const levels = [
    { name: "Bronze", min: 0, icon: "\u{1F949}", benefits: ["Basic visibility", "Standard support", "1x rate"] },
    { name: "Silver", min: 200, icon: "\u{1F948}", benefits: ["Enhanced visibility", "Priority support", "1.2x rate", "Tool discounts"] },
    { name: "Gold", min: 1000, icon: "\u{1F947}", benefits: ["Top ranking", "Priority support", "1.5x rate", "Fuel rewards"] },
    { name: "Platinum", min: 3000, icon: "\u{1F48E}", benefits: ["Premium badge", "Dedicated support", "2x rate", "Commission discounts"] },
  ];

  const currentLevel = [...levels].reverse().find(l => fixCoinsBalance >= l.min) || levels[0];
  const nextLevel = levels[levels.indexOf(currentLevel) + 1] || null;
  const progressPct = nextLevel ? Math.min(((fixCoinsBalance - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100, 100) : 100;

  const earnRules = [
    { action: "Reach customer", points: "+10", icon: "📞" },
    { action: "Complete job", points: "+25", icon: "✅" },
    { action: "Upload completion proof", points: "+5", icon: "📸" },
    { action: "5-star customer rating", points: "+10", icon: "⭐" },
    { action: "Milestone: 20 jobs", points: "+200", icon: "🏆" },
    { action: "Milestone: 50 jobs", points: "+500", icon: "🎯" },
  ];

  const rewards = [
    { name: "Tool Discount", cost: 500, desc: "10% off partner tool stores", icon: "🔧" },
    { name: "Fuel Reward", cost: 300, desc: "₹200 fuel voucher", icon: "⛽" },
    { name: "Mobile Recharge", cost: 200, desc: "₹150 mobile recharge", icon: "📱" },
    { name: "Profile Boost", cost: 400, desc: "7 days premium visibility", icon: "🚀" },
    { name: "Commission Discount", cost: 1000, desc: "1% reduction for 1 month", icon: "💰" },
    { name: "Pro Equipment Kit", cost: 2000, desc: "Branded professional toolkit", icon: "🧰" },
  ];

  const history = [
    { date: "Today", action: "Completed: Plumbing repair", points: "+25", type: "earned" },
    { date: "Yesterday", action: "5-star rating bonus", points: "+10", type: "earned" },
    { date: "3 days ago", action: "Completed: Electrical work", points: "+25", type: "earned" },
    { date: "5 days ago", action: "Redeemed: Fuel Reward", points: "-300", type: "redeemed" },
    { date: "1 week ago", action: "Milestone bonus: 20 jobs", points: "+200", type: "earned" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="FixCoins" subtitle="Your loyalty rewards" />

      <div className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl p-6 text-white">
        <p className="text-sm font-bold opacity-80">Current Balance</p>
        <p className="text-4xl font-extrabold mt-1">🪙 {fixCoinsBalance.toLocaleString()}</p>
        <p className="text-sm opacity-80 mt-1">FixCoins</p>
        <div className="flex gap-6 mt-4">
          <div><p className="text-xs opacity-70">Today</p><p className="text-sm font-bold">+0</p></div>
          <div><p className="text-xs opacity-70">This Month</p><p className="text-sm font-bold">+{earnedThisMonth}</p></div>
        </div>
      </div>

      <div className={CARD}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">Professional Level</p>
            <p className="text-lg font-extrabold text-[#0F172A] dark:text-white">{currentLevel.icon} {currentLevel.name}</p>
          </div>
          {nextLevel && <div className="text-right"><p className="text-xs text-[#64748B] dark:text-slate-400">Next: {nextLevel.name}</p><p className="text-xs font-bold text-[#0F172A] dark:text-white">{nextLevel.min - fixCoinsBalance} coins to go</p></div>}
        </div>
        <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[#F59E0B] transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {levels.map((l) => (
            <div key={l.name} className={`p-3 rounded-xl border text-center ${currentLevel.name === l.name ? "border-2 border-[#F59E0B]" : "border-gray-100 dark:border-white/10"}`}>
              <p className="text-lg">{l.icon}</p>
              <p className="text-xs font-bold text-[#0F172A] dark:text-white">{l.name}</p>
              <p className="text-[10px] text-[#64748B] dark:text-slate-400">{l.min}+ coins</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {[{ k: "overview", l: "How to Earn" }, { k: "history", l: "History" }, { k: "rewards", l: "Redeem" }].map((t) => (
          <button key={t.k} onClick={() => setSubTab(t.k as any)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${subTab === t.k ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]" : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white/10"}`}>{t.l}</button>
        ))}
      </div>

      {subTab === "overview" && <div className="space-y-3"><p className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">Ways to Earn FixCoins</p>{earnRules.map((rule, i) => <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/10"><span className="text-xl w-8 text-center">{rule.icon}</span><div className="flex-1"><p className="text-sm font-bold text-[#0F172A] dark:text-white">{rule.action}</p></div><span className="text-sm font-extrabold text-[#16A34A]">{rule.points}</span></div>)}<div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4 border border-amber-200 dark:border-amber-500/20"><p className="text-xs font-bold text-amber-800 dark:text-amber-400">⚠️ Important</p><p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1">FixCoins are earned for completing jobs and getting good ratings. Accepting jobs alone does not earn coins to prevent abuse.</p></div></div>}

      {subTab === "history" && <div className="space-y-2">{history.map((h, i) => <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/10"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: h.type === "earned" ? "#DCFCE7" : "#FEE2E2" }}><span className="text-sm">{h.type === "earned" ? "➕" : "🎁"}</span></div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-[#0F172A] dark:text-white truncate">{h.action}</p><p className="text-[10px] text-[#64748B] dark:text-slate-400">{h.date}</p></div><span className={`text-sm font-extrabold ${h.type === "earned" ? "text-[#16A34A]" : "text-red-500"}`}>{h.points}</span></div>)}</div>}

      {subTab === "rewards" && <div className="space-y-3"><p className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">Redeem Your FixCoins</p>{rewards.map((r, i) => <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/10"><span className="text-2xl w-10 text-center">{r.icon}</span><div className="flex-1 min-w-0"><p className="text-sm font-bold text-[#0F172A] dark:text-white">{r.name}</p><p className="text-xs text-[#64748B] dark:text-slate-400">{r.desc}</p></div><div className="flex flex-col items-end gap-1"><span className="text-xs font-bold text-[#F59E0B]">🪙 {r.cost}</span><button disabled={fixCoinsBalance < r.cost} className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-colors ${fixCoinsBalance >= r.cost ? "bg-[#2563EB] text-white hover:bg-blue-500" : "bg-gray-100 dark:bg-white/10 text-gray-400 cursor-not-allowed"}`}>Redeem</button></div></div>)}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB: SETTINGS                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

function SettingsTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [settingsSection, setSettingsSection] = useState<"account" | "availability" | "notifications" | "payment" | "privacy" | "security">("account");
  const [form, setForm] = useState<any>({});
  const [notPrefs, setNotPrefs] = useState({ new_requests: true, booking_changes: true, cancellations: true, payments: true, reviews: true, fixcoins: true, support: true });

  useEffect(() => {
    apiGet("/professionals/me")
      .then((res) => { setForm({ full_name: res.profile?.full_name || "", phone: res.profile?.phone || "", availability: res.professional?.availability || "", service_radius_km: String(res.professional?.service_radius_km ?? ""), max_jobs_per_day: String(res.professional?.max_jobs_per_day ?? ""), bank_name: res.professional?.bank_name || "", bank_account_number: res.professional?.bank_account_number || "", bank_ifsc: res.professional?.bank_ifsc || "", upi_id: res.professional?.upi_id || "" }); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const saveAccount = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await apiPatch("/professionals/me", { availability: form.availability, service_radius_km: form.service_radius_km ? parseInt(form.service_radius_km, 10) : undefined, max_jobs_per_day: form.max_jobs_per_day ? parseInt(form.max_jobs_per_day, 10) : undefined }); setSaveMsg("Settings saved."); } catch (err: any) { setError(err.message); } finally { setSaving(false); } };
  const savePayment = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await apiPatch("/professionals/me", { bank_name: form.bank_name || null, bank_account_number: form.bank_account_number || null, bank_ifsc: form.bank_ifsc || null, upi_id: form.upi_id || null }); setSaveMsg("Payment settings saved."); } catch (err: any) { setError(err.message); } finally { setSaving(false); } };
  const handleLogout = () => { logout(); navigate("/"); };

  if (loading) return <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>;

  const sections: { key: typeof settingsSection; label: string; icon: React.ReactNode }[] = [
    { key: "account", label: "Account", icon: <UserCircle className="w-4 h-4" /> },
    { key: "availability", label: "Availability", icon: <Clock3 className="w-4 h-4" /> },
    { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { key: "payment", label: "Payment", icon: <DollarSign className="w-4 h-4" /> },
    { key: "privacy", label: "Privacy", icon: <ShieldCheck className="w-4 h-4" /> },
    { key: "security", label: "Security", icon: <AlertCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Manage your account and preferences" />
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (<button key={s.key} onClick={() => setSettingsSection(s.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${settingsSection === s.key ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]" : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white/10"}`}>{s.icon} {s.label}</button>))}
      </div>

      {settingsSection === "account" && <form onSubmit={saveAccount} className="space-y-4"><div className={CARD}><h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Account Settings</h3><div className="space-y-4"><div><label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label><input type="text" value={form.full_name || ""} className={inputClass} readOnly /></div><div><label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Phone</label><input type="tel" value={form.phone || ""} className={inputClass} readOnly /></div><p className="text-xs text-[#64748B] dark:text-slate-400">To change your name or phone, update your Profile tab.</p></div></div><button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60">{saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Changes</button></form>}

      {settingsSection === "availability" && <form onSubmit={saveAccount} className="space-y-4"><div className={CARD}><h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Availability Settings</h3><div className="space-y-4"><div><label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Working Hours</label><input type="text" value={form.availability || ""} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={inputClass} placeholder="e.g. Mon-Sat, 9 AM - 6 PM" /></div><div className="grid sm:grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Service Radius (km)</label><input type="number" min="1" max="100" value={form.service_radius_km || ""} onChange={(e) => setForm({ ...form, service_radius_km: e.target.value })} className={inputClass} /></div><div><label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Max Jobs Per Day</label><input type="number" min="1" max="20" value={form.max_jobs_per_day || ""} onChange={(e) => setForm({ ...form, max_jobs_per_day: e.target.value })} className={inputClass} /></div></div></div></div><button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60">{saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Changes</button></form>}

      {settingsSection === "notifications" && <div className={CARD}><h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Notification Preferences</h3><div className="space-y-3">{([ ["new_requests", "New Job Requests"], ["booking_changes", "Booking Changes"], ["cancellations", "Customer Cancellations"], ["payments", "Payment Updates"], ["reviews", "New Reviews"], ["fixcoins", "FixCoins Earned"], ["support", "Support Responses"], ] as const).map(([key, label]) => (<div key={key} className="flex items-center justify-between py-2"><span className="text-sm font-bold text-[#0F172A] dark:text-white">{label}</span><button onClick={() => setNotPrefs(p => ({ ...p, [key]: !p[key] }))} className={`relative w-10 h-5 rounded-full transition-colors ${notPrefs[key] ? "bg-[#16A34A]" : "bg-gray-300 dark:bg-gray-600"}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notPrefs[key] ? "left-[calc(100%-18px)]" : "left-0.5"}`} /></button></div>))}</div></div>}

      {settingsSection === "payment" && <form onSubmit={savePayment} className="space-y-4"><div className={CARD}><h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Payment Settings</h3><div className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Bank Name</label><input type="text" value={form.bank_name || ""} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className={inputClass} placeholder="e.g. HDFC Bank" /></div><div><label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Account Number</label><input type="text" value={form.bank_account_number || ""} onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })} className={inputClass} /></div></div><div className="grid sm:grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">IFSC Code</label><input type="text" value={form.bank_ifsc || ""} onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })} className={inputClass} /></div><div><label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">UPI ID</label><input type="text" value={form.upi_id || ""} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} className={inputClass} placeholder="e.g. name@upi" /></div></div></div></div><button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60">{saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Payment Settings</button></form>}

      {settingsSection === "privacy" && <div className={CARD}><h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Privacy Settings</h3><div className="space-y-4">{[ ["Show phone number to customers", "Customers will be able to see your phone number"], ["Show location to customers", "Your service area will be visible on your profile"], ["Show online status", "Let customers see when you are online"] ].map(([title, desc], i) => <div key={i} className="flex items-center justify-between py-2"><div><p className="text-sm font-bold text-[#0F172A] dark:text-white">{title}</p><p className="text-xs text-[#64748B] dark:text-slate-400">{desc}</p></div><button className="relative w-10 h-5 rounded-full bg-[#16A34A]"><div className="absolute top-0.5 left-[calc(100%-18px)] w-4 h-4 bg-white rounded-full shadow" /></button></div>)}</div></div>}

      {settingsSection === "security" && <div className="space-y-4"><div className={CARD}><h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Security Settings</h3><div className="space-y-4"><Link to="/settings" className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/15 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"><div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center"><Settings className="w-4 h-4 text-[#2563EB]" /></div><div className="flex-1"><p className="text-sm font-bold text-[#0F172A] dark:text-white">Change Password</p><p className="text-xs text-[#64748B] dark:text-slate-400">Update your account password</p></div><ChevronRight className="w-4 h-4 text-[#64748B] dark:text-slate-400" /></Link><div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-white/15"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/15 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-green-600" /></div><div><p className="text-sm font-bold text-[#0F172A] dark:text-white">Two-Factor Auth</p><p className="text-xs text-[#64748B] dark:text-slate-400">Add extra security</p></div></div><span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400 px-2 py-0.5 rounded-full">Coming Soon</span></div></div></div><div className={CARD}><h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-3">Session</h3>{confirmLogout ? <div className="flex gap-3"><button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-red-500 transition-colors"><LogOut className="w-4 h-4" /> Confirm Logout</button><button onClick={() => setConfirmLogout(false)} className="flex-1 text-sm font-bold text-[#64748B] dark:text-slate-400 py-3 rounded-xl border border-gray-200 dark:border-white/15">Cancel</button></div> : <button onClick={() => setConfirmLogout(true)} className="w-full flex items-center justify-center gap-2 border border-red-200 dark:border-red-500/30 text-red-500 font-bold text-sm py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><LogOut className="w-4 h-4" /> Log Out</button>}</div></div>}
    </div>
  );
}
