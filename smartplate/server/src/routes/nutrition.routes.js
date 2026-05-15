// src/routes/nutrition.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { searchFood, interpretMeal, analyzeImage } from '../controllers/nutrition.controller.js';
import { upload } from '../config/cloudinary.js';


const router = Router();

router.use(authenticate);

router.get('/search', searchFood);
router.post('/interpret', interpretMeal);
router.post('/analyze-image', 
  upload.single('image'), 
  (req, res, next) => {
    console.log("📁 [Route]: Received file upload request");
    if (req.file) {
      console.log(`📁 [Route]: File received: ${req.file.originalname} (${req.file.size} bytes)`);
    } else {
      console.warn("📁 [Route]: No file received in multer");
    }
    next();
  },
  analyzeImage
);




export default router;
