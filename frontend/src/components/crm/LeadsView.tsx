'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';
import {
  Users2,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  ArrowRightCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  X,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  TrendingUp,
  Globe,
  Share2,
  CheckSquare,
  Square,
  MoreVertical,
  Check,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  Tag,
  Trash2,
  UserCheck,
  Flame,
  UserPlus,
  Edit2,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { LeadDetailView, LeadDetailData } from './LeadDetailView';

// Initial enterprise leads
const INITIAL_LEADS: LeadDetailData[] = [];

const FILTER_TABS = [
  { id: 'All', label: 'All Leads' },
  { id: 'MyLeads', label: 'My Leads' },
  { id: 'New', label: 'New Leads' },
  { id: 'Hot', label: 'Hot Leads', icon: Flame },
  { id: 'NeedsFollowup', label: 'Needs Follow-up' },
  { id: 'Qualified', label: 'Qualified' },
  { id: 'Proposal', label: 'Proposal Shared' }
];

interface LeadsViewProps {
  onNavigate?: (tab: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [leads, setLeads] = useState<LeadDetailData[]>(INITIAL_LEADS);
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('All Sources');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Active');
  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState('Team (3)');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('All (5)');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      showToast(`Imported "${files[0].name}" successfully!`, 'success');
      e.target.value = '';
    }
  };

  // Active Lead Detail Inspection (Image 3 & 4)
  const [activeLeadDetail, setActiveLeadDetail] = useState<LeadDetailData | null>(null);

  // Slide-over Drawer for Create Lead
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    jobTitle: '',
    source: 'Website',
    campaign: '',
    service: 'Performance Marketing',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    email: '',
    phone: '',
    channel: 'Email' as 'Email' | 'Direct Phone' | 'Video Meeting',
    company: '',
    companyDomain: '',
    companyDetails: '',
    pipelineValue: '',
    timeline: 'Within 30 Days',
    strategicObjective: '',
    painPoints: ''
  });

  // Filter Leads
  const filteredLeads = leads.filter((lead) => {
    // Tab filter
    if (selectedTab === 'New' && lead.status !== 'New Lead') return false;
    if (selectedTab === 'Qualified' && lead.status !== 'Qualified') return false;
    if (selectedTab === 'Proposal' && lead.status !== 'Proposal') return false;
    if (selectedTab === 'MyLeads' && lead.owner !== 'Alex Morgan') return false;
    if (selectedTab === 'Hot' && lead.priority !== 'High') return false;
    if (selectedTab === 'NeedsFollowup' && !lead.nextFollowUp) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.service.toLowerCase().includes(q) ||
        lead.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Source filter
    if (selectedSourceFilter !== 'All Sources' && lead.source !== selectedSourceFilter) return false;

    return true;
  });

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((item) => item !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.company) return;

    const initials = newLeadForm.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const created: LeadDetailData = {
      id: `lead-${Date.now()}`,
      name: newLeadForm.name,
      initials: initials || 'NL',
      email: newLeadForm.email,
      phone: `+91 ${newLeadForm.phone}`,
      location: 'Bengaluru, KA, India',
      company: newLeadForm.company,
      companySubtitle: newLeadForm.companyDetails,
      designation: newLeadForm.jobTitle,
      status: 'Qualified',
      priority: newLeadForm.priority === 'Urgent' ? 'High' : (newLeadForm.priority as any),
      estimatedValue: `₹${newLeadForm.pipelineValue}`,
      owner: 'Alex Morgan',
      ownerRole: 'Sr. Enterprise AE',
      source: newLeadForm.source,
      service: newLeadForm.service,
      createdDate: 'Today',
      lastContact: 'Just now',
      nextFollowUp: 'Tomorrow - 11:00 AM',
      campaign: newLeadForm.campaign,
      budget: '₹1.00L – ₹1.50L',
      decisionAuthority: 'High (Sign-off)',
      timeline: newLeadForm.timeline,
      painPoint: newLeadForm.painPoints,
      targetObjective: newLeadForm.strategicObjective,
      fitScore: 85,
      engagementScore: 36,
      firmographicScore: 28,
      velocityScore: 21,
      tags: ['#New-Opportunity', '#Enterprise-Tier', '#Immediate-Review']
    };

    setLeads([created, ...leads]);
    setShowCreateDrawer(false);
  };

  const handleDeleteSelected = () => {
    if (!confirm(`Delete ${selectedLeads.length} selected lead records?`)) return;
    setLeads(leads.filter((l) => !selectedLeads.includes(l.id)));
    setSelectedLeads([]);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'Website':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Website</span>
          </span>
        );
      case 'Instagram':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-900">
            <svg className="w-3.5 h-3.5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <span>Instagram</span>
          </span>
        );
      case 'Google Ads':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Google Ads</span>
          </span>
        );
      case 'LinkedIn':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <svg className="w-3.5 h-3.5 text-blue-700 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24"/>
            </svg>
            <span>LinkedIn</span>
          </span>
        );
      case 'Referral':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            <Share2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Referral</span>
          </span>
        );
      case 'Organic Search':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            <span>Organic Search</span>
          </span>
        );
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'Qualified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Qualified</span>
          </span>
        );
      case 'Contacted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Contacted</span>
          </span>
        );
      case 'Proposal':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Proposal</span>
          </span>
        );
      case 'Discovery':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span>Discovery</span>
          </span>
        );
      case 'New Lead':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>New Lead</span>
          </span>
        );
    }
  };

  // If a lead is currently clicked for 360 Inspection, render LeadDetailView!
  if (activeLeadDetail) {
    return (
      <LeadDetailView
        lead={activeLeadDetail}
        onBack={() => setActiveLeadDetail(null)}
        onConvertToOpportunity={(ld) => {
          if (onNavigate) {
            onNavigate('pipeline');
          }
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. BREADCRUMB & TITLE WORKSPACE HEADER (Matching Image 1)                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#B91C1C] uppercase tracking-wider font-bold">
            <span className="text-[#64748B] dark:text-[#94A3B8]">CRM</span>
            <span className="text-[#94A3B8]">/</span>
            <span>LEADS WORKSPACE</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC] tracking-tight">
              Leads
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#111E34] text-slate-700 dark:text-slate-300 border border-[#E2E6EC] dark:border-[#152238]">
              248 active records
            </span>
          </div>
          <p className="text-xs text-[#5A6A80] dark:text-[#94A3B8] mt-1">
            Manage, qualify, assign and convert incoming prospects across omni-channel acquisition funnels.
          </p>
        </div>

        {/* Top Action Buttons */}
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-[#F8FAFC] shadow-2xs transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#5A6A80]" />
            <span>Import</span>
          </button>
          <button
            onClick={() => {
              exportToCsv('optivir_leads_pipeline', leads);
              showToast('Exported leads pipeline to CSV', 'success');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-[#F8FAFC] shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#5A6A80]" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateDrawer(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 5 PRIMARY KPI SUMMARY CARDS (Matching Image 1)                         */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 2. 5 PRIMARY KPI SUMMARY CARDS (Matching Image 1)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: TOTAL LEADS */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Total Leads</span>
            <Users2 className="w-4 h-4 text-[#8492A6]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">{leads.length}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live
              </span>
            </div>
            <span className="text-[10px] text-[#8492A6] mt-0.5 block">Active prospects</span>
          </div>
        </div>

        {/* Card 2: NEW LEADS */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">New Leads</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">
                {leads.filter((l) => l.status === 'New Lead').length}
              </span>
              <span className="text-xs font-semibold text-blue-600">Awaiting triage</span>
            </div>
            <span className="text-[10px] text-[#8492A6] mt-0.5 block">Inbound queue</span>
          </div>
        </div>

        {/* Card 3: QUALIFIED */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Qualified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">
                {leads.filter((l) => l.status === 'Qualified').length}
              </span>
              <span className="text-xs font-semibold text-emerald-600">Qualified</span>
            </div>
            <span className="text-[10px] text-[#8492A6] mt-0.5 block">Pipeline handoff ready</span>
          </div>
        </div>

        {/* Card 4: FOLLOW-UP DUE */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Follow-up Due</span>
            <Clock className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">
                {leads.filter((l) => Boolean(l.nextFollowUp)).length}
              </span>
            </div>
            <span className="text-[10px] text-[#8492A6] mt-0.5 block">Action required</span>
          </div>
        </div>

        {/* Card 5: EST. PIPELINE */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Est. Pipeline</span>
            <span className="text-xs font-bold text-slate-500">₹</span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">₹0</span>
            </div>
            <span className="text-[10px] text-[#8492A6] mt-0.5 block">Active deal pipeline</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FILTER TABS & VIEW TOGGLE (Matching Image 1)                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E2E6EC] dark:border-[#152238] pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {FILTER_TABS.map((tab) => {
            const tabCount =
              tab.id === 'All'
                ? leads.length
                : tab.id === 'New'
                ? leads.filter((l) => l.status === 'New Lead').length
                : tab.id === 'Qualified'
                ? leads.filter((l) => l.status === 'Qualified').length
                : tab.id === 'Proposal'
                ? leads.filter((l) => l.status === 'Proposal').length
                : tab.id === 'Hot'
                ? leads.filter((l) => l.priority === 'High').length
                : tab.id === 'NeedsFollowup'
                ? leads.filter((l) => Boolean(l.nextFollowUp)).length
                : leads.filter((l) => l.owner === 'Alex Morgan').length;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedTab === tab.id
                    ? 'bg-[#0B1727] dark:bg-[#1E293B] text-white shadow-xs'
                    : 'text-[#5A6A80] dark:text-[#94A3B8] hover:text-[#0B1727] hover:bg-slate-100 dark:hover:bg-[#111E34]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    selectedTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-[#0F1E36] text-[#5A6A80] dark:text-[#94A3B8]'
                  }`}
                >
                  {tabCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Table vs Kanban */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0F1E36] p-1 rounded-lg border border-[#E2E6EC] dark:border-[#152238]">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md text-xs font-semibold transition ${
              viewMode === 'table' ? 'bg-white dark:bg-[#0B1424] text-[#0B1727] dark:text-white shadow-xs' : 'text-slate-500'
            }`}
            title="Table List View"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-md text-xs font-semibold transition ${
              viewMode === 'kanban' ? 'bg-white dark:bg-[#0B1424] text-[#0B1727] dark:text-white shadow-xs' : 'text-slate-500'
            }`}
            title="Kanban Board View"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FILTER TOOLBAR & MULTI-SELECT BANNER (Matching Image 1)               */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Box with ⌘F */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-3.5 h-3.5 text-[#8492A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by lead name, company, email, or tag..."
              className="w-full bg-[#F8F9FB] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-xl pl-9 pr-12 py-2 text-xs text-[#0B1727] dark:text-[#F8FAFC] placeholder-[#8492A6] focus:outline-none focus:ring-1 focus:ring-[#DC2626]"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8492A6] bg-white dark:bg-[#111E34] border border-[#E2E6EC] dark:border-[#152238] rounded px-1 py-0.5">
              ⌘F
            </kbd>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-[#F8F9FB] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-[#F8FAFC]"
            >
              <option value="All Active">Status: All Active</option>
              <option value="Qualified">Status: Qualified</option>
              <option value="Contacted">Status: Contacted</option>
              <option value="Proposal">Status: Proposal</option>
              <option value="Discovery">Status: Discovery</option>
            </select>

            <select
              value={selectedOwnerFilter}
              onChange={(e) => setSelectedOwnerFilter(e.target.value)}
              className="bg-[#F8F9FB] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-[#F8FAFC]"
            >
              <option value="Team (3)">Owner: Team (3)</option>
              <option value="Alex Morgan">Alex Morgan</option>
              <option value="Elena Rostova">Elena Rostova</option>
              <option value="David Chen">David Chen</option>
            </select>

            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="bg-[#F8F9FB] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-[#F8FAFC]"
            >
              <option value="All Sources">Source: All Sources</option>
              <option value="Website">Website</option>
              <option value="Instagram">Instagram</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Referral">Referral</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Organic Search">Organic Search</option>
            </select>

            <select
              value={selectedServiceFilter}
              onChange={(e) => setSelectedServiceFilter(e.target.value)}
              className="bg-[#F8F9FB] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-[#F8FAFC]"
            >
              <option value="All (5)">Service: All (5)</option>
              <option value="Performance Marketing">Performance Marketing</option>
              <option value="Social Media Mgmt">Social Media Mgmt</option>
              <option value="SEO Optimization">SEO Optimization</option>
              <option value="Website Development">Website Development</option>
              <option value="Marketing Strategy">Marketing Strategy</option>
            </select>

            <button
              onClick={() => {
                setSelectedSourceFilter('All Sources');
                setSelectedStatusFilter('All Active');
                setSelectedOwnerFilter('Team (3)');
                setSelectedServiceFilter('All (5)');
                setSearchQuery('');
                setSelectedTab('All');
              }}
              className="text-xs font-semibold text-[#5A6A80] hover:text-[#DC2626] px-2 py-1"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Multi-Select Action Ribbon (Matching Image 1) */}
        {selectedLeads.length > 0 && (
          <div className="p-3 bg-[#0B1727] text-white rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1 duration-150 shadow-md">
            <div className="flex items-center gap-3">
              <span className="font-bold flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-red-500 fill-current" />
                <span>{selectedLeads.length} leads selected</span>
              </span>
              <span className="text-slate-500">|</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setLeads(leads.map(l => selectedLeads.includes(l.id) ? { ...l, owner: 'Alex Morgan', ownerRole: 'Sr. Enterprise AE' } : l));
                    showToast(`Assigned Alex Morgan to ${selectedLeads.length} leads`, 'success');
                  }}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Assign Owner
                </button>
                <button
                  onClick={() => {
                    setLeads(leads.map(l => selectedLeads.includes(l.id) ? { ...l, status: 'Qualified' } : l));
                    showToast(`Advanced ${selectedLeads.length} leads to Qualified status`, 'success');
                  }}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Change Status
                </button>
                <button
                  onClick={() => showToast(`Added "#Enterprise-Tier" tag to ${selectedLeads.length} leads`, 'success')}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Add Tags
                </button>
                <button
                  onClick={() => showToast(`Scheduled follow-up reminders for ${selectedLeads.length} leads`, 'info')}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition cursor-pointer"
                >
                  Schedule Follow-up
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  exportToCsv('selected_leads_pipeline', leads.filter(l => selectedLeads.includes(l.id)));
                  showToast(`Exported ${selectedLeads.length} selected leads to CSV`, 'success');
                }}
                className="px-3 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-semibold transition cursor-pointer"
              >
                Export Selection
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1 px-3 py-1 rounded bg-[#DC2626] hover:bg-[#B91C1C] font-semibold shadow-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedLeads.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MAIN ENTERPRISE LEADS TABLE (Matching Image 1)                         */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-[#0B1727] dark:text-[#CBD5E1]">
          <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-[#64748B] dark:text-[#94A3B8] text-[11px] uppercase tracking-wider border-b border-[#E2E6EC] dark:border-[#152238]">
            <tr>
              <th className="p-4 w-10 text-center">
                <button onClick={toggleSelectAll} className="mt-1">
                  {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#DC2626] fill-current" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="p-4 font-bold">LEAD / CONTACT PERSON</th>
              <th className="p-4 font-bold">COMPANY</th>
              <th className="p-4 font-bold">CONTACT INFO</th>
              <th className="p-4 font-bold">SOURCE</th>
              <th className="p-4 font-bold">SERVICE REQUESTED</th>
              <th className="p-4 font-bold text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-500">
                  <Users2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No leads found</p>
                  <p className="text-xs text-slate-400 mt-1">Create your first prospect lead using the Create Lead button.</p>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
              const isSelected = selectedLeads.includes(lead.id);
              return (
                <tr
                  key={lead.id}
                  onClick={() => setActiveLeadDetail(lead)}
                  className={`hover:bg-[#F8FAFC] dark:hover:bg-[#111E34] cursor-pointer transition ${
                    isSelected ? 'bg-red-50/20 dark:bg-[#DC2626]/5' : ''
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="p-4 text-center" onClick={(e) => toggleSelectLead(lead.id, e)}>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#DC2626] fill-current" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </td>

                  {/* Lead / Contact Person */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0B1727] dark:bg-[#1E293B] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                        {lead.initials}
                      </div>
                      <div>
                        <p className="font-bold text-[#0B1727] dark:text-[#F8FAFC] hover:text-[#DC2626] transition">
                          {lead.name}
                        </p>
                        <p className="text-[11px] text-[#8492A6]">{lead.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="p-4">
                    <p className="font-bold text-[#0B1727] dark:text-[#F8FAFC]">{lead.company}</p>
                    <p className="text-[11px] text-[#8492A6]">{lead.companySubtitle || 'Enterprise Client'}</p>
                  </td>

                  {/* Contact Info */}
                  <td className="p-4 text-[#5A6A80] dark:text-[#94A3B8]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8492A6] mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead.email}</span>
                    </div>
                  </td>

                  {/* Source Badge */}
                  <td className="p-4">
                    {getSourceBadge(lead.source)}
                  </td>

                  {/* Service Requested */}
                  <td className="p-4">
                    <span className="font-medium text-[#0B1727] dark:text-[#F8FAFC]">
                      {lead.service}
                    </span>
                  </td>

                  {/* Status Pill */}
                  <td className="p-4 text-center">
                    {getStatusPill(lead.status)}
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>

        {/* 6. Pagination Bar (Matching Image 1) */}
        <div className="p-4 border-t border-[#E2E6EC] dark:border-[#152238] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#5A6A80] dark:text-[#94A3B8]">
          <div className="flex items-center gap-3">
            <span>Showing {filteredLeads.length > 0 ? 1 : 0}-{filteredLeads.length} of {filteredLeads.length} leads</span>
            <div className="flex items-center gap-1">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-slate-50 dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded px-2 py-0.5 text-xs text-[#0B1727] dark:text-[#F8FAFC]"
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
            {[1, 2, 3, 4].map((page) => (
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
                setCurrentPage(10);
                showToast('Navigated to page 10', 'info');
              }}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                currentPage === 10
                  ? 'bg-[#0B1727] dark:bg-[#1E293B] text-white shadow-xs'
                  : 'hover:bg-slate-100 dark:hover:bg-[#111E34] text-slate-700 dark:text-slate-300'
              }`}
            >
              10
            </button>
            <button
              onClick={() => {
                if (currentPage < 10) {
                  setCurrentPage(currentPage + 1);
                  showToast(`Navigated to page ${currentPage + 1}`, 'info');
                }
              }}
              disabled={currentPage === 10}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. CREATE LEAD SLIDE-OVER DRAWER (Matching Image 5)                      */}
      {/* ========================================================================= */}
      {showCreateDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-[#0A121F] h-full shadow-2xl flex flex-col border-l border-[#E2E6EC] dark:border-[#152238] animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E2E6EC] dark:border-[#152238] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B1727] dark:bg-[#16253C] text-white flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#0B1727] dark:text-white">
                      Create Lead
                    </h3>
                    <span className="px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      Draft Mode
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Add a new prospect to your active CRM pipeline.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-[#16253C] border border-[#E2E6EC] dark:border-[#1B2B44] text-[10px] text-slate-500 font-mono">
                  Esc
                </kbd>
                <button
                  onClick={() => setShowCreateDrawer(false)}
                  className="text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleCreateLeadSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs custom-scrollbar">
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[11px] text-[#0B1727] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>1. BASIC INFORMATION</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">* Required</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arjun Nair"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC] outline-none focus:ring-1 focus:ring-[#DC2626]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VP of Marketing"
                      value={newLeadForm.jobTitle}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, jobTitle: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC] outline-none focus:ring-1 focus:ring-[#DC2626]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Lead Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newLeadForm.source}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC]"
                    >
                      <option value="Website">Select origin source</option>
                      <option value="Website">Website</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Referral">Referral</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Organic Search">Organic Search</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Attribution Campaign
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google Search — Enterprise Leads"
                      value={newLeadForm.campaign}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, campaign: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC] outline-none focus:ring-1 focus:ring-[#DC2626]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Service Interest <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newLeadForm.service}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, service: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC]"
                    >
                      <option value="Performance Marketing">Select core interest</option>
                      <option value="Performance Marketing">Performance Marketing</option>
                      <option value="Social Media Mgmt">Social Media Mgmt</option>
                      <option value="SEO Optimization">SEO Optimization</option>
                      <option value="Website Development">Website Development</option>
                      <option value="Marketing Strategy">Marketing Strategy</option>
                    </select>
                  </div>
                </div>

                {/* Deal Priority Segmented Buttons (Matching Image 5) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Deal Priority
                  </label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-[#0B1424] rounded-xl border border-[#E2E6EC] dark:border-[#152238]">
                    {(['Low', 'Medium', 'High', 'Urgent'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewLeadForm({ ...newLeadForm, priority: p })}
                        className={`py-2 rounded-lg font-semibold text-xs transition ${
                          newLeadForm.priority === p
                            ? p === 'High' || p === 'Urgent'
                              ? 'bg-[#DC2626] text-white shadow-xs'
                              : 'bg-[#0B1727] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-black'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="border-[#E2E6EC] dark:border-[#152238]" />

              {/* SECTION 2: DIRECT CONTACT INFO */}
              <div className="space-y-4">
                <h4 className="font-bold text-[11px] text-[#0B1727] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>2. DIRECT CONTACT INFO</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Corporate Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="arjun.nair@acmetech.com"
                        value={newLeadForm.email}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC] outline-none focus:ring-1 focus:ring-[#DC2626]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <span className="px-2.5 py-2.5 rounded-l-lg border border-r-0 border-[#E2E6EC] dark:border-[#152238] bg-slate-100 dark:bg-[#16253C] text-slate-500 font-semibold">
                        +91
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="98450 11204"
                        value={newLeadForm.phone}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                        className="w-full p-2.5 rounded-r-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC] outline-none focus:ring-1 focus:ring-[#DC2626]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Preferred Channel
                  </label>
                  <div className="flex items-center gap-4">
                    {(['Email', 'Direct Phone', 'Video Meeting'] as const).map((ch) => (
                      <label key={ch} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="channel"
                          checked={newLeadForm.channel === ch}
                          onChange={() => setNewLeadForm({ ...newLeadForm, channel: ch })}
                          className="text-[#DC2626] focus:ring-0"
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-300">{ch}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="border-[#E2E6EC] dark:border-[#152238]" />

              {/* SECTION 3: ASSOCIATED ORGANIZATION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-[11px] text-[#0B1727] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>3. ASSOCIATED ORGANIZATION</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => showToast('Opening new company registration modal', 'info')}
                    className="text-xs font-semibold text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Company</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search companies or enter domain..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                {/* Selected Company Card Preview (Matching Image 5) */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080E18] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0B1727] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      AT
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0B1727] dark:text-white">{newLeadForm.company}</span>
                        <span className="text-[10px] text-slate-500 bg-white dark:bg-[#111E34] px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                          {newLeadForm.companyDomain}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{newLeadForm.companyDetails}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Edit company association details', 'info')}
                    className="text-slate-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <hr className="border-[#E2E6EC] dark:border-[#152238]" />

              {/* SECTION 4: QUALIFICATION & SCOPE */}
              <div className="space-y-4">
                <h4 className="font-bold text-[11px] text-[#0B1727] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span>4. QUALIFICATION &amp; SCOPE</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Pipeline Value
                    </label>
                    <div className="flex">
                      <span className="px-3 py-2.5 rounded-l-lg border border-r-0 border-[#E2E6EC] dark:border-[#152238] bg-slate-100 dark:bg-[#16253C] text-slate-700 dark:text-slate-300 font-bold">
                        ₹
                      </span>
                      <input
                        type="text"
                        value={newLeadForm.pipelineValue}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, pipelineValue: e.target.value })}
                        className="w-full p-2.5 rounded-r-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Timeline
                    </label>
                    <select
                      value={newLeadForm.timeline}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, timeline: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC]"
                    >
                      <option value="Within 30 Days">Within 30 Days</option>
                      <option value="Immediate">Immediate (&lt; 15 Days)</option>
                      <option value="Within 60 Days">Within 60 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Strategic Objective / Scope
                  </label>
                  <textarea
                    rows={2}
                    value={newLeadForm.strategicObjective}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, strategicObjective: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Documented Friction / Pain Points
                  </label>
                  <textarea
                    rows={2}
                    value={newLeadForm.painPoints}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, painPoints: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-[#F8FAFC] dark:bg-[#080E18] text-[#0B1727] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>

              {/* Fixed Footer Buttons */}
              <div className="pt-4 border-t border-[#E2E6EC] dark:border-[#152238] flex items-center justify-between sticky bottom-0 bg-white dark:bg-[#0A121F] py-3">
                <button
                  type="button"
                  onClick={() => setShowCreateDrawer(false)}
                  className="px-4 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Lead draft saved successfully', 'success');
                      setShowCreateDrawer(false);
                    }}
                    className="px-4 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-white cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-xs transition active:scale-95"
                  >
                    Create Lead
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
