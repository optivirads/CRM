/**
 * Migration 005: Add persistent failed-login tracking columns to users table.
 * Run with: npx tsx src/database/migrations/005_add_login_tracking.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { db } from '../../config/db';

async function migrate() {
  console.log('Running migration 005: Add login tracking columns...');

  await db.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMPTZ DEFAULT NULL;
  `);

  console.log('✅ Migration 005 complete: failed_login_attempts and lockout_until added to users.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration 005 failed:', err);
  process.exit(1);
});
