-- 033_task_scripting_and_deliverable_type.sql
-- Adds deliverable_type ('VIDEO', 'IMAGE', 'GENERAL'), script_content, and concept_idea to tasks table

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_type VARCHAR(50) DEFAULT 'GENERAL';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS script_content TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS concept_idea TEXT;
