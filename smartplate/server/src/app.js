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
app.get('/',       (req, res) => res.send('API is running'));

app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/meal-logs', apiLimiter,  mealRoutes);
app.use('/api/profile',   apiLimiter,  profileRoutes);
app.use('/api/protocols', apiLimiter,  protocolRoutes);
app.use('/api/nutrition', apiLimiter,  nutritionRoutes);
app.use('/api/progress',  apiLimiter,  progressRoutes);

// ── Global error handler — always last ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

export default app;