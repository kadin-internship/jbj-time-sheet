"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { companyHolidays } from "@/lib/db/schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
}

const createHolidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().trim().min(1).max(128),
});

export async function createHolidayAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAdmin();

  const parsed = createHolidaySchema.safeParse({
    date: formData.get("date"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const existing = await db.query.companyHolidays.findFirst({
    where: eq(companyHolidays.date, parsed.data.date),
  });
  if (existing) return { error: "A holiday is already set for that date." };

  await db.insert(companyHolidays).values(parsed.data);

  revalidatePath("/admin/holidays");
  return { error: null };
}

export async function deleteHolidayAction(holidayId: string) {
  await requireAdmin();
  await db.delete(companyHolidays).where(eq(companyHolidays.id, holidayId));
  revalidatePath("/admin/holidays");
}
