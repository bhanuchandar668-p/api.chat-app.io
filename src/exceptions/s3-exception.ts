import type { StatusCode } from "hono/utils/http-status";

import BaseException from "./base-exception.js";

class S3ErrorException extends BaseException {
  constructor(
    status: StatusCode,
    message: string,
    name: string,
    isOperational: boolean,
    errData?: any
  ) {
    super(status, message, name, isOperational, errData);
  }
}

export default S3ErrorException;
