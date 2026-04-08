// src/controllers/meal.controller.js
import { db } from '../db/index.js';
import { mealLogs, mealLogItems } from '../db/schema.js';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { updateDailyAdherence } from './progress.controller.js';



// ---------------------------------------------------------------------------
// HELPER: ownership guard
//
// This is the most important security pattern in this entire file.
// PROBLEM: req.user.id tells us WHO is logged in. But it does NOT prevent
// user A from deleting user B's meal log if they know the UUID.
// Example attack: DELETE /api/meal-logs/<user-B-uuid> with user A's token.
//
// SOLUTION: Every query that touches a specific log MUST include BOTH
//   - the logId from the URL params
//   - AND the userId from req.user (set by the authenticate middleware)
//
// In SQL terms: WHERE id = $1 AND user_id = $2
// If user A tries to delete user B's log, the query finds 0 rows and returns
// 404 — not 403. This is intentional: we don't confirm the resource exists
// at all for users who don't own it (prevents enumeration).
// ---------------------------------------------------------------------------
const findOwnedLog = async (logId, userId) => {
  const [log] = await db
    .select()
    .from(mealLogs)
    .where(and(eq(mealLogs.id, logId), eq(mealLogs.userId, userId)));
  return log ?? null;
};


// POST /api/meal-logs
export const createMealLog = async (req, res, next) => {
  try {
    const { mealType, loggedAt, notes } = req.body;

    const [newLog] = await db
      .insert(mealLogs)
      .values({
        userId:   req.user.id,   // ALWAYS taken from the verified token, never from req.body
        mealType,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        notes:    notes ?? null,
      })
      .returning();

    // 201 Created — semantically different from 200 OK.
    // 201 means "a new resource was created". The Location header tells the
    // client where to find it. This is standard REST convention.
    res.status(201)
      .header('Location', `/api/meal-logs/${newLog.id}`)
      .json({ data: newLog });

  } catch (err) {
    next(err); // passes to your global error handler in app.js
  }
};


