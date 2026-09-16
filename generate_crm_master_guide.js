const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const mdPath = path.join(__dirname, 'OPTIVIR_CRM_MASTER_OPERATING_MANUAL.md');
const outputPath = path.join(__dirname, 'OPTIVIR_CRM_MASTER_OPERATING_MANUAL.pdf');

console.log('Reading Markdown source:', mdPath);
const mdContent = fs.readFileSync(mdPath, 'utf8');

// Initialize PDF Document
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true,
  autoFirstPage: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const COLOR_PRIMARY = '#0A1628'; // Deep Navy
const COLOR_SECONDARY = '#1E293B'; // Dark Slate
const COLOR_ACCENT = '#2563EB'; // Royal Blue
const COLOR_CRIMSON = '#B91C1C'; // Crimson Alert
const COLOR_TEXT = '#334155'; // Body Text Slate
const COLOR_LIGHT_BG = '#F1F5F9'; // Soft Slate Box
const COLOR_BORDER = '#CBD5E1'; // Border line
const COLOR_SUCCESS = '#059669'; // Emerald

// Cover Header Banner
function drawHeaderBanner() {
  doc.rect(50, 40, doc.page.width - 100, 75).fill('#0A1628');
  
  doc.fillColor('#FFFFFF')
     .font('Helvetica-Bold')
     .fontSize(18)
     .text('OPTIVIR CRM — MASTER OPERATING MANUAL', 65, 52, { width: doc.page.width - 130 });
     
  doc.fillColor('#94A3B8')
     .font('Helvetica')
     .fontSize(9.5)
     .text('Enterprise Performance Marketing OS • Comprehensive Systems & Client Intake Blueprint', 65, 76);

  doc.fillColor('#38BDF8')
     .font('Helvetica-Bold')
     .fontSize(8.5)
     .text('VERSION 4.8  |  CBIC GST SAC 998361 COMPLIANT  |  CONFIDENTIAL & PROPRIETARY', 65, 92);

  doc.y = 135;
}

drawHeaderBanner();

// Parse Markdown Lines
const lines = mdContent.split('\n');

let inCodeBlock = false;
let codeBuffer = [];
let inTable = false;
let tableRows = [];

function checkPageSpace(requiredHeight = 40) {
  if (doc.y + requiredHeight > doc.page.height - 60) {
    doc.addPage();
    doc.y = 50;
  }
}

function renderCodeBox(text) {
  checkPageSpace(60);
  const startY = doc.y;
  const boxWidth = doc.page.width - 100;
  
  doc.font('Courier').fontSize(8);
  const textHeight = doc.heightOfString(text, { width: boxWidth - 20 });
  
  if (startY + textHeight + 20 > doc.page.height - 60) {
    doc.addPage();
  }
  
  const actualY = doc.y;
  doc.rect(50, actualY, boxWidth, textHeight + 16).fillAndStroke('#F8FAFC', '#E2E8F0');
  
  doc.fillColor('#0F172A')
     .font('Courier')
     .fontSize(8)
     .text(text, 60, actualY + 8, { width: boxWidth - 20, lineGap: 2 });
     
  doc.y = actualY + textHeight + 24;
}

