import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Anonymous client (publishable key). Safe inside `use cache` scopes: it never touches cookies.
 * Row Level Security limits it to public content and the public_submissions view.
 */
export function createPublicClient() {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
