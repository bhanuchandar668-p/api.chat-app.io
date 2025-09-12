import factory from "../factory.js";
import { ConversationHandlers } from "../handlers/conversation-handlers.js";

const convoRouter = factory.createApp();

const convoHandlers = new ConversationHandlers();

convoRouter.post("/", ...convoHandlers.createConversation);
convoRouter.get("/", ...convoHandlers.getAllConversations);

export default convoRouter;
