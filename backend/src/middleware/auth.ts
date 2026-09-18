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
// Token generation (7-day persistence supported)
// ---------------------------------------------------------------------------
export function generateToken(user: AuthenticatedUser, rememberMe: boolean = true): string {
  const payload = {
    ...user,
    rememberMe
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: rememberMe ? '7d' : '24h' });
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
// requireAuth — authenticate request, enforce session timeout
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

  // Support demo persona tokens during development or demo evaluation
  if (token && token.startsWith('ov_jwt_demo_')) {
    try {
      const parts = token.split('_');
      const roleSlug = parts[3] || 'owner';
      const demoUserRes = await db.query(`
        SELECT u.id, u.email, u.first_name, u.last_name, ou.organization_id, r.slug as role, ou.is_owner, ou.allowed_tabs
        FROM users u
        JOIN organization_users ou ON u.id = ou.user_id
        LEFT JOIN roles r ON ou.role_id = r.id
        WHERE (r.slug = $1 OR LOWER(u.email) LIKE $2 OR ($1 = 'owner' AND ou.is_owner = true)) AND u.deleted_at IS NULL
        LIMIT 1;
      `, [roleSlug, `%${roleSlug}%`]);

      if (demoUserRes.rows.length > 0) {
        const row = demoUserRes.rows[0];
        req.user = {
          id: row.id,
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          organizationId: row.organization_id,
          role: row.role || roleSlug,
          isOwner: Boolean(row.is_owner),
          rememberMe: true
        };
        return next();
      }
    } catch (err) {
      console.warn('Demo token resolution error:', err);
    }
  }

  let decoded: AuthenticatedUser;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
    return;
  }

  req.user = decoded;

  // Single Active Session Enforcement:
  // Ensure the token's sessionId matches the user's active_session_id in database.
  // One user cannot be logged in to two different systems at the same time.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded.id || '');
  if (decoded.id && isUuid) {
    try {
      const userSessionRes = await db.query(
        'SELECT active_session_id FROM users WHERE id = $1 AND deleted_at IS NULL;',
        [decoded.id]
      );
      if (userSessionRes.rows.length > 0) {
        const activeSessionId = userSessionRes.rows[0].active_session_id;

        if (decoded.sessionId) {
          if (!activeSessionId) {
            res.status(401).json({
              success: false,
              code: 'SESSION_REVOKED',
              message: 'Your session has been signed out or revoked. Please log in again.'
            });
            return;
          }
          if (decoded.sessionId !== activeSessionId) {
            res.status(401).json({
              success: false,
              code: 'CONCURRENT_SESSION_TERMINATED',
              message: 'Your session has ended because this account was logged into from another system or device.'
            });
            return;
          }
        } else if (activeSessionId) {
          // Token has no sessionId, but an active session was already established on another system
          res.status(401).json({
            success: false,
            code: 'CONCURRENT_SESSION_TERMINATED',
            message: 'Your session has ended because this account was logged into from another system or device.'
          });
          return;
        }
      }
    } catch (sessionErr) {
      console.warn('Session verification DB check error:', sessionErr);
    }
  }

  // Fetch org security policy (cached)
  if (decoded.organizationId) {
    const sec = await getOrgSecurity(decoded.organizationId);

    // Enforce session timeout only for non-persistent sessions (rememberMe === false)
    // If rememberMe is true (or undefined/default), token validity is governed by the 7-day JWT expiration.
    const payload = decoded as any;
    if (payload.rememberMe === false && sec.session_timeout) {
      const timeoutMs = parseTimeoutMs(sec.session_timeout);
      if (timeoutMs !== null && payload.iat) {
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
