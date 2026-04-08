// SuggestionEngine.ts
// Maps (goalType + dietPreference) → recommended food items with full macro data.
// This is a client-side lookup table. Each item contains real nutritional data
// (approximate) so users can add suggestions directly to their meal logs.

export interface FoodSuggestion {
  foodName: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  category: "protein" | "carb" | "fat" | "vegetable" | "fruit" | "snack" | "cheat";
}


// ─── FOOD DATABASE (curated per diet type) ──────────────────────────────────

const OMNIVORE_FOODS: FoodSuggestion[] = [
  { foodName: "Grilled Chicken Breast", servingSize: 150, servingUnit: "g", calories: 231, proteinG: 43, carbsG: 0, fatG: 5, fiberG: 0, category: "protein" },
  { foodName: "Salmon Fillet", servingSize: 150, servingUnit: "g", calories: 312, proteinG: 34, carbsG: 0, fatG: 18, fiberG: 0, category: "protein" },
  { foodName: "Brown Rice", servingSize: 150, servingUnit: "g", calories: 173, proteinG: 4, carbsG: 36, fatG: 1, fiberG: 2, category: "carb" },
  { foodName: "Sweet Potato", servingSize: 200, servingUnit: "g", calories: 180, proteinG: 4, carbsG: 41, fatG: 0, fiberG: 6, category: "carb" },
  { foodName: "Scrambled Eggs (3)", servingSize: 3, servingUnit: "eggs", calories: 222, proteinG: 18, carbsG: 2, fatG: 15, fiberG: 0, category: "protein" },
  { foodName: "Greek Yogurt", servingSize: 200, servingUnit: "g", calories: 130, proteinG: 20, carbsG: 8, fatG: 2, fiberG: 0, category: "protein" },
  { foodName: "Avocado Toast", servingSize: 1, servingUnit: "slice", calories: 250, proteinG: 6, carbsG: 22, fatG: 16, fiberG: 7, category: "fat" },
  { foodName: "Steamed Broccoli", servingSize: 150, servingUnit: "g", calories: 52, proteinG: 4, carbsG: 8, fatG: 0, fiberG: 4, category: "vegetable" },
  { foodName: "Mixed Berry Bowl", servingSize: 150, servingUnit: "g", calories: 85, proteinG: 1, carbsG: 20, fatG: 0, fiberG: 4, category: "fruit" },
  { foodName: "Turkey Wrap", servingSize: 1, servingUnit: "wrap", calories: 320, proteinG: 28, carbsG: 30, fatG: 10, fiberG: 3, category: "protein" },
];

const VEGETARIAN_FOODS: FoodSuggestion[] = [
  { foodName: "Paneer Tikka", servingSize: 150, servingUnit: "g", calories: 280, proteinG: 22, carbsG: 6, fatG: 18, fiberG: 0, category: "protein" },
  { foodName: "Chickpea Curry", servingSize: 200, servingUnit: "g", calories: 260, proteinG: 14, carbsG: 36, fatG: 6, fiberG: 10, category: "protein" },
  { foodName: "Quinoa Bowl", servingSize: 200, servingUnit: "g", calories: 240, proteinG: 8, carbsG: 40, fatG: 4, fiberG: 5, category: "carb" },
  { foodName: "Lentil Soup", servingSize: 250, servingUnit: "ml", calories: 180, proteinG: 12, carbsG: 28, fatG: 2, fiberG: 8, category: "protein" },
  { foodName: "Greek Yogurt Parfait", servingSize: 250, servingUnit: "g", calories: 220, proteinG: 16, carbsG: 30, fatG: 4, fiberG: 3, category: "protein" },
  { foodName: "Spinach & Feta Wrap", servingSize: 1, servingUnit: "wrap", calories: 290, proteinG: 14, carbsG: 32, fatG: 12, fiberG: 4, category: "protein" },
  { foodName: "Cottage Cheese Bowl", servingSize: 200, servingUnit: "g", calories: 206, proteinG: 28, carbsG: 6, fatG: 8, fiberG: 0, category: "protein" },
  { foodName: "Garden Salad w/ Nuts", servingSize: 250, servingUnit: "g", calories: 210, proteinG: 8, carbsG: 12, fatG: 16, fiberG: 6, category: "vegetable" },
  { foodName: "Oatmeal with Banana", servingSize: 250, servingUnit: "g", calories: 280, proteinG: 8, carbsG: 48, fatG: 6, fiberG: 5, category: "carb" },
  { foodName: "Tofu Stir-fry", servingSize: 200, servingUnit: "g", calories: 220, proteinG: 18, carbsG: 12, fatG: 12, fiberG: 3, category: "protein" },
];

