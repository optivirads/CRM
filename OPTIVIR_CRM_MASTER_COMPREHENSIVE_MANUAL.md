# OPTIVIR CRM — MASTER OPERATING MANUAL & ENTERPRISE EXECUTION GUIDE
## The Complete End-to-End Handbook: Systems, Modules, Client Intake & Operations
**Document Version:** Enterprise OS v4.8  
**Organization:** OptiVir Technologies Pvt. Ltd.  
**Service Classification:** Performance Marketing, Growth Engineering & Advertising Agency Operations  
**Tax & Compliance Standard:** CBIC GST Rule 46 • SAC Code 998361  
**Security & Architecture:** AES-256 Session Persistence • Multi-Tenant RBAC • First-Party Server CAPI  

---

## Executive Summary & System Blueprint

OptiVir CRM is an enterprise-grade Operating System engineered specifically for performance marketing agencies, media buying squads, growth consultants, and D2C/B2B delivery teams. It unifies the entire client lifecycle into an interconnected data model:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 01. INGESTION   │       │ 02. QUALIFY     │       │ 03. PIPELINE    │       │ 04. PROPOSAL    │
│ Web Form / Meta │ ────> │ BANT Scoring    │ ────> │ 5-Stage Kanban  │ ────> │ SOW Builder     │
│ Inbound Leads   │       │ Company + GSTIN │       │ Weighted Values │       │ SAC 998361 Code │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
                                                                                       │
                                                                                       ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 08. GOVERNANCE  │       │ 07. COMMERCE    │       │ 06. EXECUTION   │       │ 05. ONBOARDING  │
│ SHA-256 Vault   │ <──── │ 1-Click 18% GST │ <──── │ Tasks & Milestones│ <───│ 24-Step Engine  │
│ QBR Reports     │       │ Bank UTR Reconcile│     │ Live Stopwatch  │       │ Credential Vault│
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## Master Table of Contents

- **CHAPTER 1: System Architecture & Global Navigation**
  - 1.1 Global Application Shell & 70/30 Viewport Layout
  - 1.2 Global Omnisearch (`Ctrl + K`)
  - 1.3 Quick Action Command Menu (`+ New` / `+ Create`)
  - 1.4 Date Range & Multi-Period Time Filters
  - 1.5 Department & Pod Filtering (Revenue, Marketing, Engineering, Ops)
  - 1.6 Export Console & System PDF Generators
  - 1.7 Dark Studio / Light Navy Mode Switching
  - 1.8 Team Persona Simulator & Role-Based Access Testing
  - 1.9 Persistent 7-Day Sessions & Dynamic Real-Time Compliance
- **CHAPTER 2: The 5 Strategic Command Dashboards**
  - 2.1 Management Dashboard & The Operational Friction Bar
  - 2.2 Sales Dashboard, Pipeline Velocity & Weighted Forecasting
  - 2.3 Marketing Dashboard, Channel Attribution & Blended ROAS
  - 2.4 Finance Dashboard, Runway Multipliers & AR Aging
  - 2.5 My Workspace, Daily Desk & The Live Billable Stopwatch
- **CHAPTER 3: Sales Pipeline, Deals & Commercials**
  - 3.1 Leads Ingestion & BANT Scoring Matrix
  - 3.2 Converting Leads to Corporate Entities & Contacts
  - 3.3 Corporate Accounts Directory & 15-Digit GSTIN Validation
  - 3.4 Contacts Directory & Stakeholder Hierarchy
  - 3.5 Opportunities & Contract Negotiation
  - 3.6 Drag-and-Drop Pipeline Kanban & SLA Stage Timers
  - 3.7 Commercial Proposals, SOW Scopes & SAC 998361 Inclusions
- **CHAPTER 4: Client Onboarding Cockpit (5 Phases • 24 Milestones)**
  - 4.1 Why Onboarding is Separated from Active Clients (The Staging Gate)
  - 4.2 Tab 1: Sales Handoff & Contract Verification
  - 4.3 Tab 2: Assets & Delegated Credentials Matrix
  - 4.4 Tab 3: Strategy, Scaling Channels & North Star KPIs
  - 4.5 Tab 4: Blocker Logging, Severity Levels & Risk Resolution
  - 4.6 Tab 5: The 24-Step Milestone Checklist & Phase Transitions
  - 4.7 Launching to Live Delivery (1-Click Graduation)
- **CHAPTER 5: Client Intake Checklist & Credential Requirements**
  - 5.1 Section A: Commercial & Legal Entity Information
  - 5.2 Section B: Platform Delegation (No Passwords Required)
  - 5.3 Section C: Brand Identity, Creative Vault & Strategy Briefs
  - 5.4 How to Enter Credentials Manually & Generate Handover PDFs
- **CHAPTER 6: Active Clients & Client 360° Living Dossier**
  - 6.1 Active Retainers Directory & Health Telemetry Scores
  - 6.2 Client 360° Master Binder Navigation (8 Sub-Modules)
  - 6.3 Credential Vault (Encrypted Safe Locker)
  - 6.4 Social Media Sync & Multi-Platform Publishing
- **CHAPTER 7: Operations, Delivery Pods & Project Management**
  - 7.1 Pod Delivery Workspaces (Media Buying, Creative, Dev, Ops)
  - 7.2 Projects & High-Level Milestones
  - 7.3 Tasks, Priorities (P1–P4) & Subtask Checklists
  - 7.4 Live Billable Stopwatch (Profit Guard & Margin Tracking)
