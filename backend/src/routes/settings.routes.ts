import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../config/db';
import { requireAuth, requireRole, requireOwner, requireOwnerOrRole, invalidateOrgSecurityCache, recordAuditLog, isRootOwnerEmail } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';
import { hashPassword } from '../utils/auth';

const router = Router();

const createUserSchema = z.object({
  email: z.string().email('Valid email address is required'),
  name: z.string().optional(),
  role: z.string().min(1, 'Role is required').optional(),
  designation: z.string().optional(),
  team_id: z.string().optional().nullable(),
  client_id: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  // Owner can set any simple temp password (e.g. 'admin123')
  // User will be forced to change it on first login via OTP
  password: z.string().min(1, 'Password must not be empty').max(256).optional(),
  allowed_tabs: z.array(z.string()).optional()
});

const securitySchema = z.object({
  two_factor_enforced: z.boolean().optional(),
  session_timeout: z.string().regex(/^(\d+)(m|h|d)$/i, 'Invalid timeout format (e.g. 15m, 1h, 7d)').optional(),
  failed_lockout_limit: z.union([z.number().min(1).max(20), z.string()]).optional(),
  ip_whitelist: z.array(z.string()).optional()
});

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable()
});

export function isExecutiveOwner(user: any): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  return (
    isRootOwnerEmail(email) ||
    Boolean(user.isOwner) ||
    user.role === 'owner' ||
    user.role === 'super_admin'
  );
}

// ============================================================================
// 1. ORGANIZATION IDENTITY
// ============================================================================

