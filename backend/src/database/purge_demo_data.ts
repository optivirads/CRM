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

async function purgeDemoData() {
  console.log('🧹 Purging all demo, mock, and test records from PostgreSQL...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Delete test leads (e.g. Lead Tester or example.com emails)
    const delLeads = await client.query(`
      DELETE FROM leads 
      WHERE email ILIKE '%example.com%' 
         OR first_name = 'Lead' 
         OR last_name = 'Tester';
    `);
    console.log(`  ✓ Removed ${delLeads.rowCount} test leads`);

    // 2. Delete demo deals
    const delDeals = await client.query(`
      DELETE FROM deals 
      WHERE name ILIKE '%Zenith%' 
         OR name ILIKE '%Astra%' 
         OR name ILIKE '%UrbanKulture%' 
         OR name ILIKE '%Kavach%';
    `);
    console.log(`  ✓ Removed ${delDeals.rowCount} demo deals`);

    // 3. Delete demo invoices
    const delInvoices = await client.query(`
      DELETE FROM invoices 
      WHERE invoice_number ILIKE 'INV-%';
    `);
    console.log(`  ✓ Removed ${delInvoices.rowCount} demo invoices`);

    // 4. Delete demo tasks
    const delTasks = await client.query(`
      DELETE FROM tasks 
      WHERE title ILIKE '%verification suite%' 
         OR title ILIKE '%OptiVir Ads Content%';
    `);
    console.log(`  ✓ Removed ${delTasks.rowCount} demo tasks`);

    // 5. Delete demo projects
    const delProjects = await client.query(`
      DELETE FROM projects 
      WHERE name ILIKE '%Omni CRM Scale-up%';
    `);
    console.log(`  ✓ Removed ${delProjects.rowCount} demo projects`);

    // 6. Delete demo clients & companies (PRESERVING Hijabi Ladies Beauty Salon)
    const delClients = await client.query(`
      DELETE FROM clients 
      WHERE company_id IN (
        SELECT id FROM companies 
        WHERE name ILIKE '%Test Client%' 
           OR name ILIKE '%Internal Operations%'
      );
    `);
    console.log(`  ✓ Removed ${delClients.rowCount} test client accounts`);

    const delCompanies = await client.query(`
      DELETE FROM companies 
      WHERE name ILIKE '%Test Client%' 
         OR name ILIKE '%Internal Operations%';
    `);
    console.log(`  ✓ Removed ${delCompanies.rowCount} test companies`);

    // 7. Ensure proposals table is clean of any mock items
    const delProposals = await client.query(`
      DELETE FROM proposals 
      WHERE proposal_number ILIKE '%PROP-2026-%';
    `);
    console.log(`  ✓ Removed ${delProposals.rowCount} demo proposals`);

    // 8. Ensure creative comments and mock approvals are completely purged
    const delCreativeComments = await client.query(`
      DELETE FROM creative_comments
      WHERE author_email IN ('client.test@company.com', 'strict.client@testcorp.com')
         OR author_name ILIKE '%Sarah Jenkins%'
         OR content ILIKE '%typography looks clean%';
    `);
    console.log(`  ✓ Removed ${delCreativeComments.rowCount} mock creative comments`);

    const delCreativeApprovals = await client.query(`
      DELETE FROM creative_approvals
      WHERE approver_email IN ('client.test@company.com', 'strict.client@testcorp.com')
         OR approver_name ILIKE '%Sarah Jenkins%';
    `);
    console.log(`  ✓ Removed ${delCreativeApprovals.rowCount} mock creative approvals`);

    await client.query('COMMIT');
    console.log('\n✨ Purge complete. Only real user data remains in PostgreSQL.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during purge:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

purgeDemoData();