- **CHAPTER 8: Performance Marketing, Tracking & Ad Network Telemetry**
  - 8.1 Meta Graph API Integration & Daily Ad Spend Pacing
  - 8.2 Google Ads MCC Telemetry & Keyword Conversion Tracking
  - 8.3 Server-Side Conversions API (CAPI) & DNS CNAME Cloud Run
  - 8.4 Cross-Channel Attribution Matrix & ROAS Optimization
- **CHAPTER 9: Finance, Billing & SAC 998361 GST Invoicing**
  - 9.1 SAC Code 998361 Standard for Indian Agencies
  - 9.2 Intra-State vs Inter-State Tax Calculations (CGST/SGST vs IGST)
  - 9.3 Generating CBIC GST Rule 46 Compliant Invoices
  - 9.4 Payment Gateways (Razorpay / Paytm) & Instant Payment Links
  - 9.5 Bank Wire Reconciliation (Recording UTR Numbers)
- **CHAPTER 10: Governance, Documents, Reports & Troubleshooting**
  - 10.1 Unified 4-Color Operational Calendar
  - 10.2 Document Vault & SHA-256 Tamper-Proof Storage
  - 10.3 Executive QBR Reports & Client Performance Dossiers
  - 10.4 Notifications Hub & Alert Routing
  - 10.5 Security, RBAC Matrix & Session Persistence
  - 10.6 End-to-End 30-Day Walkthrough: From Inbound Inquiry to Paid Invoice
  - 10.7 Operational Troubleshooting & FAQ

---

# CHAPTER 1: System Architecture & Global Navigation

### 1.1 Global Application Shell & 70/30 Viewport Layout
OptiVir CRM is constructed around an executive 70/30 viewport architecture designed to maximize operational focus:
- **Left 256px Navigation Sidebar:** Houses categorical access to all modules grouped into Command, Revenue, Operations, Finance, and System.
- **Top 64px Fixed Command Bar:** Contains universal omni-tools accessible on every single screen without losing context.
- **Center 70% Primary Focus Canvas:** High-density operational workspace for Kanban boards, data tables, SOW builders, and onboarding suites.
- **Right 30% Telemetry & Context Dock:** Displays the live billable stopwatch, today's immediate checklist deliverables, and active pod communication feeds.

### 1.2 Global Omnisearch (`Ctrl + K`)
- **Purpose:** A blazing-fast indexer that searches clients, invoices, pipeline deals, phone numbers, and tasks in under 0.2 seconds.
- **Step-by-Step Usage:**
  1. Press `Ctrl + K` (Windows) or `Cmd + K` (macOS) from any screen, or click the search box in the center of the top bar.
  2. Type any 2 or 3 characters (e.g., `Hay` for *Hayras*, `INV-` for *Invoice*, or `9820` for a phone number).
  3. Results appear instantly categorized under Clients, Deals, Invoices, or Contacts.
  4. Use arrow keys to select and press `Enter` to jump immediately to that record. Press `Esc` to close.

### 1.3 Quick Action Command Menu (`+ New` / `+ Create`)
- **Purpose:** Enables team members to ingest leads, create opportunities, or issue invoices on the fly without navigating away from active work.
- **Step-by-Step Usage:**
  1. Click the red **+ New** button located in the top navigation bar.
  2. Select **Create Lead**, **Create Opportunity**, or **Generate Invoice** from the dropdown.
  3. Complete the focused modal form and click **Save**. The modal closes and saves in the background while keeping your current screen state untouched.

### 1.4 Date Range & Multi-Period Time Filters
- **Purpose:** Governs all analytical data, revenue totals, ad spend velocity, and billable hours across the entire platform.
- **Step-by-Step Usage:**
  1. Click the **Calendar** icon on the top action bar.
  2. Select from pre-configured periods: *This Month*, *Previous Month*, *Q4 FY2026*, *Year to Date*, or *Custom Range*.
  3. Every telemetry widget, chart, and KPI metric recalculates instantly.

### 1.5 Department & Pod Filtering
- **Purpose:** Allows department heads to view agency data filtered by functional team.
- **Step-by-Step Usage:**
  1. Click the **All Teams** dropdown next to the Date filter.
  2. Choose *Revenue Team* (Sales/Deals), *Marketing Team* (Media Buying/ROAS), *Engineering Team* (CAPI/Shopify/Tracking), or *Operations Team* (Billing/Legal).

### 1.6 Export Console & System PDF Generators
- **Purpose:** Generates executive vector PDF documents directly from the CRM with zero client-side rendering bugs.
- **Step-by-Step Usage:**
  1. Click the **Export** button in the header.
  2. Select **Download Master Operating Manual** or **Download System Architecture**.
  3. A native, multi-page vector PDF is compiled and downloaded to your local drive.

### 1.7 Dark Studio / Light Navy Mode Switching
- **Purpose:** Reduces eye fatigue during long media buying shifts and adapts to ambient lighting conditions.
- **Step-by-Step Usage:**
  1. Click the **Sun / Moon** icon on the top command bar.
  2. The interface instantly toggles between **Executive Dark Navy (`#0A121F`)** and **Clean Studio Light (`#FFFFFF`)**. Preferences are saved in your user profile.

