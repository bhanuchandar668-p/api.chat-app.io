import { insertNewDirectMessage, insertNewMessage, updateDeliveryStatus, updateMessageAsSent, } from "../helpers/message-helper.js";
import { getClient } from "./socket-clients.js";
export async function handleIncomingMessage(socket, userId, message) {
    const type = message.type;
    switch (type) {
        case "message:send": {
            const { receiverId, content } = message.payload;
            const receiver = getClient(receiverId);
            const msgResp = await insertNewMessage(+userId, +receiverId, content);
            // Send message to receiver if online
            if (receiver) {
                const payload = {
                    type: "direct:message:new",
                    payload: { from: userId, content },
                };
                receiver.emit("message", payload);
                updateMessageAsSent(msgResp.id, +userId);
                updateDeliveryStatus(msgResp.id, "delivered");
            }
            // Acknowledge to sender
            const acknowledge = {
                type: "message:acknowledge",
                payload: { from: userId, ...message.payload },
            };
            socket.emit("message", acknowledge);
            break;
        }
        case "message:read": {
            const payload = {
                type: "message:read",
                payload: { userId, ...message.payload },
            };
            socket.emit("message", payload);
            break;
        }
        case "typing:start":
        case "typing:stop": {
            const { chatId, receiverId } = message.payload;
            const receiver = getClient(receiverId);
            const payload = {
                type: type,
                payload: { chatId, receiverId, from: userId },
            };
            if (receiver) {
                receiver.emit("message", payload);
            }
            break;
        }
        default:
            socket.emit("message", { type: "error", payload: "Unknown event type" });
    }
}
