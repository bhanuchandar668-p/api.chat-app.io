export interface SuccessResp {
  success: boolean;
  status_code: number;
  message: string;
  data?: any;
}

export type ActionType = string;

export type AppResp = any;

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
  content: string;
}

export interface MessageReadPayload {
  messageId: string;
}

export interface TypingPayload {
  chatId: string;
  receiverId: string;
}
