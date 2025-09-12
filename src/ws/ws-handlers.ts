import type { Context } from "hono";
import { upgradeWebSocket } from "../app.js";
import { addClient, removeClient } from "./ws-clients.js";
import { handleIncomingMessage } from "./message-handler.js";

import type { WSContext } from "hono/ws";
import { getUserInfoFromToken } from "../utils/jwt-utils.js";

export const wsHandler = upgradeWebSocket(async (c: Context) => {
  const authToken = c.req.query("token")!;

  const userId = (await getUserInfoFromToken(authToken)) as string;

  return {
    onOpen: async function (event: Event, ws: WSContext) {
      console.log(`User connected: ${userId}`);

      addClient(userId, ws);
    },

    onMessage: async function (event: MessageEvent, ws: WSContext) {
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
