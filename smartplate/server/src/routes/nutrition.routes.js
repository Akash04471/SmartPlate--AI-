// src/routes/nutrition.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { searchFood, interpretMeal } from '../controllers/nutrition.controller.js';

const router = Router();

router.use(authenticate);

router.get('/search', searchFood);
router.post('/interpret', interpretMeal);


export default router;
