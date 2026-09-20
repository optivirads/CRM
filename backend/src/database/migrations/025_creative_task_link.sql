-- 025_creative_task_link.sql
-- Links creatives to specific project tasks

ALTER TABLE creatives
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_creatives_task ON creatives(task_id);
