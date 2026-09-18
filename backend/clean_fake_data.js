const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function cleanFakeData() {
  // Check fake campaigns
  const fakeCamps = await pool.query("SELECT id, name FROM campaigns WHERE organization_id = '980b33c9-5825-44aa-87d6-7ed0e43c8c31'");
  console.log('Fake seed campaigns count:', fakeCamps.rows.length);

  // Delete fake metrics and campaigns
  await pool.query(`
    DELETE FROM campaign_metrics 
    WHERE campaign_id IN (SELECT id FROM campaigns WHERE organization_id = '980b33c9-5825-44aa-87d6-7ed0e43c8c31');
  `);
  await pool.query("DELETE FROM campaigns WHERE organization_id = '980b33c9-5825-44aa-87d6-7ed0e43c8c31'");
  console.log('Deleted fake seed campaigns.');

  // Point ZenVrae real campaigns to the active client record a3df1695-78bf-4229-8378-8000422618fe
  const upd = await pool.query(`
    UPDATE campaigns 
    SET client_id = 'a3df1695-78bf-4229-8378-8000422618fe' 
    WHERE client_id = '9b164fd5-42b9-4380-b142-701f5f39b6ac'
    RETURNING id, name, client_id;
  `);
  console.log('Re-linked real ZenVrae campaigns to active client record:', upd.rows);

  // Permanently delete soft-deleted z1 duplicate client record
  await pool.query("DELETE FROM clients WHERE id = '9b164fd5-42b9-4380-b142-701f5f39b6ac'");
  console.log('Deleted soft-deleted duplicate client record.');

  // Ensure all 3 real campaigns are in befa2e4a-48c8-4bc0-b62b-192acc3561a8
  const remaining = await pool.query("SELECT id, name, client_id, organization_id, platform, budget FROM campaigns");
  console.log('Remaining REAL campaigns in database:', remaining.rows);

  await pool.end();
}
cleanFakeData();
