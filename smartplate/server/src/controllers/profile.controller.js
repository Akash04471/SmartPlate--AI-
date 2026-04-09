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
export const upsertProfile = async (req, res, next) => {
  try {
    const {
      heightCm, weightKg, age,
      activityLevel, goalType, dietPreference,
      baselineWeightKg, baselineBodyFatPct,
      dailyCalorieTarget, dailyProteinTargetG,
      dailyCarbsTargetG, dailyFatTargetG,
    } = req.body;

    const profileData = {
      userId: req.user.id,
      updatedAt: new Date(),
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


    const [profile] = await db
      .insert(userProfiles)
      .values(profileData)
      .onConflictDoUpdate({
        target: userProfiles.userId,  // the unique constraint to check
        set:    profileData,          // what to update if conflict found
      })
      .returning();

    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
};