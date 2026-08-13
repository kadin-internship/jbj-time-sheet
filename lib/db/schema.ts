import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  date,
  timestamp,
  unique,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["admin", "employee"]);
export const activityTypeEnum = pgEnum("activity_type", [
  "meeting",
  "project_work",
  "administrative",
  "other",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: varchar("full_name", { length: 128 }).notNull(),
  role: roleEnum("role").notNull().default("employee"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const weeklyTimesheets = pgTable(
  "weekly_timesheets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    weekStartDate: date("week_start_date").notNull(),
    weekEndDate: date("week_end_date").notNull(),
    checkDate: date("check_date"),
    weeklyActivityNotes: text("weekly_activity_notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.weekStartDate)],
);

// startTime/endTime/activityType are non-null for every entry created through the app UI;
// NULL indicates a row that came from a legacy Excel import (no time-of-day on paper).
export const timeEntries = pgTable(
  "time_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weeklyTimesheetId: uuid("weekly_timesheet_id")
      .notNull()
      .references(() => weeklyTimesheets.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    entryDate: date("entry_date").notNull(),
    startTime: varchar("start_time", { length: 5 }),
    endTime: varchar("end_time", { length: 5 }),
    activityType: activityTypeEnum("activity_type"),
    notes: text("notes"),
    hours: numeric("hours", { precision: 4, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("time_entries_timesheet_date_idx").on(t.weeklyTimesheetId, t.entryDate),
    check(
      "time_entries_end_after_start",
      sql`${t.startTime} is null or ${t.endTime} is null or ${t.endTime} > ${t.startTime}`,
    ),
  ],
);

export const meetingMinutes = pgTable("meeting_minutes", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingDate: date("meeting_date").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  notes: text("notes").notNull(),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const meetingAttendees = pgTable("meeting_attendees", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id")
    .notNull()
    .references(() => meetingMinutes.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  freeTextName: varchar("free_text_name", { length: 128 }),
});
