import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// 1. Invoices List
router.get('/invoices', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { status, clientId } = req.query;

  try {
    let query = `
      SELECT 
        inv.*,
        c.id as client_id, comp.name as client_name
      FROM invoices inv
      JOIN clients c ON inv.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      WHERE inv.organization_id = $1 AND inv.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (status) {
      params.push(status);
      query += ` AND inv.status = $${params.length}`;
    }
    if (clientId) {
      params.push(clientId);
      query += ` AND inv.client_id = $${params.length}`;
    }

    query += ` ORDER BY inv.due_date ASC;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Payments List
router.get('/payments', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const result = await db.query(`
      SELECT 
        p.*,
        inv.invoice_number,
        comp.name as client_name
      FROM payments p
      JOIN invoices inv ON p.invoice_id = inv.id
      JOIN clients c ON p.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      WHERE p.organization_id = $1
      ORDER BY p.payment_date DESC;
    `, [orgId]);

    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Record Payment
router.post('/payments', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { invoice_id, amount, payment_date, payment_method, reference_number, notes } = req.body;

  if (!invoice_id || !amount || Number(amount) <= 0) {
    res.status(400).json({ success: false, message: 'Valid invoice_id and amount are required' });
    return;
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const invRes = await client.query('SELECT * FROM invoices WHERE id = $1 AND organization_id = $2;', [invoice_id, orgId]);
    if (invRes.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }
    const inv = invRes.rows[0];

    // Record Payment
    const paymentRes = await client.query(`
      INSERT INTO payments (
        organization_id, invoice_id, client_id, amount, payment_date,
        payment_method, reference_number, notes, status, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'successful', $9)
      RETURNING *;
    `, [
      orgId, invoice_id, inv.client_id, amount, payment_date || new Date(),
      payment_method || 'Bank Transfer', reference_number || null, notes || null, userId
    ]);

    // Recalculate Invoice Paid Amount and Status
    const newPaidAmount = Number(inv.paid_amount) + Number(amount);
    let newStatus = inv.status;
    if (newPaidAmount >= Number(inv.total)) {
      newStatus = 'Paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'Partially Paid';
    }

    await client.query(`
      UPDATE invoices
      SET 
        paid_amount = $1,
        status = $2,
        updated_by = $3
      WHERE id = $4;
    `, [newPaidAmount, newStatus, userId, invoice_id]);

    await client.query('COMMIT');
    await recordAuditLog(orgId, userId, 'PAYMENT_RECORDED', 'invoices', invoice_id, null, paymentRes.rows[0], req);

    res.status(201).json({ success: true, data: paymentRes.rows[0] });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// 4. Expenses List
router.get('/expenses', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const result = await db.query(`
      SELECT 
        e.*,
        comp.name as client_name,
        p.name as project_name
      FROM expenses e
      LEFT JOIN clients c ON e.client_id = c.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.organization_id = $1 AND e.deleted_at IS NULL
      ORDER BY e.date DESC;
    `, [orgId]);

    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