### 1.8 Team Persona Simulator & Role-Based Access Testing
- **Purpose:** Allows executives and admins to simulate the exact permissions, views, and dashboards of different team members.
- **Available Personas:**
  - *Marcus Vance (Operations Lead / Super Admin):* Full visibility across profit margins, bank collections, and agency health.
  - *Alex Morgan (Sales Director):* Quotas, pipeline velocity, commercial proposals, and deal forecasting.
  - *Rahul Menon (Delivery Lead):* Sprint backlogs, overdue deliverables, developer milestones, and timesheet logs.
  - *Maya Joseph (Media Buyer):* Ad accounts, creative video hooks, ROAS telemetry, and spend pacing.
- **Step-by-Step Usage:** Click the user avatar pill in the top right header, choose any persona from the menu, and inspect how the view updates to match that role's security clearance.

### 1.9 Persistent 7-Day Sessions & Real-Time Compliance
- **Session Architecture:** Employs AES-256 encrypted JWT tokens with a 7-day sliding window expiration stored in secure HTTP-only cookies and synchronized localStorage. The token automatically refreshes during active usage to eliminate unexpected mid-work logouts.
- **Dynamic Real-Time Year:** The application dynamically computes the current legal and tax year (`new Date().getFullYear()`) across all footers, MSA contracts, and GST tax invoices.

---

# CHAPTER 2: The 5 Strategic Command Dashboards

OptiVir CRM features 5 purpose-built dashboards toggled via the perspective bar:

### 2.1 Management Dashboard & The Operational Friction Bar
- **Target Audience:** Founders, CEOs, Managing Directors, and Operations Leads.
- **Core Widgets:**
  - *Gross Revenue (YTD):* Cumulative billed revenue across all clients.
  - *Active Retainer Accounts:* Count of currently paying accounts on active retainer contracts.
  - *Pipeline Lead Volume:* Inbound inquiries captured in the current monthly cycle.
  - *Deal Win Velocity:* Average turnaround duration in days from lead creation to contract signature.
- **The Operational Friction Bar (Agency Smoke Detector):**
  - Positioned prominently across the top of the dashboard.
  - Displays **GREEN** when all client deliverables, invoices, and SLA timers are on track.
  - Shifts to **RED / AMBER** when operational friction is detected:
    - *Overdue Tasks Pill:* Highlights tasks that missed their SLA deadline. Clicking opens the filtered task list.
    - *Unpaid GST Invoices Pill:* Highlights invoices past payment terms (Net 15/30). Clicking triggers 1-click WhatsApp/Email reminders.
    - *Stale Leads Pill:* Identifies inquiries uncontacted for more than 24 hours.

### 2.2 Sales Dashboard, Pipeline Velocity & Weighted Forecasting
- **Target Audience:** Sales Directors, Growth Consultants, and Account Executives.
- **Core Widgets:**
  - *Active Pipeline Value:* Total contract value of all deals across Discovery, Audit, Proposal, and Negotiation.
  - *Weighted Revenue Forecast:* Calculated as:
    $$\text{Weighted Forecast} = \sum (\text{Deal Value} \times \text{Stage Probability})$$
    *(e.g., A ₹5,00,000 deal at Proposal Sent [60%] yields ₹3,00,000 in expected revenue).*
  - *Commercial Win Rate:* Percentage of closed opportunities marked Won.
  - *Stage Breakdown Funnel:* Live count and value of deals in each sales stage with SLA warning indicators.

### 2.3 Marketing Dashboard, Channel Attribution & Blended ROAS
- **Target Audience:** Media Buyers, Ad Ops Leads, and Fractional CMOs.
- **Core Widgets:**
  - *Total Ad Spend:* Aggregated spend across Meta Ads, Google Ads, and TikTok Ads.
  - *Attributed Sales Revenue:* Verified e-commerce and lead revenue tracked by server-side CAPI.
  - *Blended ROAS Multiplier:* Computed as:
    $$\text{Blended ROAS} = \frac{\text{Attributed Revenue}}{\text{Total Ad Spend}}$$
  - *Average Cost Per Lead (CPL) / Cost Per Acquisition (CPA):* Real-time acquisition cost per customer.
  - *Channel Performance Matrix:* Comparative breakdown comparing Meta ROAS vs. Google Ads ROAS vs. TikTok ROAS to guide budget reallocation.

### 2.4 Finance Dashboard, Runway Multipliers & AR Aging
- **Target Audience:** CFOs, Finance Managers, and Chartered Accountants.
- **Core Widgets:**
  - *Net Monthly Collections:* Actual cash collected and reconciled in bank accounts this billing period.
  - *Accounts Receivable (AR) Overdue:* Unpaid invoices past due date.
  - *Agency Operating Runway:* Live calculation of how many months the agency can operate on current cash reserves:
    $$\text{Operating Runway (Months)} = \frac{\text{Current Bank Cash Balance}}{\text{Monthly Operational Expenses (Payroll + Tools + Rent)}}$$
  - *AR Aging Buckets:* Visual breakdown of invoices under Current (<30 days), 31–60 days, 61–90 days, and 90+ days Critical.

### 2.5 My Workspace, Daily Desk & The Live Billable Stopwatch
- **Target Audience:** Every agency team member (daily individual cockpit).
- **Core Features:**
  - *My Day Schedule:* Calendar list of today's client review calls, pod standups, and campaign launches.
  - *My Deliverables Checklist:* Immediate to-do list for today. Checking items off syncs with project management.
  - *The Live Billable Stopwatch:* Built-in time tracker to ensure client work is properly logged and billable margins are defended.

---

