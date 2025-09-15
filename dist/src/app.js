import { logger } from "hono/logger";
import { DEF_ERROR_RESP, DEF_SERVICE_RUNNING, DEF_STATUS_CODE, } from "./constants/app-messages.js";
import { notFoundResp, sendResponse } from "./utils/resp-utils.js";
import { cors } from "hono/cors";
import factory from "./factory.js";
import { appConfig } from "./config/app-config.js";
import authRouter from "./routes/auth-router.js";
import userRouter from "./routes/user-router.js";
import convoRouter from "./routes/conversation-router.js";
import msgRouter from "./routes/message-router.js";
import fileRouter from "./routes/file-router.js";
const apiVer = appConfig.apiVersion;
const app = factory.createApp().basePath(`/v${apiVer}`);
app.use("/*", cors());
app.use(logger());
app.get("/", (c) => {
    return sendResponse(c, 200, DEF_SERVICE_RUNNING);
});
// Routes
app.route("/auth", authRouter);
app.route("/users", userRouter);
app.route("/conversations", convoRouter);
app.route("/messages", msgRouter);
app.route("/files", fileRouter);
app.onError((err, c) => {
    c.status(err.status || DEF_STATUS_CODE);
    console.error(err);
    const errResp = {
        success: false,
        status_code: err.status || DEF_STATUS_CODE,
        message: err?.message || DEF_ERROR_RESP,
        err_data: err.errData || undefined,
        err_code: err.errCode || undefined,
        timestamp: new Date().toISOString(),
    };
    return c.json(errResp);
});
app.notFound(notFoundResp);
export default app;
