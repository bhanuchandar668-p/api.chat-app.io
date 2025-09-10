import { index, integer, pgTable, serial, text, timestamp, varchar, } from "drizzle-orm/pg-core";
import { users } from "./users.js";
export const direct_messages = pgTable("direct_messages", {
    id: serial().primaryKey(),
    sender_id: integer()
        .notNull()
        .references(() => users.id),
    receiver_id: integer()
        .notNull()
        .references(() => users.id),
    message: text(),
    sent_at: timestamp().defaultNow(),
    status: varchar().default("sent"), // sent | delivered | read,
    delivered_at: timestamp(),
    read_at: timestamp(),
    reply_to: integer().references(() => direct_messages.id),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
    deleted_at: timestamp(),
});
