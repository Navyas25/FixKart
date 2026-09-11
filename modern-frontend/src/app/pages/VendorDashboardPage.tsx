import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  DollarSign,
  Truck,
  BoxesIcon,
  Star,
  Tags,
  Store,
  Bell,
  ShieldCheck,
  LogOut,
  Loader2,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  IndianRupee,
  PackageCheck,
  AlertTriangle,
  ChevronRight,
  Upload,
  IndianRupeeIcon,
  Copy,
  RefreshCw,
  MessageSquare,
  FileText,
  Settings,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useTheme } from "../../lib/theme";
import { PageHeader } from "../components/PageHeader";

type Tab =
  | "dashboard"
  | "products"
  | "orders"
  | "analytics"
  | "payments"
  | "shipping"
  | "inventory"
  | "reviews"
  | "offers"
  | "store"
  | "notifications"
  | "account";

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500[0.15] dark:text-blue-400",
  packed: "bg-purple-100 text-purple-700 dark:bg-purple-500[0.15] dark:text-purple-400",
  shipped: "bg-amber-100 text-amber-700 dark:bg-amber-500[0.15] dark:text-amber-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-500[0.15] dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500[0.15] dark:text-red-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500[0.15] dark:text-amber-400",
};

const PRODUCT_STATUS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-500[0.15] dark:text-green-400",
  draft: "bg-gray-100 text-gray-600 dark:bg-white[0.1] dark:text-slate-400",
  out_of_stock: "bg-red-100 text-red-700 dark:bg-red-500[0.15] dark:text-red-400",
  deleted: "bg-gray-100 text-gray-600 dark:bg-white[0.1] dark:text-slate-400",
};

const inputClass =
  "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white[0.15] text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

