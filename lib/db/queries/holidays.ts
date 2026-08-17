import { and, asc, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { companyHolidays } from "@/lib/db/schema";

export function listHolidays() {
  return db.query.companyHolidays.findMany({
    orderBy: [asc(companyHolidays.date)],
  });
}

export function getHolidaysInRange(startDateISO: string, endDateISO: string) {
  return db.query.companyHolidays.findMany({
    where: and(gte(companyHolidays.date, startDateISO), lte(companyHolidays.date, endDateISO)),
    orderBy: [asc(companyHolidays.date)],
  });
}
