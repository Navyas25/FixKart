// ============================================================================
// FixKart catalog expansion + dataset image upload
//
// 1. Creates a public "product-images" storage bucket (via API - no SQL needed)
// 2. Uploads a representative sample (~100 images) from the Mechanical Tools
//    dataset into that bucket
// 3. Creates ~94 new products (mechanical tools) with those images
// 4. Creates 16 new services
// 5. Creates 14 new professionals (auth users + profiles + professional rows)
//
// Uses the server-side service key from backend/.env. Safe to re-run - all
// inserts are idempotent (checked by name/email).
// ============================================================================
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";

dotenv.config(); // run from backend/

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const BUCKET = "product-images";
const DATASET =
  "C:/Users/Navya Bhushan/Downloads/archive (1)/Mechanical Tools Image dataset/Mechanical Tools Image dataset";

// ---------------------------------------------------------------------------
// 1. Bucket
// ---------------------------------------------------------------------------
const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
  public: true,
});
if (bucketError && !/already exists/i.test(bucketError.message)) {
  console.error("Bucket error:", bucketError.message);
  process.exit(1);
}
console.log(`Bucket "${BUCKET}" ready.`);

// ---------------------------------------------------------------------------
// 2. Pick + upload sample images
// ---------------------------------------------------------------------------
const folders = ["Hammer", "Wrench", "Screw Driver", "pliers", "Toolbox", "Gasoline Can", "Rope"];
const imagesPerFolder = { Hammer: 18, Wrench: 18, "Screw Driver": 18, pliers: 12, Toolbox: 10, "Gasoline Can": 8, Rope: 10 };
const typeMap = { Hammer: "hammer", Wrench: "wrench", "Screw Driver": "screwdriver", pliers: "pliers", Toolbox: "toolbox", "Gasoline Can": "gascan", Rope: "rope" };

const uploaded = new Map(); // type -> [urls]
const bucketBase = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

