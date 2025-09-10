class BaseException extends Error {
    status;
    isOperational;
    errData;
    errCode;
    constructor(status, message, name, isOperational, errData, errCode) {
        super(message);
        this.status = status;
        this.name = name;
        this.isOperational = isOperational;
        this.errData = errData;
        this.errCode = errCode;
    }
}
export default BaseException;
