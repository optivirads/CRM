require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const users = await pool.query(`
    SELECT u.id, u.email, u.first_name, u.last_name, r.slug as role_slug, r.name as role_name, ou.is_owner, ou.allowed_tabs, ou.designation
    FROM users u
    JOIN organization_users ou ON u.id = ou.user_id
    LEFT JOIN roles r ON ou.role_id = r.id;
  `);
  console.log('=== USERS ===');
  console.table(users.rows.map(u => ({
    email: u.email,
    role_slug: u.role_slug,
    is_owner: u.is_owner,
    allowed_tabs: (u.allowed_tabs || []).join(','),
  })));

  const orgUsersCols = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'organization_users';
  `);
  console.log('=== ORGANIZATION_USERS COLUMNS ===');
  console.log(orgUsersCols.rows.map(c => c.column_name));

  const userCols = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users';
  `);
  console.log('=== USERS COLUMNS ===');
  console.log(userCols.rows.map(c => c.column_name));
}

main().catch(console.error).finally(() => pool.end());
