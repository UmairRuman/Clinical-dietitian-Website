"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rescheduleAppointment } from "@/app/admin/(portal)/bookings/actions";
import { sourceLabel, type CalEvent, type CalView } from "@/lib/bookings";
import { addDaysKey, addMonthsKey, fmtDateTime, fmtTime, keyDow, keyLabel, monthStartKey, parsePkt, pktDateKey, pktParts, weekStartKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const START_H = 6;
const END_H = 23;
const ROW = 52; // px per hour
const SNAP = 15;
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const tone: Record<string, string> = {
  scheduled: "bg-leaf-300 text-forest-900 border-leaf-500/60",
  confirmed: "bg-forest-700 text-white border-forest-800",
  completed: "bg-sand text-forest-900 border-[#d9cdb0]",
  no_show: "bg-[#f7dccd] text-[#7a3a1e] border-[#e7b79c]",
  cancelled: "bg-white text-ink-soft border-dashed border-ink-soft/40 line-through",
};

type Props = { view: CalView; focus: string; events: CalEvent[]; daysOff: string[]; today: string };

export function Calendar({ view, focus, events, daysOff, today }: Props) {
  const router = useRouter();
  const [, start] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);

  const byDay = new Map<string, CalEvent[]>();
  for (const e of events) {
    const k = pktDateKey(new Date(e.start));
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  }
  for (const list of byDay.values()) list.sort((a, b) => +new Date(a.start) - +new Date(b.start));

  const href = (extra: Record<string, string> = {}, v: CalView = view, d = focus) => `/admin/bookings?${new URLSearchParams({ view: v, date: d, ...extra })}`;
  const stepKey = (dir: -1 | 1) => (view === "month" ? addMonthsKey(focus, dir) : view === "week" ? addDaysKey(focus, 7 * dir) : addDaysKey(focus, (view === "list" ? 30 : 1) * dir));

  const title =
    view === "month" ? keyLabel(monthStartKey(focus), { month: "long", year: "numeric" })
    : view === "week" ? `${keyLabel(weekStartKey(focus), { day: "numeric", month: "short" })} - ${keyLabel(addDaysKey(weekStartKey(focus), 6), { day: "numeric", month: "short", year: "numeric" })}`
    : view === "day" ? keyLabel(focus, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : `From ${keyLabel(focus, { day: "numeric", month: "short", year: "numeric" })}`;

  function move(ev: CalEvent, target: Date) {
    if (+target === +new Date(ev.start)) return;
    if (!window.confirm(`Move ${ev.name} to ${fmtDateTime(target)}?`)) return;
    start(async () => {
      let res = await rescheduleAppointment(ev.id, target.toISOString(), false);
      if (!res.ok && res.conflicts) {
        if (!window.confirm(`${res.conflicts.join("\n")}\n\nMove anyway?`)) return;
        res = await rescheduleAppointment(ev.id, target.toISOString(), true);
      }
      if (!res.ok) window.alert(res.error ?? "Could not move the appointment.");
      else router.refresh();
    });
  }
  const findEv = (id: string | null) => events.find((e) => e.id === id);

  const chip = (e: CalEvent, compact = true) => (
    <Link
      key={e.id}
      href={href({ edit: e.id })}
      draggable={e.status !== "cancelled"}
      onDragStart={(ev) => { ev.dataTransfer.setData("text/plain", e.id); setDragId(e.id); }}
      onDragEnd={() => setDragId(null)}
      title={`${e.name} · ${fmtTime(e.start)} · ${sourceLabel(e.source)}`}
      className={cn("block truncate rounded-md border px-1.5 py-0.5 text-[12px] font-semibold leading-tight", tone[e.status] ?? tone.scheduled, dragId === e.id && "opacity-40")}
    >
      {compact && <span className="opacity-80">{fmtTime(e.start).replace(" ", "")} </span>}{e.name}
    </Link>
  );

  // ───────────── month ─────────────
  const monthGrid = () => {
    const first = weekStartKey(monthStartKey(focus));
    const cells = Array.from({ length: 42 }, (_, i) => addDaysKey(first, i));
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b border-leaf-400/25 text-center text-[12px] font-bold uppercase tracking-wider text-forest-700">
            {DOW.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((k) => {
              const inMonth = k.slice(0, 7) === focus.slice(0, 7);
              const list = (byDay.get(k) ?? []).filter((e) => e.status !== "cancelled");
              return (
                <div
                  key={k}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const ev = findEv(e.dataTransfer.getData("text/plain"));
                    setDragId(null);
                    if (!ev) return;
                    const p = pktParts(new Date(ev.start));
                    move(ev, parsePkt(k, `${String(p.h).padStart(2, "0")}:${String(p.min).padStart(2, "0")}`));
                  }}
                  className={cn("min-h-[104px] border-b border-r border-leaf-400/20 p-1.5", !inMonth && "bg-mint-50/70", daysOff.includes(k) && "bg-[#f6efe0]")}
                >
                  <div className="flex items-center justify-between">
                    <Link href={href({ new: "1", at: k }, view, k)} aria-label={`New appointment on ${k}`} className={cn("grid size-7 place-items-center rounded-full text-[13px] font-semibold", k === today ? "bg-forest-700 text-white" : inMonth ? "text-forest-900 hover:bg-leaf-300" : "text-ink-soft/60 hover:bg-leaf-300")}>
                      {Number(k.slice(8))}
                    </Link>
                    {daysOff.includes(k) && <span className="text-[10px] font-bold uppercase text-[#8a6a1e]">Off</span>}
                  </div>
                  <div className="mt-1 space-y-1">
                    {list.slice(0, 3).map((e) => chip(e))}
                    {list.length > 3 && <Link href={href({}, "day", k)} className="block px-1 text-[12px] font-semibold text-forest-700 underline">+{list.length - 3} more</Link>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ───────────── week / day ─────────────
  const timeGrid = (days: string[]) => {
    const hours = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
    return (
      <div className="overflow-x-auto">
        <div className={cn(days.length > 1 ? "min-w-[760px]" : "min-w-[320px]")}>
          <div className="grid border-b border-leaf-400/25" style={{ gridTemplateColumns: `48px repeat(${days.length}, 1fr)` }}>
            <div />
            {days.map((k) => (
              <Link key={k} href={href({}, "day", k)} className={cn("py-2 text-center text-[13px] font-bold", k === today ? "text-forest-700" : "text-forest-900")}>
                {DOW[keyDow(k)]} <span className={cn("ml-0.5 inline-grid size-6 place-items-center rounded-full", k === today && "bg-forest-700 text-white")}>{Number(k.slice(8))}</span>
              </Link>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: `48px repeat(${days.length}, 1fr)` }}>
            <div>{hours.map((h) => <div key={h} style={{ height: ROW }} className="pr-2 text-right text-[11px] text-ink-soft"><span className="relative -top-2">{h % 12 || 12}{h < 12 ? "am" : "pm"}</span></div>)}</div>
            {days.map((k) => {
              const list = (byDay.get(k) ?? []).filter((e) => e.status !== "cancelled");
              const items = list.map((e) => ({ e, s: +new Date(e.start), en: +new Date(e.end) }));
              const lanes: number[] = [];
              const placed = items.map((it) => {
                let lane = lanes.findIndex((end) => end <= it.s);
                if (lane < 0) { lane = lanes.length; lanes.push(it.en); } else lanes[lane] = it.en;
                return { ...it, lane };
              });
              const n = Math.max(1, lanes.length);
              const minutesAt = (clientY: number, el: HTMLElement) => {
                const y = clientY - el.getBoundingClientRect().top;
                return Math.min(END_H * 60 - SNAP, START_H * 60 + Math.max(0, Math.floor(((y / ROW) * 60) / SNAP) * SNAP));
              };
              const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
              return (
                <div
                  key={k}
                  className={cn("relative border-l border-leaf-400/20", daysOff.includes(k) && "bg-[#f6efe0]")}
                  style={{ height: ROW * hours.length, backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${ROW - 1}px, rgba(111,176,126,.2) ${ROW - 1}px, rgba(111,176,126,.2) ${ROW}px)` }}
                  onClick={(e) => { if (e.target === e.currentTarget) router.push(href({ new: "1", at: k, time: hhmm(minutesAt(e.clientY, e.currentTarget)) }, view, k)); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const ev = findEv(e.dataTransfer.getData("text/plain"));
                    setDragId(null);
                    if (ev) move(ev, parsePkt(k, hhmm(minutesAt(e.clientY, e.currentTarget))));
                  }}
                >
                  {placed.map(({ e, lane }) => {
                    const p = pktParts(new Date(e.start));
                    const dur = (+new Date(e.end) - +new Date(e.start)) / 60000;
                    const top = Math.max(0, ((p.h * 60 + p.min - START_H * 60) / 60) * ROW);
                    return (
                      <Link
                        key={e.id}
                        href={href({ edit: e.id })}
                        draggable
                        onDragStart={(ev) => { ev.dataTransfer.setData("text/plain", e.id); setDragId(e.id); }}
                        onDragEnd={() => setDragId(null)}
                        className={cn("absolute overflow-hidden rounded-lg border px-2 py-1 text-[12px] leading-tight shadow-sm", tone[e.status] ?? tone.scheduled, dragId === e.id && "opacity-40")}
                        style={{ top, height: Math.max(24, (dur / 60) * ROW - 2), left: `calc(${(lane / n) * 100}% + 2px)`, width: `calc(${100 / n}% - 4px)` }}
                      >
                        <span className="block truncate font-bold">{e.name}</span>
                        <span className="block truncate opacity-85">{fmtTime(e.start)} · {sourceLabel(e.source)}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ───────────── list ─────────────
  const listView = () => {
    const keys = [...byDay.keys()].sort();
    if (!keys.length) return <p className="p-8 text-center text-ink-soft">No appointments in this period.</p>;
    return (
      <div className="divide-y divide-leaf-400/20">
        {keys.map((k) => (
          <div key={k} className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]">
            <p className={cn("font-display text-[18px]", k === today ? "text-forest-700" : "text-forest-900")}>{keyLabel(k, { weekday: "short", day: "numeric", month: "short" })}{k === today && " · Today"}</p>
            <ul className="space-y-2">
              {byDay.get(k)!.map((e) => (
                <li key={e.id}>
                  <Link href={href({ edit: e.id })} className={cn("flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2", tone[e.status] ?? tone.scheduled)}>
                    <span className="font-semibold">{e.name}</span>
                    <span className="text-sm opacity-90">{fmtTime(e.start)} - {fmtTime(e.end)} · {sourceLabel(e.source)} · {e.status.replace("_", " ")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const days = view === "week" ? Array.from({ length: 7 }, (_, i) => addDaysKey(weekStartKey(focus), i)) : [focus];

  return (
    <section className="overflow-hidden rounded-2xl border border-leaf-400/30 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-leaf-400/25 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <Link href={href({}, view, stepKey(-1))} aria-label="Previous" className="grid size-10 place-items-center rounded-full border border-forest-700/30 hover:bg-mint-100">‹</Link>
          <Link href={href({}, view, stepKey(1))} aria-label="Next" className="grid size-10 place-items-center rounded-full border border-forest-700/30 hover:bg-mint-100">›</Link>
          <Link href={href({}, view, today)} className="rounded-full border border-forest-700/30 px-4 py-2 text-sm font-semibold hover:bg-mint-100">Today</Link>
        </div>
        <h2 className="order-last w-full font-display text-[22px] text-forest-900 sm:order-none sm:w-auto">{title}</h2>
        <div role="tablist" className="flex rounded-full bg-mint-200/70 p-1">
          {(["month", "week", "day", "list"] as CalView[]).map((v) => (
            <Link key={v} role="tab" aria-selected={view === v} href={href({}, v)} className={cn("rounded-full px-3.5 py-1.5 text-[13px] font-semibold capitalize", view === v ? "bg-white text-forest-900 shadow-sm" : "text-forest-700")}>{v}</Link>
          ))}
        </div>
      </div>
      {view === "month" ? monthGrid() : view === "list" ? listView() : timeGrid(days)}
      <p className="border-t border-leaf-400/20 px-4 py-2 text-[12px] text-ink-soft">Times are Pakistan time. On a computer, drag an appointment to another time or day to reschedule it.</p>
    </section>
  );
}
