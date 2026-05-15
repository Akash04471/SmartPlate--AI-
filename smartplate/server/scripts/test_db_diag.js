import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log("Connecting to:", process.env.DATABASE_URL.split('@')[1]);
    const res = await pool.query('SELECT current_database(), current_schema()');
    console.log("Connected to:", res.rows[0]);
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = 'users'
      );
    `);
    console.log("Users table exists:", tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
        const queryRes = await pool.query('SELECT id FROM users LIMIT 1');
        console.log("Query success (users):", queryRes.rows);
    } else {
        console.log("Searching for users table in all schemas...");
        const allTables = await pool.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'users'");
        console.log("Search results:", allTables.rows);
    }
    
  } catch (err) {
    console.error("❌ DB TEST FAILED:", err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    await pool.end();
  }
}

test();
