import { DEF_400, NAME_400 } from "../constants/app-messages.js";
import BaseException from "./base-exception.js";
class BadRequestException extends BaseException {
    constructor(message, errCode, errData) {
        super(400, message || DEF_400, NAME_400, true, errData, errCode);
    }
}
export default BadRequestException;