# CHAPTER 3: Sales Pipeline, Deals & Commercials

### 3.1 Leads Ingestion & BANT Scoring Matrix
- **Ingestion Channels:** Leads flow in via Webhook from website forms, Meta Lead Generation ads, Google Ads extensions, or manual operator entry.
- **Step-by-Step Lead Creation:**
  1. Navigate to **Leads** in the sidebar and click **+ Add Lead**.
  2. Enter Lead Full Name, Company Name, Official Work Email, and Phone Number.
  3. Select **Lead Source** (*Meta Ads, Google Search, LinkedIn B2B, Referral*).
  4. Enter **Estimated Monthly Budget** (e.g., `₹2,50,000 / month`).
  5. Enter BANT Qualification parameters (Budget, Authority, Need, Timeline).
  6. Click **Save Lead**.

### 3.2 Converting Leads to Corporate Entities & Contacts
- **Automatic Conversion Flow:**
  1. Open any qualified lead from the Leads directory.
  2. Click the green **Convert to Deal** button.
  3. The system automatically performs 3 actions simultaneously:
     - Creates an official **Company Record** in the business directory.
     - Creates a **Primary Contact** card under that company.
     - Spawns a new **Opportunity Card** in the *Discovery* stage of your visual Sales Pipeline.

### 3.3 Corporate Accounts Directory & 15-Digit GSTIN Validation
- **CBIC GST Rule Standard:** In India, business entities must provide a 15-character Goods and Services Tax Identification Number (GSTIN) structured as:
  `[2-digit State Code] + [10-digit PAN] + [1-digit Entity Number] + [Z] + [1-digit Checksum]`
- The CRM automatically verifies the GSTIN format, extracts the registered state, and pre-configures tax rules (Intra-state vs Inter-state) for invoicing.

### 3.4 Contacts Directory & Stakeholder Hierarchy
- Profiles all key client personnel with their designated organizational roles:
  - *Primary Decision Maker (POC / Managing Director / CMO)*
  - *Accounts & Billing POC (Finance Manager)*
  - *Technical & E-Commerce Lead (Shopify / Web Developer)*
  - *Creative & Content Lead (Brand Manager)*

### 3.5 Opportunities & Contract Negotiation
- Tracks commercial deal negotiations with custom deal names, anticipated monthly retainers, commission percentages on ad spend, and expected close dates.

### 3.6 Drag-and-Drop Pipeline Kanban & SLA Stage Timers
- **The 5 Weighted Pipeline Stages:**
  1. *Stage 1: Discovery & Needs Analysis (20% Probability • 3-Day SLA)*
  2. *Stage 2: Performance & Pixel Audit (40% Probability • 5-Day SLA)*
  3. *Stage 3: Commercial Proposal Sent (60% Probability • 4-Day SLA)*
  4. *Stage 4: Legal Review & SOW Negotiation (80% Probability • 7-Day SLA)*
  5. *Stage 5: CLOSED WON (100% Probability • Triggers Auto-Onboarding)*
- **Moving Deals:** Click and drag any card to advance its stage. Dragging a card to **Closed Won** marks the sale complete and automatically routes the client to the **Client Onboarding Cockpit**.

### 3.7 Commercial Proposals, SOW Scopes & SAC 998361 Inclusions
- **Service Models Supported:**
  - *Fixed Monthly Performance Retainer:* Flat monthly fee for campaign management.
  - *Performance Hybrid (% of Ad Spend / ROAS Bonus):* Base fee + agreed % of profitable ad spend.
  - *Milestone Sprint Package:* One-time setup fee for creative production, CAPI tracking, or funnel redesign.
- **Proposal Generation:** Includes itemized deliverables under Indian SAC Code 998361, standard payment terms (e.g., Net 15), validity period, and exports to client-ready vector PDF.

---

# CHAPTER 4: Client Onboarding Cockpit (5 Phases • 24 Milestones)

### 4.1 Why Onboarding is Separated from Active Clients (The Staging Gate)
In an enterprise agency, an account that has just signed a contract is **NOT** ready for live ad operations. Launching ad spend without verified billing, pixel CAPI tracking, brand assets, or signed legal terms leads to wasted spend and account bans.
- **The Staging Suite:** New clients enter the **Client Onboarding Cockpit** in *Onboarding* status.
- **The Delivery Suite:** Only after technical milestones are completed and verified does the account transition into the active **Clients Directory** and **Client 360°**.

### 4.2 Tab 1: Sales Handoff & Contract Verification
- **Purpose:** Verifies that commercial terms promised during the sales cycle match delivery capacity.
- **Checkpoints:** Signed SOW contract reference, contracted Monthly Retainer (e.g. ₹1,50,000), advance retainer deposit reconciliation, and assigned Account Manager (AM).

### 4.3 Tab 2: Assets & Delegated Credentials Matrix
- **Audited Platforms:**
  - *Meta Business Manager:* Partner Business ID linkage.
  - *Google Ads Manager (MCC):* 10-digit Customer ID linkage.
  - *Shopify Admin:* Collaborator code and checkout script access.
  - *Google Analytics 4 & GTM:* Container administrative access.
  - *Server CAPI / DNS:* Cloudflare / Domain CNAME delegation.
- **Operator Actions:**
  - Click **+ Add Credential Manually** to record custom platform logins.
  - Click **Generate Access PDF** to export an official handover document for the client.
  - Click **Mark Granted ✓** once our technical leads confirm active access.

