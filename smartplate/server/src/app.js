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


// ── Rate limiting ────────────────────────────────────────────────────────────
// Strict limiter for auth endpoints — brute force protection
// 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              10,
  standardHeaders:  true,   // sends RateLimit-* headers so clients know their limit
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

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/debug-db', async (req, res) => {
  try {
    const tableRes = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json({
      success: true,
      tables: tableRes.rows,
      message: tableRes.rows.length === 0 ? "No tables found in 'public' schema" : `Found ${tableRes.rows.length} tables`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});
app.get('/',       (req, res) => res.send('API is running'));

app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/meal-logs', apiLimiter,  mealRoutes);
app.use('/api/profile',   apiLimiter,  profileRoutes);
app.use('/api/protocols', apiLimiter,  protocolRoutes);
app.use('/api/nutrition', apiLimiter,  nutritionRoutes);
app.use('/api/progress',  apiLimiter,  progressRoutes);
app.use('/api/coach',     apiLimiter,  coachRoutes);
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