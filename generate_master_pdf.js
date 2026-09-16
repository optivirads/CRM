const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const mdPath = path.join(__dirname, 'OPTIVIR_CRM_MASTER_COMPREHENSIVE_MANUAL.md');
const outputPath = path.join(__dirname, 'OPTIVIR_CRM_MASTER_OPERATING_MANUAL.pdf');

console.log('Reading Comprehensive Markdown Source:', mdPath);
const mdContent = fs.readFileSync(mdPath, 'utf8');

// Initialize PDF Document
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 45, bottom: 45, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Brand Colors
const COLORS = {
  navyDark: '#0A1628',
  navyCard: '#112240',
  navyBorder: '#1E3A8A',
  crimson: '#B91C1C',
  blue: '#2563EB',
  blueBg: '#EFF6FF',
  textDark: '#0F172A',
  textMuted: '#64748B',
  textBody: '#334155',
  border: '#CBD5E1',
  cardBg: '#F8FAFC',
  green: '#059669',
  greenBg: '#ECFDF5',
  amber: '#D97706',
  amberBg: '#FFFBEB'
};

const pageWidth = doc.page.width;
const pageHeight = doc.page.height;
const contentWidth = pageWidth - 90; // margins left 45 + right 45 = 90
const bottomLimit = pageHeight - 50;

function checkPageSpace(requiredHeight = 35) {
  if (doc.y + requiredHeight > bottomLimit) {
    if (doc.y > doc.page.margins.top + 15) {
      doc.addPage();
    }
  }
}

// ----------------------------------------------------
// EXECUTIVE TITLE COVER BANNER
// ----------------------------------------------------
function renderCoverBanner() {
  const bannerY = 45;
  const bannerHeight = 110;
  
  // Dark Navy Card
  doc.rect(45, bannerY, contentWidth, bannerHeight).fill(COLORS.navyDark);
  
  // Crimson Accent Top Stripe
  doc.rect(45, bannerY, contentWidth, 4).fill(COLORS.crimson);
  
  // Sub-tag
  doc.fillColor('#38BDF8')
     .font('Helvetica-Bold')
     .fontSize(8.5)
     .text('OPTIVIR CRM  •  ENTERPRISE OPERATING SYSTEM  •  VERSION 4.8', 60, bannerY + 14);
     
  // Main Title
  doc.fillColor('#FFFFFF')
     .font('Helvetica-Bold')
     .fontSize(16)
     .text('MASTER OPERATING MANUAL & EXECUTION BLUEPRINT', 60, bannerY + 28, { width: contentWidth - 30 });
     
  // Subtitle
  doc.fillColor('#94A3B8')
     .font('Helvetica')
     .fontSize(9)
     .text('Complete Field-by-Field Operating Guide, Client Intake Matrix, Onboarding Suite & Tax Compliance', 60, bannerY + 68, { width: contentWidth - 30 });
     
  // Badges Bar
  const badgeY = bannerY + 86;
  const badges = [
    { text: 'CBIC GST SAC 998361', color: '#10B981' },
    { text: 'AES-256 SESSION PERSISTENCE', color: '#3B82F6' },
    { text: '24-STEP ONBOARDING ENGINE', color: '#F59E0B' },
    { text: 'CONFIDENTIAL', color: '#EF4444' }
  ];
  
  let currentBadgeX = 60;
  badges.forEach(b => {
    const textWidth = doc.font('Helvetica-Bold').fontSize(7).widthOfString(b.text);
    doc.roundedRect(currentBadgeX, badgeY, textWidth + 12, 14, 2).fill('#1E293B');
    doc.fillColor(b.color).font('Helvetica-Bold').fontSize(7).text(b.text, currentBadgeX + 6, badgeY + 3.5);
    currentBadgeX += textWidth + 18;
  });
  
  doc.y = bannerY + bannerHeight + 15;
}

renderCoverBanner();

// ----------------------------------------------------
// CODE / WIREFRAME BOX RENDERER
// ----------------------------------------------------
function renderCodeBox(text) {
  checkPageSpace(50);
  const boxWidth = contentWidth;
  doc.font('Courier').fontSize(7.5);
  const textHeight = doc.heightOfString(text, { width: boxWidth - 18 });
  
  if (doc.y + textHeight + 20 > bottomLimit) {
    doc.addPage();
  }
  
  const boxY = doc.y;
  doc.rect(45, boxY, boxWidth, textHeight + 14).fillAndStroke('#0B132B', '#1E293B');
  
  doc.fillColor('#38BDF8')
     .font('Courier')
     .fontSize(7.5)
     .text(text, 54, boxY + 7, { width: boxWidth - 18, lineGap: 1.5 });
     
  doc.y = boxY + textHeight + 20;
}

