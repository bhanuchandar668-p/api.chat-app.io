import type { WSContext } from "hono/ws";

export const clients = new Map<string, WSContext>();

export const addClient = (userId: string, ws: WSContext) => {
  clients.set(userId, ws);
};

export const removeClient = (userId: string) => {
  clients.delete(userId);
};

export const getClient = (userId: string) => clients.get(userId);
