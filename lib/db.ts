/**
 * lib/db.ts
 *
 * Supabase server client (service role key — server-side only).
 * Never import this in client components.
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

function createSupabaseClient() {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// Export a lazy singleton — only constructed when first called.
let _client: ReturnType<typeof createSupabaseClient> | null = null;

export function db() {
  if (!_client) _client = createSupabaseClient();
  return _client;
}
