"use server";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { projects } from "@/lib/db/schema";

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(128),
});

export async function createProjectAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAdmin();

  const parsed = createProjectSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const existing = await db.query.projects.findFirst({
    where: eq(projects.name, parsed.data.name),
  });
  if (existing) return { error: "A project with that name already exists." };

  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${projects.sortOrder}), 0)` })
    .from(projects);

  await db.insert(projects).values({ name: parsed.data.name, sortOrder: maxOrder + 1 });

  revalidatePath("/admin/projects");
  return { error: null };
}

export async function setProjectActiveAction(projectId: string, isActive: boolean) {
  await requireAdmin();
  await db.update(projects).set({ isActive }).where(eq(projects.id, projectId));
  revalidatePath("/admin/projects");
}
