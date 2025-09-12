import factory from "../factory.js";
import { getUserDetailsFromToken } from "../utils/jwt-utils.js";
const isAuthorized = factory.createMiddleware(async (c, next) => {
    const userDetails = await getUserDetailsFromToken(c);
    c.set("user", userDetails);
    await next();
});
export default isAuthorized;
