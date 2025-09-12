import type db from "../db/db-connection.js";
import type {
  ConversationParticipant,
  ConversationParticipantTable,
  NewConversationParticipant,
} from "../db/schema/conversation-participants.js";
import type {
  Conversation,
  ConversationTable,
  NewConversation,
} from "../db/schema/conversations.js";
import type {
  MessageStatus,
  MessageStatusTable,
  NewMessageStatus,
} from "../db/schema/message-status.js";
import type {
  Message,
  MessageTable,
  NewMessage,
} from "../db/schema/messages.js";
import type { NewUser, User, UserTable } from "../db/schema/users.js";

export type DBTable =
  | UserTable
  | ConversationTable
  | MessageTable
  | ConversationParticipantTable
  | MessageStatusTable;

export type DBTableRow =
  | User
  | Conversation
  | Message
  | ConversationParticipant
  | MessageStatus;

export type DBNewRecord =
  | NewUser
  | NewConversation
  | NewMessage
  | NewConversationParticipant
  | NewMessageStatus;

export type DBNewRecords =
  | NewUser[]
  | NewConversation[]
  | NewMessage[]
  | NewConversationParticipant[]
  | NewMessageStatus[];

export type DBTableColumns<T extends DBTableRow> = keyof T;

export type SortDirection = "asc" | "desc";

export interface WhereQueryData<T extends DBTableRow> {
  columns: Array<keyof T>;
  values: any[];
  operators?: any;
}

export interface OrderByQueryData<T extends DBTableRow> {
  columns: Array<DBTableColumns<T>>;
  values: SortDirection[];
}

export type UpdateRecordData<R extends DBTableRow> = Partial<
  Omit<R, "id" | "created_at" | "updated_at">
>;

export type UpdateRecordPartialData<R extends DBTableRow> = Partial<R>;

export interface InQueryData<T extends DBTableRow> {
  key: keyof T;
  values: any[];
}

export interface PaginationInfo {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
}

export interface PaginatedRecords<T extends DBTableRow> {
  pagination_info: PaginationInfo;
  records: T[];
}

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
