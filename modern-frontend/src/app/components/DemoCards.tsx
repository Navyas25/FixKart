import {
  Wrench,
  Droplets,
  Zap,
  Hammer,
  Car,
  Paintbrush,
  Wind,
  Settings,
  Star,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { formatINR, PLACEHOLDER_IMG } from "../../lib/format";
import {
  DEMO_PRODUCTS,
  DEMO_SERVICES,
  DEMO_PROFESSIONALS,
} from "../../lib/demoData";

/* Info banner shown above the sample grids */
export function DemoNotice({ kind }: { kind: "products" | "services" | "professionals" }) {
  const count =
    kind === "products"
      ? DEMO_PRODUCTS.length
      : kind === "services"
      ? DEMO_SERVICES.length
      : DEMO_PROFESSIONALS.length;
  return (
    <div className="mb-6 rounded-2xl border border-amber-300/60 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
      <strong className="font-extrabold">Showing {count} sample {kind}.</strong>{" "}
      Your Supabase database isn't seeded yet — run{" "}
      <code className="font-mono text-xs bg-amber-100/70 dark:bg-amber-400/10 px-1.5 py-0.5 rounded">
        backend/scripts/seed.sql
      </code>{" "}
      in the Supabase SQL editor to go live with real data. These samples are
      non-interactive placeholders.
    </div>
  );
}

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
  cleaning: "Cleaning",
};

function SamplePill() {
  return (
    <span className="text-[9px] font-extrabold uppercase px-2 py-1 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 flex-shrink-0">
      Sample
    </span>
  );
}

export function DemoProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {DEMO_PRODUCTS.map((p) => (
        <div
          key={p.id}
          className="bg-white dark:bg-[#111827] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/10"
        >
          <div className="aspect-[4/3] overflow-hidden bg-slate-100">
            <img
              src={p.image_url}
              alt={p.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] text-[#2563EB] font-extrabold uppercase tracking-wide">
                {p.category.name}
              </span>
              <SamplePill />
            </div>
            <h3 className="font-bold text-[#0F172A] dark:text-slate-100 text-sm mb-2 line-clamp-2 min-h-[2.5rem] leading-snug">
              {p.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold text-[#0F172A] dark:text-white">
                {formatINR(p.price)}
              </span>
              <span className="text-xs font-semibold text-[#94A3B8] dark:text-slate-500">
                {p.brand}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DemoServiceGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {DEMO_SERVICES.map((svc) => {
        const style = serviceStyle[String(svc.category || "").toLowerCase()] || {
          Icon: Wrench,
          color: "#2563EB",
        };
        return (
          <div
            key={svc.id}
            className="relative bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-2xl p-6 h-full"
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${style.color}18` }}
              >
                <style.Icon
                  className="w-7 h-7"
                  style={{ color: style.color }}
                  strokeWidth={1.8}
                />
              </div>
              <SamplePill />
            </div>
            <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-1">
              {svc.name}
            </h3>
            <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wide mb-3">
              {CATEGORY_LABELS[svc.category] || svc.category}
            </p>
            <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed mb-5 line-clamp-2 min-h-[2.5rem]">
              {svc.description}
            </p>
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="text-sm font-bold text-[#111827] dark:text-slate-100">4.8</span>
              <span className="text-xs text-[#64748B] dark:text-slate-400">verified pro service</span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mb-0.5">
              Starting at
            </p>
            <p className="text-2xl font-extrabold text-[#0F172A] dark:text-white">
              {formatINR(svc.base_price)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function DemoProGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {DEMO_PROFESSIONALS.map((pro) => (
        <div
          key={pro.id}
          className="bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/10"
        >
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={pro.profile.avatar_url || PLACEHOLDER_IMG}
                  alt={pro.profile.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#16A34A] rounded-full border-2 border-white dark:border-[#111827] flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-extrabold text-[#0F172A] dark:text-white text-sm truncate">
                  {pro.profile.full_name}
                </h4>
                <SamplePill />
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mb-2.5 line-clamp-2">
                {pro.bio}
              </p>
              <div className="flex items-center gap-4 text-xs text-[#64748B] dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                  <strong className="text-[#111827] dark:text-slate-100">{pro.rating}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {pro.experience_years} yrs exp
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
