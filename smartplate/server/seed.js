import { db } from './src/db/index.js';
import { tribes } from './src/db/schema.js';

async function seed() {
  console.log("Seeding Official Tribes...");
  const officialTribes = [
    { name: 'Keto Warriors', slug: 'keto-warriors', description: 'Mastering the art of fat-burning and mental clarity.' },
    { name: 'Early Risers', slug: 'early-risers', description: 'Fueling your morning workout for maximum metabolic boost.' },
    { name: 'Bulk Season', slug: 'bulk-season', description: 'Precision calorie surplus for massive muscle gains.' },
    { name: 'Muscle Masters', slug: 'muscle-masters', description: 'Calculated high-protein protocols for a chiseled physique.' },
    { name: 'Vegan Voyage', slug: 'vegan-voyage', description: 'Ethical, plant-based nutrition with optimized amino profiles.' }
  ];

  try {
    for (const tribe of officialTribes) {
      await db.insert(tribes).values(tribe).onConflictDoNothing();
      console.log(`- Seeded: ${tribe.name}`);
    }
    console.log("Done!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
