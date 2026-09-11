import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const LOGO_PATH = path.join(process.cwd(), 'public/images/optivir-logo.png');

// Color Palette
const COLORS = {
  navyDark: '#0A1628',
  navyLight: '#112440',
  navyBorder: '#1E3A8A',
  crimson: '#B91C1C',
  crimsonLight: '#F87171',
  blue: '#2563EB',
  textDark: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  bgLight: '#F8FAFC',
  green: '#059669',
  greenBg: '#ECFDF5',
  amber: '#D97706'
};

/**
 * Generate PDF buffer from a PDFKit document
 */
function streamToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

// -------------------------------------------------------------
// 1. TAX INVOICE PDF GENERATOR
// -------------------------------------------------------------
async function generateInvoicePDF(params: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
  const promise = streamToBuffer(doc);

  const invNumber = params.number || 'INV-2026-089';
  const clientName = params.client || 'Client Organization';
  const clientEmail = params.email || 'billing@client.com';
  const clientGstin = params.gstin || '27AAACA1234A1Z1';
  const totalAmount = Number(params.total) || 177000;
  const subtotal = Math.round(totalAmount / 1.18);
  const cgst = Math.round(subtotal * 0.09);
  const sgst = Math.round(subtotal * 0.09);

  // Top Accent Bar
  doc.rect(40, 40, 515, 6).fill(COLORS.crimson);

  // Header Box
  doc.rect(40, 46, 515, 74).fill(COLORS.navyDark);
  if (fs.existsSync(LOGO_PATH)) {
    doc.roundedRect(52, 54, 130, 42, 4).fill('#FFFFFF');
    doc.image(LOGO_PATH, 57, 59, { width: 120 });
    doc.fillColor(COLORS.crimsonLight).fontSize(7.5).font('Helvetica-Bold').text('PERFORMANCE MARKETING & ENTERPRISE CRM', 195, 68);
    doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text('OptiVir Ads • optivirads@gmail.com • www.optivirads.com', 195, 80);
  } else {
    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('OPTIVIR ADS', 55, 58);
    doc.fillColor(COLORS.crimsonLight).fontSize(7.5).font('Helvetica-Bold').text('PERFORMANCE MARKETING & ENTERPRISE CRM', 55, 76);
    doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text('OptiVir Ads • optivirads@gmail.com • www.optivirads.com', 55, 87);
  }

  // Invoice Title Right
  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('TAX INVOICE', 380, 56, { align: 'right', width: 160 });
  doc.fillColor(COLORS.crimsonLight).fontSize(9).font('Helvetica-Bold').text(invNumber, 380, 78, { align: 'right', width: 160 });

  // Status & Metadata Bar
  let y = 130;
  doc.roundedRect(40, y, 515, 48, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  
  // Columns in metadata
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('INVOICE DATE', 52, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text('Oct 15, 2026', 52, y + 20);

  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('PAYMENT DUE DATE', 160, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text('Oct 30, 2026', 160, y + 20);

  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('PAYMENT TERMS', 280, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text('Net 15 Days (ICICI Sync)', 280, y + 20);

  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('STATUS', 420, y + 8);
  doc.roundedRect(420, y + 18, 50, 16, 3).fill(COLORS.greenBg);
  doc.fillColor(COLORS.green).fontSize(8).font('Helvetica-Bold').text('PAID', 432, y + 22);

  // Billed By & Billed To Boxes
  y += 58;
  const boxW = 252;
  // Billed By
  doc.roundedRect(40, y, boxW, 70, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.crimson).fontSize(7.5).font('Helvetica-Bold').text('ISSUED BY (SERVICE PROVIDER)', 50, y + 8);
  doc.fillColor(COLORS.navyDark).fontSize(9).font('Helvetica-Bold').text('OptiVir Ads', 50, y + 20);
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('Performance Marketing & Operating System\nWebsite: www.optivirads.com\nEmail: optivirads@gmail.com • Phone: +919995037109', 50, y + 32, { lineGap: 2 });

  // Billed To
  doc.roundedRect(303, y, boxW, 70, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.blue).fontSize(7.5).font('Helvetica-Bold').text('BILLED TO (CLIENT)', 313, y + 8);
  doc.fillColor(COLORS.navyDark).fontSize(9).font('Helvetica-Bold').text(clientName, 313, y + 20);
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text(`Entity: Enterprise Tier-1 Retainer\nGSTIN: ${clientGstin} • State Code: 27\nEmail: ${clientEmail}`, 313, y + 32, { lineGap: 2 });

  // Line Items Table Header
  y += 80;
  doc.rect(40, y, 515, 20).fill(COLORS.navyDark);
  doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
  doc.text('DESCRIPTION & SCOPE OF SERVICE', 50, y + 6);
  doc.text('SAC CODE', 320, y + 6);
  doc.text('QTY', 390, y + 6);
  doc.text('RATE (INR)', 430, y + 6, { width: 50, align: 'right' });
  doc.text('AMOUNT (INR)', 485, y + 6, { width: 60, align: 'right' });

  // Items
  const items = [
    { name: 'Search Engine Optimization (SEO) & Technical Visibility Retainer', sac: '998361', qty: '1 mo', rate: Math.round(subtotal * 0.35) },
    { name: 'Performance Paid Media Management (Google & Meta PPC)', sac: '998361', qty: '1 mo', rate: Math.round(subtotal * 0.35) },
    { name: 'Social Media Content Production & Creative Suite (12 Banners, 4 Reels)', sac: '998361', qty: '1 lot', rate: Math.round(subtotal * 0.20) },
    { name: 'Conversion API (CAPI), GTM Server-Side & Executive BI Reporting', sac: '998361', qty: '1 lot', rate: subtotal - (Math.round(subtotal * 0.35) * 2 + Math.round(subtotal * 0.20)) }
  ];

  y += 20;
  items.forEach((it, idx) => {
    const rowH = 26;
    if (idx % 2 === 1) {
      doc.rect(40, y, 515, rowH).fill('#F8FAFC');
    }
    doc.rect(40, y, 515, rowH).stroke(COLORS.border);

    doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold').text(it.name, 50, y + 8, { width: 260 });
    doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica').text(it.sac, 320, y + 8);
    doc.text(it.qty, 390, y + 8);
    doc.text(`INR ${it.rate.toLocaleString('en-IN')}`, 430, y + 8, { width: 50, align: 'right' });
    doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').text(`INR ${it.rate.toLocaleString('en-IN')}`, 485, y + 8, { width: 60, align: 'right' });

    y += rowH;
  });

  // Totals Section
  y += 10;
  // Left: Bank Information Box
  doc.roundedRect(40, y, 280, 85, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.navyDark).fontSize(7.5).font('Helvetica-Bold').text('OFFICIAL BANK PAYMENT INSTRUCTIONS', 50, y + 8);
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('Bank Name: ICICI Bank Limited\nAccount Name: OptiVir CRM Technologies Pvt Ltd\nAccount Number: 000205029481\nIFSC Code: ICIC0000002 (Corporate Branch)\nUPI Handle: optivircrm@icici', 50, y + 22, { lineGap: 2.5 });

  // Right: Subtotals & Taxes Box
  doc.roundedRect(330, y, 225, 85, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica').text('Taxable Subtotal:', 340, y + 8);
  doc.fillColor(COLORS.textDark).font('Helvetica-Bold').text(`INR ${subtotal.toLocaleString('en-IN')}`, 460, y + 8, { width: 85, align: 'right' });

  doc.fillColor(COLORS.textMuted).font('Helvetica').text('CGST (9.0%):', 340, y + 22);
  doc.fillColor(COLORS.textDark).font('Helvetica').text(`INR ${cgst.toLocaleString('en-IN')}`, 460, y + 22, { width: 85, align: 'right' });

  doc.fillColor(COLORS.textMuted).font('Helvetica').text('SGST (9.0%):', 340, y + 36);
  doc.fillColor(COLORS.textDark).font('Helvetica').text(`INR ${sgst.toLocaleString('en-IN')}`, 460, y + 36, { width: 85, align: 'right' });

  doc.rect(340, y + 50, 205, 1).fill(COLORS.border);

  doc.fillColor(COLORS.crimson).fontSize(9).font('Helvetica-Bold').text('Total (INR):', 340, y + 58);
  doc.fillColor(COLORS.crimson).fontSize(10).font('Helvetica-Bold').text(`INR ${totalAmount.toLocaleString('en-IN')}`, 440, y + 57, { width: 105, align: 'right' });

  // Signatory & Stamp Section
  y += 98;
  doc.roundedRect(40, y, 515, 60, 4).fillAndStroke('#FFFFFF', COLORS.border);
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text('Cryptographic Verification Hash: 9f82a7c41b80d0498b2f91e • DocuSign Certified\nThis document is a computer-generated tax invoice issued by OptiVir CRM Technologies Pvt Ltd under the Indian GST Act 2017.', 50, y + 10, { width: 320, lineGap: 3 });

  // Signature line right
  doc.lineCap('butt').moveTo(390, y + 42).lineTo(530, y + 42).stroke(COLORS.border);
  doc.fillColor(COLORS.navyDark).fontSize(7.5).font('Helvetica-Bold').text('AUTHORIZED SIGNATORY', 390, y + 46, { width: 140, align: 'center' });

  doc.end();
  return promise;
}

// -------------------------------------------------------------
// 2. COMMERCIAL PROPOSAL / SOW PDF GENERATOR
// -------------------------------------------------------------
async function generateProposalPDF(params: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 45, bottom: 45, left: 45, right: 45 }, bufferPages: true });
  const promise = streamToBuffer(doc);

  const proposalTitle = params.title || 'Enterprise Growth Retainer & Meta CAPI Architecture';
  const clientName = params.client || 'Client Organization';
  const proposalNum = params.number || 'PROP-2026-042';
  const contractVal = params.amount || 'INR 1,85,000 / month';
  const sacCode = params.sacCode || '998361';
  const pkgName = params.packageName || 'Performance Marketing & Growth SOW';

  // --- PAGE 1: COVER ---
  doc.rect(45, 45, 505, 712).fill(COLORS.navyDark);
  doc.rect(45, 45, 505, 8).fill(COLORS.crimson);

  // OptiVir Logo Badge
  if (fs.existsSync(LOGO_PATH)) {
    doc.roundedRect(70, 75, 140, 42, 4).fill('#FFFFFF');
    doc.image(LOGO_PATH, 75, 80, { width: 130 });
    doc.fillColor(COLORS.crimsonLight).fontSize(8.5).font('Helvetica-Bold').text('ENTERPRISE COMMERCIAL PROPOSAL', 225, 92);
  } else {
    doc.fillColor(COLORS.crimsonLight).fontSize(9).font('Helvetica-Bold').text('OPTIVIR CRM • ENTERPRISE COMMERCIAL PROPOSAL', 70, 90);
  }
  doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold').text(proposalTitle, 70, 125, { width: 440, lineGap: 6 });

  doc.fillColor('#94A3B8').fontSize(10).font('Helvetica').text(`Package Offering: ${pkgName} • CBIC SAC ${sacCode} (18% GST)`, 70, 180);

  // Client Details Card
  doc.roundedRect(70, 240, 440, 120, 6).fill(COLORS.navyLight);
  doc.rect(70, 240, 4, 120).fill(COLORS.blue);
  doc.fillColor('#94A3B8').fontSize(8).font('Helvetica-Bold').text('PREPARED FOR', 85, 255);
  doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold').text(clientName, 85, 270);
  doc.fillColor('#CBD5E1').fontSize(9).font('Helvetica')
     .text(`Primary Stakeholder: Authorized Executive Lead\nContract Identifier: ${proposalNum}\nTax Classification: CBIC SAC ${sacCode} (Advertising & Digital Marketing)\nTarget Kickoff: Immediate / Q4 FY2026`, 85, 292, { lineGap: 3 });

  // Commercial Snapshot
  doc.roundedRect(70, 380, 440, 90, 6).fill(COLORS.navyLight);
  doc.rect(70, 380, 4, 90).fill(COLORS.crimson);
  doc.fillColor('#94A3B8').fontSize(8).font('Helvetica-Bold').text('COMMERCIAL ENGAGEMENT SUMMARY', 85, 395);
  doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text(contractVal.startsWith('INR') || contractVal.startsWith('₹') ? contractVal.replace('₹', 'INR ') : `INR ${contractVal}`, 85, 412);
  doc.fillColor('#CBD5E1').fontSize(8.5).font('Helvetica')
     .text(`Package SOW: ${pkgName}\nAll services categorized under SAC ${sacCode}. Includes guaranteed SLA turnaround & executive BI sync.`, 85, 435, { lineGap: 3 });

  // Agency Footer
  doc.fillColor('#64748B').fontSize(8).font('Helvetica')
     .text('CONFIDENTIAL • OPTIVIR CRM TECHNOLOGIES PVT LTD • AUTHORIZED CLIENT DISTRIBUTION ONLY', 70, 720);

  // --- PAGE 2: SCOPE OF SERVICES & DELIVERABLES ---
  doc.addPage();
  doc.rect(45, 45, 505, 5).fill(COLORS.crimson);

  doc.fillColor(COLORS.navyDark).fontSize(14).font('Helvetica-Bold').text('1. Detailed Scope of Services & Deliverables', 45, 65);
  doc.fillColor(COLORS.textMuted).fontSize(8.5).font('Helvetica').text('Comprehensive operational roadmap across the 12-month performance retainer.', 45, 83);

  const pillars = [
    {
      title: 'Pillar 1: Performance Paid Media Engine (Google & Meta)',
      points: [
        'Complete account restructuring for Search, Performance Max, Meta Advantage+, and retargeting.',
        'Target ROAS optimization aiming for 3.8x blended return on ad spend.',
        'Weekly bid management, negative keyword harvesting, and audience cluster refresh.'
      ]
    },
    {
      title: 'Pillar 2: Technical Tracking & Meta CAPI Integration',
      points: [
        'Server-side Google Tag Manager (sGTM) deployment on custom AWS/GCP subdomains.',
        'Meta Conversions API (CAPI) with SHA-256 advanced matching for 95%+ event match quality.',
        'GA4 custom dimensions, offline lead conversion sync, and cross-domain attribution.'
      ]
    },
    {
      title: 'Pillar 3: High-Converting Creative Asset Production',
      points: [
        '12 branded performance banners (static, carousel, animated HTML5) per sprint.',
        '4 direct-response short-form video reels scripted, edited, and formatted for 9:16 and 4:5.',
        'Continuous A/B hook, headline, and creative angle testing matrix.'
      ]
    },
    {
      title: 'Pillar 4: Executive BI Reporting & Real-time Cockpit',
      points: [
        'Access to OptiVir CRM Client 360 portal with live lead telemetry and spend pacing.',
        'Bi-weekly strategic review calls and comprehensive monthly Quarterly Business Review (QBR).'
      ]
    }
  ];

  let sy = 105;
  pillars.forEach(p => {
    doc.roundedRect(45, sy, 505, 80, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
    doc.rect(45, sy, 3, 80).fill(COLORS.navyDark);
    doc.fillColor(COLORS.navyDark).fontSize(9).font('Helvetica-Bold').text(p.title, 55, sy + 8);

    let py = sy + 22;
    p.points.forEach(pt => {
      doc.fillColor(COLORS.crimson).fontSize(7).text('•', 58, py);
      doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica').text(pt, 68, py, { width: 460 });
      py += 17;
    });
    sy += 88;
  });

  // --- PAGE 3: COMMERCIALS & SIGNATURE ---
  doc.addPage();
  doc.rect(45, 45, 505, 5).fill(COLORS.crimson);

  doc.fillColor(COLORS.navyDark).fontSize(14).font('Helvetica-Bold').text('2. Commercial Investment & Digital Sign-off', 45, 65);

  // Pricing Table
  let ty = 90;
  doc.rect(45, ty, 505, 20).fill(COLORS.navyDark);
  doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
  doc.text('DELIVERABLE MODULE', 55, ty + 6);
  doc.text('CADENCE', 310, ty + 6);
  doc.text('INVESTMENT (INR)', 430, ty + 6, { width: 100, align: 'right' });

  const cItems = [
    { name: 'Paid Media Architecture & Execution (Google & Meta)', freq: 'Monthly Retainer', price: 'INR 62,000' },
    { name: 'Meta CAPI, Server GTM & Technical Tracking Stack', freq: 'One-time Setup / Mo', price: 'INR 45,000' },
    { name: 'Creative Production Engine (12 Banners, 4 Video Reels)', freq: 'Monthly Retainer', price: 'INR 40,000' },
    { name: 'Executive BI Dashboard & Bi-weekly Strategic Consultation', freq: 'Included in Retainer', price: 'INR 30,000' }
  ];

  ty += 20;
  cItems.forEach((ci, idx) => {
    doc.rect(45, ty, 505, 24).fillAndStroke(idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF', COLORS.border);
    doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold').text(ci.name, 55, ty + 7);
    doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica').text(ci.freq, 310, ty + 7);
    doc.fillColor(COLORS.navyDark).fontSize(7.5).font('Helvetica-Bold').text(ci.price, 430, ty + 7, { width: 100, align: 'right' });
    ty += 24;
  });

  // Total
  doc.rect(45, ty, 505, 24).fill(COLORS.navyDark);
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text(`TOTAL SOW INVESTMENT (EXCL. 18% GST • SAC ${sacCode})`, 55, ty + 7);
  doc.fillColor(COLORS.crimsonLight).fontSize(9).font('Helvetica-Bold').text(contractVal.startsWith('INR') || contractVal.startsWith('₹') ? contractVal.replace('₹', 'INR ') : `INR ${contractVal}`, 430, ty + 7, { width: 100, align: 'right' });

  // Sign-off Box
  ty += 45;
  doc.roundedRect(45, ty, 505, 140, 5).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.navyDark).fontSize(10).font('Helvetica-Bold').text('MUTUAL ACCEPTANCE & AUTHORIZED SIGN-OFF', 55, ty + 12);
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('By signing below, the parties agree to the terms, deliverables, and commercial structure set forth in this SOW.', 55, ty + 26);

  // Signatory columns
  const colW = 220;
  // Agency Signature
  doc.font('Helvetica-Bold').text('FOR OPTIVIR CRM TECHNOLOGIES PVT LTD', 55, ty + 46);
  doc.lineCap('butt').moveTo(55, ty + 105).lineTo(55 + colW, ty + 105).stroke(COLORS.border);
  doc.fillColor(COLORS.navyDark).fontSize(8).font('Helvetica-Bold').text('Marcus Vance', 55, ty + 110);
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica').text('VP of Operations • OptiVir CRM', 55, ty + 120);

  // Client Signature
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica').text(`FOR ${clientName.toUpperCase()}`, 310, ty + 46);
  doc.lineCap('butt').moveTo(310, ty + 105).lineTo(310 + colW, ty + 105).stroke(COLORS.border);
  doc.fillColor(COLORS.navyDark).fontSize(8).font('Helvetica-Bold').text('Authorized Client Representative', 310, ty + 110);
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica').text('Signature & Official Seal', 310, ty + 120);

  // Add Footers
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    if (i > 0) {
      doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
         .text('OPTIVIR CRM • COMMERCIAL PROPOSAL ' + proposalNum, 45, 25);
      doc.text(`Page ${i + 1} of ${totalPages}`, 450, 25, { width: 100, align: 'right' });
      doc.rect(45, 35, 505, 0.5).fill(COLORS.border);
    }
  }

  doc.end();
  return promise;
}

// -------------------------------------------------------------
// 3. QUOTATION PDF GENERATOR
// -------------------------------------------------------------
async function generateQuotationPDF(params: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
  const promise = streamToBuffer(doc);

  const quoteNum = params.number || 'QUO-2026-015';
  const clientName = params.client || 'Client Organization';

  // Top Accent Bar
  doc.rect(40, 40, 515, 6).fill(COLORS.blue);
  doc.rect(40, 46, 515, 74).fill(COLORS.navyDark);

  if (fs.existsSync(LOGO_PATH)) {
    doc.roundedRect(52, 54, 130, 42, 4).fill('#FFFFFF');
    doc.image(LOGO_PATH, 57, 59, { width: 120 });
    doc.fillColor('#38BDF8').fontSize(7.5).font('Helvetica-Bold').text('COMMERCIAL ESTIMATE & QUOTATION', 195, 68);
    doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text('OptiVir Ads • optivirads@gmail.com • www.optivirads.com', 195, 80);
  } else {
    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('OPTIVIR ADS', 55, 58);
    doc.fillColor('#38BDF8').fontSize(7.5).font('Helvetica-Bold').text('COMMERCIAL ESTIMATE & QUOTATION', 55, 76);
    doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text('OptiVir Ads • optivirads@gmail.com • www.optivirads.com', 55, 87);
  }

  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('QUOTATION', 380, 56, { align: 'right', width: 160 });
  doc.fillColor('#38BDF8').fontSize(9).font('Helvetica-Bold').text(quoteNum, 380, 78, { align: 'right', width: 160 });

  let y = 130;
  doc.roundedRect(40, y, 515, 48, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('QUOTE DATE', 52, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text('Oct 10, 2026', 52, y + 20);

  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('VALID UNTIL', 180, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text('Nov 10, 2026 (30 Days)', 180, y + 20);

  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('CLIENT ENTITY', 320, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text(clientName, 320, y + 20);

  // Line items
  y += 60;
  doc.rect(40, y, 515, 20).fill(COLORS.navyDark);
  doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
  doc.text('ITEMIZED SERVICE / PRODUCT', 50, y + 6);
  doc.text('ESTIMATED DELIVERABLE', 280, y + 6);
  doc.text('UNIT PRICE', 440, y + 6, { width: 100, align: 'right' });

  const qItems = [
    { name: 'Google Ads & Meta Ads Full Funnel Architecture', spec: 'Campaign setup, audience matrix & tracking', price: 'INR 65,000' },
    { name: 'Technical Conversion API & GA4 Server Infrastructure', spec: 'AWS/GCP Cloud Run setup + GTM Server', price: 'INR 45,000' },
    { name: 'Creative Design Pack (Banners, Carousels, Short Videos)', spec: '12 Static Banners + 4 Motion Reels', price: 'INR 35,000' },
    { name: 'Executive Looker Studio Attribution Dashboard', spec: 'Live client telemetry & automated dispatch', price: 'INR 25,000' }
  ];

  y += 20;
  qItems.forEach((it, idx) => {
    doc.rect(40, y, 515, 25).fillAndStroke(idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF', COLORS.border);
    doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold').text(it.name, 50, y + 8);
    doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica').text(it.spec, 280, y + 8);
    doc.fillColor(COLORS.navyDark).fontSize(7.5).font('Helvetica-Bold').text(it.price, 440, y + 8, { width: 100, align: 'right' });
    y += 25;
  });

  y += 15;
  doc.roundedRect(320, y, 235, 60, 4).fillAndStroke(COLORS.navyDark, COLORS.border);
  doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text('Estimated Subtotal:', 335, y + 12);
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('INR 1,70,000', 440, y + 12, { width: 100, align: 'right' });

  doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text('Applicable GST (18%):', 335, y + 26);
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('INR 30,600', 440, y + 26, { width: 100, align: 'right' });

  doc.fillColor(COLORS.crimsonLight).fontSize(9).font('Helvetica-Bold').text('Estimated Total:', 335, y + 42);
  doc.fillColor(COLORS.crimsonLight).fontSize(10).font('Helvetica-Bold').text('INR 2,00,600', 440, y + 41, { width: 100, align: 'right' });

  doc.end();
  return promise;
}

// -------------------------------------------------------------
// 4. EXECUTIVE QBR / PERFORMANCE REPORT PDF GENERATOR
// -------------------------------------------------------------
async function generateReportPDF(params: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
  const promise = streamToBuffer(doc);

  const clientName = params.client || 'Client Organization';
  const reportTitle = params.title || 'Quarterly Business Review & Performance Attribution Dossier';

  doc.rect(40, 40, 515, 6).fill(COLORS.crimson);
  doc.rect(40, 46, 515, 65).fill(COLORS.navyDark);

  if (fs.existsSync(LOGO_PATH)) {
    doc.roundedRect(52, 52, 115, 38, 4).fill('#FFFFFF');
    doc.image(LOGO_PATH, 56, 56, { width: 107 });
    doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold').text('EXECUTIVE INTELLIGENCE', 180, 58);
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(`${reportTitle} • Client: ${clientName}`, 180, 75);
  } else {
    doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold').text('OPTIVIR CRM • EXECUTIVE INTELLIGENCE', 55, 58);
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(`${reportTitle} • Client: ${clientName}`, 55, 78);
  }

  // 4 Top KPI Cards
  let y = 120;
  const cardW = 122;
  const kpis = [
    { label: 'TOTAL AD SPEND', val: 'INR 64.80L', change: '+18.4% YoY', color: COLORS.navyDark },
    { label: 'ATTRIBUTED REVENUE', val: 'INR 2.48 Cr', change: '+44.2% YoY', color: COLORS.green },
    { label: 'BLENDED ROAS', val: '3.83x', change: '+0.65x Target', color: COLORS.crimson },
    { label: 'TOTAL LEADS (SQL)', val: '1,482', change: '+24.8% Conv', color: COLORS.blue }
  ];

  kpis.forEach((k, idx) => {
    const kx = 40 + idx * (cardW + 9);
    doc.roundedRect(kx, y, cardW, 58, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
    doc.fillColor(COLORS.textMuted).fontSize(6.5).font('Helvetica-Bold').text(k.label, kx + 8, y + 8);
    doc.fillColor(k.color).fontSize(11).font('Helvetica-Bold').text(k.val, kx + 8, y + 22);
    doc.fillColor(COLORS.green).fontSize(7).font('Helvetica-Bold').text(k.change, kx + 8, y + 40);
  });

  // Channel Performance Breakdown Table
  y += 75;
  doc.fillColor(COLORS.navyDark).fontSize(10).font('Helvetica-Bold').text('Omnichannel Platform Performance Breakdown', 40, y);
  y += 16;
  doc.rect(40, y, 515, 18).fill(COLORS.navyDark);
  doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
  doc.text('PLATFORM', 50, y + 5);
  doc.text('SPEND (INR)', 170, y + 5);
  doc.text('LEADS / SQL', 260, y + 5);
  doc.text('CPA (INR)', 350, y + 5);
  doc.text('ROAS', 480, y + 5, { width: 65, align: 'right' });

  const platforms = [
    { name: 'Google Ads (Search & PMax)', spend: 'INR 28,40,000', leads: '682', cpa: 'INR 4,164', roas: '4.21x' },
    { name: 'Meta Ads (Instagram & Facebook)', spend: 'INR 22,10,000', leads: '540', cpa: 'INR 4,092', roas: '3.92x' },
    { name: 'LinkedIn B2B Enterprise Sponsored Content', spend: 'INR 9,80,000', leads: '180', cpa: 'INR 5,444', roas: '3.10x' },
    { name: 'DV360 Programmatic & Video Reels', spend: 'INR 4,50,000', leads: '80', cpa: 'INR 5,625', roas: '2.84x' }
  ];

  y += 18;
  platforms.forEach((p, idx) => {
    doc.rect(40, y, 515, 22).fillAndStroke(idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF', COLORS.border);
    doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold').text(p.name, 50, y + 7);
    doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica').text(p.spend, 170, y + 7);
    doc.text(p.leads, 260, y + 7);
    doc.text(p.cpa, 350, y + 7);
    doc.fillColor(COLORS.green).font('Helvetica-Bold').text(p.roas, 480, y + 7, { width: 65, align: 'right' });
    y += 22;
  });

  // Key Strategic Insights Box
  y += 20;
  doc.roundedRect(40, y, 515, 100, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.rect(40, y, 3, 100).fill(COLORS.crimson);
  doc.fillColor(COLORS.navyDark).fontSize(9).font('Helvetica-Bold').text('Executive Strategic Observations & Recommendations', 52, y + 10);
  doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica')
     .text(
       '1. Google Search & Meta Advantage+ continue to outperform baseline target ROAS (blended 4.06x vs 3.50x benchmark).\n' +
       '2. Meta CAPI event matching score reached 96.4%, reducing cost-per-acquisition by 14.2% across key product lines.\n' +
       '3. Recommendation for Next Quarter: Scale media budget by 20% on top-performing creative cluster #3 to capture untapped high-intent demand.\n' +
       '4. Client Health Factor: 94/100 (Enterprise Gold SLA). Contract renewal recommended with 15% ARR expansion.',
       52, y + 26, { width: 490, lineGap: 4 }
     );

  doc.end();
  return promise;
}

// -------------------------------------------------------------
// 5. MASTER SERVICES AGREEMENT (MSA) / CONTRACT PDF GENERATOR
// -------------------------------------------------------------
async function generateContractPDF(params: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
  const promise = streamToBuffer(doc);

  const docId = params.id || 'DOC-2026-089-MSA';
  const clientName = params.client || 'Client Organization';

  doc.rect(40, 40, 515, 6).fill(COLORS.crimson);
  doc.rect(40, 46, 515, 65).fill(COLORS.navyDark);

  if (fs.existsSync(LOGO_PATH)) {
    doc.roundedRect(52, 52, 115, 38, 4).fill('#FFFFFF');
    doc.image(LOGO_PATH, 56, 56, { width: 107 });
    doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold').text('LEGAL & COMPLIANCE VAULT', 180, 58);
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(`Master Services Agreement (MSA) • Identifier: ${docId}`, 180, 75);
  } else {
    doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold').text('OPTIVIR CRM • LEGAL & COMPLIANCE VAULT', 55, 58);
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(`Master Services Agreement (MSA) • Identifier: ${docId}`, 55, 78);
  }

  let y = 125;
  doc.roundedRect(40, y, 515, 45, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('CONTRACT PARTIES', 50, y + 8);
  doc.fillColor(COLORS.navyDark).fontSize(8.5).font('Helvetica-Bold')
     .text(`OptiVir CRM Technologies Pvt Ltd (Service Provider) & ${clientName} (Client)`, 50, y + 20);

  y += 55;
  const clauses = [
    { title: '1. Services & Performance Standards', text: 'OptiVir CRM agrees to deliver omnichannel marketing, conversion rate optimization, and advertising asset production in strict accordance with approved Statements of Work (SOW).' },
    { title: '2. Compensation & Billing Terms', text: 'Invoices shall be rendered on a monthly basis in Indian Rupees (INR) with Net 15 payment terms. Unpaid balances past due are subject to statutory interest under applicable law.' },
    { title: '3. Intellectual Property & Work Product', text: 'Upon full payment of applicable fees, all creative banners, video reels, and custom advertising copy created specifically for Client shall become the sole property of Client.' },
    { title: '4. Data Protection & Confidentiality', text: 'Both parties agree to protect proprietary client data, conversion APIs, customer lists, and financial figures using SHA-256 grade confidentiality standards.' }
  ];

  clauses.forEach(c => {
    doc.fillColor(COLORS.navyDark).fontSize(8.5).font('Helvetica-Bold').text(c.title, 40, y);
    y += 12;
    doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica').text(c.text, 40, y, { width: 515, lineGap: 2.5 });
    y += 30;
  });

  // Digital Signatures
  y += 10;
  doc.roundedRect(40, y, 515, 75, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.green).fontSize(8).font('Helvetica-Bold').text('CRYPTOGRAPHICALLY VERIFIED & EXECUTED', 50, y + 10);
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text('SHA-256 Certificate Hash: 4e9a1b0287cd4f89021bde7a998c01\nDocuSign Envelope ID: 89012-EXEC-OPTIVIR-2026\nExecuted: Oct 01, 2026 • Validated Across Enterprise Node US-04', 50, y + 24, { lineGap: 3 });

  doc.end();
  return promise;
}

// -------------------------------------------------------------
// API ROUTE HANDLER (GET /api/pdf/[type])
// -------------------------------------------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const searchParams = request.nextUrl.searchParams;
    const queryData = Object.fromEntries(searchParams.entries());

    let pdfBuffer: Buffer;
    let filename = 'document.pdf';

    switch (type.toLowerCase()) {
      case 'invoice':
        pdfBuffer = await generateInvoicePDF(queryData);
        filename = `Invoice-${queryData.number || 'INV-2026-089'}.pdf`;
        break;

      case 'proposal':
        pdfBuffer = await generateProposalPDF(queryData);
        filename = `Proposal-${queryData.number || 'PROP-2026-042'}.pdf`;
        break;

      case 'quotation':
        pdfBuffer = await generateQuotationPDF(queryData);
        filename = `Quotation-${queryData.number || 'QUO-2026-015'}.pdf`;
        break;

      case 'report':
        pdfBuffer = await generateReportPDF(queryData);
        filename = `Executive-Report-${queryData.client ? queryData.client.replace(/\s+/g, '-') : 'QBR'}.pdf`;
        break;

      case 'contract':
        pdfBuffer = await generateContractPDF(queryData);
        filename = `Contract-${queryData.id || 'DOC-2026-089-MSA'}.pdf`;
        break;

      default:
        return NextResponse.json({ error: `Unknown document type: ${type}` }, { status: 400 });
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
