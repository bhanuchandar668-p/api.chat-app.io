import type { Context } from "hono";
import { upgradeWebSocket } from "../app.js";
import { addClient, removeClient } from "./ws-clients.js";
import { handleIncomingMessage } from "./message-handler.js";

import type { WSContext } from "hono/ws";

export const wsHandler = upgradeWebSocket((c: Context) => {
  const userId = c.req.query("userId") || `anon-${Date.now()}`;

  return {
    onOpen(event: Event, ws: WSContext) {
      console.log(`User connected: ${userId}`);
      addClient(userId, ws);
    },

    onMessage(event: MessageEvent, ws: WSContext) {
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
