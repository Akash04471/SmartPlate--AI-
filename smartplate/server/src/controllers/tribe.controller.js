import { db } from '../db/index.js';
import { tribes, tribeMemberships, userProfiles, users } from '../db/schema.js';
import { eq, sql, desc, and } from 'drizzle-orm';

/**
 * GET /api/tribes
 * List all available official tribes with member counts.
 */
export const listTribes = async (req, res, next) => {
  try {
    // We use a subquery or join to get member counts
    const tribeList = await db
      .select({
        id: tribes.id,
        name: tribes.name,
        slug: tribes.slug,
        description: tribes.description,
        memberCount: sql`COUNT(${tribeMemberships.id})::int`,
      })
      .from(tribes)
      .leftJoin(tribeMemberships, eq(tribes.id, tribeMemberships.tribeId))
      .groupBy(tribes.id);

    res.json({ data: tribeList });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/tribes/:slug/join
 * Join an official tribe.
 */
export const joinTribe = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    // 1. Find the tribe
    const [tribe] = await db
      .select()
      .from(tribes)
      .where(eq(tribes.slug, slug))
      .limit(1);

    if (!tribe) return res.status(404).json({ error: 'Tribe not found' });

    // 2. Check if already a member
    const [existing] = await db
      .select()
      .from(tribeMemberships)
      .where(and(eq(tribeMemberships.tribeId, tribe.id), eq(tribeMemberships.userId, userId)))
      .limit(1);

    if (existing) return res.status(400).json({ error: 'You are already a member of this tribe' });

    // 3. Join
    await db.insert(tribeMemberships).values({
      tribeId: tribe.id,
      userId: userId,
    });

    res.status(201).json({ message: `Successfully joined ${tribe.name}!` });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tribes/:slug/leaderboard
 * Get the top 10 members of a tribe by totalPoints.
 */
export const getTribeLeaderboard = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const [tribe] = await db
      .select()
      .from(tribes)
      .where(eq(tribes.slug, slug))
      .limit(1);

    if (!tribe) return res.status(404).json({ error: 'Tribe not found' });

    const leaderboard = await db
      .select({
        userName: users.name,
        points: userProfiles.totalPoints,
        avatar: users.id, // placeholder
      })
      .from(tribeMemberships)
      .innerJoin(users, eq(tribeMemberships.userId, users.id))
      .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(tribeMemberships.tribeId, tribe.id))
      .orderBy(desc(userProfiles.totalPoints))
      .limit(10);

    res.json({ tribe: tribe.name, data: leaderboard });
  } catch (err) {
    next(err);
  }
};

/**
 * SEED SCRIPT (Internal use or triggered by first request)
 */
export const seedTribes = async (req, res, next) => {
  try {
    const officialTribes = [
      { name: 'Keto Warriors', slug: 'keto-warriors', description: 'Mastering the art of fat-burning and mental clarity.' },
      { name: 'Early Risers', slug: 'early-risers', description: 'Fueling your morning workout for maximum metabolic boost.' },
      { name: 'Bulk Season', slug: 'bulk-season', description: 'Precision calorie surplus for massive muscle gains.' },
      { name: 'Muscle Masters', slug: 'muscle-masters', description: 'Calculated high-protein protocols for a chiseled physique.' },
      { name: 'Vegan Voyage', slug: 'vegan-voyage', description: 'Ethical, plant-based nutrition with optimized amino profiles.' }
    ];

    for (const tribe of officialTribes) {
      await db.insert(tribes).values(tribe).onConflictDoNothing();
    }

    if (res) res.json({ message: 'Shields up! Official Tribes have been initialized.' });
  } catch (err) {
    if (next) next(err);
    else console.error(err);
  }
};
