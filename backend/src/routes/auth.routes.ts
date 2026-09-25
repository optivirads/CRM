import { Router, Response } from 'express';
import { db } from '../config/db';
import { verifyPassword, hashPassword, needsRehash } from '../utils/auth';
import { generateToken, requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { loginRateLimiter, otpRateLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { parseDeviceInfo } from '../utils/device';
import crypto from 'crypto';
import { z } from 'zod';
import { EmailService } from '../services/email.service';

const router = Router();

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email('Valid email address is required').min(1),
  password: z.string().min(1, 'Password is required').max(256),
  rememberMe: z.boolean().optional()
});

// Strong password: min 12 chars (NIST compliant), must have uppercase, lowercase, number, special char
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,256}$/;
const strongPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(256)
  .regex(
    STRONG_PASSWORD_REGEX,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: strongPasswordSchema,
  otp: z.string().regex(/^\d{6}$/, '6-digit numeric OTP verification code is required')
});

// Used for the force-change-password flow (no current password needed)
const forceChangePasswordSchema = z.object({
  newPassword: strongPasswordSchema,
  otp: z.string().regex(/^\d{6}$/, '6-digit numeric OTP verification code is required')
});

// ---------------------------------------------------------------------------
// OTP helpers — store/verify as HMAC-SHA256, never store raw codes
// ---------------------------------------------------------------------------
function hashOtp(otp: string): string {
  const secret = process.env.JWT_SECRET || 'otp-fallback-secret';
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
}

