import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { group_messages } from "./group-messages.js";
import { users } from "./users.js";
import { groups } from "./groups.js";

export const group_member_state = pgTable("group_member_state", {
  id: serial().primaryKey(),
  user_id: integer()
    .notNull()
    .references(() => users.id),
  group_id: integer()
    .notNull()
    .references(() => groups.id),
  last_delivered_message_id: integer().references(() => group_messages.id),
  last_read_message_id: integer().references(() => group_messages.id),
  updated_at: timestamp().defaultNow(),
});

export type GroupMemberState = typeof group_member_state.$inferSelect;
export type NewGroupMemberState = typeof group_member_state.$inferInsert;

export type GroupMemberStateTable = typeof group_member_state;
