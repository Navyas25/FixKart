import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Calendar, ArrowRight, MapPin } from "lucide-react";
import { apiGet } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatINR, formatDateTime, shortId } from "../../lib/format";
import { PageHeader, EmptyState } from "../components/PageHeader";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  confirmed: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  completed: "bg-[#F0FDF4] dark:bg-[#16A34A]/10 text-[#16A34A]",
  cancelled: "bg-red-50 dark:bg-red-500/10 text-red-500",
};

export default function BookingsPage() {
  const { isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    apiGet<{ bookings: any[] }>("/bookings")
      .then((data) => {
        if (!cancelled) setBookings(data.bookings || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load bookings.");
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
        title="My Bookings"
        subtitle="Your scheduled services with verified professionals."
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isLoggedIn ? (
            <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10">
              <p className="text-[#64748B] dark:text-slate-400 mb-6">Sign in to see your bookings.</p>
              <Link
                to="/login?next=/bookings"
                className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : error ? (
            <EmptyState icon="⚠️" title="Couldn't load bookings" message={error} />
          ) : loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded-full w-1/3 mb-4" />
                  <div className="h-16 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No bookings yet"
              message="Book a professional and your appointments will appear here."
            />
          ) : (
            <div className="space-y-5">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white dark:bg-[#111827] rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="font-extrabold text-[#0F172A] dark:text-white">
                        {booking.professional?.profile?.full_name || "FixKart Professional"}
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">
                        {booking.service?.name || booking.service?.category || "Service"} · {shortId(booking.id)}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-full ${
                        STATUS_STYLES[booking.status] || "bg-slate-100 dark:bg-white/10 text-[#64748B]"
                      }`}
                    >
                      {booking.status || "pending"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <span className="flex items-center gap-2 text-[#64748B] dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                      {formatDateTime(booking.scheduled_at)}
                    </span>
                    <span className="flex items-center gap-2 text-[#64748B] dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                      {booking.address || "Customer location"}
                    </span>
                    <span className="flex items-center gap-2 text-[#64748B] dark:text-slate-400">
                      <strong className="text-[#0F172A] dark:text-white">
                        {formatINR(booking.service?.base_price)}
                      </strong>
                      {booking.notes && `· ${booking.notes}`}
                    </span>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
                  Book another service <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
