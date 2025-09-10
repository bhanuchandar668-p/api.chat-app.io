import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import type { AppResp, SuccessResp } from "../types/app.types.js";

export function sendResponse<T extends AppResp>(
  c: Context,
  status: ContentfulStatusCode,
  message: string,
  data?: T
) {
  c.status(status);

  const resp: SuccessResp = {
    success: true,
    status_code: status,
    message,
    data,
  };

  return c.json(resp);
}

export function notFoundResp(c: Context) {
  c.status(404);

  const resp = {
    success: false,
    status_code: 404,
    message: `Request not found: ${c.req.method} ${c.req.path}`,
  };

  return c.json(resp);
}
