import { updateDeliveryStatus, updateMessageAsSent, } from "../helpers/message-helper.js";
import { fetchParticipantsForSingleConversation } from "../services/db/conversation-service.js";
import { getClient } from "./socket-clients.js";
// export async function handleIncomingMessage(
//   socket: Socket,
//   userId: string,
//   message: WsMessage
// ) {
//   const type = message.type;
//   switch (type) {
//     case "message:send": {
//       const { receiverId, content, messageId, conversationId } =
//         message.payload as MessageSendPayload;
//       const receiver = getClient(receiverId);
//       // Send message to receiver if online
//       if (receiver) {
//         const payload = {
//           type: "direct:message:new",
//           payload: { from: userId, content, messageId, conversationId },
//         };
//         receiver.emit("message", payload);
//         if (messageId) {
//           updateMessageAsSent(+messageId, +userId);
//           updateDeliveryStatus(+messageId, "delivered");
//         }
//       }
//       // Acknowledge to sender
//       const acknowledge = {
//         type: "message:acknowledge",
//         payload: { from: userId, ...message.payload },
//       };
//       socket.emit("message", acknowledge);
//       break;
//     }
//     case "message:read": {
//       const payload = {
//         type: "message:read",
//         payload: { userId, ...message.payload },
//       };
//       socket.emit("message", payload);
//       break;
//     }
//     case "typing:start":
//     case "typing:stop":
//       const { conversationId, receiverId } = message.payload as TypingPayload;
//       const receiver = getClient(receiverId);
//       const payload = {
//         type,
//         payload: { conversationId, receiverId, from: userId },
//       };
//       if (receiver) {
//         receiver.emit("message", payload);
//       }
//       break;
//     default:
//       socket.emit("message", { type: "error", payload: "Unknown event type" });
//   }
// }
export async function handleIncomingMessage(socket, userId, message) {
    const { type, payload } = message;
    switch (type) {
        case "message:send":
            {
                const { receiverId, content, messageId, conversationId, isGroup } = payload;
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
                // ✅ Acknowledge to sender
                socket.emit("message", {
                    type: isGroup ? "group:message:ack" : "direct:message:ack",
                    payload: { messageId, status: "delivered" },
                });
            }
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
