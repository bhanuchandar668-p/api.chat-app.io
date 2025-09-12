import { eq, and, ne } from "drizzle-orm";
import { conversation_participants } from "../../db/schema/conversation-participants.js";
import { conversations } from "../../db/schema/conversations.js";
import { db } from "./base-db-service.js";
import { alias } from "drizzle-orm/pg-core";
import { messages } from "../../db/schema/messages.js";
import { users } from "../../db/schema/users.js";
export async function checkConversationExists(senderId, receiverId) {
    // create aliases for self-joins
    const cp1 = alias(conversation_participants, "cp1");
    const cp2 = alias(conversation_participants, "cp2");
    const conversation = await db
        .select({ id: conversations.id })
        .from(conversations)
        .innerJoin(cp1, and(eq(cp1.id, conversations.id), eq(cp1.user_id, senderId)))
        .innerJoin(cp2, and(eq(cp2.id, conversations.id), eq(cp2.user_id, receiverId)))
        .where(ne(conversations.is_group, false));
    return conversation;
}
export async function getConversations(userId) {
    const convos = await db
        .select({
        id: conversations.id,
        is_group: conversations.is_group,
    })
        .from(conversations)
        .innerJoin(conversation_participants, eq(conversation_participants.conversation_id, conversations.id))
        .where(eq(conversation_participants.user_id, userId));
    return convos;
}
export async function getLastMessages(conversationIds) {
    const lastMessages = await db
        .select({
        conversation_id: messages.conversation_id,
        content: messages.content,
    })
        .from(messages)
        .where(conversationIds.length
        ? eq(messages.conversation_id, conversationIds[0])
        : undefined);
    return lastMessages;
}
export async function fetchConversationParticipants(convoIds) {
    const participants = await db
        .select({
        conversation_id: conversation_participants.conversation_id,
        user_id: conversation_participants.user_id,
        first_name: users.first_name,
        last_name: users.last_name,
        email: users.email,
    })
        .from(conversation_participants)
        .innerJoin(users, eq(users.id, conversation_participants.user_id))
        .where(and(eq(conversation_participants.conversation_id, convoIds[0]) // ❌ single convo only
    ));
    return participants;
}
