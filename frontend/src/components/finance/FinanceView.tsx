'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';
import { api } from '@/lib/api';
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
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpEntity, setNewExpEntity] = useState('');
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string | null>(null);

  // Invoice Form State
  const [newInvClient, setNewInvClient] = useState('');
  const [newInvNumber, setNewInvNumber] = useState('');
  const [newInvAmount, setNewInvAmount] = useState('');
  const [newInvDueDate, setNewInvDueDate] = useState('');
  const [newInvNotes, setNewInvNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<any | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  interface ExpenseItem {
    id: string;
    date: string;
    submitter: string;
    avatarText: string;
    category: string;
    entity: string;
    description: string;
    amount: string;
    receiptName: string;
    receiptSize: string;
    status: string;
    statusColor: string;
  }

  interface InvoiceItem {
    id: string;
    invoiceNumber: string;
    termBadge: string;
    isOverdueBadge?: boolean;
    clientName: string;
    gstin: string;
    refProposal: string;
    dateIssued: string;
    dateDue: string;
    dateDueUrgent?: boolean;
    amountGstInc: string;
    amountPaid: string;
    balanceDue: string;
    status: string;
    statusColor: string;
    isOverdue: boolean;
  }

  interface PaymentItem {
    id: string;
    clientName: string;
    gstin: string;
    linkedInvoice: string;
    invoicePart: string;
    dateTimestamp: string;
    method: string;
    icon: string;
    amountReceived: string;
    amountColor: string;
  }

  const [expensesList, setExpensesList] = useState<ExpenseItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentItem[]>([]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const [invRes, payRes, expRes] = await Promise.all([
        api.getInvoices().catch(() => ({ success: false, data: [] })),
        api.getPayments().catch(() => ({ success: false, data: [] })),
        api.getExpenses().catch(() => ({ success: false, data: [] }))
      ]);

      if (invRes.success && Array.isArray(invRes.data)) {
        setInvoices(invRes.data.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number || `INV-${(inv.id || '').slice(0, 4)}`,
          termBadge: 'Net 30',
          isOverdueBadge: inv.status === 'Overdue',
          clientName: inv.client_name || 'Client Account',
          gstin: '29ABCDE1234F1Z5',
          refProposal: 'Commercial SOW',
          dateIssued: (inv.invoice_date || inv.issue_date) ? new Date(inv.invoice_date || inv.issue_date).toLocaleDateString() : 'Today',
          dateDue: inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '30 Days',
          amountGstInc: `₹${Number(inv.total || 0).toLocaleString('en-IN')}`,
          amountPaid: `₹${Number(inv.paid_amount || 0).toLocaleString('en-IN')}`,
          balanceDue: `₹${Number(inv.balance_amount !== undefined ? inv.balance_amount : Math.max(0, Number(inv.total || 0) - Number(inv.paid_amount || 0))).toLocaleString('en-IN')}`,
          status: inv.status || 'Pending',
          statusColor: inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
          isOverdue: inv.status === 'Overdue'
        })));
      }

      if (payRes.success && Array.isArray(payRes.data)) {
        setPaymentsList(payRes.data.map((p: any) => ({
          id: p.id,
          clientName: p.client_name || 'Client Account',
          gstin: '29ABCDE1234F1Z5',
          linkedInvoice: p.invoice_number || 'INV-REF',
          invoicePart: 'Payment Ref',
          dateTimestamp: p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'Recently',
          method: p.payment_method || 'Bank Transfer',
          icon: 'bank',
          amountReceived: `₹${Number(p.amount || 0).toLocaleString('en-IN')}`,
          amountColor: 'text-emerald-600'
        })));
      }

      if (expRes.success && Array.isArray(expRes.data)) {
        setExpensesList(expRes.data.map((e: any) => ({
          id: e.id,
          date: e.date ? new Date(e.date).toLocaleDateString() : 'Today',
          submitter: e.vendor || 'Agency Operations',
          avatarText: (e.vendor || 'EX').substring(0, 2).toUpperCase(),
          category: e.category || 'Paid Media',
          entity: 'Client Workstream',
          description: e.description || 'Deliverable Disbursement',
          amount: `₹${Number(e.amount || 0).toLocaleString('en-IN')}`,
          receiptName: 'receipt_verified.pdf',
          receiptSize: '1.2 MB',
          status: 'Approved',
          statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        })));
      }
    } catch (err: any) {
      console.warn('Failed to fetch finance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  useEffect(() => {
    if (initialInvoiceData) {
      if (initialInvoiceData.clientName) setNewInvClient(initialInvoiceData.clientName);
      if (initialInvoiceData.invoiceNumber) setNewInvNumber(initialInvoiceData.invoiceNumber);
      if (initialInvoiceData.amount) setNewInvAmount(String(initialInvoiceData.amount));
      setShowCreateInvoiceModal(true);
    } else if (openCreateModal) {
      setShowCreateInvoiceModal(true);
    }
  }, [initialInvoiceData, openCreateModal]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvClient.trim()) {
      showToast('Client name is required', 'error');
      return;
    }
    const amt = parseFloat(newInvAmount.replace(/[^0-9.]/g, '')) || 50000;
    const taxableSubtotal = Math.round(amt / 1.18);
    const taxAmt = amt - taxableSubtotal;
    try {
      setIsCreatingInvoice(true);
      const res = await api.createInvoice({
        client_name: newInvClient.trim(),
        invoice_number: newInvNumber.trim() || undefined,
        total: amt,
        subtotal: taxableSubtotal,
        tax: taxAmt,
        due_date: newInvDueDate || undefined,
        notes: newInvNotes.trim() || undefined
      });
      if (res.success) {
        showToast('Invoice generated and saved successfully', 'success');
        setShowCreateInvoiceModal(false);
        setNewInvClient('');
        setNewInvNumber('');
        setNewInvAmount('');
        setNewInvDueDate('');
        setNewInvNotes('');
        fetchFinanceData();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create invoice', 'error');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newExpAmount.replace(/[^0-9.]/g, '')) || 0;
    if (amt <= 0) {
      showToast('Please enter a valid expense amount', 'error');
      return;
    }
    try {
      setIsCreatingExpense(true);
      const res = await api.createExpense({
        category: newExpCategory,
        amount: amt,
        vendor: newExpEntity || 'Vendor',
        description: newExpDesc || undefined
      });
      if (res.success) {
        showToast('Expense recorded successfully in database', 'success');
        setShowCreateExpenseModal(false);
        setNewExpAmount('');
        setNewExpDesc('');
        setNewExpEntity('');
        setUploadedReceiptName(null);
        fetchFinanceData();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to record expense', 'error');
    } finally {
      setIsCreatingExpense(false);
    }
  };

  const confirmDeleteInvoice = async () => {
    if (!deletingInvoice) return;
    try {
      setIsDeleting(true);
      const res = await api.deleteInvoice(deletingInvoice.id);
      if (res.success) {
        showToast(`Invoice ${deletingInvoice.invoiceNumber} deleted successfully`);
        setDeletingInvoice(null);
        fetchFinanceData();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete invoice', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteExpense = async () => {
    if (!deletingExpense) return;
    try {
      setIsDeleting(true);
      const res = await api.deleteExpense(deletingExpense.id);
      if (res.success) {
        showToast('Expense record deleted successfully');
        setDeletingExpense(null);
        fetchFinanceData();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete expense', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#060B13] text-slate-800 dark:text-slate-100 pb-16 transition-colors">
      {/* Finance Status & Currency Bar */}
      <div className="bg-[#0A1628] text-white px-6 py-2 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Bank Feed Active: ICICI Current A/c</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Financial Year: FY2026-27</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="text-xs text-slate-300 font-medium">Currency Display:</span>
          <div className="flex items-center bg-[#102038] rounded p-0.5 border border-[#1A2E4E]">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                currency === 'INR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                currency === 'USD' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      <div className="w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
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
                    {invoices.length} Invoices • ₹0.00 Billed
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
                  onClick={() => downloadClientPdf('invoice', { number: 'INV-2026-SUMMARY', client: 'OptiVir Master Client Ledger', total: 0 })}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 shadow-xs transition"
                  title="Download Invoices Summary PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Download Invoices PDF</span>
                </button>
                <button
                  onClick={() => downloadClientPdf('invoice', { number: 'AGING-REPORT-Q3', client: 'All Enterprise Clients', total: 0 })}
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

            {/* 6 KPI Cards + 1 Dark KPI Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {/* Total Billed */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>TOTAL BILLED</span>
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹0</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">0% YoY FY26</div>
              </div>

              {/* Collected */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>COLLECTED</span>
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹0</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">0% reconciled</div>
              </div>

              {/* Outstanding */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>OUTSTANDING</span>
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹0</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Across 0 enterprise accounts</div>
              </div>

              {/* Overdue AR */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>OVERDUE AR</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹0</div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">0 Invoices • No Overdue</div>
              </div>

              {/* Due Sep 2026 */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>DUE THIS MONTH</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹0</div>
                <div className="text-[10px] text-slate-500 mt-0.5">0 scheduled milestones</div>
              </div>

              {/* Opex & Payables */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>OPEX & PAYABLES</span>
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹0</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cloud infra + contractors</div>
              </div>

              {/* Net Margin (Dark Card with TrendingUp icon) */}
              <div className="bg-[#0A1628] text-white p-3 rounded-xl border border-[#14233D] shadow-md">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase">
                  <span>NET MARGIN</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-black text-white mt-1">₹0</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center justify-between">
                  <span>Operating: 0%</span>
                  <span className="bg-emerald-950 px-1 rounded border border-emerald-800 text-[9px]">Stable</span>
                </div>
              </div>
            </div>

            {/* Critical AR Dunning Notice Banner */}
            {invoices.filter((i) => i.isOverdue).length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-rose-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                    !
                  </span>
                  <div>
                    <strong className="text-rose-900 dark:text-rose-200">Critical AR Dunning Notice: </strong>
                    <span className="text-slate-700 dark:text-slate-300">
                      Overdue invoices detected. Automated Dunning notices dispatched.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => showToast('Dunning notice re-sent to billing team', 'info')}
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
            )}

            {/* Reconciled Notification Ribbon */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Accounting Sync:</strong> Bank feed and automated reconciliation operational.
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>No overdue invoices requiring escalation.</span>
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
                    {invoices.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('payments')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-900 transition whitespace-nowrap"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payments Received</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px]">
                    {paymentsList.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('expenses')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Expenses & Payables</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">{expensesList.length}</span>
                </button>

                <button
                  onClick={() => setActiveFinanceTab('aging')}
                  className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                >
                  <span>Receivables & Aging</span>
                  <span className="text-slate-600 dark:text-slate-400 font-bold">₹0</span>
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
                    <option>All Clients</option>
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
                  { id: 'all', label: `All Invoices (${invoices.length})` },
                  { id: 'unpaid', label: 'Unpaid & Overdue (0)' },
                  { id: 'due_week', label: 'Due This Week (0)' },
                  { id: 'paid', label: 'Fully Paid (0)' },
                  { id: 'drafts', label: 'Drafts (0)' },
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
                <table className="w-full min-w-[800px] text-left text-xs">
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
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-500">
                          <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                          <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No invoices found</div>
                          <div className="text-xs text-slate-400 mt-1">Create an invoice to start tracking billing and commercial receivables.</div>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingInvoice(inv);
                                }}
                                className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                                title={`Delete ${inv.invoiceNumber}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0A101C] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Showing <strong>{invoices.length > 0 ? 1 : 0} of {invoices.length}</strong> invoices • Page {invoicePage} of 1</span>
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
                  onClick={() => showToast('Payment gateway credentials synchronized with Razorpay, Paytm PG & Stripe APIs', 'info')}
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

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Received This Month */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Received This Month</span>
                  <Receipt className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹0</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">0% MoM</span>
                  <span>0 verified receipts</span>
                </div>
              </div>

              {/* Pending Clearance */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Pending Clearance</span>
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹0</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">0 pending</span>
                </div>
              </div>

              {/* Overdue Inbound Invoices */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Overdue Inbound Invoices</span>
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹0</div>
                <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1.5">
                  <span>No invoices overdue</span>
                </div>
              </div>

              {/* Refunded / Adjustments */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Refunded / Adjustments</span>
                  <ArrowDownLeft className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹0</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>0 adjustments</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs by Payment Method */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: `All Payments (${paymentsList.length})` },
                  { id: 'bank', label: 'Bank Transfer (0)' },
                  { id: 'upi', label: 'UPI / Fast (0)' },
                  { id: 'card', label: 'Corporate Card (0)' },
                  { id: 'pending', label: 'Pending Clearance (0)' },
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
                  onClick={() => showToast('Payments filters reset', 'info')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-xs">
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
                    {paymentsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500">
                          <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                          <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No payment records found</div>
                          <div className="text-xs text-slate-400 mt-1">Record a payment or connect a payment gateway to view collections.</div>
                        </td>
                      </tr>
                    ) : (
                      paymentsList.map((pay) => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0A101C] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Showing <strong>{paymentsList.length > 0 ? 1 : 0}</strong> of <strong>{paymentsList.length}</strong> reconciled payment records • Page 1 of 1</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setPaymentPage(1)}
                    disabled
                    className="px-2.5 py-1 text-slate-400 disabled:opacity-30 cursor-pointer"
                  >
                    Prev
                  </button>
                  {[1].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPaymentPage(p)}
                      className="px-2.5 py-1 rounded transition font-bold bg-[#B91C1C] text-white shadow-2xs"
                    >
                      {p}
                    </button>
                  ))}
                  <button 
                    disabled
                    className="px-2.5 py-1 text-slate-400 disabled:opacity-30 cursor-pointer"
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
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                    {expensesList.filter(e => e.status === 'Pending Approval').length} Pending Sign-Off
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
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹0</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">Under Budget</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Pending Manager Approvals</span>
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹0</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>0 awaiting sign-off</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Client Media Ad Spend</span>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹0</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>0 Pass-Through</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Vendor &amp; SaaS Tools</span>
                  <Receipt className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">₹0</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>0 Active Tools</span>
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
                  { id: 'all', label: `All Expenses (${expensesList.length})` },
                  { id: 'pending', label: 'Pending Approval (0)' },
                  { id: 'approved', label: 'Approved (0)' },
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
                <table className="w-full min-w-[800px] text-left text-xs">
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
                    {expensesList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-500">
                          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                          <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No operational expenses recorded</div>
                          <div className="text-xs text-slate-400 mt-1">Submit an expense with receipts for managerial approval and ledger tracking.</div>
                        </td>
                      </tr>
                    ) : (
                      expensesList
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
                            <div className="flex items-center justify-end gap-1.5">
                              {exp.status === 'Pending Approval' ? (
                                <>
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
                                </>
                              ) : (
                                <span className="text-slate-400 text-[11px] font-medium">Reconciled</span>
                              )}
                              <button
                                onClick={() => setDeletingExpense(exp)}
                                className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                                title="Delete Expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
                <input
                  type="text"
                  placeholder="Client or Project Allocation Name"
                  value={newExpEntity}
                  onChange={(e) => setNewExpEntity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
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
                onClick={handleCreateExpense}
                disabled={isCreatingExpense}
                className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer hover:bg-[#991B1B] transition disabled:opacity-50"
              >
                {isCreatingExpense ? 'Submitting...' : 'Submit Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Generate Commercial Invoice</h3>
              <button onClick={() => setShowCreateInvoiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Solutions"
                  value={newInvClient}
                  onChange={(e) => setNewInvClient(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-001 (auto if blank)"
                    value={newInvNumber}
                    onChange={(e) => setNewInvNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Total Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={newInvAmount}
                    onChange={(e) => setNewInvAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newInvDueDate}
                  onChange={(e) => setNewInvDueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Terms / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Payment due within 30 days. GST 18% inclusive."
                  value={newInvNotes}
                  onChange={(e) => setNewInvNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingInvoice}
                  className="px-5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition disabled:opacity-50"
                >
                  {isCreatingInvoice ? 'Generating...' : 'Save & Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Invoice Confirmation Modal */}
      {deletingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-[#0B1727] dark:text-white">Delete Invoice</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete invoice <span className="font-bold text-slate-900 dark:text-white">{deletingInvoice.invoiceNumber}</span> for <span className="font-bold text-slate-900 dark:text-white">{deletingInvoice.clientName}</span>? This will remove the invoice record from the database.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
              <button
                type="button"
                onClick={() => setDeletingInvoice(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 dark:border-[#152238] text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteInvoice}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-[#0B1727] dark:text-white">Delete Expense</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete expense <span className="font-bold text-slate-900 dark:text-white">{deletingExpense.category}</span> ({deletingExpense.amount})? This will permanently remove the record from the database ledger.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 dark:border-[#152238] text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteExpense}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
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
                <input
                  type="text"
                  placeholder="Client Name or Invoice Ref"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Amount Received (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 50,000"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Payment Method & Gateway</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <option>Bank Transfer (NEFT/RTGS)</option>
                  <option>Razorpay Gateway (Card / UPI / NetBanking)</option>
                  <option>Paytm PG (UPI Intent / Cards / Wallet / NetBanking)</option>
                  <option>Stripe International (USD/EUR Card)</option>
                  <option>UPI Commercial (Axis / ICICI VPA)</option>
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
