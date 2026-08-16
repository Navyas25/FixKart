import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { apiPost } from "../../lib/api";
import { useCart } from "../../lib/cart";
import { useAuth } from "../../lib/auth";
import { formatINR, PLACEHOLDER_IMG } from "../../lib/format";
import { PageHeader } from "../components/PageHeader";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    address_line: "",
    city: "",
    postal_code: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auth guard: bounce to login preserving the destination.
  useEffect(() => {
    if (!isLoggedIn && items.length > 0) {
      const next = params.get("next") || "/checkout";
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
    }
  }, [isLoggedIn, items.length, navigate, params]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pt-32 text-center text-[#64748B] dark:text-slate-400">
        Please sign in to continue to checkout…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Checkout" title="Checkout" subtitle="Almost there" />
        <div className="py-20 text-center">
          <p className="text-[#64748B] dark:text-slate-400 mb-6">Your cart is empty — nothing to check out.</p>
          <Link to="/products" className="bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors">
            Browse Products
          </Link>
        </div>
      </>
    );
  }

  const inputClass =
    "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.address_line.trim() || !form.city.trim() || !form.postal_code.trim()) {
      setError("Please fill in your delivery address.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save the delivery address, get its id.
      const addressData = await apiPost<{ address: { id: string } }>("/addresses", {
        address_line: form.address_line.trim(),
        city: form.city.trim(),
        state: "",
        postal_code: form.postal_code.trim(),
        is_default: false,
      });

      // 2. Create the order with server-side pricing.
      const orderData = await apiPost<{ order: { id: string; total_amount: number } }>("/orders", {
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        address_id: addressData.address.id,
      });

      const order = orderData.order;

      // 3. Success — clear the cart and remember the reference for confirmation.
      clearCart();
      localStorage.setItem(
        "fixkart_last_order",
        JSON.stringify({ id: order.id, total: order.total_amount })
      );

      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      setError(err.message || "Could not place your order.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Secure Checkout"
        title="Checkout"
        subtitle="Enter your delivery details to place the order."
      />

      <section className="py-10 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Address form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-white/10">
              <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-6">Delivery Address</h2>

              {error && (
                <div className="mb-5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Address line
                  </label>
                  <input
                    type="text"
                    value={form.address_line}
                    onChange={(e) => setForm({ ...form, address_line: e.target.value })}
                    placeholder="House no, street, area"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="City"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Postal code
                    </label>
                    <input
                      type="text"
                      value={form.postal_code}
                      onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                      placeholder="PIN code"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 …"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#F59E0B] text-[#0F172A] font-extrabold text-sm px-10 py-4 rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Placing order…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Place Order · {formatINR(subtotal)}
                  </>
                )}
              </button>
            </form>

            {/* Summary */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 h-fit">
              <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-5">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={item.image_url || PLACEHOLDER_IMG} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] dark:text-white line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400">Qty {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-white/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B] dark:text-slate-400">Subtotal</span>
                  <span className="font-bold text-[#0F172A] dark:text-white">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B] dark:text-slate-400">Delivery</span>
                  <span className="font-bold text-[#16A34A]">Free</span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="font-extrabold text-[#0F172A] dark:text-white">Total</span>
                  <span className="text-xl font-extrabold text-[#0F172A] dark:text-white">{formatINR(subtotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
