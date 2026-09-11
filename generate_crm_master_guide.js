/**
 * OptiVir CRM - The Complete Click-by-Click Operating Manual & Visual UI Architecture (PDF Edition)
 * 
 * Specifically engineered for agency founders, account managers, media buyers,
 * operations leads, and finance staff.
 * 
 * Design Specifications:
 * - Exactly 12 high-density, perfectly budgeted pages (Zero empty or sparse pages)
 * - Strict vertical coordinate budgeting to prevent ANY text overlapping or auto-pagination
 * - Rich visual UI blueprints: Vector App Shell Wireframe & 14-Module Lifecycle Flowchart
 * - Explicit "HOW TO USE IT (STEP-BY-STEP)" instructions for every single functionality
 * - Rich color palette: Navy Dark (#0A1628), Crimson (#B91C1C), Emerald (#059669), Slate (#334155)
 * - Step-by-step operating instructions with real-world numbers and concrete formulas
 * - Unified running headers and "Page X of 12" running footers
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath = path.join(__dirname, 'OPTIVIR_CRM_MASTER_GUIDE.pdf');
const tutorialPdfPath = path.join(__dirname, 'OPTIVIR_CRM_MASTER_TUTORIAL.pdf');
const LOGO_PATH = path.join(__dirname, 'frontend/public/images/optivir-logo.png');

// Initialize PDF Document with precise margins
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 20, bottom: 20, left: 42, right: 42 },
  bufferPages: true,
  autoFirstPage: true,
  info: {
    Title: 'OptiVir CRM — Operating Manual & Visual UI Architecture',
    Author: 'OptiVir Enterprise Systems',
    Subject: 'Comprehensive Non-Technical Agency Operating Manual & Visual UI Guide',
    Keywords: 'CRM, Dashboard, Operating Manual, Agency OS, ROAS, Invoicing, UI Architecture',
    CreationDate: new Date()
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Professional Executive Color Palette
const C = {
  navyDark: '#0A1628',
  navyCard: '#112240',
  navySidebar: '#0E1A30',
  navyBorder: '#1E2D4A',
  crimson: '#B91C1C',
  crimsonMuted: '#991B1B',
  crimsonLight: '#FCA5A5',
  crimsonBg: '#FEF2F2',
  blue: '#1D4ED8',
  blueBg: '#EFF6FF',
  textDark: '#0F172A',
  textBody: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
  borderDark: '#CBD5E1',
  cardBg: '#F8FAFC',
  emerald: '#059669',
  emeraldBg: '#ECFDF5',
  amber: '#D97706',
  amberBg: '#FFFBEB',
  purple: '#6D28D9',
  purpleBg: '#F5F3FF'
};

const pageWidth = doc.page.width;
const pageHeight = doc.page.height;
const contentWidth = pageWidth - 84; // 42 pt margin each side = 511.28 pt

// =========================================================================
// REUSABLE PIXEL-PERFECT RENDERING COMPONENTS
// =========================================================================

function renderSectionHeader(title, subtitle, tag = 'SECTION') {
  const startY = doc.y;
  
  // Crimson accent bar
  doc.rect(42, startY, 4, 20).fill(C.crimson);

  doc.fillColor(C.crimson)
     .fontSize(6.5)
     .font('Helvetica-Bold')
     .text(tag.toUpperCase(), 52, startY, { lineBreak: false });

  doc.fillColor(C.navyDark)
     .fontSize(10.0)
     .font('Helvetica-Bold')
     .text(title, 52, startY + 8, { lineBreak: false });

  let currentY = startY + 21;
  if (subtitle) {
    doc.fillColor(C.textMuted)
       .fontSize(6.8)
       .font('Helvetica')
       .text(subtitle, 52, currentY, { lineBreak: false });
    currentY += 9.5;
  }

  doc.strokeColor(C.border).lineWidth(0.5).moveTo(42, currentY + 1).lineTo(42 + contentWidth, currentY + 1).stroke();
  doc.y = currentY + 4.0;
}

function renderCard(title, bodyText, options = {}) {
  const bg = options.bg || C.cardBg;
  const border = options.border || C.border;
  const titleColor = options.titleColor || C.navyDark;
  const textWidth = contentWidth - 20;

  doc.fontSize(7.6).font('Helvetica-Bold');
  const titleHeight = title ? doc.heightOfString(title, { width: textWidth }) : 0;

  doc.fontSize(6.8).font('Helvetica');
  const bodyHeight = bodyText ? doc.heightOfString(bodyText, { width: textWidth, lineGap: 1.4 }) : 0;

  const cardHeight = Math.max(24, 5 + titleHeight + (title && bodyText ? 2.5 : 0) + bodyHeight + 5);
  const y = doc.y;

  doc.roundedRect(42, y, contentWidth, cardHeight, 3.5).fillAndStroke(bg, border);

  let curY = y + 5;
  if (title) {
    doc.fillColor(titleColor)
       .fontSize(7.6)
       .font('Helvetica-Bold')
       .text(title, 52, curY, { width: textWidth, lineBreak: false });
    curY += titleHeight + 2.5;
  }

  if (bodyText) {
    doc.fillColor(C.textBody)
       .fontSize(6.8)
       .font('Helvetica')
       .text(bodyText, 52, curY, { width: textWidth, lineGap: 1.4 });
  }

  doc.y = y + cardHeight + (options.marginBottom !== undefined ? options.marginBottom : 4.0);
}

function renderStepBox(stepNum, title, description, actionTag, options = {}) {
  const textWidth = contentWidth - 124;

  doc.fontSize(7.4).font('Helvetica-Bold');
  const titleHeight = doc.heightOfString(title, { width: textWidth });

  doc.fontSize(6.6).font('Helvetica');
  const descHeight = doc.heightOfString(description, { width: textWidth, lineGap: 1.2 });

  const boxHeight = Math.max(32, 5 + titleHeight + 1.5 + descHeight + 5);
  const y = doc.y;

  doc.roundedRect(42, y, contentWidth, boxHeight, 3.5).fillAndStroke(options.bg || '#FFFFFF', options.border || C.border);

  // Circle Badge
  const circleCenterY = y + (boxHeight / 2);
  doc.circle(56, circleCenterY, 8.0).fill(options.badgeColor || C.navyDark);
  doc.fillColor('#FFFFFF')
     .fontSize(6.8)
     .font('Helvetica-Bold')
     .text(String(stepNum), 50, circleCenterY - 3.2, { width: 12, align: 'center', lineBreak: false });

  // Title and Description
  doc.fillColor(C.navyDark)
     .fontSize(7.4)
     .font('Helvetica-Bold')
     .text(title, 72, y + 5, { width: textWidth, lineBreak: false });

  doc.fillColor(C.textBody)
     .fontSize(6.6)
     .font('Helvetica')
     .text(description, 72, y + 5 + titleHeight + 1.2, { width: textWidth, lineGap: 1.2 });

  // Action tag button on the right
  if (actionTag) {
    const tagWidth = 74;
    const tagX = 42 + contentWidth - tagWidth - 7;
    const tagY = y + (boxHeight / 2) - 7.0;

    doc.roundedRect(tagX, tagY, tagWidth, 14, 2.5).fillAndStroke(options.tagBg || C.crimsonBg, options.tagBorder || C.crimson);
    doc.fillColor(options.tagText || C.crimson)
       .fontSize(5.8)
       .font('Helvetica-Bold')
       .text(actionTag, tagX, tagY + 3.5, { width: tagWidth, align: 'center', lineBreak: false });
  }

  doc.y = y + boxHeight + (options.marginBottom !== undefined ? options.marginBottom : 3.8);
}

function renderHowToCard(toolName, clickPath, steps, options = {}) {
  const textWidth = contentWidth - 20;
  
  let stepsText = '';
  steps.forEach((s, idx) => {
    stepsText += `${idx + 1}. ${s}\n`;
  });
  stepsText = stepsText.trim();

  doc.fontSize(7.4).font('Helvetica-Bold');
  const titleHeight = 11.0;

  doc.fontSize(6.6).font('Helvetica');
  const bodyHeight = doc.heightOfString(stepsText, { width: textWidth, lineGap: 1.3 });

  const boxHeight = 6 + titleHeight + 2 + bodyHeight + 6;
  const y = doc.y;

  doc.roundedRect(42, y, contentWidth, boxHeight, 3.5).fillAndStroke(options.bg || '#FFFFFF', options.border || C.border);

  // Left accent bar
  doc.rect(42, y, 3.5, boxHeight).fill(options.accentColor || C.navyDark);

  // Title
  doc.fillColor(options.accentColor || C.navyDark)
     .fontSize(7.4)
     .font('Helvetica-Bold')
     .text(`HOW TO USE: ${toolName.toUpperCase()}`, 52, y + 5.5, { lineBreak: false });

  // Click Path Badge on right
  if (clickPath) {
    const pathWidth = 195;
    const pathX = 42 + contentWidth - pathWidth - 8;
    doc.roundedRect(pathX, y + 4.5, pathWidth, 12.0, 2).fill(C.cardBg);
    doc.fillColor(C.textMuted)
       .fontSize(5.6)
       .font('Helvetica-Bold')
       .text(clickPath.toUpperCase(), pathX, y + 6.8, { width: pathWidth, align: 'center', lineBreak: false });
  }

  // Steps body
  doc.fillColor(C.textBody)
     .fontSize(6.6)
     .font('Helvetica')
     .text(stepsText, 52, y + 5.5 + titleHeight + 2.0, { width: textWidth, lineGap: 1.3 });

  doc.y = y + boxHeight + (options.marginBottom !== undefined ? options.marginBottom : 4.0);
}

function renderKeyValueGrid(items, columns = 2, options = {}) {
  const itemWidth = (contentWidth - ((columns - 1) * 8)) / columns;
  const rows = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }

  rows.forEach(rowItems => {
    let maxHeight = 28;
    rowItems.forEach(item => {
      doc.fontSize(6.6).font('Helvetica');
      const valH = doc.heightOfString(item.value, { width: itemWidth - 14, lineGap: 1.2 });
      maxHeight = Math.max(maxHeight, 12 + valH + 5.0);
    });

    const startY = doc.y;

    rowItems.forEach((item, colIdx) => {
      const x = 42 + colIdx * (itemWidth + 8);

      doc.roundedRect(x, startY, itemWidth, maxHeight, 3.5)
         .fillAndStroke(item.bg || '#FFFFFF', item.border || C.border);

      doc.fillColor(item.keyColor || C.textMuted)
         .fontSize(5.8)
         .font('Helvetica-Bold')
         .text(item.key.toUpperCase(), x + 7, startY + 3.8, { width: itemWidth - 14, lineBreak: false });

      doc.fillColor(item.valueColor || C.navyDark)
         .fontSize(6.6)
         .font(item.isBold !== false ? 'Helvetica-Bold' : 'Helvetica')
         .text(item.value, x + 7, startY + 11.5, { width: itemWidth - 14, lineGap: 1.2 });
    });

    doc.y = startY + maxHeight + 3.8;
  });

  doc.y += (options.marginBottom !== undefined ? options.marginBottom : 1.5);
}

function renderTable(headers, rows, colWidths, options = {}) {
  let y = doc.y;

  // Header row
  doc.rect(42, y, contentWidth, 14.0).fill(C.navyDark);
  let curX = 42;
  headers.forEach((h, idx) => {
    const w = colWidths[idx];
    const align = (options.align && options.align[idx]) || 'left';
    doc.fillColor('#FFFFFF')
       .fontSize(6.0)
       .font('Helvetica-Bold')
       .text(h.toUpperCase(), curX + 5, y + 3.8, { width: w - 10, align, lineBreak: false });
    curX += w;
  });

  y += 14.0;

  // Data rows
  rows.forEach((row, rIdx) => {
    let maxRowHeight = 14.0;
    row.forEach((cell, cIdx) => {
      const w = colWidths[cIdx];
      doc.fontSize(6.4).font(options.boldCols && options.boldCols.includes(cIdx) ? 'Helvetica-Bold' : 'Helvetica');
      const cellH = doc.heightOfString(String(cell), { width: w - 10, lineGap: 1.0 });
      maxRowHeight = Math.max(maxRowHeight, cellH + 4.5);
    });

    const rowBg = rIdx % 2 === 0 ? '#FFFFFF' : C.cardBg;
    doc.rect(42, y, contentWidth, maxRowHeight).fillAndStroke(rowBg, C.border);

    curX = 42;
    row.forEach((cell, cIdx) => {
      const w = colWidths[cIdx];
      const align = (options.align && options.align[cIdx]) || 'left';
      const isBold = options.boldCols && options.boldCols.includes(cIdx);
      const isColor = (options.colorCols && options.colorCols[cIdx]) || C.textBody;

      doc.fillColor(isColor)
         .fontSize(6.4)
         .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
         .text(String(cell), curX + 5, y + 2.5, { width: w - 10, align, lineGap: 1.0 });

      curX += w;
    });

    y += maxRowHeight;
  });

  doc.y = y + (options.marginBottom !== undefined ? options.marginBottom : 4.0);
}

// =========================================================================
// PAGE 1: SYSTEM OVERVIEW, OPERATING PHILOSOPHY & DAILY SCHEDULE
// =========================================================================
function renderPage1() {
  doc.y = 36;
  doc.rect(42, 36, contentWidth, 96).fillAndStroke(C.navyDark, C.crimson);
  doc.rect(42, 36, contentWidth, 3.5).fill(C.crimson);

  let textStartX = 54;
  if (fs.existsSync(LOGO_PATH)) {
    doc.roundedRect(52, 46, 106, 33, 3.5).fill('#FFFFFF');
    doc.image(LOGO_PATH, 56, 50, { width: 98 });
    textStartX = 170;
  }

  doc.fillColor(C.crimsonLight)
     .fontSize(7.2)
     .font('Helvetica-Bold')
     .text('OPTIVIR CRM • COMPLETE STEP-BY-STEP OPERATING MANUAL', textStartX, 45, { lineBreak: false });

  doc.fillColor('#FFFFFF')
     .fontSize(13.0)
     .font('Helvetica-Bold')
     .text('EVERY FUNCTIONALITY EXPLAINED FOR NON-TECHNICAL TEAMS', textStartX, 56, { lineBreak: false });

  doc.fillColor('#94A3B8')
     .fontSize(7.0)
     .font('Helvetica')
     .text('A friendly, click-by-click handbook for agency founders, account managers, media buyers & finance staff', textStartX, 72, { lineBreak: false });

  const badges = [
    { text: 'Zero Tech Jargon', col: C.crimson },
    { text: 'Click-by-Click Steps', col: C.blue },
    { text: 'Visual UI Architecture', col: C.purple },
    { text: 'Real Numbers & Examples', col: C.emerald }
  ];
  let bx = textStartX;
  badges.forEach(b => {
    doc.roundedRect(bx, 86, 73, 12.5, 2).fill(b.col);
    doc.fillColor('#FFFFFF').fontSize(5.6).font('Helvetica-Bold').text(b.text, bx, 89.5, { width: 73, align: 'center', lineBreak: false });
    bx += 77;
  });

  doc.y = 140;

  renderSectionHeader('1. WHAT IS OPTIVIR CRM? (THE DIGITAL AGENCY OFFICE)', 'Think of it as your agency\'s complete digital office building');

  renderCard(
    'THE CENTRAL OPERATING SYSTEM FOR PERFORMANCE AGENCIES',
    'Imagine if your sales address book, price quote generator, 24-step client onboarding checklist, Facebook/Google ad monitors, billable hours stopwatch, and GST tax cash register were all united on one clean, beautiful screen.\n\n' +
    'That is OptiVir CRM. It is built specifically for service agencies (marketing, advertising, web design, and consulting). It helps you capture leads, send official price quotes, welcome clients without confusion, track work hours down to the second, verify advertising return on investment (ROAS), and collect payments without friction.',
    { bg: C.cardBg, border: C.borderDark, marginBottom: 5 }
  );

  renderSectionHeader('2. WHY DO WE USE IT? (THE HEADACHES IT SOLVES)', 'No more lost emails, forgotten tasks, or free out-of-scope work');

  renderKeyValueGrid([
    {
      key: 'THE OLD MESSY WAY (CHAOTIC & STRESSFUL)',
      value: 'Inquiries lost in WhatsApp chats, 10 different Excel sheets, untracked extra hours, misplaced client passwords, delayed invoices, and guessing ad profitability.',
      bg: C.crimsonBg, border: C.crimson, valueColor: C.crimson, keyColor: C.crimson
    },
    {
      key: 'THE OPTIVIR WAY (CALM & HIGH-MARGIN)',
      value: 'Every client has 1 central folder, deals advance on a visual Kanban board, work hours are timed with a live stopwatch, ad ROAS is verified, and GST invoices are 1-click.',
      bg: C.emeraldBg, border: C.emerald, valueColor: C.emerald, keyColor: C.emerald
    }
  ], 2, { marginBottom: 5 });

  renderSectionHeader('3. DAILY OPERATING SCHEDULE: WHEN TO USE WHICH TOOL', 'Quick reference for your everyday work routine from 9:00 AM to 6:00 PM');

  const whenTable = [
    ['09:00 AM • Morning Check-In', 'Open Management Dashboard & My Workspace to review meetings and due deliverables.', 'Dashboard'],
    ['When an Inquiry Arrives', 'Go to Leads. Record contact info, company name, and budget. Qualify with BANT.', 'CRM > Leads'],
    ['Pitching & Quoting Prices', 'Open Proposals. Select service modules, calculate taxes, and email the official PDF.', 'Sales > Proposals'],
    ['When a Deal is Signed', 'Drag deal card to "Closed Won". The system automatically launches 24-step onboarding.', 'Onboarding'],
    ['Working on Client Tasks', 'Click "Start Focus" on the live top-bar Stopwatch to record billable minutes.', 'Projects > Tasks'],
    ['Reviewing Ad Results', 'Open Marketing to verify Blended ROAS and channel metrics across Meta and Google.', 'Marketing'],
    ['Month-End Invoicing', 'Open Finance. Generate an 18% GST invoice (9% CGST + 9% SGST) and record bank UTR.', 'Finance']
  ];

  renderTable(
    ['Time / Trigger', 'What You Do in OptiVir CRM', 'Module Screen'],
    whenTable,
    [115, 295, 101],
    { boldCols: [0], colorCols: { 0: C.navyDark, 2: C.crimson }, marginBottom: 0 }
  );
}

// =========================================================================
// PAGE 2: VISUAL UI BLUEPRINT I: GLOBAL SHELL & WIREFRAME ARCHITECTURE
// =========================================================================
function renderPage2() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'VISUAL UI BLUEPRINT I: GLOBAL APPLICATION SHELL & LAYOUT WIREFRAME',
    'Pixel-level architectural blueprint of OptiVir CRM\'s responsive two-column cockpit',
    'UI ARCHITECTURE'
  );

  const startY = doc.y;
  const wireframeH = 228;

  // Outer application frame
  doc.roundedRect(42, startY, contentWidth, wireframeH, 4).fillAndStroke('#0A121F', '#334155');

  // --- TOPBAR HEADER (y = startY, h = 24) ---
  doc.roundedRect(42, startY, contentWidth, 24, 4).fill('#0B1727');
  doc.rect(42, startY + 20, contentWidth, 4).fill('#0B1727'); // flatten bottom corners

  // Logo Badge
  doc.roundedRect(48, startY + 4, 38, 16, 2).fill('#FFFFFF');
  doc.fillColor(C.navyDark).fontSize(6.2).font('Helvetica-Bold').text('OPTIVIR', 52, startY + 8, { lineBreak: false });

  // Search Bar Pill
  doc.roundedRect(92, startY + 4, 150, 16, 3).fill('#162238');
  doc.fillColor('#94A3B8').fontSize(6.0).font('Helvetica').text('🔍 Omnisearch (Ctrl + K)...', 98, startY + 8.5, { lineBreak: false });

  // Topbar Right Badges
  let rx = 42 + contentWidth - 195;
  // Date Pill
  doc.roundedRect(rx, startY + 4, 52, 16, 2).fill('#162238');
  doc.fillColor('#CBD5E1').fontSize(5.4).font('Helvetica').text('📅 Oct 2026', rx + 4, startY + 8.5, { lineBreak: false });
  rx += 56;

  // Team Pill
  doc.roundedRect(rx, startY + 4, 48, 16, 2).fill('#162238');
  doc.fillColor('#CBD5E1').fontSize(5.4).font('Helvetica').text('👥 All Teams', rx + 4, startY + 8.5, { lineBreak: false });
  rx += 52;

  // Bell Badge
  doc.roundedRect(rx, startY + 4, 18, 16, 2).fill('#162238');
  doc.fillColor('#F59E0B').fontSize(6.0).font('Helvetica-Bold').text('🔔', rx + 4.5, startY + 8.0, { lineBreak: false });
  rx += 22;

  // + New Crimson Button
  doc.roundedRect(rx, startY + 4, 36, 16, 2).fill(C.crimson);
  doc.fillColor('#FFFFFF').fontSize(5.8).font('Helvetica-Bold').text('+ New', rx + 6, startY + 8.5, { lineBreak: false });
  rx += 40;

  // User Avatar Pill
  doc.roundedRect(rx, startY + 4, 20, 16, 2).fill(C.blue);
  doc.fillColor('#FFFFFF').fontSize(5.8).font('Helvetica-Bold').text('AM', rx + 4, startY + 8.5, { lineBreak: false });

  // --- LEFT 256px SIDEBAR (x = 42, y = startY + 24, w = 104, h = wireframeH - 24) ---
  const sideW = 104;
  const sideY = startY + 24;
  const sideH = wireframeH - 24;
  doc.rect(42, sideY, sideW, sideH).fill('#0E1A30');
  doc.strokeColor('#1E2D4A').lineWidth(0.5).moveTo(42 + sideW, sideY).lineTo(42 + sideW, sideY + sideH).stroke();

  // Sidebar Menu Items
  let my = sideY + 6;
  function renderSideCategory(catName) {
    doc.fillColor('#64748B').fontSize(5.0).font('Helvetica-Bold').text(catName.toUpperCase(), 48, my, { lineBreak: false });
    my += 8;
  }
  function renderSideItem(itemName, isActive = false) {
    if (isActive) {
      doc.roundedRect(46, my - 1, sideW - 8, 11, 2).fill(C.crimson);
      doc.fillColor('#FFFFFF').fontSize(5.6).font('Helvetica-Bold').text(`▸ ${itemName}`, 50, my + 1.5, { lineBreak: false });
    } else {
      doc.fillColor('#94A3B8').fontSize(5.4).font('Helvetica').text(`• ${itemName}`, 50, my + 1.5, { lineBreak: false });
    }
    my += 11.5;
  }

  renderSideCategory('Command');
  renderSideItem('Dashboard', true);
  renderSideItem('My Workspace');

  renderSideCategory('Revenue / CRM');
  renderSideItem('Leads (1,482)');
  renderSideItem('Deal Pipeline');
  renderSideItem('Proposals (SOW)');

  renderSideCategory('Operations');
  renderSideItem('Clients (142)');
  renderSideItem('Tasks & Stopwatch');
  renderSideItem('Marketing (ROAS)');
  renderSideItem('Finance (Invoices)');

  // --- MAIN CONTENT VIEWPORT (x = 42 + sideW, y = sideY, w = contentWidth - sideW, h = sideH) ---
  const viewX = 42 + sideW;
  const viewW = contentWidth - sideW;
  const viewY = sideY;
  const viewH = sideH;
  doc.rect(viewX, viewY, viewW, viewH).fill('#F8FAFC');

  // Perspective Switcher Bar
  let py = viewY + 5;
  const pTabs = ['Management', 'Sales', 'Marketing', 'Finance', 'My Desk'];
  let px = viewX + 6;
  pTabs.forEach((tab, idx) => {
    const isAct = idx === 0;
    doc.roundedRect(px, py, 46, 11, 2).fillAndStroke(isAct ? C.navyDark : '#FFFFFF', isAct ? C.navyDark : C.border);
    doc.fillColor(isAct ? '#FFFFFF' : C.textBody).fontSize(5.0).font(isAct ? 'Helvetica-Bold' : 'Helvetica').text(tab, px, py + 2.8, { width: 46, align: 'center', lineBreak: false });
    px += 49;
  });

  // Operational Friction Smoke Detector Banner
  const fY = viewY + 19;
  doc.roundedRect(viewX + 6, fY, viewW - 12, 13, 2).fillAndStroke('#ECFDF5', '#059669');
  doc.fillColor('#065F46').fontSize(5.2).font('Helvetica-Bold').text('🟢 OPERATIONAL FRICTION: ALL 14 SYSTEMS RUNNING • 0 OVERDUE TASKS • 0 STALE LEADS', viewX + 10, fY + 3.8, { lineBreak: false });

  // 4 KPI Mini-Cards Row
  const kpiY = viewY + 35;
  const kpiW = (viewW - 12 - 9) / 4;
  const kpis = [
    { label: 'TOTAL REVENUE', val: '₹48.25 Lakhs', col: C.navyDark },
    { label: 'ACTIVE RETAINERS', val: '142 Clients', col: C.blue },
    { label: 'PIPELINE LEADS', val: '1,482 Leads', col: C.emerald },
    { label: 'WIN VELOCITY', val: '18.4 Days', col: C.amber }
  ];
  kpis.forEach((kp, idx) => {
    const kx = viewX + 6 + (idx * (kpiW + 3));
    doc.roundedRect(kx, kpiY, kpiW, 20, 2).fillAndStroke('#FFFFFF', C.border);
    doc.fillColor(C.textMuted).fontSize(4.6).font('Helvetica-Bold').text(kp.label, kx + 4, kpiY + 3, { lineBreak: false });
    doc.fillColor(kp.col).fontSize(6.6).font('Helvetica-Bold').text(kp.val, kx + 4, kpiY + 9.5, { lineBreak: false });
  });

  // 70/30 Split Productivity Workspace Panels
  const splitY = viewY + 58;
  const splitH = viewH - 63;
  const leftW = (viewW - 15) * 0.68;
  const rightW = (viewW - 15) * 0.32;

  // Left 70% Primary Focus Area
  const leftX = viewX + 6;
  doc.roundedRect(leftX, splitY, leftW, splitH, 2.5).fillAndStroke('#FFFFFF', C.border);
  doc.rect(leftX, splitY, leftW, 11).fill(C.navyDark);
  doc.fillColor('#FFFFFF').fontSize(5.0).font('Helvetica-Bold').text('PRIMARY FOCUS CANVAS (70% VIEWPORT) • DEAL PIPELINE / SOW CANVAS', leftX + 6, splitY + 3, { lineBreak: false });

  // Mini Kanban Columns inside Left Canvas
  const colW = (leftW - 14) / 4;
  const kCols = [
    { title: 'Discovery (20%)', deal: 'Apex: ₹1.5L', badge: C.blue },
    { title: 'Audit (40%)', deal: 'Nova: ₹2.2L', badge: C.purple },
    { title: 'Proposal (60%)', deal: 'Zephyr: ₹3.0L', badge: C.amber },
    { title: 'Won (100%)', deal: 'Zenith: ₹1.8L', badge: C.emerald }
  ];
  kCols.forEach((kc, cIdx) => {
    const cx = leftX + 4 + (cIdx * (colW + 2));
    const cy = splitY + 15;
    doc.roundedRect(cx, cy, colW, splitH - 19, 2).fill(C.cardBg);
    doc.fillColor(C.navyDark).fontSize(4.6).font('Helvetica-Bold').text(kc.title, cx + 3, cy + 3, { width: colW - 6, lineBreak: false });
    doc.roundedRect(cx + 3, cy + 12, colW - 6, 18, 1.5).fillAndStroke('#FFFFFF', C.border);
    doc.fillColor(kc.badge).fontSize(5.0).font('Helvetica-Bold').text(kc.deal, cx + 5, cy + 15, { lineBreak: false });
    doc.fillColor(C.textMuted).fontSize(4.0).font('Helvetica').text('Assigned: Maya J.', cx + 5, cy + 22, { lineBreak: false });
  });

  // Right 30% Context & Telemetry Inspector
  const rightX = leftX + leftW + 3;
  doc.roundedRect(rightX, splitY, rightW, splitH, 2.5).fillAndStroke('#FFFFFF', C.border);
  doc.rect(rightX, splitY, rightW, 11).fill('#1E293B');
  doc.fillColor('#FFFFFF').fontSize(5.0).font('Helvetica-Bold').text('TELEMETRY (30%)', rightX + 6, splitY + 3, { lineBreak: false });

  // Live Stopwatch Box inside 30% Panel
  const timerY = splitY + 15;
  doc.roundedRect(rightX + 4, timerY, rightW - 8, 25, 2).fillAndStroke(C.crimsonBg, C.crimsonLight);
  doc.fillColor(C.crimson).fontSize(4.6).font('Helvetica-Bold').text('LIVE BILLABLE STOPWATCH', rightX + 7, timerY + 3, { lineBreak: false });
  doc.fillColor(C.navyDark).fontSize(8.0).font('Helvetica-Bold').text('⏱ 02h 15m 42s', rightX + 7, timerY + 10.5, { lineBreak: false });
  doc.fillColor(C.textMuted).fontSize(4.2).font('Helvetica').text('Active Task: #OPT-9492 (Maya)', rightX + 7, timerY + 19, { lineBreak: false });

  // Priority Checklist inside 30% Panel
  const checkY = timerY + 28;
  doc.fillColor(C.navyDark).fontSize(4.6).font('Helvetica-Bold').text('TODAY\'S ACTION QUEUE', rightX + 6, checkY, { lineBreak: false });
  const tasks = [
    { t: 'Send SOW to Apex', done: true },
    { t: 'Review Meta Ad ROAS', done: true },
    { t: 'Verify GTM Purchase', done: false }
  ];
  tasks.forEach((tk, tidx) => {
    const ty = checkY + 7 + (tidx * 8.5);
    doc.fillColor(tk.done ? C.emerald : C.amber).fontSize(4.8).font('Helvetica-Bold').text(tk.done ? '✓' : '○', rightX + 6, ty, { lineBreak: false });
    doc.fillColor(tk.done ? C.textMuted : C.textDark).fontSize(4.6).font('Helvetica').text(tk.t, rightX + 13, ty, { lineBreak: false });
  });

  doc.y = startY + wireframeH + 6;

  // --- ARCHITECTURAL CALLOUTS ---
  renderSectionHeader(
    'VISUAL LAYOUT ANATOMY & INTERACTION RULES',
    'Three structural design principles powering maximum operational clarity',
    'DESIGN SYSTEM'
  );

  renderKeyValueGrid([
    {
      key: '1. PERSISTENT COMMAND TOPBAR',
      value: 'Unified top control bar housing Omnisearch (Ctrl+K), global date/team filters, unread alert bell, instant "+ New" quick-create drawer, and the team role simulator.',
      bg: '#FFFFFF', border: C.border, valueColor: C.navyDark
    },
    {
      key: '2. CONTEXTUAL 256px SIDEBAR',
      value: 'Structured two-level hierarchy grouping 14 modules into Command, Sales, Operations, Delivery, and Finance. Active routes display high-visibility crimson accent pills.',
      bg: '#FFFFFF', border: C.border, valueColor: C.navyDark
    }
  ], 2, { marginBottom: 3.5 });

  renderCard(
    '3. THE 70/30 SPLIT PRODUCTIVITY VIEWPORT ARCHITECTURE',
    'OptiVir CRM strictly eliminates modal switching fatigue by employing a standardized 70/30 viewport ratio across complex screens:\n' +
    '• Primary Focus Canvas (70%): Houses high-density execution surfaces (Drag-and-drop Kanban boards, SOW proposal builder, A4 invoice editors, and campaign telemetry charts).\n' +
    '• Telemetry & Context Panel (30%): Houses secondary operational tools (Live billable stopwatch, deliverable checklists, activity streams, and credential copy buttons).\n' +
    'This split-screen paradigm allows media buyers and account managers to execute core deliverables without ever losing sight of their daily agenda or billable timer.',
    { bg: C.cardBg, border: C.borderDark, marginBottom: 0 }
  );
}

// =========================================================================
// PAGE 3: VISUAL UI BLUEPRINT II: 14-MODULE ECOSYSTEM & DATA FLOW
// =========================================================================
function renderPage3() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'VISUAL UI BLUEPRINT II: 14-MODULE ECOSYSTEM & DATA LIFECYCLE FLOW',
    'How data flows seamlessly across all 14 modules from initial lead capture to bank settlement',
    'DATA LIFECYCLE'
  );

  const startY = doc.y;
  const flowH = 205;

  // Outer container
  doc.roundedRect(42, startY, contentWidth, flowH, 4).fillAndStroke('#FFFFFF', C.border);
  doc.rect(42, startY, contentWidth, 14).fill(C.navyDark);
  doc.fillColor('#FFFFFF').fontSize(6.2).font('Helvetica-Bold').text('END-TO-END OPERATIONAL DATA PIPELINE (7-STAGE FLOWCHART)', 52, startY + 4, { lineBreak: false });

  // 7 Connected Flow Boxes
  const stages = [
    { num: '01', name: 'LEAD INGESTION', desc: 'Web forms, Meta Lead Ads, Google PPC & cold referrals captured in CRM > Leads.', col: C.navyDark, bg: C.cardBg },
    { num: '02', name: 'BANT QUALIFY', desc: 'Score Budget, Authority, Need, Timeline. Convert to Company + Contact in 1 click.', col: C.blue, bg: C.blueBg },
    { num: '03', name: 'PIPELINE KANBAN', desc: '5 drag-and-drop stages (20% to 100%). Weighted cashflow forecast auto-updates.', col: C.amber, bg: C.amberBg },
    { num: '04', name: 'PROPOSAL / SOW', desc: '3-column builder, SAC 998361 tax coding, legal terms, and signed vector PDF quote.', col: C.purple, bg: C.purpleBg },
    { num: '05', name: '24-STEP ONBOARD', desc: 'Closed Won trigger. Kickoff, AES-256 Credential Vault, and CAPI pixel audit.', col: C.crimson, bg: C.crimsonBg },
    { num: '06', name: 'DELIVERY & TIMER', desc: 'Milestones, tasks, and live billable stopwatch. Margin guard stops scope creep.', col: C.blue, bg: C.blueBg },
    { num: '07', name: 'GST SETTLEMENT', desc: '1-Click 18% GST tax invoice, PDF download, and bank wire UTR payment reconciliation.', col: C.emerald, bg: C.emeraldBg }
  ];

  // Render 2 rows of flow boxes
  // Row 1: Stages 01 to 04
  const bW = (contentWidth - 28 - 24) / 4;
  const bH = 75;
  let fy = startY + 20;

  stages.slice(0, 4).forEach((st, idx) => {
    const fx = 42 + 14 + (idx * (bW + 8));
    doc.roundedRect(fx, fy, bW, bH, 3).fillAndStroke(st.bg, st.col);
    
    // Header Badge
    doc.roundedRect(fx + 5, fy + 5, 20, 11, 2).fill(st.col);
    doc.fillColor('#FFFFFF').fontSize(5.6).font('Helvetica-Bold').text(st.num, fx + 5, fy + 7.5, { width: 20, align: 'center', lineBreak: false });

    doc.fillColor(st.col).fontSize(6.4).font('Helvetica-Bold').text(st.name, fx + 28, fy + 7.0, { lineBreak: false });
    doc.fillColor(C.textBody).fontSize(5.6).font('Helvetica').text(st.desc, fx + 5, fy + 20, { width: bW - 10, lineGap: 1.2 });

    // Connecting Arrow (except last in row)
    if (idx < 3) {
      doc.fillColor(C.crimson).fontSize(8.0).font('Helvetica-Bold').text('➔', fx + bW + 1, fy + 32, { lineBreak: false });
    }
  });

  // Connecting vertical indicator between Row 1 and Row 2
  doc.fillColor(C.crimson).fontSize(7.0).font('Helvetica-Bold').text('▼ AUTOMATIC CLOSED WON TRIGGER LAUNCHES DELIVERY ▼', 42, fy + bH + 2.5, { width: contentWidth, align: 'center', lineBreak: false });

  // Row 2: Stages 05 to 07
  const bW2 = (contentWidth - 28 - 16) / 3;
  const fy2 = fy + bH + 13;

  stages.slice(4, 7).forEach((st, idx) => {
    const fx = 42 + 14 + (idx * (bW2 + 8));
    doc.roundedRect(fx, fy2, bW2, bH, 3).fillAndStroke(st.bg, st.col);

    // Header Badge
    doc.roundedRect(fx + 5, fy2 + 5, 20, 11, 2).fill(st.col);
    doc.fillColor('#FFFFFF').fontSize(5.6).font('Helvetica-Bold').text(st.num, fx + 5, fy2 + 7.5, { width: 20, align: 'center', lineBreak: false });

    doc.fillColor(st.col).fontSize(6.4).font('Helvetica-Bold').text(st.name, fx + 28, fy2 + 7.0, { lineBreak: false });
    doc.fillColor(C.textBody).fontSize(5.6).font('Helvetica').text(st.desc, fx + 5, fy2 + 20, { width: bW2 - 10, lineGap: 1.2 });

    if (idx < 2) {
      doc.fillColor(C.crimson).fontSize(8.0).font('Helvetica-Bold').text('➔', fx + bW2 + 1, fy2 + 32, { lineBreak: false });
    }
  });

  doc.y = startY + flowH + 6;

  // --- ENTITY CASCADE TABLE ---
  renderSectionHeader(
    'ENTITY CASCADE & DATA RELATIONSHIP MATRIX',
    'How each business entity inherits and cascades data to the next operational phase',
    'DATA INTEGRITY'
  );

  const cascadeTable = [
    ['Inbound Lead', 'First Name, Email, Phone, Source, Budget (₹1.5L)', 'Validates BANT fit (Budget, Authority, Need, Timeline).'],
    ['Company & Contact', 'Legal Entity Name, 15-Digit GSTIN, Stakeholder Title', 'Forms the legal backbone for compliant tax billing.'],
    ['Deal Opportunity', 'Contract Value, Pipeline Stage, Closing Target Date', 'Generates weighted cashflow forecasts for executive planning.'],
    ['Onboarding Dossier', '24 Step Status, Platform Logins, Looker Studio URL', 'Ensures zero dropped handoffs from sales to account teams.'],
    ['Delivery Task', 'Estimated Hours, Due Date, Live Stopwatch Minutes', 'Credits billable execution time against contracted retainers.'],
    ['Tax Invoice', 'SAC 998361, 9% CGST + 9% SGST, Total Due (Rs. 1.18L)', 'Computes audit-ready tax ledgers and dispatchable A4 PDFs.'],
    ['Payment Settlement', 'Bank Transaction UTR, Payment Date, Cashflow Balance', 'Instantly turns invoice green ("PAID") and reconciles runway.']
  ];

  renderTable(
    ['Operational Entity', 'Key Fields Inherited & Stored', 'Downstream Business Effect'],
    cascadeTable,
    [105, 195, 211],
    { boldCols: [0], colorCols: { 0: C.navyDark, 2: C.emerald }, marginBottom: 0 }
  );
}

// =========================================================================
// PAGE 4: CHAPTER 1: THE TOP NAVIGATION & COMMAND TOOLS (ALL 7 TOOLS)
// =========================================================================
function renderPage4() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'CHAPTER 1: TOP NAVIGATION & COMMAND TOOLS (HOW TO USE THEM)',
    'Global remote controls permanently accessible from every screen in the system'
  );

  renderHowToCard(
    '1.1 Global Omnisearch (Ctrl + K)',
    'Keyboard Shortcut: Ctrl+K / Cmd+K',
    [
      'Press Ctrl + K (Windows) or Cmd + K (Mac) on your keyboard from ANY page in the CRM.',
      'Type any 2 or 3 letters of a client name, invoice number, or task title (e.g. "Apex" or "INV-001").',
      'A dropdown list appears instantly showing matched records categorized by type (Clients, Invoices, Tasks).',
      'Press Enter or click the matching record to jump directly into that screen. Press Esc to close.'
    ],
    { accentColor: C.blue, marginBottom: 4.0 }
  );

  renderHowToCard(
    '1.2 Quick Create Menu (+ New Button)',
    'Top Header > Click Red "+ New" Button',
    [
      'Click the red "+ New" button in the top right header (or black "+ Create" on Dashboard).',
      'A menu drops down with 3 options: "Create Lead", "Create Opportunity", or "Generate Invoice".',
      'Click your desired option, fill in the popup modal form, and click Submit.',
      'Your new record is saved into the database immediately without leaving your current work screen.'
    ],
    { accentColor: C.crimson, marginBottom: 4.0 }
  );

  renderKeyValueGrid([
    {
      key: '1.3 DATE RANGE FILTER (CALENDAR)',
      value: 'Click the Calendar button in the top right. Select "This Month", "Previous Month", "Q4 FY2026", or "Year to Date". All dashboard revenue, ad spend, and hours instantly recalculate.',
      bg: '#FFFFFF', border: C.border, valueColor: C.navyDark
    },
    {
      key: '1.4 DEPARTMENT & TEAM FILTER',
      value: 'Click "All Teams" next to Date. Filter between Revenue Team (sales/deals), Marketing (media buyers/ROAS), Engineering (dev/pixels), or Operations (invoices/billing).',
      bg: '#FFFFFF', border: C.border, valueColor: C.navyDark
    }
  ], 2, { marginBottom: 3.8 });

  renderKeyValueGrid([
    {
      key: '1.5 EXPORT CONSOLE (DOWNLOADS)',
      value: 'Click the Export button to download: 1) Master Tutorial Guide (PDF), 2) Architecture Structure PDF, or 3) Print Live Dashboard cleanly without browser clutter.',
      bg: C.blueBg, border: C.blue, valueColor: C.blue
    },
    {
      key: '1.6 DARK / LIGHT THEME SWITCHER',
      value: 'Click the Moon/Sun icon in the top header. Switch instantly between Clean Studio Light (#FFFFFF) for daylight and Executive Dark Navy (#0A121F) for night.',
      bg: C.cardBg, border: C.borderDark, valueColor: C.navyDark
    }
  ], 2, { marginBottom: 4.0 });

  renderHowToCard(
    '1.7 Team Persona Simulator (Role Switcher)',
    'Top Header > Click User Avatar Pill',
    [
      'Click the user avatar pill in the top right header to preview the CRM through different employee roles.',
      'Select Marcus Vance (CEO/Ops Lead) to inspect profit margins, bank collections, and executive alerts.',
      'Select Alex Morgan (Sales Director) for pipeline quotas; Rahul Menon (Delivery Lead) for tasks; Maya Joseph (Media Buyer) for ad spend & ROAS.',
      'Workspace permissions and viewports adapt immediately to that role\'s security policies.'
    ],
    { accentColor: C.purple, marginBottom: 0 }
  );
}

// =========================================================================
// PAGE 5: CHAPTER 2: THE 5 COMMAND DASHBOARDS
// =========================================================================
function renderPage5() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'CHAPTER 2: THE 5 COMMAND DASHBOARDS (HOW TO USE EACH)',
    'Directly below the top greeting, click the 5 perspective buttons to switch departmental views'
  );

  renderCard(
    '2.1 MANAGEMENT DASHBOARD & THE OPERATIONAL FRICTION BAR (SMOKE DETECTOR)',
    '• For: Founders, Managing Directors, and Operations Leads.\n' +
    '• How to use: Click "Management Dashboard". Review the 4 North Star cards (Total Revenue, Active Retainer Clients, Pipeline Leads, Deal Velocity).\n' +
    '• Resolving Friction: Look at the Friction Banner directly below the buttons. If GREEN, the agency is running smoothly. If it turns RED, alerts have fired! Click the red alert pills (Overdue Tasks, Unpaid Invoices, or Stale Leads > 24h) to jump straight to the blocked deliverables and resolve them immediately.',
    { bg: C.cardBg, border: C.borderDark, marginBottom: 4.0 }
  );

  renderCard(
    '2.2 SALES DASHBOARD (PIPELINE & WEIGHTED FORECASTING)',
    '• For: Sales Reps, Account Executives, and Sales Directors.\n' +
    '• How to use: Click "Sales Dashboard". View Total Active Pipeline and the Weighted Cashflow Forecast Formula:\n' +
    '  Weighted Forecast = Sum of (Deal Contract Value × Stage Probability Percent)\n' +
    '  (e.g., a ₹10,00,000 deal in Proposal Sent at 60% probability contributes ₹6,00,000 to the quarter\'s expected cashflow).\n' +
    '• Advancing Deals: In the deals table at the bottom, click the red action button on the far right to advance deals to final review or closed won.',
    { bg: C.blueBg, border: C.blue, titleColor: C.blue, marginBottom: 4.0 }
  );

  renderCard(
    '2.3 MARKETING DASHBOARD (AD SPEND, SALES & BLENDED ROAS)',
    '• For: Media Buyers, Growth Marketers, and CMOs.\n' +
    '• How to use: Click "Marketing Dashboard". Check the 4 core metrics: Total Ad Spend, Attributed Sales, Blended ROAS (Sales ÷ Spend), and Cost Per Lead (CPL).\n' +
    '• Comparing Channels: Scroll down to the Channel Matrix table. Compare the ROAS Multiple column for Meta vs. Google. If Meta shows 5.2x and Google shows 1.8x, advise your media buyer to shift 20% of Google\'s budget to Meta to maximize total agency-managed revenue.',
    { bg: C.purpleBg, border: C.purple, titleColor: C.purple, marginBottom: 4.0 }
  );

  renderCard(
    '2.4 FINANCE DASHBOARD (COLLECTIONS, AR AGING & RUNWAY)',
    '• For: Agency Owners, CFOs, and Accountants.\n' +
    '• How to use: Click "Finance Dashboard". Review Net Collections (actual deposited bank cash) and AR Overdue (late client payments).\n' +
    '• Runway Formula: Cash Reserves ÷ Monthly Overhead Burn (Salaries + Office Rent). Shows exact survival months.\n' +
    '• AR Aging Brackets: Current (<30d) is green; 31–60d triggers polite reminders; >90d flags critical collection risk to pause ad accounts.',
    { bg: C.amberBg, border: C.amber, titleColor: C.amber, marginBottom: 4.0 }
  );

  renderCard(
    '2.5 MY WORKSPACE DASHBOARD (DAILY DESK & LIVE STOPWATCH)',
    '• For: Every single team member as their personal morning cockpit.\n' +
    '• How to use: Click "My Dashboard". Review "My Day: Today" on the left for scheduled client calls and internal sprint standups. On the right, work through the "My Deliverable Checklist". As you finish each deliverable, click its checkbox to turn it green. Use the live stopwatch to time your work.',
    { bg: C.emeraldBg, border: C.emerald, titleColor: C.emerald, marginBottom: 0 }
  );
}

// =========================================================================
// PAGE 6: CHAPTER 3: SALES & CRM MODULES (LEADS TO PROPOSALS)
// =========================================================================
function renderPage6() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'CHAPTER 3: SALES & CRM MODULES (LEADS TO PROPOSALS)',
    'Convert incoming inquiries into paying retainer clients through a structured pipeline'
  );

  renderHowToCard(
    '3.1 Create & Qualify Leads',
    'Left Sidebar > Click Leads > Click "+ Add Lead"',
    [
      'Click the blue "+ Add Lead" button in the top right corner of the Leads screen.',
      'Fill in Lead Name (Rohan Verma), Company Name (Apex Apparel), Work Email, and Mobile Phone.',
      'Select Lead Source (Website Form, Meta Lead Ad, Google PPC, LinkedIn, or Referral) and enter Estimated Budget (₹1,50,000/mo).',
      'Verify BANT criteria (Budget, Authority, Need, Timeline) and click "Save Lead" to add the prospect to your active leads list.'
    ],
    { accentColor: C.blue, marginBottom: 3.8 }
  );

  renderHowToCard(
    'Convert Lead to Opportunity',
    'Leads Table > Click Lead Row > Click "Convert to Deal"',
    [
      'Open the lead record after completing your initial discovery phone call.',
      'If the prospect confirms interest in receiving a formal proposal, click the green "Convert to Deal" button.',
      'The system automatically creates a Company profile, Contact profile, and places a Deal Card on your visual Sales Pipeline!'
    ],
    { accentColor: C.emerald, marginBottom: 3.8 }
  );

  renderKeyValueGrid([
    {
      key: '3.2 COMPANIES (ACCOUNTS DIRECTORY)',
      value: 'Stores registered legal business entities (e.g. Apex Apparel Pvt Ltd), 15-digit GSTIN tax ID (e.g. 27AABCU9603R1ZM), HQ address, website URL, and linked invoices.',
      bg: '#FFFFFF', border: C.border, valueColor: C.navyDark
    },
    {
      key: '3.3 CONTACTS (CLIENT ADDRESS BOOK)',
      value: 'Stores individual human decision-makers (e.g. Sneha Patel, Marketing VP) with direct mobile phone number, personal email, and LinkedIn profile URLs.',
      bg: '#FFFFFF', border: C.border, valueColor: C.navyDark
    }
  ], 2, { marginBottom: 3.8 });

  renderSectionHeader(
    '3.5 DEAL PIPELINE KANBAN (VISUAL DRAG-AND-DROP)',
    'Track deals from first call to signed contract across 5 probability stages'
  );

  renderStepBox(
    1,
    'Stage 1: Discovery (20%) ➔ Stage 2: Audit & Strategy (40%)',
    'Drag card from Discovery to Audit after strategy call. Media buyer analyzes historical ad accounts to find wasted spend.',
    'DISCOVERY / AUDIT',
    { badgeColor: C.navyDark, marginBottom: 3.5 }
  );

  renderStepBox(
    2,
    'Stage 3: Proposal Sent (60%) ➔ Stage 4: Negotiation (80%)',
    'Deliver formal quote and SOW. Weighted forecast updates. Drag to Negotiation while legal terms and scope are reviewed.',
    'PROPOSAL / NEGOTIATION',
    { badgeColor: C.amber, marginBottom: 3.5 }
  );

  renderStepBox(
    3,
    'Stage 5: CLOSED WON (100% Probability) — AUTOMATIC TRIGGER!',
    'When contract is signed, drag card to Closed Won. AUTOMATIC TRIGGER: System launches the 24-Step Onboarding Engine!',
    'CLOSED WON 🎉',
    { badgeColor: C.emerald, marginBottom: 3.8 }
  );

  renderHowToCard(
    '3.6 Create & Send Proposals (Price Quotes & SOWs)',
    'Left Sidebar > Click Proposals > Click "+ New Proposal"',
    [
      'Click "+ New Proposal", select Client Entity (Apex Apparel), and check services (Performance Media ₹1,00,000 + Video Creatives ₹50,000).',
      'System auto-calculates taxable subtotal (₹1,50,000) and sets 14-day validity. Click "Generate Proposal PDF" to download signed contract.'
    ],
    { accentColor: C.purple, marginBottom: 0 }
  );
}

// =========================================================================
// PAGE 7: CHAPTER 4: CLIENT SUCCESS, ONBOARDING & CREDENTIAL VAULT
// =========================================================================
function renderPage7() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'CHAPTER 4: CLIENT SUCCESS, ONBOARDING & CREDENTIAL VAULT',
    'Welcome new clients flawlessly through a standardized 4-phase onboarding blueprint'
  );

  renderKeyValueGrid([
    {
      key: '4.1 ACTIVE CLIENTS & HEALTH SCORES',
      value: '🟢 Green (80-100%): Happy client, high ROAS, invoices paid on time.\n🟡 Yellow (50-79%): Needs attention, deliverable close to deadline.\n🔴 Red (<50%): High churn risk! Founder/Lead should reach out immediately.',
      bg: '#FFFFFF', border: C.border, valueColor: C.navyDark
    },
    {
      key: '4.2 CLIENT 360° (8 DEDICATED TABS)',
      value: 'Master binder with 8 tabs: 1. Overview, 2. Campaign Telemetry (ROAS graphs), 3. Projects, 4. Timesheet Summary, 5. Invoices Ledger, 6. Credential Vault, 7. Document Vault, 8. Activity Stream.',
      bg: '#FFFFFF', border: C.border, valueColor: C.navyDark
    }
  ], 2, { marginBottom: 3.8 });

  renderSectionHeader(
    '4.3 THE 24-STEP ONBOARDING BLUEPRINT (4 PHASES)',
    'Guarantees your team welcomes every client without chaos or missing logins'
  );

  renderStepBox(
    1,
    'Phase 1: Kickoff & Alignment (Steps 1 – 6)',
    'Check off Step 1 (Assign Account Manager), Step 2 (Send Welcome Packet), Step 3 (Schedule 60-min Discovery Call), Step 4 (Align on ROAS Targets), Step 5 (Create Slack Channel), Step 6 (Set Calendar).',
    'PHASE 1',
    { badgeColor: C.blue, marginBottom: 3.5 }
  );

  renderStepBox(
    2,
    'Phase 2: Assets & Access Collection (Steps 7 – 12)',
    'Request Meta Business Manager partner access, link Google Ads Customer ID (CID), collect Shopify logins, and save all passwords securely in the Credential Vault. Download vector logos and brand fonts.',
    'PHASE 2',
    { badgeColor: C.purple, marginBottom: 3.5 }
  );

  renderStepBox(
    3,
    'Phase 3: Technical Setup & Pixel Audit (Steps 13 – 18)',
    'Install Meta Conversions API (CAPI), configure Google Tag Manager (GTM), test GA4 e-commerce purchase tracking events, connect real-time Looker Studio reporting, and upload product catalog feed.',
    'PHASE 3',
    { badgeColor: C.amber, marginBottom: 3.5 }
  );

  renderStepBox(
    4,
    'Phase 4: Launch & Graduation (Steps 19 – 24)',
    'Produce first 8 video ads, write high-converting copy, obtain client sign-off, publish ads live, complete 72-hour spend audit, and click green "Graduate to Active Client" button to begin regular monthly servicing.',
    'GRADUATE',
    { badgeColor: C.emerald, marginBottom: 3.8 }
  );

  renderHowToCard(
    '4.4 The Credential Vault (Safe Password Locker)',
    'Client 360° > Click "Credential Vault" Tab > Click "+ Add Credential"',
    [
      'Open the client\'s folder, click the Credential Vault tab, and click "+ Add Credential".',
      'Select platform (Meta Business Manager, Google Ads CID, or Shopify Admin) and input username and password.',
      'The password is encrypted with AES-256 standards. Teammates click "Copy" to use credentials safely without exposure in chats.'
    ],
    { accentColor: C.crimson, marginBottom: 0 }
  );
}

// =========================================================================
// PAGE 8: CHAPTER 5: DELIVERY, PROJECTS & TIME TRACKING
// =========================================================================
function renderPage8() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'CHAPTER 5: DELIVERY, PROJECTS & TIME TRACKING',
    'Organize deliverable milestones and track work hours to protect agency profit margins'
  );

  renderHowToCard(
    '5.1 Create & Manage Projects (Delivery Milestones)',
    'Left Sidebar > Click Projects > Click "+ New Project"',
    [
      'Click "+ New Project". Enter Project Title (e.g. Apex Apparel - Diwali Festive Blitz).',
      'Select Client, enter Start Date and Target Launch Date.',
      'Add key milestones: Milestone 1 (Creative Scripts Approved), Milestone 2 (16 Videos Rendered), Milestone 3 (Campaign Live).',
      'Click "Save Project". Milestones automatically sync to the agency master delivery calendar.'
    ],
    { accentColor: C.navyDark, marginBottom: 3.8 }
  );

  renderHowToCard(
    '5.2 Create & Assign Tasks (Operational Checklists)',
    'Left Sidebar > Click Tasks > Click "+ New Task"',
    [
      'Click "+ New Task". Write an action title (e.g. "Design 4 Instagram Reel Ad Variants").',
      'Select Client (Apex Apparel), assign team member (Maya Joseph), and set Estimated Duration (3.5 Hours).',
      'Set Priority: Urgent (Due today / ad budget blocked), High (Due in 48h), or Normal (Standard weekly deliverable).',
      'Click "Save Task". The item immediately appears in that team member\'s My Workspace checklist.'
    ],
    { accentColor: C.blue, marginBottom: 3.8 }
  );

  renderSectionHeader(
    '5.3 THE LIVE BILLABLE STOPWATCH (CLICK-BY-CLICK OPERATING STEPS)',
    'Track execution time down to the second to protect agency margins from unpaid scope creep'
  );

  renderStepBox(
    1,
    'Step 1: Click "Start Focus" When You Begin Work',
    'Look at the top bar or open My Workspace. Click "Start Focus" (or the Play icon). The timer begins counting seconds in real-time as you execute.',
    'START TIMER',
    { badgeColor: C.crimson, marginBottom: 3.5 }
  );

  renderStepBox(
    2,
    'Step 2: Click "Pause" for Breaks or Meetings',
    'If you pause for lunch, coffee, or attend an internal agency standup, click "Pause". The timer freezes your elapsed minutes until you return.',
    'PAUSE',
    { badgeColor: C.amber, marginBottom: 3.5 }
  );

  renderStepBox(
    3,
    'Step 3: Click "Stop & Log" to Credit Hours to the Retainer',
    'When finished, click "Stop & Log". A popup confirms: "Logged 2 Hours 15 Minutes". Type a brief note ("Rendered 4 video hook variants") and click Save.',
    'LOG HOURS',
    { badgeColor: C.emerald, marginBottom: 3.8 }
  );

  renderCard(
    'WHY THE STOPWATCH GUARDS AGENCY PROFIT (SCOPE CREEP PROTECTION)',
    'When clients ask for "just one quick extra banner", agencies often execute it without billing. Over a year, this costs agencies hundreds of unbilled hours. OptiVir CRM couples every task with an active stopwatch so that every minute is recorded against client retainer agreements. If client demands exceed contracted hours, timesheets provide indisputable proof for retainer expansion.',
    { bg: C.amberBg, border: C.amber, titleColor: C.amber, marginBottom: 0 }
  );
}

// =========================================================================
// PAGE 9: CHAPTER 6: PERFORMANCE MARKETING & AD ATTRIBUTION
// =========================================================================
function renderPage9() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'CHAPTER 6: PERFORMANCE MARKETING & AD ATTRIBUTION',
    'Monitor advertising return across Facebook, Instagram, Google, and TikTok'
  );

  renderStepBox(
    1,
    'Inspect the Top 4 Marketing Numbers Daily',
    'Open the Marketing tab. Review: 1) Total Ad Spend (money spent across platforms), 2) Attributed Revenue (sales generated), 3) Blended ROAS (revenue multiplier), and 4) Cost Per Lead (CPL).',
    'MARKETING',
    { badgeColor: C.navyDark, marginBottom: 3.5 }
  );

  renderStepBox(
    2,
    'Mastering the ROAS Formula (Return on Ad Spend)',
    'ROAS equals Attributed Revenue divided by Total Ad Spend. Example: If you spend ₹20,000 on Facebook Ads and generate ₹1,00,000 in sales, that is a 5.0x ROAS! Anything above 3.5x is very profitable for e-commerce.',
    'ROAS FORMULA',
    { badgeColor: C.crimson, marginBottom: 3.5 }
  );

  renderStepBox(
    3,
    'Compare Meta vs. Google Channels to Allocate Budget',
    'Scroll down to the Channel Matrix table. Look at the ROAS Multiple column. If Meta shows 5.4x ROAS and Google shows 2.1x ROAS, advise your client to shift 20% of Google budget to Meta to maximize total sales.',
    'ATTRIBUTION',
    { badgeColor: C.purple, marginBottom: 3.8 }
  );

  renderSectionHeader(
    '6.2 CHANNEL ATTRIBUTION MATRIX & MARKETING UNIT ECONOMICS',
    'Actionable steps to evaluate Cost Per Lead (CPL) and Customer Acquisition Cost (CAC)'
  );

  renderHowToCard(
    'Reallocate Budgets by Channel ROAS',
    'Marketing Tab > Channel Attribution Matrix',
    [
      'Review the Blended ROAS column for Meta Ads, Google Ads, and TikTok Ads.',
      'Identify the top-performing network (e.g. Meta at 5.4x ROAS vs. Google at 2.1x).',
      'Advise the client to shift 20% to 30% of ad spend from lower ROAS channels to the highest-performing channel.',
      'Verify conversion tracking in Onboarding Phase 3 to ensure purchase events are registering accurately.'
    ],
    { accentColor: C.blue, marginBottom: 3.8 }
  );

  renderKeyValueGrid([
    {
      key: 'COST PER LEAD (CPL)',
      value: 'Total Ad Spend divided by verified customer inquiries. Example: ₹10,000 spend ÷ 50 phone calls = ₹200 CPL. Keep CPL below client margin targets.',
      bg: '#FFFFFF', border: C.border, valueColor: C.navyDark
    },
    {
      key: 'CUSTOMER ACQUISITION COST (CAC)',
      value: 'Total ad spend plus agency retainer divided by new paying buyers. Tracks true customer acquisition economics across the agency.',
      bg: '#FFFFFF', border: C.border, valueColor: C.navyDark
    },
    {
      key: 'META ADS (INSTAGRAM & FB)',
      value: 'Best for visual e-commerce, D2C fashion, lifestyle, and impulse shopping. High visual engagement and dynamic product catalog ads.',
      bg: C.blueBg, border: C.blue, valueColor: C.blue
    },
    {
      key: 'GOOGLE SEARCH ADS (INTENT)',
      value: 'Best for high-intent immediate inquiries (dental clinics, emergency repair, enterprise software). Higher cost-per-click but ready-to-buy users.',
      bg: C.emeraldBg, border: C.emerald, valueColor: C.emerald
    }
  ], 2, { marginBottom: 0 });
}

// =========================================================================
// PAGE 10: CHAPTER 7: FINANCE, INVOICING & GETTING PAID
// =========================================================================
function renderPage10() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'CHAPTER 7: FINANCE, INVOICING & GETTING PAID',
    'Generate compliant Indian & global tax invoices, download PDFs, and record settlements'
  );

  renderHowToCard(
    '7.1 Create an Invoice with 18% GST',
    'Left Sidebar > Click Finance > Click Invoices > Click "+ Create Invoice"',
    [
      'Click "+ Create Invoice" in top right. Select Client (Apex Apparel). Issue date defaults to today; set due date to Net 15.',
      'Select Service Package (Monthly Performance Retainer). SAC Service Code 998361 auto-fills.',
      'Enter agreed fee (Rs. 1,00,000). System auto-adds 9% CGST (Rs. 9,000) + 9% SGST (Rs. 9,000) or 18% IGST for interstate clients.',
      'Total Amount Payable computes to Rs. 1,18,000. Click "Save & Issue Invoice".'
    ],
    { accentColor: C.blue, marginBottom: 3.5 }
  );

  renderHowToCard(
    '7.2 Download the Official A4 Vector PDF Invoice',
    'Invoices Table > Click "View Invoice" > Click "Download PDF"',
    [
      'Find your invoice row in the table and click "View Invoice".',
      'An official A4 invoice modal appears with agency letterhead, client GSTIN, SAC code, and bank wire details.',
      'Click "Download PDF". A native vector PDF downloads to your computer, ready to email to client finance.'
    ],
    { accentColor: C.emerald, marginBottom: 3.5 }
  );

  renderHowToCard(
    '7.3 Record Bank Wire Payment (Mark as Paid)',
    'Invoices Table > Click "Record Payment"',
    [
      'When client transfers money into your bank account, click "Record Payment" next to that invoice.',
      'Select payment method (Bank Wire NEFT/RTGS/IMPS or UPI) and type in the bank transaction UTR Number (e.g. UTR9823411209).',
      'Enter amount received (Rs. 1,18,000) and click "Confirm Settlement". Invoice badge turns green ("PAID"), and cashflow reconciles!'
    ],
    { accentColor: C.crimson, marginBottom: 3.8 }
  );

  renderSectionHeader(
    'FINANCIAL METRICS: A/R AGING & OPERATING RUNWAY',
    'Track outstanding payments and calculate agency survival runway'
  );

  renderStepBox(
    1,
    'Monitor Accounts Receivable Aging Buckets',
    'Inspect Finance > Accounts Receivable. Current (<30d) is green; 31–60d triggers automated payment reminders; >90d flags critical collection risk.',
    'A/R AGING',
    { badgeColor: C.navyDark, marginBottom: 3.5 }
  );

  renderStepBox(
    2,
    'Calculate Operating Runway (Cash Reserves ÷ Burn)',
    'Runway formula: Total Cash in Bank divided by Monthly Overhead (Rent + Payroll). Example: Rs. 36L reserves ÷ Rs. 6L burn = 6.0 Months of Runway.',
    'RUNWAY',
    { badgeColor: C.emerald, marginBottom: 3.8 }
  );

  renderCard(
    'TAX INVOICE CALCULATION BREAKDOWN (GST COMPLIANCE)',
    '• Service Description: Digital Marketing & Creative Production Services • SAC Code: 998361\n' +
    '• Taxable Subtotal: Rs. 1,00,000 • Central GST (CGST @ 9%): Rs. 9,000 • State GST (SGST @ 9%): Rs. 9,000\n' +
    '• (For out-of-state clients: Integrated GST @ 18% = Rs. 18,000) • Total Amount Payable: Rs. 1,18,000\n' +
    '• Invoices clearly display agency bank name, account number, IFSC code, and registered GSTIN.',
    { bg: C.cardBg, border: C.borderDark, marginBottom: 0 }
  );
}

// =========================================================================
// PAGE 11: CHAPTER 8: OPERATIONS, CALENDAR, DOCUMENTS & REPORTS
// =========================================================================
function renderPage11() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'CHAPTER 8: OPERATIONS, CALENDAR, DOCUMENTS & REPORTS',
    'Day-to-day administrative execution, encrypted document storage, and executive reporting'
  );

  renderHowToCard(
    '8.1 Activities & Unified 4-Stream Calendar',
    'Left Sidebar > Click Activities',
    [
      'Review aggregated calendar streams: 🔵 Blue (client review meetings), 🔴 Red (task deadlines), 🟢 Green (invoice due dates), and 🟡 Yellow (retainer renewals).',
      'Click "+ New Event" to schedule a client meeting or internal sprint review. Enter title, select client, pick time, and click Save.',
      'The meeting syncs directly to the assigned account manager\'s My Workspace desk.'
    ],
    { accentColor: C.purple, marginBottom: 3.8 }
  );

  renderHowToCard(
    '8.2 Documents Vault (SHA-256 Tamper-Proof Storage)',
    'Left Sidebar > Click Documents',
    [
      'Click "+ Upload Document" to store signed Master Service Agreements (MSAs), NDAs, tax certificates, or client vector brand logos.',
      'Drag and drop your file, select Document Category (Contract, Proposal, Tax Certificate, Brand Asset), and choose the Client Entity.',
      'Every file is saved with tamper-proof SHA-256 verification hash. You can preview, verify, or download it anytime.'
    ],
    { accentColor: C.blue, marginBottom: 3.8 }
  );

  renderHowToCard(
    '8.3 Executive Reports & Automated QBR Dossiers',
    'Left Sidebar > Click Reports',
    [
      'Click "Generate Report", select Client (Apex Apparel) and billing month (e.g. October 2026).',
      'The system automatically compiles: completed deliverables, logged stopwatch hours, total ad spend, attributed revenue, and ROAS graphs.',
      'Click "Export Executive Dossier" to download a clean, branded PDF report ready to present to the client\'s CEO!'
    ],
    { accentColor: C.emerald, marginBottom: 3.8 }
  );

  renderHowToCard(
    '8.4 Notifications Hub & Alert Center',
    'Left Sidebar > Click Notifications (or Bell icon in top header)',
    [
      'Look at the Bell icon in the top header. An orange badge indicates unread action items.',
      'Click the Bell icon for the quick slide-out panel, or click "View All Notifications" to open the full hub.',
      'Filter alerts by: Milestones (signed deals), Finance (paid or overdue invoices), or Tasks (assignments). Click "Mark All as Read" to clear.'
    ],
    { accentColor: C.crimson, marginBottom: 3.8 }
  );

  renderCard(
    'THE OPERATIONAL BACKBONE OF HIGH-RETENTION AGENCIES',
    'Agencies lose clients when communication drops or deadlines slip unnoticed. OptiVir CRM centralizes calendar meetings, legal contracts, executive performance reports, and real-time alerts so that every client interaction is documented, professional, and audit-ready.',
    { bg: C.cardBg, border: C.borderDark, marginBottom: 0 }
  );
}

// =========================================================================
// PAGE 12: CHAPTER 9 & 10: REAL-WORLD JOURNEY & TROUBLESHOOTING FAQ
// =========================================================================
function renderPage12() {
  doc.addPage();
  doc.y = 38;

  renderSectionHeader(
    'CHAPTER 9: THE 30-DAY APEX APPAREL REAL-WORLD JOURNEY',
    'How a performance agency executes everyday operations inside OptiVir CRM from lead to cash'
  );

  renderCard(
    'COMPLETE CASE STUDY: INBOUND LEAD TO PAID INVOICE',
    '• Day 1 (Inbound Lead): Prospect Rohan Verma submits inquiry. Sales rep calls within 20 mins. Budget: ₹1.5L/mo. Qualified!\n' +
    '• Day 3 (Proposal Sent): Rep converts lead to Deal, opens Proposals, checks services, and emails PDF quote for ₹1,50,000 + GST.\n' +
    '• Day 7 (Closed Won!): Client signs. Rep drags card to Won. 24-step onboarding checklist launches automatically!\n' +
    '• Day 8-10 (Onboarding): Kickoff held (Phase 1), logins saved in Vault (Phase 2), CAPI installed (Phase 3), ads launched (Phase 4).\n' +
    '• Day 12-26 (Execution): Designer Maya clicks "Start Focus" on stopwatch, logging 28 hours creating 16 festive video ads.\n' +
    '• Day 28 (Marketing): Marketing tab shows: ₹18.5 Lakhs spent, ₹89.7 Lakhs in sales (4.85x ROAS!). Client is thrilled.\n' +
    '• Day 30 (GST Billing): Finance issues invoice with 9% CGST + 9% SGST (Total: ₹1,77,000). Client pays via RTGS. Invoice marked PAID!',
    { bg: '#FFFFFF', border: C.border, marginBottom: 4.0 }
  );

  renderSectionHeader(
    'CHAPTER 10: TROUBLESHOOTING & FIXING COMMON MISTAKES',
    'Clear answers to the most common questions non-technical staff ask'
  );

  const faqTable = [
    ['Q1: Forgot to stop timer', 'Open My Workspace > Recent Time Entries. Click Edit pencil, change duration, and click Save.'],
    ['Q2: 0.0x ROAS in Marketing', 'Ad networks take 2–6h to sync purchases. Confirm Meta CAPI was verified in Onboarding Phase 3.'],
    ['Q3: IGST vs CGST/SGST', 'Auto-detected from client GSTIN: Same state = 9% CGST + 9% SGST. Out-of-state = 18% IGST.'],
    ['Q4: Friction Bar is Red', 'Click the red alert pill (Overdue Tasks or Stale Leads). Resolve the item to restore Green status.']
  ];

  renderTable(
    ['Common Question / Issue', 'How to Fix It in OptiVir CRM'],
    faqTable,
    [145, 366],
    { boldCols: [0], colorCols: { 0: C.navyDark, 1: C.textBody }, marginBottom: 4.0 }
  );

  renderSectionHeader(
    'FOUR GOLDEN AGENCY HABITS FOR MAXIMUM PROFIT',
    'Essential operational disciplines to keep your agency calm and high-margin'
  );

  const rulesTable = [
    ['1. Log Work Real-Time', 'Record leads, tasks, and payments the moment they occur for real-time sync.', 'Real-Time Sync'],
    ['2. Always Use Stopwatch', 'Run the timer during client tasks to prevent unbilled overtime and scope creep.', 'Profit Guard'],
    ['3. Clear Friction Daily', 'Check the Red Friction Bar every morning before 10:30 AM to prevent backlog.', 'Zero Backlog'],
    ['4. Standardize Legal Names', 'Use complete registered legal names and 15-digit GSTINs for audit-proof bills.', 'Audit-Proof']
  ];

  renderTable(
    ['Golden Habit', 'Why It Matters to Your Agency', 'Operational Benefit'],
    rulesTable,
    [125, 275, 111],
    { boldCols: [0], colorCols: { 0: C.navyDark, 2: C.emerald }, marginBottom: 0 }
  );
}

// =========================================================================
// EXECUTE GENERATION SEQUENCE (EXACTLY 12 PAGES)
// =========================================================================
renderPage1();
renderPage2();
renderPage3();
renderPage4();
renderPage5();
renderPage6();
renderPage7();
renderPage8();
renderPage9();
renderPage10();
renderPage11();
renderPage12();

// =========================================================================
// RUNNING HEADERS & FOOTERS (EXACTLY PAGE X OF 12)
// =========================================================================
const range = doc.bufferedPageRange();
const totalPages = range.count;

for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  doc.page.margins.bottom = 0;

  // Running Top Header (Pages 2+)
  if (i > 0) {
    doc.fillColor(C.textMuted).fontSize(6.8).font('Helvetica')
       .text('OPTIVIR CRM • MASTER OPERATING MANUAL & VISUAL UI ARCHITECTURE', 42, 16, { lineBreak: false });
    doc.text('HOW TO USE EVERY FUNCTIONALITY', doc.page.width - 240, 16, { width: 198, align: 'right', lineBreak: false });
    doc.rect(42, 26, contentWidth, 0.5).fill(C.border);
  }

  // Running Bottom Footer (All Pages)
  const footerY = pageHeight - 24;
  doc.rect(42, footerY - 4, contentWidth, 0.5).fill(C.border);

  doc.fillColor(C.textMuted).fontSize(6.8).font('Helvetica')
     .text('OPTIVIR CRM • PERFORMANCE AGENCY OPERATING SYSTEM • CONFIDENTIAL & PROPRIETARY', 42, footerY, { lineBreak: false });

  const pageString = `Page ${i + 1} of ${totalPages}`;
  doc.text(pageString, doc.page.width - 120, footerY, { width: 78, align: 'right', lineBreak: false });
}

// Finalize Document
doc.end();

writeStream.on('finish', () => {
  const stats = fs.statSync(outputPath);

  // Copy to OPTIVIR_CRM_MASTER_TUTORIAL.pdf in root
  fs.copyFileSync(outputPath, tutorialPdfPath);

  // Copy to frontend/public for instant web access
  const publicDir = path.join(__dirname, 'frontend', 'public');
  if (fs.existsSync(publicDir)) {
    fs.copyFileSync(outputPath, path.join(publicDir, 'OPTIVIR_CRM_MASTER_GUIDE.pdf'));
    fs.copyFileSync(outputPath, path.join(publicDir, 'OPTIVIR_CRM_MASTER_TUTORIAL.pdf'));
  }

  console.log(`[SUCCESS] Master Guide PDF generated with flawless pagination!`);
  console.log(`File Path: ${outputPath}`);
  console.log(`Tutorial PDF Path: ${tutorialPdfPath}`);
  console.log(`Total Pages: ${totalPages}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);
});
