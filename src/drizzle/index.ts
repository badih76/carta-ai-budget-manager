// db/index.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL system environmental target pointer variables inside .env.local');
}

// Global cached connection context pattern for NextJS live hot-reloads
const globalForDb = globalThis as unknown as {
  conn: mysql.Pool | undefined;
};

const connection = globalForDb.conn ?? mysql.createPool(connectionString);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = connection;
}

export const db = drizzle(connection, { schema, mode: 'default' });