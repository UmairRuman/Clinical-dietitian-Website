"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAuthClient } from "@/lib/supabase/server";
import { getAdmin } from "@/server/auth";
import { clientIp, rateLimit } from "@/server/rate-limit";

export type AuthState = { error?: string; message?: string } | null;

const safeNext = (n: unknown) => (typeof n === "string" && n.startsWith("/admin") && !n.startsWith("//") ? n : "/admin");

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter your email and password." };

  const ip = await clientIp();
  const allowed =
    (await rateLimit(`login:ip:${ip}`, 20, 900)) && (await rateLimit(`login:email:${parsed.data.email.toLowerCase()}`, 8, 900));
  if (!allowed) return { error: "Too many attempts. Please wait 15 minutes and try again." };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Incorrect email or password." };

  if (!(await getAdmin())) {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = z.string().trim().email().safeParse(formData.get("email"));
  const generic = { message: "If that email belongs to an admin account, a reset link is on its way." };
  if (!parsed.success) return { error: "Enter a valid email address." };

  const ip = await clientIp();
  if (!(await rateLimit(`reset:ip:${ip}`, 5, 3600)) || !(await rateLimit(`reset:email:${parsed.data.toLowerCase()}`, 3, 3600))) return generic;

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const supabase = await createAuthClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${origin}/admin/auth/callback?next=/admin/reset` });
  return generic;
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = z
    .object({ password: z.string().min(10, "Use at least 10 characters."), confirm: z.string() })
    .refine((v) => v.password === v.confirm, { message: "Passwords do not match.", path: ["confirm"] })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your reset link has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  redirect("/admin");
}
