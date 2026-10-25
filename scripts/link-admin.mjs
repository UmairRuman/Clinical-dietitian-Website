// Usage: node --env-file=.env.local scripts/link-admin.mjs <email>
// Finds the Supabase Auth user by email and registers them in admin_users.
const [, , email] = process.argv;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!email || !url || !key) throw new Error("Need email arg plus NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
const h = { apikey: key, "Content-Type": "application/json" };

const users = await (await fetch(`${url}/auth/v1/admin/users?per_page=200`, { headers: h })).json();
const user = users.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) throw new Error(`No auth user with email ${email}. Response: ${JSON.stringify(users).slice(0, 200)}`);

const res = await fetch(`${url}/rest/v1/admin_users?on_conflict=user_id`, {
  method: "POST",
  headers: { ...h, Prefer: "resolution=merge-duplicates,return=representation" },
  body: JSON.stringify({ user_id: user.id, role: "admin" }),
});
console.log("admin_users:", res.status, await res.text());
console.log("email confirmed:", Boolean(user.email_confirmed_at));
