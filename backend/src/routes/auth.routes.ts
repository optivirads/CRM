import { Router, Response } from 'express';
import { db } from '../config/db';
import { verifyPassword } from '../utils/auth';
import { generateToken, requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Login
router.post('/login', async (req, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  try {
    const userRes = await db.query(`
      SELECT 
        u.id, u.email, u.password_hash, u.first_name, u.last_name, u.status,
        ou.organization_id, ou.designation, ou.is_owner, ou.allowed_tabs,
        r.name as role_name, r.slug as role_slug,
        o.name as organization_name, o.slug as organization_slug, o.currency
      FROM users u
      JOIN organization_users ou ON u.id = ou.user_id
      JOIN organizations o ON ou.organization_id = o.id
      LEFT JOIN roles r ON ou.role_id = r.id
      WHERE LOWER(u.email) = LOWER($1) AND u.deleted_at IS NULL
      LIMIT 1;
    `, [email.trim()]);

    if (userRes.rows.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const row = userRes.rows[0];

    if (row.status !== 'active') {
      res.status(403).json({ success: false, message: 'Account is suspended or inactive. Please contact administrator.' });
      return;
    }

    const isMatch = verifyPassword(password, row.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isSuper = row.is_owner || row.role_slug === 'super_admin' || row.email?.toLowerCase() === 'optivirads@gmail.com';
    const effectiveTabs: string[] = isSuper ? ['*'] : (row.allowed_tabs && row.allowed_tabs.length > 0 ? row.allowed_tabs : ['dashboard']);

    const userPayload = {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      organizationId: row.organization_id,
      role: row.role_slug || 'admin',
      isOwner: row.is_owner
    };

    const token = generateToken(userPayload);

    // Update last_login_at
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [row.id]);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: row.id,
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          designation: row.designation,
          role: row.role_slug || 'admin',
          roleName: row.role_name || 'Admin',
          isOwner: row.is_owner,
          allowed_tabs: effectiveTabs
        },
        organization: {
          id: row.organization_id,
          name: row.organization_name,
          slug: row.organization_slug,
          currency: row.currency
        }
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during authentication' });
  }
});

// Current User profile
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userRes = await db.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.avatar_url,
        ou.organization_id, ou.designation, ou.is_owner, ou.allowed_tabs,
        r.name as role_name, r.slug as role_slug,
        o.name as organization_name, o.currency, o.timezone
      FROM users u
      JOIN organization_users ou ON u.id = ou.user_id
      JOIN organizations o ON ou.organization_id = o.id
      LEFT JOIN roles r ON ou.role_id = r.id
      WHERE u.id = $1 AND ou.organization_id = $2;
    `, [req.user!.id, req.user!.organizationId]);

    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User profile not found' });
      return;
    }

    const row = userRes.rows[0];
    const isSuper = row.is_owner || row.role_slug === 'super_admin' || row.email?.toLowerCase() === 'optivirads@gmail.com';
    const effectiveTabs: string[] = isSuper ? ['*'] : (row.allowed_tabs && row.allowed_tabs.length > 0 ? row.allowed_tabs : ['dashboard']);

    res.json({ 
      success: true, 
      data: {
        ...row,
        allowed_tabs: effectiveTabs
      } 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Self-service password change
router.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: 'Current password and new password are required' });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    return;
  }

  try {
    const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1 AND deleted_at IS NULL;', [userId]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { password_hash } = userRes.rows[0];
    const isMatch = verifyPassword(currentPassword, password_hash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password' });
      return;
    }

    const { hashPassword } = await import('../utils/auth');
    const newHash = hashPassword(newPassword);

    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;', [newHash, userId]);

    res.json({ success: true, message: 'Password has been changed successfully!' });
  } catch (err: any) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Failed to change password: ' + err.message });
  }
});

export default router;
