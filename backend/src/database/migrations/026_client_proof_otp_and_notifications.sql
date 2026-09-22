-- 026_client_proof_otp_and_notifications.sql
-- Migration 026: Client Proofing Portal OTP Authentication & Team Notifications

-- 1. Extend creative_share_links with OTP requirement and optional recipient binding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creative_share_links' AND column_name = 'recipient_email'
    ) THEN
        ALTER TABLE creative_share_links
        ADD COLUMN recipient_email VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creative_share_links' AND column_name = 'recipient_name'
    ) THEN
        ALTER TABLE creative_share_links
        ADD COLUMN recipient_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'creative_share_links' AND column_name = 'require_otp'
    ) THEN
        ALTER TABLE creative_share_links
        ADD COLUMN require_otp BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
END $$;

-- 2. Client Proof OTP Verification Records
CREATE TABLE IF NOT EXISTS creative_proof_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_link_id UUID NOT NULL REFERENCES creative_share_links(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proof_otps_link_email ON creative_proof_otps(share_link_id, email);
CREATE INDEX IF NOT EXISTS idx_proof_otps_expires ON creative_proof_otps(expires_at);

-- 3. In-App Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'CREATIVE_COMMENT', 'CREATIVE_APPROVED', 'CREATIVE_CHANGES_REQUESTED', 'TASK_ASSIGNED', 'GENERAL'
    entity_type VARCHAR(50) DEFAULT 'creative',
    entity_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(organization_id);

-- 4. Ensure notifications check constraint allows creative proofing notifications
DO $$
BEGIN
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
        (type)::text = ANY (ARRAY[
            'task_assigned', 'task_overdue', 'lead_new', 'lead_followup', 'deal_stage',
            'proposal_viewed', 'invoice_overdue', 'payment_received', 'renewal_approaching',
            'system', 'creative_comment', 'creative_approved', 'creative_changes_requested',
            'CREATIVE_COMMENT', 'CREATIVE_APPROVED', 'CREATIVE_CHANGES_REQUESTED'
        ]::text[])
    );
END $$;
