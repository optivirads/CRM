-- 022_creatives_and_proofing.sql
-- Enterprise Creative Approval & Client Proofing Pipeline with Cloudflare R2

-- 1. Creatives Master Table
CREATE TABLE IF NOT EXISTS creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_name VARCHAR(255),
    target_platform VARCHAR(50) DEFAULT 'ALL', -- 'META', 'GOOGLE_ADS', 'TIKTOK', 'LINKEDIN', 'YOUTUBE', 'ALL'
    ad_format VARCHAR(50) DEFAULT 'IMAGE', -- 'IMAGE', 'VIDEO', 'CAROUSEL', 'COPY_ONLY', 'BANNER', 'DOCUMENT'
    aspect_ratio VARCHAR(30) DEFAULT '1:1', -- '1:1', '9:16', '16:9', '4:5', '1.91:1'
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'INTERNAL_REVIEW', 'PENDING_CLIENT_APPROVAL', 'CHANGES_REQUESTED', 'APPROVED', 'DEPLOYMENT_READY', 'LIVE', 'ARCHIVED'
    active_proof_id UUID,
    primary_ad_copy TEXT,
    headline TEXT,
    call_to_action VARCHAR(100),
    destination_url TEXT,
    designer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approval_due_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Creative Proofs (Immutable Version Snapshots)
CREATE TABLE IF NOT EXISTS creative_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    creative_id UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    parent_proof_id UUID REFERENCES creative_proofs(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    change_summary TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    is_immutable BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_creative_proof_version UNIQUE (creative_id, version_number)
);

-- Foreign key for active_proof_id on creatives
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_creatives_active_proof'
    ) THEN
        ALTER TABLE creatives
        ADD CONSTRAINT fk_creatives_active_proof
        FOREIGN KEY (active_proof_id) REFERENCES creative_proofs(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Creative Proof Assets (Individual Slides, Images, Videos, Master Files)
CREATE TABLE IF NOT EXISTS creative_proof_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    proof_id UUID NOT NULL REFERENCES creative_proofs(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- 'IMAGE', 'VIDEO', 'CAROUSEL_SLIDE', 'THUMBNAIL', 'DOCUMENT', 'SOURCE_FILE', 'COPY'
    slide_order INT DEFAULT 1,
    storage_key VARCHAR(512) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) NOT NULL,
    width_px INT,
    height_px INT,
    duration_seconds NUMERIC(10, 2),
    video_codec VARCHAR(50),
    thumbnail_storage_key VARCHAR(512),
    preview_storage_key VARCHAR(512),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Creative Comments & Spatial/Video Pin Annotations
CREATE TABLE IF NOT EXISTS creative_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    proof_id UUID NOT NULL REFERENCES creative_proofs(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES creative_proof_assets(id) ON DELETE CASCADE,
    author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255),
    is_client_comment BOOLEAN NOT NULL DEFAULT FALSE,
    content TEXT NOT NULL,
    pin_x_percent NUMERIC(6, 3), -- 0.000 to 100.000 (%)
    pin_y_percent NUMERIC(6, 3), -- 0.000 to 100.000 (%)
    timestamp_start_seconds NUMERIC(10, 2),
    timestamp_end_seconds NUMERIC(10, 2),
    parent_comment_id UUID REFERENCES creative_comments(id) ON DELETE CASCADE,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Creative Formal Approvals & Client Sign-offs
CREATE TABLE IF NOT EXISTS creative_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    creative_id UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
    proof_id UUID NOT NULL REFERENCES creative_proofs(id) ON DELETE CASCADE,
    client_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    approver_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    decision VARCHAR(50) NOT NULL, -- 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED'
    feedback_notes TEXT,
    approver_name VARCHAR(255) NOT NULL,
    approver_email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Creative Share Links (Cryptographically Hashed Client Access)
CREATE TABLE IF NOT EXISTS creative_share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    creative_id UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
    proof_id UUID NOT NULL REFERENCES creative_proofs(id) ON DELETE CASCADE,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INT NOT NULL DEFAULT 0,
    allow_comments BOOLEAN NOT NULL DEFAULT TRUE,
    allow_approvals BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Creative Audit Logs
CREATE TABLE IF NOT EXISTS creative_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    creative_id UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
    proof_id UUID REFERENCES creative_proofs(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'CREATED', 'PROOF_UPLOADED', 'SUBMITTED_FOR_REVIEW', 'SHARE_LINK_GENERATED', 'COMMENT_ADDED', 'COMMENT_RESOLVED', 'APPROVED', 'CHANGES_REQUESTED', 'DEPLOYMENT_READY', 'REVOKED'
    actor_type VARCHAR(30) NOT NULL, -- 'INTERNAL_USER', 'CLIENT', 'SYSTEM'
    actor_id UUID,
    actor_name VARCHAR(255),
    actor_email VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. High-Performance Workflow Indexes
CREATE INDEX IF NOT EXISTS idx_creatives_org_client ON creatives(organization_id, client_id);
CREATE INDEX IF NOT EXISTS idx_creatives_org_status ON creatives(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_creatives_designer ON creatives(designer_id);
CREATE INDEX IF NOT EXISTS idx_creative_proofs_creative ON creative_proofs(creative_id);
CREATE INDEX IF NOT EXISTS idx_creative_proof_assets_proof ON creative_proof_assets(proof_id);
CREATE INDEX IF NOT EXISTS idx_creative_comments_proof ON creative_comments(proof_id);
CREATE INDEX IF NOT EXISTS idx_creative_comments_asset ON creative_comments(asset_id);
CREATE INDEX IF NOT EXISTS idx_creative_approvals_creative ON creative_approvals(creative_id);
CREATE INDEX IF NOT EXISTS idx_creative_approvals_proof ON creative_approvals(proof_id);
CREATE INDEX IF NOT EXISTS idx_creative_share_links_token ON creative_share_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_creative_audit_logs_creative ON creative_audit_logs(creative_id);
