import { eq, and, ne, isNull, or, desc, inArray } from "drizzle-orm";
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
        .innerJoin(cp1, and(eq(cp1.conversation_id, conversations.id), eq(cp1.user_id, senderId)))
        .innerJoin(cp2, and(eq(cp2.conversation_id, conversations.id), eq(cp2.user_id, receiverId)));
    // .where(ne(conversations.is_group, false));
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
    if (!conversationIds.length) {
        return [];
    }
    let messagesR = await db.query.messages.findMany({
        where: inArray(messages.conversation_id, conversationIds),
        with: {
            conversation: {
                columns: {
                    id: true,
                },
            },
        },
        orderBy: desc(messages.created_at),
    });
    // Keep only the first message for each conversation_id
    const lastMessagesMap = new Map();
    for (const msg of messagesR) {
        if (msg &&
            msg.conversation_id &&
            !lastMessagesMap.has(msg.conversation_id)) {
            lastMessagesMap.set(msg.conversation_id, {
                id: msg.id,
                conversation_id: msg.conversation_id,
                content: msg.content,
                time: msg.created_at,
            });
        }
    }
    return Array.from(lastMessagesMap.values());
}
export async function fetchConversationParticipants(convoIds, loggedInUserId) {
    if (!convoIds.length) {
        return [];
    }
    const participants = await db.query.conversation_participants.findMany({
        where: (participant, { and, inArray, ne }) => and(inArray(participant.conversation_id, convoIds), ne(participant.user_id, loggedInUserId)),
        with: {
            user: {
                columns: {
                    first_name: true,
                    last_name: true,
                    email: true,
                },
            },
        },
    });
    const uniqueParticipants = participants.filter((p, index, self) => index ===
        self.findIndex((x) => x.conversation_id === p.conversation_id && x.user_id === p.user_id));
    return uniqueParticipants.map((participant) => ({
        conversation_id: participant.conversation_id,
        user_id: participant.user_id,
        first_name: participant.user?.first_name ?? null,
        last_name: participant.user?.last_name ?? null,
        email: participant.user?.email ?? null,
    }));
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
    const messageRec = await db.query.messages.findMany({
        where: eq(messages.conversation_id, conversationId),
        with: {
            user: {
                columns: {
                    first_name: true,
                    last_name: true,
                    email: true,
                },
            },
            message_status: {
                columns: {
                    status: true,
                    updated_at: true,
                },
            },
        },
        orderBy: desc(messages.created_at),
        limit,
        offset: offSet,
    });
    const totalRecords = await db.$count(messages, eq(messages.conversation_id, conversationId));
    const finalResp = messageRec.map((msg) => {
        return {
            id: msg.id,
            content: msg?.content,
            sender_id: msg?.sender_id,
            sender_first_name: msg?.user?.first_name ?? null,
            sender_last_name: msg.user?.last_name ?? null,
            sender_email: msg?.user?.email ?? null,
            status: msg?.message_status?.status, // sent | delivered | read
            created_at: msg?.created_at,
            updated_at: msg?.message_status?.updated_at,
        };
    });
    const total_pages = Math.ceil(totalRecords / limit) || 1;
    const pagination_info = {
        total_records: totalRecords,
        total_pages,
        page_size: limit,
        current_page: page > total_pages ? total_pages : page,
        next_page: page >= total_pages ? null : page + 1,
        prev_page: page <= 1 ? null : page - 1,
    };
    if (totalRecords === 0) {
        return {
            pagination_info,
            records: [],
        };
    }
    return {
        pagination_info,
        records: finalResp,
    };
}
export async function fetchParticipantsForSingleConversation(conversationId) {
    const participants = await db
        .select({
        id: conversation_participants.user_id,
    })
        .from(conversation_participants)
        .innerJoin(users, eq(users.id, conversation_participants.user_id))
        .where(eq(conversation_participants.conversation_id, conversationId));
    return participants;
}
