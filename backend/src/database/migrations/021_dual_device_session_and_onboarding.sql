-- ============================================================================
-- Migration 021: Dual-Device Session Concurrency (1 Mobile + 1 Desktop) & Onboarding Scoping
-- ============================================================================

-- 1. Add dual-device session and telemetry columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_desktop_session_id VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS desktop_device_info JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS active_mobile_session_id VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS mobile_device_info JSONB DEFAULT NULL;

-- 2. Indexes for fast auth verification
CREATE INDEX IF NOT EXISTS idx_users_desktop_session ON users(active_desktop_session_id);
CREATE INDEX IF NOT EXISTS idx_users_mobile_session ON users(active_mobile_session_id);

-- 3. Backfill existing active sessions into desktop/mobile slots based on existing device info
UPDATE users
SET 
  active_desktop_session_id = CASE 
    WHEN current_device_info->>'deviceType' = 'mobile' OR current_device_info->>'deviceType' = 'tablet' THEN NULL
    ELSE active_session_id
  END,
  desktop_device_info = CASE 
    WHEN current_device_info->>'deviceType' = 'mobile' OR current_device_info->>'deviceType' = 'tablet' THEN NULL
    ELSE current_device_info
  END,
  active_mobile_session_id = CASE 
    WHEN current_device_info->>'deviceType' = 'mobile' OR current_device_info->>'deviceType' = 'tablet' THEN active_session_id
    ELSE NULL
  END,
  mobile_device_info = CASE 
    WHEN current_device_info->>'deviceType' = 'mobile' OR current_device_info->>'deviceType' = 'tablet' THEN current_device_info
    ELSE NULL
  END
WHERE active_session_id IS NOT NULL AND active_desktop_session_id IS NULL AND active_mobile_session_id IS NULL;

-- 4. Add dynamic asset scope column to clients table
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS asset_scope JSONB DEFAULT '["meta", "creative"]',
  ADD COLUMN IF NOT EXISTS onboarding_stage VARCHAR(100) DEFAULT 'proposal_approved',
  ADD COLUMN IF NOT EXISTS onboarding_notes TEXT DEFAULT NULL;
