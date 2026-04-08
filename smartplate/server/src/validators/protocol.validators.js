// src/validators/protocol.validators.js
import { z } from 'zod';

export const createProtocolSchema = z.object({
  title:       z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status:      z.enum(['draft', 'active', 'completed', 'paused']).default('draft'),
  startDate:   z.string().datetime({ offset: true }).optional(),
  endDate:     z.string().datetime({ offset: true }).optional(),
  targetCalories:  z.number().positive().optional(),
  targetProteinG:  z.number().positive().optional(),
  targetCarbsG:    z.number().positive().optional(),
  targetFatG:      z.number().positive().optional(),
});

export const updateProtocolSchema = createProtocolSchema.partial();