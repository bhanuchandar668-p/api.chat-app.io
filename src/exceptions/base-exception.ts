import type { StatusCode } from "hono/utils/http-status";

class BaseException extends Error {
  status: number;
  isOperational: boolean;
  errData: any;
  errCode: string | undefined;
  constructor(
    status: StatusCode,
    message: string,
    name: string,
    isOperational: boolean,
    errData?: any,
    errCode?: string
  ) {
    super(message);
    this.status = status;
    this.name = name;
    this.isOperational = isOperational;
    this.errData = errData;
    this.errCode = errCode;
  }
}

export default BaseException;
