import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
      }
);

async function clearMockData() {
  console.log('🧹 Starting cleanup of mock data from OptiVir CRM Database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // List of transactional/mock data tables to clean in foreign-key safe order
    const tablesToClean = [
      'audit_logs',
      'activities',
      'campaign_metrics',
      'campaigns',
      'payments',
      'invoice_items',
      'invoices',
      'expenses',
      'tasks',
      'projects',
      'client_onboarding_checklists',
      'client_services',
      'clients',
      'deals',
      'leads',
      'contacts',
      'companies'
    ];

    console.log('\n📊 Removing mock records:');
    for (const table of tablesToClean) {
      const checkRes = await client.query(`SELECT to_regclass('public.${table}') as exists;`);
      if (checkRes.rows[0]?.exists) {
        const countBefore = await client.query(`SELECT COUNT(*) FROM ${table};`);
        await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
        console.log(`  ✓ Cleared ${table} (${countBefore.rows[0].count} mock records removed)`);
      }
    }

    // Clean non-admin demo users if any, keeping the main admin account
    const userRes = await client.query(`
      SELECT email FROM users WHERE email != 'admin@optivir.com';
    `);
    if (userRes.rows.length > 0) {
      await client.query(`
        DELETE FROM organization_users WHERE user_id IN (SELECT id FROM users WHERE email != 'admin@optivir.com');
        DELETE FROM users WHERE email != 'admin@optivir.com';
      `);
      console.log(`  ✓ Removed ${userRes.rows.length} demo staff accounts (preserved admin@optivir.com)`);
    }

    // Standardize Organization Name
    await client.query(`
      UPDATE organizations
      SET name = 'OptiVir CRM', slug = 'optivir-crm'
      WHERE slug = 'optivir-digital' OR slug = 'optivir-crm';
    `);
    console.log('  ✓ Verified organization identity set to OptiVir CRM');

    await client.query('COMMIT');

    console.log('\n✨ All mock data has been successfully removed from the database!');
    console.log('🔒 Preserved core system foundations:');
    console.log('  • Admin account: admin@optivir.com (Password: Admin@123456)');
    console.log('  • RBAC Roles & System Permissions');
    console.log('  • Sales Pipelines & Stages');
    console.log('  • Services Catalog & Lead Sources');
    console.log('  • Schema Migrations Table');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to clear mock data:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

clearMockData();
