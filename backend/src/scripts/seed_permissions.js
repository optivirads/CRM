const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seedPermissions() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const permissions = [
      { code: 'view_dashboard', module: 'dashboard', name: 'View Executive Dashboard', desc: 'Access agency financial aggregates & active client MRR' },
      { code: 'export_dossier', module: 'reports', name: 'Export Executive Dossiers', desc: 'Download board-level PDF summaries & reports' },
      { code: 'manage_leads', module: 'leads', name: 'Create & Edit CRM Leads', desc: 'Create inbound leads, adjust deal values & stages' },
      { code: 'delete_leads', module: 'leads', name: 'Delete Records & Deals', desc: 'Hard delete lead files & pipeline cards' },
      { code: 'view_pipeline', module: 'pipeline', name: 'Access Sales Pipeline', desc: 'Drag-and-drop deals across lifecycle columns' },
      { code: 'edit_pipeline', module: 'pipeline', name: 'Re-configure Pipeline Stages', desc: 'Modify SLA thresholds & probability rates' },
      { code: 'manage_clients', module: 'clients', name: 'Manage Client 360 Records', desc: 'Access active deliverables, SLAs & billing links' },
      { code: 'access_vault', module: 'settings', name: 'Access Credential Vault', desc: 'View partner IDs & delegated access tokens' },
      { code: 'generate_invoices', module: 'finance', name: 'Generate GST Tax Invoices', desc: 'Create Rule 46 compliant CBIC SAC 998361 invoices' },
      { code: 'manage_settings', module: 'settings', name: 'Modify Tenant Settings', desc: 'Change agency logo, legal details & timezone' },
      { code: 'manage_users', module: 'settings', name: 'Manage Team Directory', desc: 'Invite staff & assign security roles' },
      { code: 'view_audit', module: 'operations', name: 'Inspect Security Audit Log', desc: 'View full 256-bit operator activity stream' },
      { code: 'manage_projects', module: 'projects', name: 'Manage Projects & Milestones', desc: 'Create, update, and manage agency projects' },
      { code: 'delete_projects', module: 'projects', name: 'Delete Projects', desc: 'Remove projects and milestones' },
      { code: 'manage_tasks', module: 'tasks', name: 'Manage Tasks & Deliverables', desc: 'Assign, advance stage, and update task progress' },
      { code: 'delete_tasks', module: 'tasks', name: 'Delete Tasks', desc: 'Remove deliverables and tasks from pipeline' },
      { code: 'manage_creatives', module: 'creative-studio', name: 'Creative Studio & Proofing', desc: 'Upload, review, and approve creative proofs' },
    ];

    for (const p of permissions) {
      await client.query(`
        INSERT INTO permissions (code, module, name, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO UPDATE
        SET name = EXCLUDED.name,
            module = EXCLUDED.module,
            description = EXCLUDED.description;
      `, [p.code, p.module, p.name, p.desc]);
    }
    console.log(`[Seed] Successfully inserted/updated ${permissions.length} permissions.`);

    const rolesRes = await client.query('SELECT id, slug FROM roles;');
    const permsRes = await client.query('SELECT id, code FROM permissions;');
    const permMap = new Map();
    permsRes.rows.forEach(p => permMap.set(p.code, p.id));

    const roleDefaults = {
      super_admin: permissions.map(p => p.code),
      admin: permissions.map(p => p.code),
      coo: permissions.filter(p => p.code !== 'access_vault').map(p => p.code),
      sales: ['view_dashboard', 'manage_leads', 'view_pipeline', 'manage_clients', 'manage_tasks'],
      marketing: ['view_dashboard', 'manage_creatives', 'manage_tasks', 'manage_projects', 'manage_clients'],
      finance: ['view_dashboard', 'generate_invoices', 'export_dossier', 'manage_clients'],
      operations: ['view_dashboard', 'manage_projects', 'manage_tasks', 'delete_tasks', 'manage_creatives', 'manage_clients', 'view_audit']
    };

    for (const role of rolesRes.rows) {
      const defaultCodes = roleDefaults[role.slug] || ['view_dashboard'];
      for (const code of defaultCodes) {
        const permId = permMap.get(code);
        if (permId) {
          await client.query(`
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES ($1, $2)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
          `, [role.id, permId]);
        }
      }
    }

    await client.query('COMMIT');
    console.log('[Seed] Role permissions mapped successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed Error]', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPermissions();
