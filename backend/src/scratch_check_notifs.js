const fs = require('fs');
const envPath = 'c:\\Users\\abhin\\Desktop\\CRM\\backend\\.env';
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)/);
    if (m) process.env[m[1]] = m[2].trim();
  });
}

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/optivir_crm'
});

async function main() {
  console.log('=== LATEST NOTIFICATIONS ===');
  const notifs = await pool.query('SELECT id, title, message, type, created_at FROM notifications ORDER BY created_at DESC LIMIT 5;');
  console.log(notifs.rows);

  console.log('\n=== LATEST ACTIVITIES ===');
  const acts = await pool.query('SELECT id, type, subject, description, completed_at FROM activities ORDER BY completed_at DESC LIMIT 5;');
  console.log(acts.rows);

  console.log('\n=== LATEST UPDATED TASKS ===');
  const tasks = await pool.query('SELECT id, title, assignee_id, assignee_name, script_content, updated_at FROM tasks ORDER BY updated_at DESC LIMIT 3;');
  console.log(tasks.rows);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
