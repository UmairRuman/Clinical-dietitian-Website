"use client";

import type { ButtonHTMLAttributes } from "react";

/** Submit button that asks "are you sure?" before the form posts. */
export function ConfirmButton({ message, children, ...rest }: { message: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
        else rest.onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
