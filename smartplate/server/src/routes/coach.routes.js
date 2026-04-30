import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getCoachInsights, chatWithCoach } from '../controllers/coach.controller.js';

const router = Router();

// All coach routes require authentication
router.use(authenticate);

router.get('/insights', getCoachInsights);
router.post('/chat', chatWithCoach);

export default router;
