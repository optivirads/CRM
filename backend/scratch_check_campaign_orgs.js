const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const camps = await pool.query(`
    SELECT c.id, c.name, c.organization_id, c.client_id, comp.name as client_name 
    FROM campaigns c
    LEFT JOIN clients cl ON c.client_id = cl.id
    LEFT JOIN companies comp ON cl.company_id = comp.id
  `);
  console.log('Campaigns:', camps.rows);

  const orgs = await pool.query('SELECT id, name FROM organizations');
  console.log('Organizations:', orgs.rows);

  await pool.end();
}
check();
