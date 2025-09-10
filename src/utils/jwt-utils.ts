import type { Context } from "hono";

import { sign, verify } from "hono/jwt";
import {
  JwtTokenExpired,
  JwtTokenInvalid,
  JwtTokenSignatureMismatched,
} from "hono/utils/jwt/types";
import type { JWTUserPayload } from "../types/app.types.js";
import { jwtConfig } from "../config/app-config.js";
import UnauthorizedException from "../exceptions/unauthorized-exception.js";
import {
  DEF_400,
  TOKEN_EXPIRED,
  TOKEN_INVALID,
  TOKEN_MISSING,
  TOKEN_SIG_MISMATCH,
} from "../constants/app-messages.js";
import { getRecordById } from "../services/db/base-db-service.js";
import { users, type User } from "../db/schema/users.js";

async function genJWTTokens(payload: JWTUserPayload) {
  const access_token_expiry =
    Math.floor(Date.now() / 1000) + jwtConfig.expires_in; // 30 days

  const access_token_payload = {
    ...payload,
    exp: access_token_expiry,
  };
  const refresh_token_payload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + jwtConfig.expires_in * 3, // 90 days
  };
  const access_token = await sign(access_token_payload, jwtConfig.secret);
  const refresh_token = await sign(refresh_token_payload, jwtConfig.secret);

  return {
    access_token,
    refresh_token,
    refresh_token_expires_at: refresh_token_payload.exp,
  };
}

async function genJWTTokensForUser(userId: number) {
  // Create Payload
  const payload: JWTUserPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
  };

  // Generate Tokens
  return await genJWTTokens(payload);
}

async function verifyJWTToken(token: string) {
  try {
    const decodedPayload = await verify(token, jwtConfig.secret);

    return decodedPayload;
  } catch (error: any) {
    if (error instanceof JwtTokenInvalid) {
      throw new UnauthorizedException(TOKEN_INVALID);
    }

    if (error instanceof JwtTokenExpired) {
      throw new UnauthorizedException(TOKEN_EXPIRED);
    }

    if (error instanceof JwtTokenSignatureMismatched) {
      throw new UnauthorizedException(TOKEN_SIG_MISMATCH);
    }

    throw error;
  }
}

async function getUserDetailsFromToken(c: Context) {
  const authHeader = c.req.header("Authorization");

  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader;

  if (!token) {
    throw new UnauthorizedException(TOKEN_MISSING);
  }

  const decodedPayload = await verifyJWTToken(token);

  // Check if the user is existing in the system - in case the user is removed from the system the jwt token can still be valid
  const user = await getRecordById<User>(users, decodedPayload.sub as number);

  if (!user) {
    throw new UnauthorizedException(DEF_400);
  }

  const { password, ...userDetails } = user ?? {};

  return userDetails;
}

export {
  genJWTTokens,
  genJWTTokensForUser,
  getUserDetailsFromToken,
  verifyJWTToken,
};
