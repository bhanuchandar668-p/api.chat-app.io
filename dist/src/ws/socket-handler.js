import { updateDeliveryStatus, updateLastSeen, updateMessageAsRead, updateMessageAsSent, } from "../helpers/message-helper.js";
import { fetchParticipantsForSingleConversation } from "../services/db/conversation-service.js";
import { getClient } from "./socket-clients.js";
async function handleIncomingMessage(socket, userId, message) {
    const { type, payload } = message;
    const messageId = payload?.messageId;
    const conversationId = payload?.conversationId;
    const receiverId = payload?.receiverId;
    switch (type) {
        case "message:send":
            const { content, isGroup } = payload;
            if (isGroup) {
                await handleGroupMessage({
                    conversationId,
                    senderId: userId,
                    content,
                    messageId,
                });
            }
            else {
                await handleDirectMessage({
                    receiverId,
                    senderId: userId,
                    content,
                    messageId,
                    conversationId,
                });
            }
            socket.emit("message", {
                type: isGroup ? "group:message:ack" : "direct:message:ack",
                payload: { messageId, status: "delivered" },
            });
            break;
        case "message:read":
            await handleMessageRead(messageId, receiverId);
            socket.emit("message", {
                type: "message:read:ack",
                payload: { messageId },
            });
            break;
        case "typing:start":
        case "typing:stop":
            await handleTypingEvent(userId, type, conversationId);
            break;
        default:
            socket.emit("message", {
                type: "error",
                payload: "Unknown event type",
            });
            break;
    }
}
async function handleDirectMessage({ receiverId, senderId, content, messageId, conversationId, }) {
    const receiver = getClient(receiverId);
    if (receiver) {
        const payload = {
            type: "direct:message:new",
            payload: { from: senderId, content, messageId, conversationId },
        };
        receiver.emit("message", payload);
        if (messageId) {
            await updateMessageAsSent(+messageId, +senderId);
            await updateDeliveryStatus(+messageId, "delivered");
        }
    }
}
async function handleGroupMessage({ conversationId, senderId, content, messageId, }) {
    // Fetch all group participants from DB
    const participants = await fetchParticipantsForSingleConversation(+conversationId);
    for (const participant of participants) {
        if (participant.id !== null && participant.id === +senderId)
            continue;
        const receiverId = participant.id?.toString();
        const client = getClient(receiverId);
        if (client) {
            const payload = {
                type: "group:message:new",
                payload: { from: senderId, content, messageId, conversationId },
            };
            client.emit("message", payload);
        }
    }
    if (messageId) {
        await updateMessageAsSent(+messageId, +senderId);
        await updateDeliveryStatus(+messageId, "delivered");
    }
}
async function handleMessageRead(messageId, readerId) {
    await updateMessageAsRead(+messageId, +readerId);
}
async function handleTypingEvent(userId, type, conversationId) {
    // Notify all participants
    const participants = await fetchParticipantsForSingleConversation(+conversationId);
    for (const p of participants) {
        if (p.id && p.id !== +userId) {
            const client = getClient(p.id.toString());
            if (client) {
                client.emit("message", {
                    type,
                    payload: { from: userId, conversationId },
                });
            }
        }
    }
}
async function handleLastSeen(userId) {
    if (!userId)
        return;
    await updateLastSeen(userId);
}
export { handleIncomingMessage, handleLastSeen };
