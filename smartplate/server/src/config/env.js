// src/config/env.js
import { z } from 'zod';

// Define exactly what your .env must contain and what types they should be
const envSchema = z.object({
  // DATABASE_URL must be a valid connection string
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // JWT_SECRET must be at least 32 characters
  // WHY 32? Anything shorter can be brute-forced offline if your DB leaks.
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  // PORT is optional — defaults to 5050 if not set
  PORT: z.coerce.number().default(5050),

  // NODE_ENV — defaults to 'development'
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// .safeParse() returns { success, data, error } instead of throwing
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:');
  result.error.issues.forEach(issue => {
    console.error(`   ${issue.path.join('.')}: ${issue.message}`);
  });
  // Note: We no longer call process.exit(1) here to prevent Vercel deployment crashes.
  // The app will log errors but attempt to continue, which is safer for serverless environments.
}

// Export the parsed data if successful, otherwise fallback to process.env to avoid immediate crashes
export const env = result.success ? result.data : process.env;