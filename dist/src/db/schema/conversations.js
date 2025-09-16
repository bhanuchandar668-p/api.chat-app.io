import { relations } from "drizzle-orm";
import { boolean, pgTable, serial, timestamp, varchar, } from "drizzle-orm/pg-core";
import { conversation_participants } from "./conversation-participants.js";
export const conversations = pgTable("conversations", {
    id: serial().primaryKey(),
    name: varchar(),
    is_group: boolean().default(false),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
});
export const conversationRelations = relations(conversations, ({ many }) => ({
    participants: many(conversation_participants),
}));
