/**
 * scripts/cleanup-enquiries.ts
 *
 * Deletes rows older than 7 days from both the enquiries and appointments
 * tables (and any local fallback records) to comply with the privacy
 * retention policy.
 *
 * Usage:
 *   npm run cleanup
 *   npx tsx scripts/cleanup-enquiries.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local manually if running outside next
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
    // env vars already set
  }
}
loadEnvLocal();

const rawUrl = process.env.SUPABASE_URL ?? "";
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const RETENTION_DAYS = 7;
const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
const cutoffIso = cutoffDate.toISOString();

async function cleanupSupabase(): Promise<{
  enquiries: number;
  appointments: number;
}> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log(
      "[cleanup] Supabase credentials not set, skipping database cleanup."
    );
    return { enquiries: 0, appointments: 0 };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  async function deleteTable(table: string): Promise<number> {
    try {
      const { error, count } = await supabase
        .from(table)
        .delete({ count: "exact" })
        .lt("created_at", cutoffIso);

      if (error) {
        console.warn(`[cleanup] ${table} deletion notice: ${error.message}`);
        return 0;
      }
      return count ?? 0;
    } catch (err) {
      console.warn(`[cleanup] ${table} connection error:`, err);
      return 0;
    }
  }

  const [enquiries, appointments] = await Promise.all([
    deleteTable("enquiries"),
    deleteTable("appointments"),
  ]);

  return { enquiries, appointments };
}

function cleanupLocal(): number {
  const localPath = join(process.cwd(), "data", "enquiries.json");
  if (!existsSync(localPath)) return 0;

  try {
    const data = JSON.parse(readFileSync(localPath, "utf8")) as Array<{
      id: string;
      created_at: string;
    }>;

    const initialCount = data.length;
    const remaining = data.filter((item) => {
      const itemDate = new Date(item.created_at);
      return itemDate >= cutoffDate;
    });

    const deleted = initialCount - remaining.length;
    writeFileSync(localPath, JSON.stringify(remaining, null, 2));
    return deleted;
  } catch (err) {
    console.warn("[cleanup] Local fallback cleanup notice:", err);
    return 0;
  }
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`RETENTION CLEANUP (7-DAY POLICY) — enquiries + appointments`);
  console.log(`Cutoff timestamp: ${cutoffIso}`);
  console.log(`======================================================\n`);

  const { enquiries: enquiriesDeleted, appointments: appointmentsDeleted } =
    await cleanupSupabase();
  const localDeleted = cleanupLocal();

  console.log(`✓ Supabase enquiries removed:    ${enquiriesDeleted}`);
  console.log(`✓ Supabase appointments removed: ${appointmentsDeleted}`);
  console.log(`✓ Local fallback records removed: ${localDeleted}`);
  console.log(
    `\nTotal rows older than ${RETENTION_DAYS} days removed: ${
      enquiriesDeleted + appointmentsDeleted + localDeleted
    }`
  );
  console.log(`✅ Retention cleanup complete.\n`);
}

main().catch((err) => {
  console.error("Fatal error during retention cleanup:", err);
  process.exit(1);
});
