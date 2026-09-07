-- ============================================================================
-- Migration 008: Marketing Intelligence & Campaign Performance
-- ============================================================================

-- 34. Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL CHECK (platform IN (
        'Meta', 'Google Ads', 'LinkedIn', 'TikTok', 'YouTube', 'SEO / Organic', 'Email Marketing', 'Influencer', 'Other'
    )),
    campaign_type VARCHAR(50) DEFAULT 'paid' CHECK (campaign_type IN ('paid', 'organic')),
    objective VARCHAR(150), -- 'Lead Gen', 'Sales / ROAS', 'Brand Awareness', 'Traffic'
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed', 'Archived')),
    budget NUMERIC(15, 2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;
CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

-- 35. Campaign Metrics (Daily / Periodic rollups)
CREATE TABLE IF NOT EXISTS campaign_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    spend NUMERIC(15, 2) DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    reach BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    leads INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue NUMERIC(15, 2) DEFAULT 0,
    roas NUMERIC(8, 2) GENERATED ALWAYS AS (CASE WHEN spend > 0 THEN revenue / spend ELSE 0 END) STORED,
    ctr NUMERIC(6, 4) GENERATED ALWAYS AS (CASE WHEN impressions > 0 THEN clicks::NUMERIC / impressions ELSE 0 END) STORED,
    cpc NUMERIC(10, 2) GENERATED ALWAYS AS (CASE WHEN clicks > 0 THEN spend / clicks ELSE 0 END) STORED,
    cpl NUMERIC(10, 2) GENERATED ALWAYS AS (CASE WHEN leads > 0 THEN spend / leads ELSE 0 END) STORED,
    cpa NUMERIC(10, 2) GENERATED ALWAYS AS (CASE WHEN conversions > 0 THEN spend / conversions ELSE 0 END) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, date)
);

CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date ON campaign_metrics(date);

-- 36. Organic Performance Logs
CREATE TABLE IF NOT EXISTS organic_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    channel VARCHAR(100) NOT NULL, -- 'SEO', 'Instagram', 'LinkedIn', 'YouTube'
    date DATE NOT NULL,
    organic_spend NUMERIC(15, 2) DEFAULT 0, -- Agency retainer allocation or content production cost
    organic_traffic BIGINT DEFAULT 0,
    organic_leads INTEGER DEFAULT 0,
    engagement_rate NUMERIC(6, 3) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, channel, date)
);

CREATE INDEX IF NOT EXISTS idx_organic_perf_client ON organic_performance(client_id);
