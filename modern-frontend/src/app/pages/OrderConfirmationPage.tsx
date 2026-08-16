import { Link, useParams } from "react-router";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { formatINR, shortId } from "../../lib/format";
import { PageHeader } from "../components/PageHeader";

export default function OrderConfirmationPage() {
  const { id } = useParams();

  let last: { id?: string; total?: number } | null = null;
  try {
    last = JSON.parse(localStorage.getItem("fixkart_last_order") || "null");
  } catch {
    last = null;
  }

  const orderId = id || last?.id || "";
  const total = last?.total;

  const estimate = new Date();
  estimate.setDate(estimate.getDate() + 4);
  const estimateLabel = estimate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <PageHeader eyebrow="Order Placed" title="Thank You!" subtitle="Your order has been confirmed." />

      <section className="py-10 lg:py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 lg:p-10 text-center border border-gray-100 dark:border-white/10 shadow-sm">
            <div className="w-20 h-20 mx-auto bg-[#F0FDF4] dark:bg-[#16A34A]/15 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-white mb-2">Order Confirmed!</h2>
            <p className="text-[#64748B] dark:text-slate-400 mb-8">
              A confirmation has been sent to your registered email. Your order is being prepared.
            </p>

            <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-2xl p-6 mb-8 text-left">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-white/10">
                <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">Order number</span>
                <span className="font-extrabold text-[#0F172A] dark:text-white">{shortId(orderId)}</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-white/10">
                <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">Estimated delivery</span>
                <span className="font-bold text-[#0F172A] dark:text-white">{estimateLabel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">Total paid</span>
                <span className="text-2xl font-extrabold text-[#0F172A] dark:text-white">
                  {total !== undefined ? formatINR(total) : "—"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/orders"
                className="flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-[#2563EB] transition-colors"
              >
                <Package className="w-4 h-4" /> Track My Order
              </Link>
              <Link
                to="/products"
                className="flex items-center justify-center gap-2 bg-[#F59E0B] text-[#0F172A] font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-amber-400 transition-colors"
              >
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
