// src/controllers/protocol.controller.js
import { db } from '../db/index.js';
import { healthProtocols, mealLogs, mealLogItems } from '../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';

// Ownership guard — same pattern as meal.controller.js
const findOwnedProtocol = async (protocolId, userId) => {
  const [protocol] = await db
    .select()
    .from(healthProtocols)
    .where(and(
      eq(healthProtocols.id, protocolId),
      eq(healthProtocols.userId, userId)
    ));
  return protocol ?? null;
};


// POST /api/protocols
export const createProtocol = async (req, res, next) => {
  try {
    const {
      title, description, status,
      startDate, endDate,
      targetCalories, targetProteinG,
      targetCarbsG, targetFatG,
    } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required' });
    }

    const validStatuses = ['draft', 'active', 'completed', 'paused'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const [protocol] = await db
      .insert(healthProtocols)
      .values({
        userId:         req.user.id,
        title:          title.trim(),
        description:    description ?? null,
        status:         status ?? 'draft',
        startDate:      startDate ? new Date(startDate) : null,
        endDate:        endDate   ? new Date(endDate)   : null,
        targetCalories: targetCalories ? Number(targetCalories) : null,
        targetProteinG: targetProteinG ? Number(targetProteinG) : null,
        targetCarbsG:   targetCarbsG   ? Number(targetCarbsG)   : null,
        targetFatG:     targetFatG     ? Number(targetFatG)     : null,
      })
      .returning();

    res.status(201).json({ data: protocol });
  } catch (err) {
    next(err);
  }
};


// GET /api/protocols
export const getProtocols = async (req, res, next) => {
  try {
    // WHY allow ?status= filter here?
    // The frontend will want to show "active protocols" separately from
    // "completed" ones. Filtering in the DB is always faster than
    // fetching all and filtering in JS.
    const { status } = req.query;

    const conditions = [eq(healthProtocols.userId, req.user.id)];
    if (status) conditions.push(eq(healthProtocols.status, status));

    const protocols = await db
      .select()
      .from(healthProtocols)
      .where(and(...conditions))
      .orderBy(desc(healthProtocols.createdAt));

    res.json({ data: protocols });
  } catch (err) {
    next(err);
  }
};


// GET /api/protocols/:protocolId
export const getProtocolById = async (req, res, next) => {
  try {
    const protocol = await findOwnedProtocol(req.params.protocolId, req.user.id);
    if (!protocol) return res.status(404).json({ error: 'Protocol not found' });
    res.json({ data: protocol });
  } catch (err) {
    next(err);
  }
};


