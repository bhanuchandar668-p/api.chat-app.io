import { upgradeWebSocket } from "../app.js";
import { addClient, removeClient } from "./ws-clients.js";
import { handleIncomingMessage } from "./message-handler.js";
export const wsHandler = upgradeWebSocket((c) => {
    const userId = c.req.query("userId") || `anon-${Date.now()}`;
    return {
        onOpen(event, ws) {
            console.log(`User connected: ${userId}`);
            addClient(userId, ws);
        },
        onMessage(event, ws) {
            handleIncomingMessage(ws, userId, JSON.parse(event.data));
        },
        onClose() {
            console.log(`User disconnected: ${userId}`);
            removeClient(userId);
        },
        onError(err) {
            console.error(`WebSocket error for user ${userId}:`, err);
            removeClient(userId);
        },
    };
});
