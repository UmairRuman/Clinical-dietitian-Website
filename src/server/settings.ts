import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const DAYS = [
  ["mon", "Monday"],
  ["tue", "Tuesday"],
  ["wed", "Wednesday"],
  ["thu", "Thursday"],
  ["fri", "Friday"],
  ["sat", "Saturday"],
  ["sun", "Sunday"],
] as const;
export type DayKey = (typeof DAYS)[number][0];

export type WorkingHours = Record<DayKey, { open: boolean; start: string; end: string }>;
export type MeetingDefaults = Partial<Record<"teams" | "zoom" | "google_meet" | "whatsapp" | "office", string>>;

export type AppSettings = {
  notificationEmail: string;
  workingHours: WorkingHours;
  daysOff: string[];
  bufferMin: number;
  durations: number[];
  meetingDefaults: MeetingDefaults;
  cardText: string;
};

const defaultHours = (): WorkingHours => ({
  mon: { open: true, start: "10:00", end: "18:00" },
  tue: { open: true, start: "10:00", end: "18:00" },
  wed: { open: true, start: "10:00", end: "18:00" },
  thu: { open: true, start: "10:00", end: "18:00" },
  fri: { open: true, start: "10:00", end: "18:00" },
  sat: { open: true, start: "10:00", end: "14:00" },
  sun: { open: false, start: "10:00", end: "14:00" },
});

export async function getSettings(): Promise<AppSettings> {
  const { data } = await createAdminClient().from("settings").select("*").eq("id", 1).maybeSingle();
  const hours = { ...defaultHours(), ...((data?.working_hours as Partial<WorkingHours>) ?? {}) };
  return {
    notificationEmail: data?.notification_email ?? "naseembushra383@gmail.com",
    workingHours: hours,
    daysOff: (data?.days_off as string[]) ?? [],
    bufferMin: data?.buffer_min ?? 10,
    durations: data?.durations?.length ? data.durations : [30, 45, 60],
    meetingDefaults: (data?.meeting_defaults as MeetingDefaults) ?? {},
    cardText: data?.card_text ?? "Please join 5 minutes early.",
  };
}
