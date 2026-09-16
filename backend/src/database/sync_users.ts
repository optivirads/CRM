import { db } from '../config/db';
import { hashPassword } from '../utils/auth';

async function syncUsers() {
  console.log('🔄 Syncing user accounts and setting active password...');

  const passwordHash = hashPassword('admin123');

  // 1. Reset optivirads@gmail.com password and lockout
  await db.query(`
    UPDATE users 
    SET password_hash = $1, failed_login_attempts = 0, lockout_until = NULL, status = 'active'
    WHERE LOWER(email) = 'optivirads@gmail.com';
  `, [passwordHash]);

  // 2. Identify the main organization for optivirads@gmail.com
  const orgRes = await db.query(`
    SELECT ou.organization_id 
    FROM organization_users ou
    JOIN users u ON ou.user_id = u.id
    WHERE LOWER(u.email) = 'optivirads@gmail.com'
    LIMIT 1;
  `);

  const orgId = orgRes.rows[0]?.organization_id || 'befa2e4a-48c8-4bc0-b62b-192acc3561a8';
  console.log(`🏢 Primary organization ID: ${orgId}`);

  // 3. Ensure optivirads@gmail.com membership has is_owner = true and all tabs
  const optivirUser = await db.query(`SELECT id FROM users WHERE LOWER(email) = 'optivirads@gmail.com';`);
  if (optivirUser.rows.length > 0) {
    const adminRoleIdRes = await db.query(
      `SELECT id FROM roles WHERE (organization_id = $1 OR organization_id IS NULL) AND slug = 'super_admin' LIMIT 1;`,
      [orgId]
    );
    const adminRoleId = adminRoleIdRes.rows[0]?.id || null;

    await db.query(`
      INSERT INTO organization_users (organization_id, user_id, role_id, designation, is_owner, status, allowed_tabs)
      VALUES ($1, $2, $3, 'Managing Director & Founder', true, 'active', ARRAY['*'])
      ON CONFLICT (organization_id, user_id) DO UPDATE
      SET is_owner = true,
          status = 'active',
          allowed_tabs = ARRAY['*'],
          role_id = COALESCE(EXCLUDED.role_id, organization_users.role_id);
    `, [orgId, optivirUser.rows[0].id, adminRoleId]);
  }

  // 4. Link standard agency personas
  const usersToSync = [
    {
      email: 'sales@optivirads.com',
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'sales_lead',
      designation: 'Head of Growth & Pipeline',
      tabs: ['dashboard', 'leads', 'pipeline', 'proposals', 'clients', 'reports']
    },
    {
      email: 'media@optivirads.com',
      firstName: 'Ananya',
      lastName: 'Iyer',
      role: 'media_buyer',
      designation: 'Head of Media & Ad Buying',
      tabs: ['dashboard', 'clients', 'projects', 'tasks', 'marketing', 'reports']
    },
    {
      email: 'finance@optivirads.com',
      firstName: 'Karan',
      lastName: 'Mehta',
      role: 'finance_lead',
      designation: 'Financial Controller',
      tabs: ['dashboard', 'finance', 'proposals', 'reports']
    }
  ];

  for (const u of usersToSync) {
    let uRes = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1);', [u.email]);
    let uid: string;
    if (uRes.rows.length === 0) {
      const ins = await db.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, status)
        VALUES ($1, $2, $3, $4, 'active')
        RETURNING id;
      `, [u.email.toLowerCase(), passwordHash, u.firstName, u.lastName]);
      uid = ins.rows[0].id;
    } else {
      uid = uRes.rows[0].id;
      await db.query(`
        UPDATE users 
        SET password_hash = $1, status = 'active', first_name = $2, last_name = $3
        WHERE id = $4;
      `, [passwordHash, u.firstName, u.lastName, uid]);
    }

    const rRes = await db.query(
      'SELECT id FROM roles WHERE (organization_id = $1 OR organization_id IS NULL) AND slug = $2 LIMIT 1;',
      [orgId, u.role]
    );
    const rId = rRes.rows[0]?.id || null;

    await db.query(`
      INSERT INTO organization_users (organization_id, user_id, role_id, designation, is_owner, status, allowed_tabs)
      VALUES ($1, $2, $3, $4, false, 'active', $5)
      ON CONFLICT (organization_id, user_id) DO UPDATE
      SET role_id = EXCLUDED.role_id,
          designation = EXCLUDED.designation,
          status = 'active',
          allowed_tabs = EXCLUDED.allowed_tabs;
    `, [orgId, uid, rId, u.designation, u.tabs]);
  }

  console.log('✅ User accounts and passwords synchronized successfully!');
  process.exit(0);
}

syncUsers().catch(err => {
  console.error('❌ User sync failed:', err);
  process.exit(1);
});
