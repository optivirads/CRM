import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthenticatedRequest, AuthenticatedUser } from '../types';
import { db } from '../config/db';

dotenv.config();

// ---------------------------------------------------------------------------
// JWT Secret validation at startup
// ---------------------------------------------------------------------------
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'FATAL SECURITY ERROR: JWT_SECRET environment variable must be defined. ' +
      'Generate a strong secret with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"'
    );
  }
  if (secret.length < 32) {
    throw new Error(
      'FATAL SECURITY ERROR: JWT_SECRET is too short (< 32 chars). ' +
      'Use at least 48 random bytes base64-encoded.'
    );
  }
  return secret;
}

const JWT_SECRET = getJwtSecret();

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------
export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

// ---------------------------------------------------------------------------
// Session timeout parser
// ---------------------------------------------------------------------------
function parseTimeoutMs(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/^(\d+)(m|h|d)$/i);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  switch (match[2].toLowerCase()) {
    case 'm': return n * 60 * 1000;
    case 'h': return n * 60 * 60 * 1000;
    case 'd': return n * 24 * 60 * 60 * 1000;
    default:  return null;
  }
}

// ---------------------------------------------------------------------------
// CIDR IP whitelist check
// ---------------------------------------------------------------------------
function ipInCidr(ip: string, cidr: string): boolean {
  try {
    // Handle plain IP (no subnet)
    if (!cidr.includes('/')) {
      return ip === cidr;
    }
    const [range, bits] = cidr.split('/');
    const mask = ~(0xffffffff >>> parseInt(bits, 10));
    const ipParts = ip.split('.').map(Number);
    const rangeParts = range.split('.').map(Number);
    if (ipParts.length !== 4 || rangeParts.length !== 4) return false;
    const ipInt = ((ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]) >>> 0;
    const rangeInt = ((rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3]) >>> 0;
    return (ipInt & mask) === (rangeInt & mask);
  } catch {
    return false;
  }
}

function isIpAllowed(ip: string, whitelist: string[]): boolean {
  if (!whitelist || whitelist.length === 0) return true; // No whitelist = allow all
  for (const cidr of whitelist) {
    if (ipInCidr(ip, cidr.trim())) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Org security settings cache (short TTL to avoid per-request DB hits)
// ---------------------------------------------------------------------------
interface OrgSecuritySettings {
  session_timeout?: string;
  ip_whitelist?: string[];
  failed_lockout_limit?: string;
}
const securityCache = new Map<string, { settings: OrgSecuritySettings; fetchedAt: number }>();
const CACHE_TTL_MS = 60_000; // 1 minute

async function getOrgSecurity(orgId: string): Promise<OrgSecuritySettings> {
  const cached = securityCache.get(orgId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.settings;
  }
  try {
    const { rows } = await db.query(
      'SELECT settings FROM organizations WHERE id = $1;',
      [orgId]
    );
    const settings: OrgSecuritySettings = rows[0]?.settings?.security || {};
    securityCache.set(orgId, { settings, fetchedAt: Date.now() });
    return settings;
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// requireAuth — authenticate request, enforce session timeout + IP whitelist
// ---------------------------------------------------------------------------
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  let decoded: AuthenticatedUser;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
    return;
  }

  req.user = decoded;

  // Fetch org security policy (cached)
  if (decoded.organizationId) {
    const sec = await getOrgSecurity(decoded.organizationId);

    // Enforce session timeout
    const timeoutMs = parseTimeoutMs(sec.session_timeout);
    if (timeoutMs !== null) {
      const payload = decoded as any;
      if (payload.iat) {
        const ageMs = Date.now() - payload.iat * 1000;
        if (ageMs > timeoutMs) {
          res.status(401).json({
            success: false,
            message: 'Session expired. Please log in again.',
            code: 'SESSION_EXPIRED'
          });
          return;
        }
      }
    }

    // Enforce IP whitelist
    if (sec.ip_whitelist && sec.ip_whitelist.length > 0) {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.ip ||
        '';
      if (!isIpAllowed(clientIp, sec.ip_whitelist)) {
        res.status(403).json({
          success: false,
          message: 'Access denied: your IP address is not on the organization whitelist.',
          code: 'IP_BLOCKED'
        });
        return;
      }
    }
  }

  next();
}

// ---------------------------------------------------------------------------
// requireRole — checks req.user.role against an allowed list.
// NOTE: Does NOT auto-grant owners. Owner privilege is separate (use requireOwner).
// ---------------------------------------------------------------------------
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
    });
  };
}

// ---------------------------------------------------------------------------
// requireOwner — checks req.user.isOwner === true.
// Ownership is a separate concept from role: only the org owner can perform
// certain irreversible actions (delete other admins, change billing, etc.)
// ---------------------------------------------------------------------------
export function requireOwner(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  if (!req.user.isOwner) {
    res.status(403).json({
      success: false,
      message: 'This action is restricted to the organization owner.'
    });
    return;
  }
  next();
}

// ---------------------------------------------------------------------------
// requireOwnerOrRole — owner bypass OR specific role (use sparingly)
// ---------------------------------------------------------------------------
export function requireOwnerOrRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    if (req.user.isOwner || allowedRoles.includes(req.user.role)) {
      return next();
    }
    res.status(403).json({
      success: false,
      message: `Insufficient permissions. Requires owner privilege or role: ${allowedRoles.join(', ')}`
    });
  };
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------
export async function recordAuditLog(
  orgId: string,
  userId: string | undefined,
  action: string,
  entity: string,
  entityId: string,
  oldValues: any = null,
  newValues: any = null,
  req?: any
) {
  try {
    const ip = req?.ip || (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() || null;
    const ua = req?.headers?.['user-agent'] || null;
    await db.query(`
      INSERT INTO audit_logs (organization_id, user_id, action, entity, entity_id, old_values, new_values, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `, [
      orgId,
      userId || null,
      action,
      entity,
      entityId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ip,
      ua
    ]);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// Export the security cache invalidator for use after security settings updates
export function invalidateOrgSecurityCache(orgId: string) {
  securityCache.delete(orgId);
}
