import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;

export function getUserByUsername(username: string) {
  return db.query.users.findFirst({
    where: eq(users.username, username.toLowerCase()),
  });
}

export function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export function listUsers() {
  return db.query.users.findMany({
    orderBy: (u, { asc }) => [asc(u.fullName)],
  });
}

export async function recordFailedLogin(userId: string) {
  const [row] = await db
    .update(users)
    .set({
      failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
    })
    .where(eq(users.id, userId))
    .returning({ failedLoginAttempts: users.failedLoginAttempts });

  if (row && row.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    // Computed as an interval added to the database's own now() rather than the app server's
    // Date.now() — the two can drift (especially in local dev), and a lockout expiry computed
    // from the wrong clock can end up far longer or shorter than LOCKOUT_MINUTES actually implies.
    await db
      .update(users)
      .set({ lockedUntil: sql`now() + interval '${sql.raw(String(LOCKOUT_MINUTES))} minutes'` })
      .where(eq(users.id, userId));
  }
}

export async function resetFailedLogin(userId: string) {
  await db
    .update(users)
    .set({ failedLoginAttempts: 0, lockedUntil: null })
    .where(eq(users.id, userId));
}
