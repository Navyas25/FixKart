import { Link } from "react-router";
import {
  Crown, CheckCircle, ArrowRight, Star, Shield, Headphones,
  Users, Eye, Award, Zap,
} from "lucide-react";
import { useAuth } from "../../lib/auth";

const PREMIUM_FEATURES = [
  {
    icon: Users,
    title: "Choose Any Professional",
    desc: "Browse the full directory of verified professionals. Pick by rating, experience, location, and specialty.",
  },
  {
    icon: Eye,
    title: "See Ratings & Reviews",
    desc: "Read real customer reviews and see detailed ratings before booking. No more guessing.",
  },
  {
    icon: Star,
    title: "Compare Options",
    desc: "Compare multiple professionals side by side — price, experience, completion rate, and response time.",
  },
  {
    icon: Shield,
    title: "Priority Support",
    desc: "Get faster responses from our support team. Your issues are handled first.",
  },
  {
    icon: Award,
    title: "Premium Badge",
    desc: "Your profile gets a Premium badge, unlocking access to top-rated professionals.",
  },
  {
    icon: Zap,
    title: "Early Access",
    desc: "Be the first to try new features, services, and professional categories as they launch.",
  },
];

export default function UpgradeToPremiumPage() {
  const { isLoggedIn, isPremium } = useAuth();

  if (isPremium) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex items-center justify-center px-4">
        <div className="text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 p-12 max-w-md">
          <div className="w-16 h-16 mx-auto bg-[#F0FDF4] dark:bg-[#16A34A]/15 rounded-full flex items-center justify-center mb-5">
            <CheckCircle className="w-8 h-8 text-[#16A34A]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] dark:text-white mb-3">
            You're Already Premium!
          </h1>
          <p className="text-[#64748B] dark:text-slate-400 text-sm mb-6">
            You have full access to all FixKart Premium features. Enjoy browsing and choosing any professional.
          </p>
          <Link
            to="/professionals"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
          >
            Browse Professionals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220]">
      {/* Hero */}
      <section className="relative bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1a2744] to-[#0F172A]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold px-4 py-2 rounded-full mb-6">
            <Crown className="w-3.5 h-3.5" />
            FixKart Premium
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Choose Your <span className="text-[#F59E0B]">Perfect Pro</span>
          </h1>
          <p className="text-lg text-white/50 mb-8 max-w-xl mx-auto leading-relaxed">
            Unlock the full FixKart experience. Browse, compare, and choose any verified professional — instead of auto-assignment.
          </p>
          <div className="inline-flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-[#F59E0B]">₹0</p>
              <p className="text-xs text-white/40 font-medium">Free Forever</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">6</p>
              <p className="text-xs text-white/40 font-medium">Premium Features</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">∞</p>
              <p className="text-xs text-white/40 font-medium">Unlimited Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] dark:text-white mb-3">
              What You Get with Premium
            </h2>
            <p className="text-[#64748B] dark:text-slate-400 max-w-lg mx-auto">
              Everything you need to make informed choices about your home service professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREMIUM_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-14 lg:py-20 bg-white dark:bg-[#111827]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] dark:text-white text-center mb-10">
            Normal vs Premium
          </h2>
          <div className="bg-[#F8FAFC] dark:bg-[#0B1220] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-bold border-b border-gray-100 dark:border-white/10">
              <div className="p-4 text-[#64748B] dark:text-slate-400">Feature</div>
              <div className="p-4 text-center text-[#64748B] dark:text-slate-400">Normal</div>
              <div className="p-4 text-center text-[#F59E0B]">Premium</div>
            </div>
            {[
              { feature: "Book services", normal: true, premium: true },
              { feature: "Auto-assigned professional", normal: true, premium: true },
              { feature: "Browse professionals", normal: false, premium: true },
              { feature: "Choose your professional", normal: false, premium: true },
              { feature: "See ratings & reviews", normal: false, premium: true },
              { feature: "Compare professionals", normal: false, premium: true },
              { feature: "Priority support", normal: false, premium: true },
            ].map((row) => (
              <div key={row.feature} className="grid grid-cols-3 text-sm border-b border-gray-100 dark:border-white/5 last:border-0">
                <div className="p-4 font-medium text-[#0F172A] dark:text-white">{row.feature}</div>
                <div className="p-4 text-center">
                  {row.normal ? (
                    <CheckCircle className="w-5 h-5 text-[#16A34A] mx-auto" />
                  ) : (
                    <span className="text-[#94A3B8]">—</span>
                  )}
                </div>
                <div className="p-4 text-center">
                  <CheckCircle className="w-5 h-5 text-[#F59E0B] mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 lg:py-20 bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Crown className="w-12 h-12 text-[#F59E0B] mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            Ready to Go Premium?
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
            It's free. Upgrade now and start choosing your own professionals.
          </p>
          {isLoggedIn ? (
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 bg-[#F59E0B] text-[#0F172A] font-extrabold text-base px-8 py-4 rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#F59E0B] text-[#0F172A] font-extrabold text-base px-8 py-4 rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
            >
              Sign In to Upgrade
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
