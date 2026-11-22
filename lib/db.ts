/**
 * lib/db.ts
 *
 * Supabase server client (service role key — server-side only).
 * Never import this in client components.
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

function createSupabaseClient() {
  const rawUrl = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    );
  }
  // Strip trailing /rest/v1 if present in env
  const url = rawUrl.replace(/\/rest\/v1\/?$/, "");
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
