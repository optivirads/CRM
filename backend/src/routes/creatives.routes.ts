import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { StorageService } from '../services/storage.service';
import { WatermarkService } from '../services/watermark.service';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { EmailService } from '../services/email.service';
import { otpRateLimiter } from '../middleware/rateLimiter';
import { isGlobalLeadership } from '../utils/accessControl';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB limit
  }
});

const router = Router();

// Helper to hash proof tokens
function hashProofToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

// Client Proof OTP Session Helpers
function signClientProofSession(tokenHash: string, email: string, name?: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable must be configured.');
  }
  return jwt.sign(
    {
      scope: 'client_proof',
      tokenHash,
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0],
    },
    secret,
    { expiresIn: '7d' }
  );
}

function verifyClientProofSession(sessionToken: string | undefined, tokenHash: string): { email: string; name: string } | null {
  if (!sessionToken) return null;
  try {
    const cleanToken = sessionToken.startsWith('Bearer ') ? sessionToken.slice(7) : sessionToken;
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const decoded = jwt.verify(cleanToken, secret) as any;
    if (decoded.scope === 'client_proof' && decoded.tokenHash === tokenHash) {
      return { email: decoded.email, name: decoded.name };
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to query Creator & Manager recipients for email notifications
async function getCreativeCreatorAndManager(creativeId: string, orgId: string, shareCreatedBy?: string) {
  try {
    const query = `
      SELECT
        c.id, c.name, c.campaign_name, c.target_platform,
        u_designer.id as designer_user_id, u_designer.email as designer_email, u_designer.first_name as designer_first, u_designer.last_name as designer_last,
        u_creator.id as creator_user_id, u_creator.email as creator_email, u_creator.first_name as creator_first, u_creator.last_name as creator_last,
        u_pm.id as pm_user_id, u_pm.email as pm_email, u_pm.first_name as pm_first, u_pm.last_name as pm_last,
        u_am.id as am_user_id, u_am.email as am_email, u_am.first_name as am_first, u_am.last_name as am_last,
        u_sharer.id as sharer_user_id, u_sharer.email as sharer_email, u_sharer.first_name as sharer_first, u_sharer.last_name as sharer_last
      FROM creatives c
      LEFT JOIN users u_designer ON c.designer_id = u_designer.id
      LEFT JOIN users u_creator ON c.created_by = u_creator.id
      LEFT JOIN projects p ON c.project_id = p.id
      LEFT JOIN users u_pm ON p.project_manager_id = u_pm.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u_am ON cl.account_manager_id = u_am.id
      LEFT JOIN users u_sharer ON u_sharer.id = $2
      WHERE c.id = $1
    `;
    const res = await db.query(query, [creativeId, shareCreatedBy || null]);
    if (res.rows.length === 0) return { creative: null, recipients: [] };

    const row = res.rows[0];
    const recipients: Array<{ email: string; name?: string; role: 'CREATOR' | 'MANAGER' | 'TEAM'; userId?: string }> = [];

    // 1. Creator: designer_id or created_by
    if (row.designer_email) {
      recipients.push({
        email: row.designer_email,
        name: `${row.designer_first || ''} ${row.designer_last || ''}`.trim() || 'Creative Creator',
        role: 'CREATOR',
        userId: row.designer_user_id,
      });
    } else if (row.creator_email) {
      recipients.push({
        email: row.creator_email,
        name: `${row.creator_first || ''} ${row.creator_last || ''}`.trim() || 'Creative Creator',
        role: 'CREATOR',
        userId: row.creator_user_id,
      });
    }

    // 2. Manager: project_manager_id or account_manager_id or shareCreatedBy
    if (row.pm_email) {
      recipients.push({
        email: row.pm_email,
        name: `${row.pm_first || ''} ${row.pm_last || ''}`.trim() || 'Project Manager',
        role: 'MANAGER',
        userId: row.pm_user_id,
      });
    } else if (row.am_email) {
      recipients.push({
        email: row.am_email,
        name: `${row.am_first || ''} ${row.am_last || ''}`.trim() || 'Account Manager',
        role: 'MANAGER',
        userId: row.am_user_id,
      });
    } else if (row.sharer_email) {
      recipients.push({
        email: row.sharer_email,
        name: `${row.sharer_first || ''} ${row.sharer_last || ''}`.trim() || 'Manager',
        role: 'MANAGER',
        userId: row.sharer_user_id,
      });
    }

    // Fallback if none found
    if (recipients.length === 0) {
      const fallback = await db.query(
        `SELECT u.id, u.email, u.first_name, u.last_name
         FROM organization_users ou
         JOIN users u ON ou.user_id = u.id
         WHERE ou.organization_id = $1
         LIMIT 2`,
        [orgId]
      );
      for (const u of fallback.rows) {
        if (u.email) {
          recipients.push({
            email: u.email,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Agency Admin',
            role: 'TEAM',
            userId: u.id,
          });
        }
      }
    }

    return {
      creative: {
        id: row.id,
        name: row.name,
        campaign_name: row.campaign_name,
        target_platform: row.target_platform,
      },
      recipients,
    };
  } catch (err) {
    console.error('[Notification Helper Error]:', err);
    return { creative: null, recipients: [] };
  }
}

async function createInAppNotification(
  orgId: string,
  title: string,
  message: string,
  type: string,
  creativeId: string,
  metadata: any = {},
  recipientUserIds: string[] = []
) {
  try {
    let targetUserIds = recipientUserIds.filter(Boolean);
    if (targetUserIds.length === 0) {
      const orgUsers = await db.query(
        `SELECT user_id FROM organization_users WHERE organization_id = $1 LIMIT 5`,
        [orgId]
      );
      targetUserIds = orgUsers.rows.map(r => r.user_id);
    }

    const uniqueIds = Array.from(new Set(targetUserIds));
    const notifLink = `/creatives?id=${creativeId}`;
    for (const uId of uniqueIds) {
      await db.query(
        `INSERT INTO notifications (organization_id, user_id, title, message, link, type, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, false)`,
        [orgId, uId, title, message, notifLink, type]
      );
    }
  } catch (err) {
    console.error('[In-App Notification Error]:', err);
  }
}

/**
 * Notifies the assigned user of a task when a creative script or creative details are added/updated
 */
async function notifyTaskAssigneeOnCreativeEvent({
  orgId,
  taskId,
  creativeId,
  creativeName,
  actorName,
  actorId,
  event,
  scriptSnippet
}: {
  orgId: string;
  taskId: string;
  creativeId: string;
  creativeName: string;
  actorName: string;
  actorId: string;
  event: 'script_added' | 'script_updated' | 'details_added';
  scriptSnippet?: string | null;
}) {
  try {
    const taskRes = await db.query(
      `SELECT t.id, t.title, t.assignee_id, u.email as assignee_email, u.first_name as assignee_first_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.id = $1 AND t.organization_id = $2 AND t.deleted_at IS NULL`,
      [taskId, orgId]
    );
    if (taskRes.rows.length === 0) return;
    const task = taskRes.rows[0];

    // Determine target users to notify:
    // If task has an assigned user (and not the actor), notify them.
    // If task has no assignee yet, notify all internal organization team members so they know script was added!
    let targetUserIds: string[] = [];
    if (task.assignee_id && task.assignee_id !== actorId) {
      targetUserIds.push(task.assignee_id);
    } else if (!task.assignee_id) {
      const orgUsers = await db.query(
        `SELECT user_id FROM organization_users WHERE organization_id = $1 AND user_id != $2`,
        [orgId, actorId]
      );
      targetUserIds = orgUsers.rows.map(r => r.user_id);
    }

    if (targetUserIds.length === 0) return;

    let title = '';
    let message = '';
    if (event === 'script_added') {
      title = `📝 Creative Script Added: ${creativeName}`;
      message = `${actorName} added a creative script for task "${task.title}".`;
    } else if (event === 'script_updated') {
      title = `📝 Creative Script Updated: ${creativeName}`;
      message = `${actorName} updated the creative script/concept for task "${task.title}".`;
    } else {
      title = `🎨 Creative Details Added: ${creativeName}`;
      message = `${actorName} added creative details for task "${task.title}".`;
    }

    if (scriptSnippet && typeof scriptSnippet === 'string' && scriptSnippet.trim()) {
      const cleanSnippet = scriptSnippet.trim().replace(/\s+/g, ' ').slice(0, 120);
      message += ` Script: "${cleanSnippet}${scriptSnippet.trim().length > 120 ? '...' : ''}"`;
    }

    const notifLink = `/?tab=tasks&id=${task.id}`;

    for (const uId of targetUserIds) {
      // 1. In-App Notification (renders in user notifications)
      await db.query(
        `INSERT INTO notifications (organization_id, user_id, title, message, link, type, is_read)
         VALUES ($1, $2, $3, $4, $5, 'task_creative_script', false)`,
        [orgId, uId, title, message, notifLink]
      );
    }

    // 2. Activity Feed (renders in Activity timeline & bell)
    await db.query(
      `INSERT INTO activities (organization_id, type, subject, description, completed_at)
       VALUES ($1, 'Task', $2, $3, NOW())`,
      [orgId, title, message]
    );
  } catch (err) {
    console.error('[Creative Task Assignee Notification Error]:', err);
  }
}

/**
 * Access Control Helper:
 * Determines if user has global org-level creative access or client-scoped access
 */
function isGlobalRole(role?: string, isOwner?: boolean): boolean {
  if (isOwner) return true;
  const globalRoles = [
    'owner',
    'coo',
    'admin',
    'super_admin',
    'marketing_lead',
    'operations_lead',
    'creative_lead',
    'creative_director',
    'assistant',
    'account_assistant',
    'executive_assistant',
    'marketing_assistant',
    'operations_assistant',
    'designer',
    'video_editor',
    'account_manager',
    'lead'
  ];
  return Boolean(role && globalRoles.includes(role.toLowerCase()));
}

/**
 * Generates SQL scope filter for creatives based on user identity & client assignments
 */
function buildCreativeScopeClause(req: AuthenticatedRequest, params: any[], tablePrefix = 'c'): string {
  const user = req.user!;
  
  // 1. Client Portal Role: Strictly limited to their single associated client
  if (user.role === 'client_portal' || user.clientId) {
    params.push(user.clientId);
    return ` AND ${tablePrefix}.client_id = $${params.length}`;
  }

  // 2. All internal agency team members in this organization have access to view and collaborate on creatives & scripts
  return '';
}

// ---------------------------------------------------------------------------
// 12. PUBLIC CLIENT PORTAL PROOFING ENDPOINTS (OTP Gated & Team Notified)
// ---------------------------------------------------------------------------

// 12.1. Request OTP for Client Proof Portal
router.post('/public/proofs/:token/request-otp', otpRateLimiter, async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  let { email, name } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    return;
  }

  try {
    const tokenHash = hashProofToken(token);
    const linkRes = await db.query(
      `SELECT sl.*, c.name as creative_name, c.client_id, cl.company_id, co.name as client_name, o.name as organization_name
       FROM creative_share_links sl
       JOIN creatives c ON sl.creative_id = c.id
       LEFT JOIN clients cl ON c.client_id = cl.id
       LEFT JOIN companies co ON cl.company_id = co.id
       JOIN organizations o ON sl.organization_id = o.id
       WHERE sl.token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at || (linkRes.rows[0].expires_at && new Date(linkRes.rows[0].expires_at) < new Date())) {
      res.status(403).json({ success: false, message: 'This client review link is invalid or has expired.' });
      return;
    }

    const shareLink = linkRes.rows[0];
    const clientEmail = email.trim().toLowerCase();

    // Verify client authorization against registered client contacts
    if (shareLink.company_id) {
      let isAuthorized = false;

      // Check 1: Recipient email on share link
      if (shareLink.recipient_email && shareLink.recipient_email.trim().toLowerCase() === clientEmail) {
        isAuthorized = true;
      }

      // Check 2: Database contacts for this client company
      if (!isAuthorized) {
        const contactsRes = await db.query(
          `SELECT email, first_name, last_name FROM contacts
           WHERE (company_id = $1 OR company_id IN (SELECT id FROM companies WHERE LOWER(TRIM(name)) = $2))
             AND deleted_at IS NULL AND email IS NOT NULL AND email != ''`,
          [shareLink.company_id, (shareLink.client_name || '').trim().toLowerCase()]
        );

        if (contactsRes.rows.length > 0) {
          const allowedEmails = contactsRes.rows.map((r: any) => r.email.toLowerCase().trim());
          if (allowedEmails.includes(clientEmail)) {
            isAuthorized = true;
            if (!name) {
              const match = contactsRes.rows.find((r: any) => r.email.toLowerCase().trim() === clientEmail);
              if (match) name = `${match.first_name || ''} ${match.last_name || ''}`.trim();
            }
          } else {
            // Corporate domain matching
            const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
            const inputDomain = clientEmail.split('@')[1];
            if (inputDomain && !freeDomains.includes(inputDomain)) {
              const companyDomains = allowedEmails
                .map((e: string) => e.split('@')[1])
                .filter((d: string) => d && !freeDomains.includes(d));
              if (companyDomains.includes(inputDomain)) {
                isAuthorized = true;
              }
            }
          }

          if (!isAuthorized) {
            res.status(403).json({
              success: false,
              message: `Access restricted: "${email}" is not listed as an authorized contact for ${shareLink.client_name || 'this client'}. Please select from the client contact list or contact your account manager.`
            });
            return;
          }
        }
      }
    }

    // Generate cryptographically secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();

    // Store in database with 10-minute expiry
    await db.query(
      `INSERT INTO creative_proof_otps (share_link_id, email, otp_code, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
      [shareLink.id, clientEmail, otpCode]
    );

    // Send OTP email via Gmail
    const sent = await EmailService.sendProofOtpEmail({
      toEmail: clientEmail,
      otpCode,
      creativeName: shareLink.creative_name,
      agencyName: shareLink.organization_name,
    });

    if (!sent) {
      res.status(500).json({
        success: false,
        message: `Failed to dispatch verification email to ${clientEmail}. Please check that your email is valid or try again.`
      });
      return;
    }

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${clientEmail}.`,
      emailSent: true,
    });
  } catch (err: any) {
    console.error('[Request Proof OTP Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to send verification code'});
  }
});

// 12.2. Verify OTP & Issue Client Proof Session Token
router.post('/public/proofs/:token/verify-otp', otpRateLimiter, async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { email, otp, name } = req.body;

  if (!email || !otp) {
    res.status(400).json({ success: false, message: 'Email and 6-digit verification code are required.' });
    return;
  }

  try {
    const tokenHash = hashProofToken(token);
    const linkRes = await db.query(
      `SELECT * FROM creative_share_links WHERE token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at || (linkRes.rows[0].expires_at && new Date(linkRes.rows[0].expires_at) < new Date())) {
      res.status(403).json({ success: false, message: 'This review link is invalid or has expired.' });
      return;
    }

    const shareLink = linkRes.rows[0];
    const clientEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Fetch active OTP record for this share link and email
    const activeOtpRes = await db.query(
      `SELECT * FROM creative_proof_otps
       WHERE share_link_id = $1 AND LOWER(email) = $2 AND verified_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [shareLink.id, clientEmail]
    );

    if (activeOtpRes.rows.length === 0) {
      res.status(400).json({ success: false, message: 'No active verification code found or code has expired. Please request a new code.' });
      return;
    }

    const otpRecord = activeOtpRes.rows[0];

    // Check maximum attempts limit (Lockout after 5 failed tries)
    if ((otpRecord.attempts || 0) >= 5) {
      await db.query(`UPDATE creative_proof_otps SET expires_at = NOW() WHERE id = $1`, [otpRecord.id]);
      res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. This verification code has been invalidated for security. Please request a new code.'
      });
      return;
    }

    // Verify OTP code match
    if (otpRecord.otp_code !== cleanOtp) {
      const updatedAttempts = (otpRecord.attempts || 0) + 1;
      await db.query(
        `UPDATE creative_proof_otps SET attempts = $1 WHERE id = $2`,
        [updatedAttempts, otpRecord.id]
      );
      const remaining = Math.max(0, 5 - updatedAttempts);
      if (remaining === 0) {
        await db.query(`UPDATE creative_proof_otps SET expires_at = NOW() WHERE id = $1`, [otpRecord.id]);
      }
      res.status(400).json({
        success: false,
        message: remaining > 0
          ? `Invalid verification code. ${remaining} attempt(s) remaining.`
          : 'Too many incorrect attempts. This code has been invalidated. Please request a new code.'
      });
      return;
    }

    // Mark verified
    await db.query(
      `UPDATE creative_proof_otps SET verified_at = NOW() WHERE id = $1`,
      [otpRecord.id]
    );

    const clientName = name?.trim() || shareLink.recipient_name || clientEmail.split('@')[0];
    const sessionToken = signClientProofSession(tokenHash, clientEmail, clientName);

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      sessionToken,
      client: {
        email: clientEmail,
        name: clientName,
      },
    });
  } catch (err: any) {
    console.error('[Verify Proof OTP Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to verify code'});
  }
});

// 12.3. Validate Token & Load Proof for Client (OTP Protected)
router.get('/public/proofs/:token', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    const tokenHash = hashProofToken(token);

    // 1. Validate Share Link
    const linkRes = await db.query(
      `SELECT
        sl.*,
        o.name as organization_name,
        o.logo_url as organization_logo
      FROM creative_share_links sl
      JOIN organizations o ON sl.organization_id = o.id
      WHERE sl.token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Invalid or expired proof link' });
      return;
    }

    const shareLink = linkRes.rows[0];

    // Check if revoked
    if (shareLink.revoked_at) {
      res.status(403).json({ success: false, message: 'This client proofing link has been revoked by the agency.' });
      return;
    }

    // Check expiration
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      res.status(403).json({ success: false, message: 'This client proofing link has expired.' });
      return;
    }

    // 2. Fetch Creative & Proof Details
    const creativeRes = await db.query(
      `SELECT
        c.id, c.name, c.description, c.campaign_name, c.target_platform,
        c.ad_format, c.aspect_ratio, c.status, c.primary_ad_copy, c.headline,
        c.call_to_action, c.destination_url, c.approval_due_at,
        co.id as company_id, co.name as client_name
      FROM creatives c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies co ON cl.company_id = co.id
      WHERE c.id = $1`,
      [shareLink.creative_id]
    );

    const creative = creativeRes.rows[0];

    // 3. Check OTP Requirement Gate (Mandatory for client review, comments, and approvals)
    let verifiedClient: { email: string; name: string } | null = null;
    const sessionHeader = (req.headers['x-client-session'] || req.headers.authorization) as string | undefined;
    verifiedClient = verifyClientProofSession(sessionHeader, tokenHash);

    if (shareLink.require_otp !== false && !verifiedClient) {
      const authorizedContacts: Array<{
        id: string;
        name: string;
        email: string;
        designation?: string;
        isDecisionMaker?: boolean;
      }> = [];

      if (creative?.company_id) {
        const contactsRes = await db.query(
          `SELECT id, first_name, last_name, email, designation, role, is_decision_maker
           FROM contacts
           WHERE (company_id = $1 OR company_id IN (SELECT id FROM companies WHERE LOWER(TRIM(name)) = $2))
             AND deleted_at IS NULL AND email IS NOT NULL AND email != ''
           ORDER BY is_decision_maker DESC, first_name ASC`,
          [creative.company_id, (creative.client_name || '').trim().toLowerCase()]
        );

        for (const c of contactsRes.rows) {
          authorizedContacts.push({
            id: c.id,
            name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
            email: c.email.toLowerCase().trim(),
            designation: c.designation || c.role || 'Client Contact',
            isDecisionMaker: !!c.is_decision_maker,
          });
        }
      }

      if (shareLink.recipient_email && !authorizedContacts.some(c => c.email.toLowerCase() === shareLink.recipient_email.toLowerCase())) {
        authorizedContacts.unshift({
          id: 'share-recipient',
          name: shareLink.recipient_name || 'Invited Contact',
          email: shareLink.recipient_email.toLowerCase().trim(),
          designation: 'Invited Recipient',
          isDecisionMaker: true,
        });
      }

      // Return minimal public preview info so frontend shows the OTP Login gate
      res.json({
        success: true,
        requireOtp: true,
        clientName: creative?.client_name,
        authorizedContacts,
        shareLink: {
          id: shareLink.id,
          allowComments: shareLink.allow_comments,
          allowApprovals: shareLink.allow_approvals,
          expiresAt: shareLink.expires_at,
          organizationName: shareLink.organization_name,
          organizationLogo: shareLink.organization_logo,
          recipientEmail: shareLink.recipient_email,
          recipientName: shareLink.recipient_name,
        },
        creativeInfo: {
          name: creative?.name || 'Creative Deliverable',
          campaignName: creative?.campaign_name,
          targetPlatform: creative?.target_platform,
        }
      });
      return;
    }

    // Increment access count & update last_accessed_at
    await db.query(
      `UPDATE creative_share_links SET
        access_count = access_count + 1,
        last_accessed_at = NOW()
      WHERE id = $1`,
      [shareLink.id]
    );

    // 4. Fetch Proof Version
    const proofRes = await db.query(
      `SELECT * FROM creative_proofs WHERE id = $1`,
      [shareLink.proof_id]
    );

    const proof = proofRes.rows[0];

    // 5. Fetch Assets & Generate Short-Lived Signed Viewing URLs
    const assetsRes = await db.query(
      `SELECT * FROM creative_proof_assets WHERE proof_id = $1 ORDER BY slide_order ASC`,
      [proof.id]
    );

    const assets = await Promise.all(
      assetsRes.rows.map(async (asset) => {
        const deliverableKey = await WatermarkService.getOrGenerateWatermarkedKey(asset);
        const viewingUrl = await StorageService.generateViewingSignedUrl(deliverableKey, 7200); // 2 hours
        const thumbnailUrl = asset.thumbnail_storage_key
          ? await StorageService.generateViewingSignedUrl(asset.thumbnail_storage_key, 7200)
          : viewingUrl;

        return {
          id: asset.id,
          assetType: asset.asset_type,
          slideOrder: asset.slide_order,
          fileName: asset.file_name,
          mimeType: asset.mime_type,
          widthPx: asset.width_px,
          heightPx: asset.height_px,
          durationSeconds: asset.duration_seconds,
          viewingUrl,
          thumbnailUrl
        };
      })
    );

    // 6. Fetch Comments
    const commentsRes = await db.query(
      `SELECT
        id, asset_id, author_name, author_email, is_client_comment, content,
        pin_x_percent, pin_y_percent, timestamp_start_seconds,
        timestamp_end_seconds, is_resolved, created_at
      FROM creative_comments
      WHERE proof_id = $1
      ORDER BY created_at ASC`,
      [proof.id]
    );

    // 7. Fetch Existing Approvals
    const approvalsRes = await db.query(
      `SELECT id, decision, approver_name, approver_email, feedback_notes, signed_at
       FROM creative_approvals
       WHERE proof_id = $1
       ORDER BY signed_at DESC`,
      [proof.id]
    );

    res.json({
      success: true,
      requireOtp: false,
      clientSession: verifiedClient,
      shareLink: {
        id: shareLink.id,
        allowComments: shareLink.allow_comments,
        allowApprovals: shareLink.allow_approvals,
        expiresAt: shareLink.expires_at,
        organizationName: shareLink.organization_name,
        organizationLogo: shareLink.organization_logo
      },
      creative,
      proof: {
        id: proof.id,
        versionNumber: proof.version_number,
        title: proof.title,
        changeSummary: proof.change_summary,
        status: proof.status,
        assets,
        comments: commentsRes.rows,
        approvals: approvalsRes.rows
      }
    });
  } catch (err: any) {
    console.error('[Public Proof API] Error:', err);
    res.status(500).json({ success: false, message: 'Failed to load client proof'});
  }
});

