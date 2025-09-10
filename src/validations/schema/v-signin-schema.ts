/* eslint-disable style/arrow-parens */
import type { InferOutput } from "valibot";

import {
  email,
  maxLength,
  minLength,
  nonEmpty,
  object,
  pipe,
  string,
  transform,
} from "valibot";

import {
  EMAIL_INVALID,
  EMAIL_MUST_BE_STR,
  EMAIL_REQ,
  PASSWORD_SHORT,
  PASSWRD_MUST_BE_STR,
  PASSWRD_REQ,
} from "../../constants/app-messages.js";

export const VSignInSchema = object({
  email: pipe(
    string(EMAIL_MUST_BE_STR),
    nonEmpty(EMAIL_REQ),
    transform((val) => val?.trim()),
    email(EMAIL_INVALID)
  ),
  password: pipe(
    string(PASSWRD_MUST_BE_STR),
    nonEmpty(PASSWRD_REQ),
    transform((val: string) => val?.trim()),
    minLength(8, PASSWORD_SHORT)
  ),
});

export type ValidatedSignIn = InferOutput<typeof VSignInSchema>;
