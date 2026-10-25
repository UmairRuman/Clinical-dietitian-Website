import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminCounts() {
  const db = createAdminClient();
  const [pending, requests] = await Promise.all([
    db.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  return { pendingSubmissions: pending.count ?? 0, newRequests: requests.count ?? 0 };
}
