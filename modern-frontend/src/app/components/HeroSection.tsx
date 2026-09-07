import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Wrench, Zap, Droplets, Paintbrush, Shield, Car,
  Hammer, Wind, Star, MapPin, Search, Phone,
  CheckCircle, ArrowRight, ShoppingCart,
  ChevronDown, ChevronRight, Package, Truck, Headphones,
  Settings, Home, Calendar, Battery,
  Lock, Activity, BadgeCheck,
} from "lucide-react";
import { attachAutocomplete, detectUserLocation } from "../../lib/location";
import { RotatingCurvedText } from "../components/RotatingCurvedText";

type LucideIcon = typeof Wrench;

const storyLines: { icon: LucideIcon; text: string }[] = [
  { icon: Truck, text: "Order hardware tools & supplies — delivered to your door." },
  { icon: BadgeCheck, text: "Book verified professionals for any home fix." },
  { icon: Wrench, text: "Plumbing, electrical, carpentry & more — all in one place." },
  { icon: Star, text: "Quality service you can count on, every time." },
];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

export default function HeroSection() {
  const [loc, setLoc] = useState("");
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);

  const locationRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const heroRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const input = locationRef.current;
    if (!input) return;
    attachAutocomplete(input, (formattedAddress) => {
      setLoc(formattedAddress);
    });
  }, []);

  useEffect(() => {
    const section = heroRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const p = clamp01(-rect.top / rect.height);

      const blurAmount = 16 * Math.pow(1 - p, 1.6);
      img.style.filter = `blur(${blurAmount.toFixed(2)}px)`;
      img.style.transform = `scale(${(1.18 - 0.18 * p).toFixed(4)})`;

      storyRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.01 + i * 0.03;
        const fadeIn = clamp01((p - start) / 0.03);
        const fadeOut = clamp01((p - 0.18) / 0.06);
        const opacity = fadeIn * (1 - fadeOut);
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translateY(${((1 - opacity) * 32).toFixed(2)}px)`;
      });

      const content = contentRef.current;
      if (content) {
        const opacity = clamp01((p - 0.22) / 0.1);
        content.style.opacity = opacity.toFixed(3);
        content.style.transform = `translateY(${((1 - opacity) * 48).toFixed(2)}px)`;
        content.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const handleDetectLocation = async () => {
    if (locating) return;
    setLocating(true);
    setLoc("Detecting location…");
    try {
      const { latitude, longitude, address } = await detectUserLocation();
      setLoc(address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch {
      setLoc("Unable to detect location");
    } finally {
      setLocating(false);
    }
  };

  return (
    <section ref={heroRef} className="relative h-[650vh] bg-[#0F172A]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <img
          ref={imgRef}
          src="/workshop.png"
          alt="FixKart workshop"
          style={{ filter: "blur(16px)", transform: "scale(1.18)" }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0F172A]/55" />

        {/* Story lines */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="space-y-5 max-w-2xl px-6">
            {storyLines.map((line, i) => (
              <div
                key={i}
                ref={(el) => { storyRefs.current[i] = el; }}
                className="flex items-center gap-4"
                style={{ opacity: 0 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <line.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug">
                  {line.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main hero content */}
        <div
          ref={contentRef}
          style={{ opacity: 0, transform: "translateY(48px)", pointerEvents: "none" }}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <div className="hidden xl:flex absolute top-1/2 -translate-y-1/2" style={{ right: "200px" }}>
            <RotatingCurvedText
              text="FIX KART • HARDWARE & HOME SERVICES • EST. 2026 • "
              size={158}
            />
          </div>

          <div className="relative w-full max-w-3xl text-center px-4 py-20">
            <h1 className="text-[2.6rem] sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              Everything You Need.{" "}
              <span className="text-[#F59E0B]">Fixed Fast.</span>
            </h1>

            <p className="text-lg text-white/55 mb-10 max-w-xl mx-auto leading-relaxed">
              Order hardware tools & supplies, or book
              verified professionals for any home fix —
              delivered or at your doorstep in hours.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmedQuery = query.trim();
                if (trimmedQuery) {
                  navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
                } else {
                  navigate("/search");
                }
              }}
              className="hero-search-bar bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 mb-8 max-w-2xl mx-auto shadow-2xl shadow-black/30"
            >
              <div className="flex items-center gap-2 flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  title="Detect my location"
                  aria-label="Detect my location"
                  className="text-[#2563EB] flex-shrink-0 hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MapPin className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <input
                  ref={locationRef}
                  type="text"
                  placeholder={locating ? "Detecting location…" : "Your location…"}
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search products or services…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                className="bg-[#2563EB] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-500 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2 justify-center shadow-md shadow-blue-600/30"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="group flex items-center justify-center gap-2.5 bg-[#F59E0B] text-[#0F172A] font-extrabold text-base px-8 py-4 rounded-2xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/25"
              >
                <ShoppingCart className="w-5 h-5" />
                Shop Hardware
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/services"
                className="group flex items-center justify-center gap-2.5 border-2 border-white/20 text-white font-extrabold text-base px-8 py-4 rounded-2xl hover:border-white/40 hover:bg-white/5 active:scale-95 transition-all"
              >
                <Calendar className="w-5 h-5" />
                Book a Service
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
