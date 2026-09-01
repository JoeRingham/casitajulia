"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { submitPassword } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Checking…" : "Enter"}
    </button>
  );
}

export function EnterForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(submitPassword, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <input
        type="password"
        name="password"
        autoComplete="current-password"
        autoFocus
        required
        placeholder="Password"
        className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
      />
      <SubmitButton />
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
    </form>
  );
}
