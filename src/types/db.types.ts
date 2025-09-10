import type db from "../db/db-connection.js";
import type { NewUser, User, UserTable } from "../db/schema/users.js";

export type DBTable = UserTable;

export type DBTableRow = User;

export type DBNewRecord = NewUser;

export type DBNewRecords = NewUser[];

export type DBTableColumns<T extends DBTableRow> = keyof T;

export type SortDirection = "asc" | "desc";

export interface WhereQueryData<T extends DBTableRow> {
  columns: Array<keyof T>;
  values: any[];
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
