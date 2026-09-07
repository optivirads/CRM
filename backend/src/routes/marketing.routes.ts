import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
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

export default router;
