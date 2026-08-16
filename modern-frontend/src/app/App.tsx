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
} from "lucide-react";

import { ThemeProvider, useTheme } from "../lib/theme";
import { CartProvider, useCart } from "../lib/cart";
import { AuthProvider, useAuth } from "../lib/auth";
import { legacy, LEGACY_URL } from "../lib/legacy";

import HomePage from "./pages/HomePage";
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
import ProfilePage from "./pages/ProfilePage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import NotFoundPage from "./pages/NotFoundPage";

/* ─── Navbar ───────────────────────────────────────────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { count } = useCart();
  const { isLoggedIn } = useAuth();

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
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-[#F59E0B] rounded-xl flex items-center justify-center shadow-md shadow-amber-500/30">
              <Wrench className="w-5 h-5 text-[#0F172A]" strokeWidth={2.5} />
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight">
              Fix<span className="text-[#F59E0B]">Kart</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 xl:gap-7">
            {navLink("/products", "Shop")}
            {navLink("/services", "Services")}
            {navLink("/professionals", "Professionals")}
            {navLink("/bookings", "My Bookings")}
            <a
              href={legacy.home}
              className="text-white/40 hover:text-white/70 text-sm font-semibold transition-colors"
            >
              Classic Site
            </a>
          </div>

          {/* Desktop search */}
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
            <Link
              to={isLoggedIn ? "/profile" : "/login"}
              className="p-2 text-white/60 hover:text-white transition-colors"
              aria-label="My account"
            >
              <User className="w-5 h-5" />
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
            <Link
              to="/services"
              className="ml-1 bg-[#2563EB] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/30"
            >
              Book Now
            </Link>
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
          {[
            { to: "/products", label: "Shop" },
            { to: "/services", label: "Services" },
            { to: "/professionals", label: "Professionals" },
            { to: "/bookings", label: "My Bookings" },
            { to: isLoggedIn ? "/profile" : "/login", label: isLoggedIn ? "My Account" : "Sign In" },
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
          ))}
          <div className="flex gap-3 pt-3">
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="flex-1 border border-white/20 text-white text-sm font-semibold py-2.5 rounded-xl hover:border-white/40 transition-colors"
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <a
              href={legacy.home}
              className="flex-1 border border-white/20 text-white/70 text-sm font-semibold py-2.5 rounded-xl hover:border-white/40 transition-colors text-center"
            >
              Classic Site
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─── Footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  const footerLinks: Record<string, string[]> = {
    Company: ["About Us", "Careers", "Blog", "Press Kit"],
    Services: ["Plumbing", "Electrical", "Carpentry", "AC Repair", "Painting"],
    Hardware: ["Tools", "Plumbing", "Electrical", "Safety", "Automotive"],
    Support: ["Help Center", "Contact Us", "Track Order", "Return Policy"],
  };

  const hrefFor = (link: string): string => {
    switch (link) {
      case "About Us":
        return legacy.about;
      case "Contact Us":
      case "Help Center":
        return legacy.contact;
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
            <div className="flex gap-2.5">
              {["📱 App Store", "🤖 Play Store"].map((btn) => (
                <button
                  key={btn}
                  className="text-[11px] text-white/50 border border-white/12 px-3 py-1.5 rounded-lg hover:border-white/25 hover:text-white/70 transition-colors"
                >
                  {btn}
                </button>
              ))}
            </div>
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
              { label: "Privacy Policy", href: `${LEGACY_URL}/pages/privacy.html` },
              { label: "Terms of Service", href: `${LEGACY_URL}/pages/terms.html` },
              { label: "Cookie Policy", href: legacy.home },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/25 text-xs font-medium hover:text-white/45 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Layout ───────────────────────────────────────────────────────────────── */

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout() {
  return (
    <div className="min-h-screen overflow-x-hidden scroll-smooth bg-[#F8FAFC]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/* ─── App ──────────────────────────────────────────────────────────────────── */

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/professionals" element={<ProfessionalsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/service/:id" element={<ServiceDetailPage />} />
                <Route path="/professional/:id" element={<ProfessionalProfilePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
