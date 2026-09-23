import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT || '5432'), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, ssl: { rejectUnauthorized: false } }
);

async function test() {
  const org = await pool.query('SELECT id FROM organizations LIMIT 1');
  const orgId = org.rows[0].id;
  const user = await pool.query("SELECT id FROM users WHERE email = 'shahanapk188@gmail.com'");
  const userId = user.rows[0].id;
  
  // Notice status is undefined!
  const status = undefined;
  const designation = 'Senior Operations Partner';
  const roleId = null;
  const team_id = null;
  const targetTabs = ['dashboard', 'projects', 'tasks'];
  const client_id = null;

  const params: any[] = [roleId || null, designation, status, team_id || null, targetTabs, client_id, orgId, userId];

  try {
    const res = await pool.query(
      `UPDATE organization_users
       SET role_id = COALESCE($1, role_id),
           designation = COALESCE($2, designation),
           status = COALESCE($3, status),
           team_id = COALESCE($4, team_id),
           allowed_tabs = COALESCE($5, allowed_tabs),
           client_id = $6,
           updated_at = NOW()
       WHERE organization_id = $7 AND user_id = $8
       RETURNING *;`,
      params
    );
    console.log('QUERY SUCCESS:', res.rows[0]);
  } catch (err: any) {
    console.error('QUERY FAILED:', err);
  } finally {
    await pool.end();
  }
}

test();
