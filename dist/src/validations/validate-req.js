import { flatten, safeParseAsync } from "valibot";
import UnprocessableContentException from "../exceptions/unprocessable-content-exception.js";
import { VSignUpSchema } from "./schema/v-signup-schema.js";
import { VSignInSchema } from "./schema/v-signin-schema.js";
export async function validateReq(actionType, reqData, errMsg) {
    let schema;
    switch (actionType) {
        case "auth:signup":
            schema = VSignUpSchema;
            break;
        case "auth:signin":
            schema = VSignInSchema;
            break;
        default:
    }
    const validResp = await safeParseAsync(schema, reqData, {
        abortEarly: true,
    });
    if (!validResp.success) {
        const errData = flatten(validResp.issues).nested;
        throw new UnprocessableContentException(errMsg, errData);
    }
    return validResp.output;
}
