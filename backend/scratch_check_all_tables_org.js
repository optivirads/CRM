const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'organization_id' AND table_schema = 'public'
  `);
  console.log('Tables with organization_id:', tables.rows.map(r => r.table_name));

  for (const t of tables.rows) {
    try {
      const count = await pool.query(`SELECT COUNT(*) as c FROM ${t.table_name} WHERE organization_id = '980b33c9-5825-44aa-87d6-7ed0e43c8c31'`);
      console.log(`Table ${t.table_name} with old org:`, count.rows[0].c);
    } catch (e) {
      console.log(`Table ${t.table_name} error:`, e.message);
    }
  }

  await pool.end();
}
check();