const CARD =
  "bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white[0.1] shadow-sm";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN DASHBOARD COMPONENT                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function VendorDashboardPage() {
  const { isLoggedIn, user, logout } = useAuth();
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
      await apiGet("/vendors/me/dashboard");
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
        <PageHeader
          eyebrow="Vendor Portal"
          title="Vendor Dashboard"
          subtitle="Sign in to manage your shop."
        />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white[0.1] py-12">
            <Store className="w-10 h-10 text-[#2563EB] mx-auto mb-3" />
            <p className="text-[#64748B] dark:text-slate-400 mb-6">
              Sign in to your vendor account to manage your store, products, and
              orders.
            </p>
            <Link
              to="/login?next=/vendor/dashboard"
              className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
            >
              Vendor Sign In
            </Link>
          </div>
        </section>
      </>
    );
  }

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { key: "orders", label: "Orders", icon: <ShoppingCart className="w-4 h-4" /> },
    { key: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "payments", label: "Payments", icon: <DollarSign className="w-4 h-4" /> },
    { key: "shipping", label: "Shipping", icon: <Truck className="w-4 h-4" /> },
    { key: "inventory", label: "Inventory", icon: <BoxesIcon className="w-4 h-4" /> },
    { key: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
    { key: "offers", label: "Offers", icon: <Tags className="w-4 h-4" /> },
    { key: "store", label: "Store", icon: <Store className="w-4 h-4" /> },
    { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { key: "account", label: "Account", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Vendor Portal"
        title="Vendor Dashboard"
        subtitle={user?.email || "Manage your store, products, and orders"}
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white[0.1] p-4 shadow-sm">
              <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-gray-100 dark:border-white[0.1] mb-3">
                <div className="w-9 h-9 bg-[#2563EB] rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-extrabold text-[#0F172A] dark:text-white text-sm leading-tight">
                    FixKart <span className="text-[#2563EB]">Vendor</span>
                  </p>
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400 font-semibold">
                    Seller portal
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
                        : "text-[#64748B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white[0.1] hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white[0.1]">
                {confirmLogout ? (
                  <div className="space-y-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-red-500 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Confirm logout
                    </button>
                    <button
                      onClick={() => setConfirmLogout(false)}
                      className="w-full text-xs font-bold text-[#64748B] dark:text-slate-400 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white[0.1]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 text-sm font-bold text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500[0.1] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div>
            {error && (
              <div className="mb-5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500[0.1] rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {saveMsg && (
              <div className="mb-5 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500[0.1] rounded-xl px-4 py-3 flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                {saveMsg}
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
                {tab === "dashboard" && <DashboardTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "products" && <ProductsTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "orders" && <OrdersTab setError={setError} />}
                {tab === "analytics" && <AnalyticsTab setError={setError} />}
                {tab === "payments" && <PaymentsTab setError={setError} />}
                {tab === "shipping" && <ShippingTab setError={setError} />}
                {tab === "inventory" && <InventoryTab setError={setError} />}
                {tab === "reviews" && <ReviewsTab setError={setError} />}
                {tab === "offers" && <OffersTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "store" && <StoreTab setError={setError} setSaveMsg={setSaveMsg} />}
                {tab === "notifications" && <NotificationsTab />}
                {tab === "account" && <AccountTab setError={setError} setSaveMsg={setSaveMsg} />}
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

function StatCard({
  label,
  value,
  icon,
  color = "#2563EB",
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
          {label}
        </p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{value}</p>
      {subtitle && (
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{subtitle}</p>
      )}
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

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 1: DASHBOARD / OVERVIEW                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

function DashboardTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/vendors/me/dashboard")
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
  const vendor = data?.vendor || {};

  return (
    <div className="space-y-6">
      {/* Verification Banner */}
      {vendor.verification_status === "pending" && (
        <div className="bg-amber-50 dark:bg-amber-500[0.1] border border-amber-200 dark:border-amber-500[0.2] rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-400">Verification Pending</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400/80">
                Your shop is under review. Our team will verify your details shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {vendor.verification_status === "rejected" && (
        <div className="bg-red-50 dark:bg-red-500[0.1] border border-red-200 dark:border-red-500[0.2] rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-400">Application Rejected</h3>
              <p className="text-sm text-red-700 dark:text-red-400/80">
                Your vendor application was not approved. Please contact support for details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Sales"
          value={`Rs. ${stats.today_sales ?? 0}`}
          icon={<IndianRupee className="w-4 h-4" style={{ color: "#16A34A" }} />}
          color="#16A34A"
        />
        <StatCard
          label="Total Revenue"
          value={`Rs. ${stats.total_revenue ?? 0}`}
          icon={<TrendingUp className="w-4 h-4" style={{ color: "#2563EB" }} />}
          color="#2563EB"
          subtitle={`${stats.total_orders ?? 0} orders`}
        />
        <StatCard
          label="Pending Orders"
          value={String(stats.pending_orders ?? 0)}
          icon={<Clock className="w-4 h-4" style={{ color: "#D97706" }} />}
          color="#D97706"
        />
        <StatCard
          label="Total Products"
          value={String(stats.product_count ?? 0)}
          icon={<Package className="w-4 h-4" style={{ color: "#7C3AED" }} />}
          color="#7C3AED"
          subtitle={`${stats.active_products ?? 0} active`}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Low Stock"
          value={String(stats.low_stock ?? 0)}
          icon={<AlertTriangle className="w-4 h-4" style={{ color: "#F59E0B" }} />}
          color="#F59E0B"
          subtitle="Products need restock"
        />
        <StatCard
          label="Out of Stock"
          value={String(stats.out_of_stock ?? 0)}
          icon={<AlertCircle className="w-4 h-4" style={{ color: "#EF4444" }} />}
          color="#EF4444"
        />
        <StatCard
          label="Rating"
          value={Number(stats.rating ?? 0).toFixed(1)}
          icon={<Star className="w-4 h-4" style={{ color: "#F59E0B" }} />}
          color="#F59E0B"
          subtitle={`${stats.review_count ?? 0} reviews`}
        />
        <StatCard
          label="Customer Count"
          value={String(stats.total_orders ?? 0)}
          icon={<ShoppingCart className="w-4 h-4" style={{ color: "#06B6D4" }} />}
          color="#06B6D4"
          subtitle="Unique orders"
        />
      </div>

      {/* Recent Orders */}
      <div className={CARD}>
        <SectionHeader
          title="Recent Orders"
          subtitle={`${data?.recent_orders?.length || 0} recent`}
        />
        {!data?.recent_orders?.length ? (
          <p className="text-sm text-[#64748B] dark:text-slate-400 py-8 text-center">
            No orders yet. Orders will appear here once customers start buying.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Items</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.recent_orders.map((order: any) => (
                  <tr key={order.id} className="border-t border-gray-100 dark:border-white/5">
                    <td className="py-3 pr-4 font-bold text-[#0F172A] dark:text-white">
                      #{order.id?.slice(0, 8)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[order.status] || STATUS_BADGE.pending}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#64748B] dark:text-slate-400">
                      {order.item_count ?? "–"}
                    </td>
                    <td className="py-3 pr-4 font-bold text-[#0F172A] dark:text-white">
                      Rs. {order.vendor_total ?? 0}
                    </td>
                    <td className="py-3 text-[#64748B] dark:text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {data?.low_stock_products?.length > 0 && (
        <div className={CARD}>
          <SectionHeader title="Low Stock Alert" subtitle="Products running low" />
          <div className="space-y-2">
            {data.low_stock_products.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white[0.1] flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-[#64748B] dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0F172A] dark:text-white truncate">{p.name}</p>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">Rs. {p.price}</p>
                </div>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                  p.stock === 0
                    ? "bg-red-100 text-red-700 dark:bg-red-500[0.15] dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-500[0.15] dark:text-amber-400"
                }`}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 2: PRODUCT MANAGEMENT                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ProductsTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", discount_price: "", stock: "",
    unit: "piece", brand: "", sku: "", image_url: "", category_id: "", status: "active",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (statusFilter) params.set("status", statusFilter);
      const data = await apiGet(`/vendors/me/products?${params.toString()}`);
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", discount_price: "", stock: "", unit: "piece", brand: "", sku: "", image_url: "", category_id: "", status: "active" });
    setEditingProduct(null);
    setShowForm(false);
  };

  const openEdit = (p: any) => {
    setForm({
      name: p.name || "", description: p.description || "", price: String(p.price || ""),
      discount_price: p.discount_price ? String(p.discount_price) : "", stock: String(p.stock ?? 0),
      unit: p.unit || "piece", brand: p.brand || "", sku: p.sku || "", image_url: p.image_url || "",
      category_id: p.category_id || "", status: p.status || "active",
    });
    setEditingProduct(p);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: any = { ...form };
      if (body.price) body.price = parseFloat(body.price);
      if (body.discount_price) body.discount_price = parseFloat(body.discount_price);
      else body.discount_price = null;
      body.stock = parseInt(body.stock || "0", 10);
      if (!body.category_id) body.category_id = null;

      if (editingProduct) {
        await apiPatch(`/vendors/me/products/${editingProduct.id}`, body);
        setSaveMsg("Product updated successfully.");
      } else {
        await apiPost("/vendors/me/products", body);
        setSaveMsg("Product created successfully.");
      }
      resetForm();
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this product?")) return;
    try {
      await apiDelete(`/vendors/me/products/${id}`);
      setSaveMsg("Product removed.");
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Product Management"
        subtitle={`${products.length} products`}
        action={
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        }
      />

      {/* Product Form */}
      {showForm && (
        <div className={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <button onClick={resetForm} className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required placeholder="Product name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputClass} placeholder="Brand name" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} rows={3} placeholder="Product description" />
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Price (Rs. ) *</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} required placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Discount Price (Rs. )</label>
                <input type="number" step="0.01" min="0" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} className={inputClass} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Stock *</label>
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} required placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">SKU</label>
                <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputClass} placeholder="SKU" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Image URL</label>
                <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
              <button type="button" onClick={resetForm} className="text-xs font-bold text-[#64748B] dark:text-slate-400 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white[0.1] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] dark:text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className={`${inputClass} pl-10`} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white[0.15] text-sm font-bold px-4 py-3 rounded-xl outline-none text-[#0F172A] dark:text-white">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <Package className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No products yet</p>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Add your first product to start selling on FixKart.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className={CARD}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-white[0.1] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-[#64748B] dark:text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-extrabold text-[#0F172A] dark:text-white truncate">{p.name}</p>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${PRODUCT_STATUS[p.status] || PRODUCT_STATUS.draft}`}>
                      {p.status?.replace("_", " ")}
                    </span>
                    {p.featured && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F59E0B][0.15] text-[#D97706]">Featured</span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    {p.brand && `${p.brand} · `}Stock: {p.stock} · SKU: {p.sku || "–"}
                    {p.category?.name ? ` · ${p.category.name}` : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {p.discount_price ? (
                    <div>
                      <p className="text-sm font-extrabold text-[#16A34A]">Rs. {p.discount_price}</p>
                      <p className="text-xs text-[#64748B] line-through">Rs. {p.price}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-extrabold text-[#0F172A] dark:text-white">Rs. {p.price}</p>
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(p)} className="p-2 text-[#64748B] dark:text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-500[0.1] rounded-xl transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-[#64748B] dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500[0.1] rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
/*  TAB 3: ORDER MANAGEMENT                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

function OrdersTab({ setError }: { setError: (s: string) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const data = await apiGet(`/vendors/me/orders${params}`);
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await apiPatch(`/vendors/me/orders/${orderId}/status`, { status });
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const NEXT_STATUS: Record<string, string> = {
    confirmed: "packed",
    packed: "shipped",
    shipped: "delivered",
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Order Management" subtitle={`${orders.length} orders`} />

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {["", "confirmed", "packed", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-colors ${
              statusFilter === s
                ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]"
                : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white[0.1]"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <ShoppingCart className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No orders found</p>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Orders will appear here once customers purchase your products.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className={CARD}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-extrabold text-[#0F172A] dark:text-white text-sm">
                      Order #{order.id?.slice(0, 8)}
                    </p>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[order.status] || STATUS_BADGE.pending}`}>
                      {order.status}
                    </span>
                  </div>
                  {order.profile && (
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      Customer: <span className="font-bold text-[#0F172A] dark:text-white">{order.profile.full_name || "Customer"}</span>
                      {order.profile.phone ? ` · ${order.profile.phone}` : ""}
                    </p>
                  )}
                  {/* Vendor items in this order */}
                  {order.vendor_items?.map((item: any, idx: number) => (
                    <p key={idx} className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                      {item.product?.name || "Product"} × {item.quantity} — Rs. {item.unit_price * item.quantity}
                    </p>
                  ))}
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-[#16A34A]">Rs. {order.vendor_total ?? 0}</p>
                  </div>
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                      disabled={updating === order.id}
                      className="flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60"
                    >
                      {updating === order.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      Mark {NEXT_STATUS[order.status]}
                    </button>
                  )}
                  {order.status === "confirmed" && (
                    <button
                      onClick={() => updateStatus(order.id, "cancelled")}
                      disabled={updating === order.id}
                      className="flex items-center gap-1.5 border border-red-200 dark:border-red-500[0.3] text-red-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500[0.1] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
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
/*  TAB 4: SALES & ANALYTICS                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

function AnalyticsTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/vendors/me/analytics")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const summary = data?.summary || {};
  const topProducts = data?.top_products || [];
  const dailySales = data?.daily_sales || [];

  // Simple bar chart using CSS
  const maxRevenue = Math.max(...dailySales.map((d: any) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <SectionHeader title="Sales & Analytics" subtitle="Business insights and performance" />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={`Rs. ${summary.total_revenue ?? 0}`}
          icon={<TrendingUp className="w-4 h-4" style={{ color: "#16A34A" }} />}
          color="#16A34A"
        />
        <StatCard
          label="Total Orders"
          value={String(summary.total_orders ?? 0)}
          icon={<ShoppingCart className="w-4 h-4" style={{ color: "#2563EB" }} />}
          color="#2563EB"
        />
        <StatCard
          label="Avg Order Value"
          value={`Rs. ${summary.avg_order_value ?? 0}`}
          icon={<IndianRupee className="w-4 h-4" style={{ color: "#7C3AED" }} />}
          color="#7C3AED"
        />
      </div>

      {/* Sales Chart (Last 30 days) */}
      <div className={CARD}>
        <SectionHeader title="Daily Sales (Last 30 Days)" subtitle="Revenue trend" />
        {dailySales.length === 0 ? (
          <p className="text-sm text-[#64748B] dark:text-slate-400 py-8 text-center">
            No sales data yet. Charts will appear once orders come in.
          </p>
        ) : (
          <div className="flex items-end gap-1 h-40 mt-4">
            {dailySales.map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#2563EB] rounded-t-md hover:bg-blue-400 transition-colors min-h-[2px]"
                  style={{ height: `${(d.revenue / maxRevenue) * 120}px` }}
                  title={`${d.date}: Rs. ${Math.round(d.revenue)}`}
                />
                {i % 5 === 0 && (
                  <span className="text-[8px] text-[#64748B] dark:text-slate-400">
                    {d.date.slice(5)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className={CARD}>
        <SectionHeader title="Top Selling Products" subtitle="Best performers" />
        {topProducts.length === 0 ? (
          <p className="text-sm text-[#64748B] dark:text-slate-400 py-8 text-center">
            No product sales data yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">Qty Sold</th>
                  <th className="pb-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topProducts.map((p: any, i: number) => (
                  <tr key={p.product_id} className="border-t border-gray-100 dark:border-white/5">
                    <td className="py-3 pr-4 font-bold text-[#64748B] dark:text-slate-400">{i + 1}</td>
                    <td className="py-3 pr-4 font-bold text-[#0F172A] dark:text-white">{p.name}</td>
                    <td className="py-3 pr-4 text-[#64748B] dark:text-slate-400">{p.quantity}</td>
                    <td className="py-3 font-bold text-[#16A34A]">Rs. {p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 5: PAYMENTS & EARNINGS                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function PaymentsTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      apiGet("/vendors/me/dashboard"),
      apiGet("/vendors/me/analytics"),
    ]).then(([dashRes, analyticsRes]) => {
      const dash = dashRes.status === "fulfilled" ? dashRes.value : null;
      const analytics = analyticsRes.status === "fulfilled" ? analyticsRes.value : null;
      setData({
        vendor: dash?.vendor,
        stats: dash?.stats,
        analytics: analytics,
      });
    }).catch(() => setError("Could not load payment data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const vendor = data?.vendor || {};

  return (
    <div className="space-y-6">
      <SectionHeader title="Payments & Earnings" subtitle="Track your revenue and payouts" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Earnings"
          value={`Rs. ${stats.total_revenue ?? 0}`}
          icon={<DollarSign className="w-4 h-4" style={{ color: "#16A34A" }} />}
          color="#16A34A"
          subtitle="After platform commission"
        />
        <StatCard
          label="Platform Commission"
          value={`${5}%`}
          icon={<FileText className="w-4 h-4" style={{ color: "#64748B" }} />}
          color="#64748B"
        />
        <StatCard
          label="Net Earnings"
          value={`Rs. ${Math.round((stats.total_revenue ?? 0) * 0.95)}`}
          icon={<IndianRupee className="w-4 h-4" style={{ color: "#2563EB" }} />}
          color="#2563EB"
          subtitle="Estimated after 5% commission"
        />
      </div>

      {/* Payment Info */}
      <div className={CARD}>
        <SectionHeader title="Payment Information" subtitle="Your bank/payment details" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">Bank Name</p>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white mt-0.5">{vendor.bank_name || "Not set"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">Account Number</p>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white mt-0.5">
              {vendor.bank_account_number ? `****${vendor.bank_account_number.slice(-4)}` : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">IFSC Code</p>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white mt-0.5">{vendor.bank_ifsc || "Not set"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">UPI ID</p>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white mt-0.5">{vendor.upi_id || "Not set"}</p>
          </div>
        </div>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-4">
          💡 Update your bank details in the Store Profile tab to enable payouts.
        </p>
      </div>

      {/* Payout info */}
      <div className={CARD}>
        <SectionHeader title="Payout Schedule" />
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500[0.15] flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">Weekly Payouts</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Earnings are settled every Monday via bank transfer or UPI</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500[0.15] flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">5% Platform Commission</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">A 5% commission is deducted from each sale for platform services</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 6: SHIPPING & DELIVERY                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ShippingTab({ setError }: { setError: (s: string) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/vendors/me/orders")
      .then((data) => setOrders((data.orders || []).filter((o: any) => ["packed", "shipped"].includes(o.status))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Shipping & Delivery" subtitle="Manage shipping and tracking" />

      <div className={CARD}>
        <SectionHeader title="Shipping Methods" />
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#2563EB]" />
              <div>
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">Standard Shipping</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">5-7 business days</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#16A34A]">Free / Rs. 49</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#7C3AED]" />
              <div>
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">Express Shipping</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">2-3 business days</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#0F172A] dark:text-white">Rs. 99</span>
          </div>
        </div>
      </div>

      {/* Pending Shipments */}
      <div className={CARD}>
        <SectionHeader title="Pending Shipments" subtitle="Orders awaiting dispatch" />
        {loading ? (
          <div className="h-20 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
        ) : orders.length === 0 ? (
          <p className="text-sm text-[#64748B] dark:text-slate-400 py-8 text-center">
            No pending shipments. All orders are up to date.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-100 dark:border-white/5">
                <div>
                  <p className="text-sm font-bold text-[#0F172A] dark:text-white">Order #{order.id?.slice(0, 8)}</p>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    {order.vendor_items?.length || 0} items · Rs. {order.vendor_total ?? 0}
                  </p>
                </div>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[order.status]}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={CARD}>
        <p className="text-xs text-[#64748B] dark:text-slate-400">
          📦 Shipping labels and courier integration coming soon. For now, update tracking info from the Orders tab.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 7: INVENTORY MANAGEMENT                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

function InventoryTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/vendors/me/inventory");
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStock = async (productId: string, newStock: number) => {
    setUpdating(productId);
    try {
      await apiPatch(`/vendors/me/inventory/${productId}`, { stock: newStock });
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      <SectionHeader title="Inventory Management" subtitle="Track and manage stock levels" />

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Products"
          value={String(summary.total ?? 0)}
          icon={<Package className="w-4 h-4" style={{ color: "#2563EB" }} />}
          color="#2563EB"
        />
        <StatCard
          label="Low Stock"
          value={String(summary.low_stock ?? 0)}
          icon={<AlertTriangle className="w-4 h-4" style={{ color: "#F59E0B" }} />}
          color="#F59E0B"
          subtitle="⚠️ Restock soon"
        />
        <StatCard
          label="Out of Stock"
          value={String(summary.out_of_stock ?? 0)}
          icon={<AlertCircle className="w-4 h-4" style={{ color: "#EF4444" }} />}
          color="#EF4444"
          subtitle="🔴 Need attention"
        />
      </div>

      {/* Low Stock & Out of Stock Products */}
      {(data?.low_stock?.length > 0 || data?.out_of_stock?.length > 0) && (
        <div className={CARD}>
          <SectionHeader title="Products Needing Attention" subtitle="Low or out of stock items" />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">SKU</th>
                  <th className="pb-3 pr-4">Current Stock</th>
                  <th className="pb-3 pr-4">Adjust</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[...(data?.out_of_stock || []), ...(data?.low_stock || [])].map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-100 dark:border-white/5">
                    <td className="py-3 pr-4 font-bold text-[#0F172A] dark:text-white">{p.name}</td>
                    <td className="py-3 pr-4 text-[#64748B] dark:text-slate-400">{p.sku || "–"}</td>
                    <td className="py-3 pr-4">
                      <span className={`font-extrabold ${p.stock === 0 ? "text-red-500" : "text-amber-600"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateStock(p.id, Math.max(0, p.stock - 1))}
                          disabled={updating === p.id}
                          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white[0.1] flex items-center justify-center text-[#64748B] hover:bg-gray-200 dark:hover:bg-white[0.2] transition-colors"
                        >
                          −
                        </button>
                        <button
                          onClick={() => updateStock(p.id, p.stock + 1)}
                          disabled={updating === p.id}
                          className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white[0.1] flex items-center justify-center text-[#64748B] hover:bg-gray-200 dark:hover:bg-white[0.2] transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => {
                            const val = window.prompt(`Set stock for "${p.name}":`, String(p.stock));
                            if (val !== null) updateStock(p.id, parseInt(val, 10) || 0);
                          }}
                          disabled={updating === p.id}
                          className="w-7 h-7 rounded-lg bg-[#2563EB][0.1] flex items-center justify-center text-[#2563EB] hover:bg-[#2563EB][0.2] transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        p.stock === 0
                          ? "bg-red-100 text-red-700 dark:bg-red-500[0.15] dark:text-red-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500[0.15] dark:text-amber-400"
                      }`}>
                        {p.stock === 0 ? "Out of Stock" : "Low Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Products Inventory */}
      <div className={CARD}>
        <SectionHeader title="All Products" subtitle={`${data?.products?.length || 0} products`} />
        {(!data?.products || data.products.length === 0) ? (
          <p className="text-sm text-[#64748B] dark:text-slate-400 py-8 text-center">
            No products. Add products from the Products tab.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white dark:bg-[#111827]">
                <tr className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">SKU</th>
                  <th className="pb-3 pr-4">Stock</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.products.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-100 dark:border-white/5">
                    <td className="py-2.5 pr-4 font-bold text-[#0F172A] dark:text-white">{p.name}</td>
                    <td className="py-2.5 pr-4 text-[#64748B] dark:text-slate-400">{p.sku || "–"}</td>
                    <td className="py-2.5 pr-4 font-bold text-[#0F172A] dark:text-white">{p.stock}</td>
                    <td className="py-2.5">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        p.stock === 0 ? "bg-red-100 text-red-700 dark:bg-red-500[0.15] dark:text-red-400"
                        : p.stock <= 5 ? "bg-amber-100 text-amber-700 dark:bg-amber-500[0.15] dark:text-amber-400"
                        : "bg-green-100 text-green-700 dark:bg-green-500[0.15] dark:text-green-400"
                      }`}>
                        {p.stock === 0 ? "Out" : p.stock <= 5 ? "Low" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 8: REVIEWS & RATINGS                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ReviewsTab({ setError }: { setError: (s: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/vendors/me/reviews")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const average = data?.average ?? 0;
  const count = data?.count ?? 0;

  return (
    <div className="space-y-6">
      <SectionHeader title="Reviews & Ratings" subtitle={`${count} reviews · ${average} avg rating`} />

      {/* Rating Summary */}
      <div className={CARD + " flex items-center gap-6"}>
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

      {/* Review List */}
      {reviews.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <Star className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No reviews yet</p>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Customer reviews will appear here once they rate your products.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: any) => (
            <div key={review.id} className={CARD}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B][0.15] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-extrabold text-[#D97706]">
                    {review.profile?.full_name?.slice(0, 1) || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                      {review.profile?.full_name || "Customer"}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-gray-200 dark:text-gray-700"}`} />
                      ))}
                    </div>
                  </div>
                  {review.product && (
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      for <span className="font-bold">{review.product.name}</span>
                    </p>
                  )}
                  {review.comment && (
                    <p className="text-sm text-[#64748B] dark:text-slate-400 mt-2">{review.comment}</p>
                  )}
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
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
/*  TAB 9: OFFERS & DISCOUNTS                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

function OffersTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    code: "", title: "", description: "", type: "percentage",
    discount_value: "", min_order: "", max_uses: "",
    start_date: "", end_date: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ offers: any[] }>("/offers");
      setOffers(data.offers || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ code: "", title: "", description: "", type: "percentage", discount_value: "", min_order: "", max_uses: "", start_date: "", end_date: "" });
    setShowForm(true);
  };

  const startEdit = (offer: any) => {
    setEditing(offer);
    setForm({
      code: offer.code || "", title: offer.title || "", description: offer.description || "",
      type: offer.type || "percentage", discount_value: String(offer.discount_value || ""),
      min_order: String(offer.min_order || ""), max_uses: String(offer.max_uses || ""),
      start_date: offer.start_date ? offer.start_date.split("T")[0] : "",
      end_date: offer.end_date ? offer.end_date.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiPatch(`/offers/${editing.id}`, {
          title: form.title, description: form.description, discount_value: parseFloat(form.discount_value) || 0,
          min_order: parseFloat(form.min_order) || 0, max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          end_date: form.end_date || null,
        });
        setSaveMsg("Offer updated.");
      } else {
        await apiPost("/offers", {
          code: form.code, title: form.title, description: form.description, type: form.type,
          discount_value: parseFloat(form.discount_value) || 0, min_order: parseFloat(form.min_order) || 0,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          start_date: form.start_date || undefined, end_date: form.end_date || undefined,
        });
        setSaveMsg("Offer created.");
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleActive = async (offer: any) => {
    try {
      await apiPatch(`/offers/${offer.id}`, { is_active: !offer.is_active });
      await load();
    } catch (err: any) { setError(err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await apiDelete(`/offers/${id}`);
      await load();
    } catch (err: any) { setError(err.message); }
  };

  const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    percentage: { label: "% Off", color: "bg-blue-100 text-blue-700 dark:bg-blue-500[0.15] dark:text-blue-400" },
    fixed: { label: "Flat Rs.  Off", color: "bg-green-100 text-green-700 dark:bg-green-500[0.15] dark:text-green-400" },
    bogo: { label: "Buy 1 Get 1", color: "bg-purple-100 text-purple-700 dark:bg-purple-500[0.15] dark:text-purple-400" },
    seasonal: { label: "Seasonal", color: "bg-amber-100 text-amber-700 dark:bg-amber-500[0.15] dark:text-amber-400" },
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Offers & Discounts" subtitle="Create and manage promotions" action={
        <button onClick={startCreate} className="flex items-center gap-2 bg-[#2563EB] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-colors">
          <Tags className="w-3.5 h-3.5" /> Create Offer
        </button>
      } />

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />)}</div>
      ) : offers.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <Tags className="w-10 h-10 text-[#64748B] dark:text-slate-400 mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">No offers yet</p>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Create your first coupon or discount to boost sales.</p>
          <button onClick={startCreate} className="mt-4 bg-[#2563EB] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-colors">Create Offer</button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(offer => {
            const typeInfo = TYPE_LABELS[offer.type] || TYPE_LABELS.percentage;
            const isExpired = offer.end_date && new Date(offer.end_date) < new Date();
        return (
          <div key={offer.id} className={CARD + " hover:shadow-md transition-shadow"}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <p className="text-sm font-extrabold text-[#0F172A] dark:text-white">
                    {offer.title}
                  </p>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${typeInfo.color}`}
                  >
                    {typeInfo.label}
                  </span>
                  <span
                    className={offer.is_active ? "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" : "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-400"}
                  >
                    {offer.is_active ? "Active" : "Paused"}
                  </span>
                  {isExpired && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                      Expired
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-slate-400">
                  <span className="font-bold">
                    Code:{" "}
                    <span className="text-[#2563EB] dark:text-blue-400">{offer.code}</span>
                  </span>
                  <span>
                    {offer.type === "percentage"
                      ? `${offer.discount_value}% off`
                      : offer.type === "fixed"
                      ? `Rs. ${offer.discount_value} off`
                      : offer.type === "bogo"
                      ? `Buy ${offer.buy_quantity || 1} Get ${offer.get_quantity || 1}`
                      : `Seasonal: ${offer.discount_value}% off`}
                  </span>
                  {offer.min_order > 0 && <span>Min Rs. {offer.min_order}</span>}
                  {offer.max_uses && (
                    <span>
                      Max {offer.max_uses} uses ({offer.uses_count || 0} used)
                    </span>
                  )}
                  {offer.end_date && (
                    <span>Expires {new Date(offer.end_date).toLocaleDateString()}</span>
                  )}
                </div>

                {offer.description && (
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                    {offer.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(offer)}
                  className={offer.is_active ? "text-xs font-bold px-3 py-1.5 rounded-lg transition-colors text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10" : "text-xs font-bold px-3 py-1.5 rounded-lg transition-colors text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10"}
                >
                  {offer.is_active ? "Pause" : "Activate"}
                </button>
                <button
                  onClick={() => startEdit(offer)}
                  className="text-xs font-bold text-[#2563EB] hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(offer.id)}
                  className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
          })}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-[#111827] rounded-3xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white">{editing ? "Edit Offer" : "Create Offer"}</h3>
              <button onClick={() => setShowForm(false)} className="text-[#64748B] hover:text-[#0F172A]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Coupon Code</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. SUMMER20" className={inputClass} required disabled={!!editing} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Summer Sale" className={inputClass} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inputClass} disabled={!!editing}>
                  <option value="percentage">Percentage Discount</option>
                  <option value="fixed">Flat Amount Discount</option>
                  <option value="bogo">Buy X Get Y</option>
                  <option value="seasonal">Seasonal Offer</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    {form.type === "percentage" ? "% Discount" : form.type === "fixed" ? "Rs.  Discount" : "Discount Value"}
                  </label>
                  <input type="number" step="0.01" min="0" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Min Order (Rs. )</label>
                  <input type="number" min="0" value={form.min_order} onChange={e => setForm({...form, min_order: e.target.value})} className={inputClass} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Max Uses</label>
                  <input type="number" min="1" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} className={inputClass} placeholder="Unlimited" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#2563EB] text-white font-bold text-sm py-3 rounded-xl hover:bg-blue-600 transition-colors">
                  {editing ? "Update Offer" : "Create Offer"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 text-sm font-bold text-[#64748B] dark:text-slate-400 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white[0.1] transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 10: STORE PROFILE                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

function StoreTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    apiGet("/vendors/me/dashboard")
      .then((data) => {
        setVendor(data.vendor);
        setForm({
          shop_name: data.vendor?.shop_name || "",
          shop_description: data.vendor?.shop_description || "",
          shop_location: data.vendor?.shop_location || "",
          logo_url: data.vendor?.logo_url || "",
          banner_url: data.vendor?.banner_url || "",
          category: data.vendor?.category || "",
          business_address: data.vendor?.business_address || "",
          business_phone: data.vendor?.business_phone || "",
          business_hours: data.vendor?.business_hours || "",
          gst_number: data.vendor?.gst_number || "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiPatch("/vendors/me/store", form);
      setSaveMsg("Store profile updated successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-60 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Store Profile" subtitle="Your public store page settings" />

      <form onSubmit={handleSave} className="space-y-6">
        <div className={CARD}>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Shop Name *</label>
                <input type="text" value={form.shop_name || ""} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} className={inputClass} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Category</label>
                <input type="text" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="e.g. Power Tools" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea value={form.shop_description || ""} onChange={(e) => setForm({ ...form, shop_description: e.target.value })} className={inputClass} rows={3} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Location</label>
                <input type="text" value={form.shop_location || ""} onChange={(e) => setForm({ ...form, shop_location: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Business Phone</label>
                <input type="tel" value={form.business_phone || ""} onChange={(e) => setForm({ ...form, business_phone: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Business Hours</label>
              <input type="text" value={form.business_hours || ""} onChange={(e) => setForm({ ...form, business_hours: e.target.value })} className={inputClass} placeholder="Mon-Sat, 9 AM - 6 PM" />
            </div>
          </div>
        </div>

        <div className={CARD}>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Branding</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Logo URL</label>
              <input type="url" value={form.logo_url || ""} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className={inputClass} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Banner URL</label>
              <input type="url" value={form.banner_url || ""} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} className={inputClass} placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className={CARD}>
          <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Business Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Business Address</label>
              <input type="text" value={form.business_address || ""} onChange={(e) => setForm({ ...form, business_address: e.target.value })} className={inputClass} placeholder="Full business address" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">GST Number</label>
              <input type="text" value={form.gst_number || ""} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} className={inputClass} placeholder="GSTIN" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save Store Profile
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TAB 11: NOTIFICATIONS                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

function NotificationsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/vendors/me/notifications")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;

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
      <SectionHeader title="Notifications" subtitle={`${unreadCount} alerts`} />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className={CARD + " py-16 text-center"}>
          <Bell className="w-10 h-10 text-[#16A34A] mx-auto mb-3" />
          <p className="font-extrabold text-[#0F172A] dark:text-white">All caught up!</p>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
            No new notifications. Alerts for new orders, low stock, and reviews will appear here.
          </p>
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
/*  TAB 12: VENDOR ACCOUNT & VERIFICATION                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

function AccountTab({ setError, setSaveMsg }: { setError: (s: string) => void; setSaveMsg: (s: string) => void }) {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_account_number: "", bank_ifsc: "", bank_name: "", upi_id: "",
  });

  useEffect(() => {
    apiGet("/vendors/me/dashboard")
      .then((data) => {
        setVendor(data.vendor);
        setBankForm({
          bank_account_number: data.vendor?.bank_account_number || "",
          bank_ifsc: data.vendor?.bank_ifsc || "",
          bank_name: data.vendor?.bank_name || "",
          upi_id: data.vendor?.upi_id || "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const saveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiPatch("/vendors/me/bank", bankForm);
      setSaveMsg("Bank details updated successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
      </div>
    );
  }

  const VERIFICATION_META: Record<string, { label: string; badge: string; color: string }> = {
    pending: { label: "Pending Verification", badge: "bg-amber-100 text-amber-700 dark:bg-amber-500[0.15] dark:text-amber-400", color: "#D97706" },
    verified: { label: "Verified Vendor", badge: "bg-green-100 text-green-700 dark:bg-green-500[0.15] dark:text-green-400", color: "#16A34A" },
    rejected: { label: "Application Rejected", badge: "bg-red-100 text-red-700 dark:bg-red-500[0.15] dark:text-red-400", color: "#EF4444" },
    suspended: { label: "Account Suspended", badge: "bg-gray-100 text-gray-600 dark:bg-white[0.1] dark:text-slate-400", color: "#64748B" },
  };

  const vMeta = VERIFICATION_META[vendor?.verification_status] || VERIFICATION_META.pending;

  return (
    <div className="space-y-6">
      <SectionHeader title="Account & Verification" subtitle="Business details and KYC" />

      {/* Verification Status */}
      <div className={CARD}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${vMeta.color}15` }}>
            <ShieldCheck className="w-5 h-5" style={{ color: vMeta.color }} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#0F172A] dark:text-white">
              {vMeta.label}
            </p>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {vendor?.verification_status === "verified"
                ? "Your vendor account is fully verified and active."
                : vendor?.verification_status === "pending"
                ? "Your application is under review. You'll receive an email once approved."
                : "Contact support for more information."}
            </p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Business Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Shop Name", value: vendor?.shop_name },
            { label: "Category", value: vendor?.category },
            { label: "GST Number", value: vendor?.gst_number },
            { label: "Business Phone", value: vendor?.business_phone },
            { label: "Business Address", value: vendor?.business_address },
            { label: "Business Hours", value: vendor?.business_hours },
            { label: "Location", value: vendor?.shop_location },
            { label: "Member Since", value: vendor?.created_at ? new Date(vendor.created_at).toLocaleDateString() : "–" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">{item.label}</p>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white mt-0.5">{item.value || "Not set"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Details */}
      <form onSubmit={saveBank} className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-4">Bank / Payment Details</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Bank Name</label>
              <input type="text" value={bankForm.bank_name} onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })} className={inputClass} placeholder="e.g. HDFC Bank" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Account Number</label>
              <input type="text" value={bankForm.bank_account_number} onChange={(e) => setBankForm({ ...bankForm, bank_account_number: e.target.value })} className={inputClass} placeholder="Account number" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">IFSC Code</label>
              <input type="text" value={bankForm.bank_ifsc} onChange={(e) => setBankForm({ ...bankForm, bank_ifsc: e.target.value })} className={inputClass} placeholder="e.g. HDFC0001234" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">UPI ID</label>
              <input type="text" value={bankForm.upi_id} onChange={(e) => setBankForm({ ...bankForm, upi_id: e.target.value })} className={inputClass} placeholder="e.g. name@upi" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Bank Details
          </button>
        </div>
      </form>

      {/* Account Security */}
      <div className={CARD}>
        <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-2">Account Security</h3>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mb-4">
          Manage your password and security settings from the general Settings page.
        </p>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:text-blue-600 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" /> Go to Settings
        </Link>
      </div>
    </div>
  );
}
