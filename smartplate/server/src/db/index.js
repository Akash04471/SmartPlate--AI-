
import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from '../config/env.js';
import * as schema from "./schema.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

// Verify the connection immediately when the module loads
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // crash loudly — better than silent failure
  }
  console.log("✅ PostgreSQL connected");
  release();
});

export const db = drizzle(pool, { schema });