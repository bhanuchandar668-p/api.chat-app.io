import factory from "../factory.js";
import { MessageHandlers } from "../handlers/message-handlers.js";

const messageRouter = factory.createApp();

const messageHandlers = new MessageHandlers();

// messageRouter.get("/:id", ...messageHandlers.getAllMessagesByUserId);
// messageRouter.get("/unread-cnt", ...messageHandlers.getUnreadMessagesCount);
// messageRouter.post("/mark-read", ...messageHandlers.markMessagesAsRead);

export default messageRouter;
