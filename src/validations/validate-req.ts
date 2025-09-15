import { flatten, safeParseAsync } from "valibot";

import UnprocessableContentException from "../exceptions/unprocessable-content-exception.js";
import type { AppActivity, ValidatedRequest } from "../types/app.types.js";
import { VSignUpSchema } from "./schema/v-signup-schema.js";
import { VSignInSchema } from "./schema/v-signin-schema.js";
import {
  VDownloadFileSchema,
  VUploadFileSchema,
} from "./schema/v-file-schema.js";

export async function validateReq<T extends ValidatedRequest>(
  actionType: AppActivity,
  reqData: any,
  errMsg: string
) {
  let schema;

  switch (actionType) {
    case "auth:signup":
      schema = VSignUpSchema;
      break;
    case "auth:signin":
      schema = VSignInSchema;
      break;
    case "file:upload":
      schema = VUploadFileSchema;
      break;
    case "file:download":
      schema = VDownloadFileSchema;
      break;
    default:
  }

  const validResp = await safeParseAsync(schema!, reqData, {
    abortEarly: true,
  });

  if (!validResp.success) {
    const errData = flatten(validResp.issues).nested;

    throw new UnprocessableContentException(errMsg, errData);
  }

  return validResp.output as T;
}
