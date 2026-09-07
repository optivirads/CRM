-- ============================================================================
-- Migration 010: Custom Fields, Audit Logs & Row Level Security (RLS)
-- ============================================================================

-- 41. Custom Field Definitions
CREATE TABLE IF NOT EXISTS custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'lead', 'company', 'contact', 'deal', 'client', 'project', 'task'
    name VARCHAR(100) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN (
        'text', 'number', 'date', 'dropdown', 'multi_select', 'boolean', 'currency', 'url'
    )),
    options JSONB DEFAULT '[]'::jsonb, -- for dropdowns / multi_select
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, entity_type, field_key)
);

CREATE INDEX IF NOT EXISTS idx_cf_defs_org ON custom_field_definitions(organization_id, entity_type);

-- 42. Immutable Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'PAYMENT_RECORDED', etc.
    entity VARCHAR(100) NOT NULL, -- 'leads', 'deals', 'clients', 'invoices', 'projects', 'proposals'
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ============================================================================
-- Enable Row Level Security (RLS) on Tenant Tables
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user belongs to organization
CREATE OR REPLACE FUNCTION current_user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- If using Supabase auth.uid()
    IF auth.uid() IS NOT NULL THEN
        RETURN EXISTS (
            SELECT 1 FROM organization_users
            WHERE organization_id = org_id AND user_id = auth.uid()
        );
    END IF;
    -- Fallback for backend session context if set
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
