'use client';

import React, { useState, useRef } from 'react';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Check,
  X,
  Trash2,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ExternalLink,
  Users2,
  ShieldCheck,
  Tag,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';

interface CompanyRow {
  id: string;
  name: string;
  domain: string;
  initials: string;
  logoBg: string;
  isVerified?: boolean;
  industry: string;
  primaryContact: string;
  primaryRole: string;
  contactsCount: number;
  ownerInitials: 'AM' | 'MJ';
  ownerName: string;
  ownerBg: string;
  accountStatus: 'Prospect' | 'Active Client' | 'At Risk' | 'Former Client';
  activeDeals: string;
  clientValue: string;
  renewal: string;
  isRenewalUrgent?: boolean;
  lastActivity: string;
}

const INITIAL_COMPANIES: CompanyRow[] = [];

const FILTER_TABS = [
  { id: 'all', label: 'All Companies', count: '428' },
  { id: 'my', label: 'My Companies', count: '94' },
  { id: 'clients', label: 'Clients', count: '142' },
  { id: 'prospects', label: 'Prospects', count: '196' },
  { id: 'atrisk', label: 'At Risk', count: '12', isAlert: true },
  { id: 'enterprise', label: 'Enterprise Tier', count: '86' },
  { id: 'renewals', label: 'Renewals Upcoming', count: '18' }
];

