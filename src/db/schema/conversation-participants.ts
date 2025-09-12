import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { users } from "./users.js";

export const conversation_participants = pgTable("conversation_participants", {
  id: serial().primaryKey(),
  conversation_id: integer().references(() => conversations.id),
  user_id: integer().references(() => users.id),
  is_admin: boolean().default(false),
  joined_at: timestamp().defaultNow(),
  left_at: timestamp(),
});

export type ConversationParticipant =
  typeof conversation_participants.$inferSelect;
export type NewConversationParticipant =
  typeof conversation_participants.$inferInsert;
export type ConversationParticipantTable = typeof conversation_participants;
