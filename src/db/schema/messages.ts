import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { conversations } from "./conversations.js";

export const messages = pgTable("messages", {
  id: serial().primaryKey(),
  sender_id: integer().references(() => users.id),
  conversation_id: integer().references(() => conversations.id),
  content: text(),
  created_at: timestamp().defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MessageTable = typeof messages;
