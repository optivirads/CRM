import { Pool } from 'pg';
import dotenv from 'dotenv';
import { hashPassword } from '../utils/auth';

dotenv.config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
      }
);

async function seed() {
  console.log('🌱 Seeding OptiVir CRM Enterprise Core Foundations...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Organization
    console.log('1. Seeding Organization...');
    const orgRes = await client.query(`
      INSERT INTO organizations (name, slug, domain, currency, timezone, settings)
      VALUES (
        'OptiVir CRM',
        'optivir-crm',
        'optivirads.com',
        'INR',
        'Asia/Kolkata',
        '{"tax_rate": 18, "fiscal_year_start": "04-01"}'::jsonb
      )
      ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        domain = EXCLUDED.domain,
        currency = EXCLUDED.currency,
        timezone = EXCLUDED.timezone
      RETURNING id;
    `);
    const orgId = orgRes.rows[0].id;

    // 2. Core RBAC Roles
    console.log('2. Seeding System Roles...');
    const rolesToCreate = [
      { name: 'Super Admin', slug: 'super_admin', is_system_role: true, desc: 'Full root platform control' },
      { name: 'Organization Admin', slug: 'admin', is_system_role: true, desc: 'Workspace administrator' },
      { name: 'Chief Operating Officer (COO)', slug: 'coo', is_system_role: true, desc: 'Operational command across agency deliverables and modules' },
      { name: 'Sales Lead', slug: 'sales_lead', is_system_role: false, desc: 'Leads, contacts, pipeline velocity & commercial proposals' },
      { name: 'Marketing Lead', slug: 'marketing_lead', is_system_role: false, desc: 'Omnichannel campaigns, brand growth & conversion telemetry' },
      { name: 'Social Media Lead', slug: 'social_media_lead', is_system_role: false, desc: 'Social channels, post insights, creative deliverables & engagement' },
      { name: 'Media & Ads Lead', slug: 'media_buyer', is_system_role: false, desc: 'Ad network campaign management, ROAS optimization & ad buying' },
      { name: 'Finance & Billing Lead', slug: 'finance_lead', is_system_role: false, desc: 'Tax invoicing, balance reconciliation, payment tracking & ledger' },
      { name: 'Client Account Manager', slug: 'account_manager', is_system_role: false, desc: 'Client relations, onboarding SLAs, sprint delivery & retention' },
      { name: 'Client Stakeholder', slug: 'client_portal', is_system_role: false, desc: 'Single-client review portal: track sprint deliverables & proofs' }
    ];

    const roleMap: Record<string, string> = {};
    for (const r of rolesToCreate) {
      const res = await client.query(`
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (organization_id, slug) DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description
        RETURNING id, slug;
      `, [orgId, r.name, r.slug, r.desc, r.is_system_role]);
      roleMap[r.slug] = res.rows[0].id;
    }

    // 3. Primary Root Owner User
    console.log('3. Seeding Primary Root Owner...');
    const defaultPasswordHash = hashPassword('Optivir@2026');
    const rootEmail = 'optivirads@gmail.com';

    const uRes = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, status, role)
      VALUES ($1, $2, 'OptiVir', 'Owner', 'active', 'super_admin')
      ON CONFLICT (email) DO UPDATE SET 
        role = 'super_admin',
        status = 'active'
      RETURNING id;
    `, [rootEmail, defaultPasswordHash]);
    const rootUserId = uRes.rows[0].id;

    await client.query(`
      INSERT INTO organization_users (organization_id, user_id, role_id, designation, is_owner, status, allowed_tabs)
      VALUES ($1, $2, $3, 'Managing Director & Founder', true, 'active', ARRAY['*'])
      ON CONFLICT (organization_id, user_id) DO UPDATE SET 
        role_id = EXCLUDED.role_id,
        is_owner = true,
        allowed_tabs = ARRAY['*'],
        status = 'active';
    `, [orgId, rootUserId, roleMap['super_admin']]);

    // 4. Lead Sources
    console.log('4. Seeding Lead Sources...');
    const leadSources = [
      { name: 'Google Search Ads', channel: 'Google Ads', cost: 1200 },
      { name: 'Meta Ads (Instagram / FB)', channel: 'Meta', cost: 650 },
      { name: 'LinkedIn Outreach', channel: 'LinkedIn', cost: 2500 },
      { name: 'Agency Website Organic', channel: 'Organic Search', cost: 0 },
      { name: 'CEO Referral Network', channel: 'Referral', cost: 0 },
      { name: 'Inbound Inquiries', channel: 'Website', cost: 300 }
    ];

    for (const ls of leadSources) {
      await client.query(`
        INSERT INTO lead_sources (organization_id, name, channel, cost_per_lead)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING;
      `, [orgId, ls.name, ls.channel, ls.cost]);
    }

    // 5. Services Catalog
    console.log('5. Seeding Services Catalog...');
    const servicesList = [
      { name: 'Enterprise Performance Marketing Retainer', category: 'Performance Marketing', pricing_model: 'monthly_retainer', price: 150000, desc: 'Full Meta, Google Ads & LinkedIn media buying + ad creative pipeline' },
      { name: 'Search Engine Optimization & Content Engine', category: 'SEO', pricing_model: 'monthly_retainer', price: 95000, desc: 'Technical SEO, monthly programmatic backlinks, and 12 high-intent articles' },
      { name: 'Full-Stack Web App Development', category: 'Web Dev', pricing_model: 'fixed', price: 350000, desc: 'Next.js & Supabase custom enterprise web application' },
      { name: 'Brand Identity & Creative Suite', category: 'Creative Design', pricing_model: 'fixed', price: 80000, desc: 'Brand guidelines, design system, pitch decks & ad templates' },
      { name: 'Conversion Rate Optimization (CRO)', category: 'Performance Marketing', pricing_model: 'monthly_retainer', price: 60000, desc: 'Landing page A/B testing, heatmap analysis, and friction reduction' }
    ];

    for (const s of servicesList) {
      await client.query(`
        INSERT INTO services (organization_id, name, category, pricing_model, base_price, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING;
      `, [orgId, s.name, s.category, s.pricing_model, s.price, s.desc]);
    }

    // 6. Pipelines & Stages
    console.log('6. Seeding Sales Pipeline & Stages...');
    const pipeRes = await client.query(`
      INSERT INTO pipelines (organization_id, name, is_default)
      VALUES ($1, 'Agency Core Pipeline', true)
      ON CONFLICT DO NOTHING
      RETURNING id;
    `, [orgId]);
    
    let pipelineId: string;
    if (pipeRes.rows.length > 0) {
      pipelineId = pipeRes.rows[0].id;
    } else {
      const existingPipe = await client.query('SELECT id FROM pipelines WHERE organization_id = $1 LIMIT 1;', [orgId]);
      pipelineId = existingPipe.rows[0]?.id;
    }

    if (pipelineId) {
      const stages = [
        { name: 'New Lead', order_index: 1, prob: 10, color: '#3b82f6', is_won: false, is_lost: false },
        { name: 'Discovery Call', order_index: 2, prob: 25, color: '#8b5cf6', is_won: false, is_lost: false },
        { name: 'Proposal Sent', order_index: 3, prob: 50, color: '#f59e0b', is_won: false, is_lost: false },
        { name: 'Negotiation', order_index: 4, prob: 75, color: '#ec4899', is_won: false, is_lost: false },
        { name: 'Closed Won', order_index: 5, prob: 100, color: '#10b981', is_won: true, is_lost: false },
        { name: 'Closed Lost', order_index: 6, prob: 0, color: '#ef4444', is_won: false, is_lost: true }
      ];

      for (const st of stages) {
        await client.query(`
          INSERT INTO pipeline_stages (pipeline_id, name, order_index, probability, color, is_won, is_lost)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT DO NOTHING;
        `, [pipelineId, st.name, st.order_index, st.prob, st.color, st.is_won, st.is_lost]);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Core foundations seeded successfully with zero mock data!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to seed core foundations:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
