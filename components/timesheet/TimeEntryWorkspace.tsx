"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TimeEntryForm, type TimeEntryFormValues, type TimeEntryRecord } from "./TimeEntryForm";
import { TimeEntryList } from "./TimeEntryList";
import { AggregateGridView } from "./AggregateGridView";
import {
  createTimeEntryAction,
  deleteTimeEntryAction,
  updateTimeEntryAction,
} from "@/app/timesheet-actions";

type Project = { id: string; name: string };
type WeekDate = { date: string; label: string };

export function TimeEntryWorkspace({
  timesheetId,
  projects,
  weekDates,
  initialEntries,
}: {
  timesheetId: string;
  projects: Project[];
  weekDates: WeekDate[];
  initialEntries: TimeEntryRecord[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [formState, setFormState] = useState<{
    mode: "create" | "edit" | "duplicate";
    initialValues: TimeEntryFormValues | null;
    editingId: string | null;
  }>({ mode: "create", initialValues: null, editingId: null });

  function resetForm() {
    setFormState({ mode: "create", initialValues: null, editingId: null });
    setFormKey((k) => k + 1);
  }

  function handleEdit(entry: TimeEntryRecord) {
    setError(null);
    setFormKey((k) => k + 1);
    setFormState({
      mode: "edit",
      editingId: entry.id,
      initialValues: {
        projectId: entry.projectId,
        entryDate: entry.entryDate,
        startTime: entry.startTime ?? "",
        endTime: entry.endTime ?? "",
        activityType: entry.activityType ?? "project_work",
        notes: entry.notes ?? "",
      },
    });
  }

  function handleDuplicate(entry: TimeEntryRecord) {
    setError(null);
    setFormKey((k) => k + 1);
    setFormState({
      mode: "duplicate",
      editingId: null,
      initialValues: {
        projectId: entry.projectId,
        entryDate: entry.entryDate,
        startTime: "",
        endTime: "",
        activityType: entry.activityType ?? "project_work",
        notes: entry.notes ?? "",
      },
    });
  }

  function handleSubmit(values: TimeEntryFormValues) {
    setError(null);
    startTransition(async () => {
      const result =
        formState.mode === "edit" && formState.editingId
          ? await updateTimeEntryAction(formState.editingId, { timesheetId, ...values })
          : await createTimeEntryAction({ timesheetId, ...values });

      if (result.error) {
        setError(result.error);
        return;
      }
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(entryId: string) {
    setError(null);
    setDeletingId(entryId);
    startTransition(async () => {
      const result = await deleteTimeEntryAction(entryId);
      setDeletingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (formState.editingId === entryId) resetForm();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <TimeEntryForm
        key={formKey}
        projects={projects}
        weekDates={weekDates}
        existingEntries={initialEntries}
        mode={formState.mode === "duplicate" ? "create" : formState.mode}
        initialValues={formState.initialValues}
        pending={pending}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />
      {error && <p className="text-base font-medium text-brand-red">{error}</p>}

      <TimeEntryList
        entries={initialEntries}
        projects={projects}
        weekDates={weekDates}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-brand-gray">Summary</h2>
        <AggregateGridView entries={initialEntries} projects={projects} weekDates={weekDates} />
      </div>
    </div>
  );
}
