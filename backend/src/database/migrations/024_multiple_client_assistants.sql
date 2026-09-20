-- ============================================================================
-- Migration 024: Support Multiple Client Assistants & Extended Creative Access
-- ============================================================================

-- 1. Add account_assistant_ids array to clients table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'account_assistant_ids'
    ) THEN
        ALTER TABLE clients
        ADD COLUMN account_assistant_ids UUID[] DEFAULT '{}';
    END IF;
END $$;

-- 2. Create client_assistants relational junction table
CREATE TABLE IF NOT EXISTS client_assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_description VARCHAR(100) DEFAULT 'Account Assistant',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (client_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_client_assistants_client ON client_assistants(client_id);
CREATE INDEX IF NOT EXISTS idx_client_assistants_user ON client_assistants(user_id);

-- 3. Backfill any existing single account_assistant_id into array & join table
UPDATE clients
SET account_assistant_ids = ARRAY[account_assistant_id]
WHERE account_assistant_id IS NOT NULL AND (account_assistant_ids IS NULL OR cardinality(account_assistant_ids) = 0);

INSERT INTO client_assistants (organization_id, client_id, user_id)
SELECT organization_id, id, account_assistant_id
FROM clients
WHERE account_assistant_id IS NOT NULL
ON CONFLICT (client_id, user_id) DO NOTHING;
