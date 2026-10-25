/** Strip control characters and normalise whitespace. Output is only ever rendered as text (React escapes it). */
export function cleanText(input: string, opts: { multiline?: boolean } = {}): string {
  let s = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200E\u200F\u202A-\u202E]/g, "");
  s = s.replace(/<[^>]*>/g, "");
  s = opts.multiline ? s.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return s.trim();
}

/** What the public sees, according to the visitor's choice. */
export function publicDisplayName(name: string, pref: "full" | "first" | "anonymous"): string {
  if (pref === "anonymous") return "Anonymous";
  if (pref === "first") return name.split(/\s+/)[0] ?? name;
  return name;
}
