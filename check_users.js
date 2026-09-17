const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, ou.is_owner, r.slug as role_slug, r.name as role_name
      FROM users u
      LEFT JOIN organization_users ou ON u.id = ou.user_id
      LEFT JOIN roles r ON ou.role_id = r.id
      ORDER BY u.created_at ASC;
    `);
    console.log('All Users in DB:');
    console.table(res.rows);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}
run();
