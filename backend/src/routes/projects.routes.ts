import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  userHasClientAccess,
  userIsConcernedWithTask,
  getUserAccessibleClientIds,
  isGlobalLeadership
} from '../utils/accessControl';

const router = Router();

// 1. Projects List with pagination & client-access scoping
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
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
    } else if (!isGlobalLeadership(req.user?.role, req.user?.isOwner)) {
      // Scoped team members only see projects under clients they have access to or projects they are a member of
      const accessibleClientIds = await getUserAccessibleClientIds(userId, orgId, req.user?.role, req.user?.isOwner);
      if (Array.isArray(accessibleClientIds)) {
        params.push(accessibleClientIds);
        params.push(userId);
        whereClause += ` AND (
          p.client_id = ANY($${params.length - 1}::uuid[])
          OR p.project_manager_id = $${params.length}
          OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = $${params.length})
        )`;
      }
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
  const userId = req.user!.id;
  const { projectId, clientId, status, assigneeId, overdue, myConcerned } = req.query;

  try {
    let query = `
      SELECT 
        t.*,
        p.name as project_name,
        comp.name as client_name,
        COALESCE(t.assignee_name, NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), 'Unassigned') as assignee_name,
        COALESCE(t.assignee_role, ou.designation, 'Team Member') as assignee_role,
        u.first_name as assignee_first, u.last_name as assignee_last,
        (SELECT COUNT(*) FROM creatives WHERE task_id = t.id) as linked_creatives_count,
        (SELECT COUNT(*) FROM task_comments WHERE task_id = t.id) as comments_count
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
    if (myConcerned === 'true') {
      params.push(userId);
      const uidIdx = params.length;
      query += ` AND (
        t.assignee_id = $${uidIdx}
        OR t.created_by = $${uidIdx}
        OR p.project_manager_id = $${uidIdx}
        OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = t.project_id AND pm.user_id = $${uidIdx})
        OR c.account_manager_id = $${uidIdx}
        OR c.account_assistant_id = $${uidIdx}
        OR $${uidIdx}::uuid = ANY(COALESCE(c.account_assistant_ids, '{}'))
        OR $${uidIdx} = ANY(COALESCE(c.assigned_team_ids, '{}'))
        OR EXISTS (SELECT 1 FROM client_assistants ca WHERE ca.client_id = t.client_id AND ca.user_id = $${uidIdx})
      )`;
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
        (SELECT COUNT(*) FROM creatives WHERE task_id = t.id) as linked_creatives_count,
        (SELECT COUNT(*) FROM task_comments WHERE task_id = t.id) as comments_count
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

// 3. Create Task (Client-access verified)
router.post('/tasks', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const {
    title, description, project_id, client_id,
    assignee_id, assignee_name, assignee_role,
    priority, due_date, assigned_date, start_date, progress
  } = req.body;

  if (!title) {
    res.status(400).json({ success: false, message: 'Task title is required' });
    return;
  }

  // If a client is specified, verify that the creator has client access
  if (client_id) {
    const hasAccess = await userHasClientAccess(userId, orgId, client_id, req.user?.role, req.user?.isOwner);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to create tasks under this client.'
      });
      return;
    }
  }

  const effectiveAssignedDate = assigned_date || start_date || new Date().toISOString().split('T')[0];
  const userFullName = `${req.user?.firstName || 'User'} ${req.user?.lastName || ''}`.trim();
  const initialHistory = [{
    from_status: null,
    to_status: 'To Do',
    changed_by: userId,
    user_name: userFullName,
    changed_at: new Date().toISOString(),
    notes: 'Task created'
  }];

  try {
    const result = await db.query(`
      INSERT INTO tasks (
        organization_id, title, description, project_id, client_id, assignee_id,
        assignee_name, assignee_role,
        priority, status, progress, subtasks, stage_history,
        assigned_date, start_date, due_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'To Do', $10, $11, $12, $13, $13, $14, $15)
      RETURNING *;
    `, [
      orgId, title, description || null, project_id || null, client_id || null,
      assignee_id || null, assignee_name || null, assignee_role || null,
      priority || 'Medium', Math.max(0, Math.min(100, Number(progress) || 0)),
      JSON.stringify([]), JSON.stringify(initialHistory),
      effectiveAssignedDate, due_date || null, userId
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Update Task Status (Task Flow stage progression with history & concerned stakeholder check)
router.patch('/tasks/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const taskId = req.params.id;
  const { status, notes } = req.body;

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
    // Verify that user is a concerned stakeholder
    const concern = await userIsConcernedWithTask(userId, orgId, taskId, req.user?.role, req.user?.isOwner);
    if (!concern.isConcerned) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to update progress on this task. Only assigned members, project managers, client account managers, or administrators can update progress.'
      });
      return;
    }

    const currentTask = concern.task;
    const currentHistory = Array.isArray(currentTask.stage_history) ? currentTask.stage_history : [];
    const userFullName = `${req.user?.firstName || 'User'} ${req.user?.lastName || ''}`.trim();
    const newHistoryEntry = {
      from_status: currentTask.status,
      to_status: normalizedStatus,
      changed_by: userId,
      user_name: userFullName,
      changed_at: new Date().toISOString(),
      notes: notes || `Moved to ${normalizedStatus}`
    };
    const updatedHistory = [...currentHistory, newHistoryEntry];

    // Compute updated progress based on flow stage
    let newProgress = currentTask.progress !== null && currentTask.progress !== undefined ? currentTask.progress : 0;
    if (normalizedStatus === 'Completed') {
      newProgress = 100;
    } else if (normalizedStatus === 'Review' && newProgress < 75) {
      newProgress = 80;
    } else if (normalizedStatus === 'In Progress' && newProgress === 0) {
      newProgress = 25;
    } else if (normalizedStatus === 'To Do' && currentTask.status === 'Completed') {
      newProgress = 0;
    }

    const result = await db.query(`
      UPDATE tasks 
      SET 
        status = $1::varchar,
        progress = $2,
        stage_history = $3::jsonb,
        completed_at = CASE WHEN $1::varchar = 'Completed' THEN NOW() ELSE NULL END,
        updated_by = $4
      WHERE id = $5 AND organization_id = $6
      RETURNING *;
    `, [normalizedStatus, newProgress, JSON.stringify(updatedHistory), userId, taskId, orgId]);

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

    // Cleanly unlink any creatives linked to this task
    await db.query(`
      UPDATE creatives
      SET task_id = NULL
      WHERE task_id = $1 AND organization_id = $2;
    `, [taskId, orgId]);

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

// Create Project (Strictly restricted to users with verified client access)
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
      res.status(400).json({
        success: false,
        message: 'A valid client company must be selected to create a project under.'
      });
      return;
    }

    // Enforce strict client access check
    const hasAccess = await userHasClientAccess(userId, orgId, resolvedClientId, req.user?.role, req.user?.isOwner);
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to create projects under this client. Only team members with assigned client access can create projects.'
      });
      return;
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

// General Update Task (Title, description, priority, status, progress, subtasks, due date, assignee, etc.)
router.patch('/tasks/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const taskId = req.params.id;
  const {
    title, description, priority, status, due_date,
    assigned_date, start_date, assignee_id, assignee_name, assignee_role,
    project_id, client_id, progress, subtasks, notes
  } = req.body;

  try {
    // 1. Verify user is a concerned stakeholder
    const concern = await userIsConcernedWithTask(userId, orgId, taskId, req.user?.role, req.user?.isOwner);
    if (!concern.isConcerned) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to update this task. Only assigned members, project managers, client account managers, or administrators can make updates.'
      });
      return;
    }

    const currentTask = concern.task;
    const effectiveAssignedDate = assigned_date || start_date;

    // 2. Handle subtasks & progress recalculation
    let computedProgress = currentTask.progress;
    let computedSubtasks = currentTask.subtasks;

    if (subtasks !== undefined && Array.isArray(subtasks)) {
      computedSubtasks = subtasks;
      if (progress === undefined) {
        if (subtasks.length > 0) {
          const completedCount = subtasks.filter((s: any) => s.done).length;
          computedProgress = Math.round((completedCount / subtasks.length) * 100);
        }
      } else {
        computedProgress = Math.max(0, Math.min(100, Number(progress) || 0));
      }
    } else if (progress !== undefined) {
      computedProgress = Math.max(0, Math.min(100, Number(progress) || 0));
    }

    // 3. Handle stage progression history if status is changing
    let updatedHistory = Array.isArray(currentTask.stage_history) ? currentTask.stage_history : [];
    let effectiveStatus = status || currentTask.status;

    if (status && status !== currentTask.status) {
      const userFullName = `${req.user?.firstName || 'User'} ${req.user?.lastName || ''}`.trim();
      updatedHistory = [
        ...updatedHistory,
        {
          from_status: currentTask.status,
          to_status: status,
          changed_by: userId,
          user_name: userFullName,
          changed_at: new Date().toISOString(),
          notes: notes || `Status changed to ${status}`
        }
      ];

      // Auto-set 100% progress when completed
      if (status === 'Completed') {
        computedProgress = 100;
      }
    }

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
        progress = COALESCE($17, progress),
        subtasks = COALESCE($18::jsonb, subtasks),
        stage_history = COALESCE($19::jsonb, stage_history),
        completed_at = CASE WHEN $4 = 'Completed' THEN NOW() ELSE completed_at END,
        updated_by = $10
      WHERE id = $11 AND organization_id = $12
      RETURNING *;
    `, [
      title, description, priority, status, due_date,
      assignee_id, assignee_name, assignee_role, effectiveAssignedDate,
      userId, taskId, orgId,
      project_id !== undefined, project_id || null,
      client_id !== undefined, client_id || null,
      computedProgress !== undefined ? computedProgress : null,
      computedSubtasks !== undefined ? JSON.stringify(computedSubtasks) : null,
      JSON.stringify(updatedHistory)
    ]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'tasks', taskId, currentTask, updated.rows[0], req);
    res.json({ success: true, data: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Get Task Comments (Discussion Thread)
router.get('/tasks/:id/comments', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const taskId = req.params.id;

  try {
    const commentsRes = await db.query(`
      SELECT 
        tc.id,
        tc.task_id,
        tc.user_id,
        tc.comment as text,
        tc.created_at,
        u.first_name,
        u.last_name,
        TRIM(CONCAT(u.first_name, ' ', u.last_name)) as author,
        u.email,
        COALESCE(ou.designation, r.name, 'Team Member') as role_name
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      LEFT JOIN organization_users ou ON ou.user_id = u.id AND ou.organization_id = $1
      LEFT JOIN roles r ON ou.role_id = r.id
      WHERE tc.task_id = $2
      ORDER BY tc.created_at ASC;
    `, [orgId, taskId]);

    res.json({ success: true, data: commentsRes.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Post Task Comment (Only concerned stakeholders or admins)
router.post('/tasks/:id/comments', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const taskId = req.params.id;
  const { comment } = req.body;

  if (!comment || !comment.trim()) {
    res.status(400).json({ success: false, message: 'Comment text is required' });
    return;
  }

  try {
    const concern = await userIsConcernedWithTask(userId, orgId, taskId, req.user?.role, req.user?.isOwner);
    if (!concern.isConcerned) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to post comments on this task. Only concerned stakeholders can participate.'
      });
      return;
    }

    const insertRes = await db.query(`
      INSERT INTO task_comments (task_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [taskId, userId, comment.trim()]);

    const authorName = `${req.user?.firstName || 'User'} ${req.user?.lastName || ''}`.trim();
    res.status(201).json({
      success: true,
      data: {
        ...insertRes.rows[0],
        text: insertRes.rows[0].comment,
        author: authorName,
        first_name: req.user?.firstName,
        last_name: req.user?.lastName,
        email: req.user?.email,
        role_name: req.user?.role || 'Team Member'
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Get Task Stakeholders (Concerned parties: Assignee, Creator, PM, AM, Assistants)
router.get('/tasks/:id/stakeholders', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const taskId = req.params.id;

  try {
    const concern = await userIsConcernedWithTask(userId, orgId, taskId, req.user?.role, req.user?.isOwner);
    if (!concern.task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const task = concern.task;
    const stakeholders: any[] = [];
    const addedIds = new Set<string>();

    // Assignee
    if (task.assignee_id) {
      const uRes = await db.query('SELECT id, first_name, last_name, email FROM users WHERE id = $1;', [task.assignee_id]);
      if (uRes.rows.length > 0) {
        stakeholders.push({
          id: uRes.rows[0].id,
          name: `${uRes.rows[0].first_name} ${uRes.rows[0].last_name}`.trim(),
          email: uRes.rows[0].email,
          role: 'Task Assignee',
          is_current_user: uRes.rows[0].id === userId
        });
        addedIds.add(uRes.rows[0].id);
      }
    }

    // Creator
    if (task.created_by && !addedIds.has(task.created_by)) {
      const uRes = await db.query('SELECT id, first_name, last_name, email FROM users WHERE id = $1;', [task.created_by]);
      if (uRes.rows.length > 0) {
        stakeholders.push({
          id: uRes.rows[0].id,
          name: `${uRes.rows[0].first_name} ${uRes.rows[0].last_name}`.trim(),
          email: uRes.rows[0].email,
          role: 'Task Creator',
          is_current_user: uRes.rows[0].id === userId
        });
        addedIds.add(uRes.rows[0].id);
      }
    }

    // Project Manager
    if (task.project_manager_id && !addedIds.has(task.project_manager_id)) {
      const uRes = await db.query('SELECT id, first_name, last_name, email FROM users WHERE id = $1;', [task.project_manager_id]);
      if (uRes.rows.length > 0) {
        stakeholders.push({
          id: uRes.rows[0].id,
          name: `${uRes.rows[0].first_name} ${uRes.rows[0].last_name}`.trim(),
          email: uRes.rows[0].email,
          role: 'Project Manager',
          is_current_user: uRes.rows[0].id === userId
        });
        addedIds.add(uRes.rows[0].id);
      }
    }

    // Client Account Manager
    if (task.account_manager_id && !addedIds.has(task.account_manager_id)) {
      const uRes = await db.query('SELECT id, first_name, last_name, email FROM users WHERE id = $1;', [task.account_manager_id]);
      if (uRes.rows.length > 0) {
        stakeholders.push({
          id: uRes.rows[0].id,
          name: `${uRes.rows[0].first_name} ${uRes.rows[0].last_name}`.trim(),
          email: uRes.rows[0].email,
          role: 'Client Account Manager',
          is_current_user: uRes.rows[0].id === userId
        });
        addedIds.add(uRes.rows[0].id);
      }
    }

    // Client Assistant
    if (task.account_assistant_id && !addedIds.has(task.account_assistant_id)) {
      const uRes = await db.query('SELECT id, first_name, last_name, email FROM users WHERE id = $1;', [task.account_assistant_id]);
      if (uRes.rows.length > 0) {
        stakeholders.push({
          id: uRes.rows[0].id,
          name: `${uRes.rows[0].first_name} ${uRes.rows[0].last_name}`.trim(),
          email: uRes.rows[0].email,
          role: 'Client Assistant',
          is_current_user: uRes.rows[0].id === userId
        });
        addedIds.add(uRes.rows[0].id);
      }
    }

    res.json({
      success: true,
      data: {
        isConcerned: concern.isConcerned,
        userRoleInTask: concern.roleInTask,
        stakeholders
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
