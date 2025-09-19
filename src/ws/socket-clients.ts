import type { Socket } from "socket.io";

// Map of userId → Socket
export const clients = new Map<string, Socket>();

export const addClient = (userId: string, socket: Socket) => {
  console.log("User Added to clients", userId);
  clients.set(userId.toString(), socket);
};

export const removeClient = (userId: string) => {
  console.log("User Removed from clients", userId);
  clients.delete(userId.toString());
};

export const getClient = (userId: string) => {
  if (!userId) return null;

  return clients.get(userId.toString());
};
