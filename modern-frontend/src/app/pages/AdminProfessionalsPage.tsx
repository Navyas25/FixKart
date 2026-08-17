import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ExternalLink,
  Star,
  Check,
  X,
  Ban,
} from "lucide-react";
import { apiGet, apiPatch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "../components/PageHeader";

type Filter = "all" | "pending" | "verified" | "rejected" | "suspended";

const STATUS_META: Record<string, { label: string; badge: string }> = {
  pending: {
    label: "Pending",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  verified: {
    label: "Verified",
    badge: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  },
  suspended: {
    label: "Suspended",
    badge: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400",
  },
};

interface ProRow {
  id: string;
  user_id: string;
  experience_years: number;
  rating: number;
  bio: string;
  created_at: string;
  verification_status: string;
  service_categories: string[] | null;
  service_locations: string[] | null;
  id_document_url: string | null;
  profile?: { full_name: string | null; phone: string | null; avatar_url: string | null } | null;
}

export default function AdminProfessionalsPage() {
  const { isLoggedIn, isAdmin, user } = useAuth();
  const [rows, setRows] = useState<ProRow[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; status: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<{ professionals: ProRow[] }>("/professionals/admin");
      setRows(data.professionals || []);
    } catch (err: any) {
      setError(err.message || "Could not load professionals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isAdmin]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: rows.length,
      pending: 0,
      verified: 0,
      rejected: 0,
      suspended: 0,
    };
    for (const r of rows) {
      if (c[r.verification_status] !== undefined) c[r.verification_status] += 1;
    }
    return c;
  }, [rows]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? rows
        : rows.filter((r) => r.verification_status === filter),
    [rows, filter]
  );

  const act = async (id: string, status: string) => {
    setActing(id);
    setError("");
    try {
      await apiPatch(`/professionals/${id}/verify`, { verification_status: status });
      await load();
    } catch (err: any) {
      setError(err.message || "Could not update verification status.");
    } finally {
      setActing(null);
      setConfirm(null);
    }
  };

  const filters: Filter[] = ["pending", "verified", "rejected", "suspended", "all"];

  // Not logged in
  if (!isLoggedIn) {
    return (
      <>
        <PageHeader eyebrow="FixKart Admin" title="Professional Verification" subtitle="Review and verify professional applications" />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <p className="text-[#64748B] dark:text-slate-400 mb-6">
              Sign in to the admin console.
            </p>
            <Link
              to="/login?next=/admin/professionals"
              className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>
      </>
    );
  }

  // Logged in but not an admin
  if (!isAdmin) {
    return (
      <>
        <PageHeader eyebrow="FixKart Admin" title="Professional Verification" subtitle="Admin only" />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-[#0F172A] dark:text-white font-extrabold mb-2">
              Admin access required
            </p>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mb-6">
              Only users with the <span className="font-bold">admin</span> role in
              the database can verify professionals. Promote an account first:
              <code className="block mt-3 text-xs bg-[#0F172A] text-emerald-300 rounded-xl px-4 py-3">
                update profiles set role = 'admin' where email = 'you@example.com';
              </code>
            </p>
            <Link
              to="/"
              className="inline-block bg-[#2563EB] text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
            >
              Back to FixKart
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="FixKart Admin"
        title="Professional Verification"
        subtitle="Review applications and set verification status"
      />

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition-colors ${
                  filter === f
                    ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]"
                    : "bg-white dark:bg-[#111827] text-[#64748B] dark:text-slate-400 border border-gray-100 dark:border-white/10 hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                {f} ({counts[f] ?? 0})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-white dark:bg-[#111827] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/10 py-16 text-center">
              <ShieldCheck className="w-10 h-10 text-[#16A34A] mx-auto mb-3" />
              <p className="font-extrabold text-[#0F172A] dark:text-white">
                No {filter !== "all" ? filter : ""} professionals
              </p>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
                {filter === "pending"
                  ? "No applications waiting for review. New signups appear here."
                  : "Nothing to show in this filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visible.map((pro) => {
                const meta = STATUS_META[pro.verification_status] || STATUS_META.pending;
                return (
                  <div
                    key={pro.id}
                    className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] text-[#0F172A] flex items-center justify-center text-lg font-extrabold flex-shrink-0">
                          {(pro.profile?.full_name || "?").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-extrabold text-[#0F172A] dark:text-white">
                              {pro.profile?.full_name || "Unnamed professional"}
                            </p>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${meta.badge}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] dark:text-slate-400">
                            {pro.service_categories?.length
                              ? pro.service_categories.join(", ")
                              : "No category"}{" "}
                            · {pro.experience_years ?? 0} yrs exp
                            {pro.profile?.phone ? ` · ${pro.profile.phone}` : ""}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-[#64748B] dark:text-slate-400 mt-1">
                            <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                            {Number(pro.rating ?? 0).toFixed(1)}
                            <span className="mx-1">·</span>
                            Applied{" "}
                            {new Date(pro.created_at).toLocaleDateString()}
                          </p>
                          {pro.bio && (
                            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 line-clamp-2 max-w-xl">
                              {pro.bio}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {pro.id_document_url ? (
                              <a
                                href={pro.id_document_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-blue-600 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View uploaded document
                              </a>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                No document uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {confirm?.id === pro.id ? (
                          <>
                            <button
                              onClick={() => act(pro.id, confirm.status)}
                              disabled={acting === pro.id}
                              className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60"
                            >
                              {acting === pro.id && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              )}
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirm(null)}
                              className="text-xs font-bold text-[#64748B] dark:text-slate-400 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {pro.verification_status !== "verified" && (
                              <button
                                onClick={() =>
                                  setConfirm({ id: pro.id, status: "verified" })
                                }
                                className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" /> Verify
                              </button>
                            )}
                            {pro.verification_status === "pending" && (
                              <button
                                onClick={() =>
                                  setConfirm({ id: pro.id, status: "rejected" })
                                }
                                className="flex items-center gap-1.5 border border-red-200 dark:border-red-500/30 text-red-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            )}
                            {(pro.verification_status === "verified" ||
                              pro.verification_status === "pending") && (
                              <button
                                onClick={() =>
                                  setConfirm({ id: pro.id, status: "suspended" })
                                }
                                className="flex items-center gap-1.5 border border-gray-200 dark:border-white/15 text-[#64748B] dark:text-slate-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                              >
                                <Ban className="w-3.5 h-3.5" /> Suspend
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
