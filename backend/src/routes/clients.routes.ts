import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// 1. Client List
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { status, health, search } = req.query;

  try {
    let query = `
      SELECT 
        c.*,
        comp.name as company_name, comp.industry, comp.website, comp.city,
        ct.first_name as contact_first, ct.last_name as contact_last, ct.email as contact_email, ct.phone as contact_phone,
        u.first_name as am_first, u.last_name as am_last,
        (SELECT COUNT(*) FROM projects WHERE client_id = c.id AND deleted_at IS NULL) as project_count,
        (SELECT COUNT(*) FROM tasks WHERE client_id = c.id AND status != 'Completed' AND deleted_at IS NULL) as open_tasks_count,
        (SELECT COALESCE(SUM(balance_amount), 0) FROM invoices WHERE client_id = c.id AND deleted_at IS NULL) as outstanding_balance
      FROM clients c
      JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN contacts ct ON c.primary_contact_id = ct.id
      LEFT JOIN users u ON c.account_manager_id = u.id
      WHERE c.organization_id = $1 AND c.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }
    if (health) {
      params.push(health);
      query += ` AND c.health_status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (comp.name ILIKE $${params.length} OR comp.industry ILIKE $${params.length})`;
    }

    query += ` ORDER BY c.contract_value DESC;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Client 360° Comprehensive Profile
router.get('/:id/360', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const clientId = req.params.id;

  try {
    // Basic Client + Company Info
    const clientRes = await db.query(`
      SELECT 
        c.*,
        comp.name as company_name, comp.industry, comp.website, comp.email as company_email, comp.phone as company_phone, comp.address, comp.city,
        ct.first_name as contact_first, ct.last_name as contact_last, ct.email as contact_email, ct.phone as contact_phone, ct.designation as contact_role,
        u.first_name as am_first, u.last_name as am_last, u.email as am_email
      FROM clients c
      JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN contacts ct ON c.primary_contact_id = ct.id
      LEFT JOIN users u ON c.account_manager_id = u.id
      WHERE c.id = $1 AND c.organization_id = $2 AND c.deleted_at IS NULL;
    `, [clientId, orgId]);

    if (clientRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }

    const client = clientRes.rows[0];

    // Services Subscribed
    const servicesRes = await db.query(`
      SELECT cs.*, s.name, s.category, s.pricing_model
      FROM client_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.client_id = $1 AND cs.is_active = true;
    `, [clientId]);

    // Projects
    const projectsRes = await db.query(`
      SELECT * FROM projects 
      WHERE client_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC;
    `, [clientId]);

    // Tasks
    const tasksRes = await db.query(`
      SELECT t.*, u.first_name as assignee_first, u.last_name as assignee_last
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.client_id = $1 AND t.deleted_at IS NULL
      ORDER BY t.status = 'Completed', t.due_date ASC;
    `, [clientId]);

    // Financials: Invoices & Payments
    const invoicesRes = await db.query(`
      SELECT * FROM invoices 
      WHERE client_id = $1 AND deleted_at IS NULL
      ORDER BY invoice_date DESC;
    `, [clientId]);

    const paymentsRes = await db.query(`
      SELECT * FROM payments 
      WHERE client_id = $1 
      ORDER BY payment_date DESC;
    `, [clientId]);

    // Marketing Campaigns & Aggregated Metrics
    const campaignsRes = await db.query(`
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

    // Daily Metrics Rollup (Last 30 Days)
    const metricsHistory = await db.query(`
      SELECT 
        cm.date,
        SUM(cm.spend) as spend,
        SUM(cm.leads) as leads,
        SUM(cm.conversions) as conversions,
        SUM(cm.revenue) as revenue,
        ROUND(AVG(cm.roas), 2) as roas
      FROM campaign_metrics cm
      JOIN campaigns c ON cm.campaign_id = c.id
      WHERE c.client_id = $1
      GROUP BY cm.date
      ORDER BY cm.date ASC;
    `, [clientId]);

    // Organic Performance
    const organicRes = await db.query(`
      SELECT * FROM organic_performance
      WHERE client_id = $1
      ORDER BY date ASC;
    `, [clientId]);

    // Onboarding Checklists
    const onboardingRes = await db.query(`
      SELECT * FROM client_onboarding_checklists
      WHERE client_id = $1
      ORDER BY sort_order ASC;
    `, [clientId]);

    // Timeline Activities
    const activitiesRes = await db.query(`
      SELECT a.*, u.first_name as performer_first, u.last_name as performer_last
      FROM activities a
      LEFT JOIN users u ON a.performer_id = u.id
      WHERE a.client_id = $1
      ORDER BY a.created_at DESC
      LIMIT 20;
    `, [clientId]);

    res.json({
      success: true,
      data: {
        client,
        services: servicesRes.rows,
        projects: projectsRes.rows,
        tasks: tasksRes.rows,
        finance: {
          invoices: invoicesRes.rows,
          payments: paymentsRes.rows
        },
        marketing: {
          campaigns: campaignsRes.rows,
          metricsHistory: metricsHistory.rows,
          organic: organicRes.rows
        },
        onboarding: onboardingRes.rows,
        timeline: activitiesRes.rows
      }
    });
  } catch (err: any) {
    console.error('Client 360 error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Update Client Onboarding Item
router.patch('/:id/onboarding/:checklistId', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { id: clientId, checklistId } = req.params;
  const { is_completed } = req.body;

  try {
    await db.query(`
      UPDATE client_onboarding_checklists
      SET 
        is_completed = $1,
        completed_at = CASE WHEN $1 = true THEN NOW() ELSE NULL END,
        completed_by = CASE WHEN $1 = true THEN $2 ELSE NULL END
      WHERE id = $3 AND client_id = $4;
    `, [is_completed, userId, checklistId, clientId]);

    // Recalculate Client onboarding progress %
    const countRes = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_completed = true) as completed
      FROM client_onboarding_checklists
      WHERE client_id = $1;
    `, [clientId]);

    const { total, completed } = countRes.rows[0];
    const progress = total > 0 ? Math.round((completed / total) * 100) : 100;

    await db.query(`
      UPDATE clients 
      SET 
        onboarding_progress = $1,
        status = CASE WHEN $1 = 100 AND status = 'Onboarding' THEN 'Active' ELSE status END
      WHERE id = $2 AND organization_id = $3;
    `, [progress, clientId, orgId]);

    res.json({ success: true, progress });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Client (Soft Delete)
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const clientId = req.params.id;

  try {
    const result = await db.query(`
      UPDATE clients
      SET deleted_at = NOW(), updated_by = $1
      WHERE id = $2 AND organization_id = $3 AND deleted_at IS NULL
      RETURNING id;
    `, [userId, clientId, orgId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Client not found or already deleted' });
      return;
    }

    await recordAuditLog(orgId, userId, 'DELETE', 'clients', clientId, null, null, req);
    res.json({ success: true, message: 'Client successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
