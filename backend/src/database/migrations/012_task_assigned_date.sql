-- ============================================================================
-- Migration 012: Add assigned_date to Tasks Table
-- ============================================================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_date DATE DEFAULT CURRENT_DATE;

-- Backfill assigned_date for existing records from start_date or created_at
UPDATE tasks
SET assigned_date = COALESCE(start_date, created_at::DATE, CURRENT_DATE)
WHERE assigned_date IS NULL;

-- Add index for fast date-range filtering
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_date ON tasks(assigned_date);
