"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { login, requestPasswordReset, updatePassword, type AuthState } from "@/app/admin/actions";
import { FormMessage, PendingProvider, SubmitButton, useActionSubmit } from "./forms";
import { inputCls, labelCls } from "./styles";

export function AuthCard({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-[420px]">
        <p className="text-center font-display text-[22px] font-semibold text-forest-900">Dn. Bushra Naseem</p>
        <p className="mt-1 text-center text-[12px] font-bold uppercase tracking-[0.24em] text-forest-700/70">Admin portal</p>
        <div className="mt-8 rounded-[28px] border border-leaf-400/30 bg-paper p-7 shadow-[0_30px_60px_-34px_rgba(36,85,58,0.55)] sm:p-9">
          <h1 className="font-display text-[28px] text-forest-900">{title}</h1>
          {intro && <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{intro}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className={labelCls}>{label}</span>
    {children}
  </label>
);

export function LoginForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const { state, pending, onSubmit } = useActionSubmit<AuthState>(login);
  return (
    <form onSubmit={onSubmit} className="space-y-4"><PendingProvider pending={pending}>
      {linkError && <p className="rounded-xl bg-[#fbeee9] px-4 py-2.5 text-sm text-[#a23b22]">That link has expired. Request a new one.</p>}
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email">
        <input name="email" type="email" required autoComplete="username" className={inputCls} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending="Signing in…" className="w-full">Sign in</SubmitButton>
      <p className="text-center text-sm">
        <Link href="/admin/forgot" className="font-semibold text-forest-700 underline decoration-leaf-400 underline-offset-4">Forgot password?</Link>
      </p>
    </PendingProvider></form>
  );
}

export function ForgotForm() {
  const { state, pending, onSubmit } = useActionSubmit<AuthState>(requestPasswordReset);
  return (
    <form onSubmit={onSubmit} className="space-y-4"><PendingProvider pending={pending}>
      <Field label="Admin email">
        <input name="email" type="email" required autoComplete="username" className={inputCls} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending="Sending…" className="w-full">Send reset link</SubmitButton>
      <p className="text-center text-sm">
        <Link href="/admin/login" className="font-semibold text-forest-700 underline decoration-leaf-400 underline-offset-4">Back to sign in</Link>
      </p>
    </PendingProvider></form>
  );
}

export function ResetForm() {
  const { state, pending, onSubmit } = useActionSubmit<AuthState>(updatePassword);
  return (
    <form onSubmit={onSubmit} className="space-y-4"><PendingProvider pending={pending}>
      <Field label="New password">
        <input name="password" type="password" required minLength={10} autoComplete="new-password" className={inputCls} />
      </Field>
      <Field label="Confirm password">
        <input name="confirm" type="password" required minLength={10} autoComplete="new-password" className={inputCls} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full">Update password</SubmitButton>
    </PendingProvider></form>
  );
}
