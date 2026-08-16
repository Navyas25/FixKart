# FixKart

FixKart is a platform combining:
1. A hardware marketplace (tools, plumbing, electrical, automotive supplies, etc.)
2. An on-demand services platform (plumbers, electricians, carpenters, mechanics, painters, AC technicians, etc.)

## Architecture

```
Frontend (React app in modern-frontend/)
    │  fetch() → /api (proxied to http://localhost:5000)
    ▼
Backend (Express + Supabase in backend/)
    │  supabase-js
    ▼
Supabase (Postgres + Auth + RLS)
```

- **Frontend (`modern-frontend/`)** — React + Vite + Tailwind v4. The one and
  only site: home, search (products + services + professionals), product /
  service / professional pages, cart, checkout, orders, bookings, booking form,
  profile with saved addresses, and login/register. It has a dark-mode toggle,
  Google-Maps location detection (optional key), a localStorage cart, and real
  search backed by the API. The Vite dev server proxies `/api` to the backend.
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

2. **Frontend** (from `modern-frontend/`):

   ```bash
   npm install
   npm run dev            # http://127.0.0.1:5173
   ```

   The Vite dev server proxies `/api` to `http://localhost:5000`, so no CORS
   config is needed.

3. Browse the flows:

   - **Marketplace:** Home → Products → Product Details → Cart → Checkout →
     Order Confirmation → Orders
   - **Services:** Home → Services → Service Details → Professionals →
     Professional Profile → Booking → My Bookings
   - **Account:** Register → Login → Profile (saved addresses) → Orders →
     Bookings

## Running with Docker (one stack)

A `docker-compose.yml` at the repo root runs the whole stack:

| Service  | Image built from        | URL                          |
| -------- | ----------------------- | ---------------------------- |
| `backend`| `backend/Dockerfile`    | http://localhost:5000/api    |
| `modern` | `docker/modern.Dockerfile`  | http://localhost:5173     |

```bash
cp docker/.env.example .env   # fill in SUPABASE_URL / SUPABASE_ANON_KEY
# or export SUPABASE_URL and SUPABASE_ANON_KEY in your shell
docker compose up --build
```

- **`modern`** serves the compiled React app behind nginx and proxies `/api` to
  the `backend` container, so no CORS setup is needed.
- The backend healthcheck (`GET /api/health`) gates the frontend via
  `depends_on: condition: service_healthy`.
- Stop everything with `docker compose down`. `docker compose config` checks
  the file without starting anything.

## Seeding sample data

The storefront lists read from Supabase, and RLS blocks the app's keys from
writing, so the tables need seeding from a privileged context. Two equivalent
options (both idempotent - safe to re-run):

**Option A - Supabase SQL editor (no keys needed):** open your project's
Dashboard → **SQL Editor**, paste the contents of `backend/scripts/seed.sql`,
and run it. It seeds 8 categories, 14 products, 8 services and 6 professionals
(creating their auth users so bookings link to real accounts).

**Option B - seed script (service role key):**

```bash
# backend/.env - Supabase dashboard -> Project Settings -> API
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret

cd backend
npm run seed
```

After seeding, refresh the site. The seeded professional logins
(`pro.plumber@fixkart.dev`, …) use password `FixkartSeed123!` for local/dev
testing.

## Google Maps location detection

The React app detects the user's location. With no API key it falls back to
browser geolocation; with a key it gets Places autocomplete + reverse
geocoding:

- `VITE_GOOGLE_MAPS_API_KEY` in `modern-frontend/.env` (see
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
