import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableName,
  inArray,
  sql,
} from "drizzle-orm";

import type {
  DBNewRecord,
  DBNewRecords,
  DBTable,
  DBTableRow,
  InQueryData,
  OrderByQueryData,
  PaginationInfo,
  Transaction,
  UpdateRecordData,
  WhereQueryData,
} from "../../types/db.types.js";

import db from "../../db/db-connection.js";
import {
  executeQuery,
  prepareInQueryCondition,
  prepareOrderByQueryConditions,
  prepareSelectColumnsForQuery,
  prepareWhereQueryConditions,
} from "../../utils/db-utils.js";

// type SelectedKeys<T, K extends keyof T> = {
//   [P in K]: T[P];
// };

async function getRecordById<R extends DBTableRow, C extends keyof R = keyof R>(
  table: DBTable,
  id: number,
  columnsToSelect?: any
): Promise<R | Pick<R, C> | null> {
  const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect);

  const result = columnsRequired
    ? await db.select(columnsRequired).from(table).where(eq(table.id, id))
    : await db.select().from(table).where(eq(table.id, id));

  if (result.length === 0) {
    return null;
  }

  if (columnsRequired) {
    return result[0] as Pick<R, C>;
    // return result[0] as SelectedKeys<R, C>
    // return result[0] as Record<C, any>
  }

  return result[0] as R;
}

async function getRecordsConditionally<
  R extends DBTableRow,
  C extends keyof R = keyof R
>(
  table: DBTable,
  whereQueryData?: WhereQueryData<R>,
  columnsToSelect?: any,
  orderByQueryData?: OrderByQueryData<R>,
  inQueryData?: InQueryData<R>,
  trx?: Transaction
) {
  const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect);
  const whereConditions = prepareWhereQueryConditions(table, whereQueryData);
  const inQueryCondition = prepareInQueryCondition(table, inQueryData);
  const orderByConditions = prepareOrderByQueryConditions(
    table,
    orderByQueryData
  );

  const whereQuery = whereConditions ? and(...whereConditions) : null;

  const results = await executeQuery<R, C>(
    table,
    whereQuery,
    columnsRequired,
    orderByConditions,
    inQueryCondition,
    undefined,
    trx
  );

  return results;
}

async function getPaginatedRecordsConditionally<
  R extends DBTableRow,
  C extends keyof R = keyof R
>(
  table: DBTable,
  page: number,
  pageSize: number,
  orderByQueryData?: OrderByQueryData<R>,
  whereQueryData?: WhereQueryData<R>,
  columnsToSelect?: any,
  inQueryData?: InQueryData<R>
) {
  let countQuery = db
    .select({ total: count(table.id) })
    .from(table)
    .$dynamic();

  if (whereQueryData && inQueryData) {
    // Case 1: Both where and in query data exist
    const whereConditions = prepareWhereQueryConditions(table, whereQueryData);
    const inQueryCondition = prepareInQueryCondition(table, inQueryData);

    if (whereConditions && whereConditions.length > 0 && inQueryCondition) {
      // Both conditions are valid - combine them with AND
      countQuery = countQuery.where(
        and(and(...whereConditions), inQueryCondition)
      );
    }
  } else if (whereQueryData) {
    // Case 2: Only where query data exists
    const whereConditions = prepareWhereQueryConditions(table, whereQueryData);
    if (whereConditions && whereConditions.length > 0) {
      countQuery = countQuery.where(and(...whereConditions));
    }
  }

  const recordsCount = await countQuery;
  const total_records = recordsCount[0]?.total || 0;
  const total_pages = Math.ceil(total_records / pageSize) || 1;

  const pagination_info: PaginationInfo = {
    total_records,
    total_pages,
    page_size: pageSize,
    current_page: page > total_pages ? total_pages : page,
    next_page: page >= total_pages ? null : page + 1,
    prev_page: page <= 1 ? null : page - 1,
  };

  if (total_records === 0) {
    return {
      pagination_info,
      records: [],
    };
  }

  const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect);
  const whereConditions = prepareWhereQueryConditions(table, whereQueryData);
  const orderByConditions = prepareOrderByQueryConditions(
    table,
    orderByQueryData
  );
  const inQueryCondition = prepareInQueryCondition(table, inQueryData);

  const whereQuery = whereConditions ? and(...whereConditions) : null;

  const paginationData = { page, pageSize };
  const results = await executeQuery<R, C>(
    table,
    whereQuery,
    columnsRequired,
    orderByConditions,
    inQueryCondition,
    paginationData
  );

  return {
    pagination_info,
    records: results,
  };
}

