const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const m = await pool.query(`
    SELECT cm.* 
    FROM campaign_metrics cm
    JOIN campaigns c ON cm.campaign_id = c.id
    WHERE c.organization_id = 'befa2e4a-48c8-4bc0-b62b-192acc3561a8'
  `);
  console.log('Metrics for user org:', m.rows);

  const allClients = await pool.query('SELECT c.id, c.organization_id, comp.name FROM clients c LEFT JOIN companies comp ON c.company_id = comp.id');
  console.log('All clients and their orgs:', allClients.rows);

  await pool.end();
}
check();
