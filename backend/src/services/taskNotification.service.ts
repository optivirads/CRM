import { db } from '../config/db';
import { EmailService } from './email.service';
import { sendWhatsAppTextMessage } from './whatsapp.service';

export type TaskEventType = 'ASSIGNED' | 'STATUS_CHANGED' | 'UPDATED' | 'COMMENT_ADDED';

export interface TaskChange {
  field: string;
  from?: any;
  to?: any;
}

export interface NotifyTaskParams {
  taskId: string;
  orgId: string;
  actor: {
    id: string;
    name?: string;
    email?: string;
  };
  eventType: TaskEventType;
  changes?: TaskChange[];
  comment?: string;
  titleOverride?: string;
  summaryOverride?: string;
}

interface TeamRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  roleName?: string;
}

/**
 * TaskNotificationService
 * Dispatches notifications exclusively to internal agency team members assigned to or working on a client/task.
 * Strictly prevents clients from receiving internal task notifications, and prevents self-notification for the actor.
 */
export class TaskNotificationService {
  /**
   * Main entry point to notify all team members assigned to or working on a task/client
   */
  static async notifyTeamOfTaskEvent(params: NotifyTaskParams): Promise<void> {
    const { taskId, orgId, actor, eventType, changes = [], comment, titleOverride, summaryOverride } = params;

    try {
      // 1. Fetch task, client, and project context
      const taskRes = await db.query(`
        SELECT 
          t.id, t.title, t.description, t.priority, t.status, t.due_date,
          t.assignee_id, t.assignee_name, t.created_by,
          t.project_id, t.client_id,
          p.name AS project_name, p.project_manager_id,
          c.id AS client_ref_id,
          comp.name AS client_name,
          c.account_manager_id,
          c.account_assistant_id,
          c.account_assistant_ids,
          c.assigned_team_ids AS client_team_ids
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN clients c ON t.client_id = c.id
        LEFT JOIN companies comp ON c.company_id = comp.id
        WHERE t.id = $1 AND t.organization_id = $2 AND t.deleted_at IS NULL;
      `, [taskId, orgId]);

      if (taskRes.rows.length === 0) {
        console.warn(`[TaskNotificationService] Task not found: ${taskId}`);
        return;
      }

      const task = taskRes.rows[0];

      // 2. Identify candidate team members working on this task / client
      const candidateUserIds = new Set<string>();

      // Task Assignee
      if (task.assignee_id) {
        candidateUserIds.add(String(task.assignee_id));
      }

      // If assignee_id is missing but assignee_name is provided, attempt to resolve matching internal user
      if (!task.assignee_id && task.assignee_name) {
        const nameMatch = await db.query(`
          SELECT u.id 
          FROM users u
          JOIN organization_users ou ON u.id = ou.user_id
          WHERE ou.organization_id = $1 AND u.deleted_at IS NULL
            AND (
              LOWER(TRIM(CONCAT(u.first_name, ' ', u.last_name))) = LOWER($2)
              OR LOWER(u.email) = LOWER($2)
            )
          LIMIT 1;
        `, [orgId, String(task.assignee_name).trim()]);
        if (nameMatch.rows.length > 0) {
          candidateUserIds.add(nameMatch.rows[0].id);
        }
      }

      // Task Creator
      if (task.created_by) {
        candidateUserIds.add(String(task.created_by));
      }

      // Project Manager
      if (task.project_manager_id) {
        candidateUserIds.add(String(task.project_manager_id));
      }

      // Project Members
      if (task.project_id) {
        const pmRes = await db.query(
          `SELECT user_id FROM project_members WHERE project_id = $1;`,
          [task.project_id]
        );
        pmRes.rows.forEach((r: any) => candidateUserIds.add(String(r.user_id)));
      }

      // Remove the actor so they don't get self-notified for their own action
      // EXCEPT when a task is ASSIGNED and the actor is the assignee (e.g. self-assignment or testing)
      if (actor.id) {
        const isAssignee = task.assignee_id && String(task.assignee_id) === String(actor.id);
        if (eventType !== 'ASSIGNED' || !isAssignee) {
          candidateUserIds.delete(String(actor.id));
        }
      }

      if (candidateUserIds.size === 0) {
        console.info(`[TaskNotificationService] No eligible recipients for taskId=${taskId} event=${eventType}`);
        return;
      }

      // 3. Query user details with STRICT FILTER to exclude clients
      // Strictly includes ONLY internal team members. Blocks client portal users, client-scoped members, and client contacts.
      const candidateList = Array.from(candidateUserIds);
      const recipientsRes = await db.query(`
        SELECT 
          u.id, 
          u.email, 
          u.phone, 
          TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS name,
          r.name AS role_name,
          r.slug AS role_slug,
          ou.is_owner
        FROM users u
        JOIN organization_users ou ON u.id = ou.user_id AND ou.organization_id = $1
        LEFT JOIN roles r ON ou.role_id = r.id
        WHERE u.id = ANY($2::uuid[])
          AND u.deleted_at IS NULL
          AND ou.status = 'active'
          AND ou.client_id IS NULL
          AND (r.slug IS NULL OR LOWER(r.slug) NOT IN ('client_portal', 'client', 'client_rep', 'client_representative'))
          AND NOT EXISTS (
            SELECT 1 FROM contacts ct 
            WHERE LOWER(ct.email) = LOWER(u.email)
               OR (ct.phone IS NOT NULL AND u.phone IS NOT NULL AND ct.phone = u.phone)
          )
      `, [orgId, candidateList]);

      const recipients: TeamRecipient[] = recipientsRes.rows.map((row: any) => ({
        id: row.id,
        name: row.name || 'Team Member',
        email: row.email,
        phone: row.phone,
        roleName: row.role_name || (row.is_owner ? 'Owner' : 'Team Member')
      }));

      if (recipients.length === 0) {
        console.info(`[TaskNotificationService] All recipients filtered out (non-team or client-only) for taskId=${taskId}`);
        return;
      }

      // 4. Construct human-readable notification copy
      const actorName = actor.name || 'A team member';
      const projectName = task.project_name || 'General Operations';
      const clientName = task.client_name || 'OptiVir Direct';
      const formattedDueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN') : null;
      const defaultFrontend = process.env.NODE_ENV === 'production' ? 'https://optivircrm.vercel.app' : 'http://localhost:3000';
      const frontendUrl = (process.env.FRONTEND_URL || defaultFrontend).replace(/\/$/, '');
      const taskLink = `${frontendUrl}/?tab=tasks&id=${task.id}`;
      const inAppNotifLink = `/?tab=tasks&id=${task.id}`;

      let notifTitle = titleOverride || '';
      let notifMessage = summaryOverride || '';
      let notifType = 'task_updated';
      let waHeaderEmoji = '✏️';

      switch (eventType) {
        case 'ASSIGNED':
          waHeaderEmoji = '📋';
          notifType = 'task_assigned';
          if (!notifTitle) notifTitle = `📋 Task Assigned: ${task.title}`;
          if (!notifMessage) {
            notifMessage = `${actorName} assigned task "${task.title}" to team deliverables (${clientName} • ${task.priority || 'Medium'} Priority).`;
          }
          break;

        case 'STATUS_CHANGED':
          waHeaderEmoji = '🔄';
          notifType = 'task_status_changed';
          if (!notifTitle) notifTitle = `🔄 Task Status Updated: ${task.title}`;
          if (!notifMessage) {
            const statusChange = changes.find(c => c.field.toLowerCase() === 'status');
            const transition = statusChange ? `${statusChange.from} ➔ ${statusChange.to}` : task.status;
            notifMessage = `${actorName} moved task "${task.title}" to ${transition}.`;
          }
          break;

        case 'COMMENT_ADDED':
          waHeaderEmoji = '💬';
          notifType = 'task_comment';
          if (!notifTitle) notifTitle = `💬 New Comment on Task: ${task.title}`;
          if (!notifMessage) {
            notifMessage = `${actorName} commented on "${task.title}": "${comment ? (comment.length > 80 ? comment.slice(0, 77) + '...' : comment) : ''}"`;
          }
          break;

        case 'UPDATED':
        default:
          waHeaderEmoji = '✏️';
          notifType = 'task_updated';
          if (!notifTitle) notifTitle = `✏️ Task Updated: ${task.title}`;
          if (!notifMessage) {
            const changesList = changes.map(c => `${c.field}: ${c.from ?? 'None'} ➔ ${c.to ?? 'None'}`).join(', ');
            notifMessage = `${actorName} updated task "${task.title}"${changesList ? ` (${changesList})` : ''}.`;
          }
          break;
      }

      // 5. Dispatch In-App Notifications for each team recipient
      for (const recipient of recipients) {
        try {
          await db.query(`
            INSERT INTO notifications (organization_id, user_id, title, message, link, type, is_read)
            VALUES ($1, $2, $3, $4, $5, $6, false);
          `, [orgId, recipient.id, notifTitle, notifMessage, inAppNotifLink, notifType]);
        } catch (dbErr: any) {
          // Fallback to task_assigned if DB constraint requires it
          try {
            await db.query(`
              INSERT INTO notifications (organization_id, user_id, title, message, link, type, is_read)
              VALUES ($1, $2, $3, $4, $5, 'task_assigned', false);
            `, [orgId, recipient.id, notifTitle, notifMessage, inAppNotifLink]);
          } catch (_) {}
        }
      }

      // 6. Record Organization Activity Feed Item
      await db.query(`
        INSERT INTO activities (organization_id, type, subject, description, completed_at)
        VALUES ($1, 'Task', $2, $3, NOW());
      `, [orgId, notifTitle, notifMessage]).catch(() => {});

      // 7. Dispatch Email Notifications
      const emailPromises = recipients
        .filter(r => !!r.email)
        .map(recipient => {
          if (eventType === 'ASSIGNED') {
            return EmailService.sendTaskAssignedNotification({
              task: {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                due_date: formattedDueDate,
                clientName,
                projectName
              },
              assignee: {
                name: recipient.name,
                email: recipient.email
              },
              assignedBy: {
                name: actorName,
                email: actor.email
              },
              agencyName: 'OptiVir Ads'
            }).catch(e => {
              console.warn(`[TaskNotificationService] Email error for ${recipient.email}:`, e.message);
              return false;
            });
          } else {
            return EmailService.sendTaskUpdatedNotification({
              task: {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                due_date: formattedDueDate,
                clientName,
                projectName
              },
              recipient: {
                name: recipient.name,
                email: recipient.email
              },
              actor: {
                name: actorName,
                email: actor.email
              },
              updateType: eventType,
              title: notifTitle,
              summary: notifMessage,
              changes,
              comment,
              agencyName: 'OptiVir Ads'
            }).catch(e => {
              console.warn(`[TaskNotificationService] Email error for ${recipient.email}:`, e.message);
              return false;
            });
          }
        });

      // 8. Dispatch WhatsApp Notifications via Meta Cloud API
      const waPromises = recipients
        .filter(r => !!r.phone)
        .map(recipient => {
          let waBody = '';

          if (eventType === 'ASSIGNED') {
            waBody =
              `📋 *New Task Assigned: ${task.title}*\n\n` +
              `👤 *Assigned By:* ${actorName}\n` +
              `🏢 *Client:* ${clientName}\n` +
              `🚀 *Project:* ${projectName}\n` +
              `⚡ *Priority:* ${task.priority || 'Medium'}\n` +
              `📅 *Due Date:* ${formattedDueDate || 'No Due Date'}\n\n` +
              `👉 *Open Workspace:* ${taskLink}`;
          } else if (eventType === 'STATUS_CHANGED') {
            const statusChange = changes.find(c => c.field.toLowerCase() === 'status');
            const transition = statusChange ? `${statusChange.from} ➔ *${statusChange.to}*` : `*${task.status}*`;
            waBody =
              `🔄 *Task Status Updated: ${task.title}*\n\n` +
              `👤 *Updated By:* ${actorName}\n` +
              `📊 *Status:* ${transition}\n` +
              `🏢 *Client:* ${clientName}\n` +
              `🚀 *Project:* ${projectName}\n` +
              `⚡ *Priority:* ${task.priority || 'Medium'}\n\n` +
              `👉 *Open Task:* ${taskLink}`;
          } else if (eventType === 'COMMENT_ADDED') {
            waBody =
              `💬 *New Comment on Task: ${task.title}*\n\n` +
              `👤 *Comment By:* ${actorName}\n` +
              `🏢 *Client:* ${clientName}\n` +
              `🚀 *Project:* ${projectName}\n` +
              `💬 *Comment:* "${comment || ''}"\n\n` +
              `👉 *View & Reply in CRM:* ${taskLink}`;
          } else {
            const changeBullets = changes.length > 0
              ? changes.map(c => `• *${c.field}:* ${c.from ?? 'None'} ➔ ${c.to ?? 'None'}`).join('\n')
              : `• Deliverable details updated`;
            waBody =
              `✏️ *Task Updated: ${task.title}*\n\n` +
              `👤 *Updated By:* ${actorName}\n` +
              `🏢 *Client:* ${clientName}\n` +
              `🚀 *Project:* ${projectName}\n` +
              `📝 *Changes:*\n${changeBullets}\n\n` +
              `👉 *Open Task:* ${taskLink}`;
          }

          return sendWhatsAppTextMessage(orgId, recipient.phone!, waBody)
            .then(res => {
              if (res.success) {
                console.info(`[TaskNotificationService] WhatsApp delivered to ${recipient.phone} for taskId=${taskId}`);
              } else {
                console.warn(`[TaskNotificationService] WhatsApp dispatch response for ${recipient.phone}: ${res.error}`);
              }
              return res;
            })
            .catch(waErr => {
              console.warn(`[TaskNotificationService] WhatsApp error for ${recipient.phone}:`, waErr?.message);
              return { success: false, error: waErr?.message };
            });
        });

      await Promise.allSettled([...emailPromises, ...waPromises]);

      console.info(`[TaskNotificationService] Dispatched ${eventType} notifications to ${recipients.length} team members for taskId=${taskId}`);
    } catch (err: any) {
      console.error('[TaskNotificationService Error]:', err);
    }
  }
}
