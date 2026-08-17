"use client";

import { useState, useTransition } from "react";
import { approvePtoRequestAction, denyPtoRequestAction } from "@/app/admin/pto/actions";
import { parseDateISO } from "@/lib/utils/week";

type Request = {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
};

const TYPE_LABEL: Record<string, string> = { pto: "PTO", sick: "Sick Time" };
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
};

function fmt(dateISO: string) {
  return parseDateISO(dateISO).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PtoReviewRow({ request }: { request: Request }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-brand-rose/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-lg text-brand-gray">
          <span className="font-semibold">{request.employeeName}</span> ({TYPE_LABEL[request.type] ?? request.type})
          {", "}
          {fmt(request.startDate)} to {fmt(request.endDate)}
        </span>
        <span className="text-base font-semibold text-brand-gray">
          {STATUS_LABEL[request.status] ?? request.status}
        </span>
      </div>
      {request.reason && <p className="text-base text-brand-gray">{request.reason}</p>}
      {request.status === "pending" && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await approvePtoRequestAction(request.id);
                if (result.error) setError(result.error);
              })
            }
            className="h-10 rounded-md bg-brand-red px-4 text-base font-semibold text-brand-white hover:bg-brand-maroon disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await denyPtoRequestAction(request.id);
                if (result.error) setError(result.error);
              })
            }
            className="h-10 rounded-md border-2 border-brand-gray px-4 text-base font-semibold text-brand-gray hover:bg-brand-gray hover:text-brand-white disabled:opacity-60"
          >
            Deny
          </button>
        </div>
      )}
      {error && <p className="text-base font-medium text-brand-red">{error}</p>}
    </div>
  );
}
