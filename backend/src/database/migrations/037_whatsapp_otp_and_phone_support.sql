-- 037_whatsapp_otp_and_phone_support.sql
-- Migration 037: Add recipient phone & WhatsApp OTP delivery channels

-- 1. Add recipient_phone to document_share_links
ALTER TABLE document_share_links
  ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(50);

-- 2. Add recipient_phone to creative_share_links
ALTER TABLE creative_share_links
  ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(50);

-- 3. Add phone and delivery_channel to document_otps
ALTER TABLE document_otps
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS delivery_channel VARCHAR(30) DEFAULT 'email';

-- 4. Add phone and delivery_channel to creative_proof_otps
ALTER TABLE creative_proof_otps
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS delivery_channel VARCHAR(30) DEFAULT 'email';

-- 5. Add index on document_otps for phone lookup
CREATE INDEX IF NOT EXISTS idx_document_otps_phone ON document_otps(phone);
CREATE INDEX IF NOT EXISTS idx_creative_proof_otps_phone ON creative_proof_otps(phone);
