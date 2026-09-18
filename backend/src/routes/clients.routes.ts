import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { SocialMediaSyncService } from '../services/socialMediaSync.service';

const router = Router();

// 1. Client List with pagination & scoping
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const userRole = (req.user!.role || '').toLowerCase();
  // Privileged agency users include Owner, COO, Administrators, and all internal agency staff.
  // Only external single-client portal accounts are constrained to their specific client_id.
  const isPrivileged = Boolean(req.user!.isOwner) || !req.user?.clientId;

  const { status, health, search, accountManagerId, myOnly } = req.query;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = (page - 1) * limit;

  try {
    let whereClause = `WHERE c.organization_id = $1 AND c.deleted_at IS NULL`;
    const params: any[] = [orgId];

    // Scoping for client-specific portal users or when user explicitly filters "My Clients"
    if (req.user?.clientId) {
      params.push(req.user.clientId);
      whereClause += ` AND c.id = $${params.length}`;
    } else if (myOnly === 'true') {
      params.push(userId);
      whereClause += ` AND (c.account_manager_id = $${params.length} OR $${params.length} = ANY(c.assigned_team_ids) OR c.created_by = $${params.length})`;
    } else if (accountManagerId) {
      params.push(accountManagerId);
      whereClause += ` AND c.account_manager_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      whereClause += ` AND c.status = $${params.length}`;
    }
    if (health) {
      params.push(health);
      whereClause += ` AND c.health_status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (comp.name ILIKE $${params.length} OR comp.industry ILIKE $${params.length})`;
    }

    const countRes = await db.query(`
      SELECT COUNT(*) 
      FROM clients c 
      LEFT JOIN companies comp ON c.company_id = comp.id
      ${whereClause};
    `, params);
    const total = parseInt(countRes.rows[0]?.count, 10) || 0;

    const query = `
      SELECT 
        c.*,
        comp.name as company_name, comp.industry, comp.website, comp.city,
        ct.first_name as contact_first, ct.last_name as contact_last, ct.email as contact_email, ct.phone as contact_phone,
        u.first_name as am_first, u.last_name as am_last, u.email as am_email,
        (SELECT COUNT(*) FROM projects WHERE client_id = c.id AND deleted_at IS NULL) as project_count,
        (SELECT COUNT(*) FROM tasks WHERE client_id = c.id AND status != 'Completed' AND deleted_at IS NULL) as open_tasks_count,
        (SELECT COALESCE(SUM(balance_amount), 0) FROM invoices WHERE client_id = c.id AND deleted_at IS NULL) as outstanding_balance
      FROM clients c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN contacts ct ON c.primary_contact_id = ct.id
      LEFT JOIN users u ON c.account_manager_id = u.id
      ${whereClause}
      ORDER BY c.contract_value DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    const result = await db.query(query, [...params, limit, offset]);
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Client 360° Comprehensive Profile
router.get('/:id/360', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const clientId = req.params.id;

  if (req.user?.clientId && req.user.clientId !== clientId) {
    res.status(403).json({ success: false, message: 'Access denied: You only have access to your assigned client profile.' });
    return;
  }

  try {
    // Basic Client + Company Info
    const clientRes = await db.query(`
      SELECT 
        c.*,
        comp.name as company_name, comp.industry, comp.website, comp.email as company_email, comp.phone as company_phone, comp.address, comp.city,
        ct.first_name as contact_first, ct.last_name as contact_last, ct.email as contact_email, ct.phone as contact_phone, ct.designation as contact_role,
        u.first_name as am_first, u.last_name as am_last, u.email as am_email
      FROM clients c
      LEFT JOIN companies comp ON c.company_id = comp.id
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
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies comp ON cl.company_id = comp.id
      LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
      WHERE (c.client_id = $1 OR cl.company_id = (SELECT company_id FROM clients WHERE id = $1) OR comp.name ILIKE (SELECT comp2.name FROM clients cl2 JOIN companies comp2 ON cl2.company_id = comp2.id WHERE cl2.id = $1)) AND c.deleted_at IS NULL
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
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies comp ON cl.company_id = comp.id
      WHERE (c.client_id = $1 OR cl.company_id = (SELECT company_id FROM clients WHERE id = $1) OR comp.name ILIKE (SELECT comp2.name FROM clients cl2 JOIN companies comp2 ON cl2.company_id = comp2.id WHERE cl2.id = $1))
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

// Create Client
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const {
    company_id,
    company_name,
    industry,
    website,
    primary_contact_id,
    contact_name,
    contact_first,
    contact_last,
    contact_email,
    contact_phone,
    contact_role,
    account_manager_id,
    contract_value,
    billing_frequency,
    health_status,
    status,
    renewal_date,
    start_date,
    notes
  } = req.body;

  try {
    let resolvedCompanyId = company_id;
    if (!resolvedCompanyId && company_name) {
      const compRes = await db.query(`
        INSERT INTO companies (organization_id, name, industry, website, created_by)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
        RETURNING id;
      `, [orgId, company_name.trim(), industry || 'Technology', website || null, userId]);
      resolvedCompanyId = compRes.rows[0]?.id;
      if (!resolvedCompanyId) {
        const existing = await db.query('SELECT id FROM companies WHERE organization_id = $1 AND name ILIKE $2 LIMIT 1;', [orgId, company_name.trim()]);
        resolvedCompanyId = existing.rows[0]?.id;
        if (resolvedCompanyId && (industry || website)) {
          await db.query(`
            UPDATE companies
            SET industry = COALESCE($1, industry),
                website = COALESCE($2, website),
                updated_at = NOW()
            WHERE id = $3;
          `, [industry, website, resolvedCompanyId]);
        }
      }
    }

    if (!resolvedCompanyId) {
      res.status(400).json({ success: false, message: 'Company is required to create a client' });
      return;
    }

    // Handle primary contact creation if provided
    let resolvedContactId = primary_contact_id || null;
    const rawContactName = contact_name || contact_first || '';
    if (!resolvedContactId && (rawContactName || contact_email)) {
      const parts = rawContactName.trim().split(/\s+/);
      const fName = parts[0] || 'Contact';
      const lName = parts.slice(1).join(' ') || '';

      const contactRes = await db.query(`
        INSERT INTO contacts (organization_id, company_id, first_name, last_name, email, phone, designation, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id;
      `, [
        orgId,
        resolvedCompanyId,
        fName,
        lName || '',
        contact_email || null,
        contact_phone || null,
        contact_role || 'Primary Contact',
        userId
      ]);
      resolvedContactId = contactRes.rows[0]?.id;
    }

    const normBillingFreq = (() => {
      if (!billing_frequency) return 'monthly';
      const f = String(billing_frequency).toLowerCase().trim();
      if (f === 'annual' || f === 'annually' || f.includes('annual')) return 'annually';
      if (f === 'quarterly') return 'quarterly';
      if (f === 'one_off' || f === 'one_time') return 'one_off';
      if (f === 'on_demand' || f.includes('demand')) return 'on_demand';
      if (f === 'pay_as_you_go') return 'pay_as_you_go';
      return f;
    })();

    const result = await db.query(`
      INSERT INTO clients (
        organization_id, company_id, primary_contact_id, account_manager_id, contract_value,
        billing_frequency, health_status, status, start_date, renewal_date, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `, [
      orgId,
      resolvedCompanyId,
      resolvedContactId,
      account_manager_id || userId,
      contract_value || 0,
      normBillingFreq,
      health_status || 'Healthy',
      status || 'Active',
      start_date || new Date(),
      renewal_date || null,
      notes || null,
      userId
    ]);

    await recordAuditLog(orgId, userId, 'CREATE', 'clients', result.rows[0].id, null, result.rows[0], req);

    try {
      await db.query(`
        INSERT INTO activities (
          organization_id, type, subject, description, client_id, performer_id, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [
        orgId,
        'client_created',
        `New Client Created: ${company_name || 'Client Account'}`,
        `${req.user?.firstName || 'Team Member'} created client account ${company_name || ''}.`,
        result.rows[0].id,
        userId,
        'completed',
        JSON.stringify({
          created_by_email: req.user?.email,
          created_by_name: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim()
        })
      ]);
    } catch {}

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Client
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const clientId = req.params.id;
  const {
    status,
    health_status,
    health_score,
    contract_value,
    billing_frequency,
    renewal_date,
    notes,
    account_manager_id,
    assigned_team_ids
  } = req.body;

  try {
    const current = await db.query('SELECT * FROM clients WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;', [clientId, orgId]);
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }

    // If company fields are provided, update company table
    const {
      company_name,
      industry,
      website,
      city,
      contact_first,
      contact_last,
      contact_email,
      contact_phone,
      contact_role
    } = req.body;

    if (current.rows[0].company_id && (company_name || industry !== undefined || website !== undefined || city !== undefined)) {
      await db.query(`
        UPDATE companies
        SET 
          name = COALESCE($1, name),
          industry = COALESCE($2, industry),
          website = COALESCE($3, website),
          city = COALESCE($4, city),
          updated_at = NOW()
        WHERE id = $5 AND organization_id = $6;
      `, [company_name, industry, website, city, current.rows[0].company_id, orgId]);
    }

    // If contact fields are provided, update or create contact
    let cFirst = contact_first;
    let cLast = contact_last;
    if (!cFirst && req.body.contact_name) {
      const parts = req.body.contact_name.trim().split(' ');
      cFirst = parts[0];
      cLast = parts.slice(1).join(' ') || '';
    }

    if (cFirst || contact_email) {
      if (current.rows[0].primary_contact_id) {
        await db.query(`
          UPDATE contacts
          SET 
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            email = COALESCE($3, email),
            phone = COALESCE($4, phone),
            designation = COALESCE($5, designation),
            updated_at = NOW()
          WHERE id = $6;
        `, [cFirst, cLast, contact_email, contact_phone, contact_role, current.rows[0].primary_contact_id]);
      } else {
        const newContact = await db.query(`
          INSERT INTO contacts (organization_id, company_id, first_name, last_name, email, phone, designation, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id;
        `, [orgId, current.rows[0].company_id, cFirst || 'Primary', cLast || 'Contact', contact_email || null, contact_phone || null, contact_role || 'Lead Stakeholder', userId]);
        if (newContact.rows.length > 0) {
          await db.query('UPDATE clients SET primary_contact_id = $1 WHERE id = $2;', [newContact.rows[0].id, clientId]);
        }
      }
    }

    const updated = await db.query(`
      UPDATE clients
      SET 
        status = COALESCE($1, status),
        health_status = COALESCE($2, health_status),
        health_score = COALESCE($3, health_score),
        contract_value = COALESCE($4, contract_value),
        billing_frequency = COALESCE($5, billing_frequency),
        renewal_date = COALESCE($6, renewal_date),
        notes = COALESCE($7, notes),
        account_manager_id = CASE WHEN $8::text IS NOT NULL THEN $8::uuid ELSE account_manager_id END,
        assigned_team_ids = COALESCE($9, assigned_team_ids),
        updated_by = $10
      WHERE id = $11 AND organization_id = $12
      RETURNING *;
    `, [
      status,
      health_status,
      health_score,
      contract_value,
      billing_frequency,
      renewal_date,
      notes,
      account_manager_id !== undefined ? account_manager_id : null,
      assigned_team_ids,
      userId,
      clientId,
      orgId
    ]);

    // Fetch updated client with company, contact & AM info
    const fullRes = await db.query(`
      SELECT 
        c.*,
        comp.name as company_name, comp.industry, comp.website, comp.city,
        ct.first_name as contact_first, ct.last_name as contact_last, ct.email as contact_email, ct.phone as contact_phone, ct.designation as contact_role,
        u.first_name as am_first, u.last_name as am_last, u.email as am_email
      FROM clients c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN contacts ct ON c.primary_contact_id = ct.id
      LEFT JOIN users u ON c.account_manager_id = u.id
      WHERE c.id = $1;
    `, [clientId]);

    const finalClient = fullRes.rows[0] || updated.rows[0];

    await recordAuditLog(orgId, userId, 'UPDATE', 'clients', clientId, current.rows[0], finalClient, req);

    try {
      const cName = finalClient.company_name || 'Client';
      const amName = finalClient.am_first ? `${finalClient.am_first} ${finalClient.am_last || ''}`.trim() : null;
      const performerName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'Team Member';
      const desc = account_manager_id !== undefined
        ? `${performerName} updated team assignment to ${amName || 'Unassigned'} for ${cName}.`
        : `${performerName} updated client profile & contract details for ${cName}.`;

      await db.query(`
        INSERT INTO activities (
          organization_id, type, subject, description, client_id, performer_id, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [
        orgId,
        'client_updated',
        `Client Updated: ${cName}`,
        desc,
        clientId,
        userId,
        'completed',
        JSON.stringify({
          updated_by_email: req.user?.email,
          updated_by_name: performerName,
          account_manager: amName,
          changes: req.body
        })
      ]);
    } catch {}

    res.json({ success: true, data: finalClient });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// Social Media Insights & Post Snapshots Endpoints
// ============================================================================

// 5. Get Social Media Insights & Posts for a Client
router.get('/:id/social-insights', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const rawId = req.params.id;

  try {
    const client = await SocialMediaSyncService.resolveClientRecord(rawId, orgId);
    const clientId = client ? client.id : null;

    if (!clientId) {
      res.json({
        success: true,
        data: {
          posts: [],
          summary: {
            total_posts: 0,
            total_impressions: 0,
            total_reach: 0,
            total_likes: 0,
            total_comments: 0,
            total_shares: 0,
            total_saves: 0,
            total_clicks: 0,
            avg_engagement_rate: 0
          },
          platforms: []
        }
      });
      return;
    }

    const postsRes = await db.query(`
      SELECT 
        p.*,
        u.first_name as creator_first, u.last_name as creator_last
      FROM client_social_posts p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.client_id = $1 AND p.organization_id = $2
      ORDER BY p.published_at DESC;
    `, [clientId, orgId]);

    // Aggregates
    const aggRes = await db.query(`
      SELECT 
        COUNT(*) as total_posts,
        COALESCE(SUM(impressions), 0) as total_impressions,
        COALESCE(SUM(reach), 0) as total_reach,
        COALESCE(SUM(likes), 0) as total_likes,
        COALESCE(SUM(comments), 0) as total_comments,
        COALESCE(SUM(shares), 0) as total_shares,
        COALESCE(SUM(saves), 0) as total_saves,
        COALESCE(SUM(clicks), 0) as total_clicks,
        ROUND(AVG(engagement_rate), 2) as avg_engagement_rate
      FROM client_social_posts
      WHERE client_id = $1 AND organization_id = $2;
    `, [clientId, orgId]);

    // Platform breakdown
    const platformRes = await db.query(`
      SELECT 
        platform,
        COUNT(*) as post_count,
        COALESCE(SUM(reach), 0) as platform_reach,
        COALESCE(SUM(likes), 0) as platform_likes,
        ROUND(AVG(engagement_rate), 2) as platform_engagement_rate
      FROM client_social_posts
      WHERE client_id = $1 AND organization_id = $2
      GROUP BY platform
      ORDER BY post_count DESC;
    `, [clientId, orgId]);

    res.json({
      success: true,
      data: {
        posts: postsRes.rows,
        summary: aggRes.rows[0] || {
          total_posts: 0,
          total_impressions: 0,
          total_reach: 0,
          total_likes: 0,
          total_comments: 0,
          total_shares: 0,
          total_saves: 0,
          total_clicks: 0,
          avg_engagement_rate: 0
        },
        platforms: platformRes.rows
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Create / Log Social Media Post Snapshot
router.post('/:id/social-insights', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const rawId = req.params.id;
  const {
    platform = 'Instagram',
    media_type = 'Post',
    post_url,
    media_url,
    thumbnail_url,
    caption,
    published_at = new Date(),
    likes = 0,
    comments = 0,
    shares = 0,
    saves = 0,
    impressions = 0,
    reach = 0,
    clicks = 0,
    engagement_rate,
    top_insight
  } = req.body;

  try {
    const client = await SocialMediaSyncService.resolveClientRecord(rawId, orgId);
    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }
    const clientId = client.id;
    const isUserUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    // Calculate engagement rate if not explicitly supplied
    let calcEngagementRate = Number(engagement_rate);
    if (isNaN(calcEngagementRate) || calcEngagementRate <= 0) {
      const totalInteractions = Number(likes) + Number(comments) + Number(shares) + Number(saves);
      const denominator = Number(reach) > 0 ? Number(reach) : Number(impressions) > 0 ? Number(impressions) : 1000;
      calcEngagementRate = Math.min(100, Math.round((totalInteractions / denominator) * 10000) / 100);
    }

    const result = await db.query(`
      INSERT INTO client_social_posts (
        client_id, organization_id, platform, media_type, post_url, media_url, thumbnail_url,
        caption, published_at, likes, comments, shares, saves, impressions, reach, clicks,
        engagement_rate, top_insight, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *;
    `, [
      clientId, orgId, platform, media_type, post_url || null, media_url || null, thumbnail_url || null,
      caption || null, published_at, Number(likes) || 0, Number(comments) || 0, Number(shares) || 0,
      Number(saves) || 0, Number(impressions) || 0, Number(reach) || 0, Number(clicks) || 0,
      calcEngagementRate, top_insight || null, isUserUuid ? userId : null
    ]);

    await recordAuditLog(orgId, userId, 'CREATE', 'client_social_posts', result.rows[0].id, null, result.rows[0], req);

    res.status(201).json({
      success: true,
      message: 'Social media post snapshot successfully saved',
      data: result.rows[0]
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Delete Social Media Post Snapshot
router.delete('/:id/social-insights/:postId', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const rawId = req.params.id;
  const { postId } = req.params;

  try {
    const client = await SocialMediaSyncService.resolveClientRecord(rawId, orgId);
    const clientId = client ? client.id : rawId;

    const result = await db.query(`
      DELETE FROM client_social_posts
      WHERE id = $1 AND (client_id = $2 OR client_id = $3) AND organization_id = $4
      RETURNING id;
    `, [postId, clientId, rawId, orgId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Post snapshot not found' });
      return;
    }

    await recordAuditLog(orgId, userId, 'DELETE', 'client_social_posts', postId, null, null, req);
    res.json({ success: true, message: 'Post snapshot deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Get Client Social Media Account Integrations
router.get('/:id/social-integrations', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const rawId = req.params.id;

  try {
    const client = await SocialMediaSyncService.resolveClientRecord(rawId, orgId);
    const clientId = client ? client.id : null;

    if (!clientId) {
      res.json({
        success: true,
        data: {
          client_id: rawId,
          organization_id: orgId,
          auto_sync_enabled: true,
          sync_status: 'idle',
          last_synced_at: null
        }
      });
      return;
    }

    const result = await db.query(`
      SELECT * FROM client_social_integrations
      WHERE client_id = $1 AND organization_id = $2;
    `, [clientId, orgId]);

    const row = result.rows[0] || {
      client_id: clientId,
      organization_id: orgId,
      auto_sync_enabled: true,
      sync_status: 'idle',
      last_synced_at: null
    };

    let profileMetrics = {};
    if (row.facebook_access_token) {
      try {
        profileMetrics = await SocialMediaSyncService.fetchProfileMetrics(row);
      } catch {}
    }

    res.json({
      success: true,
      data: {
        ...row,
        profile_metrics: profileMetrics
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Update Client Social Media Account Integrations
router.post('/:id/social-integrations', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const rawId = req.params.id;
  const {
    instagram_username,
    instagram_account_id,
    facebook_page_id,
    facebook_access_token,
    linkedin_page_id,
    linkedin_access_token,
    youtube_channel_id,
    youtube_api_key,
    auto_sync_enabled,
    sync_interval_hours
  } = req.body;

  try {
    const client = await SocialMediaSyncService.resolveClientRecord(rawId, orgId);
    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }
    const clientId = client.id;

    const result = await db.query(`
      INSERT INTO client_social_integrations (
        client_id, organization_id, instagram_username, instagram_account_id,
        facebook_page_id, facebook_access_token, linkedin_page_id, linkedin_access_token,
        youtube_channel_id, youtube_api_key, auto_sync_enabled, sync_interval_hours
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, true), COALESCE($12, 6))
      ON CONFLICT (client_id) DO UPDATE
      SET 
        instagram_username = COALESCE($3, client_social_integrations.instagram_username),
        instagram_account_id = COALESCE($4, client_social_integrations.instagram_account_id),
        facebook_page_id = COALESCE($5, client_social_integrations.facebook_page_id),
        facebook_access_token = COALESCE($6, client_social_integrations.facebook_access_token),
        linkedin_page_id = COALESCE($7, client_social_integrations.linkedin_page_id),
        linkedin_access_token = COALESCE($8, client_social_integrations.linkedin_access_token),
        youtube_channel_id = COALESCE($9, client_social_integrations.youtube_channel_id),
        youtube_api_key = COALESCE($10, client_social_integrations.youtube_api_key),
        auto_sync_enabled = COALESCE($11, client_social_integrations.auto_sync_enabled),
        sync_interval_hours = COALESCE($12, client_social_integrations.sync_interval_hours),
        updated_at = NOW()
      RETURNING *;
    `, [
      clientId, orgId, instagram_username, instagram_account_id,
      facebook_page_id, facebook_access_token, linkedin_page_id, linkedin_access_token,
      youtube_channel_id, youtube_api_key, auto_sync_enabled, sync_interval_hours
    ]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'client_social_integrations', result.rows[0].id, null, result.rows[0], req);

    res.json({
      success: true,
      message: 'Social channel credentials & auto-sync configuration saved',
      data: result.rows[0]
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9b. Inspect Meta Access Token and return available Facebook Pages + linked Instagram Business accounts
router.post('/:id/social-integrations/meta-inspect', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { accessToken } = req.body;
  if (!accessToken) {
    res.status(400).json({ success: false, message: 'Meta Access Token is required' });
    return;
  }

  try {
    const inspected = await SocialMediaSyncService.inspectMetaAccounts(accessToken);
    res.json({
      success: true,
      data: inspected
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 9c. Connect & Save selected Meta Facebook Page & Instagram account
router.post('/:id/social-integrations/meta-connect', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const rawId = req.params.id;
  const { accessToken, pageId, pageAccessToken, pageName, instagramAccountId, instagramUsername } = req.body;

  if (!accessToken && !pageAccessToken) {
    res.status(400).json({ success: false, message: 'Meta access token is required' });
    return;
  }

  try {
    const client = await SocialMediaSyncService.resolveClientRecord(rawId, orgId);
    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found' });
      return;
    }
    const clientId = client.id;
    const tokenToSave = pageAccessToken || accessToken;

    const result = await db.query(`
      INSERT INTO client_social_integrations (
        client_id, organization_id, facebook_page_id, facebook_access_token,
        instagram_account_id, instagram_username, auto_sync_enabled, sync_status, sync_message
      ) VALUES ($1, $2, $3, $4, $5, $6, true, 'success', 'Meta Graph API connected for Instagram & Facebook Page')
      ON CONFLICT (client_id) DO UPDATE
      SET
        facebook_page_id = COALESCE($3, client_social_integrations.facebook_page_id),
        facebook_access_token = COALESCE($4, client_social_integrations.facebook_access_token),
        instagram_account_id = COALESCE($5, client_social_integrations.instagram_account_id),
        instagram_username = COALESCE($6, client_social_integrations.instagram_username),
        auto_sync_enabled = true,
        updated_at = NOW()
      RETURNING *;
    `, [clientId, orgId, pageId || null, tokenToSave, instagramAccountId || null, instagramUsername || null]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'client_social_integrations', result.rows[0].id, null, result.rows[0], req);

    res.json({
      success: true,
      message: `Meta API connected! Linked Facebook Page "${pageName || pageId || 'Page'}" ${instagramUsername ? `& Instagram @${instagramUsername}` : ''}.`,
      data: result.rows[0]
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. Trigger Instant Automated Social Media Telemetry & Insights Sync
router.post('/:id/social-insights/sync', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const rawId = req.params.id;

  try {
    const syncResult = await SocialMediaSyncService.syncClientSocialMedia(rawId, orgId, userId);
    res.json({
      success: true,
      message: syncResult.message,
      data: syncResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 11. Discover Available Posts from Connected Social Channels or Pasted URLs/Handles
router.all('/:id/social-insights/discover', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const rawId = req.params.id;
  const rawUrls = req.body?.urls || req.query?.urls;
  const rawHandle = req.body?.handle || req.query?.handle;

  let parsedUrls: string[] = [];
  if (Array.isArray(rawUrls)) {
    parsedUrls = rawUrls.filter(u => typeof u === 'string' && u.trim().startsWith('http'));
  } else if (typeof rawUrls === 'string' && rawUrls.trim()) {
    parsedUrls = rawUrls.split(/[\n,]+/).map(u => u.trim()).filter(u => u.startsWith('http'));
  }

  try {
    const discovery = await SocialMediaSyncService.discoverAvailablePosts(rawId, orgId, {
      customUrls: parsedUrls.length > 0 ? parsedUrls : undefined,
      customHandle: typeof rawHandle === 'string' && rawHandle.trim() ? rawHandle.trim() : undefined
    });
    res.json({
      success: true,
      data: discovery
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 12. Import Only Selected Posts into Client Dashboard
router.post('/:id/social-insights/import-selected', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const rawId = req.params.id;
  const { selectedPosts } = req.body;

  try {
    const importRes = await SocialMediaSyncService.importSelectedPosts(rawId, orgId, selectedPosts, userId);
    res.json({
      success: true,
      message: importRes.message,
      data: importRes
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 13. Inspect any live post URL (oEmbed & OpenGraph metadata parser)
router.post('/:id/social-insights/inspect-url', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ success: false, message: 'URL is required' });
    return;
  }

  try {
    const metadata = await SocialMediaSyncService.inspectUrl(url);
    res.json({
      success: true,
      data: metadata
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
