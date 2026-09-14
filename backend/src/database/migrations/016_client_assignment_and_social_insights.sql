-- ============================================================================
-- Migration 016: Client Team Assignment & Social Media Post Insights
-- ============================================================================

-- 1. Ensure assigned_team_ids column on clients table for multi-member or dedicated assignment
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS assigned_team_ids TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS idx_clients_assigned_team_ids ON clients USING GIN (assigned_team_ids);

-- 2. Client Social Media Posts & Insights Table
CREATE TABLE IF NOT EXISTS client_social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('Instagram', 'Meta', 'Facebook', 'LinkedIn', 'YouTube', 'Twitter / X', 'TikTok', 'Pinterest', 'Other')),
    post_url TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    media_type VARCHAR(50) DEFAULT 'Post' CHECK (media_type IN ('Post', 'Reel', 'Video', 'Carousel', 'Story', 'Short', 'Article')),
    caption TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    reach BIGINT DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate NUMERIC(6, 3) DEFAULT 0,
    top_insight TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_social_posts_client ON client_social_posts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_social_posts_org ON client_social_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_social_posts_platform ON client_social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_client_social_posts_published ON client_social_posts(published_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_client_social_posts_updated_at ON client_social_posts;
CREATE TRIGGER trg_client_social_posts_updated_at
    BEFORE UPDATE ON client_social_posts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();
