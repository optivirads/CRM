-- Migration 011: Organization Integrations Hub
CREATE TABLE IF NOT EXISTS organization_integrations (
    id VARCHAR(100) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    connected BOOLEAN DEFAULT false,
    status_text VARCHAR(255) DEFAULT 'Not Connected',
    config JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_synced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (organization_id, id)
);

CREATE INDEX IF NOT EXISTS idx_org_integrations_org ON organization_integrations(organization_id);
