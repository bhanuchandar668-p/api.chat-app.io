import type { Context } from "hono";
import factory from "../factory.js";
import { sendResponse } from "../utils/resp-utils.js";
import {
  getSingleRecordByAColumnValue,
  saveSingleRecord,
} from "../services/db/base-db-service.js";
import { users, type User } from "../db/schema/users.js";
import ConflictException from "../exceptions/conflict-exception.js";
import argon2 from "argon2";
import NotFoundException from "../exceptions/not-found-exception.js";
import BadRequestException from "../exceptions/bad-request-exception.js";
import {
  LOGIN_DONE,
  PASSWORD_INVALID,
  SIGN_UP_DONE,
  USER_ALREADY_EXISTS,
  USER_NOT_FOUND,
} from "../constants/app-messages.js";
import { validateReq } from "../validations/validate-req.js";
import type { ValidatedSignUp } from "../validations/schema/v-signup-schema.js";
import type { ValidatedSignIn } from "../validations/schema/v-signin-schema.js";
import { setCookie } from "hono/cookie";
import { generateLoginTokensAndSaveToDB } from "../helpers/auth-helper.js";
import { appConfig } from "../config/app-config.js";

export class AuthHandlers {
  signUpHandlers = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();

    const validData = await validateReq<ValidatedSignUp>(
      "auth:signup",
      reqData,
      "Validation failed"
    );

    const existedUser = await getSingleRecordByAColumnValue<User>(
      users,
      "email",
      validData.email
    );

    if (existedUser) {
      throw new ConflictException(USER_ALREADY_EXISTS);
    }

    const hashedPassword = await argon2.hash(reqData.password);

    const userData = await saveSingleRecord<User>(users, {
      ...reqData,
      password: hashedPassword,
    });

    const { password, ...resp } = userData;

    return sendResponse(c, 201, SIGN_UP_DONE, resp);
  });

  signInHandlers = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();

    const validData = await validateReq<ValidatedSignIn>(
      "auth:signin",
      reqData,
      "Validation failed"
    );

    const user = await getSingleRecordByAColumnValue<User>(
      users,
      "email",
      validData.email
    );

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    const isValidPassword = await argon2.verify(
      user.password,
      validData.password
    );

    if (!isValidPassword) {
      throw new BadRequestException(PASSWORD_INVALID);
    }

    const { password, ...resp } = user;

    const tokensData = await generateLoginTokensAndSaveToDB(user.id);

    setCookie(c, "ATHID", tokensData.access_token, {
      domain: appConfig.cookie_domain,
      httpOnly: true,
    });

    return sendResponse(c, 200, LOGIN_DONE, { ...resp, ...tokensData });
  });
}
