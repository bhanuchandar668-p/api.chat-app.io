import factory from "../factory.js";
import { UserHandlers } from "../handlers/user-handlers.js";
const userRouter = factory.createApp();
const userHandlers = new UserHandlers();
userRouter.get("/", ...userHandlers.getAllUsersHandlers);
userRouter.get("/:id", ...userHandlers.getUserByIdHandlers);
export default userRouter;
