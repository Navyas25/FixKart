import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { Search, Star, ArrowRight } from "lucide-react";
import { apiGet } from "../../lib/api";
import { formatINR } from "../../lib/format";
import { DEMO_SERVICES } from "../../lib/demoData";
import { PageHeader, EmptyState } from "../components/PageHeader";
import { DemoNotice, DemoServiceGrid } from "../components/DemoCards";

import {
  Wrench, Droplets, Zap, Hammer, Car, Paintbrush, Wind, Settings,
} from "lucide-react";

const serviceStyle: Record<string, { Icon: typeof Wrench; color: string }> = {
  plumbing: { Icon: Droplets, color: "#2563EB" },
  electrical: { Icon: Zap, color: "#D97706" },
  carpentry: { Icon: Hammer, color: "#92400E" },
  automotive: { Icon: Car, color: "#6B7280" },
  painting: { Icon: Paintbrush, color: "#EC4899" },
  "ac-repair": { Icon: Wind, color: "#0EA5E9" },
  appliance: { Icon: Settings, color: "#7C3AED" },
};

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  carpentry: "Carpentry",
  automotive: "Automotive",
  painting: "Painting",
  "ac-repair": "AC Repair",
  appliance: "Appliances",
};

interface ServiceRow {
  id: string;
  name: string;
  category: string;
  description?: string;
  base_price: number;
  image_url?: string;
}

export default function ServicesPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => setSearchInput(q), [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (category) query.set("category", category);
    query.set("limit", "100");

    apiGet<{ services: any[] }>(`/services?${query.toString()}`)
      .then((data) => {
        if (!cancelled) setServices((data.services || []).filter(Boolean));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load services.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, category]);

  const update = (next: Record<string, string>) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value) merged.set(key, value);
      else merged.delete(key);
    });
    setParams(merged);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update({ q: searchInput.trim() });
  };

  const hasFilters = Boolean(q || category);
  const showingDemo = !loading && !error && services.length === 0 && !hasFilters;

  const selectClass =
    "bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl outline-none focus:border-[#2563EB]";

  return (
    <>
      <PageHeader
        eyebrow="On-Demand Home Services"
        title="Services"
        subtitle="Book verified, background-checked professionals at transparent pricing. Fixed in hours, not days."
      >
        <form
          onSubmit={submitSearch}
          className="mt-8 max-w-xl mx-auto flex items-center gap-2 bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 focus-within:border-[#F59E0B]/60 transition-colors"
        >
          <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search services…"
            className="bg-transparent outline-none text-sm text-white w-full placeholder-white/35"
          />
          <button
            type="submit"
            className="bg-[#2563EB] text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-blue-500 transition-colors flex-shrink-0"
          >
            Search
          </button>
        </form>
      </PageHeader>

      <section className="py-10 lg:py-14 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end gap-3 mb-8">
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => update({ category: e.target.value })}
                className={selectClass}
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {q && (
              <button
                onClick={() => setParams(new URLSearchParams())}
                className="text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors py-2.5"
              >
                Clear filters
              </button>
            )}
            <div className="ml-auto text-sm font-bold text-[#64748B] dark:text-slate-400">
              {loading
                ? "Loading…"
                : showingDemo
                ? `Showing ${DEMO_SERVICES.length} sample services`
                : `${services.length} service${services.length === 1 ? "" : "s"} available`}
            </div>
          </div>

          {error ? (
            <EmptyState icon="⚠️" title="Couldn't load services" message={error} />
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 p-6 animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 mb-5" />
                  <div className="h-4 bg-slate-100 rounded-full w-1/2 mb-3" />
                  <div className="h-3 bg-slate-100 rounded-full w-2/3 mb-5" />
                  <div className="h-6 bg-slate-100 rounded-full w-1/3" />
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            showingDemo ? (
              <>
                <DemoNotice kind="services" />
                <DemoServiceGrid />
              </>
            ) : (
              <EmptyState
                title="No services found"
                message="We couldn't find any services matching your search. Try a different term or browse all categories."
              />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((svc) => {
                const style = serviceStyle[String(svc.category || "").toLowerCase()] || {
                  Icon: Wrench,
                  color: "#2563EB",
                };
                const label = CATEGORY_LABELS[svc.category] || svc.category || "Service";
                return (
                  <div
                    key={svc.id}
                    className="relative bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                      style={{ backgroundColor: `${style.color}18` }}
                    >
                      <style.Icon className="w-7 h-7" style={{ color: style.color }} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-1">{svc.name}</h3>
                    <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wide mb-3">{label}</p>
                    <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed mb-5 line-clamp-2 min-h-[2.5rem]">
                      {svc.description || "Verified professional service, booked online in minutes."}
                    </p>
                    <div className="flex items-center gap-2 mb-5">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="text-sm font-bold text-[#111827] dark:text-slate-100">4.8</span>
                      <span className="text-xs text-[#64748B] dark:text-slate-400">verified pro service</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mb-0.5">Starting at</p>
                        <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">
                          {formatINR(svc.base_price)}
                        </p>
                      </div>
                      <Link
                        to={`/booking?service_id=${svc.id}`}
                        className="group flex items-center gap-1.5 bg-[#2563EB] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/20"
                      >
                        Book Now
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors"
            >
              Prefer to buy the tools yourself? Shop hardware →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
