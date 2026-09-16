-- ============================================================================
-- Migration 018: Role Expansion, Client Assignment & User Membership Sync
-- ============================================================================

-- 1. Add client_id to organization_users for single-client assignment
ALTER TABLE organization_users 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_organization_users_client_id ON organization_users(client_id);

-- 2. Ensure new roles exist in roles table for all organizations
DO $$
DECLARE
    org_record RECORD;
BEGIN
    FOR org_record IN SELECT id FROM organizations LOOP
        -- COO
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES (org_record.id, 'Chief Operating Officer (COO)', 'coo', 'Operational management across all modules excluding master billing and security architecture', true)
        ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

        -- Marketing Lead
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES (org_record.id, 'Marketing Lead', 'marketing_lead', 'Campaigns, performance ad spend, conversion telemetry, and brand growth', false)
        ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

        -- Social Media Lead
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES (org_record.id, 'Social Media Lead', 'social_media_lead', 'Social channels, post insights, creative deliverables, and engagement metrics', false)
        ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

        -- Media & Ads Lead
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES (org_record.id, 'Media & Ads Lead', 'media_buyer', 'Ad network campaign management, ROAS optimization, and budget allocation', false)
        ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

        -- Sales Lead
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES (org_record.id, 'Sales Lead', 'sales_lead', 'Prospect qualification, deal pipeline velocity, and commercial proposals', false)
        ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

        -- Client Account Manager
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES (org_record.id, 'Client Account Manager', 'account_manager', 'Client relationships, onboarding SLAs, sprint delivery, and retention', false)
        ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

        -- Finance & Billing Lead
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES (org_record.id, 'Finance & Billing Lead', 'finance_lead', 'Tax invoicing, ledger reconciliation, client payments, and receivables', false)
        ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

        -- Operations Lead
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES (org_record.id, 'Operations & Project Lead', 'operations_lead', 'Agency deliverables, project milestones, team workloads, and task tracking', false)
        ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

        -- Client Portal User
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES (org_record.id, 'Client Representative / Stakeholder', 'client_portal', 'Single-client scoped portal: inspect assigned client deliverables, ROAS, and invoices', false)
        ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
    END LOOP;
END $$;
