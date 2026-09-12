/**
 * OptiVir CRM - Credential Vault & Delegation Architecture Definitions
 * 
 * Policy:
 * 1. Delegation-First Policy: Platforms supporting Partner/Manager Access (Meta Business Manager,
 *    Google Ads MCC, Shopify Collaborator) use delegated partner IDs with zero raw credential exposure.
 * 2. Fallback Storage Notice: Server-side KMS envelope encryption (AES-256-GCM) is currently under
 *    development. To protect sensitive credentials, client-side secret storage is disabled in preview.
 */

export interface EncryptedVaultRecord {
  id: string;
  clientId: string;
  platform: string;
  identifier: string; // Username, email, or account ID
  ciphertext?: string;
  iv?: string;
  authTag?: string;
  accessLevel: 'Admin' | 'Standard' | 'Read-Only';
  notes?: string;
  keyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformDelegationAsset {
  id: string;
  clientId: string;
  platform: 'Meta Business Manager' | 'Google Ads (MCC)' | 'Shopify Collaborator' | 'TikTok Business Center';
  partnerId: string;
  clientAccountId: string;
  status: 'Active' | 'Pending Request' | 'Review Required';
  permissions: string[];
  lastVerifiedAt: string;
  delegationDocUrl?: string;
}

export interface VaultAuditLog {
  id: string;
  assetId: string;
  action: 'VIEW' | 'COPY_CLIPBOARD' | 'ROTATE' | 'DELEGATION_VERIFIED' | 'REVOKED';
  operatorEmail: string;
  operatorRole: string;
  ipAddress: string;
  timestamp: string;
}

// Platforms where Partner Delegation MUST be preferred over raw password storage
export const DELEGATION_FIRST_PLATFORMS = [
  'meta_business_manager',
  'google_ads_mcc',
  'shopify_collaborator',
  'tiktok_business_center'
];

export function isDelegatedPlatform(platformKey: string): boolean {
  return DELEGATION_FIRST_PLATFORMS.includes(platformKey.toLowerCase());
}

/**
 * Returns the current vault integration status.
 * Vault backend KMS integration is pending; direct password storage is disabled.
 */
export function verifyKeyIsolation(): {
  isSecure: boolean;
  kmsProvider: string;
  algorithm: string;
  keyStatus: string;
} {
  return {
    isSecure: false,
    kmsProvider: 'Pending Backend KMS / Secrets Manager Integration',
    algorithm: 'Planned: Server-Side AES-256-GCM',
    keyStatus: 'Disabled (Delegation-First Active)'
  };
}

/**
 * Creates a local audit trail event (backend audit logging handles production events)
 */
export function createVaultAuditEntry(
  assetId: string,
  action: VaultAuditLog['action'],
  operatorEmail: string,
  operatorRole: string
): VaultAuditLog {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    assetId,
    action,
    operatorEmail,
    operatorRole,
    ipAddress: 'client-audit-session',
    timestamp: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };
}
