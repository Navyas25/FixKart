import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const svc = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const emails = [
  "admin@fixkart.dev",
  "ops@fixkart.dev",
  "support@fixkart.dev",
  "finance@fixkart.dev",
];

const { data, error } = await svc
  .from("profiles")
  .select("email, role, full_name")
  .in("email", emails)
  .order("email");

if (error) {
  console.log("query error:", error.message);
  process.exit(1);
}

const byEmail = new Map((data || []).map((p) => [p.email, p]));
for (const e of emails) {
  const p = byEmail.get(e);
  console.log(
    p ? `${e} -> ${p.role}${p.full_name ? ` (${p.full_name})` : ""}` : `${e} -> NOT REGISTERED`
  );
}

const admins = (data || []).filter((p) => p.role === "admin");
console.log("---");
console.log(`admin count: ${admins.length} / 4`);
