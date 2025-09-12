import { saveSingleRecord, updateRecordById, } from "../services/db/base-db-service.js";
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
