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
  image?: string;
  category?: string;
}

// ─── FOOD DATABASE (curated per diet type) ──────────────────────────────────

const OMNIVORE_FOODS: FoodSuggestion[] = [
  { foodName: "Grilled Chicken Breast", servingSize: 150, servingUnit: "g", calories: 231, proteinG: 43, carbsG: 0, fatG: 5, fiberG: 0, category: "protein", image: "/images/food/chicken_breast.png" },
  { foodName: "Salmon Fillet", servingSize: 150, servingUnit: "g", calories: 312, proteinG: 34, carbsG: 0, fatG: 18, fiberG: 0, category: "protein", image: "/images/food/salmon_fillet.png" },
  { foodName: "Brown Rice", servingSize: 150, servingUnit: "g", calories: 173, proteinG: 4, carbsG: 36, fatG: 1, fiberG: 2, category: "carb", image: "/images/food/brown_rice.png" },
  { foodName: "Sweet Potato", servingSize: 200, servingUnit: "g", calories: 180, proteinG: 4, carbsG: 41, fatG: 0, fiberG: 6, category: "carb", image: "/images/food/sweet_potato.png" },
  { foodName: "Scrambled Eggs (3)", servingSize: 3, servingUnit: "eggs", calories: 222, proteinG: 18, carbsG: 2, fatG: 15, fiberG: 0, category: "protein", image: "/images/food/scrambled_eggs.png" },
  { foodName: "Greek Yogurt", servingSize: 200, servingUnit: "g", calories: 130, proteinG: 20, carbsG: 8, fatG: 2, fiberG: 0, category: "protein", image: "/images/food/greek_yogurt.png" },
  { foodName: "Avocado Toast", servingSize: 1, servingUnit: "slice", calories: 250, proteinG: 6, carbsG: 22, fatG: 16, fiberG: 7, category: "fat", image: "/images/food/avocado_toast.png" },
  { foodName: "Turkey Wrap", servingSize: 1, servingUnit: "wrap", calories: 320, proteinG: 28, carbsG: 30, fatG: 10, fiberG: 3, category: "protein", image: "/images/food/turkey_wrap.png" },
  { foodName: "Sirloin Steak", servingSize: 200, servingUnit: "g", calories: 480, proteinG: 52, carbsG: 0, fatG: 28, fiberG: 0, category: "protein", image: "/images/food/grilled_steak.png" },
];

const VEGETARIAN_FOODS: FoodSuggestion[] = [
  { foodName: "Paneer Tikka", servingSize: 150, servingUnit: "g", calories: 280, proteinG: 22, carbsG: 6, fatG: 18, fiberG: 0, category: "protein", image: "/images/food/veg_paneer_tikka.png" },
  { foodName: "Chickpea Curry", servingSize: 200, servingUnit: "g", calories: 260, proteinG: 14, carbsG: 36, fatG: 6, fiberG: 10, category: "protein", image: "/images/food/veg_chickpea_curry.png" },
  { foodName: "Quinoa Bowl", servingSize: 200, servingUnit: "g", calories: 240, proteinG: 8, carbsG: 40, fatG: 4, fiberG: 5, category: "carb", image: "/images/food/veg_quinoa_bowl.png" },
  { foodName: "Lentil Soup", servingSize: 300, servingUnit: "ml", calories: 210, proteinG: 14, carbsG: 32, fatG: 3, fiberG: 12, category: "protein", image: "/images/food/lentil_soup.png" },
  { foodName: "Tofu Stir-fry", servingSize: 200, servingUnit: "g", calories: 220, proteinG: 18, carbsG: 12, fatG: 12, fiberG: 3, category: "protein", image: "/images/food/tofu_stirfry.png" },
  { foodName: "Greek Yogurt Parfait", servingSize: 250, servingUnit: "g", calories: 220, proteinG: 16, carbsG: 30, fatG: 4, fiberG: 3, category: "protein" },
  { foodName: "Cottage Cheese Bowl", servingSize: 200, servingUnit: "g", calories: 206, proteinG: 28, carbsG: 6, fatG: 8, fiberG: 0, category: "protein" },
];

const VEGAN_FOODS: FoodSuggestion[] = [
  { foodName: "Tofu Scramble", servingSize: 200, servingUnit: "g", calories: 190, proteinG: 18, carbsG: 6, fatG: 10, fiberG: 2, category: "protein", image: "/images/food/vegan_tofu_scramble.png" },
  { foodName: "Black Bean Tacos", servingSize: 2, servingUnit: "tacos", calories: 340, proteinG: 16, carbsG: 46, fatG: 8, fiberG: 12, category: "protein", image: "/images/food/vegan_black_bean_tacos.png" },
  { foodName: "Smoothie Bowl", servingSize: 350, servingUnit: "ml", calories: 320, proteinG: 10, carbsG: 55, fatG: 8, fiberG: 9, category: "fruit", image: "/images/food/smoothie_bowl.png" },
  { foodName: "Tofu Stir-fry", servingSize: 200, servingUnit: "g", calories: 220, proteinG: 18, carbsG: 12, fatG: 12, fiberG: 3, category: "protein", image: "/images/food/tofu_stirfry.png" },
  { foodName: "Lentil Soup", servingSize: 300, servingUnit: "ml", calories: 210, proteinG: 14, carbsG: 32, fatG: 3, fiberG: 12, category: "protein", image: "/images/food/lentil_soup.png" },
  { foodName: "Chickpea Salad", servingSize: 200, servingUnit: "g", calories: 220, proteinG: 10, carbsG: 30, fatG: 6, fiberG: 8, category: "protein" },
];

