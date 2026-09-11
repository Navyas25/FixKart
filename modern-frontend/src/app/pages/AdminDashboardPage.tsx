import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ShieldAlert,
  Package,
  ShoppingCart,
  CalendarCheck,
  DollarSign,
  Star,
  BarChart3,
  HelpCircle,
  Bell,
  Settings,
  LogOut,
  Loader2,
  Wrench,
  Check,
  X,
  Ban,
  Eye,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Clock,
  IndianRupee,
  UserCircle,
  Store,
  Search,
  ExternalLink,
  MapPin,
  Phone,
  FileText,
  MessageSquare,
  RefreshCw,
  Download,
  Mail,
  Headphones,
  Inbox,
  Sun,
  Moon,
} from "lucide-react";
import { apiGet, apiPatch, apiPost } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useTheme } from "../../lib/theme";
import { PageHeader } from "../components/PageHeader";

/* ─── Constants ───────────────────────────────────────────────────────────── */

type Tab =
  | "dashboard"
  | "users"
  | "professionals"
  | "vendors"
  | "products"
  | "orders"
  | "bookings"
  | "payments"
  | "reviews"
  | "analytics"
  | "support"
  | "notifications"
  | "settings";

const CARD =
  "bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm";

const inputClass =
  "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  packed: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  in_progress: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  refunded: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  verified: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  suspended: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400",
};

