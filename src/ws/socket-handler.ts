import {
  insertNewDirectMessage,
  insertNewMessage,
  updateDeliveryStatus,
  updateMessageAsSent,
} from "../helpers/message-helper.js";
import type {
  WsMessage,
  MessageSendPayload,
  TypingPayload,
} from "../types/app.types.js";
import { getClient } from "./socket-clients.js";
import type { Socket } from "socket.io";

export async function handleIncomingMessage(
  socket: Socket,
  userId: string,
  message: WsMessage
) {
  const type = message.type;

  switch (type) {
    case "message:send": {
      const { receiverId, content } = message.payload as MessageSendPayload;

      const receiver = getClient(receiverId);

      const msgResp = await insertNewMessage(+userId, +receiverId, content);

      // Send message to receiver if online
      if (receiver) {
        const payload = {
          type: "direct:message:new",
          payload: { from: userId, content },
        };

        receiver.emit("message", payload);

        updateMessageAsSent(msgResp.id, +userId);

        updateDeliveryStatus(msgResp.id, "delivered");
      }

      // Acknowledge to sender
      const acknowledge = {
        type: "message:acknowledge",
        payload: { from: userId, ...message.payload },
      };

      socket.emit("message", acknowledge);
      break;
    }

    case "message:read": {
      const payload = {
        type: "message:read",
        payload: { userId, ...message.payload },
      };
      socket.emit("message", payload);
      break;
    }

    case "typing:start":
    case "typing:stop":
      const { conversationId, receiverId } = message.payload as TypingPayload;

      const receiver = getClient(receiverId);

      const payload = {
        type,
        payload: { conversationId, receiverId, from: userId },
      };

      if (receiver) {
        receiver.emit("message", payload);
      }

      break;
    default:
      socket.emit("message", { type: "error", payload: "Unknown event type" });
  }
}

export async function handleIncomingTyping(
  socket: Socket,
  userId: string,
  message: any
) {
  const type = message.type;

  switch (type) {
    case "typing:start":
    case "typing:stop":
      const { conversationId, receiverId } = message.payload as TypingPayload;

      const receiver = getClient(receiverId);

      const payload = {
        type,
        payload: { conversationId, receiverId, from: userId },
      };

      if (receiver) {
        receiver.emit("typing", payload);
      }

      break;
    default:
      socket.emit("typing", { type: "error", payload: "Unknown event type" });
  }
}
