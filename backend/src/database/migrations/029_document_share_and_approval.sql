-- ============================================================================
-- Migration 029: Document Share Links, OTP Verification & Client Approval
-- Mirrors the creative proofing OTP system for proposals, agreements,
-- quotations, and invoices.
-- ============================================================================

-- 1. Document Share Links (Cryptographically Hashed Client Access)
CREATE TABLE IF NOT EXISTS document_share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('proposal', 'agreement', 'quotation', 'invoice')),
    document_id UUID NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    require_otp BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_share_links_token ON document_share_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_document_share_links_org ON document_share_links(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_share_links_doc ON document_share_links(document_type, document_id);

-- 2. Document OTP Verification Records
CREATE TABLE IF NOT EXISTS document_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_link_id UUID NOT NULL REFERENCES document_share_links(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_otps_link_email ON document_otps(share_link_id, email);
CREATE INDEX IF NOT EXISTS idx_document_otps_expires ON document_otps(expires_at);

-- 3. Document Client Approval Records
CREATE TABLE IF NOT EXISTS document_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('proposal', 'agreement', 'quotation', 'invoice')),
    document_id UUID NOT NULL,
    share_link_id UUID REFERENCES document_share_links(id) ON DELETE SET NULL,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('APPROVED', 'CHANGES_REQUESTED', 'REJECTED')),
    approver_name VARCHAR(255) NOT NULL,
    approver_email VARCHAR(255) NOT NULL,
    feedback_notes TEXT,
    ip_address VARCHAR(100),
    user_agent TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_approvals_doc ON document_approvals(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_document_approvals_org ON document_approvals(organization_id);

-- 4. Extend proposals table with client approval tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'proposals' AND column_name = 'client_approved_at'
    ) THEN
        ALTER TABLE proposals ADD COLUMN client_approved_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'proposals' AND column_name = 'client_approved_by_email'
    ) THEN
        ALTER TABLE proposals ADD COLUMN client_approved_by_email VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'proposals' AND column_name = 'client_approval_decision'
    ) THEN
        ALTER TABLE proposals ADD COLUMN client_approval_decision VARCHAR(50);
    END IF;
END $$;

-- 5. Extend notifications check constraint to allow document approval notifications
DO $$
BEGIN
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
        (type)::text = ANY (ARRAY[
            'task_assigned', 'task_overdue', 'lead_new', 'lead_followup', 'deal_stage',
            'proposal_viewed', 'invoice_overdue', 'payment_received', 'renewal_approaching',
            'system', 'creative_comment', 'creative_approved', 'creative_changes_requested',
            'CREATIVE_COMMENT', 'CREATIVE_APPROVED', 'CREATIVE_CHANGES_REQUESTED',
            'document_approved', 'document_changes_requested', 'document_rejected',
            'DOCUMENT_APPROVED', 'DOCUMENT_CHANGES_REQUESTED', 'DOCUMENT_REJECTED'
        ]::text[])
    );
END $$;
