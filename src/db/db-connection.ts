import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

const dbClient = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle({ client: dbClient });

export default db;
