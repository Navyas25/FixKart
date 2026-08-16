# FixKart — Modern React Frontend

React + Vite + Tailwind v4 frontend (originally exported from the
[Modern Responsive Website Design](https://www.figma.com/design/4Dlxw6mUr8Je9RvQ3mDxS5/Modern-Responsive-Website-Design)
Figma file), integrated into the FixKart monorepo as the **main site**.

## Running the code

```bash
npm install
npm run dev    # http://127.0.0.1:5173
npm run build  # production build → dist/
```

## What's here

The React app is a full storefront, not just a landing page:

- **Home** — the original landing sections, wired to live data: services,
  trending products and featured professionals fetch real rows from the backend
  and fall back to the design cards when the tables are empty or the API is
  down.
- **Search** (`/search?q=…`) — one query across products, services and
  professionals (navbar + hero search both route here).
- **Catalog** — `/products` (category/price/sort filters + pagination),
  `/services`, `/professionals`, and detail pages for each.
- **Cart → Checkout → Orders** — localStorage cart (shared with the classic
  site via the `fixkart_cart` key), address capture, order creation, and an
  order confirmation + order history.
- **Bookings** — a booking form (professional, optional service, slot, address,
  notes) plus a bookings history page.
- **Account** — register, login, profile with saved addresses (add / set
  default / delete), logout.

## How it's integrated

- **Backend:** the Vite dev server proxies `/api` to the FixKart Express
  backend on `http://localhost:5000` (see `vite.config.ts`), so `src/lib/api.ts`
  uses relative URLs with no CORS setup.
- **Auth:** sessions are stored under `fixkart_session` in localStorage — the
  same key the classic site uses — so logging in on either site carries over.
- **Dark mode:** a Sun/Moon toggle in the navbar; persisted as `fixkart_theme`.
  The `.dark` class on `<html>` remaps the hardcoded light colors via
  `src/styles/dark.css`.
- **Location:** `src/lib/location.ts` provides Google Places autocomplete +
  geolocation; enable with `VITE_GOOGLE_MAPS_API_KEY` (see `.env.example`).
- **Classic site:** the older static HTML frontend stays at the repository root
  (served from `http://127.0.0.1:5500`) for the admin portal, professional
  portal and informational pages. The navbar links to it ("Classic Site");
  override the target with `VITE_LEGACY_URL`.

## Attribution

Includes components from [shadcn/ui](https://ui.shadcn.com/) (MIT) and photos
from [Unsplash](https://unsplash.com/license) — see `ATTRIBUTIONS.md`.
