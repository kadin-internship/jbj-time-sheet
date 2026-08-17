"use client";

import { useActionState } from "react";
import { createPtoRequestAction } from "@/app/pto/actions";

export function PtoRequestForm() {
  const [state, formAction, pending] = useActionState(createPtoRequestAction, { error: null });

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-md border border-brand-rose/40 p-4"
    >
      <h2 className="text-xl font-bold text-brand-gray">Request Time Off</h2>

      <div className="flex flex-col gap-1">
        <span className="text-base font-medium text-brand-gray">Type</span>
        <div className="flex gap-2">
          <label className="flex h-12 items-center gap-2 rounded-md border-2 border-brand-rose/50 px-4 text-lg text-brand-gray has-[:checked]:border-brand-red has-[:checked]:bg-brand-red has-[:checked]:text-brand-white">
            <input type="radio" name="type" value="pto" defaultChecked className="h-5 w-5" />
            PTO
          </label>
          <label className="flex h-12 items-center gap-2 rounded-md border-2 border-brand-rose/50 px-4 text-lg text-brand-gray has-[:checked]:border-brand-red has-[:checked]:bg-brand-red has-[:checked]:text-brand-white">
            <input type="radio" name="type" value="sick" className="h-5 w-5" />
            Sick Time
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-brand-gray" htmlFor="startDate">
            Start Date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            className="h-12 rounded-md border border-brand-rose/50 px-3 text-lg"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium text-brand-gray" htmlFor="endDate">
            End Date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            required
            className="h-12 rounded-md border border-brand-rose/50 px-3 text-lg"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-brand-gray" htmlFor="reason">
          Reason (optional)
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={2}
          className="rounded-md border border-brand-rose/50 p-3 text-lg"
        />
      </div>

      {state.error && <p className="text-base font-medium text-brand-red">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="h-12 self-start rounded-md bg-brand-red px-6 text-lg font-semibold text-brand-white hover:bg-brand-maroon disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