// PATCH /api/protocols/:protocolId
export const updateProtocol = async (req, res, next) => {
  try {
    const protocol = await findOwnedProtocol(req.params.protocolId, req.user.id);
    if (!protocol) return res.status(404).json({ error: 'Protocol not found' });

    const {
      title, description, status,
      startDate, endDate,
      targetCalories, targetProteinG,
      targetCarbsG, targetFatG,
    } = req.body;

    const updates = { updatedAt: new Date() };
    if (title       !== undefined) updates.title       = title.trim();
    if (description !== undefined) updates.description = description;
    if (status      !== undefined) updates.status      = status;
    if (startDate   !== undefined) updates.startDate   = new Date(startDate);
    if (endDate     !== undefined) updates.endDate     = new Date(endDate);
    if (targetCalories !== undefined) updates.targetCalories = Number(targetCalories);
    if (targetProteinG !== undefined) updates.targetProteinG = Number(targetProteinG);
    if (targetCarbsG   !== undefined) updates.targetCarbsG   = Number(targetCarbsG);
    if (targetFatG     !== undefined) updates.targetFatG     = Number(targetFatG);

    const [updated] = await db
      .update(healthProtocols)
      .set(updates)
      .where(and(
        eq(healthProtocols.id, protocol.id),
        eq(healthProtocols.userId, req.user.id)
      ))
      .returning();

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};


// DELETE /api/protocols/:protocolId
export const deleteProtocol = async (req, res, next) => {
  try {
    const protocol = await findOwnedProtocol(req.params.protocolId, req.user.id);
    if (!protocol) return res.status(404).json({ error: 'Protocol not found' });

    await db
      .delete(healthProtocols)
      .where(and(
        eq(healthProtocols.id, protocol.id),
        eq(healthProtocols.userId, req.user.id)
      ));

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// GET /api/protocols/summary
//
// This is the most important endpoint in Phase 4.
// It pulls together three pieces of data in a single response:
//   1. All active protocols for this user
//   2. Today's actual nutrition intake (from meal_log_items)
//   3. Progress: actual vs target for each macro
//
// WHY combine this into one endpoint instead of making the frontend
// call /protocols?status=active and /stats/daily separately?
// Because this is data that ALWAYS appears together on the dashboard.
// Combining into one request = one network round trip = faster page load.
// This pattern is called a "composite endpoint" or "BFF endpoint"
// (Backend For Frontend).
// ---------------------------------------------------------------------------
export const getProtocolSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today  = new Date().toISOString().split('T')[0];

    // Fetch active protocols and today's stats in parallel
    // WHY Promise.all? These two queries are independent — neither needs
    // the result of the other to run. Running them in parallel cuts
    // response time roughly in half compared to awaiting them sequentially.
    const [activeProtocols, todayStatsResult] = await Promise.all([
      db
        .select()
        .from(healthProtocols)
        .where(and(
          eq(healthProtocols.userId, userId),
          eq(healthProtocols.status, 'active')
        ))
        .orderBy(desc(healthProtocols.createdAt)),

      db.execute(sql`
        SELECT
          COALESCE(SUM(mli.calories),  0)::float AS calories,
          COALESCE(SUM(mli.protein_g), 0)::float AS protein_g,
          COALESCE(SUM(mli.carbs_g),   0)::float AS carbs_g,
          COALESCE(SUM(mli.fat_g),     0)::float AS fat_g
        FROM meal_logs ml
        LEFT JOIN meal_log_items mli ON mli.meal_log_id = ml.id
        WHERE ml.user_id = ${userId}
          AND CAST(date_trunc('day', ml.logged_at) AS DATE) = ${today}::date
      `),
    ]);

    const todayStats = todayStatsResult.rows[0] ?? {
      calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0,
    };

    // Calculate progress against each active protocol's targets
    // WHY do this in JS rather than SQL?
    // The percentage calculation references both the protocol targets and
    // today's stats. Doing this join logic in JS is cleaner than a
    // complex SQL expression — the data sets are tiny (rarely more than
    // 5 active protocols) so there's no performance concern.
    const protocolsWithProgress = activeProtocols.map(protocol => {
      const progress = {};

      if (protocol.targetCalories) {
        progress.calories = {
          target:  protocol.targetCalories,
          actual:  todayStats.calories,
          percent: Math.round((todayStats.calories / protocol.targetCalories) * 100),
        };
      }
      if (protocol.targetProteinG) {
        progress.protein = {
          target:  protocol.targetProteinG,
          actual:  todayStats.protein_g,
          percent: Math.round((todayStats.protein_g / protocol.targetProteinG) * 100),
        };
      }
      if (protocol.targetCarbsG) {
        progress.carbs = {
          target:  protocol.targetCarbsG,
          actual:  todayStats.carbs_g,
          percent: Math.round((todayStats.carbs_g / protocol.targetCarbsG) * 100),
        };
      }
      if (protocol.targetFatG) {
        progress.fat = {
          target:  protocol.targetFatG,
          actual:  todayStats.fat_g,
          percent: Math.round((todayStats.fat_g / protocol.targetFatG) * 100),
        };
      }

      return { ...protocol, progress };
    });

    res.json({
      data: {
        activeProtocols: protocolsWithProgress,
        todayStats,
        date: today,
      },
    });
  } catch (err) {
    next(err);
  }
};