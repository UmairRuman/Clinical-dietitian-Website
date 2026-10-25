import "server-only";
import { ImageResponse } from "next/og";
import { PDFDocument } from "pdf-lib";
import { createAdminClient } from "@/lib/supabase/admin";
import { sourceLabel } from "@/lib/bookings";
import { fmtDate, fmtTime } from "@/lib/dates";
import { getSettings } from "@/server/settings";

export type CardData = {
  id: string;
  reference: string;
  version: number;
  clientName: string;
  start: Date;
  end: Date;
  durationMin: number;
  method: string;
  where: string | null;
  service: string | null;
  status: string;
  doctor: string;
  title: string;
  phone: string;
  email: string;
  note: string;
};

export async function loadCard(id: string): Promise<CardData | null> {
  const db = createAdminClient();
  const [{ data: a }, { data: p }, { data: cards }, settings] = await Promise.all([
    db.from("appointments").select("*").eq("id", id).maybeSingle(),
    db.from("profile").select("name,experience_line,contact_phone,contact_email").eq("id", 1).maybeSingle(),
    db.from("appointment_cards").select("version").eq("appointment_id", id).order("version", { ascending: false }).limit(1),
    getSettings(),
  ]);
  if (!a) return null;
  const method = a.meeting_source === "other" && a.meeting_source_other ? a.meeting_source_other : sourceLabel(a.meeting_source);
  return {
    id: a.id,
    reference: a.reference,
    version: cards?.[0]?.version ?? 1,
    clientName: a.client_name,
    start: new Date(a.starts_at),
    end: new Date(a.ends_at),
    durationMin: a.duration_min,
    method,
    where: a.meeting_source === "office" ? a.location : a.meeting_link,
    service: a.service,
    status: a.status,
    doctor: p?.name ?? "Dn. Bushra Naseem",
    title: "Clinical Dietitian",
    phone: p?.contact_phone ?? "",
    email: p?.contact_email ?? "",
    note: settings.cardText,
  };
}

const W = 1080;
const H = 1620;
const C = { forest: "#173a26", leaf: "#a8d8b0", mint: "#e4f3e6", paper: "#fbfaf4", ink: "#4d6455", clay: "#d98e6b", red: "#b4452a" };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "26px 0", borderBottom: "2px solid #dcebdd" }}>
      <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: C.ink, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", marginTop: 8, fontSize: 40, color: C.forest, fontWeight: 700, wordBreak: "break-all" }}>{value}</div>
    </div>
  );
}

export async function renderCardPng(d: CardData): Promise<Buffer> {
  const cancelled = d.status === "cancelled";
  const res = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: `linear-gradient(180deg, #f3faf3, ${C.mint})`, padding: 56, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, background: C.paper, borderRadius: 56, border: "3px solid #cfe3d2", overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", background: C.forest, padding: "56px 64px 48px" }}>
            <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, color: C.leaf, textTransform: "uppercase" }}>{d.title}</div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 68, color: "#ffffff", fontWeight: 700 }}>{d.doctor}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", padding: "44px 64px 0", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", padding: "12px 28px", borderRadius: 999, fontSize: 28, fontWeight: 700, background: cancelled ? "#fbeee9" : C.leaf, color: cancelled ? C.red : C.forest }}>
                {cancelled ? "CANCELLED" : d.status === "confirmed" ? "CONFIRMED" : "APPOINTMENT"}
              </div>
            </div>
            <div style={{ display: "flex", marginTop: 24, fontSize: 56, fontWeight: 700, color: C.forest, textDecoration: cancelled ? "line-through" : "none" }}>{d.clientName}</div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: 28, padding: "32px 36px", borderRadius: 36, background: cancelled ? "#f1f1f1" : C.mint }}>
              <div style={{ display: "flex", fontSize: 40, color: C.forest, fontWeight: 700 }}>{fmtDate(d.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
              <div style={{ display: "flex", marginTop: 10, fontSize: 84, color: cancelled ? "#777" : C.forest, fontWeight: 800 }}>{fmtTime(d.start).toUpperCase()}</div>
              <div style={{ display: "flex", marginTop: 6, fontSize: 28, color: C.ink }}>{d.durationMin} minutes · Pakistan Standard Time (PKT)</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
              <Row label="Session method" value={d.method} />
              {d.where && <Row label={d.method.toLowerCase().includes("office") || d.method.toLowerCase().includes("clinic") ? "Location" : "Meeting link"} value={d.where.replace(/^https?:\/\//, "")} />}
              {d.service && <Row label="Service" value={d.service} />}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", padding: "0 64px 48px" }}>
            {d.note && <div style={{ display: "flex", fontSize: 30, color: C.ink, marginBottom: 22, fontStyle: "italic" }}>{d.note}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px dashed #b6d4ba", paddingTop: 24 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: C.ink, textTransform: "uppercase" }}>Reference</div>
                <div style={{ display: "flex", fontSize: 38, fontWeight: 800, color: C.forest, marginTop: 4 }}>{d.reference}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: C.forest }}>{d.phone}</div>
                <div style={{ display: "flex", fontSize: 24, color: C.ink, marginTop: 4 }}>{d.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 20, color: "#8aa392" }}>Card v{d.version}{cancelled ? " · This appointment was cancelled" : ""}</div>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
  return Buffer.from(await res.arrayBuffer());
}

export async function cardToPdf(png: Buffer): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const img = await pdf.embedPng(png);
  const w = 420; // points, portrait phone-card proportions
  const h = (w * H) / W;
  const page = pdf.addPage([w, h]);
  page.drawImage(img, { x: 0, y: 0, width: w, height: h });
  return pdf.save();
}

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export function buildIcs(d: CardData): string {
  const where = d.where ?? "";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dn. Bushra Naseem//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${d.reference}@bushranaseem`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(d.start)}`,
    `DTEND:${icsDate(d.end)}`,
    `SUMMARY:${icsText(`Appointment with ${d.doctor}`)}`,
    `DESCRIPTION:${icsText(`${d.method}${where ? `\n${where}` : ""}\nReference ${d.reference}${d.note ? `\n${d.note}` : ""}`)}`,
    where ? `LOCATION:${icsText(where)}` : "",
    `STATUS:${d.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Appointment reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}
