import { DEF_409, NAME_409 } from "../constants/app-messages.js";
import BaseException from "./base-exception.js";

class ConflictException extends BaseException {
  constructor(message?: string, errCode?: string, errData?: any) {
    super(409, message || DEF_409, NAME_409, true, errData, errCode);
  }
}

export default ConflictException;
