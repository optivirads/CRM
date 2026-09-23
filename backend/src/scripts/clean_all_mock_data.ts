import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

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

export async function runMockDataCleanup() {
  console.log('🚀 Starting system-wide mock and demo data purge...\n');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Purge all mock comments in creative_comments
    const delComments = await client.query(`
      DELETE FROM creative_comments
      WHERE author_email IN ('client.test@company.com', 'strict.client@testcorp.com')
         OR author_name ILIKE '%Sarah Jenkins%'
         OR author_name ILIKE '%Strict Test Reviewer%'
         OR content ILIKE '%typography looks clean%'
         OR content ILIKE '%authenticated via email OTP%'
         OR content ILIKE '%Looks amazing! Ready to launch%';
    `);
    console.log(`✅ [1/7] Purged ${delComments.rowCount} mock comments from creative_comments`);

    // Check if any comments remain and report
    const remainingComments = await client.query('SELECT count(*) FROM creative_comments');
    console.log(`       Remaining genuine comments: ${remainingComments.rows[0].count}`);

    // 2. Purge mock approvals in creative_approvals
    const delApprovals = await client.query(`
      DELETE FROM creative_approvals
      WHERE approver_email IN ('client.test@company.com', 'strict.client@testcorp.com')
         OR approver_name ILIKE '%Sarah Jenkins%'
         OR approver_name ILIKE '%Strict Test Reviewer%'
         OR feedback_notes ILIKE '%Ready to proceed to final delivery%'
         OR feedback_notes ILIKE '%Officially signed off and approved via verified email OTP%'
         OR (creative_id = 'a9915b02-be5a-48e9-b849-d4d6f5b99da2' AND approver_email = 'zenvraestore@gmail.com');
    `);
    console.log(`✅ [2/7] Purged ${delApprovals.rowCount} mock approval signoffs from creative_approvals`);

    // Deduplicate OptiVir Owner approvals if multiple
    const dedupApprovals = await client.query(`
      DELETE FROM creative_approvals
      WHERE creative_id = 'a9915b02-be5a-48e9-b849-d4d6f5b99da2'
        AND approver_email = 'optivirads@gmail.com'
        AND id != (
          SELECT id FROM creative_approvals
          WHERE creative_id = 'a9915b02-be5a-48e9-b849-d4d6f5b99da2'
            AND approver_email = 'optivirads@gmail.com'
          ORDER BY signed_at DESC LIMIT 1
        );
    `);
    if (dedupApprovals.rowCount && dedupApprovals.rowCount > 0) {
      console.log(`       Deduplicated ${dedupApprovals.rowCount} repeated test approvals`);
    }

    // 3. Purge mock audit logs in creative_audit_logs
    const delAudit = await client.query(`
      DELETE FROM creative_audit_logs
      WHERE actor_name ILIKE '%Sarah Jenkins%'
         OR actor_name ILIKE '%Strict Test Reviewer%'
         OR (metadata::text ILIKE '%client.test@company.com%')
         OR (metadata::text ILIKE '%strict.client@testcorp.com%');
    `);
    console.log(`✅ [3/7] Purged ${delAudit.rowCount} mock audit log entries from creative_audit_logs`);

    // 4. Purge test companies, associated clients, and test projects
    // First remove tasks attached to test projects
    const delTestTasks = await client.query(`
      DELETE FROM tasks
      WHERE title = 'test'
         OR project_id IN (
           SELECT id FROM projects WHERE name = 'Q4 Growth Campaign'
         );
    `);
    console.log(`✅ [4/7] Removed ${delTestTasks.rowCount} test tasks`);

    // Remove test projects
    const delTestProjects = await client.query(`
      DELETE FROM projects
      WHERE name = 'Q4 Growth Campaign';
    `);
    console.log(`       Removed ${delTestProjects.rowCount} test projects ('Q4 Growth Campaign')`);

    // Remove test clients
    const delTestClients = await client.query(`
      DELETE FROM clients
      WHERE company_id IN (
        SELECT id FROM companies WHERE name = 'Test RBAC Enterprise'
      );
    `);
    console.log(`       Removed ${delTestClients.rowCount} test client memberships`);

    // Remove test companies
    const delTestCompanies = await client.query(`
      DELETE FROM companies
      WHERE name = 'Test RBAC Enterprise';
    `);
    console.log(`       Removed ${delTestCompanies.rowCount} test companies ('Test RBAC Enterprise')`);

    // 5. Permanently remove soft-deleted seeded leads
    const delLeads = await client.query(`
      DELETE FROM leads
      WHERE deleted_at IS NOT NULL
         OR email IN (
           'siddharth@novasphere.tech',
           'natasha@gourmetgreens.in',
           'aditya@nextwave.education',
           'meera@luxeliving.co',
           'farhan@swiftpay.dev',
           'pooja@auraayurveda.com'
         );
    `);
    console.log(`✅ [5/7] Permanently purged ${delLeads.rowCount} seeded demo leads`);

    // 6. Permanently remove mock deals
    const delDeals = await client.query(`
      DELETE FROM deals
      WHERE deleted_at IS NOT NULL
         OR name IN ('Aura Ayurveda Performance Sprint', 'NovaSphere AI Enterprise Ad Retainer');
    `);
    console.log(`✅ [6/7] Permanently purged ${delDeals.rowCount} mock deals`);

    // 7. Permanently remove soft-deleted invoices
    const delInvoices = await client.query(`
      DELETE FROM invoices
      WHERE deleted_at IS NOT NULL;
    `);
    console.log(`✅ [7/7] Permanently purged ${delInvoices.rowCount} soft-deleted demo invoices`);

    await client.query('COMMIT');
    console.log('\n🎉 ALL MOCK & DEMO DATA SUCCESSFULLY PURGED FROM DATABASE!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during mock data cleanup:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMockDataCleanup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