// 12.4. PUBLIC CLIENT PROOF DOWNLOAD (STRICTLY WATERMARKED)
router.get('/public/proofs/:token/assets/:assetId/download', async (req: Request, res: Response): Promise<void> => {
  const { token, assetId } = req.params;

  try {
    const tokenHash = hashProofToken(token);

    const linkRes = await db.query(
      `SELECT sl.* FROM creative_share_links sl
       WHERE sl.token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Invalid or expired proof link' });
      return;
    }

    const shareLink = linkRes.rows[0];
    if (shareLink.revoked_at || (shareLink.expires_at && new Date(shareLink.expires_at) < new Date())) {
      res.status(403).json({ success: false, message: 'This proof link is inactive or expired' });
      return;
    }

    const assetRes = await db.query(
      `SELECT * FROM creative_proof_assets WHERE id = $1 AND proof_id = $2`,
      [assetId, shareLink.proof_id]
    );

    if (assetRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Proof asset not found' });
      return;
    }

    const asset = assetRes.rows[0];

    const watermarked = await WatermarkService.createWatermarkedAsset({
      storageKey: asset.storage_key,
      fileName: asset.file_name,
      assetType: asset.asset_type,
      mimeType: asset.mime_type
    });

    res.setHeader('Content-Type', watermarked.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${watermarked.fileName}"`);

    const readStream = fs.createReadStream(watermarked.filePath);
    readStream.pipe(res);
    readStream.on('close', () => watermarked.cleanup());
    readStream.on('error', (err) => {
      console.error('[Public Download Stream Error]:', err);
      watermarked.cleanup();
    });
  } catch (err: any) {
    console.error('[Public Download API Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to generate watermarked proof download'});
  }
});

