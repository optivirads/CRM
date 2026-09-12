-- ============================================================================
-- Migration 013: Add Assignee Details to Tasks
-- ============================================================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_name VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_role VARCHAR(150);

-- Backfill existing tasks with assignee name from users table
UPDATE tasks t
SET assignee_name = NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), '')
FROM users u
WHERE t.assignee_id = u.id AND t.assignee_name IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_name ON tasks(assignee_name);
