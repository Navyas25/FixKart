import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  UserCircle,
  LogOut,
  Loader2,
  Wrench,
  Check,
  X,
  Play,
  Upload,
  Star,
  IndianRupee,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { apiGet, apiPost, apiPatch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "../components/PageHeader";

type Tab = "overview" | "bookings" | "profile";

const VERIFICATION_META: Record<
  string,
  { label: string; badge: string; note: string }
> = {
  pending: {
    label: "Pending Verification",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    note: "Your application is under review. You'll be able to accept jobs once verified.",
  },
  verified: {
    label: "Verified",
    badge: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    note: "You're verified and can accept jobs.",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    note: "Your application was not approved. Please update your details or contact support.",
  },
  suspended: {
    label: "Suspended",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    note: "Your account is suspended. Contact support for more information.",
  },
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  in_progress: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400",
};

const inputClass =
  "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

export default function ProfessionalDashboardPage() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [me, setMe] = useState<any>(null); // { professional, profile }
  const [earnings, setEarnings] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  // Profile edit form
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [confirmLogout, setConfirmLogout] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [meRes, earningsRes, bookingsRes] = await Promise.allSettled([
        apiGet<{ professional: any; profile: any }>("/professionals/me"),
        apiGet<{ earnings: any }>("/professionals/me/earnings"),
        apiGet<{ bookings: any[] }>("/bookings"),
      ]);

      if (meRes.status === "fulfilled") {
        setMe(meRes.value);
        setForm({
          bio: meRes.value.professional.bio || "",
          experience_years: meRes.value.professional.experience_years ?? 0,
          service_categories:
            meRes.value.professional.service_categories?.join(", ") || "",
          service_locations:
            meRes.value.professional.service_locations?.join(", ") || "",
          availability: meRes.value.professional.availability || "",
        });
      } else {
        setError(meRes.reason?.message || "Could not load your professional profile.");
      }
      if (earningsRes.status === "fulfilled") setEarnings(earningsRes.value.earnings);
      if (bookingsRes.status === "fulfilled") setBookings(bookingsRes.value.bookings || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const myProfessionalId = me?.professional?.id;

  // Bookings customers made with this professional (their jobs).
  const jobs = useMemo(
    () =>
      bookings.filter(
        (b) => myProfessionalId && b.professional_id === myProfessionalId
      ),
    [bookings, myProfessionalId]
  );

  const jobsByStatus = useMemo(() => {
    const upcoming = jobs.filter((b) =>
      ["pending", "confirmed", "in_progress"].includes(b.status)
    );
    const completed = jobs.filter((b) => b.status === "completed");
    return { upcoming, completed };
  }, [jobs]);

  const meta = me
    ? VERIFICATION_META[me.professional.verification_status] || VERIFICATION_META.pending
    : null;

  const respond = async (id: string, action: "accept" | "reject") => {
    setError("");
    try {
      await apiPatch(`/bookings/${id}/respond`, { action });
      await loadAll();
    } catch (err: any) {
      setError(err.message || "Could not update the booking.");
    }
  };

  const setStatus = async (id: string, status: "in_progress" | "completed") => {
    setError("");
    try {
      await apiPatch(`/bookings/${id}/status`, { status });
      await loadAll();
    } catch (err: any) {
      setError(err.message || "Could not update the job status.");
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    setError("");
    try {
      const body: any = {
        bio: form.bio,
        experience_years: form.experience_years
          ? parseInt(form.experience_years, 10)
          : 0,
        availability: form.availability,
      };
      if (form.service_categories.trim()) {
        body.service_categories = form.service_categories
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      if (form.service_locations.trim()) {
        body.service_locations = form.service_locations
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      await apiPatch("/professionals/me", body);
      setSaveMsg("Profile updated.");
      await loadAll();
    } catch (err: any) {
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "jpg", "jpeg", "png"].includes(ext)) {
      setError("Only PDF, JPG, JPEG or PNG documents are accepted.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Document must be 2 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setError("");
        await apiPost("/professionals/document", {
          document_b64: String(reader.result || "").split(",")[1] || "",
          filename: file.name,
          mime: file.type,
        });
        setSaveMsg("Document uploaded for review.");
        await loadAll();
      } catch (err: any) {
        setError(err.message || "Upload failed.");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

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
        <PageHeader eyebrow="FixKart Pro" title="Professional Dashboard" subtitle="Manage your jobs and earnings" />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <p className="text-[#64748B] dark:text-slate-400 mb-6">
              Sign in to your professional account to manage jobs and earnings.
            </p>
            <Link
              to="/login?next=/professional/dashboard"
              className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
            >
              Professional Sign In
            </Link>
          </div>
        </section>
      </>
    );
  }

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "bookings", label: "My Bookings", icon: <CalendarCheck className="w-4 h-4" /> },
    { key: "profile", label: "My Profile", icon: <UserCircle className="w-4 h-4" /> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="FixKart Pro"
        title="Professional Dashboard"
        subtitle={me?.profile?.full_name || user?.email || "Manage your jobs, earnings and profile"}
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/10 p-4 shadow-sm">
              <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-gray-100 dark:border-white/10 mb-3">
                <div className="w-9 h-9 bg-[#F59E0B] rounded-xl flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-extrabold text-[#0F172A] dark:text-white text-sm leading-tight">
                    FixKart <span className="text-[#F59E0B]">Pro</span>
                  </p>
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400 font-semibold">
                    Professional portal
                  </p>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    className={`w-full flex items-center gap-2.5 text-sm font-bold px-3 py-2.5 rounded-xl transition-colors ${
                      tab === item.key
                        ? "bg-[#2563EB] text-white"
                        : "text-[#64748B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
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
                      className="w-full text-xs font-bold text-[#64748B] dark:text-slate-400 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 text-sm font-bold text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main */}
          <div>
            {error && (
              <div className="mb-5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            {saveMsg && (
              <div className="mb-5 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 rounded-xl px-4 py-3">
                {saveMsg}
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                <div className="h-28 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
                <div className="h-40 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
              </div>
            ) : tab === "overview" ? (
              <div className="space-y-6">
                {/* Verification banner */}
                {meta && (
                  <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full ${meta.badge}`}
                      >
                        {me?.professional.verification_status === "verified" ? (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        {meta.label}
                      </span>
                      <span className="text-xs text-[#64748B] dark:text-slate-400">
                        {meta.note}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Total jobs"
                    value={String(earnings?.totalJobs ?? 0)}
                    icon={<CalendarCheck className="w-4 h-4 text-[#2563EB]" />}
                  />
                  <StatCard
                    label="Upcoming"
                    value={String(earnings?.upcomingJobs ?? 0)}
                    icon={<Clock className="w-4 h-4 text-[#D97706]" />}
                  />
                  <StatCard
                    label="Completed"
                    value={String(earnings?.completedJobs ?? 0)}
                    icon={<Check className="w-4 h-4 text-[#16A34A]" />}
                  />
                  <StatCard
                    label="Earnings"
                    value={`₹${earnings?.total ?? 0}`}
                    icon={<IndianRupee className="w-4 h-4 text-[#16A34A]" />}
                  />
                </div>

                {/* Rating + category */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 mb-2">
                      Rating
                    </p>
                    <p className="flex items-center gap-1.5 text-2xl font-extrabold text-[#0F172A] dark:text-white">
                      <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
                      {Number(me?.professional.rating ?? 0).toFixed(1)}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                      From customer reviews
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400 mb-2">
                      Service areas
                    </p>
                    <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                      {me?.professional.service_locations?.length
                        ? me.professional.service_locations.join(", ")
                        : "Not set"}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                      {me?.professional.service_categories?.length
                        ? me.professional.service_categories.join(" · ")
                        : "No categories set"}
                    </p>
                  </div>
                </div>
              </div>
            ) : tab === "bookings" ? (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-gray-100 dark:border-white/10 shadow-sm">
                  <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-4">
                    Upcoming jobs ({jobsByStatus.upcoming.length})
                  </h2>
                  {jobsByStatus.upcoming.length === 0 ? (
                    <p className="text-sm text-[#64748B] dark:text-slate-400 py-6 text-center">
                      No upcoming jobs yet. New bookings will appear here for you to accept.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {jobsByStatus.upcoming.map((b) => (
                        <JobCard
                          key={b.id}
                          booking={b}
                          onRespond={respond}
                          onStatus={setStatus}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-gray-100 dark:border-white/10 shadow-sm">
                  <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-4">
                    Completed jobs ({jobsByStatus.completed.length})
                  </h2>
                  {jobsByStatus.completed.length === 0 ? (
                    <p className="text-sm text-[#64748B] dark:text-slate-400 py-6 text-center">
                      Completed jobs will appear here.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {jobsByStatus.completed.map((b) => (
                        <JobCard key={b.id} booking={b} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-gray-100 dark:border-white/10 shadow-sm">
                <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-1">
                  My professional profile
                </h2>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mb-5">
                  {meta?.note} Ratings and verification status are managed by FixKart.
                </p>

                <form onSubmit={saveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Short bio
                    </label>
                    <textarea
                      value={form.bio || ""}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      rows={3}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        Years of experience
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={form.experience_years ?? 0}
                        onChange={(e) =>
                          setForm({ ...form, experience_years: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        Availability
                      </label>
                      <input
                        type="text"
                        value={form.availability || ""}
                        onChange={(e) =>
                          setForm({ ...form, availability: e.target.value })
                        }
                        placeholder="e.g. Mon-Sat, 9 AM - 6 PM"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        Service categories
                      </label>
                      <input
                        type="text"
                        value={form.service_categories || ""}
                        onChange={(e) =>
                          setForm({ ...form, service_categories: e.target.value })
                        }
                        placeholder="Plumbing, Electrical (comma separated)"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        Service locations
                      </label>
                      <input
                        type="text"
                        value={form.service_locations || ""}
                        onChange={(e) =>
                          setForm({ ...form, service_locations: e.target.value })
                        }
                        placeholder="Bengaluru, Mysuru (comma separated)"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#2563EB] text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save changes
                  </button>
                </form>

                {/* Document upload */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
                  <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white mb-1">
                    Verification document
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mb-4">
                    {me?.professional.id_document_url
                      ? "Document on file — upload a new one to replace it."
                      : "No document uploaded yet. Add your government ID to speed up verification."}
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDoc}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 border border-dashed border-gray-200 dark:border-white/15 rounded-xl px-5 py-3 text-sm font-bold text-[#64748B] dark:text-slate-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {me?.professional.id_document_url
                      ? "Replace document"
                      : "Upload document"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
          {label}
        </p>
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">{value}</p>
    </div>
  );
}

function JobCard({
  booking,
  onRespond,
  onStatus,
}: {
  booking: any;
  onRespond?: (id: string, action: "accept" | "reject") => void;
  onStatus?: (id: string, status: "in_progress" | "completed") => void;
}) {
  const statusBadge = STATUS_BADGE[booking.status] || STATUS_BADGE.pending;
  const date = booking.scheduled_at
    ? new Date(booking.scheduled_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not scheduled";

  return (
    <div className="border border-gray-100 dark:border-white/10 rounded-2xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <p className="font-extrabold text-[#0F172A] dark:text-white text-sm">
              {booking.service?.name || "Service booking"}
            </p>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${statusBadge}`}
            >
              {booking.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400">{date}</p>
          {booking.customer && (
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              Customer:{" "}
              <span className="font-bold text-[#0F172A] dark:text-white">
                {booking.customer.full_name || "Customer"}
              </span>
              {booking.customer.phone ? ` · ${booking.customer.phone}` : ""}
            </p>
          )}
          {booking.notes && (
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 line-clamp-2">
              {booking.notes}
            </p>
          )}
          {booking.service?.base_price != null && (
            <p className="text-xs font-bold text-[#16A34A] mt-1">
              ₹{booking.service.base_price}
            </p>
          )}
        </div>

        {onRespond && booking.status === "pending" && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onRespond(booking.id, "accept")}
              className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              onClick={() => onRespond(booking.id, "reject")}
              className="flex items-center gap-1.5 border border-red-200 dark:border-red-500/30 text-red-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        )}

        {onStatus && booking.status === "confirmed" && (
          <button
            onClick={() => onStatus(booking.id, "in_progress")}
            className="flex items-center gap-1.5 bg-[#7C3AED] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-violet-600 transition-colors flex-shrink-0"
          >
            <Play className="w-3.5 h-3.5" /> Start job
          </button>
        )}

        {onStatus && booking.status === "in_progress" && (
          <button
            onClick={() => onStatus(booking.id, "completed")}
            className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors flex-shrink-0"
          >
            <Check className="w-3.5 h-3.5" /> Mark completed
          </button>
        )}
      </div>
    </div>
  );
}
