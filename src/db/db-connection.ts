import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import fs from "node:fs";
import { dbConfig } from "../config/app-config.js";

const { Pool } = pg;

const dbClient = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.name,
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync(`${process.cwd()}/ca.pem`).toString(),
  },
});

const db = drizzle({ client: dbClient });

export default db;
