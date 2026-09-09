'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';
import {
  Receipt,
  Plus,
  Download,
  X,
  Mail,
  CheckCircle2,
  FileText,
  Printer,
  ArrowUpRight,
  DollarSign,
  Clock,
  AlertCircle,
  Trash2,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  Upload,
  Calendar,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Check,
  Send,
  ExternalLink,
  ShieldCheck,
  ArrowDownLeft,
  Search,
  RotateCw
} from 'lucide-react';
import { PrintableInvoiceModal, InvoiceData } from './PrintableInvoiceModal';
import { downloadClientPdf } from '@/lib/downloadPdf';

interface FinanceViewProps {
  initialInvoiceData?: any;
  openCreateModal?: boolean;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ initialInvoiceData, openCreateModal }) => {
  const { showToast } = useToast();
  // Simulator State
  const [simulatorState, setSimulatorState] = useState('1. Invoices Ledger');
  const [invoicePage, setInvoicePage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);

  // Sub-Navigation Tabs: 'invoices' | 'payments' | 'expenses' | 'aging' | 'tax'
  const [activeFinanceTab, setActiveFinanceTab] = useState<'invoices' | 'payments' | 'expenses' | 'aging' | 'tax'>('invoices');

  // Currency Mode: INR vs USD
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  // Filter Views for Invoices
  const [invoiceFilterView, setInvoiceFilterView] = useState('all');
  const [paymentFilterMethod, setPaymentFilterMethod] = useState('all');

  // Modals
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<InvoiceData | null>(null);

  // Expenses State & Dataset
  const [expenseFilter, setExpenseFilter] = useState<'all' | 'pending' | 'approved' | 'media' | 'saas'>('all');
  const [newExpCategory, setNewExpCategory] = useState('Paid Media / Ad Spend');
  const [newExpAmount, setNewExpAmount] = useState('₹45,000');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpEntity, setNewExpEntity] = useState('Acme Technologies');
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string | null>(null);

  const [expensesList, setExpensesList] = useState([
    {
      id: 'EXP-2026-042',
      date: '24 Oct 2026',
      submitter: 'Sarah Chen',
      avatarText: 'SC',
      category: 'Paid Media / Ad Spend',
      entity: 'Acme Technologies (CAPI)',
      description: 'Google Ads Q4 Search PMax campaign ad balance refill',
      amount: '₹4,50,000',
      receiptName: 'google_ads_oct_refill.pdf',
      receiptSize: '1.4 MB',
      status: 'Pending Approval',
      statusColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'EXP-2026-041',
      date: '23 Oct 2026',
      submitter: 'David Ross',
      avatarText: 'DR',
      category: 'Cloud & Infrastructure',
      entity: 'Internal Delivery',
      description: 'AWS Production Cloud Run container & BigQuery streaming',
      amount: '₹1,24,000',
      receiptName: 'aws_invoice_oct2026.pdf',
      receiptSize: '840 KB',
      status: 'Pending Approval',
      statusColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'EXP-2026-040',
      date: '22 Oct 2026',
      submitter: 'Marcus Vance',
      avatarText: 'MV',
      category: 'Client Entertaining & Travel',
      entity: 'Zenith Retail Global',
      description: 'Executive dinner with Elena Rostova (CTO) & commercial leads',
      amount: '₹18,500',
      receiptName: 'restaurant_bill_zenith.jpg',
      receiptSize: '2.1 MB',
      status: 'Approved',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'EXP-2026-039',
      date: '20 Oct 2026',
      submitter: 'Elena Rostova',
      avatarText: 'ER',
      category: 'SaaS Software Subscriptions',
      entity: 'Engineering Team',
      description: 'Figma Enterprise 15 seats + HubSpot Marketing Hub',
      amount: '₹88,000',
      receiptName: 'figma_hubspot_bundle.pdf',
      receiptSize: '620 KB',
      status: 'Approved',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'EXP-2026-038',
      date: '18 Oct 2026',
      submitter: 'Priya Sharma',
      avatarText: 'PS',
      category: 'Contractor & Talent',
      entity: 'Vertex Solutions Inc',
      description: 'Senior Python Data Engineer (40h sprint on CAPI pipeline)',
      amount: '₹1,10,000',
      receiptName: 'contractor_timesheet_oct.pdf',
      receiptSize: '1.8 MB',
      status: 'Approved',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    }
  ]);

  // Invoices Dataset matching Reference Image 4
  const [invoices, setInvoices] = useState([
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-089',
      termBadge: 'Net 30',
      clientName: 'Acme Technologies Pvt Ltd',
      gstin: 'GSTIN: 27AAACA1234F1Z5',
      refProposal: 'Ref: QUO-2026-089 (CAPI)',
      dateIssued: '10 Sep 2026',
      dateDue: 'Due 10 Oct 2026',
      amountGstInc: '₹18,50,000',
      amountPaid: '₹9,25,000',
      balanceDue: '₹9,25,000',
      status: 'Partially Paid',
      statusColor: 'text-amber-700 bg-amber-50 border-amber-200',
      isOverdue: false,
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-2026-088',
      termBadge: 'Net 15',
      clientName: 'Zenith Retail Global Ltd',
      gstin: 'GSTIN: 07AABCZ9876Q1ZB',
      refProposal: 'Ref: QUO-2026-088 (Omnichannel)',
      dateIssued: '01 Sep 2026',
      dateDue: 'Due 15 Sep (In 5d)',
      amountGstInc: '₹24,00,000',
      amountPaid: '₹0',
      balanceDue: '₹24,00,000',
      status: 'Sent',
      statusColor: 'text-blue-700 bg-blue-50 border-blue-200',
      isOverdue: false,
    },
    {
      id: 'inv-3',
      invoiceNumber: 'INV-2026-084',
      termBadge: 'Net 15',
      clientName: 'Vertex Solutions Inc',
      gstin: 'GSTIN: 29AABCV4433P1ZQ',
      refProposal: 'Ref: QUO-2026-085 (SEO Engine)',
      dateIssued: '15 Aug 2026',
      dateDue: 'Paid on 28 Aug',
      amountGstInc: '₹6,00,000',
      amountPaid: '₹6,00,000',
      balanceDue: '₹0',
      status: 'Paid',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      isOverdue: false,
    },
    {
      id: 'inv-4',
      invoiceNumber: 'INV-2026-078',
      termBadge: '14d Late',
      isOverdueBadge: true,
      clientName: 'Nova Healthcare Labs',
      gstin: 'GSTIN: 33AAACN5512L1ZZ',
      refProposal: 'Ref: QUO-2026-078 (Cloud Revamp)',
      dateIssued: '12 Jul 2026',
      dateDue: 'Due 12 Aug 2026',
      dateDueUrgent: true,
      amountGstInc: '₹12,50,000',
      amountPaid: '₹0',
      balanceDue: '₹12,50,000',
      status: 'Overdue',
      statusColor: 'text-rose-700 bg-rose-50 border-rose-200',
      isOverdue: true,
    },
    {
      id: 'inv-5',
      invoiceNumber: 'INV-2026-091',
      termBadge: 'Draft',
      clientName: 'Apex Apparel D2C',
      gstin: 'GSTIN: 27AABCA7712M1Z0',
      refProposal: 'Ref: QUO-2026-095 (Shopify Plus)',
      dateIssued: '09 Sep 2026',
      dateDue: 'Net 15',
      amountGstInc: '₹7,25,000',
      amountPaid: '₹0',
      balanceDue: '₹7,25,000',
      status: 'Draft',
      statusColor: 'text-slate-700 bg-slate-100 border-slate-200',
      isOverdue: false,
    },
    {
      id: 'inv-6',
      invoiceNumber: 'INV-2026-072',
      termBadge: 'Net 30',
      clientName: 'CloudScale Telematics',
      gstin: 'GSTIN: 36AABCU8899F1ZV',
      refProposal: 'Ref: QUO-2026-068 (Retainer)',
      dateIssued: '01 Jun 2026',
      dateDue: 'Paid 28 Jun',
      amountGstInc: '₹4,50,000',
      amountPaid: '₹4,50,000',
      balanceDue: '₹0',
      status: 'Paid',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      isOverdue: false,
    },
  ]);

  // Payments Dataset matching Reference Image 5
  const paymentsList = [
    {
      id: 'PAY-2026-118',
      clientName: 'Acme Technologies Pvt Ltd',
      gstin: 'GSTIN: 27AAACA9812M1ZM',
      linkedInvoice: 'INV-2026-089',
      invoicePart: 'Part 1/2',
      dateTimestamp: '10 Sep 2026 14:22 IST',
      method: 'Bank Transfer (NEFT/RTGS)',
      icon: 'bank',
      amountReceived: '₹9,25,000',
      amountColor: 'text-slate-900 dark:text-white',
    },
    {
      id: 'PAY-2026-117',
      clientName: 'Vertex Solutions Inc',
      gstin: 'US Delaware Corp (Cross-Border)',
      linkedInvoice: 'INV-2026-084',
      invoicePart: 'Full',
      dateTimestamp: '28 Aug 2026 11:05 IST',
      method: 'Corporate Card (Razorpay)',
      icon: 'card',
      amountReceived: '₹6,00,000',
      amountColor: 'text-slate-900 dark:text-white',
    },
    {
      id: 'PAY-2026-116',
      clientName: 'CloudScale Telematics',
      gstin: 'GSTIN: 29AABCC4120N1ZK',
      linkedInvoice: 'INV-2026-072',
      invoicePart: 'Full',
      dateTimestamp: '28 Jun 2026 16:40 IST',
      method: 'Bank Transfer (IMPS)',
      icon: 'bank',
      amountReceived: '₹4,50,000',
      amountColor: 'text-slate-900 dark:text-white',
    },
    {
      id: 'PAY-2026-115',
      clientName: 'Zenith Retail Global Ltd',
      gstin: 'GSTIN: 07AAAZG1001P1ZN',
      linkedInvoice: 'INV-2026-081',
      invoicePart: 'Advance',
      dateTimestamp: '22 Aug 2026 09:15 IST',
      method: 'UPI Commercial (Axis VPA)',
      icon: 'upi',
      amountReceived: '₹5,00,000',
      amountColor: 'text-slate-900 dark:text-white',
    },
    {
      id: 'PAY-2026-114',
      clientName: 'Nova Healthcare Labs',
      gstin: 'GSTIN: 33AABCN7814L1Z2',
      linkedInvoice: 'INV-2026-074',
      invoicePart: 'Partial',
      dateTimestamp: '15 Aug 2026 18:30 IST',
      method: 'Bank Wire (Fedwire/SWIFT)',
      icon: 'wire',
      amountReceived: '₹8,00,000',
      amountColor: 'text-slate-900 dark:text-white',
    },
    {
      id: 'PAY-2026-113',
      clientName: 'Apex Apparel D2C',
      gstin: 'GSTIN: 06AABCA3319K1ZY',
      linkedInvoice: 'INV-2026-065',
      invoicePart: 'Adjustment',
      dateTimestamp: '10 Aug 2026 12:10 IST',
      method: 'NetBanking',
      icon: 'bank',
      amountReceived: '-₹45,000',
      amountColor: 'text-rose-600 dark:text-rose-400 font-bold',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#060B13] text-slate-800 dark:text-slate-100 pb-16 transition-colors">
      {/* 1. Top Simulator Bar (Exact match to Reference Image 4 & 5) */}
      <div className="bg-[#0A1628] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-rose-400 uppercase text-[11px]">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>SIM MODE:</span>
          </div>
          <div className="flex items-center gap-1 bg-[#102038] p-0.5 rounded-md border border-[#1A2E4E] flex-wrap">
            {[
              { id: '1. Invoices Ledger', label: '1. Invoices Ledger', tab: 'invoices' },
              { id: '2. Payments Ledger', label: '2. Payments Ledger', tab: 'payments' },
              { id: '3. AR Aging Matrix', label: '3. AR Aging Matrix', tab: 'aging' },
              { id: '4. Create Invoice', label: '4. Create Invoice', action: () => setShowCreateInvoiceModal(true) },
              { id: '5. Record Payment', label: '5. Record Payment', action: () => setShowRecordPaymentModal(true) },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setSimulatorState(st.id);
                  if (st.tab) setActiveFinanceTab(st.tab as any);
                  if (st.action) st.action();
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  simulatorState === st.id
                    ? 'bg-[#B91C1C] text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>ICICI Current A/c Sync: 4m ago</span>
          </span>
          <span className="text-slate-500">|</span>
          <span>FY2026-27 Q3</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center bg-[#102038] rounded p-0.5 border border-[#1A2E4E]">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                currency === 'INR' ? 'bg-[#B91C1C] text-white' : 'text-slate-400'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                currency === 'USD' ? 'bg-[#B91C1C] text-white' : 'text-slate-400'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto p-6 space-y-6">
        {/* ========================================================================= */}
        {/* SCREEN A: INVOICES LEDGER (Reference Image 4)                             */}
        {/* ========================================================================= */}
        {activeFinanceTab === 'invoices' && (
          <>
            {/* Header & Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <span>CRM</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Revenue Engine</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Finance & Invoices</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Finance & Invoices Ledger
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    42 Invoices • ₹2.84 Cr Billed
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>GST Compliant</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage commercial billing, cash flow reconciliation, aging receivables, and multi-entity accounts receivable.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => downloadClientPdf('invoice', { number: 'INV-2026-SUMMARY', client: 'OptiVir Master Client Ledger', total: 48250 })}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 shadow-xs transition"
                  title="Download Invoices Summary PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Download Invoices PDF</span>
                </button>
                <button
                  onClick={() => downloadClientPdf('invoice', { number: 'AGING-REPORT-Q3', client: 'All Enterprise Clients', total: 6600000 })}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 shadow-xs transition"
                  title="Download Aging Receivables Report PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Aging PDF</span>
                </button>
                <button
                  onClick={() => setShowCreateInvoiceModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Invoice</span>
                  <span className="px-1 bg-rose-800 text-[10px] rounded">I</span>
                </button>
              </div>
            </div>

            {/* 6 KPI Cards + 1 Dark KPI Card (Exact match to Reference Image 4) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {/* Total Billed */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>TOTAL BILLED</span>
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹2.84 Cr</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-0.5">+18.4% YoY FY26</div>
              </div>

              {/* Collected */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>COLLECTED</span>
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹2.18 Cr</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">76.7% reconciled</div>
              </div>

              {/* Outstanding */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>OUTSTANDING</span>
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹66.00L</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Across 14 enterprise accounts</div>
              </div>

              {/* Overdue AR */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-rose-600 uppercase">
                  <span>OVERDUE AR</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <div className="text-xl font-bold text-rose-600 mt-1">₹18.50L</div>
                <div className="text-[10px] text-rose-600 font-medium mt-0.5">3 Invoices • Tier 2 Dunning</div>
              </div>

              {/* Due Sep 2026 */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>DUE SEP 2026</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹32.40L</div>
                <div className="text-[10px] text-slate-500 mt-0.5">8 scheduled milestones</div>
              </div>

              {/* Opex & Payables */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>OPEX & PAYABLES</span>
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹48.20L</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cloud infra + contractors</div>
              </div>

              {/* Net Margin (Dark Card with TrendingUp icon) */}
              <div className="bg-[#0A1628] text-white p-3 rounded-xl border border-[#14233D] shadow-md">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase">
                  <span>NET MARGIN</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-black text-white mt-1">₹1.69 Cr</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center justify-between">
                  <span>Operating: 59.5%</span>
                  <span className="bg-emerald-950 px-1 rounded border border-emerald-800 text-[9px]">Healthy</span>
                </div>
              </div>
            </div>

            {/* Critical AR Dunning Notice Banner */}
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded bg-rose-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  !
                </span>
                <div>
                  <strong className="text-rose-900 dark:text-rose-200">Critical AR Dunning Notice: </strong>
                  <span className="text-slate-700 dark:text-slate-300">
                    Invoice <strong>INV-2026-078</strong> (Nova Healthcare Labs • ₹12.50L) is <strong>14 days overdue</strong>. Automated Dunning Tier-2 notice dispatched to Dr. R. Kapoor.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => showToast('Dunning notice re-sent to billing team (Dr. R. Kapoor)', 'info')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  Resend Notice
                </button>
                <button
                  onClick={() => setShowRecordPaymentModal(true)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Record Settlement
                </button>
              </div>
            </div>

            {/* Reconciled Notification Ribbon */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Payment Recd:</strong> ₹18.50L via NEFT from Acme Tech for INV-2026-081.
                </span>
                <button
                  onClick={() => showToast('Opening NEFT receipt for INV-2026-081 (Acme Tech - ₹18.50L)...', 'info')}
                  className="text-blue-600 hover:underline font-semibold text-[11px] cursor-pointer"
                >
                  View Receipt
                </button>
              </div>

              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Upcoming 72h: 2 Invoices totaling ₹8.20L due shortly (Zenith Retail).</span>
                <button
                  onClick={() => {
                    setInvoiceFilterView('due_week');
                    showToast('Filtered invoices: Due Soon within 72h', 'info');
                  }}
                  className="text-slate-700 dark:text-slate-300 underline text-[11px] cursor-pointer"
                >
                  Filter Due Soon
                </button>
              </div>
            </div>

            {/* Subtabs Bar (Invoices Ledger vs Payments Received vs Expenses) */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveFinanceTab('invoices')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 font-bold border-b-2 transition whitespace-nowrap ${
                    activeFinanceTab === 'invoices'
                      ? 'border-[#B91C1C] text-[#B91C1C] dark:text-rose-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Invoices Ledger</span>
                  <span className="px-1.5 py-0.2 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded text-[10px] font-bold">
                    42
                  </span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('payments')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-900 transition whitespace-nowrap"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payments Received</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px]">
                    68
                  </span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('expenses')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Expenses & Payables</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">24</span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('aging')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                >
                  <span>Receivables & Aging</span>
                  <span className="text-rose-600 font-bold">₹66.0L</span>
                </button>

                <button
                  onClick={() => showToast('Tax & GST Ledger (18% schedule): GSTR-1, GSTR-3B export ready', 'info')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap cursor-pointer"
                >
                  <span>Tax & GST Ledger (18%)</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium shrink-0">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Auto-reconciled with ICICI Corporate Banking</span>
              </div>
            </div>

            {/* Filter Ribbon & Views */}
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search invoice #, client name, GSTIN, amount... ⌘K"
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-3 flex-wrap text-xs">
                  <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium">
                    <option>All Clients (14)</option>
                    <option>Acme Technologies</option>
                    <option>Zenith Retail Global</option>
                  </select>

                  <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium">
                    <option>All Statuses</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                    <option>Partially Paid</option>
                  </select>

                  <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium">
                    <option>FY26 Q3 (Current)</option>
                    <option>FY26 Q2</option>
                  </select>

                  <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium">
                    <option>All Managers</option>
                    <option>Alex Morgan</option>
                    <option>Maya Joseph</option>
                  </select>

                  <button
                    onClick={() => {
                      setInvoiceFilterView('all');
                      showToast('Invoice filters reset to All', 'info');
                    }}
                    className="text-rose-600 font-semibold px-2 py-1.5 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* View filter pills */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px]">VIEWS:</span>
                {[
                  { id: 'all', label: 'All Invoices (42)' },
                  { id: 'unpaid', label: 'Unpaid & Overdue (14)' },
                  { id: 'due_week', label: 'Due This Week (5)' },
                  { id: 'paid', label: 'Fully Paid (26)' },
                  { id: 'drafts', label: 'Drafts (2)' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setInvoiceFilterView(v.id)}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      invoiceFilterView === v.id
                        ? 'bg-[#0A1628] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoices High-Density Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5 pl-4 w-10">
                        <input type="checkbox" className="rounded border-slate-300 text-rose-600" />
                      </th>
                      <th className="p-3.5">INVOICE #</th>
                      <th className="p-3.5">CLIENT & BILLING ENTITY</th>
                      <th className="p-3.5">DATES (ISSUED • DUE)</th>
                      <th className="p-3.5">AMOUNT (GST INC)</th>
                      <th className="p-3.5">PAID</th>
                      <th className="p-3.5">BALANCE</th>
                      <th className="p-3.5 pr-4">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => {
                          setSelectedInvoiceForModal({
                            id: inv.id,
                            invoice_number: inv.invoiceNumber,
                            client_name: inv.clientName,
                            client_gstin: inv.gstin,
                            invoice_date: inv.dateIssued,
                            due_date: inv.dateDue,
                            total: 177000,
                            status: inv.status
                          });
                        }}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      >
                        <td className="p-3.5 pl-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-300 text-rose-600" />
                        </td>

                        <td className="p-3.5">
                          <div>
                            <div className={`font-bold ${inv.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                              {inv.invoiceNumber}
                            </div>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold mt-0.5 inline-block ${
                                inv.isOverdueBadge
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {inv.termBadge}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{inv.clientName}</div>
                            <div className="text-[11px] text-slate-500">{inv.gstin} • {inv.refProposal}</div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">{inv.dateIssued}</div>
                            <div className={`text-[11px] ${inv.dateDueUrgent ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                              {inv.dateDue}
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {inv.amountGstInc}
                        </td>

                        <td className="p-3.5 text-slate-700 dark:text-slate-300">
                          {inv.amountPaid}
                        </td>

                        <td className="p-3.5">
                          <span className={`font-bold ${inv.balanceDue !== '₹0' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                            {inv.balanceDue}
                          </span>
                        </td>

                        <td className="p-3.5 pr-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${inv.statusColor}`}>
                              ● {inv.status}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadClientPdf('invoice', {
                                  number: inv.invoiceNumber,
                                  client: inv.clientName,
                                  total: 177000,
                                  gstin: inv.gstin
                                });
                              }}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#B91C1C] transition"
                              title={`Download ${inv.invoiceNumber} PDF`}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0A101C] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Showing <strong>6 of 42</strong> invoices • Page {invoicePage} of 7</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                    disabled={invoicePage === 1}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer px-1.5 py-0.5"
                  >
                    ‹
                  </button>
                  {[1, 2, 3, 7].map((p) => (
                    <button
                      key={p}
                      onClick={() => setInvoicePage(p)}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        invoicePage === p
                          ? 'font-bold bg-[#0A1628] text-white dark:bg-slate-700'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button 
                    onClick={() => setInvoicePage((p) => Math.min(7, p + 1))}
                    disabled={invoicePage === 7}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer px-1.5 py-0.5"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* SCREEN B: PAYMENTS & CASH FLOW LEDGER (Reference Image 5)                */}
        {/* ========================================================================= */}
        {activeFinanceTab === 'payments' && (
          <>
            {/* Subtabs Bar at top of Payments */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveFinanceTab('invoices')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Invoices Ledger</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px]">42</span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('payments')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-bold border-b-2 border-[#B91C1C] text-[#B91C1C] dark:text-rose-400 whitespace-nowrap"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payments Received</span>
                  <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[10px] font-bold">
                    68
                  </span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('expenses')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Expenses & Payables</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px]">24</span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('aging')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap cursor-pointer"
                >
                  <span>Receivables & Aging</span>
                  <span className="text-rose-600 font-bold">₹66.0L</span>
                </button>

                <button
                  onClick={() => showToast('Tax & GST Ledger (18% schedule): GSTR-1, GSTR-3B export ready', 'info')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap cursor-pointer"
                >
                  <span>Tax & GST</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-medium shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ICICI Corporate Sync: 2m ago</span>
                <RefreshCw className="w-3 h-3 text-slate-400 cursor-pointer" />
              </div>
            </div>

            {/* Header & Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <span>CRM</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Revenue Engine</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Finance</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Payments</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Payments & Cash Flow Ledger
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
                    FY26 Q3
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Track inbound client collections, reconcile payment gateways and direct bank wires, audit transaction slips, and issue tax receipts.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    exportToCsv(
                      'reconciled_payments_fy26.csv',
                      paymentsList.map((p) => ({
                        'Payment ID': p.id,
                        'Invoice ID': p.linkedInvoice,
                        Client: p.clientName,
                        Date: p.dateTimestamp,
                        Method: p.method,
                        'Amount Received': p.amountReceived,
                      }))
                    );
                    showToast(`Exported ${paymentsList.length} reconciled payments to CSV`, 'success');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Reconciled CSV</span>
                </button>
                <button
                  onClick={() => showToast('Payment gateway credentials synchronized with Razorpay & Stripe APIs', 'info')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Gateway Config</span>
                </button>
                <button
                  onClick={() => setShowRecordPaymentModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Record Payment</span>
                  <span className="px-1 bg-rose-800 text-[10px] rounded">R</span>
                </button>
              </div>
            </div>

            {/* 4 KPI Cards (Exact match to Reference Image 5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Received This Month */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Received This Month</span>
                  <Receipt className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹42.85L</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">+14.2% MoM</span>
                  <span>38 verified receipts</span>
                </div>
              </div>

              {/* Pending Clearance */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Pending Clearance</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹6.50L</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-bold">3 NEFT / Wire pending</span>
                  <span>Avg. clear 4.2h</span>
                </div>
              </div>

              {/* Overdue Inbound Invoices */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-rose-600">Overdue Inbound Invoices</span>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-bold text-rose-600 mt-1.5">₹18.50L</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold">3 Invoices overdue</span>
                  <span>Follow-up SLA active</span>
                </div>
              </div>

              {/* Refunded / Adjustments */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Refunded / Adjustments</span>
                  <ArrowDownLeft className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹45,000</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">1 Dispute resolution</span>
                  <span>Credit note issued</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs by Payment Method */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All Payments (68)' },
                  { id: 'bank', label: 'Bank Transfer (32)' },
                  { id: 'upi', label: 'UPI / Fast (21)' },
                  { id: 'card', label: 'Corporate Card (11)' },
                  { id: 'pending', label: 'Pending Clearance (4)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentFilterMethod(m.id)}
                    className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                      paymentFilterMethod === m.id
                        ? 'bg-[#0A1628] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="bg-white dark:bg-slate-900 border rounded px-2 py-1 text-xs">
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
            </div>

            {/* Search Ribbon */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Payment ID, Client, UTR, Invoice #..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-3 flex-wrap">
                <select className="bg-slate-50 dark:bg-slate-800 border rounded-lg px-2.5 py-1.5 font-medium">
                  <option>All Clients & Entities</option>
                  <option>Acme Technologies</option>
                  <option>Vertex Solutions</option>
                </select>

                <select className="bg-slate-50 dark:bg-slate-800 border rounded-lg px-2.5 py-1.5 font-medium">
                  <option>All Payment Methods</option>
                  <option>Bank Transfer</option>
                  <option>Corporate Card</option>
                  <option>UPI Commercial</option>
                </select>

                <select className="bg-slate-50 dark:bg-slate-800 border rounded-lg px-2.5 py-1.5 font-medium">
                  <option>Current FY26 Q3</option>
                  <option>FY26 Q2</option>
                </select>

                <button
                  onClick={() => showToast('Payments filters: Current FY26 Q3 bank & gateway transactions', 'info')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
                  <span>Filters (2)</span>
                </button>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5 pl-4">PAYMENT ID</th>
                      <th className="p-3.5">CLIENT & BILLING ENTITY</th>
                      <th className="p-3.5">LINKED INVOICE</th>
                      <th className="p-3.5">DATE & TIMESTAMP</th>
                      <th className="p-3.5">METHOD & GATEWAY</th>
                      <th className="p-3.5 pr-4 text-right">AMOUNT RECEIVED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paymentsList.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5 pl-4 font-bold text-rose-600 dark:text-rose-400">
                          {pay.id}
                        </td>

                        <td className="p-3.5">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{pay.clientName}</div>
                            <div className="text-[11px] text-slate-500">{pay.gstin}</div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                            <span>{pay.linkedInvoice}</span>
                            <span className="px-1 py-0.2 bg-white dark:bg-slate-700 rounded text-[9px] font-bold">
                              {pay.invoicePart}
                            </span>
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-700 dark:text-slate-300">
                          {pay.dateTimestamp}
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                            {pay.icon === 'bank' && <Building2 className="w-3.5 h-3.5 text-blue-600" />}
                            {pay.icon === 'card' && <CreditCard className="w-3.5 h-3.5 text-purple-600" />}
                            {pay.icon === 'upi' && <Zap className="w-3.5 h-3.5 text-emerald-600" />}
                            {pay.icon === 'wire' && <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />}
                            <span>{pay.method}</span>
                          </div>
                        </td>

                        <td className={`p-3.5 pr-4 text-right font-bold text-sm ${pay.amountColor}`}>
                          {pay.amountReceived}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0A101C] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Showing <strong>1–6</strong> of <strong>68</strong> reconciled payment records (FY26 Total: ₹1.82 Cr) • Page {paymentPage} of 3</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
                    disabled={paymentPage === 1}
                    className="px-2.5 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                  >
                    Prev
                  </button>
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPaymentPage(p)}
                      className={`px-2.5 py-1 rounded transition cursor-pointer ${
                        paymentPage === p
                          ? 'font-bold bg-[#B91C1C] text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button 
                    onClick={() => setPaymentPage((p) => Math.min(3, p + 1))}
                    disabled={paymentPage === 3}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* SCREEN C: EXPENSES & MANAGERIAL APPROVALS (Specification Parity)         */}
        {/* ========================================================================= */}
        {activeFinanceTab === 'expenses' && (
          <>
            {/* Subtabs Bar at top of Expenses */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveFinanceTab('invoices')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Invoices Ledger</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">42</span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('payments')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payments Received</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">68</span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('expenses')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-bold border-b-2 border-[#B91C1C] text-[#B91C1C] dark:text-rose-400 whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Expenses &amp; Payables</span>
                  <span className="px-1.5 py-0.2 bg-[#B91C1C] text-white rounded text-[10px] font-bold">
                    {expensesList.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('aging')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                >
                  <span>Receivables &amp; Aging</span>
                  <span className="text-rose-600 font-bold">₹66.0L</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-medium shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Approvals Workflow SLA: 4h Active</span>
              </div>
            </div>

            {/* Header & Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <span>CRM</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>07. Finance</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Expenses &amp; Managerial Approvals</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Expenses &amp; Disbursements Ledger
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                    2 Pending Sign-Off
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Review agency operating burn, audit vendor invoices &amp; ad account refills, verify receipts, and issue managerial approvals.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    exportToCsv(
                      'operational_expenses_fy26.csv',
                      expensesList.map((e) => ({
                        'Expense ID': e.id,
                        Submitter: e.submitter,
                        Date: e.date,
                        Category: e.category,
                        Entity: e.entity,
                        Description: e.description,
                        Amount: e.amount,
                        Status: e.status,
                      }))
                    );
                    showToast(`Exported ${expensesList.length} expenses to CSV`, 'success');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Expense CSV</span>
                </button>
                <button
                  onClick={() => setShowCreateExpenseModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Expense</span>
                </button>
              </div>
            </div>

            {/* 4 Expense KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Total Monthly Burn</span>
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹18,40,000</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">-16.3% Under Budget</span>
                  <span>Cap: ₹22.0L</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-amber-700 dark:text-amber-300">Pending Manager Approvals</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-amber-600 mt-1.5">₹5,74,000</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-bold">2 Awaiting Alex Morgan</span>
                  <span>Google Ads &amp; AWS</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Client Media Ad Spend</span>
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹12,20,000</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold">100% Pass-Through</span>
                  <span>Billed to clients</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Vendor &amp; SaaS Tools</span>
                  <Receipt className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹3,35,000</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-bold">15 Active Tools</span>
                  <span>Figma, AWS, HubSpot</span>
                </div>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Expense ID, Submitter, Category, Project..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'all', label: 'All Expenses (5)' },
                  { id: 'pending', label: 'Pending Approval (2)' },
                  { id: 'approved', label: 'Approved (3)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setExpenseFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                      expenseFilter === f.id
                        ? 'bg-[#0A1628] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5 pl-4">EXPENSE ID</th>
                      <th className="p-3.5">SUBMITTER</th>
                      <th className="p-3.5">CATEGORY &amp; ALLOCATION</th>
                      <th className="p-3.5">PURPOSE &amp; DESCRIPTION</th>
                      <th className="p-3.5">RECEIPT ATTACHMENT</th>
                      <th className="p-3.5">AMOUNT</th>
                      <th className="p-3.5">APPROVAL STATUS</th>
                      <th className="p-3.5 pr-4 text-right">MANAGERIAL ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expensesList
                      .filter((exp) => {
                        if (expenseFilter === 'pending') return exp.status === 'Pending Approval';
                        if (expenseFilter === 'approved') return exp.status === 'Approved';
                        return true;
                      })
                      .map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          <td className="p-3.5 pl-4 font-mono font-bold text-slate-900 dark:text-white">
                            {exp.id}
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-bold text-[11px]">
                                {exp.avatarText}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{exp.submitter}</div>
                                <div className="text-[10px] text-slate-500">{exp.date}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-semibold text-slate-900 dark:text-white">{exp.category}</div>
                            <div className="text-[11px] text-slate-500">{exp.entity}</div>
                          </td>

                          <td className="p-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                            {exp.description}
                          </td>

                          <td className="p-3.5">
                            <button
                              onClick={() => showToast(`Previewing receipt: ${exp.receiptName}`, 'info')}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span className="truncate max-w-[120px]">{exp.receiptName}</span>
                              <span className="text-slate-400 text-[9px]">({exp.receiptSize})</span>
                            </button>
                          </td>

                          <td className="p-3.5 font-bold text-sm text-slate-900 dark:text-white">
                            {exp.amount}
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${exp.statusColor}`}>
                              {exp.status}
                            </span>
                          </td>

                          <td className="p-3.5 pr-4 text-right">
                            {exp.status === 'Pending Approval' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setExpensesList(prev =>
                                      prev.map(item =>
                                        item.id === exp.id
                                          ? { ...item, status: 'Approved', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
                                          : item
                                      )
                                    );
                                    showToast(`Expense ${exp.id} Approved & Ledger Updated!`, 'success');
                                  }}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                                >
                                  Approve ✓
                                </button>
                                <button
                                  onClick={() => {
                                    setExpensesList(prev =>
                                      prev.map(item =>
                                        item.id === exp.id
                                          ? { ...item, status: 'Rejected', statusColor: 'text-rose-700 bg-rose-50 border-rose-200' }
                                          : item
                                      )
                                    );
                                    showToast(`Expense ${exp.id} Rejected.`, 'info');
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50 text-rose-600 font-bold text-[11px] border border-slate-200 transition cursor-pointer"
                                >
                                  Reject ✕
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-medium">Reconciled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Expense Modal with Receipt Upload */}
      {showCreateExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B91C1C]" />
                <span>Submit Operational Expense</span>
              </h3>
              <button onClick={() => setShowCreateExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Expense Category</label>
                  <select
                    value={newExpCategory}
                    onChange={(e) => setNewExpCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    <option>Paid Media / Ad Spend</option>
                    <option>Cloud &amp; Infrastructure</option>
                    <option>SaaS Software Subscriptions</option>
                    <option>Client Entertaining &amp; Travel</option>
                    <option>Contractor &amp; Talent</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Amount (₹)</label>
                  <input
                    type="text"
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Client / Project Allocation</label>
                <select
                  value={newExpEntity}
                  onChange={(e) => setNewExpEntity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <option>Acme Technologies (CAPI Project)</option>
                  <option>Zenith Retail Global (Omnichannel)</option>
                  <option>Vertex Solutions (AI CRM)</option>
                  <option>Agency Operations / Overhead</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Purpose / Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain business justification and line-item details..."
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                ></textarea>
              </div>

              {/* Receipt Upload Box */}
              <div>
                <label className="font-semibold block mb-1">Receipt Attachment (PDF, JPG, PNG)</label>
                <div
                  onClick={() => setUploadedReceiptName('receipt_oct2026_inv.pdf')}
                  className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center cursor-pointer hover:border-slate-400 transition"
                >
                  {uploadedReceiptName ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{uploadedReceiptName} (Attached ✓)</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        Click to attach or drag receipt slip here
                      </div>
                      <div className="text-[10px] text-slate-400">Max size 15 MB. Tax invoices with GSTIN preferred.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowCreateExpenseModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newExp = {
                    id: `EXP-2026-0${expensesList.length + 43}`,
                    date: 'Today',
                    submitter: 'Alex Morgan',
                    avatarText: 'AM',
                    category: newExpCategory,
                    entity: newExpEntity,
                    description: newExpDesc || 'Operational disbursement',
                    amount: newExpAmount,
                    receiptName: uploadedReceiptName || 'receipt_attached.pdf',
                    receiptSize: '1.2 MB',
                    status: 'Pending Approval',
                    statusColor: 'text-amber-700 bg-amber-50 border-amber-200',
                  };
                  setExpensesList([newExp, ...expensesList]);
                  setShowCreateExpenseModal(false);
                  setUploadedReceiptName(null);
                  showToast('Expense logged and submitted for managerial approval!', 'success');
                }}
                className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer hover:bg-[#991B1B] transition"
              >
                Submit Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Record Commercial Payment</h3>
              <button onClick={() => setShowRecordPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Select Client / Entity</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <option>Acme Technologies Pvt Ltd (INV-2026-089)</option>
                  <option>Zenith Retail Global Ltd (INV-2026-088)</option>
                  <option>Nova Healthcare Labs (INV-2026-078)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Amount Received (₹)</label>
                <input
                  type="text"
                  defaultValue="₹9,25,000"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Payment Method & Gateway</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <option>Bank Transfer (NEFT/RTGS)</option>
                  <option>Corporate Card (Razorpay)</option>
                  <option>UPI Commercial (Axis VPA)</option>
                  <option>SWIFT / Fedwire (Cross-Border)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Transaction UTR / Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. ICIC000123984719"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Payment logged & reconciled against ledger!', 'success');
                  setShowRecordPaymentModal(false);
                }}
                className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer hover:bg-[#991B1B] transition"
              >
                Confirm & Reconcile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal with Vector PDF Generation */}
      {selectedInvoiceForModal && (
        <PrintableInvoiceModal
          invoice={selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
        />
      )}
    </div>
  );
};

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
