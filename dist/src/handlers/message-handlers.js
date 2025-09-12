import factory from "../factory.js";
import isAuthorized from "../middlewares/is-authorized.js";
import { sendResponse } from "../utils/resp-utils.js";
import BadRequestException from "../exceptions/bad-request-exception.js";
import { INVALID_USER_ID, MESSAGES_FETCHED, MESSAGES_MARKED_READ, UNREAD_COUNT_FETCHED, } from "../constants/app-messages.js";
import { getPaginatedRecordsConditionally, updateMultipleRecordsByIds, } from "../services/db/base-db-service.js";
import { messages } from "../db/schema/messages.js";
import { fetchAllMessagesWithStatus, fetchUnreadMessages, } from "../services/db/conversation-service.js";
import { message_status } from "../db/schema/message-status.js";
export class MessageHandlers {
    getAllMessagesByConversationId = factory.createHandlers(isAuthorized, async (c) => {
        const conversationId = +c.req.param("id");
        const page = +c.req.query("page") || 1;
        const pageSize = +c.req.query("page_size") || 50;
        const authUser = c.get("user");
        const resp = await fetchAllMessagesWithStatus(conversationId, +authUser.id, page, pageSize);
        return sendResponse(c, 200, MESSAGES_FETCHED, resp);
    });
    markMessagesAsRead = factory.createHandlers(isAuthorized, async (c) => {
        const conversationId = +c.req.param("id");
        const authUser = c.get("user");
        const unreadMessages = await fetchUnreadMessages(conversationId, authUser.id);
        const messageIds = unreadMessages.map((message) => message.id);
        if (unreadMessages.length > 0) {
            await updateMultipleRecordsByIds(message_status, messageIds, {
                status: "read",
            });
        }
        return sendResponse(c, 200, MESSAGES_MARKED_READ);
    });
}
