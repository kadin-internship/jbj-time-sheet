"use client";

import { useState, useTransition } from "react";
import { setProjectActiveAction, updateProjectBudgetAction } from "@/app/admin/projects/actions";
import { AlertBadge } from "@/components/shared/AlertBadge";

export function ProjectRow({
  id,
  name,
  isActive,
  budgetHours,
  actualHours,
}: {
  id: string;
  name: string;
  isActive: boolean;
  budgetHours: number | null;
  actualHours: number;
}) {
  const [pending, startTransition] = useTransition();
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budgetHours?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);

  const overBudget = budgetHours !== null && actualHours > budgetHours;
  const percent = budgetHours ? Math.round((actualHours / budgetHours) * 100) : null;

  function saveBudget() {
    const value = budgetInput.trim() === "" ? null : Number(budgetInput);
    startTransition(async () => {
      setError(null);
      const result = await updateProjectBudgetAction(id, value);
      if (result.error) setError(result.error);
      else setEditingBudget(false);
    });
  }

  return (
    <div
      data-testid="project-row"
      data-name={name}
      className="flex flex-col gap-2 rounded-md border border-brand-rose/40 px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      <div className="flex flex-wrap items-center gap-3">
        {editingBudget ? (
          <>
            <input
              type="number"
              min={0}
              step={0.5}
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="No budget"
              className="h-10 w-32 rounded-md border border-brand-rose/50 px-3 text-base"
            />
            <button
              type="button"
              disabled={pending}
              onClick={saveBudget}
              className="h-10 rounded-md bg-brand-red px-4 text-base font-semibold text-brand-white hover:bg-brand-maroon disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingBudget(false);
                setBudgetInput(budgetHours?.toString() ?? "");
              }}
              className="h-10 rounded-md border-2 border-brand-gray px-4 text-base font-semibold text-brand-gray hover:bg-brand-gray hover:text-brand-white"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <span className="text-base text-brand-gray">
              {actualHours.toFixed(2)} hrs logged
              {budgetHours !== null && ` / ${budgetHours.toFixed(2)} hrs budget (${percent}%)`}
            </span>
            {overBudget && <AlertBadge>Over Budget</AlertBadge>}
            <button
              type="button"
              onClick={() => setEditingBudget(true)}
              className="h-9 rounded-md border-2 border-brand-gray px-3 text-sm font-semibold text-brand-gray hover:bg-brand-gray hover:text-brand-white"
            >
              {budgetHours === null ? "Set Budget" : "Edit Budget"}
            </button>
          </>
        )}
      </div>
      {error && <p className="text-sm font-medium text-brand-red">{error}</p>}
    </div>
  );
}
