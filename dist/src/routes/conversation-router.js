import factory from "../factory.js";
import { ConversationHandlers } from "../handlers/conversation-handlers.js";
import { MessageHandlers } from "../handlers/message-handlers.js";
const convoRouter = factory.createApp();
const convoHandlers = new ConversationHandlers();
const messageHandlers = new MessageHandlers();
convoRouter.post("/", ...convoHandlers.createConversation);
convoRouter.get("/", ...convoHandlers.getAllConversations);
// messages
convoRouter.get("/:id/messages", ...messageHandlers.getAllMessagesByConversationId);
export default convoRouter;
