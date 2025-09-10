import { DEF_403, NAME_403 } from "../constants/app-messages.js";
import BaseException from "./base-exception.js";

class ForbiddenException extends BaseException {
  constructor(message?: string, errCode?: string, errData?: any) {
    super(403, message || DEF_403, NAME_403, true, errData, errCode);
  }
}

export default ForbiddenException;
