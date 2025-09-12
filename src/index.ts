import { serve } from "@hono/node-server";

import { app } from "./app.js";
import { appConfig } from "./config/app-config.js";

import { injectSocket } from "./ws/socket-connection.js"; // your Socket.IO injector

const port = appConfig.port;

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on ${info.port}`);
  }
);

injectSocket(server);
