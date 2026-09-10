# OPTIVIR CRM — The Complete Click-by-Click Operating Manual
## An Actionable, Field-by-Field "How to Use Every Single Functionality" Guide

---

## Welcome to Your Operating Manual

This manual was written for **non-technical human beings**. 
- You will find **no confusing code** or developer jargon.
- Every single feature in OptiVir CRM has its own dedicated **"How to Use It"** section.
- You will see exactly **what button to click**, **what to type into each box**, **what happens after you click**, and **how to fix mistakes**.

---

# TABLE OF CONTENTS

- [CHAPTER 1: The Top Navigation & Command Tools](#chapter-1-the-top-navigation--command-tools)
  - [1.1 Global Omnisearch (`Ctrl + K`)](#11-global-omnisearch-ctrl--k)
  - [1.2 Quick Create Menu (`+ New` / `+ Create`)](#12-quick-create-menu--new---create)
  - [1.3 Date Range Filter](#13-date-range-filter)
  - [1.4 Department & Team Filter](#14-department--team-filter)
  - [1.5 Export Console (Downloading Guides & Architecture)](#15-export-console-downloading-guides--architecture)
  - [1.6 Dark / Light Mode Switcher](#16-dark--light-mode-switcher)
  - [1.7 The Team Persona Simulator (Role Switcher)](#17-the-team-persona-simulator-role-switcher)
- [CHAPTER 2: The 5 Command Dashboards](#chapter-2-the-5-command-dashboards)
  - [2.1 Management Dashboard & The Operational Friction Bar](#21-management-dashboard--the-operational-friction-bar)
  - [2.2 Sales Dashboard (Pipeline & Forecasting)](#22-sales-dashboard-pipeline--forecasting)
  - [2.3 Marketing Dashboard (ROAS & Ad Attribution)](#23-marketing-dashboard-roas--ad-attribution)
  - [2.4 Finance Dashboard (Collections & Runway)](#24-finance-dashboard-collections--runway)
  - [2.5 My Workspace Dashboard (Daily Desk & Live Stopwatch)](#25-my-workspace-dashboard-daily-desk--live-stopwatch)
- [CHAPTER 3: Sales & CRM Modules](#chapter-3-sales--crm-modules)
  - [3.1 Leads (Recording & Qualifying Inquiries)](#31-leads-recording--qualifying-inquiries)
  - [3.2 Companies (Business Directory)](#32-companies-business-directory)
  - [3.3 Contacts (Client Address Book)](#33-contacts-client-address-book)
  - [3.4 Opportunities (Deals in Negotiation)](#34-opportunities-deals-in-negotiation)
  - [3.5 Deal Pipeline Kanban (Visual Drag-and-Drop)](#35-deal-pipeline-kanban-visual-drag-and-drop)
  - [3.6 Proposals (Price Quotes & SOWs)](#36-proposals-price-quotes--sows)
- [CHAPTER 4: Client Success & Onboarding](#chapter-4-client-success--onboarding)
  - [4.1 Active Clients Directory & Health Scores](#41-active-clients-directory--health-scores)
  - [4.2 Client 360° (Master Client Folder)](#42-client-360-master-client-folder)
  - [4.3 The 24-Step Onboarding Engine](#43-the-24-step-onboarding-engine)
  - [4.4 The Credential Vault (Safe Locker for Logins)](#44-the-credential-vault-safe-locker-for-logins)
- [CHAPTER 5: Delivery, Projects & Time Tracking](#chapter-5-delivery-projects--time-tracking)
  - [5.1 Projects & Milestones](#51-projects--milestones)
  - [5.2 Tasks & Operational Checklists](#52-tasks--operational-checklists)
  - [5.3 The Live Billable Stopwatch (Profit Guard)](#53-the-live-billable-stopwatch-profit-guard)
- [CHAPTER 6: Performance Marketing & Ad Tracking](#chapter-6-performance-marketing--ad-tracking)
  - [6.1 Tracking Ad Spend, Sales & Blended ROAS](#61-tracking-ad-spend-sales--blended-roas)
  - [6.2 Comparing Ad Channels (Meta vs. Google vs. TikTok)](#62-comparing-ad-channels-meta-vs-google-vs-tiktok)
- [CHAPTER 7: Finance, Invoicing & Getting Paid](#chapter-7-finance-invoicing--getting-paid)
  - [7.1 Creating a 1-Click Tax Invoice with 18% GST](#71-creating-a-1-click-tax-invoice-with-18-gst)
  - [7.2 Downloading the Official A4 Vector PDF Invoice](#72-downloading-the-official-a4-vector-pdf-invoice)
  - [7.3 Recording Bank Wire Payments (UTR Numbers)](#73-recording-bank-wire-payments-utr-numbers)
- [CHAPTER 8: Operations, Calendar, Documents & Reports](#chapter-8-operations-calendar-documents--reports)
  - [8.1 Activities & Unified Calendar](#81-activities--unified-calendar)
  - [8.2 Documents Vault (Tamper-Proof File Storage)](#82-documents-vault-tamper-proof-file-storage)
  - [8.3 Executive Reports & Automated QBR Dossiers](#83-executive-reports--automated-qbr-dossiers)
  - [8.4 Notifications Hub](#84-notifications-hub)
- [CHAPTER 9: Step-by-Step Walkthrough: From Inbound Lead to Paid Invoice](#chapter-9-step-by-step-walkthrough-from-inbound-lead-to-paid-invoice)
- [CHAPTER 10: Troubleshooting & Fixing Common Mistakes](#chapter-10-troubleshooting--fixing-common-mistakes)

---

# VISUAL UI ARCHITECTURE BLUEPRINTS

### Blueprint I: Global Application Shell & 70/30 Viewport Wireframe
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [OPTIVIR]    [🔍 Omnisearch (Ctrl + K)...]            [📅 Oct 2026] [👥 All Teams] [🔔 7] [+ New] [AM] │
├──────────────────┬─────────────────────────────────────────────────────────────────────────────────────┤
│ 256px SIDEBAR    │ MAIN VIEWPORT CONTAINER                                                             │
│                  │                                                                                     │
│ COMMAND          │ PERSPECTIVE SWITCHER:                                                               │
│ ▸ Dashboard (Act)│ [Management Dashboard] | [Sales] | [Marketing] | [Finance] | [My Workspace]         │
│ • My Workspace   │ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│                  │ │ 🟢 OPERATIONAL FRICTION: ALL 14 SYSTEMS OPERATIONAL • ZERO CRITICAL ESCALATIONS │ │
│ REVENUE / CRM    │ └─────────────────────────────────────────────────────────────────────────────────┘ │
│ • Leads (1,482)  │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐           │ │
│ • Deal Pipeline  │ │ TOTAL REVENUE │ │ ACTIVE CLIENTS│ │ PIPELINE LEADS│ │ WIN VELOCITY  │           │ │
│ • Proposals      │ │ ₹48,25,000    │ │ 142 Active    │ │ 1,482 Leads   │ │ 18.4 Days     │           │ │
│                  │ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘           │ │
│ OPERATIONS       │ ┌───────────────────────────────────────────────┬─────────────────────────────────┐ │ │
│ • Clients (142)  │ │ PRIMARY FOCUS CANVAS (70% VIEWPORT)           │ TELEMETRY & CONTEXT (30%)       │ │ │
│ • Client 360°    │ │ ┌──────────┐ ┌──────────┐ ┌──────────┐        │ ┌─────────────────────────────┐ │ │ │
│ • Projects       │ │ │Discovery │ │Audit     │ │Proposal  │        │ │ LIVE BILLABLE STOPWATCH     │ │ │ │
│ • Tasks          │ │ │(20% Prob)│ │(40% Prob)│ │(60% Prob)│        │ │ ⏱ 02h 15m 42s              │ │ │ │
│ • Calendar       │ │ │Apex:₹1.5L│ │Nova:₹2.2L│ │Zep: ₹3.0L│        │ │ Active: #OPT-9492 (Maya)    │ │ │ │
│                  │ │ └──────────┘ └──────────┘ └──────────┘        │ └─────────────────────────────┘ │ │ │
│ FINANCE          │ │ ┌──────────┐ ┌───────────────────────┐        │ ┌─────────────────────────────┐ │ │ │
│ • Invoices (GST) │ │ │Negotiate │ │ CLOSED WON (100%)     │        │ │ TODAY'S DELIVERABLES CHECK  │ │ │ │
│ • Retainers      │ │ │(80% Prob)│ │ 🎉 Auto-Onboarding!   │        │ │ [✓] Send SOW to Apex        │ │ │ │
│                  │ │ └──────────┘ └───────────────────────┘        │ │ [✓] Review Meta Ad ROAS     │ │ │ │
│ SYSTEM / VAULT   │ │                                               │ │ [ ] Verify GTM Purchase CAPI│ │ │ │
│ • Doc Vault      │ │ • High-density canvas (Kanban, SOW, Invoices) │ └─────────────────────────────┘ │ │ │
│ • Settings       │ └───────────────────────────────────────────────┴─────────────────────────────────┘ │ │
└──────────────────┴─────────────────────────────────────────────────────────────────────────────────────┘
```

### Blueprint II: 14-Module Operational Data Lifecycle Flowchart
```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 01. INGESTION   │       │ 02. QUALIFY     │       │ 03. PIPELINE    │       │ 04. PROPOSAL    │
│ Web Form / Meta │ ────> │ BANT Scoring    │ ────> │ 5-Stage Kanban  │ ────> │ SOW Builder     │
│ Inbound Leads   │       │ Company + GSTIN │       │ Weighted Values │       │ SAC 998311 Code │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
                                                                                       │
                                                                                       ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 08. GOVERNANCE  │       │ 07. COMMERCE    │       │ 06. EXECUTION   │       │ 05. ONBOARDING  │
│ SHA-256 Vault   │ <──── │ 1-Click 18% GST │ <──── │ Tasks & Milestones│ <───│ 24-Step Engine  │
│ QBR Reports Dossier     │ Bank UTR Settlement     │ Live Stopwatch  │       │ Credential Vault│
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

# CHAPTER 1: The Top Navigation & Command Tools

The top bar is permanently visible on every screen. It gives you instant access to global agency tools.

---

### 1.1 Global Omnisearch (`Ctrl + K`)
- **What it is**: A super-fast search engine that scans your entire agency database in 0.2 seconds.
- **When to use it**: When you need to find any client, deal, phone number, task, or invoice number immediately.

#### 🛠️ HOW TO USE IT (STEP-BY-STEP):
1. **Open the Search Bar**:
   - Press `Ctrl + K` (Windows) or `Cmd + K` (Mac) on your keyboard from ANY page.
   - *OR* click the search box in the center of the top bar that says *"Search leads, deals, metrics..."*.
2. **Type Your Search Term**:
   - Type any 2 or 3 letters (e.g., `Ape` to find *Apex Apparel*, or `INV-` to find an invoice).
3. **Select Your Result**:
   - A dropdown list appears instantly showing matched records categorized by type (Clients, Invoices, Tasks).
   - Click the item or press `Enter` to jump directly into that screen.
4. **Close Search**:
   - Press the `Esc` key or click outside the search box to close it.

---

### 1.2 Quick Create Menu (`+ New` / `+ Create`)
- **What it is**: A shortcut button that lets you add new data to the system without leaving your current screen.

#### 🛠️ HOW TO USE IT (STEP-BY-STEP):
1. Look at the top bar. You will see a red button labeled **+ New** (and on the main dashboard, a black button labeled **+ Create**). Click it.
2. A menu drops down with 3 options:
   - **Create Lead**: Click this when a new client calls or messages your agency.
   - **Create Opportunity**: Click this when an existing lead wants a price proposal.
   - **Generate Invoice**: Click this when you need to send a bill to a client.
3. Click your desired option. The creation window opens up immediately.
4. Fill in the information and click **Submit**. You will stay right on your current page!

---

### 1.3 Date Range Filter
- **What it is**: A dropdown button showing your active time window (e.g., *This Month (Oct 1 – Oct 31, 2026)*).
- **Why it matters**: All numbers on your dashboard—revenue, ad spend, billable hours—adapt to the dates you select here.

#### 🛠️ HOW TO USE IT (STEP-BY-STEP):
1. Click the button with the **Calendar** icon on the top right of the dashboard.
2. Choose from the available presets:
   - *This Month*: Shows numbers from day 1 of the current month until today.
   - *Previous Month*: Look back at last month's complete numbers.
   - *Q4 FY2026*: Shows numbers for the entire 3-month quarterly period.
   - *Year to Date*: Shows cumulative agency performance for the entire year.
3. Click your choice. The cards and charts instantly recalculate.

---

### 1.4 Department & Team Filter
- **What it is**: A dropdown that lets you filter the entire CRM by department.

#### 🛠️ HOW TO USE IT (STEP-BY-STEP):
1. Click the button labeled **All Teams** (next to the Date selector).
2. Choose your department:
   - *Revenue Team*: Filters down to sales deals, proposals, and pipeline reps.
   - *Marketing Team*: Filters down to media buyers, ad spend, and ROAS.
   - *Engineering Team*: Filters down to technical website milestones and tracking pixel tasks.
   - *Operations Team*: Filters down to agency billing, invoices, and executive tasks.
   - *All Teams*: Restores the full agency-wide view.

---

### 1.5 Export Console (Downloading Guides & Architecture)
- **What it is**: A dropdown button with a **Download** icon that lets you export native documents.

#### 🛠️ HOW TO USE IT (STEP-BY-STEP):
1. Click the **Export** button in the dashboard action bar.
2. A clean menu drops down with 3 options:
   - **Download Master Tutorial Guide**: Downloads the official 10-page vector PDF manual ([`OPTIVIR_CRM_MASTER_GUIDE.pdf`](file:///c:/Users/abhin/Desktop/CRM/OPTIVIR_CRM_MASTER_GUIDE.pdf)) with zero empty pages.
   - **Download Architecture PDF**: Downloads the 7-page native vector system map ([`OPTIVIR_CRM_UI_STRUCTURE.pdf`](file:///c:/Users/abhin/Desktop/CRM/OPTIVIR_CRM_UI_STRUCTURE.pdf)).
   - **Print Live Dashboard**: Opens your browser print dialog to print the current screen cleanly.
3. Click the file you want. The download begins immediately in your browser.

---

### 1.6 Dark / Light Mode Switcher
- **What it is**: A button in the top header showing a **Sun** or **Moon** icon.

#### 🛠️ HOW TO USE IT (STEP-BY-STEP):
1. If you are working in bright daylight and prefer a crisp white background, click the **Moon** icon. The entire CRM switches to **Clean Studio Light (`#FFFFFF`)**.
2. If you are working in the evening or prefer reduced eye strain, click the **Sun** icon. The entire CRM switches to **Executive Dark Navy (`#0A121F`)**.
3. Your preference is saved automatically in your browser.

---

### 1.7 The Team Persona Simulator (Role Switcher)
- **What it is**: A profile avatar button in the top right showing a user's initials (e.g. *AM* for Alex Morgan).
- **Why it is useful**: It allows you to test and see what different employees can see based on their permission levels.

#### 🛠️ HOW TO USE IT (STEP-BY-STEP):
1. Click the user avatar pill in the top right header.
2. A dropdown opens listing the 4 core agency personas:
   - **Marcus Vance (Operations Lead / CEO)**: Switch to Marcus if you want to inspect agency profit margins, bank collections, and executive alerts.
   - **Alex Morgan (Sales Director)**: Switch to Alex if you want to focus on sales quotas, deals in negotiation, and revenue forecasts.
   - **Rahul Menon (Delivery Lead)**: Switch to Rahul if you want to inspect sprint backlogs, overdue deliverables, and stopwatch hours.
   - **Maya Joseph (Media Buyer)**: Switch to Maya if you want to focus on Facebook/Instagram ad budgets, creative performance, and ROAS.
3. Click any persona. A checkmark appears next to their name, and the workspace permissions adapt immediately!

---

# CHAPTER 2: The 5 Command Dashboards

Directly below the top greeting on the main Dashboard, you will see 5 perspective buttons:  
`[Management Dashboard] | [Sales Dashboard] | [Marketing Dashboard] | [Finance Dashboard] | [My Dashboard]`

Clicking any button changes the dashboard view.

---

## 2.1 Management Dashboard & The Operational Friction Bar
- **Who it is for**: Founders, Managing Directors, and Operations Leads.

#### 🛠️ HOW TO USE THE MANAGEMENT DASHBOARD:
1. Click **Management Dashboard** in the perspective bar.
2. **Read the 4 North Star Cards**:
   - *Total Revenue*: Your cumulative billed revenue this year.
   - *Active Clients*: How many paying clients you have on retainer.
   - *Pipeline Leads*: How many inquiries were captured this month.
   - *Deal Win Velocity*: The average number of days it takes to close a deal (e.g., 18.4 days).
3. **Inspect the Operational Friction Bar (Smoke Detector)**:
   - Look at the banner directly below the buttons. If it is **GREEN**, your agency is running smoothly.
   - If it turns **RED**, alerts have fired!
     - *Overdue Tasks*: Click this pill to jump straight to the late deliverables.
     - *Unpaid Invoices*: Click this pill to see which client is late on payment.
     - *Stale Leads*: Click this pill to see which new prospect hasn't received a phone call in 24 hours.

---

## 2.2 Sales Dashboard (Pipeline & Forecasting)
- **Who it is for**: Sales Reps, Account Executives, and Sales Directors.

#### 🛠️ HOW TO USE THE SALES DASHBOARD:
1. Click **Sales Dashboard** in the perspective bar.
2. **Review Your Pipeline Numbers**:
   - *Total Active Pipeline*: The sum of every deal currently being negotiated.
   - *Weighted Forecast*: The anticipated cash coming in based on probability:
     $$\text{Weighted Forecast} = \text{Deal Value} \times \text{Stage Probability}$$
     *(e.g., a ₹10 Lakh deal in Proposal Sent at 60% probability adds ₹6 Lakhs to your forecast).*
   - *Commercial Win Rate*: What percentage of completed deals were won (e.g., 34.8%).
3. **Review the Deal Progression Row**:
   - See how many deals are currently sitting in *Inbound New*, *Contacted*, *Audit*, *Proposal*, and *Negotiation*.
4. **Advance a Deal Directly**:
   - In the deals table at the bottom, find the deal you want to move.
   - Click the red action button on the far right (e.g., **Advance Stage** or **Mark Won**).

---

## 2.3 Marketing Dashboard (ROAS & Ad Attribution)
- **Who it is for**: Media Buyers, Growth Marketers, and CMOs.

#### 🛠️ HOW TO USE THE MARKETING DASHBOARD:
1. Click **Marketing Dashboard** in the perspective bar.
2. **Check the Top 4 Marketing Metrics**:
   - *Total Ad Spend*: How much money has been spent on ads across Meta, Google, and TikTok.
   - *Attributed Revenue*: The verified sales generated by those ads.
   - *Blended ROAS*: The return multiplier ($\text{Revenue} \div \text{Spend}$). If this number is above 3.5x, your ads are very profitable!
   - *Cost Per Lead (CPL)*: How much each phone inquiry or form submission cost.
3. **Compare Advertising Channels**:
   - Scroll down to the **Channel Matrix Table**.
   - Compare the **ROAS Multiple** column for Meta vs. Google.
   - *Action Tip*: If Meta shows `5.2x` and Google shows `1.8x`, tell your media buyer to shift more budget to Meta!

---

## 2.4 Finance Dashboard (Collections & Runway)
- **Who it is for**: Agency Owners, CFOs, and Accountants.

#### 🛠️ HOW TO USE THE FINANCE DASHBOARD:
1. Click **Finance Dashboard** in the perspective bar.
2. **Check Your Cashflow Health**:
   - *Net Collections*: Actual cash deposited in your bank account this month.
   - *AR Overdue*: Money clients owe you that has passed its due date.
   - *Operating Runway*: How many months the agency can survive on its current bank balance without signing new deals:
     $$\text{Runway (Months)} = \frac{\text{Bank Cash Reserves}}{\text{Monthly Salaries \& Rent}}$$
3. **Check Accounts Receivable Aging**:
   - Look at the aging progress bars:
     - *Current (< 30 Days)*: Green (Normal).
     - *31–60 Days*: Yellow (Send a gentle payment reminder).
     - *90+ Days Critical*: Red (Pause client ad campaigns until payment arrives).

---

## 2.5 My Workspace Dashboard (Daily Desk & Live Stopwatch)
- **Who it is for**: YOU! Every single team member uses this as their daily home desk.

#### 🛠️ HOW TO USE MY WORKSPACE:
1. Click **My Dashboard** in the perspective bar.
2. **Review Your Morning Schedule**:
   - Look at the **My Day: Today** box on the left. It lists your scheduled client review calls and team meetings for today.
3. **Complete Your Deliverables**:
   - Look at the **My Deliverable Checklist** box on the right.
   - It lists the tasks assigned to you that are due today.
   - When you finish a task, click its checkbox. It instantly turns green with a checkmark.
4. **Use the Live Stopwatch**:
   - See Section 5.3 below for click-by-click stopwatch instructions.

---

# CHAPTER 3: Sales & CRM Modules

---

## 3.1 Leads (Recording & Qualifying Inquiries)
**Location**: Left Sidebar > Click **Leads**.

- **What is a Lead?** An unverified inquiry from someone who might want to hire your agency.

#### 🛠️ HOW TO CREATE A NEW LEAD (STEP-BY-STEP):
1. In the top right corner of the Leads screen, click the blue **+ Add Lead** button.
2. A modal window opens with input fields. Fill them out as follows:
   - **Lead Name**: Enter their full name (e.g., *Rohan Verma*).
   - **Company Name**: Enter their business name (e.g., *Apex Apparel*).
   - **Work Email**: Enter their email (e.g., `rohan@apexapparel.com`).
   - **Phone Number**: Enter their mobile number (e.g., `+91 98201 23456`).
   - **Lead Source**: Select where they found you (*Website Form*, *Meta Lead Ad*, *Google PPC*, *LinkedIn*, or *Referral*).
   - **Estimated Budget**: Enter their approximate monthly budget (e.g., `₹1,50,000`).
3. Click the black **Save Lead** button.
4. The lead now appears at the top of your Leads table!

#### 🛠️ HOW TO CONVERT A LEAD INTO AN OPPORTUNITY:
1. In the Leads table, find the lead you just called.
2. Click on their row to open the details view.
3. If they say *"Yes, we want to discuss a formal quote"*, click the green **Convert to Deal** button.
4. The system automatically creates a Company profile, a Contact profile, and puts an Opportunity Card on your visual Sales Pipeline!

---

## 3.2 Companies (Business Directory)
**Location**: Left Sidebar > Click **Companies**.

- **What is a Company?** The legal organization you do business with (e.g., *Apex Apparel Pvt Ltd*).

#### 🛠️ HOW TO ADD & MANAGE A COMPANY:
1. Click **+ Add Company**.
2. Enter the **Company Legal Name** (e.g., *Apex Apparel Private Limited*).
3. Enter their **GSTIN Number** (15-digit tax ID, e.g., `27AABCU9603R1ZM`). *This is critical for automated tax invoicing later.*
4. Enter their **Website URL** and **Headquarters Address**.
5. Click **Save Company**.
6. Whenever you open this company, you can see all employees working there and all past invoices.

---

## 3.3 Contacts (Client Address Book)
**Location**: Left Sidebar > Click **Contacts**.

- **What is a Contact?** An individual human person who works at a client company.

#### 🛠️ HOW TO ADD A CONTACT:
1. Click **+ Add Contact**.
2. Type their **First & Last Name** (e.g., *Sneha Patel*).
3. Select the **Company** they belong to from the dropdown (*Apex Apparel*).
4. Enter their **Job Title** (e.g., *Marketing VP*).
5. Enter their **Direct Phone** and **Email Address**.
6. Click **Save Contact**.

---

## 3.4 Opportunities (Deals in Negotiation)
**Location**: Left Sidebar > Click **Opportunities**.

- **What is an Opportunity?** An active sales negotiation where real money is on the table.

#### 🛠️ HOW TO CREATE AN OPPORTUNITY:
1. Click **+ New Opportunity**.
2. Enter the **Opportunity Name** (e.g., *Apex Apparel - Diwali Campaign Retainer*).
3. Select the **Client / Company** from the dropdown.
4. Enter the **Contract Value** in rupees (e.g., `₹1,50,000 / month`).
5. Select the **Current Stage** (e.g., *Proposal Sent*).
6. Set the **Target Closing Date** (e.g., *October 28, 2026*).
7. Click **Save Opportunity**.

---

## 3.5 Deal Pipeline Kanban (Visual Drag-and-Drop)
**Location**: Left Sidebar > Click **Pipeline**.

- **What it is**: A board with 5 vertical columns representing the stages of your sales cycle.

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ 1. DISCOVERY    │   │ 2. AUDIT & PLAN │   │ 3. PROPOSAL     │   │ 4. NEGOTIATION  │   │ 5. CLOSED WON   │
│ Probability: 20%│ ➔ │ Probability: 40%│ ➔ │ Probability: 60%│ ➔ │ Probability: 80%│ ➔ │ Probability:100%│
│ [Apex: ₹1.5L]   │   │                 │   │                 │   │                 │   │🎉 Auto-Onboard  │
└─────────────────┘   └─────────────────┘   └─────────────────┘   └─────────────────┘   └─────────────────┘
```

#### 🛠️ HOW TO USE THE PIPELINE KANBAN BOARD:
1. Find the card representing your deal (e.g., *Apex Apparel*).
2. Click and hold the card with your mouse.
3. Drag it to the right as your negotiation progresses:
   - Move from **Discovery** to **Audit** after completing your initial strategy call.
   - Move to **Proposal Sent** after emailing them your price quote.
   - Move to **Negotiation** when reviewing legal contracts.
4. **Closing the Deal**:
   - When the client signs the contract, drag their card into **CLOSED WON (100%)**.
   - **MAGIC HAPPENS**: The system automatically marks the deal won, creates an active client folder, and **automatically launches the 24-Step Onboarding Engine!**

---

## 3.6 Proposals (Price Quotes & SOWs)
**Location**: Left Sidebar > Click **Proposals**.

#### 🛠️ HOW TO CREATE & SEND A PROPOSAL:
1. Click **+ New Proposal** in the top right.
2. Choose the **Client Entity** from the dropdown (*Apex Apparel*).
3. Check the boxes for the services they want to purchase:
   - *Performance Media Management*: ₹1,00,000 / month
   - *Creative Production Batch (16 Video Ads)*: ₹50,000
   - *Technical Pixel & CAPI Setup*: ₹25,000
4. The system automatically computes the taxable subtotal: `₹1,75,000`.
5. Set the **Proposal Validity** (default: 14 days).
6. Click **Generate Proposal PDF**.
7. An official vector document with terms, scope of work, deliverables, and signature lines downloads instantly to your computer.

---

# CHAPTER 4: Client Success & Onboarding

---

## 4.1 Active Clients Directory & Health Scores
**Location**: Left Sidebar > Click **Clients**.

- **What it shows**: Every active client paying your agency a monthly retainer.

#### 🛠️ HOW TO READ & USE THE CLIENTS LIST:
1. Look at the table rows. Each row displays:
   - *Client Name* (e.g., Apex Apparel).
   - *Monthly Retainer Fee* (e.g., ₹1,50,000 / mo).
   - *Assigned Account Manager* (e.g., Maya Joseph).
   - *Health Score Badge*:
     - 🟢 **Green (80–100%)**: Client is happy; ROAS is high; invoices paid on time.
     - 🟡 **Yellow (50–79%)**: Client needs attention; deliverables running close to deadline.
     - 🔴 **Red (< 50%)**: Cancellation risk! An executive should reach out immediately.
2. Click any client name to open their full **Client 360°** binder.

---

## 4.2 Client 360° (Master Client Folder)
**Location**: Left Sidebar > Click **Client 360°**.

- **What it is**: The single source of truth for an active client.

#### 🛠️ HOW TO NAVIGATE CLIENT 360°:
Click into any client to view their 8 dedicated tabs:
1. **Overview**: Monthly retainer fee, health score, and key dates.
2. **Campaign Telemetry**: Live graphs showing daily ad spend and ROAS.
3. **Projects**: All active projects and deliverable milestones.
4. **Timesheet Summary**: All billable stopwatch hours logged by your team this month.
5. **Invoices**: Complete ledger of all bills issued, paid, and outstanding.
6. **Credential Vault**: Encrypted safe locker for client logins and ad IDs.
7. **Document Vault**: Download signed contracts, brand kits, and vector logos.
8. **Activity Stream**: Timestamped log of every email, phone call, and status update.

---

## 4.3 The 24-Step Onboarding Engine
**Location**: Left Sidebar > Click **Onboarding**.

- **What it is**: A guided 4-phase checklist that ensures your agency welcomes every new client flawlessly.

#### 🛠️ HOW TO USE THE 24-STEP ONBOARDING ENGINE:
1. Open the onboarding profile for the newly signed client.
2. The 24 steps are organized into 4 distinct phases:
   - **Phase 1: Kickoff & Alignment (Steps 1–6)**:
     - Check off Step 1: Assign Account Manager.
     - Check off Step 2: Send Welcome Packet.
     - Check off Step 3: Schedule 60-Minute Discovery Call.
     - Check off Step 4: Align on Target ROAS (e.g., 4.0x).
     - Check off Step 5: Create Client Slack/WhatsApp Channel.
     - Check off Step 6: Publish Delivery Calendar.
   - **Phase 2: Assets & Access Collection (Steps 7–12)**:
     - Request Meta Business Manager partner access.
     - Link Google Ads Customer ID (CID).
     - Collect Shopify admin logins and save them in the Credential Vault (see Section 4.4).
     - Download brand logos and fonts.
   - **Phase 3: Technical Setup & Pixel Audit (Steps 13–18)**:
     - Install Meta Conversions API (CAPI).
     - Configure Google Tag Manager (GTM).
     - Verify GA4 purchase tracking events.
     - Connect real-time Looker Studio reporting.
   - **Phase 4: Launch & Graduation (Steps 19–24)**:
     - Produce first batch of 8 video ads.
     - Write high-converting copy.
     - Obtain client sign-off.
     - Publish first ad campaigns live.
     - Complete 72-hour ad spend audit.
3. **Graduating the Client**:
   - When all 24 checkmarks are complete, click the green **Graduate to Active Client** button at the bottom.
   - The onboarding suite archives itself and marks the client as an established active account!

---

## 4.4 The Credential Vault (Safe Locker for Logins)
**Location**: Client 360° > Click **Credential Vault**.

- **What it is**: A secure locker where client passwords and ad account IDs are encrypted.

#### 🛠️ HOW TO ADD A CLIENT LOGIN:
1. Open the client's **Client 360°** page.
2. Click the **Credential Vault** tab.
3. Click the blue **+ Add Credential** button.
4. In the dialog box:
   - **Platform**: Select *Meta Business Manager*, *Google Ads CID*, *Shopify Admin*, or *Custom Login*.
   - **Account Identifier / Username**: Enter their account ID or username (e.g., `cid-829-102-9912` or `admin@apexapparel.com`).
   - **Password / Access Token**: Enter the password.
   - **Access Level**: Select *Admin*, *Editor*, or *View-Only*.
5. Click **Save Credential**.
6. The password is encrypted with AES-256 standards.
7. To use it later, click the **Copy** icon next to the credential. You can paste it into the ad platform without exposing the password in plain text.

---

# CHAPTER 5: Delivery, Projects & Time Tracking

---

## 5.1 Projects & Milestones
**Location**: Left Sidebar > Click **Projects**.

- **What is a Project?** A high-level client initiative broken into milestones.

#### 🛠️ HOW TO CREATE A NEW PROJECT:
1. Click **+ New Project** in the top right.
2. Enter the **Project Title** (e.g., *Apex Apparel - Diwali Festive Blitz*).
3. Select the **Client** (*Apex Apparel*).
4. Enter the **Start Date** and **Target Launch Date**.
5. Add your **Key Milestones**:
   - *Milestone 1*: Video Ad Scripts Approved (Oct 5).
   - *Milestone 2*: 16 Video Ads Produced (Oct 12).
   - *Milestone 3*: Live Ad Launch (Oct 18).
6. Click **Save Project**.

---

## 5.2 Tasks & Operational Checklists
**Location**: Left Sidebar > Click **Tasks**.

- **What is a Task?** An individual to-do item assigned to a specific team member.

#### 🛠️ HOW TO CREATE A TASK:
1. Click **+ New Task** in the top right.
2. Fill out the task card:
   - **Task Title**: Write a clear, action-oriented title (e.g., *Design 4 Instagram Reel Ad Variants*).
   - **Client**: Select the client (*Apex Apparel*).
   - **Project**: Select the parent project (*Diwali Festive Blitz*).
   - **Assignee**: Choose the responsible team member (*Maya Joseph*).
   - **Priority**:
     - 🔴 **Urgent**: Due today / ad budget blocked.
     - 🟡 **High**: Due within 48 hours.
     - 🟢 **Normal**: Standard weekly deliverable.
   - **Estimated Hours**: Enter expected duration (e.g., `3.5 Hours`).
   - **Due Date**: Select deadline.
3. Click **Save Task**.
4. The task now syncs directly to that team member's **My Workspace** checklist!

---

## 5.3 The Live Billable Stopwatch (Profit Guard)
**Location**: Top Navigation Bar & **My Workspace**.

- **What is the Stopwatch?** A real-time timer tracking billable minutes worked on client tasks.
- **Why it matters**: It stops your agency from doing free extra work and proves to the client exactly what they are paying for.

#### 🛠️ HOW TO USE THE STOPWATCH (CLICK-BY-CLICK):
1. **Starting the Timer**:
   - When you sit down at your computer to begin working on a task, look at the top navigation bar or open **My Workspace**.
   - Click the green/red **Start Focus** button (or Play icon).
   - The timer begins counting seconds: `00m 01s... 00m 02s...`
2. **Pausing for Breaks**:
   - If you get up for lunch, coffee, or attend an internal agency meeting, click **Pause**.
   - The timer freezes your elapsed minutes.
   - When you sit back down, click **Resume**.
3. **Stopping and Logging Time**:
   - When the task is complete, click **Stop & Log**.
   - A confirmation window pops up:
     - It confirms: *"You worked 2 Hours and 15 Minutes"*.
     - Type a brief note in the summary box: *"Rendered 4 video hook variants for Diwali flash sale"*.
     - Click **Confirm & Save**.
   - The time is permanently credited to the client's monthly timesheet!

---

# CHAPTER 6: Performance Marketing & Ad Tracking

**Location**: Left Sidebar > Click **Marketing**.

---

## 6.1 Tracking Ad Spend, Sales & Blended ROAS

#### 🛠️ HOW TO READ THE MARKETING DASHBOARD:
1. Open the **Marketing** tab.
2. **Look at the 4 Metric Cards**:
   - **Total Ad Spend**: Total rupees spent across all platforms (e.g., `₹18,50,000`).
   - **Attributed Revenue**: Sales generated by those ads (e.g., `₹89,72,500`).
   - **Blended ROAS**: The multiplier of your returns:
     $$\text{ROAS} = \frac{\text{Sales Generated}}{\text{Ad Spend}} = \frac{89,72,500}{18,50,000} = 4.85\text{x}$$
   - **Cost Per Lead (CPL)**: Average cost per confirmed customer inquiry (e.g., `₹142`).
3. **Date Filtering**:
   - Change the date dropdown in the top bar to inspect yesterday's numbers, last week's numbers, or month-to-date performance.

---

## 6.2 Comparing Ad Channels (Meta vs. Google vs. TikTok)

#### 🛠️ HOW TO OPTIMIZE AD BUDGETS:
1. Scroll down to the **Channel Matrix Table**.
2. Look at the **ROAS Multiple** column for each network:
   - *Meta (Facebook & Instagram)*: Ideal for visual e-commerce and lifestyle brands.
   - *Google Search*: Ideal for urgent services and high-intent searches.
   - *TikTok*: Ideal for Gen-Z viral impulse buys.
3. **Making Decisions**:
   - If Meta shows `5.4x ROAS` and Google shows `2.1x ROAS`, advise your media buyer to reallocate 20% of Google's budget to Meta to boost the client's overall profits.

---

# CHAPTER 7: Finance, Invoicing & Getting Paid

**Location**: Left Sidebar > Click **Finance** > Click **Invoices**.

---

## 7.1 Creating a 1-Click Tax Invoice with 18% GST

#### 🛠️ HOW TO CREATE AN INVOICE (STEP-BY-STEP):
1. In the top right corner of the Invoices screen, click **+ Create Invoice**.
2. A clean billing form appears:
   - **Client**: Select the client from the dropdown (*Apex Apparel*).
   - **Invoice Date**: Today's date (auto-filled).
   - **Due Date**: Select payment deadline (standard: 15 days from today).
   - **Service Package / Description**: Select or type the service rendered (e.g., *Monthly Performance Retainer & Ad Management*).
   - **SAC Service Code**: System auto-fills `998311` (Information Technology & Advertising Services).
   - **Taxable Amount**: Enter your agreed service fee (e.g., `₹1,00,000`).
3. **Automatic Tax Calculation**:
   - The system automatically calculates 18% GST:
     - **Central GST (CGST @ 9%)**: `₹9,000`
     - **State GST (SGST @ 9%)**: `₹9,000`
     - *(If client is in another state: **Integrated GST (IGST @ 18%)**: `₹18,000`)*
     - **Total Invoice Amount**: `₹1,18,000`
4. Click **Save & Issue Invoice**.
5. The invoice is generated and added to your ledger with status **"UNPAID"**.

---

## 7.2 Downloading the Official A4 Vector PDF Invoice

#### 🛠️ HOW TO DOWNLOAD & SEND THE PDF:
1. In the Invoices table, find the invoice you just generated.
2. Click the **View Invoice** button (or Eye icon).
3. A clean, printable A4 invoice modal appears showing:
   - Your agency's letterhead, logo, and registered address.
   - Client legal name, address, and verified GSTIN.
   - Itemized service breakdown with SAC code and tax lines.
   - Bank transfer details: Account Name, Bank, Account Number, IFSC Code, and UPI ID.
4. Click the blue **Download PDF** button.
5. The vector PDF downloads to your computer. Attach it to an email and send it to the client's finance department!

---

## 7.3 Recording Bank Wire Payments (UTR Numbers)

#### 🛠️ HOW TO MARK AN INVOICE AS PAID:
1. When the client transfers the money into your agency's bank account, open **Finance > Invoices**.
2. Find that invoice in the table.
3. Click the green **Record Payment** button.
4. In the settlement dialog:
   - **Payment Method**: Select *Bank Wire (NEFT / RTGS / IMPS)* or *UPI*.
   - **Transaction Reference (UTR Number)**: Type in the bank reference number from your bank statement (e.g., `UTR9823411209`).
   - **Amount Received**: Enter `₹1,18,000`.
   - **Payment Date**: Select the date the money reached your bank.
5. Click **Confirm Settlement**.
6. The invoice badge immediately turns **GREEN ("PAID")**.
7. Your agency Accounts Receivable drops, your bank collections ledger rises, and your cashflow is fully reconciled!

---

# CHAPTER 8: Operations, Calendar, Documents & Reports

---

## 8.1 Activities & Unified Calendar
**Location**: Left Sidebar > Click **Activities**.

#### 🛠️ HOW TO USE THE CALENDAR:
1. Open the **Activities** tab.
2. The calendar combines 4 different streams:
   - 🔵 **Blue**: Client presentation and review meetings.
   - 🔴 **Red**: Project deliverables and task deadlines.
   - 🟢 **Green**: Invoice due dates.
   - 🟡 **Yellow**: Client contract renewals.
3. **Scheduling a Meeting**:
   - Click the **+ New Event** button.
   - Enter the meeting title, choose the client, set the date/time, and click **Save**.

---

## 8.2 Documents Vault (Tamper-Proof File Storage)
**Location**: Left Sidebar > Click **Documents**.

#### 🛠️ HOW TO UPLOAD & ORGANIZE DOCUMENTS:
1. Click **+ Upload Document**.
2. Drag and drop your file (e.g., *Apex_Apparel_Signed_MSA.pdf* or *Brand_Vector_Logo.svg*).
3. Select the **Document Category** (*Contract*, *Proposal*, *Tax Certificate*, or *Brand Asset*).
4. Associate it with the **Client Entity** (*Apex Apparel*).
5. Click **Upload**.
6. The file is encrypted and saved with a SHA-256 tamper-proof verification hash. You can preview or download it anytime.

---

## 8.3 Executive Reports & Automated QBR Dossiers
**Location**: Left Sidebar > Click **Reports**.

#### 🛠️ HOW TO GENERATE A CLIENT REPORT:
1. Click **Generate Report** in the top right.
2. Select the **Client** (*Apex Apparel*).
3. Choose the **Reporting Period** (e.g., *October 2026*).
4. The system automatically compiles:
   - Deliverables completed by your team.
   - Total stopwatch hours logged.
   - Total ad spend and verified sales.
   - Blended ROAS performance graphs.
5. Click **Export Executive Dossier**. A ready-to-share PDF report downloads for the client's CEO!

---

## 8.4 Notifications Hub
**Location**: Left Sidebar > Click **Notifications** (or Bell icon in top header).

#### 🛠️ HOW TO MANAGE NOTIFICATIONS:
1. Look at the Bell icon in the top header. If an orange badge appears, you have unread alerts.
2. Click the **Bell** icon to view the quick notification panel.
3. Click **View All Notifications** to open the full hub.
4. Filter by:
   - *Milestones*: When client deals close.
   - *Finance*: When invoices are paid or become overdue.
   - *Tasks*: When deliverables are completed or reassigned.
5. Click **Mark All as Read** to clear your alert inbox.

---

# CHAPTER 9: Step-by-Step Walkthrough: From Inbound Lead to Paid Invoice

Follow this realistic, 30-day story showing how your agency takes a brand from a simple website inquiry all the way to a paid GST invoice:

```
DAY 1: Inbound Lead Arrives
  └── Rohan Verma at Apex Apparel submits an inquiry on your website form.
      Sales rep receives a notification in Leads.
      Rep calls Rohan. Budget: ₹1.5 Lakhs/month. ROAS target: 4.0x. Qualified!

DAY 3: Opportunity Created & Proposal Sent
  └── Rep clicks "Convert to Opportunity". Deal card appears in Pipeline.
      Rep opens Proposals, checks "Performance Marketing + Video Creatives",
      and emails official quote PDF for ₹1,50,000 + GST.

DAY 7: Closed Won Milestone!
  └── Rohan signs the proposal! Rep drags deal card to "Closed Won" (Green).
      The 24-Step Onboarding Engine launches automatically!

DAY 8–10: Onboarding Completed in 48 Hours
  └── Phase 1: 60-minute kickoff discovery video call held.
      Phase 2: Meta Business Manager access linked; logins saved in Credential Vault.
      Phase 3: Meta Conversions API (CAPI) installed and verified on Shopify.
      Phase 4: Creative concepts approved; click "Graduate to Active Client".

DAY 12–26: Execution with Live Stopwatch
  └── Designer Maya opens Tasks, assigns herself "Create 16 Festive Video Ads",
      and clicks "Start Focus" on the live stopwatch.
      Logs 28 billable hours. Timesheet permanently protects agency margins.

DAY 28: Checking Ad ROAS in Marketing
  └── Media buyer opens Marketing tab.
      Records ₹18,50,000 ad spend on Facebook and Instagram.
      Attributed sales revenue: ₹89,72,500.
      Blended ROAS: 4.85x! Client is thrilled with the return.

DAY 30: 1-Click GST Invoicing & Settlement
  └── Finance manager opens Finance > Invoices.
      Clicks "+ Create Invoice". Subtotal: ₹1,50,000 + CGST (₹13,500) + SGST (₹13,500) = ₹1,77,000.
      Dispatches vector PDF invoice to Apex finance team.
      Apex sends RTGS bank transfer.
      Manager clicks "Record Payment" and inputs bank UTR number.
      Invoice turns green ("PAID"). Cashflow is 100% reconciled!
```

---

# CHAPTER 10: Troubleshooting & Fixing Common Mistakes

### Q1: I forgot to turn off the stopwatch before leaving my desk! How do I fix my timesheet?
> **How to fix**: Open **My Workspace**, scroll to **Recent Time Entries**, click the **Edit** pencil icon next to that entry, and change the duration to your actual working hours (e.g. change 14 hours to 2 hours 15 minutes). Click **Save**.

### Q2: Why does the Marketing tab show 0.0x ROAS?
> **How to fix**: Ad networks (Meta/Google) require 2 to 6 hours to report purchase conversions. Also verify with your media buyer that the Meta Conversions API (CAPI) pixel event was verified in Phase 3 of onboarding.

### Q3: How do I know whether to charge 18% IGST or 9% CGST + 9% SGST?
> **How to fix**: The system handles this automatically based on the client's GSTIN number!
> - If client is in the **same state** as your agency, the system calculates **9% CGST + 9% SGST**.
> - If client is in a **different state**, the system calculates **18% IGST**. Both equal the exact same 18% total tax.

### Q4: What should I do if the Operational Friction Bar turns red?
> **How to fix**: Click directly on the red alert (e.g. *Overdue Tasks* or *Stale Leads*). The system instantly filters your list to the blocked item. Resolve the item or adjust the date, and the bar immediately turns green again!

### Q5: How do I download this manual as an offline PDF?
> **How to fix**: In the top right corner of the dashboard, click **Export** > **Download Master Tutorial Guide**. A 10-page vector PDF ([`OPTIVIR_CRM_MASTER_GUIDE.pdf`](file:///c:/Users/abhin/Desktop/CRM/OPTIVIR_CRM_MASTER_GUIDE.pdf)) will download immediately.

---

*OptiVir CRM Enterprise Operating System • Engineered for Clear, Calm, High-Margin Agency Execution.*
