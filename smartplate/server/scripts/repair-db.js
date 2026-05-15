import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function repair() {
  console.log('--- REPAIRING DATABASE SCHEMA ---');
  try {
    // 1. Add missing enums if they don't exist
    await db.execute(sql`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_level') THEN
        CREATE TYPE activity_level AS ENUM ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
        CREATE TYPE gender AS ENUM ('male', 'female', 'other');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_type') THEN
        CREATE TYPE goal_type AS ENUM ('lose_weight', 'gain_muscle', 'maintain_weight', 'improve_endurance', 'general_health', 'extreme_loss');
      END IF;

    END $$;`);

    // 2. Clear out the problematic table and recreate it with correct structure
    // This is the cleanest fix for a development environment sync issue.
    await db.execute(sql`DROP TABLE IF EXISTS user_profiles CASCADE;`);
    
    await db.execute(sql`CREATE TABLE user_profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      age INTEGER,
      gender gender,
      height_cm INTEGER,
      weight_kg DOUBLE PRECISION,
      activity_level activity_level DEFAULT 'sedentary',
      birth_date TIMESTAMP,
      goal_type goal_type DEFAULT 'general_health',
      diet_preference diet_preference,
      baseline_weight_kg REAL,
      baseline_body_fat_pct REAL,
      daily_calorie_target INTEGER,
      daily_protein_target_g INTEGER,
      daily_carbs_target_g INTEGER,
      daily_fat_target_g INTEGER,
      total_points INTEGER DEFAULT 0 NOT NULL,
      weekly_award_count INTEGER DEFAULT 0 NOT NULL,
      coach_enabled BOOLEAN DEFAULT false NOT NULL,
      created_at TIMESTAMP DEFAULT now() NOT NULL,
      updated_at TIMESTAMP DEFAULT now() NOT NULL
    );`);

    console.log('✅ User Profiles table successfully reconstructed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Repair Failed:', err);
    process.exit(1);
  }
}

repair();
