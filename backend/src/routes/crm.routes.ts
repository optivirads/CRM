import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// ============================================================================
// 1. LEADS
// ============================================================================

// List Leads with filtering and search
router.get('/leads', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { status, priority, search, ownerId } = req.query;

  try {
    let query = `
      SELECT 
        l.*,
        ls.name as source_name,
        u.first_name as owner_first_name, u.last_name as owner_last_name
      FROM leads l
      LEFT JOIN lead_sources ls ON l.source_id = ls.id
      LEFT JOIN users u ON l.owner_id = u.id
      WHERE l.organization_id = $1 AND l.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (status) {
      params.push(status);
      query += ` AND l.status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      query += ` AND l.priority = $${params.length}`;
    }
    if (ownerId) {
      params.push(ownerId);
      query += ` AND l.owner_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (l.first_name ILIKE $${params.length} OR l.last_name ILIKE $${params.length} OR l.company_name ILIKE $${params.length} OR l.email ILIKE $${params.length})`;
    }

    query += ` ORDER BY l.created_at DESC;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Lead
router.post('/leads', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const {
    first_name, last_name, company_name, email, phone,
    source_id, campaign, service_interest, lead_value,
    priority, next_followup_at, notes, tags
  } = req.body;

  if (!first_name) {
    res.status(400).json({ success: false, message: 'First name is required' });
    return;
  }

  try {
    const result = await db.query(`
      INSERT INTO leads (
        organization_id, first_name, last_name, company_name, email, phone,
        source_id, campaign, service_interest, lead_value, owner_id,
        priority, next_followup_at, notes, tags, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *;
    `, [
      orgId, first_name, last_name || '', company_name || '', email || null, phone || null,
      source_id || null, campaign || null, service_interest || null, lead_value || 0, userId,
      priority || 'Medium', next_followup_at || null, notes || null, tags || [], userId
    ]);

    await recordAuditLog(orgId, userId, 'CREATE', 'leads', result.rows[0].id, null, result.rows[0], req);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Lead Status / Info
router.patch('/leads/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const leadId = req.params.id;
  const { status, priority, next_followup_at, notes, lead_value } = req.body;

  try {
    const current = await db.query('SELECT * FROM leads WHERE id = $1 AND organization_id = $2;', [leadId, orgId]);
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const updated = await db.query(`
      UPDATE leads
      SET 
        status = COALESCE($1, status),
        priority = COALESCE($2, priority),
        next_followup_at = COALESCE($3, next_followup_at),
        notes = COALESCE($4, notes),
        lead_value = COALESCE($5, lead_value),
        updated_by = $6,
        last_contacted_at = CASE WHEN $1 IS NOT NULL THEN NOW() ELSE last_contacted_at END
      WHERE id = $7 AND organization_id = $8
      RETURNING *;
    `, [status, priority, next_followup_at, notes, lead_value, userId, leadId, orgId]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'leads', leadId, current.rows[0], updated.rows[0], req);

    // If status changed to Opportunity or Contacted, log activity
    if (status && status !== current.rows[0].status) {
      await db.query(`
        INSERT INTO activities (organization_id, lead_id, type, subject, description, performer_id)
        VALUES ($1, $2, 'Status Change', $3, $4, $5);
      `, [orgId, leadId, `Lead Status changed to ${status}`, `Moved from ${current.rows[0].status} to ${status}`, userId]);
    }

    res.json({ success: true, data: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Convert Lead (creates Company, Contact, and Deal)
router.post('/leads/:id/convert', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const leadId = req.params.id;
  const { dealName, pipelineId, stageId, dealValue } = req.body;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const leadRes = await client.query('SELECT * FROM leads WHERE id = $1 AND organization_id = $2;', [leadId, orgId]);
    if (leadRes.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }
    const lead = leadRes.rows[0];

    // 1. Create or Find Company
    const compName = lead.company_name || `${lead.first_name}'s Business`;
    const compRes = await client.query(`
      INSERT INTO companies (organization_id, name, email, phone, owner_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `, [orgId, compName, lead.email, lead.phone, userId, userId]);
    const companyId = compRes.rows[0].id;

    // 2. Create Contact
    const contactRes = await client.query(`
      INSERT INTO contacts (organization_id, company_id, first_name, last_name, email, phone, is_decision_maker, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, true, $7)
      RETURNING id;
    `, [orgId, companyId, lead.first_name, lead.last_name || '', lead.email, lead.phone, userId]);
    const contactId = contactRes.rows[0].id;

    // 3. Create Deal
    const pipeRes = await client.query('SELECT id FROM pipelines WHERE organization_id = $1 LIMIT 1;', [orgId]);
    const selectedPipe = pipelineId || pipeRes.rows[0]?.id;
    const stageRes = await client.query('SELECT id FROM pipeline_stages WHERE pipeline_id = $1 ORDER BY order_index ASC LIMIT 1;', [selectedPipe]);
    const selectedStage = stageId || stageRes.rows[0]?.id;

    const dealRes = await client.query(`
      INSERT INTO deals (organization_id, name, company_id, contact_id, pipeline_id, stage_id, owner_id, value, probability, status, source_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 25, 'open', $9, $10)
      RETURNING id;
    `, [
      orgId, dealName || `${compName} - Opportunity`, companyId, contactId, selectedPipe, selectedStage,
      userId, dealValue || lead.lead_value || 0, lead.source_id, userId
    ]);
    const dealId = dealRes.rows[0].id;

    // 4. Mark Lead as Won / Converted
    await client.query(`
      UPDATE leads
      SET 
        status = 'Won',
        converted_at = NOW(),
        converted_company_id = $1,
        converted_contact_id = $2,
        converted_deal_id = $3
      WHERE id = $4;
    `, [companyId, contactId, dealId, leadId]);

    await client.query('COMMIT');
    res.json({
      success: true,
      data: {
        companyId,
        contactId,
        dealId,
        message: 'Lead successfully converted into Company, Contact, and Opportunity'
      }
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// ============================================================================
// 2. COMPANIES & CONTACTS
// ============================================================================

router.get('/companies', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { search } = req.query;

  try {
    let query = `
      SELECT c.*, u.first_name as owner_first, u.last_name as owner_last,
        (SELECT COUNT(*) FROM contacts WHERE company_id = c.id AND deleted_at IS NULL) as contact_count,
        (SELECT COUNT(*) FROM deals WHERE company_id = c.id AND deleted_at IS NULL) as deal_count
      FROM companies c
      LEFT JOIN users u ON c.owner_id = u.id
      WHERE c.organization_id = $1 AND c.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.name ILIKE $${params.length} OR c.industry ILIKE $${params.length} OR c.city ILIKE $${params.length})`;
    }
    query += ` ORDER BY c.name ASC;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/contacts', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { companyId, search } = req.query;

  try {
    let query = `
      SELECT ct.*, c.name as company_name
      FROM contacts ct
      LEFT JOIN companies c ON ct.company_id = c.id
      WHERE ct.organization_id = $1 AND ct.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (companyId) {
      params.push(companyId);
      query += ` AND ct.company_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (ct.first_name ILIKE $${params.length} OR ct.last_name ILIKE $${params.length} OR ct.email ILIKE $${params.length})`;
    }
    query += ` ORDER BY ct.first_name ASC;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/lead-sources', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  try {
    const result = await db.query(`SELECT * FROM lead_sources WHERE organization_id = $1 ORDER BY name ASC;`, [orgId]);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