### 4.4 Tab 3: Strategy, Scaling Channels & North Star KPIs
- **Locking Growth Benchmarks:**
  - *Target Blended ROAS:* (e.g., `4.5x`).
  - *Maximum Allowable CAC Ceiling:* (e.g., `₹1,850`).
  - *Monthly Ad Spend Budget:* (e.g., `₹10,00,000`).
  - *Primary Scaling Channels:* Checkboxes for Meta Ads, Google Shopping, Performance Max, Instagram Reels.
  - *Audience ICP Brief:* Target demographic, pain points, and hooks.
- Click **Save Strategy & KPIs** to commit these targets into the client's telemetry trackers.

### 4.5 Tab 4: Blocker Logging, Severity Levels & Risk Resolution
- **Why Blockers Exist:** If a client delays DNS verification, has an ad account payment failure, or has not sent product b-roll, it halts the launch date.
- **Logging a Blocker:**
  1. Click **+ Log New Blocker**.
  2. Enter Blocker Title (e.g., *Shopify Collaborator Code Invalid*).
  3. Select Severity Level:
     - 🔴 **Critical:** Blocks all campaign launches.
     - 🟡 **High:** Delays creative sprint.
     - 🔵 **Medium / Low:** Minor administrative delay.
  4. Assign an Owner (e.g., *Alex Morgan*).
  5. Click **Add Blocker**.
- **Resolving Blockers:** Once fixed, click **Mark Resolved ✓**. The blocker archives with an immutable resolution timestamp.

### 4.6 Tab 5: The 24-Step Milestone Checklist & Phase Transitions
The 24 milestones are structured across 5 sequential phases:

```
[Phase 1: Sales Intake] → [Phase 2: Platform Access] → [Phase 3: Strategy & CAPI] → [Phase 4: Kickoff Call] → [Phase 5: Live Launch]
```

#### Phase 1: Commercial & Sales Intake (Steps 1–5)
1. *Countersigned MSA & SOW:* Executed by both agency director and client signatory.
2. *Advance Retainer Deposit:* Payment confirmed in agency bank account.
3. *Client Portal Provisioning:* Organization created, currency locked to INR, timezone to IST.
4. *Delivery Pod Allocation:* Dedicated Account Manager and Media Buyer assigned.
5. *VIP Communications Channel:* Dedicated Slack Connect or WhatsApp VIP group activated.

#### Phase 2: Platform Delegation & Access (Steps 6–10)
6. *Meta Business Manager Link:* Partner ID request accepted; Ad Account and Page assigned.
7. *Google Ads MCC & GA4:* Manager link confirmed; GA4 measurement ID connected.
8. *Shopify Collaborator Access:* Theme, app, and script tag permissions granted.
9. *GTM Container Deployment:* Web container published on client storefront.
10. *Brand Asset Ingestion:* Vector logos, typography fonts, and packaging files received.

#### Phase 3: Technical Architecture & CAPI (Steps 11–15)
11. *Server CAPI Cloud Run Deployment:* First-party server tracking container spun up.
12. *DNS CNAME & SSL Validation:* `capi.brand.com` points to agency tracking container with valid SSL.
13. *Historic Ad Account Audit:* Past 90 days of ad spend, winning creatives, and wasted spend audited.
14. *North Star ROAS & CAC Lock:* Target ROAS threshold and CAC cap signed off.
15. *Creative Angle Matrix Approved:* Sprint of 12 direct-response video hooks finalized.

#### Phase 4: Alignment & Executive Kickoff (Steps 16–20)
16. *Executive Kickoff Conference:* Video kickoff call held with client leadership.
17. *Weekly Sprint Cadence Lock:* Recurring weekly performance call scheduled.
18. *CAPI Conversion Event Testing:* Simulated Purchase events verified with 9.0+ Match Quality score.
19. *Ad Copy & Creative Batch Submitted:* Initial campaign ad sets submitted for client sign-off.
20. *Commercial SOW & SAC 998361 Verified:* Scope and tax compliance terms reconfirmed.

#### Phase 5: Live Operational Launch (Steps 21–24)
21. *Live Campaign Activation:* Campaigns published live to Meta Graph API and Google Ads.
22. *Real-Time Telemetry Sync:* Ad spend and revenue streaming to Executive Dashboard.
23. *48-Hour Spend Velocity Audit:* Initial CPM, CTR, and bid cap stability verified.
24. *Transition to Continuous Delivery:* Formal onboarding sign-off completed.

### 4.7 Launching to Live Delivery (1-Click Graduation)
Once milestones are verified, click the green **Launch to Live Delivery** button at the top of the Onboarding Cockpit. The account status shifts from *Onboarding* to **Active**, and the client automatically appears in the main **Clients Directory** and **Client 360°**.

---

# CHAPTER 5: Client Intake Checklist & Credential Requirements

When onboarding a new performance marketing or growth client, send the following intake checklist to gather all necessary legal, financial, and platform assets:

```text
================================================================================
           OPTIVIR CRM — CLIENT ONBOARDING INTAKE CHECKLIST
================================================================================
```

### 5.1 Section A: Commercial & Legal Entity Information
- [ ] **Legal Business Name:** Full registered company name (e.g., *Hayras Coconut Oil Pvt. Ltd.*)
- [ ] **Registered Office Address:** Complete street address, city, state, and PIN code.
- [ ] **Corporate GSTIN Number (15-digit):** Required for tax invoicing and CGST/SGST/IGST breakdown.
- [ ] **Company PAN:** Permanent Account Number of the corporate entity.
- [ ] **Billing Contact Person:** Name, designation, work email, and direct phone number of accounts lead.
- [ ] **Primary Decision Maker (POC):** Managing Director / CMO name, direct dial, and email.

