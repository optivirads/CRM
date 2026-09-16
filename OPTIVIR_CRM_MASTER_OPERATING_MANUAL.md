# OptiVir CRM — Master Operating Manual & Enterprise System Guide
**Version:** Enterprise OS v4.8  
**Organization:** OptiVir Technologies Pvt. Ltd.  
**Service Classification:** Performance Marketing, Growth Engineering & Advertising Agency Operations  
**Tax & Compliance Standard:** CBIC GST Rule 46 • SAC Code 998361  

---

## Executive Summary & System Overview

OptiVir CRM is an enterprise-grade Operating System engineered specifically for performance marketing agencies, media buying squads, growth consultants, and D2C/B2B delivery teams. It unifies the entire client lifecycle into an interconnected data model:

```
[Inbound Lead / Inquiry] 
       ↓
[Discovery & Opportunity Pipeline (SAC 998361)] 
       ↓
[Commercial SOW Proposal & Master Services Agreement (MSA)] 
       ↓
[Client Onboarding Cockpit (5 Phases • 24 SLA Milestones)] 
       ↓
[Client 360° Unified Living Dossier & Ad Account Telemetry] 
       ↓
[Delivery Projects & Kanban Sprints (Meta, Google, Shopify, CAPI)] 
       ↓
[Automated CBIC GST Invoicing, Payment Gateway & Receivables Reconciliation] 
       ↓
[Executive QBR Performance Reports & ROAS Analytics]
```

---

