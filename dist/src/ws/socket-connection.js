import { Server, Socket } from "socket.io";
import { addClient, removeClient } from "./socket-clients.js";
import { handleIncomingMessage, handleIncomingTyping } from "./socket-handler.js";
import { getUserInfoFromToken } from "../utils/jwt-utils.js";
let io = null;
export function injectSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*", // adjust in prod
            methods: ["GET", "POST"],
        },
    });
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.query.token;
            if (!token)
                return next(new Error("No token provided"));
            const userId = (await getUserInfoFromToken(token));
            socket.userId = userId; // attach userId to socket object
            next();
        }
        catch (err) {
            next(new Error("Authentication failed"));
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.userId;
        console.log(`User connected: ${userId}`);
        addClient(userId, socket);
        socket.on("message", async (data) => {
            await handleIncomingMessage(socket, userId, data);
        });
        socket.on("typing", async (data) => {
            await handleIncomingTyping(socket, userId, data);
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}`);
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
    if (!io)
        throw new Error("Socket.IO not initialized");
    return io;
}