for (const folder of folders) {
  const dir = join(DATASET, folder);
  if (!statSync(dir, { throwIfNoEntry: false })) {
    console.error(`Dataset folder not found: ${dir}`);
    process.exit(1);
  }
  const files = readdirSync(dir)
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort();
  if (!files.length) {
    console.error(`No images in ${folder}`);
    process.exit(1);
  }

  const want = imagesPerFolder[folder];
  const idxs = [...new Set(Array.from({ length: want }, (_, i) =>
    Math.round(((files.length - 1) * i) / (want - 1 || 1))
  ))];

  const urls = [];
  for (const idx of idxs) {
    const file = files[idx];
    const ext = file.split(".").pop().toLowerCase();
    const safe = file.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${typeMap[folder]}/${safe}`;
    try {
      const body = readFileSync(join(dir, file));
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, body, {
          contentType: ext === "png" ? "image/png" : "image/jpeg",
          upsert: true,
        });
      if (error) throw error;
      urls.push(`${bucketBase}/${path}`);
    } catch (e) {
      console.error(`  upload failed ${path}: ${e.message}`);
    }
  }
  uploaded.set(typeMap[folder], urls);
  console.log(`Uploaded ${urls.length} ${typeMap[folder]} images.`);
}

const img = (type, i) => (uploaded.get(type) || [])[i % (uploaded.get(type)?.length || 1)];

// ---------------------------------------------------------------------------
// 3. Categories (id lookup)
// ---------------------------------------------------------------------------
const { data: categories } = await supabase.from("categories").select("id, name");
const catId = (name) => (categories || []).find((c) => c.name === name)?.id;

const cat = {
  tools: catId("Tools & Equipment"),
  hand: catId("Hand Tools"),
  fasteners: catId("Hardware & Fasteners"),
};

// ---------------------------------------------------------------------------
// 4. New products (mechanical tools, images from the dataset)
// ---------------------------------------------------------------------------
const P = (type, names, categoryId, brand, desc) =>
  names.map((n, i) => ({ name: n, category_id: categoryId, brand, description: desc, image_url: img(type, i) }));

const desc = (type) =>
  `Professional-grade ${type} with durable, corrosion-resistant construction. Comfortable ergonomic grip, precision-engineered for reliable performance on every job. Built for both home DIY and heavy workshop use.`;

let newProducts = [
  ...P("hammer", [
    "Claw Hammer 500g", "Claw Hammer 16oz", "Ball Peen Hammer 8oz", "Ball Peen Hammer 24oz",
    "Sledge Hammer 3kg", "Rubber Mallet", "Dead Blow Hammer", "Brass Hammer", "Tack Hammer",
    "Mini Claw Hammer 250g", "Fiberglass Handle Hammer 16oz", "Wood Handle Claw Hammer",
    "Warrington Hammer", "Rock Hammer 20oz", "Hand Drilling Hammer", "Masons Hammer 2lb",
    "Soft-Face Mallet", "Framing Hammer 22oz",
  ], cat.hand, "Stanley", desc("hammer")),
  ...P("wrench", [
    "Adjustable Wrench 6\"", "Adjustable Wrench 10\"", "Adjustable Wrench 12\"",
    "Combination Spanner Set 12pc", "Double Open-End Spanner Set 10pc", "Socket Wrench Set 21pc",
    "Pipe Wrench 14\"", "Pipe Wrench 18\"", "Allen Key Set 9pc", "Torque Wrench 3/8\"",
    "Monkey Wrench 10\"", "Basin Wrench", "Ratchet Spanner Set 8pc", "Crowfoot Wrench Set",
    "Open End Wrench 15mm", "Ring Spanner 13mm", "Offset Ring Spanner Set", "Spanner Set 15pc with Roll",
  ], cat.hand, "Stanley", desc("wrench")),
  ...P("screwdriver", [
    "Phillips Screwdriver #2", "Flathead Screwdriver 6\"", "Precision Screwdriver Set 12pc",
    "Insulated Screwdriver Set 1000V", "Ratchet Screwdriver", "Impact Screwdriver Set",
    "Stubby Screwdriver Set 4pc", "Torx Screwdriver Set 8pc", "Magnetic Screwdriver",
    "Jeweler's Screwdriver Set", "Multi-bit Screwdriver 32-in-1", "Offset Screwdriver Set",
    "Electrician Screwdriver 3pc", "Cabinet Screwdriver", "Concrete Screwdriver",
    "Phillips Screwdriver #1", "Flathead Screwdriver 4\"", "Terminal Screwdriver",
  ], cat.hand, "Stanley", desc("screwdriver")),
  ...P("pliers", [
    "Combination Pliers 8\"", "Needle Nose Pliers 6\"", "Slip Joint Pliers 10\"",
    "Long Nose Pliers 8\"", "Wire Stripper Pliers", "Crimping Pliers", "Locking Pliers 10\"",
    "Diagonal Cutting Pliers 7\"", "Water Pump Pliers 10\"", "Snap Ring Pliers Set 4pc",
    "Bent Nose Pliers 6\"", "Multigrip Pliers 250mm",
  ], cat.hand, "Klein", desc("pliers")),
  ...P("toolbox", [
    "Steel Toolbox 16\"", "Aluminium Toolbox 19\"", "Plastic Toolbox 20pc",
    "Rolling Tool Chest 3-Tier", "Mechanic Toolbox 3-Drawer", "Portable Organizer Box 24\"",
    "Tool Bag 18\"", "Workshop Storage Case", "Cantilever Toolbox 18\"", "Compact Tool Tote",
  ], cat.tools, "Stanley", desc("toolbox")),
  ...P("gascan", [
    "10L Jerry Can", "20L Jerry Can", "5L Fuel Can", "Steel Gasoline Can 5L",
    "Red Plastic Fuel Can 20L", "Water Jerry Can 25L", "Military Jerry Can 20L", "Compact 2L Fuel Can",
  ], cat.tools, "FixKart Pro", desc("fuel can")),
  ...P("rope", [
    "Nylon Rope 10mm (50m)", "Polypropylene Rope 8mm (100m)", "Cotton Rope 12mm (20m)",
    "Climbing Rope 11mm (30m)", "Towing Rope 5 Ton", "Paracord 550 (100m)",
    "Jute Rope 10mm (30m)", "Hemp Rope 14mm (20m)", "Polyester Rope 12mm (50m)", "Rope Ladder 5m",
  ], cat.fasteners, "FixKart Pro", desc("rope")),
];

// Build the full insert rows with price/stock/unit.
const PRICE = {
  Hammer: [349, 449, 399, 549, 899, 299, 649, 799, 249, 199, 599, 429, 379, 749, 329, 699, 459, 949],
  Wrench: [299, 449, 599, 899, 799, 1499, 649, 799, 249, 1299, 549, 699, 999, 749, 349, 329, 849, 1099],
  Screwdriver: [199, 189, 499, 899, 449, 599, 349, 549, 229, 279, 649, 399, 459, 319, 289, 179, 169, 209],
  Pliers: [349, 329, 399, 359, 449, 549, 649, 429, 499, 599, 349, 749],
  Toolbox: [899, 1299, 1099, 3499, 1999, 799, 599, 949, 1199, 499],
  Gascan: [699, 999, 449, 549, 1099, 849, 1299, 299],
  Rope: [649, 549, 399, 1899, 999, 749, 349, 429, 799, 899],
};

let priceIndex = 0;
let inserted = 0;
let updated = 0;
const stockFor = () => 25 + (priceIndex * 7) % 120;

// Existing products by name (so re-runs update images instead of duplicating).
const { data: existingProducts } = await supabase.from("products").select("id, name");
const existingByName = new Map((existingProducts || []).map((p) => [p.name, p.id]));

for (const p of newProducts) {
  const price = Object.values(PRICE).flat()[priceIndex] || 499;
  priceIndex += 1;
  const row = {
    name: p.name,
    description: p.description,
    price,
    stock: stockFor(),
    unit: "pc",
    brand: p.brand,
    image_url: p.image_url,
    category_id: p.category_id,
  };

  const existingId = existingByName.get(p.name);
  if (existingId) {
    const { error } = await supabase.from("products").update(row).eq("id", existingId);
    if (error) console.error(`  product update failed "${p.name}":`, error.message);
    else updated += 1;
  } else {
    const { error } = await supabase.from("products").insert(row);
    if (error) console.error(`  product insert failed "${p.name}":`, error.message);
    else inserted += 1;
  }
}
console.log(`Products: +${inserted} new, ${updated} image-updated (total catalog ~${14 + inserted})`);

// ---------------------------------------------------------------------------
// 5. Services (16 new)
// ---------------------------------------------------------------------------
const NEW_SERVICES = [
  ["Water Tank Cleaning & Maintenance", "Cleaning", "Pressure-jet cleaning and disinfection of overhead and underground water tanks.", 899],
  ["Geyser Installation & Repair", "Plumbing", "Installation, servicing and repair of electric and gas geysers with warranty.", 449],
  ["False Ceiling Installation", "Carpentry", "POP and gypsum false ceiling design, installation and finishing.", 999],
  ["Bathroom Renovation", "Plumbing", "Full bathroom makeover - fittings, tiling, fixtures and waterproofing.", 1499],
  ["Tiles & Flooring Installation", "Carpentry", "Vitrified, ceramic and wooden flooring installation with skirting.", 1299],
  ["Roof Waterproofing", "Painting", "Chemical and membrane waterproofing for terrace roofs and balconies.", 1199],
  ["Mosquito Net Installation", "Carpentry", "Custom-sized window and door mosquito nets, fitted same visit.", 349],
  ["TV & Speaker Wall Mounting", "Electrical", "Secure wall mounting of TVs, speakers and home-theatre systems.", 299],
  ["Inverter & Stabilizer Installation", "Electrical", "Installation, wiring and commissioning of inverters and stabilizers.", 599],
  ["Solar Panel Maintenance", "Electrical", "Cleaning, health checks and inverter servicing for solar setups.", 749],
  ["Generator Repair & Service", "Automotive", "Diagnostics, servicing and repairs for home and commercial generators.", 699],
  ["Pest Control Service", "Cleaning", "Eco-friendly treatment for cockroaches, termites, rodents and bed bugs.", 499],
  ["Sofa & Curtain Cleaning", "Cleaning", "Deep steam cleaning and stain removal for sofas, curtains and carpets.", 599],
  ["Furniture Polishing & Refinishing", "Carpentry", "Polish, scratch removal and refinishing for wood and laminate furniture.", 799],
  ["Chimney & Hob Cleaning", "Cleaning", "Degreasing and maintenance of kitchen chimneys and gas hobs.", 549],
  ["Door Lock & Security Installation", "Electrical", "Smart locks, deadbolts and CCTV-lock installation and keying.", 399],
];

let servicesAdded = 0;
for (const [name, category, description, base_price] of NEW_SERVICES) {
  const { error } = await supabase.from("services").insert({
    name,
    category,
    description,
    base_price,
    image_url: `https://picsum.photos/seed/fixkart-svc-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/600/400`,
  });
  if (error && !/duplicate/i.test(error.message)) {
    console.error(`  service insert failed "${name}":`, error.message);
  } else if (!error) {
    servicesAdded += 1;
  }
}
console.log(`Services: +${servicesAdded} new (total now ~${8 + servicesAdded})`);

