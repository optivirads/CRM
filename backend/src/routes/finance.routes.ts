import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';

const router = Router();

const createInvoiceSchema = z.object({
  client_id: z.string().optional(),
  client_name: z.string().optional(),
  invoice_number: z.string().optional(),
  invoice_date: z.union([z.string(), z.date()]).optional(),
  due_date: z.union([z.string(), z.date()]).optional(),
  subtotal: z.number().optional(),
  discount: z.number().optional(),
  tax: z.number().optional(),
  total: z.number().positive('Total must be greater than 0').optional(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    description: z.string().optional(),
    quantity: z.number().optional(),
    rate: z.number().optional(),
    amount: z.number().optional()
  })).optional()
});

const recordPaymentSchema = z.object({
  invoice_id: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().positive('Payment amount must be positive'),
  payment_date: z.union([z.string(), z.date()]).optional(),
  payment_method: z.string().optional(),
  reference_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

const createExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  vendor: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  date: z.union([z.string(), z.date()]).optional(),
  client_id: z.string().optional().nullable(),
  project_id: z.string().optional().nullable()
});

// 1. Invoices List with pagination
router.get('/invoices', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { status, clientId } = req.query;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = (page - 1) * limit;

  try {
    let whereClause = `WHERE inv.organization_id = $1 AND inv.deleted_at IS NULL`;
    const params: any[] = [orgId];

    if (status) {
      params.push(status);
      whereClause += ` AND inv.status = $${params.length}`;
    }
    if (clientId) {
      params.push(clientId);
      whereClause += ` AND inv.client_id = $${params.length}`;
    }

    const countRes = await db.query(`
      SELECT COUNT(*) 
      FROM invoices inv
      JOIN clients c ON inv.client_id = c.id
      ${whereClause};
    `, params);
    const total = parseInt(countRes.rows[0]?.count, 10) || 0;

    const query = `
      SELECT 
        inv.*,
        c.id as client_id, comp.name as client_name
      FROM invoices inv
      JOIN clients c ON inv.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      ${whereClause}
      ORDER BY inv.due_date ASC
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

// 1b. Single Invoice Details (for PDF generation & preview)
router.get('/invoices/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const invoiceId = req.params.id;

  try {
    const invRes = await db.query(`
      SELECT 
        inv.*,
        c.id as client_id,
        comp.name as client_name,
        c.email as client_email,
        c.gstin as client_gstin,
        c.phone as client_phone,
        comp.billing_address as client_billing_address
      FROM invoices inv
      JOIN clients c ON inv.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      WHERE (inv.id = $1 OR inv.invoice_number = $1) AND inv.organization_id = $2 AND inv.deleted_at IS NULL
      LIMIT 1;
    `, [invoiceId, orgId]);

    if (invRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    const inv = invRes.rows[0];

    const itemsRes = await db.query(`
      SELECT id, description, quantity, rate, amount
      FROM invoice_items
      WHERE invoice_id = $1
      ORDER BY id ASC;
    `, [inv.id]);

    inv.items = itemsRes.rows;

    res.json({ success: true, data: inv });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Payments List with pagination
router.get('/payments', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = (page - 1) * limit;

  try {
    const countRes = await db.query('SELECT COUNT(*) FROM payments WHERE organization_id = $1;', [orgId]);
    const total = parseInt(countRes.rows[0]?.count, 10) || 0;

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
      ORDER BY p.payment_date DESC
      LIMIT $2 OFFSET $3;
    `, [orgId, limit, offset]);

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

// 3. Record Payment
router.post('/payments', requireAuth, validateBody(recordPaymentSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

// 4. Expenses List with pagination
router.get('/expenses', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = (page - 1) * limit;

  try {
    const countRes = await db.query('SELECT COUNT(*) FROM expenses WHERE organization_id = $1 AND deleted_at IS NULL;', [orgId]);
    const total = parseInt(countRes.rows[0]?.count, 10) || 0;

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
      ORDER BY e.date DESC
      LIMIT $2 OFFSET $3;
    `, [orgId, limit, offset]);

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

// Delete Invoice (Soft Delete)
router.delete('/invoices/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const invoiceId = req.params.id;

  try {
    const result = await db.query(`
      UPDATE invoices
      SET deleted_at = NOW(), updated_by = $1
      WHERE id = $2 AND organization_id = $3 AND deleted_at IS NULL
      RETURNING id;
    `, [userId, invoiceId, orgId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Invoice not found or already deleted' });
      return;
    }

    await recordAuditLog(orgId, userId, 'DELETE', 'invoices', invoiceId, null, null, req);
    res.json({ success: true, message: 'Invoice successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Expense (Soft Delete)
router.delete('/expenses/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const expenseId = req.params.id;

  try {
    const result = await db.query(`
      UPDATE expenses
      SET deleted_at = NOW(), updated_by = $1
      WHERE id = $2 AND organization_id = $3 AND deleted_at IS NULL
      RETURNING id;
    `, [userId, expenseId, orgId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Expense not found or already deleted' });
      return;
    }

    await recordAuditLog(orgId, userId, 'DELETE', 'expenses', expenseId, null, null, req);
    res.json({ success: true, message: 'Expense successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Invoice
router.post('/invoices', requireAuth, validateBody(createInvoiceSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { client_id, client_name, invoice_number, invoice_date, due_date, subtotal, discount, tax, total, status, notes, items } = req.body;

  try {
    let resolvedClientId = client_id;
    if (!resolvedClientId && client_name) {
      const clientRes = await db.query(`
        SELECT c.id FROM clients c
        JOIN companies comp ON c.company_id = comp.id
        WHERE c.organization_id = $1 AND comp.name ILIKE $2 AND c.deleted_at IS NULL
        LIMIT 1;
      `, [orgId, client_name.trim()]);
      resolvedClientId = clientRes.rows[0]?.id;
    }

    if (!resolvedClientId) {
      const fallbackClient = await db.query('SELECT id FROM clients WHERE organization_id = $1 AND deleted_at IS NULL LIMIT 1;', [orgId]);
      resolvedClientId = fallbackClient.rows[0]?.id;
    }

    if (!resolvedClientId) {
      res.status(400).json({ success: false, message: 'Client is required to create an invoice' });
      return;
    }

    const invNum = invoice_number || `INV-${Date.now().toString().slice(-6)}`;
    const calcSubtotal = Number(subtotal || total || 0);
    const calcTax = Number(tax || 0);
    const calcDiscount = Number(discount || 0);
    const calcTotal = Number(total || (calcSubtotal - calcDiscount + calcTax));
    const invDueDate = due_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const invRes = await client.query(`
        INSERT INTO invoices (
          organization_id, client_id, invoice_number, invoice_date, due_date,
          subtotal, discount, tax, total, paid_amount, status, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, $11, $12)
        RETURNING *;
      `, [
        orgId, resolvedClientId, invNum, invoice_date || new Date(), invDueDate,
        calcSubtotal, calcDiscount, calcTax, calcTotal, status || 'Sent', notes || null, userId
      ]);
      const createdInvoice = invRes.rows[0];

      // Insert line items if provided
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await client.query(`
            INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount)
            VALUES ($1, $2, $3, $4, $5);
          `, [
            createdInvoice.id, item.description || 'Professional Services',
            Number(item.quantity || 1), Number(item.rate || item.amount || 0),
            Number(item.amount || (item.quantity * item.rate) || 0)
          ]);
        }
      }

      await client.query('COMMIT');
      await recordAuditLog(orgId, userId, 'CREATE', 'invoices', createdInvoice.id, null, createdInvoice, req);
      res.status(201).json({ success: true, data: createdInvoice });
    } catch (e: any) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Invoice Status / Details
router.patch('/invoices/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const invoiceId = req.params.id;
  const { status, due_date, notes } = req.body;

  try {
    const current = await db.query('SELECT * FROM invoices WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;', [invoiceId, orgId]);
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    const updated = await db.query(`
      UPDATE invoices
      SET 
        status = COALESCE($1, status),
        due_date = COALESCE($2, due_date),
        notes = COALESCE($3, notes),
        updated_by = $4
      WHERE id = $5 AND organization_id = $6
      RETURNING *;
    `, [status, due_date, notes, userId, invoiceId, orgId]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'invoices', invoiceId, current.rows[0], updated.rows[0], req);
    res.json({ success: true, data: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Expense
router.post('/expenses', requireAuth, validateBody(createExpenseSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { category, amount, vendor, description, title, notes, date, client_id, project_id } = req.body;

  if (!category || !amount || Number(amount) <= 0) {
    res.status(400).json({ success: false, message: 'Valid category and positive amount are required' });
    return;
  }

  const rawCat = String(category).trim().toLowerCase();
  let normalizedCategory = 'Miscellaneous';
  if (rawCat.includes('software') || rawCat.includes('subscription')) normalizedCategory = 'Software / Subscriptions';
  else if (rawCat.includes('ad') || rawCat.includes('recharge') || rawCat.includes('media')) normalizedCategory = 'Ad Spend Recharge';
  else if (rawCat.includes('contractor') || rawCat.includes('freelance')) normalizedCategory = 'Contractors / Freelancers';
  else if (rawCat.includes('travel')) normalizedCategory = 'Travel';
  else if (rawCat.includes('office') || rawCat.includes('admin')) normalizedCategory = 'Office / Admin';
  else if (rawCat.includes('market')) normalizedCategory = 'Marketing';
  else if (rawCat.includes('equip')) normalizedCategory = 'Equipment';

  const expenseTitle = title || description || category || 'Business Expense';
  const expenseNotes = notes || description || null;

  try {
    const result = await db.query(`
      INSERT INTO expenses (
        organization_id, client_id, project_id, title, category, amount,
        vendor, notes, date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `, [
      orgId, client_id || null, project_id || null, expenseTitle, normalizedCategory, Number(amount),
      vendor || null, expenseNotes, date || new Date(), userId
    ]);

    await recordAuditLog(orgId, userId, 'CREATE', 'expenses', result.rows[0].id, null, result.rows[0], req);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
