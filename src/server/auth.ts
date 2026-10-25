import "server-only";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAuthClient } from "@/lib/supabase/server";

export type Admin = { id: string; email: string; role: "admin" | "assistant" };

/** Returns the signed-in admin, or null. Reads cookies, so call it behind <Suspense> or inside actions. */
export async function getAdmin(): Promise<Admin | null> {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await createAdminClient().from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (!data) return null;
  return { id: user.id, email: user.email ?? "", role: data.role as Admin["role"] };
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For settings / deletion / security – excludes the future restricted "assistant" role. */
export async function requireFullAdmin(): Promise<Admin> {
  const admin = await requireAdmin();
  if (admin.role !== "admin") redirect("/admin");
  return admin;
}
