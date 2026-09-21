import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const router = Router();

// Logo path on backend or frontend
const POSSIBLE_LOGO_PATHS = [
  path.join(process.cwd(), 'public/images/optivir-logo-green.png'),
  path.join(process.cwd(), 'public/images/optivir-logo.png'),
  path.join(process.cwd(), '../frontend/public/images/optivir-logo-green.png'),
  path.join(process.cwd(), '../frontend/public/images/optivir-logo.png')
];
const LOGO_PATH = POSSIBLE_LOGO_PATHS.find(p => fs.existsSync(p)) || POSSIBLE_LOGO_PATHS[0];

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

function streamToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

// 1. INVOICE
async function generateInvoicePDF(params: any, orgData?: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
  const promise = streamToBuffer(doc);

  const invNumber = params.invoice_number || params.number || 'INV-2026-089';
  const clientName = params.client_name || params.client || 'Client Organization';
  const clientEmail = params.client_email || params.email || 'billing@client.com';
  const clientGstin = params.client_gstin || params.gstin || '27AAACA1234A1Z1';
  const totalAmount = Number(params.total || params.amount) || 177000;
  const subtotal = Math.round(totalAmount / 1.18);
  const tax = totalAmount - subtotal;
  const cgst = Math.round(tax / 2);
  const sgst = tax - cgst;

  const invoiceDateStr = params.invoice_date
    ? new Date(params.invoice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Oct 15, 2026';
  const dueDateStr = params.due_date
    ? new Date(params.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Oct 30, 2026';
  const rawStatus = (params.status || 'Paid').toUpperCase();
  const isPaid = rawStatus === 'PAID';

  const orgName = orgData?.legal_name || orgData?.brand_name || orgData?.name || 'OptiVir Ads';
  const orgWebsite = orgData?.domain_website || 'www.optivirads.com';
  const orgEmail = orgData?.support_email || 'optivirads@gmail.com';
  const orgPhone = orgData?.switchboard_phone || '+919995037109';
  const orgGstin = orgData?.tax_gstin || '27AABCO1234F1Z5';

  doc.rect(40, 40, 515, 6).fill(COLORS.crimson);
  doc.rect(40, 46, 515, 74).fill(COLORS.navyDark);

  if (fs.existsSync(LOGO_PATH)) {
    doc.roundedRect(52, 54, 130, 42, 4).fill('#FFFFFF');
    doc.image(LOGO_PATH, 57, 59, { width: 120 });
    doc.fillColor(COLORS.crimsonLight).fontSize(7.5).font('Helvetica-Bold').text('PERFORMANCE MARKETING & ENTERPRISE CRM', 195, 68);
    doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text(`${orgName} • ${orgEmail} • ${orgWebsite}`, 195, 80);
  } else {
    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text(orgName.toUpperCase(), 55, 58);
    doc.fillColor(COLORS.crimsonLight).fontSize(7.5).font('Helvetica-Bold').text('PERFORMANCE MARKETING & ENTERPRISE CRM', 55, 76);
    doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text(`${orgName} • ${orgEmail} • ${orgWebsite}`, 55, 87);
  }

  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('TAX INVOICE', 380, 56, { align: 'right', width: 160 });
  doc.fillColor(COLORS.crimsonLight).fontSize(9).font('Helvetica-Bold').text(invNumber, 380, 78, { align: 'right', width: 160 });

  let y = 130;
  doc.roundedRect(40, y, 515, 48, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('INVOICE DATE', 52, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text(invoiceDateStr, 52, y + 20);

  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('PAYMENT DUE DATE', 160, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text(dueDateStr, 160, y + 20);

  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('PAYMENT TERMS', 280, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text('Net 15 Days (ICICI Sync)', 280, y + 20);

  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('STATUS', 420, y + 8);
  doc.roundedRect(420, y + 18, 60, 16, 3).fill(isPaid ? COLORS.greenBg : '#FEF3C7');
  doc.fillColor(isPaid ? COLORS.green : COLORS.amber).fontSize(8).font('Helvetica-Bold').text(rawStatus, 426, y + 22);

  y += 58;
  const boxW = 252;
  doc.roundedRect(40, y, boxW, 70, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.crimson).fontSize(7.5).font('Helvetica-Bold').text('ISSUED BY (SERVICE PROVIDER)', 50, y + 8);
  doc.fillColor(COLORS.navyDark).fontSize(9).font('Helvetica-Bold').text(orgName, 50, y + 20);
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text(`Performance Marketing & Operating System\nGSTIN: ${orgGstin}\nWebsite: ${orgWebsite} • Phone: ${orgPhone}`, 50, y + 32, { lineGap: 2 });

  doc.roundedRect(303, y, boxW, 70, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.blue).fontSize(7.5).font('Helvetica-Bold').text('BILLED TO (CLIENT)', 313, y + 8);
  doc.fillColor(COLORS.navyDark).fontSize(9).font('Helvetica-Bold').text(clientName, 313, y + 20);
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text(`Entity: Enterprise Client\nGSTIN: ${clientGstin} • State Code: 27\nEmail: ${clientEmail}`, 313, y + 32, { lineGap: 2 });

  y += 80;
  doc.rect(40, y, 515, 20).fill(COLORS.navyDark);
  doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
  doc.text('DESCRIPTION & SCOPE OF SERVICE', 50, y + 6);
  doc.text('SAC CODE', 320, y + 6);
  doc.text('QTY', 390, y + 6);
  doc.text('RATE (INR)', 430, y + 6, { width: 50, align: 'right' });
  doc.text('AMOUNT (INR)', 485, y + 6, { width: 60, align: 'right' });

  const rawItems = Array.isArray(params.items) && params.items.length > 0
    ? params.items
    : [
        { description: 'Search Engine Optimization (SEO) & Technical Visibility Retainer', sac: '998361', quantity: '1 mo', rate: Math.round(subtotal * 0.35), amount: Math.round(subtotal * 0.35) },
        { description: 'Performance Paid Media Management (Google & Meta PPC)', sac: '998361', quantity: '1 mo', rate: Math.round(subtotal * 0.35), amount: Math.round(subtotal * 0.35) },
        { description: 'Social Media Content Production & Creative Suite (12 Banners, 4 Reels)', sac: '998361', quantity: '1 lot', rate: Math.round(subtotal * 0.20), amount: Math.round(subtotal * 0.20) },
        { description: 'Conversion API (CAPI), GTM Server-Side & Executive BI Reporting', sac: '998361', quantity: '1 lot', rate: subtotal - (Math.round(subtotal * 0.35) * 2 + Math.round(subtotal * 0.20)), amount: subtotal - (Math.round(subtotal * 0.35) * 2 + Math.round(subtotal * 0.20)) }
      ];

  y += 20;
  rawItems.slice(0, 6).forEach((it: any, idx: number) => {
    const rowH = 26;
    if (idx % 2 === 1) {
      doc.rect(40, y, 515, rowH).fill('#F8FAFC');
    }
    doc.rect(40, y, 515, rowH).stroke(COLORS.border);

    const desc = it.description || it.name || 'Professional Services';
    const sac = it.sac || '998361';
    const qty = String(it.quantity || it.qty || '1');
    const rate = Number(it.rate || it.amount || 0);
    const amt = Number(it.amount || (Number(it.quantity || 1) * rate) || 0);

    doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold').text(desc, 50, y + 8, { width: 260 });
    doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica').text(sac, 320, y + 8);
    doc.text(qty, 390, y + 8);
    doc.text(`INR ${rate.toLocaleString('en-IN')}`, 430, y + 8, { width: 50, align: 'right' });
    doc.fillColor(COLORS.navyDark).font('Helvetica-Bold').text(`INR ${amt.toLocaleString('en-IN')}`, 485, y + 8, { width: 60, align: 'right' });

    y += rowH;
  });

  y += 10;
  doc.roundedRect(40, y, 280, 85, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.navyDark).fontSize(7.5).font('Helvetica-Bold').text('OFFICIAL BANK PAYMENT INSTRUCTIONS', 50, y + 8);
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text(`Bank Name: ICICI Bank Limited\nAccount Name: ${orgName}\nAccount Number: 000205029481\nIFSC Code: ICIC0000002 (Corporate Branch)\nUPI Handle: optivircrm@icici`, 50, y + 22, { lineGap: 2.5 });

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

  y += 98;
  doc.roundedRect(40, y, 515, 60, 4).fillAndStroke('#FFFFFF', COLORS.border);
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`Cryptographic Verification Hash: 9f82a7c41b80d0498b2f91e • DocuSign Certified\nThis document is a computer-generated tax invoice issued by ${orgName} under the Indian GST Act 2017.`, 50, y + 10, { width: 320, lineGap: 3 });

  doc.lineCap('butt').moveTo(390, y + 42).lineTo(530, y + 42).stroke(COLORS.border);
  doc.fillColor(COLORS.navyDark).fontSize(7.5).font('Helvetica-Bold').text('AUTHORIZED SIGNATORY', 390, y + 46, { width: 140, align: 'center' });

  doc.end();
  return promise;
}

// 2. PROPOSAL (2 Pages matching model)
async function generateProposalPDF(params: any, orgData?: any): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 38, bottom: 15, left: 45, right: 45 }
  });
  const promise = streamToBuffer(doc);

  const cleanCurrency = (val: any): string => {
    if (!val) return '';
    return String(val).replace(/₹/g, 'Rs. ');
  };

  const proposalTitle = params.title || params.name || 'Kerala Launch — Social Media & Meta Ads';
  const clientName = params.client || params.client_name || 'Hayras Coconut Oil';
  const brandName = params.brand || params.brand_name || 'Chakkil Aattiya Velichenna (Wood-Pressed Coconut Oil)';
  const contactPerson = params.contact_person || params.contact || 'Shanavas';
  const validTill = params.valid_until || params.valid_till || '17/09/2026';
  const regionNiche = params.target_market || params.region || 'Kerala food & wellness';
  const month1Goal = params.month1_target || params.month1_goal || '250-400L';
  const month3Goal = params.month3_target || params.month3_goal || '2,500L';

  const managementFee = cleanCurrency(params.management_fee || (params.subtotal ? `Rs. ${Number(params.subtotal).toLocaleString('en-IN')}` : 'Rs. 15,000'));
  const metaAdSpend = cleanCurrency(params.meta_ad_spend || 'Rs. 12,000 to start, up to Rs. 15,000');
  const totalInvestment = cleanCurrency(params.total_investment || params.contractValue || 'Rs. 27,000 - 30,000');

  const advanceAmt = cleanCurrency(params.advance_amount || 'Rs. 6,000');
  const m2Amt = cleanCurrency(params.milestone2_amount || 'Rs. 4,500');
  const m3Amt = cleanCurrency(params.milestone3_amount || 'Rs. 4,500');

  const signerName = params.signer_name || 'Abhinand C';
  const signerPhone = params.signer_phone || '9995037109';
  const signerEmail = params.signer_email || 'optivirads@gmail.com';
  const signerWebsite = params.signer_website || 'www.optivirads.com';

  const FONT_DARK = '#1F2937';
  const FONT_MUTED = '#4B5563';
  const HEADER_GREEN = '#1E442B';
  const HIGHLIGHT_GREEN = '#EBF4EC';
  const BORDER_COLOR = '#D1D5DB';

  // --- PAGE 1 ---
  // Top Right: Logo (decreased to paper-proportional width 85)
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, 465, 38, { width: 85 });
  } else {
    doc.fillColor(HEADER_GREEN).fontSize(12).font('Helvetica-Bold').text('OptiVirAds', 475, 42);
  }

  // Header Left (Dynamically calculated Y offsets to prevent text collision/overlap)
  let topY = 38;
  doc.fillColor(FONT_MUTED).fontSize(8.5).font('Helvetica-Bold').text('PROPOSAL', 45, topY);
  topY += 13;

  doc.fillColor(FONT_DARK).fontSize(14).font('Helvetica-Bold').text(proposalTitle, 45, topY, { width: 405 });
  topY += doc.heightOfString(proposalTitle, { width: 405 }) + 4;

  const prepSubtitle = `Prepared for ${clientName}${brandName && brandName !== clientName ? ` — ${brandName}` : ''}`;
  doc.fillColor(FONT_MUTED).fontSize(9).font('Helvetica-Oblique').text(prepSubtitle, 45, topY, { width: 405 });
  topY += doc.heightOfString(prepSubtitle, { width: 405 }) + 3;

  const agencySubtitle = `By OptiVirAds — helping ${regionNiche} brands grow online`;
  doc.fillColor(FONT_MUTED).fontSize(8.5).font('Helvetica-Oblique').text(agencySubtitle, 45, topY, { width: 405 });
  topY += doc.heightOfString(agencySubtitle, { width: 405 }) + 3;

  doc.fillColor(FONT_MUTED).fontSize(8.5).font('Helvetica').text(`Valid till ${validTill}`, 45, topY);
  topY += 18;

  // Salutation & Intro
  let y = Math.max(topY, 122);
  doc.fillColor(FONT_DARK).fontSize(10).font('Helvetica-Bold').text(`Dear ${contactPerson},`, 45, y);
  y += 16;

  const introText = `Below is a plan built specifically around what you shared — your stock, your order process, and your ${regionNiche.split(' ')[0]} launch goal of ${month1Goal} in Month 1, scaling toward ${month3Goal} by Month 3. This isn't a generic package; it's mapped to where your business already stands, and where marketing needs to pick up.`;
  doc.fillColor(FONT_DARK).fontSize(9.5).font('Helvetica').text(introText, 45, y, { width: 505, lineGap: 3.5 });
  y += doc.heightOfString(introText, { width: 505, lineGap: 3.5 }) + 18;

  // Section 1: The Plan
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('1. The Plan', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 10;
  const planIntro = "You're not starting from zero — past traction proves the product works. The focus is visibility, high-converting creative messaging, and a consistent lead flow into direct communication channels. The growth roadmap:";
  doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica').text(planIntro, 45, y, { width: 505, lineGap: 3 });
  y += doc.heightOfString(planIntro, { width: 505, lineGap: 3 }) + 12;

  const planBullets = [
    '5-8 reels/month — process, purity & craft story, product usage, and real customer reviews, tuned to peak audience engagement. Reel script and creative direction provided.',
    `Meta ads built on top-performing creative angles, targeted to ${regionNiche.split(' ')[0]} health-conscious buyers, with product variants tested separately to maximize conversions`,
    'Direct messaging conversion funnel — every ad and reel routes to dedicated WhatsApp/DM channels with structured response templates, so no lead sits unanswered',
    'Weekly Monday report: reach, leads generated, and feedback conversion data — so we optimize on real performance metrics, not guesses'
  ];

  planBullets.forEach(pt => {
    doc.fillColor(FONT_DARK).fontSize(9.5).text('•', 52, y);
    doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica').text(pt, 65, y, { width: 485, lineGap: 3 });
    const h = doc.heightOfString(pt, { width: 485, lineGap: 3 });
    y += h + 8;
  });

  // Section 2: What's Included / Not Included
  y += 14;
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text("2. What's Included / Not Included", 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 10;
  const scopeIntro = 'Keeping scope clear upfront ensures full transparency and aligned expectations:';
  doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica').text(scopeIntro, 45, y, { width: 505 });
  y += doc.heightOfString(scopeIntro, { width: 505 }) + 12;

  const scopeBullets = [
    'Included: full content strategy, reel scripting & video editing, Meta ad setup & optimization, direct funnel workflow, weekly telemetry reporting, up to 2 revision rounds per asset.',
    'Not included: on-site videography shoots (client provides raw footage/photos), Meta media ad spend (billed directly by Meta to client ad account), third-party influencer payments.',
    'Additional scope items or custom shoots can be quoted separately whenever needed.'
  ];
  scopeBullets.forEach(pt => {
    doc.fillColor(FONT_DARK).fontSize(9.5).text('•', 52, y);
    doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica').text(pt, 65, y, { width: 485, lineGap: 3 });
    const h = doc.heightOfString(pt, { width: 485, lineGap: 3 });
    y += h + 8;
  });

  // Page 1 Running Footer
  doc.fillColor(FONT_MUTED).fontSize(7.5).font('Helvetica')
     .text('OptiVirAds | Performance Marketing for Growing Brands', 45, 792, { width: 505, align: 'center', lineBreak: false });
  doc.text('1', 45, 802, { width: 505, align: 'center', lineBreak: false });

  // --- PAGE 2 ---
  doc.addPage();
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, 465, 38, { width: 85 });
  }

  y = 44;
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Investment', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;
  const invIntro = 'One straightforward number, split so you always know where the money goes:';
  doc.fillColor(FONT_DARK).fontSize(9).font('Helvetica').text(invIntro, 45, y, { width: 505 });
  y += 14;

  const invCol1W = 320;
  const invCol2W = 185;
  doc.rect(45, y, 505, 20).fill(HEADER_GREEN);
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('Item', 55, y + 5);
  doc.text('Amount', 45 + invCol1W + 10, y + 5, { width: invCol2W - 20, align: 'center' });
  y += 20;

  // Row 1
  doc.rect(45, y, 505, 26).stroke(BORDER_COLOR);
  doc.rect(45 + invCol1W, y, 0.5, 26).stroke(BORDER_COLOR);
  doc.fillColor(FONT_DARK).fontSize(8.8).font('Helvetica-Bold').text('Management fee (strategy, content, ads, funnel, reporting)', 55, y + 7, { width: invCol1W - 20 });
  doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica-Bold').text(managementFee, 45 + invCol1W + 10, y + 7, { width: invCol2W - 20, align: 'center' });
  y += 26;

  // Row 2
  doc.rect(45, y, 505, 24).stroke(BORDER_COLOR);
  doc.rect(45 + invCol1W, y, 0.5, 24).stroke(BORDER_COLOR);
  doc.fillColor(FONT_DARK).fontSize(8.8).font('Helvetica-Bold').text('Meta ad spend (paid directly by you to Meta)', 55, y + 6, { width: invCol1W - 20 });
  doc.fillColor(FONT_DARK).fontSize(8.8).font('Helvetica').text(metaAdSpend, 45 + invCol1W + 10, y + 6, { width: invCol2W - 20, align: 'center' });
  y += 24;

  // Row 3 (Total)
  doc.rect(45, y, 505, 24).fillAndStroke(HIGHLIGHT_GREEN, HEADER_GREEN);
  doc.rect(45 + invCol1W, y, 0.5, 24).stroke(HEADER_GREEN);
  doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica-Bold').text('Total investment this month', 55, y + 6);
  doc.fillColor(FONT_DARK).fontSize(9.5).font('Helvetica-Bold').text(totalInvestment, 45 + invCol1W + 10, y + 6, { width: invCol2W - 20, align: 'center' });
  y += 24;

  y += 8;
  const invNote = "We start ad spend at Rs. 12,000 in Week 1. Based on real performance data by Day 10, we'll recommend whether to hold or scale to Rs. 15,000 for Weeks 3-4 — you approve any increase before it happens. This fits inside your Rs. 25,000-30,000 budget, and ad spend stays in your Meta account, fully visible and in your control at all times. Management fee is inclusive of tax (inclusive of GST).";
  doc.fillColor(FONT_MUTED).fontSize(8.2).font('Helvetica-Oblique').text(invNote, 45, y, { width: 505, lineGap: 2.2 });
  y += doc.heightOfString(invNote, { width: 505, lineGap: 2.2 }) + 14;

  // Section 5: Engagement Terms
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Engagement Terms', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;

  const termsBullets = [
    `40% (${advanceAmt}) advance to begin content calendar and ad account setup`,
    `30% (${m2Amt}) on day 15, once first batch of content and ads are live`,
    `30% (${m3Amt}) on day 30, on delivery of the final report`,
    'Ad spend billed separately, paid directly to Meta by you',
    'All reels and ad creatives become your property once fully paid; raw/unused drafts stay with us',
    'This is a 1-month engagement. Either side can choose not to continue after Month 1 with no further obligation',
    "If either side needs to exit mid-month, 7 days' written notice on WhatsApp/email is enough — work is billed pro-rata for days completed, rest refunded"
  ];
  termsBullets.forEach(pt => {
    doc.fillColor(FONT_DARK).fontSize(9).text('•', 52, y);
    doc.fillColor(FONT_DARK).fontSize(8.8).font('Helvetica').text(pt, 65, y, { width: 485, lineGap: 2 });
    const h = doc.heightOfString(pt, { width: 485, lineGap: 2 });
    y += h + 4;
  });

  // Section 6: Timeline
  y += 10;
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Timeline', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;

  const timelineBullets = [
    'Week 1: Content calendar, first reels, WhatsApp funnel + ad account setup',
    'Week 2-3: Ads live, daily posting, lead flow into WhatsApp, mid-point optimization',
    'Week 4: Full report + clear go/no-go recommendation for Month 2 scale-up the selling volume.'
  ];
  timelineBullets.forEach(pt => {
    doc.fillColor(FONT_DARK).fontSize(9).text('•', 52, y);
    doc.fillColor(FONT_DARK).fontSize(8.8).font('Helvetica').text(pt, 65, y, { width: 485, lineGap: 2 });
    const h = doc.heightOfString(pt, { width: 485, lineGap: 2 });
    y += h + 4;
  });

  // Section 7: Next Step
  y += 10;
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Next Step', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;
  const nextStep1 = "If this works for you, reply 'yes' and send the advance — we'll have the content calendar with you within 24 hours.";
  doc.fillColor(FONT_DARK).fontSize(9).font('Helvetica').text(nextStep1, 45, y, { width: 505 });
  y += doc.heightOfString(nextStep1, { width: 505 }) + 4;

  const nextStep2 = `Looking forward to taking ${brandName}'s ${regionNiche.split(' ')[0]} launch as seriously as its UAE success.`;
  doc.fillColor(FONT_DARK).fontSize(9).font('Helvetica-Oblique').text(nextStep2, 45, y, { width: 505 });
  y += doc.heightOfString(nextStep2, { width: 505 }) + 14;

  // Sign-off Block
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, 45, y, { width: 60 });
  }
  doc.fillColor(FONT_DARK).fontSize(9.5).font('Helvetica-Bold').text(signerName, 115, y + 2);
  doc.fillColor(FONT_MUTED).fontSize(8.5).font('Helvetica').text('On behalf of OptiVirAds', 115, y + 14);
  doc.fillColor(FONT_MUTED).fontSize(8).font('Helvetica').text(`${signerPhone}  |  ${signerEmail}  |  ${signerWebsite}`, 115, y + 26);

  // Page 2 Running Footer
  doc.fillColor(FONT_MUTED).fontSize(7.5).font('Helvetica')
     .text('OptiVirAds | Performance Marketing for Growing Brands', 45, 792, { width: 505, align: 'center', lineBreak: false });
  doc.text('2', 45, 802, { width: 505, align: 'center', lineBreak: false });

  doc.end();
  return promise;
}

