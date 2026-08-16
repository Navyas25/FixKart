# FixKart — preview run doc

## Reproduce the uncommitted artifacts
The workspace **is** the main checkout (`C:\Users\Navya Bhushan\Downloads\FixKart\FixKart`),
so there are no env files to copy. Steps a fresh checkout needs:

1. Backend (API the frontend proxies to):
   - `cp backend/.env.example backend/.env` and fill in `SUPABASE_URL` /
     `SUPABASE_ANON_KEY` (the checked-in `.env.example` already contains the
     project values).
   - `cd backend && npm install`
2. Frontend:
   - `cd modern-frontend && npm install`
   - Optional: `cp .env.example .env` and set `VITE_GOOGLE_MAPS_API_KEY`
     (Places/Geocoding). Not required for the site to run.

## Run the server
- Backend: `cd backend && npm run dev` → http://localhost:5000/api (health: `/api/health`)
- Frontend (the preview): `cd modern-frontend && npm run dev` →
  http://127.0.0.1:5173 (Vite dev server, `strictPort: true`; proxies `/api`
  to `localhost:5000`)

Both must be up for the storefront to load real data; without the backend the
catalog pages show the demo-data fallbacks. The seed (see README "Seeding
sample data") populates products/services/professionals.
