import { upgradeWebSocket } from "../app.js";
import { addClient, removeClient } from "./ws-clients.js";
import { handleIncomingMessage } from "./message-handler.js";
import { getUserInfoFromToken } from "../utils/jwt-utils.js";
export const wsHandler = upgradeWebSocket(async (c) => {
    const authToken = c.req.query("token");
    const userId = (await getUserInfoFromToken(authToken));
    return {
        onOpen: async function (event, ws) {
            console.log(`User connected: ${userId}`);
            addClient(userId, ws);
        },
        onMessage: async function (event, ws) {
            const message = event.data.toString();
            console.log("Received:", message);
            await handleIncomingMessage(ws, userId, JSON.parse(message));
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
