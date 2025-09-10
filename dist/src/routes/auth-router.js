import factory from "../factory.js";
import { AuthHandlers } from "../handlers/auth-handlers.js";
const authRouter = factory.createApp();
const authHandlers = new AuthHandlers();
authRouter.post("/signup", ...authHandlers.signUpHandlers);
authRouter.post("/signin", ...authHandlers.signInHandlers);
export default authRouter;