const VEGAN_FOODS: FoodSuggestion[] = [
  { foodName: "Tofu Scramble", servingSize: 200, servingUnit: "g", calories: 190, proteinG: 18, carbsG: 6, fatG: 10, fiberG: 2, category: "protein" },
  { foodName: "Black Bean Tacos", servingSize: 2, servingUnit: "tacos", calories: 340, proteinG: 16, carbsG: 46, fatG: 8, fiberG: 12, category: "protein" },
  { foodName: "Lentil Bolognese", servingSize: 250, servingUnit: "g", calories: 280, proteinG: 18, carbsG: 40, fatG: 4, fiberG: 10, category: "protein" },
  { foodName: "Chickpea Salad", servingSize: 200, servingUnit: "g", calories: 220, proteinG: 10, carbsG: 30, fatG: 6, fiberG: 8, category: "protein" },
  { foodName: "Seitan Stir-fry", servingSize: 200, servingUnit: "g", calories: 260, proteinG: 32, carbsG: 10, fatG: 8, fiberG: 2, category: "protein" },
  { foodName: "Smoothie Bowl", servingSize: 300, servingUnit: "ml", calories: 280, proteinG: 8, carbsG: 48, fatG: 6, fiberG: 6, category: "fruit" },
  { foodName: "Quinoa & Avocado Bowl", servingSize: 250, servingUnit: "g", calories: 380, proteinG: 12, carbsG: 44, fatG: 18, fiberG: 10, category: "carb" },
  { foodName: "Edamame", servingSize: 150, servingUnit: "g", calories: 188, proteinG: 18, carbsG: 14, fatG: 8, fiberG: 8, category: "protein" },
  { foodName: "Tempeh Curry", servingSize: 200, servingUnit: "g", calories: 300, proteinG: 22, carbsG: 20, fatG: 14, fiberG: 4, category: "protein" },
  { foodName: "Almond Butter Toast", servingSize: 2, servingUnit: "slices", calories: 310, proteinG: 10, carbsG: 28, fatG: 18, fiberG: 4, category: "fat" },
];

const KETO_FOODS: FoodSuggestion[] = [
  { foodName: "Bacon & Eggs", servingSize: 1, servingUnit: "plate", calories: 380, proteinG: 26, carbsG: 2, fatG: 30, fiberG: 0, category: "protein" },
  { foodName: "Avocado & Salmon", servingSize: 1, servingUnit: "bowl", calories: 420, proteinG: 28, carbsG: 4, fatG: 34, fiberG: 6, category: "fat" },
  { foodName: "Grilled Steak", servingSize: 200, servingUnit: "g", calories: 500, proteinG: 46, carbsG: 0, fatG: 34, fiberG: 0, category: "protein" },
  { foodName: "Zucchini Noodles w/ Pesto", servingSize: 200, servingUnit: "g", calories: 220, proteinG: 6, carbsG: 8, fatG: 18, fiberG: 3, category: "fat" },
  { foodName: "Cheese Omelette", servingSize: 1, servingUnit: "omelette", calories: 340, proteinG: 22, carbsG: 2, fatG: 28, fiberG: 0, category: "protein" },
  { foodName: "Bulletproof Coffee", servingSize: 350, servingUnit: "ml", calories: 230, proteinG: 1, carbsG: 0, fatG: 25, fiberG: 0, category: "fat" },
  { foodName: "Cauliflower Rice Bowl", servingSize: 250, servingUnit: "g", calories: 180, proteinG: 8, carbsG: 10, fatG: 12, fiberG: 4, category: "vegetable" },
  { foodName: "Grilled Chicken Thighs", servingSize: 200, servingUnit: "g", calories: 380, proteinG: 36, carbsG: 0, fatG: 24, fiberG: 0, category: "protein" },
  { foodName: "Mixed Nuts", servingSize: 40, servingUnit: "g", calories: 240, proteinG: 6, carbsG: 6, fatG: 22, fiberG: 2, category: "snack" },
  { foodName: "Spinach & Feta Salad", servingSize: 200, servingUnit: "g", calories: 180, proteinG: 10, carbsG: 6, fatG: 14, fiberG: 3, category: "vegetable" },
];

const PALEO_FOODS: FoodSuggestion[] = [
  { foodName: "Grilled Salmon", servingSize: 150, servingUnit: "g", calories: 312, proteinG: 34, carbsG: 0, fatG: 18, fiberG: 0, category: "protein" },
  { foodName: "Sweet Potato Mash", servingSize: 200, servingUnit: "g", calories: 180, proteinG: 4, carbsG: 41, fatG: 0, fiberG: 6, category: "carb" },
  { foodName: "Grass-fed Beef Steak", servingSize: 200, servingUnit: "g", calories: 460, proteinG: 44, carbsG: 0, fatG: 30, fiberG: 0, category: "protein" },
  { foodName: "Roasted Vegetables", servingSize: 200, servingUnit: "g", calories: 140, proteinG: 4, carbsG: 18, fatG: 6, fiberG: 6, category: "vegetable" },
  { foodName: "Berry & Coconut Bowl", servingSize: 250, servingUnit: "g", calories: 260, proteinG: 4, carbsG: 32, fatG: 14, fiberG: 8, category: "fruit" },
  { foodName: "Chicken & Veggie Skewers", servingSize: 2, servingUnit: "skewers", calories: 280, proteinG: 32, carbsG: 8, fatG: 14, fiberG: 3, category: "protein" },
  { foodName: "Almond Crusted Fish", servingSize: 150, servingUnit: "g", calories: 320, proteinG: 28, carbsG: 6, fatG: 20, fiberG: 2, category: "protein" },
  { foodName: "Hard Boiled Eggs (3)", servingSize: 3, servingUnit: "eggs", calories: 210, proteinG: 18, carbsG: 2, fatG: 14, fiberG: 0, category: "protein" },
  { foodName: "Baked Apple with Cinnamon", servingSize: 1, servingUnit: "apple", calories: 130, proteinG: 1, carbsG: 30, fatG: 1, fiberG: 5, category: "fruit" },
  { foodName: "Avocado Salad", servingSize: 200, servingUnit: "g", calories: 240, proteinG: 4, carbsG: 12, fatG: 20, fiberG: 8, category: "fat" },
];

