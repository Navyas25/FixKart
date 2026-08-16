import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { apiGet, apiPost } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatINR } from "../../lib/format";
import { PageHeader } from "../components/PageHeader";

interface ProOption {
  id: string;
  name: string;
}

interface ServiceOption {
  id: string;
  name: string;
  base_price: number;
}

export default function BookingPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [professionals, setProfessionals] = useState<ProOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [professionalId, setProfessionalId] = useState(params.get("professional_id") || "");
  const [serviceId, setServiceId] = useState(params.get("service_id") || "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      apiGet<{ professionals: any[] }>("/professionals?limit=100"),
      apiGet<{ services: any[] }>("/services?limit=100"),
    ]).then(([prosRes, svcsRes]) => {
      if (cancelled) return;
      if (prosRes.status === "fulfilled") {
        setProfessionals(
          (prosRes.value.professionals || []).map((p) => ({
            id: p.id,
            name: p.profile?.full_name || "FixKart Professional",
          }))
        );
      }
      if (svcsRes.status === "fulfilled") {
        setServices(
          (svcsRes.value.services || []).map((s) => ({
            id: s.id,
            name: s.name || s.category,
            base_price: Number(s.base_price) || 0,
          }))
        );
      }
      setLoadingData(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isLoggedIn) {
    return (
      <>
        <PageHeader eyebrow="Book a Service" title="Book Now" subtitle="Schedule a professional in minutes." />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <p className="text-[#64748B] dark:text-slate-400 mb-6">You need an account to book a service.</p>
            <Link
              to={`/login?next=${encodeURIComponent("/booking" + window.location.search)}`}
              className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors mb-3"
            >
              Sign In
            </Link>
            <div>
              <Link to="/register" className="text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors">
                or create a free account
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const inputClass =
    "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

  const selectedService = services.find((s) => s.id === serviceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!professionalId) {
      setError("Please choose a professional.");
      return;
    }
    if (!scheduledAt) {
      setError("Please pick a date and time for the service.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/bookings", {
        professional_id: professionalId,
        service_id: serviceId || undefined,
        scheduled_at: new Date(scheduledAt).toISOString(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Could not place your booking.");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <PageHeader eyebrow="Booking Placed" title="Booking Confirmed!" subtitle="Your professional has been notified." />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <div className="w-16 h-16 mx-auto bg-[#F0FDF4] dark:bg-[#16A34A]/15 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-white mb-2">You're booked!</h2>
            <p className="text-[#64748B] dark:text-slate-400 text-sm mb-8">
              Track your appointment and manage it anytime from My Bookings.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/bookings"
                className="bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-[#2563EB] transition-colors"
              >
                View My Bookings
              </Link>
              <Link
                to="/services"
                className="border-2 border-gray-200 dark:border-white/15 text-[#64748B] dark:text-slate-300 font-bold text-sm px-7 py-3.5 rounded-2xl hover:border-gray-300 transition-colors"
              >
                Book Another
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Book a Service"
        title="Book Now"
        subtitle="Choose your professional, pick a time, and we'll handle the rest."
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111827] rounded-3xl p-6 lg:p-8 border border-gray-100 dark:border-white/10 shadow-sm">
            {error && (
              <div className="mb-5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Professional *
                </label>
                <select
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value)}
                  className={inputClass}
                  disabled={loadingData}
                >
                  <option value="">{loadingData ? "Loading professionals…" : "Select a professional"}</option>
                  {professionals.map((pro) => (
                    <option key={pro.id} value={pro.id}>
                      {pro.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Service {selectedService && <span className="normal-case text-[#16A34A]">· {formatINR(selectedService.base_price)}</span>}
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className={inputClass}
                  disabled={loadingData}
                >
                  <option value="">No specific service (decide later)</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} — from {formatINR(svc.base_price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Date & time *
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Service address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Where should the pro come?"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue, preferred timing, anything helpful…"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loadingData}
              className="mt-7 w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white font-extrabold text-base px-8 py-4 rounded-2xl hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Booking…
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" /> Confirm Booking
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
