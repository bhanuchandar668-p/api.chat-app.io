import { boolean, pgTable, serial, timestamp, varchar, } from "drizzle-orm/pg-core";
export const conversations = pgTable("conversations", {
    id: serial().primaryKey(),
    name: varchar(),
    is_group: boolean().default(false),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
});