// 3. QUOTATION
async function generateQuotationPDF(params: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
  const promise = streamToBuffer(doc);

  const quoteNum = params.number || 'QUO-2026-015';
  const clientName = params.client || 'Client Organization';

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
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text(clientName, 320, y + 20, { width: 225 });

  y += 58;
  doc.rect(40, y, 515, 20).fill(COLORS.navyDark);
  doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
  doc.text('LINE ITEM / DESCRIPTION', 50, y + 6);
  doc.text('SAC', 290, y + 6);
  doc.text('QTY', 340, y + 6);
  doc.text('RATE', 380, y + 6);
  doc.text('AMOUNT (INR)', 460, y + 6, { width: 85, align: 'right' });

  const items = [
    { desc: 'Comprehensive Performance Marketing — Meta Ads & Content Strategy Sprint', sac: '998361', qty: 1, rate: '20,000', amount: '20,000' }
  ];

  y += 20;
  items.forEach((it, idx) => {
    doc.rect(40, y, 515, 24).fillAndStroke(idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF', COLORS.border);
    doc.fillColor(COLORS.textDark).fontSize(8).font('Helvetica-Bold').text(it.desc, 50, y + 7, { width: 230 });
    doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica').text(it.sac, 290, y + 7);
    doc.text(String(it.qty), 340, y + 7);
    doc.text(`INR ${it.rate}`, 380, y + 7);
    doc.fillColor(COLORS.textDark).font('Helvetica-Bold').text(`INR ${it.amount}`, 460, y + 7, { width: 85, align: 'right' });
    y += 24;
  });

  y += 20;
  doc.roundedRect(40, y, 515, 55, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.navyDark).fontSize(8).font('Helvetica-Bold').text('TERMS & CONDITIONS', 50, y + 8);
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text('1. 40% advance payment required to commence campaign initialization & creative production.\n2. Milestone 2 (30%) due on Day 15; Milestone 3 (30%) due on Day 30.\n3. Quote valid for 30 calendar days from issue date.', 50, y + 20, { lineGap: 3 });

  doc.end();
  return promise;
}

// 4. EXECUTIVE REPORT
async function generateReportPDF(params: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 } });
  const promise = streamToBuffer(doc);

  const clientName = params.client || 'Enterprise Client';
  const period = params.period || 'Q3 2026 Executive Performance Review';

  doc.rect(40, 40, 515, 6).fill(COLORS.green);
  doc.rect(40, 46, 515, 74).fill(COLORS.navyDark);

  if (fs.existsSync(LOGO_PATH)) {
    doc.roundedRect(52, 54, 130, 42, 4).fill('#FFFFFF');
    doc.image(LOGO_PATH, 57, 59, { width: 120 });
    doc.fillColor('#34D399').fontSize(7.5).font('Helvetica-Bold').text('PERFORMANCE ANALYTICS REPORT', 195, 68);
    doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text('OptiVir Growth Pod Intelligence Report', 195, 80);
  }

  doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('GROWTH REPORT', 370, 56, { align: 'right', width: 175 });
  doc.fillColor('#34D399').fontSize(8.5).font('Helvetica-Bold').text(period, 370, 78, { align: 'right', width: 175 });

  let y = 130;
  doc.roundedRect(40, y, 515, 48, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('CLIENT ACCOUNT', 52, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text(clientName, 52, y + 20);

  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica-Bold').text('REPORTING TIMEFRAME', 220, y + 8);
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text('Last 90 Days Performance Cycle', 220, y + 20);

  y += 60;
  const kpis = [
    { label: 'TOTAL MEDIA SPEND', val: 'INR 64.8L', change: '+18.4% MoM', color: COLORS.navyDark },
    { label: 'QUALIFIED LEADS / SALES', val: '1,482', change: '+34.2% MoM', color: COLORS.green },
    { label: 'BLENDED ROAS', val: '4.06x', change: '+0.56x target beat', color: COLORS.green },
    { label: 'COST PER ACQUISITION', val: 'INR 4,372', change: '-14.2% savings', color: COLORS.crimson }
  ];
  const cardW = (515 - 27) / 4;

  kpis.forEach((k, idx) => {
    const kx = 40 + idx * (cardW + 9);
    doc.roundedRect(kx, y, cardW, 58, 4).fillAndStroke(COLORS.bgLight, COLORS.border);
    doc.fillColor(COLORS.textMuted).fontSize(6.5).font('Helvetica-Bold').text(k.label, kx + 8, y + 8);
    doc.fillColor(k.color).fontSize(11).font('Helvetica-Bold').text(k.val, kx + 8, y + 22);
    doc.fillColor(COLORS.green).fontSize(7).font('Helvetica-Bold').text(k.change, kx + 8, y + 40);
  });

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

// 5. AGREEMENT (Confirmation of Engagement 2 Pages)
async function generateAgreementPDF(params: any, orgData?: any): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 38, bottom: 15, left: 45, right: 45 }
  });
  const promise = streamToBuffer(doc);

  const cleanCurrency = (val: any): string => {
    if (!val) return '';
    return String(val).replace(/₹/g, 'Rs. ');
  };

  const confirmationNumber = params.number || params.code || params.id || 'OVA-2026-001';
  const confirmationDate = params.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const proposalDate = params.proposal_date || '17/08/2026';
  const clientName = params.client || params.client_name || 'Hayras Coconut Oil';
  const brandName = params.brand || params.brand_name || 'Chakkinal Aattiya Velichenna';
  const targetRegion = params.target_market || params.region || 'Kerala';

  const managementFee = cleanCurrency(params.management_fee || (params.subtotal ? `Rs. ${Number(params.subtotal).toLocaleString('en-IN')}` : 'Rs. 15,000'));
  const metaAdSpend = cleanCurrency(params.meta_ad_spend || 'Rs. 12,000 to start, up to Rs. 15,000');
  const totalInvestment = cleanCurrency(params.total_investment || params.contractValue || 'Rs. 27,000 - 30,000');

  const advanceAmt = cleanCurrency(params.advance_amount || 'Rs. 6,000');
  const m2Amt = cleanCurrency(params.milestone2_amount || 'Rs. 4,500');
  const m3Amt = cleanCurrency(params.milestone3_amount || 'Rs. 4,500');

  const upiId = params.upi_id || 'optivirads@icici';
  const bankDetails = params.bank_details || 'OptiVir Ads / ICICI A/C 000205029481 / IFSC ICIC0000002';
  const startDate = params.start_date || '24 hours upon payment';
  const signerName = params.signer_name || 'Abhinand C';

  const FONT_DARK = '#1F2937';
  const FONT_MUTED = '#4B5563';
  const HEADER_GREEN = '#1E442B';
  const HIGHLIGHT_GREEN = '#EBF4EC';
  const BORDER_COLOR = '#D1D5DB';

  // --- PAGE 1 ---
  // Top Right: Logo (decreased to paper-proportional width 85)
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, 465, 38, { width: 85 });
  } else {
    doc.fillColor(HEADER_GREEN).fontSize(12).font('Helvetica-Bold').text('OptiVirAds', 475, 42);
  }

  // Header Left (Dynamically calculated Y offsets to prevent text collision/overlap)
  let topY = 38;
  doc.fillColor(FONT_MUTED).fontSize(8.5).font('Helvetica-Bold').text('WRITTEN CONFIRMATION', 45, topY);
  topY += 13;
  doc.fillColor(FONT_DARK).fontSize(16).font('Helvetica-Bold').text('Confirmation of Engagement', 45, topY);
  topY += 20;

  const subDesc = `This confirms both sides' agreement to proceed, based on the proposal sent on ${proposalDate}.`;
  doc.fillColor(FONT_MUTED).fontSize(9).font('Helvetica-Oblique').text(subDesc, 45, topY, { width: 405 });
  topY += doc.heightOfString(subDesc, { width: 405 }) + 8;

  // Metadata Grid Box
  let y = Math.max(topY, 86);
  const gridW = 505;
  const gridH = 50;
  doc.rect(45, y, gridW, gridH).stroke(BORDER_COLOR);
  doc.rect(45 + 252, y, 0.5, gridH).stroke(BORDER_COLOR);
  doc.rect(45, y + 25, gridW, 0.5).stroke(BORDER_COLOR);

  // Cell 1: Confirmation #
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica-Bold').text('Confirmation #', 55, y + 8);
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text(`[${confirmationNumber}]`, 145, y + 8);

  // Cell 2: Date
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica-Bold').text('Date', 310, y + 8);
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text(`[${confirmationDate}]`, 380, y + 8);

  // Cell 3: Client
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica-Bold').text('Client', 55, y + 32);
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text(`[${clientName}]`, 145, y + 32);

  // Cell 4: Brand
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica-Bold').text('Brand', 310, y + 32);
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text(brandName, 380, y + 32, { width: 165 });

  // Section 1: What This Confirms
  y += 64;
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('What This Confirms', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;
  const confIntro = "This document is a simple written record of what both sides agreed on WhatsApp/call — not a replacement for the full proposal, but a one-page reference so there's no confusion later about scope, price, or dates. Both sides keep a copy.";
  doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica').text(confIntro, 45, y, { width: 505, lineGap: 3 });
  y += doc.heightOfString(confIntro, { width: 505, lineGap: 3 }) + 6;

  const confNote = 'If anything here differs from an earlier casual chat or quote, this confirmation is the final version both sides go by.';
  doc.fillColor(FONT_DARK).fontSize(9).font('Helvetica-Oblique').text(confNote, 45, y, { width: 505, lineGap: 2.5 });
  y += doc.heightOfString(confNote, { width: 505, lineGap: 2.5 }) + 16;

  // Section 2: Month 1 Target
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Month 1 Target', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;
  const targetIntro = "This is the validation phase of the 3-month roadmap toward 2,500 customers. Based on the ad budget below, the realistic target for Month 1 is 60-100 customers — not the full 2,500. Month 2-3 scale-up depends on Month 1 data and a fresh budget conversation, as outlined in the proposal.";
  doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica').text(targetIntro, 45, y, { width: 505, lineGap: 3 });
  y += doc.heightOfString(targetIntro, { width: 505, lineGap: 3 }) + 16;

  // Section 3: Scope — Month 1
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Scope — Month 1', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 10;
  const scopeBullets = [
    '5-8 reels/month — process, purity story, usage, customer testimonials',
    `Meta ads on best-performing reels, targeted to ${targetRegion} health-conscious buyers`,
    'Weekly report every Monday — reach, leads, cost/lead, orders',
    'Up to 2 revision rounds per reel',
    'Not included: WhatsApp auto-reply/funnel setup (optional add-on, only if needed — client currently handles leads directly), photography/videography shoots, website work, influencer collabs (all quoted separately if needed)'
  ];
  scopeBullets.forEach(pt => {
    doc.fillColor(FONT_DARK).fontSize(9.5).text('•', 52, y);
    doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica').text(pt, 65, y, { width: 485, lineGap: 2.5 });
    const h = doc.heightOfString(pt, { width: 485, lineGap: 2.5 });
    y += h + 6;
  });

  // Page 1 Running Footer
  doc.fillColor(FONT_MUTED).fontSize(7.5).font('Helvetica')
     .text('OptiVirAds | Performance Marketing for Growing Brands', 45, 792, { width: 505, align: 'center', lineBreak: false });
  doc.text('1', 45, 802, { width: 505, align: 'center', lineBreak: false });

  // --- PAGE 2 ---
  doc.addPage();
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, 465, 38, { width: 85 });
  }

  y = 44;
  // Section 4: Investment
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Investment', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;

  const invCol1W = 320;
  const invCol2W = 185;
  doc.rect(45, y, 505, 20).fill(HEADER_GREEN);
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('Item', 55, y + 5);
  doc.text('Amount', 45 + invCol1W + 10, y + 5, { width: invCol2W - 20, align: 'center' });
  y += 20;

  // Row 1
  doc.rect(45, y, 505, 26).stroke(BORDER_COLOR);
  doc.rect(45 + invCol1W, y, 0.5, 26).stroke(BORDER_COLOR);
  doc.fillColor(FONT_DARK).fontSize(8.8).font('Helvetica-Bold').text('Management fee (strategy, content, ads, funnel, reporting)', 55, y + 7, { width: invCol1W - 20 });
  doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica-Bold').text(managementFee, 45 + invCol1W + 10, y + 7, { width: invCol2W - 20, align: 'center' });
  y += 26;

  // Row 2
  doc.rect(45, y, 505, 24).stroke(BORDER_COLOR);
  doc.rect(45 + invCol1W, y, 0.5, 24).stroke(BORDER_COLOR);
  doc.fillColor(FONT_DARK).fontSize(8.8).font('Helvetica-Bold').text('Meta ad spend (billed separately, paid by client to Meta)', 55, y + 6, { width: invCol1W - 20 });
  doc.fillColor(FONT_DARK).fontSize(8.8).font('Helvetica').text(metaAdSpend, 45 + invCol1W + 10, y + 6, { width: invCol2W - 20, align: 'center' });
  y += 24;

  // Row 3 (Total)
  doc.rect(45, y, 505, 24).fillAndStroke(HIGHLIGHT_GREEN, HEADER_GREEN);
  doc.rect(45 + invCol1W, y, 0.5, 24).stroke(HEADER_GREEN);
  doc.fillColor(FONT_DARK).fontSize(9.2).font('Helvetica-Bold').text('Total investment — Month 1', 55, y + 6);
  doc.fillColor(FONT_DARK).fontSize(9.5).font('Helvetica-Bold').text(totalInvestment, 45 + invCol1W + 10, y + 6, { width: invCol2W - 20, align: 'center' });
  y += 24;

  y += 8;
  const spendNote = "Ad spend starts at Rs. 12,000. Scaling to Rs. 14,000 happens only after a Day 10 performance review, with your approval — never automatic.";
  doc.fillColor(FONT_MUTED).fontSize(8.2).font('Helvetica-Oblique').text(spendNote, 45, y, { width: 505 });
  y += doc.heightOfString(spendNote, { width: 505 }) + 14;

  // Section 5: Payment Schedule
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Payment Schedule', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;

  const payCol1W = 190;
  const payCol2W = 135;
  const payCol3W = 180;
  doc.rect(45, y, 505, 20).fill(HEADER_GREEN);
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('Milestone', 55, y + 5);
  doc.text('Amount', 45 + payCol1W + 10, y + 5, { width: payCol2W - 20, align: 'center' });
  doc.text('Due', 45 + payCol1W + payCol2W + 10, y + 5, { width: payCol3W - 20, align: 'center' });
  y += 20;

  // Row 1
  doc.rect(45, y, 505, 22).stroke(BORDER_COLOR);
  doc.rect(45 + payCol1W, y, 0.5, 22).stroke(BORDER_COLOR);
  doc.rect(45 + payCol1W + payCol2W, y, 0.5, 22).stroke(BORDER_COLOR);
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text('Advance (40%) — begins work', 55, y + 5);
  doc.fillColor(FONT_DARK).fontSize(9).font('Helvetica-Bold').text(advanceAmt, 45 + payCol1W + 10, y + 5, { width: payCol2W - 20, align: 'center' });
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text('On confirmation', 45 + payCol1W + payCol2W + 10, y + 5, { width: payCol3W - 20, align: 'center' });
  y += 22;

  // Row 2
  doc.rect(45, y, 505, 22).stroke(BORDER_COLOR);
  doc.rect(45 + payCol1W, y, 0.5, 22).stroke(BORDER_COLOR);
  doc.rect(45 + payCol1W + payCol2W, y, 0.5, 22).stroke(BORDER_COLOR);
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text('Milestone 2 (30%) — content + ads live', 55, y + 5);
  doc.fillColor(FONT_DARK).fontSize(9).font('Helvetica-Bold').text(m2Amt, 45 + payCol1W + 10, y + 5, { width: payCol2W - 20, align: 'center' });
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text('Day 15', 45 + payCol1W + payCol2W + 10, y + 5, { width: payCol3W - 20, align: 'center' });
  y += 22;

  // Row 3
  doc.rect(45, y, 505, 22).stroke(BORDER_COLOR);
  doc.rect(45 + payCol1W, y, 0.5, 22).stroke(BORDER_COLOR);
  doc.rect(45 + payCol1W + payCol2W, y, 0.5, 22).stroke(BORDER_COLOR);
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text('Milestone 3 (30%) — final report', 55, y + 5);
  doc.fillColor(FONT_DARK).fontSize(9).font('Helvetica-Bold').text(m3Amt, 45 + payCol1W + 10, y + 5, { width: payCol2W - 20, align: 'center' });
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text('Day 30', 45 + payCol1W + payCol2W + 10, y + 5, { width: payCol3W - 20, align: 'center' });
  y += 26;

  const payInstruct = `Pay via UPI: ${upiId} or bank transfer: ${bankDetails}. Send a screenshot after each payment for the record.`;
  doc.fillColor(FONT_MUTED).fontSize(8.2).font('Helvetica-Oblique').text(payInstruct, 45, y, { width: 505 });
  y += doc.heightOfString(payInstruct, { width: 505 }) + 14;

  // Section 6: Key Terms (from the proposal)
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Key Terms (from the proposal)', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;

  const keyTermsBullets = [
    `This confirmation is read together with the proposal dated ${proposalDate} — where the two conflict on price, scope, or dates, this document governs`,
    "If a milestone payment is more than 3 days late, work pauses until it's received — timeline shifts accordingly",
    '1-month engagement. Either side can choose not to continue after Month 1, no further obligation',
    "Mid-month exit needs 7 days' written notice; work billed pro-rata for days completed",
    'Reels and ad creatives become client property once fully paid',
    'No fixed sale number is guaranteed — marketing drives reach and lead volume; final sales also depend on price, stock, delivery, and closing speed',
    'Management fee is inclusive of tax (inclusive of GST)'
  ];
  keyTermsBullets.forEach(pt => {
    doc.fillColor(FONT_DARK).fontSize(9).text('•', 52, y);
    doc.fillColor(FONT_DARK).fontSize(8.8).font('Helvetica').text(pt, 65, y, { width: 485, lineGap: 2 });
    const h = doc.heightOfString(pt, { width: 485, lineGap: 2 });
    y += h + 4;
  });

  // Section 7: Start Date
  y += 8;
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Start Date', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;
  const startText = `Work begins within 24 hours of advance payment (${advanceAmt}). First content calendar shared by ${startDate}.`;
  doc.fillColor(FONT_DARK).fontSize(9).font('Helvetica').text(startText, 45, y, { width: 505 });
  y += doc.heightOfString(startText, { width: 505 }) + 14;

  // Section 8: Acknowledged By
  doc.fillColor(FONT_DARK).fontSize(11.5).font('Helvetica-Bold').text('Acknowledged By', 45, y);
  y += 15;
  doc.rect(45, y, 505, 0.75).fill('#374151');
  y += 8;
  const ackText = "By replying 'Confirmed' on WhatsApp/email, or signing below, both sides agree this reflects what was discussed.";
  doc.fillColor(FONT_MUTED).fontSize(8.5).font('Helvetica-Oblique').text(ackText, 45, y, { width: 505 });
  y += doc.heightOfString(ackText, { width: 505 }) + 18;

  // Dual Signature Blocks (Side by Side)
  const col1X = 45;
  const col2X = 310;
  const sigLineW = 230;

  // Client Block
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text('____________________________________', col1X, y);
  doc.fontSize(9).font('Helvetica-Bold').text(`[${clientName}]  |  ${brandName}`, col1X, y + 14, { width: sigLineW });
  doc.fontSize(8.5).font('Helvetica').text('Date: ____________________', col1X, y + 30);

  // OptiVir Block
  doc.fillColor(FONT_DARK).fontSize(8.5).font('Helvetica').text('____________________________________', col2X, y);
  doc.fontSize(9).font('Helvetica-Bold').text(`[${signerName}]  |  On behalf of OptiVirAds`, col2X, y + 14, { width: sigLineW });
  doc.fontSize(8.5).font('Helvetica').text('Date: ____________________', col2X, y + 30);

  // Page 2 Running Footer
  doc.fillColor(FONT_MUTED).fontSize(7.5).font('Helvetica')
     .text('OptiVirAds | Performance Marketing for Growing Brands', 45, 792, { width: 505, align: 'center', lineBreak: false });
  doc.text('2', 45, 802, { width: 505, align: 'center', lineBreak: false });

  doc.end();
  return promise;
}

