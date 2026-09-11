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
  Store,
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

interface VendorRow {
  id: string;
  user_id: string;
  shop_name: string;
  shop_description: string;
  shop_location: string;
  logo_url: string | null;
  banner_url: string | null;
  rating: number;
  total_sales: number;
  verification_status: string;
  created_at: string;
  updated_at: string;
  category: string | null;
  gst_number: string | null;
  business_address: string | null;
  business_phone: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_name: string | null;
  upi_id: string | null;
  document_url: string | null;
  profile?: {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

export default function AdminVendorsPage() {
  const { isLoggedIn, isAdmin } = useAuth();
  const [rows, setRows] = useState<VendorRow[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<{ vendors: VendorRow[] }>("/vendors/admin");
      setRows(data.vendors || []);
    } catch (err: any) {
      setError(err.message || "Could not load vendors.");
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
      if (c[r.verification_status] !== undefined)
        c[r.verification_status] += 1;
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
      const body: any = { verification_status: status };
      if (status === "rejected" && rejectReason) {
        body.reason = rejectReason;
      }
      await apiPatch(`/vendors/${id}/verify`, body);
      await load();
    } catch (err: any) {
      setError(err.message || "Could not update verification status.");
    } finally {
      setActing(null);
      setConfirm(null);
      setRejectReason("");
    }
  };

  const filters: Filter[] = ["pending", "verified", "rejected", "suspended", "all"];

  // Not logged in
  if (!isLoggedIn) {
    return (
      <>
        <PageHeader
          eyebrow="FixKart Admin"
          title="Vendor Management"
          subtitle="Review and verify vendor applications"
        />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <p className="text-[#64748B] dark:text-slate-400 mb-6">
              Sign in to the admin console.
            </p>
            <Link
              to="/login?next=/admin/vendors"
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
        <PageHeader
          eyebrow="FixKart Admin"
          title="Vendor Management"
          subtitle="Admin only"
        />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-[#0F172A] dark:text-white font-extrabold mb-2">
              Admin access required
            </p>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mb-6">
              Only users with the <span className="font-bold">admin</span> role
              can manage vendors.
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
        title="Vendor Management"
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
                <div
                  key={i}
                  className="h-24 bg-white dark:bg-[#111827] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/10 py-16 text-center">
              <Store className="w-10 h-10 text-[#16A34A] mx-auto mb-3" />
              <p className="font-extrabold text-[#0F172A] dark:text-white">
                No {filter !== "all" ? filter : ""} vendors
              </p>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
                {filter === "pending"
                  ? "No applications waiting for review. New signups appear here."
                  : "Nothing to show in this filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visible.map((vendor) => {
                const meta =
                  STATUS_META[vendor.verification_status] || STATUS_META.pending;
                const isExpanded = expanded === vendor.id;
                return (
                  <div
                    key={vendor.id}
                    className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center text-lg font-extrabold flex-shrink-0">
                          {vendor.shop_name?.slice(0, 1).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-extrabold text-[#0F172A] dark:text-white">
                              {vendor.shop_name}
                            </p>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${meta.badge}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] dark:text-slate-400">
                            {vendor.profile?.full_name || "Unknown"} ·{" "}
                            {vendor.profile?.email || "No email"}
                            {vendor.shop_location
                              ? ` · ${vendor.shop_location}`
                              : ""}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-[#64748B] dark:text-slate-400 mt-1">
                            <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                            {Number(vendor.rating ?? 0).toFixed(1)}
                            <span className="mx-1">·</span>
                            ₹{vendor.total_sales ?? 0} sales
                            <span className="mx-1">·</span>
                            Applied{" "}
                            {new Date(vendor.created_at).toLocaleDateString()}
                          </p>
                          {vendor.shop_description && (
                            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 line-clamp-2 max-w-xl">
                              {vendor.shop_description}
                            </p>
                          )}
                          <button
                            onClick={() =>
                              setExpanded(isExpanded ? null : vendor.id)
                            }
                            className="text-xs font-bold text-[#2563EB] hover:text-blue-600 transition-colors mt-2"
                          >
                            {isExpanded
                              ? "Hide details"
                              : "View business details"}
                          </button>

                          {/* Business documents */}
                          {vendor.document_url && (
                            <a
                              href={vendor.document_url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Review business documents
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {confirm?.id === vendor.id ? (
                          <>
                            <button
                              onClick={() => act(vendor.id, confirm.status)}
                              disabled={acting === vendor.id}
                              className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60"
                            >
                              {acting === vendor.id && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              )}
                              Confirm
                            </button>
                            <button
                              onClick={() => {
                                setConfirm(null);
                                setRejectReason("");
                              }}
                              className="text-xs font-bold text-[#64748B] dark:text-slate-400 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {vendor.verification_status !== "verified" && (
                              <button
                                onClick={() =>
                                  setConfirm({
                                    id: vendor.id,
                                    status: "verified",
                                  })
                                }
                                className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" /> Verify
                              </button>
                            )}
                            {vendor.verification_status === "pending" && (
                              <button
                                onClick={() =>
                                  setConfirm({
                                    id: vendor.id,
                                    status: "rejected",
                                  })
                                }
                                className="flex items-center gap-1.5 border border-red-200 dark:border-red-500/30 text-red-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            )}
                            {(vendor.verification_status === "verified" ||
                              vendor.verification_status === "pending") && (
                              <button
                                onClick={() =>
                                  setConfirm({
                                    id: vendor.id,
                                    status: "suspended",
                                  })
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

                    {/* Reject reason input */}
                    {confirm?.id === vendor.id &&
                      confirm.status === "rejected" && (
                        <div className="mt-3 ml-16">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection (optional, will be emailed)"
                            className="w-full max-w-md bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-xs font-medium px-3 py-2 rounded-lg outline-none focus:border-red-400 transition-colors placeholder-gray-400"
                          />
                        </div>
                      )}

                    {/* Expanded business details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 ml-16">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            {
                              label: "GST Number",
                              value: vendor.gst_number,
                            },
                            {
                              label: "Business Phone",
                              value: vendor.business_phone,
                            },
                            {
                              label: "Business Address",
                              value: vendor.business_address,
                            },
                            {
                              label: "Category",
                              value: vendor.category,
                            },
                            {
                              label: "Bank Name",
                              value: vendor.bank_name,
                            },
                            {
                              label: "Account Number",
                              value: vendor.bank_account_number
                                ? `****${vendor.bank_account_number.slice(-4)}`
                                : null,
                            },
                            {
                              label: "IFSC",
                              value: vendor.bank_ifsc,
                            },
                            {
                              label: "UPI ID",
                              value: vendor.upi_id,
                            },
                          ].map(
                            (item) =>
                              item.value && (
                                <div key={item.label}>
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                                    {item.label}
                                  </p>
                                  <p className="text-xs font-bold text-[#0F172A] dark:text-white mt-0.5">
                                    {item.value}
                                  </p>
                                </div>
                              )
                          )}
                          {vendor.document_url && (
                            <div className="col-span-full pt-2 border-t border-gray-100 dark:border-white/10">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                                Business Documents
                              </p>
                              <a
                                href={vendor.document_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-[#2563EB] hover:text-blue-600 underline underline-offset-2"
                              >
                                View documents <ExternalLink className="inline h-3.5 w-3.5 align-middle -mt-0.5 mr-0.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
