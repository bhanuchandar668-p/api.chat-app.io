import {
  insertNewMessage,
  updateDeliveryStatus,
  updateLastSeen,
  updateMessageAsRead,
  updateMessageAsSent,
} from "../helpers/message-helper.js";
import { fetchParticipantsForSingleConversation } from "../services/db/conversation-service.js";
import type { WsMessage, MessageSendPayload } from "../types/app.types.js";
import { getClient } from "./socket-clients.js";
import type { Socket } from "socket.io";

async function handleIncomingMessage(
  socket: Socket,
  userId: string,
  message: WsMessage
) {
  const { type, payload } = message;

  let messageId = payload?.messageId;

  const conversationId = payload?.conversationId;

  const receiverId = payload?.receiverId;

  switch (type) {
    case "message:send":
      const { content, isGroup } = payload as MessageSendPayload & {
        isGroup?: boolean;
      };

      const message = await insertNewMessage(conversationId, +userId, content);

      if (isGroup) {
        await handleGroupMessage(+conversationId, +userId, content, message.id);
      } else {
        await handleDirectMessage(
          receiverId,
          userId,
          content,
          message.id,
          conversationId
        );
      }

      socket.emit("message", {
        type: isGroup ? "group:message:ack" : "direct:message:ack",
        payload: { messageId: message.id, status: "delivered" },
      });

      break;

    case "message:read":
      await handleMessageRead(messageId, receiverId);

      socket.emit("message", {
        type: "message:read:ack",
        payload: { messageId },
      });

      break;

    case "typing:start":
    case "typing:stop":
      await handleTypingEvent(userId, type, conversationId);
      break;

    default:
      socket.emit("message", {
        type: "error",
        payload: "Unknown event type",
      });
      break;
  }
}

async function handleDirectMessage(
  receiverId: string,
  senderId: string | number,
  content: string,
  messageId: string | number,
  conversationId: string | number
) {
  const receiver = getClient(receiverId);

  if (receiver) {
    const payload = {
      type: "direct:message:new",
      payload: { from: senderId, content, messageId, conversationId },
    };

    receiver.emit("message", payload);

    if (messageId) {
      try {
        await updateMessageAsSent(+messageId, +senderId);

        await updateDeliveryStatus(+messageId, "delivered");
      } catch (err) {
        throw err;
      }
    }
  }
}

async function handleGroupMessage(
  conversationId: string | number,
  senderId: string | number,
  content: string,
  messageId: string | number
) {
  // Fetch all group participants from DB
  const participants = await fetchParticipantsForSingleConversation(
    +conversationId
  );

  for (const participant of participants) {
    if (participant.id !== null && participant.id === +senderId) continue;

    const receiverId = participant.id?.toString()!;

    const client = getClient(receiverId);

    if (client) {
      const payload = {
        type: "group:message:new",
        payload: { from: senderId, content, messageId, conversationId },
      };

      client.emit("message", payload);
    }
  }

  if (messageId) {
    await updateMessageAsSent(+messageId, +senderId);
    await updateDeliveryStatus(+messageId, "delivered");
  }
}

async function handleMessageRead(messageId: string, readerId: string) {
  // await updateMessageAsRead(+messageId, +readerId);
}

async function handleTypingEvent(
  userId: string,
  type: "typing:start" | "typing:stop",
  conversationId: string
) {
  // Notify all participants
  const participants = await fetchParticipantsForSingleConversation(
    +conversationId
  );

  for (const p of participants) {
    if (p.id && p.id !== +userId) {
      const client = getClient(p.id.toString());

      if (client) {
        client.emit("message", {
          type,
          payload: { from: userId, conversationId },
        });
      }
    }
  }
}

async function handleLastSeen(userId: number) {
  if (!userId) return;

  await updateLastSeen(userId);
}

export { handleIncomingMessage, handleLastSeen };
