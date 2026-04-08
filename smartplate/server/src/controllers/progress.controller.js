// src/controllers/progress.controller.js
import { db } from '../db/index.js';
import { weightLogs, dailyAdherence, userProfiles, awards, mealLogs, mealLogItems } from '../db/schema.js';
import { eq, and, desc, sql, gte } from 'drizzle-orm';

export const logWeight = async (req, res) => {
  const { weightKg } = req.body;
  const userId = req.user.id;

  if (!weightKg) return res.status(400).json({ error: 'Weight is required' });

  try {
    const [newLog] = await db.insert(weightLogs).values({
      userId,
      weightKg,
    }).returning();

    // Update current weight in profile too
    await db.update(userProfiles)
      .set({ weightKg })
      .where(eq(userProfiles.userId, userId));

    res.json(newLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log weight' });
  }
};

export const getWeightHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const history = await db.select()
      .from(weightLogs)
      .where(eq(weightLogs.userId, userId))
      .orderBy(desc(weightLogs.loggedAt))
      .limit(30);
    res.json(history.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weight history' });
  }
};

export const getAdherenceStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    const recentAdherence = await db.select()
      .from(dailyAdherence)
      .where(eq(dailyAdherence.userId, userId))
      .orderBy(desc(dailyAdherence.date))
      .limit(30);

    // Get earned awards
    const earnedAwards = await db.select().from(awards).where(eq(awards.userId, userId));

    res.json({
      totalPoints: profile?.totalPoints || 0,
      weeklyAwardCount: profile?.weeklyAwardCount || 0,
      recentAdherence,
      awards: earnedAwards
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch adherence stats' });
  }
};

// Internal function to calculate and award points for today
// This should be called whenever a meal is logged or at the end of the day
export const updateDailyAdherence = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate total macros for today
    const logs = await db.select({
      id: mealLogs.id
    }).from(mealLogs).where(
      and(
        eq(mealLogs.userId, userId),
        gte(mealLogs.loggedAt, today)
      )
    );

    let totalCals = 0;
    let totalProtein = 0;

    for (const log of logs) {
      const items = await db.select().from(mealLogItems).where(eq(mealLogItems.mealLogId, log.id));
      for (const item of items) {
        totalCals += item.calories;
        totalProtein += item.proteinG;
      }
    }

    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    if (!profile) return;

    let points = 5; // Base points for logging
    let status = 'on_track';

    const calDiff = Math.abs(totalCals - (profile.dailyCalorieTarget || 2000));
    const targetBuffer = (profile.dailyCalorieTarget || 2000) * 0.15; // 15% buffer

    if (calDiff <= targetBuffer && logs.length >= 3) {
      points += 10; // Bonus for hitting targets and logging multiple meals
    } else if (calDiff > targetBuffer * 2) {
      status = 'off_track';
    }

    // Upsert daily adherence
    const existing = await db.select().from(dailyAdherence).where(
      and(
        eq(dailyAdherence.userId, userId),
        gte(dailyAdherence.date, today)
      )
    ).limit(1);

    if (existing.length > 0) {
      const pDiff = points - existing[0].pointsEarned;
      await db.update(dailyAdherence)
        .set({ pointsEarned: points, status })
        .where(eq(dailyAdherence.id, existing[0].id));
      
      // Update total points in profile
      await db.update(userProfiles)
        .set({ totalPoints: sql`${userProfiles.totalPoints} + ${pDiff}` })
        .where(eq(userProfiles.userId, userId));
    } else {
      await db.insert(dailyAdherence).values({
        userId,
        pointsEarned: points,
        status,
        date: today
      });
      
      await db.update(userProfiles)
        .set({ totalPoints: sql`${userProfiles.totalPoints} + ${points}` })
        .where(eq(userProfiles.userId, userId));
    }

    // Check for monthly milestone (Cheat Day Unlock)
    const [updatedProfile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    if (updatedProfile.totalPoints >= 250) {
       // Check if already has cheat day unlock for this month
       const monthStart = new Date();
       monthStart.setDate(1);
       monthStart.setHours(0,0,0,0);
       
       const existingAward = await db.select().from(awards).where(
         and(
           eq(awards.userId, userId),
           eq(awards.type, 'cheat_day_unlock'),
           gte(awards.earnedAt, monthStart)
         )
       );

       if (existingAward.length === 0) {
         await db.insert(awards).values({
           userId,
           type: 'cheat_day_unlock'
         });
       }
    }

  } catch (error) {
    console.error('Error updating adherence:', error);
  }
};