// 12.5. Client submits a comment / pin annotation -> Triggers Gmail to Manager & Creator
router.post('/public/proofs/:token/comments', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const {
    assetId,
    content,
    pinXPercent,
    pinYPercent,
    timestampStartSeconds,
    timestampEndSeconds
  } = req.body;

  let authorName = req.body.authorName;
  let authorEmail = req.body.authorEmail;

  if (!content) {
    res.status(400).json({ success: false, message: 'Comment content is required' });
    return;
  }

  try {
    const tokenHash = hashProofToken(token);
    const linkRes = await db.query(
      `SELECT * FROM creative_share_links WHERE token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at || (linkRes.rows[0].expires_at && new Date(linkRes.rows[0].expires_at) < new Date())) {
      res.status(403).json({ success: false, message: 'Invalid, expired, or revoked proof session' });
      return;
    }

    const shareLink = linkRes.rows[0];

    if (!shareLink.allow_comments) {
      res.status(403).json({ success: false, message: 'Comments are disabled for this proofing link.' });
      return;
    }

    // Resolve verified client session (STRICTLY REQUIRED to add comments)
    const sessionHeader = (req.headers['x-client-session'] || req.headers.authorization) as string | undefined;
    const verifiedSession = verifyClientProofSession(sessionHeader, tokenHash);
    if (!verifiedSession) {
      res.status(401).json({
        success: false,
        requiresOtp: true,
        message: 'OTP login is required to add comments to this creative. Please log in with your email verification code.'
      });
      return;
    }

    authorEmail = verifiedSession.email;
    authorName = verifiedSession.name || authorName?.trim() || verifiedSession.email.split('@')[0];

    const commentRes = await db.query(
      `INSERT INTO creative_comments (
        organization_id, proof_id, asset_id, author_name, author_email,
        is_client_comment, content, pin_x_percent, pin_y_percent,
        timestamp_start_seconds, timestamp_end_seconds
      ) VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        shareLink.organization_id,
        shareLink.proof_id,
        assetId || null,
        authorName.trim(),
        authorEmail ? authorEmail.trim() : null,
        content.trim(),
        pinXPercent !== undefined ? pinXPercent : null,
        pinYPercent !== undefined ? pinYPercent : null,
        timestampStartSeconds !== undefined ? timestampStartSeconds : null,
        timestampEndSeconds !== undefined ? timestampEndSeconds : null
      ]
    );

    // Audit Log
    await db.query(
      `INSERT INTO creative_audit_logs (
        organization_id, creative_id, proof_id, action, actor_type, actor_name, actor_email, metadata, ip_address
      ) VALUES ($1, $2, $3, 'COMMENT_ADDED', 'CLIENT', $4, $5, $6, $7)`,
      [
        shareLink.organization_id,
        shareLink.creative_id,
        shareLink.proof_id,
        authorName.trim(),
        authorEmail ? authorEmail.trim() : null,
        JSON.stringify({ commentId: commentRes.rows[0].id, hasPin: pinXPercent !== undefined }),
        req.ip
      ]
    );

    // NOTIFY CREATOR & MANAGER VIA GMAIL & IN-APP
    const team = await getCreativeCreatorAndManager(shareLink.creative_id, shareLink.organization_id, shareLink.created_by);
    if (team.creative && team.recipients.length > 0) {
      EmailService.sendCreativeNotificationToTeam({
        type: 'COMMENT',
        creative: team.creative,
        clientName: authorName.trim(),
        clientEmail: authorEmail || 'client@external.com',
        commentContent: content.trim(),
        recipients: team.recipients,
      }).catch(e => console.error('[Gmail Comment Notification Error]:', e));

      createInAppNotification(
        shareLink.organization_id,
        `New Client Comment: ${team.creative.name}`,
        `${authorName.trim()} commented on creative "${team.creative.name}": "${content.trim().slice(0, 80)}"`,
        'CREATIVE_COMMENT',
        team.creative.id,
        { commentId: commentRes.rows[0].id, clientEmail: authorEmail },
        team.recipients.map(r => r.userId).filter(Boolean) as string[]
      );
    }

    res.status(201).json({
      success: true,
      comment: commentRes.rows[0]
    });
  } catch (err: any) {
    console.error('[Public Proof API] Client Comment Error:', err);
    res.status(500).json({ success: false, message: 'Failed to post comment'});
  }
});

// 12.6. Client APPROVES Proof -> Triggers Gmail to Manager & Creator
router.post('/public/proofs/:token/approve', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  let { approverName, approverEmail, feedbackNotes } = req.body;

  try {
    const tokenHash = hashProofToken(token);
    const linkRes = await db.query(
      `SELECT * FROM creative_share_links WHERE token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at || (linkRes.rows[0].expires_at && new Date(linkRes.rows[0].expires_at) < new Date())) {
      res.status(403).json({ success: false, message: 'Invalid, expired, or revoked proof session' });
      return;
    }

    const shareLink = linkRes.rows[0];

    if (!shareLink.allow_approvals) {
      res.status(403).json({ success: false, message: 'Formal approval is disabled for this link.' });
      return;
    }

    // Resolve verified client session (STRICTLY REQUIRED for formal approval)
    const sessionHeader = (req.headers['x-client-session'] || req.headers.authorization) as string | undefined;
    const verifiedSession = verifyClientProofSession(sessionHeader, tokenHash);
    if (!verifiedSession) {
      res.status(401).json({
        success: false,
        requiresOtp: true,
        message: 'OTP login is required to officially approve this creative. Please log in with your email verification code.'
      });
      return;
    }

    approverEmail = verifiedSession.email;
    approverName = verifiedSession.name || approverName?.trim() || verifiedSession.email.split('@')[0];

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Record formal approval
      const approvalRes = await client.query(
        `INSERT INTO creative_approvals (
          organization_id, creative_id, proof_id, decision, feedback_notes,
          approver_name, approver_email, ip_address, user_agent
        ) VALUES ($1, $2, $3, 'APPROVED', $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          shareLink.organization_id,
          shareLink.creative_id,
          shareLink.proof_id,
          feedbackNotes || 'Approved by client via Client Proofing Portal',
          approverName.trim(),
          approverEmail.trim(),
          req.ip,
          req.headers['user-agent']
        ]
      );

      // Update Proof & Creative Status to APPROVED
      await client.query(
        `UPDATE creative_proofs SET status = 'APPROVED', is_immutable = true WHERE id = $1`,
        [shareLink.proof_id]
      );

      await client.query(
        `UPDATE creatives SET status = 'APPROVED', updated_at = NOW() WHERE id = $1`,
        [shareLink.creative_id]
      );

      // Audit Log
      await client.query(
        `INSERT INTO creative_audit_logs (
          organization_id, creative_id, proof_id, action, actor_type, actor_name, actor_email, metadata, ip_address
        ) VALUES ($1, $2, $3, 'APPROVED', 'CLIENT', $4, $5, $6, $7)`,
        [
          shareLink.organization_id,
          shareLink.creative_id,
          shareLink.proof_id,
          approverName.trim(),
          approverEmail.trim(),
          JSON.stringify({ decision: 'APPROVED', approvalId: approvalRes.rows[0].id }),
          req.ip
        ]
      );

      await client.query('COMMIT');

      // NOTIFY CREATOR & MANAGER VIA GMAIL & IN-APP
      const team = await getCreativeCreatorAndManager(shareLink.creative_id, shareLink.organization_id, shareLink.created_by);
      if (team.creative && team.recipients.length > 0) {
        EmailService.sendCreativeNotificationToTeam({
          type: 'APPROVED',
          creative: team.creative,
          clientName: approverName.trim(),
          clientEmail: approverEmail.trim(),
          feedbackNotes: feedbackNotes?.trim(),
          recipients: team.recipients,
        }).catch(e => console.error('[Gmail Approval Notification Error]:', e));

        createInAppNotification(
          shareLink.organization_id,
          `Creative Officially Approved: ${team.creative.name}`,
          `${approverName.trim()} (${approverEmail.trim()}) approved "${team.creative.name}" for deployment!`,
          'CREATIVE_APPROVED',
          team.creative.id,
          { approvalId: approvalRes.rows[0].id, clientEmail: approverEmail.trim() },
          team.recipients.map(r => r.userId).filter(Boolean) as string[]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Creative proof approved successfully!',
        approval: approvalRes.rows[0]
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[Public Proof API] Client Approval Error:', err);
      res.status(500).json({ success: false, message: 'Failed to record approval'});
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[Public Proof API] Client Approval Outer Error:', err);
    res.status(500).json({ success: false, message: 'Failed to record approval'});
  }
});

// 12.7. Client REQUESTS CHANGES -> Triggers Gmail to Manager & Creator
router.post('/public/proofs/:token/request-changes', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  let { reviewerName, reviewerEmail, changeNotes } = req.body;

  if (!changeNotes) {
    res.status(400).json({ success: false, message: 'Change request details are required.' });
    return;
  }

  try {
    const tokenHash = hashProofToken(token);
    const linkRes = await db.query(
      `SELECT * FROM creative_share_links WHERE token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at || (linkRes.rows[0].expires_at && new Date(linkRes.rows[0].expires_at) < new Date())) {
      res.status(403).json({ success: false, message: 'Invalid, expired, or revoked proof session' });
      return;
    }

    const shareLink = linkRes.rows[0];

    // Resolve verified client session (STRICTLY REQUIRED to request changes)
    const sessionHeader = (req.headers['x-client-session'] || req.headers.authorization) as string | undefined;
    const verifiedSession = verifyClientProofSession(sessionHeader, tokenHash);
    if (!verifiedSession) {
      res.status(401).json({
        success: false,
        requiresOtp: true,
        message: 'OTP login is required to request changes on this creative. Please log in with your email verification code.'
      });
      return;
    }

    reviewerEmail = verifiedSession.email;
    reviewerName = verifiedSession.name || reviewerName?.trim() || verifiedSession.email.split('@')[0];

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Record change request decision
      const approvalRes = await client.query(
        `INSERT INTO creative_approvals (
          organization_id, creative_id, proof_id, decision, feedback_notes,
          approver_name, approver_email, ip_address, user_agent
        ) VALUES ($1, $2, $3, 'CHANGES_REQUESTED', $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          shareLink.organization_id,
          shareLink.creative_id,
          shareLink.proof_id,
          changeNotes.trim(),
          reviewerName.trim(),
          reviewerEmail?.trim() || 'client@external.com',
          req.ip,
          req.headers['user-agent']
        ]
      );

      // Update status to CHANGES_REQUESTED
      await client.query(
        `UPDATE creative_proofs SET status = 'CHANGES_REQUESTED' WHERE id = $1`,
        [shareLink.proof_id]
      );

      await client.query(
        `UPDATE creatives SET status = 'CHANGES_REQUESTED', updated_at = NOW() WHERE id = $1`,
        [shareLink.creative_id]
      );

      // Audit Log
      await client.query(
        `INSERT INTO creative_audit_logs (
          organization_id, creative_id, proof_id, action, actor_type, actor_name, actor_email, metadata, ip_address
        ) VALUES ($1, $2, $3, 'CHANGES_REQUESTED', 'CLIENT', $4, $5, $6, $7)`,
        [
          shareLink.organization_id,
          shareLink.creative_id,
          shareLink.proof_id,
          reviewerName.trim(),
          reviewerEmail?.trim() || null,
          JSON.stringify({ decision: 'CHANGES_REQUESTED', notes: changeNotes }),
          req.ip
        ]
      );

      await client.query('COMMIT');

      // NOTIFY CREATOR & MANAGER VIA GMAIL & IN-APP
      const team = await getCreativeCreatorAndManager(shareLink.creative_id, shareLink.organization_id, shareLink.created_by);
      if (team.creative && team.recipients.length > 0) {
        EmailService.sendCreativeNotificationToTeam({
          type: 'CHANGES_REQUESTED',
          creative: team.creative,
          clientName: reviewerName.trim(),
          clientEmail: reviewerEmail || 'client@external.com',
          feedbackNotes: changeNotes.trim(),
          recipients: team.recipients,
        }).catch(e => console.error('[Gmail Revision Notification Error]:', e));

        createInAppNotification(
          shareLink.organization_id,
          `Revisions Requested: ${team.creative.name}`,
          `${reviewerName.trim()} requested revision changes on "${team.creative.name}": "${changeNotes.trim().slice(0, 80)}"`,
          'CREATIVE_CHANGES_REQUESTED',
          team.creative.id,
          { approvalId: approvalRes.rows[0].id, clientEmail: reviewerEmail },
          team.recipients.map(r => r.userId).filter(Boolean) as string[]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Change request submitted successfully to the creative team.',
        approval: approvalRes.rows[0]
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[Public Proof API] Request Changes Error:', err);
      res.status(500).json({ success: false, message: 'Failed to record change request'});
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[Public Proof API] Request Changes Outer Error:', err);
    res.status(500).json({ success: false, message: 'Failed to record change request'});
  }
});



// ---------------------------------------------------------------------------
// Helper: Format Bytes to Human-Readable String
// ---------------------------------------------------------------------------
function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// ---------------------------------------------------------------------------
// 1. METRICS & KPI DASHBOARD (Scoped with Cloudflare R2 Storage Stats)
// ---------------------------------------------------------------------------
router.get('/metrics', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;

  try {
    const params: any[] = [orgId];
    const scopeClause = buildCreativeScopeClause(req, params, 'c');

    const statsQuery = await db.query(
      `SELECT
        COUNT(*) as total_creatives,
        COUNT(CASE WHEN c.status = 'DRAFT' THEN 1 END) as count_draft,
        COUNT(CASE WHEN c.status = 'INTERNAL_REVIEW' THEN 1 END) as count_internal_review,
        COUNT(CASE WHEN c.status = 'PENDING_CLIENT_APPROVAL' THEN 1 END) as count_pending_approval,
        COUNT(CASE WHEN c.status = 'CHANGES_REQUESTED' THEN 1 END) as count_changes_requested,
        COUNT(CASE WHEN c.status = 'APPROVED' THEN 1 END) as count_approved,
        COUNT(CASE WHEN c.status = 'DEPLOYMENT_READY' THEN 1 END) as count_deployment_ready,
        COUNT(CASE WHEN c.status = 'LIVE' THEN 1 END) as count_live,
        COUNT(CASE WHEN c.approval_due_at < NOW() AND c.status IN ('DRAFT', 'INTERNAL_REVIEW', 'PENDING_CLIENT_APPROVAL') THEN 1 END) as count_overdue
      FROM creatives c
      WHERE c.organization_id = $1 ${scopeClause}`,
      params
    );

    // Approval rate calculation
    const approvalParams: any[] = [orgId];
    const approvalScopeClause = buildCreativeScopeClause(req, approvalParams, 'c');

    const approvalsQuery = await db.query(
      `SELECT
        COUNT(*) as total_decisions,
        COUNT(CASE WHEN ca.decision = 'APPROVED' THEN 1 END) as approved_decisions,
        COUNT(CASE WHEN ca.decision = 'CHANGES_REQUESTED' THEN 1 END) as revisions_requested
      FROM creative_approvals ca
      JOIN creatives c ON ca.creative_id = c.id
      WHERE ca.organization_id = $1 ${approvalScopeClause}`,
      approvalParams
    );

    // 3. Storage Usage Query across creative_proof_assets
    const storageParams: any[] = [orgId];
    const storageScopeClause = buildCreativeScopeClause(req, storageParams, 'c');

    const storageQuery = await db.query(
      `SELECT
        COUNT(*) as total_assets,
        COALESCE(SUM(cpa.file_size_bytes), 0) as total_bytes,
        COUNT(CASE WHEN cpa.asset_type = 'VIDEO' THEN 1 END) as count_video,
        COALESCE(SUM(CASE WHEN cpa.asset_type = 'VIDEO' THEN cpa.file_size_bytes ELSE 0 END), 0) as bytes_video,
        COUNT(CASE WHEN cpa.asset_type IN ('IMAGE', 'THUMBNAIL', 'CAROUSEL_SLIDE') THEN 1 END) as count_image,
        COALESCE(SUM(CASE WHEN cpa.asset_type IN ('IMAGE', 'THUMBNAIL', 'CAROUSEL_SLIDE') THEN cpa.file_size_bytes ELSE 0 END), 0) as bytes_image,
        COUNT(CASE WHEN cpa.asset_type NOT IN ('VIDEO', 'IMAGE', 'THUMBNAIL', 'CAROUSEL_SLIDE') THEN 1 END) as count_other,
        COALESCE(SUM(CASE WHEN cpa.asset_type NOT IN ('VIDEO', 'IMAGE', 'THUMBNAIL', 'CAROUSEL_SLIDE') THEN cpa.file_size_bytes ELSE 0 END), 0) as bytes_other
      FROM creative_proof_assets cpa
      JOIN creative_proofs cp ON cpa.proof_id = cp.id
      JOIN creatives c ON cp.creative_id = c.id
      WHERE cpa.organization_id = $1 ${storageScopeClause}`,
      storageParams
    );

    const stats = statsQuery.rows[0];
    const approvalStats = approvalsQuery.rows[0];
    const totalDecisions = parseInt(approvalStats?.total_decisions || '0');
    const approvedDecisions = parseInt(approvalStats?.approved_decisions || '0');
    const approvalRate = totalDecisions > 0 ? Math.round((approvedDecisions / totalDecisions) * 100) : 100;

    // 3. Cloudflare R2 Live Bucket Storage Stats
    let totalStorageBytes = 0;
    let videoBytes = 0;
    let videoCount = 0;
    let imageBytes = 0;
    let imageCount = 0;
    let otherBytes = 0;
    let otherCount = 0;
    let totalAssets = 0;
    let bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'optivir-creatives';
    let isLiveBucketScan = true;
    let lastScannedAt = new Date().toISOString();

    try {
      const liveBucket = await StorageService.getLiveBucketStorageStats({ forceRefresh: req.query.forceRefresh === 'true' });
      totalStorageBytes = liveBucket.totalBytes;
      totalAssets = liveBucket.totalObjects;
      videoBytes = liveBucket.breakdown.video.bytes;
      videoCount = liveBucket.breakdown.video.count;
      imageBytes = liveBucket.breakdown.image.bytes;
      imageCount = liveBucket.breakdown.image.count;
      otherBytes = liveBucket.breakdown.other.bytes;
      otherCount = liveBucket.breakdown.other.count;
      bucketName = liveBucket.bucket;
      lastScannedAt = liveBucket.lastScannedAt;
    } catch (r2Err: any) {
      console.warn('[Storage Telemetry] Live bucket scan fallback to DB:', r2Err.message);
      const storageRow = storageQuery.rows[0];
      totalStorageBytes = parseInt(storageRow?.total_bytes || '0', 10);
      videoBytes = parseInt(storageRow?.bytes_video || '0', 10);
      videoCount = parseInt(storageRow?.count_video || '0', 10);
      imageBytes = parseInt(storageRow?.bytes_image || '0', 10);
      imageCount = parseInt(storageRow?.count_image || '0', 10);
      otherBytes = parseInt(storageRow?.bytes_other || '0', 10);
      otherCount = parseInt(storageRow?.count_other || '0', 10);
      totalAssets = parseInt(storageRow?.total_assets || '0', 10);
      isLiveBucketScan = false;
    }

    const limitBytes = 20 * 1024 * 1024 * 1024; // 20 GB agency plan quota
    const percentUsed = Math.min(100, parseFloat(((totalStorageBytes / limitBytes) * 100).toFixed(2)));

    const storageData = {
      totalBytes: totalStorageBytes,
      formattedUsed: formatBytes(totalStorageBytes),
      limitBytes,
      formattedLimit: '20 GB',
      percentUsed,
      remainingBytes: Math.max(0, limitBytes - totalStorageBytes),
      formattedRemaining: formatBytes(Math.max(0, limitBytes - totalStorageBytes)),
      totalAssets,
      breakdown: {
        video: {
          bytes: videoBytes,
          formatted: formatBytes(videoBytes),
          count: videoCount,
          percent: totalStorageBytes > 0 ? Math.round((videoBytes / totalStorageBytes) * 100) : 0
        },
        image: {
          bytes: imageBytes,
          formatted: formatBytes(imageBytes),
          count: imageCount,
          percent: totalStorageBytes > 0 ? Math.round((imageBytes / totalStorageBytes) * 100) : 0
        },
        other: {
          bytes: otherBytes,
          formatted: formatBytes(otherBytes),
          count: otherCount,
          percent: totalStorageBytes > 0 ? Math.round((otherBytes / totalStorageBytes) * 100) : 0
        }
      },
      provider: 'Cloudflare R2',
      bucket: bucketName,
      isLiveBucketScan,
      lastScannedAt,
      status: 'HEALTHY'
    };

    res.json({
      success: true,
      metrics: {
        totalCreatives: parseInt(stats?.total_creatives || '0'),
        draft: parseInt(stats?.count_draft || '0'),
        internalReview: parseInt(stats?.count_internal_review || '0'),
        pendingClientApproval: parseInt(stats?.count_pending_approval || '0'),
        changesRequested: parseInt(stats?.count_changes_requested || '0'),
        approved: parseInt(stats?.count_approved || '0'),
        deploymentReady: parseInt(stats?.count_deployment_ready || '0'),
        live: parseInt(stats?.count_live || '0'),
        overdue: parseInt(stats?.count_overdue || '0'),
        approvalRate,
        revisionsRequested: parseInt(approvalStats?.revisions_requested || '0'),
        storage: storageData
      }
    });
  } catch (err: any) {
    console.error('[Creatives API] Metrics Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch creative metrics'});
  }
});