export const CompaniesView: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [companies, setCompanies] = useState<CompanyRow[]>(INITIAL_COMPANIES);
  const [activeTab, setActiveTab] = useState('all');
  const [simulatorStep, setSimulatorStep] = useState('1. Companies List');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'value'>('newest');

  const handleToggleSort = () => {
    if (sortBy === 'newest') {
      setSortBy('name');
      setCompanies([...companies].sort((a, b) => a.name.localeCompare(b.name)));
      showToast('Sorted companies alphabetically (A-Z)', 'info');
    } else if (sortBy === 'name') {
      setSortBy('value');
      setCompanies([...companies].sort((a, b) => {
        const valA = parseInt(a.clientValue.replace(/[^0-9]/g, '')) || 0;
        const valB = parseInt(b.clientValue.replace(/[^0-9]/g, '')) || 0;
        return valB - valA;
      }));
      showToast('Sorted companies by Client Value (High-Low)', 'info');
    } else {
      setSortBy('newest');
      setCompanies(INITIAL_COMPANIES);
      showToast('Sorted companies by Newest', 'info');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      showToast(`Imported "${files[0].name}" successfully with verified company records!`, 'success');
      e.target.value = '';
    }
  };

  const toggleSelectAll = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(companies.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCompanies.includes(id)) {
      setSelectedCompanies(selectedCompanies.filter((i) => i !== id));
    } else {
      setSelectedCompanies([...selectedCompanies, id]);
    }
  };

  const getStatusBadge = (status: CompanyRow['accountStatus']) => {
    switch (status) {
      case 'Active Client':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'At Risk':
        return 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900';
      case 'Prospect':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900';
      case 'Former Client':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusPill = (status: CompanyRow['accountStatus']) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(status)}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto p-6 transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. STATE SIMULATOR BANNER (Matching Image 2)                             */}
      {/* ========================================================================= */}
      <div className="bg-[#0B1528] text-white p-2.5 rounded-xl border border-[#18263F] flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">STATE SIM</span>
          <span className="text-slate-300 font-semibold truncate">
            OptiVir CRM: Companies Management &amp; Hub (crm_companies_management)
          </span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {[
            '1. Companies List',
            '2. Acme Detail',
            '3. Finance & Projects',
            '4. Drawer Flyout',
            '5. Modals (Contact & Op'
          ].map((st) => (
            <button
              key={st}
              onClick={() => setSimulatorStep(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                simulatorStep === st
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-[#13233C]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BREADCRUMB, HEADER & ACTIONS (Matching Image 2)                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>CRM</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#0B1727] dark:text-white">Companies</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-[#111E34] text-slate-700 dark:text-slate-300">
              {companies.length} total
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B1727] dark:text-white tracking-tight mt-1">
            Companies
          </h1>
          <p className="text-xs text-[#5A6A80] dark:text-[#94A3B8] mt-1">
            Manage organizations, accounts, relationships, and commercial activity across your enterprise ecosystem.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,text/csv"
            onChange={handleFileImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-white shadow-2xs transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#5A6A80]" />
            <span>Import</span>
          </button>
          <button
            onClick={() => {
              exportToCsv('optivir_companies_directory', companies);
              showToast('Exported company directory to CSV', 'success');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-white shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#5A6A80]" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Company</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 5 PRIMARY KPI SUMMARY CARDS (Matching Image 2)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Total Companies</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0B1727] dark:text-white">{companies.length}</span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">All registered accounts</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Active Clients</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0B1727] dark:text-white">
              {companies.filter((c) => c.accountStatus === 'Active Client').length}
            </span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">Active enterprise accounts</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Prospects</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0B1727] dark:text-white">
              {companies.filter((c) => c.accountStatus === 'Prospect').length}
            </span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">In pipeline qualification</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">At Risk Accounts</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#DC2626]">
              {companies.filter((c) => c.accountStatus === 'At Risk').length}
            </span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">SLA warning</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">New This Month</span>
            <Calendar className="w-4 h-4 text-[#8492A6]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0B1727] dark:text-white">{companies.length}</span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">Added this period</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FILTER TABS ROW (Matching Image 2)                                    */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E6EC] dark:border-[#152238] pb-2 overflow-x-auto custom-scrollbar">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? companies.length
              : tab.id === 'clients'
              ? companies.filter((c) => c.accountStatus === 'Active Client').length
              : tab.id === 'prospects'
              ? companies.filter((c) => c.accountStatus === 'Prospect').length
              : tab.id === 'atrisk'
              ? companies.filter((c) => c.accountStatus === 'At Risk').length
              : companies.filter((c) => c.ownerName === 'Alex Morgan').length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-[#0B1727] dark:bg-[#1E293B] text-white shadow-xs'
                  : 'text-[#5A6A80] dark:text-[#94A3B8] hover:text-[#0B1727] hover:bg-slate-100 dark:hover:bg-[#111E34]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  tab.isAlert
                    ? 'bg-red-100 text-red-700'
                    : activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-[#0F1E36] text-[#5A6A80] dark:text-[#94A3B8]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 5. SEARCH & FILTER RIBBON (Matching Image 2)                             */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-3.5 h-3.5 text-[#8492A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies by name, domain, owner, inc... ⌘K"
              className="w-full bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-xl pl-9 pr-10 py-2 text-xs text-[#0B1727] dark:text-white outline-none focus:ring-1 focus:ring-[#DC2626]"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8492A6] bg-white dark:bg-[#111E34] border border-[#E2E6EC] dark:border-[#152238] rounded px-1 py-0.5 font-mono">
              ⌘K
            </kbd>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Industry: All</option>
              <option>Technology</option>
              <option>Retail</option>
              <option>Healthcare</option>
            </select>

            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Owner: Team 3</option>
              <option>Alex Morgan</option>
              <option>Maya Joseph</option>
            </select>

            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Status: All Active</option>
              <option>Active Client</option>
              <option>Prospect</option>
            </select>

            <button
              onClick={() => showToast('All 12 account data columns active & synced', 'info')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#DC2626]" />
              <span>Columns (12)</span>
            </button>

            <button
              onClick={handleToggleSort}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
            >
              <span>⇅ Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'name' ? 'Name A-Z' : 'Value High-Low'}</span>
            </button>

            <button
              onClick={() => {
                setSearchQuery('');
                showToast('Cleared search & account filters', 'info');
              }}
              className="text-xs font-semibold text-[#DC2626] hover:underline px-2 cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Multi-Select Floating Ribbon (Matching Image 2) */}
        {selectedCompanies.length > 0 && (
          <div className="p-3 bg-[#0B1727] text-white rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-red-600 font-bold text-[10px]">
                {selectedCompanies.length}
              </span>
              <span className="font-semibold">companies selected</span>
              <span className="text-slate-400">| Bulk actions across selection:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCompanies(companies.map(c => selectedCompanies.includes(c.id) ? { ...c, ownerName: 'Maya Joseph', ownerInitials: 'MJ' } : c));
                    showToast(`Assigned Maya Joseph as owner for ${selectedCompanies.length} companies`, 'success');
                  }}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Assign Owner
                </button>
                <button
                  onClick={() => {
                    setCompanies(companies.map(c => selectedCompanies.includes(c.id) ? { ...c, accountStatus: 'Active Client' } : c));
                    showToast(`Updated ${selectedCompanies.length} companies to Active Client status`, 'success');
                  }}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Change Status
                </button>
                <button
                  onClick={() => showToast(`Added "Tier-1 Enterprise" tag to ${selectedCompanies.length} companies`, 'success')}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Add Tag
                </button>
                <button
                  onClick={() => {
                    exportToCsv('selected_companies', companies.filter(c => selectedCompanies.includes(c.id)));
                    showToast(`Exported ${selectedCompanies.length} selected companies to CSV`, 'success');
                  }}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Export
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedCompanies.length} companies?`)) {
                    setCompanies(companies.filter((c) => !selectedCompanies.includes(c.id)));
                    setSelectedCompanies([]);
                  }
                }}
                className="px-3 py-1 rounded bg-[#DC2626] hover:bg-[#B91C1C] font-semibold transition"
              >
                Delete ({selectedCompanies.length})
              </button>
              <button onClick={() => setSelectedCompanies([])} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. MAIN COMPANIES TABLE (Matching Image 2)                                */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-[#0B1727] dark:text-[#CBD5E1]">
          <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-[#64748B] dark:text-[#94A3B8] text-[11px] uppercase tracking-wider border-b border-[#E2E6EC] dark:border-[#152238]">
            <tr>
              <th className="p-4 w-10 text-center">
                <button onClick={toggleSelectAll} className="mt-1">
                  {selectedCompanies.length === companies.length && companies.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#DC2626] fill-current" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="p-4 font-bold">COMPANY</th>
              <th className="p-4 font-bold">INDUSTRY</th>
              <th className="p-4 font-bold">PRIMARY CONTACT</th>
              <th className="p-4 font-bold text-center">CONTACTS</th>
              <th className="p-4 font-bold">OWNER</th>
              <th className="p-4 font-bold">ACCOUNT STATUS</th>
              <th className="p-4 font-bold">ACTIVE DEALS</th>
              <th className="p-4 font-bold">CLIENT VALUE</th>
              <th className="p-4 font-bold">RENEWAL</th>
              <th className="p-4 font-bold">LAST ACTIVITY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-12 text-center text-slate-500">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No companies found</p>
                  <p className="text-xs text-slate-400 mt-1">Create your first company account using Create Company.</p>
                </td>
              </tr>
            ) : (
              companies.map((comp) => {
                const isSelected = selectedCompanies.includes(comp.id);
                return (
                  <tr
                    key={comp.id}
                    className={`hover:bg-[#F8FAFC] dark:hover:bg-[#111E34] transition ${
                      isSelected ? 'bg-red-50/20 dark:bg-[#DC2626]/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-4 text-center" onClick={(e) => toggleSelect(comp.id, e)}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#DC2626] fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </td>

                    {/* Company */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${comp.logoBg} font-bold flex items-center justify-center text-xs text-white shrink-0 shadow-xs`}>
                          {comp.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0B1727] dark:text-white hover:text-[#DC2626] cursor-pointer">
                              {comp.name}
                            </span>
                            {comp.isVerified && (
                              <Check className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                            )}
                          </div>
                          <span className="text-[11px] text-[#8492A6] block">{comp.domain}</span>
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="p-4 text-[#5A6A80] dark:text-[#94A3B8]">
                      {comp.industry}
                    </td>

                    {/* Primary Contact */}
                    <td className="p-4">
                      <p className="font-semibold text-[#0B1727] dark:text-white">{comp.primaryContact}</p>
                      <p className="text-[11px] text-[#8492A6]">{comp.primaryRole}</p>
                    </td>

                    {/* Contacts Count */}
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-[#111E34] text-slate-600 dark:text-slate-300">
                        {comp.contactsCount}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${comp.ownerBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                          {comp.ownerInitials}
                        </div>
                        <span className="font-medium text-red-800 dark:text-red-300 text-xs">
                          {comp.ownerName}
                        </span>
                      </div>
                    </td>

                    {/* Account Status Pill */}
                    <td className="p-4">
                      {getStatusPill(comp.accountStatus)}
                    </td>

                    {/* Active Deals */}
                    <td className="p-4 font-semibold text-[#0B1727] dark:text-white">
                      {comp.activeDeals}
                    </td>

                    {/* Client Value */}
                    <td className="p-4 font-bold text-red-800 dark:text-red-400">
                      {comp.clientValue}
                    </td>

                    {/* Renewal */}
                    <td className="p-4">
                      <span className={`text-xs ${comp.isRenewalUrgent ? 'font-bold text-[#DC2626]' : 'text-slate-600 dark:text-slate-400'}`}>
                        {comp.renewal}
                      </span>
                    </td>

                    {/* Last Activity */}
                    <td className="p-4 text-slate-500 text-[11px]">
                      {comp.lastActivity}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E2E6EC] dark:border-[#152238] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#5A6A80] dark:text-[#94A3B8]">
          <div className="flex items-center gap-3">
            <span>Showing {companies.length > 0 ? 1 : 0}-{companies.length} of {companies.length} companies</span>
            <div className="flex items-center gap-1">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-slate-50 dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded px-2 py-0.5 text-xs text-[#0B1727] dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                  showToast(`Navigated to page ${currentPage - 1}`, 'info');
                }
              }}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  showToast(`Navigated to page ${page}`, 'info');
                }}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                  currentPage === page
                    ? 'bg-[#0B1727] dark:bg-[#1E293B] text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-[#111E34] text-slate-700 dark:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
            <span className="px-1 text-slate-400">...</span>
            <button
              onClick={() => {
                setCurrentPage(18);
                showToast('Navigated to page 18', 'info');
              }}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                currentPage === 18
                  ? 'bg-[#0B1727] dark:bg-[#1E293B] text-white shadow-xs'
                  : 'hover:bg-slate-100 dark:hover:bg-[#111E34] text-slate-700 dark:text-slate-300'
              }`}
            >
              18
            </button>
            <button
              onClick={() => {
                if (currentPage < 18) {
                  setCurrentPage(currentPage + 1);
                  showToast(`Navigated to page ${currentPage + 1}`, 'info');
                }
              }}
              disabled={currentPage === 18}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E6EC] dark:border-[#152238]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#DC2626]" />
                <h3 className="font-bold text-sm text-[#0B1727] dark:text-white">Create Enterprise Company</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Company Name *</label>
                <input type="text" placeholder="e.g. Acme Technologies" className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Industry</label>
                  <input type="text" placeholder="Technology" className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Domain</label>
                  <input type="text" placeholder="acmetech.com" className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-[#DC2626] text-white font-semibold rounded-lg">Save Company</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
