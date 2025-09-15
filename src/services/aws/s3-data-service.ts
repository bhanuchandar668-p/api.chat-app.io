import type { StatusCode } from "hono/utils/http-status";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { PresignedUrlOptions } from "../../types/app.types.js";

import S3ErrorException from "../../exceptions/s3-exception.js";
import { s3Config } from "../../config/app-config.js";

export class S3DataServiceProvider {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly expireInSeconds: number;

  constructor() {
    this.client = new S3Client({
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
      region: s3Config.region,
      endpoint:
        "https://4f6e0cc9ef804eba7db4a4cfbf4e0a52.r2.cloudflarestorage.com",
    });
    this.bucketName = s3Config.bucket;
    this.expireInSeconds = 36000;
  }

  async getPresignedUrl(
    key: string,
    options: PresignedUrlOptions = {}
  ): Promise<string> {
    try {
      const { method = "put", contentType, isPublic = false } = options;

      const params: any = {
        Bucket: this.bucketName,
        Key: key,
      };

      if (method === "put") {
        params.ContentType = contentType || "application/x-www-form-urlencoded";
      }

      if (isPublic) {
        params.ACL = "public-read";
      }

      const command =
        method === "put"
          ? new PutObjectCommand(params)
          : new GetObjectCommand(params);

      const url = await getSignedUrl(this.client, command, {
        expiresIn: this.expireInSeconds,
      });

      return url;
    } catch (err: any) {
      if (err instanceof S3ServiceException) {
        const statusCode: StatusCode = err.$metadata
          .httpStatusCode as StatusCode;

        throw new S3ErrorException(
          statusCode,
          err.message,
          "S3Error",
          true,
          err
        );
      }
      throw err;
    }
  }
}
