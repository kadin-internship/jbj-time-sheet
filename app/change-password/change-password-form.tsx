"use client";

import { useActionState } from "react";
import { changePasswordAction } from "./actions";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="newPassword" className="text-lg font-medium text-brand-gray">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="h-14 rounded-md border border-brand-rose/50 px-4 text-lg focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-lg font-medium text-brand-gray">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
        {pending ? "Saving..." : "Set Password"}
      </button>
    </form>
  );
}
