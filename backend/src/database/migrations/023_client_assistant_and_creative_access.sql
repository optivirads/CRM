-- ============================================================================
-- Migration 023: Client Account Assistant & Scoped Access Optimization
-- ============================================================================

-- 1. Add account_assistant_id to clients table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'account_assistant_id'
    ) THEN
        ALTER TABLE clients
        ADD COLUMN account_assistant_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Create index for fast account assistant lookups
CREATE INDEX IF NOT EXISTS idx_clients_account_assistant ON clients(account_assistant_id);

-- 3. Ensure creatives client_id and project_id have composite index for scoped queries
CREATE INDEX IF NOT EXISTS idx_creatives_client_project ON creatives(client_id, project_id);