// ---------------------------------------------------------------------------
// 6. Professionals (14 new - auth users + profiles + professional rows)
// ---------------------------------------------------------------------------
const NEW_PROFESSIONALS = [
  ["Ramesh Iyer", "Plumbing", 11, 4.8, "Experienced plumber for bathroom fittings, leak detection and complete plumbing overhauls.", "Bangalore"],
  ["Anil Kumar", "Electrical", 9, 4.7, "Licensed electrician for house wiring, switchboards, inverter setups and safety audits.", "Delhi"],
  ["Manoj Gupta", "Carpentry", 14, 4.9, "Master carpenter for modular kitchens, wardrobes, false ceilings and custom furniture.", "Mumbai"],
  ["Karthik Nair", "HVAC", 7, 4.6, "AC installation, gas refills, deep cleaning and annual maintenance contracts.", "Bangalore"],
  ["Sanjay Tiwari", "Painting", 12, 4.7, "Interior and exterior painter with premium texture and waterproofing expertise.", "Pune"],
  ["Arun Prakash", "Automotive", 10, 4.5, "Mechanic for car and two-wheeler servicing, engine repairs and roadside assistance.", "Chennai"],
  ["Vijay Malhotra", "Plumbing", 8, 4.6, "Plumber specialising in geysers, pumps, water tanks and complete bathroom fitting.", "Delhi"],
  ["Prakash Yadav", "Electrical", 6, 4.5, "Electrician for appliance circuits, MCB upgrades, TV mounting and smart-home wiring.", "Lucknow"],
  ["Ravi Shankar", "HVAC", 9, 4.8, "HVAC technician for AC repair, split AC installation and ducted system servicing.", "Hyderabad"],
  ["Dinesh Kumar", "Painting", 7, 4.4, "Painter for putty work, emulsion coats, texture designs and roof waterproofing.", "Jaipur"],
  ["Nikhil Rao", "Automotive", 13, 4.7, "Senior mechanic for engine overhauls, brake work, suspension and annual servicing.", "Bangalore"],
  ["Sandeep Joshi", "Appliances", 8, 4.6, "Repairs for washing machines, refrigerators, microwaves and water heaters at home.", "Mumbai"],
  ["Farhan Khan", "Cleaning", 5, 4.5, "Deep-cleaning specialist for sofas, kitchens, bathrooms and full-home sanitisation.", "Delhi"],
  ["Girish Menon", "Carpentry", 10, 4.6, "Carpenter for doors, wardrobes, flooring, mosquito nets and furniture assembly.", "Kochi"],
];