const DIET_MAP: Record<string, FoodSuggestion[]> = {
  omnivore: OMNIVORE_FOODS,
  vegetarian: VEGETARIAN_FOODS,
  vegan: VEGAN_FOODS,
  keto: KETO_FOODS,
  paleo: PALEO_FOODS,
};

// ─── GOAL-BASED SCORING ─────────────────────────────────────────────────────
// Each goal prioritizes different macros. The score function ranks foods
// so the most relevant items appear first in the suggestions list.

type GoalType = "lose_weight" | "maintain_weight" | "gain_muscle" | "improve_endurance" | "general_health";

function scoreForGoal(food: FoodSuggestion, goal: GoalType): number {
  switch (goal) {
    case "lose_weight":
      // Prefer: high protein, high fiber, low calorie
      return (food.proteinG * 3) + (food.fiberG * 2) - (food.calories * 0.5);

    case "gain_muscle":
      // Prefer: high protein, moderate calories
      return (food.proteinG * 5) + (food.calories * 0.2);

    case "maintain_weight":
      // Balanced — slight preference for protein and fiber
      return (food.proteinG * 2) + (food.fiberG * 1.5) + (food.carbsG * 0.5);

    case "improve_endurance":
      // Prefer: high carbs (fuel), moderate protein
      return (food.carbsG * 3) + (food.proteinG * 1.5) + (food.fiberG * 1);

    case "general_health":
      // Balanced with fiber bonus
      return (food.proteinG * 1.5) + (food.fiberG * 3) + (food.carbsG * 0.5) - (food.fatG * 0.3);

    default:
      return 0;
  }
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

export function getSuggestions(
  goalType: GoalType | string | null,
  dietPreference: string | null,
  count = 5
): FoodSuggestion[] {
  const diet = dietPreference || "omnivore";
  const goal = (goalType || "general_health") as GoalType;

  const foods = DIET_MAP[diet] || OMNIVORE_FOODS;

  // Score, sort descending, take top N
  return [...foods]
    .sort((a, b) => scoreForGoal(b, goal) - scoreForGoal(a, goal))
    .slice(0, count);
}

export function getAllFoodsForDiet(dietPreference: string | null): FoodSuggestion[] {
  const diet = dietPreference || "omnivore";
  return DIET_MAP[diet] || OMNIVORE_FOODS;
}

export const CHEAT_OPTIONS: FoodSuggestion[] = [
  { foodName: "High-Protein Brownie", servingSize: 60, servingUnit: "g", calories: 180, proteinG: 15, carbsG: 18, fatG: 8, fiberG: 4, category: "cheat" },
  { foodName: "Cauliflower Crust Pizza", servingSize: 1, servingUnit: "slice", calories: 150, proteinG: 8, carbsG: 14, fatG: 6, fiberG: 2, category: "cheat" },
  { foodName: "Air-Fried Sweet Potato Fries", servingSize: 100, servingUnit: "g", calories: 120, proteinG: 2, carbsG: 24, fatG: 3, fiberG: 4, category: "cheat" },
  { foodName: "Greek Yogurt Frozen Treat", servingSize: 150, servingUnit: "g", calories: 110, proteinG: 12, carbsG: 14, fatG: 1, fiberG: 0, category: "cheat" },
  { foodName: "Dark Chocolate & Almonds", servingSize: 30, servingUnit: "g", calories: 160, proteinG: 4, carbsG: 12, fatG: 12, fiberG: 3, category: "cheat" },
  { foodName: "Baked Kale Chips (Large)", servingSize: 50, servingUnit: "g", calories: 95, proteinG: 4, carbsG: 10, fatG: 5, fiberG: 3, category: "cheat" },
  { foodName: "Oat-Crust Apple Pie", servingSize: 1, servingUnit: "slice", calories: 190, proteinG: 3, carbsG: 32, fatG: 7, fiberG: 5, category: "cheat" },
];

export function getCheatSuggestions(count = 3): FoodSuggestion[] {
  return [...CHEAT_OPTIONS].sort(() => 0.5 - Math.random()).slice(0, count);
}
