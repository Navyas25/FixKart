import { Link } from "react-router";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "../../lib/cart";
import { useAuth } from "../../lib/auth";
import { formatINR, PLACEHOLDER_IMG } from "../../lib/format";
import { PageHeader } from "../components/PageHeader";

export default function CartPage() {
  const { items, count, subtotal, updateQuantity, removeFromCart } = useCart();
  const { isLoggedIn } = useAuth();

  return (
    <>
      <PageHeader
        eyebrow="Your Cart"
        title="Shopping Cart"
        subtitle={items.length ? `${count} item${count === 1 ? "" : "s"} in your cart` : "Your cart is empty"}
      />

      <section className="py-10 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 flex items-center justify-center mb-6">
                <ShoppingCart className="w-9 h-9 text-[#64748B] dark:text-slate-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-white mb-2">Your cart is empty</h2>
              <p className="text-[#64748B] dark:text-slate-400 mb-8">
                Browse the catalog and add some hardware to get started.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-[#F59E0B] text-[#0F172A] font-extrabold text-sm px-8 py-3.5 rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
              >
                Shop Hardware <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="bg-white dark:bg-[#111827] rounded-2xl p-4 flex gap-4 items-center shadow-sm border border-gray-100 dark:border-white/10"
                  >
                    <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={item.image_url || PLACEHOLDER_IMG}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product_id}`}>
                        <h3 className="font-bold text-[#0F172A] dark:text-white text-sm mb-1 line-clamp-1">{item.name}</h3>
                      </Link>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 mb-2">Hardware Product</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-[#F8FAFC] dark:bg-white/5 border border-gray-200 dark:border-white/15 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-extrabold text-[#0F172A] dark:text-white text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-extrabold text-[#0F172A] dark:text-white">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product_id)}
                      className="p-2 text-[#64748B] hover:text-red-500 transition-colors flex-shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Link to="/products" className="block text-center text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors pt-2">
                  ← Continue shopping
                </Link>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 sticky top-24">
                  <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-5">Order Summary</h2>
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400">Subtotal ({count} items)</span>
                      <span className="font-bold text-[#0F172A] dark:text-white">{formatINR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400">Delivery</span>
                      <span className="font-bold text-[#16A34A]">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400">Tax</span>
                      <span className="font-bold text-[#0F172A] dark:text-white">{formatINR(0)}</span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/10 pt-3 flex justify-between items-baseline">
                      <span className="font-extrabold text-[#0F172A] dark:text-white">Total</span>
                      <span className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{formatINR(subtotal)}</span>
                    </div>
                  </div>
                  <Link
                    to={isLoggedIn ? "/checkout" : "/login?next=/checkout"}
                    className="block w-full bg-[#F59E0B] text-[#0F172A] text-center font-extrabold text-sm px-6 py-4 rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
                  >
                    {isLoggedIn ? "Proceed to Checkout" : "Sign In to Checkout"}
                  </Link>
                  <Link
                    to="/products"
                    className="block w-full text-center text-[#64748B] dark:text-slate-400 text-xs font-semibold mt-4 hover:text-[#0F172A] dark:hover:text-white transition-colors"
                  >
                    or keep shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
