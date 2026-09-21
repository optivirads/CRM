'use client';

import React from 'react';
import { Printer, Download, X, CheckCircle2, Building2, Receipt, Mail, Phone, Globe, QrCode, ShieldCheck } from 'lucide-react';
import { numberToIndianWords } from '@/lib/numberToWords';
import { downloadClientPdf } from '@/lib/downloadPdf';

export interface InvoiceData {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_gstin?: string;
  invoice_date: string;
  due_date: string;
  items?: { description: string; sac_code?: string; quantity: number; rate: number; amount: number }[];
  subtotal?: number;
  tax?: number;
  total: number;
  paid_amount?: number;
  balance_amount?: number;
  status: string;
  notes?: string;
}

interface PrintableInvoiceModalProps {
  invoice: InvoiceData;
  onClose: () => void;
}

export const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({ invoice, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    downloadClientPdf('invoice', {
      id: invoice.id,
      number: invoice.invoice_number || 'INV-001',
      client: invoice.client_name || 'Client',
      total: String(invoice.total || 0),
      email: invoice.client_email || '',
      gstin: invoice.client_gstin || ''
    });
  };

  const totalNum = Number(invoice.total) || 0;
  const paid = Number(invoice.paid_amount || 0);
  const balanceDue = Math.max(0, Math.round(totalNum - paid));
  const isPaidInFull = balanceDue === 0 || paid >= totalNum;
  const statusDisplay = isPaidInFull ? 'Paid' : (paid > 0 ? 'Partially Paid' : (invoice.status || 'Unpaid'));

  // Calculate Subtotal & Taxes (Amount is inclusive of 18% GST — tax is not added on top)
  const calculatedSubtotal = Math.round(totalNum / 1.18);
  const totalTax = totalNum - calculatedSubtotal;
  const cgst = Math.round(totalTax / 2);
  const sgst = totalTax - cgst;
  const grandTotal = totalNum;

  // Invoice Line Items
  const items = invoice.items && invoice.items.length > 0
    ? invoice.items
    : [
        {
          description: 'Digital Marketing & Performance Operations Retainer',
          subtext: 'Includes Search, Social Media Management, and Growth Telemetry (Inclusive of GST)',
          sac_code: '998361',
          quantity: 1,
          rate: calculatedSubtotal,
          amount: calculatedSubtotal
        }
      ];

  const amountInWords = numberToIndianWords(grandTotal);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print-backdrop">
      {/* Modal Container */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Floating Control Bar (Suppressed during print) */}
        <div className="no-print p-4 bg-[#F8F9FB] dark:bg-[#080E18] border-b border-[#E2E6EC] dark:border-[#152238] flex justify-between items-center text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#B91C1C]/10 text-[#B91C1C]">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#0B1727] dark:text-[#F8FAFC]">
                Digital Marketing Agency Tax Invoice — {invoice.invoice_number}
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">
                Standard GST-compliant format • A4 print ready
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#111E34] text-[#0B1727] dark:text-[#F8FAFC] font-semibold hover:bg-slate-100 dark:hover:bg-[#1A2D4C] transition"
            >
              <Download className="w-3.5 h-3.5 text-[#5A6A80]" />
              <span>Save as PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold shadow-xs transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#152238] text-gray-500 hover:text-black dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Wrapper */}
        <div className="overflow-y-auto p-4 sm:p-8 flex-1 bg-slate-100 dark:bg-[#060B13] custom-scrollbar">
          {/* ========================================================================= */}
          {/* THE OFFICIAL DIGITAL MARKETING AGENCY INVOICE A4 SHEET                     */}
          {/* ========================================================================= */}
          <div
            id="printable-tax-invoice"
            className="printable-document bg-white text-[#0B1727] font-sans max-w-3xl mx-auto p-8 sm:p-10 shadow-lg border border-slate-200 rounded-xl space-y-6"
          >
            {/* Top Branding & Invoice Header */}
            <div className="flex justify-between items-start border-b-2 border-[#0B1727] pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src="/images/optivir-logo-transparent.png"
                    alt="OptiVir Digital"
                    className="h-10 w-auto object-contain"
                  />
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-[#0B1727]">
                      OPTIVIR ADS
                    </h1>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#B91C1C] block">
                      Performance Marketing & Growth Engineering
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed max-w-md">
                  <strong>OptiVir Ads</strong><br />
                  <strong>Email:</strong> optivirads@gmail.com • <strong>Phone:</strong> +919995037109 • <strong>Web:</strong> www.optivirads.com
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="inline-block px-3.5 py-1.5 rounded bg-[#0B1727] text-white font-black text-xs uppercase tracking-widest">
                  TAX INVOICE
                </span>
                <div className="mt-3 space-y-1 text-xs text-right">
                  <p>
                    <span className="text-slate-500 font-medium">Invoice No:</span>{' '}
                    <strong className="font-mono text-sm text-[#0B1727]">{invoice.invoice_number}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Invoice Date:</span>{' '}
                    <strong className="text-[#0B1727]">
                      {new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Payment Due:</span>{' '}
                    <strong className="text-[#B91C1C]">
                      {new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-medium">Status:</span>{' '}
                    <span className={`inline-block font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                      statusDisplay === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      statusDisplay === 'Partially Paid' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {statusDisplay}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Client Information & Commercial Terms Strip */}
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Billed To / Client Organization:
                </span>
                <h3 className="font-bold text-sm text-[#0B1727]">{invoice.client_name}</h3>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  {invoice.client_address || 'Corporate Headquarters & Registered Office, India'}<br />
                  <strong>Billing Contact:</strong> {invoice.client_email || `accounts@${invoice.client_name.toLowerCase().replace(/\s+/g, '')}.com`}<br />
                  <strong>GSTIN / Tax ID:</strong> {invoice.client_gstin || '29AABCU9603R1ZM'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Place of Supply & Engagement Terms:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Place of Supply:</strong> Maharashtra (State Code: 27)<br />
                  <strong>Service Category:</strong> Digital Marketing & Advertising (SAC 998361)<br />
                  <strong>Commercial Terms:</strong> Net 15 Calendar Days<br />
                  <strong>PO / Agreement Ref:</strong> MSA-OPTIVIR-{invoice.invoice_number.replace('INV-', '')}
                </p>
              </div>
            </div>

            {/* Itemized Deliverables Table */}
            <div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Digital Marketing Deliverable & Scope</th>
                    <th className="py-2.5 px-3 text-center">SAC Code</th>
                    <th className="py-2.5 px-3 text-center">Qty / Period</th>
                    <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Taxable Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No line items on this invoice.
                      </td>
                    </tr>
                  ) : (
                    items.map((it: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                        <td className="py-3 px-3 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-[#0B1727]">{it.description}</p>
                          {it.subtext && (
                            <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{it.subtext}</p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 font-mono text-[11px]">{it.sac_code || '998361'}</td>
                        <td className="py-3 px-3 text-center text-slate-700 font-semibold">{it.quantity || 1} Month</td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700">₹{Number(it.rate).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right font-bold text-[#0B1727]">₹{Number(it.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations, Tax Breakdown & Grand Total */}
            <div className="flex flex-col sm:flex-row justify-between items-start pt-2 gap-4">
              {/* Amount in Words */}
              <div className="flex-1 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Amount in Words:
                </span>
                <p className="font-bold text-[#0B1727] italic">
                  {amountInWords}
                </p>
                <p className="text-[10px] text-slate-500 pt-1">
                  Tax invoice governed under Indian Goods and Services Tax (GST) Act, 2017.
                </p>
              </div>

              {/* Totals Table */}
              <div className="w-full sm:w-80 space-y-2 text-xs border-t-2 border-slate-300 pt-2">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Subtotal:</span>
                  <span className="font-semibold text-[#0B1727]">₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Central GST (CGST @ 9%):</span>
                  <span className="font-semibold text-[#0B1727]">₹{cgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>State GST (SGST @ 9%):</span>
                  <span className="font-semibold text-[#0B1727]">₹{sgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#0B1727] border-t border-slate-300 pt-2">
                  <span>Total Invoice Value (Incl. Tax):</span>
                  <span className="text-[#B91C1C] text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                {paid > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                    <span>Amount Received / Settled:</span>
                    <span>- ₹{paid.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs font-bold text-slate-800 border-t border-dashed border-slate-300 pt-2 bg-slate-50 p-2 rounded-lg">
                  <span>Net Balance Due:</span>
                  <span className={balanceDue > 0 ? 'text-[#B91C1C] font-extrabold' : 'text-emerald-700 font-extrabold'}>
                    ₹{balanceDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Remittance Wire Details & UPI Mobile QR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#0B1727] font-bold text-[11px] uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Bank Wire & UPI Remittance Details</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Beneficiary:</strong> OptiVir Technologies Private Limited<br />
                  <strong>Bank:</strong> HDFC Bank Ltd, Nariman Point Branch, Mumbai<br />
                  <strong>Current A/C No:</strong> 50200088921134<br />
                  <strong>IFSC Code:</strong> HDFC0000004 • <strong>MICR:</strong> 400240002<br />
                  <strong>UPI ID:</strong> <span className="font-mono text-[#0B1727] font-semibold">optivir.billing@hdfcbank</span>
                </p>
              </div>

              <div className="flex flex-col justify-between items-end text-right pr-2">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500 font-medium">For OptiVir Technologies Pvt. Ltd.</p>
                  <div className="h-12 flex items-center justify-end">
                    <div className="text-right">
                      <span className="font-serif italic text-base text-[#0B1727] border-b border-slate-400 px-4 inline-block">
                        Marcus Vance
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Authorized Signatory & Finance Controller
                  </p>
                </div>
                <p className="text-[9px] text-slate-400 pt-2">
                  Digitally certified tax document. System Generated by OptiVir CRM.
                </p>
              </div>
            </div>

            {/* Terms of Engagement & Footer */}
            <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Digital Marketing Agency Terms & Conditions:</p>
              <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
                <li>1. Payment terms are Net 15 days from the invoice issuance date. Delayed settlements accrue 1.5% interest/month.</li>
                <li>2. Third-party ad platform spends (Google Ads, Meta Ads) are paid directly to the ad platforms and are not included in agency service fees.</li>
                <li>3. Intellectual property for creative assets, ad designs, and copywriting transfers to client upon 100% receipt of invoice settlement.</li>
              </ul>
              <div className="pt-2 text-center text-slate-400 text-[10px]">
                Thank you for partnering with OptiVir Ads. We appreciate your business! • www.optivirads.com • optivirads@gmail.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
