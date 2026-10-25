"use client";

import { FormMessage, PendingProvider, SubmitButton, useActionSubmit } from "./forms";
import { btnDanger, btnSoft, inputCls, labelCls } from "./styles";
import { deleteLink, moveLink, saveLink } from "@/app/admin/(portal)/links/actions";

export type LinkRowData = { id: string; kind: "social" | "button"; label: string; url: string | null; action: string; visible: boolean };

const CORE = ["about", "services", "contact", "stories"];

export function LinkRow({ link, first, last }: { link: LinkRowData; first: boolean; last: boolean }) {
  const { state, pending, onSubmit } = useActionSubmit(saveLink.bind(null, link.id));
  const isCore = CORE.includes(link.action);
  const note =
    link.action === "about" ? "Opens the About text in place" :
    link.action === "services" ? "Opens the Services list in place" :
    link.action === "contact" ? "Opens the contact form" :
    link.action === "stories" ? "Goes to the testimonials page" : null;

  return (
    <li className="rounded-2xl border border-leaf-400/30 bg-white p-4">
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1.6fr_auto] sm:items-end">
        <label className="block">
          <span className={labelCls}>Label</span>
          <input name="label" defaultValue={link.label} required className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Link</span>
          {isCore ? <p className="rounded-xl bg-mint-50 px-3.5 py-2.5 text-sm text-ink-soft">{note}</p> : <input name="url" defaultValue={link.url ?? ""} required className={inputCls} />}
        </label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="visible" defaultChecked={link.visible} className="size-5 accent-[#2f6b45]" /> Show
          </label>
          <PendingProvider pending={pending}><SubmitButton>Save</SubmitButton></PendingProvider>
        </div>
        <div className="sm:col-span-3"><FormMessage state={state} /></div>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-leaf-400/20 pt-3">
        <form action={moveLink.bind(null, link.id, "up")}><button disabled={first} className={`${btnSoft} !min-h-9 !px-3`} aria-label="Move up">↑ Up</button></form>
        <form action={moveLink.bind(null, link.id, "down")}><button disabled={last} className={`${btnSoft} !min-h-9 !px-3`} aria-label="Move down">↓ Down</button></form>
        {link.kind === "button" && !isCore && (
          <form action={deleteLink.bind(null, link.id)} className="ml-auto"><button className={`${btnDanger} !min-h-9 !px-3`}>Delete</button></form>
        )}
      </div>
    </li>
  );
}
