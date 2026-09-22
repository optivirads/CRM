import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// 1. Projects List with pagination
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { status, clientId } = req.query;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = (page - 1) * limit;

  try {
    let whereClause = `WHERE p.organization_id = $1 AND p.deleted_at IS NULL`;
    const params: any[] = [orgId];

    if (status) {
      params.push(status);
      whereClause += ` AND p.status = $${params.length}`;
    }
    if (req.user?.clientId) {
      params.push(req.user.clientId);
      whereClause += ` AND p.client_id = $${params.length}`;
    } else if (clientId) {
      params.push(clientId);
      whereClause += ` AND p.client_id = $${params.length}`;
    }

    const countRes = await db.query(`
      SELECT COUNT(*) 
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      ${whereClause};
    `, params);
    const total = parseInt(countRes.rows[0]?.count, 10) || 0;

    const query = `
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
      ${whereClause}
      ORDER BY p.created_at DESC
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

// Team Members (For Task Assignment & Workload)
router.get('/team-members', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const result = await db.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        TRIM(CONCAT(u.first_name, ' ', u.last_name)) as name,
        u.email,
        u.phone,
        COALESCE(ou.designation, 'Team Member') as designation,
        COALESCE(r.name, 'Member') as role_name
      FROM organization_users ou
      JOIN users u ON ou.user_id = u.id
      LEFT JOIN roles r ON ou.role_id = r.id
      WHERE ou.organization_id = $1 AND u.deleted_at IS NULL
      ORDER BY u.first_name ASC;
    `, [orgId]);

    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add New Team Member
