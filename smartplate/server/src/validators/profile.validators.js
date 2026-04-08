// src/validators/profile.validators.js
import { z } from 'zod';

export const upsertProfileSchema = z.object({
  heightCm:           z.number().positive().max(300).optional(),
  weightKg:           z.number().positive().max(700).optional(),
  age:                z.number().int().min(13).max(120).optional(),
  activityLevel:      z.enum([
    'sedentary', 'lightly_active', 'moderately_active',
    'very_active', 'extra_active'
  ]).optional(),
  goalType: z.enum([
    'lose_weight', 'maintain_weight', 'gain_muscle',
    'improve_endurance', 'general_health'
  ]).optional(),
  dietPreference: z.enum([
    'omnivore', 'vegetarian', 'vegan', 'keto', 'paleo'
  ]).optional(),
  baselineWeightKg:     z.number().positive().optional(),
  baselineBodyFatPct:   z.number().min(1).max(70).optional(),
  dailyCalorieTarget:   z.number().int().positive().optional(),
  dailyProteinTargetG:  z.number().int().positive().optional(),
  dailyCarbsTargetG:    z.number().int().positive().optional(),
  dailyFatTargetG:      z.number().int().positive().optional(),
});