const KETO_FOODS: FoodSuggestion[] = [
  { foodName: "Bacon & Eggs", servingSize: 1, servingUnit: "plate", calories: 380, proteinG: 26, carbsG: 2, fatG: 30, fiberG: 0, category: "protein", image: "/images/food/keto_bacon_eggs.png" },
  { foodName: "Avocado & Salmon", servingSize: 1, servingUnit: "bowl", calories: 420, proteinG: 28, carbsG: 4, fatG: 34, fiberG: 6, category: "fat", image: "/images/food/keto_salmon_avocado.png" },
  { foodName: "Grilled Steak", servingSize: 200, servingUnit: "g", calories: 480, proteinG: 52, carbsG: 0, fatG: 28, fiberG: 0, category: "protein", image: "/images/food/grilled_steak.png" },
  { foodName: "Bulletproof Coffee", servingSize: 300, servingUnit: "ml", calories: 250, proteinG: 0, carbsG: 0, fatG: 28, fiberG: 0, category: "fat" },
  { foodName: "Cheese Omelette", servingSize: 1, servingUnit: "omelette", calories: 340, proteinG: 22, carbsG: 2, fatG: 28, fiberG: 0, category: "protein" },
];

const PALEO_FOODS: FoodSuggestion[] = [
  { foodName: "Grilled Salmon", servingSize: 150, servingUnit: "g", calories: 312, proteinG: 34, carbsG: 0, fatG: 18, fiberG: 0, category: "protein", image: "/images/food/salmon_fillet.png" },
  { foodName: "Sweet Potato Mash", servingSize: 200, servingUnit: "g", calories: 180, proteinG: 4, carbsG: 41, fatG: 0, fiberG: 6, category: "carb", image: "/images/food/sweet_potato.png" },
  { foodName: "Grass-fed Steak", servingSize: 200, servingUnit: "g", calories: 480, proteinG: 52, carbsG: 0, fatG: 28, fiberG: 0, category: "protein", image: "/images/food/grilled_steak.png" },
  { foodName: "Roasted Vegetables", servingSize: 200, servingUnit: "g", calories: 140, proteinG: 4, carbsG: 18, fatG: 6, fiberG: 6, category: "vegetable" },
];

const DIET_MAP: Record<string, FoodSuggestion[]> = {
  omnivore: OMNIVORE_FOODS,
  vegetarian: VEGETARIAN_FOODS,
  vegan: VEGAN_FOODS,
  keto: KETO_FOODS,
  paleo: PALEO_FOODS,
};

// ─── GOAL-BASED SCORING ─────────────────────────────────────────────────────

type GoalType = "lose_weight" | "maintain_weight" | "gain_muscle" | "improve_endurance" | "general_health";

function scoreForGoal(food: FoodSuggestion, goal: GoalType): number {
  switch (goal) {
    case "lose_weight":
      return (food.proteinG * 3) + (food.fiberG * 2) - (food.calories * 0.5);
    case "gain_muscle":
      return (food.proteinG * 5) + (food.calories * 0.2);
    case "maintain_weight":
      return (food.proteinG * 2) + (food.fiberG * 1.5) + (food.carbsG * 0.5);
    case "improve_endurance":
      return (food.carbsG * 3) + (food.proteinG * 1.5) + (food.fiberG * 1);
    case "general_health":
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

  return [...foods]
    .sort((a, b) => scoreForGoal(b, goal) - scoreForGoal(a, goal))
    .slice(0, count);
}

export function getAllFoodsForDiet(dietPreference: string | null): FoodSuggestion[] {
  const diet = dietPreference || "omnivore";
  return DIET_MAP[diet] || OMNIVORE_FOODS;
}

export const CHEAT_OPTIONS: FoodSuggestion[] = [
  { foodName: "High-Protein Brownie", servingSize: 60, servingUnit: "g", calories: 180, proteinG: 15, carbsG: 18, fatG: 8, fiberG: 4, category: "cheat", image: "/images/food/cheat_brownie.png" },
  { foodName: "Cauliflower Crust Pizza", servingSize: 1, servingUnit: "slice", calories: 150, proteinG: 8, carbsG: 14, fatG: 6, fiberG: 2, category: "cheat" },
  { foodName: "Oat-Crust Apple Pie", servingSize: 1, servingUnit: "slice", calories: 190, proteinG: 3, carbsG: 32, fatG: 7, fiberG: 5, category: "cheat" },
];

export function getCheatSuggestions(count = 3): FoodSuggestion[] {
  return [...CHEAT_OPTIONS].sort(() => 0.5 - Math.random()).slice(0, count);
}
