import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import { addClient, removeClient } from "./socket-clients.js";
import { handleIncomingMessage, handleLastSeen } from "./socket-handler.js";
import { getUserInfoFromToken } from "../utils/jwt-utils.js";
import type { ServerType } from "@hono/node-server";

let io: Server | null = null;

export function injectSocket(server: ServerType | HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "*", // adjust in prod
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token as string;
      if (!token) return next(new Error("No token provided"));

      const userId = (await getUserInfoFromToken(token)) as string;

      (socket as any).userId = userId; // attach userId to socket object

      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId;

    console.log(`User connected: ${userId}`);

    addClient(userId, socket);

    socket.on("message", async (data) => {
      await handleIncomingMessage(socket, userId, data);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);

      if (userId) handleLastSeen(+userId);
      removeClient(userId);
    });

    socket.on("error", (err) => {
      console.error(`Socket.IO error for user ${userId}:`, err);
      removeClient(userId);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
