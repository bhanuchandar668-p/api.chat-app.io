import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import fs from "node:fs";
import { dbConfig } from "../config/app-config.js";
import * as users from "./schema/users.js";
import * as messages from "./schema/messages.js";
import * as conversations from "./schema/conversations.js";
import * as conversation_participants from "./schema/conversation-participants.js";
import * as message_status from "./schema/message-status.js";

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

const db = drizzle({
  client: dbClient,
  schema: {
    ...users,
    ...messages,
    ...conversations,
    ...conversation_participants,
    ...message_status,
  },
});

export default db;
