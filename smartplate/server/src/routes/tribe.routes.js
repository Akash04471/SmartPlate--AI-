import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listTribes, joinTribe, getTribeLeaderboard, seedTribes } from '../controllers/tribe.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', listTribes);
router.post('/seed', seedTribes); // One-time use to setup official tribes
router.post('/:slug/join', joinTribe);
router.get('/:slug/leaderboard', getTribeLeaderboard);

export default router;
