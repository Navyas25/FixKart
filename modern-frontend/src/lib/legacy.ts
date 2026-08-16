// The classic (static HTML) FixKart site is kept alongside this React app and
// still hosts the admin + professional portals and a few informational pages.
// These helpers build links across to it; point VITE_LEGACY_URL at your
// static-server origin when it differs from the dev default.
export const LEGACY_URL = import.meta.env.VITE_LEGACY_URL || "http://127.0.0.1:5500";

export const legacy = {
  home: `${LEGACY_URL}/index.html`,
  products: `${LEGACY_URL}/pages/products.html`,
  services: `${LEGACY_URL}/pages/services.html`,
  professionals: `${LEGACY_URL}/pages/professionals.html`,
  product: (id: string) => `${LEGACY_URL}/pages/product-details.html?id=${encodeURIComponent(id)}`,
  service: (id: string) => `${LEGACY_URL}/pages/service-details.html?id=${encodeURIComponent(id)}`,
  professional: (id: string) =>
    `${LEGACY_URL}/pages/professional-profile.html?id=${encodeURIComponent(id)}`,
  booking: (id: string) => `${LEGACY_URL}/pages/booking.html?professional_id=${encodeURIComponent(id)}`,
  cart: `${LEGACY_URL}/pages/cart.html`,
  register: `${LEGACY_URL}/pages/register.html`,
  login: `${LEGACY_URL}/pages/login.html`,
  orders: `${LEGACY_URL}/pages/orders.html`,
  about: `${LEGACY_URL}/pages/about.html`,
  contact: `${LEGACY_URL}/pages/contact.html`,
};
