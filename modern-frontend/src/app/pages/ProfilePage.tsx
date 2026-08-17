import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Package, Calendar, MapPin, Trash2, Plus, Check, Loader2, Settings, Coins, ArrowDownRight, ArrowUpRight, Heart } from "lucide-react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader, EmptyState } from "../components/PageHeader";

interface Address {
  id: string;
  address_line: string;
  city: string;
  state?: string;
  postal_code: string;
  is_default?: boolean;
}

export default function ProfilePage() {
  const { isLoggedIn, user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add-address form
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ address_line: "", city: "", postal_code: "", state: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Wallet
  const [wallet, setWallet] = useState<{ points: number; lifetime_points: number } | null>(null);
  const [walletTx, setWalletTx] = useState<any[]>([]);
  const [walletUnavailable, setWalletUnavailable] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.allSettled([
      apiGet<{ profile: any }>("/users/profile"),
      apiGet<{ addresses: Address[] }>("/addresses"),
      apiGet<{ wallet: { points: number; lifetime_points: number }; transactions: any[] }>("/wallet"),
    ]).then(([profileRes, addressesRes, walletRes]) => {
      if (cancelled) return;
      if (profileRes.status === "fulfilled") setProfile(profileRes.value.profile);
      if (addressesRes.status === "fulfilled") setAddresses(addressesRes.value.addresses || []);
      if (walletRes.status === "fulfilled") {
        setWallet(walletRes.value.wallet || { points: 0, lifetime_points: 0 });
        setWalletTx(walletRes.value.transactions || []);
      } else {
        setWalletUnavailable(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.address_line.trim() || !form.city.trim() || !form.postal_code.trim()) {
      setFormError("Please fill in the address, city and postal code.");
      return;
    }
    setSaving(true);
    try {
      const data = await apiPost<{ address: Address }>("/addresses", {
        address_line: form.address_line.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code: form.postal_code.trim(),
        is_default: addresses.length === 0,
      });
      setAddresses((prev) => [...prev, data.address]);
      setForm({ address_line: "", city: "", postal_code: "", state: "" });
      setFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Could not save the address.");
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    try {
      await apiDelete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message || "Could not delete the address.");
    }
  };

  const setDefault = async (addr: Address) => {
    try {
      await apiPatch(`/addresses/${addr.id}`, { is_default: true });
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === addr.id }))
      );
    } catch (err: any) {
      setError(err.message || "Could not update the address.");
    }
  };

  const inputClass =
    "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

  if (!isLoggedIn) {
    return (
      <>
        <PageHeader eyebrow="My Account" title="My Profile" subtitle="Manage your account" />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <p className="text-[#64748B] dark:text-slate-400 mb-6">Sign in to view and manage your profile.</p>
            <Link
              to="/login?next=/profile"
              className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="My Account"
        title="My Profile"
        subtitle={profile?.full_name || user?.email || "Manage your account details and saved addresses."}
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              to="/orders"
              className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] dark:bg-[#2563EB]/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <p className="font-extrabold text-[#0F172A] dark:text-white text-sm">My Orders</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">Track deliveries</p>
              </div>
            </Link>
            <Link
              to="/bookings"
              className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] dark:bg-[#F59E0B]/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#D97706]" />
              </div>
              <div>
                <p className="font-extrabold text-[#0F172A] dark:text-white text-sm">My Bookings</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">Scheduled services</p>
              </div>
            </Link>
            <Link
              to="/settings"
              className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] dark:bg-[#16A34A]/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div>
                <p className="font-extrabold text-[#0F172A] dark:text-white text-sm">Settings</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">Privacy & logout</p>
              </div>
            </Link>
            <Link
              to="/wishlist"
              className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#FEF2F2] dark:bg-[#DC2626]/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <p className="font-extrabold text-[#0F172A] dark:text-white text-sm">Wishlist</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">Saved products</p>
              </div>
            </Link>
          </div>

          {/* Account info */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 mb-8">
            <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-4">Account</h2>
            {loading ? (
              <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F59E0B] text-[#0F172A] flex items-center justify-center text-xl font-extrabold">
                    {(profile?.full_name || user?.email || "F").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-extrabold text-[#0F172A] dark:text-white">
                      {profile?.full_name || "FixKart user"}
                    </p>
                    <p className="text-sm text-[#64748B] dark:text-slate-400">
                      {user?.email || profile?.phone || "No email on file"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors border border-red-200 dark:border-red-500/30 px-5 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Log out
                </button>
              </div>
            )}
          </div>

          {/* Wallet / points */}
          {!walletUnavailable && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 mb-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] dark:bg-[#F59E0B]/15 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-[#D97706]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white">
                      FixKart Points
                    </h2>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      1 point = ₹1 off at checkout
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-[#0F172A] dark:text-white">
                    {Number(wallet?.points || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                    {Number(wallet?.lifetime_points || 0).toLocaleString()} earned all-time
                  </p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-xl px-4 py-3 mb-5 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Earn <strong className="text-[#D97706]">1 point per ₹10</strong> on every order and a{" "}
                <strong className="text-[#16A34A]">50-point bonus</strong> when a service booking is completed.
                Redeem them at checkout.
              </div>

              {walletTx.length > 0 && (
                <div className="space-y-2">
                  {walletTx.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between gap-3 border border-gray-100 dark:border-white/10 rounded-xl px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {Number(tx.points) >= 0 ? (
                          <ArrowDownRight className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                            {tx.description || (Number(tx.points) >= 0 ? "Points earned" : "Points redeemed")}
                          </p>
                          <p className="text-[10px] text-[#64748B] dark:text-slate-400">
                            {new Date(tx.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-extrabold flex-shrink-0 ${
                          Number(tx.points) >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"
                        }`}
                      >
                        {Number(tx.points) >= 0 ? "+" : ""}
                        {Number(tx.points).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white">Saved Addresses</h2>
              <button
                onClick={() => setFormOpen((v) => !v)}
                className="flex items-center gap-1.5 bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#2563EB] transition-colors"
              >
                {formOpen ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {formOpen ? "Close" : "Add Address"}
              </button>
            </div>

            {formOpen && (
              <form onSubmit={addAddress} className="bg-[#F8FAFC] dark:bg-white/5 rounded-2xl p-5 mb-5 space-y-3">
                {formError && (
                  <div className="text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-2.5">
                    {formError}
                  </div>
                )}
                <input
                  type="text"
                  value={form.address_line}
                  onChange={(e) => setForm({ ...form, address_line: e.target.value })}
                  placeholder="Address line"
                  className={inputClass}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                    className={inputClass}
                    required
                  />
                  <input
                    type="text"
                    value={form.postal_code}
                    onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                    placeholder="Postal code"
                    className={inputClass}
                    required
                  />
                </div>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="State (optional)"
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Address
                </button>
              </form>
            )}

            {loading ? (
              <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ) : addresses.length === 0 ? (
              <EmptyState
                icon="📍"
                title="No saved addresses"
                message="Add a delivery address to speed up checkout."
              />
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-center justify-between gap-4 border border-gray-100 dark:border-white/10 rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#2563EB]/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-[#2563EB]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0F172A] dark:text-white line-clamp-1">
                          {addr.address_line}
                        </p>
                        <p className="text-xs text-[#64748B] dark:text-slate-400">
                          {addr.city}
                          {addr.state ? `, ${addr.state}` : ""} — {addr.postal_code}
                        </p>
                        {addr.is_default && (
                          <span className="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-wide bg-[#16A34A]/15 text-[#16A34A] px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!addr.is_default && (
                        <button
                          onClick={() => setDefault(addr)}
                          className="text-[11px] font-bold text-[#2563EB] hover:text-blue-600 transition-colors"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        onClick={() => removeAddress(addr.id)}
                        className="p-2 text-[#64748B] hover:text-red-500 transition-colors"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
