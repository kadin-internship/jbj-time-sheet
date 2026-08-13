"use client";

import { useTransition } from "react";
import { setProjectActiveAction } from "@/app/admin/projects/actions";

export function ProjectRow({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      data-testid="project-row"
      data-name={name}
      className="flex items-center justify-between rounded-md border border-brand-rose/40 px-4 py-3"
    >
      <span className="text-lg text-brand-gray">
        {name}
        {!isActive && <span className="ml-2 text-base text-brand-gray">(inactive)</span>}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => setProjectActiveAction(id, !isActive))}
        className="h-10 rounded-md border-2 border-brand-gray px-4 text-base font-semibold text-brand-gray hover:bg-brand-gray hover:text-brand-white disabled:opacity-60"
      >
        {isActive ? "Deactivate" : "Reactivate"}
      </button>
    </div>
  );
}
