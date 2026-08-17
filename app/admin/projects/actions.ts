"use server";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { projects } from "@/lib/db/schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
}

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(128),
  budgetHours: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Budget must be a positive number."),
});

export async function createProjectAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAdmin();

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    budgetHours: formData.get("budgetHours") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const existing = await db.query.projects.findFirst({
    where: eq(projects.name, parsed.data.name),
  });
  if (existing) return { error: "A project with that name already exists." };

  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${projects.sortOrder}), 0)` })
    .from(projects);

  await db.insert(projects).values({
    name: parsed.data.name,
    sortOrder: maxOrder + 1,
    budgetHours: parsed.data.budgetHours === null ? null : parsed.data.budgetHours.toFixed(2),
  });

  revalidatePath("/admin/projects");
  return { error: null };
}

export async function setProjectActiveAction(projectId: string, isActive: boolean) {
  await requireAdmin();
  await db.update(projects).set({ isActive }).where(eq(projects.id, projectId));
  revalidatePath("/admin/projects");
}

export async function updateProjectBudgetAction(
  projectId: string,
  budgetHours: number | null,
): Promise<{ error: string | null }> {
  await requireAdmin();

  if (budgetHours !== null && (!Number.isFinite(budgetHours) || budgetHours < 0)) {
    return { error: "Budget must be a positive number." };
  }

  await db
    .update(projects)
    .set({ budgetHours: budgetHours === null ? null : budgetHours.toFixed(2) })
    .where(eq(projects.id, projectId));

  revalidatePath("/admin/projects");
  return { error: null };
}
