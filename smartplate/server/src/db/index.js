
import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from '../config/env.js';
import * as schema from "./schema.js";

const connectionString = (env.DATABASE_URL || "").trim();

export const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes('supabase.co') || env.NODE_ENV === "production" 
    ? { rejectUnauthorized: false } 
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

try {
  const host = new URL(connectionString).host;
  console.log("📡 Initializing DB Pool for host:", host);
} catch (e) {
  console.error("❌ Failed to parse DATABASE_URL host");
}

pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message);
});

// We removed the immediate pool.connect() check to prevent Vercel startup crashes.
// Database errors will now be handled during active request cycles.

export const db = drizzle(pool, { schema });