// src/routes/progress.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { logWeight, getWeightHistory, getAdherenceStats } from '../controllers/progress.controller.js';

const router = Router();
router.use(authenticate);

router.post('/weight', logWeight);
router.get('/weight-history', getWeightHistory);
router.get('/adherence', getAdherenceStats);

export default router;
