import { db } from '../db/index.js';
import { mealLogs, mealLogItems, userProfiles } from '../db/schema.js';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * GET /api/coach/insights
 * Proactive AI Coaching logic based on daily macro gaps.
 */
export const getCoachInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user profile and goals
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Set up your goals first!' });
    }

    // PRIVACY GUARD: Only return insights if user has enabled the coach
    if (!profile.coachEnabled) {
      return res.json({ 
        enabled: false, 
        message: 'AI Coaching is currently disabled. Enable it in settings for personalized insights!' 
      });
    }

    // 2. Fetch today's logs and intake
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await db
      .select({
        calories: mealLogItems.calories,
        protein: mealLogItems.proteinG,
        carbs: mealLogItems.carbsG,
        fat: mealLogItems.fatG,
      })
      .from(mealLogItems)
      .innerJoin(mealLogs, eq(mealLogItems.mealLogId, mealLogs.id))
      .where(and(
        eq(mealLogs.userId, userId),
        gte(mealLogs.loggedAt, today),
        lte(mealLogs.loggedAt, tomorrow)
      ));

    // 3. Sum current intake
    const intake = logs.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // 4. Generate Support Advice (Casual/Supportive Tone)
    let advice = "You're off to a great start! Keep logging your meals to see how your day balances out.";
    let suggestion = null;

    if (logs.length > 0) {
      const proteinGap = (profile.dailyProteinTargetG || 0) - intake.protein;
      const calGap = (profile.dailyCalorieTarget || 0) - intake.calories;

      if (proteinGap > 30) {
        advice = "You're doing awesome today! I noticed you're a little behind on your protein—maybe try adding some chicken, tofu, or a protein shake to your next meal? You've got this!";
        suggestion = { type: 'protein', amount: Math.round(proteinGap), unit: 'g' };
      } else if (calGap > 500) {
        advice = "Great job staying consistent! You still have plenty of energy room for the day. Feel free to enjoy a healthy snack to keep your metabolism humming!";
        suggestion = { type: 'calories', amount: Math.round(calGap), unit: 'kcal' };
      } else if (calGap < -100) {
        advice = "Whoops, looks like we went a bit over our calorie target today. No sweat! It happens to everyone. Let's aim for a lighter, nutrient-dense meal for dinner.";
        suggestion = { type: 'moderation', amount: 0, unit: '' };
      } else {
        advice = "Incredible work! You are tracking perfectly on your targets. Your body is going to thank you for this consistency!";
      }
    }

    res.json({
      enabled: true,
      data: {
        intake,
        targets: {
          calories: profile.dailyCalorieTarget,
          protein: profile.dailyProteinTargetG,
          carbs: profile.dailyCarbsTargetG,
          fat: profile.dailyFatTargetG,
        },
        advice,
        suggestion
      }
    });

  } catch (err) {
    next(err);
  }
};
