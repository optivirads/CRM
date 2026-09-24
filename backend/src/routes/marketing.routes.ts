import { Router, Response } from 'express';
import { db } from '../config/db';
import { requireAuth, recordAuditLog } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { decryptConfigObject } from '../utils/encrypt';
import { isGlobalLeadership, userHasClientAccess } from '../utils/accessControl';

const router = Router();

/**
 * Robust extractor for Meta insights telemetry.
 * Correctly accounts for lead forms, contact events, and messaging conversation leads (WhatsApp/Messenger).
 */
export function extractMetricsFromMetaInsights(ins: any) {
  const spend = Number(ins.spend || 0);
  const imp = Number(ins.impressions || 0);
  const reach = Number(ins.reach || 0);
  const clicks = Number(ins.clicks || 0);
  const actions = ins.actions || [];
  const actionValues = ins.action_values || [];

  // Robust lead detection: standard forms, contacts, and messaging conversation starts
  const leadAction = actions.find((a: any) => 
    a.action_type === 'lead' || 
    a.action_type === 'onsite_conversion.lead_grouped' ||
    a.action_type === 'offsite_conversion.fb_pixel_lead' ||
    a.action_type === 'contact' ||
    a.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
    a.action_type === 'messaging_conversation_started_7d' ||
    a.action_type === 'onsite_conversion.total_messaging_connection' ||
    a.action_type === 'onsite_conversion.messaging_first_reply'
  );

  const fallbackLeadAction = !leadAction ? actions.find((a: any) => 
    (typeof a.action_type === 'string') && (
      a.action_type.includes('messaging_conversation_started') || 
      a.action_type.includes('lead')
    )
  ) : null;

  const leads = Number((leadAction || fallbackLeadAction)?.value || 0);

  const convAction = actions.find((a: any) => 
    a.action_type === 'purchase' || 
    a.action_type === 'omni_purchase' ||
    a.action_type === 'onsite_conversion.purchase'
  );
  const conversions = Number(convAction?.value || 0);

  const revAction = actionValues.find((a: any) => 
    a.action_type === 'purchase' || 
    a.action_type === 'omni_purchase' ||
    a.action_type === 'onsite_conversion.purchase'
  );
  const revenue = Number(revAction?.value || (ins.purchase_roas?.[0]?.value ? spend * Number(ins.purchase_roas[0].value) : 0));
  const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;

  return { spend, imp, reach, clicks, leads, conversions, revenue, roas };
}

/**
 * Internal helper to automatically synchronize live telemetry for connected Meta campaigns.
 * Replaces older cumulative snapshots with the single accurate lifetime snapshot to prevent SUM() overcounting.
 * Also auto-discovers newly added campaigns from Meta for connected ad accounts.
 */
