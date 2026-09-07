import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

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
    res.status(500).json({ success: false, message: err.message });
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
    res.status(500).json({ success: false, message: err.message });
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

    const dealRes = await client.query('SELECT * FROM deals WHERE id = $1 AND organization_id = $2;', [dealId, orgId]);
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
    res.status(500).json({ success: false, message: err.message });
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
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
