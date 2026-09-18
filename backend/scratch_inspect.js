const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const r = await pool.query("SELECT c.id, c.company_id, comp.name, c.created_at FROM clients c LEFT JOIN companies comp ON c.company_id = comp.id WHERE comp.name ILIKE '%zenvrae%'");
  console.log('ZenVrae rows:', r.rows);

  const camps = await pool.query(`
    SELECT c.id, c.name, c.client_id, comp.name as client_name, c.budget,
           COALESCE(SUM(cm.spend), 0) as spend,
           COALESCE(SUM(cm.leads), 0) as leads,
           COALESCE(SUM(cm.conversions), 0) as conversions,
           COALESCE(SUM(cm.revenue), 0) as revenue
    FROM campaigns c
    LEFT JOIN clients cl ON c.client_id = cl.id
    LEFT JOIN companies comp ON cl.company_id = comp.id
    LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
    GROUP BY c.id, comp.name;
  `);
  console.log('All campaigns with client names:');
  console.log(JSON.stringify(camps.rows, null, 2));

  await pool.end();
}
check();