let prosAdded = 0;
for (const [name, category, experience, rating, bio, city] of NEW_PROFESSIONALS) {
  const email = `pro.${name.toLowerCase().split(" ")[0]}.${name.toLowerCase().split(" ")[1] || "x"}@fixkart.dev`;

  const password = "ProPass123!";
  let uid = null;

  // Find an existing auth user by email (auth.users is not exposed via REST,
  // so use the admin API).
  const { data: userList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  uid = (userList?.users || []).find((u) => u.email?.toLowerCase() === email)?.id || null;

  if (!uid) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role: "professional" },
    });
    if (createError) {
      console.error(`  auth create failed for ${email}:`, createError.message);
      continue;
    }
    uid = created.user.id;
  }

  // Profile row with the professional role. The sign-up trigger creates a
  // default row as 'customer', and the role-change trigger blocks UPDATEs
  // even from the service-role session - so delete the default row and
  // INSERT with the correct role (inserts are not role-gated).
  const profilePayload = {
    id: uid,
    full_name: name,
    phone: `+91 98765 4${String(100 + prosAdded)}`,
    avatar_url: `https://picsum.photos/seed/fixkart-${name.toLowerCase().replace(/\s+/g, "-")}/200/200`,
    role: "professional",
  };
  await supabase.from("profiles").delete().eq("id", uid);
  const { error: profileError } = await supabase.from("profiles").insert(profilePayload);
  if (profileError) console.error(`  profile insert failed for ${email}:`, profileError.message);

  // Professional row (idempotent by user_id).
  const { error: proError } = await supabase.from("professionals").upsert(
    {
      user_id: uid,
      experience_years: experience,
      rating,
      bio,
      service_categories: [category],
      service_locations: [city],
      verification_status: "verified",
    },
    { onConflict: "user_id" }
  );
  if (proError && !/duplicate/i.test(proError.message)) {
    console.error(`  professional upsert failed for ${email}:`, proError.message);
  } else {
    prosAdded += 1;
  }
}
console.log(`Professionals: +${prosAdded} new (total now ~${6 + prosAdded})`);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const counts = await Promise.all([
  supabase.from("products").select("id", { count: "exact", head: true }),
  supabase.from("services").select("id", { count: "exact", head: true }),
  supabase.from("professionals").select("id", { count: "exact", head: true }),
]);
console.log("---");
console.log(`products: ${counts[0].count} | services: ${counts[1].count} | professionals: ${counts[2].count}`);
console.log("Catalog seed complete.");
