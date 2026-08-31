import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Store, Package, TrendingUp, Star, Clock, AlertCircle } from "lucide-react";
import { apiGet } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "../components/PageHeader";

interface VendorData {
  shop_name: string;
  shop_description: string;
  shop_location: string;
  verification_status: string;
  rating: number;
  total_sales: number;
  created_at: string;
}

interface DashboardStats {
  product_count: number;
  total_sales: number;
  rating: number;
}

export default function VendorDashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    apiGet<{ vendor: VendorData; stats: DashboardStats }>("/vendors/me/dashboard")
      .then((data) => {
        setVendor(data.vendor);
        setStats(data.stats);
      })
      .catch((err) => {
        setError(err.message || "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <>
        <PageHeader eyebrow="Vendor Portal" title="Vendor Dashboard" subtitle="Sign in to manage your shop." />
        <section className="py-16 text-center">
          <Link to="/login?next=/vendor/dashboard" className="text-[#2563EB] font-bold hover:underline">
            Sign in →
          </Link>
        </section>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Vendor Portal" title="Vendor Dashboard" subtitle="Loading your shop..." />
        <section className="py-16 text-center text-[#64748B]">Loading...</section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Vendor Portal" title="Vendor Dashboard" subtitle="Something went wrong." />
        <section className="py-16 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Link to="/register/vendor" className="text-[#2563EB] font-bold hover:underline">
            Apply as a vendor →
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Vendor Portal"
        title={vendor?.shop_name || "Vendor Dashboard"}
        subtitle={vendor?.shop_description || "Manage your shop on FixKart."}
      />

      <section className="py-10 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Verification Status */}
          {vendor?.verification_status === "pending" && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="font-bold text-amber-800 dark:text-amber-400">Verification Pending</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400/80">
                    Your shop is under review. Our team will verify your details shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {vendor?.verification_status === "rejected" && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
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
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10">
              <Package className="w-5 h-5 text-[#2563EB] mb-2" />
              <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{stats?.product_count ?? 0}</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Products</p>
            </div>
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10">
              <TrendingUp className="w-5 h-5 text-[#16A34A] mb-2" />
              <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{stats?.total_sales ?? 0}</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Total Sales</p>
            </div>
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10">
              <Star className="w-5 h-5 text-[#F59E0B] mb-2" />
              <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{stats?.rating?.toFixed(1) ?? "0.0"}</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Rating</p>
            </div>
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10">
              <Store className="w-5 h-5 text-[#8B5CF6] mb-2" />
              <p className="text-sm font-bold text-[#0F172A] dark:text-white">{vendor?.shop_location || "—"}</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Location</p>
            </div>
          </div>

          {/* Shop Info */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 lg:p-8 border border-gray-100 dark:border-white/10 shadow-sm">
            <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-4">Shop Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">Shop Name</p>
                <p className="text-sm font-medium text-[#0F172A] dark:text-white">{vendor?.shop_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">Description</p>
                <p className="text-sm font-medium text-[#0F172A] dark:text-white">{vendor?.shop_description || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium text-[#0F172A] dark:text-white">{vendor?.shop_location || "—"}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {vendor?.verification_status === "verified" && (
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products?vendor=me"
                className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors"
              >
                <Package className="w-4 h-4" /> Manage Products
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white dark:bg-[#111827] text-[#0F172A] dark:text-white font-bold text-sm px-6 py-3 rounded-xl border border-gray-200 dark:border-white/15 hover:bg-gray-50 dark:hover:bg-[#1a2332] transition-colors"
              >
                View Marketplace
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
