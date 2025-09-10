import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { groups } from "./groups.js";

export const group_members = pgTable("group_members", {
  id: serial().primaryKey(),
  user_id: integer()
    .notNull()
    .references(() => users.id),
  group_id: integer()
    .notNull()
    .references(() => groups.id),
  joined_at: timestamp(),
  left_at: timestamp(),
});

export type GroupMember = typeof group_members.$inferSelect;
export type NewGroupMember = typeof group_members.$inferInsert;
export type GroupMemberTable = typeof group_members;
