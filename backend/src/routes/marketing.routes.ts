import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// 1. Campaigns List with performance summary
router.get('/campaigns', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { clientId, platform, status } = req.query;

  try {
    let query = `
      SELECT 
        c.*,
        comp.name as client_name,
        COALESCE(SUM(cm.spend), 0) as total_spend,
        COALESCE(SUM(cm.impressions), 0) as total_impressions,
        COALESCE(SUM(cm.clicks), 0) as total_clicks,
        COALESCE(SUM(cm.leads), 0) as total_leads,
        COALESCE(SUM(cm.conversions), 0) as total_conversions,
        COALESCE(SUM(cm.revenue), 0) as total_revenue,
        ROUND(AVG(cm.roas), 2) as avg_roas
      FROM campaigns c
      JOIN clients cl ON c.client_id = cl.id
      JOIN companies comp ON cl.company_id = comp.id
      LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
      WHERE c.organization_id = $1 AND c.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (clientId) {
      params.push(clientId);
      query += ` AND c.client_id = $${params.length}`;
    }
    if (platform) {
      params.push(platform);
      query += ` AND c.platform = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }

    query += ` GROUP BY c.id, comp.name ORDER BY c.created_at DESC;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Marketing Analytics Overview (Platform attribution & Daily trend)
router.get('/analytics', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    // Platform Breakdown
    const platformRes = await db.query(`
      SELECT 
        c.platform,
        COUNT(DISTINCT c.id) as campaign_count,
        COALESCE(SUM(cm.spend), 0) as spend,
        COALESCE(SUM(cm.leads), 0) as leads,
        COALESCE(SUM(cm.conversions), 0) as conversions,
        COALESCE(SUM(cm.revenue), 0) as revenue,
        ROUND(AVG(cm.roas), 2) as roas
      FROM campaigns c
      LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
      WHERE c.organization_id = $1 AND c.deleted_at IS NULL
      GROUP BY c.platform;
    `, [orgId]);

    // Paid vs Organic Spend Comparison
    const paidSpendRes = await db.query(`
      SELECT COALESCE(SUM(cm.spend), 0) as paid_spend
      FROM campaign_metrics cm
      JOIN campaigns c ON cm.campaign_id = c.id
      WHERE c.organization_id = $1;
    `, [orgId]);

    const organicSpendRes = await db.query(`
      SELECT COALESCE(SUM(op.organic_spend), 0) as organic_spend
      FROM organic_performance op
      JOIN clients cl ON op.client_id = cl.id
      WHERE cl.organization_id = $1;
    `, [orgId]);

    res.json({
      success: true,
      data: {
        platformPerformance: platformRes.rows,
        spendComparison: {
          paidSpend: Number(paidSpendRes.rows[0]?.paid_spend || 0),
          organicSpend: Number(organicSpendRes.rows[0]?.organic_spend || 0)
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Create Campaign
router.post('/campaigns', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { name, platform, client_id, budget, status, objective, start_date, end_date } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ success: false, message: 'Campaign name is required' });
    return;
  }

  try {
    let resolvedClientId = client_id;
    if (!resolvedClientId) {
      const fallbackClient = await db.query('SELECT id FROM clients WHERE organization_id = $1 AND deleted_at IS NULL LIMIT 1;', [orgId]);
      resolvedClientId = fallbackClient.rows[0]?.id;
    }

    if (!resolvedClientId) {
      const comp = await db.query(`
        INSERT INTO companies (organization_id, name, created_by)
        VALUES ($1, 'Default Agency Client', $2) RETURNING id;
      `, [orgId, userId]);
      const newCl = await db.query(`
        INSERT INTO clients (organization_id, company_id, created_by)
        VALUES ($1, $2, $3) RETURNING id;
      `, [orgId, comp.rows[0].id, userId]);
      resolvedClientId = newCl.rows[0].id;
    }

    const validPlatforms = ['Meta', 'Google Ads', 'LinkedIn', 'TikTok', 'YouTube', 'SEO / Organic', 'Email Marketing', 'Influencer', 'Other'];
    const resolvedPlatform = validPlatforms.includes(platform) ? platform : 'Meta';

    const result = await db.query(`
      INSERT INTO campaigns (
        organization_id, client_id, name, platform, budget, status, objective, start_date, end_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `, [
      orgId, resolvedClientId, name.trim(), resolvedPlatform,
      Number(budget || 0), status || 'Active', objective || 'Lead Gen',
      start_date || new Date(), end_date || null, userId
    ]);

    await recordAuditLog(orgId, userId, 'CREATE', 'campaigns', result.rows[0].id, null, result.rows[0], req);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Update Campaign
router.patch('/campaigns/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const campaignId = req.params.id;
  const { name, budget, status, objective } = req.body;

  try {
    const current = await db.query('SELECT * FROM campaigns WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;', [campaignId, orgId]);
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    const updated = await db.query(`
      UPDATE campaigns
      SET 
        name = COALESCE($1, name),
        budget = COALESCE($2, budget),
        status = COALESCE($3, status),
        objective = COALESCE($4, objective),
        updated_by = $5
      WHERE id = $6 AND organization_id = $7
      RETURNING *;
    `, [name, budget, status, objective, userId, campaignId, orgId]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'campaigns', campaignId, current.rows[0], updated.rows[0], req);
    res.json({ success: true, data: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Delete Campaign (Soft Delete)
router.delete('/campaigns/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const campaignId = req.params.id;

  try {
    const result = await db.query(`
      UPDATE campaigns
      SET deleted_at = NOW(), updated_by = $1
      WHERE id = $2 AND organization_id = $3 AND deleted_at IS NULL
      RETURNING id;
    `, [userId, campaignId, orgId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Campaign not found or already deleted' });
      return;
    }

    await recordAuditLog(orgId, userId, 'DELETE', 'campaigns', campaignId, null, null, req);
    res.json({ success: true, message: 'Campaign successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
