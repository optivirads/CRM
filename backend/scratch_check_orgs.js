const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const users = await pool.query('SELECT id, email, organization_id FROM users');
  console.log('Users:', users.rows);

  const orgs = await pool.query('SELECT id, name FROM organizations');
  console.log('Orgs:', orgs.rows);

  const camps = await pool.query('SELECT id, name, organization_id FROM campaigns');
  console.log('Campaigns orgs:', camps.rows);

  await pool.end();
}
check();