// ----------------------------------------------------
// TABLE RENDERER
// ----------------------------------------------------
function renderTable(rows) {
  if (rows.length === 0) return;
  checkPageSpace(rows.length * 20 + 25);
  
  const tableWidth = contentWidth;
  const numCols = rows[0].length;
  const firstColWidth = Math.min(160, tableWidth * 0.35);
  const remainingWidth = tableWidth - firstColWidth;
  const otherColWidth = remainingWidth / (numCols - 1);
  
  let currentY = doc.y;
  
  rows.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    const rowHeight = isHeader ? 22 : 19;
    
    if (currentY + rowHeight > bottomLimit) {
      doc.addPage();
      currentY = doc.page.margins.top + 15;
    }
    
    // Background Fill
    if (isHeader) {
      doc.rect(45, currentY, tableWidth, rowHeight).fill(COLORS.navyDark);
    } else {
      doc.rect(45, currentY, tableWidth, rowHeight).fill(rowIndex % 2 === 0 ? '#F8FAFC' : '#FFFFFF');
    }
    
    // Row Border
    doc.rect(45, currentY, tableWidth, rowHeight).stroke(COLORS.border);
    
    // Text in Cells
    let cellX = 45;
    row.forEach((cellText, colIndex) => {
      const colWidth = colIndex === 0 ? firstColWidth : otherColWidth;
      doc.fillColor(isHeader ? '#FFFFFF' : COLORS.textBody)
         .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(7.5)
         .text(cellText.trim(), cellX + 5, currentY + (isHeader ? 6 : 5), {
           width: colWidth - 10,
           align: colIndex === 0 ? 'left' : 'center',
           ellipsis: true
         });
      cellX += colWidth;
    });
    
    currentY += rowHeight;
  });
  
  doc.y = currentY + 12;
}

// ----------------------------------------------------
// CALLOUT BOX RENDERER
// ----------------------------------------------------
function renderCallout(type, text) {
  checkPageSpace(45);
  const boxWidth = contentWidth;
  
  let strokeColor = COLORS.blue;
  let bgColor = COLORS.blueBg;
  let titleColor = COLORS.blue;
  let title = 'OPERATIONAL NOTE';
  
  if (type === 'IMPORTANT' || type === 'CRITICAL' || type === 'WARNING') {
    strokeColor = COLORS.crimson;
    bgColor = '#FEF2F2';
    titleColor = COLORS.crimson;
    title = 'CRITICAL OPERATIONAL REQUIREMENT';
  } else if (type === 'SUCCESS' || type === 'INTAKE') {
    strokeColor = COLORS.green;
    bgColor = COLORS.greenBg;
    titleColor = COLORS.green;
    title = 'CLIENT INTAKE / COMPLIANCE STANDARD';
  } else if (type === 'TIP') {
    strokeColor = COLORS.amber;
    bgColor = COLORS.amberBg;
    titleColor = COLORS.amber;
    title = 'EXECUTIVE PERFORMANCE TIP';
  }
  
  doc.font('Helvetica').fontSize(8);
  const textHeight = doc.heightOfString(text, { width: boxWidth - 24 });
  
  if (doc.y + textHeight + 28 > bottomLimit) {
    doc.addPage();
  }
  
  const startY = doc.y;
  doc.rect(45, startY, boxWidth, textHeight + 24).fillAndStroke(bgColor, strokeColor);
  doc.rect(45, startY, 4, textHeight + 24).fill(strokeColor);
  
  doc.fillColor(titleColor)
     .font('Helvetica-Bold')
     .fontSize(8)
     .text(title, 56, startY + 6);
     
  doc.fillColor(COLORS.textDark)
     .font('Helvetica')
     .fontSize(8)
     .text(text, 56, startY + 18, { width: boxWidth - 24, lineGap: 1.5 });
     
  doc.y = startY + textHeight + 30;
}