// Default lockout limit if org setting is not configured
const DEFAULT_LOCKOUT_LIMIT = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
router.post(
  '/login',
  loginRateLimiter,
  validateBody(loginSchema),
  async (req, res: Response): Promise<void> => {
    const { email, password, rememberMe } = req.body;
    const isPersistent = rememberMe !== false;

    try {
      const userRes = await db.query(`
        SELECT 
          u.id, u.email, u.password_hash, u.first_name, u.last_name, u.phone, u.avatar_url, u.status,
          u.failed_login_attempts, u.lockout_until, u.force_password_change,
          ou.organization_id, ou.designation, ou.is_owner, ou.allowed_tabs, ou.client_id,
          comp.name as client_name,
          r.name as role_name, r.slug as role_slug,
          o.name as organization_name, o.slug as organization_slug, o.currency,
          o.settings as org_settings
        FROM users u
        JOIN organization_users ou ON u.id = ou.user_id
        JOIN organizations o ON ou.organization_id = o.id
        LEFT JOIN clients c ON ou.client_id = c.id
        LEFT JOIN companies comp ON c.company_id = comp.id
        LEFT JOIN roles r ON ou.role_id = r.id
        WHERE LOWER(u.email) = LOWER($1) AND u.deleted_at IS NULL
        LIMIT 1;
      `, [email.trim()]);

      if (userRes.rows.length === 0) {
        // Return same message to prevent email enumeration
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      const row = userRes.rows[0];

      // Check account lockout (persistent, DB-backed)
      if (row.lockout_until && new Date(row.lockout_until) > new Date()) {
        const remainingMs = new Date(row.lockout_until).getTime() - Date.now();
        const remainingMins = Math.ceil(remainingMs / 60000);
        res.status(423).json({
          success: false,
          message: `Account temporarily locked due to too many failed attempts. Try again in ${remainingMins} minute(s).`,
          code: 'ACCOUNT_LOCKED'
        });
        return;
      }

      if (row.status !== 'active') {
        res.status(403).json({
          success: false,
          message: 'Account is suspended or inactive. Please contact your administrator.'
        });
        return;
      }

      const isMatch = verifyPassword(password, row.password_hash);

      if (!isMatch) {
        // Get org-level lockout limit
        const orgSettings = row.org_settings || {};
        const lockoutLimit = parseInt(orgSettings?.security?.failed_lockout_limit || String(DEFAULT_LOCKOUT_LIMIT), 10);
        const newAttempts = (row.failed_login_attempts || 0) + 1;
        const shouldLock = newAttempts >= lockoutLimit;

        if (shouldLock) {
          // Set lockout — use parameterized interval to avoid SQL injection risk
          await db.query(
            `UPDATE users
             SET failed_login_attempts = $1, lockout_until = NOW() + ($3 * INTERVAL '1 minute')
             WHERE id = $2;`,
            [newAttempts, row.id, LOCKOUT_DURATION_MINUTES]
          );
          res.status(423).json({
            success: false,
            message: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
            code: 'ACCOUNT_LOCKED'
          });
        } else {
          await db.query(
            'UPDATE users SET failed_login_attempts = $1 WHERE id = $2;',
            [newAttempts, row.id]
          );
          res.status(401).json({
            success: false,
            message: 'Invalid email or password',
            attemptsRemaining: Math.max(0, lockoutLimit - newAttempts)
          });
        }
        return;
      }

      // Transparent PBKDF2 Hash Upgrade: If password used legacy iterations, upgrade in background
      if (needsRehash(row.password_hash)) {
        try {
          const upgradedHash = hashPassword(password);
          await db.query('UPDATE users SET password_hash = $1 WHERE id = $2;', [upgradedHash, row.id]);
        } catch (rehashErr) {
          console.error('[Auth Re-hash Error]:', rehashErr);
        }
      }

      const isRootOwner = row.email?.toLowerCase() === 'optivirads@gmail.com';
      const effectiveTabs: string[] = isRootOwner
        ? ['*']
        : row.allowed_tabs && Array.isArray(row.allowed_tabs) && row.allowed_tabs.length > 0
        ? row.allowed_tabs
        : row.role_slug === 'super_admin' || row.role_slug === 'admin' || row.is_owner
        ? ['*']
        : ['dashboard'];

      const sessionId = crypto.randomUUID();
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || '127.0.0.1';
      const deviceInfo = parseDeviceInfo(req.headers['user-agent'] || '', clientIp);
      const isMobile = deviceInfo.deviceCategory === 'mobile';

      const userPayload = {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        organizationId: row.organization_id,
        role: row.role_slug || 'admin',
        isOwner: row.is_owner,
        rememberMe: isPersistent,
        clientId: row.client_id || null,
        sessionId
      };

      const token = generateToken(userPayload, isPersistent);

      // Dual-Device Policy: Allocate to mobile slot or desktop slot without terminating the other device category
      if (isMobile) {
        await db.query(
          `UPDATE users 
           SET last_login_at = NOW(), 
               failed_login_attempts = 0, 
               lockout_until = NULL,
               active_session_id = $1,
               current_device_info = $2,
               active_mobile_session_id = $1,
               mobile_device_info = $2
           WHERE id = $3;`,
          [sessionId, JSON.stringify(deviceInfo), row.id]
        );
      } else {
        await db.query(
          `UPDATE users 
           SET last_login_at = NOW(), 
               failed_login_attempts = 0, 
               lockout_until = NULL,
               active_session_id = $1,
               current_device_info = $2,
               active_desktop_session_id = $1,
               desktop_device_info = $2
           WHERE id = $3;`,
          [sessionId, JSON.stringify(deviceInfo), row.id]
        );
      }

      await recordAuditLog(
        row.organization_id,
        row.id,
        'LOGIN',
        'users',
        row.id,
        null,
        { email: row.email, device: deviceInfo.formatted, ip: deviceInfo.ip, category: deviceInfo.deviceCategory },
        req
      );

      res.json({
        success: true,
        // forcePasswordChange: if true, frontend must redirect to the change-password screen
        forcePasswordChange: Boolean(row.force_password_change),
        data: {
          token,
          user: {
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            phone: row.phone || null,
            avatarUrl: row.avatar_url || null,
            designation: row.designation,
            role: row.role_slug || 'admin',
            roleName: row.role_name || 'Admin',
            isOwner: row.is_owner,
            allowed_tabs: effectiveTabs,
            clientId: row.client_id || null,
            clientName: row.client_name || null,
            currentDevice: deviceInfo,
            forcePasswordChange: Boolean(row.force_password_change)
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
      res.status(500).json({
        success: false,
        message: 'An error occurred during authentication. Please try again.'
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /auth/me
// ---------------------------------------------------------------------------
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userRes = await db.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
        u.active_session_id, u.current_device_info,
        u.active_desktop_session_id, u.desktop_device_info,
        u.active_mobile_session_id, u.mobile_device_info,
        ou.organization_id, ou.designation, ou.is_owner, ou.allowed_tabs, ou.client_id,
        comp.name as client_name,
        r.name as role_name, r.slug as role_slug,
        o.name as organization_name, o.slug as organization_slug, o.currency, o.timezone
      FROM users u
      JOIN organization_users ou ON u.id = ou.user_id
      JOIN organizations o ON ou.organization_id = o.id
      LEFT JOIN clients c ON ou.client_id = c.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN roles r ON ou.role_id = r.id
      WHERE u.id = $1 AND ou.organization_id = $2;
    `, [req.user!.id, req.user!.organizationId]);

    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User profile not found' });
      return;
    }

    const row = userRes.rows[0];
    const isRootOwner = row.email?.toLowerCase() === 'optivirads@gmail.com';
    const effectiveTabs: string[] = isRootOwner
      ? ['*']
      : row.allowed_tabs && Array.isArray(row.allowed_tabs) && row.allowed_tabs.length > 0
      ? row.allowed_tabs
      : row.role_slug === 'super_admin' || row.role_slug === 'admin' || row.is_owner
      ? ['*']
      : ['dashboard'];

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || '127.0.0.1';
    const liveDevice = parseDeviceInfo(req.headers['user-agent'] || '', clientIp);
    const isMobile = liveDevice.deviceCategory === 'mobile';

    let effectiveSessionId = req.user?.sessionId;
    if (!effectiveSessionId) {
      effectiveSessionId = isMobile 
        ? (row.active_mobile_session_id || row.active_session_id || crypto.randomUUID())
        : (row.active_desktop_session_id || row.active_session_id || crypto.randomUUID());
    }

    // Keep active session and device metadata fresh in database
    if (isMobile) {
      if (!row.active_mobile_session_id || !row.mobile_device_info) {
        await db.query(
          'UPDATE users SET active_mobile_session_id = $1, mobile_device_info = $2, active_session_id = COALESCE(active_session_id, $1), current_device_info = COALESCE(current_device_info, $2) WHERE id = $3;',
          [effectiveSessionId, JSON.stringify(liveDevice), row.id]
        );
      }
    } else {
      if (!row.active_desktop_session_id || !row.desktop_device_info) {
        await db.query(
          'UPDATE users SET active_desktop_session_id = $1, desktop_device_info = $2, active_session_id = COALESCE(active_session_id, $1), current_device_info = COALESCE(current_device_info, $2) WHERE id = $3;',
          [effectiveSessionId, JSON.stringify(liveDevice), row.id]
        );
      }
    }

    // Only renew token if it's within 24h of expiry (prevents stolen tokens from living forever)
    const tokenPayload = req.user as any;
    const tokenExpiresAt = tokenPayload?.exp ? tokenPayload.exp * 1000 : 0;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const shouldRenew = tokenExpiresAt > 0 && (tokenExpiresAt - Date.now()) < twentyFourHours;

    const freshToken = shouldRenew ? generateToken({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      organizationId: row.organization_id,
      role: row.role_slug || 'admin',
      isOwner: row.is_owner,
      rememberMe: req.user?.rememberMe !== false,
      clientId: row.client_id || null,
      sessionId: effectiveSessionId
    }, req.user?.rememberMe !== false) : null;

    const activeDevices: any = {};
    if (row.desktop_device_info || (!isMobile && liveDevice)) {
      activeDevices.desktop = row.desktop_device_info || liveDevice;
    }
    if (row.mobile_device_info || (isMobile && liveDevice)) {
      activeDevices.mobile = row.mobile_device_info || liveDevice;
    }

    res.json({
      success: true,
      data: {
        ...row,
        avatarUrl: row.avatar_url || null,
        phone: row.phone || null,
        allowed_tabs: effectiveTabs,
        client_id: row.client_id || null,
        client_name: row.client_name || null,
        currentDevice: liveDevice,
        desktopDevice: row.desktop_device_info || (!isMobile ? liveDevice : null),
        mobileDevice: row.mobile_device_info || (isMobile ? liveDevice : null),
        activeDevices,
        token: freshToken
      }
    });
  } catch (err: any) {
    console.error('[Route Error in auth.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ---------------------------------------------------------------------------
// POST /auth/logout
// ---------------------------------------------------------------------------
router.post('/logout', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const sessionId = req.user?.sessionId;
    if (userId) {
      if (sessionId) {
        await db.query(`
          UPDATE users 
          SET 
            active_mobile_session_id = CASE WHEN active_mobile_session_id = $2 THEN NULL ELSE active_mobile_session_id END,
            mobile_device_info = CASE WHEN active_mobile_session_id = $2 THEN NULL ELSE mobile_device_info END,
            active_desktop_session_id = CASE WHEN active_desktop_session_id = $2 THEN NULL ELSE active_desktop_session_id END,
            desktop_device_info = CASE WHEN active_desktop_session_id = $2 THEN NULL ELSE desktop_device_info END,
            active_session_id = CASE WHEN active_session_id = $2 THEN NULL ELSE active_session_id END,
            current_device_info = CASE WHEN active_session_id = $2 THEN NULL ELSE current_device_info END
          WHERE id = $1;
        `, [userId, sessionId]);
      } else {
        await db.query(
          'UPDATE users SET active_session_id = NULL, current_device_info = NULL, active_desktop_session_id = NULL, desktop_device_info = NULL, active_mobile_session_id = NULL, mobile_device_info = NULL WHERE id = $1;',
          [userId]
        );
      }
      if (req.user?.organizationId) {
        await recordAuditLog(
          req.user.organizationId,
          userId,
          'LOGOUT',
          'users',
          userId,
          null,
          null,
          req
        );
      }
    }
    res.json({ success: true, message: 'Signed out successfully' });
  } catch (err: any) {
    console.error('[Route Error in auth.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ---------------------------------------------------------------------------
// POST /auth/request-password-otp
// ---------------------------------------------------------------------------
router.post(
  '/request-password-otp',
  requireAuth,
  otpRateLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    try {
      const userRes = await db.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      const user = userRes.rows[0];
      const otpCode = crypto.randomInt(100000, 1000000).toString();
      const otpHash = hashOtp(otpCode);

      // Store hashed OTP only — raw code is never saved to DB
      await db.query(
        `INSERT INTO user_security_otps (user_id, action, otp_code, otp_hash, expires_at)
         VALUES ($1, 'PASSWORD_CHANGE', '', $2, NOW() + INTERVAL '10 minutes')`,
        [userId, otpHash]
      );

      const sent = await EmailService.sendSecurityOtpEmail({
        toEmail: user.email,
        userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || undefined,
        otpCode,
        actionTitle: 'Password Change',
      });

      if (!sent) {
        res.status(500).json({
          success: false,
          message: `Failed to dispatch verification email. Please try again or contact support.`
        });
        return;
      }

      res.json({
        success: true,
        message: `A 6-digit verification code has been sent to your registered email address.`,
        emailSent: true,
      });
    } catch (err: any) {
      console.error('[Request Password OTP Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to dispatch verification code' });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /auth/change-password
// ---------------------------------------------------------------------------
router.post(
  '/change-password',
  requireAuth,
  otpRateLimiter,
  validateBody(changePasswordSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword, otp } = req.body;
    const userId = req.user!.id;

    try {
      // 1. Verify OTP code — compare against stored hash, never against raw plaintext
      const cleanOtp = otp?.toString().trim();
      const submittedHash = hashOtp(cleanOtp);
      const otpRes = await db.query(
        `SELECT id FROM user_security_otps
         WHERE user_id = $1 AND action = 'PASSWORD_CHANGE' AND otp_hash = $2 AND verified_at IS NULL AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [userId, submittedHash]
      );

      if (otpRes.rows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP verification code. Please request a new code.',
          code: 'INVALID_OTP'
        });
        return;
      }

      // 2. Verify current password
      const userRes = await db.query(
        'SELECT password_hash FROM users WHERE id = $1 AND deleted_at IS NULL;',
        [userId]
      );
      if (userRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const { password_hash } = userRes.rows[0];
      const isMatch = verifyPassword(currentPassword, password_hash);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Incorrect current password. Please verify and try again.' });
        return;
      }

      // 3. Mark OTP verified
      await db.query('UPDATE user_security_otps SET verified_at = NOW() WHERE id = $1', [otpRes.rows[0].id]);

      const { hashPassword } = await import('../utils/auth');
      const newHash = hashPassword(newPassword);

      await db.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;',
        [newHash, userId]
      );

      await recordAuditLog(
        req.user!.organizationId,
        userId,
        'CHANGE_PASSWORD',
        'users',
        userId,
        null,
        null,
        req
      );

      res.json({ success: true, message: 'Password has been changed successfully!' });
    } catch (err: any) {
      console.error('Change password error:', err);
      res.status(500).json({ success: false, message: 'Failed to change password. Please try again.' });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /auth/force-change-password
// For users with force_password_change = true (first login with temp password).
// Does NOT require current password — only OTP sent to their email.
// ---------------------------------------------------------------------------
router.post(
  '/force-change-password',
  requireAuth,
  otpRateLimiter,
  validateBody(forceChangePasswordSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { newPassword, otp } = req.body;
    const userId = req.user!.id;

    try {
      // 1. Verify OTP hash
      const cleanOtp = otp?.toString().trim();
      const submittedHash = hashOtp(cleanOtp);
      const otpRes = await db.query(
        `SELECT id FROM user_security_otps
         WHERE user_id = $1 AND action = 'PASSWORD_CHANGE' AND otp_hash = $2 AND verified_at IS NULL AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [userId, submittedHash]
      );

      if (otpRes.rows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code. Please request a new code.',
          code: 'INVALID_OTP'
        });
        return;
      }

      // 2. Mark OTP verified
      await db.query('UPDATE user_security_otps SET verified_at = NOW() WHERE id = $1', [otpRes.rows[0].id]);

      // 3. Set new password and clear the force_password_change flag
      const { hashPassword } = await import('../utils/auth');
      const newHash = hashPassword(newPassword);
      await db.query(
        'UPDATE users SET password_hash = $1, force_password_change = FALSE, updated_at = NOW() WHERE id = $2;',
        [newHash, userId]
      );

      await recordAuditLog(
        req.user!.organizationId,
        userId,
        'FORCE_PASSWORD_CHANGE',
        'users',
        userId,
        null,
        null,
        req
      );

      res.json({ success: true, message: 'Password set successfully! You can now use the app.' });
    } catch (err: any) {
      console.error('Force change password error:', err);
      res.status(500).json({ success: false, message: 'Failed to set password. Please try again.' });
    }
  }
);

export default router;
