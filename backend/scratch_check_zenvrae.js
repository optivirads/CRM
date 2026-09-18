const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const z1 = await pool.query("SELECT * FROM clients WHERE id = '9b164fd5-42b9-4380-b142-701f5f39b6ac'");
  const z2 = await pool.query("SELECT * FROM clients WHERE id = 'a3df1695-78bf-4229-8378-8000422618fe'");
  console.log('z1 (with campaigns):', z1.rows[0]);
  console.log('z2 (opened in UI):', z2.rows[0]);

  const z1Camps = await pool.query("SELECT id, name, platform, budget FROM campaigns WHERE client_id = '9b164fd5-42b9-4380-b142-701f5f39b6ac'");
  console.log('z1 campaigns:', z1Camps.rows);

  const z2Camps = await pool.query("SELECT id, name, platform, budget FROM campaigns WHERE client_id = 'a3df1695-78bf-4229-8378-8000422618fe'");
  console.log('z2 campaigns:', z2Camps.rows);

  await pool.end();
}
check();
