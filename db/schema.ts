import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rsvps = sqliteTable("rsvps", {
  id: text("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  attendance: text("attendance", { enum: ["yes", "no"] }).notNull(),
  adultCount: integer("adult_count").notNull().default(0),
  childCount: integer("child_count").notNull().default(0),
  infantCount: integer("infant_count").notNull().default(0),
  note: text("note").notNull().default(""),
  createdAt: integer("created_at").notNull(),
});
