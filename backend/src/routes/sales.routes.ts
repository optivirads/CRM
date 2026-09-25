import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { EmailService } from '../services/email.service';
import { otpRateLimiter } from '../middleware/rateLimiter';
import { generateProposalPDF, generateAgreementPDF, generateInvoicePDF, generateQuotationPDF } from './pdf.routes';
import { isGlobalLeadership } from '../utils/accessControl';

const router = Router();

// Helper to hash document share tokens (same SHA-256 pattern as creative proofing)
function hashDocToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

// Document OTP Session Helpers
function signDocumentSession(tokenHash: string, email: string, name?: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable must be configured.');
  }
  return jwt.sign(
    {
      scope: 'document_review',
      tokenHash,
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0],
    },
    secret,
    { expiresIn: '7d' }
  );
}

function verifyDocumentSession(sessionToken: string | undefined, tokenHash: string): { email: string; name: string } | null {
  if (!sessionToken) return null;
  try {
    const cleanToken = sessionToken.startsWith('Bearer ') ? sessionToken.slice(7) : sessionToken;
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const decoded = jwt.verify(cleanToken, secret) as any;
    if (decoded.scope === 'document_review' && decoded.tokenHash === tokenHash) {
      return { email: decoded.email, name: decoded.name };
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to query the team managing a client and proposal
async function getClientManagingTeam(proposalId: string, orgId: string) {
  const recipients: Array<{ email: string; name: string; role: string }> = [];
  const seenEmails = new Set<string>();

  // Always include owner
  const ownerEmail = 'optivirads@gmail.com';
  recipients.push({ email: ownerEmail, name: 'OptiVir Ads Owner', role: 'OWNER' });
  seenEmails.add(ownerEmail.toLowerCase());

  try {
    const propRes = await db.query(
      `SELECT p.*, comp.name as company_name
       FROM proposals p
       LEFT JOIN companies comp ON p.company_id = comp.id
       WHERE p.id = $1 AND p.organization_id = $2`,
      [proposalId, orgId]
    );

    if (propRes.rows.length === 0) return recipients;
    const proposal = propRes.rows[0];
    const clientName = proposal.content?.clientName || proposal.company_name || '';

    // Query clients associated with this company or clientName
    const clientRes = await db.query(
      `SELECT cl.*,
              u_am.email as am_email, u_am.first_name as am_first, u_am.last_name as am_last,
              u_cb.email as cb_email, u_cb.first_name as cb_first, u_cb.last_name as cb_last
       FROM clients cl
       LEFT JOIN companies comp ON cl.company_id = comp.id
       LEFT JOIN users u_am ON cl.account_manager_id = u_am.id
       LEFT JOIN users u_cb ON cl.created_by = u_cb.id
       WHERE cl.organization_id = $1
         AND (
           (cl.company_id IS NOT NULL AND cl.company_id = $2)
           OR (comp.name ILIKE $3 AND $3 <> '')
         )`,
      [orgId, proposal.company_id || null, clientName]
    );

    for (const cl of clientRes.rows) {
      if (cl.am_email && !seenEmails.has(cl.am_email.toLowerCase())) {
        recipients.push({
          email: cl.am_email,
          name: `${cl.am_first || ''} ${cl.am_last || ''}`.trim() || 'Account Manager',
          role: 'ACCOUNT_MANAGER'
        });
        seenEmails.add(cl.am_email.toLowerCase());
      }

      if (cl.cb_email && !seenEmails.has(cl.cb_email.toLowerCase())) {
        recipients.push({
          email: cl.cb_email,
          name: `${cl.cb_first || ''} ${cl.cb_last || ''}`.trim() || 'Client Lead',
          role: 'CLIENT_LEAD'
        });
        seenEmails.add(cl.cb_email.toLowerCase());
      }

      if (Array.isArray(cl.assigned_team_ids) && cl.assigned_team_ids.length > 0) {
        const teamUsersRes = await db.query(
          `SELECT id, email, first_name, last_name, role FROM users WHERE id = ANY($1) AND is_active = true`,
          [cl.assigned_team_ids]
        );
        for (const tu of teamUsersRes.rows) {
          if (tu.email && !seenEmails.has(tu.email.toLowerCase())) {
            recipients.push({
              email: tu.email,
              name: `${tu.first_name || ''} ${tu.last_name || ''}`.trim() || tu.role || 'Team Member',
              role: 'TEAM'
            });
            seenEmails.add(tu.email.toLowerCase());
          }
        }
      }
    }

    // Proposal creator
    if (proposal.created_by) {
      const creatorRes = await db.query(
        `SELECT email, first_name, last_name FROM users WHERE id = $1`,
        [proposal.created_by]
      );
      if (creatorRes.rows.length > 0) {
        const c = creatorRes.rows[0];
        if (c.email && !seenEmails.has(c.email.toLowerCase())) {
          recipients.push({
            email: c.email,
            name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Proposal Creator',
            role: 'CREATOR'
          });
          seenEmails.add(c.email.toLowerCase());
        }
      }
    }
  } catch (err) {
    console.error('[getClientManagingTeam Error]:', err);
  }

  return recipients;
}

// Helper to notify the team on proposal acceptance (email + in-app activities & notifications)
async function notifyTeamOfProposalAcceptance(
  proposal: any,
  approverName: string,
  approverEmail: string,
  feedbackNotes?: string
) {
  try {
    const orgId = proposal.organization_id;
    const clientName = proposal.content?.clientName || proposal.company_name || 'Client';
    const brandName = proposal.content?.brandName || '';
    const totalAmount = proposal.total_amount || proposal.content?.subtotal || 20000;
    const propNumber = proposal.proposal_number || 'PROP-2026';
    const propTitle = proposal.title || 'Proposal & SOW';

    // 1. In-App Activity: Insert into activities table (renders in Header notification bell and Activity Timeline)
    const actSubject = `🎉 Proposal Accepted: ${propNumber} — ${propTitle}`;
    const actDesc = `${clientName} accepted proposal ${propNumber} (${propTitle}) for ₹${Number(totalAmount).toLocaleString('en-IN')}. Approved by ${approverName} (${approverEmail}). ${feedbackNotes ? `Note: "${feedbackNotes}". ` : ''}Document is locked in Accepted state.`;

    await db.query(
      `INSERT INTO activities (
        organization_id, type, subject, description,
        company_id, deal_id, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        orgId,
        'PROPOSAL_ACCEPTED',
        actSubject,
        actDesc,
        proposal.company_id || null,
        proposal.deal_id || null
      ]
    );

    // 2. Query team managing this client
    const managingTeam = await getClientManagingTeam(proposal.id, orgId);

    // 3. In-App Notifications table for all organization users
    const notifTitle = `📄 Proposal Accepted: ${clientName} (${propNumber})`;
    const notifMsg = `${approverName} (${approverEmail}) has accepted the proposal for ${clientName} (₹${Number(totalAmount).toLocaleString('en-IN')}). ${feedbackNotes ? `Feedback: "${feedbackNotes}"` : ''}`;
    const notifLink = `/?tab=proposals&id=${proposal.id}`;

    const orgUsers = await db.query(
      `SELECT u.id, u.email 
       FROM users u
       JOIN organization_users ou ON u.id = ou.user_id
       WHERE ou.organization_id = $1`,
      [orgId]
    );

    for (const u of orgUsers.rows) {
      await db.query(
        `INSERT INTO notifications (organization_id, user_id, title, message, link, type, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, false)`,
        [orgId, u.id, notifTitle, notifMsg, notifLink, 'PROPOSAL_ACCEPTED']
      );
    }

    // 4. Send Email via Gmail SMTP to the client managing team (including optivirads@gmail.com)
    await EmailService.sendProposalAcceptedNotification({
      proposal: {
        id: proposal.id,
        number: propNumber,
        title: propTitle,
        clientName: clientName,
        brandName: brandName,
        amount: totalAmount,
        managementFee: totalAmount,
        advanceAmount: proposal.content?.advanceAmount
      },
      decision: 'ACCEPTED',
      approverName,
      approverEmail,
      feedbackNotes,
      recipients: managingTeam,
      agencyName: 'OptiVir Ads'
    });

    console.info(`[Proposal Acceptance] Successfully notified ${managingTeam.length} managing team members via email and in-app notifications.`);
  } catch (err) {
    console.error('[notifyTeamOfProposalAcceptance Error]:', err);
  }
}

// Pipelines & Stages
router.get('/pipelines', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const pipelinesRes = await db.query(`SELECT * FROM pipelines WHERE organization_id = $1 AND is_active = true ORDER BY created_at ASC;`, [orgId]);
    const pipelines = pipelinesRes.rows;

    for (const p of pipelines) {
      const stagesRes = await db.query(`
        SELECT * FROM pipeline_stages 
        WHERE pipeline_id = $1 
        ORDER BY order_index ASC;
      `, [p.id]);
      p.stages = stagesRes.rows;
    }

    res.json({ success: true, data: pipelines });
  } catch (err: any) {
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// Deals (Opportunities) Kanban / List
router.get('/deals', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { pipelineId, status } = req.query;

  try {
    let query = `
      SELECT 
        d.*,
        c.name as company_name,
        ct.first_name as contact_first, ct.last_name as contact_last, ct.email as contact_email,
        ps.name as stage_name, ps.order_index as stage_order, ps.color as stage_color,
        u.first_name as owner_first, u.last_name as owner_last
      FROM deals d
      LEFT JOIN companies c ON d.company_id = c.id
      LEFT JOIN contacts ct ON d.contact_id = ct.id
      JOIN pipeline_stages ps ON d.stage_id = ps.id
      LEFT JOIN users u ON d.owner_id = u.id
      WHERE d.organization_id = $1 AND d.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (pipelineId) {
      params.push(pipelineId);
      query += ` AND d.pipeline_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND d.status = $${params.length}`;
    }

    query += ` ORDER BY ps.order_index ASC, d.created_at DESC;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// Update Deal Stage (Kanban Drag & Drop)
router.patch('/deals/:id/stage', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const dealId = req.params.id;
  const { stageId } = req.body;

  if (!stageId) {
    res.status(400).json({ success: false, message: 'stageId is required' });
    return;
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const stageRes = await client.query('SELECT * FROM pipeline_stages WHERE id = $1;', [stageId]);
    if (stageRes.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ success: false, message: 'Pipeline stage not found' });
      return;
    }
    const stage = stageRes.rows[0];

    const isGlobal = isGlobalLeadership(req.user?.role, req.user?.isOwner);
    const dealRes = isGlobal
      ? await client.query('SELECT * FROM deals WHERE id = $1 AND organization_id = $2;', [dealId, orgId])
      : await client.query('SELECT * FROM deals WHERE id = $1 AND organization_id = $2 AND (owner_id = $3 OR created_by = $3);', [dealId, orgId, userId]);
    if (dealRes.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ success: false, message: 'Deal not found' });
      return;
    }
    const deal = dealRes.rows[0];

    let newStatus = deal.status;
    let actualCloseDate = deal.actual_close_date;
    if (stage.is_won) {
      newStatus = 'won';
      actualCloseDate = new Date();
    } else if (stage.is_lost) {
      newStatus = 'lost';
      actualCloseDate = new Date();
    } else {
      newStatus = 'open';
    }

    const updated = await client.query(`
      UPDATE deals
      SET 
        stage_id = $1,
        probability = $2,
        status = $3,
        actual_close_date = $4,
        updated_by = $5
      WHERE id = $6
      RETURNING *;
    `, [stageId, stage.probability, newStatus, actualCloseDate, userId, dealId]);

    // Section 18: Client Onboarding - When deal becomes WON, automatically create Client & Onboarding checklist!
    if (stage.is_won && deal.status !== 'won' && deal.company_id) {
      // Check if client already exists
      const existingClient = await client.query('SELECT id FROM clients WHERE company_id = $1 AND organization_id = $2;', [deal.company_id, orgId]);
      if (existingClient.rows.length === 0) {
        const clientRes = await client.query(`
          INSERT INTO clients (
            organization_id, company_id, primary_contact_id, account_manager_id,
            contract_value, start_date, renewal_date, status, health_status, health_score, onboarding_progress, created_by
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'Onboarding', 'Healthy', 90, 15, $6)
          RETURNING id;
        `, [orgId, deal.company_id, deal.contact_id, userId, deal.value, userId]);

        const newClientId = clientRes.rows[0].id;

        // Populate default onboarding checklist
        const defaultTasks = [
          'Master Service Agreement & Signed Contract',
          'Billing Information & Invoicing Setup',
          'Brand Assets, Guidelines & Vault',
          'Ad Accounts & Analytics Access Requirements',
          'Competitor Benchmark & Marketing Objectives Finalized',
          'Project Workspace & Team Setup'
        ];

        for (let i = 0; i < defaultTasks.length; i++) {
          await client.query(`
            INSERT INTO client_onboarding_checklists (client_id, title, sort_order, is_completed)
            VALUES ($1, $2, $3, $4);
          `, [newClientId, defaultTasks[i], i + 1, i === 0]);
        }
      }
    }

    await client.query('COMMIT');
    await recordAuditLog(orgId, userId, 'STAGE_CHANGE', 'deals', dealId, deal, updated.rows[0], req);

    res.json({ success: true, data: updated.rows[0] });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  } finally {
    client.release();
  }
});

// Services list
router.get('/services', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  try {
    const result = await db.query('SELECT * FROM services WHERE organization_id = $1 AND is_active = true ORDER BY name ASC;', [orgId]);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// Create Deal
router.post('/deals', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { name, companyName, value, stageId, pipelineId, expectedCloseDate, probability } = req.body;

  if (!name || value === undefined || value === null) {
    res.status(400).json({ success: false, message: 'Deal name and value are required' });
    return;
  }

  try {
    let companyId = null;
    if (companyName) {
      const compRes = await db.query('SELECT id FROM companies WHERE organization_id = $1 AND name = $2 LIMIT 1;', [orgId, companyName.trim()]);
      if (compRes.rows.length > 0) {
        companyId = compRes.rows[0].id;
      } else {
        const newComp = await db.query('INSERT INTO companies (organization_id, name) VALUES ($1, $2) RETURNING id;', [orgId, companyName.trim()]);
        companyId = newComp.rows[0].id;
      }
    }

    let pId = pipelineId;
    if (!pId) {
      const pipeRes = await db.query('SELECT id FROM pipelines WHERE organization_id = $1 ORDER BY created_at ASC LIMIT 1;', [orgId]);
      pId = pipeRes.rows[0]?.id;
    }

    let sId = stageId;
    if (!sId && pId) {
      const stageRes = await db.query('SELECT id FROM pipeline_stages WHERE pipeline_id = $1 ORDER BY order_index ASC LIMIT 1;', [pId]);
      sId = stageRes.rows[0]?.id;
    }

    const newDeal = await db.query(`
      INSERT INTO deals (organization_id, name, company_id, pipeline_id, stage_id, owner_id, value, probability, status, expected_close_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open', $9, $6)
      RETURNING *;
    `, [orgId, name, companyId, pId, sId, userId, Number(value), Number(probability) || 50, expectedCloseDate || null]);

    // Return with company name
    const created = {
      ...newDeal.rows[0],
      company_name: companyName || 'Enterprise Prospect'
    };

    await recordAuditLog(orgId, userId, 'CREATE', 'deals', newDeal.rows[0].id, null, created, req);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// Update Deal details / status
router.patch('/deals/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const dealId = req.params.id;
  const { status, probability, value, name, expectedCloseDate } = req.body;

  try {
    const isGlobal = isGlobalLeadership(req.user?.role, req.user?.isOwner);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dealId);
    let existing;
    if (isUuid) {
      existing = isGlobal
        ? await db.query('SELECT * FROM deals WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;', [dealId, orgId])
        : await db.query('SELECT * FROM deals WHERE id = $1 AND organization_id = $2 AND (owner_id = $3 OR created_by = $3) AND deleted_at IS NULL;', [dealId, orgId, userId]);
    } else {
      existing = isGlobal
        ? await db.query('SELECT * FROM deals WHERE (name ILIKE $1 OR id::text = $1) AND organization_id = $2 AND deleted_at IS NULL LIMIT 1;', [`%${dealId}%`, orgId])
        : await db.query('SELECT * FROM deals WHERE (name ILIKE $1 OR id::text = $1) AND organization_id = $2 AND (owner_id = $3 OR created_by = $3) AND deleted_at IS NULL LIMIT 1;', [`%${dealId}%`, orgId, userId]);
    }

    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Deal not found' });
      return;
    }

    const actualId = existing.rows[0].id;
    const updated = await db.query(`
      UPDATE deals
      SET
        status = COALESCE($1, status),
        probability = COALESCE($2, probability),
        value = COALESCE($3, value),
        name = COALESCE($4, name),
        expected_close_date = COALESCE($5, expected_close_date),
        updated_by = $6,
        updated_at = NOW()
      WHERE id = $7 AND organization_id = $8
      RETURNING *;
    `, [status, probability, value, name, expectedCloseDate, userId, actualId, orgId]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'deals', actualId, existing.rows[0], updated.rows[0], req);
    res.json({ success: true, data: updated.rows[0] });
  } catch (err: any) {
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// Delete Deal (Soft Delete from Database)
router.delete('/deals/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const dealId = req.params.id;

  try {
    const isGlobal = isGlobalLeadership(req.user?.role, req.user?.isOwner);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dealId);
    let result;
    if (isUuid) {
      result = isGlobal
        ? await db.query(`
            UPDATE deals
            SET deleted_at = NOW(), updated_by = $1
            WHERE id = $2 AND organization_id = $3 AND deleted_at IS NULL
            RETURNING id, name;
          `, [userId, dealId, orgId])
        : await db.query(`
            UPDATE deals
            SET deleted_at = NOW(), updated_by = $1
            WHERE id = $2 AND organization_id = $3 AND (owner_id = $1 OR created_by = $1) AND deleted_at IS NULL
            RETURNING id, name;
          `, [userId, dealId, orgId]);
    } else {
      result = isGlobal
        ? await db.query(`
            UPDATE deals
            SET deleted_at = NOW(), updated_by = $1
            WHERE (name ILIKE $2 OR id::text = $2) AND organization_id = $3 AND deleted_at IS NULL
            RETURNING id, name;
          `, [userId, `%${dealId}%`, orgId])
        : await db.query(`
            UPDATE deals
            SET deleted_at = NOW(), updated_by = $1
            WHERE (name ILIKE $2 OR id::text = $2) AND organization_id = $3 AND (owner_id = $1 OR created_by = $1) AND deleted_at IS NULL
            RETURNING id, name;
          `, [userId, `%${dealId}%`, orgId]);
    }

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Deal not found or already deleted' });
      return;
    }

    const deletedRecord = result.rows[0];
    await recordAuditLog(orgId, userId, 'DELETE', 'deals', deletedRecord.id, deletedRecord, null, req);
    res.json({ success: true, message: `Deal "${deletedRecord.name}" successfully deleted from database`, id: deletedRecord.id });
  } catch (err: any) {
    console.error('Delete deal error:', err);
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// PROPOSALS ENDPOINTS
// ============================================================================

// List Proposals
router.get('/proposals', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  try {
    const result = await db.query(`
      SELECT 
        p.*,
        c.name as company_name,
        d.name as deal_name,
        u.first_name as owner_first, u.last_name as owner_last
      FROM proposals p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN deals d ON p.deal_id = d.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.organization_id = $1 AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC;
    `, [orgId]);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// Create Proposal
router.post('/proposals', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { title, proposal_number, client_name, company_id, deal_id, total_amount, status, valid_until, content } = req.body;

  try {
    let resolvedCompanyId = company_id;
    if (!resolvedCompanyId && client_name) {
      const compRes = await db.query('SELECT id FROM companies WHERE organization_id = $1 AND name ILIKE $2 LIMIT 1;', [orgId, client_name.trim()]);
      resolvedCompanyId = compRes.rows[0]?.id;
      if (!resolvedCompanyId) {
        const newComp = await db.query('INSERT INTO companies (organization_id, name, created_by) VALUES ($1, $2, $3) RETURNING id;', [orgId, client_name.trim(), userId]);
        resolvedCompanyId = newComp.rows[0]?.id;
      }
    }

    const pNumber = proposal_number || `PROP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const result = await db.query(`
      INSERT INTO proposals (
        organization_id, proposal_number, title, company_id, deal_id,
        total_amount, status, valid_until, content, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `, [
      orgId, pNumber, title || 'Commercial Proposal', resolvedCompanyId || null, deal_id || null,
      total_amount || 0, status || 'Draft', valid_until || null, content ? JSON.stringify(content) : '{}', userId
    ]);

    await recordAuditLog(orgId, userId, 'CREATE', 'proposals', result.rows[0].id, null, result.rows[0], req);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// Update Proposal
router.patch('/proposals/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const userEmail = (req.user?.email || '').trim().toLowerCase();
  const isOwner = userEmail === 'optivirads@gmail.com' || req.user?.isOwner === true;
  const { id } = req.params;
  const { status, title, total_amount, valid_until, content } = req.body;

  try {
    const isGlobal = isGlobalLeadership(req.user?.role, req.user?.isOwner);
    const existing = isGlobal
      ? await db.query('SELECT * FROM proposals WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;', [id, orgId])
      : await db.query('SELECT * FROM proposals WHERE id = $1 AND organization_id = $2 AND created_by = $3 AND deleted_at IS NULL;', [id, orgId, userId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Proposal not found' });
      return;
    }

    const currentProposal = existing.rows[0];

    // Enforce lock: If already Accepted, ONLY owner optivirads@gmail.com can edit or change status
    if (currentProposal.status === 'Accepted' && !isOwner) {
      res.status(403).json({
        success: false,
        message: 'This proposal has been accepted and is locked. Only the owner (optivirads@gmail.com) can modify an accepted proposal or alter its status.'
      });
      return;
    }

    const isTransitioningToAccepted = status === 'Accepted' && currentProposal.status !== 'Accepted';

    const result = await db.query(`
      UPDATE proposals
      SET
        status = COALESCE($1, status),
        title = COALESCE($2, title),
        total_amount = COALESCE($3, total_amount),
        valid_until = COALESCE($4, valid_until),
        content = COALESCE($5, content),
        accepted_at = CASE WHEN $1 = 'Accepted' AND accepted_at IS NULL THEN NOW() ELSE accepted_at END,
        updated_at = NOW(),
        updated_by = $6
      WHERE id = $7 AND organization_id = $8 AND deleted_at IS NULL
      RETURNING *;
    `, [status, title, total_amount, valid_until, content ? JSON.stringify(content) : null, userId, id, orgId]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'proposals', id, currentProposal, result.rows[0], req);

    // If marked Accepted internally, trigger in-app activities, notifications, and email to client managing team
    if (isTransitioningToAccepted && result.rows.length > 0) {
      await notifyTeamOfProposalAcceptance(
        result.rows[0],
        req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Internal Action',
        userEmail || 'optivirads@gmail.com',
        'Marked as Accepted within CRM workspace.'
      );
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// Delete Proposal (Soft Delete - Locked if Accepted unless owner)
router.delete('/proposals/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const userEmail = (req.user?.email || '').trim().toLowerCase();
  const isOwner = userEmail === 'optivirads@gmail.com' || req.user?.isOwner === true;
  const { id } = req.params;

  try {
    const isGlobal = isGlobalLeadership(req.user?.role, req.user?.isOwner);
    const existing = isGlobal
      ? await db.query('SELECT * FROM proposals WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;', [id, orgId])
      : await db.query('SELECT * FROM proposals WHERE id = $1 AND organization_id = $2 AND created_by = $3 AND deleted_at IS NULL;', [id, orgId, userId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Proposal not found or already deleted' });
      return;
    }

    // Locked if already Accepted unless owner
    if (existing.rows[0].status === 'Accepted' && !isOwner) {
      res.status(403).json({
        success: false,
        message: 'This proposal has been accepted and is locked. Only the owner (optivirads@gmail.com) can delete an accepted proposal.'
      });
      return;
    }

    const result = await db.query(`
      UPDATE proposals
      SET deleted_at = NOW(), updated_by = $1
      WHERE id = $2 AND organization_id = $3 AND deleted_at IS NULL
      RETURNING id, title;
    `, [userId, id, orgId]);

    await recordAuditLog(orgId, userId, 'DELETE', 'proposals', id, result.rows[0], null, req);
    res.json({ success: true, message: 'Proposal deleted successfully', id });
  } catch (err: any) {
    console.error('[Route Error in sales.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// DOCUMENT SHARE LINKS, OTP, & CLIENT APPROVAL (Public Endpoints)
// ============================================================================

// Generate Secure Share Link / Send Proposal to Client (Authenticated)
router.post('/proposals/:id/share', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { id } = req.params;
  const {
    recipientEmail,
    recipientName,
    documentType = 'proposal',
    expiresInDays = 14,
    requireOtp = true,
    sendEmail = false,
    personalMessage = ''
  } = req.body;

  if (sendEmail && (!recipientEmail || !recipientEmail.includes('@'))) {
    res.status(400).json({ success: false, message: 'A valid client email address is required to dispatch via email.' });
    return;
  }

  try {
    // Verify proposal exists and belongs to user / organization
    const isGlobal = isGlobalLeadership(req.user?.role, req.user?.isOwner);
    const proposalRes = isGlobal
      ? await db.query(
          'SELECT * FROM proposals WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;',
          [id, orgId]
        )
      : await db.query(
          'SELECT * FROM proposals WHERE id = $1 AND organization_id = $2 AND created_by = $3 AND deleted_at IS NULL;',
          [id, orgId, userId]
        );
    if (proposalRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Proposal not found' });
      return;
    }

    const proposal = proposalRes.rows[0];

    // Generate secure 32-byte hex token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashDocToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const insertRes = await db.query(
      `INSERT INTO document_share_links (
        organization_id, document_type, document_id, token_hash,
        recipient_email, recipient_name, require_otp,
        created_by, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, expires_at, recipient_email, recipient_name, require_otp, created_at`,
      [
        orgId,
        documentType,
        id,
        tokenHash,
        recipientEmail ? recipientEmail.trim().toLowerCase() : null,
        recipientName ? recipientName.trim() : null,
        requireOtp,
        userId,
        expiresAt
      ]
    );

    // Update proposal status to Sent
    await db.query(
      `UPDATE proposals SET status = 'Sent', sent_at = COALESCE(sent_at, NOW()), updated_at = NOW(), updated_by = $1 WHERE id = $2`,
      [userId, id]
    );

    await recordAuditLog(orgId, userId, 'CREATE', 'document_share_links', insertRes.rows[0].id, null, insertRes.rows[0], req);

    const defaultFrontend = process.env.NODE_ENV === 'production' ? 'https://optivircrm.vercel.app' : 'http://localhost:3000';
    const frontendBase = (process.env.FRONTEND_URL || defaultFrontend).replace(/\/$/, '');
    const shareUrl = `${frontendBase}/portal/document/${rawToken}`;
    let emailSent = false;
    let emailError: string | null = null;

    if (sendEmail && recipientEmail) {
      try {
        emailSent = await EmailService.sendDocumentInviteEmail({
          toEmail: recipientEmail.trim(),
          recipientName: recipientName ? recipientName.trim() : (proposal.contact_person || proposal.client_name),
          shareUrl,
          documentTitle: proposal.title || 'Commercial SOW',
          documentType,
          documentNumber: proposal.proposal_number,
          totalAmount: proposal.total_amount,
          agencyName: 'OptiVir',
          personalMessage: personalMessage ? String(personalMessage).trim() : undefined,
        });
      } catch (e: any) {
        console.error('[Sales API] Failed to send document invite email:', e);
        emailError = 'Failed to send invite email. Please share the link directly.';
      }
    }

    res.status(201).json({
      success: true,
      emailSent,
      emailError,
      shareLink: {
        ...insertRes.rows[0],
        token: rawToken,
        shareUrl
      }
    });
  } catch (err: any) {
    console.error('[Sales API] Share Link Error:', err);
    res.status(500).json({ success: false, message: 'Failed to process proposal delivery'});
  }
});

// PUBLIC: Request OTP for Document Review Portal
router.post('/documents/public/:token/request-otp', otpRateLimiter, async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  let { email, name } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    return;
  }

  try {
    const tokenHash = hashDocToken(token);
    const linkRes = await db.query(
      `SELECT sl.*, o.name as organization_name
       FROM document_share_links sl
       JOIN organizations o ON sl.organization_id = o.id
       WHERE sl.token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at || (linkRes.rows[0].expires_at && new Date(linkRes.rows[0].expires_at) < new Date())) {
      res.status(403).json({ success: false, message: 'This document review link is invalid or has expired.' });
      return;
    }

    const shareLink = linkRes.rows[0];
    const clientEmail = email.trim().toLowerCase();

    // Verify client authorization against registered client contacts
    let documentTitle = 'Document';
    if (shareLink.document_type === 'proposal') {
      const propRes = await db.query(
        `SELECT p.id, p.company_id, p.content, p.title, p.proposal_number, c.name as company_name
         FROM proposals p
         LEFT JOIN companies c ON p.company_id = c.id
         WHERE p.id = $1`,
        [shareLink.document_id]
      );

      if (propRes.rows.length > 0) {
        const prop = propRes.rows[0];
        const content = typeof prop.content === 'object' && prop.content !== null ? prop.content : {};
        documentTitle = prop.title || prop.proposal_number || 'Proposal';
        const clientName = prop.company_name || content.clientName || '';
        const contactEmail = content.contactEmail || '';

        let isAuthorized = false;

        // Check 1: Match recipient email bound on share link
        if (shareLink.recipient_email && shareLink.recipient_email.trim().toLowerCase() === clientEmail) {
          isAuthorized = true;
        }

        // Check 2: Match proposal contact email
        if (contactEmail && contactEmail.trim().toLowerCase() === clientEmail) {
          isAuthorized = true;
        }

        // Check 3: Check database contacts for this client's company
        let contactsQuery = `
          SELECT email, first_name, last_name
          FROM contacts
          WHERE deleted_at IS NULL AND email IS NOT NULL AND email != ''
        `;
        const params: any[] = [];
        if (prop.company_id) {
          params.push(prop.company_id);
          contactsQuery += ` AND (company_id = $1`;
          if (clientName) {
            params.push(clientName.trim().toLowerCase());
            contactsQuery += ` OR company_id IN (SELECT id FROM companies WHERE LOWER(TRIM(name)) = $2)`;
          }
          contactsQuery += `)`;
        } else if (clientName) {
          params.push(clientName.trim().toLowerCase());
          contactsQuery += ` AND company_id IN (SELECT id FROM companies WHERE LOWER(TRIM(name)) = $1)`;
        }

        if (!isAuthorized && params.length > 0) {
          const contactsRes = await db.query(contactsQuery, params);
          if (contactsRes.rows.length > 0) {
            const allowedEmails = contactsRes.rows.map((r: any) => r.email.toLowerCase().trim());
            if (allowedEmails.includes(clientEmail)) {
              isAuthorized = true;
              if (!name) {
                const match = contactsRes.rows.find((r: any) => r.email.toLowerCase().trim() === clientEmail);
                if (match) name = `${match.first_name || ''} ${match.last_name || ''}`.trim();
              }
            } else {
              // Domain matching for corporate domains
              const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
              const inputDomain = clientEmail.split('@')[1];
              if (inputDomain && !freeDomains.includes(inputDomain)) {
                const companyDomains = allowedEmails
                  .map((e: string) => e.split('@')[1])
                  .filter((d: string) => d && !freeDomains.includes(d));
                if (companyDomains.includes(inputDomain)) {
                  isAuthorized = true;
                }
              }
            }

            if (!isAuthorized) {
              res.status(403).json({
                success: false,
                message: `Access restricted: "${email}" is not registered as an authorized contact for ${clientName || 'this client'}. Please select from the client contact list or contact your account manager.`
              });
              return;
            }
          }
        }
      }
    }

    // Generate cryptographically secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();

    // Store in database with 10-minute expiry
    await db.query(
      `INSERT INTO document_otps (share_link_id, email, otp_code, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
      [shareLink.id, clientEmail, otpCode]
    );

    // Send OTP email
    const sent = await EmailService.sendDocumentOtpEmail({
      toEmail: clientEmail,
      otpCode,
      documentTitle,
      documentType: shareLink.document_type,
      agencyName: shareLink.organization_name,
    });

    if (!sent) {
      res.status(500).json({
        success: false,
        message: `Failed to dispatch verification email to ${clientEmail}. Please check that your email is valid or try again.`
      });
      return;
    }

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${clientEmail}.`,
      emailSent: true,
    });
  } catch (err: any) {
    console.error('[Request Document OTP Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to send verification code'});
  }
});

// PUBLIC: Verify OTP & Issue Document Session Token
router.post('/documents/public/:token/verify-otp', otpRateLimiter, async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { email, otp, name } = req.body;

  if (!email || !otp) {
    res.status(400).json({ success: false, message: 'Email and 6-digit verification code are required.' });
    return;
  }

  try {
    const tokenHash = hashDocToken(token);
    const linkRes = await db.query(
      `SELECT * FROM document_share_links WHERE token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at || (linkRes.rows[0].expires_at && new Date(linkRes.rows[0].expires_at) < new Date())) {
      res.status(403).json({ success: false, message: 'This review link is invalid or has expired.' });
      return;
    }

    const shareLink = linkRes.rows[0];
    const clientEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Fetch active OTP record
    const activeOtpRes = await db.query(
      `SELECT * FROM document_otps
       WHERE share_link_id = $1 AND LOWER(email) = $2 AND verified_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [shareLink.id, clientEmail]
    );

    if (activeOtpRes.rows.length === 0) {
      res.status(400).json({ success: false, message: 'No active verification code found or code has expired. Please request a new code.' });
      return;
    }

    const otpRecord = activeOtpRes.rows[0];

    // Check maximum attempts limit (Lockout after 5 failed tries)
    if ((otpRecord.attempts || 0) >= 5) {
      await db.query(`UPDATE document_otps SET expires_at = NOW() WHERE id = $1`, [otpRecord.id]);
      res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. This verification code has been invalidated for security. Please request a new code.'
      });
      return;
    }

    // Verify OTP code match
    if (otpRecord.otp_code !== cleanOtp) {
      const updatedAttempts = (otpRecord.attempts || 0) + 1;
      await db.query(
        `UPDATE document_otps SET attempts = $1 WHERE id = $2`,
        [updatedAttempts, otpRecord.id]
      );
      const remaining = Math.max(0, 5 - updatedAttempts);
      if (remaining === 0) {
        await db.query(`UPDATE document_otps SET expires_at = NOW() WHERE id = $1`, [otpRecord.id]);
      }
      res.status(400).json({
        success: false,
        message: remaining > 0
          ? `Invalid verification code. ${remaining} attempt(s) remaining.`
          : 'Too many incorrect attempts. This code has been invalidated. Please request a new code.'
      });
      return;
    }

    // Mark verified
    await db.query(
      `UPDATE document_otps SET verified_at = NOW() WHERE id = $1`,
      [otpRecord.id]
    );

    const clientName = name?.trim() || shareLink.recipient_name || clientEmail.split('@')[0];
    const sessionToken = signDocumentSession(tokenHash, clientEmail, clientName);

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      sessionToken,
      client: {
        email: clientEmail,
        name: clientName,
      },
    });
  } catch (err: any) {
    console.error('[Verify Document OTP Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to verify code'});
  }
});

// PUBLIC: Load Document for Client View (OTP Protected)
router.get('/documents/public/:token', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    const tokenHash = hashDocToken(token);

    // 1. Validate Share Link
    const linkRes = await db.query(
      `SELECT
        sl.*,
        o.name as organization_name,
        o.logo_url as organization_logo
      FROM document_share_links sl
      JOIN organizations o ON sl.organization_id = o.id
      WHERE sl.token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Invalid or expired document link' });
      return;
    }

    const shareLink = linkRes.rows[0];

    if (shareLink.revoked_at) {
      res.status(403).json({ success: false, message: 'This document review link has been revoked.' });
      return;
    }

    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      res.status(403).json({ success: false, message: 'This document review link has expired.' });
      return;
    }

    // 2. Check OTP Requirement Gate
    const requireOtp = shareLink.require_otp !== false;
    const sessionToken = req.headers['x-client-session'] as string | undefined;
    const clientSession = verifyDocumentSession(sessionToken, tokenHash);

    if (requireOtp && !clientSession) {
      let clientName = '';
      const authorizedContacts: Array<{
        id: string;
        name: string;
        email: string;
        designation?: string;
        isDecisionMaker?: boolean;
      }> = [];

      if (shareLink.document_type === 'proposal') {
        const propRes = await db.query(
          `SELECT p.id, p.company_id, p.content, c.name as company_name
           FROM proposals p
           LEFT JOIN companies c ON p.company_id = c.id
           WHERE p.id = $1`,
          [shareLink.document_id]
        );
        if (propRes.rows.length > 0) {
          const prop = propRes.rows[0];
          const content = typeof prop.content === 'object' && prop.content !== null ? prop.content : {};
          clientName = prop.company_name || content.clientName || '';
          const contactEmail = content.contactEmail || '';
          const contactPerson = content.contactPerson || '';

          // Fetch contacts for this company
          let contactsQuery = `
            SELECT id, first_name, last_name, email, designation, role, is_decision_maker
            FROM contacts
            WHERE deleted_at IS NULL AND email IS NOT NULL AND email != ''
          `;
          const params: any[] = [];
          if (prop.company_id) {
            params.push(prop.company_id);
            contactsQuery += ` AND (company_id = $1`;
            if (clientName) {
              params.push(clientName.trim().toLowerCase());
              contactsQuery += ` OR company_id IN (SELECT id FROM companies WHERE LOWER(TRIM(name)) = $2)`;
            }
            contactsQuery += `)`;
          } else if (clientName) {
            params.push(clientName.trim().toLowerCase());
            contactsQuery += ` AND company_id IN (SELECT id FROM companies WHERE LOWER(TRIM(name)) = $1)`;
          } else {
            contactsQuery += ` AND 1=0`;
          }
          contactsQuery += ` ORDER BY is_decision_maker DESC, first_name ASC`;

          const contactsRes = await db.query(contactsQuery, params);
          for (const c of contactsRes.rows) {
            authorizedContacts.push({
              id: c.id,
              name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
              email: c.email.toLowerCase().trim(),
              designation: c.designation || c.role || 'Client Contact',
              isDecisionMaker: !!c.is_decision_maker,
            });
          }

          // If proposal has contact_email and it's not in authorizedContacts, add it
          if (contactEmail && !authorizedContacts.some(c => c.email.toLowerCase() === contactEmail.toLowerCase())) {
            authorizedContacts.push({
              id: 'prop-primary',
              name: contactPerson || 'Client Primary',
              email: contactEmail.toLowerCase().trim(),
              designation: 'Primary Contact',
              isDecisionMaker: true,
            });
          }
        }
      }

      // If shareLink has a recipient_email and it's not yet in the list, add it
      if (shareLink.recipient_email && !authorizedContacts.some(c => c.email.toLowerCase() === shareLink.recipient_email.toLowerCase())) {
        authorizedContacts.unshift({
          id: 'share-recipient',
          name: shareLink.recipient_name || 'Invited Contact',
          email: shareLink.recipient_email.toLowerCase().trim(),
          designation: 'Invited Recipient',
          isDecisionMaker: true,
        });
      }

      // Return minimal preview info for OTP login screen
      res.json({
        success: true,
        requireOtp: true,
        clientName,
        authorizedContacts,
        shareLink: {
          organizationName: shareLink.organization_name,
          organizationLogo: shareLink.organization_logo,
          recipientEmail: shareLink.recipient_email,
          recipientName: shareLink.recipient_name,
          documentType: shareLink.document_type,
        },
      });
      return;
    }

    // 3. Track access
    await db.query(
      `UPDATE document_share_links SET access_count = access_count + 1, last_accessed_at = NOW() WHERE id = $1`,
      [shareLink.id]
    );

    // 4. Fetch Document Data
    let document: any = null;
    if (shareLink.document_type === 'proposal') {
      const docRes = await db.query(
        `SELECT p.*, c.name as company_name
         FROM proposals p
         LEFT JOIN companies c ON p.company_id = c.id
         WHERE p.id = $1`,
        [shareLink.document_id]
      );
      if (docRes.rows.length > 0) {
        document = docRes.rows[0];
        // Update viewed_at on first view
        if (!document.viewed_at) {
          await db.query('UPDATE proposals SET viewed_at = NOW(), status = CASE WHEN status = \'Sent\' THEN \'Viewed\' ELSE status END WHERE id = $1', [shareLink.document_id]);
          document.viewed_at = new Date().toISOString();
        }
      }
    }

    // 5. Fetch existing approvals for this document
    const approvalsRes = await db.query(
      `SELECT * FROM document_approvals
       WHERE document_type = $1 AND document_id = $2
       ORDER BY created_at DESC`,
      [shareLink.document_type, shareLink.document_id]
    );

    res.json({
      success: true,
      requireOtp: false,
      clientSession: clientSession || undefined,
      shareLink: {
        organizationName: shareLink.organization_name,
        organizationLogo: shareLink.organization_logo,
        documentType: shareLink.document_type,
        recipientEmail: shareLink.recipient_email,
        recipientName: shareLink.recipient_name,
      },
      document,
      approvals: approvalsRes.rows,
    });
  } catch (err: any) {
    console.error('[Load Document Portal Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to load document'});
  }
});

// PUBLIC: Generate and serve Document PDF for client (OTP session required)
router.get('/documents/public/:token/pdf', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    const tokenHash = hashDocToken(token);
    const sessionToken = req.headers['x-client-session'] as string | undefined;
    const clientSession = verifyDocumentSession(sessionToken, tokenHash);

    if (!clientSession) {
      res.status(401).json({ success: false, message: 'Authentication required. Please verify with OTP.' });
      return;
    }

    const linkRes = await db.query(
      `SELECT sl.*, o.name as organization_name
       FROM document_share_links sl
       JOIN organizations o ON sl.organization_id = o.id
       WHERE sl.token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at) {
      res.status(403).json({ success: false, message: 'Invalid or revoked link.' });
      return;
    }

    const shareLink = linkRes.rows[0];
    let pdfBuffer: Buffer;
    let filename = 'document.pdf';

    if (shareLink.document_type === 'proposal') {
      const docRes = await db.query('SELECT p.*, c.name as company_name FROM proposals p LEFT JOIN companies c ON p.company_id = c.id WHERE p.id = $1', [shareLink.document_id]);
      if (docRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Document not found.' });
        return;
      }
      const doc = docRes.rows[0];
      const content = typeof doc.content === 'object' && doc.content !== null ? doc.content : {};
      pdfBuffer = await generateProposalPDF({
        number: doc.proposal_number,
        title: doc.title,
        client: doc.company_name || content.clientName || 'Client Organization',
        brand: content.brandName || content.brand || '',
        contact_person: content.contactPerson || content.contact_person || '',
        agency_subtitle: content.agencySubtitle || content.tagline || '',
        target_market: content.targetRegion || content.target_market || '',
        month1_target: content.month1Goal || content.month1_target || '',
        month3_target: content.month3Goal || content.month3_target || '',
        executive_summary: content.executiveSummary || content.salutationIntro || '',
        plan_intro: content.planIntro || '',
        plan_bullets: content.planBullets,
        scope_intro: content.scopeIntro || '',
        included_scope: content.includedScope,
        excluded_scope: content.excludedScope,
        management_fee: `Rs. ${Number(doc.total_amount || content.subtotal || 20000).toLocaleString('en-IN')}`,
        meta_ad_spend: content.metaAdSpendText || content.meta_ad_spend || 'Rs. 12,000 to start, up to Rs. 15,000',
        investment_note: content.investmentNote || undefined,
        total_investment: doc.total_amount ? `Rs. ${(Number(doc.total_amount) + 12000).toLocaleString('en-IN')} - ${(Number(doc.total_amount) + 15000).toLocaleString('en-IN')}` : undefined,
        advance_amount: content.advanceAmount || (doc.total_amount ? `Rs. ${Math.round(Number(doc.total_amount) * 0.4).toLocaleString('en-IN')}` : undefined),
        milestone2_amount: content.milestone2Amount || (doc.total_amount ? `Rs. ${Math.round(Number(doc.total_amount) * 0.3).toLocaleString('en-IN')}` : undefined),
        milestone3_amount: content.milestone3Amount || (doc.total_amount ? `Rs. ${Math.round(Number(doc.total_amount) * 0.3).toLocaleString('en-IN')}` : undefined),
        engagement_terms: content.engagementTerms,
        timeline_bullets: content.timelineBullets,
        next_step_text: content.nextStepText,
        amount: doc.total_amount,
        status: doc.status,
        valid_until: doc.valid_until,
      });
      filename = `Proposal-${doc.proposal_number}.pdf`;
    } else if (shareLink.document_type === 'agreement') {
      const docRes = await db.query('SELECT p.*, c.name as company_name FROM proposals p LEFT JOIN companies c ON p.company_id = c.id WHERE p.id = $1', [shareLink.document_id]);
      if (docRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Document not found.' });
        return;
      }
      const doc = docRes.rows[0];
      const content = typeof doc.content === 'object' && doc.content !== null ? doc.content : {};
      pdfBuffer = await generateAgreementPDF({
        number: doc.proposal_number,
        title: doc.title,
        client: doc.company_name || content.clientName || 'Client Organization',
        brand: content.brandName || '',
        contact_person: content.contactPerson || '',
        management_fee: content.subtotal ? `Rs. ${Number(content.subtotal).toLocaleString('en-IN')}` : undefined,
        meta_ad_spend: content.metaAdSpendText || 'Rs. 12,000 to Rs. 14,000',
        total_investment: doc.total_amount ? `Rs. ${Number(doc.total_amount).toLocaleString('en-IN')}` : undefined,
      });
      filename = `Agreement-${doc.proposal_number}.pdf`;
    } else {
      res.status(400).json({ success: false, message: 'Unsupported document type for PDF.' });
      return;
    }

    const safeFilename = filename.replace(/[\r\n"\\/]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(pdfBuffer);
  } catch (err: any) {
    console.error('[Document PDF Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to generate PDF'});
  }
});

// PUBLIC: Submit Client Document Approval / Request Changes (OTP session required)
router.post('/documents/public/:token/approve', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { decision, approverName, approverEmail, feedbackNotes } = req.body;

  if (!decision || !['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'].includes(decision)) {
    res.status(400).json({ success: false, message: 'Decision must be APPROVED, CHANGES_REQUESTED, or REJECTED.' });
    return;
  }

  if (!approverName || !approverEmail) {
    res.status(400).json({ success: false, message: 'Approver name and email are required.' });
    return;
  }

  try {
    const tokenHash = hashDocToken(token);
    const sessionToken = req.headers['x-client-session'] as string | undefined;
    const clientSession = verifyDocumentSession(sessionToken, tokenHash);

    if (!clientSession) {
      res.status(401).json({ success: false, message: 'OTP authentication required. Please verify your identity first.' });
      return;
    }

    const linkRes = await db.query(
      `SELECT sl.*, o.name as organization_name
       FROM document_share_links sl
       JOIN organizations o ON sl.organization_id = o.id
       WHERE sl.token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at) {
      res.status(403).json({ success: false, message: 'This review link is invalid or has been revoked.' });
      return;
    }

    const shareLink = linkRes.rows[0];
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Insert approval record
    const approvalRes = await db.query(
      `INSERT INTO document_approvals (
        organization_id, document_type, document_id, share_link_id,
        decision, approver_name, approver_email, feedback_notes,
        ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        shareLink.organization_id,
        shareLink.document_type,
        shareLink.document_id,
        shareLink.id,
        decision,
        approverName.trim(),
        approverEmail.trim().toLowerCase(),
        feedbackNotes || null,
        ipAddress,
        userAgent
      ]
    );

    // Update proposal status based on decision
    if (shareLink.document_type === 'proposal') {
      if (decision === 'APPROVED') {
        const propUpdateRes = await db.query(
          `UPDATE proposals SET
            status = 'Accepted',
            accepted_at = NOW(),
            client_approved_at = NOW(),
            client_approved_by_email = $1,
            client_approval_decision = $2,
            updated_at = NOW()
          WHERE id = $3
          RETURNING *`,
          [approverEmail.trim().toLowerCase(), decision, shareLink.document_id]
        );

        if (propUpdateRes.rows.length > 0) {
          await notifyTeamOfProposalAcceptance(
            propUpdateRes.rows[0],
            approverName.trim(),
            approverEmail.trim().toLowerCase(),
            feedbackNotes || undefined
          );
        }
      } else if (decision === 'CHANGES_REQUESTED') {
        await db.query(
          `UPDATE proposals SET
            status = 'Negotiation',
            client_approval_decision = $1,
            client_approved_by_email = $2,
            updated_at = NOW()
          WHERE id = $3`,
          [decision, approverEmail.trim().toLowerCase(), shareLink.document_id]
        );
      } else if (decision === 'REJECTED') {
        await db.query(
          `UPDATE proposals SET
            status = 'Rejected',
            rejected_at = NOW(),
            client_approval_decision = $1,
            client_approved_by_email = $2,
            updated_at = NOW()
          WHERE id = $3`,
          [decision, approverEmail.trim().toLowerCase(), shareLink.document_id]
        );
      }
    }

    // Create in-app notification for the team
    try {
      const notifType = decision === 'APPROVED' ? 'DOCUMENT_APPROVED' : decision === 'CHANGES_REQUESTED' ? 'DOCUMENT_CHANGES_REQUESTED' : 'DOCUMENT_REJECTED';
      const notifTitle = decision === 'APPROVED'
        ? `📄 Document Approved by ${approverName}`
        : decision === 'CHANGES_REQUESTED'
          ? `📝 Changes Requested by ${approverName}`
          : `❌ Document Rejected by ${approverName}`;

      // Notify all users in the organization
      const orgUsers = await db.query(
        'SELECT id FROM users WHERE organization_id = $1 AND is_active = true',
        [shareLink.organization_id]
      );
      for (const user of orgUsers.rows) {
        await db.query(
          `INSERT INTO notifications (organization_id, user_id, title, message, type, entity_type, entity_id, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            shareLink.organization_id,
            user.id,
            notifTitle,
            `${approverName} (${approverEmail}) has ${decision === 'APPROVED' ? 'approved' : decision === 'CHANGES_REQUESTED' ? 'requested changes to' : 'rejected'} the ${shareLink.document_type}. ${feedbackNotes ? `Feedback: "${feedbackNotes}"` : ''}`,
            notifType,
            shareLink.document_type,
            shareLink.document_id,
            JSON.stringify({ decision, approverEmail, feedbackNotes })
          ]
        );
      }
    } catch (notifErr) {
      console.error('[Document Approval] Failed to create notifications:', notifErr);
    }

    const decisionLabel = decision === 'APPROVED' ? 'approved' : decision === 'CHANGES_REQUESTED' ? 'requested changes' : 'rejected';

    res.json({
      success: true,
      message: `You have successfully ${decisionLabel} this ${shareLink.document_type}. The agency team has been notified.`,
      approval: approvalRes.rows[0],
    });
  } catch (err: any) {
    console.error('[Document Approval Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to submit decision'});
  }
});

export default router;
