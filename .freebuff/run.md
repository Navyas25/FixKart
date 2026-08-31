# Run Doc — FixKart Modern Frontend

## Reproduce uncommitted artifacts
No special env files to copy — the frontend `.env` already exists in the checkout.

Dependencies are already installed (`node_modules` present). If starting fresh:
```bash
cd modern-frontend
npm install
```

## Run the dev server
```bash
cd modern-frontend
npm run dev
```

This starts Vite on `http://127.0.0.1:5173` (hardcoded in `vite.config.ts` with `strictPort: true`).

The dev server proxies `/api` calls to `http://localhost:5000` (the Express backend).
