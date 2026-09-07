import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthenticatedUser } from '../types';
import { db } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'optivir_crm_secret';

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (req.user.isOwner || req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions for this operation' });
      return;
    }

    next();
  };
}

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
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || null;
    const ua = req?.headers?.['user-agent'] || null;
    await db.query(`
      INSERT INTO audit_logs (organization_id, user_id, action, entity, entity_id, old_values, new_values, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `, [orgId, userId || null, action, entity, entityId, oldValues ? JSON.stringify(oldValues) : null, newValues ? JSON.stringify(newValues) : null, ip, ua]);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