// ----------------------------------------------------
// PARSE AND RENDER MARKDOWN CONTENT
// ----------------------------------------------------
const lines = mdContent.split('\n');
let inCode = false;
let codeBuffer = [];
let inTable = false;
let tableRows = [];

for (let i = 0; i < lines.length; i++) {
  const rawLine = lines[i];
  
  // Skip top headers handled by the custom cover banner
  if (i < 8) continue;
  
  // Code Blocks
  if (rawLine.trim().startsWith('```')) {
    if (inCode) {
      renderCodeBox(codeBuffer.join('\n'));
      codeBuffer = [];
      inCode = false;
    } else {
      inCode = true;
      codeBuffer = [];
    }
    continue;
  }
  
  if (inCode) {
    codeBuffer.push(rawLine);
    continue;
  }
  
  // Markdown Tables
  if (rawLine.trim().startsWith('|')) {
    if (rawLine.includes('---')) continue; // Skip delimiter row
    const cells = rawLine.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    tableRows.push(cells);
    inTable = true;
    continue;
  } else if (inTable) {
    renderTable(tableRows);
    tableRows = [];
    inTable = false;
  }
  
  const trimmed = rawLine.trim();
  if (!trimmed) {
    doc.y += 3;
    continue;
  }
  
  // Clean markdown bold / italic formatting for plain text measurements
  const cleanText = (str) => str.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`([^`]+)`/g, '$1');
  
  // CHAPTER HEADINGS (Level 1)
  if (trimmed.startsWith('# CHAPTER')) {
    checkPageSpace(55);
    doc.y += 8;
    
    // Chapter Title Banner Box
    const chapterY = doc.y;
    doc.rect(45, chapterY, contentWidth, 24).fill(COLORS.navyDark);
    doc.rect(45, chapterY, 4, 24).fill(COLORS.crimson);
    
    doc.fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(cleanText(trimmed.replace(/^#\s+/, '')), 56, chapterY + 6);
       
    doc.y = chapterY + 30;
    continue;
  }
  
  // SECTION HEADINGS (Level 2)
  if (trimmed.startsWith('## ')) {
    checkPageSpace(40);
    doc.y += 6;
    const title = cleanText(trimmed.replace(/^##\s+/, ''));
    
    doc.rect(45, doc.y, 3, 15).fill(COLORS.blue);
    doc.fillColor(COLORS.navyDark)
       .font('Helvetica-Bold')
       .fontSize(10.5)
       .text(title, 54, doc.y + 1);
       
    doc.y += 18;
    doc.moveTo(45, doc.y).lineTo(pageWidth - 45, doc.y).strokeColor('#E2E8F0').stroke();
    doc.y += 6;
    continue;
  }
  
  // SUB-SECTION HEADINGS (Level 3)
  if (trimmed.startsWith('### ')) {
    checkPageSpace(30);
    doc.y += 5;
    const subTitle = cleanText(trimmed.replace(/^###\s+/, ''));
    
    doc.fillColor(COLORS.navyDark)
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(subTitle, 45, doc.y);
       
    doc.y += 14;
    continue;
  }
  
  // SUB-SUB HEADINGS (Level 4)
  if (trimmed.startsWith('#### ')) {
    checkPageSpace(22);
    doc.y += 3;
    const subSubTitle = cleanText(trimmed.replace(/^####\s+/, ''));
    
    doc.fillColor(COLORS.textDark)
       .font('Helvetica-Bold')
       .fontSize(8.5)
       .text(subSubTitle, 45, doc.y);
       
    doc.y += 12;
    continue;
  }
  
  // CHECKLIST ITEMS (`* [ ]` or `- [ ]`)
  if (trimmed.startsWith('* [ ]') || trimmed.startsWith('- [ ]')) {
    checkPageSpace(18);
    const itemText = cleanText(trimmed.replace(/^(\*|-)\s+\[\s*\]\s+/, ''));
    
    // Draw Square Checkbox
    doc.rect(46, doc.y + 1, 8, 8).strokeColor('#64748B').stroke();
    
    doc.fillColor(COLORS.textBody)
       .font('Helvetica')
       .fontSize(8)
       .text(itemText, 58, doc.y, { width: contentWidth - 15, lineGap: 1.5 });
       
    doc.y += 3;
    continue;
  }
  
  // NUMBERED LISTS (`1. `, `2. `)
  if (/^\d+\.\s+/.test(trimmed)) {
    checkPageSpace(18);
    const match = trimmed.match(/^(\d+)\.\s+(.*)/);
    const num = match[1];
    const text = cleanText(match[2]);
    
    doc.fillColor(COLORS.blue)
       .font('Helvetica-Bold')
       .fontSize(8)
       .text(`${num}.`, 45, doc.y, { width: 14 });
       
    doc.fillColor(COLORS.textBody)
       .font('Helvetica')
       .fontSize(8)
       .text(text, 61, doc.y, { width: contentWidth - 18, lineGap: 1.5 });
       
    doc.y += 3;
    continue;
  }
  
  // BULLET POINTS (`* `, `- `)
  if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
    checkPageSpace(16);
    const bulletText = cleanText(trimmed.replace(/^(\*|-)\s+/, ''));
    
    doc.fillColor(COLORS.blue)
       .font('Helvetica')
       .fontSize(9)
       .text('•', 47, doc.y - 1);
       
    doc.fillColor(COLORS.textBody)
       .font('Helvetica')
       .fontSize(8)
       .text(bulletText, 57, doc.y, { width: contentWidth - 14, lineGap: 1.5 });
       
    doc.y += 2.5;
    continue;
  }
  
  // BLOCKQUOTES (`> `)
  if (trimmed.startsWith('> ')) {
    const quoteText = cleanText(trimmed.replace(/^>\s+/, ''));
    renderCallout('TIP', quoteText);
    continue;
  }
  
  // HORIZONTAL DIVIDERS (`---`)
  if (trimmed === '---') {
    checkPageSpace(12);
    doc.y += 4;
    doc.moveTo(45, doc.y).lineTo(pageWidth - 45, doc.y).strokeColor('#E2E8F0').stroke();
    doc.y += 6;
    continue;
  }
  
  // STANDARD PARAGRAPHS
  checkPageSpace(16);
  doc.fillColor(COLORS.textBody)
     .font('Helvetica')
     .fontSize(8)
     .text(cleanText(trimmed), 45, doc.y, {
       width: contentWidth,
       lineGap: 2
     });
  doc.y += 3.5;
}

if (inTable && tableRows.length > 0) {
  renderTable(tableRows);
}

// ----------------------------------------------------
// RUNNING HEADERS & FOOTERS (ZERO BLANK PAGES PASS)
// ----------------------------------------------------
const range = doc.bufferedPageRange();
const totalPages = range.count;
console.log(`Document has ${totalPages} content pages. Applying running headers & footers...`);

for (let i = range.start; i < range.start + totalPages; i++) {
  doc.switchToPage(i);
  
  // CRITICAL: Disable bottom margin auto-break during footer drawing
  const origBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  
  // RUNNING TOP HEADER (Pages after Page 1)
  if (i > 0) {
    doc.moveTo(45, 30).lineTo(pageWidth - 45, 30).strokeColor('#E2E8F0').stroke();
    doc.fillColor('#94A3B8')
       .font('Helvetica')
       .fontSize(6.5)
       .text('OPTIVIR CRM — ENTERPRISE OPERATING SYSTEM (V4.8)', 45, 20, { lineBreak: false });
       
    doc.fillColor('#64748B')
       .font('Helvetica-Bold')
       .fontSize(6.5)
       .text('CBIC GST SAC 998361  •  CONFIDENTIAL', pageWidth - 200, 20, { width: 155, align: 'right', lineBreak: false });
  }
  
  // RUNNING FOOTER (Every Page)
  const footerY = pageHeight - 28;
  doc.moveTo(45, footerY - 4).lineTo(pageWidth - 45, footerY - 4).strokeColor('#E2E8F0').stroke();
  
  doc.fillColor('#94A3B8')
     .font('Helvetica')
     .fontSize(7)
     .text('OptiVir Technologies Pvt. Ltd. • Performance Marketing & Agency Operations Manual', 45, footerY, { lineBreak: false });
     
  doc.fillColor('#0F172A')
     .font('Helvetica-Bold')
     .fontSize(7)
     .text(`Page ${i + 1} of ${totalPages}`, pageWidth - 120, footerY, { width: 75, align: 'right', lineBreak: false });
     
  doc.page.margins.bottom = origBottom;
}

doc.end();

writeStream.on('finish', () => {
  console.log(`✅ Master PDF Generated Successfully: ${outputPath}`);
  console.log(`Total Pages: ${totalPages}`);
});
