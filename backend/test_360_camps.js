const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function test360() {
  const clientId = 'a3df1695-78bf-4229-8378-8000422618fe';
  const campaignsRes = await pool.query(`
    SELECT 
      c.*,
      COALESCE(SUM(cm.spend), 0) as total_spend,
      COALESCE(SUM(cm.impressions), 0) as total_impressions,
      COALESCE(SUM(cm.clicks), 0) as total_clicks,
      COALESCE(SUM(cm.leads), 0) as total_leads,
      COALESCE(SUM(cm.conversions), 0) as total_conversions,
      COALESCE(SUM(cm.revenue), 0) as total_revenue,
      ROUND(AVG(cm.roas), 2) as avg_roas
    FROM campaigns c
    LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
    WHERE c.client_id = $1 AND c.deleted_at IS NULL
    GROUP BY c.id
    ORDER BY c.created_at DESC;
  `, [clientId]);
  console.log('Client 360 campaigns count:', campaignsRes.rows.length);
  console.log(campaignsRes.rows.map(c => ({
    name: c.name,
    spend: c.total_spend,
    imp: c.total_impressions,
    clicks: c.total_clicks,
    platform: c.platform,
    status: c.status
  })));

  await pool.end();
}
test360();
