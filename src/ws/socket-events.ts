import { Socket } from "socket.io";

export function registerSocketEvents(socket: Socket) {
  console.log(`✅ User connected: ${socket.id}`);

  // Welcome event
  socket.emit("welcome", { message: "Connected to Socket.IO server!" });

  // Example: chat event
  socket.on("chat", (data) => {
    console.log("💬 Chat message:", data);
    // Echo back
    socket.emit("chat", { message: `Echo: ${data.message}` });
    // Broadcast to everyone else
    socket.broadcast.emit("chat", { message: `${socket.id}: ${data.message}` });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
}