function renderTable(rows) {
  if (rows.length === 0) return;
  checkPageSpace(rows.length * 24 + 30);
  
  const tableWidth = doc.page.width - 100;
  const colWidths = [150, 85, 85, 85, 90]; // standard 5-col
  
  let currentY = doc.y;
  
  rows.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    const rowHeight = 22;
    
    if (currentY + rowHeight > doc.page.height - 60) {
      doc.addPage();
      currentY = 50;
    }
    
    // Background
    if (isHeader) {
      doc.rect(50, currentY, tableWidth, rowHeight).fill('#1E293B');
    } else {
      doc.rect(50, currentY, tableWidth, rowHeight).fill(rowIndex % 2 === 0 ? '#F8FAFC' : '#FFFFFF');
    }
    
    // Border
    doc.rect(50, currentY, tableWidth, rowHeight).stroke('#CBD5E1');
    
    // Cells
    let currentX = 50;
    row.forEach((cell, cellIdx) => {
      const cellWidth = colWidths[cellIdx] || 90;
      doc.fillColor(isHeader ? '#FFFFFF' : '#334155')
         .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(8)
         .text(cell.trim(), currentX + 5, currentY + 6, {
           width: cellWidth - 10,
           align: cellIdx === 0 ? 'left' : 'center',
           ellipsis: true
         });
      currentX += cellWidth;
    });
    
    currentY += rowHeight;
  });
  
  doc.y = currentY + 14;
}

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  // Skip title lines handled by banner
  if (i < 7) continue;

  // Handle Code Blocks
  if (line.trim().startsWith('```')) {
    if (inCodeBlock) {
      // End code block
      renderCodeBox(codeBuffer.join('\n'));
      codeBuffer = [];
      inCodeBlock = false;
    } else {
      inCodeBlock = true;
      codeBuffer = [];
    }
    continue;
  }

  if (inCodeBlock) {
    codeBuffer.push(line);
    continue;
  }

  // Handle Tables
  if (line.trim().startsWith('|')) {
    if (line.includes('---')) continue; // Skip separator line
    const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    tableRows.push(cells);
    inTable = true;
    continue;
  } else if (inTable) {
    renderTable(tableRows);
    tableRows = [];
    inTable = false;
  }

  const trimmed = line.trim();
  if (!trimmed) {
    doc.y += 4;
    continue;
  }

  // Headings
  if (trimmed.startsWith('## ')) {
    checkPageSpace(50);
    const title = trimmed.replace(/^##\s+/, '');
    doc.y += 10;
    
    // Section Accent Bar
    doc.rect(50, doc.y, 4, 18).fill('#2563EB');
    
    doc.fillColor(COLOR_PRIMARY)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text(title, 60, doc.y + 1);
       
    doc.y += 12;
    // Divider line
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#E2E8F0').stroke();
    doc.y += 8;
  } else if (trimmed.startsWith('### ')) {
    checkPageSpace(35);
    const subTitle = trimmed.replace(/^###\s+/, '');
    doc.y += 6;
    doc.fillColor('#0F172A')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(subTitle, 50, doc.y);
    doc.y += 4;
  } else if (trimmed.startsWith('#### ')) {
    checkPageSpace(25);
    const subSubTitle = trimmed.replace(/^####\s+/, '');
    doc.y += 4;
    doc.fillColor('#1E293B')
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(subSubTitle, 50, doc.y);
    doc.y += 3;
  } else if (trimmed.startsWith('* [ ]') || trimmed.startsWith('- [ ]')) {
    // Interactive Checklist
    checkPageSpace(20);
    const text = trimmed.replace(/^(\*|-)\s+\[\s*\]\s+/, '');
    
    // Draw checkbox box
    doc.rect(52, doc.y + 1, 9, 9).strokeColor('#64748B').stroke();
    
    doc.fillColor(COLOR_TEXT)
       .font('Helvetica')
       .fontSize(9)
       .text(text.replace(/\*\*(.*?)\*\*/g, '$1'), 68, doc.y, {
         width: doc.page.width - 118,
         lineGap: 2
       });
    doc.y += 4;
  } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
    // Bullet Point
    checkPageSpace(18);
    const text = trimmed.replace(/^(\*|-)\s+/, '');
    
    doc.fillColor('#2563EB')
       .fontSize(10)
       .text('•', 52, doc.y);
       
    doc.fillColor(COLOR_TEXT)
       .font('Helvetica')
       .fontSize(9)
       .text(text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'), 65, doc.y, {
         width: doc.page.width - 115,
         lineGap: 2
       });
    doc.y += 3;
  } else if (/^\d+\.\s+/.test(trimmed)) {
    // Numbered List
    checkPageSpace(20);
    const match = trimmed.match(/^(\d+)\.\s+(.*)/);
    const num = match[1];
    const text = match[2];
    
    doc.fillColor('#0284C7')
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(`${num}.`, 50, doc.y, { width: 16 });
       
    doc.fillColor(COLOR_TEXT)
       .font('Helvetica')
       .fontSize(9)
       .text(text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'), 68, doc.y, {
         width: doc.page.width - 118,
         lineGap: 2
       });
    doc.y += 3;
  } else if (trimmed === '---') {
    checkPageSpace(15);
    doc.y += 6;
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#E2E8F0').stroke();
    doc.y += 8;
  } else {
    // Standard paragraph
    checkPageSpace(20);
    doc.fillColor(COLOR_TEXT)
       .font('Helvetica')
       .fontSize(9)
       .text(trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'), 50, doc.y, {
         width: doc.page.width - 100,
         lineGap: 2
       });
    doc.y += 4;
  }
}

// If table was left open at end
if (inTable && tableRows.length > 0) {
  renderTable(tableRows);
}

// Add Page Footers (Page X of Y)
const totalPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  
  // Footer Line
  doc.moveTo(50, doc.page.height - 35)
     .lineTo(doc.page.width - 50, doc.page.height - 35)
     .strokeColor('#E2E8F0')
     .stroke();

  // Left text
  doc.fillColor('#94A3B8')
     .font('Helvetica')
     .fontSize(7.5)
     .text('OptiVir Technologies Pvt. Ltd. • Performance Marketing Operating System', 50, doc.page.height - 26);

  // Right page number
  doc.fillColor('#64748B')
     .font('Helvetica-Bold')
     .fontSize(7.5)
     .text(`Page ${i + 1} of ${totalPages}`, doc.page.width - 120, doc.page.height - 26, {
       width: 70,
       align: 'right'
     });
}

doc.end();

writeStream.on('finish', () => {
  console.log(`✅ PDF generated successfully: ${outputPath} (${totalPages} pages)`);
});
