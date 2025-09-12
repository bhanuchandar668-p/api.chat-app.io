import { message_status } from "../db/schema/message-status.js";
import { messages, type Message } from "../db/schema/messages.js";
import {
  saveSingleRecord,
  updateRecordByColumnValue,
  updateRecordById,
} from "../services/db/base-db-service.js";

export async function insertNewDirectMessage(
  senderId: number,
  receiverId: number,
  message: string
) {
  const msg = {
    sender_id: senderId,
    receiver_id: receiverId,
    message,
  };

  // return await saveSingleRecord<DirectMessage>(direct_messages, msg);
}

export async function updateDeliveryStatus(id: number, status: string) {
  if (!["sent", "delivered", "read"].includes(status)) {
    return;
  }

  const deliveredAt = status === "delivered" ? new Date() : null;
  const readAt = status === "read" ? new Date() : null;

  // await updateRecordById(direct_messages, id, {
  //   status,
  //   delivered_at: deliveredAt,
  //   read_at: readAt,
  // });
}

export async function insertNewMessage(
  conversationId: number,
  senderId: number,
  content: string
) {
  const msgRecord = {
    conversation_id: conversationId,
    sender_id: senderId,
    content,
  };

  return await saveSingleRecord<Message>(messages, msgRecord);
}

export async function updateMessageAsSent(id: number, userId: number) {
  const msgStatusRecord = {
    message_id: id,
    status: "sent",
    user_id: userId,
  };

  await saveSingleRecord(message_status, msgStatusRecord);
}

export async function updateMessageAsDelivered(id: number, userId: number) {
  const deliveredAt = new Date();

  await updateRecordByColumnValue(message_status, "id", id, {
    status: "delivered",
  });
}
