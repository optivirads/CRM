-- ============================================================================
-- Migration 019: Single Active Session Enforcement & Device Tracking
-- ============================================================================

-- Add active session identifier and device telemetry storage to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_session_id VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_device_info JSONB DEFAULT NULL;

-- Index for high-speed active session verification in requireAuth middleware
CREATE INDEX IF NOT EXISTS idx_users_active_session ON users(active_session_id);
CREATE INDEX IF NOT EXISTS idx_users_id_active_session ON users(id, active_session_id);
