import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";
import {
  Wrench,
  ShoppingCart,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Search,
  Calendar,
  Settings,
  Heart,
  ArrowRight,
} from "lucide-react";

import { ThemeProvider, useTheme } from "../lib/theme";
import { CartProvider, useCart } from "../lib/cart";
import { WishlistProvider, useWishlist } from "../lib/wishlist";
import { AuthProvider, useAuth } from "../lib/auth";
import { SmoothScroll, scrollToTop } from "../lib/smoothScroll";
import LoadingScreen from "./components/LoadingScreen";

import HomePage from "./pages/HomePage";
import NormalHomePage from "./pages/NormalHomePage";
import ProductsPage from "./pages/ProductsPage";
import ServicesPage from "./pages/ServicesPage";
import ProfessionalsPage from "./pages/ProfessionalsPage";
import SearchPage from "./pages/SearchPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ProfessionalProfilePage from "./pages/ProfessionalProfilePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrdersPage from "./pages/OrdersPage";
import BookingsPage from "./pages/BookingsPage";
import BookingPage from "./pages/BookingPage";
import NormalBookingPage from "./pages/NormalBookingPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import WishlistPage from "./pages/WishlistPage";
import ProfessionalLandingPage from "./pages/ProfessionalLandingPage";
import ProfessionalRegisterPage from "./pages/ProfessionalRegisterPage";
import ProfessionalDashboardPage from "./pages/ProfessionalDashboardPage";
import VendorRegisterPage from "./pages/VendorRegisterPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import AdminProfessionalsPage from "./pages/AdminProfessionalsPage";
import AdminVendorsPage from "./pages/AdminVendorsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CustomerSupportPage from "./pages/CustomerSupportPage";
import ChatBot from "./components/ChatBot";
import { PageHeader } from "./components/PageHeader";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./pages/AuthPages";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CookiePolicyPage from "./pages/CookiePolicyPage";

