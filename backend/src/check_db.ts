import { db } from './config/db';

async function main() {
  try {
    const res = await db.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, ou.is_owner, r.slug as role_slug, r.name as role_name
      FROM users u
      LEFT JOIN organization_users ou ON u.id = ou.user_id
      LEFT JOIN roles r ON ou.role_id = r.id
      ORDER BY u.created_at ASC;
    `);
    console.log('--- ALL USERS IN DB ---');
    console.table(res.rows);
  } catch (err: any) {
    console.error('Error querying DB:', err.message);
  } finally {
    process.exit(0);
  }
}

main();
