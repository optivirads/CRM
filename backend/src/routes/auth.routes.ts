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
        ou.organization_id, ou.designation, ou.is_owner,
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
          isOwner: row.is_owner
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
        ou.organization_id, ou.designation, ou.is_owner,
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

    res.json({ success: true, data: userRes.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
