"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(loginAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-lg font-medium text-brand-gray">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoFocus
          autoComplete="username"
          className="h-14 rounded-md border border-brand-rose/50 px-4 text-lg focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-lg font-medium text-brand-gray">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-14 rounded-md border border-brand-rose/50 px-4 text-lg focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-base font-medium text-brand-red">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-14 rounded-md bg-brand-red text-lg font-semibold text-brand-white transition-colors hover:bg-brand-maroon disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Log In"}
      </button>
    </form>
  );
}