async function getMultipleRecordsByAColumnValue<
  R extends DBTableRow,
  C extends keyof R = keyof R
>(
  table: DBTable,
  column: C,
  value: any,
  columnsToSelect?: any,
  orderByQueryData?: OrderByQueryData<R>,
  inQueryData?: InQueryData<R>
) {
  const whereQueryData: WhereQueryData<R> = {
    columns: [column],
    values: [value],
  };

  const results = await getRecordsConditionally<R, C>(
    table,
    whereQueryData,
    columnsToSelect,
    orderByQueryData,
    inQueryData
  );
  return results;
}

async function getMultipleRecordsByMultipleColumnValues<
  R extends DBTableRow,
  C extends keyof R = keyof R
>(
  table: DBTable,
  columns: C[],
  values: any[],
  columnsToSelect?: any,
  orderByQueryData?: OrderByQueryData<R>,
  inQueryData?: InQueryData<R>
) {
  const whereQueryData: WhereQueryData<R> = {
    columns,
    values,
  };

  const results = await getRecordsConditionally<R, C>(
    table,
    whereQueryData,
    columnsToSelect,
    orderByQueryData,
    inQueryData
  );

  // if (!results) {
  //   return null;
  // }
  return results;
}

async function getSingleRecordByAColumnValue<
  R extends DBTableRow,
  C extends keyof R = keyof R
>(
  table: DBTable,
  column: C,
  value: any,
  columnsToSelect?: any,
  orderByQueryData?: OrderByQueryData<R>,
  inQueryData?: InQueryData<R>
) {
  const whereQueryData: WhereQueryData<R> = {
    columns: [column],
    values: [value],
  };

  const results = await getRecordsConditionally<R, C>(
    table,
    whereQueryData,
    columnsToSelect,
    orderByQueryData,
    inQueryData
  );

  if (!results) {
    return null;
  }
  return results[0];
}

async function getSingleRecordByMultipleColumnValues<
  R extends DBTableRow,
  C extends keyof R = keyof R
>(
  table: DBTable,
  columns: C[],
  values: any[],
  columnsToSelect?: any,
  orderByQueryData?: OrderByQueryData<R>,
  inQueryData?: InQueryData<R>
) {
  const whereQueryData: WhereQueryData<R> = {
    columns,
    values,
  };

  const results = await getRecordsConditionally<R, C>(
    table,
    whereQueryData,
    columnsToSelect,
    orderByQueryData,
    inQueryData
  );

  if (!results) {
    return null;
  }
  return results[0];
}

async function saveSingleRecord<R extends DBTableRow>(
  table: DBTable,
  record: DBNewRecord,
  trx?: Transaction
): Promise<R> {
  const client = trx ?? db;

  const result = await client.insert(table).values(record).returning();

  return result[0] as R;
}

async function saveRecords<R extends DBTableRow>(
  table: DBTable,
  records: DBNewRecords,
  trx?: Transaction
): Promise<R[]> {
  const client = trx ?? db; // use transaction if passed, else default db

  const recordsSaved = await client.insert(table).values(records).returning();

  return recordsSaved as R[];
}

async function updateRecordById<R extends DBTableRow>(
  table: DBTable,
  id: number,
  record: UpdateRecordData<R>,
  trx?: Transaction // ← optional trx
) {
  const client = trx ?? db; // ← fallback to db if trx not passed

  const dataWithTimeStamps = {
    id,
    ...record,
    updated_at: new Date(),
  };

  const recordUpdated = await client
    .update(table)
    .set(dataWithTimeStamps)
    .where(eq(table.id, id))
    .returning();

  return recordUpdated[0] as R;
}

async function deleteRecordById<R extends DBTableRow>(
  table: DBTable,
  id: number
) {
  const deletedRecord = await db
    .delete(table)
    .where(eq(table.id, id))
    .returning();

  return deletedRecord[0] as R;
}

async function softDeleteRecordById<R extends DBTableRow>(
  table: DBTable,
  id: number,
  record: UpdateRecordData<R>
) {
  return await db.update(table).set(record).where(eq(table.id, id)).returning();
}

async function exportData(table: DBTable, projection?: any, filters?: any) {
  const initialQuery = db.select(projection).from(table);
  let finalQuery;
  if (filters && filters.length > 0) {
    finalQuery = initialQuery.where(and(...filters));
  }
  const result = await finalQuery;
  return result;
}

