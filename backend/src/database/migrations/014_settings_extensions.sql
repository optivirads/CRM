-- ============================================================================
-- Migration 014: Settings System Extensions & Customization Persistence
-- ============================================================================

-- 1. System Tags Taxonomy Table
CREATE TABLE IF NOT EXISTS system_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(150) DEFAULT 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_system_tags_org ON system_tags(organization_id);

-- 2. Document & Contract Templates Table
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'Legal Contract', 'Operations Scope', 'Sales Quotation', 'Financial Ledger'
    version VARCHAR(50) DEFAULT 'v1.0',
    sac_code VARCHAR(50) DEFAULT '998361',
    standard_terms TEXT,
    content TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_templates_org ON document_templates(organization_id);

-- 3. Extend Users table with user preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- 4. Extend Pipeline Stages with SLA days
ALTER TABLE pipeline_stages ADD COLUMN IF NOT EXISTS sla_days INTEGER DEFAULT 0;

-- 5. Extend Teams with performance target & metadata
ALTER TABLE teams ADD COLUMN IF NOT EXISTS target VARCHAR(100);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 6. Audit logs optimization index
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(organization_id, created_at DESC);

-- 7. Enable RLS on new tables
ALTER TABLE system_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- 8. Seed default settings, tags, and document templates for existing organizations
DO $$
DECLARE
    org_rec RECORD;
    admin_user_id UUID;