router.post('/team-members', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { name, first_name, last_name, designation, email, phone, role } = req.body;

  const rawName = (name || '').trim();
  let firstName = (first_name || '').trim();
  let lastName = (last_name || '').trim();

  if (!firstName && rawName) {
    const parts = rawName.split(' ');
    firstName = parts[0];
    lastName = parts.slice(1).join(' ');
  }

  if (!firstName) {
    res.status(400).json({ success: false, message: 'Team member name is required' });
    return;
  }

  const cleanRole = designation || role || 'Team Member';
  const cleanEmail = (email || '').trim().toLowerCase() || `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${Date.now()}@optivir.local`;

  try {
    // 1. Create or fetch user
    let userRes = await db.query('SELECT * FROM users WHERE email = $1;', [cleanEmail]);
    let memberId: string;

    if (userRes.rows.length === 0) {
      const insertUser = await db.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, phone, status)
        VALUES ($1, 'placeholder_hash', $2, $3, $4, 'active')
        RETURNING *;
      `, [cleanEmail, firstName, lastName, phone || null]);
      memberId = insertUser.rows[0].id;
    } else {
      memberId = userRes.rows[0].id;
    }

    // 2. Link to organization_users
    await db.query(`
      INSERT INTO organization_users (organization_id, user_id, designation, is_owner, status)
      VALUES ($1, $2, $3, false, 'active')
      ON CONFLICT (organization_id, user_id) 
      DO UPDATE SET designation = EXCLUDED.designation;
    `, [orgId, memberId, cleanRole]);

    const fullName = `${firstName} ${lastName}`.trim();
    res.status(201).json({
      success: true,
      data: {
        id: memberId,
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        designation: cleanRole,
        email: cleanEmail
      }
    });
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
        COALESCE(t.assignee_name, NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), 'Unassigned') as assignee_name,
        COALESCE(t.assignee_role, ou.designation, 'Team Member') as assignee_role,
        u.first_name as assignee_first, u.last_name as assignee_last,
        (SELECT COUNT(*) FROM creatives WHERE task_id = t.id) as linked_creatives_count
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN organization_users ou ON ou.user_id = u.id AND ou.organization_id = t.organization_id
      WHERE t.organization_id = $1 AND t.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (projectId) {
      params.push(projectId);
      query += ` AND t.project_id = $${params.length}`;
    }
    if (req.user?.clientId) {
      params.push(req.user.clientId);
      query += ` AND t.client_id = $${params.length}`;
    } else if (clientId) {
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

// 2.1 Single Project Details with Linked Tasks
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const projectId = req.params.id;

  try {
    const projectRes = await db.query(`
      SELECT 
        p.*,
        c.id as client_id, comp.name as client_name, comp.domain as client_domain,
        u.first_name as pm_first, u.last_name as pm_last, u.email as pm_email,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND deleted_at IS NULL) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Completed' AND deleted_at IS NULL) as completed_tasks
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN users u ON p.project_manager_id = u.id
      WHERE p.id = $1 AND p.organization_id = $2 AND p.deleted_at IS NULL;
    `, [projectId, orgId]);

    if (projectRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const tasksRes = await db.query(`
      SELECT 
        t.*,
        COALESCE(t.assignee_name, NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), 'Unassigned') as assignee_name,
        COALESCE(t.assignee_role, ou.designation, 'Team Member') as assignee_role,
        u.first_name as assignee_first, u.last_name as assignee_last,
        (SELECT COUNT(*) FROM creatives WHERE task_id = t.id) as linked_creatives_count
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN organization_users ou ON ou.user_id = u.id AND ou.organization_id = t.organization_id
      WHERE t.project_id = $1 AND t.organization_id = $2 AND t.deleted_at IS NULL
      ORDER BY t.due_date ASC NULLS LAST;
    `, [projectId, orgId]);

    res.json({
      success: true,
      data: {
        ...projectRes.rows[0],
        tasks: tasksRes.rows
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Create Task
router.post('/tasks', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const {
    title, description, project_id, client_id,
    assignee_id, assignee_name, assignee_role,
    priority, due_date, assigned_date, start_date
  } = req.body;

  if (!title) {
    res.status(400).json({ success: false, message: 'Task title is required' });
    return;
  }

  const effectiveAssignedDate = assigned_date || start_date || new Date().toISOString().split('T')[0];

  try {
    const result = await db.query(`
      INSERT INTO tasks (
        organization_id, title, description, project_id, client_id, assignee_id,
        assignee_name, assignee_role,
        priority, status, assigned_date, start_date, due_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'To Do', $10, $10, $11, $12)
      RETURNING *;
    `, [
      orgId, title, description || null, project_id || null, client_id || null,
      assignee_id || null, assignee_name || null, assignee_role || null,
      priority || 'Medium', effectiveAssignedDate, due_date || null, userId
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

  const rawStatus = String(status).trim().toLowerCase().replace(/_/g, ' ');
  let normalizedStatus = 'To Do';
  if (rawStatus === 'completed' || rawStatus === 'done') normalizedStatus = 'Completed';
  else if (rawStatus === 'in progress' || rawStatus === 'inprogress') normalizedStatus = 'In Progress';
  else if (rawStatus === 'review' || rawStatus === 'in review') normalizedStatus = 'Review';
  else if (rawStatus === 'blocked') normalizedStatus = 'Blocked';
  else if (rawStatus === 'cancelled' || rawStatus === 'canceled') normalizedStatus = 'Cancelled';

  try {
    const result = await db.query(`
      UPDATE tasks 
      SET 
        status = $1::varchar,
        completed_at = CASE WHEN $1::varchar = 'Completed' THEN NOW() ELSE NULL END,
        updated_by = $2
      WHERE id = $3 AND organization_id = $4
      RETURNING *;
    `, [normalizedStatus, userId, taskId, orgId]);

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

// Create Project
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { name, description, client_id, client_name, budget, priority, status, start_date, end_date } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ success: false, message: 'Project name is required' });
    return;
  }

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
      // Create a default company and client for this project if none exist yet
      const comp = await db.query(`
        INSERT INTO companies (organization_id, name, created_by)
        VALUES ($1, 'Internal Operations', $2) RETURNING id;
      `, [orgId, userId]);
      const newCl = await db.query(`
        INSERT INTO clients (organization_id, company_id, created_by)
        VALUES ($1, $2, $3) RETURNING id;
      `, [orgId, comp.rows[0].id, userId]);
      resolvedClientId = newCl.rows[0].id;
    }

    const result = await db.query(`
      INSERT INTO projects (
        organization_id, client_id, name, description, project_manager_id,
        budget, priority, status, start_date, end_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `, [
      orgId, resolvedClientId, name.trim(), description || null, userId,
      budget || 0, priority || 'Medium', status || 'Active', start_date || new Date(), end_date || null, userId
    ]);

    await recordAuditLog(orgId, userId, 'CREATE', 'projects', result.rows[0].id, null, result.rows[0], req);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Project
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const projectId = req.params.id;
  const { name, description, budget, spent, status, priority, progress, start_date, end_date } = req.body;

  try {
    const current = await db.query('SELECT * FROM projects WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;', [projectId, orgId]);
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const updated = await db.query(`
      UPDATE projects
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        budget = COALESCE($3, budget),
        spent = COALESCE($4, spent),
        status = COALESCE($5, status),
        priority = COALESCE($6, priority),
        progress = COALESCE($7, progress),
        start_date = COALESCE($8, start_date),
        end_date = COALESCE($9, end_date),
        updated_by = $10
      WHERE id = $11 AND organization_id = $12
      RETURNING *;
    `, [name, description, budget, spent, status, priority, progress, start_date, end_date, userId, projectId, orgId]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'projects', projectId, current.rows[0], updated.rows[0], req);
    res.json({ success: true, data: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// General Update Task (Title, description, priority, due date, assigned date, assignee, project, client)
router.patch('/tasks/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const taskId = req.params.id;
  const {
    title, description, priority, status, due_date,
    assigned_date, start_date, assignee_id, assignee_name, assignee_role,
    project_id, client_id
  } = req.body;

  try {
    const current = await db.query('SELECT * FROM tasks WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;', [taskId, orgId]);
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const effectiveAssignedDate = assigned_date || start_date;

    const updated = await db.query(`
      UPDATE tasks
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        priority = COALESCE($3, priority),
        status = COALESCE($4, status),
        due_date = COALESCE($5, due_date),
        assignee_id = COALESCE($6, assignee_id),
        assignee_name = COALESCE($7, assignee_name),
        assignee_role = COALESCE($8, assignee_role),
        assigned_date = COALESCE($9, assigned_date),
        start_date = COALESCE($9, start_date),
        project_id = CASE WHEN $13::boolean THEN $14::uuid ELSE project_id END,
        client_id = CASE WHEN $15::boolean THEN $16::uuid ELSE client_id END,
        completed_at = CASE WHEN $4 = 'Completed' THEN NOW() ELSE completed_at END,
        updated_by = $10
      WHERE id = $11 AND organization_id = $12
      RETURNING *;
    `, [
      title, description, priority, status, due_date,
      assignee_id, assignee_name, assignee_role, effectiveAssignedDate,
      userId, taskId, orgId,
      project_id !== undefined, project_id || null,
      client_id !== undefined, client_id || null
    ]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'tasks', taskId, current.rows[0], updated.rows[0], req);
    res.json({ success: true, data: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
