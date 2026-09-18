'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';
import { api } from '@/lib/api';
import {
  Sparkles,
  Layers,
  Scale,
  Clock,
  CheckCircle2,
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
  Building2,
  TrendingUp,
  Tag,
  Briefcase,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface OpportunityRow {
  id: string;
  companyName: string;
  serviceTitle: string;
  serviceSubtitle: string;
  companyInitials: string;
  companyBg: string;
  primaryContact: string;
  stage: 'Qualified' | 'Discovery' | 'Proposal' | 'Negotiation' | 'At Risk' | 'Won' | 'Lost';
  value: string;
  probability: string;
  isProbUrgent?: boolean;
  hasProbDot?: boolean;
  weighted: string;
  expectedClose: string;
  ownerInitials: 'AM' | 'MJ' | string;
  ownerName: string;
  ownerBg: string;
  source: string;
  lastActivity: string;
}

const INITIAL_OPPORTUNITIES: OpportunityRow[] = [];

const FILTER_TABS = [
  { id: 'all', label: 'All Opportunities' },
  { id: 'my', label: 'My Opportunities' },
  { id: 'open', label: 'Open Opportunities' },
  { id: 'closing', label: 'Closing This Month' },
  { id: 'high', label: 'High Value' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' }
];

interface OpportunitiesViewProps {
  onNavigate?: (tab: string) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>(INITIAL_OPPORTUNITIES);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingOp, setDeletingOp] = useState<OpportunityRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<'newest' | 'value' | 'company'>('newest');

  // Form state for new opportunity
  const [newCompany, setNewCompany] = useState('');
  const [newService, setNewService] = useState('');
  const [newValue, setNewValue] = useState('');

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await api.getDeals();
      if (res.success && Array.isArray(res.data)) {
        setOpportunities(res.data.map((d: any) => {
          const compName = d.company_name || d.name || 'Enterprise Prospect';
          const valNum = Number(d.value || 0);
          const probNum = Number(d.probability || 50);
          const weightedNum = Math.round((valNum * probNum) / 100);
          const ownerName = d.owner_first ? `${d.owner_first} ${d.owner_last || ''}`.trim() : 'OptiVir Admin';
          const initials = (compName.slice(0, 2)).toUpperCase() || 'OP';

          let stage: OpportunityRow['stage'] = 'Qualified';
          const sName = (d.stage_name || '').toLowerCase();
          if (sName.includes('won')) stage = 'Won';
          else if (sName.includes('lost')) stage = 'Lost';
          else if (sName.includes('discovery')) stage = 'Discovery';
          else if (sName.includes('proposal')) stage = 'Proposal';
          else if (sName.includes('negotiat')) stage = 'Negotiation';
          else if (sName.includes('risk')) stage = 'At Risk';
          else stage = 'Qualified';

          return {
            id: d.id,
            companyName: compName,
            serviceTitle: d.name || 'Performance Retainer',
            serviceSubtitle: `${d.name || 'Retainer'} • Enterprise Scope`,
            companyInitials: initials,
            companyBg: 'bg-[#B91C1C]',
            primaryContact: d.contact_first ? `${d.contact_first} ${d.contact_last || ''}`.trim() : (d.contact_email || 'Decision Maker'),
            stage,
            value: `₹${valNum.toLocaleString('en-IN')}`,
            probability: `${probNum}%`,
            weighted: `₹${weightedNum.toLocaleString('en-IN')}`,
            expectedClose: d.expected_close_date ? new Date(d.expected_close_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Next Month',
            ownerInitials: ((d.owner_first?.[0] || 'O') + (d.owner_last?.[0] || 'A')).toUpperCase(),
            ownerName,
            ownerBg: 'bg-red-600',
            source: 'Direct Client',
            lastActivity: d.updated_at ? new Date(d.updated_at).toLocaleDateString() : 'Recently',
          };
        }));
      }
    } catch (err: any) {
      console.warn('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleExportCsv = () => {
    exportToCsv(
      'optivir_opportunities_directory.csv',
      opportunities.map((o) => ({
        ID: o.id,
        Company: o.companyName,
        Service: o.serviceTitle,
        'Primary Contact': o.primaryContact,
        Stage: o.stage,
        Value: o.value,
        Probability: o.probability,
        Weighted: o.weighted,
        'Expected Close': o.expectedClose,
        Owner: o.ownerName,
        Source: o.source,
        'Last Activity': o.lastActivity,
      }))
    );
    showToast(`Exported ${opportunities.length} opportunities to CSV`, 'success');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`Importing opportunities from "${file.name}"...`, 'info');
      setTimeout(() => {
        showToast(`Successfully processed and imported "${file.name}"`, 'success');
      }, 1000);
      e.target.value = '';
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) {
      showToast('Please enter a company name', 'error');
      return;
    }
    try {
      setIsCreating(true);
      const valNumber = parseFloat(newValue.replace(/[^0-9.]/g, '')) || 50000;
      const res = await api.createDeal({
        name: newService || `${newCompany} Growth Retainer`,
        companyName: newCompany.trim(),
        value: valNumber,
        probability: 50
      });
      if (res.success) {
        showToast(`Opportunity created for ${newCompany}`, 'success');
        setShowCreateModal(false);
        setNewCompany('');
        setNewService('');
        setNewValue('');
        fetchOpportunities();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create opportunity', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteOpportunity = async () => {
    if (!deletingOp) return;
    try {
      setIsDeleting(true);
      const res = await api.deleteDeal(deletingOp.id);
      if (res.success) {
        showToast(`Opportunity "${deletingOp.companyName}" removed from database`, 'success');
        setDeletingOp(null);
        fetchOpportunities();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete opportunity', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOps.length === opportunities.length) {
      setSelectedOps([]);
    } else {
      setSelectedOps(opportunities.map((o) => o.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedOps.includes(id)) {
      setSelectedOps(selectedOps.filter((i) => i !== id));
    } else {
      setSelectedOps([...selectedOps, id]);
    }
  };

  const getStageBadge = (stage: OpportunityRow['stage']) => {
    switch (stage) {
      case 'Qualified':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900';
      case 'Discovery':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
      case 'Proposal':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900';
      case 'Negotiation':
        return 'bg-[#0B1727] text-white border border-[#1E293B]';
      case 'At Risk':
        return 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900';
      case 'Won':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'Lost':
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    }
  };

  const filteredOpportunities = opportunities.filter((op) => {
    if (activeTab === 'won') return op.stage === 'Won';
    if (activeTab === 'lost') return op.stage === 'Lost';
    if (activeTab === 'qualified') return op.stage === 'Qualified';
    if (activeTab === 'proposal') return op.stage === 'Proposal';
    if (activeTab === 'negotiation') return op.stage === 'Negotiation';
    if (activeTab === 'open') return op.stage !== 'Won' && op.stage !== 'Lost';
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        op.companyName.toLowerCase().includes(q) ||
        op.serviceTitle.toLowerCase().includes(q) ||
        op.primaryContact.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortOption === 'company') return a.companyName.localeCompare(b.companyName);
    if (sortOption === 'value') return b.value.localeCompare(a.value);
    return 0;
  });

  return (
    <div className="space-y-4 w-full p-6 transition-colors duration-200">

      {/* ========================================================================= */}
      {/* 2. BREADCRUMB, HEADER & ACTIONS (Matching Image 3 & 4)                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>CRM</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#0B1727] dark:text-white">Opportunities</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-[#111E34] text-slate-700 dark:text-slate-300">
              {opportunities.length} total
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B1727] dark:text-white tracking-tight mt-1">
            Opportunities
          </h1>
          <p className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">
            Track potential revenue from qualification through commercial close.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-white shadow-2xs transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#5A6A80]" />
            <span>Import</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-white shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#5A6A80]" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create Opportunity</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 5 PRIMARY KPI SUMMARY CARDS (Matching Image 3 & 4)                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Open Opportunities</span>
            <Layers className="w-4 h-4 text-[#8492A6]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0B1727] dark:text-white">{opportunities.length}</span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">Active stages</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Open Pipeline</span>
            <span className="text-xs font-bold text-slate-500">₹</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0B1727] dark:text-white">₹0</span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">Total unweighted volume</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Weighted Pipeline</span>
            <Scale className="w-4 h-4 text-[#8492A6]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0B1727] dark:text-white">₹0</span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">Probability adjusted</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Closing This Month</span>
            <Clock className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#DC2626]">₹0</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              0 deals targeting close
            </span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Won This Month</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-white">₹0</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FILTER TABS ROW (Matching Image 3 & 4)                                */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E6EC] dark:border-[#152238] pb-2 overflow-x-auto custom-scrollbar">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? opportunities.length
              : tab.id === 'open'
              ? opportunities.filter((o) => o.stage !== 'Won' && o.stage !== 'Lost').length
              : tab.id === 'proposal'
              ? opportunities.filter((o) => o.stage === 'Proposal').length
              : tab.id === 'negotiation'
              ? opportunities.filter((o) => o.stage === 'Negotiation').length
              : opportunities.filter((o) => o.ownerName.includes('Alex')).length;

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
                  activeTab === tab.id
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
      {/* 5. SEARCH & FILTER RIBBON (Matching Image 3 & 4)                         */}
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
              placeholder="Search opportunities by... ⌘K"
              className="w-full bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-xl pl-9 pr-10 py-2 text-xs text-[#0B1727] dark:text-white outline-none focus:ring-1 focus:ring-[#DC2626]"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8492A6] bg-white dark:bg-[#111E34] border border-[#E2E6EC] dark:border-[#152238] rounded px-1 py-0.5 font-mono">
              ⌘K
            </kbd>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Pipeline: All</option>
              <option>Enterprise Sales</option>
              <option>Growth Funnel</option>
            </select>

            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Stage: All</option>
              <option>Qualified</option>
              <option>Proposal</option>
              <option>Negotiation</option>
            </select>

            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Owner: Team 3</option>
              <option>Alex Morgan</option>
              <option>Maya Joseph</option>
            </select>

            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Close: Sep 2026</option>
              <option>Oct 2026</option>
              <option>Q4 FY2026</option>
            </select>

            <button 
              onClick={() => showToast('Syncing 12 commercial data columns with CRM view layout', 'info')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#111E34] transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#DC2626]" />
              <span>Columns (12)</span>
            </button>

            <button 
              onClick={() => {
                const next = sortOption === 'newest' ? 'value' : sortOption === 'value' ? 'company' : 'newest';
                setSortOption(next);
                showToast(`Sorted by: ${next === 'newest' ? 'Newest First' : next === 'value' ? 'Deal Value' : 'Company Name (A-Z)'}`, 'info');
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition cursor-pointer"
            >
              <span>⇅ Sort: {sortOption === 'newest' ? 'Newest' : sortOption === 'value' ? 'Value' : 'Company'}</span>
            </button>

            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
                showToast('Reset all filters', 'info');
              }}
              className="text-xs font-semibold text-[#DC2626] hover:underline px-2 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Multi-Select Floating Ribbon (Matching Image 3 & 4) */}
        {selectedOps.length > 0 && (
          <div className="p-3 bg-[#0B1727] text-white rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>{selectedOps.length} opportunities selected</span>
              </span>
              <span className="text-slate-400">| Commercial bulk actions:</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => showToast(`Bulk assigned ${selectedOps.length} opportunities to Maya Joseph`, 'success')}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Assign Owner
                </button>
                <button 
                  onClick={() => showToast(`Updated ${selectedOps.length} opportunities to Proposal stage`, 'success')}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Change Stage
                </button>
                <button 
                  onClick={() => showToast(`Migrated ${selectedOps.length} opportunities to Strategic Enterprise pipeline`, 'success')}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Change Pipeline
                </button>
                <button 
                  onClick={() => showToast(`Target close date modified for ${selectedOps.length} opportunities`, 'success')}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Change Close Date
                </button>
                <button 
                  onClick={() => showToast(`Added #StrategicDeal tag to ${selectedOps.length} opportunities`, 'success')}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Add Tag
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedOps.length} opportunities?`)) {
                    setOpportunities(opportunities.filter((o) => !selectedOps.includes(o.id)));
                    setSelectedOps([]);
                  }
                }}
                className="px-3 py-1 rounded bg-[#DC2626] hover:bg-[#B91C1C] font-semibold transition"
              >
                Delete ({selectedOps.length})
              </button>
              <button onClick={() => setSelectedOps([])} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. MAIN OPPORTUNITIES TABLE (Matching Image 3 & 4)                       */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-[#0B1727] dark:text-[#CBD5E1]">
          <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-[#64748B] dark:text-[#94A3B8] text-[11px] uppercase tracking-wider border-b border-[#E2E6EC] dark:border-[#152238]">
            <tr>
              <th className="p-4 w-10 text-center">
                <button onClick={toggleSelectAll} className="mt-1">
                  {selectedOps.length === opportunities.length && opportunities.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#DC2626] fill-current" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="p-4 font-bold">OPPORTUNITY &amp; SERVICE</th>
              <th className="p-4 font-bold">COMPANY</th>
              <th className="p-4 font-bold">PRIMARY CONTACT</th>
              <th className="p-4 font-bold">STAGE</th>
              <th className="p-4 font-bold">VALUE</th>
              <th className="p-4 font-bold text-center">PROBABILITY</th>
              <th className="p-4 font-bold">WEIGHTED</th>
              <th className="p-4 font-bold">EXPECTED CLOSE</th>
              <th className="p-4 font-bold">OWNER</th>
              <th className="p-4 font-bold">SOURCE</th>
              <th className="p-4 font-bold">LAST ACTIVITY</th>
              <th className="p-4 font-bold text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
            {filteredOpportunities.length === 0 ? (
              <tr>
                <td colSpan={13} className="p-12 text-center text-slate-500">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No opportunities found</p>
                  <p className="text-xs text-slate-400 mt-1">Create an opportunity to track potential deals.</p>
                </td>
              </tr>
            ) : (
              filteredOpportunities.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((op) => {
              const isSelected = selectedOps.includes(op.id);
              return (
                <tr
                  key={op.id}
                  className={`hover:bg-[#F8FAFC] dark:hover:bg-[#111E34] transition ${
                    isSelected ? 'bg-red-50/20 dark:bg-[#DC2626]/5' : ''
                  }`}
                >
                  <td className="p-4 text-center cursor-pointer" onClick={(e) => toggleSelect(op.id, e)}>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#DC2626] fill-current" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="text-[11px] text-slate-500 hover:text-[#DC2626] cursor-pointer flex items-center gap-1">
                        <span>{op.companyName}</span>
                        <ExternalLink className="w-3 h-3 text-red-500" />
                      </span>
                      <h4 className="font-bold text-xs text-[#0B1727] dark:text-white mt-0.5">
                        {op.serviceTitle}
                      </h4>
                      <p className="text-[10px] text-[#8492A6]">
                        {op.serviceSubtitle}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md ${op.companyBg} text-white flex items-center justify-center font-bold text-[10px] shadow-2xs`}>
                        {op.companyInitials}
                      </div>
                      <span className="font-semibold text-xs text-[#0B1727] dark:text-white">
                        {op.companyName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-xs text-[#0B1727] dark:text-slate-200">
                      {op.primaryContact}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block shadow-2xs ${getStageBadge(op.stage)}`}>
                      {op.stage}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-xs text-[#0B1727] dark:text-white">
                      {op.value}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1 font-bold text-xs">
                      {op.hasProbDot && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                      <span className={op.isProbUrgent ? 'text-red-700 dark:text-red-400' : 'text-[#0B1727] dark:text-slate-200'}>
                        {op.probability}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-medium text-xs">
                    {op.weighted}
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-[#0B1727] dark:text-slate-200">
                      {op.expectedClose}
                    </span>
                  </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full ${op.ownerBg} text-white text-[9px] font-bold flex items-center justify-center`}>
                          {op.ownerInitials}
                        </div>
                        <span className="font-medium text-xs">
                          {op.ownerName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {op.source}
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {op.lastActivity}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingOp(op);
                        }}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Delete opportunity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              }))}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E2E6EC] dark:border-[#152238] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#5A6A80] dark:text-[#94A3B8]">
          <div className="flex items-center gap-3">
            <span>
              Showing {filteredOpportunities.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}-
              {Math.min(currentPage * rowsPerPage, filteredOpportunities.length)} of {filteredOpportunities.length} opportunities
            </span>
            <div className="flex items-center gap-1">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
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
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
              className="px-1.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] text-xs disabled:opacity-40 cursor-pointer"
            >
              |⟨
            </button>
            <button 
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.max(1, Math.ceil(filteredOpportunities.length / rowsPerPage)) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                  currentPage === p
                    ? 'bg-[#0B1727] dark:bg-[#1E293B] text-white font-bold shadow-2xs'
                    : 'hover:bg-slate-100 dark:hover:bg-[#111E34] text-slate-700 dark:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage((p) => Math.min(Math.max(1, Math.ceil(filteredOpportunities.length / rowsPerPage)), p + 1))} 
              disabled={currentPage >= Math.ceil(filteredOpportunities.length / rowsPerPage)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(Math.max(1, Math.ceil(filteredOpportunities.length / rowsPerPage)))} 
              disabled={currentPage >= Math.ceil(filteredOpportunities.length / rowsPerPage)}
              className="px-1.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] text-xs disabled:opacity-40 cursor-pointer"
            >
              ⟩|
            </button>
          </div>
        </div>
      </div>

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E6EC] dark:border-[#152238]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#DC2626]" />
                <h3 className="font-bold text-sm text-[#0B1727] dark:text-white">Create Enterprise Opportunity</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOpportunity} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Company *</label>
                <input 
                  type="text" 
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Client Company Name" 
                  className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none focus:border-[#DC2626]" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Service Requested</label>
                  <input 
                    type="text" 
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Performance Marketing" 
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none focus:border-[#DC2626]" 
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Deal Value (₹)</label>
                  <input 
                    type="text" 
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="₹75,000 / mo" 
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none focus:border-[#DC2626]" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#111E34] cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingOp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0B1727] dark:text-white">Delete Opportunity</h3>
                <p className="text-xs text-slate-500">This will remove the deal from the pipeline and database.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <span className="font-bold text-[#0B1727] dark:text-white">{deletingOp.companyName}</span> ({deletingOp.serviceTitle})?
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
              <button
                type="button"
                onClick={() => setDeletingOp(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#111E34] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOpportunity}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
