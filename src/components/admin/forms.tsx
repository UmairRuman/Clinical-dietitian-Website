"use client";

import { createContext, useActionState, useContext, useEffect, useRef, useTransition, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { btnPrimary } from "./styles";
import { cn } from "@/lib/utils";

export type ActionState = { ok?: boolean; message?: string; error?: string } | null;
type Action<S> = (prev: S, formData: FormData) => Promise<S>;

const PendingContext = createContext(false);

/**
 * Wires a server action to a <form> WITHOUT React 19's automatic field reset, which would wipe what the
 * user typed whenever the server answers with a warning or a validation error.
 */
export function useActionSubmit<S>(action: Action<S | null>) {
  const [state, dispatch] = useActionState(action as (prev: Awaited<S | null>, fd: FormData) => Promise<S | null>, null as Awaited<S | null>);
  const [pending, start] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(() => dispatch(fd));
  };
  return { state, pending, onSubmit };
}

export function PendingProvider({ pending, children }: { pending: boolean; children: ReactNode }) {
  return <PendingContext.Provider value={pending}>{children}</PendingContext.Provider>;
}

export function SubmitButton({ children, pending: pendingText = "Saving…", className }: { children: ReactNode; pending?: string; className?: string }) {
  const native = useFormStatus().pending;
  const viaContext = useContext(PendingContext);
  const pending = native || viaContext;
  return (
    <button type="submit" disabled={pending} className={cn(btnPrimary, className)}>
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state?.message && !state?.error) return null;
  return state.error ? (
    <p role="alert" className="rounded-xl bg-[#fbeee9] px-4 py-2.5 text-sm text-[#a23b22]">
      {state.error}
    </p>
  ) : (
    <p role="status" className="rounded-xl bg-mint-100 px-4 py-2.5 text-sm text-forest-800">
      {state.message}
    </p>
  );
}

/** <form> wired to a server action with inline success/error feedback. Keeps typed values on errors. */
export function ActionForm({ action, children, className, resetOnSuccess }: { action: Action<ActionState>; children: ReactNode; className?: string; resetOnSuccess?: boolean }) {
  const { state, pending, onSubmit } = useActionSubmit<ActionState>(action);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} onSubmit={onSubmit} className={className}>
      <PendingProvider pending={pending}>{children}</PendingProvider>
      <FormMessage state={state} />
    </form>
  );
}
