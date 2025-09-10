import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  first_name: varchar().notNull(),
  last_name: varchar().notNull(),
  middle_name: varchar(),
  email: varchar().notNull(),
  phone_number: varchar(),
  password: varchar().notNull(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserTable = typeof users;
