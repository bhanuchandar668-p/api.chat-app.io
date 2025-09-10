import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const groups = pgTable("groups", {
  id: serial().primaryKey(),
  name: varchar().notNull(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});
