// src/controllers/stats.controller.js
import { db } from '../db/index.js';
import { mealLogs, mealLogItems } from '../db/schema.js';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// CONCEPT: sql`` template tag
//
// Drizzle's query builder covers most cases, but for aggregations involving
// date functions (date_trunc, CAST, etc.) we use Drizzle's sql`` escape hatch.
// This is NOT raw string concatenation — it's a tagged template that still
// uses parameterized queries underneath. Safe from SQL injection.
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// GET /api/meal-logs/stats/daily?date=2025-01-15
//
// Returns the total macros for a single day.
// If no date is provided, defaults to today.
//
// SQL concept: JOIN + WHERE + SUM + GROUP BY
// We join meal_logs to meal_log_items, filter to one user + one day,
// then SUM each nutrient column into a single result row.
// ---------------------------------------------------------------------------
export const getDailyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Parse the date query param, default to today
    // WHY parse manually? new Date("2025-01-15") gives midnight UTC.
    // We use it only for date comparison after truncation, so this is fine.
    const dateParam = req.query.date
      ? new Date(req.query.date)
      : new Date();

    // Format as YYYY-MM-DD for PostgreSQL date comparison
    const dateStr = dateParam.toISOString().split('T')[0];

    // ---------------------------------------------------------------------------
    // THE QUERY — read this carefully, it's the core of Phase 3
    //
    // date_trunc('day', meal_logs.logged_at) truncates a timestamp to midnight.
    // So "2025-01-15 14:32:00" becomes "2025-01-15 00:00:00".
    // This lets us GROUP BY day regardless of what time meals were logged.
    //
    // CAST(... AS DATE) converts the truncated timestamp to a plain date string.
    // COALESCE(SUM(...), 0) returns 0 instead of NULL when there are no rows.
    // ---------------------------------------------------------------------------
    const result = await db.execute(sql`
      SELECT
        CAST(date_trunc('day', ml.logged_at) AS DATE)  AS date,
        COALESCE(SUM(mli.calories),   0)::float        AS calories,
        COALESCE(SUM(mli.protein_g),  0)::float        AS protein_g,
        COALESCE(SUM(mli.carbs_g),    0)::float        AS carbs_g,
        COALESCE(SUM(mli.fat_g),      0)::float        AS fat_g,
        COALESCE(SUM(mli.fiber_g),    0)::float        AS fiber_g,
        COUNT(DISTINCT ml.id)::int                     AS meal_count,
        COUNT(mli.id)::int                             AS item_count
      FROM meal_logs ml
      LEFT JOIN meal_log_items mli ON mli.meal_log_id = ml.id
      WHERE ml.user_id    = ${userId}
        AND CAST(date_trunc('day', ml.logged_at) AS DATE) = ${dateStr}::date
      GROUP BY date_trunc('day', ml.logged_at)
    `);

    // If no meals logged that day, return zeroed-out shape
    // WHY return zeros instead of 404?
    // The frontend chart always needs a data point. Returning 404 forces
    // the frontend to handle "no data" as an error state — messy.
    // Returning a zeroed shape means the chart just shows 0 for that day.
    const row = result.rows[0] ?? {
      date: dateStr,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      meal_count: 0,
      item_count: 0,
    };

    res.json({ data: row });
  } catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// GET /api/meal-logs/stats/weekly?startDate=2025-01-13
