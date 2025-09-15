import type {
  ValidatedFileDownload,
  ValidatedFileUpload,
} from "../validations/schema/v-file-schema.js";
import type { ValidatedSignIn } from "../validations/schema/v-signin-schema.js";
import type { ValidatedSignUp } from "../validations/schema/v-signup-schema.js";

export interface SuccessResp {
  success: boolean;
  status_code: number;
  message: string;
  data?: any;
}

export type ActionType = string;

export type AppResp = any;

export interface JWTUserPayload {
  sub: number;
  iat: number;
}

export type AuthActivity = "auth:signup" | "auth:signin";

export type FileActivity = "file:upload" | "file:download";

export type AppActivity = AuthActivity | FileActivity;

export type ValidatedRequest =
  | ValidatedSignUp
  | ValidatedSignIn
  | ValidatedFileUpload
  | ValidatedFileDownload;

export type WsEventType =
  | "message:send"
  | "message:read"
  | "typing:start"
  | "typing:stop";

export interface WsMessage<T = any> {
  type: WsEventType;
  payload: T;
}

export interface MessageSendPayload {
  receiverId: string;
  content: any;
  conversationId: string;
  messageId: string;
}

export interface MessageReadPayload {
  messageId: string;
}

export interface TypingPayload {
  conversationId: string;
  receiverId: string;
}

export interface PresignedUrlOptions {
  method?: "get" | "put";
  contentType?: string;
  isPublic?: boolean;
}
