// src/validators/meal.validators.js
import { z } from 'zod';

export const createMealLogSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    errorMap: () => ({ message: 'mealType must be: breakfast, lunch, dinner, or snack' }),
  }),
  loggedAt: z.string().datetime({ offset: true }).optional(),
  notes:    z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const updateMealLogSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  loggedAt: z.string().datetime({ offset: true }).optional(),
  notes:    z.string().max(500).optional(),
});

export const createMealLogItemSchema = z.object({
  foodName:    z.string().min(1).max(200),
  servingSize: z.number().positive('servingSize must be a positive number'),
  servingUnit: z.string().min(1).max(20),
  calories:    z.number().min(0),
  proteinG:    z.number().min(0),
  carbsG:      z.number().min(0),
  fatG:        z.number().min(0),
  fiberG:      z.number().min(0).optional(),
  sodiumMg:    z.number().min(0).optional(),
});