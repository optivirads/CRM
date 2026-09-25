import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Log Activity
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { type, subject, description, lead_id, company_id, contact_id, deal_id, client_id, project_id, duration_minutes } = req.body;

  if (!type || !subject) {
    res.status(400).json({ success: false, message: 'Activity type and subject are required' });
    return;
  }

  try {
    const result = await db.query(`
      INSERT INTO activities (
        organization_id, type, subject, description,
        lead_id, company_id, contact_id, deal_id, client_id, project_id,
        performer_id, duration_minutes, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *;
    `, [
      orgId, type, subject, description || null,
      lead_id || null, company_id || null, contact_id || null, deal_id || null, client_id || null, project_id || null,
      userId, duration_minutes || null
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error('[Activities Create Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to create activity record' });
  }
});

// List Activities
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { clientId, leadId, dealId } = req.query;

  try {
    let query = `
      SELECT a.*, u.first_name as performer_first, u.last_name as performer_last
      FROM activities a
      LEFT JOIN users u ON a.performer_id = u.id
      WHERE a.organization_id = $1
    `;
    const params: any[] = [orgId];

    if (clientId) {
      params.push(clientId);
      query += ` AND a.client_id = $${params.length}`;
    }
    if (leadId) {
      params.push(leadId);
      query += ` AND a.lead_id = $${params.length}`;
    }
    if (dealId) {
      params.push(dealId);
      query += ` AND a.deal_id = $${params.length}`;
    }

    query += ` ORDER BY a.created_at DESC LIMIT 50;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    console.error('[Activities List Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
});

export default router;
