// One-time seed for the engagement features (run AFTER migration 002):
//  - mark a set of products as featured
//  - give a set of products a discounted selling price
//  - backfill wallet rows for every profile
// Uses the server-side service key from backend/.env. Safe to re-run.
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config(); // run from backend/

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Product names -> { featured?, discount_pct? }
const PLAN = [
  { name: "Bosch 10mm Impact Drill", featured: true, discount_pct: 15 },
  { name: "Philips LED Bulb 9W", featured: true, discount_pct: 20 },
  { name: "Jaquar Basin Mixer Tap", featured: true, discount_pct: 12 },
  { name: "Stanley 5m Measuring Tape", featured: true, discount_pct: 25 },
  { name: "3M Safety Goggles", featured: true },
  { name: "Castrol Engine Oil 5W-30 (3L)", featured: true, discount_pct: 10 },
  { name: "Steel Claw Hammer 500g", discount_pct: 18 },
  { name: "Havells 16A Switch Socket", discount_pct: 22 },
  { name: "MRF Tyre Inflator with Gauge", discount_pct: 15 },
  { name: "Finolex 1-inch PVC Pipe (3m)", discount_pct: 10 },
];

const { data: products, error } = await supabase
  .from("products")
  .select("id, name, price");

if (error) {
  console.error("Could not read products:", error.message);
  process.exit(1);
}

let featured = 0;
let discounted = 0;

for (const p of products) {
  const plan = PLAN.find((x) => x.name === p.name);
  if (!plan) continue;

  const patch = {};
  if (plan.featured) {
    patch.featured = true;
    featured += 1;
  }
  if (plan.discount_pct) {
    patch.discount_price = Math.round((p.price * (100 - plan.discount_pct)) / 100);
    discounted += 1;
  }
  if (Object.keys(patch).length) {
    const { error: uErr } = await supabase
      .from("products")
      .update(patch)
      .eq("id", p.id);
    if (uErr) console.error(`  update failed for "${p.name}":`, uErr.message);
  }
}

// Backfill wallet rows for every profile (idempotent).
const { error: walletErr } = await supabase.rpc("ensure_wallet_for_all", {});
// Fallback if the RPC does not exist: insert wallets for profiles directly.
if (walletErr) {
  const { data: profiles } = await supabase.from("profiles").select("id");
  let created = 0;
  for (const profile of profiles || []) {
    const { error: wErr } = await supabase
      .from("wallets")
      .insert({ user_id: profile.id })
      .select();
    if (wErr && !/duplicate/i.test(wErr.message)) {
      console.error("  wallet insert failed:", wErr.message);
    } else if (!wErr) {
      created += 1;
    }
  }
  console.log(`Wallets: created ${created} (migration backfill handles the rest)`);
}

console.log(`Featured: ${featured} products | Discounted: ${discounted} products`);
console.log("Seed complete.");
