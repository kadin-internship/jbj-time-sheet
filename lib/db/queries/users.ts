import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

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
