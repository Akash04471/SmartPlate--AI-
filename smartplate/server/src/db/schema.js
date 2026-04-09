// src/db/schema.js — full file, replace entirely
import {
  pgTable, uuid, text, timestamp,
  real, integer, pgEnum, boolean
} from 'drizzle-orm/pg-core';


// ── Existing ────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         text('name').notNull(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
});

export const mealTypeEnum = pgEnum('meal_type', [
  'breakfast', 'lunch', 'dinner', 'snack'
]);

export const mealLogs = pgTable('meal_logs', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  mealType:  mealTypeEnum('meal_type').notNull(),
  loggedAt:  timestamp('logged_at').defaultNow().notNull(),
  notes:     text('notes'),
  imageUrl:  text('image_url'), // Pillar 4: Cloudinary URL
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mealLogItems = pgTable('meal_log_items', {
  id:          uuid('id').primaryKey().defaultRandom(),
  mealLogId:   uuid('meal_log_id').notNull().references(() => mealLogs.id, { onDelete: 'cascade' }),
  foodName:    text('food_name').notNull(),
  servingSize: real('serving_size').notNull(),
  servingUnit: text('serving_unit').notNull(),
  calories:    real('calories').notNull(),
  proteinG:    real('protein_g').notNull(),
  carbsG:      real('carbs_g').notNull(),
  fatG:        real('fat_g').notNull(),
  fiberG:      real('fiber_g'),
  sodiumMg:    real('sodium_mg'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});

// ── NEW ─────────────────────────────────────────────────────────────────────

export const activityLevelEnum = pgEnum('activity_level', [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extra_active',
]);

export const goalTypeEnum = pgEnum('goal_type', [
  'lose_weight',
  'maintain_weight',
  'gain_muscle',
  'improve_endurance',
  'general_health',
]);

export const dietPreferenceEnum = pgEnum('diet_preference', [
  'omnivore',
  'vegetarian',
  'vegan',
  'keto',
  'paleo',
]);

export const userProfiles = pgTable('user_profiles', {
  userId:      uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  age:         integer('age'),
  gender:      genderEnum('gender'),
  heightCm:    integer('height_cm'),
  weightKg:    doublePrecision('weight_kg'),
  activityLevel: activityLevelEnum('activity_level').default('sedentary'),
  birthDate:   timestamp('birth_date'),
  goalType:    goalTypeEnum('goal_type').default('general_health'),
  dietPreference:   dietPreferenceEnum('diet_preference'),
  baselineWeightKg:   real('baseline_weight_kg'),
  baselineBodyFatPct: real('baseline_body_fat_pct'),
  dailyCalorieTarget:  integer('daily_calorie_target'),
  dailyProteinTargetG: integer('daily_protein_target_g'),
  dailyCarbsTargetG:   integer('daily_carbs_target_g'),
  dailyFatTargetG:     integer('daily_fat_target_g'),
  
  // Progress & Awards
  totalPoints:      integer('total_points').default(0).notNull(),
  weeklyAwardCount: integer('weekly_award_count').default(0).notNull(),
  
  // AI Coaching Preference (Opt-in)
  coachEnabled:     boolean('coach_enabled').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


// Weight tracking (Day-to-day changes)
export const weightLogs = pgTable('weight_logs', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weightKg:  real('weight_kg').notNull(),
  loggedAt:  timestamp('logged_at').defaultNow().notNull(),
});

// Daily adherence (Points tracking)
export const adherenceStatusEnum = pgEnum('adherence_status', [
  'on_track',
  'off_track',
  'cheat_day'
]);

export const dailyAdherence = pgTable('daily_adherence', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date:        timestamp('date').defaultNow().notNull(),
  pointsEarned: integer('points_earned').default(0).notNull(),
  status:      adherenceStatusEnum('status').default('on_track').notNull(),
});

// Awards earned
export const awardTypeEnum = pgEnum('award_type', [
  'weekly_streak',
  'monthly_milestone',
  'consistency_king',
  'cheat_day_unlock'
]);

export const awards = pgTable('awards', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:      awardTypeEnum('type').notNull(),
  earnedAt:  timestamp('earned_at').defaultNow().notNull(),
});

// Health Protocols — dynamic plans for the user
export const protocolStatusEnum = pgEnum('protocol_status', [
  'draft',
  'active',
  'completed',
  'paused',
]);

export const healthProtocols = pgTable('health_protocols', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:       text('title').notNull(),
  description: text('description'),
  status:      protocolStatusEnum('status').notNull().default('draft'),
  startDate:   timestamp('start_date'),
  endDate:     timestamp('end_date'),
  targetCalories:  integer('target_calories'),
  targetProteinG:  integer('target_protein_g'),
  targetCarbsG:    integer('target_carbs_g'),
  targetFatG:      integer('target_fat_g'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── PILLAR 3: SOCIAL TRIBES ───────────────────────────────────────────────

export const tribes = pgTable('tribes', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        text('name').notNull(),
  slug:        text('slug').notNull().unique(),
  description: text('description'),
  image:       text('image'), // placeholder for tribe avatar
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});

export const tribeMemberships = pgTable('tribe_memberships', {
  id:        uuid('id').primaryKey().defaultRandom(),
  tribeId:   uuid('tribe_id').notNull().references(() => tribes.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt:  timestamp('joined_at').defaultNow().notNull(),
});