BEGIN
    FOR org_rec IN SELECT id FROM organizations LOOP
        -- Seed default tags if none exist
        IF NOT EXISTS (SELECT 1 FROM system_tags WHERE organization_id = org_rec.id) THEN
            INSERT INTO system_tags (organization_id, name, color, usage_count)
            VALUES
                (org_rec.id, '#Tier1Enterprise', 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200', 18),
                (org_rec.id, '#HighIntent', 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200', 24),
                (org_rec.id, '#D2CBrand', 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200', 31),
                (org_rec.id, '#ShopifyPlus', 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200', 14),
                (org_rec.id, '#Q4BudgetSpender', 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200', 12),
                (org_rec.id, '#ChurnRisk', 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200', 3)
            ON CONFLICT (organization_id, name) DO NOTHING;
        END IF;

        -- Seed default document templates if none exist
        IF NOT EXISTS (SELECT 1 FROM document_templates WHERE organization_id = org_rec.id) THEN
            INSERT INTO document_templates (organization_id, name, type, version, standard_terms, sac_code, content)
            VALUES
                (org_rec.id, 'Master Services Agreement (MSA)', 'Legal Contract', 'v3.2', 'Net 30, IP Assigned Upon Payment', '998361', '# MASTER SERVICES AGREEMENT\n\nThis Agreement is entered into between OptiVir Technologies and Client.'),
                (org_rec.id, 'Statement of Work (SOW) Standard', 'Operations Scope', 'v4.0', 'Sprint-based deliverables', '998361', '# STATEMENT OF WORK\n\nSprint deliverables, milestones, and acceptance criteria.'),
                (org_rec.id, 'Commercial Proposal (Hybrid 3-Col)', 'Sales Quotation', 'v2.8', '14-Day validity', '998361', '# COMMERCIAL PROPOSAL\n\n3-Tier growth packages for performance marketing and brand development.'),
                (org_rec.id, 'GST Tax Invoice (CBIC Rule 46)', 'Financial Ledger', 'v1.5', '18% GST (CGST/SGST/IGST)', '998361', '# TAX INVOICE\n\nCompliant with CBIC Rule 46 for Information Technology & Advertising Services (SAC 998361).')
            ON CONFLICT DO NOTHING;
        END IF;

        -- Update organization settings with rich initial corporate and regional defaults if empty
        UPDATE organizations
        SET settings = jsonb_build_object(
            'brand_name', COALESCE(settings->>'brand_name', 'OptiVir Technologies'),
            'legal_name', COALESCE(settings->>'legal_name', name),
            'tax_gstin', COALESCE(settings->>'tax_gstin', '27AABCO1234F1Z5'),
            'tax_pan', COALESCE(settings->>'tax_pan', 'AABCO1234F'),
            'domain_website', COALESCE(settings->>'domain_website', 'https://www.optivirads.com'),
            'industry', COALESCE(settings->>'industry', 'Performance Marketing & Advertising Agency'),
            'support_email', COALESCE(settings->>'support_email', 'optivirads@gmail.com'),
            'switchboard_phone', COALESCE(settings->>'switchboard_phone', '+919995037109'),
            'date_format', COALESCE(settings->>'date_format', 'DD/MM/YYYY (24-Hour: 14:32)'),
            'fiscal_year', COALESCE(settings->>'fiscal_year', 'April 1st (Indian / UK Standard)'),
            'auto_shift_adjustment', COALESCE((settings->>'auto_shift_adjustment')::boolean, true),
            'billing', jsonb_build_object(
                'gstin', COALESCE(settings->'billing'->>'gstin', '27AABCO1234F1Z5'),
                'pan', COALESCE(settings->'billing'->>'pan', 'AABCO1234F'),
                'state_code', COALESCE(settings->'billing'->>'state_code', '27 - Maharashtra'),
                'bank_name', COALESCE(settings->'billing'->>'bank_name', 'HDFC Bank Ltd.'),
                'account_no', COALESCE(settings->'billing'->>'account_no', '50200088991234'),
                'ifsc', COALESCE(settings->'billing'->>'ifsc', 'HDFC0000240'),
                'invoice_prefix', COALESCE(settings->'billing'->>'invoice_prefix', 'INV-2026-')
            ),
            'security', jsonb_build_object(
                'two_factor_enforced', COALESCE((settings->'security'->>'two_factor_enforced')::boolean, true),
                'session_timeout', COALESCE(settings->'security'->>'session_timeout', '30m'),
                'failed_lockout_limit', COALESCE(settings->'security'->>'failed_lockout_limit', '5'),
                'ip_whitelist', COALESCE(settings->'security'->'ip_whitelist', '["192.168.1.0/24", "103.21.244.0/24", "49.36.128.19"]'::jsonb)
            )
        ) || settings
        WHERE id = org_rec.id;

        -- Update SLA days on stages if 0
        UPDATE pipeline_stages SET sla_days = 3 WHERE name ILIKE '%Discovery%' AND sla_days = 0;
        UPDATE pipeline_stages SET sla_days = 5 WHERE name ILIKE '%Scope%' AND sla_days = 0;
        UPDATE pipeline_stages SET sla_days = 4 WHERE name ILIKE '%Proposal%' AND sla_days = 0;
        UPDATE pipeline_stages SET sla_days = 7 WHERE name ILIKE '%Negotiation%' OR name ILIKE '%Review%' AND sla_days = 0;

        -- Seed initial teams if none exist
        IF NOT EXISTS (SELECT 1 FROM teams WHERE organization_id = org_rec.id) THEN
            SELECT id INTO admin_user_id FROM users WHERE email = 'sales@optivir.com' OR email = 'admin@optivir.com' LIMIT 1;
            INSERT INTO teams (organization_id, name, description, leader_id, target, metadata)
            VALUES
                (org_rec.id, 'Performance Growth Pod', 'Meta & Google Ads high-velocity scaling squad', admin_user_id, '₹18,50,000/mo', '{"color": "border-blue-500/40 bg-blue-500/5"}'::jsonb),
                (org_rec.id, 'Media Buying & Ad Ops Pod', 'Campaign optimization, tracking pixels & bid cap telemetry', admin_user_id, '₹45,00,000 Ad Spend', '{"color": "border-purple-500/40 bg-purple-500/5"}'::jsonb),
                (org_rec.id, 'Creative Production Sprint Pod', 'Motion design, video hooks & ad creative rapid prototyping', admin_user_id, '32 Deliverables/mo', '{"color": "border-rose-500/40 bg-rose-500/5"}'::jsonb),
                (org_rec.id, 'Enterprise Finance & Billing Pod', 'GST ledger reconciliation, invoicing & receivables recovery', admin_user_id, '100% Tax Ledger SLA', '{"color": "border-emerald-500/40 bg-emerald-500/5"}'::jsonb);
        END IF;

        -- Seed initial custom fields if none exist
        IF NOT EXISTS (SELECT 1 FROM custom_field_definitions WHERE organization_id = org_rec.id) THEN
            INSERT INTO custom_field_definitions (organization_id, entity_type, name, field_key, field_type, is_required)
            VALUES
                (org_rec.id, 'lead', 'Monthly Media Spend Budget', 'monthly_ad_spend', 'currency', true),
                (org_rec.id, 'lead', 'Primary Ad Network Intent', 'primary_ad_network', 'dropdown', true),
                (org_rec.id, 'deal', 'Expected Decision Date', 'expected_close_date', 'date', true),
                (org_rec.id, 'company', 'Client CBIC GSTIN', 'client_gstin', 'text', true),
                (org_rec.id, 'client', 'Shopify Store Admin Domain', 'shopify_domain', 'url', false),
                (org_rec.id, 'client', 'Meta Business Manager Partner ID', 'meta_partner_id', 'text', false)
            ON CONFLICT (organization_id, entity_type, field_key) DO NOTHING;
        END IF;
    END LOOP;
END $$;
