import { bigint, integer, pgTable, text } from "drizzle-orm/pg-core";

export const rsvps = pgTable("rsvps", {
  id: text("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  attendance: text("attendance").$type<"yes" | "no">().notNull(),
  adultCount: integer("adult_count").notNull().default(0),
  childCount: integer("child_count").notNull().default(0),
  infantCount: integer("infant_count").notNull().default(0),
  note: text("note").notNull().default(""),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
