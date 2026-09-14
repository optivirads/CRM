-- ============================================================================
-- Migration 017: Client Social Media Account Integrations & Auto-Sync Engine
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_social_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    instagram_username VARCHAR(100),
    instagram_account_id VARCHAR(100),
    facebook_page_id VARCHAR(100),
    facebook_access_token TEXT,
    linkedin_page_id VARCHAR(100),
    linkedin_access_token TEXT,
    youtube_channel_id VARCHAR(100),
    youtube_api_key TEXT,
    auto_sync_enabled BOOLEAN DEFAULT true,
    sync_interval_hours INTEGER DEFAULT 6,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50) DEFAULT 'idle',
    sync_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_social_integrations_client ON client_social_integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_social_integrations_org ON client_social_integrations(organization_id);

DROP TRIGGER IF EXISTS trg_client_social_integrations_updated_at ON client_social_integrations;
CREATE TRIGGER trg_client_social_integrations_updated_at
    BEFORE UPDATE ON client_social_integrations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();
