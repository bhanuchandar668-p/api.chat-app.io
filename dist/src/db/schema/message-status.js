import { integer, pgTable, serial, timestamp, varchar, } from "drizzle-orm/pg-core";
import { messages } from "./messages.js";
import { users } from "./users.js";
import { relations } from "drizzle-orm";
export const message_status = pgTable("message_status", {
    id: serial().primaryKey(),
    message_id: integer().references(() => messages.id),
    user_id: integer().references(() => users.id),
    status: varchar(), // sent | delivered | read
    created_at: timestamp().defaultNow(),
    delivered_at: timestamp(),
    updated_at: timestamp().defaultNow(),
});
export const messageStatusRelations = relations(message_status, ({ one }) => ({
    message: one(messages, {
        fields: [message_status.message_id],
        references: [messages.id],
    }),
    user: one(users, {
        fields: [message_status.user_id],
        references: [users.id],
    }),
}));
