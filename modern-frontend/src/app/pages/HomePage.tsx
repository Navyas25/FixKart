import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import {
  Wrench, Zap, Droplets, Paintbrush, Shield, Car,
  Hammer, Wind, Star, MapPin, Search, Phone,
  CheckCircle, ArrowRight, ShoppingCart,
  ChevronDown, ChevronRight, Package, Truck, Headphones,
  Settings, Home, Calendar, Battery,
  Lock, Activity, BadgeCheck,
} from "lucide-react";
import { apiGet } from "../../lib/api";
import { attachAutocomplete, detectUserLocation } from "../../lib/location";
import { useCart } from "../../lib/cart";
import { useAuth } from "../../lib/auth";
import { formatINR, formatDate, PLACEHOLDER_IMG } from "../../lib/format";
import { ProductCard, type ProductCardData } from "../components/ProductCard";
import { RotatingCurvedText } from "../components/RotatingCurvedText";

type LucideIcon = typeof Wrench;

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -56 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 56 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

// ─── Hero Section ───────────────────────────────────────────────────────────
// Full-screen scroll story: the workshop photo covers the whole viewport and
// starts blurred. As the user scrolls it clears into focus while sentences
// about FixKart appear, then the search/CTA hero content reveals at the end.

const storyLines: { icon: LucideIcon; text: string }[] = [
  { icon: Truck, text: "Order hardware tools & supplies — delivered to your door in hours." },
  { icon: BadgeCheck, text: "Book verified, background-checked professionals for any home fix." },
  { icon: Wrench, text: "Plumbing, electrical, carpentry & more — across 50+ cities." },
  { icon: Star, text: "Trusted by 200,000+ customers with a 4.8★ rating." },
];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function HeroSection() {
  const [loc, setLoc] = useState("");
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const locationRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Scroll story driver: writes the image blur/scale, the story sentences and
  // the final hero content directly from the pinned section's position. Direct
  // style writes keep it deterministic with Lenis' native scrolling.
  const heroRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Google Places autocomplete on the location field (VITE_GOOGLE_MAPS_API_KEY).
  useEffect(() => {
    const input = locationRef.current;
    if (!input) return;
    attachAutocomplete(input, (formattedAddress) => {
      setLoc(formattedAddress);
    });
  }, []);

  // Scroll-linked reveal: progress p goes 0→1 across the pinned window (from
  // the section top at the viewport top until the section bottom reaches the
  // viewport top). Drives: image blur 16→0px + scale 1.18→1, the story
  // sentences fading in one by one, and the search/CTA content revealing at
  // the end once the image is fully clear.
  useEffect(() => {
    const section = heroRef.current;
    const img = imgRef.current;
    if (!section || !img) return;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const p = clamp01(-rect.top / rect.height);
      img.style.filter = `blur(${((1 - p) * 16).toFixed(2)}px)`;
      img.style.transform = `scale(${(1.18 - 0.18 * p).toFixed(4)})`;
      storyRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.04 + i * 0.14;
        const fadeIn = clamp01((p - start) / 0.1);
        const fadeOut = clamp01((p - 0.72) / 0.14);
        const o = fadeIn * (1 - fadeOut);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translateY(${((1 - o) * 32).toFixed(2)}px)`;
      });
      const content = contentRef.current;
      if (content) {
        const o = clamp01((p - 0.8) / 0.16);
        content.style.opacity = o.toFixed(3);
        content.style.transform = `translateY(${((1 - o) * 48).toFixed(2)}px)`;
        content.style.pointerEvents = o > 0.1 ? "auto" : "none";
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
    <section ref={heroRef} className="relative h-[300vh] bg-[#0F172A]">
      {/* Pinned full-screen stage: image clears + story plays as the user scrolls */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Workshop background image — covers the whole screen, blurred → sharp */}
        <img
          ref={imgRef}
          src="/workshop.png"
          alt="FixKart workshop"
          style={{ filter: "blur(16px)", transform: "scale(1.18)" }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark scrim for legibility */}
        <div className="absolute inset-0 bg-[#0F172A]/55" />

        {/* Scroll story: sentences about FixKart appear one by one */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 sm:gap-7 px-4">
          {storyLines.map((line, i) => {
            const Icon = line.icon;
            return (
              <div
                key={line.text}
                ref={(el) => {
                  storyRefs.current[i] = el;
                }}
                style={{ opacity: 0, transform: "translateY(32px)" }}
                className="flex items-center gap-3 sm:gap-4 max-w-2xl"
              >
                <span className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <p className="text-white text-lg sm:text-2xl font-semibold text-left leading-snug">
                  {line.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hero content — reveals once the image is fully clear */}
        <div
          ref={contentRef}
          style={{ opacity: 0, transform: "translateY(48px)", pointerEvents: "none" }}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <div className="relative w-full max-w-3xl text-center px-4 py-20">
        {/* Rotating curved-text badge */}
        <div className="hidden xl:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2">
          <RotatingCurvedText
            text="FIX KART • HARDWARE & HOME SERVICES • EST. 2026 • "
            size={158}
          />
        </div>

        {/* Headline */}
        <h1 className="text-[2.6rem] sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
          Everything You Need.{" "}
          <span className="text-[#F59E0B]">Fixed Fast.</span>
        </h1>

        {/* Sub */}
        <p className="text-lg text-white/55 mb-10 max-w-xl mx-auto leading-relaxed">
          Order hardware tools & supplies, or book verified professionals for any home fix —
          delivered or at your doorstep in hours.
        </p>

        {/* Search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
          }}
          className="hero-search-bar bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 mb-8 max-w-2xl mx-auto shadow-2xl shadow-black/30"
        >
          <div className="flex items-center gap-2 flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <button
              type="button"
              onClick={handleDetectLocation}
              title="Detect my location"
              aria-label="Detect my location"
              className="text-[#2563EB] flex-shrink-0 hover:scale-110 active:scale-95 transition-transform"
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

        {/* CTAs */}
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

// Stats strip
function HeroStatsStrip() {
  return (
    <section className="bg-[#0F172A] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { val: "50,000+", label: "Orders Delivered" },
          { val: "2,500+", label: "Verified Pros" },
          { val: "4.8 ★", label: "Avg. Rating" },
          { val: "< 60 min", label: "Avg. Response" },
        ].map((s, i) => (
          <div key={i}>
            <div className="text-2xl lg:text-3xl font-extrabold text-white">{s.val}</div>
            <div className="text-white/40 text-sm mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Scrolling Text Marquee ───────────────────────────────────────────────────
// Blocks of text drift horizontally as the page scrolls vertically (the
// classic Motion + Ticker effect: useScroll mapped onto the lines' x position).

function MarqueeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Opposite directions for the two lines - one trails up, one trails down.
  const lineA = useTransform(scrollYProgress, [0, 1], ["0%", "-42%"]);
  const lineB = useTransform(scrollYProgress, [0, 1], ["-42%", "0%"]);

  const text = "FIXKART • HARDWARE & HOME SERVICES • FIXED FAST • ";

  return (
    <section ref={ref} className="bg-[#0F172A] border-y border-white/10 overflow-hidden py-8 select-none">
      <motion.div
        style={{ x: lineA }}
        className="whitespace-nowrap text-3xl sm:text-5xl font-extrabold tracking-tight text-white/90"
      >
        {text.repeat(6)}
      </motion.div>
      <motion.div
        style={{ x: lineB }}
        className="whitespace-nowrap text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F59E0B]"
      >
        {text.repeat(6)}
      </motion.div>
    </section>
  );
}

// ─── Personalized Section (order again / frequent) ───────────────────────────

function PersonalizedSection() {
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [frequent, setFrequent] = useState<any[]>([]);
  const [frequentServices, setFrequentServices] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;

    Promise.allSettled([
      apiGet<{ orders: any[] }>("/orders"),
      apiGet<{ products: any[] }>("/orders/frequent"),
      apiGet<{ bookings: any[] }>("/bookings"),
    ]).then(([ordersRes, frequentRes, bookingsRes]) => {
      if (cancelled) return;
      if (ordersRes.status === "fulfilled") {
        const orders = ordersRes.value.orders || [];
        if (orders.length) setLastOrder(orders[0]);
      }
      if (frequentRes.status === "fulfilled") {
        setFrequent((frequentRes.value.products || []).slice(0, 4));
      }
      if (bookingsRes.status === "fulfilled") {
        const counts = new Map();
        for (const booking of bookingsRes.value.bookings || []) {
          const svc = booking.service;
          if (!svc) continue;
          const entry = counts.get(svc.id) || { service: svc, count: 0 };
          entry.count += 1;
          counts.set(svc.id, entry);
        }
        setFrequentServices(
          [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 4)
        );
      }
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  if (!isLoggedIn || !loaded) return null;
  if (!lastOrder && frequent.length === 0 && frequentServices.length === 0) return null;

  const reorder = () => {
    (lastOrder.items || []).forEach((item: any) => {
      if (item.product_id) {
        addToCart({
          id: item.product_id,
          name: item.product?.name || "",
          price: item.product?.price ?? item.unit_price,
          image_url: item.product?.image_url,
        });
      }
    });
    navigate("/cart");
  };

  const panel =
    "bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/10";

  return (
    <section className="py-12 lg:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-block bg-[#EFF6FF] text-[#2563EB] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            Welcome Back
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] leading-tight">
            Quick re-order & favourites
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Order again */}
          {lastOrder && (
            <div className={panel}>
              <h3 className="font-extrabold text-[#0F172A] text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2563EB]" /> Order Again
              </h3>
              <div className="flex items-center gap-2 mb-3">
                {(lastOrder.items || []).slice(0, 4).map((item: any) => (
                  <img
                    key={item.id}
                    src={item.product?.image_url || PLACEHOLDER_IMG}
                    alt={item.product?.name || "Product"}
                    className="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-gray-100"
                  />
                ))}
              </div>
              <p className="text-xs text-[#64748B] mb-4">
                {formatINR(lastOrder.total_amount)} · {formatDate(lastOrder.created_at)}
              </p>
              <button
                onClick={reorder}
                className="w-full bg-[#2563EB] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-500 active:scale-95 transition-all"
              >
                Add to cart & reorder
              </button>
            </div>
          )}

          {/* Frequently ordered */}
          {frequent.length > 0 && (
            <div className={panel}>
              <h3 className="font-extrabold text-[#0F172A] text-sm mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#F59E0B]" /> Frequently Ordered
              </h3>
              <div className="space-y-2.5">
                {frequent.map(({ product, count }: any) => (
                  <div key={product.id} className="flex items-center justify-between gap-3">
                    <Link
                      to={`/product/${product.id}`}
                      className="text-xs font-bold text-[#0F172A] truncate hover:text-[#2563EB] transition-colors"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-[#64748B]">×{count}</span>
                      <button
                        onClick={() =>
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image_url: product.image_url,
                          })
                        }
                        className="bg-[#0F172A] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-[#2563EB] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Frequently booked services */}
          {frequentServices.length > 0 && (
            <div className={panel}>
              <h3 className="font-extrabold text-[#0F172A] text-sm mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#16A34A]" /> Frequently Booked
              </h3>
              <div className="space-y-2.5">
                {frequentServices.map(({ service, count }: any) => (
                  <div key={service.id} className="flex items-center justify-between gap-3">
                    <Link
                      to={`/booking?service_id=${service.id}`}
                      className="text-xs font-bold text-[#0F172A] truncate hover:text-[#2563EB] transition-colors"
                    >
                      {service.name}
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-[#64748B]">×{count}</span>
                      <Link
                        to={`/booking?service_id=${service.id}`}
                        className="bg-[#16A34A] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-500 transition-colors"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Featured & Deals Section ─────────────────────────────────────────────────

function FeaturedAndDealsSection() {
  const [featured, setFeatured] = useState<ProductCardData[]>([]);
  const [offers, setOffers] = useState<ProductCardData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      apiGet<{ products: any[] }>("/products?featured=true&limit=4"),
      apiGet<{ products: any[] }>("/products?offers=true&limit=4"),
    ]).then(([featuredRes, offersRes]) => {
      if (cancelled) return;
      const map = (p: any): ProductCardData => ({
        id: p.id,
        name: p.name || "Hardware product",
        category: p.category?.name || p.category || "Hardware",
        price: Number(p.price) || 0,
        image_url: p.image_url || "",
        stock: p.stock,
        discount_price: p.discount_price != null ? Number(p.discount_price) : undefined,
        featured: Boolean(p.featured),
      });
      if (featuredRes.status === "fulfilled") {
        setFeatured((featuredRes.value.products || []).map(map));
      }
      if (offersRes.status === "fulfilled") {
        // Only show genuine deals (a discounted price lower than the MRP).
        const rows = (offersRes.value.products || [])
          .map(map)
          .filter(
            (p) => p.discount_price != null && Number(p.discount_price) < Number(p.price)
          );
        setOffers(rows);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) return null;
  if (featured.length === 0 && offers.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured products */}
        {featured.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-end justify-between mb-6"
            >
              <div>
                <span className="inline-block bg-[#EFF6FF] text-[#2563EB] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
                  Handpicked
                </span>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A]">
                  Featured Products
                </h2>
              </div>
              <Link
                to="/products"
                className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#2563EB] hover:gap-2 transition-all"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}

        {/* Deals & offers */}
        {offers.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-end justify-between mb-6"
            >
              <div>
                <span className="inline-block bg-[#FEF2F2] text-[#DC2626] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
                  Limited Time
                </span>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A]">
                  Deals & Offers
                </h2>
              </div>
              <Link
                to="/products"
                className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#DC2626] hover:gap-2 transition-all"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {offers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── Top Rated Professionals ─────────────────────────────────────────────────

function TopProfessionalsSection() {
  const [pros, setPros] = useState<ProCard[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ professionals: any[] }>("/professionals?sort=rating&limit=4")
      .then((data) => {
        if (cancelled) return;
        const rows = (data.professionals || [])
          .filter((p) => Number(p.rating) > 0)
          .slice(0, 4)
          .map(toProCard);
        setPros(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || pros.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-6"
        >
          <div>
            <span className="inline-block bg-[#FFFBEB] text-[#D97706] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              Customer Favourites
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A]">
              Top Rated Professionals
            </h2>
          </div>
          <Link
            to="/professionals"
            className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#D97706] hover:gap-2 transition-all"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pros.map((pro, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#F8FAFC] dark:bg-[#0B1220] rounded-2xl p-6 border border-gray-100 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={pro.img || PLACEHOLDER_IMG}
                    alt={pro.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-[#0F172A] text-sm truncate">{pro.name}</p>
                  <p className="text-[11px] text-[#64748B] line-clamp-1">{pro.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#64748B] mb-4">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <strong className="text-[#111827]">{pro.rating.toFixed(1)}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#16A34A]" /> Verified
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  to={pro.id ? `/booking?professional_id=${pro.id}` : "/services"}
                  className="flex-1 bg-[#2563EB] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-500 active:scale-95 transition-all text-center"
                >
                  Book Now
                </Link>
                <Link
                  to={pro.id ? `/professional/${pro.id}` : "/professionals"}
                  className="px-3.5 border border-gray-200 text-[#64748B] text-xs font-semibold py-2.5 rounded-xl hover:border-gray-300 hover:text-[#0F172A] transition-colors"
                >
                  Profile
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Categories Section ───────────────────────────────────────────────────────

const categories = [
  { Icon: Droplets, name: "Plumbing", slug: "plumbing", count: "240+ Products", color: "#2563EB", bg: "#EFF6FF" },
  { Icon: Zap, name: "Electrical", slug: "electrical", count: "380+ Products", color: "#D97706", bg: "#FFFBEB" },
  { Icon: Wrench, name: "Tools", slug: "tools", count: "520+ Products", color: "#0F172A", bg: "#F1F5F9" },
  { Icon: Paintbrush, name: "Paint & Coatings", slug: "", count: "180+ Products", color: "#EC4899", bg: "#FDF4FF" },
  { Icon: Shield, name: "Safety Gear", slug: "", count: "150+ Products", color: "#16A34A", bg: "#F0FDF4" },
  { Icon: Car, name: "Automotive", slug: "automotive", count: "310+ Products", color: "#7C3AED", bg: "#F5F3FF" },
  { Icon: Battery, name: "Power & Energy", slug: "", count: "200+ Products", color: "#D97706", bg: "#FFFBEB" },
  { Icon: Settings, name: "Appliances", slug: "", count: "440+ Products", color: "#0F172A", bg: "#F8FAFC" },
];

function CategoriesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <span className="inline-block bg-[#EFF6FF] text-[#2563EB] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Browse Categories
          </span>
          <h2 className="text-3xl lg:text-[3.25rem] font-extrabold text-[#0F172A] leading-tight mb-4">
            Shop by Category
          </h2>
          <p className="text-[#64748B] text-lg max-w-xl mx-auto leading-relaxed">
            From basic plumbing supplies to professional-grade power tools — everything delivered same day.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5"
        >
          {categories.map((cat, i) => (
            <motion.div
  key={i}
  initial={{ opacity: 0, scale: 0.88 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{
    duration: 0.5,
    ease: "easeOut",
    delay: i * 0.09,
  }}
  className="group p-6 lg:p-7 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 bg-white cursor-default"
>
              <Link
                to={cat.slug ? `/products?category=${cat.slug}` : "/products"}
                className="group block bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100/80 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: cat.bg }}
                >
                  <cat.Icon className="w-6 h-6" style={{ color: cat.color }} strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-[#0F172A] text-sm lg:text-base mb-1">{cat.name}</h3>
                <p className="text-[#64748B] text-xs font-medium">{cat.count}</p>
                <div className="mt-3 flex items-center gap-1 text-[#2563EB] text-xs font-bold opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
                  Browse <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-[#2563EB] font-bold text-sm hover:gap-3 transition-all"
          >
            View all categories <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Services Section ─────────────────────────────────────────────────────────

type ServiceCard = {
  id?: string;
  Icon: LucideIcon;
  title: string;
  rating: number;
  reviews: number;
  price: string;
  tag: string;
  color: string;
};

const serviceStyle: Record<string, { Icon: LucideIcon; color: string }> = {
  plumbing: { Icon: Droplets, color: "#2563EB" },
  electrical: { Icon: Zap, color: "#D97706" },
  carpentry: { Icon: Hammer, color: "#92400E" },
  automotive: { Icon: Car, color: "#6B7280" },
  painting: { Icon: Paintbrush, color: "#EC4899" },
  "ac-repair": { Icon: Wind, color: "#0EA5E9" },
};

// Shown when the backend has no services yet (or is unreachable), so the
// landing page still looks complete.
const fallbackServices: ServiceCard[] = [
  { Icon: Droplets, title: "Plumber", rating: 4.9, reviews: 2340, price: "₹299", tag: "Most Booked", color: "#2563EB" },
  { Icon: Zap, title: "Electrician", rating: 4.8, reviews: 1820, price: "₹349", tag: "Top Rated", color: "#D97706" },
  { Icon: Hammer, title: "Carpenter", rating: 4.7, reviews: 1240, price: "₹399", tag: "", color: "#92400E" },
  { Icon: Settings, title: "Mechanic", rating: 4.8, reviews: 980, price: "₹449", tag: "", color: "#6B7280" },
  { Icon: Wind, title: "AC Repair", rating: 4.9, reviews: 3100, price: "₹499", tag: "Express", color: "#0EA5E9" },
  { Icon: Paintbrush, title: "Painter", rating: 4.6, reviews: 860, price: "₹299", tag: "", color: "#EC4899" },
];

// Maps an API service row onto the card shape.
const toServiceCard = (svc: any): ServiceCard => {
  const style = serviceStyle[String(svc.category || "").toLowerCase()] || {
    Icon: Wrench,
    color: "#2563EB",
  };
  return {
    id: svc.id,
    Icon: style.Icon,
    title: svc.name || svc.category || "Service",
    rating: 4.8,
    reviews: 0,
    price: `From ${formatINR(svc.base_price)}`,
    tag: "",
    color: style.color,
  };
};

function ServicesSection() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [services, setServices] = useState<ServiceCard[]>(fallbackServices);

  // Load real services from the backend; keep the design cards until then.
  useEffect(() => {
    let cancelled = false;
    apiGet<{ services: any[] }>("/services")
      .then((data) => {
        const rows = (data.services || []).filter(Boolean);
        if (!cancelled && rows.length) {
          setServices(rows.slice(0, 6).map(toServiceCard));
        }
      })
      .catch(() => {
        // Backend unreachable - keep the fallback cards.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <span className="inline-block bg-[#FFFBEB] text-[#D97706] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            On-Demand Professionals
          </span>
          <h2 className="text-3xl lg:text-[3.25rem] font-extrabold text-[#0F172A] leading-tight mb-4">
            Need a Professional?
          </h2>
          <p className="text-[#64748B] text-lg max-w-xl mx-auto leading-relaxed">
            Book verified, background-checked pros at transparent pricing. Fixed in hours, not days.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((svc, i) => (
            <motion.div
              key={i}
              
              className="group"
            >
              <div
                onClick={() => {
                  if (svc.id) navigate(`/service/${svc.id}`);
                }}
                className="relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer h-full"
              >
                {svc.tag && (
                  <span className="absolute top-4 right-4 bg-[#0F172A] text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {svc.tag}
                  </span>
                )}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${svc.color}18` }}
                >
                  <svc.Icon className="w-7 h-7" style={{ color: svc.color }} strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-extrabold text-[#0F172A] mb-2">{svc.title}</h3>
                <div className="flex items-center gap-2 mb-5">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="text-sm font-bold text-[#111827]">{svc.rating}</span>
                  <span className="text-[#64748B] text-xs">
                    ({svc.reviews.toLocaleString()} reviews)
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#64748B] font-medium mb-0.5">Starting at</p>
                    <p className="text-2xl font-extrabold text-[#0F172A]">{svc.price}</p>
                  </div>
                  <Link
                    to={svc.id ? `/booking?service_id=${svc.id}` : "/services"}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#2563EB] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/20"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    title: "Choose",
    desc: "Browse thousands of hardware products or select from our verified professionals in your city.",
    Icon: Search,
    color: "#2563EB",
  },
  {
    num: "02",
    title: "Book / Order",
    desc: "Schedule a convenient time slot or get same-day delivery for urgent needs — no hidden fees.",
    Icon: Calendar,
    color: "#F59E0B",
  },
  {
    num: "03",
    title: "Get It Fixed",
    desc: "Your pro arrives on time and gets the job done right. 100% satisfaction guaranteed.",
    Icon: CheckCircle,
    color: "#16A34A",
  },
];

