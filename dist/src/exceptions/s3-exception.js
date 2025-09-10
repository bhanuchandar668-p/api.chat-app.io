import BaseException from "./base-exception.js";
class S3ErrorException extends BaseException {
    constructor(status, message, name, isOperational, errData) {
        super(status, message, name, isOperational, errData);
    }
}
export default S3ErrorException;
