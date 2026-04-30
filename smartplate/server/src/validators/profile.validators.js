import { z } from 'zod';

/**
 * Helper to handle empty strings from frontend forms.
 * Preprocess converts empty strings or nulls to undefined so .optional() works.
 */
const emptyToUndefined = (val) => (val === "" || val === null ? undefined : val);

export const upsertProfileSchema = z.object({
  heightCm:           z.preprocess(emptyToUndefined, z.coerce.number().positive().max(300).optional()),
  weightKg:           z.preprocess(emptyToUndefined, z.coerce.number().positive().max(700).optional()),
  age:                z.preprocess(emptyToUndefined, z.coerce.number().int().min(13).max(120).optional()),
  gender:             z.enum(['male', 'female', 'other']).optional(),
  activityLevel:      z.enum([
    'sedentary', 'lightly_active', 'moderately_active',
    'very_active', 'extra_active'
  ]).optional(),
  goalType: z.enum([
    'lose_weight', 'maintain_weight', 'gain_muscle',
    'improve_endurance', 'general_health', 'extreme_loss'
  ]).optional(),
  dietPreference: z.enum([
    'omnivore', 'vegetarian', 'vegan', 'keto', 'paleo'
  ]).optional(),
  baselineWeightKg:     z.preprocess(emptyToUndefined, z.coerce.number().positive().optional()),
  baselineBodyFatPct:   z.preprocess(emptyToUndefined, z.coerce.number().min(1).max(70).optional()),
  dailyCalorieTarget:   z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  dailyProteinTargetG:  z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  dailyCarbsTargetG:    z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  dailyFatTargetG:      z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  coachEnabled:         z.boolean().optional(),
});