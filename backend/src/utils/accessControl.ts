import { db } from '../config/db';

/**
 * Roles that possess global, organization-wide administrative oversight.
 */
export const GLOBAL_LEADERSHIP_ROLES = [
  'owner',
  'super_admin',
  'admin',
  'coo',
  'operations_lead'
];

/**
 * Check whether a user has global agency leadership privileges
 */
export function isGlobalLeadership(role?: string, isOwner?: boolean): boolean {
  if (isOwner) return true;
  if (!role) return false;
  const normalized = role.trim().toLowerCase().replace(/\s+/g, '_');
  return GLOBAL_LEADERSHIP_ROLES.includes(normalized) || GLOBAL_LEADERSHIP_ROLES.includes(role.trim().toLowerCase());
}

/**
 * Check whether a specific user has authorized access to a client account.
 */
export async function userHasClientAccess(
  userId: string,
  orgId: string,
  clientId: string,
  role?: string,
  isOwner?: boolean
): Promise<boolean> {
  if (!userId || !clientId || !orgId) return false;

  // Global leadership bypasses client scoping
  if (isGlobalLeadership(role, isOwner)) {
    return true;
  }

  try {
    const query = `
      SELECT c.id 
      FROM clients c
      WHERE c.id = $1 
        AND c.organization_id = $2 
        AND c.deleted_at IS NULL
        AND (
          c.account_manager_id = $3
          OR c.account_assistant_id = $3
          OR $3::uuid = ANY(COALESCE(c.account_assistant_ids, '{}'))
          OR $3 = ANY(COALESCE(c.assigned_team_ids, '{}'))
          OR c.created_by = $3
          OR EXISTS (
            SELECT 1 FROM client_assistants ca 
            WHERE ca.client_id = c.id AND ca.user_id = $3
          )
          OR EXISTS (
            SELECT 1 FROM organization_users ou 
            WHERE ou.user_id = $3 AND ou.organization_id = $2 AND ou.client_id = c.id
          )
        )
      LIMIT 1;
    `;

    const result = await db.query(query, [clientId, orgId, userId]);
    return result.rows.length > 0;
  } catch (err) {
    console.error('Error verifying client access:', err);
    return false;
  }
}

/**
 * Retrieve all client IDs accessible by a user within their organization.
 * Returns 'ALL' for global leadership.
 */
export async function getUserAccessibleClientIds(
  userId: string,
  orgId: string,
  role?: string,
  isOwner?: boolean
): Promise<string[] | 'ALL'> {
  if (isGlobalLeadership(role, isOwner)) {
    return 'ALL';
  }

  try {
    const query = `
      SELECT c.id 
      FROM clients c
      WHERE c.organization_id = $1 
        AND c.deleted_at IS NULL
        AND (
          c.account_manager_id = $2
          OR c.account_assistant_id = $2
          OR $2::uuid = ANY(COALESCE(c.account_assistant_ids, '{}'))
          OR $2 = ANY(COALESCE(c.assigned_team_ids, '{}'))
          OR c.created_by = $2
          OR EXISTS (
            SELECT 1 FROM client_assistants ca 
            WHERE ca.client_id = c.id AND ca.user_id = $2
          )
          OR EXISTS (
            SELECT 1 FROM organization_users ou 
            WHERE ou.user_id = $2 AND ou.organization_id = $1 AND ou.client_id = c.id
          )
        );
    `;

    const result = await db.query(query, [orgId, userId]);
    return result.rows.map((r: any) => r.id);
  } catch (err) {
    console.error('Error fetching accessible client IDs:', err);
    return [];
  }
}

export interface TaskConcernStatus {
  isConcerned: boolean;
  roleInTask: string;
  task?: any;
}

/**
 * Verifies if a user is a concerned stakeholder for a specific task.
 * Concerned stakeholders include:
 * - Global Leadership / Admins
 * - Task Assignee
 * - Task Creator
 * - Project Manager & Project Members (if task has project_id)
 * - Client Account Manager, Assistants, and Assigned Team (if task has client_id)
 * - Client Portal User (if single client matches task's client_id)
 */
export async function userIsConcernedWithTask(
  userId: string,
  orgId: string,
  taskId: string,
  role?: string,
  isOwner?: boolean
): Promise<TaskConcernStatus> {
  if (!userId || !taskId || !orgId) {
    return { isConcerned: false, roleInTask: 'none' };
  }

  try {
    const taskRes = await db.query(`
      SELECT 
        t.*,
        p.project_manager_id,
        c.account_manager_id,
        c.account_assistant_id,
        c.account_assistant_ids,
        c.assigned_team_ids as client_team_ids
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE t.id = $1 AND t.organization_id = $2 AND t.deleted_at IS NULL;
    `, [taskId, orgId]);

    if (taskRes.rows.length === 0) {
      return { isConcerned: false, roleInTask: 'none' };
    }

    const task = taskRes.rows[0];

    // 1. Global Leadership
    if (isGlobalLeadership(role, isOwner)) {
      return { isConcerned: true, roleInTask: 'Global Leadership', task };
    }

    // 2. Task Assignee
    if (task.assignee_id && task.assignee_id === userId) {
      return { isConcerned: true, roleInTask: 'Task Assignee', task };
    }

    // 3. Task Creator
    if (task.created_by && task.created_by === userId) {
      return { isConcerned: true, roleInTask: 'Task Creator', task };
    }

    // 4. Project-Level Stakeholders
    if (task.project_id) {
      if (task.project_manager_id === userId) {
        return { isConcerned: true, roleInTask: 'Project Manager', task };
      }

      const pmRes = await db.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2 LIMIT 1;',
        [task.project_id, userId]
      );
      if (pmRes.rows.length > 0) {
        return { isConcerned: true, roleInTask: 'Project Member', task };
      }
    }

    // 5. Client-Level Stakeholders
    if (task.client_id) {
      if (task.account_manager_id === userId) {
        return { isConcerned: true, roleInTask: 'Client Account Manager', task };
      }
      if (
        task.account_assistant_id === userId ||
        (Array.isArray(task.account_assistant_ids) && task.account_assistant_ids.includes(userId))
      ) {
        return { isConcerned: true, roleInTask: 'Client Assistant', task };
      }
      if (Array.isArray(task.client_team_ids) && task.client_team_ids.includes(userId)) {
        return { isConcerned: true, roleInTask: 'Client Team Member', task };
      }

      const caRes = await db.query(
        'SELECT 1 FROM client_assistants WHERE client_id = $1 AND user_id = $2 LIMIT 1;',
        [task.client_id, userId]
      );
      if (caRes.rows.length > 0) {
        return { isConcerned: true, roleInTask: 'Client Assistant', task };
      }

      const ouRes = await db.query(
        'SELECT 1 FROM organization_users WHERE user_id = $1 AND organization_id = $2 AND client_id = $3 LIMIT 1;',
        [userId, orgId, task.client_id]
      );
      if (ouRes.rows.length > 0) {
        return { isConcerned: true, roleInTask: 'Client Representative', task };
      }
    }

    return { isConcerned: false, roleInTask: 'none', task };
  } catch (err) {
    console.error('Error determining task concern status:', err);
    return { isConcerned: false, roleInTask: 'none' };
  }
}
