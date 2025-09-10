import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { groups } from "./groups.js";

export const group_messages = pgTable("group_messages", {
  id: serial().primaryKey(),
  sender_id: serial()
    .notNull()
    .references(() => users.id),
  group_id: serial()
    .notNull()
    .references(() => groups.id),
  message: text(),
  sent_at: timestamp(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});

export type GroupMessage = typeof group_messages.$inferSelect;
export type NewGroupMessage = typeof group_messages.$inferInsert;
export type GroupMessageTable = typeof group_messages;