export async function syncCampaignTelemetryInternal(options: {
  orgId: string;
  clientId?: string;
  campaignId?: string;
  force?: boolean;
}): Promise<number> {
  const { orgId, clientId, campaignId, force = false } = options;

  try {
    const saved = await db.query(
      'SELECT config FROM organization_integrations WHERE organization_id = $1 AND id = $2;',
      [orgId, 'int-meta']
    );
    if (saved.rows.length === 0 || !saved.rows[0].config) {
      return 0;
    }

    const decrypted = decryptConfigObject(saved.rows[0].config);
    const metaToken: string | null = decrypted.accessToken || null;
    const configAdAccounts: any[] = Array.isArray(decrypted.adAccounts) ? decrypted.adAccounts : [];

    if (!metaToken) {
      return 0;
    }

    // 1. Auto-discover any newly created campaigns in Meta for connected clients
    try {
      const connectedAccounts = await db.query(`
        SELECT DISTINCT c.client_id, c.ad_account_id
        FROM campaigns c
        WHERE c.organization_id = $1 AND c.ad_account_id IS NOT NULL AND c.platform = 'Meta' AND c.deleted_at IS NULL
        ${clientId ? 'AND c.client_id = $2' : ''}
      `, clientId ? [orgId, clientId] : [orgId]);

      for (const row of connectedAccounts.rows) {
        const cleanAdAccountId = row.ad_account_id.startsWith('act_') ? row.ad_account_id : `act_${row.ad_account_id}`;
        const tokenToUse = (configAdAccounts.find(a => a.id === cleanAdAccountId || a.id === row.ad_account_id)?.access_token) || metaToken;

        const campUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(cleanAdAccountId)}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(maximum){spend,impressions,reach,clicks,actions,action_values,cpc,cpm,ctr,purchase_roas}&limit=100&access_token=${encodeURIComponent(tokenToUse.trim())}`;
        const metaRes = await fetch(campUrl);
        if (metaRes.ok) {
          const metaData: any = await metaRes.json();
          if (Array.isArray(metaData.data)) {
            for (const c of metaData.data) {
              // Check if external_id already exists in CRM (including deleted campaigns so we don't re-import deleted ones)
              const existingCheck = await db.query('SELECT id FROM campaigns WHERE external_id = $1 LIMIT 1;', [String(c.id)]);
              if (existingCheck.rows.length === 0) {
                const ins = c.insights?.data?.[0] || {};
                const { spend, imp, reach, clicks, leads, conversions, revenue } = extractMetricsFromMetaInsights(ins);
                const budget = Number(c.daily_budget ? Number(c.daily_budget) * 30 / 100 : (c.lifetime_budget ? Number(c.lifetime_budget) / 100 : spend * 1.5 || 50000));

                const newCampRes = await db.query(`
                  INSERT INTO campaigns (
                    organization_id, client_id, name, platform, budget, status, objective, notes, external_id, ad_account_id
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                  RETURNING id;
                `, [
                  orgId, row.client_id, c.name || `Meta Campaign ${c.id}`,
                  'Meta', budget, c.status === 'ACTIVE' ? 'Active' : 'Paused',
                  c.objective || 'Lead Gen & Sales', `Auto-connected from Meta Ad Account ${cleanAdAccountId}`, c.id, cleanAdAccountId
                ]);
                const newCampId = newCampRes.rows[0]?.id;
                if (newCampId) {
                  const today = new Date().toISOString().split('T')[0];
                  await db.query(`
                    INSERT INTO campaign_metrics (
                      campaign_id, date, spend, impressions, reach, clicks, leads, conversions, revenue, notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
                  `, [newCampId, today, spend, imp, reach, clicks, leads, conversions, revenue, `Auto-discovered from Meta Ad Account ${cleanAdAccountId}`]);
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Auto-Discovery] Warning:', e);
    }

    // 2. Query campaigns that need sync
    let campQuery = `
      SELECT c.*, comp.name as client_name
      FROM campaigns c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies comp ON cl.company_id = comp.id
      WHERE c.organization_id = $1 
        AND c.deleted_at IS NULL 
        AND c.platform = 'Meta'
        AND c.external_id IS NOT NULL
    `;
    const campParams: any[] = [orgId];

    if (campaignId) {
      campParams.push(campaignId);
      campQuery += ` AND c.id = $${campParams.length}`;
    } else if (clientId) {
      campParams.push(clientId);
      campParams.push(`%${clientId}%`);
      campQuery += ` AND (c.client_id::text = $${campParams.length - 1} OR cl.company_id::text = $${campParams.length - 1} OR comp.name ILIKE $${campParams.length})`;
    }

    // Unless forced, only sync if metrics are missing or updated > 10 minutes ago
    if (!force && !campaignId) {
      campQuery += ` AND (
        NOT EXISTS (SELECT 1 FROM campaign_metrics cm WHERE cm.campaign_id = c.id)
        OR c.updated_at < NOW() - INTERVAL '10 minutes'
      )`;
    }

    const campsRes = await db.query(campQuery, campParams);
    const campaignsToSync = campsRes.rows;

    let updatedCount = 0;

    for (const c of campaignsToSync) {
      const tokenToUse = (c.ad_account_id && configAdAccounts.find(a => a.id === c.ad_account_id)?.access_token) || metaToken;

      try {
        const campUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(c.external_id)}?fields=id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(maximum){spend,impressions,reach,clicks,actions,action_values,cpc,cpm,ctr,purchase_roas}&access_token=${encodeURIComponent(tokenToUse.trim())}`;
        const res = await fetch(campUrl);
        if (res.ok) {
          const data: any = await res.json();
          const ins = data.insights?.data?.[0] || {};
          const { spend, imp, reach, clicks, leads, conversions, revenue } = extractMetricsFromMetaInsights(ins);

          const budget = Number(data.daily_budget ? Number(data.daily_budget) * 30 / 100 : (data.lifetime_budget ? Number(data.lifetime_budget) / 100 : spend * 1.5 || c.budget || 50000));

          await db.query(`
            UPDATE campaigns SET
              name = $1,
              status = $2,
              budget = $3,
              updated_at = NOW()
            WHERE id = $4;
          `, [data.name || c.name, data.status === 'ACTIVE' ? 'Active' : 'Paused', budget, c.id]);

          // Clear prior snapshot rows for this campaign to prevent double-counting cumulative lifetime metrics
          await db.query('DELETE FROM campaign_metrics WHERE campaign_id = $1;', [c.id]);

          const today = new Date().toISOString().split('T')[0];
          await db.query(`
            INSERT INTO campaign_metrics (
              campaign_id, date, spend, impressions, reach, clicks, leads, conversions, revenue, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
          `, [c.id, today, spend, imp, reach, clicks, leads, conversions, revenue, 'Live Synced via Meta Marketing API']);

          updatedCount++;
        }
      } catch (e) {
        console.warn(`Failed to auto-sync telemetry for campaign ${c.id}:`, e);
      }
    }

    return updatedCount;
  } catch (err) {
    console.error('Error in syncCampaignTelemetryInternal:', err);
    return 0;
  }
}

// 1. Campaigns List with performance summary
router.get('/campaigns', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { clientId, platform, status } = req.query;

  try {
    // Trigger telemetry refresh in the background if stale without blocking the HTTP response
    syncCampaignTelemetryInternal({
      orgId,
      clientId: clientId as string,
      force: false
    }).catch((err) => console.warn('[Background Telemetry Auto-Fetch] Non-fatal error:', err));

    let query = `
      SELECT 
        c.*,
        comp.name as client_name,
        COALESCE(SUM(cm.spend), 0) as total_spend,
        COALESCE(SUM(cm.impressions), 0) as total_impressions,
        COALESCE(SUM(cm.clicks), 0) as total_clicks,
        COALESCE(SUM(cm.leads), 0) as total_leads,
        COALESCE(SUM(cm.conversions), 0) as total_conversions,
        COALESCE(SUM(cm.revenue), 0) as total_revenue,
        ROUND(AVG(cm.roas), 2) as avg_roas
      FROM campaigns c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies comp ON cl.company_id = comp.id
      LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
      WHERE c.organization_id = $1 AND c.deleted_at IS NULL
    `;
    const params: any[] = [orgId];

    if (req.user?.clientId) {
      params.push(req.user.clientId);
      query += ` AND c.client_id = $${params.length}`;
    } else if (clientId) {
      params.push(clientId);
      params.push(`%${clientId}%`);
      query += ` AND (c.client_id::text = $${params.length - 1} OR cl.company_id::text = $${params.length - 1} OR comp.name ILIKE $${params.length})`;
    }
    if (platform) {
      params.push(platform);
      query += ` AND c.platform = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }

    query += ` GROUP BY c.id, comp.name ORDER BY c.created_at DESC;`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Marketing Analytics Overview (Platform attribution & Daily trend)
router.get('/analytics', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { clientId } = req.query;

  try {
    let whereClause = `WHERE c.organization_id = $1 AND c.deleted_at IS NULL`;
    const params: any[] = [orgId];

    if (req.user?.clientId) {
      params.push(req.user.clientId);
      whereClause += ` AND c.client_id = $${params.length}`;
    } else if (clientId) {
      params.push(clientId);
      params.push(`%${clientId}%`);
      whereClause += ` AND (c.client_id::text = $${params.length - 1} OR cl.company_id::text = $${params.length - 1} OR comp.name ILIKE $${params.length})`;
    }

    // Platform Breakdown
    const platformRes = await db.query(`
      SELECT 
        c.platform,
        COUNT(DISTINCT c.id) as campaign_count,
        COALESCE(SUM(cm.spend), 0) as spend,
        COALESCE(SUM(cm.leads), 0) as leads,
        COALESCE(SUM(cm.conversions), 0) as conversions,
        COALESCE(SUM(cm.revenue), 0) as revenue,
        ROUND(AVG(cm.roas), 2) as roas
      FROM campaigns c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies comp ON cl.company_id = comp.id
      LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
      ${whereClause}
      GROUP BY c.platform;
    `, params);

    // Paid vs Organic Spend Comparison
    const paidSpendRes = await db.query(`
      SELECT COALESCE(SUM(cm.spend), 0) as paid_spend
      FROM campaign_metrics cm
      JOIN campaigns c ON cm.campaign_id = c.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies comp ON cl.company_id = comp.id
      ${whereClause};
    `, params);

    let orgWhere = `WHERE cl.organization_id = $1`;
    const orgParams: any[] = [orgId];
    if (req.user?.clientId) {
      orgParams.push(req.user.clientId);
      orgWhere += ` AND cl.id = $${orgParams.length}`;
    } else if (clientId) {
      orgParams.push(clientId);
      orgParams.push(`%${clientId}%`);
      orgWhere += ` AND (cl.id::text = $${orgParams.length - 1} OR cl.company_id::text = $${orgParams.length - 1} OR comp.name ILIKE $${orgParams.length})`;
    }

    const organicSpendRes = await db.query(`
      SELECT COALESCE(SUM(op.organic_spend), 0) as organic_spend
      FROM organic_performance op
      JOIN clients cl ON op.client_id = cl.id
      LEFT JOIN companies comp ON cl.company_id = comp.id
      ${orgWhere};
    `, orgParams);

    res.json({
      success: true,
      data: {
        platformPerformance: platformRes.rows,
        spendComparison: {
          paidSpend: Number(paidSpendRes.rows[0]?.paid_spend || 0),
          organicSpend: Number(organicSpendRes.rows[0]?.organic_spend || 0)
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Create Campaign
router.post('/campaigns', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const { name, platform, client_id, budget, status, objective, start_date, end_date, external_id, ad_account_id } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ success: false, message: 'Campaign name is required' });
    return;
  }

  try {
    let resolvedClientId = client_id;
    if (!resolvedClientId) {
      const fallbackClient = await db.query('SELECT id FROM clients WHERE organization_id = $1 AND deleted_at IS NULL LIMIT 1;', [orgId]);
      resolvedClientId = fallbackClient.rows[0]?.id;
    }

    if (!resolvedClientId) {
      const comp = await db.query(`
        INSERT INTO companies (organization_id, name, created_by)
        VALUES ($1, 'Default Agency Client', $2) RETURNING id;
      `, [orgId, userId]);
      const newCl = await db.query(`
        INSERT INTO clients (organization_id, company_id, created_by)
        VALUES ($1, $2, $3) RETURNING id;
      `, [orgId, comp.rows[0].id, userId]);
      resolvedClientId = newCl.rows[0].id;
    }

    const validPlatforms = ['Meta', 'Google Ads', 'LinkedIn', 'TikTok', 'YouTube', 'SEO / Organic', 'Email Marketing', 'Influencer', 'Other'];
    const resolvedPlatform = validPlatforms.includes(platform) ? platform : 'Meta';

    const result = await db.query(`
      INSERT INTO campaigns (
        organization_id, client_id, name, platform, budget, status, objective, start_date, end_date, external_id, ad_account_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `, [
      orgId, resolvedClientId, name.trim(), resolvedPlatform,
      Number(budget || 0), status || 'Active', objective || 'Lead Gen',
      start_date || new Date(), end_date || null,
      external_id || null, ad_account_id || null, userId
    ]);

    // Automatically fetch live telemetry if external_id is present
    if (external_id) {
      await syncCampaignTelemetryInternal({
        orgId,
        campaignId: result.rows[0].id,
        force: true
      });
    }

    await recordAuditLog(orgId, userId, 'CREATE', 'campaigns', result.rows[0].id, null, result.rows[0], req);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3b. Quick Log Ad Spend & KPI Metrics assigned to a Client
router.post('/campaigns/quick-log', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const {
    client_id,
    campaign_id,
    campaign_name,
    platform = 'Meta',
    date = new Date().toISOString().split('T')[0],
    spend = 0,
    impressions = 0,
    reach = 0,
    clicks = 0,
    leads = 0,
    conversions = 0,
    revenue = 0,
    notes
  } = req.body;

  if (!client_id) {
    res.status(400).json({ success: false, message: 'client_id is required' });
    return;
  }

  try {
    let resolvedCampaignId = campaign_id;

    if (!resolvedCampaignId) {
      // Find existing campaign for client and platform or create a new one
      const nameToSearch = campaign_name?.trim() || `${platform} Performance Retainer`;
      const existing = await db.query(`
        SELECT id FROM campaigns 
        WHERE client_id = $1 AND organization_id = $2 AND (name ILIKE $3 OR platform = $4) AND deleted_at IS NULL
        ORDER BY created_at DESC LIMIT 1;
      `, [client_id, orgId, `%${nameToSearch}%`, platform]);

      if (existing.rows.length > 0) {
        resolvedCampaignId = existing.rows[0].id;
      } else {
        const newCamp = await db.query(`
          INSERT INTO campaigns (
            organization_id, client_id, name, platform, budget, status, objective, created_by
          ) VALUES ($1, $2, $3, $4, $5, 'Active', 'Sales / ROAS', $6)
          RETURNING id;
        `, [orgId, client_id, nameToSearch, platform, Number(spend) * 10, userId]);
        resolvedCampaignId = newCamp.rows[0].id;
      }
    }

    // Insert or update daily metrics
    const metricRes = await db.query(`
      INSERT INTO campaign_metrics (
        campaign_id, date, spend, impressions, reach, clicks, leads, conversions, revenue, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (campaign_id, date) 
      DO UPDATE SET
        spend = campaign_metrics.spend + EXCLUDED.spend,
        impressions = campaign_metrics.impressions + EXCLUDED.impressions,
        reach = campaign_metrics.reach + EXCLUDED.reach,
        clicks = campaign_metrics.clicks + EXCLUDED.clicks,
        leads = campaign_metrics.leads + EXCLUDED.leads,
        conversions = campaign_metrics.conversions + EXCLUDED.conversions,
        revenue = campaign_metrics.revenue + EXCLUDED.revenue,
        notes = COALESCE(EXCLUDED.notes, campaign_metrics.notes)
      RETURNING *;
    `, [
      resolvedCampaignId, date, Number(spend) || 0, Number(impressions) || 0,
      Number(reach) || 0, Number(clicks) || 0, Number(leads) || 0,
      Number(conversions) || 0, Number(revenue) || 0, notes || null
    ]);

    await recordAuditLog(orgId, userId, 'LOG_METRICS', 'campaign_metrics', metricRes.rows[0].id, null, metricRes.rows[0], req);

    res.status(201).json({
      success: true,
      message: `Successfully logged ad spend of ₹${spend} for ${platform}`,
      data: metricRes.rows[0]
    });
  } catch (err: any) {
    console.error('Failed to log campaign metrics:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Update Campaign
router.patch('/campaigns/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const campaignId = req.params.id;
  const { name, budget, status, objective } = req.body;

  try {
    const current = await db.query('SELECT * FROM campaigns WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;', [campaignId, orgId]);
    if (current.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    const isGlobal = isGlobalLeadership(req.user?.role, req.user?.isOwner);
    if (!isGlobal) {
      const camp = current.rows[0];
      const hasClientAcc = await userHasClientAccess(userId, orgId, camp.client_id, req.user?.role, req.user?.isOwner);
      const isCreator = camp.created_by === userId;
      if (!hasClientAcc && !isCreator) {
        res.status(404).json({ success: false, message: 'Campaign not found' });
        return;
      }
    }

    const updated = await db.query(`
      UPDATE campaigns
      SET 
        name = COALESCE($1, name),
        budget = COALESCE($2, budget),
        status = COALESCE($3, status),
        objective = COALESCE($4, objective),
        updated_by = $5
      WHERE id = $6 AND organization_id = $7
      RETURNING *;
    `, [name, budget, status, objective, userId, campaignId, orgId]);

    await recordAuditLog(orgId, userId, 'UPDATE', 'campaigns', campaignId, current.rows[0], updated.rows[0], req);
    res.json({ success: true, data: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Delete Campaign (Soft Delete)
router.delete('/campaigns/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const campaignId = req.params.id;

  try {
    const isGlobal = isGlobalLeadership(req.user?.role, req.user?.isOwner);
    const existing = await db.query('SELECT client_id, created_by FROM campaigns WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL;', [campaignId, orgId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Campaign not found or already deleted' });
      return;
    }

    if (!isGlobal) {
      const camp = existing.rows[0];
      const hasClientAcc = await userHasClientAccess(userId, orgId, camp.client_id, req.user?.role, req.user?.isOwner);
      const isCreator = camp.created_by === userId;
      if (!hasClientAcc && !isCreator) {
        res.status(404).json({ success: false, message: 'Campaign not found or already deleted' });
        return;
      }
    }

    const result = await db.query(`
      UPDATE campaigns
      SET deleted_at = NOW(), updated_by = $1
      WHERE id = $2 AND organization_id = $3 AND deleted_at IS NULL
      RETURNING id;
    `, [userId, campaignId, orgId]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Campaign not found or already deleted' });
      return;
    }

    await recordAuditLog(orgId, userId, 'DELETE', 'campaigns', campaignId, null, null, req);
    res.json({ success: true, message: 'Campaign successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Discover Available Ad Accounts from Integrations
router.get('/ad-accounts/discover', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { platform = 'Meta' } = req.query;

  try {
    let adAccounts: any[] = [];

    if (platform === 'Meta' || String(platform).includes('Meta')) {
      const saved = await db.query(
        'SELECT config, metadata FROM organization_integrations WHERE organization_id = $1 AND id = $2;',
        [orgId, 'int-meta']
      );

      if (saved.rows.length > 0) {
        let meta = saved.rows[0].metadata || {};
        if (typeof meta === 'string') {
          try { meta = JSON.parse(meta); } catch {}
        }
        const existingAccounts: any[] = Array.isArray(meta.adAccounts) ? meta.adAccounts : [];

        let config = saved.rows[0].config || {};
        if (typeof config === 'string') {
          try { config = JSON.parse(config); } catch {}
        }
        const { decryptConfigObject } = require('../utils/encrypt');
        const decrypted = decryptConfigObject(config);
        const token = decrypted.accessToken;

        // 1. Fetch live accounts under global BM token if valid
        if (token && token !== '[DECRYPTION_FAILED]') {
          try {
            const statusMap: Record<number, string> = { 1: 'ACTIVE', 2: 'DISABLED', 3: 'UNSETTLED', 7: 'PENDING_RISK_REVIEW' };
            const actsUrl = `https://graph.facebook.com/v20.0/me/adaccounts?fields=id,name,account_status,currency,timezone_name,amount_spent,balance,spend_cap,business_name&access_token=${encodeURIComponent(token.trim())}`;
            const actsRes = await fetch(actsUrl);
            const actsData: any = await actsRes.json().catch(() => ({}));

            if (actsRes.ok && Array.isArray(actsData.data) && actsData.data.length > 0) {
              for (const a of actsData.data) {
                adAccounts.push({
                  id: a.id,
                  name: a.name || a.id,
                  business_name: a.business_name || meta.partnerId ? `BM Partner #${meta.partnerId}` : 'Primary BM',
                  status: statusMap[a.account_status] || 'ACTIVE',
                  currency: a.currency || 'INR',
                  timezone: a.timezone_name || 'Asia/Kolkata',
                  amount_spent: a.amount_spent ? (Number(a.amount_spent) / 100).toFixed(2) : '0.00',
                  balance: a.balance ? (Number(a.balance) / 100).toFixed(2) : '0.00',
                  spend_cap: a.spend_cap ? (Number(a.spend_cap) / 100).toFixed(2) : 'No Cap'
                });
              }
            }
          } catch { /* non-fatal */ }
        }

        // 2. Fetch live info for any accounts with custom access tokens
        const configAccounts: any[] = Array.isArray(decrypted.adAccounts) ? decrypted.adAccounts : [];
        for (const ca of configAccounts) {
          if (ca.access_token && ca.access_token !== '[DECRYPTION_FAILED]' && !adAccounts.some(a => a.id === ca.id)) {
            try {
              const statusMap: Record<number, string> = { 1: 'ACTIVE', 2: 'DISABLED', 3: 'UNSETTLED', 7: 'PENDING_RISK_REVIEW' };
              const actUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(ca.id)}?fields=id,name,account_status,currency,timezone_name,amount_spent,balance,spend_cap,business_name&access_token=${encodeURIComponent(ca.access_token.trim())}`;
              const actRes = await fetch(actUrl);
              const actData: any = await actRes.json().catch(() => ({}));
              if (actRes.ok && !actData.error) {
                adAccounts.push({
                  id: actData.id || ca.id,
                  name: actData.name || ca.name || ca.id,
                  business_name: ca.business_name || actData.business_name || 'Custom BM Profile',
                  status: statusMap[actData.account_status] || ca.status || 'ACTIVE',
                  currency: actData.currency || ca.currency || 'INR',
                  timezone: actData.timezone_name || ca.timezone || 'Asia/Kolkata',
                  amount_spent: actData.amount_spent ? (Number(actData.amount_spent) / 100).toFixed(2) : '0.00',
                  balance: actData.balance ? (Number(actData.balance) / 100).toFixed(2) : '0.00',
                  spend_cap: actData.spend_cap ? (Number(actData.spend_cap) / 100).toFixed(2) : 'No Cap',
                  has_custom_token: true
                });
                continue;
              }
            } catch { /* non-fatal */ }
          }
        }

        // 3. Merge all configured existing accounts from metadata that aren't already included
        for (const ea of existingAccounts) {
          if (!adAccounts.some(a => a.id === ea.id)) {
            adAccounts.push(ea);
          }
        }
      }
    }

    res.json({ success: true, data: adAccounts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6b. Preview Campaigns inside an Ad Account (Multi-Client Ad Account Support)
router.get('/ad-accounts/preview-campaigns', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { ad_account_id, platform = 'Meta', access_token, client_id } = req.query;

  if (!ad_account_id) {
    res.status(400).json({ success: false, message: 'ad_account_id is required' });
    return;
  }

  try {
    const cleanAdAccountId = String(ad_account_id).startsWith('act_') ? String(ad_account_id) : `act_${ad_account_id}`;
    let token = typeof access_token === 'string' && access_token.trim() ? access_token.trim() : null;

    if (!token && (platform === 'Meta' || String(platform).includes('Meta'))) {
      const saved = await db.query(
        'SELECT config FROM organization_integrations WHERE organization_id = $1 AND id = $2;',
        [orgId, 'int-meta']
      );
      if (saved.rows.length > 0 && saved.rows[0].config) {
        const { decryptConfigObject } = require('../utils/encrypt');
        const decrypted = decryptConfigObject(saved.rows[0].config);

        // Check if this specific ad account has its own custom token
        if (Array.isArray(decrypted.adAccounts)) {
          const specific = decrypted.adAccounts.find((a: any) => a.id === cleanAdAccountId || a.id === String(ad_account_id));
          if (specific && specific.access_token && specific.access_token !== '[DECRYPTION_FAILED]') {
            token = specific.access_token;
          }
        }

        // Fall back to global BM access token
        if (!token) {
          token = decrypted.accessToken;
        }
      }
    }

    // Query existing campaigns across the CRM organization to prevent duplicates and multi-client assignment
    const existingCamps = await db.query(`
      SELECT c.id, c.name, c.external_id, c.client_id, comp.name as client_name
      FROM campaigns c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies comp ON cl.company_id = comp.id
      WHERE c.organization_id = $1 AND c.deleted_at IS NULL;
    `, [orgId]);

    const existingByExtId = new Map<string, any>();
    const existingByName = new Map<string, any>();
    for (const ec of existingCamps.rows) {
      if (ec.external_id) existingByExtId.set(String(ec.external_id), ec);
      if (ec.name) existingByName.set(ec.name.trim().toLowerCase(), ec);
    }

    let campaigns: any[] = [];
    const alreadyConnectedInCrm: any[] = [];

    if (token && (platform === 'Meta' || String(platform).includes('Meta'))) {
      const campUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(cleanAdAccountId)}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(maximum){spend,impressions,reach,clicks,actions,action_values,cpc,cpm,ctr,purchase_roas}&limit=100&access_token=${encodeURIComponent(token.trim())}`;
      const metaRes = await fetch(campUrl);
      const metaData: any = await metaRes.json().catch(() => ({}));

      if (metaRes.ok && Array.isArray(metaData.data)) {
        for (const c of metaData.data) {
          const matchedExisting = existingByExtId.get(String(c.id)) || existingByName.get(String(c.name || '').trim().toLowerCase());

          const ins = c.insights?.data?.[0] || {};
          const { spend, imp, reach, clicks, leads, conversions, revenue, roas } = extractMetricsFromMetaInsights(ins);
          const budget = Number(c.daily_budget ? Number(c.daily_budget) * 30 / 100 : (c.lifetime_budget ? Number(c.lifetime_budget) / 100 : spend * 1.5 || 50000));

          const parsedCampaign = {
            id: c.id,
            name: c.name || `Campaign ${c.id}`,
            status: c.status || 'ACTIVE',
            objective: c.objective || 'OUTCOME_LEADS',
            budget,
            spend,
            impressions: imp,
            reach,
            clicks,
            leads,
            conversions,
            revenue,
            roas
          };

          if (matchedExisting) {
            alreadyConnectedInCrm.push({
              ...parsedCampaign,
              connected_client_id: matchedExisting.client_id,
              connected_client_name: matchedExisting.client_name,
              is_current_client: client_id ? (matchedExisting.client_id === client_id) : false
            });
          } else {
            // Unconnected campaign - available for ingestion
            campaigns.push(parsedCampaign);
          }
        }
      }
    }

    res.json({
      success: true,
      data: campaigns,
      alreadyInCrm: alreadyConnectedInCrm,
      totalDiscovered: campaigns.length + alreadyConnectedInCrm.length
    });
  } catch (err: any) {
    console.error('Failed to preview campaigns for ad account:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Connect Ad Account to Client & Synchronize Live Campaigns & Telemetry
router.post('/campaigns/connect-ad-account', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const userId = req.user!.id;
  const {
    client_id,
    ad_account_id,
    ad_account_name,
    platform = 'Meta',
    access_token,
    selected_campaign_ids
  } = req.body;

  if (!client_id || !ad_account_id) {
    res.status(400).json({ success: false, message: 'Both client_id and ad_account_id are required' });
    return;
  }

  try {
    // 1. Resolve client UUID
    let resolvedClientId = client_id;
    const clRes = await db.query(`
      SELECT cl.id, comp.name as company_name 
      FROM clients cl 
      JOIN companies comp ON cl.company_id = comp.id
      WHERE (cl.id::text = $1 OR cl.company_id::text = $1 OR comp.name ILIKE $2) AND cl.organization_id = $3
      LIMIT 1;
    `, [client_id, `%${client_id}%`, orgId]);

    if (clRes.rows.length > 0) {
      resolvedClientId = clRes.rows[0].id;
    }

    const cleanAdAccountId = ad_account_id.startsWith('act_') ? ad_account_id : `act_${ad_account_id}`;

    // Clean up any legacy placeholder / dummy records for this client
    await db.query(`
      DELETE FROM campaigns
      WHERE client_id = $1 AND (name ILIKE '%Live Performance%' OR name ILIKE '%Performance Retainer%') AND external_id IS NULL;
    `, [resolvedClientId]);

    // 2. Fetch token from organization_integrations if not supplied in body
    let token = access_token;
    if (!token && platform.includes('Meta')) {
      const saved = await db.query(
        'SELECT config FROM organization_integrations WHERE organization_id = $1 AND id = $2;',
        [orgId, 'int-meta']
      );
      if (saved.rows.length > 0 && saved.rows[0].config) {
        const { decryptConfigObject } = require('../utils/encrypt');
        const decrypted = decryptConfigObject(saved.rows[0].config);

        // Check if this specific ad account has its own custom token
        if (Array.isArray(decrypted.adAccounts)) {
          const specific = decrypted.adAccounts.find((a: any) => a.id === cleanAdAccountId || a.id === ad_account_id);
          if (specific && specific.access_token && specific.access_token !== '[DECRYPTION_FAILED]') {
            token = specific.access_token;
          }
        }

        // Fall back to global BM token
        if (!token) {
          token = decrypted.accessToken;
        }
      }
    }

    // Check all existing campaigns in organization to prevent multi-client duplicates
    const existingCamps = await db.query(`
      SELECT c.id, c.name, c.external_id, c.client_id, comp.name as client_name
      FROM campaigns c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN companies comp ON cl.company_id = comp.id
      WHERE c.organization_id = $1 AND c.deleted_at IS NULL;
    `, [orgId]);

    const existingByExtId = new Map<string, any>();
    const existingByName = new Map<string, any>();
    for (const ec of existingCamps.rows) {
      if (ec.external_id) existingByExtId.set(String(ec.external_id), ec);
      if (ec.name) existingByName.set(ec.name.trim().toLowerCase(), ec);
    }

    const importedCampaigns: any[] = [];
    const skippedAlreadyAssigned: string[] = [];

    // 3. If we have Meta token, fetch live campaigns & insights from Meta Marketing API
    if (token && platform.includes('Meta')) {
      try {
        const campUrl = `https://graph.facebook.com/v20.0/${encodeURIComponent(cleanAdAccountId)}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(maximum){spend,impressions,reach,clicks,actions,action_values,cpc,cpm,ctr,purchase_roas}&limit=100&access_token=${encodeURIComponent(token.trim())}`;
        const metaRes = await fetch(campUrl);
        const metaData: any = await metaRes.json().catch(() => ({}));

        if (metaRes.ok && Array.isArray(metaData.data) && metaData.data.length > 0) {
          // Filter if user selected specific campaigns for this client
          const targetCampaigns = Array.isArray(selected_campaign_ids)
            ? metaData.data.filter((c: any) => selected_campaign_ids.includes(c.id))
            : metaData.data;

          for (const c of targetCampaigns) {
            const matchedExisting = existingByExtId.get(String(c.id)) || existingByName.get(String(c.name || '').trim().toLowerCase());

            // Enforce: Same ad cannot be added to multiple clients
            if (matchedExisting && matchedExisting.client_id !== resolvedClientId) {
              skippedAlreadyAssigned.push(`${c.name} (assigned to ${matchedExisting.client_name})`);
              continue;
            }

            const ins = c.insights?.data?.[0] || {};
            const { spend, imp, reach, clicks, leads, conversions, revenue } = extractMetricsFromMetaInsights(ins);
            const budget = Number(c.daily_budget ? Number(c.daily_budget) * 30 / 100 : (c.lifetime_budget ? Number(c.lifetime_budget) / 100 : spend * 1.5 || 50000));

            const adAccLabel = `Ad Account: ${cleanAdAccountId}${ad_account_name ? ` (${ad_account_name})` : ''}`;

            let campId: string;

            if (matchedExisting && matchedExisting.client_id === resolvedClientId) {
              // Update existing campaign without creating duplicate row
              await db.query(`
                UPDATE campaigns SET
                  name = $1,
                  platform = 'Meta',
                  budget = $2,
                  status = $3,
                  objective = $4,
                  external_id = $5,
                  ad_account_id = $6,
                  notes = $7,
                  updated_at = NOW()
                WHERE id = $8;
              `, [
                c.name || `Meta Campaign ${c.id}`,
                budget,
                c.status === 'ACTIVE' ? 'Active' : 'Paused',
                c.objective || 'Lead Gen & Sales',
                c.id,
                cleanAdAccountId,
                adAccLabel,
                matchedExisting.id
              ]);
              campId = matchedExisting.id;
            } else {
              // Insert new campaign - platform is 'Meta' to satisfy campaigns_platform_check
              const campRes = await db.query(`
                INSERT INTO campaigns (
                  organization_id, client_id, name, platform, budget, status, objective, notes, external_id, ad_account_id, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *;
              `, [
                orgId, resolvedClientId, c.name || `Meta Campaign ${c.id}`,
                'Meta', budget, c.status === 'ACTIVE' ? 'Active' : 'Paused',
                c.objective || 'Lead Gen & Sales', adAccLabel, c.id, cleanAdAccountId, userId
              ]);
              campId = campRes.rows[0]?.id;
            }

            if (campId) {
              // Clear prior snapshot rows for this campaign to prevent double-counting cumulative lifetime metrics
              await db.query('DELETE FROM campaign_metrics WHERE campaign_id = $1;', [campId]);

              const today = new Date().toISOString().split('T')[0];
              await db.query(`
                INSERT INTO campaign_metrics (
                  campaign_id, date, spend, impressions, reach, clicks, leads, conversions, revenue, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
              `, [campId, today, spend, imp, reach, clicks, leads, conversions, revenue, `Synced from Meta Ad Account ${cleanAdAccountId}`]);

              importedCampaigns.push({ id: campId, name: c.name, spend, leads, conversions, revenue });
            }
          }
        }
      } catch (err) {
        console.warn('Meta API sync warning:', err);
      }
    }

    await recordAuditLog(orgId, userId, 'CONNECT_AD_ACCOUNT', 'clients', resolvedClientId, null, {
      adAccountId: cleanAdAccountId,
      platform,
      count: importedCampaigns.length,
      skippedCount: skippedAlreadyAssigned.length
    }, req);

    let message = `Successfully connected Ad Account ${cleanAdAccountId}! Imported ${importedCampaigns.length} live campaign(s).`;
    if (skippedAlreadyAssigned.length > 0) {
      message += ` (Skipped ${skippedAlreadyAssigned.length} campaign(s) already assigned to other clients)`;
    }

    res.json({
      success: true,
      message,
      data: {
        clientId: resolvedClientId,
        adAccountId: cleanAdAccountId,
        importedCount: importedCampaigns.length,
        campaigns: importedCampaigns,
        skipped: skippedAlreadyAssigned
      }
    });
  } catch (err: any) {
    console.error('Failed to connect ad account to client:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Live Sync Telemetry for Connected Client Campaigns
router.post('/campaigns/sync-telemetry', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const orgId = req.user!.organizationId;
  const { client_id, campaign_id } = req.body;

  try {
    const updatedCount = await syncCampaignTelemetryInternal({
      orgId,
      clientId: client_id,
      campaignId: campaign_id,
      force: true
    });

    res.json({
      success: true,
      message: `Successfully refreshed live telemetry for ${updatedCount} campaign(s) via Meta Marketing API!`,
      updatedCount
    });
  } catch (err: any) {
    console.error('Failed to sync campaign telemetry:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
