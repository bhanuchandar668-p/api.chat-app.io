import { message_status } from "../db/schema/message-status.js";
import { messages } from "../db/schema/messages.js";
import { saveSingleRecord, updateRecordByColumnValue, updateRecordById, } from "../services/db/base-db-service.js";
export async function insertNewDirectMessage(senderId, receiverId, message) {
    const msg = {
        sender_id: senderId,
        receiver_id: receiverId,
        message,
    };
    // return await saveSingleRecord<DirectMessage>(direct_messages, msg);
}
export async function updateDeliveryStatus(id, status) {
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
export async function insertNewMessage(conversationId, senderId, content) {
    const msgRecord = {
        conversation_id: conversationId,
        sender_id: senderId,
        content,
    };
    return await saveSingleRecord(messages, msgRecord);
}
export async function updateMessageAsSent(id, userId) {
    const msgStatusRecord = {
        message_id: id,
        status: "sent",
        user_id: userId,
    };
    await saveSingleRecord(message_status, msgStatusRecord);
}
export async function updateMessageAsDelivered(id, userId) {
    const deliveredAt = new Date();
    await updateRecordByColumnValue(message_status, "id", id, {
        status: "delivered",
    });
}
