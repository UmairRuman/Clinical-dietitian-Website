"use client";

import { FormMessage, PendingProvider, SubmitButton, useActionSubmit } from "./forms";
import { btnDanger, btnSoft, inputCls, labelCls } from "./styles";
import { deleteFaq, moveFaq, saveFaq } from "@/app/admin/(portal)/content/actions";

export function FaqRow({ faq, first, last }: { faq: { id: string; question: string; answer: string; visible: boolean }; first: boolean; last: boolean }) {
  const { state, pending, onSubmit } = useActionSubmit(saveFaq.bind(null, faq.id));
  return (
    <li className="rounded-2xl border border-leaf-400/30 bg-white p-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block"><span className={labelCls}>Question</span><input name="question" defaultValue={faq.question} required className={inputCls} /></label>
        <label className="block"><span className={labelCls}>Answer</span><textarea name="answer" defaultValue={faq.answer} rows={3} required className={inputCls} /></label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="visible" defaultChecked={faq.visible} className="size-5 accent-[#2f6b45]" /> Show on website</label>
          <PendingProvider pending={pending}><SubmitButton>Save</SubmitButton></PendingProvider>
        </div>
        <FormMessage state={state} />
      </form>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-leaf-400/20 pt-3">
        <form action={moveFaq.bind(null, faq.id, "up")}><button disabled={first} className={`${btnSoft} !min-h-9 !px-3`}>↑ Up</button></form>
        <form action={moveFaq.bind(null, faq.id, "down")}><button disabled={last} className={`${btnSoft} !min-h-9 !px-3`}>↓ Down</button></form>
        <form action={deleteFaq.bind(null, faq.id)} className="ml-auto"><button className={`${btnDanger} !min-h-9 !px-3`}>Delete</button></form>
      </div>
    </li>
  );
}
