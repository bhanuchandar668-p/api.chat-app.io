import type { Context } from "hono";
import factory from "../factory.js";
import isAuthorized from "../middlewares/is-authorized.js";
import { sendResponse } from "../utils/resp-utils.js";
import BadRequestException from "../exceptions/bad-request-exception.js";
import {
  INVALID_USER_ID,
  MESSAGES_FETCHED,
  MESSAGES_MARKED_READ,
  UNREAD_COUNT_FETCHED,
} from "../constants/app-messages.js";
import type { OrderByQueryData, WhereQueryData } from "../types/db.types.js";
import { getPaginatedRecordsConditionally } from "../services/db/base-db-service.js";
import { messages, type Message } from "../db/schema/messages.js";

export class MessageHandlers {
  getAllMessagesByConversationId = factory.createHandlers(
    isAuthorized,
    async (c: Context) => {
      const conversationId = c.req.param("id")!;
      const page = +c.req.query("page")! || 1;
      const pageSize = +c.req.query("page_size")! || 10;

      const whereQueryData: WhereQueryData<Message> = {
        columns: ["conversation_id"],
        values: [conversationId],
      };
      const orderByQueryData: OrderByQueryData<Message> = {
        columns: ["created_at"],
        values: ["desc"],
      };

      const resp = await getPaginatedRecordsConditionally(
        messages,
        page,
        pageSize,
        whereQueryData,
        orderByQueryData
      );

      return sendResponse(c, 200, MESSAGES_FETCHED, resp);
    }
  );

  markMessagesAsRead = factory.createHandlers(
    isAuthorized,
    async (c: Context) => {
      const conversationId = c.req.param("id")!;

      return sendResponse(c, 200, MESSAGES_MARKED_READ);
    }
  );
}
