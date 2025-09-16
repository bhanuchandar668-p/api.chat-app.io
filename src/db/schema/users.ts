import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { messages } from "./messages.js";

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey(),
    first_name: varchar().notNull(),
    last_name: varchar().notNull(),
    middle_name: varchar(),
    email: varchar().notNull(),
    phone_number: varchar(),
    profile_url: varchar(),
    about: varchar(),
    password: varchar().notNull(),
    last_seen_at: timestamp(),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
  },
  (t) => [index("email_idx").on(t.email)]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserTable = typeof users;

export const userRelations = relations(users, ({ one }) => ({
  messages: one(messages, {
    fields: [users.id],
    references: [messages.sender_id],
  }),
}));
