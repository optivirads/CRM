const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const uCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
  console.log('users columns:', uCols.rows.map(r => r.column_name));

  const cCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'campaigns'");
  console.log('campaigns columns:', cCols.rows.map(r => r.column_name));

  const u = await pool.query('SELECT * FROM users LIMIT 2');
  console.log('sample user:', u.rows);

  await pool.end();
}
check();
