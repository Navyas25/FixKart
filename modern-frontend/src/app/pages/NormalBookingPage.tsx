import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Calendar, Loader2, CheckCircle2, MapPin, Wrench, ArrowRight } from "lucide-react";
import { apiGet, apiPost } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatINR } from "../../lib/format";
import { PageHeader } from "../components/PageHeader";
import { detectUserLocation } from "../../lib/location";

interface ServiceOption {
  id: string;
  name: string;
  base_price: number;
  category: string;
  description?: string;
}

export default function NormalBookingPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [serviceId, setServiceId] = useState(params.get("service_id") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [assignedPro, setAssignedPro] = useState<string>("");

  // Load services
  useEffect(() => {
    let cancelled = false;
    apiGet<{ services: any[] }>("/services?limit=200")
      .then((data) => {
        if (cancelled) return;
        setServices(
          (data.services || []).map((s) => ({
            id: s.id,
            name: s.name || s.category,
            base_price: Number(s.base_price) || 0,
            category: s.category || "",
            description: s.description || "",
          }))
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Pre-fill service from URL param
  useEffect(() => {
    if (serviceId) {
      const svc = services.find((s) => s.id === serviceId);
      if (svc && !category) setCategory(svc.category);
    }
  }, [serviceId, services, category]);

  // Auto-detect location
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const loc = await detectUserLocation();
      if (loc?.address) {
        setAddress(loc.address);
      } else if (loc?.lat && loc?.lng) {
        setAddress(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
      }
    } catch {
      // Location detection failed — user can type manually
    }
    setDetectingLocation(false);
  };

  if (!isLoggedIn) {
    return (
      <>
        <PageHeader eyebrow="Book a Service" title="Book Now" subtitle="We'll find the nearest professional for you." />
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

  // Filter services by category if one is selected
  const filteredServices = category
    ? services.filter((s) => s.category.toLowerCase() === category.toLowerCase())
    : services;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!serviceId) {
      setError("Please select a service so we can find the right professional for you.");
      return;
    }
    if (!scheduledAt) {
      setError("Please pick a date and time.");
      return;
    }
    if (!address.trim()) {
      setError("Please enter your address so we can find the nearest professional.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiPost<{ booking: any; professional_name?: string }>("/bookings/auto-assign", {
        service_id: serviceId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        address: address.trim(),
        notes: notes.trim() || undefined,
      });
      setAssignedPro(res.professional_name || "a verified professional");
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Could not place your booking.");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <PageHeader eyebrow="Booking Placed" title="Booking Confirmed!" subtitle="We've assigned the best professional for you." />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <div className="w-16 h-16 mx-auto bg-[#F0FDF4] dark:bg-[#16A34A]/15 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-white mb-2">You're Booked!</h2>
            <p className="text-[#64748B] dark:text-slate-400 text-sm mb-3">
              <span className="font-bold text-[#0F172A] dark:text-white">{assignedPro}</span> has been assigned to your booking.
            </p>
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
                to="/"
                className="border-2 border-gray-200 dark:border-white/15 text-[#64748B] dark:text-slate-300 font-bold text-sm px-7 py-3.5 rounded-2xl hover:border-gray-300 transition-colors"
              >
                Back to Home
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
        title="Book a Professional"
        subtitle="Pick your service, enter your location, and we'll match you with the nearest verified professional."
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111827] rounded-3xl p-6 lg:p-8 border border-gray-100 dark:border-white/10 shadow-sm">
            {error && (
              <div className="mb-5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Auto-assign notice */}
            <div className="mb-5 bg-[#2563EB]/5 border border-[#2563EB]/15 rounded-xl px-4 py-3 flex items-start gap-3">
              <Wrench className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">Auto-Assigned Professional</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  We automatically match you with the nearest verified professional for your selected service. No need to browse or choose.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Category filter */}
              {category && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide">Category:</span>
                  <span className="text-sm font-bold text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-lg">{category}</span>
                  <button type="button" onClick={() => { setCategory(""); setServiceId(""); }} className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white">
                    Clear
                  </button>
                </div>
              )}

              {/* Service */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Service * <span className="text-[#64748B]/60 normal-case">(we'll find the right pro for this)</span>
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    const svc = services.find((s) => s.id === e.target.value);
                    if (svc) setCategory(svc.category);
                  }}
                  className={inputClass}
                  disabled={loadingData}
                >
                  <option value="">{loadingData ? "Loading services…" : "Select a service"}</option>
                  {filteredServices.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} — from {formatINR(svc.base_price)}
                    </option>
                  ))}
                </select>
                {selectedService && (
                  <p className="mt-1.5 text-xs text-[#64748B] dark:text-slate-400">{selectedService.description}</p>
                )}
              </div>

              {/* Date & time */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              {/* Address with detect */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Your Address * <span className="text-[#64748B]/60 normal-case">(used to find nearest pro)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full address"
                    className={`${inputClass} flex-1`}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="flex-shrink-0 bg-[#2563EB]/10 text-[#2563EB] font-bold text-sm px-4 py-3 rounded-xl hover:bg-[#2563EB]/20 transition-colors disabled:opacity-50"
                  >
                    {detectingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Describe Your Issue (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Tell us about the problem — leak location, error message, preferred timing…"
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Finding the nearest professional…
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" /> Book Now
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-[#64748B] dark:text-slate-400">
              We'll match you with the nearest verified professional for your service.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
