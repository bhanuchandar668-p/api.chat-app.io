import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { conversations } from "./conversations.js";
import { relations } from "drizzle-orm";
import { message_status } from "./message-status.js";

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

export const messageRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.sender_id],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [messages.conversation_id],
    references: [conversations.id],
  }),
  message_status: one(message_status, {
    fields: [messages.id],
    references: [message_status.message_id],
  }),
}));
