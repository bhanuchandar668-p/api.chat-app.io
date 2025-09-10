import { DEF_422, NAME_422 } from "../constants/app-messages.js";
import BaseException from "./base-exception.js";

class UnprocessableContentException extends BaseException {
  constructor(message?: string, errData?: any, errCode?: string) {
    super(422, message || DEF_422, NAME_422, true, errData, errCode);
  }
}

export default UnprocessableContentException;
