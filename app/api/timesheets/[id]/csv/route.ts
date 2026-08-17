import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTimesheetById } from "@/lib/db/queries/timesheets";
import { buildTimesheetData } from "@/lib/pdf/buildTimesheetData";
import { buildActivityDetailCsv } from "@/lib/csv/buildActivityDetailCsv";
import { buildExportFilename } from "@/lib/pdf/filename";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const timesheet = await getTimesheetById(id);
  if (!timesheet) return new NextResponse("Not found", { status: 404 });

  const isOwner = timesheet.userId === session.user.id;
  if (!isOwner && session.user.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const data = await buildTimesheetData(id);
  if (!data) return new NextResponse("Not found", { status: 404 });

  const csv = buildActivityDetailCsv(data);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${buildExportFilename(data.employeeName, "Timesheet", data.weekStartDate, "csv")}"`,
    },
  });
}