## Table of Contents
1. [Core Modules & Feature Breakdown](#1-core-modules--feature-breakdown)
2. [How to Use Each Module (Step-by-Step Operator Guide)](#2-how-to-use-each-module-step-by-step-operator-guide)
3. [Client Information & Credentials Collection Guide (What to Get from Clients)](#3-client-information--credentials-collection-guide)
4. [Client Onboarding Cockpit (24-Step Execution Blueprint)](#4-client-onboarding-cockpit-24-step-execution-blueprint)
5. [Ad Networks, Tracking & CAPI Integration Guide](#5-ad-networks-tracking--capi-integration-guide)
6. [Finance, Billing & SAC 998361 GST Invoicing Guide](#6-finance-billing--sac-998361-gst-invoicing-guide)
7. [Security, RBAC Matrix & Session Persistence](#7-security-rbac-matrix--session-persistence)

---

## 1. Core Modules & Feature Breakdown

### 1.1 Executive Overview Dashboard
* **Real-Time Revenue Telemetry:** Real-time calculation of Monthly Recurring Revenue (MRR), Annual Contract Value (ACV), and gross billings.
* **Live Blended ROAS & Ad Spend Velocity:** Aggregates spend across Meta Graph API and Google Ads MCC with active return-on-ad-spend trackers.
* **Pipeline Health & Velocity Gauges:** Visualizes active pipeline volume, weighted expected value, conversion probability, and stage SLA timers.
* **Financial Receivables Alerts:** Highlights pending GST invoices, overdue collections, and unallocated credits.
* **Quick Launch Action Matrix:** Instant 1-click modal triggers to create Leads, Deals, Onboardings, Invoices, Tasks, and Payment Links.

### 1.2 Leads & Growth Pipeline
* **Multi-Channel Lead Ingestion:** Captures inbound leads from Paid Search, Meta Social, LinkedIn B2B, Organic Website, and Executive Referrals.
* **Lead Qualification Scoring:** Filters leads based on Monthly Ad Spend Budget, Tech Stack (Shopify, WooCommerce, Custom), and Decision Authority.
* **SAC Code 998361 Classification:** Tags opportunities under Indian Service Accounting Code 998361 (Advertising & Related Performance Services).
* **Lead Conversion Engine:** Converts qualified leads into linked Company records, primary Contacts, and Pipeline Deals in one click.

### 1.3 Contacts & Corporate Accounts (Companies)
* **Stakeholder Directory:** Profiles CEOs, CMOs, Directors of Growth, and E-commerce Managers with direct dials, emails, and LinkedIn links.
* **Company GSTIN & Legal Entity Vault:** Automatically validates 15-character Indian CBIC GSTIN numbers (State Code + PAN + Entity Code + Z + Checksum) and maps state tax rules (CGST/SGST vs IGST).
* **Cross-Account Relationship Mapping:** Associates multiple contacts, deals, contracts, and ad accounts under a parent corporate entity.

### 1.4 Opportunities & Sales Pipeline (Kanban & Table)
* **6-Stage Weighted Deal Pipeline:**
  1. *Discovery & Needs Analysis* (10% Probability • 3-Day SLA)
  2. *Scope & Performance Audit* (30% Probability • 5-Day SLA)
  3. *Commercial Proposal Sent* (60% Probability • 4-Day SLA)
  4. *Legal SOW & Security Review* (80% Probability • 7-Day SLA)
  5. *Closed Won* (100% Probability • Handed to Delivery Cockpit)
  6. *Closed Lost* (0% Probability • Mandatory Reason Capture)
* **Drag-and-Drop Kanban Interface:** Seamless status updating with live pipeline recalculation.

### 1.5 Commercial Proposals & Quotations
* **Dynamic Contract Scopes:** Pre-configured service models (Monthly Retainer, Fixed Milestone Sprint, Performance Hybrid % of Ad Spend).
* **Live Tax Ledger Engine:** Computes Subtotal, Trade Discounts, SAC 998361 (18% GST), and Net Payable.
* **Vector PDF Generation:** Instant high-resolution client-ready PDF generation with scope breakdown and payment terms.

### 1.6 Client Accounts & Directory
* **Active Retainer Ledger:** Central directory of all active accounts, billing models, monthly retainers, and Account Managers.
* **Client Health Telemetry:** Tracks account status (*Healthy*, *Attention Needed*, *At Risk / Churn Risk*) with automated alerts.
* **Renewal Calendaring:** Automated 60-day and 30-day renewal notices for annual retainers.

### 1.7 Client 360° Unified Living Dossier
* **Master Profile Hub:** The single source of truth for an active client account.
* **Sub-Modules inside Client 360°:**
  1. *Overview & Commercial Retainers:* Scope, Account Manager, Delivery PM, and live contract terms.
  2. *Active Projects & Tasks:* Live Kanban tasks assigned to agency delivery pods.
  3. *Finance & Invoices:* Historic tax invoices, payment links, and balance statements.
  4. *Marketing & Telemetry:* Direct link to Meta Business Manager, Google MCC, Pixel CAPI event telemetry, and spend pacing.
  5. *Social Media Sync & Publishing:* Multi-platform social integrations (Meta Graph API, Instagram, LinkedIn) with post scheduling.
  6. *Onboarding Checklist:* Audit trail of all 24 technical onboarding checkpoints.
  7. *Immutable Activity Log:* Chronological timestamped history of communications, status changes, and billing actions.

### 1.8 Client Onboarding Cockpit (5-Phase SLA Suite)
* **Orchestration Staging Pipeline:** Pre-delivery staging suite for transitioning signed deals into active delivery across 5 phases and 24 checklist items.
* **Interactive Deep-Dive Tabs:**
  1. *Sales Handoff:* SOW validation, deposit check, and contract review.
  2. *Assets & Credentials Matrix:* Audit delegated 3rd-party accounts (Meta BM, Google MCC, Shopify, CAPI, GTM) with manual entry and PDF Handover generation.
  3. *Strategy & North Star KPIs:* Custom ROAS targets, CAC caps, ad spend budget, and ICP audience briefs.
  4. *Blockers & Risks:* Log operational blockers with severity ratings and assigned owners.
  5. *Milestone Timeline (24 Steps):* Live interactive checklist dynamically updating account progress and advancing stepper phases.
* **1-Click Live Delivery Launch:** Transitions the onboarded client directly into the active Clients Directory.

### 1.9 Projects, Campaign Sprints & Kanban Tasks
* **Pod Delivery Workspaces:** Organized by agency squads (Performance Growth Pod, Ad Ops Pod, Creative Studio, Finance Pod).
* **Task Management:** Priority tagging (P1 Urgent to P4 Low), estimated turnaround hours, subtask checklists, and assignees.

### 1.10 Finance, Billing & GST Invoicing
* **CBIC GST Rule 46 Compliant:** Automatic tax splitting:
  * Intra-State (e.g. Maharashtra to Maharashtra): 9% CGST + 9% SGST.
  * Inter-State (e.g. Maharashtra to Karnataka/Delhi): 18% IGST.
* **Automated Payment Gateways:** One-click integration with Razorpay, Paytm PG, and Stripe with instant payment links and automated reconciliation.

### 1.11 Document Vault & MSA Contracts
* **Legal Vault:** Master Services Agreements (MSA), Statements of Work (SOW), Non-Disclosure Agreements (NDA), and Service Catalogs.
* **Direct Vector PDF Engine:** Zero-dependency server-side PDF generator for binding legal contracts.

### 1.12 Security, Audit Logs & Telemetry
* **Immutable Audit Trail:** Logs all record updates, login attempts, IP addresses, and user-agent metadata.
* **Multi-Factor Authentication (2FA):** Mandatory TOTP Google Authenticator / 1Password enforcement.
* **Session Persistence:** High-security AES-256 JWT tokens lasting 7 days with sliding refresh.

---

## 2. How to Use Each Module (Step-by-Step Operator Guide)

### Workflow 1: How to Ingest a Lead and Convert to a Deal
1. Navigate to **Leads** via the sidebar.
2. Click **`+ Add Lead`** at the top right.
3. Fill in Lead Name, Company Name, Work Email, Contact Number, Monthly Ad Spend Budget, and Primary Network (e.g., *Meta Ads* or *Google Search*).
4. Click **`Create Lead Record`**.
5. Once qualified, click into the lead and select **`Convert to Opportunity`**.
6. The system automatically creates a Company profile, primary Contact, and creates a deal on your **Pipeline** board.

### Workflow 2: How to Move Deals on the Pipeline & Issue a Proposal
1. Navigate to **Pipeline** (Kanban View).
2. Drag the deal card from *Discovery* to *Scope & Performance Audit* as audits progress.
3. When ready for commercials, click **`Generate Proposal`** or open the **Proposals** tab.
4. Select the client, choose the pricing model (*Monthly Retainer*, *Fixed Milestone*, or *Hybrid*), input line items (SAC 998361), and set standard payment terms (e.g., *Net 30*).
5. Click **`Save & Generate PDF`** to download or email the proposal to the client.
6. Once signed, drag the deal to **Closed Won**.

### Workflow 3: How to Run the Client Onboarding Suite
1. Navigate to **Onboarding** (or click *Onboarding Suite* from the Clients header).
2. Select the client account from the left list.
3. **Tab 1 (Sales Handoff):** Verify contract value, proposal reference, and assigned Account Manager.
4. **Tab 2 (Assets & Credentials):**
   * Review required platforms (Meta Business Manager, Google MCC, Shopify, GA4).
   * Click **`+ Add Credential Manually`** to log any extra custom platform accounts.
   * Click **`Generate Access PDF`** to export the official handover matrix.
   * Click **`Mark Granted ✓`** as access is confirmed by your technical leads.
5. **Tab 3 (Strategy & North Star):**
   * Enter Target ROAS (e.g., `4.5x`), Target CAC (e.g., `₹1,850`), and Monthly Ad Spend.
   * Select primary scaling channels and input the audience ICP brief.
   * Click **`Save Strategy & KPIs`**.
6. **Tab 4 (Blockers & Risks):**
   * If any technical issue delays launch (e.g., DNS verification pending), click **`+ Log New Blocker`**, set Severity to *High/Critical*, and assign an owner.
   * When resolved, click **`Mark Resolved ✓`**.
7. **Tab 5 (Milestone Timeline - 24 Steps):**
   * Check off items as they are audited (MSA uploaded, deposit reconciled, CAPI container deployed, kickoff call held).
   * The progress gauge updates in real time and advances the 5-stage stepper.
8. **Launch to Live Delivery:**
   * Once ready, click the top green button **`Launch to Live Delivery`**.
   * The account transitions to status **Active** and appears in the main **Clients Directory**.

### Workflow 4: How to Manage Live Clients in Client 360°
1. Navigate to **Clients** and click on any client row (or click *Open Client 360°*).
2. **Overview Tab:** View contracted ACV, Account Manager, health status, and quick links.
3. **Campaigns & Telemetry Tab:** View live ad accounts, daily ad spend, CTR, CPC, CPA, and ROAS.
4. **Invoices Tab:** Click **`Create Invoice`** to bill monthly retainers under SAC 998361, generate printable PDF invoices, or dispatch Razorpay/Paytm payment links.
5. **Tasks Tab:** Assign sprint deliverables directly to media buyers and creative editors.

---

## 3. Client Information & Credentials Collection Guide

When onboarding a new performance marketing or growth client, send the following intake checklist to gather all necessary legal, financial, and platform assets:

```
================================================================================
           OPTIVIR CRM — CLIENT ONBOARDING INTAKE CHECKLIST
================================================================================
```

### Section A: Commercial & Legal Entity Information
* [ ] **Legal Business Name:** Full registered company name (e.g., *Hayras Coconut Oil Pvt. Ltd.*)
* [ ] **Registered Office Address:** Complete street address, city, state, and PIN code.
* [ ] **Corporate GSTIN Number (15-digit):** Required for tax invoicing and CGST/SGST/IGST breakdown.
* [ ] **Company PAN:** Permanent Account Number of the entity.
* [ ] **Billing Contact Person:** Name, designation, work email, and phone number of accounts lead.
* [ ] **Primary Decision Maker (POC):** Managing Director / CMO name, direct dial, and email.

### Section B: Platform Delegation & Credentials (No Passwords Required)
* [ ] **Meta Business Manager (Partner ID):**
  * Client provides their 15/16-digit Meta Business Manager ID.
  * Agency dispatches a Partnership Request to access:
    - *Facebook Page (Admin / Content Creator)*
    - *Instagram Account (Linked Asset)*
    - *Ad Account (Manage Campaigns)*
    - *Pixel / CAPI Datasets (Manage Events & Diagnostics)*
    - *Product Catalog (Manage Inventory Feed)*
* [ ] **Google Ads Manager (MCC 10-digit CID):**
  * Client provides their 10-digit Google Ads Customer ID (`xxx-xxx-xxxx`).
  * Agency sends Manager Account Link Request from OptiVir MCC.
* [ ] **Google Analytics 4 (GA4) & Google Tag Manager (GTM):**
  * Client grants *Administrator / Editor* permissions to `agency@optivirads.com` for GTM Web Container and GA4 Property.
* [ ] **Shopify / E-Commerce Storefront:**
  * Client provides Shopify Store URL (e.g., `brandname.myshopify.com`) and 4-digit **Collaborator Request Code**.
  * Permissions required: *Themes, Apps, Analytics, Script Tags, and Products*.
* [ ] **DNS Access for Server-Side CAPI:**
  * Access to Cloudflare, GoDaddy, or Namecheap to add a CNAME record for first-party tracking (e.g., `capi.clientbrand.com -> cdn.optivirads.com`).

### Section C: Creative, Brand & Marketing Strategy Assets
* [ ] **Brand Identity Guidelines:** Brand book, typography font files (.otf/.ttf), color palette (HEX codes).
* [ ] **Vector Logos:** High-resolution SVG, PNG, and transparent EPS logo variations.
* [ ] **Raw B-Roll Video Vault:** Google Drive / Dropbox link with unedited product video shoots, packaging videos, and lifestyle footage.
* [ ] **Customer Reviews & UGC:** Customer testimonials, influencer video reviews, and press mentions.
* [ ] **Competitor Benchmarks & Value Propositions:** Top 3 direct competitors and core unique selling propositions (USPs).

---

## 4. Client Onboarding Cockpit (24-Step Execution Blueprint)

The 24 onboarding steps in OptiVir CRM are divided into 5 clear phases:

```
[Phase 1: Sales Intake] → [Phase 2: Platform Access] → [Phase 3: Strategy & CAPI] → [Phase 4: Kickoff Call] → [Phase 5: Live Launch]
```

### Phase 1: Sales Intake & Commercials (Steps 1–5)
1. **Countersigned MSA & SOW:** Ensure contract is executed by both agency director and client authorized signatory.
2. **Advance Retainer Deposit:** Reconcile advance payment or security deposit in master billing ledger.
3. **Client Portal Provisioning:** Set up client organization profile, timezone (IST), and currency (INR).
4. **Delivery Pod Allocation:** Assign dedicated Account Manager (AM) and Media Buyer specialist.
5. **VIP Communications Room:** Create dedicated Slack Connect channel or WhatsApp VIP executive group.

### Phase 2: Assets & Platform Access (Steps 6–10)
6. **Meta Business Manager Partnership:** Accept partner link and verify page/pixel/ad account delegation.
7. **Google Ads MCC & GA4 Linkage:** Confirm Google Ads manager link and test GA4 live debug streams.
8. **Shopify Collaborator Verification:** Verify collaborator permissions and checkout script access.
9. **GTM & Cloud Container Setup:** Deploy Web GTM container and Server-Side GTM container.
10. **Brand Asset Ingestion:** Ingest vector logos, fonts, product catalogs, and raw video b-roll.

### Phase 3: Architecture & Strategy Alignment (Steps 11–15)
11. **Server CAPI Cloud Run Deployment:** Deploy first-party server-side tracking container.
12. **DNS & Custom Tagging SSL Active:** Validate CNAME record and SSL handshake in live browser.
13. **Historic Performance Audit:** Audit past 90 days of ad spend, wasted spend, and blended CAC.
14. **North Star ROAS & CAC Lock:** Formalize ROAS scaling threshold (e.g. 4.5x) and CAC ceiling with client.
15. **Creative Angle Matrix Approved:** Plan initial creative sprint of 12 direct-response video hooks.

### Phase 4: Alignment & Kickoff Call (Steps 16–20)
16. **Executive Kickoff Meet:** Conduct video conference with client leadership to align sprint timelines.
17. **Weekly Cadence Lock:** Schedule recurring weekly sprint review calls and monthly QBR dates.
18. **CAPI Conversion Event Testing:** Fire simulated AddToCart and Purchase test events to verify 95%+ match quality.
19. **Ad Copy & Draft Submissions:** Submit initial campaign architecture, ad copy, and video hooks for client sign-off.
20. **Commercial SOW & SAC Compliance:** Ensure all deliverables and SAC 998361 tax terms are confirmed.

### Phase 5: Launch & Operational Delivery (Steps 21–24)
21. **Live Campaign Activation:** Publish campaigns live to Meta Graph API and Google Ads MCC with budget pacing.
22. **Real-Time Telemetry Sync:** Connect attribution streams to the OptiVir Executive Dashboard.
23. **48-Hour Spend Velocity Audit:** Monitor early CPMs, click-through rates, and bid cap stability.
24. **Transition to Live Delivery:** Formal onboarding sign-off and transfer to continuous monthly retainer delivery.

---

## 5. Ad Networks, Tracking & CAPI Integration Guide

### 5.1 Meta Business Manager Integration
* **API Version:** Meta Graph API v20.0
* **Required Parameters:** System User Access Token, App ID, App Secret, Partner Business Manager ID.
* **Telemetry Sync:** Automatically fetches ad accounts, campaign status, spend, impressions, CPC, CTR, and ROAS.

### 5.2 Google Ads MCC Integration
* **API Version:** Google Ads API v17
* **Required Parameters:** Manager Account CID, OAuth 2.0 Client Credentials / Refresh Token, Developer Token.
* **Capabilities:** Multi-account spend tracking, Search keyword conversion reporting, Performance Max telemetry.

### 5.3 First-Party Server-Side CAPI Tracking
* **Architecture:** Node.js / Cloud Run Server Container with direct webhook telemetry.
* **Benefits:** Bypasses browser ad-blockers, cookies expiry, and Apple iOS 14.5+ tracking drops.
* **Telemetry Metrics:** Tracks Event Match Quality score (target: > 8.5/10), CAPI deduplication ID, and real-time server events.

---

## 6. Finance, Billing & SAC 998361 GST Invoicing Guide

### 6.1 SAC Code 998361 Standard
All performance marketing, ad campaign management, creative production, and digital growth services rendered by OptiVir Technologies fall under **SAC 998361** (*Advertising services and related performance services*).

### 6.2 Indian GST Tax Computation
* **Intra-State Supply (e.g. Maharashtra to Maharashtra):**
  $$\text{Tax Amount} = \text{Taxable Value} \times 9\%\text{ (CGST)} + \text{Taxable Value} \times 9\%\text{ (SGST)} = 18\%$$
* **Inter-State Supply (e.g. Maharashtra to Delhi / Karnataka / Gujarat / Tamil Nadu):**
  $$\text{Tax Amount} = \text{Taxable Value} \times 18\%\text{ (IGST)}$$

### 6.3 Automated Payment Links
* **Razorpay / Paytm PG / Stripe:** Invoices generate direct payment links supporting UPI Intent (Google Pay, PhonePe, Paytm), Netbanking, and Corporate Credit Cards.
* **Reconciliation:** Webhooks automatically flag invoice status from `UNPAID` to `PAID` with zero manual intervention.

---

## 7. Security, RBAC Matrix & Session Persistence

### 7.1 Role-Based Access Control (RBAC) Matrix

| Workspace / Module | Super Admin (Owner) | Growth Lead (Sales) | Media Buyer (Ad Ops) | Finance Lead |
| :--- | :---: | :---: | :---: | :---: |
| **Executive Dashboard** | Full Access | Full Access | Full Access | Full Access |
| **Leads & Pipelines** | Full Access | Full Access (Create/Edit) | View Only | View Only |
| **Client 360° Dossier** | Full Access | Full Access | Full Access | Full Access |
| **Onboarding Cockpit** | Full Access | Full Access | Full Access | View Only |
| **Ad Telemetry & Campaigns** | Full Access | View Only | Full Access (Edit) | View Only |
| **Finance, Invoices & Tax** | Full Access | View Only | No Access | Full Access (Create/Edit) |
| **Agency Settings & Vault** | Full Access | No Access | No Access | No Access |

### 7.2 Session Persistence & Security Settings
* **7-Day Session Persistence:** AES-256 JWT tokens with sliding window renewal upon active CRM usage.
* **Two-Factor Authentication (2FA):** Enforces TOTP security keys for administrative seats.
* **Lockout Protection:** Automatically locks out account after 5 failed password attempts for 15 minutes.
* **IP Whitelist / Firewall:** Allows restricting agency workspace access to specific office static IP subnets.

---
*End of OptiVir CRM Master Operating Manual • Confidential & Proprietary to OptiVir Technologies Pvt. Ltd.*
