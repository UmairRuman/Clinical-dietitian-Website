// Everything is shown in Pakistan Standard Time (UTC+5, no daylight saving). Stored as UTC.
export const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
export const TZ = "Asia/Karachi";

export type PktParts = { y: number; m: number; d: number; h: number; min: number; dow: number };

/** Calendar fields of an instant as seen in Pakistan (m is 1-12, dow 0=Sunday). */
export function pktParts(date: Date): PktParts {
  const s = new Date(date.getTime() + PKT_OFFSET_MS);
  return { y: s.getUTCFullYear(), m: s.getUTCMonth() + 1, d: s.getUTCDate(), h: s.getUTCHours(), min: s.getUTCMinutes(), dow: s.getUTCDay() };
}

/** The instant for a wall-clock time in Pakistan. */
export function fromPkt(y: number, m: number, d: number, h = 0, min = 0): Date {
  return new Date(Date.UTC(y, m - 1, d, h, min) - PKT_OFFSET_MS);
}

export function pktDayRange(date: Date): { start: Date; end: Date } {
  const p = pktParts(date);
  const start = fromPkt(p.y, p.m, p.d);
  return { start, end: new Date(start.getTime() + 86_400_000) };
}

export const pad = (n: number) => String(n).padStart(2, "0");
export const pktDateKey = (date: Date) => {
  const p = pktParts(date);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
};
/** "2026-10-14" + "15:30" in Pakistan -> Date */
export function parsePkt(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return fromPkt(y, m, d, h, min);
}

export const fmtDate = (d: Date | string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...opts }).format(new Date(d));
export const fmtTime = (d: Date | string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(d));
export const fmtDateTime = (d: Date | string) => `${fmtDate(d)}, ${fmtTime(d)}`;

// ───────────── date-key arithmetic (YYYY-MM-DD in Pakistan time) ─────────────
const keyToUtc = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const utcToKey = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

export const addDaysKey = (key: string, n: number) => utcToKey(new Date(keyToUtc(key).getTime() + n * 86_400_000));
export const addMonthsKey = (key: string, n: number) => {
  const d = keyToUtc(key);
  return utcToKey(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)));
};
/** 0 = Monday ... 6 = Sunday */
export const keyDow = (key: string) => (keyToUtc(key).getUTCDay() + 6) % 7;
export const weekStartKey = (key: string) => addDaysKey(key, -keyDow(key));
export const monthStartKey = (key: string) => `${key.slice(0, 7)}-01`;
export const isDateKey = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
export const keyStartInstant = (key: string) => parsePkt(key, "00:00");
export const keyLabel = (key: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(keyToUtc(key));
