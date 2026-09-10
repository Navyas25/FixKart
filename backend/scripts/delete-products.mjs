#!/usr/bin/env node
/**
 * One-off: delete specific products from the Supabase `products` table.
 *
 * Deletes (case-insensitive, prefix match so "Cotton Rope 12mm" also matches
 * "Cotton Rope 12mm (20m)"):
 *   - Polyester Rope 12mm (50m)
 *   - Hemp Rope 14mm
 *   - Cotton Rope 12mm
 *   - Compact Tool Tote
 *   - Multi-bit Screwdriver 32-in-1
 *
 * Usage: from backend/, run  node scripts/delete-products.mjs
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in backend/.env
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

// Load backend/.env (same manual parse as seed.js).
const ENV_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env");
try {
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
} catch {
  // No .env file - rely on real environment variables.
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in backend/.env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TARGETS = [
  "polyester rope 12mm",
  "hemp rope 14mm",
  "cotton rope 12mm",
  "compact tool tote",
  "multi-bit screwdriver 32-in-1",
];

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

const { data: all, error } = await supabase.from("products").select("id, name");
if (error) {
  console.error("Failed to fetch products:", error.message);
  process.exit(1);
}

const toDelete = (all || []).filter((p) =>
  TARGETS.some((t) => norm(p.name) === t || norm(p.name).startsWith(t))
);

if (toDelete.length === 0) {
  console.log("No matching products found — nothing to delete.");
  process.exit(0);
}

console.log(`Found ${toDelete.length} matching product(s):`);
for (const p of toDelete) console.log(`  - ${p.name} (${p.id})`);

const { error: delError, count } = await supabase
  .from("products")
  .delete({ count: "exact" })
  .in("id", toDelete.map((p) => p.id));

if (delError) {
  console.error("Delete failed:", delError.message);
  process.exit(1);
}

console.log(`Deleted ${count ?? toDelete.length} product(s).`);