// ---------------------------------------------------------------------------
// 1b. DETAILED STORAGE USAGE & ASSET BREAKDOWN (Cloudflare R2 Bucket Telemetry)
// ---------------------------------------------------------------------------
router.get('/storage', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const forceRefresh = req.query.forceRefresh === 'true';

  try {
    const limitBytes = 20 * 1024 * 1024 * 1024; // 20 GB agency plan quota

    // 1. Fetch DB metadata to enrich live bucket objects with relational context
    const dbAssetsQuery = await db.query(
      `SELECT
        cpa.id, cpa.storage_key, cpa.file_name, cpa.file_size_bytes, cpa.asset_type, cpa.mime_type,
        cpa.created_at, cpa.width_px, cpa.height_px, cpa.duration_seconds,
        c.name as creative_name, c.id as creative_id,
        co.name as client_name
      FROM creative_proof_assets cpa
      JOIN creative_proofs cp ON cpa.proof_id = cp.id
      JOIN creatives c ON cp.creative_id = c.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies co ON cl.company_id = co.id
      WHERE cpa.organization_id = $1`,
      [orgId]
    );

    const dbMapByStorageKey = new Map<string, any>();
    const dbMapByFileName = new Map<string, any>();
    for (const row of dbAssetsQuery.rows) {
      if (row.storage_key) dbMapByStorageKey.set(row.storage_key, row);
      if (row.file_name) dbMapByFileName.set(row.file_name, row);
    }

    let totalStorageBytes = 0;
    let videoBytes = 0;
    let videoCount = 0;
    let imageBytes = 0;
    let imageCount = 0;
    let otherBytes = 0;
    let otherCount = 0;
    let totalAssets = 0;
    let largestAssets: any[] = [];
    let isLiveBucketScan = true;
    let bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'optivir-creatives';
    let lastScannedAt = new Date().toISOString();

    try {
      const liveBucket = await StorageService.getLiveBucketStorageStats({ forceRefresh });
      bucketName = liveBucket.bucket;
      totalStorageBytes = liveBucket.totalBytes;
      totalAssets = liveBucket.totalObjects;
      videoBytes = liveBucket.breakdown.video.bytes;
      videoCount = liveBucket.breakdown.video.count;
      imageBytes = liveBucket.breakdown.image.bytes;
      imageCount = liveBucket.breakdown.image.count;
      otherBytes = liveBucket.breakdown.other.bytes;
      otherCount = liveBucket.breakdown.other.count;
      lastScannedAt = liveBucket.lastScannedAt;

      // Enrich top largest objects directly from live Cloudflare R2 bucket
      largestAssets = liveBucket.objects.slice(0, 25).map((obj: any, idx: number) => {
        const keyParts = obj.key.split('/');
        const rawFileName = keyParts[keyParts.length - 1] || obj.key;
        const matched = dbMapByStorageKey.get(obj.key) ||
          dbMapByFileName.get(rawFileName) ||
          Array.from(dbMapByFileName.values()).find(r => obj.key.endsWith(r.file_name));

        const isWatermarked = rawFileName.toLowerCase().startsWith('watermarked_');
        let displayFileName = rawFileName;
        if (isWatermarked) {
          displayFileName = `[Watermarked] ${rawFileName.replace(/^watermarked_/i, '')}`;
        }

        const isVideo = /\.(mp4|mov|webm|avi|mkv)($|\?)/i.test(obj.key) || obj.key.toLowerCase().includes('/video_') || obj.key.toLowerCase().includes('video');
        const isImage = /\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(obj.key) || obj.key.toLowerCase().includes('/image_') || obj.key.toLowerCase().includes('thumbnail') || obj.key.toLowerCase().includes('slide');

        return {
          id: matched?.id || `r2-live-${idx}`,
          storageKey: obj.key,
          fileName: matched?.file_name || displayFileName,
          fileSizeBytes: obj.size,
          formattedSize: formatBytes(obj.size),
          assetType: matched?.asset_type || (isVideo ? 'VIDEO' : isImage ? 'IMAGE' : 'OTHER'),
          mimeType: matched?.mime_type || (isVideo ? 'video/mp4' : isImage ? 'image/jpeg' : 'application/octet-stream'),
          createdAt: matched?.created_at || obj.lastModified || new Date().toISOString(),
          widthPx: matched?.width_px || null,
          heightPx: matched?.height_px || null,
          durationSeconds: matched?.duration_seconds || null,
          creativeName: matched?.creative_name || (isWatermarked ? 'Watermarked Proof Rendering' : 'Cloudflare R2 Object'),
          creativeId: matched?.creative_id || null,
          clientName: matched?.client_name || 'OptiVir Edge CDN'
        };
      });
    } catch (r2Err: any) {
      console.warn('[Storage Telemetry] Live bucket scan fallback to DB:', r2Err.message);
      isLiveBucketScan = false;
      const storageParams: any[] = [orgId];
      const storageScopeClause = buildCreativeScopeClause(req, storageParams, 'c');
      const storageQuery = await db.query(
        `SELECT
          COUNT(*) as total_assets,
          COALESCE(SUM(cpa.file_size_bytes), 0) as total_bytes,
          COUNT(CASE WHEN cpa.asset_type = 'VIDEO' THEN 1 END) as count_video,
          COALESCE(SUM(CASE WHEN cpa.asset_type = 'VIDEO' THEN cpa.file_size_bytes ELSE 0 END), 0) as bytes_video,
          COUNT(CASE WHEN cpa.asset_type IN ('IMAGE', 'THUMBNAIL', 'CAROUSEL_SLIDE') THEN 1 END) as count_image,
          COALESCE(SUM(CASE WHEN cpa.asset_type IN ('IMAGE', 'THUMBNAIL', 'CAROUSEL_SLIDE') THEN cpa.file_size_bytes ELSE 0 END), 0) as bytes_image,
          COUNT(CASE WHEN cpa.asset_type NOT IN ('VIDEO', 'IMAGE', 'THUMBNAIL', 'CAROUSEL_SLIDE') THEN 1 END) as count_other,
          COALESCE(SUM(CASE WHEN cpa.asset_type NOT IN ('VIDEO', 'IMAGE', 'THUMBNAIL', 'CAROUSEL_SLIDE') THEN cpa.file_size_bytes ELSE 0 END), 0) as bytes_other
        FROM creative_proof_assets cpa
        JOIN creative_proofs cp ON cpa.proof_id = cp.id
        JOIN creatives c ON cp.creative_id = c.id
        WHERE cpa.organization_id = $1 ${storageScopeClause}`,
        storageParams
      );

      const storageRow = storageQuery.rows[0];
      totalStorageBytes = parseInt(storageRow?.total_bytes || '0', 10);
      videoBytes = parseInt(storageRow?.bytes_video || '0', 10);
      videoCount = parseInt(storageRow?.count_video || '0', 10);
      imageBytes = parseInt(storageRow?.bytes_image || '0', 10);
      imageCount = parseInt(storageRow?.count_image || '0', 10);
      otherBytes = parseInt(storageRow?.bytes_other || '0', 10);
      otherCount = parseInt(storageRow?.count_other || '0', 10);
      totalAssets = parseInt(storageRow?.total_assets || '0', 10);

      const largestQuery = await db.query(
        `SELECT
          cpa.id, cpa.file_name, cpa.file_size_bytes, cpa.asset_type, cpa.mime_type,
          cpa.created_at, cpa.width_px, cpa.height_px, cpa.duration_seconds,
          c.name as creative_name, c.id as creative_id,
          co.name as client_name
        FROM creative_proof_assets cpa
        JOIN creative_proofs cp ON cpa.proof_id = cp.id
        JOIN creatives c ON cp.creative_id = c.id
        LEFT JOIN clients cl ON c.client_id = cl.id
        LEFT JOIN companies co ON cl.company_id = co.id
        WHERE cpa.organization_id = $1 ${storageScopeClause}
        ORDER BY cpa.file_size_bytes DESC
        LIMIT 15`,
        storageParams
      );

      largestAssets = largestQuery.rows.map((row: any) => ({
        id: row.id,
        fileName: row.file_name,
        fileSizeBytes: parseInt(row.file_size_bytes || '0', 10),
        formattedSize: formatBytes(parseInt(row.file_size_bytes || '0', 10)),
        assetType: row.asset_type,
        mimeType: row.mime_type,
        createdAt: row.created_at,
        widthPx: row.width_px,
        heightPx: row.height_px,
        durationSeconds: row.duration_seconds,
        creativeName: row.creative_name,
        creativeId: row.creative_id,
        clientName: row.client_name || 'Direct Client'
      }));
    }

    const percentUsed = Math.min(100, parseFloat(((totalStorageBytes / limitBytes) * 100).toFixed(2)));

    res.json({
      success: true,
      storage: {
        totalBytes: totalStorageBytes,
        formattedUsed: formatBytes(totalStorageBytes),
        limitBytes,
        formattedLimit: '20 GB',
        percentUsed,
        remainingBytes: Math.max(0, limitBytes - totalStorageBytes),
        formattedRemaining: formatBytes(Math.max(0, limitBytes - totalStorageBytes)),
        totalAssets,
        breakdown: {
          video: {
            bytes: videoBytes,
            formatted: formatBytes(videoBytes),
            count: videoCount,
            percent: totalStorageBytes > 0 ? Math.round((videoBytes / totalStorageBytes) * 100) : 0
          },
          image: {
            bytes: imageBytes,
            formatted: formatBytes(imageBytes),
            count: imageCount,
            percent: totalStorageBytes > 0 ? Math.round((imageBytes / totalStorageBytes) * 100) : 0
          },
          other: {
            bytes: otherBytes,
            formatted: formatBytes(otherBytes),
            count: otherCount,
            percent: totalStorageBytes > 0 ? Math.round((otherBytes / totalStorageBytes) * 100) : 0
          }
        },
        provider: 'Cloudflare R2',
        bucket: bucketName,
        isLiveBucketScan,
        lastScannedAt,
        status: 'HEALTHY'
      },
      bucket: bucketName,
      isLiveBucketScan,
      lastScannedAt,
      largestAssets,
      largestFiles: largestAssets
    });
  } catch (err: any) {
    console.error('[Creatives API] Storage Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch creative storage details'});
  }
});

