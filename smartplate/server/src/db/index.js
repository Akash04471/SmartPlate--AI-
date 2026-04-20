
import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from '../config/env.js';
import * as schema from "./schema.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// We removed the immediate pool.connect() check to prevent Vercel startup crashes.
// Database errors will now be handled during active request cycles.

export const db = drizzle(pool, { schema });