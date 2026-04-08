import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createMealLogSchema,
  updateMealLogSchema,
  createMealLogItemSchema,
} from '../validators/meal.validators.js';
import {
  createMealLog, getMealLogs, getMealLogById,
  updateMealLog, deleteMealLog,
  addMealLogItem, deleteMealLogItem,
} from '../controllers/meal.controller.js';
import {
  getDailyStats, getWeeklyStats, getRangeStats,
} from '../controllers/stats.controller.js';

const router = Router();
router.use(authenticate);

router.post('/',          validate(createMealLogSchema), createMealLog);
router.get('/',           getMealLogs);

router.get('/stats/daily',  getDailyStats);
router.get('/stats/weekly', getWeeklyStats);
router.get('/stats/range',  getRangeStats);

router.get('/:logId',     getMealLogById);
router.patch('/:logId',   validate(updateMealLogSchema), updateMealLog);
router.delete('/:logId',  deleteMealLog);

router.post('/:logId/items',           validate(createMealLogItemSchema), addMealLogItem);
router.delete('/:logId/items/:itemId', deleteMealLogItem);

export default router;