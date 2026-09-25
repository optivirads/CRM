-- Migration 035: Force-password-change flag + OTP hashing support

-- 1. Add force_password_change flag to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add otp_hash column to user_security_otps for hashed storage
ALTER TABLE user_security_otps
  ADD COLUMN IF NOT EXISTS otp_hash TEXT;

-- 3. Index for fast OTP lookup by hash
CREATE INDEX IF NOT EXISTS idx_user_security_otps_hash
  ON user_security_otps (user_id, action, otp_hash)
  WHERE verified_at IS NULL;
