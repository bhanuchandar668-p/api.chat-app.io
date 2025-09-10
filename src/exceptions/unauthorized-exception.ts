import { DEF_401, NAME_401 } from "../constants/app-messages.js";
import BaseException from "./base-exception.js";

class UnauthorizedException extends BaseException {
  constructor(message: string, errCode?: string, errData?: any) {
    super(401, message || DEF_401, NAME_401, true, errData, errCode);
  }
}

export default UnauthorizedException;
