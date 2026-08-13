"use client";

import { useActionState } from "react";
import { createProjectAction } from "@/app/admin/projects/actions";

export function AddProjectForm() {
  const [state, formAction, pending] = useActionState(createProjectAction, { error: null });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-md border border-brand-rose/40 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-brand-gray" htmlFor="name">
          New Project Name
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="e.g. Client/Contractor"
          className="h-12 w-72 rounded-md border border-brand-rose/50 px-3 text-lg focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-md bg-brand-red px-6 text-lg font-semibold text-brand-white hover:bg-brand-maroon disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add Project"}
      </button>
      {state.error && <p className="text-base font-medium text-brand-red">{state.error}</p>}
    </form>
  );
}
