import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Package, ArrowRight, RotateCcw } from "lucide-react";
import { apiGet } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useCart } from "../../lib/cart";
import { formatINR, formatDate, shortId, PLACEHOLDER_IMG } from "../../lib/format";
import { PageHeader, EmptyState } from "../components/PageHeader";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  confirmed: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  shipped: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  delivered: "bg-[#F0FDF4] dark:bg-[#16A34A]/10 text-[#16A34A]",
  cancelled: "bg-red-50 dark:bg-red-500/10 text-red-500",
};

export default function OrdersPage() {
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reorder = (order: any) => {
    (order.items || []).forEach((item: any) => {
      if (item.product_id) {
        addToCart({
          id: item.product_id,
          name: item.product?.name || "",
          price: item.product?.price ?? item.unit_price,
          image_url: item.product?.image_url,
        });
      }
    });
    navigate("/cart");
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    apiGet<{ orders: any[] }>("/orders")
      .then((data) => {
        if (!cancelled) setOrders(data.orders || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  return (
    <>
      <PageHeader
        eyebrow="My Account"
        title="My Orders"
        subtitle="Track every order you've placed on FixKart."
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isLoggedIn ? (
            <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10">
              <p className="text-[#64748B] dark:text-slate-400 mb-6">Sign in to see your order history.</p>
              <Link
                to="/login?next=/orders"
                className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : error ? (
            <EmptyState icon="⚠️" title="Couldn't load orders" message={error} />
          ) : loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded-full w-1/3 mb-4" />
                  <div className="h-16 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No orders yet"
              message="When you place an order it will show up here with live status updates."
            />
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-[#111827] rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="font-extrabold text-[#0F172A] dark:text-white">{shortId(order.id)}</p>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-full ${
                          STATUS_STYLES[order.status] || "bg-slate-100 dark:bg-white/10 text-[#64748B]"
                        }`}
                      >
                        {order.status || "pending"}
                      </span>
                      <span className="text-lg font-extrabold text-[#0F172A] dark:text-white">
                        {formatINR(order.total_amount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto">
                    {(order.items || []).slice(0, 6).map((item: any) => (
                      <div key={item.id} className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={item.product?.image_url || PLACEHOLDER_IMG}
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {(order.items || []).length === 0 && (
                      <span className="text-xs text-[#64748B] dark:text-slate-400">
                        {order.address ? `Deliver to ${order.address.city || ""}` : "Order placed"}
                      </span>
                    )}
                  </div>
                  {(order.items || []).length > 0 && (
                    <button
                      onClick={() => reorder(order)}
                      className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-blue-600 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Order again
                    </button>
                  )}
                </div>
              ))}
              <div className="text-center pt-4">
                <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
                  Continue shopping <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
