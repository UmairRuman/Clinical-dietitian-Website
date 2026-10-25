export const SOURCES = [
  ["teams", "Microsoft Teams"],
  ["whatsapp", "WhatsApp (call or video)"],
  ["zoom", "Zoom"],
  ["google_meet", "Google Meet"],
  ["voice_call", "Voice call"],
  ["office", "Office / clinic visit"],
  ["other", "Other"],
] as const;
export type SourceKey = (typeof SOURCES)[number][0];
export const sourceLabel = (k: string) => SOURCES.find(([v]) => v === k)?.[1] ?? k;

export const STATUSES = [
  ["scheduled", "Scheduled"],
  ["confirmed", "Confirmed"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
  ["no_show", "No-show"],
] as const;

export const SESSION_TYPES = [
  ["first_consultation", "First consultation"],
  ["follow_up", "Follow-up"],
] as const;

export type CalEvent = { id: string; name: string; start: string; end: string; status: string; source: string };
export type CalView = "month" | "week" | "day" | "list";