function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 lg:py-28 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#2563EB]/12 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[#2563EB]/20 text-[#93C5FD] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl lg:text-[3.25rem] font-extrabold text-white leading-tight mb-4">
            How It Works
          </h2>
          <p className="text-white/45 text-lg max-w-lg mx-auto leading-relaxed">
            Three steps from problem to solution — we make every fix effortless.
          </p>
        </motion.div>

        <div ref={ref} className="relative">
          {/* Animated connector line */}
          <div className="hidden lg:block absolute top-[52px] left-[22%] right-[22%] h-[2px] bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "#F59E0B",
                transformOrigin: "left center",
              }}
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.3, delay: 0.5, ease: "easeInOut" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.6, delay: i * 0.18 + 0.35 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Icon ring */}
                <div className="relative mb-7">
                  <div
                    className="w-[104px] h-[104px] rounded-full flex items-center justify-center"
                    style={{
                      background: `${step.color}18`,
                      border: `2px solid ${step.color}45`,
                      boxShadow: `0 0 0 8px ${step.color}08`,
                    }}
                  >
                    <step.Icon className="w-9 h-9" style={{ color: step.color }} strokeWidth={1.8} />
                  </div>
                  {/* Step badge */}
                  <div
                    className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {parseInt(step.num)}
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-white mb-3">{step.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          className="text-center mt-14"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 bg-[#2563EB] text-white font-extrabold px-9 py-4 rounded-2xl hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-blue-600/30"
          >
            Start for Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-white/25 text-xs mt-3 font-medium">
            No subscription · First service check is on us
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Products + Professionals ─────────────────────────────────────────────────

