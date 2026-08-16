# FixKart

FixKart is a platform combining:
1. A hardware marketplace (tools, plumbing, electrical, automotive supplies, etc.)
2. An on-demand services platform (plumbers, electricians, carpenters, mechanics, painters, AC technicians, etc.)

## Architecture

```
Frontend (React app in modern-frontend/ + classic static site in pages/ + js/)
    │  fetch() → /api (proxied to http://localhost:5000)
    ▼
Backend (Express + Supabase in backend/)
    │  supabase-js
    ▼
Supabase (Postgres + Auth + RLS)
```

- **Modern frontend (`modern-frontend/`)** — React + Vite + Tailwind v4. This is
  the main site: home, search (products + services + professionals), product /
  service / professional pages, cart, checkout, orders, bookings, booking form,
  profile with saved addresses, and login/register. It has a dark-mode toggle,
  Google-Maps location detection (optional key), a working cart shared with the
  classic site via `localStorage`, and real search backed by the API. The Vite
  dev server proxies `/api` to the backend.
- **Classic frontend (root `pages/` + `js/`)** — the original static HTML/JS
  site, kept for the older components: the admin portal (`admin/index.html`),
  the professional portal (`professional/index.html`), and informational pages.
  The React navbar has a "Classic Site" link across to it. It shares the same
  cart (`fixkart_cart`) and session (`fixkart_session`) storage keys, so a login
  or cart on one site carries over to the other.
- **Backend:** Express server in `backend/` exposes `/api/*` routes. Public
  endpoints (products, services, professionals) are read-only; user data
  (profile, addresses, orders, bookings) is scoped to the signed-in user's JWT
  and protected by Supabase Row Level Security.

## Running Locally

1. **Backend** (from `backend/`):

   ```bash
   cp .env.example .env   # fill in SUPABASE_URL / SUPABASE_ANON_KEY
   npm install
   npm run dev            # http://localhost:5000/api
   ```

2. **Modern frontend** (main site):

   ```bash
   cd modern-frontend
   npm install
   npm run dev            # http://127.0.0.1:5173
   ```

   The Vite dev server proxies `/api` to `http://localhost:5000`, so no CORS
   config is needed. Point `VITE_LEGACY_URL` at your classic static-server
   origin if it differs from `http://127.0.0.1:5500`.

3. **Classic frontend** (admin/professional portals + legacy pages) — serve the
   project root with any static server:

   ```bash
   python3 -m http.server 5500 --bind 127.0.0.1
   # open http://127.0.0.1:5500
   ```

   > Note: pages use ES modules, so the frontend must be served over HTTP
   > (opening `index.html` directly from the file system will not work).

4. Browse the flows (all in the React app unless noted):

   - **Marketplace:** Home → Products → Product Details → Cart → Checkout →
     Order Confirmation → Orders
   - **Services:** Home → Services → Service Details → Professionals →
     Professional Profile → Booking → My Bookings
   - **Account:** Register → Login → Profile (saved addresses) → Orders →
     Bookings

## Google Maps location detection

Both frontends detect the user's location. With no API key they fall back to
browser geolocation; with a key they get Places autocomplete + reverse
geocoding:

- Classic site: `GOOGLE_MAPS_API_KEY` in `js/config.js`
- React app: `VITE_GOOGLE_MAPS_API_KEY` in `modern-frontend/.env` (see
  `modern-frontend/.env.example`)

Enable the **Places API** and **Geocoding API** on the Google Cloud key, then
restart the React dev server.

## Database

Tables live in Supabase: `products`, `categories`, `services`, `professionals`,
`orders`, `order_items`, `bookings`, `addresses`, `profiles`. Seed them from the
Supabase dashboard (anonymous writes are blocked by RLS by design). The list
pages show an empty state until rows exist — products/services/professionals
must be seeded before orders and bookings can be created, since the backend
validates ids and pricing server-side.
