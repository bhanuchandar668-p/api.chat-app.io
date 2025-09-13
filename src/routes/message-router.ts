import factory from "../factory.js";
import { MessageHandlers } from "../handlers/message-handlers.js";

const messageHandlers = new MessageHandlers();
const msgRouter = factory.createApp();

msgRouter.post("/", ...messageHandlers.createMessage);

export default msgRouter;