// ---------------------------------------------------------------------------
// 1c. SYNC & AUDIT CLOUDFLARE R2 BUCKET (Force live scan)
// ---------------------------------------------------------------------------
router.post('/storage/sync', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    StorageService.invalidateBucketCache();
    const liveStats = await StorageService.getLiveBucketStorageStats({ forceRefresh: true });
    res.json({
      success: true,
      message: 'Cloudflare R2 bucket scanned and synchronized successfully',
      storage: {
        totalBytes: liveStats.totalBytes,
        formattedUsed: formatBytes(liveStats.totalBytes),
        totalAssets: liveStats.totalObjects,
        bucket: liveStats.bucket,
        lastScannedAt: liveStats.lastScannedAt,
        breakdown: {
          video: {
            bytes: liveStats.breakdown.video.bytes,
            formatted: formatBytes(liveStats.breakdown.video.bytes),
            count: liveStats.breakdown.video.count
          },
          image: {
            bytes: liveStats.breakdown.image.bytes,
            formatted: formatBytes(liveStats.breakdown.image.bytes),
            count: liveStats.breakdown.image.count
          },
          other: {
            bytes: liveStats.breakdown.other.bytes,
            formatted: formatBytes(liveStats.breakdown.other.bytes),
            count: liveStats.breakdown.other.count
          }
        }
      }
    });
  } catch (err: any) {
    console.error('[Creatives API] Bucket Sync Error:', err);
    res.status(500).json({ success: false, message: 'Failed to sync with Cloudflare R2 bucket'});
  }
});

