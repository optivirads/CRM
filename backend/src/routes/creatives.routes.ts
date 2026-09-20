import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { StorageService } from '../services/storage.service';

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

  // 2. Global Agency Leadership & Assistants: Access all creatives in current organization
  if (isGlobalRole(user.role, user.isOwner)) {
    return '';
  }

  // 3. Scoped Team Members:
  // Access if:
  // - Assigned as Account Manager or Account Assistant(s) on the Client
  // - Assigned to the Project as a member
  // - Assigned as the Designer on the Creative
  // - Or is the Creator of the Creative
  // - Or Creative is internal agency asset (client_id is null)
  params.push(user.id);
  const userParamIdx = params.length;

  return ` AND (
    ${tablePrefix}.designer_id = $${userParamIdx}
    OR ${tablePrefix}.created_by = $${userParamIdx}
    OR ${tablePrefix}.client_id IS NULL
    OR EXISTS (
      SELECT 1 FROM clients cl_scope
      WHERE cl_scope.id = ${tablePrefix}.client_id
      AND (
        cl_scope.account_manager_id = $${userParamIdx}
        OR cl_scope.account_assistant_id = $${userParamIdx}
        OR $${userParamIdx} = ANY(COALESCE(cl_scope.account_assistant_ids, '{}'))
        OR EXISTS (
          SELECT 1 FROM client_assistants ca_sub
          WHERE ca_sub.client_id = cl_scope.id
          AND ca_sub.user_id = $${userParamIdx}
        )
      )
    )
    OR EXISTS (
      SELECT 1 FROM project_members pm_scope
      WHERE pm_scope.project_id = ${tablePrefix}.project_id
      AND pm_scope.user_id = $${userParamIdx}
    )
  )`;
}

