// src/controllers/profile.controller.js
import { db } from '../db/index.js';
import { userProfiles } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// GET /api/profile
// Returns the current user's profile.
// Returns 404 with a helpful message if they haven't created one yet —
// the frontend can use this to show an "onboarding" flow.
// ---------------------------------------------------------------------------
export const getProfile = async (req, res, next) => {
  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, req.user.id));

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        hint: 'Send a PUT request to /api/profile to create your profile',
      });
    }

    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
};

/**
 * Helper for internal use by other controllers.
 * @param {string} userId
 */
export const getProfileByUserId = async (userId) => {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));
  return profile;
};



// ---------------------------------------------------------------------------
// PUT /api/profile
//
// WHY upsert instead of separate POST and PUT?
// A profile either exists or it doesn't. Making the frontend decide which
// verb to use means it needs to GET first, check, then POST or PUT.
// An upsert collapses this into one operation: "save my profile".
//
// Drizzle's onConflictDoUpdate targets the unique constraint on user_id.
// If a profile row with this user_id already exists → UPDATE it.
// If it doesn't exist → INSERT it.
// Either way, the caller gets back the current saved state.
// ---------------------------------------------------------------------------

/**
 * METABOLIC ENGINE (Mifflin-St Jeor Equation)
 * Calculates precision targets based on body metrics.
 */
function calculateMetabolicTargets(data) {
  const { gender, weightKg, heightCm, age, activityLevel, goalType } = data;
  if (!weightKg || !heightCm || !age || !gender) return null;

  // 1. Calculate BMR
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  bmr = (gender === 'male') ? bmr + 5 : bmr - 161;

  // 2. Apply Activity Multiplier (TDEE)
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };
  const tdee = bmr * (multipliers[activityLevel] || 1.2);

  // 3. Adjust for Goal
  let calories = tdee;
  if (goalType === 'weight_loss' || goalType === 'lose_weight') calories -= 500;
  if (goalType === 'extreme_loss') calories -= 750;
  if (goalType === 'muscle_gain' || goalType === 'gain_muscle' || goalType === 'bulking') calories += 300;

  // 4. Calculate Macros
  // Protein: 1.8g per kg for muscle gain/loss, 1.2g for maintenance
  const proteinMultiplier = (goalType === 'muscle_gain' || goalType === 'gain_muscle' || goalType === 'weight_loss' || goalType === 'lose_weight') ? 1.8 : 1.4;
  const proteinG = Math.round(weightKg * proteinMultiplier);

  
  // Fat: 25% of calories
  const fatG = Math.round((calories * 0.25) / 9);
  
  // Carbs: Remainder
  const carbsG = Math.round((calories - (proteinG * 4) - (fatG * 9)) / 4);

  return {
    dailyCalorieTarget: Math.round(calories),
    dailyProteinTargetG: proteinG,
    dailyCarbsTargetG: carbsG,
    dailyFatTargetG: fatG
  };
}

export const upsertProfile = async (req, res, next) => {
  try {
    const {
      heightCm, weightKg, age, gender,
      activityLevel, goalType, dietPreference,
      baselineWeightKg, baselineBodyFatPct,
      dailyCalorieTarget, dailyProteinTargetG,
      dailyCarbsTargetG, dailyFatTargetG,
      autoCalculate = true // Default to auto-calc if metrics change
    } = req.body;

    let profileData = {
      userId: req.user.id,
      updatedAt: new Date(),
      ...(gender               != null && { gender }),
      ...(heightCm             != null && { heightCm:             Number(heightCm) }),
      ...(weightKg             != null && { weightKg:             Number(weightKg) }),
      ...(age                  != null && { age:                  Number(age) }),
      ...(activityLevel        != null && { activityLevel }),
      ...(goalType             != null && { goalType }),
      ...(dietPreference       != null && { dietPreference }),
      ...(baselineWeightKg     != null && { baselineWeightKg:     Number(baselineWeightKg) }),
      ...(baselineBodyFatPct   != null && { baselineBodyFatPct:   Number(baselineBodyFatPct) }),
      ...(dailyCalorieTarget   != null && { dailyCalorieTarget:   Number(dailyCalorieTarget) }),
      ...(dailyProteinTargetG  != null && { dailyProteinTargetG:  Number(dailyProteinTargetG) }),
      ...(dailyCarbsTargetG    != null && { dailyCarbsTargetG:    Number(dailyCarbsTargetG) }),
      ...(dailyFatTargetG      != null && { dailyFatTargetG:      Number(dailyFatTargetG) }),
      ...(req.body.coachEnabled != null && { coachEnabled:         Boolean(req.body.coachEnabled) }),
    };

    // Auto-calculate targets if metrics are provided and autoCalculate is on
    if (autoCalculate && (heightCm || weightKg || age || activityLevel || goalType)) {
      // Fetch existing if some are missing in the request
      const existing = await getProfileByUserId(req.user.id);
      const calcData = {
        gender: gender || existing?.gender,
        weightKg: weightKg || existing?.weightKg,
        heightCm: heightCm || existing?.heightCm,
        age: age || existing?.age,
        activityLevel: activityLevel || existing?.activityLevel,
        goalType: goalType || existing?.goalType
      };

      const targets = calculateMetabolicTargets(calcData);
      if (targets) {
        profileData = { ...profileData, ...targets };
      }
    }

    const [profile] = await db
      .insert(userProfiles)
      .values(profileData)
      .onConflictDoUpdate({
        target: userProfiles.userId, 
        set:    profileData,         
      })
      .returning();

    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
};