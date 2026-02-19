/**
 * One-time migration script: Add vote fields (upvotesCount, downvotesCount, score)
 * to all existing prompt documents, seeded from their likesCount.
 *
 * Run: npx tsx scripts/migrate-votes.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

async function migrate() {
  const snapshot = await db.collection('prompts').get();
  console.log(`Found ${snapshot.size} prompts to migrate.`);

  const batch = db.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Skip if already migrated
    if (data.score !== undefined && data.upvotesCount !== undefined) {
      console.log(`  Skipping ${doc.id} (already has vote fields)`);
      continue;
    }

    const likesCount = data.likesCount || 0;
    batch.update(doc.ref, {
      upvotesCount: likesCount,
      downvotesCount: 0,
      score: likesCount,
    });
    count++;
    console.log(`  Queued ${doc.id}: likesCount=${likesCount} → score=${likesCount}`);
  }

  if (count > 0) {
    await batch.commit();
    console.log(`\nMigrated ${count} prompts successfully.`);
  } else {
    console.log('\nNo prompts needed migration.');
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