// ---------------------------------------------------------------------------
// 1. METRICS & KPI DASHBOARD (Scoped)
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

    const stats = statsQuery.rows[0];
    const approvalStats = approvalsQuery.rows[0];
    const totalDecisions = parseInt(approvalStats?.total_decisions || '0');
    const approvedDecisions = parseInt(approvalStats?.approved_decisions || '0');
    const approvalRate = totalDecisions > 0 ? Math.round((approvedDecisions / totalDecisions) * 100) : 100;

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
        revisionsRequested: parseInt(approvalStats?.revisions_requested || '0')
      }
    });
  } catch (err: any) {
    console.error('[Creatives API] Metrics Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch creative metrics', error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 2. LIST CREATIVES (With multi-tenant, client & role scoping)
// ---------------------------------------------------------------------------
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { clientId, projectId, status, platform, format, search, designerId } = req.query;

  try {
    let query = `
      SELECT
        c.*,
        cl.company_id,
        co.name as client_name,
        p.name as project_name,
        u.first_name || ' ' || u.last_name as designer_name,
        cp.version_number as active_version,
        cp.title as active_proof_title,
        (SELECT COUNT(*) FROM creative_proofs WHERE creative_id = c.id) as version_count,
        (SELECT COUNT(*) FROM creative_comments cc JOIN creative_proofs pr ON cc.proof_id = pr.id WHERE pr.creative_id = c.id AND cc.is_resolved = false) as unresolved_comments_count
      FROM creatives c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies co ON cl.company_id = co.id
      LEFT JOIN projects p ON c.project_id = p.id
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
    const creativesWithAssets = await Promise.all(
      result.rows.map(async (row) => {
        let previewUrl = null;
        let assets: any[] = [];

        if (row.active_proof_id) {
          const assetsRes = await db.query(
            `SELECT * FROM creative_proof_assets WHERE proof_id = $1 ORDER BY slide_order ASC`,
            [row.active_proof_id]
          );

          assets = await Promise.all(
            assetsRes.rows.map(async (asset) => {
              const signedUrl = await StorageService.generateViewingSignedUrl(asset.storage_key);
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
    res.status(500).json({ success: false, message: 'Failed to list creatives', error: err.message });
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
    initialProof
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

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 1. Insert Creative Record
    const creativeRes = await client.query(
      `INSERT INTO creatives (
        organization_id, client_id, project_id, name, description, campaign_name,
        target_platform, ad_format, aspect_ratio, status, primary_ad_copy,
        headline, call_to_action, destination_url, designer_id, approval_due_at,
        tags, created_by, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'DRAFT', $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *`,
      [
        orgId,
        clientId || null,
        projectId || null,
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
          await client.query(
            `INSERT INTO creative_proof_assets (
              organization_id, proof_id, asset_type, slide_order, storage_key,
              file_name, file_size_bytes, mime_type, width_px, height_px,
              duration_seconds, video_codec, thumbnail_storage_key
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
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
        JSON.stringify({ name, adFormat, targetPlatform, clientId, projectId })
      ]
    );

    await client.query('COMMIT');

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
    res.status(500).json({ success: false, message: 'Failed to create creative', error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// 4. GET CREATIVE DETAILS (Scoped)
// ---------------------------------------------------------------------------
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
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
        u.first_name || ' ' || u.last_name as designer_name,
        u.email as designer_email
      FROM creatives c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies co ON cl.company_id = co.id
      LEFT JOIN projects p ON c.project_id = p.id
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

    // Load assets, comments, and approvals for each proof
    const proofs = await Promise.all(
      proofsRes.rows.map(async (proof) => {
        const assetsRes = await db.query(
          `SELECT * FROM creative_proof_assets WHERE proof_id = $1 ORDER BY slide_order ASC`,
          [proof.id]
        );

        const assets = await Promise.all(
          assetsRes.rows.map(async (asset) => {
            const viewingUrl = await StorageService.generateViewingSignedUrl(asset.storage_key);
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
    res.status(500).json({ success: false, message: 'Failed to get creative details', error: err.message });
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
    tags
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
    const targetClientId = clientId || current.client_id;
    const targetProjectId = projectId || current.project_id;
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

    const updateRes = await db.query(
      `UPDATE creatives SET
        name = COALESCE($1, name),
        client_id = COALESCE($2, client_id),
        project_id = COALESCE($3, project_id),
        description = COALESCE($4, description),
        campaign_name = COALESCE($5, campaign_name),
        target_platform = COALESCE($6, target_platform),
        ad_format = COALESCE($7, ad_format),
        aspect_ratio = COALESCE($8, aspect_ratio),
        status = COALESCE($9, status),
        active_proof_id = COALESCE($10, active_proof_id),
        primary_ad_copy = COALESCE($11, primary_ad_copy),
        headline = COALESCE($12, headline),
        call_to_action = COALESCE($13, call_to_action),
        destination_url = COALESCE($14, destination_url),
        designer_id = COALESCE($15, designer_id),
        approval_due_at = COALESCE($16, approval_due_at),
        tags = COALESCE($17, tags),
        updated_at = NOW()
      WHERE id = $18 AND organization_id = $19
      RETURNING *`,
      [
        name,
        clientId,
        projectId,
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
        orgId
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
    }

    res.json({
      success: true,
      message: 'Creative updated successfully',
      creative: updateRes.rows[0]
    });
  } catch (err: any) {
    console.error('[Creatives API] Update Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update creative', error: err.message });
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
    res.status(500).json({ success: false, message: 'Failed to delete creative', error: err.message });
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
        await client.query(
          `INSERT INTO creative_proof_assets (
            organization_id, proof_id, asset_type, slide_order, storage_key,
            file_name, file_size_bytes, mime_type, width_px, height_px,
            duration_seconds, video_codec, thumbnail_storage_key
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
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
    res.status(500).json({ success: false, message: 'Failed to register proof version', error: err.message });
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
        message: 'Failed to stream file to Cloudflare R2',
        error: err.message
      });
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
    res.status(500).json({ success: false, message: 'Failed to generate upload presigned URL', error: err.message });
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
    res.status(500).json({ success: false, message: 'Failed to initiate multipart upload', error: err.message });
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
    res.status(500).json({ success: false, message: 'Failed to generate part presigned URLs', error: err.message });
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
    res.status(500).json({ success: false, message: 'Failed to complete multipart upload', error: err.message });
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
    res.status(500).json({ success: false, message: 'Failed to abort multipart upload', error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 9. CRYPTOGRAPHIC CLIENT SHARE LINKS (SHA-256 Hashed Tokens)
// ---------------------------------------------------------------------------
router.post('/:id/proofs/:proofId/share', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { id, proofId } = req.params;
  const { expiresInDays = 14, allowComments = true, allowApprovals = true } = req.body;

  try {
    // Generate secure 32-byte hex token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashProofToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const insertRes = await db.query(
      `INSERT INTO creative_share_links (
        organization_id, creative_id, proof_id, token_hash,
        created_by, expires_at, allow_comments, allow_approvals
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, expires_at, allow_comments, allow_approvals, created_at`,
      [orgId, id, proofId, tokenHash, userId, expiresAt, allowComments, allowApprovals]
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
        JSON.stringify({ expiresInDays, shareLinkId: insertRes.rows[0].id })
      ]
    );

    res.status(201).json({
      success: true,
      shareLink: {
        ...insertRes.rows[0],
        token: rawToken, // ONLY returned once upon generation
        shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/proof/${rawToken}`
      }
    });
  } catch (err: any) {
    console.error('[Creatives API] Share Link Error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate share link', error: err.message });
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
    res.status(500).json({ success: false, message: 'Failed to revoke share link', error: err.message });
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
    res.status(500).json({ success: false, message: 'Failed to add comment', error: err.message });
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
    res.status(500).json({ success: false, message: 'Failed to update comment resolution', error: err.message });
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
    res.status(500).json({ success: false, message: 'Failed to record approval', error: err.message });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// 12. PUBLIC CLIENT PORTAL PROOFING ENDPOINTS (Zero internal CRM Auth required)
// ---------------------------------------------------------------------------

// Validate Token & Load Proof for Client
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

    // Increment access count & update last_accessed_at
    await db.query(
      `UPDATE creative_share_links SET
        access_count = access_count + 1,
        last_accessed_at = NOW()
      WHERE id = $1`,
      [shareLink.id]
    );

    // 2. Fetch Creative & Proof Details
    const creativeRes = await db.query(
      `SELECT
        c.id, c.name, c.description, c.campaign_name, c.target_platform,
        c.ad_format, c.aspect_ratio, c.status, c.primary_ad_copy, c.headline,
        c.call_to_action, c.destination_url, c.approval_due_at,
        co.name as client_name
      FROM creatives c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies co ON cl.company_id = co.id
      WHERE c.id = $1`,
      [shareLink.creative_id]
    );

    const creative = creativeRes.rows[0];

    // 3. Fetch Proof Version
    const proofRes = await db.query(
      `SELECT * FROM creative_proofs WHERE id = $1`,
      [shareLink.proof_id]
    );

    const proof = proofRes.rows[0];

    // 4. Fetch Assets & Generate Short-Lived Signed Viewing URLs
    const assetsRes = await db.query(
      `SELECT * FROM creative_proof_assets WHERE proof_id = $1 ORDER BY slide_order ASC`,
      [proof.id]
    );

    const assets = await Promise.all(
      assetsRes.rows.map(async (asset) => {
        const viewingUrl = await StorageService.generateViewingSignedUrl(asset.storage_key, 7200); // 2 hours
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

    // 5. Fetch Comments
    const commentsRes = await db.query(
      `SELECT
        id, asset_id, author_name, is_client_comment, content,
        pin_x_percent, pin_y_percent, timestamp_start_seconds,
        timestamp_end_seconds, is_resolved, created_at
      FROM creative_comments
      WHERE proof_id = $1
      ORDER BY created_at ASC`,
      [proof.id]
    );

    // 6. Fetch Existing Approvals
    const approvalsRes = await db.query(
      `SELECT id, decision, approver_name, feedback_notes, signed_at
       FROM creative_approvals
       WHERE proof_id = $1
       ORDER BY signed_at DESC`,
      [proof.id]
    );

    res.json({
      success: true,
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
    res.status(500).json({ success: false, message: 'Failed to load client proof', error: err.message });
  }
});

// Client submits a comment / pin annotation
router.post('/public/proofs/:token/comments', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const {
    assetId,
    authorName,
    authorEmail,
    content,
    pinXPercent,
    pinYPercent,
    timestampStartSeconds,
    timestampEndSeconds
  } = req.body;

  if (!content || !authorName) {
    res.status(400).json({ success: false, message: 'Name and comment content are required' });
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
        authorEmail?.trim() || null,
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
        authorEmail?.trim() || null,
        JSON.stringify({ commentId: commentRes.rows[0].id, hasPin: pinXPercent !== undefined }),
        req.ip
      ]
    );

    res.status(201).json({
      success: true,
      comment: commentRes.rows[0]
    });
  } catch (err: any) {
    console.error('[Public Proof API] Client Comment Error:', err);
    res.status(500).json({ success: false, message: 'Failed to post comment', error: err.message });
  }
});

// Client legally signs off and APPROVES proof
router.post('/public/proofs/:token/approve', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { approverName, approverEmail, feedbackNotes } = req.body;

  if (!approverName || !approverEmail) {
    res.status(400).json({ success: false, message: 'Full name and email are required for legal sign-off.' });
    return;
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const tokenHash = hashProofToken(token);
    const linkRes = await client.query(
      `SELECT * FROM creative_share_links WHERE token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at || (linkRes.rows[0].expires_at && new Date(linkRes.rows[0].expires_at) < new Date())) {
      res.status(403).json({ success: false, message: 'Invalid, expired, or revoked proof session' });
      await client.query('ROLLBACK');
      return;
    }

    const shareLink = linkRes.rows[0];

    if (!shareLink.allow_approvals) {
      res.status(403).json({ success: false, message: 'Formal approval is disabled for this link.' });
      await client.query('ROLLBACK');
      return;
    }

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

    res.status(201).json({
      success: true,
      message: 'Creative proof approved successfully!',
      approval: approvalRes.rows[0]
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Public Proof API] Client Approval Error:', err);
    res.status(500).json({ success: false, message: 'Failed to record approval', error: err.message });
  } finally {
    client.release();
  }
});

// Client REQUESTS CHANGES on proof
router.post('/public/proofs/:token/request-changes', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { reviewerName, reviewerEmail, changeNotes } = req.body;

  if (!reviewerName || !changeNotes) {
    res.status(400).json({ success: false, message: 'Name and change request details are required.' });
    return;
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const tokenHash = hashProofToken(token);
    const linkRes = await client.query(
      `SELECT * FROM creative_share_links WHERE token_hash = $1`,
      [tokenHash]
    );

    if (linkRes.rows.length === 0 || linkRes.rows[0].revoked_at || (linkRes.rows[0].expires_at && new Date(linkRes.rows[0].expires_at) < new Date())) {
      res.status(403).json({ success: false, message: 'Invalid, expired, or revoked proof session' });
      await client.query('ROLLBACK');
      return;
    }

    const shareLink = linkRes.rows[0];

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

    res.status(201).json({
      success: true,
      message: 'Change request submitted successfully to the creative team.',
      approval: approvalRes.rows[0]
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[Public Proof API] Request Changes Error:', err);
    res.status(500).json({ success: false, message: 'Failed to record change request', error: err.message });
  } finally {
    client.release();
  }
});

export default router;
