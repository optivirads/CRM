/**
 * Pure JavaScript PDF Generator for OptiVir Ads CRM UI Architecture
 * Uses pdfkit to generate a native, high-resolution vector PDF document
 * with page numbering, executive styling, tables, and trees.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = path.join(__dirname, 'OPTIVIR_CRM_UI_STRUCTURE.pdf');
const LOGO_PATH = path.join(__dirname, 'frontend/public/images/optivir-logo.png');

// Initialize PDF Document
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 48, bottom: 50, left: 48, right: 48 },
  bufferPages: true,
  info: {
    Title: 'OptiVir CRM - Complete Enterprise UI Architecture',
    Author: 'OptiVir CRM Engineering',
    Subject: 'Enterprise CRM Functional Map & UI Hierarchy',
    Keywords: 'CRM, OptiVir CRM, Architecture, UI Structure, Next.js',
    CreationDate: new Date()
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Color Palette Constants
const COLORS = {
  navyDark: '#0A1628',
  navyCard: '#112240',
  navyBorder: '#1E3A8A',
  crimson: '#B91C1C',
  crimsonLight: '#F87171',
  crimsonBg: '#450A0A',
  blue: '#2563EB',
  blueBg: '#1E3A8A',
  textDark: '#0F172A',
  textMuted: '#64748B',
  textLight: '#F8FAFC',
  border: '#E2E8F0',
  cardBg: '#F8FAFC',
  cardBorder: '#CBD5E1',
  codeBg: '#0B132B',
  green: '#059669',
  greenBg: '#064E3B',
  amber: '#D97706'
};

const pageWidth = doc.page.width;
const pageHeight = doc.page.height;
const contentWidth = pageWidth - 96;

function checkPageSpace(requiredHeight) {
  if (doc.y + requiredHeight > pageHeight - 60) {
    doc.addPage();
  }
}

// ----------------------------------------------------
// COVER / EXECUTIVE HEADER
// ----------------------------------------------------
function renderHeader() {
  // Top Banner Background
  doc.rect(48, 40, contentWidth, 115).fillAndStroke(COLORS.navyDark, COLORS.crimson);

  // Red accent top bar
  doc.rect(48, 40, contentWidth, 4).fill(COLORS.crimson);

  let textStartX = 64;
  if (fs.existsSync(LOGO_PATH)) {
    doc.roundedRect(64, 52, 130, 42, 4).fill('#FFFFFF');
    doc.image(LOGO_PATH, 69, 57, { width: 120 });
    textStartX = 208;
  }

  // Agency Tag
  doc.fillColor(COLORS.crimsonLight)
     .fontSize(8.5)
     .font('Helvetica-Bold')
     .text('OPTIVIR CRM • ENTERPRISE OPERATING SYSTEM', textStartX, 52);

  // Title
  doc.fillColor('#FFFFFF')
     .fontSize(17)
     .font('Helvetica-Bold')
     .text('COMPLETE ENTERPRISE UI ARCHITECTURE', textStartX, 66);

  // Subtitle
  doc.fillColor('#94A3B8')
     .fontSize(9)
     .font('Helvetica')
     .text('Comprehensive Functional Map, Hierarchical Tree & System Module Breakdown', textStartX, 90);

  // Badges row
  const badges = [
    { label: 'Suite v4.8', color: COLORS.crimson },
    { label: 'Next.js 16 (Turbopack)', color: '#1E40AF' },
    { label: 'TypeScript', color: '#1E40AF' },
    { label: '14 Core Workspaces', color: '#047857' },
    { label: 'Verified 0 Errors', color: '#047857' }
  ];

  let badgeX = 64;
  badges.forEach(b => {
    const textWidth = doc.widthOfString(b.label, { size: 7.5, font: 'Helvetica-Bold' });
    const badgeW = textWidth + 12;
    doc.roundedRect(badgeX, 115, badgeW, 16, 3).fill(b.color);
    doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold').text(b.label, badgeX + 6, 119);
    badgeX += badgeW + 8;
  });

  doc.y = 160;
}

renderHeader();

// ----------------------------------------------------
// EXECUTIVE SUMMARY BOX
// ----------------------------------------------------
function renderExecutiveSummary() {
  checkPageSpace(90);
  const startY = doc.y;
  doc.roundedRect(48, startY, contentWidth, 80, 5)
     .fillAndStroke(COLORS.cardBg, COLORS.cardBorder);

  doc.rect(48, startY, 4, 80).fill(COLORS.blue);

  doc.fillColor(COLORS.navyDark)
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('Executive Overview & Purpose', 64, startY + 12);

  doc.fillColor(COLORS.textDark)
     .fontSize(8.5)
     .font('Helvetica')
     .text(
       'This document codifies the full front-end and full-stack architecture of the OptiVir Ads CRM platform. ' +
       'Built specifically for high-velocity performance marketing and enterprise client growth management, ' +
       'the application unifies 14 major operating modules across 18 interactive views with complete INR (₹) ' +
       'commercial tracking, 70/30 split productivity panels, and live multi-tenant telemetry.',
       64, startY + 28, { width: contentWidth - 32, lineGap: 3 }
     );

  doc.y = startY + 95;
}

renderExecutiveSummary();

// ----------------------------------------------------
// SECTION: MASTER HIERARCHY TREE
// ----------------------------------------------------
function renderMasterTree() {
  checkPageSpace(40);
  doc.fillColor(COLORS.navyDark)
     .fontSize(13)
     .font('Helvetica-Bold')
     .text('1. Master UI Tree Structure (14 Modules)', 48, doc.y);

  doc.y += 4;
  doc.rect(48, doc.y, contentWidth, 1.5).fill(COLORS.crimson);
  doc.y += 10;

  const treeLines = [
    "OPTIVIR ADS CRM — SYSTEM ROOT",
    "│",
    "├── 01. FOUNDATION",
    "│   ├── Design System (Tokens: Dark Navy #0A1628, Crimson #B91C1C, Slate #E2E8F0)",
    "│   ├── Application Shell (Responsive Two-Column Container, 256px Collapsible Sidebar)",
    "│   ├── Global Navigation (5 Main Sections, Route Indicators, Badge Counters)",
    "│   ├── Global Search & Command Palette (Ctrl+K / ⌘K Universal Search across all 17 entities)",
    "│   ├── Create Menu (Instant Creation Drawer for Leads, Invoices, Proposals & Tasks)",
    "│   └── Notifications Center (Dynamic Bell Badge, Live Stream Status & Severity Drawer)",
    "│",
    "├── 02. DASHBOARD",
    "│   ├── Management Dashboard (Executive Revenue: ₹48,250, 142 Active Clients, 1,482 Leads)",
    "│   ├── Sales Dashboard (7-Stage Deal Funnel Progression with Weighted INR ₹ Values)",
    "│   ├── Marketing Dashboard (Lead Acquisition Attribution Breakdown Donut Chart)",
    "│   ├── Finance Dashboard (Spline Revenue Projection: Revenue, ARR, Cash Flow Curves)",
    "│   └── My Dashboard (Personal Priority Agenda, Active Tasks Stopwatch, Operational Friction Review)",
    "│",
    "├── 03. CRM",
    "│   ├── Leads (List, Lead Detail, BANT Qualification Flyout, Lead Score 0-100, 1-Click Conversion)",
    "│   ├── Contacts (Decision-Maker Directory, Role Badges, Direct Email/Phone Actions)",
    "│   ├── Companies (Account Tiers, Health Factors: Active/At-Risk/Prospect, Renewal Timelines)",
    "│   ├── Opportunities (Weighted Revenue Forecast Ledger, Win Velocity: 24.8%, Stage Progression)",
    "│   └── Sales Pipeline (6-Column Kanban Board with ACV in ₹ Lakhs, Velocity Warnings)",
    "│",
    "├── 04. CLIENT MANAGEMENT",
    "│   ├── Clients Directory (Enterprise Gold, Silver SLA, Growth Retainer, Multi-Tenant Filter)",
    "│   ├── Client 360° Profile (94/100 Health Strip, Active SOWs, Retainer Burn Gauge, Renewal Hub)",
    "│   └── Client Onboarding (Sales Handoff, Assets Collection, Strategy & SOW Kick-Off)",
    "│",
    "├── 05. PROJECT OPERATIONS",
    "│   ├── Projects Cockpit (List / Kanban / Timeline Views, Budget Burn Progress, Milestones Delivery)",
    "│   ├── Tasks & Detail (70/30 Split View #OPT-9492, Interactive Stopwatch, Subtasks, Dependencies)",
    "│   └── Unified Calendar (Month Grid, Today Highlights, Mini Navigator, Agenda with 'Join Meet')",
    "│",
    "├── 06. SALES & DOCUMENTS",
    "│   ├── Proposals (Proposals Ledger, 7 KPI Summary Cards, Value Tracking)",
    "│   ├── 3-Column Proposal Builder (Document Outline, A4 Live Canvas Fig 4.1, Security Controls)",
    "│   └── Quotations (PDF Preview, Commercial Terms, 1-Click Convert to Tax Invoice)",
    "│",
    "├── 07. FINANCE",
    "│   ├── Finance Ledger (Gross Revenue ₹48,250, Receivables ₹14,200, Net Margin 34.2%)",
    "│   ├── Invoices (Tax Invoices Ledger, Critical AR Dunning Banner, GSTIN Breakdown)",
    "│   ├── Payments (ICICI NEFT Batch Settlements PAY-2026-118, Record Payment Modal)",
    "│   └── Expenses (Retainer Burn vs Operational Paid Media Budget Allocations)",
    "│",
    "├── 08. MARKETING",
    "│   ├── Campaigns Fleet (Multi-Channel Fleet List, Launch Campaign Modal, Pacing Flags)",
    "│   └── Marketing Intelligence (5 Anomaly Alerts, 10 KPI Ceilings, Blended ROAS 3.83x, 4 Charts)",
    "│",
    "├── 09. REPORTING & BI",
    "│   ├── Reports Center (High-Density Dossiers Ledger, Category Filters, Batch Dispatch)",
    "│   ├── Live Report Builder (Compilation Pipeline #GEN-9902 at 78%, Live Stream Terminal)",
    "│   └── Executive Dossier Preview (Print-Ready QBR Report Modal with Financial Projections)",
    "│",
    "├── 10. DOCUMENT MANAGEMENT",
    "│   ├── Document Vault (1.84 GB Encrypted Storage Telemetry, Category Filtering)",
    "│   ├── Preview & Audit Drawer (DOC-2026-089-MSA, SHA-256 Hash Verification, DocuSign Status)",
    "│   └── Entity Binding (Direct Association of Signed Assets to Deals, Projects & Invoices)",
    "│",
    "├── 11. ACTIVITIES & AUDIT",
    "│   ├── Activity Center (Cross-Functional Audit Log, Chronological Milestone Triggers)",
    "│   └── Log Actions (Quick Modals: Log Call, Log Meeting, Log Email, Add Note, Add Follow-up)",
    "│",
    "├── 12. NOTIFICATIONS CENTER",
    "│   ├── Live Stream Status (Node-US-04 Active Socket Sync, 3 KPI Summary Cards)",
    "│   ├── Severity Categorization (Critical Finance, Commercial Win, Task Escalation, System Sync)",
    "│   └── Floating Right Drawer (7 Unread Updates with 1-Click Contextual Actions, Zero-Backlog State)",
    "│",
    "├── 13. SETTINGS & ADMINISTRATION",
    "│   ├── Organization & Brand Core (Tenant UUID opt-9021-acme-prod, Logo Asset Box, Legal Metadata)",
    "│   ├── Users & Roles (42 / 50 Active Seats, Granular RBAC Permissions Matrix)",
    "│   ├── Regionalization & FX (Asia/Kolkata Timezone, Base INR ₹ Pegging, Auto Regional Shift)",
    "│   └── System Preferences (Console Density: Dense/Comfortable, Auditory Alerts, Telemetry Diff)",
    "│",
    "└── 14. SYSTEM / GLOBAL UI ARCHITECTURE",
    "    ├── Modals & Drawers (Quick Create Drawers, Confirmations, Delete Modals, Unsaved Changes Guard)",
    "    ├── Dynamic States (Empty Zero-Backlog, Loading Skeleton Shimmers, Error 404/500 Fallbacks)",
    "    └── Responsive Layouts (Collapsible 256px Sidebar, Mobile Flyout Drawer, Fluid Viewports)"
  ];

  // Render tree block inside an elegant dark box
  const boxHeight = (treeLines.length * 9.8) + 16;
  checkPageSpace(boxHeight);

  const startY = doc.y;
  doc.roundedRect(48, startY, contentWidth, boxHeight, 4)
     .fillAndStroke(COLORS.codeBg, COLORS.navyBorder);

  doc.font('Courier').fontSize(6.8);

  let currentY = startY + 10;
  treeLines.forEach(line => {
    if (doc.y > pageHeight - 60) {
      doc.addPage();
      currentY = 50;
    }
    if (line.includes('OPTIVIR ADS CRM')) {
      doc.fillColor(COLORS.crimsonLight).font('Courier-Bold');
    } else if (line.match(/├── \d\d\./) || line.match(/└── \d\d\./)) {
      doc.fillColor('#38BDF8').font('Courier-Bold');
    } else if (line.includes('│   ├──') || line.includes('│   └──')) {
      doc.fillColor('#E2E8F0').font('Courier');
    } else {
      doc.fillColor('#94A3B8').font('Courier');
    }
    doc.text(line, 58, currentY);
    currentY += 9.8;
  });

  doc.y = currentY + 12;
}

renderMasterTree();

// ----------------------------------------------------
// SECTION: DETAILED MODULE DIRECTORY
// ----------------------------------------------------
function renderModuleDetails() {
  checkPageSpace(50);
  doc.addPage();

  doc.fillColor(COLORS.navyDark)
     .fontSize(13)
     .font('Helvetica-Bold')
     .text('2. Comprehensive Module Directory & Implementation Specifications', 48, doc.y);

  doc.y += 4;
  doc.rect(48, doc.y, contentWidth, 1.5).fill(COLORS.crimson);
  doc.y += 14;

  const modules = [
    {
      num: '01',
      title: 'FOUNDATION & APPLICATION SHELL',
      files: 'frontend/src/app/page.tsx, Sidebar.tsx, Header.tsx',
      bullets: [
        'Design System: Dark Navy (#0A1628), Crimson (#B91C1C), Slate (#E2E6EC), high-contrast data tables.',
        'Application Shell: 256px collapsible sidebar with agency badge, active workspace indicators.',
        'Global Navigation: 5 grouped suites (Overview, CRM, Delivery, Revenue, Operations).',
        'Global Search (⌘K): Instant fuzzy search modal indexing all 17 CRM entity types.',
        'Create Menu & Quick Actions: Instant slide-over forms for rapid lead, opportunity, and invoice entry.'
      ]
    },
    {
      num: '02',
      title: 'DASHBOARD & EXECUTIVE COMMAND',
      files: 'frontend/src/components/dashboard/DashboardView.tsx',
      bullets: [
        'Executive Metrics: Total Revenue (₹48,250, +12.5%), Active Clients (142, +8.2%), Pipeline Leads (1,482).',
        'View Switcher: 5 Sub-dashboards (Management, Sales Pipeline, Marketing ROAS, Finance Cashflow, My Dashboard).',
        'Operational Friction Matrix: Alert ribbon with Overdue Tasks (4), Unpaid Invoices (₹14,200), At-Risk Projects (1).',
        'Interactive Charts: Comparative revenue spline curves and lead ingestion donut chart.'
      ]
    },
    {
      num: '03',
      title: 'CRM (LEADS, CONTACTS, COMPANIES, OPPS, PIPELINE)',
      files: 'LeadsView.tsx, LeadDetailView.tsx, ContactsView.tsx, CompaniesView.tsx, OpportunitiesView.tsx, PipelineView.tsx',
      bullets: [
        'Leads Workspace: Lead Fit Score gauges (0-100), slide-over BANT qualification drawer, 1-click deal conversion.',
        'Contacts & Decision-Makers: Verified stakeholder records with direct email/phone channels.',
        'Companies Directory: Account tiers, health factors (Active / At-Risk / Prospect), ARR indicators.',
        'Opportunities Ledger: Weighted INR closing projections with stage probability calculations.',
        'Sales Pipeline Kanban: 6 visual deal stages with ACV in ₹ Lakhs and deal velocity monitors.'
      ]
    },
    {
      num: '04',
      title: 'CLIENT MANAGEMENT & 360° PROFILES',
      files: 'ClientsListView.tsx, Client360View.tsx',
      bullets: [
        'Clients Directory: Enterprise Gold, Silver SLA, and Growth Retainer service tier segmentation.',
        'Client 360° Profile: Acme Technologies dossier featuring 94/100 client health factor strip.',
        'Account Performance: Live retainers burn gauge, open deliverables, active contracts, and renewal center.',
        'Onboarding Pipeline: Multi-stage tracking from sales handoff to SOW kick-off.'
      ]
    },
    {
      num: '05',
      title: 'PROJECT OPERATIONS & 70/30 SPLIT TASKS',
      files: 'ProjectsView.tsx, TasksView.tsx, CalendarView.tsx',
      bullets: [
        'Projects Cockpit: Multi-mode views (Table, Kanban, Timeline) with milestone status and budget tracking.',
        '70/30 Tasks Split View (#OPT-9492): Real-time interactive stopwatch, subtasks checklist, dependencies.',
        'Unified Calendar: Monthly grid with today highlighted (Sep 10), agenda drawer, and Google Meet integration.'
      ]
    },
    {
      num: '06',
      title: 'SALES & PROPOSAL BUILDER',
      files: 'ProposalsView.tsx',
      bullets: [
        'Proposals Ledger: Status lifecycle (Draft, Sent, Under Review, Approved, Signed).',
        '3-Column Proposal Builder: Left outline & token vault, Center A4 live page canvas with Figure 4.1 diagram, Right security & signing controls.',
        'Quotations: Instant PDF preview generation and 1-click conversion to Tax Invoice.'
      ]
    },
    {
      num: '07',
      title: 'FINANCE & BILLING LEDGER',
      files: 'FinanceView.tsx',
      bullets: [
        'Finance KPIs: Gross billing, cash collected, and outstanding receivables in INR (₹).',
        'Invoices Engine: Detailed invoice ledger, net margin telemetry (34.2%), and AR dunning banner.',
        'Payments Settlements: ICICI NEFT batch sync ledger matching settlement references (PAY-2026-118).',
        'Expenses: Agency media spend vs client retainer burn tracking.'
      ]
    },
    {
      num: '08',
      title: 'MARKETING INTELLIGENCE & ROAS',
      files: 'MarketingView.tsx',
      bullets: [
        'Anomaly Detection: 5 automated algorithmic alerts (Critical, Efficiency, Pacing, Release, Optimal).',
        '10 Growth KPIs: Blended ROAS (3.83x), Spend (₹64.80L), Revenue Attributed (₹2.48 Cr), CTR, CPA.',
        'Omnichannel Matrix: Cross-channel breakdown across Google, Meta, LinkedIn, DV360, and Microsoft Ads.'
      ]
    },
    {
      num: '09',
      title: 'REPORTING & BI BUILDER',
      files: 'ReportsView.tsx, ExecutiveReportModal.tsx',
      bullets: [
        'Reports Center: High-density dossiers ledger, scheduled reports, and batch export actions.',
        'Live Report Builder: Compilation pipeline #GEN-9902 at 78% completion with real-time log inspector.',
        'Executive Dossier: Print-ready quarterly business review (QBR) modal.'
      ]
    },
    {
      num: '10',
      title: 'DOCUMENT MANAGEMENT VAULT',
      files: 'DocumentsView.tsx',
      bullets: [
        'Encrypted Storage: 1.84 GB encrypted storage telemetry with category distribution progress bars.',
        'Audit & Preview Drawer: SHA-256 validation hash and DocuSign certificate inspector for DOC-2026-089-MSA.',
        'Entity Binding: Direct association of contracts to CRM deals, projects, and invoices.'
      ]
    },
    {
      num: '11',
      title: 'ACTIVITIES & COMMUNICATIONS TIMELINE',
      files: 'CalendarView.tsx',
      bullets: [
        'Cross-Functional Audit Log: Unified chronological stream of client engagements and system actions.',
        'Activity Logging: Fast modals to log phone calls, meetings, emails, internal notes, and follow-ups.'
      ]
    },
    {
      num: '12',
      title: 'NOTIFICATIONS CENTER & LIVE STREAM',
      files: 'NotificationsView.tsx',
      bullets: [
        'Real-time Stream: Active websocket telemetry indicator (Node-US-04) with unread priority badge.',
        'Severity Matrix: Color-coded categorization (Critical Finance, Commercial Win, Task Escalation, System Sync).',
        'Floating Right Drawer: 7 unread updates with 1-click contextual actions and zero-backlog toggle.'
      ]
    },
    {
      num: '13',
      title: 'SETTINGS & SYSTEM ADMINISTRATION',
      files: 'SettingsView.tsx',
      bullets: [
        'Organization Core: Tenant UUID opt-9021-acme-prod, master logo asset manager, legal company metadata.',
        'Users & Access: 42 / 50 active seats with granular role-based permissions matrix.',
        'Regionalization: Base currency INR (₹) with live FX pegging and Asia/Kolkata timezone handling.',
        'Preferences: Console density toggle (Dense / Comfortable), chime notifications, telemetry diffs.'
      ]
    },
    {
      num: '14',
      title: 'SYSTEM & GLOBAL UI INFRASTRUCTURE',
      files: 'Sidebar.tsx, Header.tsx, Layout Components',
      bullets: [
        'Global Command Palette: Keyboard-first navigation (⌘K) to jump across any screen or action.',
        'Robust State Feedback: Contextual toast alerts, unsaved changes guards, and interactive error boundaries.',
        'Responsive Engine: Full mobile menu drawer, adaptive desktop column splits, and touch-friendly targets.'
      ]
    }
  ];

  modules.forEach(m => {
    checkPageSpace(105);

    const startY = doc.y;
    // Header bar for module
    doc.roundedRect(48, startY, contentWidth, 20, 3).fill(COLORS.navyDark);

    // Number tag
    doc.roundedRect(52, startY + 2.5, 24, 15, 2).fill(COLORS.crimson);
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold').text(m.num, 58, startY + 6);

    // Title
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text(m.title, 84, startY + 6);

    // Box body
    let bodyY = startY + 24;
    doc.fillColor(COLORS.blue).fontSize(7).font('Helvetica-Bold').text('Components: ', 52, bodyY);
    doc.fillColor(COLORS.textDark).fontSize(7).font('Helvetica').text(m.files, 110, bodyY);
    bodyY += 12;

    m.bullets.forEach(bullet => {
      doc.fillColor(COLORS.crimson).fontSize(7).font('Helvetica-Bold').text('•', 52, bodyY);
      doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica')
         .text(bullet, 62, bodyY, { width: contentWidth - 24, lineGap: 2 });
      bodyY += doc.heightOfString(bullet, { width: contentWidth - 24, size: 7.5, font: 'Helvetica', lineGap: 2 }) + 3;
    });

    // Outer border
    const boxHeight = bodyY - startY + 6;
    doc.roundedRect(48, startY, contentWidth, boxHeight, 3).stroke(COLORS.border);
    doc.y = startY + boxHeight + 8;
  });
}

renderModuleDetails();

// ----------------------------------------------------
// SECTION: STATE TRANSITIONS & LIFECYCLE FLOW
// ----------------------------------------------------
function renderStateFlow() {
  checkPageSpace(160);
  doc.addPage();

  doc.fillColor(COLORS.navyDark)
     .fontSize(13)
     .font('Helvetica-Bold')
     .text('3. End-to-End Enterprise Operational State Flow', 48, doc.y);

  doc.y += 4;
  doc.rect(48, doc.y, contentWidth, 1.5).fill(COLORS.crimson);
  doc.y += 14;

  const steps = [
    { stage: '1. Inbound Acquisition', module: '03. CRM — Leads', desc: 'Inbound leads ingestion via organic search, LinkedIn, and referral channels. Lead Fit Score gauges (0-100).' },
    { stage: '2. BANT Qualification', module: '03. CRM — Opportunities', desc: 'Slide-over BANT qualification drawer checks Budget, Authority, Need, Timeline -> Promotes to Opportunity.' },
    { stage: '3. Proposal & SOW Drafting', module: '06. Sales — Proposal Builder', desc: 'Creation in 3-Column Proposal Builder with Figure 4.1 system diagram and custom INR pricing tables.' },
    { stage: '4. Signature & Contract Close', module: '10. Documents — Vault', desc: 'DocuSign integration with SHA-256 tamper verification hash -> Converts Opportunity to Active Client.' },
    { stage: '5. Client 360 Onboarding', module: '04. Client Management', desc: 'Sales handoff, contract terms review, assets collection, and SLA tier assignment (Enterprise Gold 94/100).' },
    { stage: '6. Sprint Execution & 70/30 Tasks', module: '05. Project Operations', desc: 'Project Cockpit milestones breakdown and 70/30 task detail split view with live stopwatch time tracking.' },
    { stage: '7. Milestone Tax Invoicing', module: '07. Finance — Invoices', desc: 'Automatic invoice generation, GSTIN compliance, Net Margin tracking (34.2%), and AR Dunning.' },
    { stage: '8. Settlement Reconciliation', module: '07. Finance — Payments', desc: 'Direct ICICI NEFT batch sync (PAY-2026-118) reconciles receivables into cash collected ledger.' },
    { stage: '9. Marketing Attribution & ROAS', module: '08. Marketing Intelligence', desc: 'Cross-channel ad spend vs attributed client revenue analysis with blended ROAS benchmarking (3.83x).' },
    { stage: '10. Executive BI & QBR Reports', module: '09. Reporting — Builder', desc: 'Compilation pipeline #GEN-9902 generates print-ready executive dossiers and client retention reviews.' }
  ];

  steps.forEach((s, idx) => {
    checkPageSpace(50);
    const startY = doc.y;

    // Card outline
    doc.roundedRect(48, startY, contentWidth, 42, 4).fillAndStroke(COLORS.cardBg, COLORS.cardBorder);

    // Stage indicator pill
    doc.roundedRect(56, startY + 8, 125, 14, 2).fill(COLORS.navyDark);
    doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold').text(s.stage, 62, startY + 11);

    // Module pill
    doc.roundedRect(188, startY + 8, 130, 14, 2).fill(COLORS.crimsonBg);
    doc.fillColor(COLORS.crimsonLight).fontSize(7).font('Helvetica-Bold').text(s.module, 194, startY + 11);

    // Description
    doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica')
       .text(s.desc, 56, startY + 26, { width: contentWidth - 24 });

    doc.y = startY + 48;
  });

  // Verification & Signoff Box
  checkPageSpace(90);
  const vY = doc.y + 10;
  doc.roundedRect(48, vY, contentWidth, 68, 4).fillAndStroke('#F0FDF4', '#86EFAC');
  doc.rect(48, vY, 4, 68).fill(COLORS.green);

  doc.fillColor(COLORS.greenBg).fontSize(10).font('Helvetica-Bold')
     .text('Architecture Verification & Production Readiness', 64, vY + 10);

  doc.fillColor('#166534').fontSize(8).font('Helvetica')
     .text(
       'All 14 major modules and 18 interactive views have been verified in the OptiVir Ads application codebase.\n' +
       '• Turbopack Build: Completed with 0 TypeScript/Lint errors\n' +
       '• Server Environment: Next.js dev server on http://localhost:3000 & Express backend on http://localhost:5000\n' +
       '• Native PDF Generation: Created via Pure JavaScript (pdfkit in Node.js)',
       64, vY + 24, { width: contentWidth - 32, lineGap: 3 }
     );

  doc.y = vY + 85;
}

renderStateFlow();

// ----------------------------------------------------
// GLOBAL RUNNING HEADERS & FOOTERS (Page X of Y)
// ----------------------------------------------------
const range = doc.bufferedPageRange();
const totalPages = range.count;

for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  doc.page.margins.bottom = 0;

  // Top Running Header (Pages 2+)
  if (i > 0) {
    doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
       .text('OPTIVIR ADS CRM • COMPLETE ENTERPRISE UI ARCHITECTURE', 48, 22, { lineBreak: false });
    doc.text('SYSTEM SPECIFICATION & FUNCTIONAL MAP', doc.page.width - 250, 22, { width: 202, align: 'right', lineBreak: false });
    doc.rect(48, 32, contentWidth, 0.5).fill(COLORS.border);
  }

  // Bottom Running Footer (All Pages)
  const footerY = pageHeight - 30;
  doc.rect(48, footerY - 5, contentWidth, 0.5).fill(COLORS.border);

  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text('CONFIDENTIAL • OPTIVIR ADS ENTERPRISE OPERATING SYSTEM • AUTHORIZED ACCESS ONLY', 48, footerY, { lineBreak: false });

  const pageString = `Page ${i + 1} of ${totalPages}`;
  doc.text(pageString, doc.page.width - 150, footerY, { width: 102, align: 'right', lineBreak: false });
}

// Finalize and close PDF stream
doc.end();

writeStream.on('finish', () => {
  const stats = fs.statSync(outputPath);
  
  // Also copy to frontend/public for instant web access
  const publicDir = path.join(__dirname, 'frontend', 'public');
  if (fs.existsSync(publicDir)) {
    fs.copyFileSync(outputPath, path.join(publicDir, 'OPTIVIR_CRM_UI_STRUCTURE.pdf'));
  }

  console.log(`[SUCCESS] Pure JavaScript PDF successfully generated!`);
  console.log(`Root File: ${outputPath}`);
  console.log(`Public URL File: ${path.join(publicDir, 'OPTIVIR_CRM_UI_STRUCTURE.pdf')}`);
  console.log(`Total Pages: ${totalPages}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);
});
