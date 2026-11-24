/**
 * scripts/seed-doctors.ts
 *
 * Upserts doctors and working_hours into Supabase from content/clinic.ts.
 *
 * Usage:
 *   npm run seed
 *   or: npx tsx scripts/seed-doctors.ts
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { clinic } from "../content/clinic";

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {
    // .env.local is optional when env vars are already set in process.env
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  const doctors = clinic.doctors;
  if (!doctors || doctors.length === 0) {
    console.error("No doctors found in content/clinic.ts");
    process.exit(1);
  }

  console.log(`Seeding ${doctors.length} doctors from content/clinic.ts...\n`);

  for (const doc of doctors) {
    console.log(`- Doctor: ${doc.name} (${doc.id}, ${doc.role})`);

    const { error: docError } = await supabase.from("doctors").upsert(
      {
        id: doc.id,
        name: doc.name,
        role: doc.role,
        email: doc.email,
        active: doc.active,
      },
      { onConflict: "id" }
    );

    if (docError) {
      console.error(`  Error upserting doctor ${doc.id}:`, docError.message);
      process.exit(1);
    }

    // Reset and insert working hours for this doctor
    const { error: delError } = await supabase
      .from("working_hours")
      .delete()
      .eq("doctor_id", doc.id);

    if (delError) {
      console.error(`  Error clearing working hours for ${doc.id}:`, delError.message);
      process.exit(1);
    }

    const workingHoursRows = doc.workingHours.map((wh) => ({
      doctor_id: doc.id,
      weekday: wh.weekday,
      start_time: wh.startTime,
      end_time: wh.endTime,
    }));

    if (workingHoursRows.length > 0) {
      const { error: whError } = await supabase
        .from("working_hours")
        .insert(workingHoursRows);

      if (whError) {
        console.error(`  Error inserting working hours for ${doc.id}:`, whError.message);
        process.exit(1);
      }
    }

    console.log(`  ✓ Inserted ${workingHoursRows.length} working hour shifts.`);
  }

  console.log("\n✅ Doctors and working hours seeded successfully.");
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
