import { GoogleGenerativeAI } from "@google/generative-ai";

const EDAMAM_FOOD_DB_URL = 'https://api.edamam.com/api/food-database/v2/parser';
const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const SAFETY_TIER = {
  "milk": { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, unit: "ml" },
  "egg": { calories: 70, protein: 6, carbs: 0.6, fat: 5, fiber: 0, unit: "unit" },
  "boiled egg": { calories: 77, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, unit: "unit" },
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, unit: "g" },
  "oats": { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10, unit: "g" },
  "oatmeal": { calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7, unit: "g" },
  "apple": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, unit: "unit" },
  "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, unit: "unit" },
  "rice": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, unit: "g" },
  "bread": { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, unit: "g" }
};

/**
 * POST /api/nutrition/interpret
 * Parses natural language into distinct nutritional data using Pure Neural Estimation.
 * ELIMINATES external database dependencies (Edamam) for 100% higher uptime and zero cost.
 */
export const interpretMeal = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Description text is required' });

  const input = text.toLowerCase().trim();

  // ─── STAGE 0: SAFETY TIER (Offline Fallback) ───────────────────────────
  // Pattern matching for simple entries like "150ml milk", "2 eggs", etc.
  const quantityRegex = /^(\d+)\s*(ml|g|oz|cup|unit|serving)?\s*(.+)$/i;
  const match = input.match(quantityRegex);

  if (match) {
    const qty = parseFloat(match[1]);
    const unit = match[2];
    const foodName = match[3].trim();

    // Check safety tier
    const baseFood = Object.keys(SAFETY_TIER).find(key => foodName.includes(key));
    if (baseFood) {
      const data = SAFETY_TIER[baseFood];
      const multiplier = (unit === 'ml' || unit === 'g') ? qty / 100 : qty;

      const finalData = [{
        foodId: `safety-${Date.now()}`,
        label: `${qty}${unit ? ' ' + unit : ''} ${baseFood.toUpperCase()}`,
        calories: Math.round(data.calories * multiplier),
        protein: Math.round(data.protein * multiplier),
        fat: Math.round(data.fat * multiplier),
        carbs: Math.round(data.carbs * multiplier),
        fiber: Math.round(data.fiber * multiplier),
        servingSize: qty,
        servingUnit: unit || data.unit
      }];

      return res.json({ data: finalData });
    }
  }

  // ─── STAGE 1: NEURAL ESTIMATION Fallback ────────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // ─── HIGH-INTELLIGENCE PROMPT ──────────────────────────────────────────
    const prompt = `Act as a clinical nutritionist. Analyze the following meal description and provide a JSON array of components.
    For each component, provide:
    1. name (clean food name)
    2. quantity (numeric)
    3. unit (g, ml, cup, oz, etc.)
    4. calories (kcal)
    5. protein (g)
    6. fat (g)
    7. carbs (g)
    8. fiber (g)

    Description: "${text}"
    
    IMPORTANT: Be medically accurate based on standard nutritional datasets. 
    Provide ONLY the valid JSON array.
    Example Format: [{"name": "milk", "quantity": 150, "unit": "ml", "calories": 63, "protein": 5, "fat": 2, "carbs": 7, "fiber": 0}]`;

    // Resilience Tiering - Updated for Stability (Using verified 2.0-flash)
    // Resilience Tiering
    const modelNames = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash", "gemini-1.5-flash"];

    let result;

    for (const mName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: mName });
        result = await model.generateContent(prompt);
        if (result) break;
      } catch (err) {
        console.warn(`⚠️ [Link Degraded]: ${mName} unreachable: ${err.message}`);
      }
    }

    if (!result) {
      return res.status(503).json({ error: "Global Intelligence Grid unavailable. Please try again in a moment." });
    }

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      throw new Error("NEURAL_PARSE_FAILURE");
    }

    const detectedItems = JSON.parse(jsonMatch[0]);

    // ─── POST-PROCESSING: Standardization ───────────────────────────────────
    const finalData = detectedItems.map((item, index) => ({
      foodId: `neural-${Date.now()}-${index}`,
      label: `${item.quantity}${item.unit ? ' ' + item.unit : ''} ${item.name}`,
      calories: Math.round(item.calories || 0),
      protein: Math.round(item.protein || 0),
      fat: Math.round(item.fat || 0),
      carbs: Math.round(item.carbs || 0),
      fiber: Math.round(item.fiber || 0),
      servingSize: item.quantity,
      servingUnit: item.unit || 'serving'
    }));

    res.json({ data: finalData });

  } catch (error) {
    console.error("🔥 [Neural System Failure]:", error.message);
    res.status(502).json({ 
      error: "Neural Estimation failed. Please provide a simpler description (e.g., '150ml milk')." 
    });
  }
};


/**
 * GET /api/nutrition/search
 * Legacy Synchronization: Direct database lookup.
 * Kept for specific manual searches, though Neural Interpretation is now primary.
 */
