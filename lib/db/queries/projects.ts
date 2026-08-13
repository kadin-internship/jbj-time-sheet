import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projects } from "@/lib/db/schema";

export function listActiveProjects() {
  return db.query.projects.findMany({
    where: eq(projects.isActive, true),
    orderBy: [asc(projects.sortOrder), asc(projects.name)],
  });
}

export function listAllProjects() {
  return db.query.projects.findMany({
    orderBy: [asc(projects.sortOrder), asc(projects.name)],
  });
}
