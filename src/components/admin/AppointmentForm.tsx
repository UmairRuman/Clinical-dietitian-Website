"use client";

import { useState } from "react";
import { saveAppointment, type AppointmentState } from "@/app/admin/(portal)/bookings/actions";
import { SESSION_TYPES, SOURCES, STATUSES } from "@/lib/bookings";
import { FormMessage, PendingProvider, SubmitButton, useActionSubmit } from "./forms";
import { inputCls, labelCls } from "./styles";
import type { MeetingDefaults } from "@/server/settings";

export type AppointmentInitial = {
  id?: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  date: string;
  time: string;
  duration: number;
  source: string;
  sourceOther: string;
  link: string;
  location: string;
  service: string;
  sessionType: string;
  notes: string;
  status: string;
  requestId?: string;
};

export function AppointmentForm({ initial, durations, defaults, services, view }: { initial: AppointmentInitial; durations: number[]; defaults: MeetingDefaults; services: string[]; view: string }) {
  const { state, pending, onSubmit } = useActionSubmit<AppointmentState>(saveAppointment.bind(null, initial.id ?? null));
  const [source, setSource] = useState(initial.source);
  const [link, setLink] = useState(initial.link);
  const [location, setLocation] = useState(initial.location);

  const onSource = (next: string) => {
    // swap in the default for the new source only if the field is empty or still holds the previous default
    const prevDefault = defaults[source as keyof MeetingDefaults] ?? "";
    const nextDefault = defaults[next as keyof MeetingDefaults] ?? "";
    if (next === "office") {
      if (!location || location === prevDefault) setLocation(nextDefault);
    } else if (next !== "voice_call" && next !== "other") {
      if (!link || link === prevDefault) setLink(nextDefault);
    }
    setSource(next);
  };
  const online = ["teams", "zoom", "google_meet", "whatsapp"].includes(source);
  const durationOptions = durations.includes(initial.duration) ? durations : [...durations, initial.duration].sort((a, b) => a - b);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PendingProvider pending={pending}>
      <input type="hidden" name="view" value={view} />
      <input type="hidden" name="requestId" value={initial.requestId ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className={labelCls}>Client name</span><input name="clientName" defaultValue={initial.clientName} required className={inputCls} /></label>
        <label className="block"><span className={labelCls}>Phone / WhatsApp</span><input name="clientPhone" type="tel" defaultValue={initial.clientPhone} required className={inputCls} /></label>
        <label className="block sm:col-span-2"><span className={labelCls}>Client email (optional)</span><input name="clientEmail" type="email" defaultValue={initial.clientEmail} className={inputCls} /></label>
        <label className="block sm:col-span-2"><span className={labelCls}>Date</span><input name="date" type="date" defaultValue={initial.date} required className={inputCls} /></label>
        <div className="grid grid-cols-2 gap-3 sm:col-span-2">
          <label className="block"><span className={labelCls}>Start time</span><input name="time" type="time" defaultValue={initial.time} required className={inputCls} /></label>
          <label className="block"><span className={labelCls}>Length</span>
            <select name="duration" defaultValue={initial.duration} className={inputCls}>{durationOptions.map((d) => <option key={d} value={d}>{d} min</option>)}</select></label>
        </div>
        <label className="block"><span className={labelCls}>Meeting source</span>
          <select name="source" value={source} onChange={(e) => onSource(e.target.value)} className={inputCls}>{SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        {source === "other" ? (
          <label className="block"><span className={labelCls}>Describe</span><input name="sourceOther" defaultValue={initial.sourceOther} className={inputCls} /></label>
        ) : (
          <label className="block"><span className={labelCls}>Session type</span>
            <select name="sessionType" defaultValue={initial.sessionType} className={inputCls}><option value="">Not set</option>{SESSION_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        )}
        {online && <label className="block sm:col-span-2"><span className={labelCls}>Meeting link</span><input name="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" className={inputCls} /></label>}
        {source === "office" && <label className="block sm:col-span-2"><span className={labelCls}>Clinic address</span><input name="location" value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} /></label>}
        {source === "other" && <label className="block sm:col-span-2"><span className={labelCls}>Link or location</span><input name="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://… (optional)" className={inputCls} /></label>}
        <label className="block"><span className={labelCls}>Service / concern</span>
          <select name="service" defaultValue={initial.service} className={inputCls}><option value="">Not set</option>{services.map((s) => <option key={s} value={s}>{s}</option>)}<option value="Other">Other</option></select></label>
        <label className="block"><span className={labelCls}>Status</span>
          <select name="status" defaultValue={initial.status} className={inputCls}>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        {source === "other" && <input type="hidden" name="sessionType" value={initial.sessionType} />}
        {source !== "other" && <input type="hidden" name="sourceOther" value="" />}
        {source !== "office" && <input type="hidden" name="location" value="" />}
        {(source === "voice_call" || source === "office") && <input type="hidden" name="link" value="" />}
        <label className="block sm:col-span-2"><span className={labelCls}>Internal notes (only you see these)</span><textarea name="notes" rows={3} defaultValue={initial.notes} className={inputCls} /></label>
      </div>

      {state?.needsOverride && (
        <label className="flex items-start gap-3 rounded-xl bg-[#fdf1d8] p-3 text-sm text-[#6e4700]">
          <input type="checkbox" name="override" className="mt-0.5 size-5 accent-[#2f6b45]" />
          <span><strong>Book anyway.</strong> Tick this box to save despite the warning above.</span>
        </label>
      )}
      <FormMessage state={state} />
      <SubmitButton>{initial.id ? "Save changes" : "Create appointment"}</SubmitButton>
      </PendingProvider>
    </form>
  );
}