### 5.2 Section B: Platform Delegation (No Passwords Required)
- [ ] **Meta Business Manager (Partner ID):**
  - Client provides their 15/16-digit Meta Business Manager ID.
  - Agency dispatches a Partnership Request to access:
    - *Facebook Page (Admin / Content Creator)*
    - *Instagram Account (Linked Asset)*
    - *Ad Account (Manage Campaigns)*
    - *Pixel / CAPI Datasets (Manage Events & Diagnostics)*
    - *Product Catalog (Manage Inventory Feed)*
- [ ] **Google Ads Manager (MCC 10-digit CID):**
  - Client provides their 10-digit Google Ads Customer ID (`xxx-xxx-xxxx`).
  - Agency sends Manager Account Link Request from OptiVir MCC.
- [ ] **Google Analytics 4 (GA4) & Google Tag Manager (GTM):**
  - Client grants *Administrator / Editor* permissions to `agency@optivirads.com` for GTM Web Container and GA4 Property.
- [ ] **Shopify / E-Commerce Storefront:**
  - Client provides Shopify Store URL (e.g., `brandname.myshopify.com`) and 4-digit **Collaborator Request Code**.
  - Permissions required: *Themes, Apps, Analytics, Script Tags, and Products*.
- [ ] **DNS Access for Server-Side CAPI:**
  - Access to Cloudflare, GoDaddy, or Namecheap to add a CNAME record for first-party tracking (e.g., `capi.clientbrand.com -> cdn.optivirads.com`).

### 5.3 Section C: Brand Identity, Creative Vault & Strategy Briefs
- [ ] **Brand Identity Guidelines:** Brand book, typography font files (.otf/.ttf), color palette (HEX codes).
- [ ] **Vector Logos:** High-resolution SVG, PNG, and transparent EPS logo variations.
- [ ] **Raw B-Roll Video Vault:** Google Drive / Dropbox link with unedited product video shoots, packaging videos, and lifestyle footage.
- [ ] **Customer Reviews & UGC:** Customer testimonials, influencer video reviews, and press mentions.
- [ ] **Competitor Benchmarks & Value Propositions:** Top 3 direct competitors and core unique selling propositions (USPs).

### 5.4 How to Enter Credentials Manually & Generate Handover PDFs
1. Navigate to **Onboarding > Tab 2 (Assets & Credentials)**.
2. Click **+ Add Credential Manually** to log non-standard accounts (e.g., Klaviyo, Amazon Brand Registry, WhatsApp API).
3. Click **Generate Access PDF** to export an official handover document to send to the client.
4. Click **Mark Granted ✓** as access is confirmed.

---

# CHAPTER 6: Active Clients & Client 360° Living Dossier

### 6.1 Active Retainers Directory & Health Telemetry Scores
- **Location:** Left Sidebar > Click **Clients**.
- **Client Health Scoring:**
  - 🟢 **Healthy (80–100%):** ROAS exceeding target, zero overdue tasks, invoices settled within terms.
  - 🟡 **Attention Needed (50–79%):** ROAS near break-even, upcoming milestone due within 48 hours.
  - 🔴 **At Risk / Churn Risk (<50%):** Negative ad return, payment overdue by 15+ days, unresolved critical blocker.

### 6.2 Client 360° Master Binder Navigation (8 Sub-Modules)
Opening any active client launches the **Client 360° Dossier** featuring 8 specialized workspaces:
1. **Overview & Commercial Retainer:** Contracted ACV, Monthly Retainer fee, assigned Account Manager, and renewal countdown.
2. **Campaign Telemetry:** Live streaming ad spend, CPC, CPM, CTR, and Blended ROAS graphs.
3. **Projects & Milestones:** Active campaign sprints and creative batch schedules.
4. **Timesheet Summary:** Cumulative billable hours logged by agency media buyers and designers.
5. **Invoices & Billing Ledger:** Complete history of tax invoices, payment statuses, and balance statements.
6. **Credential Vault:** Encrypted repository for account IDs, access tokens, and API credentials.
7. **Document Vault:** Download countersigned MSAs, brand assets, and SOW specifications.
8. **Immutable Activity Log:** Timestamped audit trail of all team interactions, emails, calls, and status changes.

### 6.3 Credential Vault (Encrypted Safe Locker)
- Stores sensitive client credentials encrypted with AES-256 standards.
- Operators can copy access tokens and IDs without exposing clear-text passwords.

### 6.4 Social Media Sync & Multi-Platform Publishing
- Connects directly to the Meta Graph API to schedule and publish organic posts across linked Facebook Pages and Instagram Business accounts.

---

# CHAPTER 7: Operations, Delivery Pods & Project Management

### 7.1 Pod Delivery Workspaces
OptiVir CRM organizes delivery operations into functional pods:
- *Performance Growth Pod:* Media buyers optimizing Meta and Google campaigns.
- *Creative Studio Pod:* Video editors and copywriters producing video hooks and static ads.
- *Technical Tracking Pod:* Developers managing Shopify themes, GTM containers, and Server CAPI.
- *Finance & Operations Pod:* Account managers handling client communications and invoicing.

