"use client";

import { useActionState } from "react";
import { createHolidayAction } from "@/app/admin/holidays/actions";

export function AddHolidayForm() {
  const [state, formAction, pending] = useActionState(createHolidayAction, { error: null });

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-md border border-brand-rose/40 p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-brand-gray" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          className="h-12 rounded-md border border-brand-rose/50 px-3 text-lg"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-brand-gray" htmlFor="name">
          Holiday Name
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="e.g. Thanksgiving"
          className="h-12 w-72 rounded-md border border-brand-rose/50 px-3 text-lg"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-md bg-brand-red px-6 text-lg font-semibold text-brand-white hover:bg-brand-maroon disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add Holiday"}
      </button>
      {state.error && <p className="text-base font-medium text-brand-red">{state.error}</p>}
    </form>
  );
}
