#!/usr/bin/env node
/**
 * FixKart sample-data seed.
 *
 * Seeds categories, products, services and professionals (with their auth
 * users + profiles) into Supabase. Safe to re-run: only missing rows are
 * inserted, so running it again is a no-op.
 *
 * It uses the service role key so it bypasses Row Level Security, which
 * blocks writes from the app's anon/authenticated keys by design.
 *
 * Usage:
 *   1. Add to backend/.env (Supabase dashboard -> Project Settings -> API):
 *        SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
 *   2. From backend/:
 *        npm run seed
 *
 * Alternatively, run backend/scripts/seed.sql in the Supabase SQL editor —
 * no key needed.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Load backend/.env (manual parse; dotenv path handling is fragile on Windows)
// ---------------------------------------------------------------------------
const ENV_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env"
);
try {
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
} catch {
  // No .env file - rely on real environment variables.
}

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } =
  process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_ANON_KEY. Copy backend/.env.example to backend/.env first."
  );
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    [
      "SUPABASE_SERVICE_ROLE_KEY is not set.",
      "",
      "Add it to backend/.env (Supabase dashboard -> Project Settings -> API):",
      "  SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret",
      "",
      "The service role bypasses RLS, so it can seed tables that the app's",
      "anon key is not allowed to write. Keep it out of any public code.",
      "",
      "(Prefer the dashboard SQL editor instead? Run backend/scripts/seed.sql",
      "there - it needs no key.)",
    ].join("\n")
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "Tools & Equipment",
  "Hand Tools",
  "Electrical",
  "Plumbing",
  "Paint & Decor",
  "Automotive",
  "Hardware & Fasteners",
  "Safety & Protection",
];

const PRODUCTS = [
  {
    name: "Bosch 10mm Impact Drill",
    description:
      "600W impact drill for masonry, wood and metal. Variable speed, keyless chuck, and a sturdy carry case included.",
    price: 2999,
    stock: 24,
    unit: "pc",
    brand: "Bosch",
    image_url: "https://picsum.photos/seed/fixkart-drill/600/400",
    category: "Tools & Equipment",
  },
  {
    name: "Black & Decker Cordless Screwdriver",
    description:
      "3.6V cordless screwdriver with USB charging and a 32-piece bit set. Perfect for furniture assembly and quick fixes.",
    price: 1999,
    stock: 30,
    unit: "pc",
    brand: "Black & Decker",
    image_url: "https://picsum.photos/seed/fixkart-screwdriver/600/400",
    category: "Tools & Equipment",
  },
  {
    name: "Stanley 5m Measuring Tape",
    description:
      "Heavy-duty 5 metre tape measure with a locking mechanism, metric markings and a durable ABS case.",
    price: 249,
    stock: 80,
    unit: "pc",
    brand: "Stanley",
    image_url: "https://picsum.photos/seed/fixkart-tape/600/400",
    category: "Hand Tools",
  },
  {
    name: "Steel Claw Hammer 500g",
    description:
      "Drop-forged steel claw hammer with a cushioned grip. Ideal for carpentry, framing and general repairs.",
    price: 349,
    stock: 60,
    unit: "pc",
    brand: "FixKart Pro",
    image_url: "https://picsum.photos/seed/fixkart-hammer/600/400",
    category: "Hand Tools",
  },
  {
    name: "Havells 16A Switch Socket",
    description:
      "Modular 16A switch socket with child-safe shutters and anti-arc protection for heavy appliances.",
    price: 189,
    stock: 120,
    unit: "pc",
    brand: "Havells",
    image_url: "https://picsum.photos/seed/fixkart-socket/600/400",
    category: "Electrical",
  },
  {
    name: "Polycab 2.5 sq mm Wire (90m)",
    description:
      "ISI-marked FR house wire, 2.5 sq mm, 90 metre coil. Low smoke, zero halogen insulation for home wiring.",
    price: 1799,
    stock: 40,
    unit: "coil",
    brand: "Polycab",
    image_url: "https://picsum.photos/seed/fixkart-wire/600/400",
    category: "Electrical",
  },
  {
    name: "Philips LED Bulb 9W",
    description:
      "9W B22 LED bulb, 806 lumens, warm white. 15,000 hour life with a two year brand warranty.",
    price: 99,
    stock: 200,
    unit: "pc",
    brand: "Philips",
    image_url: "https://picsum.photos/seed/fixkart-bulb/600/400",
    category: "Electrical",
  },
  {
    name: "Finolex 1-inch PVC Pipe (3m)",
    description:
      "Rigid PVC plumbing pipe, 1 inch diameter, 3 metre length. For cold water supply and drainage lines.",
    price: 420,
    stock: 55,
    unit: "pc",
    brand: "Finolex",
    image_url: "https://picsum.photos/seed/fixkart-pipe/600/400",
    category: "Plumbing",
  },
  {
    name: "Jaquar Basin Mixer Tap",
    description:
      "Chrome-finished single-lever basin mixer with a ceramic cartridge and 10 year warranty.",
    price: 2499,
    stock: 35,
    unit: "pc",
    brand: "Jaquar",
    image_url: "https://picsum.photos/seed/fixkart-tap/600/400",
    category: "Plumbing",
  },
  {
    name: "Asian Paints Ace Exterior Emulsion (20L)",
    description:
      "Weather-resistant exterior emulsion, 20 litre bucket. UV protection and rich, long-lasting colour.",
    price: 5499,
    stock: 18,
    unit: "bucket",
    brand: "Asian Paints",
    image_url: "https://picsum.photos/seed/fixkart-paint/600/400",
    category: "Paint & Decor",
  },
  {
    name: "Castrol Engine Oil 5W-30 (3L)",
    description:
      "Fully synthetic engine oil for petrol and diesel cars. Improved fuel economy and engine protection.",
    price: 1299,
    stock: 45,
    unit: "L",
    brand: "Castrol",
    image_url: "https://picsum.photos/seed/fixkart-oil/600/400",
    category: "Automotive",
  },
  {
    name: "MRF Tyre Inflator with Gauge",
    description:
      "Heavy-duty foot pump with an analogue pressure gauge, ideal for cars, bikes and bicycles.",
    price: 599,
    stock: 70,
    unit: "pc",
    brand: "MRF",
    image_url: "https://picsum.photos/seed/fixkart-pump/600/400",
    category: "Automotive",
  },
  {
    name: "Steel Hex Bolt Set (50 pc)",
    description:
      "Assorted zinc-plated hex bolts, nuts and washers in the most common sizes, in a partitioned storage box.",
    price: 199,
    stock: 90,
    unit: "set",
    brand: "FixKart Pro",
    image_url: "https://picsum.photos/seed/fixkart-bolts/600/400",
    category: "Hardware & Fasteners",
  },
  {
    name: "3M Safety Goggles",
    description:
      "Anti-fog, anti-scratch polycarbonate goggles with UV protection for workshop and construction use.",
    price: 349,
    stock: 65,
    unit: "pc",
    brand: "3M",
    image_url: "https://picsum.photos/seed/fixkart-goggles/600/400",
    category: "Safety & Protection",
  },
];

const SERVICES = [
  {
    name: "Plumbing Repair & Installation",
    category: "Plumbing",
    description:
      "Leak repairs, tap and basin installation, pipe fitting and bathroom fittings by certified plumbers.",
    base_price: 299,
    image_url: "https://picsum.photos/seed/fixkart-svc-plumbing/600/400",
  },
  {
    name: "Electrical Wiring & Fixes",
    category: "Electrical",
    description:
      "Switchboard upgrades, wiring, circuit checks and appliance points by licensed electricians.",
    base_price: 349,
    image_url: "https://picsum.photos/seed/fixkart-svc-electric/600/400",
  },
  {
    name: "Carpentry & Furniture Assembly",
    category: "Carpentry",
    description:
      "Custom furniture, door fitting, modular kitchen installation and flat-pack assembly.",
    base_price: 399,
    image_url: "https://picsum.photos/seed/fixkart-svc-carpentry/600/400",
  },
  {
    name: "AC Service & Repair",
    category: "HVAC",
    description:
      "AC installation, gas refill, deep cleaning and annual maintenance contracts.",
    base_price: 499,
    image_url: "https://picsum.photos/seed/fixkart-svc-ac/600/400",
  },
  {
    name: "Painting & Wall Finishing",
    category: "Painting",
    description:
      "Interior and exterior painting, putty work and premium texture finishes.",
    base_price: 299,
    image_url: "https://picsum.photos/seed/fixkart-svc-paint/600/400",
  },
  {
    name: "Car & Bike Mechanic",
    category: "Automotive",
    description:
      "Servicing, engine repairs, brake work and roadside assistance for cars and two-wheelers.",
    base_price: 449,
    image_url: "https://picsum.photos/seed/fixkart-svc-mechanic/600/400",
  },
  {
    name: "Home Appliance Repair",
    category: "Appliances",
    description:
      "Repair and servicing of washing machines, refrigerators, ovens and water heaters at home.",
    base_price: 349,
    image_url: "https://picsum.photos/seed/fixkart-svc-appliance/600/400",
  },
  {
    name: "Home Deep Cleaning",
    category: "Cleaning",
    description:
      "Full-home deep cleaning with professional equipment and eco-friendly products.",
    base_price: 249,
    image_url: "https://picsum.photos/seed/fixkart-svc-cleaning/600/400",
  },
];

const SEED_PASSWORD = "FixkartSeed123!";

const PROFESSIONALS = [
  {
    email: "pro.plumber@fixkart.dev",
    full_name: "Rajesh Kumar",
    phone: "+91 98765 40001",
    avatar_url: "https://picsum.photos/seed/fixkart-rajesh/200/200",
    experience_years: 12,
    rating: 4.9,
    bio: "Certified plumber specialising in bathroom fittings, leak repairs, pipe installation and water heater setup across the city.",
  },
  {
    email: "pro.electrician@fixkart.dev",
    full_name: "Suresh Reddy",
    phone: "+91 98765 40002",
    avatar_url: "https://picsum.photos/seed/fixkart-suresh/200/200",
    experience_years: 8,
    rating: 4.8,
    bio: "Licensed electrician for house wiring, switchboard upgrades, appliance circuits and safety inspections.",
  },
  {
    email: "pro.carpenter@fixkart.dev",
    full_name: "Amit Verma",
    phone: "+91 98765 40003",
    avatar_url: "https://picsum.photos/seed/fixkart-amit/200/200",
    experience_years: 15,
    rating: 4.7,
    bio: "Carpenter for custom furniture, door fitting, modular kitchens and precise flat-pack assembly.",
  },
  {
    email: "pro.ac@fixkart.dev",
    full_name: "Deepak Sharma",
    phone: "+91 98765 40004",
    avatar_url: "https://picsum.photos/seed/fixkart-deepak/200/200",
    experience_years: 10,
    rating: 4.9,
    bio: "AC technician offering installation, gas refills, deep cleaning and annual maintenance contracts for all brands.",
  },
  {
    email: "pro.painter@fixkart.dev",
    full_name: "Vikram Singh",
    phone: "+91 98765 40005",
    avatar_url: "https://picsum.photos/seed/fixkart-vikram/200/200",
    experience_years: 9,
    rating: 4.6,
    bio: "Painter for interior and exterior work, putty and primer coats, and premium texture finishes.",
  },
  {
    email: "pro.mechanic@fixkart.dev",
    full_name: "Mohan Das",
    phone: "+91 98765 40006",
    avatar_url: "https://picsum.photos/seed/fixkart-mohan/200/200",
    experience_years: 14,
    rating: 4.8,
    bio: "Two-wheeler and car mechanic for regular servicing, engine repairs, brake work and roadside assistance.",
  },
];

// ---------------------------------------------------------------------------
// Seeding helpers
// ---------------------------------------------------------------------------

async function seedCategories() {
  const { data: existing, error } = await db.from("categories").select("name");
  if (error) throw error;

  const have = new Set((existing || []).map((c) => c.name.toLowerCase()));
  const missing = CATEGORIES.filter((n) => !have.has(n.toLowerCase()));

  if (!missing.length) {
    console.log("categories: up to date");
    return;
  }

  const { data, error: insErr } = await db
    .from("categories")
    .insert(missing.map((name) => ({ name })))
    .select("name");
  if (insErr) throw insErr;
  console.log(`categories: inserted ${data.length} (${data.map((c) => c.name).join(", ")})`);
}

async function seedProducts() {
  const { data: existing, error } = await db.from("products").select("name");
  if (error) throw error;

  const { data: cats, error: catErr } = await db
    .from("categories")
    .select("id, name");
  if (catErr) throw catErr;

  const catId = Object.fromEntries((cats || []).map((c) => [c.name, c.id]));
  const have = new Set((existing || []).map((p) => p.name.toLowerCase()));

  const rows = PRODUCTS.filter((p) => !have.has(p.name.toLowerCase())).map(
    (p) => ({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      unit: p.unit,
      brand: p.brand,
      image_url: p.image_url,
      category_id: catId[p.category],
    })
  );

  const unknown = rows.filter((r) => !r.category_id);
  if (unknown.length) {
    throw new Error(
      `Unknown category for products: ${unknown.map((r) => r.name).join(", ")}`
    );
  }

  if (!rows.length) {
    console.log("products: up to date");
    return;
  }

  const { data, error: insErr } = await db
    .from("products")
    .insert(rows)
    .select("name");
  if (insErr) throw insErr;
  console.log(`products: inserted ${data.length}`);
}

async function seedServices() {
  const { data: existing, error } = await db.from("services").select("name");
  if (error) throw error;

  const have = new Set((existing || []).map((s) => s.name.toLowerCase()));
  const rows = SERVICES.filter((s) => !have.has(s.name.toLowerCase()));

  if (!rows.length) {
    console.log("services: up to date");
    return;
  }

  const { data, error: insErr } = await db
    .from("services")
    .insert(rows)
    .select("name");
  if (insErr) throw insErr;
  console.log(`services: inserted ${data.length}`);
}

async function seedProfessionals() {
  const { data: userPage, error: listErr } = await db.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw listErr;

  const usersByEmail = new Map(
    (userPage?.users || []).map((u) => [u.email, u])
  );

  for (const pro of PROFESSIONALS) {
    let user = usersByEmail.get(pro.email);

    if (!user) {
      const { data: created, error: createErr } = await db.auth.admin.createUser({
        email: pro.email,
        password: SEED_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: pro.full_name },
      });
      if (createErr) throw createErr;
      user = created.user;
      console.log(`  created auth user ${pro.email}`);
    }

    // Upsert the profile row (a signup trigger may already have created it).
    const { error: profErr } = await db.from("profiles").upsert(
      {
        id: user.id,
        full_name: pro.full_name,
        avatar_url: pro.avatar_url,
        phone: pro.phone,
        role: "professional",
      },
      { onConflict: "id" }
    );
    if (profErr) throw profErr;

    const { data: existing, error: exErr } = await db
      .from("professionals")
      .select("user_id")
      .eq("user_id", user.id);
    if (exErr) throw exErr;
    if (existing?.length) {
      console.log(`  professional ${pro.full_name}: up to date`);
      continue;
    }

    const { error: insErr } = await db.from("professionals").insert({
      user_id: user.id,
      experience_years: pro.experience_years,
      rating: pro.rating,
      bio: pro.bio,
    });
    if (insErr) throw insErr;
    console.log(`  inserted professional ${pro.full_name} (${pro.email})`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding FixKart sample data…");
  await seedCategories();
  await seedProducts();
  await seedServices();
  await seedProfessionals();
  console.log("\nDone. The storefront, search and booking pages should now show");
  console.log("real data. Refresh the site (the classic one may need a cache");
  console.log("clear, since it caches JS for an hour).");
  console.log(
    `\nSeed professional logins (for the professional portal): password ${SEED_PASSWORD}`
  );
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message || err);
  process.exit(1);
});
