import { and, eq, getTableName, inArray, isNull, sql } from "drizzle-orm";
import db from "../db/db-connection.js";
function prepareSelectColumnsForQuery(table, columnsToSelect) {
    if (!columnsToSelect) {
        return null;
    }
    if (columnsToSelect.length === 0) {
        return {};
    }
    const columnsForQuery = {};
    // loop through columns and prepare the select query object
    columnsToSelect.map((column) => {
        return (columnsForQuery[column] = sql.raw(`${getTableName(table)}.${column}`));
    });
    return columnsForQuery;
}
function prepareWhereQueryConditions(table, whereQueryData) {
    if (whereQueryData &&
        Object.keys(whereQueryData).length > 0 &&
        whereQueryData.columns.length > 0) {
        const { columns, values, operators } = whereQueryData;
        const whereQueries = [];
        for (let i = 0; i < columns.length; i++) {
            const columnInfo = sql.raw(`${getTableName(table)}.${columns[i]}`);
            if (typeof values[i] === "string" && values[i].includes("%")) {
                whereQueries.push(sql `${columnInfo} ILIKE ${values[i]}`);
            }
            else if (columns[i] === "deleted_at") {
                whereQueries.push(isNull(columnInfo));
            }
            else if (columns[i] === "visible_to" && typeof values[i] === "number") {
                // Filter records where the JSONB array contains the specified user ID
                whereQueries.push(sql `${columnInfo} @> ${sql.raw(`'[${values[i]}]'::jsonb`)}`);
            }
            else if (typeof values[i] === "object" && values[i] !== null) {
                const value = values[i];
                if (value.gte && value.lte) {
                    whereQueries.push(sql `${columnInfo} BETWEEN ${value.gte} AND ${value.lte}`);
                }
                else if (value.gte) {
                    whereQueries.push(sql `${columnInfo} >= ${value.gte}`);
                }
                else if (value.lte) {
                    whereQueries.push(sql `${columnInfo} <= ${value.lte}`);
                }
            }
            else {
                whereQueries.push(eq(columnInfo, values[i]));
            }
        }
        return whereQueries;
    }
    return null;
}
function prepareOrderByQueryConditions(table, orderByQueryData) {
    const orderByQueries = [];
    if (!orderByQueryData ||
        Object.keys(orderByQueryData).length === 0 ||
        orderByQueryData.columns.length === 0) {
        const orderByQuery = sql.raw(`${getTableName(table)}.id desc`);
        orderByQueries.push(orderByQuery);
    }
    if (orderByQueryData &&
        Object.keys(orderByQueryData).length > 0 &&
        orderByQueryData.columns.length > 0) {
        const { columns, values } = orderByQueryData;
        for (let i = 0; i < columns.length; i++) {
            const orderByQuery = sql.raw(`${getTableName(table)}.${columns[i]} ${values[i]}`);
            orderByQueries.push(orderByQuery);
        }
    }
    return orderByQueries;
}
function prepareInQueryCondition(table, inQueryData) {
    if (inQueryData &&
        Object.keys(inQueryData).length > 0 &&
        inQueryData.values.length > 0) {
        const columnInfo = sql.raw(`${getTableName(table)}.${inQueryData.key}`);
        const inQuery = inArray(columnInfo, inQueryData.values);
        return inQuery;
    }
    return null;
}
async function executeQuery(table, whereQuery, columnsRequired, orderByConditions, inQueryCondition, paginationData, trx) {
    let dQuery = columnsRequired
        ? db.select(columnsRequired).from(table).$dynamic()
        : db.select().from(table).$dynamic();
    if (whereQuery && inQueryCondition) {
        dQuery = dQuery.where(and(whereQuery, inQueryCondition));
    }
    else if (whereQuery) {
        dQuery = dQuery.where(whereQuery);
    }
    else if (inQueryCondition) {
        dQuery = dQuery.where(inQueryCondition);
    }
    dQuery = dQuery.orderBy(...orderByConditions);
    if (paginationData) {
        const { page, pageSize } = paginationData;
        dQuery = dQuery.limit(pageSize).offset((page - 1) * pageSize);
    }
    const results = trx ? await trx.execute(dQuery) : await dQuery;
    if (columnsRequired) {
        return results;
    }
    return results;
}
function parseOrderByQuery(orderBy, defaultColumn = "created_at", defaultDirection = "desc") {
    // Default orderBy configuration
    let orderByQueryData = {
        columns: [defaultColumn],
        values: [defaultDirection],
    };
    if (orderBy) {
        const orderByColumns = [];
        const orderByValues = [];
        // Split by comma for multiple ordering criteria
        const queryStrings = orderBy.split(",");
        // Process each ordering criterion
        queryStrings.forEach((queryString) => {
            const [column, value] = queryString.split(":");
            orderByColumns.push(column);
            orderByValues.push(value);
        });
        // Update the orderByQueryData with parsed values
        orderByQueryData = {
            columns: orderByColumns,
            values: orderByValues,
        };
    }
    return orderByQueryData;
}
export { executeQuery, parseOrderByQuery, prepareInQueryCondition, prepareOrderByQueryConditions, prepareSelectColumnsForQuery, prepareWhereQueryConditions, };
