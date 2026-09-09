'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/toast-context';
import {
  FileText,
  FileCheck,
  Send,
  Download,
  Plus,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  X,
  Printer,
  Eye,
  ArrowRight,
  Clock,
  Receipt,
  Building2,
  Trash2,
  Check,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Upload,
  Layers,
  Edit3,
  Shield,
  Lock,
  GitBranch,
  AlertTriangle,
  History,
  Copy,
  ExternalLink,
  Save,
  CheckSquare,
  HelpCircle,
  Hash,
  Key
} from 'lucide-react';
import { downloadClientPdf } from '@/lib/downloadPdf';

interface ProposalsViewProps {
  onNavigateToInvoice?: (data: any) => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({ onNavigateToInvoice }) => {
  const { showToast } = useToast();
  // State Simulator
  const [simulatorState, setSimulatorState] = useState<'list' | 'detail'>('list');
  const [proposalPage, setProposalPage] = useState(1);

  // Sub-tabs in Detail view
  const [activeDetailTab, setActiveDetailTab] = useState('1. 3-Column Workspace');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'properties' | 'pricing' | 'validation'>('properties');
  const [activeSectionId, setActiveSectionId] = useState('s4');

  // Filter Tabs
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected proposals in table
  const [selectedProposals, setSelectedProposals] = useState<string[]>(['p1']);

  // Proposals Table Data matching Reference Image 1
  const proposalsList = [
    {
      id: 'p1',
      code: 'PROP-2026-089',
      name: 'Enterprise Growth Retainer & Meta CAPI Architecture (Q4-2026)',
      slaTag: '12-Month Performance SLA',
      lineItemsCount: '3 Line Items',
      clientName: 'Acme Technologies Pvt Ltd',
      contactPerson: 'Arjun Nair (Decision Maker)',
      opportunityName: 'Acme Growth ₹18.5L',
      ownerName: 'Alex Morgan',
      ownerInitials: 'AM',
      ownerBg: 'bg-[#0A1628]',
      contractValue: '₹18,50,000',
      contractType: '/ yr + GST',
      version: 'v2.1',
      status: 'In Negotiation',
    },
    {
      id: 'p2',
      code: 'PROP-2026-074',
      name: 'Omnichannel Creative Studio & Brand Performance Retainer',
      slaTag: 'Brand Creative & Production',
      lineItemsCount: '4 SOW Phases',
      clientName: 'Zenith Retail Global Ltd',
      contactPerson: 'Vikram Singhania (VP Marketing)',
      opportunityName: 'Zenith Q4 Scale Deal',
      ownerName: 'Maya Joseph',
      ownerInitials: 'MJ',
      ownerBg: 'bg-[#B91C1C]',
      contractValue: '₹24,00,000',
      contractType: '/ yr recurring',
      version: 'v1.0',
      status: 'Sent',
    },
    {
      id: 'p3',
      code: 'PROP-2026-091',
      name: 'HIPAA Compliant Patient Portal & Cloud Infrastructure Revamp',
      slaTag: 'AWS Architecture & Next.js',
      lineItemsCount: 'Fixed Milestone',
      clientName: 'Nova Healthcare Labs',
      contactPerson: 'Dr. R. Kapoor (CTO)',
      opportunityName: 'Nova Digital Core',
      ownerName: 'Rahul Menon',
      ownerInitials: 'RM',
      ownerBg: 'bg-slate-700',
      contractValue: '₹38,00,000',
      contractType: 'Milestone fixed',
      version: 'v1.3',
      status: 'Awaiting Response',
    },
    {
      id: 'p4',
      code: 'PROP-2026-085',
      name: 'B2B Technical SEO, Core Web Vitals & Content Engine',
      slaTag: 'Organic Search',
      lineItemsCount: '6-Month Audit & Sprint',
      clientName: 'Vertex Solutions Inc',
      contactPerson: 'Kavita Rao (Growth Lead)',
      opportunityName: 'Vertex SEO Scale',
      ownerName: 'Alex Morgan',
      ownerInitials: 'AM',
      ownerBg: 'bg-[#0A1628]',
      contractValue: '₹6,00,000',
      contractType: 'Fixed retainer',
      version: 'v1.0',
      status: 'Draft',
    },
    {
      id: 'p5',
      code: 'PROP-2026-095',
      name: 'Full Funnel CRO & Shopify Plus Headless Migration',
      slaTag: 'Engineering & UX',
      lineItemsCount: 'Technical Draft',
      clientName: 'Apex Apparel D2C',
      contactPerson: 'Marcus Brody (Co-Founder)',
      opportunityName: 'Apex Headless',
      ownerName: 'Maya Joseph',
      ownerInitials: 'MJ',
      ownerBg: 'bg-[#B91C1C]',
      contractValue: '₹14,50,000',
      contractType: 'Scope estimate',
      version: 'v2.0',
      status: 'In Negotiation',
    },
  ];

  // Document Outline Sections
  const [outlineSections, setOutlineSections] = useState([
    { id: 's1', title: '1. Cover Page & Meta', done: true, active: false, editing: false, pending: false },
    { id: 's2', title: '2. Executive Summary', done: true, active: false, editing: false, pending: false },
    { id: 's3', title: '3. Challenge Analysis', done: true, active: false, editing: false, pending: false },
    { id: 's4', title: '4. Proposed Solution', done: false, active: true, editing: true, pending: false },
    { id: 's5', title: '5. Scopes of Work', done: true, active: false, editing: false, pending: false },
    { id: 's6', title: '6. Deliverables & SLA', done: true, active: false, editing: false, pending: false },
    { id: 's7', title: '7. Sprints & Timeline', done: true, active: false, editing: false, pending: false },
    { id: 's8', title: '8. Commercials Engine', done: true, active: false, editing: false, pending: false },
    { id: 's9', title: '9. MSA Legal Terms', done: true, active: false, editing: false, pending: false },
    { id: 's10', title: '10. Digital E-Sig...', done: false, active: false, editing: false, pending: true },
  ]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#060B13] text-slate-800 dark:text-slate-100 pb-16 transition-colors">
      {/* ========================================================================= */}
      {/* VIEW 1: PROPOSALS MANAGEMENT DIRECTORY (Reference Image 1)               */}
      {/* ========================================================================= */}
      {simulatorState === 'list' && (
        <>
          {/* Top Simulator Banner */}
          <div className="bg-[#0A1628] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold tracking-wider text-rose-400 uppercase text-[11px]">
                <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-black text-[10px]">SIM</span>
                <span>INTERACTIVE SCREEN SIMULATOR:</span>
              </div>
              <div className="flex items-center gap-1 bg-[#102038] p-0.5 rounded-md border border-[#1A2E4E] flex-wrap">
                {[
                  { id: 'list', label: '1. Proposals List' },
                  { id: 'detail', label: '2. Proposal Detail' },
                  { id: 'diff', label: '3. Version Diff & History' },
                  { id: 'drawer', label: '4. Create Drawer' },
                  { id: 'telemetry', label: '5. Audit & Telemetry' },
                  { id: 'empty', label: '6. Empty State' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      if (st.id === 'detail') setSimulatorState('detail');
                      else setSimulatorState('list');
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      st.id === simulatorState
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
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Telemetry Sync: Live</span>
              </span>
              <span className="text-slate-500">|</span>
              <span>Enterprise Tier 1</span>
            </div>
          </div>

          <div className="max-w-[1700px] mx-auto p-6 space-y-6">
            {/* Header & Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <span>CRM</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Revenue Engine</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Proposals Management</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Proposals</h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                    <span>38 Total • 14 Active Negotiations</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
                    Q3/Q4-FY26
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Authoritative commercial contracts, dynamic service quotations, digital e-signature tracking, and client telemetry analytics.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => downloadClientPdf('proposal', { number: 'PROP-2026-042', title: 'Enterprise Growth Retainer & Meta CAPI Architecture', client: 'Acme Global Technologies Inc.' })}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Download SOW PDF</span>
                </button>
                <button
                  onClick={() => showToast('Optivir Proposal Template Vault: 14 enterprise templates active', 'info')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Template Vault</span>
                </button>
                <button
                  onClick={() => setSimulatorState('detail')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg shadow-sm transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Proposal</span>
                  <span className="px-1 bg-rose-800 text-[10px] rounded">P</span>
                </button>
              </div>
            </div>

            {/* 7 KPI Summary Cards in a Single Row (Exact match to Reference Image 1) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* Draft */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>DRAFT</span>
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  04 <span className="text-xs text-slate-400 font-normal">₹14.2L</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Scope drafting stage</div>
              </div>

              {/* Sent */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>SENT</span>
                  <Send className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  08 <span className="text-xs text-slate-400 font-normal">₹36.5L</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Awaiting client open</div>
              </div>

              {/* Viewed */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>VIEWED</span>
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  06 <span className="text-[10px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 px-1 py-0.2 rounded">Telemetry Live</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">14m avg reading time</div>
              </div>

              {/* Negotiation */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-rose-600 uppercase">
                  <span>NEGOTIATION</span>
                  <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <div className="text-xl font-bold text-rose-600 mt-1">
                  05 <span className="text-xs text-slate-500 font-normal">₹42.8L</span>
                </div>
                <div className="text-[10px] text-rose-600 font-medium mt-0.5">Active redlining</div>
              </div>

              {/* Accepted MTD */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>ACCEPTED MTD</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  12 <span className="text-xs text-slate-500 font-normal">₹78.4L</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">68.2% win rate</div>
              </div>

              {/* Rejected */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>REJECTED</span>
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  02 <span className="text-xs text-slate-400 font-normal">₹8.5L</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Debrief logged</div>
              </div>

              {/* Expired */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>EXPIRED</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  01 <span className="text-xs text-slate-400 font-normal">₹3.2L</span>
                </div>
                <div className="text-[10px] text-rose-600 font-medium mt-0.5">48h grace period</div>
              </div>
            </div>

            {/* Filter Tabs & Search Ribbon */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'all', label: 'All Proposals (38)' },
                  { id: 'my', label: 'My Proposals (14)' },
                  { id: 'awaiting', label: 'Awaiting Response (14)' },
                  { id: 'negotiation', label: '● In Negotiation (5)', isAlert: true },
                  { id: 'accepted', label: 'Accepted (12)' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveFilterTab(t.id)}
                    className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                      activeFilterTab === t.id
                        ? 'bg-[#0A1628] text-white shadow-xs'
                        : t.isAlert
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                        : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search proposals, clients, deals... ⌘K"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => showToast('Proposal filter presets active: FY 2025-26, All Except Rejected', 'info')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Active Filter Chips Ribbon */}
            <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Active Filter:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-medium">
                  <span>Status: All Except Rejected</span>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-pointer" />
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-medium">
                  <span>Fiscal: FY 2025-26</span>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-pointer" />
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-medium">
                  <span>Scope: Full-Service & Tech</span>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-pointer" />
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    showToast('Proposal filters cleared', 'info');
                  }}
                  className="text-rose-600 font-semibold hover:underline text-[11px] cursor-pointer"
                >
                  Clear all (3)
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Showing 1–5 of 38 Proposals
              </div>
            </div>

            {/* Proposals Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5 pl-4 w-10">
                        <input type="checkbox" className="rounded border-slate-300 text-rose-600" />
                      </th>
                      <th className="p-3.5">PROPOSAL NAME & SERVICE SCOPE</th>
                      <th className="p-3.5">CLIENT & CONTACT</th>
                      <th className="p-3.5">OPPORTUNITY</th>
                      <th className="p-3.5">OWNER</th>
                      <th className="p-3.5">CONTRACT VALUE</th>
                      <th className="p-3.5 pr-4">VERSION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {proposalsList.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => setSimulatorState('detail')}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      >
                        <td className="p-3.5 pl-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-300 text-rose-600" />
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 dark:text-white hover:text-rose-600 transition flex items-center gap-1.5">
                              <span>{p.name}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span>{p.code}</span>
                              <span>•</span>
                              <span>{p.slaTag}</span>
                              <span>•</span>
                              <span className="font-semibold text-rose-600">{p.lineItemsCount}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{p.clientName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span>👤</span>
                              <span>{p.contactPerson}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                            <span>$</span>
                            <span>{p.opportunityName}</span>
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${p.ownerBg} text-white flex items-center justify-center font-bold text-[10px]`}>
                              {p.ownerInitials}
                            </div>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{p.ownerName}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div>
                            <div className="font-bold text-rose-600 dark:text-rose-400 text-sm">{p.contractValue}</div>
                            <div className="text-[11px] text-slate-500">{p.contractType}</div>
                          </div>
                        </td>

                        <td className="p-3.5 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                              {p.version}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadClientPdf('proposal', { number: p.id, title: p.name, client: p.clientName });
                              }}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#B91C1C] transition"
                              title="Download Proposal PDF"
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
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select className="bg-white dark:bg-slate-900 border rounded px-1.5 py-0.5 text-xs">
                    <option>25</option>
                  </select>
                  <span>1–5 of 38 Proposals Total</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setProposalPage((p) => Math.max(1, p - 1))}
                    disabled={proposalPage === 1}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer p-1"
                  >
                    ‹
                  </button>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Page {proposalPage} of 2</span>
                  <button 
                    onClick={() => setProposalPage((p) => Math.min(2, p + 1))}
                    disabled={proposalPage === 2}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer p-1"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: PROPOSAL DETAIL & DOCUMENT EDITOR / SOW BUILDER (Image 2 & 3)    */}
      {/* ========================================================================= */}
      {simulatorState === 'detail' && (
        <div className="space-y-4">
          {/* Top Detail Header Bar */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 shadow-xs">
            <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <button onClick={() => setSimulatorState('list')} className="hover:underline">
                    CRM
                  </button>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Revenue Engine</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <button onClick={() => setSimulatorState('list')} className="hover:underline">
                    Proposals
                  </button>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">PROP-2026-089</span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <FileText className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Enterprise Growth Retainer & Meta CAPI Architecture
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    v2.1 Draft
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Draft • Saved 2m ago</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Autosaved (Cloud sync active)</span>
                </span>
                <button 
                  onClick={() => showToast('Proposal draft v2.1 saved to cloud storage', 'success')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button 
                  onClick={() => showToast('Comparing v2.1 against v2.0 baseline: 4 revisions tracked', 'info')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Diff</span>
                </button>
                <button
                  onClick={() => downloadClientPdf('proposal', { number: 'PROP-2026-042', title: 'Enterprise Growth Retainer & Meta CAPI Architecture', client: 'Acme Global Technologies Inc.' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Download Client Proposal PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => showToast('Proposal PROP-2026-042 dispatched to client via digital signature!', 'success')}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Proposal</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sub Navigation Bar (Image 2) */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2">
            <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4 overflow-x-auto text-xs">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                {[
                  '1. 3-Column Workspace',
                  '2. Document Preview',
                  '3. Pricing Engine',
                  '4. Pre-flight Checks (1 Alert)',
                  '5. Version Tree',
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveDetailTab(tab)}
                    className={`px-3 py-1 rounded-md font-semibold transition ${
                      activeDetailTab === tab
                        ? 'bg-[#0A1628] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-slate-500 shrink-0">
                <span>Linked Deal:</span>
                <span className="font-bold text-slate-900 dark:text-white">Acme Growth Suite ($24.8k) ▾</span>
              </div>
            </div>
          </div>

          {/* 3-Column Workspace Layout (Exact match to Reference Image 2) */}
          <div className="max-w-[1700px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMN 1: Outline & Merge Variables (Left ~2.8 Cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Outline</span>
                  </div>
                  <button
                    onClick={() => {
                      const newSec = { id: `s${outlineSections.length + 1}`, title: `${outlineSections.length + 1}. Additional Terms & Appendix`, done: false, active: false, editing: false, pending: false };
                      setOutlineSections(prev => [...prev, newSec]);
                      showToast('New proposal section added to outline', 'success');
                    }}
                    className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Section</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/40">
                  <span>Merge Variable Vault</span>
                  <span className="font-bold">14 active</span>
                </div>

                {/* Section List */}
                <div className="space-y-1 text-xs">
                  {outlineSections.map((sec) => (
                    <div
                      key={sec.id}
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                        sec.active
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border-l-3 border-[#B91C1C]'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {sec.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {sec.active && <span className="w-2 h-2 rounded-full bg-rose-600"></span>}
                        {sec.pending && <Edit3 className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{sec.title}</span>
                      </div>
                      {sec.editing && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900/60 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                          Editing
                        </span>
                      )}
                      {sec.pending && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-[10px] font-bold text-amber-700">
                          Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Available Tokens */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>AVAILABLE TOKENS</span>
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    <div className="p-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      {'{{client.name}}'}
                    </div>
                    <div className="p-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      {'{{deal.total_val}}'}
                    </div>
                    <div className="p-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      {'{{expiry_date}}'}
                    </div>
                    <div className="p-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      {'{{lead_architect}}'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Proposal Performance Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  PROPOSAL PERFORMANCE
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 dark:text-white">₹20,73,850</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                    +12% vs target
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">12 Month Comprehensive Scope • 3 Workstreams</div>
              </div>
            </div>

            {/* COLUMN 2: Document Canvas & Content Editor (Center ~6.2 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Formatting Toolbar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-xs flex items-center justify-between gap-2 text-xs flex-wrap">
                <div className="flex items-center gap-1">
                  <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-semibold">
                    <option>Heading 2 (Section)</option>
                    <option>Heading 1 (Title)</option>
                    <option>Paragraph</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                  <button onClick={() => showToast('Bold applied', 'info')} className="px-2 py-1 font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">B</button>
                  <button onClick={() => showToast('Italic applied', 'info')} className="px-2 py-1 italic rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">I</button>
                  <button onClick={() => showToast('Underline applied', 'info')} className="px-2 py-1 underline rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">U</button>
                  <button onClick={() => showToast('Strikethrough applied', 'info')} className="px-2 py-1 line-through rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">S</button>
                </div>

                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                  <button onClick={() => showToast('Aligned Left', 'info')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">≡</button>
                  <button onClick={() => showToast('Aligned Center', 'info')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">☵</button>
                  <button onClick={() => showToast('Bullet list toggled', 'info')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">•</button>
                  <button onClick={() => showToast('Numbered list toggled', 'info')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">1.</button>
                </div>
              </div>

              {/* Page Canvas (A4 Styled Document Sheet) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-md space-y-6 text-xs">
                {/* Header Meta on Page */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  <span>Page 4 of 12</span>
                  <span className="uppercase tracking-wider font-bold">OPTIVIR CONFIDENTIAL</span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#0A1628] text-white flex items-center justify-center font-bold text-xs">
                      OV
                    </div>
                    <div>
                      <div className="font-black text-slate-900 dark:text-white">OPTIVIR CRM SOLUTIONS</div>
                      <div className="text-[10px] text-slate-500">Global Revenue Systems Practice</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Prepared exclusively for</div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                      <div className="w-4 h-4 rounded bg-[#0A1628] text-white text-[8px] flex items-center justify-center font-bold">
                        AT
                      </div>
                      <span>Acme Tech Pvt Ltd</span>
                    </div>
                  </div>
                </div>

                {/* Section Title */}
                <div className="space-y-1 pt-2">
                  <div className="text-rose-600 font-bold tracking-wider uppercase text-[10px]">
                    SECTION 04 Technical Architecture & Delivery Framework
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Enterprise Attribution & Conversion API (CAPI) Architecture
                  </h2>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 flex-wrap">
                    <span>Client: <strong className="text-blue-600">Acme Technologies Pvt Ltd</strong></span>
                    <span>•</span>
                    <span>Target Regions: <strong>APAC & US-West</strong></span>
                    <span>•</span>
                    <span>Principal Architect: <strong>Rahul Menon</strong></span>
                  </div>
                </div>

                {/* Body Paragraph */}
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  In response to pervasive ITP browser privacy restrictions, iOS App Tracking Transparency (ATT), and aggressive client-side ad-blocking mechanisms, OptiVir will deploy a bespoke <strong>Server-Side Google Tag Manager (sGTM)</strong> cluster natively hosted on private Google Cloud Run containers. This architectural modernization eliminates reliance on fragile browser pixel telemetry, routing all first-party transaction streams directly to Meta, Google, and LinkedIn Marketing APIs.
                </p>

                {/* Service Level Assurance Banner */}
                <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border-l-3 border-[#B91C1C] border-y border-r border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <Shield className="w-3.5 h-3.5 text-rose-600" />
                    <span>Service Level Assurance (SLA Target)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    OptiVir guarantees <strong>99.9% event delivery uptime</strong> with algorithmic event deduplication between client-side pixel events and server CAPI, recovering an estimated <strong>18% to 24% previously unattributed conversions</strong>.
                  </p>
                </div>

                {/* Component Modernization Matrix Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Component Modernization Matrix</h4>
                  <table className="w-full text-left text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-2.5">ARCHITECTURE COMPONENT</th>
                        <th className="p-2.5">LEGACY CLIENT BASELINE</th>
                        <th className="p-2.5">OPTIVIR MODERNIZED STACK</th>
                        <th className="p-2.5">EXPECTED LIFT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white">Data Telemetry</td>
                        <td className="p-2.5 text-slate-500">Client-side pixel scripts</td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-300 font-medium">First-party sGTM Cloud Run</td>
                        <td className="p-2.5 text-emerald-600 font-bold">+22% Event Capture</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white">Cookie Longevity</td>
                        <td className="p-2.5 text-slate-500">1-7 days (Safari ITP capped)</td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-300 font-medium">Up to 365 days (HTTP-only flag)</td>
                        <td className="p-2.5 text-emerald-600 font-bold">Full Retargeting Pool</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white">Meta Event Match Quality (EMQ)</td>
                        <td className="p-2.5 text-slate-500">4.8 / 10 (Poor)</td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-300 font-medium">8.6 - 9.2 / 10 (Optimal)</td>
                        <td className="p-2.5 text-emerald-600 font-bold">-18% Blended CPA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Figure 4.1 Architecture Pipeline Diagram Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white">
                      FIGURE 4.1: SERVER-SIDE CLOUD RUN PIPELINE DIAGRAM
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                      Container Status: Ready
                    </span>
                  </div>

                  {/* Visual Flow Diagram */}
                  <div className="grid grid-cols-4 gap-2 items-center text-center text-[10px]">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white">Client App</div>
                      <div className="text-slate-400">First-Party Domain</div>
                    </div>
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 font-mono">
                      HTTPS POST →
                    </div>
                    <div className="p-2.5 bg-[#0A1628] text-white rounded-lg border border-[#14233D] shadow-2xs space-y-1">
                      <div className="font-bold text-white">GCP Cloud Run</div>
                      <div className="text-rose-400 font-semibold">sGTM Deduplication</div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white">Meta CAPI</div>
                      <div className="text-slate-400">&amp; GA4 BigQuery</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Encrypted SHA-256 PII Hashing before payload dispatch</span>
                    <button 
                      onClick={() => showToast('Opening Meta CAPI Technical Specification v2.4...', 'info')}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      View Configuration Spec →
                    </button>
                  </div>
                </div>

                {/* Footer Navigation within Document */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <span>Next: 5. Scope of Retainer Services</span>
                  <button 
                    onClick={() => {
                      setActiveSectionId('s5');
                      showToast('Editing Section 5: Scope of Retainer Services', 'info');
                    }}
                    className="font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Edit Section 5 →
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Properties & Security Controls (Right ~3.2 Cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Properties Tab Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-xs">
                  {['properties', 'pricing', 'validation'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveSidebarTab(t as any)}
                      className={`font-bold capitalize transition ${
                        activeSidebarTab === t ? 'text-rose-600 border-b-2 border-rose-600 pb-2' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* SECTION PROPERTIES */}
                <div className="space-y-3 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    SECTION PROPERTIES
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Section Identifier Name</label>
                    <input
                      type="text"
                      defaultValue="4. Proposed Solution & Architecture"
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Slug Anchor</label>
                    <input
                      type="text"
                      defaultValue="#solution-architecture"
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">Client Visible</span>
                      <input type="checkbox" defaultChecked className="rounded text-rose-600" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">Page Break Before</span>
                      <input type="checkbox" defaultChecked className="rounded text-rose-600" />
                    </label>
                  </div>
                </div>

                {/* THEME & LAYOUT */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    THEME & LAYOUT
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Design Theme:</span>
                    <span className="px-2 py-0.5 rounded bg-[#0A1628] text-white font-bold text-[10px]">
                      Navy Crimson
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Typography Engine:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Inter Pro Display</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Paper Format:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono">ISO A4 (210 × 297 mm)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Watermark Status:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                      DRAFT
                    </span>
                  </div>
                </div>

                {/* SECURITY CONTROLS */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    SECURITY CONTROLS
                  </div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">Mutual NDA Required</span>
                    <input type="checkbox" defaultChecked className="rounded text-rose-600" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">Require SMS Passcode</span>
                    <input type="checkbox" className="rounded text-rose-600" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300">Disable Client PDF Download</span>
                    <input type="checkbox" className="rounded text-rose-600" />
                  </label>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600">Link Expiration:</span>
                    <select className="bg-slate-50 dark:bg-slate-800 border rounded px-2 py-1 text-xs">
                      <option>30 Days</option>
                      <option>60 Days</option>
                      <option>90 Days</option>
                    </select>
                  </div>
                </div>

                {/* VERSION SNAPSHOT */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    VERSION SNAPSHOT
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Version:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">v2.1.0-RC3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Author:</span>
                    <span>Marcus Vance</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Hash Checksum:</span>
                    <span className="font-mono text-[10px] text-slate-400">f8b2c4091a...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
