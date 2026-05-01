import { db } from '../db/index.js';
import { mealLogs, mealLogItems, userProfiles, healthProtocols, weightLogs } from '../db/schema.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import fs from 'fs';

const logToFile = (msg) => {
  const timestamp = new Date().toISOString();
  console.log(`[COACH] ${msg}`); // Standard console log for Vercel/Production logs
  
  // Only attempt file write if NOT in a production/serverless environment
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    try {
      fs.appendFileSync('coach_debug.log', `[${timestamp}] ${msg}\n`);
    } catch (err) {
      // Silently fail on file system errors (e.g. EROFS on Vercel)
    }
  }
};

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

/**
 * POST /api/coach/chat
 * Talkable AI Coach using Gemini
 */
export const chatWithCoach = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message, history = [] } = req.body;

    logToFile(`Chat request from user ${userId}: "${message}"`);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Gather Rich Context
    logToFile(`Gathering context for user ${userId}...`);
    
    let profile, activeProtocols, recentLogs, recentWeights;
    
    try {
      [profile, activeProtocols, recentLogs, recentWeights] = await Promise.all([
        db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).then(rows => rows[0]),
        db.select().from(healthProtocols).where(and(
          eq(healthProtocols.userId, userId),
          eq(healthProtocols.status, 'active')
        )).orderBy(desc(healthProtocols.createdAt)),
        db.select({
          mealType: mealLogs.mealType,
          loggedAt: mealLogs.loggedAt,
          calories: mealLogItems.calories,
          protein: mealLogItems.proteinG,
          carbs: mealLogItems.carbsG,
          fat: mealLogItems.fatG,
          foodName: mealLogItems.foodName
        })
        .from(mealLogItems)
        .innerJoin(mealLogs, eq(mealLogItems.mealLogId, mealLogs.id))
        .where(and(
          eq(mealLogs.userId, userId),
          gte(mealLogs.loggedAt, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
        ))
        .orderBy(desc(mealLogs.loggedAt)),
        db.select().from(weightLogs)
          .where(eq(weightLogs.userId, userId))
          .orderBy(desc(weightLogs.loggedAt))
          .limit(5)
      ]);
      logToFile("Context gathering successful.");
    } catch (dbErr) {
      logToFile(`DATABASE ERROR during context gathering: ${dbErr.message}`);
      throw dbErr;
    }

    if (!profile) {
      logToFile(`Profile not found for user ${userId}`);
      return res.status(404).json({ error: 'Profile not found.' });
    }

    logToFile(`Context summary: ${recentLogs.length} logs, ${activeProtocols.length} protocols, ${recentWeights.length} weight entries.`);

    // 2. Prepare context for Gemini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = recentLogs.filter(log => new Date(log.loggedAt) >= today);
    
    const todayIntake = todayLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const activeProtocol = activeProtocols[0];
    const targets = {
      calories: activeProtocol?.targetCalories || profile.dailyCalorieTarget || 2000,
      protein:  activeProtocol?.targetProteinG  || profile.dailyProteinTargetG || 150,
      carbs:    activeProtocol?.targetCarbsG    || profile.dailyCarbsTargetG   || 200,
      fat:      activeProtocol?.targetFatG      || profile.dailyFatTargetG     || 70,
    };

    const context = `
User Context:
- Goal: ${profile.goalType || 'Not set'}
- Diet Preference: ${profile.dietPreference || 'Omnivore'}
- Nutritional Targets: ${targets.calories} kcal, ${targets.protein}g Protein, ${targets.carbs}g Carbs, ${targets.fat}g Fat.
- Today's Intake so far: ${Math.round(todayIntake.calories)} kcal, ${Math.round(todayIntake.protein)}g Protein, ${Math.round(todayIntake.carbs)}g Carbs, ${Math.round(todayIntake.fat)}g Fat.
- Active Protocol: ${activeProtocol ? `"${activeProtocol.title}" (${activeProtocol.description})` : 'None'}
- Recent Weight Trend: ${recentWeights.map(w => `${w.weightKg}kg on ${new Date(w.loggedAt).toLocaleDateString()}`).join(', ') || 'No weight data logged yet'}
- Recent Meals (last 3 days): ${recentLogs.slice(0, 10).map(l => `${l.foodName} (${l.calories}kcal)`).join(', ')}
`;

    // 3. Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logToFile("GEMINI_API_KEY is missing in .env");
      return res.status(500).json({ error: 'AI Coach configuration error' });
    }

    logToFile("Initializing Gemini 2.5 Flash...");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const systemPrompt = `
You are "SmartPlate AI", a professional, motivating, and highly intelligent health and nutrition coach.
Your goal is to help the user achieve their fitness targets through precision guidance.
Use the provided User Context to give personalized, data-driven advice.
Be concise but encouraging. If the user is off-track, be supportive but firm on adjustments.
If the user asks about their progress, use the weight trend and macro intake data.
Always maintain a premium, high-tech persona.

${context}
`;

    // Gemini history MUST start with 'user' role. 
    // If the frontend sends a leading model message (like the greeting), we must strip it or prepend a user message.
    let formattedHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    }));

    // Find the first index of a 'user' message
    const firstUserIndex = formattedHistory.findIndex(h => h.role === 'user');
    if (firstUserIndex !== -1) {
      formattedHistory = formattedHistory.slice(firstUserIndex);
    } else {
      formattedHistory = []; // If no user message found, start fresh
    }

    const modelNames = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-2.5-pro",
    ];
    logToFile(`Model grid initialized with: ${modelNames.join(", ")}`);

    // 4. Start Chat & Send Message (Smart Swapping)
    let result;
    let retries = 5; // More retries to go through the grid
    let currentModelIndex = 0;

    while (retries >= 0) {
      const activeModelName = modelNames[currentModelIndex];
      logToFile(`Attempting with model: ${activeModelName} (Retries left: ${retries})`);
      
      try {
        const model = genAI.getGenerativeModel({ 
          model: activeModelName,
          systemInstruction: systemPrompt
          // Removed tools: [{ googleSearch: {} }] as it can cause 404/not supported errors on some tiers
        });

        const chat = model.startChat({
          history: formattedHistory
        });

        result = await chat.sendMessage(message);
        logToFile(`Success with model: ${activeModelName}`);
        break;
      } catch (err) {
        logToFile(`Error with ${activeModelName}: ${err.message}`);
        
        const errorMessage = err.message || "";
        const isRetryable = errorMessage.includes('429') || 
                          errorMessage.includes('503') || 
                          errorMessage.includes('404') ||
                          errorMessage.includes('quota') ||
                          errorMessage.includes('models/');

        if (isRetryable && retries > 0) {
          // SWAP MODEL for next attempt
          currentModelIndex = (currentModelIndex + 1) % modelNames.length;
          logToFile(`Swapping to next available model tier: ${modelNames[currentModelIndex]}`);
          
          const waitTime = (4 - retries) * 1000; 
          await new Promise(r => setTimeout(r, waitTime));
          retries--;
        } else {
          throw err;
        }
      }
    }

    const response = await result.response;
    const text = response.text();

    logToFile(`Gemini response success for user ${userId}`);

    res.json({
      message: text,
    });

  } catch (err) {
    logToFile(`CRITICAL ERROR: ${err.message}\nStack: ${err.stack}`);
    console.error("❌ Coach Chat Error:", err);
    
    // Return the actual underlying error for client debugging
    res.status(500).json({ 
      error: err.message || 'Failed to communicate with AI Coach.',
      details: err.toString()
    });
  }
};
