"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { generateTempPassword } from "@/lib/utils/password";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session;
}

const createEmployeeSchema = z.object({
  fullName: z.string().trim().min(1).max(128),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]+$/, "Username can only contain lowercase letters, numbers, . _ -")
    .min(2)
    .max(64),
  role: z.enum(["admin", "employee"]),
});

export async function createEmployeeAction(
  _prevState: { error: string | null; tempPassword: string | null },
  formData: FormData,
): Promise<{ error: string | null; tempPassword: string | null }> {
  await requireAdmin();

  const parsed = createEmployeeSchema.safeParse({
    fullName: formData.get("fullName"),
    username: formData.get("username"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input.", tempPassword: null };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.username, parsed.data.username),
  });
  if (existing) return { error: "That username is already taken.", tempPassword: null };

  const tempPassword = generateTempPassword();
  await db.insert(users).values({
    fullName: parsed.data.fullName,
    username: parsed.data.username,
    role: parsed.data.role,
    passwordHash: await bcrypt.hash(tempPassword, 12),
  });

  revalidatePath("/admin/employees");
  return { error: null, tempPassword };
}

export async function setEmployeeActiveAction(userId: string, active: boolean) {
  await requireAdmin();
  await db.update(users).set({ active }).where(eq(users.id, userId));
  revalidatePath("/admin/employees");
}

export async function resetPasswordAction(
  userId: string,
): Promise<{ error: string | null; tempPassword: string | null }> {
  await requireAdmin();
  const tempPassword = generateTempPassword();
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(tempPassword, 12) })
    .where(eq(users.id, userId));
  revalidatePath("/admin/employees");
  return { error: null, tempPassword };
}
