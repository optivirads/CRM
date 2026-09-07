import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Executive Management Report
router.get('/executive-summary', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const revenueRes = await db.query(`
      SELECT 
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(paid_amount), 0) as cash_collected,
        COALESCE(SUM(balance_amount), 0) as outstanding_receivables
      FROM invoices WHERE organization_id = $1 AND deleted_at IS NULL;
    `, [orgId]);

    const pipelineRes = await db.query(`
      SELECT 
        COUNT(*) as total_active_deals,
        COALESCE(SUM(value), 0) as total_pipeline_value,
        COALESCE(SUM(weighted_value), 0) as weighted_forecast
      FROM deals WHERE organization_id = $1 AND status = 'open' AND deleted_at IS NULL;
    `, [orgId]);

    const retentionRes = await db.query(`
      SELECT 
        COUNT(*) as total_clients,
        COUNT(*) FILTER (WHERE health_status = 'Healthy') as healthy_clients,
        COUNT(*) FILTER (WHERE health_status = 'Attention Needed') as attention_needed,
        COUNT(*) FILTER (WHERE health_status = 'At Risk') as at_risk_clients
      FROM clients WHERE organization_id = $1 AND status = 'Active' AND deleted_at IS NULL;
    `, [orgId]);

    const marketingRes = await db.query(`
      SELECT 
        COALESCE(SUM(cm.spend), 0) as total_ad_spend,
        COALESCE(SUM(cm.revenue), 0) as total_attributed_revenue,
        ROUND(AVG(cm.roas), 2) as blended_roas
      FROM campaign_metrics cm
      JOIN campaigns c ON cm.campaign_id = c.id
      WHERE c.organization_id = $1;
    `, [orgId]);

    res.json({
      success: true,
      data: {
        finance: revenueRes.rows[0],
        pipeline: pipelineRes.rows[0],
        retention: retentionRes.rows[0],
        marketing: marketingRes.rows[0]
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
