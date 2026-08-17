"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { ptoRequests } from "@/lib/db/schema";
import { getPtoRequestById } from "@/lib/db/queries/pto";

const createPtoRequestSchema = z
  .object({
    type: z.enum(["pto", "sick"]),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().max(1000).optional(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  });

export async function createPtoRequestAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = createPtoRequestSchema.safeParse({
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await db.insert(ptoRequests).values({
    userId: session.user.id,
    type: parsed.data.type,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    reason: parsed.data.reason || null,
  });

  revalidatePath("/pto");
  revalidatePath("/admin/pto");
  return { error: null };
}

export async function cancelPtoRequestAction(requestId: string): Promise<{ error: string | null }> {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const request = await getPtoRequestById(requestId);
  if (!request) return { error: "Request not found." };
  if (request.userId !== session.user.id) return { error: "Not authorized." };
  if (request.status !== "pending") return { error: "Only pending requests can be cancelled." };

  await db.delete(ptoRequests).where(eq(ptoRequests.id, requestId));

  revalidatePath("/pto");
  revalidatePath("/admin/pto");
  return { error: null };
}
