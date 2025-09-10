import { getClient } from "./ws-clients.js";
export function handleIncomingMessage(ws, userId, message) {
    switch (message.type) {
        case "message:send": {
            const { receiverId, content } = message.payload;
            const receiver = getClient(receiverId);
            if (receiver && receiver.readyState === WebSocket.OPEN) {
                receiver.send(JSON.stringify({
                    type: "direct:message:new",
                    payload: { from: userId, content },
                }));
            }
            ws.send(JSON.stringify({
                type: "message:delivered",
                payload: { to: receiverId },
            }));
            break;
        }
        case "message:read": {
            ws.send(JSON.stringify({
                type: "message:read",
                payload: { userId, ...message.payload },
            }));
            break;
        }
        case "typing:start":
        case "typing:stop": {
            const { chatId, receiverId } = message.payload;
            const receiver = getClient(receiverId);
            if (receiver && receiver.readyState === WebSocket.OPEN) {
                receiver.send(JSON.stringify({
                    type: message.type,
                    payload: { chatId, from: userId },
                }));
            }
            break;
        }
        default:
            ws.send(JSON.stringify({ type: "error", payload: "Unknown event type" }));
    }
}