type ProductCard = {
  id?: string;
  name: string;
  category: string;
  price: string;
  was: string;
  img: string;
  badge: string;
};

type ProCard = {
  id?: string;
  name: string;
  specialty: string;
  rating: number;
  jobs: number;
  city: string;
  img: string;
  badge: string;
  color: string;
};

const fallbackProducts: ProductCard[] = [
  {
    name: "Heavy-Duty Pipe Wrench 14\"",
    category: "Plumbing",
    price: "₹849",
    was: "₹1,200",
    img: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=300&fit=crop&auto=format",
    badge: "28% OFF",
  },
  {
    name: "Digital Non-Contact Tester",
    category: "Electrical",
    price: "₹1,299",
    was: "₹1,800",
    img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop&auto=format",
    badge: "Best Seller",
  },
  {
    name: "Premium Paint Roller Kit",
    category: "Paint",
    price: "₹599",
    was: "₹799",
    img: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=300&fit=crop&auto=format",
    badge: "",
  },
];

const fallbackPros: ProCard[] = [
  {
    name: "Rajesh Kumar",
    specialty: "Senior Electrician · 8 yrs exp",
    rating: 4.9,
    jobs: 1240,
    city: "Mumbai",
    img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop&auto=format",
    badge: "Top Pro",
    color: "#F59E0B",
  },
  {
    name: "Suresh Patel",
    specialty: "Expert Plumber · 6 yrs exp",
    rating: 4.8,
    jobs: 980,
    city: "Delhi",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop&auto=format",
    badge: "Verified",
    color: "#16A34A",
  },
];

