"use client";

import { useTransition } from "react";
import { cancelPtoRequestAction } from "@/app/pto/actions";
import { parseDateISO } from "@/lib/utils/week";

type PtoRequest = {
  id: string;
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
const STATUS_COLOR: Record<string, string> = {
  pending: "text-brand-gray",
  approved: "text-green-700",
  denied: "text-brand-red",
};

function fmt(dateISO: string) {
  return parseDateISO(dateISO).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PtoRequestList({ requests }: { requests: PtoRequest[] }) {
  const [pending, startTransition] = useTransition();

  if (requests.length === 0) {
    return <p className="text-brand-gray">You haven&apos;t requested time off yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {requests.map((r) => (
        <div key={r.id} className="flex flex-col gap-1 rounded-md border border-brand-rose/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-lg text-brand-gray">
              <span className="font-semibold">{TYPE_LABEL[r.type] ?? r.type}</span>
              {" — "}
              {fmt(r.startDate)} to {fmt(r.endDate)}
            </span>
            <span className={`text-base font-semibold ${STATUS_COLOR[r.status] ?? ""}`}>
              {STATUS_LABEL[r.status] ?? r.status}
            </span>
          </div>
          {r.reason && <p className="text-base text-brand-gray">{r.reason}</p>}
          {r.status === "pending" && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await cancelPtoRequestAction(r.id);
                })
              }
              className="mt-1 h-9 self-start rounded-md border-2 border-brand-red px-3 text-sm font-semibold text-brand-red hover:bg-brand-red hover:text-brand-white disabled:opacity-60"
            >
              Cancel Request
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
