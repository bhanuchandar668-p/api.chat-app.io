export function sendResponse(c, status, message, data) {
    c.status(status);
    const resp = {
        success: true,
        status_code: status,
        message,
        data,
    };
    return c.json(resp);
}
export function notFoundResp(c) {
    c.status(404);
    const resp = {
        success: false,
        status_code: 404,
        message: `Request not found: ${c.req.method} ${c.req.path}`,
    };
    return c.json(resp);
}