const toProductCard = (product: any): ProductCard => ({
  id: product.id,
  name: product.name || "Hardware product",
  category: product.category?.name || product.category || "Hardware",
  price: formatINR(product.price),
  was: "",
  img: product.image_url || "",
  badge: "",
});

const toProCard = (pro: any): ProCard => ({
  id: pro.id,
  name: pro.profile?.full_name || pro.full_name || "FixKart Professional",
  specialty: (pro.bio || "Verified home service professional").slice(0, 40),
  rating: Number(pro.rating || 0),
  jobs: 0,
  city: "",
  img: pro.profile?.avatar_url || "",
  badge: "Verified",
  color: "#16A34A",
});

function ProductsAndProfessionalsSection() {
  const [products, setProducts] = useState<ProductCard[]>(fallbackProducts);
  const [pros, setPros] = useState<ProCard[]>(fallbackPros);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Pull real featured products and professionals from the backend when they
  // exist; keep the design cards as fallback so the section is never empty.
  useEffect(() => {
    let cancelled = false;

    apiGet<{ products: any[] }>("/products?limit=3")
      .then((data) => {
        const rows = (data.products || []).filter(Boolean);
        if (!cancelled && rows.length) {
          setProducts(rows.map(toProductCard));
        }
      })
      .catch(() => {
        // Fallback stays.
      });

    apiGet<{ professionals: any[] }>("/professionals?limit=2")
      .then((data) => {
        const rows = (data.professionals || []).filter(Boolean);
        if (!cancelled && rows.length) {
          setPros(rows.map(toProCard));
        }
      })
      .catch(() => {
        // Fallback stays.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-[3.25rem] font-extrabold text-[#0F172A] leading-tight mb-4">
            Products & Pros
          </h2>
          <p className="text-[#64748B] text-lg max-w-xl mx-auto leading-relaxed">
            Top-selling hardware and our highest-rated professionals — all in one platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Products */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Package className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-base font-extrabold text-[#0F172A]">Trending Products</h3>
            </div>
            <div className="space-y-4">
              {products.map((p, i) => (
                <motion.div
                  key={i}
                  
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="w-[76px] h-[76px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] text-[#2563EB] font-extrabold uppercase tracking-wide">
                        {p.category}
                      </span>
                      {p.badge && (
                        <span className="text-[9px] bg-[#F0FDF4] text-[#16A34A] font-extrabold uppercase px-1.5 py-0.5 rounded-full">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-[#0F172A] text-sm truncate">{p.name}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-extrabold text-[#0F172A]">{p.price}</span>
                      <span className="text-xs text-[#64748B] line-through">{p.was}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (p.id) {
                        addToCart({
                          id: p.id,
                          name: p.name,
                          price: Number(String(p.price).replace(/[^0-9.]/g, "")),
                          image_url: p.img,
                        });
                      } else {
                        navigate("/products");
                      }
                    }}
                    className="flex-shrink-0 bg-[#0F172A] text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-[#1E293B] active:scale-95 transition-all"
                  >
                    Add
                  </button>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              <Link
                to="/products"
                className="block w-full border-2 border-dashed border-gray-200 text-[#64748B] text-sm font-semibold py-3.5 rounded-2xl hover:border-[#2563EB] hover:text-[#2563EB] transition-colors text-center"
              >
                Browse All Products →
              </Link>
            </motion.div>
          </div>

          {/* Professionals */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Hammer className="w-5 h-5 text-[#F59E0B]" strokeWidth={2} />
              <h3 className="text-base font-extrabold text-[#0F172A]">Featured Professionals</h3>
            </div>
            <div className="space-y-4">
              {pros.map((pro, i) => (
                <motion.div
                  key={i}
                  
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.12 }}
                  className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={pro.img}
                          alt={pro.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#16A34A] rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-extrabold text-[#0F172A] text-sm">{pro.name}</h4>
                        <span
                          className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: `${pro.color}18`, color: pro.color }}
                        >
                          {pro.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] font-medium mb-2.5">{pro.specialty}</p>
                      <div className="flex items-center gap-4 text-xs text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                          <strong className="text-[#111827]">{pro.rating}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-[#16A34A]" />
                          {pro.jobs.toLocaleString()} jobs
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {pro.city}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2.5">
                    <Link
                      to={pro.id ? `/booking?professional_id=${pro.id}` : "/services"}
                      className="flex-1 bg-[#2563EB] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-500 active:scale-95 transition-all text-center"
                    >
                      Book Now
                    </Link>
                    <Link
                      to={pro.id ? `/professional/${pro.id}` : "/professionals"}
                      className="px-4 border border-gray-200 text-[#64748B] text-sm font-semibold py-2.5 rounded-xl hover:border-gray-300 hover:text-[#0F172A] transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              <Link
                to="/professionals"
                className="block w-full border-2 border-dashed border-gray-200 text-[#64748B] text-sm font-semibold py-3.5 rounded-2xl hover:border-[#F59E0B] hover:text-[#D97706] transition-colors text-center"
              >
                Find More Professionals →
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trust & Safety ───────────────────────────────────────────────────────────

const trustItems = [
  {
    Icon: BadgeCheck,
    title: "Verified Professionals",
    desc: "Background-checked with verified IDs, certifications, and training records.",
    color: "#16A34A",
    bg: "#F0FDF4",
  },
  {
    Icon: Lock,
    title: "Secure Payments",
    desc: "100% safe transactions with encryption, escrow, and full buyer protection.",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    Icon: Activity,
    title: "Real-Time Tracking",
    desc: "Track your order or service booking live — know exactly when to expect us.",
    color: "#D97706",
    bg: "#FFFBEB",
  },
  {
    Icon: Star,
    title: "Ratings & Reviews",
    desc: "Honest, verified reviews from real customers help you choose with confidence.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    Icon: Headphones,
    title: "24/7 Support",
    desc: "Our dedicated team is available round-the-clock for any help you need.",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    Icon: Truck,
    title: "Fast Delivery",
    desc: "Same-day and next-day delivery on hardware products across 50+ cities.",
    color: "#0F172A",
    bg: "#F1F5F9",
  },
];

function TrustSection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <span className="inline-block bg-[#F0FDF4] text-[#16A34A] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Why FixKart
          </span>
          <h2 className="text-3xl lg:text-[3.25rem] font-extrabold text-[#0F172A] leading-tight mb-4">
            Built on Trust & Safety
          </h2>
          <p className="text-[#64748B] text-lg max-w-xl mx-auto leading-relaxed">
            Quality, security, and peace of mind — baked into every order and every booking.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trustItems.map((item, i) => (
            <motion.div
              key={i}
            
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.09 }}
              className="group p-6 lg:p-7 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 bg-white cursor-default"
            >
              <motion.div
                whileHover={{ scale: 1.12, rotate: 6 }}
                transition={{ type: "spring", stiffness: 380, damping: 16 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: item.bg }}
              >
                <item.Icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={1.8} />
              </motion.div>
              <h3 className="text-base font-extrabold text-[#0F172A] mb-2">{item.title}</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.55 }}
          className="mt-14 bg-[#F8FAFC] rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-extrabold text-[#0F172A] mb-1">
              Join 200,000+ Happy Customers
            </h3>
            <p className="text-[#64748B] text-sm font-medium">
              Rated 4.8★ on App Store & Google Play
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center gap-3 bg-[#0F172A] text-white px-6 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors">
              <div className="text-2xl leading-none">📱</div>
              <div className="text-left">
                <p className="text-[10px] text-white/50 font-medium">Download on the</p>
                <p className="text-sm font-bold">App Store</p>
              </div>
            </button>
            <button className="flex items-center gap-3 bg-[#0F172A] text-white px-6 py-3.5 rounded-2xl hover:bg-[#1E293B] transition-colors">
              <div className="text-2xl leading-none">🤖</div>
              <div className="text-left">
                <p className="text-[10px] text-white/50 font-medium">Get it on</p>
                <p className="text-sm font-bold">Google Play</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section className="py-24 lg:py-36 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] bg-[#2563EB]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[25%] w-[400px] h-[400px] bg-[#F59E0B]/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-block bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-7">
            Get Started Today
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Your Fix Is Just a{" "}
            <span className="text-[#F59E0B]">Click Away.</span>
          </h2>
          <p className="text-white/45 text-lg mb-11 max-w-2xl mx-auto leading-relaxed">
            Join 200,000+ satisfied customers who trust FixKart for hardware needs and on-demand home services. Start your first order now — no subscription required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/register"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-3 bg-[#F59E0B] text-[#0F172A] font-extrabold text-lg px-10 py-4.5 rounded-2xl hover:bg-amber-400 transition-colors shadow-2xl shadow-amber-500/25"
              style={{ paddingTop: "1.125rem", paddingBottom: "1.125rem" }}
            >
              <Home className="w-5 h-5" />
              Get Started Free
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-3 border-2 border-white/20 text-white font-extrabold text-lg px-10 rounded-2xl hover:border-white/40 hover:bg-white/5 transition-all"
              style={{ paddingTop: "1.125rem", paddingBottom: "1.125rem" }}
            >
              <Phone className="w-5 h-5" />
              Call Us: 1800-FIX-KART
            </motion.button>
          </div>

          <p className="mt-8 text-white/25 text-sm font-medium">
            No credit card required · Cancel anytime · First service inspection free
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <HeroSection />
      <HeroStatsStrip />
      <MarqueeSection />
      <PersonalizedSection />
      <CategoriesSection />
      <FeaturedAndDealsSection />
      <ServicesSection />
      <HowItWorksSection />
      <ProductsAndProfessionalsSection />
      <TopProfessionalsSection />
      <TrustSection />
      <FinalCTASection />
    </div>
  );
}