router.get('/organization', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query(`
      SELECT id, name, slug, domain, logo_url, currency, timezone, status, settings, created_at, updated_at
      FROM organizations
      WHERE id = $1;
    `, [orgId]);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    const org = rows[0];
    const s = org.settings || {};

    res.json({
      success: true,
      data: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        domain: org.domain,
        domain_website: s.domain_website || (org.domain ? `https://${org.domain}` : 'https://www.optivirads.com'),
        legal_name: s.legal_name || org.name,
        brand_name: s.brand_name || 'OptiVir Technologies',
        tax_gstin: s.tax_gstin || s.billing?.gstin || '27AABCO1234F1Z5',
        tax_pan: s.tax_pan || s.billing?.pan || 'AABCO1234F',
        industry: s.industry || 'Performance Marketing & Advertising Agency',
        support_email: s.support_email || 'optivirads@gmail.com',
        switchboard_phone: s.switchboard_phone || '+919995037109',
        logo_url: org.logo_url || '/images/optivir-logo.png',
        created_at: org.created_at,
        updated_at: org.updated_at
      }
    });
  } catch (err: any) {
    console.error('Fetch organization settings error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.put('/organization', requireAuth, requireOwnerOrRole('admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const {
    legal_name,
    brand_name,
    tax_gstin,
    tax_pan,
    domain_website,
    industry,
    support_email,
    switchboard_phone,
    logo_url
  } = req.body;

  try {
    const current = await db.query('SELECT name, logo_url, domain, settings FROM organizations WHERE id = $1;', [orgId]);
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    const oldOrg = current.rows[0];
    const oldSettings = oldOrg.settings || {};

    const updatedSettings = {
      ...oldSettings,
      legal_name: legal_name !== undefined ? legal_name : oldSettings.legal_name,
      brand_name: brand_name !== undefined ? brand_name : oldSettings.brand_name,
      tax_gstin: tax_gstin !== undefined ? tax_gstin : oldSettings.tax_gstin,
      tax_pan: tax_pan !== undefined ? tax_pan : oldSettings.tax_pan,
      domain_website: domain_website !== undefined ? domain_website : oldSettings.domain_website,
      industry: industry !== undefined ? industry : oldSettings.industry,
      support_email: support_email !== undefined ? support_email : oldSettings.support_email,
      switchboard_phone: switchboard_phone !== undefined ? switchboard_phone : oldSettings.switchboard_phone
    };

    const newName = legal_name || oldOrg.name;
    const newLogo = logo_url !== undefined ? logo_url : oldOrg.logo_url;
    let cleanDomain = oldOrg.domain;
    if (domain_website) {
      cleanDomain = domain_website.replace(/^https?:\/\//i, '').split('/')[0];
    }

    const { rows } = await db.query(`
      UPDATE organizations
      SET name = $1, domain = $2, logo_url = $3, settings = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING id, name, domain, logo_url, settings, updated_at;
    `, [newName, cleanDomain, newLogo, JSON.stringify(updatedSettings), orgId]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'UPDATE_ORG_IDENTITY',
      'organizations',
      orgId,
      { name: oldOrg.name, settings: oldSettings },
      { name: newName, settings: updatedSettings },
      req
    );

    res.json({
      success: true,
      message: 'Organization identity updated successfully',
      data: rows[0]
    });
  } catch (err: any) {
    console.error('Update organization settings error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 2. GENERAL REGIONAL
// ============================================================================

router.get('/regional', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query(`
      SELECT timezone, currency, settings
      FROM organizations
      WHERE id = $1;
    `, [orgId]);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    const s = rows[0].settings || {};
    res.json({
      success: true,
      data: {
        timezone: rows[0].timezone || 'Asia/Kolkata',
        currency: rows[0].currency || 'INR',
        date_format: s.date_format || 'DD/MM/YYYY (24-Hour: 14:32)',
        fiscal_year: s.fiscal_year || 'April 1st (Indian / UK Standard)',
        auto_shift_adjustment: s.auto_shift_adjustment !== undefined ? Boolean(s.auto_shift_adjustment) : true
      }
    });
  } catch (err: any) {
    console.error('Fetch regional settings error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.put('/regional', requireAuth, requireOwnerOrRole('admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { timezone, currency, date_format, fiscal_year, auto_shift_adjustment } = req.body;

  try {
    const current = await db.query('SELECT timezone, currency, settings FROM organizations WHERE id = $1;', [orgId]);
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    const oldRow = current.rows[0];
    const oldSettings = oldRow.settings || {};

    const updatedSettings = {
      ...oldSettings,
      date_format: date_format !== undefined ? date_format : oldSettings.date_format,
      fiscal_year: fiscal_year !== undefined ? fiscal_year : oldSettings.fiscal_year,
      auto_shift_adjustment: auto_shift_adjustment !== undefined ? Boolean(auto_shift_adjustment) : oldSettings.auto_shift_adjustment
    };

    // Clean timezone value if passed with human label
    let cleanTimezone = timezone || oldRow.timezone;
    if (cleanTimezone.includes(' ')) {
      cleanTimezone = cleanTimezone.split(' ')[0];
    }

    // Clean currency value if passed with human label
    let cleanCurrency = currency || oldRow.currency;
    if (cleanCurrency.includes(' ')) {
      cleanCurrency = cleanCurrency.split(' ')[0];
    }

    const { rows } = await db.query(`
      UPDATE organizations
      SET timezone = $1, currency = $2, settings = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING timezone, currency, settings;
    `, [cleanTimezone, cleanCurrency, JSON.stringify(updatedSettings), orgId]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'UPDATE_REGIONAL_SETTINGS',
      'organizations',
      orgId,
      { timezone: oldRow.timezone, currency: oldRow.currency, settings: oldSettings },
      { timezone: cleanTimezone, currency: cleanCurrency, settings: updatedSettings },
      req
    );

    res.json({
      success: true,
      message: 'Regional preferences updated successfully',
      data: {
        timezone: rows[0].timezone,
        currency: rows[0].currency,
        date_format: updatedSettings.date_format,
        fiscal_year: updatedSettings.fiscal_year,
        auto_shift_adjustment: updatedSettings.auto_shift_adjustment
      }
    });
  } catch (err: any) {
    console.error('Update regional settings error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 3. USER PREFERENCES
// ============================================================================

router.get('/preferences', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const { rows } = await db.query(`
      SELECT preferences
      FROM users
      WHERE id = $1;
    `, [userId]);

    const p = rows[0]?.preferences || {};
    res.json({
      success: true,
      data: {
        landing_workspace: p.landing_workspace || 'Executive Overview Dashboard',
        density_profile: p.density_profile || 'Dense',
        auditory_chimes: p.auditory_chimes !== undefined ? Boolean(p.auditory_chimes) : true,
        telemetry_diff: p.telemetry_diff !== undefined ? Boolean(p.telemetry_diff) : true
      }
    });
  } catch (err: any) {
    console.error('Fetch user preferences error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.put('/preferences', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const orgId = req.user!.organizationId;
  const { landing_workspace, density_profile, auditory_chimes, telemetry_diff } = req.body;

  try {
    const current = await db.query('SELECT preferences FROM users WHERE id = $1;', [userId]);
    const oldPreferences = current.rows[0]?.preferences || {};

    const updatedPreferences = {
      ...oldPreferences,
      landing_workspace: landing_workspace !== undefined ? landing_workspace : oldPreferences.landing_workspace,
      density_profile: density_profile !== undefined ? density_profile : oldPreferences.density_profile,
      auditory_chimes: auditory_chimes !== undefined ? Boolean(auditory_chimes) : oldPreferences.auditory_chimes,
      telemetry_diff: telemetry_diff !== undefined ? Boolean(telemetry_diff) : oldPreferences.telemetry_diff
    };

    await db.query(`
      UPDATE users
      SET preferences = $1, updated_at = NOW()
      WHERE id = $2;
    `, [JSON.stringify(updatedPreferences), userId]);

    await recordAuditLog(
      orgId,
      userId,
      'UPDATE_USER_PREFERENCES',
      'users',
      userId,
      oldPreferences,
      updatedPreferences,
      req
    );

    res.json({
      success: true,
      message: 'Personal preferences saved successfully',
      data: updatedPreferences
    });
  } catch (err: any) {
    console.error('Update user preferences error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 3.1. USER PERSONAL PROFILE (Self-Service)
// ============================================================================

router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
        ou.designation, ou.is_owner, ou.allowed_tabs,
        r.name as role_name, r.slug as role_slug,
        o.name as organization_name
      FROM users u
      LEFT JOIN organization_users ou ON u.id = ou.user_id AND ou.organization_id = $2
      LEFT JOIN roles r ON ou.role_id = r.id
      LEFT JOIN organizations o ON ou.organization_id = o.id
      WHERE u.id = $1
      LIMIT 1;
    `, [userId, orgId]);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'User profile not found' });
      return;
    }

    const u = rows[0];
    res.json({
      success: true,
      data: {
        id: u.id,
        email: u.email,
        firstName: u.first_name || '',
        lastName: u.last_name || '',
        phone: u.phone || '',
        avatarUrl: u.avatar_url || null,
        designation: u.designation || 'Specialist',
        role: u.role_slug || 'team_member',
        roleName: u.is_owner ? 'Executive & Owner' : (u.role_name || 'Team Member'),
        isOwner: Boolean(u.is_owner),
        organizationName: u.organization_name || 'OptiVir CRM',
        allowed_tabs: u.allowed_tabs || ['dashboard']
      }
    });
  } catch (err: any) {
    console.error('Fetch profile error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.patch('/profile', requireAuth, validateBody(updateProfileSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { firstName, lastName, phone, avatarUrl } = req.body;

  try {
    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [userId];

    if (firstName !== undefined) {
      params.push(firstName ? firstName.trim() : null);
      updates.push(`first_name = $${params.length}`);
    }
    if (lastName !== undefined) {
      params.push(lastName ? lastName.trim() : null);
      updates.push(`last_name = $${params.length}`);
    }
    if (phone !== undefined) {
      params.push(phone ? phone.trim() : null);
      updates.push(`phone = $${params.length}`);
    }
    if (avatarUrl !== undefined) {
      params.push(avatarUrl ? avatarUrl.trim() : null);
      updates.push(`avatar_url = $${params.length}`);
    }

    const { rows } = await db.query(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, email, first_name, last_name, phone, avatar_url;
    `, params);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'User record not found' });
      return;
    }

    const updated = rows[0];
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updated.id,
        email: updated.email,
        firstName: updated.first_name,
        lastName: updated.last_name,
        phone: updated.phone,
        avatarUrl: updated.avatar_url
      }
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 4. USER DIRECTORY
// ============================================================================

router.get('/users', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.phone,
        u.status as user_status,
        u.last_login_at,
        u.active_session_id,
        u.current_device_info,
        u.active_desktop_session_id,
        u.desktop_device_info,
        u.active_mobile_session_id,
        u.mobile_device_info,
        ou.id as membership_id,
        ou.role_id,
        ou.team_id,
        ou.client_id,
        ou.designation,
        ou.is_owner,
        ou.allowed_tabs,
        ou.status as member_status,
        r.name as role_name,
        r.slug as role_slug,
        t.name as team_name,
        comp.name as client_name
      FROM organization_users ou
      JOIN users u ON ou.user_id = u.id
      LEFT JOIN roles r ON ou.role_id = r.id
      LEFT JOIN teams t ON ou.team_id = t.id
      LEFT JOIN clients c ON ou.client_id = c.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      WHERE ou.organization_id = $1
      ORDER BY ou.is_owner DESC, u.first_name ASC;
    `, [orgId]);

    const avatarColors = ['bg-[#B91C1C]', 'bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-indigo-600'];

    const formatted = rows.map((u, idx) => {
      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
      const initials = (u.first_name?.[0] || '') + (u.last_name?.[0] || u.email[0] || 'U').toUpperCase();
      let lastLoginText = 'Never';
      if (u.last_login_at) {
        const diffMs = Date.now() - new Date(u.last_login_at).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 60) lastLoginText = `${Math.max(mins, 1)} mins ago`;
        else if (mins < 1440) lastLoginText = `${Math.floor(mins / 60)} hours ago`;
        else lastLoginText = `${Math.floor(mins / 1440)} days ago`;
      }

      const isRootOwner = u.email?.toLowerCase() === 'optivirads@gmail.com';
      const effectiveTabs: string[] = isRootOwner 
        ? ['*'] 
        : (u.allowed_tabs && Array.isArray(u.allowed_tabs) && u.allowed_tabs.length > 0)
        ? u.allowed_tabs
        : (u.role_slug === 'super_admin' || u.role_slug === 'admin' || u.is_owner)
        ? ['*']
        : ['dashboard'];

      const desktopDevice = u.desktop_device_info || (u.current_device_info?.deviceCategory === 'desktop' ? u.current_device_info : null);
      const mobileDevice = u.mobile_device_info || (u.current_device_info?.deviceCategory === 'mobile' ? u.current_device_info : null);
      const hasDesktop = Boolean(u.active_desktop_session_id || (u.active_session_id && desktopDevice));
      const hasMobile = Boolean(u.active_mobile_session_id || (u.active_session_id && mobileDevice));
      const activeDevicesCount = (hasDesktop ? 1 : 0) + (hasMobile ? 1 : 0);
      const isOnline = activeDevicesCount > 0 || Boolean(u.active_session_id);

      return {
        id: u.id,
        membershipId: u.membership_id,
        name: fullName,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        phone: u.phone,
        avatarUrl: u.avatar_url || null,
        role: u.role_slug || 'sales_lead',
        roleLabel: u.is_owner ? 'Executive & Owner' : (u.client_id ? `Client (${u.client_name || 'Assigned'})` : (u.role_name || 'Specialist')),
        designation: u.designation || (u.is_owner ? 'Managing Director & Founder' : 'Specialist'),
        status: u.member_status === 'active' ? 'Active' : 'Pending Invite',
        twoFactor: true,
        lastLogin: lastLoginText,
        initials,
        avatarBg: avatarColors[idx % avatarColors.length],
        teamName: u.team_name,
        teamId: u.team_id,
        clientId: u.client_id || null,
        clientName: u.client_name || null,
        allowed_tabs: effectiveTabs,
        activeSessionId: u.active_session_id || null,
        currentDevice: u.current_device_info || desktopDevice || mobileDevice || null,
        desktopDevice: hasDesktop ? desktopDevice : null,
        mobileDevice: hasMobile ? mobileDevice : null,
        activeDevicesCount,
        hasDesktop,
        hasMobile,
        isOnline
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('Fetch users error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ---------------------------------------------------------------------------
// POST /settings/users/:id/revoke-session (Exclusively authorized for optivirads@gmail.com)
// ---------------------------------------------------------------------------
router.post(
  '/users/:id/revoke-session',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!isRootOwnerEmail(req.user?.email || '')) {
      res.status(403).json({
        success: false,
        message: 'Access Denied: Only the primary account owner is authorized to terminate active sessions.'
      });
      return;
    }
    const targetUserId = req.params.id;
    const category = (req.query.category || req.body?.category || 'all') as string;
    try {
      const userCheck = await db.query(
        'SELECT 1 FROM organization_users WHERE organization_id = $1 AND user_id = $2;',
        [req.user!.organizationId, targetUserId]
      );
      if (userCheck.rows.length === 0) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      if (category === 'mobile') {
        await db.query(
          'UPDATE users SET active_mobile_session_id = NULL, mobile_device_info = NULL WHERE id = $1;',
          [targetUserId]
        );
      } else if (category === 'desktop') {
        await db.query(
          'UPDATE users SET active_desktop_session_id = NULL, desktop_device_info = NULL WHERE id = $1;',
          [targetUserId]
        );
      } else {
        await db.query(
          'UPDATE users SET active_session_id = NULL, current_device_info = NULL, active_desktop_session_id = NULL, desktop_device_info = NULL, active_mobile_session_id = NULL, mobile_device_info = NULL WHERE id = $1;',
          [targetUserId]
        );
      }
      await recordAuditLog(
        req.user!.organizationId,
        req.user!.id,
        'REVOKE_USER_SESSION',
        'users',
        targetUserId,
        null,
        { targetUserId, category },
        req
      );
      res.json({ success: true, message: 'User session terminated successfully' });
    } catch (err: any) {
      console.error('Revoke session error:', err);
      res.status(500).json({ success: false, message: 'Failed to revoke session' });
    }
  }
);

router.post('/users', requireAuth, validateBody(createUserSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!isExecutiveOwner(req.user)) {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Only the Executive Owner is authorized to create users and assign permissions. Administrators and COOs are not permitted.'
    });
    return;
  }

  const orgId = req.user!.organizationId;
  const { name, email, role, designation, team_id, client_id, phone, password, allowed_tabs } = req.body;

  if (!email || !email.trim()) {
    res.status(400).json({ success: false, message: 'Email address is required' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const nameStr = (name && name.trim()) || cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
  const nameParts = nameStr.split(' ').filter(Boolean);
  const firstName = nameParts[0] ? (nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1)) : 'User';
  const lastName = nameParts.slice(1).join(' ') || '';

  try {
    // 1. Find or create user
    let userId: string;
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1;', [cleanEmail]);

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      const updates: string[] = ['updated_at = NOW()'];
      const params: any[] = [userId];

      if (password && password.trim().length >= 1) {
        params.push(hashPassword(password.trim()));
        updates.push(`password_hash = $${params.length}`);
        // Always require password change when owner resets a password
        updates.push('force_password_change = TRUE');
      }
      if (firstName) {
        params.push(firstName);
        updates.push(`first_name = $${params.length}`);
      }
      if (lastName !== undefined) {
        params.push(lastName);
        updates.push(`last_name = $${params.length}`);
      }
      if (phone !== undefined) {
        params.push(phone || null);
        updates.push(`phone = $${params.length}`);
      }
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $1;`, params);
    } else {
      const initialPassword = (password && password.trim().length >= 1) ? password.trim() : 'Optivir@2026';
      const defaultHash = hashPassword(initialPassword);
      const newUser = await db.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, phone, status, force_password_change)
        VALUES ($1, $2, $3, $4, $5, 'active', TRUE)
        RETURNING id;
      `, [cleanEmail, defaultHash, firstName, lastName, phone || null]);
      userId = newUser.rows[0].id;
    }

    // 2. Resolve role
    let roleId: string | null = null;
    if (role) {
      const roleRes = await db.query(
        'SELECT id FROM roles WHERE (organization_id = $1 OR organization_id IS NULL) AND (slug = $2 OR name ILIKE $2) LIMIT 1;',
        [orgId, role]
      );
      if (roleRes.rows.length > 0) {
        roleId = roleRes.rows[0].id;
      }
    }

    const assignedTabs: string[] = Array.isArray(allowed_tabs) && allowed_tabs.length > 0
      ? allowed_tabs
      : ['dashboard'];

    // 3. Create or update organization_users membership
    await db.query(`
      INSERT INTO organization_users (organization_id, user_id, role_id, team_id, client_id, designation, status, allowed_tabs)
      VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
      ON CONFLICT (organization_id, user_id) DO UPDATE
      SET role_id = EXCLUDED.role_id,
          team_id = EXCLUDED.team_id,
          client_id = EXCLUDED.client_id,
          designation = EXCLUDED.designation,
          status = 'active',
          allowed_tabs = EXCLUDED.allowed_tabs,
          updated_at = NOW();
    `, [orgId, userId, roleId, team_id || null, client_id || null, designation || 'Specialist', assignedTabs]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'INVITE_TEAM_MEMBER',
      'organization_users',
      userId,
      null,
      { email: cleanEmail, role, designation, client_id, allowed_tabs: assignedTabs },
      req
    );

    res.json({
      success: true,
      message: `User ${cleanEmail} created with permissions assigned successfully!`,
      data: { id: userId, email: cleanEmail, firstName, lastName, allowed_tabs: assignedTabs }
    });
  } catch (err: any) {
    console.error('Invite user error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.patch('/users/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!isExecutiveOwner(req.user)) {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Only the Executive Owner is authorized to modify user roles and permissions.'
    });
    return;
  }

  const orgId = req.user!.organizationId;
  const targetUserId = req.params.id;
  const { role, designation, status, team_id, client_id, allowed_tabs, name, firstName, lastName } = req.body;

  try {
    const setClauses: string[] = ['updated_at = NOW()'];
    const params: any[] = [];

    // Check target user email and membership in organization
    const targetUserRes = await db.query(
      'SELECT u.email FROM users u JOIN organization_users ou ON u.id = ou.user_id WHERE u.id = $1 AND ou.organization_id = $2;',
      [targetUserId, orgId]
    );
    if (targetUserRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found in organization' });
      return;
    }
    const targetEmail = targetUserRes.rows[0]?.email?.toLowerCase();

    if (role !== undefined) {
      let roleId: string | null = null;
      if (role) {
        const r = await db.query(
          'SELECT id FROM roles WHERE (organization_id = $1 OR organization_id IS NULL) AND (slug = $2 OR name ILIKE $2 OR id::text = $2) LIMIT 1;',
          [orgId, role]
        );
        if (r.rows.length > 0) roleId = r.rows[0].id;
      }
      params.push(roleId);
      setClauses.push(`role_id = $${params.length}`);

      if (targetEmail !== 'optivirads@gmail.com') {
        const isOwnerRole = role === 'super_admin' || role === 'owner' || role === 'admin';
        params.push(isOwnerRole);
        setClauses.push(`is_owner = $${params.length}`);
      }

      await db.query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2;', [role, targetUserId]);
    }

    if (designation !== undefined) {
      params.push(designation ?? null);
      setClauses.push(`designation = $${params.length}`);
    }

    if (status !== undefined) {
      params.push(status ?? null);
      setClauses.push(`status = $${params.length}`);
    }

    if (team_id !== undefined) {
      params.push(team_id ?? null);
      setClauses.push(`team_id = $${params.length}`);
    }

    if (client_id !== undefined) {
      params.push(client_id ?? null);
      setClauses.push(`client_id = $${params.length}`);
    }

    if (allowed_tabs !== undefined) {
      const targetTabs = Array.isArray(allowed_tabs) ? allowed_tabs : [];
      params.push(targetTabs);
      setClauses.push(`allowed_tabs = $${params.length}`);

      if (role === undefined && !targetTabs.includes('*') && targetEmail !== 'optivirads@gmail.com') {
        params.push(false);
        setClauses.push(`is_owner = $${params.length}`);
      }
    }

    params.push(orgId);
    const orgIdIdx = params.length;
    params.push(targetUserId);
    const targetUserIdIdx = params.length;

    const updateQuery = `
      UPDATE organization_users
      SET ${setClauses.join(', ')}
      WHERE organization_id = $${orgIdIdx} AND user_id = $${targetUserIdIdx}
      RETURNING *;
    `;

    const { rows } = await db.query(updateQuery, params);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Membership not found' });
      return;
    }

    // Optionally update user name in users table
    if (name || firstName || lastName) {
      const uUpdates: string[] = ['updated_at = NOW()'];
      const uParams: any[] = [targetUserId];
      if (firstName) {
        uParams.push(firstName);
        uUpdates.push(`first_name = $${uParams.length}`);
      }
      if (lastName !== undefined) {
        uParams.push(lastName);
        uUpdates.push(`last_name = $${uParams.length}`);
      }
      if (name && !firstName) {
        const parts = name.trim().split(' ');
        uParams.push(parts[0]);
        uUpdates.push(`first_name = $${uParams.length}`);
        if (parts.length > 1) {
          uParams.push(parts.slice(1).join(' '));
          uUpdates.push(`last_name = $${uParams.length}`);
        }
      }
      await db.query(`UPDATE users SET ${uUpdates.join(', ')} WHERE id = $1;`, uParams);
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'UPDATE_TEAM_MEMBER',
      'organization_users',
      targetUserId,
      null,
      { role, designation, status, client_id, allowed_tabs },
      req
    );

    res.json({ success: true, message: 'User updated successfully', data: rows[0] });
  } catch (err: any) {
    console.error('Update user error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// Reset a user's password (by Executive Owner)
router.post('/users/:id/reset-password', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!isExecutiveOwner(req.user)) {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Only the Executive Owner is authorized to reset credentials.'
    });
    return;
  }

  const orgId = req.user!.organizationId;
  const targetUserId = req.params.id;
  const { password } = req.body;

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    return;
  }

  try {
    const memCheck = await db.query('SELECT user_id FROM organization_users WHERE organization_id = $1 AND user_id = $2;', [orgId, targetUserId]);
    if (memCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found in this organization' });
      return;
    }

    const newHash = hashPassword(password);
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;', [newHash, targetUserId]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'ADMIN_RESET_PASSWORD',
      'users',
      targetUserId,
      null,
      { action: 'password_reset_by_admin' },
      req
    );

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err: any) {
    console.error('Admin reset password error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.delete('/users/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!isExecutiveOwner(req.user)) {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Only the Executive Owner is authorized to remove team members.'
    });
    return;
  }

  const orgId = req.user!.organizationId;
  const targetUserId = req.params.id;

  try {
    // If targetUserId is not a standard UUID (e.g. demo/mock user), safely return success
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId);
    if (!isUuid) {
      res.json({ success: true, message: 'Member removed from directory' });
      return;
    }

    // Only optivirads@gmail.com is protected from deletion
    const targetUser = await db.query(
      'SELECT u.email FROM users u JOIN organization_users ou ON u.id = ou.user_id WHERE u.id = $1 AND ou.organization_id = $2;',
      [targetUserId, orgId]
    );
    if (targetUser.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found in organization' });
      return;
    }
    const targetEmail = (targetUser.rows[0]?.email || '').toLowerCase().trim();
    if (targetEmail === 'optivirads@gmail.com') {
      res.status(400).json({ success: false, message: 'optivirads@gmail.com is the primary organization account and cannot be deleted.' });
      return;
    }

    await db.query('DELETE FROM organization_users WHERE organization_id = $1 AND user_id = $2;', [orgId, targetUserId]);
    await db.query('DELETE FROM users WHERE id = $1 AND email != $2;', [targetUserId, 'optivirads@gmail.com']).catch(() => {});

    await recordAuditLog(
      orgId,
      req.user?.id,
      'REMOVE_TEAM_MEMBER',
      'organization_users',
      targetUserId,
      null,
      { removedEmail: targetEmail },
      req
    );

    res.json({ success: true, message: 'Member removed from directory' });
  } catch (err: any) {
    console.error('Delete user error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 5. ROLES & PERMISSIONS
// ============================================================================

router.get('/roles', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const rolesRes = await db.query(`
      SELECT id, name, slug, description, is_system_role
      FROM roles
      WHERE organization_id = $1 OR organization_id IS NULL
      ORDER BY is_system_role DESC, name ASC;
    `, [orgId]);

    const permsRes = await db.query('SELECT id, code, module, name, description FROM permissions;');
    const rolePermsRes = await db.query(`
      SELECT rp.role_id, p.code
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id;
    `);

    const rolePermMap = new Map<string, Set<string>>();
    for (const rp of rolePermsRes.rows) {
      if (!rolePermMap.has(rp.role_id)) rolePermMap.set(rp.role_id, new Set());
      rolePermMap.get(rp.role_id)!.add(rp.code);
    }

    const data = rolesRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      isSystemRole: r.is_system_role,
      permissions: Array.from(rolePermMap.get(r.id) || [])
    }));

    res.json({
      success: true,
      data,
      allPermissions: permsRes.rows
    });
  } catch (err: any) {
    console.error('Fetch roles error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.post('/roles', requireAuth, requireOwner, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { name, description, permissions } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'Role name is required' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  try {
    const { rows } = await db.query(`
      INSERT INTO roles (organization_id, name, slug, description, is_system_role)
      VALUES ($1, $2, $3, $4, false)
      ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
      RETURNING *;
    `, [orgId, name, slug, description]);

    const roleId = rows[0].id;

    if (Array.isArray(permissions) && permissions.length > 0) {
      for (const pCode of permissions) {
        await db.query(`
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT $1, id FROM permissions WHERE code = $2
          ON CONFLICT DO NOTHING;
        `, [roleId, pCode]);
      }
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'CREATE_ROLE',
      'roles',
      roleId,
      null,
      { name, slug, permissions },
      req
    );

    res.json({ success: true, message: `Role "${name}" created`, data: rows[0] });
  } catch (err: any) {
    console.error('Create role error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.put('/roles/:id/permissions', requireAuth, requireOwner, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const roleId = req.params.id;
  const { permissions } = req.body; // array of permission code strings or object map

  try {
    // Check role exists (support UUID or slug)
    const roleCheck = await db.query(
      'SELECT id, name, slug FROM roles WHERE (id::text = $1 OR slug = $1) AND (organization_id = $2 OR organization_id IS NULL) LIMIT 1;',
      [roleId, orgId]
    );
    if (roleCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }
    const resolvedRoleId = roleCheck.rows[0].id;

    let activeCodes: string[] = [];
    if (Array.isArray(permissions)) {
      activeCodes = permissions;
    } else if (typeof permissions === 'object' && permissions !== null) {
      activeCodes = Object.keys(permissions).filter(k => Boolean(permissions[k]));
    }

    // Delete existing permissions for role
    await db.query('DELETE FROM role_permissions WHERE role_id = $1;', [resolvedRoleId]);

    // Insert new permissions
    for (const code of activeCodes) {
      await db.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT $1, id FROM permissions WHERE code = $2
        ON CONFLICT DO NOTHING;
      `, [resolvedRoleId, code]);
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'ROLE_PERMISSION_UPDATED',
      'roles',
      roleId,
      null,
      { role: roleCheck.rows[0].name, permissions: activeCodes },
      req
    );

    res.json({
      success: true,
      message: `Permissions updated for role ${roleCheck.rows[0].name}`,
      data: { roleId, permissions: activeCodes }
    });
  } catch (err: any) {
    console.error('Update role permissions error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.delete('/roles/:id', requireAuth, requireOwner, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const roleId = req.params.id;

  try {
    const roleCheck = await db.query('SELECT is_system_role FROM roles WHERE id = $1 AND organization_id = $2;', [roleId, orgId]);
    if (roleCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }
    if (roleCheck.rows[0].is_system_role) {
      res.status(400).json({ success: false, message: 'Cannot delete built-in system role' });
      return;
    }

    await db.query('DELETE FROM roles WHERE id = $1 AND organization_id = $2;', [roleId, orgId]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'DELETE_ROLE',
      'roles',
      roleId,
      null,
      null,
      req
    );

    res.json({ success: true, message: 'Role deleted' });
  } catch (err: any) {
    console.error('Delete role error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 6. TEAMS & PODS
// ============================================================================

router.get('/teams', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query(`
      SELECT 
        t.id,
        t.name,
        t.description,
        t.target,
        t.metadata,
        t.created_at,
        u.id as leader_id,
        CONCAT(u.first_name, ' ', u.last_name) as leader_name,
        COUNT(DISTINCT ou.id) as members_count,
        (
          SELECT COUNT(DISTINCT c.id)
          FROM clients c
          WHERE c.organization_id = t.organization_id
        ) as active_clients_count
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      LEFT JOIN organization_users ou ON t.id = ou.team_id
      WHERE t.organization_id = $1 AND t.deleted_at IS NULL
      GROUP BY t.id, u.id, u.first_name, u.last_name
      ORDER BY t.created_at ASC;
    `, [orgId]);

    const colors = [
      'border-blue-500/40 bg-blue-500/5',
      'border-purple-500/40 bg-purple-500/5',
      'border-rose-500/40 bg-rose-500/5',
      'border-emerald-500/40 bg-emerald-500/5'
    ];

    const data = rows.map((t, idx) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      lead: t.leader_name?.trim() || 'Unassigned Lead',
      leaderId: t.leader_id,
      membersCount: parseInt(t.members_count) || 3,
      activeClients: parseInt(t.active_clients_count) || 5,
      target: t.target || '₹18,50,000/mo',
      color: t.metadata?.color || colors[idx % colors.length]
    }));

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Fetch teams error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.post('/teams', requireAuth, requireOwnerOrRole('admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { name, lead, target, description, color } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'Pod title is required' });
    return;
  }

  try {
    let leaderId: string | null = null;
    if (lead) {
      const u = await db.query(`
        SELECT u.id 
        FROM users u 
        JOIN organization_users ou ON u.id = ou.user_id 
        WHERE ou.organization_id = $1 AND (CONCAT(u.first_name, ' ', u.last_name) ILIKE $2 OR u.first_name ILIKE $2 OR u.email ILIKE $2)
        LIMIT 1;
      `, [orgId, `%${lead}%`]);
      if (u.rows.length > 0) leaderId = u.rows[0].id;
    }

    const formattedTarget = target ? (target.toString().startsWith('₹') ? target : `₹${parseInt(target).toLocaleString('en-IN')}/mo`) : '₹20,00,000/mo';
    const metadata = { color: color || 'border-blue-500/40 bg-blue-500/5' };

    const { rows } = await db.query(`
      INSERT INTO teams (organization_id, name, description, leader_id, target, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [orgId, name, description || null, leaderId, formattedTarget, JSON.stringify(metadata)]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'CREATE_TEAM_POD',
      'teams',
      rows[0].id,
      null,
      { name, target: formattedTarget },
      req
    );

    res.json({ success: true, message: `Pod "${name}" created!`, data: rows[0] });
  } catch (err: any) {
    console.error('Create team error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.patch('/teams/:id', requireAuth, requireOwnerOrRole('admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const teamId = req.params.id;
  const { name, target, description, leader_id } = req.body;

  try {
    const { rows } = await db.query(`
      UPDATE teams
      SET 
        name = COALESCE($1, name),
        target = COALESCE($2, target),
        description = COALESCE($3, description),
        leader_id = COALESCE($4, leader_id),
        updated_at = NOW()
      WHERE id = $5 AND organization_id = $6
      RETURNING *;
    `, [name, target, description, leader_id, teamId, orgId]);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Pod not found' });
      return;
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'UPDATE_TEAM_POD',
      'teams',
      teamId,
      null,
      req.body,
      req
    );

    res.json({ success: true, message: 'Pod updated', data: rows[0] });
  } catch (err: any) {
    console.error('Update team error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.delete('/teams/:id', requireAuth, requireOwnerOrRole('admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const teamId = req.params.id;

  try {
    const delRes = await db.query('DELETE FROM teams WHERE id = $1 AND organization_id = $2 RETURNING id;', [teamId, orgId]);
    if (delRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Team not found' });
      return;
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'DELETE_TEAM_POD',
      'teams',
      teamId,
      null,
      null,
      req
    );

    res.json({ success: true, message: 'Pod deleted successfully' });
  } catch (err: any) {
    console.error('Delete team error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 7. SSO & SECURITY 2FA
// ============================================================================

router.get('/security', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query('SELECT settings FROM organizations WHERE id = $1;', [orgId]);
    const sec = rows[0]?.settings?.security || {};

    res.json({
      success: true,
      data: {
        two_factor_enforced: sec.two_factor_enforced !== undefined ? Boolean(sec.two_factor_enforced) : true,
        session_timeout: sec.session_timeout || '7d',
        failed_lockout_limit: sec.failed_lockout_limit || '5',
        ip_whitelist: Array.isArray(sec.ip_whitelist) ? sec.ip_whitelist : []
      }
    });
  } catch (err: any) {
    console.error('Fetch security settings error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.put('/security', requireAuth, requireOwner, validateBody(securitySchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { two_factor_enforced, session_timeout, failed_lockout_limit, ip_whitelist } = req.body;

  try {
    const current = await db.query('SELECT settings FROM organizations WHERE id = $1;', [orgId]);
    const oldSettings = current.rows[0]?.settings || {};
    const oldSecurity = oldSettings.security || {};

    const updatedSecurity = {
      ...oldSecurity,
      two_factor_enforced: two_factor_enforced !== undefined ? Boolean(two_factor_enforced) : oldSecurity.two_factor_enforced,
      session_timeout: session_timeout !== undefined ? session_timeout : oldSecurity.session_timeout,
      failed_lockout_limit: failed_lockout_limit !== undefined ? failed_lockout_limit : oldSecurity.failed_lockout_limit,
      ip_whitelist: ip_whitelist !== undefined ? ip_whitelist : oldSecurity.ip_whitelist
    };

    const newSettings = { ...oldSettings, security: updatedSecurity };

    await db.query(`
      UPDATE organizations
      SET settings = $1, updated_at = NOW()
      WHERE id = $2;
    `, [JSON.stringify(newSettings), orgId]);

    // Invalidate the auth middleware security cache so new policy takes effect immediately
    invalidateOrgSecurityCache(orgId);

    await recordAuditLog(
      orgId,
      req.user?.id,
      two_factor_enforced ? 'TWO_FACTOR_ENFORCED' : 'SECURITY_POLICY_UPDATED',
      'organizations',
      orgId,
      oldSecurity,
      updatedSecurity,
      req
    );

    res.json({
      success: true,
      message: 'Enterprise security policy persisted successfully',
      data: updatedSecurity
    });
  } catch (err: any) {
    console.error('Update security settings error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 8. PIPELINES & STAGES
// ============================================================================

router.get('/pipelines', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const pipesRes = await db.query(`
      SELECT id, name, is_default, is_active, created_at
      FROM pipelines
      WHERE organization_id = $1
      ORDER BY is_default DESC, name ASC;
    `, [orgId]);

    const stagesRes = await db.query(`
      SELECT 
        ps.id,
        ps.pipeline_id,
        ps.name,
        ps.order_index,
        ps.probability,
        ps.color,
        ps.sla_days,
        ps.is_won,
        ps.is_lost,
        COUNT(d.id) as deal_count,
        COALESCE(SUM(d.value), 0) as total_value
      FROM pipeline_stages ps
      JOIN pipelines p ON ps.pipeline_id = p.id
      LEFT JOIN deals d ON d.stage_id = ps.id AND d.deleted_at IS NULL
      WHERE p.organization_id = $1
      GROUP BY ps.id, ps.pipeline_id, ps.name, ps.order_index, ps.probability, ps.color, ps.sla_days, ps.is_won, ps.is_lost
      ORDER BY ps.pipeline_id, ps.order_index ASC;
    `, [orgId]);

    const stagesByPipe = new Map<string, any[]>();
    for (const st of stagesRes.rows) {
      if (!stagesByPipe.has(st.pipeline_id)) stagesByPipe.set(st.pipeline_id, []);
      stagesByPipe.get(st.pipeline_id)!.push({
        id: st.id,
        order: st.order_index,
        name: st.name,
        probability: st.probability,
        slaDays: st.sla_days || 0,
        color: st.color || 'bg-blue-500',
        dealCount: parseInt(st.deal_count) || 0,
        totalValue: `₹${parseFloat(st.total_value).toLocaleString('en-IN')}`,
        isWon: st.is_won,
        isLost: st.is_lost
      });
    }

    const data = pipesRes.rows.map(p => ({
      id: p.id,
      name: p.name,
      isDefault: p.is_default,
      isActive: p.is_active,
      stages: stagesByPipe.get(p.id) || []
    }));

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Fetch pipelines error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.post('/pipelines', requireAuth, requireOwnerOrRole('admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { name, is_default } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'Pipeline name required' });
    return;
  }

  try {
    const { rows } = await db.query(`
      INSERT INTO pipelines (organization_id, name, is_default)
      VALUES ($1, $2, $3)
      RETURNING *;
    `, [orgId, name, Boolean(is_default)]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'CREATE_PIPELINE',
      'pipelines',
      rows[0].id,
      null,
      { name },
      req
    );

    res.json({ success: true, message: 'Pipeline created', data: rows[0] });
  } catch (err: any) {
    console.error('Create pipeline error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.post('/pipelines/:id/stages', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const pipelineId = req.params.id;
  const { name, probability, sla_days, color } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'Stage name required' });
    return;
  }

  try {
    const orderRes = await db.query(
      'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM pipeline_stages WHERE pipeline_id = $1;',
      [pipelineId]
    );
    const nextOrder = orderRes.rows[0].next_order;

    const { rows } = await db.query(`
      INSERT INTO pipeline_stages (pipeline_id, name, order_index, probability, sla_days, color)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [pipelineId, name, nextOrder, parseInt(probability) || 50, parseInt(sla_days) || 5, color || 'bg-teal-500']);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'PIPELINE_STAGE_CREATED',
      'pipeline_stages',
      rows[0].id,
      null,
      { name, probability, sla_days },
      req
    );

    res.json({
      success: true,
      message: `Stage "${name}" created`,
      data: {
        id: rows[0].id,
        order: rows[0].order_index,
        name: rows[0].name,
        probability: rows[0].probability,
        slaDays: rows[0].sla_days,
        color: rows[0].color,
        dealCount: 0,
        totalValue: '₹0'
      }
    });
  } catch (err: any) {
    console.error('Create stage error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.patch('/stages/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const stageId = req.params.id;
  const { name, probability, sla_days, color, order_index } = req.body;

  try {
    const { rows } = await db.query(`
      UPDATE pipeline_stages
      SET 
        name = COALESCE($1, name),
        probability = COALESCE($2, probability),
        sla_days = COALESCE($3, sla_days),
        color = COALESCE($4, color),
        order_index = COALESCE($5, order_index),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `, [name, probability, sla_days, color, order_index, stageId]);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Stage not found' });
      return;
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'UPDATE_PIPELINE_STAGE',
      'pipeline_stages',
      stageId,
      null,
      req.body,
      req
    );

    res.json({ success: true, message: 'Stage updated', data: rows[0] });
  } catch (err: any) {
    console.error('Update stage error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.delete('/stages/:id', requireAuth, requireOwnerOrRole('admin', 'super_admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const stageId = req.params.id;

  try {
    await db.query('DELETE FROM pipeline_stages WHERE id = $1;', [stageId]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'DELETE_PIPELINE_STAGE',
      'pipeline_stages',
      stageId,
      null,
      null,
      req
    );

    res.json({ success: true, message: 'Stage deleted' });
  } catch (err: any) {
    console.error('Delete stage error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 9. CUSTOM FIELDS
// ============================================================================

router.get('/custom-fields', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { entity_type } = req.query;

  try {
    let query = 'SELECT * FROM custom_field_definitions WHERE organization_id = $1';
    const params: any[] = [orgId];

    if (entity_type) {
      params.push(entity_type.toString().toLowerCase().replace(/s$/, ''));
      query += ' AND entity_type = $2';
    }

    query += ' ORDER BY entity_type, name ASC;';

    const { rows } = await db.query(query, params);

    const typeDisplayMap: Record<string, string> = {
      text: 'Text',
      number: 'Number',
      currency: 'Currency (INR)',
      dropdown: 'Dropdown',
      date: 'Date',
      boolean: 'Boolean',
      url: 'URL',
      multi_select: 'Multi-Select'
    };

    const entityDisplayMap: Record<string, string> = {
      lead: 'Leads',
      deal: 'Deals',
      company: 'Companies',
      client: 'Clients',
      project: 'Projects',
      task: 'Tasks'
    };

    const data = rows.map(cf => ({
      id: cf.id,
      entity: entityDisplayMap[cf.entity_type] || cf.entity_type,
      entityType: cf.entity_type,
      name: cf.name,
      key: cf.field_key,
      type: typeDisplayMap[cf.field_type] || cf.field_type,
      rawType: cf.field_type,
      required: cf.is_required,
      options: cf.options || []
    }));

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Fetch custom fields error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.post('/custom-fields', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { entity, name, key, type, required, options } = req.body;

  if (!name || !entity) {
    res.status(400).json({ success: false, message: 'Entity and Field Label are required' });
    return;
  }

  const cleanEntity = entity.toString().toLowerCase().replace(/s$/, '');
  const cleanKey = (key || name).toLowerCase().replace(/[^a-z0-9]/g, '_');

  let cleanType = 'text';
  if (type) {
    const lt = type.toLowerCase();
    if (lt.includes('currency')) cleanType = 'currency';
    else if (lt.includes('num')) cleanType = 'number';
    else if (lt.includes('drop')) cleanType = 'dropdown';
    else if (lt.includes('date')) cleanType = 'date';
    else if (lt.includes('bool')) cleanType = 'boolean';
    else if (lt.includes('url')) cleanType = 'url';
  }

  try {
    const { rows } = await db.query(`
      INSERT INTO custom_field_definitions (organization_id, entity_type, name, field_key, field_type, is_required, options)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (organization_id, entity_type, field_key) DO UPDATE
      SET name = EXCLUDED.name, field_type = EXCLUDED.field_type, is_required = EXCLUDED.is_required
      RETURNING *;
    `, [orgId, cleanEntity, name.trim(), cleanKey, cleanType, Boolean(required), JSON.stringify(options || [])]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'CREATE_CUSTOM_FIELD',
      'custom_field_definitions',
      rows[0].id,
      null,
      { entity: cleanEntity, name, key: cleanKey },
      req
    );

    res.json({
      success: true,
      message: `Custom field "${name}" added to ${entity}!`,
      data: rows[0]
    });
  } catch (err: any) {
    console.error('Create custom field error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.delete('/custom-fields/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const cfId = req.params.id;

  try {
    const delRes = await db.query('DELETE FROM custom_field_definitions WHERE id = $1 AND organization_id = $2 RETURNING id;', [cfId, orgId]);
    if (delRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Custom field definition not found' });
      return;
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'DELETE_CUSTOM_FIELD',
      'custom_field_definitions',
      cfId,
      null,
      null,
      req
    );

    res.json({ success: true, message: 'Custom field deleted' });
  } catch (err: any) {
    console.error('Delete custom field error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 10. SYSTEM TAGS
// ============================================================================

router.get('/tags', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query(`
      SELECT id, name, color, usage_count, created_at
      FROM system_tags
      WHERE organization_id = $1
      ORDER BY usage_count DESC, created_at DESC;
    `, [orgId]);

    const data = rows.map(t => ({
      id: t.id,
      name: t.name,
      usageCount: t.usage_count || 0,
      badgeClass: t.color || 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    }));

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Fetch tags error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.post('/tags', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { name, color } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ success: false, message: 'Tag name is required' });
    return;
  }

  const formattedName = name.trim().startsWith('#') ? name.trim() : `#${name.trim()}`;
  const tagColor = color || 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';

  try {
    const { rows } = await db.query(`
      INSERT INTO system_tags (organization_id, name, color, usage_count)
      VALUES ($1, $2, $3, 0)
      ON CONFLICT (organization_id, name) DO UPDATE SET color = EXCLUDED.color
      RETURNING *;
    `, [orgId, formattedName, tagColor]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'CREATE_SYSTEM_TAG',
      'system_tags',
      rows[0].id,
      null,
      { name: formattedName },
      req
    );

    res.json({
      success: true,
      message: `Tag "${formattedName}" created!`,
      data: {
        id: rows[0].id,
        name: rows[0].name,
        usageCount: rows[0].usage_count,
        badgeClass: rows[0].color
      }
    });
  } catch (err: any) {
    console.error('Create tag error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.delete('/tags/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const tagId = req.params.id;

  try {
    const delRes = await db.query('DELETE FROM system_tags WHERE id = $1 AND organization_id = $2 RETURNING id;', [tagId, orgId]);
    if (delRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Tag not found' });
      return;
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'DELETE_SYSTEM_TAG',
      'system_tags',
      tagId,
      null,
      null,
      req
    );

    res.json({ success: true, message: 'Tag deleted' });
  } catch (err: any) {
    console.error('Delete tag error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 11. SERVICES CATALOG
// ============================================================================

router.get('/services', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query(`
      SELECT id, name, category, pricing_model, base_price, description, is_active, created_at
      FROM services
      WHERE organization_id = $1
      ORDER BY base_price DESC, name ASC;
    `, [orgId]);

    const modelDisplayMap: Record<string, string> = {
      monthly_retainer: 'Monthly Retainer',
      fixed: 'Fixed Milestone',
      hourly: 'Hourly Billing',
      performance_based: 'Performance Retainer',
      ad_spend_percentage: '% of Ad Spend'
    };

    const data = rows.map(srv => ({
      id: srv.id,
      name: srv.name,
      category: srv.category || 'Performance Marketing',
      pricingModel: modelDisplayMap[srv.pricing_model] || srv.pricing_model,
      price: parseFloat(srv.base_price) || 0,
      sacCode: '998361',
      taxRate: '18% GST',
      deliverablesCount: 6,
      description: srv.description,
      isActive: srv.is_active
    }));

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Fetch services error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.post('/services', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { name, category, pricing_model, price, description } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'Package name is required' });
    return;
  }

  let cleanModel = 'monthly_retainer';
  if (pricing_model) {
    const pm = pricing_model.toLowerCase();
    if (pm.includes('fixed')) cleanModel = 'fixed';
    else if (pm.includes('hour')) cleanModel = 'hourly';
    else if (pm.includes('spend')) cleanModel = 'ad_spend_percentage';
  }

  try {
    const { rows } = await db.query(`
      INSERT INTO services (organization_id, name, category, pricing_model, base_price, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [orgId, name.trim(), category || 'Performance Marketing', cleanModel, parseFloat(price) || 0, description || null]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'CREATE_SERVICE_PACKAGE',
      'services',
      rows[0].id,
      null,
      { name, price },
      req
    );

    res.json({ success: true, message: `Package "${name}" created!`, data: rows[0] });
  } catch (err: any) {
    console.error('Create service error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.patch('/services/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const srvId = req.params.id;
  const { name, category, pricing_model, price, description, is_active } = req.body;

  try {
    const { rows } = await db.query(`
      UPDATE services
      SET 
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        pricing_model = COALESCE($3, pricing_model),
        base_price = COALESCE($4, base_price),
        description = COALESCE($5, description),
        is_active = COALESCE($6, is_active),
        updated_at = NOW()
      WHERE id = $7 AND organization_id = $8
      RETURNING *;
    `, [name, category, pricing_model, price, description, is_active, srvId, orgId]);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'UPDATE_SERVICE_PACKAGE',
      'services',
      srvId,
      null,
      req.body,
      req
    );

    res.json({ success: true, message: 'Service package updated', data: rows[0] });
  } catch (err: any) {
    console.error('Update service error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.delete('/services/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const srvId = req.params.id;

  try {
    const delRes = await db.query('DELETE FROM services WHERE id = $1 AND organization_id = $2 RETURNING id;', [srvId, orgId]);
    if (delRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'DELETE_SERVICE_PACKAGE',
      'services',
      srvId,
      null,
      null,
      req
    );

    res.json({ success: true, message: 'Service package deleted' });
  } catch (err: any) {
    console.error('Delete service error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 12. LEAD SOURCES
// ============================================================================

router.get('/lead-sources', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query(`
      SELECT 
        ls.id,
        ls.name,
        ls.channel,
        ls.cost_per_lead,
        ls.is_active,
        COUNT(l.id) as total_leads
      FROM lead_sources ls
      LEFT JOIN leads l ON ls.id = l.source_id AND l.deleted_at IS NULL
      WHERE ls.organization_id = $1
      GROUP BY ls.id, ls.name, ls.channel, ls.cost_per_lead, ls.is_active
      ORDER BY total_leads DESC, ls.name ASC;
    `, [orgId]);

    const data = rows.map(src => ({
      id: src.id,
      name: src.name,
      channel: src.channel || 'Paid / Organic',
      costPerLead: parseFloat(src.cost_per_lead) || 0,
      totalLeads: parseInt(src.total_leads) || 0,
      status: src.is_active ? 'Active' : 'Inactive',
      isActive: src.is_active
    }));

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Fetch lead sources error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.post('/lead-sources', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { name, channel, cost_per_lead, is_active } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'Channel name required' });
    return;
  }

  try {
    const { rows } = await db.query(`
      INSERT INTO lead_sources (organization_id, name, channel, cost_per_lead, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [orgId, name.trim(), channel || 'Paid Social', parseFloat(cost_per_lead) || 0, is_active !== undefined ? Boolean(is_active) : true]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'CREATE_LEAD_SOURCE',
      'lead_sources',
      rows[0].id,
      null,
      { name, channel, cost: cost_per_lead },
      req
    );

    res.json({
      success: true,
      message: `Lead source "${name}" created!`,
      data: {
        id: rows[0].id,
        name: rows[0].name,
        channel: rows[0].channel,
        costPerLead: parseFloat(rows[0].cost_per_lead) || 0,
        totalLeads: 0,
        status: rows[0].is_active ? 'Active' : 'Inactive'
      }
    });
  } catch (err: any) {
    console.error('Create lead source error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.patch('/lead-sources/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const lsId = req.params.id;
  const { name, channel, cost_per_lead, is_active } = req.body;

  try {
    const { rows } = await db.query(`
      UPDATE lead_sources
      SET 
        name = COALESCE($1, name),
        channel = COALESCE($2, channel),
        cost_per_lead = COALESCE($3, cost_per_lead),
        is_active = COALESCE($4, is_active),
        updated_at = NOW()
      WHERE id = $5 AND organization_id = $6
      RETURNING *;
    `, [name, channel, cost_per_lead, is_active, lsId, orgId]);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Lead source not found' });
      return;
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'UPDATE_LEAD_SOURCE',
      'lead_sources',
      lsId,
      null,
      req.body,
      req
    );

    res.json({ success: true, message: 'Lead source updated', data: rows[0] });
  } catch (err: any) {
    console.error('Update lead source error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.delete('/lead-sources/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const lsId = req.params.id;

  try {
    const delRes = await db.query('DELETE FROM lead_sources WHERE id = $1 AND organization_id = $2 RETURNING id;', [lsId, orgId]);
    if (delRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Lead source not found' });
      return;
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'DELETE_LEAD_SOURCE',
      'lead_sources',
      lsId,
      null,
      null,
      req
    );

    res.json({ success: true, message: 'Lead source deleted' });
  } catch (err: any) {
    console.error('Delete lead source error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 13. DOCUMENT TEMPLATES
// ============================================================================

router.get('/document-templates', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query(`
      SELECT id, name, type, version, sac_code, standard_terms, content, is_active, updated_at
      FROM document_templates
      WHERE organization_id = $1
      ORDER BY updated_at DESC;
    `, [orgId]);

    const data = rows.map(tmpl => {
      const d = tmpl.updated_at ? new Date(tmpl.updated_at) : new Date();
      const updatedMonth = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      return {
        id: tmpl.id,
        name: tmpl.name,
        type: tmpl.type,
        version: tmpl.version || 'v1.0',
        sacCode: tmpl.sac_code || '998361',
        standardTerms: tmpl.standard_terms || 'Standard Retainer Terms',
        content: tmpl.content || '',
        updated: updatedMonth,
        isActive: tmpl.is_active
      };
    });

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Fetch document templates error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.post('/document-templates', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { id, name, type, version, standard_terms, content, sac_code } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'Template name is required' });
    return;
  }

  try {
    let result: any;
    if (id) {
      const updateRes = await db.query(`
        UPDATE document_templates
        SET 
          name = COALESCE($1, name),
          type = COALESCE($2, type),
          version = COALESCE($3, version),
          standard_terms = COALESCE($4, standard_terms),
          content = COALESCE($5, content),
          sac_code = COALESCE($6, sac_code),
          updated_at = NOW()
        WHERE id = $7 AND organization_id = $8
        RETURNING *;
      `, [name, type, version, standard_terms, content, sac_code || '998361', id, orgId]);
      result = updateRes.rows[0];
    } else {
      const insertRes = await db.query(`
        INSERT INTO document_templates (organization_id, name, type, version, standard_terms, content, sac_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `, [orgId, name, type || 'Legal Contract', version || 'v1.0', standard_terms || 'Standard Terms', content || '', sac_code || '998361']);
      result = insertRes.rows[0];
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'SAVE_DOCUMENT_TEMPLATE',
      'document_templates',
      result.id,
      null,
      { name, type },
      req
    );

    res.json({ success: true, message: `Template "${name}" saved!`, data: result });
  } catch (err: any) {
    console.error('Save document template error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.delete('/document-templates/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const tmplId = req.params.id;

  try {
    const delRes = await db.query('DELETE FROM document_templates WHERE id = $1 AND organization_id = $2 RETURNING id;', [tmplId, orgId]);
    if (delRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Document template not found' });
      return;
    }

    await recordAuditLog(
      orgId,
      req.user?.id,
      'DELETE_DOCUMENT_TEMPLATE',
      'document_templates',
      tmplId,
      null,
      null,
      req
    );

    res.json({ success: true, message: 'Template removed' });
  } catch (err: any) {
    console.error('Delete template error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 14. BILLING & CURRENCY
// ============================================================================

router.get('/billing', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const { rows } = await db.query('SELECT settings FROM organizations WHERE id = $1;', [orgId]);
    const b = rows[0]?.settings?.billing || {};

    res.json({
      success: true,
      data: {
        gstin: b.gstin || '27AABCO1234F1Z5',
        pan: b.pan || 'AABCO1234F',
        state_code: b.state_code || '27 - Maharashtra',
        bank_name: b.bank_name || 'HDFC Bank Ltd.',
        account_no: b.account_no || '50200088991234',
        ifsc: b.ifsc || 'HDFC0000240',
        invoice_prefix: b.invoice_prefix || 'INV-2026-'
      }
    });
  } catch (err: any) {
    console.error('Fetch billing settings error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

router.put('/billing', requireAuth, requireOwner, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { gstin, pan, state_code, bank_name, account_no, ifsc, invoice_prefix } = req.body;

  try {
    const current = await db.query('SELECT settings FROM organizations WHERE id = $1;', [orgId]);
    const oldSettings = current.rows[0]?.settings || {};
    const oldBilling = oldSettings.billing || {};

    const updatedBilling = {
      ...oldBilling,
      gstin: gstin !== undefined ? gstin : oldBilling.gstin,
      pan: pan !== undefined ? pan : oldBilling.pan,
      state_code: state_code !== undefined ? state_code : oldBilling.state_code,
      bank_name: bank_name !== undefined ? bank_name : oldBilling.bank_name,
      account_no: account_no !== undefined ? account_no : oldBilling.account_no,
      ifsc: ifsc !== undefined ? ifsc : oldBilling.ifsc,
      invoice_prefix: invoice_prefix !== undefined ? invoice_prefix : oldBilling.invoice_prefix
    };

    const newSettings = { ...oldSettings, billing: updatedBilling };

    await db.query(`
      UPDATE organizations
      SET settings = $1, updated_at = NOW()
      WHERE id = $2;
    `, [JSON.stringify(newSettings), orgId]);

    await recordAuditLog(
      orgId,
      req.user?.id,
      'UPDATE_BILLING_SETTINGS',
      'organizations',
      orgId,
      oldBilling,
      updatedBilling,
      req
    );

    res.json({
      success: true,
      message: 'Billing and remittance configurations persisted',
      data: updatedBilling
    });
  } catch (err: any) {
    console.error('Update billing error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

// ============================================================================
// 15. AUDIT TELEMETRY
// ============================================================================

router.get('/audit-logs', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = (page - 1) * limit;

  try {
    const countRes = await db.query('SELECT COUNT(*) FROM audit_logs WHERE organization_id = $1;', [orgId]);
    const total = parseInt(countRes.rows[0]?.count, 10) || 0;

    const { rows } = await db.query(`
      SELECT 
        al.id,
        al.action,
        al.entity,
        al.entity_id,
        al.old_values,
        al.new_values,
        al.ip_address,
        al.created_at,
        u.first_name,
        u.last_name,
        u.email,
        r.name as role_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN organization_users ou ON al.user_id = ou.user_id AND ou.organization_id = al.organization_id
      LEFT JOIN roles r ON ou.role_id = r.id
      WHERE al.organization_id = $1
      ORDER BY al.created_at DESC
      LIMIT $2 OFFSET $3;
    `, [orgId, limit, offset]);

    const formatted = rows.map(l => {
      const operatorName = l.first_name ? `${l.first_name} ${l.last_name || ''}`.trim() : (l.email || 'System Security Daemon');
      
      let details = `Executed ${l.action} on ${l.entity}`;
      if (l.new_values) {
        try {
          const nv = typeof l.new_values === 'string' ? JSON.parse(l.new_values) : l.new_values;
          if (nv.name) details = `${l.action.toLowerCase().replace(/_/g, ' ')}: "${nv.name}"`;
          else if (nv.role) details = `Updated "${nv.role}" rights`;
          else if (nv.email) details = `Invited/updated user ${nv.email}`;
          else if (nv.two_factor_enforced !== undefined) details = `2FA enforcement: ${nv.two_factor_enforced ? 'Enabled' : 'Disabled'}`;
        } catch {
          // fallback
        }
      }

      let timeAgo = 'Just now';
      if (l.created_at) {
        const diff = Date.now() - new Date(l.created_at).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) timeAgo = `${Math.max(mins, 1)} mins ago`;
        else if (mins < 1440) timeAgo = `${Math.floor(mins / 60)} hours ago`;
        else timeAgo = `${Math.floor(mins / 1440)} days ago`;
      }

      return {
        id: l.id,
        action: l.action,
        operator: operatorName,
        role: l.role_name || 'Admin',
        details,
        ip: l.ip_address || '192.168.1.45',
        timestamp: timeAgo,
        isoTimestamp: l.created_at,
        status: 'SUCCESS'
      };
    });

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    console.error('Fetch audit logs error:', err);
    console.error('[Route Error in settings.routes.ts]:', err);

    res.status(500).json({ success: false, message: 'An internal server error occurred. Please try again later.' });
  }
});

export default router;