async function getPaginatedRecords(
  table: DBTable,
  skip: number,
  limit: number,
  filters?: any,
  sorting?: any,
  projection?: any
) {
  let initialQuery: any = db.select(projection).from(table);

  if (filters && filters.length > 0) {
    initialQuery = initialQuery.where(and(...filters));
  }

  if (sorting) {
    const columnExpression = (table as any)[sorting.sort_by];
    if (sorting.sort_type === "asc") {
      initialQuery = initialQuery.orderBy(asc(columnExpression));
    } else {
      initialQuery = initialQuery.orderBy(desc(columnExpression));
    }
  } else {
    // @ts-ignore
    initialQuery = initialQuery.orderBy(desc(table.created_at));
  }

  const result = await initialQuery.limit(limit).offset(skip);
  return result;
}

async function getRecordsCount(table: DBTable, filters?: any) {
  const initialQuery = db.select({ total: count() }).from(table);
  let finalQuery;
  if (filters && filters.length > 0) {
    finalQuery = initialQuery.where(and(...filters));
  } else {
    finalQuery = initialQuery;
  }

  const result = await finalQuery;

  return result[0].total;
}

export async function deleteAllRecords(table: DBTable) {
  return await db.delete(table);
}

async function updateRecordByColumnValue<R extends DBTableRow>(
  table: DBTable,
  column: string,
  value: string | number,
  record: UpdateRecordData<R>,
  id?: number
) {
  const dataWithTimeStamps = { id, ...record, updated_at: new Date() };
  const columnInfo = sql.raw(`${getTableName(table)}.${column}`);
  return await db
    .update(table)
    .set(dataWithTimeStamps)
    .where(eq(columnInfo, value));
}

async function updateRecordByMultipleColumnValues<
  R extends DBTableRow,
  C extends keyof R = keyof R
>(
  table: DBTable,
  columns: C[],
  values: any[],
  record: UpdateRecordData<R>,
  id?: number,
  trx?: Transaction
) {
  const client = trx ?? db;

  const whereQueryData: WhereQueryData<R> = {
    columns,
    values,
  };

  const dataWithTimeStamps = { id, ...record, updated_at: new Date() };
  const whereConditions = whereQueryData.columns.map((column, index) =>
    eq(
      sql.raw(`${getTableName(table)}.${String(column)}`),
      whereQueryData.values[index]
    )
  );

  return await client
    .update(table)
    .set(dataWithTimeStamps)
    .where(and(...whereConditions));
}

async function updateMultipleRecordsByIds<R extends DBTableRow>(
  table: DBTable,
  ids: number[],
  record: Partial<R>
) {
  const updatedRecords = await db
    .update(table)
    .set(record)
    .where(inArray(table.id, ids))
    .returning();

  return updatedRecords.length;
}

async function updateRecordsByColumnsAndIn<T>(
  table: any,
  columns: string[],
  values: any[],
  inColumn: string,
  inValues: any[],
  updateData: Partial<T>
) {
  const whereConditions = columns.map((col, idx) =>
    eq(sql.raw(`${getTableName(table)}.${col}`), values[idx])
  );
  whereConditions.push(
    inArray(sql.raw(`${getTableName(table)}.${inColumn}`), inValues)
  );

  return db
    .update(table)
    .set(updateData)
    .where(and(...whereConditions));
}
//  Newly added functions
async function deleteRecordsByAColumnValue(
  table: DBTable,
  column: string,
  value: string | number
) {
  const columnInfo = sql.raw(`${getTableName(table)}.${column}`);
  return await db.delete(table).where(eq(columnInfo, value));
}

export {
  db,
  deleteRecordById,
  deleteRecordsByAColumnValue,
  exportData,
  getMultipleRecordsByAColumnValue,
  getMultipleRecordsByMultipleColumnValues,
  getPaginatedRecords,
  getPaginatedRecordsConditionally,
  getRecordById,
  getRecordsConditionally,
  getRecordsCount,
  getSingleRecordByAColumnValue,
  getSingleRecordByMultipleColumnValues,
  saveRecords,
  saveSingleRecord,
  softDeleteRecordById,
  updateMultipleRecordsByIds,
  updateRecordByColumnValue,
  updateRecordById,
  updateRecordByMultipleColumnValues,
  updateRecordsByColumnsAndIn,
};
