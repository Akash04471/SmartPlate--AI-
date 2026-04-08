// src/routes/profile.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upsertProfileSchema } from '../validators/profile.validators.js';
import {
  getProfile,
  upsertProfile,
} from '../controllers/profile.controller.js';

const router = Router();
router.use(authenticate);

// WHY only two endpoints for profiles?
// A user has exactly ONE profile. There's no list to fetch, no ID to specify.
// "Which profile?" is always answered by req.user.id from the token.
// GET  → fetch my profile
// PUT  → create it if it doesn't exist, update it if it does (upsert)
router.get('/',  getProfile);
router.put('/',  validate(upsertProfileSchema), upsertProfile);

export default router;