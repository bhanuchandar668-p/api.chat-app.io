import { integer, pgTable, serial, timestamp, varchar, } from "drizzle-orm/pg-core";
import { messages } from "./messages.js";
import { users } from "./users.js";
export const message_status = pgTable("message_status", {
    id: serial().primaryKey(),
    message_id: integer().references(() => messages.id),
    user_id: integer().references(() => users.id),
    status: varchar(), // sent | delivered | read
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
});
