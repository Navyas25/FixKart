<div align="center">

# 🔧 FixKart

### Quick-commerce for hardware + on-demand home services

**Fixed fast, every time, everywhere.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18.3-61DAFB.svg)](https://react.dev)
[![Supabase](https://img.shields.io/badge/supabase-green.svg)](https://supabase.com)

[Live Demo](#deployment) · [Report Bug](https://github.com/Navyas25/FixKart/issues) · [Request Feature](https://github.com/Navyas25/FixKart/issues)

</div>

---

## 📖 Table of Contents

- [What is FixKart?](#what-is-fixkart)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [Docker Setup](#docker-setup)
- [Deployment](#deployment)
- [Seeding Sample Data](#seeding-sample-data)
- [User Roles & Access](#user-roles--access)
- [Design System](#design-system)
- [Security](#security)
- [Contributing](#contributing)

---

## What is FixKart?

FixKart is a **d-sided marketplace platform** that combines:

1. **Hardware Marketplace** — Browse and purchase tools, plumbing supplies, electrical equipment, automotive parts, safety gear, paint, and more from verified vendors.
2. **On-Demand Services** — Book verified professionals (plumbers, electricians, carpenters, mechanics, painters, AC technicians) for home and business services.

The platform serves **four distinct user roles**, each with their own dedicated dashboard:

| Role | What they do |
|------|-------------|
| **Customer** | Browse products, book services, manage orders & bookings |
| **Professional** | Accept service requests, manage schedule, track earnings & FixCoins |
| **Vendor** | List products, manage inventory, fulfill orders, run offers |
| **Admin** | Oversee all operations, verify professionals/vendors, manage support |

---

## Key Features

### 🛒 Customer Experience
- **Normal & Premium Plans** — Two-tier system: normal users get auto-assigned nearest professionals; premium users browse and choose any professional
- **Product Catalog** — Browse hardware products with categories, filters, search, and wishlists
- **Service Booking** — Find and book verified professionals by service type, location, and rating
- **Auto-Assigned Professionals** — Normal users select a service, enter their address, and the nearest verified professional is automatically matched
- **Premium Professional Directory** — Premium users browse the full professional directory, view ratings, and choose their preferred pro
- **Shopping Cart & Checkout** — Full e-commerce flow with address management and order tracking
- **Booking Management** — Track service bookings through their lifecycle (Pending → In Progress → Completed)
- **AI Support Chatbot** — Instant answers for common questions, with escalation to live support
- **Professional Profiles** — View ratings, reviews, experience, and certifications before booking
- **Upgrade to Premium** — Free upgrade page with feature comparison and benefits

### 🔨 Professional Dashboard
- **Dashboard Overview** — Today's earnings, upcoming jobs, completed jobs, and rating at a glance
- **Job Requests** — Accept or decline incoming service requests with customer details and distance
- **Calendar** — Month/week/day views with booking visualization and availability management
- **Booking Lifecycle** — Full workflow: Accept → Start Travel → Start Job → Complete
- **Earnings & Payments** — Total earnings, available balance, pending payments, transaction history
- **FixCoins Rewards** — Loyalty points earned for completing jobs, getting 5-star ratings, milestones
- **My Services** — Manage services offered with pricing, duration, and availability
- **Reviews & Ratings** — View and respond to customer reviews
- **Profile & Verification** — Manage bio, skills, certifications, and ID verification status
- **Support Center** — Create and track support tickets with category and booking reference

### 🏪 Vendor Dashboard
- **Store Management** — Store profile with logo, banner, description, and business details
- **Product Management** — Add, edit, delete products with images, pricing, SKU, and inventory
- **Order Management** — View and fulfill orders, update shipping status
- **Offers & Discounts** — Create percentage discounts, coupon codes, Buy X Get Y promotions
- **Inventory Tracking** — Stock levels, low-stock alerts, out-of-stock management
- **Analytics** — Sales trends, revenue charts, order history, performance metrics
- **Reviews** — Monitor and respond to product reviews
- **Notifications** — Real-time alerts for orders, reviews, and system updates

### 👑 Admin Dashboard
- **System Overview** — Revenue, user counts, professionals, vendors, pending actions
- **User Management** — View, search, and manage all platform users with role-based filtering
- **Professional Management** — Review verification documents, approve/reject applications
- **Vendor Management** — Review vendor applications, verify business details
- **Product & Category Management** — Oversee the entire product catalog with category filters
- **Orders & Bookings** — Monitor all transactions and service bookings
- **Payments** — Revenue tracking, payouts, commission, refund management
- **Reviews & Reports** — Moderate reviews, handle disputes, investigate complaints
- **Verification Center** — Unified place to verify professionals, vendors, and documents
- **Analytics** — User growth, revenue trends, popular products/services, top performers
- **Support** — View and manage all customer support tickets and live chat sessions

### 🔐 Authentication & Security
- **JWT-based Authentication** — Secure login/register with Supabase Auth
- **Role-Based Access Control** — Professionals, vendors, and admins see only their dashboard
- **Row Level Security (RLS)** — Database-level isolation so users can only access their own data
- **Service-Role Backend** — Admin operations use privileged client, bypassing RLS
- **Rate Limiting** — API protection against abuse and brute force
- **Password Reset** — Email-based forgot/reset password flow

### 💬 Support System
- **AI Chatbot** — Predefined answers for common questions (order tracking, refunds, bookings)
- **Live Chat** — Direct connection to customer support with session management
- **Admin Chat Dashboard** — View and respond to all support conversations
- **FAQ System** — Searchable frequently asked questions
- **Ticket Escalation** — Route complex issues to human support

### 🎁 FixCoins Loyalty System
- **Points for Actions** — Earn coins for completing jobs, getting 5-star ratings, milestones
- **Professional Levels** — Bronze → Silver → Gold → Platinum tiers with increasing benefits
- **Rewards Catalog** — Redeem for tool discounts, fuel rewards, mobile recharge, profile boost
- **History & Tracking** — Full transaction log of points earned and redeemed

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│   React 18 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui  │
│                                                                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│   │ Customer │ │Professional│ │  Vendor  │ │     Admin        │  │
│   │ Pages    │ │Dashboard  │ │Dashboard │ │    Dashboard     │  │
│   └────┬─────┘ └────┬──────┘ └────┬─────┘ └───────┬──────────┘  │
│        │            │             │                │             │
│        └────────────┴──────┬──────┴────────────────┘             │
│                            │ fetch('/api/*')                     │
│                            ▼                                     │
│                   Vite Dev Proxy ──────► http://localhost:5000   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
│              Express 4 · Node.js 18+ · ESM                      │
│                                                                 │
│   ┌─────────┐  ┌────────────┐  ┌───────────┐  ┌──────────────┐ │
│   │  Auth   │  │   Routes   │  │Controller │  │   Middleware  │ │
│   │  (JWT)  │─▶│  (REST)    │─▶│ (Business)│─▶│(RLS, Verify) │ │
│   └─────────┘  └────────────┘  └─────┬─────┘  └──────────────┘ │
│                                       │                          │
│                                       ▼                          │
│                               ┌──────────────┐                   │
│                               │   Supabase   │                   │
│                               │   Client     │                   │
│                               └──────┬───────┘                   │
└──────────────────────────────────────┼───────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                 │
│     PostgreSQL · Auth · Row Level Security · Realtime           │
│                                                                 │
│   Tables: profiles, products, categories, services,             │
│           professionals, vendors, orders, order_items,          │
│           bookings, addresses, wallet, reviews,                 │
│           support_tickets, offers, notifications                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend (`modern-frontend/`)

| Category | Technology |
|----------|-----------|
| Framework | React 18.3 |
| Language | TypeScript |
| Build Tool | Vite 6.3 |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Routing | React Router v7 |
| State | React Context (auth, cart, wishlist, theme) |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Icons | Lucide React |
| Animation | Framer Motion (motion) |
| UI Components | Radix UI primitives |
| Toast | Sonner |
| Date | date-fns |

### Backend (`backend/`)

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Validation | Zod |
| Security | Helmet, CORS, Rate Limiting |
| Email | Nodemailer |
| Module System | ES Modules |

### Infrastructure

| Category | Technology |
|----------|-----------|
| Frontend Deploy | Vercel |
| Backend Deploy | Render |
| Database/Auth | Supabase Cloud |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
FixKart/
├── backend/
│   ├── config/
│   │   ├── env.js              # Environment loader + WebSocket polyfill
│   │   ├── supabase.js         # Supabase client instances (anon + admin)
│   │   ├── admin.js            # Service-role admin client
│   │   └── admins.js           # Admin email allowlist
│   ├── controllers/
│   │   ├── auth.controller.js       # Register, login, password reset
│   │   ├── admin.controller.js      # Admin dashboard, users, analytics
│   │   ├── professional.controller.js  # Professional CRUD, bookings, earnings
│   │   ├── vendors.controller.js    # Vendor products, orders, inventory
│   │   ├── vendor-admin.controller.js  # Admin vendor management
│   │   ├── products.controller.js   # Public product listing
│   │   ├── services.controller.js   # Public service listing
│   │   ├── bookings.controller.js   # Customer bookings
│   │   ├── orders.controller.js     # Customer orders
│   │   ├── reviews.controller.js    # Review CRUD
│   │   ├── offers.controller.js     # Vendor offers/coupons
│   │   ├── support.controller.js    # Chatbot + live chat
│   │   ├── users.controller.js      # User profile
│   │   ├── addresses.controller.js  # Saved addresses
│   │   └── wallet.controller.js     # Wallet/balance
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── role.middleware.js        # Role-based access (admin, professional, vendor)
│   │   ├── rateLimit.middleware.js   # API rate limiting
│   │   └── error.middleware.js       # Global error handler
│   ├── routes/                      # Express route definitions
│   ├── validators/                  # Zod request validation schemas
│   ├── utils/
│   │   ├── supabaseUser.js          # Per-user Supabase client (RLS-scoped)
│   │   ├── email.js                 # Email sender
│   │   ├── logger.js                # Structured logger
│   │   ├── response.js              # Standardized API responses
│   │   └── ids.js                   # ID generation
│   ├── scripts/
│   │   ├── seed.js                  # Full database seeder
│   │   ├── seed.sql                 # SQL-based seed data
│   │   └── migrations/              # Database migration SQL files
│   ├── server.js                    # Express app entry point
│   ├── Dockerfile
│   └── package.json
│
├── modern-frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx              # Root component, routing, layout
│   │   │   ├── pages/               # All page components (30+ pages)
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── ProductsPage.tsx
│   │   │   │   ├── ServicesPage.tsx
│   │   │   │   ├── ProfessionalsPage.tsx
│   │   │   │   ├── ProductDetailPage.tsx
│   │   │   │   ├── ServiceDetailPage.tsx
│   │   │   │   ├── ProfessionalProfilePage.tsx
│   │   │   │   ├── CartPage.tsx
│   │   │   │   ├── CheckoutPage.tsx
│   │   │   │   ├── OrdersPage.tsx
│   │   │   │   ├── BookingsPage.tsx
│   │   │   │   ├── ProfilePage.tsx
│   │   │   │   ├── SettingsPage.tsx
│   │   │   │   ├── WishlistPage.tsx
│   │   │   │   ├── ProfessionalDashboardPage.tsx
│   │   │   │   ├── VendorDashboardPage.tsx
│   │   │   │   ├── AdminDashboardPage.tsx
│   │   │   │   ├── AdminProfessionalsPage.tsx
│   │   │   │   ├── AdminVendorsPage.tsx
│   │   │   │   ├── CustomerSupportPage.tsx
│   │   │   │   ├── PrivacyPolicyPage.tsx
│   │   │   │   ├── TermsOfServicePage.tsx
│   │   │   │   ├── CookiePolicyPage.tsx
│   │   │   │   ├── AuthPages.tsx
│   │   │   │   └── NotFoundPage.tsx
│   │   │   ├── components/          # Reusable UI components
│   │   │   │   ├── ChatBot.tsx
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ReviewsSection.tsx
│   │   │   │   ├── WishlistHeart.tsx
│   │   │   │   └── ui/             # shadcn/ui components (40+)
│   │   │   └── ...
│   │   ├── lib/                     # Shared utilities
│   │   │   ├── api.ts              # API client with auth headers
│   │   │   ├── auth.tsx            # Auth context (login state, role detection)
│   │   │   ├── cart.tsx            # Shopping cart context
│   │   │   ├── wishlist.tsx        # Wishlist context
│   │   │   ├── theme.tsx           # Dark/light mode toggle
│   │   │   ├── format.ts           # Number/currency formatting
│   │   │   ├── location.ts         # Geolocation utilities
│   │   │   └── smoothScroll.tsx    # Smooth scroll behavior
│   │   └── assets/                 # Images, SVGs
│   ├── vite.config.ts              # Vite config with API proxy
│   ├── index.html
│   └── package.json
│
├── docker/
│   ├── modern.Dockerfile           # Frontend nginx container
│   └── .env.example                # Docker env template
│
├── docker-compose.yml              # Full stack orchestration
├── vercel.json                     # Vercel deployment config
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** (or yarn/pnpm)
- A **Supabase** project ([free tier works](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/Navyas25/FixKart.git
cd FixKart
```

### 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials:
#   SUPABASE_URL = your Supabase project URL
#   SUPABASE_ANON_KEY = your anon/public key
#   SUPABASE_SERVICE_ROLE_KEY = your service role key (server-side only)

# Install dependencies
npm install

# Start the development server
npm run dev
# → http://localhost:5000/api
```

### 3. Frontend Setup

Open a **second terminal**:

```bash
cd modern-frontend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
# → http://localhost:5173
```

> **Note:** The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no CORS configuration is needed during development.

### 4. Set Up the Database

Follow the [Database Setup](#database-setup) section below to create tables and seed sample data.

### 5. Open the App

Visit **http://localhost:5173** and explore:

| Flow | Path |
|------|------|
| Browse products | Home → Shop → Product Details → Cart → Checkout |
| Book a service | Home → Services → Service Details → Professionals → Book |
| Professional dashboard | Register as professional → Login → `/professional/dashboard` |
| Vendor dashboard | Register as vendor → Login → `/vendor/dashboard` |
| Admin dashboard | Login as admin → `/admin/dashboard` |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Supabase project URL (e.g., `https://xxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Service role key (server-side only, bypasses RLS). Required for professional/vendor registration and admin operations |
| `PORT` | ❌ | Server port (default: `5000`) |
| `NODE_ENV` | ❌ | `development` or `production` |
| `CLIENT_URL` | ❌ | Frontend origin for CORS (default: `http://127.0.0.1:5173`) |

### Frontend (`modern-frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_MAPS_API_KEY` | ❌ | Google Maps API key for Places autocomplete and reverse geocoding. Without it, location detection falls back to raw browser geolocation |
| `VITE_API_BASE_URL` | ❌ | API base URL (default: `/api`, proxied by Vite to `localhost:5000`) |

---

## Database Setup

### Create Tables

FixKart requires the following Supabase tables. Run the migration scripts in order via the **Supabase SQL Editor**:

```bash
# In Supabase Dashboard → SQL Editor → New Query, run each file:

# 1. Core tables (products, categories, services, professionals, etc.)
# These are created automatically by Supabase or via seed data

# 2. Professional verification fields
backend/scripts/migrations/001_professional_verification.sql

# 3. Engagement features (reviews, ratings)
backend/scripts/migrations/002_engagement.sql

# 4. Reviews system
backend/scripts/migrations/003_reviews.sql

# 5. Vendors table and policies
backend/scripts/migrations/004_vendors.sql

# 6. Any remaining missing tables
backend/scripts/migrations/004_missing_tables.sql
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with role (customer/professional/vendor/admin) |
| `products` | Hardware products with vendor ownership |
| `categories` | Product categories (Tools, Plumbing, Electrical, etc.) |
| `services` | Service listings (Plumbing, Electrical, etc.) |
| `professionals` | Professional profiles, verification status, skills |
| `vendors` | Vendor store profiles, business details, bank info |
| `orders` | Product purchase orders |
| `order_items` | Individual items within orders |
| `bookings` | Service booking records |
| `addresses` | Saved delivery/service addresses |
| `reviews` | Product and professional reviews |
| `offers` | Vendor-created discounts and coupons |
| `wallet` | User wallet balance |
| `support_tickets` | Customer support tickets |
| `notifications` | User notifications |

### Row Level Security (RLS)

All user-facing tables have RLS enabled. Policies ensure:
- Users can only read/write their own data
- Public data (products, services, professionals) is readable by everyone
- Admin operations use the service-role key (bypasses RLS)

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register a new account |
| `POST` | `/api/auth/login` | No | Login with email/password |
| `GET` | `/api/auth/me` | Yes | Get current user profile |
| `POST` | `/api/auth/forgot-password` | No | Request password reset email |
| `POST` | `/api/auth/reset-password` | No | Reset password via token |
| `POST` | `/api/auth/change-password` | Yes | Change password (logged in) |
| `POST` | `/api/auth/logout` | No | Logout |

### Products & Services (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | No | List products (supports `?featured=true&category=...`) |
| `GET` | `/api/products/:id` | No | Get product details |
| `GET` | `/api/services` | No | List all services |
| `GET` | `/api/services/:id` | No | Get service details |
| `GET` | `/api/categories` | No | List product categories |
| `GET` | `/api/professionals` | No | List professionals (supports `?sort=rating`) |
| `GET` | `/api/professionals/:id` | No | Get professional profile |

### Customer

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET/PATCH` | `/api/users/profile` | Yes | View/update profile |
| `GET/POST/PATCH/DELETE` | `/api/addresses` | Yes | Manage saved addresses |
| `GET` | `/api/orders` | Yes | List my orders |
| `POST` | `/api/orders` | Yes | Place an order |
| `GET` | `/api/bookings` | Yes | List my bookings |
| `POST` | `/api/bookings` | Yes | Create a booking |
| `GET` | `/api/wallet` | Yes | View wallet balance |
| `GET/POST/DELETE` | `/api/reviews` | Yes | Manage reviews |
| `GET/POST` | `/api/support/*` | Yes | Chatbot + live support |

### Professional Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/professionals/me/dashboard` | Pro | Dashboard stats |
| `GET/PATCH` | `/api/professionals/me` | Pro | View/update profile |
| `GET` | `/api/professionals/me/bookings` | Pro | My bookings (supports `?status=...`) |
| `PATCH` | `/api/professionals/me/bookings/:id/respond` | Pro | Accept/decline booking |
| `PATCH` | `/api/professionals/me/bookings/:id/status` | Pro | Update booking status |
| `GET` | `/api/professionals/me/services` | Pro | My services |
| `PATCH` | `/api/professionals/me/services/:id` | Pro | Update service |
| `GET` | `/api/professionals/me/earnings` | Pro | Earnings history |
| `GET` | `/api/professionals/me/reviews` | Pro | My reviews |
| `GET` | `/api/professionals/me/notifications` | Pro | Notifications |
| `PATCH` | `/api/professionals/me/availability` | Pro | Toggle online/offline |
| `POST` | `/api/professionals/document` | Pro | Upload verification doc |

### Vendor Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/vendors/me/dashboard` | Vendor | Dashboard stats |
| `GET/POST/PATCH/DELETE` | `/api/vendors/me/products` | Vendor | Manage products |
| `GET` | `/api/vendors/me/orders` | Vendor | My orders |
| `PATCH` | `/api/vendors/me/orders/:id/status` | Vendor | Update order status |
| `GET/POST/PATCH/DELETE` | `/api/offers` | Vendor | Manage offers/coupons |
| `GET` | `/api/vendors/me/reviews` | Vendor | Product reviews |
| `GET` | `/api/vendors/me/analytics` | Vendor | Sales analytics |
| `GET/PATCH` | `/api/vendors/me/inventory` | Vendor | Inventory management |
| `PATCH` | `/api/vendors/me/store` | Vendor | Update store profile |
| `PATCH` | `/api/vendors/me/bank` | Vendor | Update bank details |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/dashboard` | Admin | System overview |
| `GET` | `/api/admin/users` | Admin | All users |
| `GET` | `/api/admin/orders` | Admin | All orders |
| `GET` | `/api/admin/bookings` | Admin | All bookings |
| `GET` | `/api/admin/analytics` | Admin | Platform analytics |
| `GET` | `/api/admin/reviews` | Admin | All reviews |
| `GET` | `/api/admin/support` | Admin | Support tickets |
| `GET` | `/api/professionals/admin` | Admin | All professionals |
| `PATCH` | `/api/professionals/:id/verify` | Admin | Verify/reject professional |
| `GET` | `/api/vendors/admin` | Admin | All vendors |
| `PATCH` | `/api/vendors/:id/verify` | Admin | Verify/reject vendor |

---

## Docker Setup

Run the entire stack with Docker Compose:

```bash
# Set environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key

# Or copy the Docker env template
cp docker/.env.example .env
# Edit .env with your Supabase credentials

# Build and start
docker compose up --build
```

| Service | Built From | URL |
|---------|-----------|-----|
| `backend` | `backend/Dockerfile` | http://localhost:5000/api |
| `modern` | `docker/modern.Dockerfile` | http://localhost:5173 |

The frontend nginx container proxies `/api` to the backend, so everything works as one stack. The backend healthcheck (`GET /api/health`) gates the frontend startup.

```bash
# Stop
docker compose down

# View logs
docker compose logs -f backend
```

---

## Deployment

### Frontend (Vercel)

The frontend deploys automatically to Vercel on push to `main`:

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Vercel detects the `vercel.json` config and builds the React app
3. Set environment variable `VITE_API_BASE_URL` to your deployed backend URL (e.g., `https://fixkart-api.onrender.com/api`)

### Backend (Render)

Deploy the backend to [Render](https://render.com):

1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PORT` = `10000`
5. Deploy — you'll get a URL like `https://fixkart-api-xxxx.onrender.com`

> **Important:** The backend includes a WebSocket polyfill in `config/env.js` to support Node.js 20 on Render. If upgrading to Node 22+, the polyfill is harmless and can be left in place.

---

## Seeding Sample Data

### Option A: Supabase SQL Editor (Recommended)

Open your Supabase Dashboard → **SQL Editor** and run:

1. `backend/scripts/seed.sql` — Creates categories, products, and services
2. `backend/scripts/seed-professionals.sql` — Creates professional accounts

Then register customer/vendor accounts through the app.

### Option B: Seed Script

```bash
cd backend
# Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env
npm run seed
```

This creates all sample data including professional accounts. The seeded logins use:
- **Email:** `pro.plumber@fixkart.dev` (and similar for other professions)
- **Password:** `FixkartSeed123!`

---

## User Roles & Access

| Role | Login Path | Dashboard Path | Capabilities |
|------|-----------|---------------|--------------|
| Customer | `/login` | `/profile` | Browse, purchase, book services, review |
| Professional | `/login` | `/professional/dashboard` | Accept jobs, manage bookings, earn FixCoins |
| Vendor | `/login` | `/vendor/dashboard` | List products, manage orders, run offers |
| Admin | `/login` | `/admin/dashboard` | Manage users, verify pros/vendors, analytics |

**Admin account:** `admin@fixkart.dev` / `Admin@12345`

Role-based routing automatically redirects users to their dashboard on login. Professionals, vendors, and admins see their dedicated dashboard — not the full storefront.

---

## Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Dark Navy | `#0F172A` | Backgrounds, primary text, buttons |
| Amber | `#F59E0B` | Accent, highlights, CTAs, FixCoins |
| Blue | `#2563EB` | Secondary actions, links |
| Slate | `#64748B` | Secondary text, placeholders |
| Green | `#10B981` | Success states, online status |
| Red | `#DC2626` | Errors, badges, alerts |

### Component Library

Built with **shadcn/ui** (40+ components) on top of Radix UI primitives. All components support dark mode via Tailwind's `dark:` variant.

---

## Security

FixKart implements a **defense-in-depth** security strategy across every layer of the stack.

### 🔐 Authentication & Authorization

| Measure | Implementation |
|---------|---------------|
| **JWT Authentication** | Supabase Auth issues short-lived JWTs. Every protected endpoint verifies the token via `supabase.auth.getUser()` before processing. |
| **Role-Based Access Control (RBAC)** | Middleware (`requireAuth`, `requireProfessional`, `requireVendor`) verifies the user's role from the `profiles` table on every request. Roles: `customer`, `professional`, `vendor`, `admin`. |
| **Admin Email Allowlist** | The `admin` role is only granted to specific allowlisted emails. A profile with `role='admin'` is not enough — the email must match. Prevents privilege escalation. |
| **Server-Side Role Assignment** | Roles are assigned by the server during registration — never from client-supplied data. A client cannot self-promote to admin or professional. |
| **Session Management** | Sessions are stored in `localStorage` with a custom key (`fixkart_session`). Tokens expire automatically and require re-authentication. |

### 🛡️ Row-Level Security (RLS)

All Supabase tables have **Row-Level Security enabled** with granular policies:

| Table | Policy |
|-------|--------|
| `profiles` | Users can read/update only their own row. Admins use service-role client to bypass. |
| `professionals` | Public read (for catalog). Owners update own row. Admins manage via service-role. |
| `vendors` | Public read for verified vendors. Owners manage own profile. |
| `bookings` | Customers see their own bookings. Professionals see bookings assigned to them. |
| `orders` | Customers see their own orders. |
| `wallets` | Users read only their own wallet. Writes via security-definer triggers only. |
| `reviews` | Public read. Users create reviews for their own completed orders/bookings. |
| `addresses` | Users manage only their own addresses. |

Admin controllers use `supabaseAdmin` (service-role key) which bypasses RLS for cross-user operations like verification and user management.

### 🚦 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| General API | 100 requests per 15 minutes per IP |
| Auth (login/register) | 20 requests per 15 minutes per IP |

Implemented via `express-rate-limit` in `backend/middleware/rateLimit.middleware.js`.

### 🔒 HTTP Security Headers

**Helmet.js** is enabled globally, setting:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy` (default policy)
- And 10+ other security headers

### ✅ Input Validation

All API endpoints use **Zod schemas** for request validation:

```javascript
// Example: booking validation
const createBookingSchema = z.object({
  professional_id: z.string().uuid(),
  service_id: z.string().uuid().optional(),
  scheduled_at: z.string().datetime(),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});
```

Validation middleware rejects malformed requests before they reach controllers.

### 🌐 CORS Configuration

- Requests are only accepted from configured origins (`CLIENT_URL` + `*.vercel.app`)
- Credentials are allowed for authenticated requests
- Preflight requests are cached for 1 hour

### 📦 Request Size Limits

- JSON body parser limited to **4 MB** to prevent memory exhaustion attacks

### 🔑 API Key Management

- Supabase **service-role key** is never exposed to the frontend
- Admin operations use `supabaseAdmin` (service-role) only on the backend
- Frontend uses `SUPABASE_ANON_KEY` which is subject to RLS
- Environment variables are never committed to the repository

### 🗄️ Database Security

- All tables have RLS enabled (defense at the database level)
- Sensitive writes (wallet transactions, role changes) use **security-definer functions** that bypass RLS
- Foreign key constraints prevent orphaned records
- CHECK constraints enforce valid enum values (e.g., `verification_status`, `plan`)
- UUID primary keys prevent sequential ID enumeration

### 🧹 Additional Measures

| Measure | Detail |
|---------|--------|
| **No SSR secrets** | Backend env vars are never bundled into the frontend |
| **Error sanitization** | Internal errors are logged server-side; only safe messages returned to clients |
| **WebSocket polyfill** | Backend includes a no-op WebSocket shim for Node.js < 22 compatibility — realtime features are disabled on the server |
| **Supabase anon vs service-role** | Two distinct clients: anon (RLS-scoped, for user requests) and service-role (RLS-bypassing, for admin operations only) |
| **HTTPS only** | Both Vercel (frontend) and Render (backend) enforce HTTPS in production |

### 📋 Security Checklist

- [x] Authentication on all protected routes
- [x] Role-based authorization per endpoint
- [x] Row-Level Security on all database tables
- [x] Rate limiting on API endpoints
- [x] HTTP security headers via Helmet
- [x] Input validation with Zod schemas
- [x] CORS origin restrictions
- [x] Request size limits
- [x] Service-role key isolated to backend
- [x] Admin email allowlist
- [x] Error message sanitization
- [x] UUID primary keys (no enumeration)
- [x] Foreign key constraints
- [x] CHECK constraints on enums
- [x] HTTPS enforcement

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run the build: `cd modern-frontend && npx vite build`
5. Commit: `git commit -m "feat: add my feature"`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

### Code Style

- **TypeScript** for all new frontend code
- **ES Modules** (`import`/`export`) for backend
- **Zod** schemas for all API request validation
- **Tailwind CSS** for styling (no CSS modules)
- **Functional components** with hooks only (no class components)

---

## License

This project is proprietary software. All rights reserved.

---

<div align="center">

**Built with ❤️ for FixKart**

Fixed fast, every time, everywhere.

</div>
