import type { Context } from "hono";
import factory from "../factory.js";
import isAuthorized from "../middlewares/is-authorized.js";
import { sendResponse } from "../utils/resp-utils.js";
import { conversations } from "../db/schema/conversations.js";
import db from "../db/db-connection.js";
import {
  checkConversationExists,
  fetchConversationParticipants,
  getConversations,
  getLastMessages,
} from "../services/db/conversation-service.js";
import { saveSingleRecord } from "../services/db/base-db-service.js";

export class ConversationHandlers {
  createConversation = factory.createHandlers(
    isAuthorized,
    async (c: Context) => {
      const reqData = await c.req.json();

      const authUser = c.get("user");

      const conversationExists = await checkConversationExists(
        authUser.id,
        +reqData.receiver_id
      );

      let conversationId = conversationExists[0]?.id;

      if (!conversationExists) {
        const newConversation = await saveSingleRecord(conversations, {
          is_group: false,
        });

        conversationId = newConversation.id;
      }

      const resp = {
        conversation_id: conversationId,
      };

      return sendResponse(c, 200, "Conversation created", resp);
    }
  );

  getAllConversations = factory.createHandlers(
    isAuthorized,
    async (c: Context) => {
      const authUser = c.get("user");

      const convos = await getConversations(+authUser.id);

      // fetch last messages for each convo
      const convoIds = convos.map((c) => c.id);

      const participants = await fetchConversationParticipants(convoIds);

      const lastMessages = await getLastMessages(convoIds);

      const result = convos.map((c) => {
        const convoParticipants = participants.filter(
          (p) => p.conversation_id === c.id
        );

        return {
          ...c,
          participants: convoParticipants.filter(
            (p) => p.user_id !== +authUser._id
          ), // exclude current user
          lastMessage:
            lastMessages.find((m) => m.conversation_id === c.id) || null,
        };
      });

      return sendResponse(c, 200, "Conversations fetched", result);
    }
  );
}