const VER_STATUS: Record<string, { label: string; badge: string }> = {
  pending: { label: "Pending", badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" },
  verified: { label: "Verified", badge: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" },
  rejected: { label: "Rejected", badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
  suspended: { label: "Suspended", badge: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400" },
};

/* ─── Shared Components ───────────────────────────────────────────────────── */

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

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">{label}</p>
      <p className="text-sm font-medium text-[#0F172A] dark:text-white mt-0.5">{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function AdminDashboardPage() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      await apiGet("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Could not load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && isAdmin) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isAdmin]);

  const handleLogout = async () => {
    if (!confirmLogout) { setConfirmLogout(true); return; }
    logout();
    navigate("/");
  };

  if (!isLoggedIn) {
    return (
      <>
        <PageHeader eyebrow="FixKart Admin" title="Admin Dashboard" subtitle="Platform administration" />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-[#64748B] dark:text-slate-400 mb-6">Sign in to the admin console.</p>
            <Link to="/login?next=/admin/dashboard" className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors">Admin Sign In</Link>
          </div>
        </section>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader eyebrow="FixKart Admin" title="Admin Dashboard" subtitle="Admin only" />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-[#0F172A] dark:text-white font-extrabold mb-2">Admin access required</p>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mb-6">
              Only users with the <span className="font-bold">admin</span> role can access this page.
            </p>
            <Link to="/" className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors">Back to FixKart</Link>
          </div>
        </section>
      </>
    );
  }
    return (
      <>
        <PageHeader eyebrow="FixKart Admin" title="Admin Dashboard" subtitle="Admin only" />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-[#0F172A] dark:text-white font-extrabold mb-2">Admin access required</p>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mb-6">
              Only users with the <span className="font-bold">admin</span> role can access this page.
            </p>
            <Link to="/" className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors">Back to FixKart</Link>
          </div>
        </section>
      </>
    );
  }

  const navItems: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { key: "professionals", label: "Professionals", icon: <Wrench className="w-4 h-4" /> },
    { key: "vendors", label: "Vendors", icon: <Store className="w-4 h-4" /> },
    { key: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { key: "orders", label: "Orders", icon: <ShoppingCart className="w-4 h-4" /> },
    { key: "bookings", label: "Bookings", icon: <CalendarCheck className="w-4 h-4" /> },
    { key: "payments", label: "Payments", icon: <DollarSign className="w-4 h-4" /> },
    { key: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
    { key: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="FIXKART ADMIN"
        title="Admin Dashboard"
        subtitle={user?.email || "Platform administration"}
      />
      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/10 p-4 shadow-sm">
              <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-gray-100 dark:border-white/10 mb-3">
                <div className="w-9 h-9 bg-[#0F172A] rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#F59E0B]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-extrabold text-[#0F172A] dark:text-white text-sm leading-tight">FixKart <span className="text-[#F59E0B]">Admin</span></p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-semibold">System Online</span>
                  </div>
                </div>
              </div>
              <nav className="space-y-0.5">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { setTab(item.key); setSaveMsg(""); setError(""); }}
                    className={`w-full flex items-center gap-2.5 text-sm font-bold px-3 py-2.5 rounded-xl transition-colors ${
                      tab === item.key
                        ? "bg-[#0F172A] text-white"
                        : "text-[#64748B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
                {confirmLogout ? (
                  <div className="space-y-1.5">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-red-500 transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Confirm logout
                    </button>
                    <button onClick={() => setConfirmLogout(false)} className="w-full text-xs font-bold text-[#64748B] dark:text-slate-400 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">Cancel</button>
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
                <div className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
              </div>
            ) : (
              <>
                {tab === "dashboard" && <DashboardTab setError={setError} />}
                {tab === "users" && <UsersTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "professionals" && <ProfessionalsTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "vendors" && <VendorsTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "products" && <ProductsTab setError={setError} />}
                {tab === "orders" && <OrdersTab setError={setError} />}
                {tab === "bookings" && <BookingsTab setError={setError} />}
                {tab === "payments" && <PaymentsTab setError={setError} />}
                {tab === "reviews" && <ReviewsTab setError={setError} />}
                {tab === "analytics" && <AnalyticsTab setError={setError} />}
                {tab === "support" && <SupportTab />}
                {tab === "notifications" && <NotificationsTab />}
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
/*  TAB 1: DASHBOARD / OVERVIEW                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

function DashboardTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/admin/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>;
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className={CARD}>
        <p className="text-lg font-extrabold text-[#0F172A] dark:text-white">
          Good morning, Admin
        </p>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
          Here&apos;s what&apos;s happening with FixKart today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`₹${(stats.total_revenue ?? 0).toLocaleString()}`} icon={<IndianRupee className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" subtitle="Total platform revenue" />
        <StatCard label="Users" value={String(stats.total_users ?? 0)} icon={<Users className="w-4 h-4" style={{ color: "#2563EB" }} />} color="#2563EB" />
        <StatCard label="Professionals" value={String(stats.total_professionals ?? 0)} icon={<Wrench className="w-4 h-4" style={{ color: "#F59E0B" }} />} color="#F59E0B" subtitle={`${stats.pending_professionals ?? 0} pending`} />
        <StatCard label="Vendors" value={String(stats.total_vendors ?? 0)} icon={<Store className="w-4 h-4" style={{ color: "#7C3AED" }} />} color="#7C3AED" subtitle={`${stats.pending_vendors ?? 0} pending`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Orders" value={String(stats.total_orders ?? 0)} icon={<ShoppingCart className="w-4 h-4" style={{ color: "#06B6D4" }} />} color="#06B6D4" subtitle={`${stats.pending_orders ?? 0} pending`} />
        <StatCard label="Bookings" value={String(stats.total_bookings ?? 0)} icon={<CalendarCheck className="w-4 h-4" style={{ color: "#8B5CF6" }} />} color="#8B5CF6" subtitle={`${stats.pending_bookings ?? 0} pending`} />
        <StatCard label="Products" value={String(stats.total_products ?? 0)} icon={<Package className="w-4 h-4" style={{ color: "#EC4899" }} />} color="#EC4899" />
        <StatCard label="Commission" value={`₹${(stats.platform_commission ?? 0).toLocaleString()}`} icon={<TrendingUp className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" subtitle="5% platform fee" />
      </div>

      {/* Pending Actions */}
      <div className={CARD}>
        <SectionHeader title="Pending Actions" subtitle="Items requiring attention" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Professional Verifications", count: stats.pending_professionals ?? 0, color: "#F59E0B", tab: "professionals" as Tab },
            { label: "Vendor Approvals", count: stats.pending_vendors ?? 0, color: "#7C3AED", tab: "vendors" as Tab },
            { label: "Pending Orders", count: stats.pending_orders ?? 0, color: "#2563EB", tab: "orders" as Tab },
            { label: "Pending Bookings", count: stats.pending_bookings ?? 0, color: "#8B5CF6", tab: "bookings" as Tab },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                <span className="text-lg font-extrabold" style={{ color: item.color }}>{item.count}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">{item.label}</p>
                <p className="text-[10px] text-[#64748B] dark:text-slate-400">Requires review</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className={CARD}>
        <SectionHeader title="Revenue Overview" subtitle="Last 30 days" />
        {data?.revenue_chart?.length > 0 ? (
          <div className="h-48 flex items-end gap-1">
            {data.revenue_chart.slice(-30).map((d: any, i: number) => {
              const maxRev = Math.max(...data.revenue_chart.map((r: any) => r.revenue), 1);
              const height = (d.revenue / maxRev) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#2563EB] rounded-t-md transition-all duration-300 hover:bg-[#1D4ED8]"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`₹${d.revenue.toLocaleString()}`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-[#64748B] dark:text-slate-400">
            No revenue data yet
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className={CARD}>
        <SectionHeader title="Recent Activity" />
        {data?.recent_activity?.length > 0 ? (
          <div className="space-y-2">
            {data.recent_activity.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-white/5 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.type === "order" ? "bg-blue-100 dark:bg-blue-500/15" : "bg-violet-100 dark:bg-violet-500/15"}`}>
                  {a.type === "order" ? <ShoppingCart className="w-4 h-4 text-blue-600" /> : <CalendarCheck className="w-4 h-4 text-violet-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0F172A] dark:text-white truncate">{a.title}</p>
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[a.status] || ""}`}>{a.status}</span>
                {a.amount && <span className="text-xs font-bold text-[#16A34A]">₹{a.amount}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#64748B] dark:text-slate-400 py-8 text-center">No recent activity</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 2: USERS                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function UsersTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [detailUser, setDetailUser] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (roleFilter) params.set("role", roleFilter);
      const data = await apiGet(`/admin/users?${params.toString()}`);
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [roleFilter]);

  const roleCounts = useMemo(() => {
    const c: Record<string, number> = { all: users.length, customer: 0, professional: 0, vendor: 0, admin: 0 };
    users.forEach(u => { if (c[u.role] !== undefined) c[u.role]++; });
    return c;
  }, [users]);

  return (
    <div className="space-y-6">
      <SectionHeader title="User Management" subtitle={`${users.length} total users`} />

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search users..." className={inputClass + " pl-10"} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "customer", "professional", "vendor", "admin"].map(r => (
          <button key={r} onClick={() => setRoleFilter(r === "all" ? "" : r)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-colors ${roleFilter === (r === "all" ? "" : r) || (r === "all" && !roleFilter) ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]" : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white/10"}`}>
            {r} ({roleCounts[r] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <Users className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No users found</p>
        </div>
      ) : (
        <div className={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="text-left text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 pb-3 pr-4">User</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 pb-3 pr-4">Role</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 pb-3 pr-4">Phone</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 pb-3 pr-4">Joined</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#D97706]">{u.full_name?.slice(0, 1) || "?"}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] dark:text-white truncate">{u.full_name || "Unknown"}</p>
                          <p className="text-[10px] text-[#64748B] dark:text-slate-400 truncate">{u.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" : u.role === "professional" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" : u.role === "vendor" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400"}`}>{u.role || "customer"}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#64748B] dark:text-slate-400">{u.phone || "—"}</td>
                    <td className="py-3 pr-4 text-xs text-[#64748B] dark:text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => setDetailUser(u)} className="text-xs font-bold text-[#2563EB] hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailUser(null)}>
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white">User Details</h3>
              <button onClick={() => setDetailUser(null)} className="text-[#64748B] hover:text-[#0F172A]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <InfoRow label="Name" value={detailUser.full_name || "Unknown"} />
              <InfoRow label="Email" value={detailUser.email || "No email"} />
              <InfoRow label="Phone" value={detailUser.phone || "Not provided"} />
              <InfoRow label="Role" value={<span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[detailUser.role] || ""}`}>{detailUser.role || "customer"}</span>} />
              <InfoRow label="Joined" value={new Date(detailUser.created_at).toLocaleDateString()} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 3: PROFESSIONALS (Admin)                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ProfessionalsTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/professionals/admin");
      setRows(data.professionals || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length, pending: 0, verified: 0, rejected: 0, suspended: 0 };
    rows.forEach(r => { if (c[r.verification_status] !== undefined) c[r.verification_status]++; });
    return c;
  }, [rows]);

  const visible = filter === "all" ? rows : rows.filter(r => r.verification_status === filter);

  const act = async (id: string, status: string) => {
    setActing(id);
    try {
      await apiPatch(`/professionals/${id}/verify`, { verification_status: status });
      setSaveMsg(`Professional ${status}.`);
      await load();
    } catch (err: any) { setError(err.message); }
    finally { setActing(null); setConfirmAction(null); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Professional Management" subtitle={`${rows.length} total professionals`} />

      <div className="flex flex-wrap gap-2">
        {["pending", "verified", "rejected", "suspended", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-colors ${filter === f ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]" : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white/10"}`}>
            {f} ({counts[f] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : visible.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <ShieldCheck className="w-10 h-10 text-[#16A34A] mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No {filter !== "all" ? filter : ""} professionals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(pro => {
            const meta = VER_STATUS[pro.verification_status] || VER_STATUS.pending;
            return (
              <div key={pro.id} className={CARD}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] text-[#0F172A] flex items-center justify-center text-lg font-extrabold flex-shrink-0">
                      {(pro.profile?.full_name || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-extrabold text-[#0F172A] dark:text-white">{pro.profile?.full_name || "Unnamed"}</p>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${meta.badge}`}>{meta.label}</span>
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">
                        {pro.service_categories?.join(", ") || "No category"} · {pro.experience_years ?? 0} yrs exp
                        {pro.profile?.phone ? ` · ${pro.profile.phone}` : ""}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                          <span className="text-xs font-bold text-[#0F172A] dark:text-white">{Number(pro.rating ?? 0).toFixed(1)}</span>
                        </div>
                        {pro.id_document_url && (
                          <a href={pro.id_document_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#2563EB] hover:text-blue-600 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Document
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {confirmAction?.id === pro.id ? (
                      <>
                        <button onClick={() => act(pro.id, confirmAction.status)} disabled={acting === pro.id} className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60">
                          {acting === pro.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm
                        </button>
                        <button onClick={() => setConfirmAction(null)} className="text-xs font-bold text-[#64748B] dark:text-slate-400 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">Cancel</button>
                      </>
                    ) : (
                      <>
                        {pro.verification_status !== "verified" && (
                          <button onClick={() => setConfirmAction({ id: pro.id, status: "verified" })} className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors">
                            <Check className="w-3.5 h-3.5" /> Verify
                          </button>
                        )}
                        {pro.verification_status === "pending" && (
                          <button onClick={() => setConfirmAction({ id: pro.id, status: "rejected" })} className="flex items-center gap-1.5 border border-red-200 dark:border-red-500/30 text-red-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                        {pro.verification_status !== "suspended" && pro.verification_status !== "rejected" && (
                          <button onClick={() => setConfirmAction({ id: pro.id, status: "suspended" })} className="flex items-center gap-1.5 border border-gray-200 dark:border-white/15 text-[#64748B] dark:text-slate-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <Ban className="w-3.5 h-3.5" /> Suspend
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 4: VENDORS (Admin)                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

function VendorsTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/vendors/admin");
      setRows(data.vendors || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length, pending: 0, verified: 0, rejected: 0, suspended: 0 };
    rows.forEach(r => { if (c[r.verification_status] !== undefined) c[r.verification_status]++; });
    return c;
  }, [rows]);

  const visible = filter === "all" ? rows : rows.filter(r => r.verification_status === filter);

  const act = async (id: string, status: string) => {
    setActing(id);
    try {
      await apiPatch(`/vendors/${id}/verify`, { verification_status: status });
      setSaveMsg(`Vendor ${status}.`);
      await load();
    } catch (err: any) { setError(err.message); }
    finally { setActing(null); setConfirmAction(null); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Vendor Management" subtitle={`${rows.length} total vendors`} />

      <div className="flex flex-wrap gap-2">
        {["pending", "verified", "rejected", "suspended", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-colors ${filter === f ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]" : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white/10"}`}>
            {f} ({counts[f] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : visible.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <Store className="w-10 h-10 text-[#16A34A] mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No {filter !== "all" ? filter : ""} vendors</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(vendor => {
            const meta = VER_STATUS[vendor.verification_status] || VER_STATUS.pending;
            return (
              <div key={vendor.id} className={CARD}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center text-lg font-extrabold flex-shrink-0">
                      {vendor.shop_name?.slice(0, 1).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-extrabold text-[#0F172A] dark:text-white">{vendor.shop_name}</p>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${meta.badge}`}>{meta.label}</span>
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">
                        {vendor.profile?.full_name || "Unknown"} · {vendor.profile?.email || "No email"}
                        {vendor.shop_location ? ` · ${vendor.shop_location}` : ""}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                        <span className="text-xs font-bold text-[#0F172A] dark:text-white">{Number(vendor.rating ?? 0).toFixed(1)}</span>
                        <span className="text-xs text-[#64748B] dark:text-slate-400">· ₹{vendor.total_sales ?? 0} sales</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {confirmAction?.id === vendor.id ? (
                      <>
                        <button onClick={() => act(vendor.id, confirmAction.status)} disabled={acting === vendor.id} className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60">
                          {acting === vendor.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm
                        </button>
                        <button onClick={() => setConfirmAction(null)} className="text-xs font-bold text-[#64748B] dark:text-slate-400 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">Cancel</button>
                      </>
                    ) : (
                      <>
                        {vendor.verification_status !== "verified" && (
                          <button onClick={() => setConfirmAction({ id: vendor.id, status: "verified" })} className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors">
                            <Check className="w-3.5 h-3.5" /> Verify
                          </button>
                        )}
                        {vendor.verification_status === "pending" && (
                          <button onClick={() => setConfirmAction({ id: vendor.id, status: "rejected" })} className="flex items-center gap-1.5 border border-red-200 dark:border-red-500/30 text-red-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                        {vendor.verification_status !== "suspended" && vendor.verification_status !== "rejected" && (
                          <button onClick={() => setConfirmAction({ id: vendor.id, status: "suspended" })} className="flex items-center gap-1.5 border border-gray-200 dark:border-white/15 text-[#64748B] dark:text-slate-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <Ban className="w-3.5 h-3.5" /> Suspend
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 5: PRODUCTS                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ProductsTab({ setError }: { setError: (s: string) => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const categories = ["Plumbing", "Electrical", "Hardware", "Tools", "Paint", "Automotive", "Safety Equipment"];

  useEffect(() => {
    apiGet("/products?limit=100")
      .then((data) => setProducts(data.products || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !catFilter || p.category?.name?.toLowerCase() === catFilter.toLowerCase() || p.category_id === catFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Products & Categories" subtitle={`${products.length} total products`} />

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className={inputClass + " pl-10"} />
        </div>
      </div>

      {/* Category Tree */}
      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCatFilter(catFilter ? "" : "")}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${!catFilter ? 'bg-[#0F172A] text-white' : 'text-[#64748B] bg-gray-100 dark:bg-white/10 dark:text-slate-400 hover:bg-gray-200'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(catFilter === cat ? '' : cat)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${catFilter === cat ? 'bg-[#2563EB] text-white' : 'text-[#2563EB] bg-[#2563EB]/10 hover:bg-[#2563EB]/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="text-left text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 pb-3 pr-4">Product</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 pb-3 pr-4">Price</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 pb-3 pr-4">Stock</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 pb-3 pr-4">Status</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 pb-3">Category</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map(p => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center"><Package className="w-4 h-4 text-[#64748B]" /></div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] dark:text-white truncate max-w-[200px]">{p.name}</p>
                          {p.brand && <p className="text-[10px] text-[#64748B] dark:text-slate-400">{p.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs font-bold text-[#16A34A]">₹{p.price}</p>
                      {p.discount_price && <p className="text-[10px] text-[#64748B] line-through">₹{p.discount_price}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-bold ${p.stock <= 0 ? "text-red-500" : p.stock <= 5 ? "text-amber-500" : "text-[#16A34A]"}`}>
                        {p.stock <= 0 ? "Out of stock" : p.stock}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400"}`}>
                        {p.status || "active"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-[#64748B] dark:text-slate-400">{p.category?.name || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 6: ORDERS                                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

function OrdersTab({ setError }: { setError: (s: string) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const data = await apiGet(`/admin/orders${params}`);
      setOrders(data.orders || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    orders.forEach(o => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Orders & Bookings" subtitle="Hardware purchase orders" />

      <div className="flex flex-wrap gap-2">
        {[{ k: "", l: "All" }, { k: "pending", l: "Pending" }, { k: "confirmed", l: "Confirmed" }, { k: "shipped", l: "Shipped" }, { k: "delivered", l: "Delivered" }, { k: "cancelled", l: "Cancelled" }].map(f => (
          <button key={f.k} onClick={() => setStatusFilter(f.k)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${statusFilter === f.k ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]" : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white/10"}`}>
            {f.l} {f.k ? `(${statusCounts[f.k] || 0})` : `(${orders.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <ShoppingCart className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No orders found</p>
        </div>
      ) : (
        <div className={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th className="text-left text-[10px] font-bold uppercase text-[#64748B] dark:text-slate-400 pb-3 pr-4">Order ID</th>
                  <th className="text-left text-[10px] font-bold uppercase text-[#64748B] dark:text-slate-400 pb-3 pr-4">Customer</th>
                  <th className="text-left text-[10px] font-bold uppercase text-[#64748B] dark:text-slate-400 pb-3 pr-4">Items</th>
                  <th className="text-left text-[10px] font-bold uppercase text-[#64748B] dark:text-slate-400 pb-3 pr-4">Amount</th>
                  <th className="text-left text-[10px] font-bold uppercase text-[#64748B] dark:text-slate-400 pb-3 pr-4">Status</th>
                  <th className="text-left text-[10px] font-bold uppercase text-[#64748B] dark:text-slate-400 pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                    <td className="py-3 pr-4"><span className="text-xs font-bold text-[#0F172A] dark:text-white">#{o.id.slice(0, 8)}</span></td>
                    <td className="py-3 pr-4"><span className="text-xs text-[#64748B] dark:text-slate-400">{o.profile?.full_name || "Customer"}</span></td>
                    <td className="py-3 pr-4"><span className="text-xs text-[#64748B] dark:text-slate-400">{o.items?.length || 0} items</span></td>
                    <td className="py-3 pr-4"><span className="text-xs font-bold text-[#16A34A]">₹{o.total_amount}</span></td>
                    <td className="py-3 pr-4"><span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[o.status] || ""}`}>{o.status}</span></td>
                    <td className="py-3"><span className="text-[10px] text-[#64748B] dark:text-slate-400">{new Date(o.created_at).toLocaleDateString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 7: BOOKINGS                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

function BookingsTab({ setError }: { setError: (s: string) => void }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const data = await apiGet(`/admin/bookings${params}`);
      setBookings(data.bookings || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    bookings.forEach(b => { c[b.status] = (c[b.status] || 0) + 1; });
    return c;
  }, [bookings]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Bookings" subtitle="Professional service bookings" />

      <div className="flex flex-wrap gap-2">
        {[{ k: "", l: "All" }, { k: "pending", l: "Pending" }, { k: "confirmed", l: "Accepted" }, { k: "in_progress", l: "In Progress" }, { k: "completed", l: "Completed" }, { k: "cancelled", l: "Cancelled" }].map(f => (
          <button key={f.k} onClick={() => setStatusFilter(f.k)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${statusFilter === f.k ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]" : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white/10"}`}>
            {f.l} {f.k ? `(${statusCounts[f.k] || 0})` : `(${bookings.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <CalendarCheck className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className={CARD}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-extrabold text-[#0F172A] dark:text-white text-sm">{b.service?.name || "Service"}</p>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[b.status] || ""}`}>{b.status.replace("_", " ")}</span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    {b.customer?.full_name || "Customer"} · {b.professional?.profile?.full_name || "Professional"}
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                    {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : "Not scheduled"}
                    {b.service?.base_price ? ` · ₹${b.service.base_price}` : ""}
                  </p>
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
/*  TAB 8: PAYMENTS                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

function PaymentsTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/admin/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>;

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <SectionHeader title="Payments" subtitle="Central financial dashboard" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${(stats.total_revenue ?? 0).toLocaleString()}`} icon={<IndianRupee className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" />
        <StatCard label="Platform Commission" value={`₹${(stats.platform_commission ?? 0).toLocaleString()}`} icon={<TrendingUp className="w-4 h-4" style={{ color: "#2563EB" }} />} color="#2563EB" subtitle="5% of revenue" />
        <StatCard label="Total Orders" value={String(stats.total_orders ?? 0)} icon={<ShoppingCart className="w-4 h-4" style={{ color: "#06B6D4" }} />} color="#06B6D4" />
        <StatCard label="Total Bookings" value={String(stats.total_bookings ?? 0)} icon={<CalendarCheck className="w-4 h-4" style={{ color: "#8B5CF6" }} />} color="#8B5CF6" />
      </div>

      <div className={CARD}>
        <SectionHeader title="Payout Schedule" />
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/15 flex items-center justify-center"><Check className="w-4 h-4 text-green-600" /></div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">Weekly Payouts</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Vendor and professional payouts settled every Monday</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center"><IndianRupee className="w-4 h-4 text-blue-600" /></div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">5% Platform Commission</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Deducted from each completed transaction</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-amber-600" /></div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">Payment Disputes</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">3 disputes pending resolution</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className={CARD}>
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 mb-2">Vendor Payouts</p>
          <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">₹{Math.round((stats.total_revenue ?? 0) * 0.6).toLocaleString()}</p>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Estimated vendor share</p>
        </div>
        <div className={CARD}>
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 mb-2">Professional Payouts</p>
          <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">₹{Math.round((stats.total_revenue ?? 0) * 0.35).toLocaleString()}</p>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Estimated professional share</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 9: REVIEWS & REPORTS                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ReviewsTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/admin/reviews")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>;

  const reviews = data?.reviews || [];
  const average = data?.average ?? 0;
  const count = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <SectionHeader title="Reviews & Reports" subtitle={`${count} reviews · ${average} avg rating`} />

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
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <Star className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No reviews yet</p>
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
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400">{r.item_type}</span>
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
/*  TAB 10: ANALYTICS                                                          */
/* ═══════════════════════════════════════════════════════════════════════════ */

function AnalyticsTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/admin/analytics")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>;

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const distributions = data?.distributions || {};

  return (
    <div className="space-y-6">
      <SectionHeader title="Analytics" subtitle="Platform insights and metrics" />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`₹${(summary.total_revenue ?? 0).toLocaleString()}`} icon={<IndianRupee className="w-4 h-4" style={{ color: "#16A34A" }} />} color="#16A34A" />
        <StatCard label="Avg Order Value" value={`₹${summary.avg_order_value ?? 0}`} icon={<TrendingUp className="w-4 h-4" style={{ color: "#2563EB" }} />} color="#2563EB" />
        <StatCard label="Cancellation Rate" value={`${summary.cancellation_rate ?? 0}%`} icon={<AlertCircle className="w-4 h-4" style={{ color: "#EF4444" }} />} color="#EF4444" />
        <StatCard label="Total Users" value={String(summary.total_users ?? 0)} icon={<Users className="w-4 h-4" style={{ color: "#8B5CF6" }} />} color="#8B5CF6" />
      </div>

      {/* Revenue Chart */}
      <div className={CARD}>
        <SectionHeader title="Revenue Trend" subtitle="Last 30 days" />
        {charts.orders_by_day?.length > 0 ? (
          <div className="h-48 flex items-end gap-1">
            {charts.orders_by_day.map((d: any, i: number) => {
              const maxRev = Math.max(...charts.orders_by_day.map((r: any) => r.revenue), 1);
              const height = (d.revenue / maxRev) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ₹${d.revenue.toLocaleString()}`}>
                  <div className="w-full bg-[#16A34A] rounded-t-md hover:bg-[#15803D] transition-colors" style={{ height: `${Math.max(height, 4)}%` }} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-[#64748B]">No data yet</div>
        )}
      </div>

      {/* Order Status Distribution */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className={CARD}>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-3">Order Status</h3>
          <div className="space-y-2">
            {Object.entries(distributions.order_statuses || {}).map(([status, count]: [string, any]) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full min-w-[80px] ${STATUS_BADGE[status] || ""}`}>{status}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${(count / Math.max(summary.total_orders || 1, 1)) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-white w-8 text-right">{String(count)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={CARD}>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-3">Booking Status</h3>
          <div className="space-y-2">
            {Object.entries(distributions.booking_statuses || {}).map(([status, count]: [string, any]) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full min-w-[80px] ${STATUS_BADGE[status] || ""}`}>{status}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${(count / Math.max(summary.total_bookings || 1, 1)) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-white w-8 text-right">{String(count)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Role Distribution */}
      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-3">User Roles</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(distributions.roles || {}).map(([role, count]: [string, any]) => (
            <div key={role} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 dark:border-white/10">
              <div className={`w-3 h-3 rounded-full ${role === "admin" ? "bg-red-500" : role === "professional" ? "bg-amber-500" : role === "vendor" ? "bg-blue-500" : "bg-gray-400"}`} />
              <span className="text-xs font-bold text-[#0F172A] dark:text-white capitalize">{role}</span>
              <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">{String(count)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 11: SUPPORT                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

function SupportTab() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    apiGet<{ sessions: any[] }>("/support/admin/sessions")
      .then((data) => setSessions(data.sessions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Load messages when session selected
  useEffect(() => {
    if (!selectedSession?.id || selectedSession.id.startsWith("mock-")) return;
    const load = async () => {
      try {
        const data = await apiGet<{ messages: any[] }>(`/support/chat/${selectedSession.id}/messages`);
        setChatMessages(data.messages || []);
      } catch { /* ignore */ }
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [selectedSession?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const updateSession = async (id: string, status: string) => {
    try {
      await apiPatch(`/support/admin/sessions/${id}`, { status });
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      if (selectedSession?.id === id) setSelectedSession({ ...selectedSession, status });
    } catch (err: any) { setError(err.message); }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedSession) return;
    setSending(true);
    try {
      await apiPost("/support/chat/message", { session_id: selectedSession.id, message: chatInput.trim() });
      setChatInput("");
      const data = await apiGet<{ messages: any[] }>(`/support/chat/${selectedSession.id}/messages`);
      setChatMessages(data.messages || []);
    } catch (err: any) { setError(err.message); }
    finally { setSending(false); }
  };

  const waiting = sessions.filter(s => s.status === "waiting");
  const active = sessions.filter(s => s.status === "active");
  const closed = sessions.filter(s => s.status === "closed");

  return (
    <div className="space-y-6">
      <SectionHeader title="Support" subtitle="Live customer chat sessions" action={
        <a href="/admin/support" className="text-xs font-bold text-[#2563EB] hover:text-blue-600 flex items-center gap-1">
          <Headphones className="w-3.5 h-3.5" /> Open Full Dashboard
        </a>
      } />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className={CARD + " flex items-center gap-3"}>
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center"><Clock className="w-4 h-4 text-amber-500" /></div>
          <div>
            <p className="text-xl font-extrabold text-[#0F172A] dark:text-white">{waiting.length}</p>
            <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase">Waiting</p>
          </div>
        </div>
        <div className={CARD + " flex items-center gap-3"}>
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/15 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-green-500" /></div>
          <div>
            <p className="text-xl font-extrabold text-[#0F172A] dark:text-white">{active.length}</p>
            <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase">Active</p>
          </div>
        </div>
        <div className={CARD + " flex items-center gap-3"}>
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-gray-400" /></div>
          <div>
            <p className="text-xl font-extrabold text-[#0F172A] dark:text-white">{closed.length}</p>
            <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase">Closed</p>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Session list + chat */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-16 bg-white dark:bg-[#111827] rounded-xl animate-pulse" />)
          ) : sessions.length === 0 ? (
            <div className={CARD + " py-10 text-center"}>
              <Inbox className="w-8 h-8 text-[#64748B] dark:text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#64748B] dark:text-slate-400">No sessions yet</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Customers will appear when they chat</p>
            </div>
          ) : (
            [...waiting, ...active, ...closed].map((s) => (
              <button key={s.id} onClick={() => setSelectedSession(s)} className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedSession?.id === s.id ? "border-[#2563EB] bg-blue-50 dark:bg-blue-500/10" : "border-gray-100 dark:border-white/10 bg-white dark:bg-[#111827] hover:shadow-sm"
              } ${s.status === "waiting" ? "border-l-4 border-l-amber-400" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.status === "waiting" ? "bg-amber-500 animate-pulse" : s.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm font-bold text-[#0F172A] dark:text-white">{s.guest_name || "Customer"}</span>
                  </div>
                  {s.status === "waiting" && (
                    <button onClick={(e) => { e.stopPropagation(); updateSession(s.id, "active"); }} className="bg-[#16A34A] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-green-600">Accept</button>
                  )}
                </div>
                {s.last_message && <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 truncate">{s.last_message.message}</p>}
                <p className="text-[10px] text-gray-400 dark:text-slate-600 mt-0.5">{new Date(s.created_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</p>
              </button>
            ))
          )}
        </div>

        {/* Chat panel */}
        <div className={CARD + " flex flex-col"} style={{ minHeight: 360 }}>
          {selectedSession ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                <div>
                  <p className="text-sm font-extrabold text-[#0F172A] dark:text-white">{selectedSession.guest_name || "Customer"}</p>
                  <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-400">{selectedSession.status}</p>
                </div>
                <div className="flex gap-2">
                  {selectedSession.status === "waiting" && <button onClick={() => updateSession(selectedSession.id, "active")} className="bg-[#16A34A] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-600">Accept</button>}
                  {selectedSession.status !== "closed" && <button onClick={() => updateSession(selectedSession.id, "closed")} className="text-xs font-bold text-gray-400 hover:text-gray-600">Close</button>}
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-2" style={{ minHeight: 200 }}>
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">No messages yet</p>
                ) : chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender_role === "agent" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      m.sender_role === "agent" ? "bg-[#2563EB] text-white rounded-br-md" : "bg-gray-100 dark:bg-white/5 text-[#0F172A] dark:text-white rounded-bl-md"
                    }`}>{m.message}</div>
                  </div>
                ))}
              </div>
              {selectedSession.status !== "closed" && (
                <div className="border-t border-gray-100 dark:border-white/10 pt-2 flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Reply..." className="flex-1 text-sm bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2 outline-none text-[#0F172A] dark:text-white" disabled={sending} />
                  <button onClick={sendMessage} disabled={!chatInput.trim() || sending} className="bg-[#2563EB] text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 disabled:opacity-40">Send</button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Headphones className="w-8 h-8 text-[#64748B] dark:text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-[#64748B] dark:text-slate-400">Select a session to chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 12: NOTIFICATIONS                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

function NotificationsTab() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" subtitle="System notifications" />

      <div className={CARD + " py-16 text-center"}>
        <Bell className="w-10 h-10 text-[#16A34A] mx-auto mb-3" />
        <p className="font-extrabold text-[#0F172A] dark:text-white">All caught up!</p>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">No new system notifications.</p>
      </div>

      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-3">Notification Types</h3>
        <div className="space-y-2">
          {[
            "New professional registered",
            "New vendor application",
            "Payment dispute submitted",
            "Refund request",
            "Product reported",
            "Customer complaint",
          ].map((n, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-white/5 last:border-0">
              <Bell className="w-4 h-4 text-[#64748B] dark:text-slate-400" />
              <span className="text-xs text-[#64748B] dark:text-slate-400">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 13: SETTINGS                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

function SettingsTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Admin account settings" />

      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Account</h3>
        <div className="space-y-3">
          <InfoRow label="Role" value="Admin" />
          <InfoRow label="Access Level" value="Full Platform Access" />
        </div>
      </div>

      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-3">Session</h3>
        {confirmLogout ? (
          <div className="flex gap-3">
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-red-500 transition-colors">
              <LogOut className="w-4 h-4" /> Confirm Logout
            </button>
            <button onClick={() => setConfirmLogout(false)} className="flex-1 text-sm font-bold text-[#64748B] dark:text-slate-400 py-3 rounded-xl border border-gray-200 dark:border-white/15">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmLogout(true)} className="w-full flex items-center justify-center gap-2 border border-red-200 dark:border-red-500/30 text-red-500 font-bold text-sm py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        )}
      </div>
    </div>
  );
}
