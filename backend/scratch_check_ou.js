const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const ou = await pool.query(`
    SELECT ou.user_id, u.email, ou.organization_id, o.name as org_name 
    FROM organization_users ou 
    JOIN users u ON ou.user_id = u.id 
    JOIN organizations o ON ou.organization_id = o.id
  `);
  console.log('Org Users:');
  console.log(ou.rows);

  const camps = await pool.query('SELECT DISTINCT organization_id FROM campaigns');
  console.log('Campaign org IDs:');
  console.log(camps.rows);

  const clients = await pool.query('SELECT DISTINCT organization_id FROM clients');
  console.log('Clients org IDs:');
  console.log(clients.rows);

  await pool.end();
}
check();
