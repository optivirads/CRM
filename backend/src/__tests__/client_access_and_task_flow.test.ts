import {
  isGlobalLeadership,
  userHasClientAccess,
  getUserAccessibleClientIds,
  userIsConcernedWithTask,
} from '../utils/accessControl';
import { db } from '../config/db';

jest.mock('../config/db', () => ({
  db: {
    query: jest.fn(),
  },
}));

describe('Client Project Access Control & Task Flow Logic', () => {
  const mockQuery = db.query as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isGlobalLeadership', () => {
    it('returns true if isOwner is true regardless of role', () => {
      expect(isGlobalLeadership('viewer', true)).toBe(true);
      expect(isGlobalLeadership(undefined, true)).toBe(true);
    });

    it('returns true for global leadership roles (case-insensitive & spaced/underscored)', () => {
      expect(isGlobalLeadership('owner', false)).toBe(true);
      expect(isGlobalLeadership('super_admin', false)).toBe(true);
      expect(isGlobalLeadership('Super Admin', false)).toBe(true);
      expect(isGlobalLeadership('admin', false)).toBe(true);
      expect(isGlobalLeadership('Admin', false)).toBe(true);
      expect(isGlobalLeadership('coo', false)).toBe(true);
      expect(isGlobalLeadership('COO', false)).toBe(true);
      expect(isGlobalLeadership('operations_lead', false)).toBe(true);
      expect(isGlobalLeadership('Operations Lead', false)).toBe(true);
    });

    it('returns false for scoped non-leadership roles when not owner', () => {
      expect(isGlobalLeadership('client_manager', false)).toBe(false);
      expect(isGlobalLeadership('account_manager', false)).toBe(false);
      expect(isGlobalLeadership('designer', false)).toBe(false);
      expect(isGlobalLeadership('video_editor', false)).toBe(false);
      expect(isGlobalLeadership('copywriter', false)).toBe(false);
      expect(isGlobalLeadership('team_member', false)).toBe(false);
      expect(isGlobalLeadership(undefined, false)).toBe(false);
    });
  });

  describe('userHasClientAccess', () => {
    const userId = 'usr-100';
    const orgId = 'org-1';
    const clientId = 'cli-555';

    it('returns true immediately for global leadership without DB queries', async () => {
      const hasAccess = await userHasClientAccess(userId, orgId, clientId, 'admin', false);
      expect(hasAccess).toBe(true);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns true if user matches client access query', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: clientId }],
      });

      const hasAccess = await userHasClientAccess(userId, orgId, clientId, 'team_member', false);
      expect(hasAccess).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('returns false when client query returns empty result', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      const hasAccess = await userHasClientAccess(userId, orgId, clientId, 'team_member', false);
      expect(hasAccess).toBe(false);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('returns false when missing required parameters', async () => {
      expect(await userHasClientAccess('', orgId, clientId)).toBe(false);
      expect(await userHasClientAccess(userId, '', clientId)).toBe(false);
      expect(await userHasClientAccess(userId, orgId, '')).toBe(false);
    });
  });

  describe('getUserAccessibleClientIds', () => {
    it('returns "ALL" for global leadership (unrestricted client visibility)', async () => {
      const result = await getUserAccessibleClientIds('usr-1', 'org-1', 'COO', false);
      expect(result).toBe('ALL');
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns list of accessible client IDs for scoped staff', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'cli-1' }, { id: 'cli-2' }, { id: 'cli-3' }],
      });

      const result = await getUserAccessibleClientIds('usr-1', 'org-1', 'team_member', false);
      expect(result).toEqual(['cli-1', 'cli-2', 'cli-3']);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('userIsConcernedWithTask', () => {
    const userId = 'usr-designer';
    const orgId = 'org-1';
    const taskId = 'task-888';

    it('returns not concerned if task does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const status = await userIsConcernedWithTask(userId, orgId, taskId, 'team_member', false);
      expect(status.isConcerned).toBe(false);
      expect(status.roleInTask).toBe('none');
    });

    it('returns true with role "Global Leadership" for admins', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: taskId, organization_id: orgId }],
      });

      const status = await userIsConcernedWithTask(userId, orgId, taskId, 'Admin', false);
      expect(status.isConcerned).toBe(true);
      expect(status.roleInTask).toBe('Global Leadership');
    });

    it('returns true if user is the task assignee', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: taskId,
            assignee_id: userId,
            created_by: 'usr-pm',
            client_id: 'cli-1',
            project_id: 'proj-1',
          },
        ],
      });

      const status = await userIsConcernedWithTask(userId, orgId, taskId, 'designer', false);
      expect(status.isConcerned).toBe(true);
      expect(status.roleInTask).toBe('Task Assignee');
    });

    it('returns true if user is the task creator', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: taskId,
            assignee_id: 'someone-else',
            created_by: userId,
            client_id: 'cli-1',
            project_id: 'proj-1',
          },
        ],
      });

      const status = await userIsConcernedWithTask(userId, orgId, taskId, 'team_member', false);
      expect(status.isConcerned).toBe(true);
      expect(status.roleInTask).toBe('Task Creator');
    });

    it('returns true if user is the project manager of the task project', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: taskId,
            assignee_id: 'someone-else',
            created_by: 'another-creator',
            project_id: 'proj-1',
            project_manager_id: userId,
          },
        ],
      });

      const status = await userIsConcernedWithTask(userId, orgId, taskId, 'pm_lead', false);
      expect(status.isConcerned).toBe(true);
      expect(status.roleInTask).toBe('Project Manager');
    });

    it('returns true if user is client account manager', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: taskId,
            assignee_id: 'someone-else',
            created_by: 'another-creator',
            client_id: 'cli-10',
            account_manager_id: userId,
          },
        ],
      });

      const status = await userIsConcernedWithTask(userId, orgId, taskId, 'client_manager', false);
      expect(status.isConcerned).toBe(true);
      expect(status.roleInTask).toBe('Client Account Manager');
    });

    it('returns false if user has no assignment or affiliation with the task', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: taskId,
            assignee_id: 'other-assignee',
            created_by: 'other-creator',
            client_id: 'cli-1',
            project_id: 'proj-1',
            project_manager_id: 'other-pm',
            account_manager_id: 'other-am',
            account_assistant_id: 'other-assistant',
            account_assistant_ids: [],
            client_team_ids: [],
          },
        ],
      });
      // project_members check
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // client_assistants check
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // organization_users check
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const status = await userIsConcernedWithTask(userId, orgId, taskId, 'designer', false);
      expect(status.isConcerned).toBe(false);
      expect(status.roleInTask).toBe('none');
    });
  });
});
