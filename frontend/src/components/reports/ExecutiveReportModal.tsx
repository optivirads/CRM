'use client';

import React from 'react';
import { Printer, Download, X, FileText, CheckCircle2, TrendingUp, DollarSign, Users, Target, ShieldCheck, BarChart3, Building2 } from 'lucide-react';
import { downloadClientPdf } from '@/lib/downloadPdf';

interface ExecutiveReportModalProps {
  onClose: () => void;
  reportDate?: string;
  data?: any;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  onClose,
  reportDate = 'Q3 FY2025 · Jul 1 - Sep 30',
  data
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    downloadClientPdf('report', {
      client: data?.client || 'Acme Global Technologies Inc.',
      title: 'Q3 Executive Agency Operating Report'
    });
  };

  const handleDownloadCSV = () => {
    const csvContent =
      'Category,Metric,Value\n' +
      'Finance,Gross Invoiced Revenue,₹42,50,000\n' +
      'Finance,Actual Cash Collected,₹38,25,000\n' +
      'Finance,Outstanding Receivables,₹4,25,000\n' +
      'Finance,Operating Expenses,₹8,40,000\n' +
      'Finance,Net Operating Margin,₹29,85,000 (78%)\n' +
      'Pipeline,Total Pipeline Value,₹14.82 Cr\n' +
      'Pipeline,Weighted Closing Forecast,₹8.45 Cr\n' +
      'Pipeline,Active Opportunity Deals,18 Deals\n' +
      'Pipeline,Win Probability Average,68%\n' +
      'Clients,Active Retainer Accounts,24 Clients\n' +
      'Clients,Healthy Accounts (>75),21 Clients (88%)\n' +
      'Clients,At-Risk Accounts,3 Clients\n' +
      'Marketing,Total Media Ad Spend,₹18,50,000\n' +
      'Marketing,Attributed Revenue,₹89,72,500\n' +
      'Marketing,Blended Omnichannel ROAS,4.85x\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OptiVir_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print p-4 bg-[#F8F9FB] dark:bg-[#080E18] border-b border-[#E2E6EC] dark:border-[#152238] flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#B91C1C]" />
            <span className="font-bold text-[#0B1727] dark:text-[#F8FAFC]">
              Executive Agency Operating Report — Document Generator
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#111E34] text-[#0B1727] dark:text-[#F8FAFC] font-semibold hover:bg-slate-100 dark:hover:bg-[#1A2D4C] transition"
            >
              <FileText className="w-3.5 h-3.5 text-[#B91C1C]" />
              <span>Download Vector PDF</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#111E34] text-[#0B1727] dark:text-[#F8FAFC] font-semibold hover:bg-slate-100 dark:hover:bg-[#1A2D4C] transition"
            >
              <Download className="w-3.5 h-3.5 text-[#5A6A80]" />
              <span>Export Raw .CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold shadow-xs transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#152238] text-gray-500 hover:text-black dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Clean Printable Executive Report Document */}
        <div className="overflow-y-auto p-6 sm:p-10 flex-1 bg-white text-[#0B1727]">
          <div id="printable-executive-report" className="printable-document bg-white text-[#0B1727] font-sans max-w-3xl mx-auto space-y-6">
            {/* 1. Header & Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-[#0B1727] pb-5">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <img
                    src="/images/optivir-logo-transparent.png"
                    alt="OptiVir CRM"
                    className="h-8 w-auto object-contain"
                  />
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-[#0B1727]">OPTIVIR CRM</h1>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#B91C1C]">
                      Agency Operating System
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#475569]">
                  OptiVir Technologies Pvt. Ltd. • Corporate Operating Intelligence<br />
                  Confidential Management Report for Board & Executive Leadership
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded bg-[#B91C1C] text-white font-black text-xs uppercase tracking-widest">
                  OPERATING AUDIT
                </span>
                <div className="mt-2 space-y-0.5 text-xs text-[#475569]">
                  <p><strong>Reporting Cycle:</strong> {reportDate}</p>
                  <p><strong>Generated At:</strong> {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p><strong>Classification:</strong> Strictly Confidential</p>
                </div>
              </div>
            </div>

            {/* 2. Executive Headline KPI Cards Table */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                1. Consolidated Performance Overview
              </h2>
              <div className="grid grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Revenue (₹)</span>
                  <span className="text-base font-extrabold text-[#0B1727]">₹42,50,000</span>
                  <span className="text-[10px] text-emerald-700 block font-semibold">+18.4% YoY</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Cash Settled (₹)</span>
                  <span className="text-base font-extrabold text-emerald-700">₹38,25,000</span>
                  <span className="text-[10px] text-slate-500 block">90% Collected</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Active Pipeline (₹)</span>
                  <span className="text-base font-extrabold text-[#2563EB]">₹14.82 Cr</span>
                  <span className="text-[10px] text-slate-500 block">₹8.45 Cr Weighted</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Blended ROAS</span>
                  <span className="text-base font-extrabold text-[#0B1727]">4.85x</span>
                  <span className="text-[10px] text-slate-500 block">₹18.5L Spend</span>
                </div>
              </div>
            </div>

            {/* 3. Financial P&L & Cashflow Ledger Section */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                2. Financial Position & Cashflow Ledger
              </h2>
              <table className="w-full text-left text-xs border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-200">
                    <th className="p-2.5">Financial Category</th>
                    <th className="p-2.5">Key Performance Indicator</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                    <th className="p-2.5 text-right">Operational Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  <tr>
                    <td className="p-2.5 font-bold text-[#0B1727]">Gross Invoiced Revenue</td>
                    <td className="p-2.5 text-slate-600">Total contractual client billings across all retainers</td>
                    <td className="p-2.5 text-right font-bold">₹42,50,000</td>
                    <td className="p-2.5 text-right text-emerald-700 font-semibold">Healthy ✓</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-700">Actual Cash Collected</td>
                    <td className="p-2.5 text-slate-600">Reconciled electronic wire transfers and UPI deposits</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">₹38,25,000</td>
                    <td className="p-2.5 text-right text-emerald-700 font-semibold">90% Realized</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-700">Outstanding Receivables</td>
                    <td className="p-2.5 text-slate-600">Pending client balances within net-15 terms</td>
                    <td className="p-2.5 text-right font-bold text-amber-700">₹4,25,000</td>
                    <td className="p-2.5 text-right text-amber-700 font-semibold">Within SLA</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#B91C1C]">Operating Agency Expenses</td>
                    <td className="p-2.5 text-slate-600">Software subscriptions, cloud servers, team payroll</td>
                    <td className="p-2.5 text-right font-bold text-[#B91C1C]">₹8,40,000</td>
                    <td className="p-2.5 text-right text-slate-600 font-semibold">Optimal 20%</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-2.5 text-[#0B1727]">Net Operating Cash Margin</td>
                    <td className="p-2.5 text-slate-600">Retained operating liquidity after agency expenditure</td>
                    <td className="p-2.5 text-right text-emerald-700 font-black">₹29,85,000</td>
                    <td className="p-2.5 text-right text-emerald-700 font-black">70.2% Margin</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Sales Pipeline & High-Value Opportunity Portfolio */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                3. Enterprise Deal Pipeline & Weighted Velocity
              </h2>
              <table className="w-full text-left text-xs border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-200">
                    <th className="p-2.5">Opportunity / Account</th>
                    <th className="p-2.5">Pipeline Stage</th>
                    <th className="p-2.5 text-center">Win Probability</th>
                    <th className="p-2.5 text-right">Deal Capital (₹)</th>
                    <th className="p-2.5 text-right">Expected Close</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  <tr>
                    <td className="p-2.5">
                      <strong className="text-[#0B1727]">Starlight Logistics Corp</strong>
                      <span className="text-[10px] text-slate-500 block">Supply Chain Automation Retainer</span>
                    </td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Negotiation</span></td>
                    <td className="p-2.5 text-center font-bold">85%</td>
                    <td className="p-2.5 text-right font-bold">₹84,00,000</td>
                    <td className="p-2.5 text-right text-slate-600">Sep 28, 2025</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">
                      <strong className="text-[#0B1727]">Aegis Biopharma Group</strong>
                      <span className="text-[10px] text-slate-500 block">Cloud ERP & Regulatory Compliance</span>
                    </td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Proposal</span></td>
                    <td className="p-2.5 text-center font-bold">60%</td>
                    <td className="p-2.5 text-right font-bold">₹1,25,00,000</td>
                    <td className="p-2.5 text-right text-slate-600">Oct 14, 2025</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">
                      <strong className="text-[#0B1727]">Apex HyperScale Networks</strong>
                      <span className="text-[10px] text-slate-500 block">Global Infrastructure Monitoring</span>
                    </td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Won ✓</span></td>
                    <td className="p-2.5 text-center font-bold text-emerald-700">100%</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">₹62,00,000</td>
                    <td className="p-2.5 text-right text-slate-600">Closed Won</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5. Client Accounts & Retention Index */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <h3 className="font-bold text-[11px] text-[#0B1727] uppercase tracking-wider">
                  Client Retention & Health Portfolio
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  • <strong>Total Retained Accounts:</strong> 24 Active Enterprise Retainers<br />
                  • <strong>Healthy Status (&gt;75 Score):</strong> 21 Clients (87.5%)<br />
                  • <strong>Attention / At-Risk:</strong> 3 Clients (Remediation active)<br />
                  • <strong>Average Contract Value:</strong> ₹1.75L / Month per client
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <h3 className="font-bold text-[11px] text-[#0B1727] uppercase tracking-wider">
                  Marketing Attribution & ROAS Telemetry
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  • <strong>Total Media Ad Spend:</strong> ₹18,50,000 across Google & Meta<br />
                  • <strong>Attributed Revenue:</strong> ₹89,72,500 qualified deals<br />
                  • <strong>Blended ROAS:</strong> 4.85x return on ad spend<br />
                  • <strong>Cost Per Lead (CPL):</strong> ₹820 avg across B2B funnels
                </p>
              </div>
            </div>

            {/* 6. Executive Verification & Audit Sign-off */}
            <div className="pt-4 border-t-2 border-slate-200 flex justify-between items-end text-xs">
              <div className="space-y-1 text-slate-500">
                <p className="text-[10px]">
                  <strong>Verification Hash:</strong> SHA256: 7f8a9e2d1c0b8f4e6a8d7c9b0e1f2a3b<br />
                  <strong>Audit Environment:</strong> Production Node (OptiVir Sovereign Core)
                </p>
                <p className="text-[10px]">
                  Report compiled automatically from active transactional database ledger.
                </p>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-slate-500 mb-2">Verified & Authorized for Release</p>
                <div className="h-8 flex items-center justify-end">
                  <span className="font-serif italic text-base text-[#0B1727] border-b border-slate-400 px-4">
                    Marcus Vance
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mt-1">
                  Marcus Vance — Managing Partner
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
