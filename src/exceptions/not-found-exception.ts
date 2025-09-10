import { DEF_404, NAME_404 } from "../constants/app-messages.js";
import BaseException from "./base-exception.js";

class NotFoundException extends BaseException {
  constructor(message?: string, errCode?: string, errData?: any) {
    super(404, message || DEF_404, NAME_404, true, errData, errCode);
  }
}

export default NotFoundException;
