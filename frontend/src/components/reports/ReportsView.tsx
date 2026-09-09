'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Send,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  SlidersHorizontal,
  X,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Archive,
  BarChart2,
  Check,
  Building,
  User,
  Activity,
  Terminal,
  Play
} from 'lucide-react';
import { ExecutiveReportModal } from './ExecutiveReportModal';
import { downloadClientPdf } from '@/lib/downloadPdf';

export const ReportsView: React.FC = () => {
  // Simulator View Modes
  const [simulatorView, setSimulatorView] = useState<
    '1. Reports Directory & Metrics' |
    '2. Document Preview & Dossier' |
    '3. 3-Column Report Builder' |
    '4. Automated Dispatch Engine' |
    '5. Real-Time Pipeline State'
  >('1. Reports Directory & Metrics');

  // Category Tabs
  const [activeTab, setActiveTab] = useState('All Reports (148)');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('All Clients (14)');
  const [selectedQuarter, setSelectedQuarter] = useState('FY26 Q3 (Current)');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedFormat, setSelectedFormat] = useState('All Formats');

  // Selection & Action states
  const [selectedReports, setSelectedReports] = useState<string[]>(['REP-2026-104']);
  const [reportPage, setReportPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showStreamInspector, setShowStreamInspector] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleSelectReport = (id: string) => {
    if (selectedReports.includes(id)) {
      setSelectedReports(selectedReports.filter(r => r !== id));
    } else {
      setSelectedReports([...selectedReports, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === reportsList.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reportsList.map(r => r.id));
    }
  };

  // 4 KPI Cards
  const kpis = [
    {
      label: 'Reports Generated',
      value: '148',
      tag: 'FY26 Q3',
      sub: '+18.4% MoM',
      note: '99.4% compilation rate',
      icon: FileSpreadsheet,
      color: 'text-[#0B1727] dark:text-white'
    },
    {
      label: 'Automated Dispatches',
      value: '32',
      tag: 'Active',
      tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      sub: 'Next: Acme QBR • Tomorrow 09:00 IST',
      icon: Send,
      color: 'text-[#0B1727] dark:text-white'
    },
    {
      label: 'Draft & In-Review',
      value: '09',
      tag: 'Pending signoff',
      tagColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      sub: '3 executive reviews due today',
      icon: Clock,
      color: 'text-[#DC2626]'
    },
    {
      label: 'Client Engagement',
      value: '41',
      tag: 'Downloads',
      tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      sub: 'Across 14 enterprise stakeholder portals',
      icon: Activity,
      color: 'text-[#0B1727] dark:text-white'
    }
  ];

  // 6 Reports matching Mockup 2
  const reportsList = [
    {
      id: 'REP-2026-104',
      name: 'Acme Enterprise Q3 Omnichannel ROAS & Growth Dossier',
      sub: 'REP-2026-104 • PDF (14 pages, 4.2 MB)',
      category: 'Marketing & Client',
      categoryBadge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      client: 'Acme Technologies Pvt Ltd',
      horizon: 'FY26 Q3 (Jul - Sep)',
      author: 'Marcus Vance',
      authorRole: 'VP of Operations',
      avatarColor: 'bg-indigo-600',
      status: 'Ready',
      statusType: 'ready',
      statusBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
    },
    {
      id: 'REP-2026-103',
      name: 'Zenith Retail Commercial Revenue & Pipeline Velocity Review',
      sub: 'REP-2026-103 • Interactive Portal + PDF',
      category: 'Sales & Mgmt',
      categoryBadge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
      client: 'Zenith Retail Global Ltd',
      horizon: 'Aug 2026 MBR',
      author: 'Alex Morgan',
      authorRole: 'Chief Commercial Officer',
      avatarColor: 'bg-amber-600',
      status: 'Weekly Mon 09:00',
      statusType: 'scheduled',
      statusBadge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400'
    },
    {
      id: 'REP-2026-102',
      name: 'Nova Health Cloud Migration Delivery & SOW Burn-down Audit',
      sub: 'REP-2026-102 • Compiling Telemetry Visuals',
      category: 'Project Delivery',
      categoryBadge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
      client: 'Nova Healthcare Labs',
      horizon: 'Sprint 14 - 16',
      author: 'Rahul Menon',
      authorRole: 'Delivery Lead',
      avatarColor: 'bg-rose-600',
      status: 'Generating (78%)',
      statusType: 'generating',
      statusBadge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
    },
    {
      id: 'REP-2026-101',
      name: 'Vertex Solutions SaaS Discovery Funnel & Attribution Telemetry',
      sub: '⚠️ GA4 API Token Revoked',
      subError: true,
      category: 'Marketing & Funnel',
      categoryBadge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
      client: 'Vertex Solutions Inc',
      horizon: 'Last 60 Days',
      author: 'Priya Iyer',
      authorRole: 'Analytics Director',
      avatarColor: 'bg-teal-600',
      status: 'Failed Run',
      statusType: 'failed',
      statusBadge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
    },
    {
      id: 'REP-2026-100',
      name: 'Apex Apparel Festive Ad Spend & Meta CAPI Margin Analysis',
      sub: 'REP-2026-100 • PDF Dossier (18 pages)',
      category: 'Financial & Ads',
      categoryBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      client: 'Apex Apparel D2C',
      horizon: 'Festive Early-Access',
      author: 'Maya Joseph',
      authorRole: 'Media Buyer Lead',
      avatarColor: 'bg-violet-600',
      status: 'Ready',
      statusType: 'ready',
      statusBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
    },
    {
      id: 'REP-2026-098',
      name: 'FY26 Half-Year Consolidated Executive Revenue & EBITDA Dossier',
      sub: 'REP-2026-098 • Archived Audit Package',
      category: 'Management & EBITDA',
      categoryBadge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      client: 'Internal Executive Board',
      horizon: 'H1 FY26',
      author: 'Marcus Vance',
      authorRole: 'VP of Operations',
      avatarColor: 'bg-indigo-600',
      status: 'Archived',
      statusType: 'archived',
      statusBadge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
    }
  ];

  const filteredReports = reportsList.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = selectedClient === 'All Clients (14)' || r.client.includes(selectedClient.split(' ')[0]);
    const matchesStatus = selectedStatus === 'All Statuses' || r.status.includes(selectedStatus);
    return matchesSearch && matchesClient && matchesStatus;
  });

  return (
    <div className="pb-16 transition-colors duration-200">
      {/* 0. Top State Simulator Module Switcher Banner */}
      <div className="bg-[#0A1628] text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-rose-400 uppercase text-[11px]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>SIMULATOR VIEW:</span>
          </div>
          <div className="flex items-center gap-1 bg-[#102038] p-0.5 rounded-md border border-[#1A2E4E] flex-wrap">
            {[
              '1. Reports Directory & Metrics',
              '2. Document Preview & Dossier',
              '3. 3-Column Report Builder',
              '4. Automated Dispatch Engine',
              '5. Real-Time Pipeline State'
            ].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setSimulatorView(v as any);
                  if (v === '2. Document Preview & Dossier') setShowExecutiveModal(true);
                  if (v === '3. 3-Column Report Builder') setShowCreateModal(true);
                  if (v === '4. Automated Dispatch Engine') setShowDispatchModal(true);
                  if (v === '5. Real-Time Pipeline State') setShowStreamInspector(true);
                  showToast(`Switched view: ${v}`);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  simulatorView === v
                    ? 'bg-[#B91C1C] text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Audit Engine v4.8 Active
          </span>
          <span className="text-slate-600">|</span>
          <span>Sync: 3 mins ago</span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1628] text-white px-4 py-3 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Live Compilation Pipeline Banner (#GEN-9902 Active - 78% Complete) */}
      <div className="bg-[#0D1B33] text-white border-b border-[#1C3259] px-6 py-3 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-blue-400 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-wide">
                  Compilation Pipeline #GEN-9902 Active
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DC2626] text-white">
                  78% Complete
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Rendering Nova Healthcare Cloud SOW Slices & Telemetry Graphics (ETA: 14s)
              </p>
            </div>
          </div>

          {/* Stepper Progress Visualizer */}
          <div className="flex items-center gap-4 text-[11px] text-slate-300 w-full md:w-auto justify-between md:justify-end">
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ✓ 1. Warehouse Stream
              </span>
              <span className="text-slate-500">→</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ✓ 2. Aggregation
              </span>
              <span className="text-slate-500">→</span>
              <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                ● 3. Visual Engine (Active)
              </span>
              <span className="text-slate-500">→</span>
              <span className="text-slate-500">
                4. PDF Compile
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStreamInspector(true)}
                className="px-3 py-1 rounded bg-[#16294D] hover:bg-[#1E3666] border border-[#27457F] text-xs font-semibold text-white transition flex items-center gap-1"
              >
                <Terminal className="w-3 h-3 text-blue-400" />
                <span>Inspect Stream</span>
              </button>
              <button
                onClick={() => showToast('Pipeline notification dismissed')}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* 1. Breadcrumbs & Header */}
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium mb-1">
            <span className="text-[#DC2626] font-semibold">CRM</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span>Operations</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">Reports & Intelligence Center</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mt-2">
            <div>
              <h1 className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC] tracking-tight">
                Reports & Business Intelligence Center
              </h1>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-3xl">
                Generate, schedule, audit, and distribute automated performance dossiers, executive QBRs, and client commercial telemetry across multi-channel accounts.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Report</span>
                <span className="text-[10px] bg-red-900/60 px-1 py-0.2 rounded ml-1">R</span>
              </button>

              <button
                onClick={() => setShowDispatchModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#111E34] text-[#0B1727] dark:text-white text-xs font-semibold border border-[#E2E6EC] dark:border-[#152238] shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>Schedule Dispatch</span>
              </button>

              <button
                onClick={() => setShowTemplateLibrary(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#111E34] text-[#0B1727] dark:text-white text-xs font-semibold border border-[#E2E6EC] dark:border-[#152238] shadow-xs transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>Template Library</span>
              </button>

              <button
                onClick={() => showToast('Audit ledger archive exported')}
                className="p-2 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#111E34] text-slate-600 dark:text-slate-300 border border-[#E2E6EC] dark:border-[#152238] shadow-xs"
                title="Export Archive"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    {k.label}
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#111E34] text-slate-500">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className={`text-3xl font-bold tracking-tight ${k.color}`}>
                    {k.value}
                  </span>
                  {k.tag && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${k.tagColor || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {k.tag}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{k.sub}</span>
                  {k.note && <span>{k.note}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Category Tabs */}
        <div className="border-b border-[#E2E6EC] dark:border-[#152238] flex items-center gap-2 overflow-x-auto pb-px">
          {[
            'All Reports (148)',
            'Client Commercial (42)',
            'Marketing Performance (36)',
            'Campaign Telemetry (28)',
            'Sales Velocity (19)',
            'Project Delivery (14)',
            'Financial & EBITDA'
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                showToast(`Filter applied: ${tab}`);
              }}
              className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap rounded-t-lg transition border-b-2 ${
                activeTab === tab
                  ? 'border-[#B91C1C] text-[#B91C1C] dark:text-rose-400 bg-white dark:bg-[#0B1424]'
                  : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0B1727] dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. Filter Strip */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by report name, client, author, format..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] text-xs focus:outline-none focus:border-[#B91C1C]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-1.5 text-xs text-[#0B1727] dark:text-white font-medium"
            >
              <option value="All Clients (14)">All Clients (14)</option>
              <option value="Acme Technologies Pvt Ltd">Acme Technologies Pvt Ltd</option>
              <option value="Zenith Retail Global Ltd">Zenith Retail Global Ltd</option>
              <option value="Nova Healthcare Labs">Nova Healthcare Labs</option>
              <option value="Apex Apparel D2C">Apex Apparel D2C</option>
              <option value="Vertex Solutions Inc">Vertex Solutions Inc</option>
            </select>

            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-1.5 text-xs text-[#0B1727] dark:text-white font-medium"
            >
              <option value="FY26 Q3 (Current)">FY26 Q3 (Current)</option>
              <option value="FY26 Q2">FY26 Q2</option>
              <option value="FY26 Q1">FY26 Q1</option>
              <option value="FY25 Q4">FY25 Q4</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-1.5 text-xs text-[#0B1727] dark:text-white font-medium"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Ready">Ready</option>
              <option value="Weekly Mon">Weekly Mon 09:00</option>
              <option value="Generating">Generating</option>
              <option value="Failed Run">Failed Run</option>
              <option value="Archived">Archived</option>
            </select>

            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-1.5 text-xs text-[#0B1727] dark:text-white font-medium"
            >
              <option value="All Formats">All Formats</option>
              <option value="PDF">PDF Dossier</option>
              <option value="Interactive">Interactive Web Portal</option>
              <option value="CSV">Data CSV</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedClient('All Clients (14)');
                setSelectedQuarter('FY26 Q3 (Current)');
                setSelectedStatus('All Statuses');
                setSelectedFormat('All Formats');
                showToast('Filters cleared');
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 5. Bulk Action Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#64748B] dark:text-[#94A3B8] px-1 gap-2">
          <span>
            Showing <strong>{filteredReports.length}</strong> of <strong>148</strong> Reports • Sorted by Last Modified (Descending)
          </span>

          <div className="flex items-center gap-2">
            <span>Bulk Action:</span>
            <button
              onClick={() => {
                downloadClientPdf('report', { client: 'Acme Global Technologies Inc.', title: 'Batch Executive Intelligence Dossier' });
                showToast(`Downloading verified PDF report dossier...`);
              }}
              disabled={selectedReports.length === 0}
              className="px-2.5 py-1 rounded bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] text-[#0B1727] dark:text-white text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-[#B91C1C]" />
              <span>Batch Download PDF</span>
            </button>
            <button
              onClick={() => showToast(`Dispatching ${selectedReports.length} selected report(s) to client portals...`)}
              disabled={selectedReports.length === 0}
              className="px-2.5 py-1 rounded bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] text-[#0B1727] dark:text-white text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3 h-3 text-[#B91C1C]" />
              <span>Batch Dispatch</span>
            </button>
          </div>
        </div>

        {/* 6. High-Density Reports Table */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0B1727] dark:text-[#CBD5E1]">
              <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-[#64748B] dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider border-b border-[#E2E6EC] dark:border-[#152238]">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedReports.length === reportsList.length}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-[#B91C1C] focus:ring-[#B91C1C]"
                    />
                  </th>
                  <th className="p-3.5">REPORT NAME & ID</th>
                  <th className="p-3.5">CATEGORY</th>
                  <th className="p-3.5">CLIENT ENTITY</th>
                  <th className="p-3.5">HORIZON</th>
                  <th className="p-3.5">CREATED BY</th>
                  <th className="p-3.5 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
                {filteredReports.map((r) => {
                  const isSelected = selectedReports.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => {
                        toggleSelectReport(r.id);
                        if (r.id === 'REP-2026-104') setShowExecutiveModal(true);
                      }}
                      className={`hover:bg-slate-50/70 dark:hover:bg-[#111E34]/50 transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/40 dark:bg-[#132745]/30' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectReport(r.id)}
                          className="rounded border-slate-300 text-[#B91C1C] focus:ring-[#B91C1C]"
                        />
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-[#0B1727] dark:text-white flex items-center gap-1.5">
                          <span>{r.name}</span>
                          {r.id === 'REP-2026-104' && (
                            <span className="text-[10px] text-emerald-600" title="Verified Audit Hash">🛡️</span>
                          )}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${
                          r.subError ? 'text-[#DC2626] font-bold' : 'text-[#64748B] dark:text-[#94A3B8]'
                        }`}>
                          {r.sub}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${r.categoryBadge}`}>
                          {r.category}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.client}</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                        {r.horizon}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 ${r.avatarColor}`}>
                            {r.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white text-xs">{r.author}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${r.statusBadge}`}>
                          {r.statusType === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                          {r.statusType === 'scheduled' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                          {r.statusType === 'generating' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>}
                          {r.statusType === 'failed' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                          {r.statusType === 'archived' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>}
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="p-4 border-t border-[#E2E6EC] dark:border-[#152238] flex flex-col sm:flex-row justify-between items-center text-xs text-[#64748B] dark:text-[#94A3B8] gap-3">
            <div className="flex items-center gap-2">
              <span>Rows per view:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setReportPage(1); }}
                className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded px-2 py-1 text-xs cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="ml-2">Showing {((reportPage - 1) * rowsPerPage) + 1}-{Math.min(reportPage * rowsPerPage, 148)} of 148 dossiers</span>
            </div>

            <div className="flex items-center gap-1 font-semibold">
              <button
                onClick={() => setReportPage(1)}
                disabled={reportPage === 1}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="First Page"
              >
                |&lt;
              </button>
              <button
                onClick={() => setReportPage(p => Math.max(1, p - 1))}
                disabled={reportPage === 1}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Previous Page"
              >
                &lt;
              </button>
              {[1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => setReportPage(num)}
                  className={`px-2.5 py-1 rounded cursor-pointer transition ${reportPage === num ? 'bg-[#0A1628] text-white font-bold' : 'bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 text-slate-700 dark:text-slate-300'}`}
                >
                  {num}
                </button>
              ))}
              <span>...</span>
              <button
                onClick={() => setReportPage(6)}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${reportPage === 6 ? 'bg-[#0A1628] text-white font-bold' : 'bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 text-slate-700 dark:text-slate-300'}`}
              >
                6
              </button>
              <button
                onClick={() => setReportPage(p => Math.min(6, p + 1))}
                disabled={reportPage >= 6}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Next Page"
              >
                &gt;
              </button>
              <button
                onClick={() => setReportPage(6)}
                disabled={reportPage >= 6}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Last Page"
              >
                &gt;|
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Create Report / 3-Column Report Builder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#B91C1C]" />
                <h3 className="text-base font-bold text-[#0B1727] dark:text-white">
                  Create Business Intelligence Dossier
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#64748B] dark:text-slate-300 font-semibold mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Omnichannel Commercial & Attribution Dossier"
                  defaultValue="Q3 Executive Revenue & Media Attribution Audit"
                  className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] dark:text-slate-300 font-semibold mb-1">
                    Client Account
                  </label>
                  <select className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white">
                    <option>Acme Technologies Pvt Ltd</option>
                    <option>Zenith Retail Global Ltd</option>
                    <option>Nova Healthcare Labs</option>
                    <option>Apex Apparel D2C</option>
                    <option>Internal Executive Board</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] dark:text-slate-300 font-semibold mb-1">
                    Report Category
                  </label>
                  <select className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white">
                    <option>Marketing & Client</option>
                    <option>Sales & Mgmt</option>
                    <option>Project Delivery</option>
                    <option>Management & EBITDA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] dark:text-slate-300 font-semibold mb-1">
                    Telemetry Horizon
                  </label>
                  <select className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white">
                    <option>FY26 Q3 (Jul - Sep)</option>
                    <option>Last 60 Days</option>
                    <option>Monthly Business Review (MBR)</option>
                    <option>Half-Year H1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] dark:text-slate-300 font-semibold mb-1">
                    Format Output
                  </label>
                  <select className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white">
                    <option>PDF Dossier (Vector Print Ready)</option>
                    <option>Interactive Portal Link</option>
                    <option>Executive Slide Deck (16:9)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Report compilation pipeline queued!');
                  setShowCreateModal(false);
                }}
                className="px-5 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold"
              >
                Compile Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Stream Inspector Drawer */}
      {showStreamInspector && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0A1628] text-white border border-[#1E3A6D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Pipeline Stream Inspector: #GEN-9902</span>
              </div>
              <button onClick={() => setShowStreamInspector(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-[11px] text-slate-300 max-h-72 overflow-y-auto custom-scrollbar p-2 bg-[#060B13] rounded-lg">
              <p className="text-slate-500">[14:31:02] Connected to Telemetry Warehouse (Node-US-04)...</p>
              <p className="text-slate-500">[14:31:05] Querying Nova Healthcare SOW Milestones (Sprint 14-16)...</p>
              <p className="text-emerald-400">[14:31:09] 1,480 milestone events ingested successfully.</p>
              <p className="text-slate-500">[14:31:12] Aggregation engine consolidated burn rate at ₹14.8L/month.</p>
              <p className="text-yellow-400">[14:31:18] Generating dynamic SVG vector charts (Page 4, Figure 3.1)...</p>
              <p className="text-blue-400">[14:31:22] Rendering high-res client approval signatures & SHA256 audit seal.</p>
              <p className="text-emerald-400 animate-pulse">[14:31:26] 78% completed. Packaging final 14-page PDF stream.</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-400">ETA to completion: 14 seconds</span>
              <button
                onClick={() => setShowStreamInspector(false)}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Schedule Dispatch */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-[#0B1727] dark:text-white font-bold">
                <Send className="w-4 h-4 text-[#B91C1C]" />
                <span>Automated Dispatch Scheduler</span>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-300">
              Schedule recurrent executive dossier delivery directly to client executive boards and stakeholder email vectors.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Cadence</label>
                <select className="w-full bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs">
                  <option>Every Monday 09:00 IST</option>
                  <option>1st of Every Month (MBR)</option>
                  <option>Quarterly Board Dispatch (QBR)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Recipients</label>
                <input
                  type="text"
                  defaultValue="david.miller@acmetechnologies.com, board@acme.com"
                  className="w-full bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Automated dispatch schedule registered!');
                  setShowDispatchModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#B91C1C] text-white font-bold"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Template Library */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <FileSpreadsheet className="w-4 h-4 text-[#B91C1C]" />
                <span>Executive Report Template Library</span>
              </div>
              <button onClick={() => setShowTemplateLibrary(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Executive QBR Dossier', pages: '14 Pages', tag: 'Commercial' },
                { title: 'Omnichannel ROAS Breakdown', pages: '8 Pages', tag: 'Attribution' },
                { title: 'SOW Delivery & Burn Audit', pages: '10 Pages', tag: 'Operations' },
                { title: 'EBITDA & Cashflow Summary', pages: '6 Pages', tag: 'Finance' }
              ].map((tmpl, i) => (
                <div
                  key={i}
                  onClick={() => {
                    showToast(`Loaded "${tmpl.title}" template`);
                    setShowTemplateLibrary(false);
                    setShowCreateModal(true);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#B91C1C] cursor-pointer transition space-y-2 bg-slate-50 dark:bg-[#0A101C]"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {tmpl.tag}
                    </span>
                    <span className="text-[10px] text-slate-400">{tmpl.pages}</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{tmpl.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FULL EXECUTIVE REPORT MODAL (Triggered from REP-2026-104 click or simulator) */}
      {showExecutiveModal && (
        <ExecutiveReportModal
          onClose={() => setShowExecutiveModal(false)}
          data={{
            finance: { total_revenue: 24825400, cash_collected: 18450000, outstanding_receivables: 6375400 },
            pipeline: { total_active_deals: 18, total_pipeline_value: 39500000, weighted_forecast: 28400000 },
            retention: { total_clients: 14, healthy_accounts: 12, at_risk_accounts: 2 },
            marketing: { active_campaigns: 12, total_ad_spend: 6480000, average_roas: 3.83 }
          }}
        />
      )}
    </div>
  );
};
