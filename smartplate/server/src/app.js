// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes     from './routes/auth.routes.js';
import mealRoutes     from './routes/meal.routes.js';
import profileRoutes  from './routes/profile.routes.js';
import protocolRoutes from './routes/protocol.routes.js';
import nutritionRoutes from './routes/nutrition.routes.js';
import progressRoutes  from './routes/progress.routes.js';
import coachRoutes     from './routes/coach.routes.js';
import tribeRoutes     from './routes/tribe.routes.js';
import { pool }        from './db/index.js';


const app = express();

// ── Security headers ────────────────────────────────────────────────────────
// helmet() sets 14 headers in one call. Always the first middleware.
app.use(helmet());

app.use(cors());
app.use(express.json());

// ── Request Logging ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});



// ── Rate limiting ────────────────────────────────────────────────────────────
// Strict limiter for auth endpoints — brute force protection
// 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              50, // Increased for development
  standardHeaders:  true,
  legacyHeaders:    false,
  message: { error: 'Too many attempts, please try again in 15 minutes' },
});

// General API limiter — prevents scraping and abuse
// 100 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests, please slow down' },
});

// AI specific limiter — protects expensive API calls
// 10 requests per minute per IP
const aiLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'AI processing quota reached for this minute. Please wait 60 seconds.' },
});


// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/',       (req, res) => res.send('API is running'));

app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/meal-logs', apiLimiter,  mealRoutes);
app.use('/api/profile',   apiLimiter,  profileRoutes);
app.use('/api/protocols', apiLimiter,  protocolRoutes);
app.use('/api/nutrition', aiLimiter,  nutritionRoutes);
app.use('/api/progress',  apiLimiter,  progressRoutes);
app.use('/api/coach',     aiLimiter,  coachRoutes);

app.use('/api/tribes',    apiLimiter,  tribeRoutes);



// ── Global error handler — always last ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    code: err.code, // Helpful for Postgres errors (e.g., '42P01')
    detail: err.detail, // Detailed Postgres error if available
  });
});

export default app;