// ---------------------------------------------------------------------------
// 2. LIST CREATIVES (With multi-tenant, client & role scoping)
// ---------------------------------------------------------------------------
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { clientId, projectId, taskId, status, platform, format, search, designerId } = req.query;

  try {
    let query = `
      SELECT
        c.*,
        cl.company_id,
        co.name as client_name,
        p.name as project_name,
        t.title as task_title,
        t.priority as task_priority,
        t.status as task_status,
        t.due_date as task_due_date,
        u.first_name || ' ' || u.last_name as designer_name,
        cp.version_number as active_version,
        cp.title as active_proof_title,
        (SELECT COUNT(*) FROM creative_proofs WHERE creative_id = c.id) as version_count,
        (SELECT COUNT(*) FROM creative_comments cc JOIN creative_proofs pr ON cc.proof_id = pr.id WHERE pr.creative_id = c.id AND cc.is_resolved = false) as unresolved_comments_count,
        (SELECT COALESCE(SUM(cpa.file_size_bytes), 0) FROM creative_proof_assets cpa JOIN creative_proofs pr ON cpa.proof_id = pr.id WHERE pr.creative_id = c.id) as total_asset_bytes
      FROM creatives c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies co ON cl.company_id = co.id
      LEFT JOIN projects p ON c.project_id = p.id
      LEFT JOIN tasks t ON c.task_id = t.id
      LEFT JOIN users u ON c.designer_id = u.id
      LEFT JOIN creative_proofs cp ON c.active_proof_id = cp.id
      WHERE c.organization_id = $1
    `;

    const params: any[] = [orgId];

    // Access Control Scoping
    query += buildCreativeScopeClause(req, params, 'c');

    if (clientId) {
      params.push(clientId);
      query += ` AND c.client_id = $${params.length}`;
    }
    if (projectId) {
      params.push(projectId);
      query += ` AND c.project_id = $${params.length}`;
    }
    if (taskId) {
      params.push(taskId);
      query += ` AND c.task_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }
    if (platform && platform !== 'ALL') {
      params.push(platform);
      query += ` AND c.target_platform = $${params.length}`;
    }
    if (format && format !== 'ALL') {
      params.push(format);
      query += ` AND c.ad_format = $${params.length}`;
    }
    if (designerId) {
      params.push(designerId);
      query += ` AND c.designer_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.name ILIKE $${params.length} OR c.campaign_name ILIKE $${params.length} OR co.name ILIKE $${params.length})`;
    }

    query += ` ORDER BY c.updated_at DESC`;

    const result = await db.query(query, params);

    // Fetch primary asset previews for each creative to construct signed viewing URLs
    const user = req.user!;
    const userRole = (user.role || '').toLowerCase();
    const isGlobalOwner = Boolean(user.isOwner || userRole === 'owner' || userRole === 'super_admin');
    const isGlobalAM = userRole === 'account_manager';

    const creativesWithAssets = await Promise.all(
      result.rows.map(async (row) => {
        let previewUrl = null;
        let assets: any[] = [];

        const isCreativeCreator = Boolean(
          (row.created_by && user.id === row.created_by) ||
          (row.designer_id && user.id === row.designer_id)
        );
        const isClientAM = Boolean(
          isGlobalAM || (row.client_account_manager_id && row.client_account_manager_id === user.id)
        );
        const canAccessClean = isGlobalOwner || isClientAM || isCreativeCreator;

        if (row.active_proof_id) {
          const assetsRes = await db.query(
            `SELECT * FROM creative_proof_assets WHERE proof_id = $1 ORDER BY slide_order ASC`,
            [row.active_proof_id]
          );

          assets = await Promise.all(
            assetsRes.rows.map(async (asset) => {
              const deliverableKey = canAccessClean
                ? asset.storage_key
                : await WatermarkService.getOrGenerateWatermarkedKey(asset);

              const signedUrl = await StorageService.generateViewingSignedUrl(deliverableKey);
              const thumbUrl = asset.thumbnail_storage_key
                ? await StorageService.generateViewingSignedUrl(asset.thumbnail_storage_key)
                : signedUrl;

              return {
                ...asset,
                viewingUrl: signedUrl,
                thumbnailUrl: thumbUrl
              };
            })
          );

          if (assets.length > 0) {
            previewUrl = assets[0].viewingUrl;
          }
        }

        return {
          ...row,
          previewUrl,
          assets
        };
      })
    );

    res.json({
      success: true,
      creatives: creativesWithAssets
    });
  } catch (err: any) {
    console.error('[Creatives API] List Error:', err);
    res.status(500).json({ success: false, message: 'Failed to list creatives'});
  }
});

// ---------------------------------------------------------------------------
// 3. CREATE CREATIVE & INITIAL PROOF (Validates Client -> Project hierarchy)
// ---------------------------------------------------------------------------
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const {
    clientId,
    projectId,
    taskId,
    name,
    description,
    campaignName,
    targetPlatform,
    adFormat,
    aspectRatio,
    primaryAdCopy,
    headline,
    callToAction,
    destinationUrl,
    designerId,
    approvalDueAt,
    tags,
    initialProof,
    scriptContent,
    script_content,
    conceptIdea,
    concept_idea
  } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'Creative name is required' });
    return;
  }

  // Verify client access if client specified
  if (clientId) {
    const clientCheck = await db.query(
      `SELECT id, account_manager_id, account_assistant_id, account_assistant_ids FROM clients WHERE id = $1 AND organization_id = $2`,
      [clientId, orgId]
    );
    if (clientCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Specified client account does not exist in this organization' });
      return;
    }

    const cRow = clientCheck.rows[0];
    if (!isGlobalRole(req.user!.role, req.user!.isOwner)) {
      const isAmOrAssistant = (
        cRow.account_manager_id === userId ||
        cRow.account_assistant_id === userId ||
        (Array.isArray(cRow.account_assistant_ids) && cRow.account_assistant_ids.includes(userId))
      );

      let hasAssistantLink = isAmOrAssistant;
      if (!hasAssistantLink) {
        const asstCheck = await db.query(
          `SELECT 1 FROM client_assistants WHERE client_id = $1 AND user_id = $2`,
          [clientId, userId]
        );
        hasAssistantLink = asstCheck.rows.length > 0;
      }

      if (!hasAssistantLink) {
        res.status(403).json({ success: false, message: 'You do not have permission to add creatives for this client account.' });
        return;
      }
    }

    // Verify Project belongs to Client
    if (projectId) {
      const projectCheck = await db.query(
        `SELECT id FROM projects WHERE id = $1 AND client_id = $2 AND organization_id = $3`,
        [projectId, clientId, orgId]
      );
      if (projectCheck.rows.length === 0) {
        res.status(400).json({ success: false, message: 'Selected project does not belong to the selected client.' });
        return;
      }
    }
  }

  // Verify Task if specified
  if (taskId) {
    const taskCheck = await db.query(
      `SELECT id FROM tasks WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL`,
      [taskId, orgId]
    );
    if (taskCheck.rows.length === 0) {
      res.status(400).json({ success: false, message: 'Selected task not found in organization.' });
      return;
    }
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 1. Insert Creative Record
    const finalScript = scriptContent || script_content || null;
    const finalConcept = conceptIdea || concept_idea || null;

    const creativeRes = await client.query(
      `INSERT INTO creatives (
        organization_id, client_id, project_id, task_id, name, description, campaign_name,
        target_platform, ad_format, aspect_ratio, status, primary_ad_copy,
        headline, call_to_action, destination_url, designer_id, approval_due_at,
        tags, script_content, concept_idea, created_by, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'DRAFT', $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
      RETURNING *`,
      [
        orgId,
        clientId || null,
        projectId || null,
        taskId || null,
        name,
        description || null,
        campaignName || null,
        targetPlatform || 'ALL',
        adFormat || 'IMAGE',
        aspectRatio || '1:1',
        primaryAdCopy || null,
        headline || null,
        callToAction || null,
        destinationUrl || null,
        designerId || userId,
        approvalDueAt || null,
        tags || [],
        finalScript,
        finalConcept,
        userId
      ]
    );

    const creative = creativeRes.rows[0];

    // 2. Insert initial proof if provided
    let proof = null;
    if (initialProof) {
      const proofRes = await client.query(
        `INSERT INTO creative_proofs (
          organization_id, creative_id, version_number, title, change_summary,
          status, is_immutable, uploaded_by
        ) VALUES ($1, $2, 1, $3, $4, 'DRAFT', false, $5)
        RETURNING *`,
        [
          orgId,
          creative.id,
          initialProof.title || 'Initial Version (v1)',
          initialProof.changeSummary || 'Initial creative upload',
          userId
        ]
      );
      proof = proofRes.rows[0];

      // Update creative active_proof_id
      await client.query(
        `UPDATE creatives SET active_proof_id = $1 WHERE id = $2`,
        [proof.id, creative.id]
      );

      // Insert assets
      if (initialProof.assets && Array.isArray(initialProof.assets)) {
        for (let i = 0; i < initialProof.assets.length; i++) {
          const asset = initialProof.assets[i];
          const insertedRes = await client.query(
            `INSERT INTO creative_proof_assets (
              organization_id, proof_id, asset_type, slide_order, storage_key,
              file_name, file_size_bytes, mime_type, width_px, height_px,
              duration_seconds, video_codec, thumbnail_storage_key
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`,
            [
              orgId,
              proof.id,
              asset.assetType || (adFormat === 'CAROUSEL' ? 'CAROUSEL_SLIDE' : (adFormat === 'VIDEO' ? 'VIDEO' : 'IMAGE')),
              asset.slideOrder !== undefined ? asset.slideOrder : (i + 1),
              asset.storageKey,
              asset.fileName || 'asset',
              asset.fileSizeBytes || 0,
              asset.mimeType || 'image/jpeg',
              asset.widthPx || null,
              asset.heightPx || null,
              asset.durationSeconds || null,
              asset.videoCodec || null,
              asset.thumbnailStorageKey || null
            ]
          );

          // Asynchronously pre-generate server-side watermarked deliverable in R2
          const newAsset = insertedRes.rows[0];
          WatermarkService.getOrGenerateWatermarkedKey(newAsset).catch((err) =>
            console.error('[Creative Asset Pre-Watermark Error]:', err)
          );
        }
      }
    }

    // 3. Log Audit Trail
    await client.query(
      `INSERT INTO creative_audit_logs (
        organization_id, creative_id, proof_id, action, actor_type, actor_id, actor_name, metadata
      ) VALUES ($1, $2, $3, 'CREATED', 'INTERNAL_USER', $4, $5, $6)`,
      [
        orgId,
        creative.id,
        proof?.id || null,
        userId,
        `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
        JSON.stringify({ name, adFormat, targetPlatform, clientId, projectId, taskId })
      ]
    );

    await client.query('COMMIT');

    // Notify Task Assignee if linked to a task
    if (taskId) {
      const actorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'A team member';
      notifyTaskAssigneeOnCreativeEvent({
        orgId,
        taskId,
        creativeId: creative.id,
        creativeName: name,
        actorName,
        actorId: userId,
        event: (finalScript || finalConcept) ? 'script_added' : 'details_added',
        scriptSnippet: finalScript || finalConcept || primaryAdCopy || headline
      }).catch(e => console.error('[Task Assignee Notification Error]:', e));
    }

    res.status(201).json({
      success: true,
      message: 'Creative created successfully',
      creative: {
        ...creative,
        active_proof_id: proof?.id || null
      }
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Creatives API] Create Error:', err);
    res.status(500).json({ success: false, message: 'Failed to create creative'});
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// 4. GET CREATIVE DETAILS (Scoped)
// ---------------------------------------------------------------------------
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const orgId = user.organizationId;
  const { id } = req.params;

  try {
    const params: any[] = [id, orgId];
    const scopeClause = buildCreativeScopeClause(req, params, 'c');

    const creativeRes = await db.query(
      `SELECT
        c.*,
        cl.company_id,
        co.name as client_name,
        co.email as client_email,
        p.name as project_name,
        t.title as task_title,
        t.priority as task_priority,
        t.status as task_status,
        t.due_date as task_due_date,
        u.first_name || ' ' || u.last_name as designer_name,
        u.email as designer_email
      FROM creatives c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies co ON cl.company_id = co.id
      LEFT JOIN projects p ON c.project_id = p.id
      LEFT JOIN tasks t ON c.task_id = t.id
      LEFT JOIN users u ON c.designer_id = u.id
      WHERE c.id = $1 AND c.organization_id = $2 ${scopeClause}`,
      params
    );

    if (creativeRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Creative not found or access denied' });
      return;
    }

    const creative = creativeRes.rows[0];

    // Fetch all Proof Versions
    const proofsRes = await db.query(
      `SELECT
        cp.*,
        u.first_name || ' ' || u.last_name as uploader_name
      FROM creative_proofs cp
      LEFT JOIN users u ON cp.uploaded_by = u.id
      WHERE cp.creative_id = $1
      ORDER BY cp.version_number DESC`,
      [id]
    );

    const userRole = (user.role || '').toLowerCase();
    const isOwner = Boolean(user.isOwner || userRole === 'owner' || userRole === 'super_admin');
    const isAccountManager = Boolean(
      userRole === 'account_manager' ||
      (creative.client_account_manager_id && creative.client_account_manager_id === user.id)
    );
    const isCreator = Boolean(
      (creative.created_by && user.id === creative.created_by) ||
      (creative.designer_id && user.id === creative.designer_id)
    );
    const canAccessClean = isOwner || isAccountManager || isCreator;

    // Load assets, comments, and approvals for each proof
    const proofs = await Promise.all(
      proofsRes.rows.map(async (proof) => {
        const isProofUploader = Boolean(proof.uploaded_by && user.id === proof.uploaded_by);
        const canAccessProofClean = canAccessClean || isProofUploader;

        const assetsRes = await db.query(
          `SELECT * FROM creative_proof_assets WHERE proof_id = $1 ORDER BY slide_order ASC`,
          [proof.id]
        );

        const assets = await Promise.all(
          assetsRes.rows.map(async (asset) => {
            const deliverableKey = canAccessProofClean
              ? asset.storage_key
              : await WatermarkService.getOrGenerateWatermarkedKey(asset);

            const viewingUrl = await StorageService.generateViewingSignedUrl(deliverableKey);
            const thumbnailUrl = asset.thumbnail_storage_key
              ? await StorageService.generateViewingSignedUrl(asset.thumbnail_storage_key)
              : viewingUrl;

            return {
              ...asset,
              viewingUrl,
              thumbnailUrl
            };
          })
        );

        const commentsRes = await db.query(
          `SELECT
            cc.*,
            u.first_name || ' ' || u.last_name as author_user_name,
            u.avatar_url as author_avatar
          FROM creative_comments cc
          LEFT JOIN users u ON cc.author_user_id = u.id
          WHERE cc.proof_id = $1
          ORDER BY cc.created_at ASC`,
          [proof.id]
        );

        const approvalsRes = await db.query(
          `SELECT * FROM creative_approvals WHERE proof_id = $1 ORDER BY signed_at DESC`,
          [proof.id]
        );

        const shareLinksRes = await db.query(
          `SELECT id, expires_at, revoked_at, last_accessed_at, access_count, allow_comments, allow_approvals, created_at
           FROM creative_share_links
           WHERE proof_id = $1
           ORDER BY created_at DESC`,
          [proof.id]
        );

        return {
          ...proof,
          assets,
          comments: commentsRes.rows,
          approvals: approvalsRes.rows,
          shareLinks: shareLinksRes.rows
        };
      })
    );

    // Fetch Audit Logs
    const auditLogsRes = await db.query(
      `SELECT * FROM creative_audit_logs WHERE creative_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [id]
    );

    res.json({
      success: true,
      creative,
      proofs,
      auditLogs: auditLogsRes.rows
    });
  } catch (err: any) {
    console.error('[Creatives API] Get Details Error:', err);
    res.status(500).json({ success: false, message: 'Failed to get creative details'});
  }
});

// ---------------------------------------------------------------------------
// 5. UPDATE CREATIVE METADATA & STATUS (Scoped)
// ---------------------------------------------------------------------------
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { id } = req.params;
  const {
    name,
    clientId,
    projectId,
    taskId,
    description,
    campaignName,
    targetPlatform,
    adFormat,
    aspectRatio,
    status,
    activeProofId,
    primaryAdCopy,
    headline,
    callToAction,
    destinationUrl,
    designerId,
    approvalDueAt,
    tags,
    scriptContent,
    script_content,
    conceptIdea,
    concept_idea
  } = req.body;

  try {
    const params: any[] = [id, orgId];
    const scopeClause = buildCreativeScopeClause(req, params, 'creatives');

    const existing = await db.query(
      `SELECT * FROM creatives WHERE id = $1 AND organization_id = $2 ${scopeClause}`,
      params
    );

    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Creative not found or update permission denied' });
      return;
    }

    const current = existing.rows[0];

    // Validate project belongs to client if updated
    const targetClientId = clientId !== undefined ? clientId : current.client_id;
    const targetProjectId = projectId !== undefined ? projectId : current.project_id;
    if (targetClientId && targetProjectId) {
      const pCheck = await db.query(
        `SELECT id FROM projects WHERE id = $1 AND client_id = $2 AND organization_id = $3`,
        [targetProjectId, targetClientId, orgId]
      );
      if (pCheck.rows.length === 0) {
        res.status(400).json({ success: false, message: 'Selected project does not belong to the client account.' });
        return;
      }
    }

    // Validate task if provided
    if (taskId) {
      const tCheck = await db.query(
        `SELECT id FROM tasks WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL`,
        [taskId, orgId]
      );
      if (tCheck.rows.length === 0) {
        res.status(400).json({ success: false, message: 'Selected task not found in organization.' });
        return;
      }
    }

    const effectiveTaskId = taskId !== undefined ? (taskId || null) : current.task_id;
    const targetScript = scriptContent !== undefined ? scriptContent : script_content;
    const targetConcept = conceptIdea !== undefined ? conceptIdea : concept_idea;

    const updateRes = await db.query(
      `UPDATE creatives SET
        name = COALESCE($1, name),
        client_id = COALESCE($2, client_id),
        project_id = COALESCE($3, project_id),
        task_id = $4,
        description = COALESCE($5, description),
        campaign_name = COALESCE($6, campaign_name),
        target_platform = COALESCE($7, target_platform),
        ad_format = COALESCE($8, ad_format),
        aspect_ratio = COALESCE($9, aspect_ratio),
        status = COALESCE($10, status),
        active_proof_id = COALESCE($11, active_proof_id),
        primary_ad_copy = COALESCE($12, primary_ad_copy),
        headline = COALESCE($13, headline),
        call_to_action = COALESCE($14, call_to_action),
        destination_url = COALESCE($15, destination_url),
        designer_id = COALESCE($16, designer_id),
        approval_due_at = COALESCE($17, approval_due_at),
        tags = COALESCE($18, tags),
        script_content = CASE WHEN $21::boolean THEN $22::text ELSE script_content END,
        concept_idea = CASE WHEN $23::boolean THEN $24::text ELSE concept_idea END,
        updated_at = NOW()
      WHERE id = $19 AND organization_id = $20
      RETURNING *`,
      [
        name,
        clientId,
        projectId,
        effectiveTaskId,
        description,
        campaignName,
        targetPlatform,
        adFormat,
        aspectRatio,
        status,
        activeProofId,
        primaryAdCopy,
        headline,
        callToAction,
        destinationUrl,
        designerId,
        approvalDueAt,
        tags,
        id,
        orgId,
        targetScript !== undefined,
        targetScript || null,
        targetConcept !== undefined,
        targetConcept || null
      ]
    );

    // If status changed, record audit log
    if (status && status !== current.status) {
      await db.query(
        `INSERT INTO creative_audit_logs (
          organization_id, creative_id, proof_id, action, actor_type, actor_id, actor_name, metadata
        ) VALUES ($1, $2, $3, $4, 'INTERNAL_USER', $5, $6, $7)`,
        [
          orgId,
          id,
          activeProofId || current.active_proof_id,
          `STATUS_CHANGED_${status}`,
          userId,
          `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
          JSON.stringify({ previousStatus: current.status, newStatus: status })
        ]
      );

      // Auto-complete linked task if creative was approved and moved to DEPLOYMENT_READY or LIVE
      if (effectiveTaskId && (status === 'DEPLOYMENT_READY' || status === 'LIVE')) {
        const userFullName = `${req.user?.firstName || 'User'} ${req.user?.lastName || ''}`.trim();
        const stageLabel = status === 'LIVE' ? 'Live Campaigns' : 'Deployment Ready';
        await db.query(
          `UPDATE tasks
           SET 
             status = 'Completed',
             progress = 100,
             completed_at = COALESCE(completed_at, NOW()),
             updated_by = $1,
             stage_history = COALESCE(stage_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
               'from_status', status,
               'to_status', 'Completed',
               'changed_by', $1,
               'user_name', $2,
               'changed_at', NOW(),
               'notes', 'Auto-completed deliverable: creative approved & moved to ' || $3
             ))
           WHERE id = $4 AND organization_id = $5 AND status != 'Completed'`,
          [userId, userFullName, stageLabel, effectiveTaskId, orgId]
        );
      }

      // If creative is reverted from DEPLOYMENT_READY or LIVE to an earlier stage, revert task back to In Progress
      if (effectiveTaskId && current.status && ['DEPLOYMENT_READY', 'LIVE'].includes(current.status) && !['DEPLOYMENT_READY', 'LIVE'].includes(status)) {
        const userFullName = `${req.user?.firstName || 'User'} ${req.user?.lastName || ''}`.trim();
        await db.query(
          `UPDATE tasks
           SET 
             status = 'In Progress',
             progress = 75,
             completed_at = NULL,
             updated_by = $1,
             stage_history = COALESCE(stage_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
               'from_status', status,
               'to_status', 'In Progress',
               'changed_by', $1,
               'user_name', $2,
               'changed_at', NOW(),
               'notes', 'Reverted from Completed: creative deliverable moved back to ' || $3
             ))
           WHERE id = $4 AND organization_id = $5 AND status = 'Completed'`,
          [userId, userFullName, status, effectiveTaskId, orgId]
        );
      }
    }

    // Notify Task Assignee if script or creative details were updated
    if (effectiveTaskId) {
      const actorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'A team member';
      const isScriptUpdated = targetScript !== undefined || targetConcept !== undefined;
      const isDetailsUpdated = headline !== undefined || primaryAdCopy !== undefined || callToAction !== undefined || targetPlatform !== undefined || adFormat !== undefined;

      if (isScriptUpdated || isDetailsUpdated) {
        notifyTaskAssigneeOnCreativeEvent({
          orgId,
          taskId: effectiveTaskId,
          creativeId: id,
          creativeName: updateRes.rows[0]?.name || current.name,
          actorName,
          actorId: userId,
          event: isScriptUpdated ? 'script_updated' : 'details_added',
          scriptSnippet: targetScript || targetConcept || primaryAdCopy || headline || current.script_content || current.concept_idea
        }).catch(e => console.error('[Task Assignee Notification Error on update]:', e));
      }
    }

    res.json({
      success: true,
      message: 'Creative updated successfully',
      creative: updateRes.rows[0]
    });
  } catch (err: any) {
    console.error('[Creatives API] Update Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update creative'});
  }
});

