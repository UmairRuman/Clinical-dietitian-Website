"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireFullAdmin } from "@/server/auth";

const refresh = () => {
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
};

export async function setRequestStatus(id: string, status: "new" | "closed"): Promise<void> {
  await requireAdmin();
  await createAdminClient().from("booking_requests").update({ status }).eq("id", id);
  refresh();
}

export async function deleteRequest(id: string): Promise<void> {
  await requireFullAdmin();
  await createAdminClient().from("booking_requests").delete().eq("id", id);
  refresh();
}
