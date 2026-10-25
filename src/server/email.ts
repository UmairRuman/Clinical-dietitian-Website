import "server-only";

type Attachment = { filename: string; content: Buffer };

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Small branded wrapper so every email looks like it comes from the same place. */
export function emailLayout(title: string, rows: [string, string][], footer?: string) {
  const body = rows
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#4d6455;font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;font-size:15px;color:#173a26">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("");
  return `<div style="font-family:Segoe UI,Arial,sans-serif;background:#f3faf3;padding:24px">
  <div style="max-width:560px;margin:auto;background:#fbfaf4;border-radius:20px;padding:28px;border:1px solid #cfe3d2">
    <p style="margin:0;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#2f6b45;font-weight:700">Dn. Bushra Naseem</p>
    <h1 style="margin:8px 0 16px;font-size:22px;color:#173a26">${escapeHtml(title)}</h1>
    <table style="border-collapse:collapse;width:100%">${body}</table>
    ${footer ? `<p style="margin:20px 0 0;font-size:13px;color:#4d6455">${escapeHtml(footer)}</p>` : ""}
  </div></div>`;
}

/**
 * Sends through Resend when RESEND_API_KEY is set. Otherwise logs a one-line notice and returns false,
 * so forms keep working in development. Never throws: a failed email must not lose the enquiry.
 */
export async function sendEmail(opts: { to: string; subject: string; html: string; replyTo?: string; attachments?: Attachment[] }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email] RESEND_API_KEY not set - skipped "${opts.subject}" to ${opts.to}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Dn. Bushra Naseem <onboarding@resend.dev>",
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo,
        attachments: opts.attachments?.map((a) => ({ filename: a.filename, content: a.content.toString("base64") })),
      }),
    });
    if (!res.ok) {
      console.warn("[email] Resend error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[email] send failed", err instanceof Error ? err.message : err);
    return false;
  }
}
