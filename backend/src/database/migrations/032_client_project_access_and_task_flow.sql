-- ============================================================================
-- Migration 032: Client-Access Restricted Project Creation & Task Flow
-- ============================================================================

-- 1. Add progress, subtasks, and stage_history columns to tasks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'progress'
    ) THEN
        ALTER TABLE tasks ADD COLUMN progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'subtasks'
    ) THEN
        ALTER TABLE tasks ADD COLUMN subtasks JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'stage_history'
    ) THEN
        ALTER TABLE tasks ADD COLUMN stage_history JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 2. Backfill existing tasks progress based on status
UPDATE tasks
SET progress = 100
WHERE status = 'Completed' AND (progress IS NULL OR progress = 0);

UPDATE tasks
SET progress = 50
WHERE status = 'In Progress' AND (progress IS NULL OR progress = 0);

UPDATE tasks
SET progress = 80
WHERE status = 'Review' AND (progress IS NULL OR progress = 0);

-- 3. Create indexes for high-performance task flow and scoping
CREATE INDEX IF NOT EXISTS idx_tasks_progress ON tasks(progress);
CREATE INDEX IF NOT EXISTS idx_tasks_stage_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_org ON tasks(organization_id, assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_org ON tasks(organization_id, client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_org ON tasks(organization_id, project_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_created ON task_comments(task_id, created_at DESC);
