// src/routes/nutrition.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { searchFood, interpretMeal, analyzeMealImage } from '../controllers/nutrition.controller.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

router.use(authenticate);

router.get('/search', searchFood);
router.post('/interpret', interpretMeal);
router.post('/analyze-image', upload.single('image'), analyzeMealImage);

export default router;
