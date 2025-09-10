import { email, maxLength, minLength, nonEmpty, object, optional, pipe, regex, string, transform, } from "valibot";
import { EMAIL_INVALID, EMAIL_MUST_BE_STR, EMAIL_REQ, F_NAME_MUST_BE_STR, F_NAME_REQ, L_NAME_MUST_BE_STR, L_NAME_REQ, PASSWORD_SHORT, PASSWRD_MUST_BE_STR, PASSWRD_REQ, PHONE_DIG_REQ, PHONE_MUST_BE_STR, PHONE_REQ, } from "../../constants/app-messages.js";
export const VSignUpSchema = object({
    first_name: pipe(string(F_NAME_MUST_BE_STR), nonEmpty(F_NAME_REQ), transform((val) => val?.trim())),
    last_name: pipe(string(L_NAME_MUST_BE_STR), nonEmpty(L_NAME_REQ), transform((val) => val?.trim())),
    email: pipe(string(EMAIL_MUST_BE_STR), nonEmpty(EMAIL_REQ), transform((val) => val?.trim()), email(EMAIL_INVALID)),
    password: pipe(string(PASSWRD_MUST_BE_STR), nonEmpty(PASSWRD_REQ), transform((val) => val?.trim()), minLength(8, PASSWORD_SHORT)),
    phone_number: optional(pipe(string(PHONE_MUST_BE_STR), nonEmpty(PHONE_REQ), transform((val) => val?.trim()), maxLength(10, PHONE_DIG_REQ))),
});
