// src/controllers/nutrition.controller.js
import { getProfileByUserId } from '../controllers/profile.controller.js'; // To get user preferences if needed

const EDAMAM_FOOD_DB_URL = 'https://api.edamam.com/api/food-database/v2/parser';
const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

// Simple in-memory cache to save on API limits
const searchCache = new Map();

export const searchFood = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query is required' });

  // Check cache
  if (searchCache.has(q)) {
    return res.json(searchCache.get(q));
  }

  try {
    const url = `${EDAMAM_FOOD_DB_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(q)}&nutrition-type=logging`;
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Edamam API rate limit reached. Please try again later.');
      }
      throw new Error(`Edamam API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Format results for SmartPlate
    const results = data.hints.map(hint => ({
      foodId: hint.food.foodId,
      label: hint.food.label,
      image: hint.food.image,
      calories: hint.food.nutrients.ENERC_KCAL,
      protein: hint.food.nutrients.PROCNT,
      fat: hint.food.nutrients.FAT,
      carbs: hint.food.nutrients.CHOCDF,
      fiber: hint.food.nutrients.FIBTG,
      category: hint.food.category,
    }));

    // Cache results for 1 hour
    searchCache.set(q, results);
    setTimeout(() => searchCache.delete(q), 3600000);

    res.json(results);
  } catch (error) {
    console.error('Nutrition Search Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch nutrition data' });
  }
};


/**

 * POST /api/nutrition/interpret
 * Parses a natural language string into distinct food items.
 * Uses Food Database API with manual quantity extraction for robustness.
 */
export const interpretMeal = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Description text is required' });

  // Split by "and", "plus", and "&"
  const ingredients = text
    .split(/\s+and\s+|\s+plus\s+|[&]/i)
    .map(i => i.trim())
    .filter(i => i.length > 0);

  try {
    const parsedItems = await Promise.all(ingredients.map(async (ingr) => {
      // 1. Manually extract quantity and units (e.g. "150 ml milk" or "3 eggs")
      const qtyMatch = ingr.match(/^(\d+(?:\.\d+)?)\s*(ml|g|oz|cup|cup|cups|tablespoon|tbsp|teaspoon|tsp|lb|kg|pcs|piece|pieces)?\s*(.*)/i);
      
      let quantity = 1;
      let unit = '';
      let searchTerm = ingr;

      if (qtyMatch) {
        quantity = parseFloat(qtyMatch[1]);
        unit = qtyMatch[2] ? qtyMatch[2].toLowerCase().trim() : '';
        searchTerm = qtyMatch[3] ? qtyMatch[3].trim() : ingr;
      }

      // 2. Call Food Database API for the item name only
      console.log(`AI Interpret: Searching for "${searchTerm}" (Qty: ${quantity}, Unit: ${unit})`);
      const url = `${EDAMAM_FOOD_DB_URL}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(searchTerm)}&nutrition-type=logging`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Edamam API Error: ${response.status} for "${searchTerm}"`);
          return null;
        }

        const data = await response.json();
        if (!data.hints || data.hints.length === 0) {
          console.warn(`No match found for food name: "${searchTerm}"`);
          return null;
        }

        const hint = data.hints[0];
        console.log(`AI Interpret: Found match "${hint.food.label}"`);
        
        // 3. Calculate based on units
        let multiplier = quantity;
        if (unit === 'ml' || unit === 'g') {
          multiplier = quantity / 100;
        }

        return {
          foodId: hint.food.foodId,
          label: `${quantity}${unit ? ' ' + unit : ''} ${hint.food.label}`,
          calories: Math.round(hint.food.nutrients.ENERC_KCAL * multiplier),
          protein: Math.round(hint.food.nutrients.PROCNT * multiplier),
          fat: Math.round(hint.food.nutrients.FAT * multiplier),
          carbs: Math.round(hint.food.nutrients.CHOCDF * multiplier),
          fiber: Math.round((hint.food.nutrients.FIBTG || 0) * multiplier),
          servingSize: quantity,
          servingUnit: unit || 'serving(s)'
        };
      } catch (fetchErr) {
        console.error(`AI Interpret: Fetch failure for "${searchTerm}":`, fetchErr.message);
        return null;
      }
    }));



    const finalItems = parsedItems.filter(i => i !== null);
    
    if (finalItems.length === 0) {
      return res.status(404).json({ error: 'Could not find these items in our database. Try simplified names (e.g. "eggs" instead of "3 large eggs").' });
    }

    res.json({ data: finalItems });
  } catch (error) {
    console.error('Interpret Meal Error:', error);
    res.status(500).json({ error: 'Failed to interpret nutritional content' });
  }
};



export const getNutritionDetails = async (req, res) => {
  res.status(501).json({ message: 'Nutrition analysis for recipes not yet implemented' });
};

