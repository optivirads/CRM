-- ============================================================================
-- Migration 005: Client Management, Client 360 & Onboarding
-- ============================================================================

-- 22. Clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    account_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contract_value NUMERIC(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    billing_frequency VARCHAR(50) DEFAULT 'monthly' CHECK (billing_frequency IN ('monthly', 'quarterly', 'annually', 'one_off')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    renewal_date DATE,
    health_status VARCHAR(50) DEFAULT 'Healthy' CHECK (health_status IN ('Healthy', 'Attention Needed', 'At Risk')),
    health_score INTEGER DEFAULT 85 CHECK (health_score >= 0 AND health_score <= 100),
    status VARCHAR(50) DEFAULT 'Onboarding' CHECK (status IN ('Onboarding', 'Active', 'At Risk', 'Notice Period', 'Churned', 'Completed')),
    onboarding_progress INTEGER DEFAULT 0 CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON clients(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_health ON clients(health_status);
CREATE INDEX IF NOT EXISTS idx_clients_renewal ON clients(renewal_date);

DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

-- 23. Client Subscribed Services
CREATE TABLE IF NOT EXISTS client_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    monthly_fee NUMERIC(15, 2) DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_services_client ON client_services(client_id);

-- 24. Client Onboarding Checklists
CREATE TABLE IF NOT EXISTS client_onboarding_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general', -- 'contract', 'access', 'marketing', 'assets'
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_client ON client_onboarding_checklists(client_id);
