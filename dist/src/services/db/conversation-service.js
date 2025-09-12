import { eq, and, ne, isNull, or, desc } from "drizzle-orm";
import { conversation_participants } from "../../db/schema/conversation-participants.js";
import { conversations } from "../../db/schema/conversations.js";
import { db } from "./base-db-service.js";
import { alias } from "drizzle-orm/pg-core";
import { messages } from "../../db/schema/messages.js";
import { users } from "../../db/schema/users.js";
import { message_status } from "../../db/schema/message-status.js";
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
        time: messages.created_at,
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
export async function fetchUnreadMessages(conversationId, userId) {
    const unreadMessages = await db
        .select({
        id: messages.id,
    })
        .from(messages)
        .innerJoin(conversation_participants, eq(conversation_participants.conversation_id, messages.conversation_id))
        .leftJoin(message_status, and(eq(message_status.message_id, messages.id), eq(message_status.user_id, userId)))
        .where(and(eq(messages.conversation_id, conversationId), eq(conversation_participants.user_id, userId), or(isNull(message_status.status), // no status means unread
    ne(message_status.status, "read") // or not read
    ), ne(messages.sender_id, userId) // exclude messages sent by the user
    ));
    return unreadMessages;
}
export async function fetchAllMessagesWithStatus(conversationId, userId, page, limit) {
    const offSet = (page - 1) * limit;
    const records = await db
        .select({
        id: messages.id,
        content: messages.content,
        sender_id: messages.sender_id,
        status: message_status.status, // sent | delivered | read
        created_at: messages.created_at,
        updated_at: message_status.updated_at,
    })
        .from(messages)
        .leftJoin(message_status, and(eq(message_status.message_id, messages.id), eq(message_status.user_id, userId) // status for this specific user
    ))
        .where(eq(messages.conversation_id, conversationId))
        .orderBy(desc(messages.created_at))
        .limit(limit)
        .offset(offSet);
    return records;
}