// GET /api/meal-logs
export const getMealLogs = async (req, res, next) => {
  try {
    const { date, includeItems } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    let whereClause = eq(mealLogs.userId, req.user.id);

    if (date) {
      const targetDate = date === 'today' ? new Date() : new Date(date);
      targetDate.setHours(0,0,0,0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      whereClause = and(
        whereClause,
        gte(mealLogs.loggedAt, targetDate),
        lte(mealLogs.loggedAt, nextDay)
      );
    }

    const [logs, countResult] = await Promise.all([
      db
        .select()
        .from(mealLogs)
        .where(whereClause)
        .orderBy(desc(mealLogs.loggedAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql`COUNT(*)::int` })
        .from(mealLogs)
        .where(whereClause),
    ]);

    // If includeItems is requested, fetch items for each log
    let enhancedLogs = logs;
    if (includeItems === 'true') {
      enhancedLogs = await Promise.all(logs.map(async (log) => {
         const items = await db.select().from(mealLogItems).where(eq(mealLogItems.mealLogId, log.id));
         const totals = items.reduce((acc, item) => ({
           calories: acc.calories + item.calories,
           protein: acc.protein + item.proteinG,
           carbs: acc.carbs + item.carbsG,
           fat: acc.fat + item.fatG,
         }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
         return { ...log, items, totals };
      }));
    }

    const total      = countResult[0].count;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: enhancedLogs,
      meta: { page, limit, total, totalPages },
    });
  } catch (err) {
    next(err);
  }
};



// GET /api/meal-logs/:logId
export const getMealLogById = async (req, res, next) => {
  try {
    const log = await findOwnedLog(req.params.logId, req.user.id);

    if (!log) {
      return res.status(404).json({ error: 'Meal log not found' });
    }

    // Fetch items separately — a clean N+1 trade-off at this scale.
    // For Phase 3 aggregation you'll learn about JOINs, but for CRUD
    // two clean queries is readable and fast enough for thousands of items.
    const items = await db
      .select()
      .from(mealLogItems)
      .where(eq(mealLogItems.mealLogId, log.id));

    res.json({ data: { ...log, items } });
  } catch (err) {
    next(err);
  }
};


// PATCH /api/meal-logs/:logId
// WHY PATCH and not PUT?
// PUT = replace the entire resource (you must send ALL fields).
// PATCH = partial update (send only what changed).
// Users editing their meal notes shouldn't need to re-send mealType and loggedAt.
export const updateMealLog = async (req, res, next) => {
  try {
    const log = await findOwnedLog(req.params.logId, req.user.id);
    if (!log) return res.status(404).json({ error: 'Meal log not found' });

    const { mealType, loggedAt, notes } = req.body;

    // Build update object with only the fields provided.
    // WHY not spread req.body directly? Because req.body might contain
    // fields you don't want updated (like userId). Always whitelist.
    const updates = {};
    if (mealType !== undefined) updates.mealType = mealType;
    if (loggedAt !== undefined) updates.loggedAt = new Date(loggedAt);
    if (notes !== undefined)    updates.notes    = notes;
    updates.updatedAt = new Date();

    const [updated] = await db
      .update(mealLogs)
      .set(updates)
      .where(and(eq(mealLogs.id, log.id), eq(mealLogs.userId, req.user.id)))
      .returning();

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};


// DELETE /api/meal-logs/:logId
export const deleteMealLog = async (req, res, next) => {
  try {
    const log = await findOwnedLog(req.params.logId, req.user.id);
    if (!log) return res.status(404).json({ error: 'Meal log not found' });

    await db
      .delete(mealLogs)
      .where(and(eq(mealLogs.id, log.id), eq(mealLogs.userId, req.user.id)));

    // 204 No Content — the standard response for a successful DELETE.
    // No body is sent because the resource no longer exists.
    res.status(204).send();

    // Fire and forget progress update
    updateDailyAdherence(req.user.id).catch(console.error);

  } catch (err) {
    next(err);
  }
};


// POST /api/meal-logs/:logId/items
export const addMealLogItem = async (req, res, next) => {
  try {
    // First verify the parent log belongs to this user
    const log = await findOwnedLog(req.params.logId, req.user.id);
    if (!log) return res.status(404).json({ error: 'Meal log not found' });

    const {
      foodName, servingSize, servingUnit,
      calories, proteinG, carbsG, fatG,
      fiberG, sodiumMg,
    } = req.body;

    // Required field validation
    const required = { foodName, servingSize, servingUnit, calories, proteinG, carbsG, fatG };
    const missing = Object.entries(required)
      .filter(([, v]) => v === undefined || v === null || v === '')
      .map(([k]) => k);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const [item] = await db
      .insert(mealLogItems)
      .values({
        mealLogId:   log.id,
        foodName:    String(foodName),
        servingSize: Number(servingSize),
        servingUnit: String(servingUnit),
        calories:    Number(calories),
        proteinG:    Number(proteinG),
        carbsG:      Number(carbsG),
        fatG:        Number(fatG),
        fiberG:      fiberG != null ? Number(fiberG) : null,
        sodiumMg:    sodiumMg != null ? Number(sodiumMg) : null,
      })
      .returning();

    res.status(201).json({ data: item });

    // Update progress stats
    updateDailyAdherence(req.user.id).catch(console.error);

  } catch (err) {
    next(err);
  }
};


// DELETE /api/meal-logs/:logId/items/:itemId
export const deleteMealLogItem = async (req, res, next) => {
  try {
    // Re-verify log ownership before touching any item
    const log = await findOwnedLog(req.params.logId, req.user.id);
    if (!log) return res.status(404).json({ error: 'Meal log not found' });

    // Then delete the specific item — no separate ownership query needed
    // because we already confirmed the parent log belongs to this user.
    const result = await db
      .delete(mealLogItems)
      .where(
        and(
          eq(mealLogItems.id,        req.params.itemId),
          eq(mealLogItems.mealLogId, log.id),
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Item not found in this meal log' });
    }

    res.status(204).send();

    // Update progress stats
    updateDailyAdherence(req.user.id).catch(console.error);

  } catch (err) {
    next(err);
  }
};