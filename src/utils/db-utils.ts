import type { SQL } from "drizzle-orm";

import { and, eq, getTableName, inArray, isNull, sql } from "drizzle-orm";

import type {
  DBTable,
  DBTableColumns,
  DBTableRow,
  InQueryData,
  OrderByQueryData,
  SortDirection,
  Transaction,
  WhereQueryData,
} from "../types/db.types.js";

import db from "../db/db-connection.js";

function prepareSelectColumnsForQuery(table: DBTable, columnsToSelect?: any) {
  if (!columnsToSelect) {
    return null;
  }

  if (columnsToSelect.length === 0) {
    return {};
  }

  const columnsForQuery: Record<string, SQL> = {};
  // loop through columns and prepare the select query object
  columnsToSelect.map((column: string) => {
    return (columnsForQuery[column as string] = sql.raw(
      `${getTableName(table)}.${column as string}`
    ));
  });
  return columnsForQuery;
}

function prepareWhereQueryConditions<R extends DBTableRow>(
  table: DBTable,
  whereQueryData?: WhereQueryData<R>
) {
  if (
    whereQueryData &&
    Object.keys(whereQueryData).length > 0 &&
    whereQueryData.columns.length > 0
  ) {
    const { columns, values } = whereQueryData;
    const whereQueries: SQL[] = [];

    for (let i = 0; i < columns.length; i++) {
      const columnInfo = sql.raw(
        `${getTableName(table)}.${columns[i] as string}`
      );
      if (typeof values[i] === "string" && values[i].includes("%")) {
        whereQueries.push(sql`${columnInfo} ILIKE ${values[i]}`);
      } else if (columns[i] === "deleted_at") {
        whereQueries.push(isNull(columnInfo));
      } else if (columns[i] === "visible_to" && typeof values[i] === "number") {
        // Filter records where the JSONB array contains the specified user ID
        whereQueries.push(
          sql`${columnInfo} @> ${sql.raw(`'[${values[i]}]'::jsonb`)}`
        );
      } else if (typeof values[i] === "object" && values[i] !== null) {
        const value = values[i] as { gte?: Date | string; lte?: Date | string };

        if (value.gte && value.lte) {
          whereQueries.push(
            sql`${columnInfo} BETWEEN ${value.gte} AND ${value.lte}`
          );
        } else if (value.gte) {
          whereQueries.push(sql`${columnInfo} >= ${value.gte}`);
        } else if (value.lte) {
          whereQueries.push(sql`${columnInfo} <= ${value.lte}`);
        }
      } else {
        whereQueries.push(eq(columnInfo, values[i]));
      }
    }

    return whereQueries;
  }
  return null;
}

function prepareOrderByQueryConditions<R extends DBTableRow>(
  table: DBTable,
  orderByQueryData?: OrderByQueryData<R>
) {
  const orderByQueries: SQL[] = [];

  if (
    !orderByQueryData ||
    Object.keys(orderByQueryData).length === 0 ||
    orderByQueryData.columns.length === 0
  ) {
    const orderByQuery = sql.raw(`${getTableName(table)}.id desc`);
    orderByQueries.push(orderByQuery);
  }

  if (
    orderByQueryData &&
    Object.keys(orderByQueryData).length > 0 &&
    orderByQueryData.columns.length > 0
  ) {
    const { columns, values } = orderByQueryData;
    for (let i = 0; i < columns.length; i++) {
      const orderByQuery = sql.raw(
        `${getTableName(table)}.${columns[i] as string} ${values[i] as string}`
      );
      orderByQueries.push(orderByQuery);
    }
  }
  return orderByQueries;
}

function prepareInQueryCondition<R extends DBTableRow>(
  table: DBTable,
  inQueryData?: InQueryData<R>
) {
  if (
    inQueryData &&
    Object.keys(inQueryData).length > 0 &&
    inQueryData.values.length > 0
  ) {
    const columnInfo = sql.raw(
      `${getTableName(table)}.${inQueryData.key as string}`
    );
    const inQuery = inArray(columnInfo, inQueryData.values);
    return inQuery;
  }
  return null;
}

async function executeQuery<R extends DBTableRow, C extends keyof R = keyof R>(
  table: DBTable,
  whereQuery: SQL | undefined | null,
  columnsRequired: Record<string, SQL> | null,
  orderByConditions: SQL[],
  inQueryCondition: SQL | null,
  paginationData?: { page: number; pageSize: number },
  trx?: Transaction
) {
  let dQuery = columnsRequired
    ? db.select(columnsRequired).from(table).$dynamic()
    : db.select().from(table).$dynamic();

  if (whereQuery && inQueryCondition) {
    dQuery = dQuery.where(and(whereQuery, inQueryCondition));
  } else if (whereQuery) {
    dQuery = dQuery.where(whereQuery);
  } else if (inQueryCondition) {
    dQuery = dQuery.where(inQueryCondition);
  }

  dQuery = dQuery.orderBy(...orderByConditions);

  if (paginationData) {
    const { page, pageSize } = paginationData;
    dQuery = dQuery.limit(pageSize).offset((page - 1) * pageSize);
  }

  const results = trx ? await trx.execute(dQuery) : await dQuery;

  if (columnsRequired) {
    return results as Pick<R, C>[];
  }
  return results as R[];
}
function parseOrderByQuery<T extends DBTableRow>(
  orderBy: string | undefined,
  defaultColumn: DBTableColumns<T> = "created_at" as DBTableColumns<T>,
  defaultDirection: SortDirection = "desc"
): OrderByQueryData<T> {
  // Default orderBy configuration
  let orderByQueryData: OrderByQueryData<T> = {
    columns: [defaultColumn],
    values: [defaultDirection],
  };
  if (orderBy) {
    const orderByColumns: DBTableColumns<T>[] = [];
    const orderByValues: SortDirection[] = [];

    // Split by comma for multiple ordering criteria
    const queryStrings = orderBy.split(",");

    // Process each ordering criterion
    queryStrings.forEach((queryString) => {
      const [column, value] = queryString.split(":");
      orderByColumns.push(column as DBTableColumns<T>);
      orderByValues.push(value as SortDirection);
    });

    // Update the orderByQueryData with parsed values
    orderByQueryData = {
      columns: orderByColumns,
      values: orderByValues,
    };
  }

  return orderByQueryData;
}

export {
  executeQuery,
  parseOrderByQuery,
  prepareInQueryCondition,
  prepareOrderByQueryConditions,
  prepareSelectColumnsForQuery,
  prepareWhereQueryConditions,
};