//
// Returns one row per day for 7 days starting from startDate.
// If no startDate, defaults to 7 days ago (the past week).
//
// This is the exact shape Recharts <BarChart> expects:
// [{ date: "2025-01-13", calories: 1840, protein_g: 92, ... }, ...]
//
// SQL concept: generate_series + LEFT JOIN
// generate_series produces a row for EVERY day in the range — even days
// with no meals. Without it, days with no data would be missing from the
// array entirely, and your chart would show gaps instead of zeros.
// ---------------------------------------------------------------------------
export const getWeeklyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); // 6 days ago = 7 day window

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr   = endDate.toISOString().split('T')[0];

    // ---------------------------------------------------------------------------
    // generate_series(start, end, interval) is a PostgreSQL function that
    // produces a sequence of values. Here it generates one timestamp per day.
    //
    // We LEFT JOIN meal data onto this generated series so every day appears
    // in the result — days without meals get NULLs which COALESCE turns to 0.
    // ---------------------------------------------------------------------------
    const result = await db.execute(sql`
      SELECT
        CAST(day AS DATE)                              AS date,
        COALESCE(SUM(mli.calories),  0)::float        AS calories,
        COALESCE(SUM(mli.protein_g), 0)::float        AS protein_g,
        COALESCE(SUM(mli.carbs_g),   0)::float        AS carbs_g,
        COALESCE(SUM(mli.fat_g),     0)::float        AS fat_g,
        COALESCE(SUM(mli.fiber_g),   0)::float        AS fiber_g,
        COUNT(DISTINCT ml.id)::int                    AS meal_count
      FROM generate_series(
        ${startStr}::date,
        ${endStr}::date,
        '1 day'::interval
      ) AS day
      LEFT JOIN meal_logs ml
        ON CAST(date_trunc('day', ml.logged_at) AS DATE) = CAST(day AS DATE)
        AND ml.user_id = ${userId}
      LEFT JOIN meal_log_items mli
        ON mli.meal_log_id = ml.id
      GROUP BY day
      ORDER BY day ASC
    `);

    // Shape for Recharts — the array is already in the right format
    // Each object becomes one bar group in a <BarChart>
    res.json({
      data: result.rows,
      meta: { startDate: startStr, endDate: endStr, days: result.rows.length },
    });
  } catch (err) {
    next(err);
  }
};


// ---------------------------------------------------------------------------
// GET /api/meal-logs/stats/range?from=2025-01-01&to=2025-01-31
//
// Custom date range — used for monthly views and custom analytics.
// Same pattern as weekly but the window is user-defined.
// ---------------------------------------------------------------------------
export const getRangeStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        error: 'Both from and to query parameters are required. Format: YYYY-MM-DD',
      });
    }

    // Validate date format
    const fromDate = new Date(from);
    const toDate   = new Date(to);

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ error: 'from must be before or equal to to' });
    }

    // WHY cap the range at 366 days?
    // Without a cap, a user (or attacker) could request 10 years of data.
    // generate_series would produce 3,650 rows before even touching meal data.
    // A reasonable cap keeps the endpoint predictable.
    const diffDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 366) {
      return res.status(400).json({ error: 'Date range cannot exceed 366 days' });
    }

    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr   = toDate.toISOString().split('T')[0];

    const result = await db.execute(sql`
      SELECT
        CAST(day AS DATE)                              AS date,
        COALESCE(SUM(mli.calories),  0)::float        AS calories,
        COALESCE(SUM(mli.protein_g), 0)::float        AS protein_g,
        COALESCE(SUM(mli.carbs_g),   0)::float        AS carbs_g,
        COALESCE(SUM(mli.fat_g),     0)::float        AS fat_g,
        COALESCE(SUM(mli.fiber_g),   0)::float        AS fiber_g,
        COUNT(DISTINCT ml.id)::int                    AS meal_count
      FROM generate_series(
        ${fromStr}::date,
        ${toStr}::date,
        '1 day'::interval
      ) AS day
      LEFT JOIN meal_logs ml
        ON CAST(date_trunc('day', ml.logged_at) AS DATE) = CAST(day AS DATE)
        AND ml.user_id = ${userId}
      LEFT JOIN meal_log_items mli
        ON mli.meal_log_id = ml.id
      GROUP BY day
      ORDER BY day ASC
    `);

    res.json({
      data: result.rows,
      meta: { from: fromStr, to: toStr, days: result.rows.length },
    });
  } catch (err) {
    next(err);
  }
};