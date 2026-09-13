/**
 * Migration 004: Encrypt existing plaintext integration configs in-place.
 * 
 * HOW IT WORKS:
 * 1. Reads all rows from organization_integrations where connected = true
 * 2. Detects plaintext JSON configs (those without the `enc:` prefix on values)
 * 3. Encrypts each string value using AES-256-GCM
 * 4. Writes back the encrypted config to the DB
 *
 * PREREQUISITES:
 * - INTEGRATION_ENCRYPTION_KEY must be set in .env (64 hex chars = 32 bytes)
 * - Review logs/error traces first. If any secret is known to be compromised,
 *   rotate it in the provider dashboard BEFORE running this migration, then
 *   re-save the integration with the new credentials. The migration will then
 *   encrypt the new (safe) values.
 *
 * Run with: npx tsx src/database/migrations/004_encrypt_integration_configs.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { db } from '../../config/db';
import { encryptConfigObject, isEncrypted } from '../../utils/encrypt';

async function migrate() {
  console.log('Running migration 004: Encrypting integration configs in-place...');

  const { rows } = await db.query(
    `SELECT id, organization_id, config FROM organization_integrations WHERE connected = true;`
  );

  console.log(`Found ${rows.length} connected integration(s) to process.`);

  let encrypted = 0;
  let skipped = 0;

  for (const row of rows) {
    const config = row.config;

    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      skipped++;
      continue;
    }

    // Check if all string values are already encrypted
    const stringValues = Object.values(config).filter((v) => typeof v === 'string' && (v as string).length > 0);
    const alreadyEncrypted = stringValues.every((v) => isEncrypted(v as string));

    if (alreadyEncrypted && stringValues.length > 0) {
      console.log(`  [SKIP] org=${row.organization_id} id=${row.id} — already encrypted`);
      skipped++;
      continue;
    }

    try {
      const encryptedConfig = encryptConfigObject(config);
      await db.query(
        `UPDATE organization_integrations SET config = $1, updated_at = NOW() WHERE id = $2 AND organization_id = $3;`,
        [JSON.stringify(encryptedConfig), row.id, row.organization_id]
      );
      console.log(`  [OK]   org=${row.organization_id} id=${row.id} — encrypted ${stringValues.length} field(s)`);
      encrypted++;
    } catch (err: any) {
      console.error(`  [ERR]  org=${row.organization_id} id=${row.id} — ${err.message}`);
    }
  }

  console.log(`\n✅ Migration 004 complete: ${encrypted} encrypted, ${skipped} skipped.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration 004 failed:', err);
  process.exit(1);
});
