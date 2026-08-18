import { ReactNode } from "react";
import LoadingScreen from "./LoadingScreen";

// Dark hero band used at the top of every sub-page, matching the home hero.
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative bg-[#0F172A] overflow-hidden pt-28 lg:pt-36 pb-14 lg:pb-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[420px] h-[420px] bg-[#2563EB]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[360px] h-[360px] bg-[#F59E0B]/12 rounded-full blur-[100px]" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/50 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export function LoadingGrid() {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
      <LoadingScreen compact />
    </div>
  );
}

export function EmptyState({
  icon = "🔧",
  title,
  message,
}: {
  icon?: string;
  title: string;
  message: string;
}) {
  return (
    <div className="text-center py-20 px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-extrabold text-[#0F172A] dark:text-white mb-2">{title}</h3>
      <p className="text-[#64748B] dark:text-slate-400 max-w-md mx-auto">{message}</p>
    </div>
  );
}
