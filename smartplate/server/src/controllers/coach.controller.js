import { db } from '../db/index.js';
import { mealLogs, mealLogItems, userProfiles, healthProtocols } from '../db/schema.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

/**
 * GET /api/coach/insights
 * Proactive AI Metabolic Analysis based on daily macro gaps and active protocols.
 */
export const getCoachInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user profile and active protocols
    const [profile, activeProtocols] = await Promise.all([
      db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).then(rows => rows[0]),
      db.select().from(healthProtocols).where(and(
        eq(healthProtocols.userId, userId),
        eq(healthProtocols.status, 'active')
      )).orderBy(desc(healthProtocols.createdAt))
    ]);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Initialize your metabolic goals to begin.' });
    }

    // PRIVACY GUARD: Only return insights if user has enabled the assistant
    if (!profile.coachEnabled) {
      return res.json({ 
        enabled: false, 
        message: 'AI Metabolic Analysis is currently on standby. Enable in settings for precision insights.' 
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

    // 4. Determine Targets (Protocol-Aware)
    // If an active protocol exists, use its targets over the profile targets.
    const activeProtocol = activeProtocols[0];
    const targets = {
      calories: activeProtocol?.targetCalories || profile.dailyCalorieTarget || 2000,
      protein:  activeProtocol?.targetProteinG  || profile.dailyProteinTargetG || 150,
      carbs:    activeProtocol?.targetCarbsG    || profile.dailyCarbsTargetG   || 200,
      fat:      activeProtocol?.targetFatG      || profile.dailyFatTargetG     || 70,
    };

    // 5. Generate Professional Metabolic Feedback
    let advice = "System initialized. Log today's first nutritional entry to begin metabolic analysis.";
    let suggestion = null;

    if (logs.length > 0) {
      const proteinGap = targets.protein - intake.protein;
      const calGap = targets.calories - intake.calories;

      if (activeProtocol) {
        advice = `Current Protocol: "${activeProtocol.title}" is active. `;
      } else {
        advice = "Standard Metabolic Tracking active. ";
      }

      if (proteinGap > 30) {
        advice += `Your protein availability is currently sub-optimal by ${Math.round(proteinGap)}g. Prioritize lean amino acid sources in your next cycle to maintain muscle synthesis.`;
        suggestion = { type: 'protein', amount: Math.round(proteinGap), unit: 'g' };
      } else if (calGap > 500) {
        advice += `Metabolic window detected: You have approximately ${Math.round(calGap)} kcal remaining. Consider a nutrient-dense snack to stabilize energy flux.`;
        suggestion = { type: 'calories', amount: Math.round(calGap), unit: 'kcal' };
      } else if (calGap < -100) {
        advice += `Caloric threshold exceeded by ${Math.round(Math.abs(calGap))} kcal. Correcting trajectory: Focus on high-volume, low-calorie micronutrients for the remainder of the 24-hour cycle.`;
        suggestion = { type: 'moderation', amount: 0, unit: '' };
      } else {
        advice = activeProtocol 
          ? `Exceptional adherence to "${activeProtocol.title}". Your physiological markers are trending toward optimal alignment.`
          : "Total adherence detected. Your current nutritional velocity is perfectly synchronized with your metabolic targets.";
      }
    }

    res.json({
      enabled: true,
      protocolActive: !!activeProtocol,
      protocolTitle: activeProtocol?.title,
      data: {
        intake,
        targets,
        advice,
        suggestion
      }
    });

  } catch (err) {
    next(err);
  }
};
