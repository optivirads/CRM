-- Migration 028: Creatives Task Linking and Client Multiple Emails Support

-- 1. Add task_id column to creatives table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'creatives' AND column_name = 'task_id'
    ) THEN
        ALTER TABLE creatives ADD COLUMN task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_creatives_task ON creatives(task_id);
    END IF;
END $$;

-- 2. Add additional_emails column to clients table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'additional_emails'
    ) THEN
        ALTER TABLE clients ADD COLUMN additional_emails TEXT[] DEFAULT '{}'::text[];
    END IF;
END $$;

-- 3. Ensure tasks table has client_id and project_id indexes
CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