### 7.2 Projects & High-Level Milestones
- Projects organize client deliverables into structured timeframes (e.g., *Q4 Festive Scaling Sprint*).
- Milestones establish hard delivery deadlines (e.g., *16 Video Creatives Approved*, *Live Campaign Launch*).

### 7.3 Tasks, Priorities (P1–P4) & Subtask Checklists
- Tasks represent atomic deliverables assigned to individual pod members.
- **Priority Levels:**
  - 🔴 **P1 Urgent:** Critical blocker or campaign paused. Immediate turnaround required.
  - 🟡 **P2 High:** Due within 24 to 48 hours.
  - 🔵 **P3 Normal:** Standard sprint deliverable.
  - ⚪ **P4 Low:** Nice-to-have optimization.
- Each task includes an estimated hour allotment, subtask checklist, and real-time activity log.

### 7.4 Live Billable Stopwatch (Profit Guard & Margin Tracking)
- **Why it Matters:** Prevents scope creep and ensures client retainers remain highly profitable.
- **How to Use:**
  1. Look at the top navigation bar or open **My Workspace**.
  2. Click **Start Focus** (Play icon) when beginning work on a client task.
  3. Click **Pause** for interruptions or meetings.
  4. When finished, click **Stop & Log**.
  5. Confirm elapsed hours and add a brief work summary. The hours are permanently logged against the client's monthly billing timesheet.

---

# CHAPTER 8: Performance Marketing, Tracking & Ad Network Telemetry

### 8.1 Meta Graph API Integration & Daily Ad Spend Pacing
- **API Version:** Meta Graph API v20.0
- Connects to client ad accounts to synchronize spend, impressions, reach, frequency, CPC, CTR, and purchase ROAS every 6 hours.
- Pacing monitors ensure daily ad spend neither under-spends nor exhausts client monthly budgets prematurely.

### 8.2 Google Ads MCC Telemetry & Keyword Conversion Tracking
- **API Version:** Google Ads API v17
- Monitors Search, Performance Max, and Shopping campaigns across client CIDs with automated conversion value tracking.

### 8.3 Server-Side Conversions API (CAPI) & DNS CNAME Cloud Run
- **Why CAPI is Mandatory:** Traditional browser tracking pixels lose 20–40% of conversion data due to Apple iOS 14.5+ ATT privacy policies, Safari ITP cookie deletion, and ad-blockers.
- **OptiVir CAPI Architecture:**
  - A dedicated Node.js server container runs on Google Cloud Run.
  - Client adds a DNS CNAME record: `capi.clientdomain.com -> cdn.optivirads.com`.
  - First-party cookies (`fbp`, `fbc`) are written directly from the client's domain.
  - Conversion events (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase) fire directly from the server to Meta's Graph API.
  - Generates an Event Match Quality (EMQ) score of **9.0+/10**, ensuring maximum algorithmic ad targeting accuracy.

### 8.4 Cross-Channel Attribution Matrix & ROAS Optimization
- Consolidates spend and sales across Meta, Google, and direct e-commerce channels into a unified attribution matrix to calculate true Blended ROAS and customer acquisition economics.

---

# CHAPTER 9: Finance, Billing & SAC 998361 GST Invoicing

### 9.1 SAC Code 998361 Standard for Indian Agencies
All performance marketing, ad campaign management, creative production, and digital growth services rendered by OptiVir Technologies fall under **SAC 998361** (*Advertising services and related performance services*).

### 9.2 Intra-State vs Inter-State Tax Calculations
The CRM automatically inspects the client's registered GSTIN number and applies the correct tax formula:
- **Intra-State Supply (e.g., Agency in Maharashtra, Client in Maharashtra):**
  $$\text{Central GST (CGST @ 9\%)} = \text{Taxable Value} \times 0.09$$
  $$\text{State GST (SGST @ 9\%)} = \text{Taxable Value} \times 0.09$$
  $$\text{Total GST} = 18\%$$
- **Inter-State Supply (e.g., Agency in Maharashtra, Client in Delhi / Karnataka / Gujarat):**
  $$\text{Integrated GST (IGST @ 18\%)} = \text{Taxable Value} \times 0.18$$

### 9.3 Generating CBIC GST Rule 46 Compliant Invoices
1. Navigate to **Finance > Invoices** and click **+ Create Invoice**.
2. Select Client Entity (*Apex Apparel Pvt. Ltd.*).
3. Select Billing Model (*Monthly Retainer*, *Ad Spend Commission*, or *Milestone Sprint*).
4. System automatically populates SAC Code `998361`, itemized description, and calculates CGST/SGST or IGST.
5. Click **Save & Issue Invoice**.
6. Click **View Invoice** to inspect the official A4 invoice showing agency letterhead, client GSTIN, bank wire details (IFSC, Account Number), and UPI QR code. Click **Download PDF** to export.

### 9.4 Payment Gateways & Instant Payment Links
- Integrates with Razorpay, Paytm PG, and Stripe to generate 1-click payment links supporting UPI Intent (Google Pay, PhonePe, Paytm), Netbanking, and Corporate Credit Cards.
- Webhook endpoints listen for payment completion and instantly flag invoices from `UNPAID` to `PAID`.

### 9.5 Bank Wire Reconciliation (Recording UTR Numbers)
1. When a client transfers funds via NEFT, RTGS, or IMPS, open **Finance > Invoices**.
2. Find the invoice and click **Record Payment**.
3. Select payment mode (*Bank Wire / NEFT / RTGS*).
4. Type the bank transaction reference number (e.g., `UTR9823411209`).
5. Enter amount received and settlement date.
6. Click **Confirm Settlement**. The invoice turns **GREEN ("PAID")**, and agency cashflow reconciles automatically.

