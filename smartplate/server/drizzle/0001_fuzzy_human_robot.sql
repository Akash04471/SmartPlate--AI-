CREATE TYPE "public"."activity_level" AS ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('lose_weight', 'maintain_weight', 'gain_muscle', 'improve_endurance', 'general_health');--> statement-breakpoint
CREATE TYPE "public"."protocol_status" AS ENUM('draft', 'active', 'completed', 'paused');--> statement-breakpoint
CREATE TABLE "health_protocols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "protocol_status" DEFAULT 'draft' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"target_calories" integer,
	"target_protein_g" integer,
	"target_carbs_g" integer,
	"target_fat_g" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"height_cm" real,
	"weight_kg" real,
	"age" integer,
	"activity_level" "activity_level",
	"goal_type" "goal_type",
	"baseline_weight_kg" real,
	"baseline_body_fat_pct" real,
	"daily_calorie_target" integer,
	"daily_protein_target_g" integer,
	"daily_carbs_target_g" integer,
	"daily_fat_target_g" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "health_protocols" ADD CONSTRAINT "health_protocols_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;