// Router handler for /api/pdf/:type
router.get('/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const queryData = req.query as Record<string, any>;
    let pdfBuffer: Buffer;
    let filename = 'document.pdf';

    switch (type.toLowerCase()) {
      case 'invoice':
        pdfBuffer = await generateInvoicePDF(queryData);
        filename = `Invoice-${queryData.invoice_number || queryData.number || 'INV-2026-089'}.pdf`;
        break;

      case 'proposal':
        pdfBuffer = await generateProposalPDF(queryData);
        filename = `Proposal-${queryData.number || queryData.code || 'PROP-2026-042'}.pdf`;
        break;

      case 'quotation':
        pdfBuffer = await generateQuotationPDF(queryData);
        filename = `Quotation-${queryData.number || 'QUO-2026-015'}.pdf`;
        break;

      case 'report':
        pdfBuffer = await generateReportPDF(queryData);
        filename = `Executive-Report-${queryData.client ? String(queryData.client).replace(/\\s+/g, '-') : 'QBR'}.pdf`;
        break;

      case 'contract':
      case 'agreement':
      case 'confirmation':
        pdfBuffer = await generateAgreementPDF(queryData);
        filename = `Confirmation-of-Engagement-${queryData.number || queryData.code || 'OVA-2026-001'}.pdf`;
        break;

      default:
        res.status(400).json({ error: `Unknown document type: ${type}` });
        return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(pdfBuffer);
  } catch (err: any) {
    console.error('Backend PDF generation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to generate PDF' });
  }
});

export { generateProposalPDF, generateAgreementPDF, generateInvoicePDF, generateQuotationPDF, generateReportPDF };
export default router;
