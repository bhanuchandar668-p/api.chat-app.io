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

export class AuthHandlers {
  signUpHandlers = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();

    const email = reqData.email;

    const existedUser = await getSingleRecordByAColumnValue<User>(
      users,
      "email",
      email
    );

    if (existedUser) {
      throw new ConflictException("User already exists");
    }

    const hashedPassword = await argon2.hash(reqData.password);

    const newUser = await saveSingleRecord<User>(users, {
      ...reqData,
      password: hashedPassword,
    });

    const { password, ...resp } = newUser;

    return sendResponse(c, 200, "Sign up successful", resp);
  });

  signInHandlers = factory.createHandlers(async (c: Context) => {
    const reqData = await c.req.json();

    const user = await getSingleRecordByAColumnValue<User>(
      users,
      "email",
      reqData.email
    );

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isValidPassword = await argon2.verify(
      user.password,
      reqData.password
    );

    if (!isValidPassword) {
      throw new BadRequestException("Invalid password");
    }

    const { password, ...resp } = user;

    return sendResponse(c, 200, "Sign in successful", resp);
  });
}
