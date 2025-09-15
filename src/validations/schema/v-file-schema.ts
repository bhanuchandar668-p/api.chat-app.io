/* eslint-disable style/arrow-parens */
import type { InferOutput } from "valibot";

import { boolean, nonEmpty, object, pipe, string, transform } from "valibot";

import {
  FILE_KEY_IS_REQ,
  FILE_KEY_IS_STR,
  FILE_NAME_IS_REQ,
  FILE_NAME_IS_STR,
} from "../../constants/app-messages.js";

export const VUploadFileSchema = object({
  file_name: pipe(
    string(FILE_NAME_IS_STR),
    nonEmpty(FILE_NAME_IS_REQ),
    transform((val) => val?.trim())
  ),
  is_public: boolean(),
});

export const VDownloadFileSchema = object({
  file_key: pipe(
    string(FILE_KEY_IS_STR),
    nonEmpty(FILE_KEY_IS_REQ),
    transform((val) => val?.trim())
  ),
});

export type ValidatedFileUpload = InferOutput<typeof VUploadFileSchema>;
export type ValidatedFileDownload = InferOutput<typeof VDownloadFileSchema>;
