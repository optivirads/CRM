const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function check() {
  const posts1 = await pool.query("SELECT count(*) FROM client_social_posts WHERE client_id = '9b164fd5-42b9-4380-b142-701f5f39b6ac'");
  const posts2 = await pool.query("SELECT count(*) FROM client_social_posts WHERE client_id = 'a3df1695-78bf-4229-8378-8000422618fe'");
  console.log('posts on z1:', posts1.rows[0].count, 'posts on z2:', posts2.rows[0].count);

  const integ1 = await pool.query("SELECT count(*) FROM client_social_integrations WHERE client_id = '9b164fd5-42b9-4380-b142-701f5f39b6ac'");
  const integ2 = await pool.query("SELECT count(*) FROM client_social_integrations WHERE client_id = 'a3df1695-78bf-4229-8378-8000422618fe'");
  console.log('integ on z1:', integ1.rows[0].count, 'integ on z2:', integ2.rows[0].count);

  const acts1 = await pool.query("SELECT count(*) FROM activities WHERE client_id = '9b164fd5-42b9-4380-b142-701f5f39b6ac'");
  const acts2 = await pool.query("SELECT count(*) FROM activities WHERE client_id = 'a3df1695-78bf-4229-8378-8000422618fe'");
  console.log('activities on z1:', acts1.rows[0].count, 'activities on z2:', acts2.rows[0].count);

  await pool.end();
}
check();
