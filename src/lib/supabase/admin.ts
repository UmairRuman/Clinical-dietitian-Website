import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

/**
 * Secret-key client: bypasses Row Level Security. Server code ONLY, and only after the caller
 * has been authorised (requireAdmin) or the input has been validated (public form actions).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !key) throw new Error("Supabase secret key is not configured");
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
