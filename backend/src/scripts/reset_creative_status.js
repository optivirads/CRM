const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query("UPDATE creatives SET status = 'DEPLOYMENT_READY' WHERE name = 'DM Series - epi 1'")
  .then(r => { console.log('Successfully updated rows:', r.rowCount); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