/* ─── Navbar ───────────────────────────────────────────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isLoggedIn, user, isAdmin, isVendor, isPremium } = useAuth();
  const isProfessional = user?.user_metadata?.role === "professional";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Always show the solid bar on sub-pages so it's readable over light content.
  const solid = scrolled || location.pathname !== "/";
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className="text-white/70 hover:text-white text-sm font-semibold transition-colors"
    >
      {label}
    </Link>
  );

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? "bg-[#0F172A] shadow-xl shadow-black/20" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          {isAdmin ? (
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-[#F59E0B] rounded-xl flex items-center justify-center shadow-md shadow-amber-500/30">
                <Wrench className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">
                Fix<span className="text-[#F59E0B]">Kart</span>
              </span>
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-[#F59E0B] rounded-xl flex items-center justify-center shadow-md shadow-amber-500/30">
                <Wrench className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">
                Fix<span className="text-[#F59E0B]">Kart</span>
              </span>
            </Link>
          )}

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 xl:gap-7">
            {isAdmin ? (
              <>
                {navLink("/admin/dashboard", "Dashboard")}
                {navLink("/admin/support", "Support")}
              </>
            ) : (
              <>
                {navLink("/products", "Shop")}
                {navLink("/services", "Services")}
                {isPremium && navLink("/professionals", "Professionals")}
                {navLink("/bookings", "My Bookings")}
                {isVendor && navLink("/vendor/dashboard", "Vendor")}
              </>
            )}
          </div>

          {/* Desktop search */}
          {!isAdmin && (
            <form
              onSubmit={submitSearch}
              className="hidden lg:flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 w-56 xl:w-64 focus-within:border-[#F59E0B]/60 transition-colors"
            >
              <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products & services…"
                className="bg-transparent outline-none text-sm text-white w-full placeholder-white/35"
              />
            </form>
          )}

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 text-white/60 hover:text-white transition-colors"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {!isAdmin && (
              <Link
                to={isLoggedIn ? (isProfessional ? "/professional/dashboard" : "/profile") : "/login"}
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label="My account"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
            {isLoggedIn && !isAdmin && (
              <Link
                to="/settings"
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
            {!isAdmin && (
              <>
                <Link
                  to="/wishlist"
                  className="relative p-2 text-white/60 hover:text-white transition-colors"
                  aria-label="Wishlist"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#DC2626] text-white rounded-full text-[10px] font-extrabold flex items-center justify-center ring-2 ring-[#0F172A]">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="relative p-2 text-white/60 hover:text-white transition-colors"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#F59E0B] text-[#0F172A] rounded-full text-[10px] font-extrabold flex items-center justify-center ring-2 ring-[#0F172A]">
                  {count}
                </span>
              )}
            </Link>
              </>
            )}
            {!isAdmin && (
              <>
                <Link
                  to="/professional"
                  className="ml-1 bg-[#F59E0B] text-[#0F172A] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/30"
                >
                  Become a Pro
                </Link>
                <Link
                  to="/services"
                  className="ml-1 bg-[#2563EB] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/30"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden bg-[#0F172A] border-t border-white/10 overflow-hidden transition-all duration-300 ${
          open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-1">
          {!isAdmin && (
            <form onSubmit={submitSearch} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 mb-2">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products & services…"
                className="bg-transparent outline-none text-sm text-white w-full placeholder-white/35"
              />
            </form>
          )}
          {isAdmin ? (
            <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="block py-3 text-white/70 text-sm font-semibold border-b border-white/5">
              Admin Dashboard
            </Link>
          ) : (
            [
              { to: "/products", label: "Shop" },
              { to: "/services", label: "Services" },
              ...(isPremium ? [{ to: "/professionals", label: "Professionals" }] : []),
              { to: "/bookings", label: "My Bookings" },
              { to: isLoggedIn ? (isProfessional ? "/professional/dashboard" : "/profile") : "/login", label: isLoggedIn ? "My Account" : "Sign In" },
              ...(isLoggedIn ? [{ to: "/settings", label: "Settings" }] : []),
              ...(isVendor ? [{ to: "/vendor/dashboard", label: "Vendor Dashboard" }] : []),
              { to: "/professional", label: "Become a Pro" },
              { to: "/cart", label: `Cart${count ? ` (${count})` : ""}` },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block py-3 text-white/70 text-sm font-semibold border-b border-white/5"
              >
                {item.label}
              </Link>
            ))
          )}
          <div className="flex gap-3 pt-3">
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="flex-1 border border-white/20 text-white text-sm font-semibold py-2.5 rounded-xl hover:border-white/40 transition-colors"
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─── Footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  const footerLinks: Record<string, string[]> = {
    Company: ["Careers", "Blog", "Press Kit"],
    Services: ["Plumbing", "Electrical", "Carpentry", "AC Repair", "Painting"],
    Hardware: ["Tools", "Plumbing", "Electrical", "Safety", "Automotive"],
    Support: ["Track Order", "Return Policy"],
  };

  const hrefFor = (link: string): string => {
    switch (link) {
      case "Plumbing":
      case "Electrical":
      case "Carpentry":
      case "AC Repair":
      case "Painting":
        return `/services?category=${link.toLowerCase().replace(" ", "-")}`;
      case "Tools":
        return "/products?category=tools";
      case "Safety":
        return "/products";
      case "Automotive":
        return "/products?category=automotive";
      case "Track Order":
        return "/orders";
      case "Return Policy":
        return "/terms-of-service#cancellations";
      default:
        return "#";
    }
  };

  return (
    <footer className="bg-[#060E1C] border-t border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#F59E0B] rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">
                Fix<span className="text-[#F59E0B]">Kart</span>
              </span>
            </div>
            <p className="text-white/35 text-sm leading-relaxed mb-6 max-w-xs">
              Quick-commerce for hardware products + on-demand home services. Fixed fast, every time, everywhere.
            </p>

          </div>

          {/* Link cols */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-white font-bold text-sm mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      to={hrefFor(link)}
                      className="text-white/35 text-sm font-medium hover:text-white/65 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs font-medium">
            © 2026 FixKart Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-5">
            {[
                { label: "Privacy Policy", to: "/privacy-policy" },
                { label: "Terms of Service", to: "/terms-of-service" },
                { label: "Return Policy", to: "/terms-of-service#cancellations" },
                { label: "Cookie Policy", to: "/cookie-policy" },
              ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-white/25 text-xs font-medium hover:text-white/50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Plan-Aware Home ──────────────────────────────────────────────────────── */

function PlanAwareHomePage() {
  const { isPremium } = useAuth();
  return isPremium ? <HomePage /> : <NormalHomePage />;
}

function PlanAwareBookingPage() {
  const { isPremium } = useAuth();
  return isPremium ? <BookingPage /> : <NormalBookingPage />;
}

function PlanAwareProfessionalsPage() {
  const { isPremium } = useAuth();
  if (!isPremium) {
    return (
      <>
        <PageHeader eyebrow="Premium Feature" title="Choose Your Professional" subtitle="Upgrade to FixKart Premium to browse and choose any professional." />
        <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1220] min-h-[40vh]">
          <div className="max-w-md mx-auto px-4 text-center bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 py-12">
            <div className="w-16 h-16 mx-auto bg-[#F59E0B]/10 rounded-full flex items-center justify-center mb-5">
              <Wrench className="w-8 h-8 text-[#F59E0B]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-white mb-2">Premium Feature</h2>
            <p className="text-[#64748B] dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              With your current plan, professionals are auto-assigned based on your location. Upgrade to Premium to browse and choose any professional.
            </p>
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-bold text-sm px-7 py-3.5 rounded-2xl hover:bg-blue-500 transition-colors"
            >
              Book with Auto-Assign <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </>
    );
  }
  return <ProfessionalsPage />;
}

/* ─── Layout ───────────────────────────────────────────────────────────────── */

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    scrollToTop();
  }, [pathname]);
  return null;
}

function Layout() {
  const { isAdmin, isVendor, isPremium, user } = useAuth();
  const isProfessional = user?.user_metadata?.role === "professional";
  const isDashboard = isAdmin || isProfessional || isVendor;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isAdmin && !pathname.startsWith("/admin")) {
      navigate("/admin/dashboard", { replace: true });
    } else if (isProfessional && !pathname.startsWith("/professional")) {
      navigate("/professional/dashboard", { replace: true });
    } else if (isVendor && !pathname.startsWith("/vendor")) {
      navigate("/vendor/dashboard", { replace: true });
    }
  }, [isAdmin, isProfessional, isVendor, pathname, navigate]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#F8FAFC]">
      {!isDashboard && <Navbar />}
      <main>
        <Outlet />
      </main>
      {!isDashboard && <Footer />}
      {!isDashboard && <ChatBot />}
    </div>
  );
}

/* ─── App ──────────────────────────────────────────────────────────────────── */

export default function App() {
  // Brief branded boot loader (tools + "Fixing Things…" bar).
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      {booting && <LoadingScreen />}
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <SmoothScroll>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<PlanAwareHomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/professionals" element={<PlanAwareProfessionalsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/service/:id" element={<ServiceDetailPage />} />
                <Route path="/professional/:id" element={<ProfessionalProfilePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/booking" element={<PlanAwareBookingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/professional" element={<ProfessionalLandingPage />} />
                <Route path="/professional/dashboard" element={<ProfessionalDashboardPage />} />
                <Route path="/register/professional" element={<ProfessionalRegisterPage />} />
                <Route path="/register/vendor" element={<VendorRegisterPage />} />
                <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/professionals" element={<AdminProfessionalsPage />} />
                <Route path="/admin/vendors" element={<AdminVendorsPage />} />
                <Route path="/admin/support" element={<CustomerSupportPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </SmoothScroll>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
