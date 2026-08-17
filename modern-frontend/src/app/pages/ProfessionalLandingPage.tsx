import { Link } from "react-router";
import {
  Wrench,
  ClipboardList,
  ShieldCheck,
  CalendarCheck,
  IndianRupee,
  ArrowRight,
  Star,
} from "lucide-react";

const STEPS = [
  {
    icon: <ClipboardList className="w-6 h-6 text-[#2563EB]" />,
    title: "Apply in minutes",
    text: "Tell us what you do, your experience, and upload a government ID. No fees to join.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#16A34A]" />,
    title: "Get verified",
    text: "Our team reviews your details and document. Verified professionals get the badge and appear first.",
  },
  {
    icon: <CalendarCheck className="w-6 h-6 text-[#D97706]" />,
    title: "Accept jobs",
    text: "Customers book you directly. Accept or reject bookings from your dashboard on your schedule.",
  },
  {
    icon: <IndianRupee className="w-6 h-6 text-[#16A34A]" />,
    title: "Get paid",
    text: "Track every job and your earnings in one place. Ratings from happy customers build your reputation.",
  },
];

export default function ProfessionalLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#0F172A] overflow-hidden pt-32 lg:pt-40 pb-20 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[10%] w-[480px] h-[480px] bg-[#F59E0B]/15 rounded-full blur-[130px]" />
          <div className="absolute bottom-[-25%] left-[5%] w-[420px] h-[420px] bg-[#2563EB]/20 rounded-full blur-[110px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-[#F59E0B]/15 text-[#FBBF24] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            <Wrench className="w-3.5 h-3.5" /> FixKart Pro
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5 max-w-3xl mx-auto">
            Turn your skills into a steady income
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Plumbers, electricians, carpenters, AC technicians, painters,
            mechanics — join FixKart, get verified, and take jobs from customers
            near you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register/professional"
              className="inline-flex items-center gap-2 bg-[#F59E0B] text-[#0F172A] font-extrabold text-sm px-8 py-4 rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
            >
              Apply as a professional <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login?next=/professional/dashboard"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-bold text-sm px-8 py-4 rounded-2xl hover:border-white/40 transition-colors"
            >
              Professional sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC] dark:bg-[#0B1220]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-3">
              How it works
            </h2>
            <p className="text-[#64748B] dark:text-slate-400 max-w-xl mx-auto">
              From application to your first paying job in four steps.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-sm relative"
              >
                <span className="absolute top-5 right-6 text-4xl font-extrabold text-[#0F172A]/5 dark:text-white/5">
                  {i + 1}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-[#2563EB]/15 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="font-extrabold text-[#0F172A] dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="py-16 lg:py-24 bg-white dark:bg-[#0E1626] border-y border-gray-100 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4">
                Every professional is verified
              </h2>
              <p className="text-[#64748B] dark:text-slate-400 leading-relaxed mb-6">
                For the safety of customers, every FixKart Pro account starts as{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  pending verification
                </span>
                . After you register, our team reviews your service details and
                uploaded ID before you can start accepting jobs.
              </p>
              <ul className="space-y-3">
                {[
                  "Government ID check (Aadhaar, PAN, licence, certificate)",
                  "Service category and experience review",
                  "Verified badge on your public profile",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm font-semibold text-[#0F172A] dark:text-white"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-[#0F172A] rounded-3xl p-6 lg:p-8 text-white shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-xl font-extrabold text-[#0F172A]">
                    RK
                  </div>
                  <div>
                    <p className="font-extrabold">Rajesh Kumar</p>
                    <p className="text-xs text-white/50">Plumber · 12 yrs experience</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]"
                    />
                  ))}
                  <span className="text-xs text-white/50 ml-1">4.9</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold bg-[#16A34A]/15 text-[#4ADE80] px-3 py-2 rounded-xl w-fit">
                  <ShieldCheck className="w-4 h-4" /> Verified professional
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC] dark:bg-[#0B1220] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl lg:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4">
            Ready to start earning?
          </h2>
          <p className="text-[#64748B] dark:text-slate-400 mb-8">
            Join hundreds of professionals serving customers across the city.
          </p>
          <Link
            to="/register/professional"
            className="inline-flex items-center gap-2 bg-[#F59E0B] text-[#0F172A] font-extrabold text-sm px-8 py-4 rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
          >
            Apply as a professional <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