// ---------------------------------------------------------------------------
// 5b. LINK / UNLINK CREATIVE TO A TASK (Dedicated Lightweight Endpoint)
// ---------------------------------------------------------------------------
router.patch('/:id/link-task', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { id } = req.params;
  const { taskId } = req.body;

  try {
    const check = await db.query(
      `SELECT id, project_id, task_id FROM creatives WHERE id = $1 AND organization_id = $2`,
      [id, orgId]
    );
    if (check.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Creative not found' });
      return;
    }

    if (taskId) {
      const taskCheck = await db.query(
        `SELECT id, project_id FROM tasks WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL`,
        [taskId, orgId]
      );
      if (taskCheck.rows.length === 0) {
        res.status(400).json({ success: false, message: 'Task not found in this organization' });
        return;
      }
    }

    const result = await db.query(
      `UPDATE creatives SET task_id = $1, updated_at = NOW() WHERE id = $2 AND organization_id = $3 RETURNING *`,
      [taskId || null, id, orgId]
    );

    // If linking to a task and this creative is already in DEPLOYMENT_READY or LIVE, complete the task
    if (taskId && ['DEPLOYMENT_READY', 'LIVE'].includes(check.rows[0].status)) {
      const userFullName = `${req.user?.firstName || 'User'} ${req.user?.lastName || ''}`.trim();
      const stageLabel = check.rows[0].status === 'LIVE' ? 'Live Campaigns' : 'Deployment Ready';
      await db.query(
        `UPDATE tasks
         SET 
           status = 'Completed',
           progress = 100,
           completed_at = COALESCE(completed_at, NOW()),
           updated_by = $1,
           stage_history = COALESCE(stage_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
             'from_status', status,
             'to_status', 'Completed',
             'changed_by', $1,
             'user_name', $2,
             'changed_at', NOW(),
             'notes', 'Auto-completed deliverable: linked creative is already in ' || $3
           ))
         WHERE id = $4 AND organization_id = $5 AND status != 'Completed'`,
        [req.user!.id, userFullName, stageLabel, taskId, orgId]
      );
    }

    if (taskId) {
      const cr = result.rows[0];
      const actorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'A team member';
      notifyTaskAssigneeOnCreativeEvent({
        orgId,
        taskId,
        creativeId: id,
        creativeName: cr.name,
        actorName,
        actorId: req.user!.id,
        event: (cr.script_content || cr.concept_idea) ? 'script_added' : 'details_added',
        scriptSnippet: cr.script_content || cr.concept_idea || cr.headline || cr.primary_ad_copy
      }).catch(e => console.error('[Task Link Notification Error]:', e));
    }

    res.json({
      success: true,
      message: taskId ? 'Creative linked to task' : 'Creative unlinked from task',
      creative: result.rows[0]
    });
  } catch (err: any) {
    console.error('[Creatives API] Link Task Error:', err);
    res.status(500).json({ success: false, message: 'Failed to link creative to task'});
  }
});

// ---------------------------------------------------------------------------
// 6. DELETE CREATIVE & PURGE R2 STORAGE ASSETS (Full Cascade & Access Check)
// ---------------------------------------------------------------------------
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const params: any[] = [id, orgId];
    const scopeClause = buildCreativeScopeClause(req, params, 'creatives');

    const checkRes = await db.query(
      `SELECT * FROM creatives WHERE id = $1 AND organization_id = $2 ${scopeClause}`,
      params
    );

    if (checkRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Creative not found or delete permission denied' });
      return;
    }

    const creative = checkRes.rows[0];

    // 1. Gather all R2 storage keys across all proofs belonging to this creative
    const assetsRes = await db.query(
      `SELECT cpa.storage_key, cpa.thumbnail_storage_key, cpa.preview_storage_key
       FROM creative_proof_assets cpa
       JOIN creative_proofs cp ON cpa.proof_id = cp.id
       WHERE cp.creative_id = $1 AND cpa.organization_id = $2`,
      [id, orgId]
    );

    const storageKeysToDelete: string[] = [];
    for (const row of assetsRes.rows) {
      if (row.storage_key) storageKeysToDelete.push(row.storage_key);
      if (row.thumbnail_storage_key) storageKeysToDelete.push(row.thumbnail_storage_key);
      if (row.preview_storage_key) storageKeysToDelete.push(row.preview_storage_key);
    }

    // 2. Batch delete objects from Cloudflare R2 bucket
    if (storageKeysToDelete.length > 0) {
      await StorageService.deleteObjects(storageKeysToDelete);
    }

    // 3. Delete database record (Foreign key constraints cascade to proofs, assets, comments, approvals, share links)
    await db.query(`DELETE FROM creatives WHERE id = $1 AND organization_id = $2`, [id, orgId]);

    res.json({
      success: true,
      message: `Creative "${creative.name}" and ${storageKeysToDelete.length} associated R2 asset files deleted successfully.`
    });
  } catch (err: any) {
    console.error('[Creatives API] Delete Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete creative'});
  }
});

// ---------------------------------------------------------------------------
// 7. REGISTER NEW PROOF VERSION (Immutable Snapshot with Assets)
// ---------------------------------------------------------------------------
router.post('/:id/proofs', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { id } = req.params;
  const { title, changeSummary, assets, parentProofId, setAsActive = true } = req.body;

  // Verify access to creative
  const params: any[] = [id, orgId];
  const scopeClause = buildCreativeScopeClause(req, params, 'creatives');
  const creativeCheck = await db.query(
    `SELECT id, name FROM creatives WHERE id = $1 AND organization_id = $2 ${scopeClause}`,
    params
  );

  if (creativeCheck.rows.length === 0) {
    res.status(404).json({ success: false, message: 'Creative not found or upload permission denied' });
    return;
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Get max version number
    const maxVerRes = await client.query(
      `SELECT COALESCE(MAX(version_number), 0) as max_version FROM creative_proofs WHERE creative_id = $1`,
      [id]
    );
    const nextVersion = parseInt(maxVerRes.rows[0].max_version) + 1;

    // Create Proof
    const proofRes = await client.query(
      `INSERT INTO creative_proofs (
        organization_id, creative_id, version_number, parent_proof_id,
        title, change_summary, status, is_immutable, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', false, $7)
      RETURNING *`,
      [
        orgId,
        id,
        nextVersion,
        parentProofId || null,
        title || `Version ${nextVersion}`,
        changeSummary || `Uploaded proof version ${nextVersion}`,
        userId
      ]
    );

    const proof = proofRes.rows[0];

    // Insert assets
    if (assets && Array.isArray(assets)) {
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const insertedRes = await client.query(
          `INSERT INTO creative_proof_assets (
            organization_id, proof_id, asset_type, slide_order, storage_key,
            file_name, file_size_bytes, mime_type, width_px, height_px,
            duration_seconds, video_codec, thumbnail_storage_key
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *`,
          [
            orgId,
            proof.id,
            asset.assetType || 'IMAGE',
            asset.slideOrder !== undefined ? asset.slideOrder : (i + 1),
            asset.storageKey,
            asset.fileName || 'asset',
            asset.fileSizeBytes || 0,
            asset.mimeType || 'image/jpeg',
            asset.widthPx || null,
            asset.heightPx || null,
            asset.durationSeconds || null,
            asset.videoCodec || null,
            asset.thumbnailStorageKey || null
          ]
        );

        // Asynchronously pre-generate server-side watermarked deliverable in R2
        const newAsset = insertedRes.rows[0];
        WatermarkService.getOrGenerateWatermarkedKey(newAsset).catch((err) =>
          console.error('[Proof Version Asset Pre-Watermark Error]:', err)
        );
      }
    }

    // Set as active proof and update status to INTERNAL_REVIEW or DRAFT
    if (setAsActive) {
      await client.query(
        `UPDATE creatives SET
          active_proof_id = $1,
          status = 'INTERNAL_REVIEW',
          updated_at = NOW()
        WHERE id = $2`,
        [proof.id, id]
      );
    }

    // Audit Log
    await client.query(
      `INSERT INTO creative_audit_logs (
        organization_id, creative_id, proof_id, action, actor_type, actor_id, actor_name, metadata
      ) VALUES ($1, $2, $3, 'PROOF_UPLOADED', 'INTERNAL_USER', $4, $5, $6)`,
      [
        orgId,
        id,
        proof.id,
        userId,
        `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
        JSON.stringify({ versionNumber: nextVersion, assetCount: assets?.length || 0 })
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: `Proof v${nextVersion} registered successfully`,
      proof
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Creatives API] Register Proof Error:', err);
    res.status(500).json({ success: false, message: 'Failed to register proof version'});
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// 8. R2 STORAGE UPLOAD SESSIONS & DIRECT PROXY
// ---------------------------------------------------------------------------

// Direct Backend Stream Upload (Guarantees zero-CORS issues & supports up to 500MB video/image streaming)
router.post(
  '/upload-direct',
  requireAuth,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const orgId = req.user!.organizationId;
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const {
      creativeId = 'temp_' + Date.now(),
      versionNumber = '1',
      assetType = 'IMAGE',
      slideOrder
    } = req.body;

    try {
      const sanitizedFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = Date.now();
      const storageKey = `creatives/${orgId}/${creativeId}/v${versionNumber}/${assetType}_${timestamp}_${sanitizedFileName}`;

      await StorageService.uploadDirectBuffer(
        storageKey,
        req.file.buffer,
        req.file.mimetype || 'application/octet-stream'
      );

      res.json({
        success: true,
        storageKey,
        fileName: req.file.originalname,
        fileSizeBytes: req.file.size,
        mimeType: req.file.mimetype || 'application/octet-stream',
        assetType: assetType,
        slideOrder: slideOrder ? parseInt(slideOrder, 10) : undefined
      });
    } catch (err: any) {
      console.error('[Creatives API] Direct Upload Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to stream file to Cloudflare R2'});
    }
  }
);

// Single-part presigned PUT URL
router.post('/upload-session', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { creativeId, versionNumber = 1, fileName, mimeType, assetType = 'IMAGE', slideOrder } = req.body;

  if (!fileName || !mimeType) {
    res.status(400).json({ success: false, message: 'fileName and mimeType are required' });
    return;
  }

  try {
    const result = await StorageService.generateUploadPresignedUrl({
      orgId,
      creativeId: creativeId || 'temp_' + Date.now(),
      versionNumber,
      fileName,
      mimeType,
      assetType,
      slideOrder
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error('[Creatives API] Upload Session Error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate upload presigned URL'});
  }
});

// Initialize Multipart Upload for Large Videos
router.post('/upload-session/multipart/init', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { creativeId, versionNumber = 1, fileName, mimeType = 'video/mp4', assetType = 'VIDEO' } = req.body;

  try {
    const result = await StorageService.createMultipartUpload({
      orgId,
      creativeId: creativeId || 'temp_' + Date.now(),
      versionNumber,
      fileName,
      mimeType,
      assetType
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error('[Creatives API] Multipart Init Error:', err);
    res.status(500).json({ success: false, message: 'Failed to initiate multipart upload'});
  }
});

// Get presigned URLs for video parts
router.post('/upload-session/multipart/parts', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { storageKey, uploadId, partNumbers } = req.body;

  if (!storageKey || !uploadId || !Array.isArray(partNumbers)) {
    res.status(400).json({ success: false, message: 'storageKey, uploadId, and partNumbers array required' });
    return;
  }

  try {
    const partUrls = await StorageService.getMultipartPartUrls(storageKey, uploadId, partNumbers);
    res.json({
      success: true,
      parts: partUrls
    });
  } catch (err: any) {
    console.error('[Creatives API] Multipart Parts Error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate part presigned URLs'});
  }
});

// Complete Multipart Upload
router.post('/upload-session/multipart/complete', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { storageKey, uploadId, parts } = req.body;

  if (!storageKey || !uploadId || !Array.isArray(parts)) {
    res.status(400).json({ success: false, message: 'storageKey, uploadId, and parts array required' });
    return;
  }

  try {
    const result = await StorageService.completeMultipartUpload(storageKey, uploadId, parts);
    res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error('[Creatives API] Multipart Complete Error:', err);
    res.status(500).json({ success: false, message: 'Failed to complete multipart upload'});
  }
});

// Abort Multipart Upload
router.post('/upload-session/multipart/abort', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { storageKey, uploadId } = req.body;

  try {
    await StorageService.abortMultipartUpload(storageKey, uploadId);
    res.json({ success: true, message: 'Multipart upload aborted successfully' });
  } catch (err: any) {
    console.error('[Creatives API] Multipart Abort Error:', err);
    res.status(500).json({ success: false, message: 'Failed to abort multipart upload'});
  }
});

// ---------------------------------------------------------------------------
// 9. CRYPTOGRAPHIC CLIENT SHARE LINKS (SHA-256 Hashed Tokens)
// ---------------------------------------------------------------------------
router.post('/:id/proofs/:proofId/share', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { id, proofId } = req.params;
  const {
    expiresInDays = 14,
    allowComments = true,
    allowApprovals = true,
    recipientEmail,
    recipientName,
    requireOtp = true
  } = req.body;

  try {
    // Generate secure 32-byte hex token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashProofToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const insertRes = await db.query(
      `INSERT INTO creative_share_links (
        organization_id, creative_id, proof_id, token_hash,
        created_by, expires_at, allow_comments, allow_approvals,
        recipient_email, recipient_name, require_otp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, expires_at, allow_comments, allow_approvals, recipient_email, recipient_name, require_otp, created_at`,
      [
        orgId,
        id,
        proofId,
        tokenHash,
        userId,
        expiresAt,
        allowComments,
        allowApprovals,
        recipientEmail ? recipientEmail.trim().toLowerCase() : null,
        recipientName ? recipientName.trim() : null,
        requireOtp
      ]
    );

    // Update creative status to PENDING_CLIENT_APPROVAL
    await db.query(
      `UPDATE creatives SET status = 'PENDING_CLIENT_APPROVAL', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    // Lock proof version (make immutable once shared)
    await db.query(
      `UPDATE creative_proofs SET is_immutable = true, status = 'PENDING_CLIENT_APPROVAL' WHERE id = $1`,
      [proofId]
    );

    // Audit Log
    await db.query(
      `INSERT INTO creative_audit_logs (
        organization_id, creative_id, proof_id, action, actor_type, actor_id, actor_name, metadata
      ) VALUES ($1, $2, $3, 'SHARE_LINK_GENERATED', 'INTERNAL_USER', $4, $5, $6)`,
      [
        orgId,
        id,
        proofId,
        userId,
        `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
        JSON.stringify({ expiresInDays, shareLinkId: insertRes.rows[0].id, recipientEmail, requireOtp })
      ]
    );

    res.status(201).json({
      success: true,
      shareLink: {
        ...insertRes.rows[0],
        token: rawToken, // ONLY returned once upon generation
        shareUrl: `${(process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://optivircrm.vercel.app' : 'http://localhost:3000')).replace(/\/$/, '')}/portal/proof/${rawToken}`
      }
    });
  } catch (err: any) {
    console.error('[Creatives API] Share Link Error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate share link'});
  }
});

// Agency directly dispatches creative review invite via Gmail
router.post('/:id/proofs/:proofId/send-email', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { id, proofId } = req.params;
  const { recipientEmail, recipientName, personalMessage, expiresInDays = 14 } = req.body;

  if (!recipientEmail || !recipientEmail.includes('@')) {
    res.status(400).json({ success: false, message: 'A valid client recipient email is required.' });
    return;
  }

  try {
    const cleanEmail = recipientEmail.trim().toLowerCase();
    const cleanName = recipientName?.trim();

    // Generate secure share link bound to this client email
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashProofToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const insertRes = await db.query(
      `INSERT INTO creative_share_links (
        organization_id, creative_id, proof_id, token_hash,
        created_by, expires_at, allow_comments, allow_approvals,
        recipient_email, recipient_name, require_otp
      ) VALUES ($1, $2, $3, $4, $5, $6, true, true, $7, $8, true)
      RETURNING id, expires_at, recipient_email, recipient_name, created_at`,
      [orgId, id, proofId, tokenHash, userId, expiresAt, cleanEmail, cleanName || null]
    );

    // Fetch creative & org name
    const cRes = await db.query(
      `SELECT c.name, o.name as org_name FROM creatives c JOIN organizations o ON c.organization_id = o.id WHERE c.id = $1`,
      [id]
    );
    const creativeName = cRes.rows[0]?.name || 'Creative Deliverable';
    const agencyName = cRes.rows[0]?.org_name || 'OptiVir CRM';

    const defaultFrontend = process.env.NODE_ENV === 'production' ? 'https://optivircrm.vercel.app' : 'http://localhost:3000';
    const frontendBase = (process.env.FRONTEND_URL || defaultFrontend).replace(/\/$/, '');
    const shareUrl = `${frontendBase}/portal/proof/${rawToken}`;

    // Send invitation email via Gmail
    const sent = await EmailService.sendProofInviteEmail({
      toEmail: cleanEmail,
      recipientName: cleanName,
      shareUrl,
      creativeName,
      agencyName,
      personalMessage: personalMessage?.trim()
    });

    // Update creative status
    await db.query(
      `UPDATE creatives SET status = 'PENDING_CLIENT_APPROVAL', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    // Lock proof version
    await db.query(
      `UPDATE creative_proofs SET is_immutable = true, status = 'PENDING_CLIENT_APPROVAL' WHERE id = $1`,
      [proofId]
    );

    // Audit Log
    await db.query(
      `INSERT INTO creative_audit_logs (
        organization_id, creative_id, proof_id, action, actor_type, actor_id, actor_name, metadata
      ) VALUES ($1, $2, $3, 'INVITE_EMAIL_SENT', 'INTERNAL_USER', $4, $5, $6)`,
      [
        orgId,
        id,
        proofId,
        userId,
        `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
        JSON.stringify({ recipientEmail: cleanEmail, recipientName: cleanName, shareUrl })
      ]
    );

    res.json({
      success: true,
      message: `Review link successfully sent to ${cleanEmail} via Gmail.`,
      shareLink: {
        ...insertRes.rows[0],
        shareUrl
      },
      emailSent: sent
    });
  } catch (err: any) {
    console.error('[Send Email Proof Link Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to send review link via email'});
  }
});

