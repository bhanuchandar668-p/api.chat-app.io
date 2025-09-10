import WebSocket from "ws";

// Replace with your server URL
const userId = "user1";
const ws = new WebSocket(`ws://localhost:3003//v1.0/ws?userId=${userId}`);

// When connection opens
ws.on("open", () => {
  console.log(`Connected as ${userId}`);

  // Example: send a DM to user2
  const message = {
    type: "message:send",
    payload: {
      receiverId: "user2",
      content: "Hello from user1!",
    },
  };

  ws.send(JSON.stringify(message));

  // Example: typing start
  ws.send(
    JSON.stringify({
      type: "typing:start",
      payload: { chatId: "chat1", receiverId: "user2" },
    })
  );
});

// Listen for messages from server
ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log("Received:", msg);
});

// Handle errors
ws.on("error", (err) => {
  console.error("WebSocket error:", err);
});

// Handle close
ws.on("close", () => {
  console.log("Connection closed");
});
