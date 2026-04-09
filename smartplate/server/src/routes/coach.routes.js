import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getCoachInsights } from '../controllers/coach.controller.js';

const router = Router();

// All coach routes require authentication
router.use(authenticate);

router.get('/insights', getCoachInsights);

export default router;