// Revoke share link
router.post('/share-links/:linkId/revoke', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { linkId } = req.params;

  try {
    const revokeRes = await db.query(
      `UPDATE creative_share_links SET
        revoked_at = NOW()
      WHERE id = $1 AND organization_id = $2
      RETURNING *`,
      [linkId, orgId]
    );

    if (revokeRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Share link not found' });
      return;
    }

    const link = revokeRes.rows[0];

    // Audit Log
    await db.query(
      `INSERT INTO creative_audit_logs (
        organization_id, creative_id, proof_id, action, actor_type, actor_id, actor_name, metadata
      ) VALUES ($1, $2, $3, 'SHARE_LINK_REVOKED', 'INTERNAL_USER', $4, $5, $6)`,
      [
        orgId,
        link.creative_id,
        link.proof_id,
        userId,
        `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
        JSON.stringify({ linkId })
      ]
    );

    res.json({
      success: true,
      message: 'Share link revoked successfully'
    });
  } catch (err: any) {
    console.error('[Creatives API] Revoke Link Error:', err);
    res.status(500).json({ success: false, message: 'Failed to revoke share link'});
  }
});

// ---------------------------------------------------------------------------
// 9.5. ASSET DOWNLOAD WITH STRICT WATERMARK ENFORCEMENT
// Rule: Nobody other than Account Manager, Creator, and Owner can download clean creatives.
// Everybody else receives the watermarked version only.
// ---------------------------------------------------------------------------
router.get('/:id/proofs/:proofId/assets/:assetId/download', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const user = req.user!;
  const { id, proofId, assetId } = req.params;
  const requestedMode = req.query.mode === 'original' ? 'original' : 'watermarked';

  try {
    const creativeRes = await db.query(
      `SELECT c.*, cl.account_manager_id as client_account_manager_id
       FROM creatives c
       LEFT JOIN clients cl ON c.client_id = cl.id
       WHERE c.id = $1 AND c.organization_id = $2`,
      [id, orgId]
    );

    if (creativeRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Creative not found' });
      return;
    }

    const creative = creativeRes.rows[0];

    const assetRes = await db.query(
      `SELECT a.*, p.uploaded_by as proof_uploaded_by
       FROM creative_proof_assets a
       JOIN creative_proofs p ON a.proof_id = p.id
       WHERE a.id = $1 AND a.proof_id = $2 AND p.creative_id = $3`,
      [assetId, proofId, id]
    );

    if (assetRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Asset not found' });
      return;
    }

    const asset = assetRes.rows[0];

    const role = (user.role || '').toLowerCase();
    const isOwner = Boolean(user.isOwner || role === 'owner' || role === 'super_admin');
    const isAccountManager = Boolean(
      role === 'account_manager' ||
      (creative.client_account_manager_id && creative.client_account_manager_id === user.id)
    );
    const isCreator = Boolean(
      (creative.created_by && user.id === creative.created_by) ||
      (creative.designer_id && user.id === creative.designer_id) ||
      (asset.proof_uploaded_by && user.id === asset.proof_uploaded_by)
    );

    const canDownloadOriginal = isOwner || isAccountManager || isCreator;

    if (requestedMode === 'original' && canDownloadOriginal) {
      const signedUrl = await StorageService.generateViewingSignedUrl(asset.storage_key, 300);
      res.redirect(signedUrl);
      return;
    }

    // Force watermark for everyone else or if watermarked requested
    const watermarked = await WatermarkService.createWatermarkedAsset({
      storageKey: asset.storage_key,
      fileName: asset.file_name,
      assetType: asset.asset_type,
      mimeType: asset.mime_type
    });

    res.setHeader('Content-Type', watermarked.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${watermarked.fileName}"`);

    const readStream = fs.createReadStream(watermarked.filePath);
    readStream.pipe(res);
    readStream.on('close', () => watermarked.cleanup());
    readStream.on('error', (err) => {
      console.error('[Watermark Stream Error]:', err);
      watermarked.cleanup();
    });
  } catch (err: any) {
    console.error('[Download API Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to process asset download'});
  }
});

// ---------------------------------------------------------------------------
// 10. INTERNAL COMMENTS & ANNOTATIONS
// ---------------------------------------------------------------------------
router.post('/:id/proofs/:proofId/comments', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { id, proofId } = req.params;
  const {
    assetId,
    content,
    pinXPercent,
    pinYPercent,
    timestampStartSeconds,
    timestampEndSeconds,
    parentCommentId
  } = req.body;

  if (!content) {
    res.status(400).json({ success: false, message: 'Comment content is required' });
    return;
  }

  try {
    const authorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'Agency Team';

    const commentRes = await db.query(
      `INSERT INTO creative_comments (
        organization_id, proof_id, asset_id, author_user_id, author_name,
        author_email, is_client_comment, content, pin_x_percent, pin_y_percent,
        timestamp_start_seconds, timestamp_end_seconds, parent_comment_id
      ) VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        orgId,
        proofId,
        assetId || null,
        userId,
        authorName,
        req.user?.email,
        content,
        pinXPercent !== undefined ? pinXPercent : null,
        pinYPercent !== undefined ? pinYPercent : null,
        timestampStartSeconds !== undefined ? timestampStartSeconds : null,
        timestampEndSeconds !== undefined ? timestampEndSeconds : null,
        parentCommentId || null
      ]
    );

    // Audit Log
    await db.query(
      `INSERT INTO creative_audit_logs (
        organization_id, creative_id, proof_id, action, actor_type, actor_id, actor_name, metadata
      ) VALUES ($1, $2, $3, 'COMMENT_ADDED', 'INTERNAL_USER', $4, $5, $6)`,
      [
        orgId,
        id,
        proofId,
        userId,
        authorName,
        JSON.stringify({ commentId: commentRes.rows[0].id, hasPin: pinXPercent !== undefined })
      ]
    );

    res.status(201).json({
      success: true,
      comment: commentRes.rows[0]
    });
  } catch (err: any) {
    console.error('[Creatives API] Add Comment Error:', err);
    res.status(500).json({ success: false, message: 'Failed to add comment'});
  }
});

// Toggle Resolve Comment
router.patch('/comments/:commentId/resolve', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { commentId } = req.params;
  const { isResolved } = req.body;

  try {
    const updateRes = await db.query(
      `UPDATE creative_comments SET
        is_resolved = $1,
        resolved_by = CASE WHEN $1 = true THEN $2 ELSE NULL END,
        resolved_at = CASE WHEN $1 = true THEN NOW() ELSE NULL END,
        updated_at = NOW()
      WHERE id = $3 AND organization_id = $4
      RETURNING *`,
      [isResolved ?? true, userId, commentId, orgId]
    );

    if (updateRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }

    res.json({
      success: true,
      comment: updateRes.rows[0]
    });
  } catch (err: any) {
    console.error('[Creatives API] Resolve Comment Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update comment resolution'});
  }
});

// Delete Comment & Spatial Pin
router.delete('/comments/:commentId', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { commentId } = req.params;

  try {
    const isGlobal = isGlobalLeadership(req.user?.role, req.user?.isOwner);
    const delRes = isGlobal
      ? await db.query(
          `DELETE FROM creative_comments
           WHERE id = $1 AND organization_id = $2
           RETURNING *`,
          [commentId, orgId]
        )
      : await db.query(
          `DELETE FROM creative_comments
           WHERE id = $1 AND organization_id = $2 AND author_user_id = $3
           RETURNING *`,
          [commentId, orgId, userId]
        );

    if (delRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }

    const deleted = delRes.rows[0];

    // Audit Log
    const authorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'Agency Team';
    await db.query(
      `INSERT INTO creative_audit_logs (
        organization_id, proof_id, action, actor_type, actor_id, actor_name, metadata
      ) VALUES ($1, $2, 'COMMENT_DELETED', 'INTERNAL_USER', $3, $4, $5)`,
      [
        orgId,
        deleted.proof_id,
        userId,
        authorName,
        JSON.stringify({ commentId, deletedAuthor: deleted.author_name })
      ]
    );

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      deletedCommentId: commentId
    });
  } catch (err: any) {
    console.error('[Creatives API] Delete Comment Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete comment'});
  }
});

// ---------------------------------------------------------------------------
// 11. INTERNAL APPROVAL SIGN-OFF
// ---------------------------------------------------------------------------
router.post('/:id/proofs/:proofId/approvals', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { id, proofId } = req.params;
  const { decision, feedbackNotes } = req.body; // 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'

  if (!decision || !['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'].includes(decision)) {
    res.status(400).json({ success: false, message: 'Valid decision is required (APPROVED, CHANGES_REQUESTED, REJECTED)' });
    return;
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const approverName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || 'Agency Lead';

    const approvalRes = await client.query(
      `INSERT INTO creative_approvals (
        organization_id, creative_id, proof_id, approver_user_id,
        decision, feedback_notes, approver_name, approver_email,
        ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        orgId,
        id,
        proofId,
        userId,
        decision,
        feedbackNotes || null,
        approverName,
        req.user?.email,
        req.ip,
        req.headers['user-agent']
      ]
    );

    // Update proof and creative statuses
    let newStatus = 'DRAFT';
    if (decision === 'APPROVED') {
      newStatus = 'APPROVED';
    } else if (decision === 'CHANGES_REQUESTED') {
      newStatus = 'CHANGES_REQUESTED';
    }

    await client.query(
      `UPDATE creative_proofs SET status = $1, is_immutable = true WHERE id = $2`,
      [newStatus, proofId]
    );

    await client.query(
      `UPDATE creatives SET status = $1, updated_at = NOW() WHERE id = $2`,
      [newStatus, id]
    );

    // Audit Log
    await client.query(
      `INSERT INTO creative_audit_logs (
        organization_id, creative_id, proof_id, action, actor_type, actor_id, actor_name, metadata
      ) VALUES ($1, $2, $3, $4, 'INTERNAL_USER', $5, $6, $7)`,
      [
        orgId,
        id,
        proofId,
        decision === 'APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED',
        userId,
        approverName,
        JSON.stringify({ decision, feedbackNotes })
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      approval: approvalRes.rows[0],
      creativeStatus: newStatus
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Creatives API] Approval Sign-off Error:', err);
    res.status(500).json({ success: false, message: 'Failed to record approval'});
  } finally {
    client.release();
  }
});

export default router;
