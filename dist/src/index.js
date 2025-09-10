import { serve } from "@hono/node-server";
import { app, injectWebSocket } from "./app.js";
import { appConfig } from "./config/app-config.js";
import { wsHandler } from "./ws/ws-handlers.js";
const port = appConfig.port;
// ws endpoint
app.get("/ws", wsHandler);
const server = serve({
    fetch: app.fetch,
    port,
}, (info) => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on ${info.port}`);
});
injectWebSocket(server);
