import { boolean, integer, pgTable, serial, timestamp, varchar, } from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { users } from "./users.js";
import { relations } from "drizzle-orm";
export const conversation_participants = pgTable("conversation_participants", {
    id: serial().primaryKey(),
    conversation_id: integer().references(() => conversations.id),
    user_id: integer().references(() => users.id),
    is_admin: boolean().default(false),
    joined_at: timestamp().defaultNow(),
    left_at: timestamp(),
});
export const conversationParticipantRelations = relations(conversation_participants, ({ one }) => ({
    conversation: one(conversations, {
        fields: [conversation_participants.conversation_id],
        references: [conversations.id],
    }),
    user: one(users, {
        fields: [conversation_participants.user_id],
        references: [users.id],
    }),
}));
