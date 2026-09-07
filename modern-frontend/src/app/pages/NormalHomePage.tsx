import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Wrench, Zap, Droplets, Paintbrush, Car, Hammer, Wind,
  Settings, Sparkles, MapPin, ArrowRight, Star, Shield,
  CheckCircle, Clock, Headphones, ChevronRight,
} from "lucide-react";
import { apiGet } from "../../lib/api";
import { formatINR } from "../../lib/format";
import { useAuth } from "../../lib/auth";
import HeroSection from "../components/HeroSection";

const SERVICE_CATEGORIES = [
  { name: "Plumbing", icon: Droplets, color: "#2563EB", desc: "Leak repairs, pipe fitting, installations" },
  { name: "Electrical", icon: Zap, color: "#D97706", desc: "Wiring, switches, fan & light installation" },
  { name: "Carpentry", icon: Hammer, color: "#92400E", desc: "Furniture repair, door fixes, woodwork" },
  { name: "AC Repair", icon: Wind, color: "#0EA5E9", desc: "AC servicing, gas refill, installation" },
  { name: "Painting", icon: Paintbrush, color: "#EC4899", desc: "Interior & exterior painting" },
  { name: "Automotive", icon: Car, color: "#6B7280", desc: "Car & bike repair, maintenance" },
  { name: "Appliances", icon: Settings, color: "#7C3AED", desc: "Washing machine, fridge, TV repair" },
  { name: "Cleaning", icon: Sparkles, color: "#14B8A6", desc: "Home deep cleaning, sofa & carpet" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Choose a Service", desc: "Tell us what you need fixed", icon: Wrench },
  { step: "2", title: "Enter Your Location", desc: "We find the nearest verified pro", icon: MapPin },
  { step: "3", title: "Get It Fixed", desc: "Professional arrives at your doorstep", icon: CheckCircle },
];

const TRUST_SIGNALS = [
  { icon: Shield, label: "Verified & Background-Checked" },
  { icon: Star, label: "Rated 4.8★ by Customers" },
  { icon: Clock, label: "Same-Day Service Available" },
  { icon: Headphones, label: "24/7 Customer Support" },
];

export default function NormalHomePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ services: any[] }>("/services?limit=8")
      .then((data) => {
        if (!cancelled) setServices(data.services || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220]">
      {/* ─── Hero (same animated scroll hero as premium) ───────── */}
      <HeroSection />

      {/* ─── Trust Signals ──────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#111827] border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
            {TRUST_SIGNALS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm font-semibold text-[#64748B] dark:text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Service Categories ──────────────────────────────────── */}
      <section className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] dark:text-white mb-3">
              What Do You Need Fixed?
            </h2>
            <p className="text-[#64748B] dark:text-slate-400 max-w-lg mx-auto">
              Pick a category and we'll match you with the nearest verified professional.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SERVICE_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/booking?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-[#F59E0B]/30 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${cat.color}12` }}
                >
                  <cat.icon className="w-6 h-6" style={{ color: cat.color }} strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white mb-1">{cat.name}</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-white dark:bg-[#111827]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] dark:text-white mb-3">
              How It Works
            </h2>
            <p className="text-[#64748B] dark:text-slate-400">Three simple steps to get your fix</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center mb-5">
                  <item.icon className="w-7 h-7 text-[#F59E0B]" />
                </div>
                <div className="text-xs font-bold text-[#F59E0B] uppercase tracking-widest mb-2">Step {item.step}</div>
                <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[#64748B] dark:text-slate-400">{item.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ChevronRight className="hidden md:block w-5 h-5 text-[#F59E0B]/40 mx-auto mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Popular Services (from DB) ──────────────────────────── */}
      {services.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] dark:text-white">
                Popular Services
              </h2>
              <Link
                to="/services"
                className="text-sm font-bold text-[#2563EB] hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.slice(0, 6).map((svc: any) => (
                <div
                  key={svc.id}
                  className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white mb-1">{svc.name}</h3>
                  <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wide mb-2">{svc.category || "Service"}</p>
                  <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {svc.description || "Verified professional service"}
                  </p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mb-0.5">Starting at</p>
                      <p className="text-xl font-extrabold text-[#0F172A] dark:text-white">{formatINR(svc.base_price)}</p>
                    </div>
                    <Link
                      to={`/booking?service_id=${svc.id}`}
                      className="flex items-center gap-1 bg-[#2563EB] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
                    >
                      Book Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            Ready to Get Fixed?
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of happy customers who trust FixKart for home services.
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 bg-[#F59E0B] text-[#0F172A] font-extrabold text-base px-8 py-4 rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
          >
            Book a Professional Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
