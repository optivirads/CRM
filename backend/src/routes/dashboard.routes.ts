import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.get('/stats', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    // 1. Sales Stats
    const salesRes = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM leads WHERE organization_id = $1 AND deleted_at IS NULL) as total_leads,
        (SELECT COUNT(*) FROM leads WHERE organization_id = $1 AND status = 'Qualified' AND deleted_at IS NULL) as qualified_leads,
        (SELECT COUNT(*) FROM deals WHERE organization_id = $1 AND status = 'open' AND deleted_at IS NULL) as active_deals,
        (SELECT COALESCE(SUM(value), 0) FROM deals WHERE organization_id = $1 AND status = 'open' AND deleted_at IS NULL) as pipeline_value,
        (SELECT COALESCE(SUM(weighted_value), 0) FROM deals WHERE organization_id = $1 AND status = 'open' AND deleted_at IS NULL) as weighted_pipeline_value,
        (SELECT COUNT(*) FROM deals WHERE organization_id = $1 AND status = 'won' AND deleted_at IS NULL) as won_deals,
        (SELECT COALESCE(SUM(value), 0) FROM deals WHERE organization_id = $1 AND status = 'won' AND deleted_at IS NULL) as won_revenue;
    `, [orgId]);

    // 2. Clients Stats
    const clientsRes = await db.query(`
      SELECT 
        COUNT(*) as total_clients,
        COUNT(*) FILTER (WHERE status = 'Active') as active_clients,
        COUNT(*) FILTER (WHERE status = 'Notice Period') as notice_period_clients,
        COUNT(*) FILTER (WHERE status = 'Churned') as churned_clients,
        COUNT(*) FILTER (WHERE status = 'Onboarding') as onboarding_clients,
        COUNT(*) FILTER (WHERE health_status = 'At Risk' OR health_status = 'Attention Needed') as clients_at_risk,
        COUNT(*) FILTER (WHERE renewal_date <= CURRENT_DATE + INTERVAL '30 days' AND status = 'Active') as upcoming_renewals,
        COALESCE(SUM(contract_value) FILTER (WHERE status NOT IN ('Churned', 'Completed')), 0) as total_annual_contract_value
      FROM clients 
      WHERE organization_id = $1 AND deleted_at IS NULL;
    `, [orgId]);

    // 3. Projects & Tasks Stats
    const projectsRes = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM projects WHERE organization_id = $1 AND status = 'Active' AND deleted_at IS NULL) as active_projects,
        (SELECT COUNT(*) FROM tasks WHERE organization_id = $1 AND status != 'Completed' AND deleted_at IS NULL) as pending_tasks,
        (SELECT COUNT(*) FROM tasks WHERE organization_id = $1 AND status != 'Completed' AND due_date < NOW() AND deleted_at IS NULL) as overdue_tasks;
    `, [orgId]);

    // 4. Finance Stats
    const financeRes = await db.query(`
      SELECT 
        COALESCE(SUM(total), 0) as total_invoiced,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(balance_amount), 0) as outstanding_receivables,
        COALESCE(SUM(balance_amount) FILTER (WHERE due_date < CURRENT_DATE AND status != 'Paid'), 0) as overdue_amount,
        COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'Paid') as overdue_invoices_count
      FROM invoices 
      WHERE organization_id = $1 AND deleted_at IS NULL;
    `, [orgId]);

    // 5. Marketing Stats
    const marketingRes = await db.query(`
      SELECT 
        COALESCE(SUM(cm.spend), 0) as total_ad_spend,
        COALESCE(SUM(cm.leads), 0) as leads_generated,
        COALESCE(SUM(cm.conversions), 0) as total_conversions,
        COALESCE(SUM(cm.revenue), 0) as attributed_revenue,
        ROUND(AVG(cm.roas), 2) as average_roas
      FROM campaign_metrics cm
      JOIN campaigns c ON cm.campaign_id = c.id
      WHERE c.organization_id = $1;
    `, [orgId]);

    // 6. Action Center Items (Requires Immediate Attention)
    const overdueTasks = await db.query(`
      SELECT t.id, t.title, t.due_date, t.priority, p.name as project_name, c.id as client_id, comp.name as client_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      WHERE t.organization_id = $1 AND t.status != 'Completed' AND t.due_date < NOW() AND t.deleted_at IS NULL
      ORDER BY t.due_date ASC
      LIMIT 5;
    `, [orgId]);

    const overdueInvoices = await db.query(`
      SELECT inv.id, inv.invoice_number, inv.due_date, inv.balance_amount, comp.name as client_name
      FROM invoices inv
      JOIN clients c ON inv.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      WHERE inv.organization_id = $1 AND inv.status != 'Paid' AND inv.due_date < CURRENT_DATE AND inv.deleted_at IS NULL
      ORDER BY inv.due_date ASC
      LIMIT 5;
    `, [orgId]);

    const urgentFollowups = await db.query(`
      SELECT l.id, l.first_name, l.last_name, l.company_name, l.next_followup_at, l.status, l.priority
      FROM leads l
      WHERE l.organization_id = $1 AND l.next_followup_at <= NOW() + INTERVAL '1 day' AND l.status NOT IN ('Won', 'Lost') AND l.deleted_at IS NULL
      ORDER BY l.next_followup_at ASC
      LIMIT 5;
    `, [orgId]);

    const renewalAlerts = await db.query(`
      SELECT c.id, comp.name as client_name, c.renewal_date, c.contract_value, c.health_status
      FROM clients c
      JOIN companies comp ON c.company_id = comp.id
      WHERE c.organization_id = $1 AND c.renewal_date <= CURRENT_DATE + INTERVAL '45 days' AND c.status = 'Active' AND c.deleted_at IS NULL
      ORDER BY c.renewal_date ASC
      LIMIT 5;
    `, [orgId]);

    res.json({
      success: true,
      data: {
        sales: salesRes.rows[0],
        clients: clientsRes.rows[0],
        projects: projectsRes.rows[0],
        finance: financeRes.rows[0],
        marketing: marketingRes.rows[0],
        actionCenter: {
          overdueTasks: overdueTasks.rows,
          overdueInvoices: overdueInvoices.rows,
          urgentFollowups: urgentFollowups.rows,
          renewalAlerts: renewalAlerts.rows
        }
      }
    });
  } catch (err: any) {
    console.error('[Dashboard Stats Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch executive dashboard metrics' });
  }
});

export default router;
