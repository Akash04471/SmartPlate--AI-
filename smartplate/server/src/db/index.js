
import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from '../config/env.js';
import * as schema from "./schema.js";

const connectionString = (env.DATABASE_URL || "").trim();

export const pool = new pg.Pool({
  connectionString,
  // Supabase Pooler (Port 6543) and Direct (Port 5432) both work best with this SSL config on Vercel
  ssl: (connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com') || env.NODE_ENV === "production")
    ? { rejectUnauthorized: false } 
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

try {
  const urlObj = new URL(connectionString);
  console.log(`📡 DB Config: Host=${urlObj.host}, Port=${urlObj.port}, SSL=${!!pool.options.ssl}`);
} catch (e) {
  console.error("❌ Invalid DATABASE_URL format");
}

pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message);
});

// We removed the immediate pool.connect() check to prevent Vercel startup crashes.
// Database errors will now be handled during active request cycles.

export const db = drizzle(pool, { schema });