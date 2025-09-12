import { users } from "../db/schema/users.js";
import factory from "../factory.js";
import isAuthorized from "../middlewares/is-authorized.js";
import { getPaginatedRecordsConditionally, getRecordsConditionally, getSingleRecordByAColumnValue, } from "../services/db/base-db-service.js";
import { sendResponse } from "../utils/resp-utils.js";
import { INVALID_USER_ID, USER_NOT_FOUND, USERS_FETCHED, } from "../constants/app-messages.js";
import NotFoundException from "../exceptions/not-found-exception.js";
import BadRequestException from "../exceptions/bad-request-exception.js";
export class UserHandlers {
    getAllUsersHandlers = factory.createHandlers(isAuthorized, async (c) => {
        const page = +c.req.query("page") || 1;
        const pageSize = +c.req.query("page_size") || 10;
        const searchString = c.req.query("search_string") || null;
        const user = c.get("user");
        if (!user) {
            throw new NotFoundException(USER_NOT_FOUND);
        }
        const whereQueryData = {
            columns: [],
            values: [],
        };
        const orderByQueryData = {
            columns: ["id"],
            values: ["desc"],
        };
        if (searchString) {
            whereQueryData.columns.push("first_name");
            whereQueryData.values.push(`%${searchString}%`);
            whereQueryData.columns.push("last_name");
            whereQueryData.values.push(`%${searchString}%`);
        }
        const columnsToSelect = ["id", "first_name", "last_name", "email"];
        const userResp = await getPaginatedRecordsConditionally(users, page, pageSize, orderByQueryData, whereQueryData, columnsToSelect);
        return sendResponse(c, 200, USERS_FETCHED, userResp);
    });
    getUserByIdHandlers = factory.createHandlers(isAuthorized, async (c) => {
        const userId = c.req.param("id");
        if (!userId) {
            throw new BadRequestException(INVALID_USER_ID);
        }
        const userRecord = await getSingleRecordByAColumnValue(users, "id", userId);
        if (!userRecord) {
            throw new NotFoundException(USER_NOT_FOUND);
        }
        const { password, ...resp } = userRecord;
        return sendResponse(c, 200, USERS_FETCHED, resp);
    });
}
