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
  console.log('🌱 Seeding OptiVir CRM Enterprise Data...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Organization
    console.log('1. Seeding Organization...');
    const orgRes = await client.query(`
      INSERT INTO organizations (name, slug, domain, currency, timezone, settings)
      VALUES (
        'OptiVir Digital Agency',
        'optivir-digital',
        'optivir.com',
        'INR',
        'Asia/Kolkata',
        '{"tax_rate": 18, "fiscal_year_start": "04-01"}'::jsonb
      )
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const orgId = orgRes.rows[0].id;

    // 2. Roles
    console.log('2. Seeding Roles...');
    const rolesToCreate = [
      { name: 'Super Admin', slug: 'super_admin', is_system_role: true, desc: 'Full system control' },
      { name: 'Organization Admin', slug: 'admin', is_system_role: true, desc: 'Controls company workspace' },
      { name: 'Management', slug: 'management', is_system_role: true, desc: 'Access to dashboards, sales, clients, finance' },
      { name: 'Sales Team', slug: 'sales', is_system_role: false, desc: 'Leads, contacts, pipeline, proposals' },
      { name: 'Account Manager', slug: 'account_manager', is_system_role: false, desc: 'Client relations, projects, reporting' },
      { name: 'Performance Marketing', slug: 'marketing', is_system_role: false, desc: 'Campaigns, ad spend, performance metrics' },
      { name: 'Finance', slug: 'finance', is_system_role: false, desc: 'Invoices, payments, expenses' },
      { name: 'Operations', slug: 'operations', is_system_role: false, desc: 'Projects, tasks, team workload' }
    ];

    const roleMap: Record<string, string> = {};
    for (const r of rolesToCreate) {
      const res = await client.query(`
        INSERT INTO roles (organization_id, name, slug, description, is_system_role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `, [orgId, r.name, r.slug, r.desc, r.is_system_role]);
      roleMap[r.slug] = res.rows[0].id;
    }

    // 3. System Users
    console.log('3. Seeding Users & Memberships...');
    const defaultPasswordHash = hashPassword('Admin@123456');

    const usersToSeed = [
      { email: 'admin@optivir.com', first_name: 'Abhinav', last_name: 'Admin', role: 'admin', designation: 'Managing Director & Founder', is_owner: true },
      { email: 'sales@optivir.com', first_name: 'Priya', last_name: 'Sharma', role: 'sales', designation: 'Head of Sales', is_owner: false },
      { email: 'accounts@optivir.com', first_name: 'Rahul', last_name: 'Verma', role: 'account_manager', designation: 'Senior Client Partner', is_owner: false },
      { email: 'marketing@optivir.com', first_name: 'Ananya', last_name: 'Iyer', role: 'marketing', designation: 'Growth & Performance Lead', is_owner: false },
      { email: 'finance@optivir.com', first_name: 'Karan', last_name: 'Mehta', role: 'finance', designation: 'Finance Controller', is_owner: false }
    ];

    const userMap: Record<string, string> = {};
    for (const u of usersToSeed) {
      const uRes = await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, status)
        VALUES ($1, $2, $3, $4, 'active')
        ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
        RETURNING id;
      `, [u.email, defaultPasswordHash, u.first_name, u.last_name]);
      const userId = uRes.rows[0].id;
      userMap[u.email] = userId;

      await client.query(`
        INSERT INTO organization_users (organization_id, user_id, role_id, designation, is_owner, status)
        VALUES ($1, $2, $3, $4, $5, 'active')
        ON CONFLICT (organization_id, user_id) DO UPDATE SET role_id = EXCLUDED.role_id;
      `, [orgId, userId, roleMap[u.role], u.designation, u.is_owner]);
    }

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

    const sourceMap: Record<string, string> = {};
    for (const ls of leadSources) {
      const res = await client.query(`
        INSERT INTO lead_sources (organization_id, name, channel, cost_per_lead)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name;
      `, [orgId, ls.name, ls.channel, ls.cost]);
      sourceMap[ls.name] = res.rows[0].id;
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

    const serviceMap: Record<string, string> = {};
    for (const s of servicesList) {
      const res = await client.query(`
        INSERT INTO services (organization_id, name, category, pricing_model, base_price, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name;
      `, [orgId, s.name, s.category, s.pricing_model, s.price, s.desc]);
      serviceMap[s.name] = res.rows[0].id;
    }

    // 6. Pipelines & Stages
    console.log('6. Seeding Sales Pipeline & Stages...');
    const pipeRes = await client.query(`
      INSERT INTO pipelines (organization_id, name, is_default)
      VALUES ($1, 'Agency Core Pipeline', true)
      RETURNING id;
    `, [orgId]);
    const pipelineId = pipeRes.rows[0].id;

    const stages = [
      { name: 'New Lead', order_index: 1, prob: 10, color: '#3b82f6', is_won: false, is_lost: false },
      { name: 'Discovery Call', order_index: 2, prob: 25, color: '#8b5cf6', is_won: false, is_lost: false },
      { name: 'Proposal Sent', order_index: 3, prob: 50, color: '#f59e0b', is_won: false, is_lost: false },
      { name: 'Negotiation', order_index: 4, prob: 75, color: '#ec4899', is_won: false, is_lost: false },
      { name: 'Closed Won', order_index: 5, prob: 100, color: '#10b981', is_won: true, is_lost: false },
      { name: 'Closed Lost', order_index: 6, prob: 0, color: '#ef4444', is_won: false, is_lost: true }
    ];

    const stageMap: Record<string, string> = {};
    for (const st of stages) {
      const res = await client.query(`
        INSERT INTO pipeline_stages (pipeline_id, name, order_index, probability, color, is_won, is_lost)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name;
      `, [pipelineId, st.name, st.order_index, st.prob, st.color, st.is_won, st.is_lost]);
      stageMap[st.name] = res.rows[0].id;
    }

    // 7. Companies
    console.log('7. Seeding Companies...');
    const companies = [
      { name: 'Apex HealthTech Solutions', industry: 'HealthTech', website: 'https://apexhealth.io', email: 'contact@apexhealth.io', city: 'Bengaluru', size: '51-200' },
      { name: 'UrbanFit Luxury Apparel', industry: 'E-Commerce / D2C', website: 'https://urbanfit.store', email: 'growth@urbanfit.store', city: 'Mumbai', size: '11-50' },
      { name: 'Zenith FinServe Capital', industry: 'FinTech / BFSI', website: 'https://zenithfin.com', email: 'marketing@zenithfin.com', city: 'Mumbai', size: '201-500' },
      { name: 'CloudScale Logistics', industry: 'SaaS / Supply Chain', website: 'https://cloudscale.ai', email: 'info@cloudscale.ai', city: 'Hyderabad', size: '51-200' },
      { name: 'Velocita EV Mobility', industry: 'CleanTech / Automotive', website: 'https://velocita-ev.com', email: 'hello@velocita-ev.com', city: 'Pune', size: '11-50' }
    ];

    const companyMap: Record<string, string> = {};
    for (const c of companies) {
      const res = await client.query(`
        INSERT INTO companies (organization_id, name, industry, website, email, city, company_size, owner_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name;
      `, [orgId, c.name, c.industry, c.website, c.email, c.city, c.size, userMap['sales@optivir.com']]);
      companyMap[c.name] = res.rows[0].id;
    }

    // 8. Contacts
    console.log('8. Seeding Contacts...');
    const contacts = [
      { comp: 'Apex HealthTech Solutions', first: 'Dr. Vikram', last: 'Malhotra', role: 'Chief Executive Officer', email: 'vikram@apexhealth.io', phone: '+91 98201 11223', decision_maker: true },
      { comp: 'UrbanFit Luxury Apparel', first: 'Simran', last: 'Kapur', role: 'Head of Growth Marketing', email: 'simran@urbanfit.store', phone: '+91 98112 33445', decision_maker: true },
      { comp: 'Zenith FinServe Capital', first: 'Amitabh', last: 'Sengupta', role: 'Chief Marketing Officer', email: 'amitabh@zenithfin.com', phone: '+91 99304 55667', decision_maker: true },
      { comp: 'CloudScale Logistics', first: 'Kavita', last: 'Nair', role: 'VP of Product & Marketing', email: 'kavita@cloudscale.ai', phone: '+91 97405 66778', decision_maker: true },
      { comp: 'Velocita EV Mobility', first: 'Rohan', last: 'Deshmukh', role: 'Co-Founder & COO', email: 'rohan@velocita-ev.com', phone: '+91 98220 77889', decision_maker: true }
    ];

    const contactMap: Record<string, string> = {};
    for (const ct of contacts) {
      const res = await client.query(`
        INSERT INTO contacts (organization_id, company_id, first_name, last_name, designation, email, phone, role, is_decision_maker)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, email;
      `, [orgId, companyMap[ct.comp], ct.first, ct.last, ct.role, ct.email, ct.phone, ct.role, ct.decision_maker]);
      contactMap[ct.email] = res.rows[0].id;
    }

    // 9. Leads
    console.log('9. Seeding Leads...');
    const leads = [
      { first: 'Siddharth', last: 'Roy', company: 'NovaSphere AI', email: 'siddharth@novasphere.tech', phone: '+91 98450 11992', val: 240000, status: 'Qualified', priority: 'High', source: 'Google Search Ads' },
      { first: 'Natasha', last: 'Chopra', company: 'Gourmet Greens Organic', email: 'natasha@gourmetgreens.in', phone: '+91 98102 44332', val: 120000, status: 'Discovery', priority: 'Medium', source: 'Meta Ads (Instagram / FB)' },
      { first: 'Aditya', last: 'Bansal', company: 'NextWave EdTech', email: 'aditya@nextwave.education', phone: '+91 99201 88776', val: 450000, status: 'Proposal', priority: 'Urgent', source: 'LinkedIn Outreach' },
      { first: 'Meera', last: 'Menon', company: 'LuxeLiving Interior Studio', email: 'meera@luxeliving.co', phone: '+91 97411 22334', val: 95000, status: 'New', priority: 'Low', source: 'Agency Website Organic' },
      { first: 'Farhan', last: 'Akhtar', company: 'SwiftPay Technologies', email: 'farhan@swiftpay.dev', phone: '+91 98210 99887', val: 300000, status: 'Contacted', priority: 'Medium', source: 'CEO Referral Network' }
    ];

    for (const l of leads) {
      await client.query(`
        INSERT INTO leads (organization_id, first_name, last_name, company_name, email, phone, lead_value, status, priority, source_id, owner_id, next_followup_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() + INTERVAL '2 days');
      `, [orgId, l.first, l.last, l.company, l.email, l.phone, l.val, l.status, l.priority, sourceMap[l.source], userMap['sales@optivir.com']]);
    }

    // 10. Deals
    console.log('10. Seeding Deals...');
    const deals = [
      { name: 'Apex Q2 Performance Marketing Retainer', comp: 'Apex HealthTech Solutions', stage: 'Closed Won', val: 450000, prob: 100, status: 'won', close: '2026-03-01' },
      { name: 'UrbanFit Full D2C Growth Retainer', comp: 'UrbanFit Luxury Apparel', stage: 'Closed Won', val: 600000, prob: 100, status: 'won', close: '2026-02-15' },
      { name: 'Zenith High-Ticket Lead Gen Campaign', comp: 'Zenith FinServe Capital', stage: 'Negotiation', val: 750000, prob: 75, status: 'open', close: '2026-09-20' },
      { name: 'CloudScale Global SEO & Content Retainer', comp: 'CloudScale Logistics', stage: 'Proposal Sent', val: 320000, prob: 50, status: 'open', close: '2026-09-25' },
      { name: 'Velocita Product Launch Campaign', comp: 'Velocita EV Mobility', stage: 'Discovery Call', val: 280000, prob: 25, status: 'open', close: '2026-10-05' }
    ];

    const dealMap: Record<string, string> = {};
    for (const d of deals) {
      const res = await client.query(`
        INSERT INTO deals (organization_id, name, company_id, pipeline_id, stage_id, owner_id, value, probability, status, expected_close_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, name;
      `, [orgId, d.name, companyMap[d.comp], pipelineId, stageMap[d.stage], userMap['sales@optivir.com'], d.val, d.prob, d.status, d.close]);
      dealMap[d.name] = res.rows[0].id;
    }

    // 11. Clients (5 Full Clients with complete 360 data)
    console.log('11. Seeding 5 Full Clients & Client 360 Data...');
    const clientsToSeed = [
      {
        comp: 'Apex HealthTech Solutions',
        contactEmail: 'vikram@apexhealth.io',
        contract_val: 1800000,
        billing_freq: 'monthly',
        start_date: '2026-01-01',
        renewal_date: '2026-12-31',
        health_status: 'Healthy',
        health_score: 94,
        status: 'Active',
        progress: 100,
        service: 'Enterprise Performance Marketing Retainer',
        fee: 150000
      },
      {
        comp: 'UrbanFit Luxury Apparel',
        contactEmail: 'simran@urbanfit.store',
        contract_val: 2400000,
        billing_freq: 'monthly',
        start_date: '2026-02-15',
        renewal_date: '2026-10-15',
        health_status: 'Attention Needed',
        health_score: 68,
        status: 'Active',
        progress: 100,
        service: 'Conversion Rate Optimization (CRO)',
        fee: 200000
      },
      {
        comp: 'Zenith FinServe Capital',
        contactEmail: 'amitabh@zenithfin.com',
        contract_val: 3600000,
        billing_freq: 'monthly',
        start_date: '2026-03-01',
        renewal_date: '2027-02-28',
        health_status: 'Healthy',
        health_score: 96,
        status: 'Active',
        progress: 100,
        service: 'Enterprise Performance Marketing Retainer',
        fee: 300000
      },
      {
        comp: 'CloudScale Logistics',
        contactEmail: 'kavita@cloudscale.ai',
        contract_val: 1140000,
        billing_freq: 'quarterly',
        start_date: '2026-08-01',
        renewal_date: '2027-07-31',
        health_status: 'Healthy',
        health_score: 88,
        status: 'Onboarding',
        progress: 70,
        service: 'Search Engine Optimization & Content Engine',
        fee: 95000
      },
      {
        comp: 'Velocita EV Mobility',
        contactEmail: 'rohan@velocita-ev.com',
        contract_val: 1500000,
        billing_freq: 'monthly',
        start_date: '2026-04-10',
        renewal_date: '2026-09-30',
        health_status: 'At Risk',
        health_score: 52,
        status: 'Active',
        progress: 85,
        service: 'Brand Identity & Creative Suite',
        fee: 125000
      }
    ];

    const clientMap: Record<string, string> = {};
    for (const c of clientsToSeed) {
      const res = await client.query(`
        INSERT INTO clients (
          organization_id, company_id, primary_contact_id, account_manager_id,
          contract_value, billing_frequency, start_date, renewal_date,
          health_status, health_score, status, onboarding_progress
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (organization_id, company_id) DO UPDATE SET
          contract_value = EXCLUDED.contract_value,
          health_status = EXCLUDED.health_status,
          health_score = EXCLUDED.health_score,
          status = EXCLUDED.status,
          renewal_date = EXCLUDED.renewal_date,
          onboarding_progress = EXCLUDED.onboarding_progress
        RETURNING id;
      `, [
        orgId, companyMap[c.comp], contactMap[c.contactEmail], userMap['accounts@optivir.com'],
        c.contract_val, c.billing_freq, c.start_date, c.renewal_date, c.health_status, c.health_score, c.status, c.progress
      ]);
      const clientId = res.rows[0].id;
      clientMap[c.comp] = clientId;

      // Add client subscribed service
      await client.query(`
        INSERT INTO client_services (client_id, service_id, monthly_fee, start_date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING;
      `, [clientId, serviceMap[c.service] || serviceMap['Enterprise Performance Marketing Retainer'], c.fee, c.start_date]);

      // Add Onboarding Checklists
      const checklistItems = [
        { title: 'Master Service Agreement Signed', cat: 'contract', done: true },
        { title: 'Meta Business Manager & Ad Accounts Shared', cat: 'access', done: true },
        { title: 'Google Analytics 4 & Tag Manager Access Granted', cat: 'access', done: true },
        { title: 'Brand Guidelines & Asset Vault Received', cat: 'assets', done: true },
        { title: 'Competitor Benchmark & Audience ICP Finalized', cat: 'marketing', done: true },
        { title: 'Custom Looker Studio / Agency Dashboard Setup', cat: 'marketing', done: c.progress >= 85 },
        { title: 'Kickoff Call & Weekly Reporting Cadence Scheduled', cat: 'general', done: c.progress === 100 }
      ];

      for (let i = 0; i < checklistItems.length; i++) {
        const chk = checklistItems[i];
        await client.query(`
          INSERT INTO client_onboarding_checklists (client_id, title, category, is_completed, completed_at, completed_by, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7);
        `, [clientId, chk.title, chk.cat, chk.done, chk.done ? new Date() : null, userMap['accounts@optivir.com'], i + 1]);
      }
    }

    // 12. Projects & Tasks
    console.log('12. Seeding Projects & Tasks for All 5 Clients...');
    const p1 = await client.query(`
      INSERT INTO projects (organization_id, client_id, name, description, project_manager_id, budget, spent, status, priority, progress, start_date, end_date)
      VALUES ($1, $2, 'Q3 Omni-Channel Performance Scaling', 'Scaling ROAS from 3.2x to 4.8x across Meta and Google PMax', $3, 450000, 290000, 'Active', 'High', 65, '2026-07-01', '2026-09-30')
      RETURNING id;
    `, [orgId, clientMap['Apex HealthTech Solutions'], userMap['accounts@optivir.com']]);
    const proj1Id = p1.rows[0].id;

    const p2 = await client.query(`
      INSERT INTO projects (organization_id, client_id, name, description, project_manager_id, budget, spent, status, priority, progress, start_date, end_date)
      VALUES ($1, $2, 'Festive Autumn Collection Launch', 'Multi-tier influencer seeding and high-velocity creative ad tests', $3, 600000, 420000, 'Active', 'Urgent', 80, '2026-08-01', '2026-10-15')
      RETURNING id;
    `, [orgId, clientMap['UrbanFit Luxury Apparel'], userMap['accounts@optivir.com']]);
    const proj2Id = p2.rows[0].id;

    const p3 = await client.query(`
      INSERT INTO projects (organization_id, client_id, name, description, project_manager_id, budget, spent, status, priority, progress, start_date, end_date)
      VALUES ($1, $2, 'High-Net-Worth Wealth Lead Generation Funnel', 'Targeting HNIs across LinkedIn Ads, Financial Portals, and Custom Landing Pages', $3, 850000, 560000, 'Active', 'High', 75, '2026-03-15', '2026-11-30')
      RETURNING id;
    `, [orgId, clientMap['Zenith FinServe Capital'], userMap['accounts@optivir.com']]);
    const proj3Id = p3.rows[0].id;

    const p4 = await client.query(`
      INSERT INTO projects (organization_id, client_id, name, description, project_manager_id, budget, spent, status, priority, progress, start_date, end_date)
      VALUES ($1, $2, 'Global Freight SEO Authority Building', 'Rank on 150 commercial keywords across Singapore, US, and India corridors', $3, 350000, 180000, 'Active', 'Medium', 50, '2026-08-15', '2027-02-15')
      RETURNING id;
    `, [orgId, clientMap['CloudScale Logistics'], userMap['accounts@optivir.com']]);
    const proj4Id = p4.rows[0].id;

    const p5 = await client.query(`
      INSERT INTO projects (organization_id, client_id, name, description, project_manager_id, budget, spent, status, priority, progress, start_date, end_date)
      VALUES ($1, $2, 'EV Fleet Pre-Order Campaign & Video Ads', 'Tier-2 city EV mobility pre-booking drive with YouTube Shorts and Meta', $3, 500000, 480000, 'On Hold', 'Urgent', 40, '2026-05-01', '2026-09-20')
      RETURNING id;
    `, [orgId, clientMap['Velocita EV Mobility'], userMap['accounts@optivir.com']]);
    const proj5Id = p5.rows[0].id;

    // Tasks for all 5 clients
    const tasks = [
      { title: 'Meta Ads Creative Refresh (6 UGC Video Hooks)', proj: proj1Id, client: clientMap['Apex HealthTech Solutions'], assignee: userMap['marketing@optivir.com'], priority: 'Urgent', status: 'In Progress', due: '2026-09-10' },
      { title: 'Weekly Performance Audit & ROAS Optimization Report', proj: proj1Id, client: clientMap['Apex HealthTech Solutions'], assignee: userMap['accounts@optivir.com'], priority: 'High', status: 'To Do', due: '2026-09-08' },
      { title: 'Catalog Feed Integration & Dynamic Retargeting Setup', proj: proj2Id, client: clientMap['UrbanFit Luxury Apparel'], assignee: userMap['marketing@optivir.com'], priority: 'Medium', status: 'Completed', due: '2026-09-02' },
      { title: 'Contract Renewal Discussion Prep for Q4', proj: proj2Id, client: clientMap['UrbanFit Luxury Apparel'], assignee: userMap['accounts@optivir.com'], priority: 'Urgent', status: 'Review', due: '2026-09-15' },
      { title: 'LinkedIn Thought Leadership & Lead Magnet Distribution', proj: proj3Id, client: clientMap['Zenith FinServe Capital'], assignee: userMap['marketing@optivir.com'], priority: 'High', status: 'In Progress', due: '2026-09-12' },
      { title: 'Wealth Management Compliance Review on Ad Copy', proj: proj3Id, client: clientMap['Zenith FinServe Capital'], assignee: userMap['accounts@optivir.com'], priority: 'Medium', status: 'Completed', due: '2026-09-04' },
      { title: 'Technical SEO Core Web Vitals Optimization', proj: proj4Id, client: clientMap['CloudScale Logistics'], assignee: userMap['marketing@optivir.com'], priority: 'Medium', status: 'To Do', due: '2026-09-18' },
      { title: 'Urgent Strategy Meeting: CAC Reduction & Creative Pivot', proj: proj5Id, client: clientMap['Velocita EV Mobility'], assignee: userMap['accounts@optivir.com'], priority: 'Urgent', status: 'In Progress', due: '2026-09-09' }
    ];

    for (const t of tasks) {
      await client.query(`
        INSERT INTO tasks (organization_id, project_id, client_id, title, assignee_id, priority, status, due_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [orgId, t.proj, t.client, t.title, t.assignee, t.priority, t.status, t.due]);
    }

    // 13. Invoices & Payments for All 5 Clients
    console.log('13. Seeding Invoices & Payments for All 5 Clients...');
    const invoicesToSeed = [
      { invNum: 'INV-2026-001', comp: 'Apex HealthTech Solutions', date: '2026-08-01', due: '2026-08-15', sub: 150000, tax: 27000, total: 177000, paid: 177000, status: 'Paid' },
      { invNum: 'INV-2026-002', comp: 'Apex HealthTech Solutions', date: '2026-09-01', due: '2026-09-15', sub: 150000, tax: 27000, total: 177000, paid: 0, status: 'Sent' },
      { invNum: 'INV-2026-003', comp: 'UrbanFit Luxury Apparel', date: '2026-08-15', due: '2026-08-30', sub: 200000, tax: 36000, total: 236000, paid: 100000, status: 'Partially Paid' },
      { invNum: 'INV-2026-004', comp: 'Zenith FinServe Capital', date: '2026-08-01', due: '2026-08-15', sub: 300000, tax: 54000, total: 354000, paid: 354000, status: 'Paid' },
      { invNum: 'INV-2026-005', comp: 'Zenith FinServe Capital', date: '2026-09-01', due: '2026-09-15', sub: 300000, tax: 54000, total: 354000, paid: 0, status: 'Sent' },
      { invNum: 'INV-2026-006', comp: 'CloudScale Logistics', date: '2026-08-01', due: '2026-08-15', sub: 285000, tax: 51300, total: 336300, paid: 336300, status: 'Paid' },
      { invNum: 'INV-2026-007', comp: 'Velocita EV Mobility', date: '2026-07-15', due: '2026-07-30', sub: 125000, tax: 22500, total: 147500, paid: 0, status: 'Overdue' }
    ];

    for (const inv of invoicesToSeed) {
      const invRes = await client.query(`
        INSERT INTO invoices (organization_id, client_id, invoice_number, invoice_date, due_date, subtotal, tax, total, paid_amount, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (organization_id, invoice_number) DO UPDATE SET
          paid_amount = EXCLUDED.paid_amount,
          status = EXCLUDED.status
        RETURNING id;
      `, [orgId, clientMap[inv.comp], inv.invNum, inv.date, inv.due, inv.sub, inv.tax, inv.total, inv.paid, inv.status]);
      const invId = invRes.rows[0].id;

      if (inv.paid > 0) {
        await client.query(`
          INSERT INTO payments (organization_id, invoice_id, client_id, amount, payment_date, payment_method, reference_number, status)
          VALUES ($1, $2, $3, $4, $5, 'Bank Transfer', 'NEFT-REF-AUTO', 'successful')
          ON CONFLICT DO NOTHING;
        `, [orgId, invId, clientMap[inv.comp], inv.paid, inv.date]);
      }
    }

    // 14. Marketing Campaigns & Daily Analytics for All 5 Clients
    console.log('14. Seeding Campaigns & Analytics Metrics for All 5 Clients...');
    const campaignsToSeed = [
      { name: 'Apex Doctor In-App Lead Generation', comp: 'Apex HealthTech Solutions', platform: 'Meta', obj: 'Lead Gen', budget: 250000, spend: 6500, leads: 18, conv: 12, rev: 32000 },
      { name: 'Apex Healthcare Decision Maker Intent Search', comp: 'Apex HealthTech Solutions', platform: 'Google Ads', obj: 'Lead Gen', budget: 200000, spend: 5200, leads: 24, conv: 16, rev: 28500 },
      { name: 'UrbanFit Autumn D2C Conversions', comp: 'UrbanFit Luxury Apparel', platform: 'Meta', obj: 'Sales / ROAS', budget: 350000, spend: 8500, leads: 0, conv: 42, rev: 44200 },
      { name: 'Zenith Ultra-HNI Private Wealth Acquisition', comp: 'Zenith FinServe Capital', platform: 'LinkedIn', obj: 'Lead Gen', budget: 500000, spend: 14000, leads: 32, conv: 8, rev: 95000 },
      { name: 'CloudScale Global Container Logistics Search', comp: 'CloudScale Logistics', platform: 'Google Ads', obj: 'Lead Gen', budget: 180000, spend: 4200, leads: 14, conv: 5, rev: 22000 },
      { name: 'Velocita Commuter EV Awareness & Test Rides', comp: 'Velocita EV Mobility', platform: 'Meta', obj: 'Traffic / Leads', budget: 220000, spend: 7800, leads: 12, conv: 2, rev: 11000 }
    ];

    const dates = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07'];

    for (const c of campaignsToSeed) {
      const campRes = await client.query(`
        INSERT INTO campaigns (organization_id, client_id, name, platform, campaign_type, objective, status, budget, start_date)
        VALUES ($1, $2, $3, $4, 'paid', $5, 'Active', $6, '2026-08-01')
        RETURNING id;
      `, [orgId, clientMap[c.comp], c.name, c.platform, c.obj, c.budget]);
      const campId = campRes.rows[0].id;

      for (const d of dates) {
        await client.query(`
          INSERT INTO campaign_metrics (campaign_id, date, spend, impressions, reach, clicks, leads, conversions, revenue)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (campaign_id, date) DO NOTHING;
        `, [campId, d, c.spend, c.spend * 5, c.spend * 4, Math.round(c.spend * 0.12), c.leads, c.conv, c.rev]);
      }
    }

    // Organic Performance for all clients
    for (const d of dates) {
      await client.query(`
        INSERT INTO organic_performance (client_id, channel, date, organic_spend, organic_traffic, organic_leads, engagement_rate)
        VALUES 
        ($1, 'SEO', $2, 3000, 4200, 8, 4.2),
        ($3, 'Instagram', $2, 2500, 8600, 15, 6.8),
        ($4, 'LinkedIn', $2, 4000, 3100, 12, 5.5),
        ($5, 'SEO', $2, 2800, 5400, 9, 3.9),
        ($6, 'YouTube', $2, 2000, 7200, 6, 7.1)
        ON CONFLICT (client_id, channel, date) DO NOTHING;
      `, [
        clientMap['Apex HealthTech Solutions'], d,
        clientMap['UrbanFit Luxury Apparel'],
        clientMap['Zenith FinServe Capital'],
        clientMap['CloudScale Logistics'],
        clientMap['Velocita EV Mobility']
      ]);
    }

    // 15. Activities (Timeline) for all 5 clients
    console.log('15. Seeding Timeline Activities for All 5 Clients...');
    const activities = [
      { type: 'Status Change', sub: 'Client Health Changed to Healthy', client: clientMap['Apex HealthTech Solutions'], desc: 'Campaign ROAS exceeded benchmark (3.8x achieved vs 3.0x target)' },
      { type: 'Meeting', sub: 'Quarterly Executive Strategy Review', client: clientMap['Apex HealthTech Solutions'], desc: 'Reviewed expansion into international medical tourism campaigns with Dr. Vikram' },
      { type: 'Call', sub: 'Campaign Scaling Discussion with Simran', client: clientMap['UrbanFit Luxury Apparel'], desc: 'Discussed increasing Meta daily budget to ₹15,000 for festival season' },
      { type: 'Meeting', sub: 'HNI Advisory Board Acquisition Review', client: clientMap['Zenith FinServe Capital'], desc: 'CMO Amitabh approved doubling LinkedIn media spend for Q3' },
      { type: 'Status Change', sub: 'Onboarding Checklist 70% Completed', client: clientMap['CloudScale Logistics'], desc: 'GA4 analytics access verified and brand kit downloaded' },
      { type: 'Call', sub: 'Urgent Campaign Performance Review', client: clientMap['Velocita EV Mobility'], desc: 'CPA on Meta rose to ₹3,900. Initiated creative pivot and lead form rework' }
    ];

    for (const a of activities) {
      await client.query(`
        INSERT INTO activities (organization_id, client_id, type, subject, description, performer_id)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [orgId, a.client, a.type, a.sub, a.desc, userMap['accounts@optivir.com']]);
    }

    await client.query('COMMIT');
    console.log('🎉 OptiVir CRM Database successfully seeded with rich enterprise data!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