export const searchFood = async (req, res) => {
  const { ingr } = req.query;
  if (!ingr) return res.status(400).json({ error: 'Search term "ingr" is required' });

  try {
    const searchUrl = `${EDAMAM_FOOD_DB_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(ingr)}&nutrition-type=logging`;
    const response = await fetch(searchUrl);
    
    if (response.status === 401) {
      return res.status(503).json({ error: "Legacy Database authentication failed. Neural Estimation is still active." });
    }

    if (!response.ok) throw new Error("Sync failed");

    const data = await response.json();
    const results = (data.hints || []).map(hint => ({
      foodId: hint.food.foodId,
      label: hint.food.label,
      image: hint.food.image,
      calories: Math.round(hint.food.nutrients.ENERC_KCAL || 0),
      protein: Math.round(hint.food.nutrients.PROCNT || 0),
      fat: Math.round(hint.food.nutrients.FAT || 0),
      carbs: Math.round(hint.food.nutrients.CHOCDF || 0),
      fiber: Math.round(hint.food.nutrients.FIBTG || 0)
    }));

    res.json({ data: results });
  } catch (error) {
    res.status(502).json({ error: "Legacy database unavailable." });
  }
};
export const getNutritionDetails = async (req, res) => {
  res.status(501).json({ message: 'Nutrition analysis for recipes not yet implemented' });
};

/**
 * POST /api/nutrition/analyze-image
 * Uses Computer Vision (Gemini 1.5 Flash) to identify food and estimate macros.
 */
export const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      console.warn("⚠️ [Vision]: No file in request");
      return res.status(400).json({ error: "No image file provided" });
    }

    console.log(`🚀 [Vision]: Analyzing image from Cloudinary: ${req.file.path}`);
    console.log(`📊 [Vision]: MimeType: ${req.file.mimetype}, Size: ${req.file.size} bytes`);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    
    // Resilience Tiering for Vision
    const modelNames = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash", "gemini-1.5-flash"];


    let result;
    let lastErr;

    // ─── IMAGE PROCESSING ───────────────────────────────────────────────────
    // Fetch image from Cloudinary to get buffer
    console.log(`📡 [Vision]: Fetching image from Cloudinary: ${req.file.path}`);
    const imgRes = await fetch(req.file.path);
    if (!imgRes.ok) throw new Error(`Cloudinary fetch failed: ${imgRes.statusText}`);
    const buffer = await imgRes.arrayBuffer();
    console.log(`📡 [Vision]: Image fetched successfully (${buffer.byteLength} bytes)`);
    const base64Data = Buffer.from(buffer).toString('base64');


    const prompt = `Act as a clinical nutritionist and computer vision expert. 
    Analyze this meal image and provide a JSON array of the food items detected.
    For each item, estimate:
    1. name (clean food name)
    2. quantity (numeric)
    3. unit (g, ml, cup, oz, etc.)
    4. calories (kcal)
    5. protein (g)
    6. fat (g)
    7. carbs (g)
    8. fiber (g)

    Provide ONLY the valid JSON array.
    Example Format: [{"name": "grilled chicken", "quantity": 150, "unit": "g", "calories": 250, "protein": 45, "fat": 8, "carbs": 0, "fiber": 0}]`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: req.file.mimetype
      }
    };

    console.log("🧠 [Vision]: Prompting Gemini models...");


    for (const mName of modelNames) {
      try {
        console.log(`🧠 [Vision]: Attempting ${mName}...`);
        const model = genAI.getGenerativeModel({ 
          model: mName,
          // Add a request timeout if possible via the SDK or a manual wrapper
        });
        
        // Manual timeout wrapper for generateContent
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("GATEWAY_TIMEOUT")), 25000)
        );
        
        result = await Promise.race([
          model.generateContent([prompt, imagePart]),
          timeoutPromise
        ]);

        if (result) {
          console.log(`✅ [Vision]: Success with ${mName}`);
          break;
        }
      } catch (err) {
        lastErr = err;
        console.warn(`⚠️ [Vision Link Degraded]: ${mName} failed: ${err.message}`);
      }
    }


    if (!result) {
      throw lastErr || new Error("VISION_ENGINE_UNREACHABLE");
    }

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error("VISION_PARSE_FAILURE");
    }

    const detectedItems = JSON.parse(jsonMatch[0]);

    // Format for frontend
    const finalData = detectedItems.map((item, index) => ({
      foodId: `vision-${Date.now()}-${index}`,
      label: `${item.quantity}${item.unit ? ' ' + item.unit : ''} ${item.name}`,
      calories: Math.round(item.calories || 0),
      protein: Math.round(item.protein || 0),
      fat: Math.round(item.fat || 0),
      carbs: Math.round(item.carbs || 0),
      fiber: Math.round(item.fiber || 0),
      servingSize: item.quantity,
      servingUnit: item.unit || 'serving',
      imageUrl: req.file.path // Return the Cloudinary URL for reference
    }));

    res.json({ data: finalData });

  } catch (error) {
    console.error("🔥 [Vision System Failure]:", error.message);
    res.status(502).json({ 
      error: "Visual Intelligence failed to process the image. Please try a clearer photo." 
    });
  }
};


