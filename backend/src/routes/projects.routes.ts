import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// 1. Projects List
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { status, clientId } = req.query;

  try {
    let query = `
      SELECT 
        p.*,
        c.id as client_id, comp.name as client_name,
        u.first_name as pm_first, u.last_name as pm_last,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND deleted_at IS NULL) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Completed' AND deleted_at IS NULL) as completed_tasks
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN users u ON p.project_manager_id = u.id
      WHERE p.organization_id = $1 AND p.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }
    if (clientId) {
      params.push(clientId);
      query += ` AND p.client_id = $${params.length}`;
    }

    query += ` ORDER BY p.created_at DESC;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Tasks List (For Kanban & List views)
router.get('/tasks', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { projectId, clientId, status, assigneeId, overdue } = req.query;

  try {
    let query = `
      SELECT 
        t.*,
        p.name as project_name,
        comp.name as client_name,
        u.first_name as assignee_first, u.last_name as assignee_last
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.organization_id = $1 AND t.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (projectId) {
      params.push(projectId);
      query += ` AND t.project_id = $${params.length}`;
    }
    if (clientId) {
      params.push(clientId);
      query += ` AND t.client_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }
    if (assigneeId) {
      params.push(assigneeId);
      query += ` AND t.assignee_id = $${params.length}`;
    }
    if (overdue === 'true') {
      query += ` AND t.due_date < NOW() AND t.status != 'Completed'`;
    }

    query += ` ORDER BY t.due_date ASC NULLS LAST;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Create Task
router.post('/tasks', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { title, description, project_id, client_id, assignee_id, priority, due_date } = req.body;

  if (!title) {
    res.status(400).json({ success: false, message: 'Task title is required' });
    return;
  }

  try {
    const result = await db.query(`
      INSERT INTO tasks (
        organization_id, title, description, project_id, client_id, assignee_id,
        priority, status, due_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'To Do', $8, $9)
      RETURNING *;
    `, [
      orgId, title, description || null, project_id || null, client_id || null,
      assignee_id || userId, priority || 'Medium', due_date || null, userId
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Update Task Status (Kanban drag & drop)
router.patch('/tasks/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const taskId = req.params.id;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ success: false, message: 'Status is required' });
    return;
  }

  try {
    const result = await db.query(`
      UPDATE tasks 
      SET 
        status = $1,
        completed_at = CASE WHEN $1 = 'Completed' THEN NOW() ELSE NULL END,
        updated_by = $2
      WHERE id = $3 AND organization_id = $4
      RETURNING *;
    `, [status, userId, taskId, orgId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Task (Soft Delete)
router.delete('/tasks/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const taskId = req.params.id;

  try {
    const result = await db.query(`
      UPDATE tasks
      SET deleted_at = NOW(), updated_by = $1
      WHERE id = $2 AND organization_id = $3 AND deleted_at IS NULL
      RETURNING id;
    `, [userId, taskId, orgId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Task not found or already deleted' });
      return;
    }

    await recordAuditLog(orgId, userId, 'DELETE', 'tasks', taskId, null, null, req);
    res.json({ success: true, message: 'Task successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Project (Soft Delete)
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const projectId = req.params.id;

  try {
    const result = await db.query(`
      UPDATE projects
      SET deleted_at = NOW(), updated_by = $1
      WHERE id = $2 AND organization_id = $3 AND deleted_at IS NULL
      RETURNING id;
    `, [userId, projectId, orgId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Project not found or already deleted' });
      return;
    }

    await recordAuditLog(orgId, userId, 'DELETE', 'projects', projectId, null, null, req);
    res.json({ success: true, message: 'Project successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