---

# CHAPTER 10: Governance, Documents, Reports & Troubleshooting

### 10.1 Unified 4-Color Operational Calendar
- Consolidates all agency events into a 4-color visual calendar:
  - 🔵 **Blue:** Client presentation and strategy review calls.
  - 🔴 **Red:** Project deliverables and creative deadlines.
  - 🟢 **Green:** Invoice due dates and billing milestones.
  - 🟡 **Yellow:** Contract renewals and SLA expirations.

### 10.2 Document Vault & SHA-256 Tamper-Proof Storage
- Upload and organize Master Services Agreements (MSA), Statements of Work (SOW), NDAs, and Brand Kits.
- Each document is hashed with a SHA-256 cryptographic verification checksum to guarantee legal integrity and tamper prevention.

### 10.3 Executive QBR Reports & Client Performance Dossiers
- 1-click compilation of Quarterly Business Review (QBR) reports detailing ad spend velocity, blended ROAS, video creative performance, completed sprint deliverables, and next-quarter growth projections.

### 10.4 Notifications Hub & Alert Routing
- Real-time notification center delivering instant alerts for deal closures, invoice payments, SLA escalations, and blocker resolutions.

### 10.5 Security, RBAC Matrix & Session Persistence

| Workspace / Module | Super Admin (Owner) | Growth Lead (Sales) | Media Buyer (Ad Ops) | Finance Lead |
| :--- | :---: | :---: | :---: | :---: |
| **Executive Dashboard** | Full Access | Full Access | Full Access | Full Access |
| **Leads & Pipelines** | Full Access | Full Access (Create/Edit) | View Only | View Only |
| **Client 360° Dossier** | Full Access | Full Access | Full Access | Full Access |
| **Onboarding Cockpit** | Full Access | Full Access | Full Access | View Only |
| **Ad Telemetry & Campaigns** | Full Access | View Only | Full Access (Edit) | View Only |
| **Finance, Invoices & Tax** | Full Access | View Only | No Access | Full Access (Create/Edit) |
| **Agency Settings & Vault** | Full Access | No Access | No Access | No Access |

### 10.6 End-to-End 30-Day Walkthrough: From Inbound Inquiry to Paid Invoice
1. **Day 1 (Inbound Lead):** Inquiry arrives via Meta Lead Ad. Sales rep qualifies lead in Leads module (Budget: ₹2.5L, ROAS Target: 4.5x).
2. **Day 3 (Discovery & SOW):** Rep converts lead to Opportunity. Pipeline card created. Commercial proposal with SAC 998361 generated.
3. **Day 7 (Closed Won):** Client signs SOW. Rep drags card to Closed Won. The 24-step Onboarding Cockpit launches automatically.
4. **Day 8–10 (Onboarding Execution):**
   - Phase 1: AM allocated, Slack Connect VIP channel established.
   - Phase 2: Meta BM Partner ID linked; Shopify collaborator access verified.
   - Phase 3: Server CAPI Cloud Run deployed; DNS CNAME verified.
   - Phase 4: Executive kickoff held; creative sprint approved.
   - Phase 5: Rep clicks "Launch to Live Delivery" to graduate the client into active delivery.
5. **Day 12–26 (Execution with Live Stopwatch):** Media buyer and video editors log billable hours against campaign sprint tasks.
6. **Day 28 (Performance Telemetry):** Attributed revenue hits ₹12,85,000 against ₹2,50,000 ad spend (5.14x Blended ROAS).
7. **Day 30 (GST Invoicing & Settlement):** Finance issues 18% GST invoice under SAC 998361. Client pays via bank wire. Finance records UTR number. Account fully reconciled.

### 10.7 Operational Troubleshooting & FAQ

#### Q1: Why does a new client appear in Onboarding but NOT in the main Clients Directory?
> **Answer:** This is by design! In OptiVir CRM, all newly signed accounts must pass through the **5-Phase Onboarding Cockpit** to ensure technical tracking, CAPI, platform delegation, and commercial deposits are verified. Once all milestones are audited, click **Launch to Live Delivery** at the top of the onboarding suite. The account will immediately appear in the active Clients Directory and Client 360°.

#### Q2: What should I do if the Operational Friction Bar turns Red?
> **Answer:** Click directly on the highlighted friction pill (e.g., *Overdue Tasks*, *Unpaid Invoices*, or *Stale Leads*). The CRM will filter the exact items causing the bottleneck. Once resolved, the friction bar immediately returns to healthy green.

#### Q3: How do I know whether to charge CGST+SGST or IGST?
> **Answer:** The CRM handles this automatically based on the client's 15-digit GSTIN. If the first 2 digits match your agency's home state (e.g., `27` for Maharashtra), the system applies 9% CGST + 9% SGST. If the state codes differ, it applies 18% IGST. Both equal the identical 18% tax rate.

#### Q4: How does the 7-day session persistence work?
> **Answer:** The authentication engine issues an AES-256 JWT token with a 7-day sliding expiration. Each time you interact with the CRM, the session window quietly extends, preventing unexpected logouts while maintaining enterprise security.

---
*OptiVir CRM Master Operating Manual • Confidential & Proprietary to OptiVir Technologies Pvt. Ltd.*
