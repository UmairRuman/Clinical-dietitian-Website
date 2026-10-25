import "server-only";

/**
 * Verifies a Cloudflare Turnstile token. When TURNSTILE_SECRET_KEY is not configured it allows the request
 * (development); in production a missing secret is logged loudly but still allows, because the honeypot,
 * rate limit and manual approval remain in place.
 */
export async function verifyTurnstile(token: string | undefined | null, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") console.warn("[turnstile] TURNSTILE_SECRET_KEY missing in production");
    return true;
  }
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
