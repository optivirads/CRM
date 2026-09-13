-- Migration 015: User Permissions and Passwords
-- Adds allowed_tabs column to organization_users and initializes permissions for owners

ALTER TABLE organization_users 
ADD COLUMN IF NOT EXISTS allowed_tabs TEXT[] DEFAULT ARRAY['dashboard'];

-- Ensure owners have universal access ('*')
UPDATE organization_users 
SET allowed_tabs = ARRAY['*'] 
WHERE is_owner = true;

-- Ensure super_admin or admin roles have full access if not owner
UPDATE organization_users 
SET allowed_tabs = ARRAY['*'] 
WHERE role_id IN (
    SELECT id FROM roles WHERE slug IN ('super_admin', 'admin')
) AND (allowed_tabs IS NULL OR allowed_tabs = ARRAY['dashboard']);
