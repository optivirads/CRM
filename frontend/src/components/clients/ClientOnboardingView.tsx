'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/toast-context';
import {
  Rocket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Key,
  Target,
  ShieldAlert,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Plus,
  ArrowRight,
  ExternalLink,
  Users,
  Check,
  X,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  HelpCircle,
  Briefcase
} from 'lucide-react';

interface ClientOnboardingViewProps {
  onOpenClient360?: (clientId?: string) => void;
  onNavigate?: (tab: any) => void;
}

interface OnboardingAccount {
  id: string;
  name: string;
  domain: string;
  avatarText: string;
  contractTier: string;
  contractValue: string;
  am: string;
  pm: string;
  currentStage: string;
  stageIndex: number; // 0 to 4
  daysInOnboarding: number;
  totalDaysTarget: number;
  completedSteps: number;
  totalSteps: number;
  hasBlocker: boolean;
  blockerDesc?: string;
  primaryContact: {
    name: string;
    role: string;
    email: string;
  };
}

export const ClientOnboardingView: React.FC<ClientOnboardingViewProps> = ({ onOpenClient360, onNavigate }) => {
  const { showToast } = useToast();
  // Active selected client for detail view
  const [selectedClientId, setSelectedClientId] = useState<string>('onb-1');

  // Detail Subtab: 'handoff' | 'assets' | 'strategy' | 'blockers' | 'timeline'
  const [detailTab, setDetailTab] = useState<'handoff' | 'assets' | 'strategy' | 'blockers' | 'timeline'>('handoff');

  // Filter stage
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'blocked' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Onboarding modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newTier, setNewTier] = useState('Enterprise Retainer');
  const [newContractVal, setNewContractVal] = useState('₹18,50,000');

  // Onboarding Accounts Dataset
  const [accounts, setAccounts] = useState<OnboardingAccount[]>([]);

  // Credentials / Access Checklist for active client
  const [credentials, setCredentials] = useState<any[]>([]);

  // Blockers for active client
  const [blockers, setBlockers] = useState<any[]>([]);

  // 24-Step Timeline checklist items
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({});

  const toggleChecklist = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedClient = accounts.find(a => a.id === selectedClientId) || accounts[0];

  const filteredAccounts = accounts.filter(acc => {
    if (activeFilter === 'in_progress' && acc.stageIndex >= 4) return false;
    if (activeFilter === 'blocked' && !acc.hasBlocker) return false;
    if (activeFilter === 'completed' && acc.stageIndex < 4) return false;
    if (searchQuery && !acc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* 1. Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            <span>CRM</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span>04. Client Management</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-medium">Onboarding Cockpit</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Client Onboarding &amp; Handoff Suite
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-bold flex items-center gap-1">
              <Rocket className="w-3.5 h-3.5" />
              <span>{accounts.length} In-Flight</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            24-step SLA orchestration from Sales SOW sign-off to full technical kickoff and operational live delivery.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate && onNavigate('clients')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-[#0B1424] text-slate-700 dark:text-slate-200 border border-[#E2E6EC] dark:border-[#152238] rounded-xl hover:bg-slate-50 shadow-2xs transition"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Clients Directory</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Start New Onboarding</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Active Onboardings</span>
            <Rocket className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{accounts.length} Accounts</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">100% On-Track</span>
            <span>Avg 0 Days to Live</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Retainer Value in Handoff</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹0 / mo</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">0 Active</span>
            <span>No active retainers</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Avg Time to Live</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">0 Days</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            <span>Target SLA: 14 Days</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1424] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-rose-600">Active Action Blockers</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">{blockers.length} Blockers</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span>0 Blocked Accounts</span>
          </div>
        </div>
      </div>

      {/* 3. Main Split View: Left List / Kanban (4 Cols) + Right Deep-Dive Detail (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Accounts List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search & Filter bar */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-3 shadow-xs space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search account name, AM, or domain..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0E1A2E] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold overflow-x-auto">
              {[
                { id: 'all', label: `All (${accounts.length})` },
                { id: 'in_progress', label: `Active (${accounts.filter(a => a.stageIndex < 4).length})` },
                { id: 'blocked', label: `Blocked (${accounts.filter(a => a.hasBlocker).length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    activeFilter === f.id
                      ? 'bg-[#0A1628] text-white dark:bg-[#B91C1C]'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account Cards */}
          <div className="space-y-3">
            {filteredAccounts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl shadow-xs text-xs">
                <Rocket className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No onboarding accounts</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click Start New Onboarding above.</p>
              </div>
            ) : (
              filteredAccounts.map((acc) => {
              const isSelected = acc.id === selectedClientId;
              const progressPct = Math.round((acc.completedSteps / acc.totalSteps) * 100);

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedClientId(acc.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-white dark:bg-[#0B1424] border-[#B91C1C] ring-2 ring-[#B91C1C]/20 shadow-md'
                      : 'bg-white dark:bg-[#0B1424] border-[#E2E6EC] dark:border-[#152238] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#0A1628] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {acc.avatarText}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">{acc.name}</h4>
                        <p className="text-[11px] text-slate-500">{acc.domain}</p>
                      </div>
                    </div>
                    {acc.hasBlocker && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold shrink-0 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Blocked</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Current Stage:</span>
                      <strong className="text-slate-900 dark:text-white font-semibold">{acc.currentStage}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Commercial Retainer:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{acc.contractValue}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Account Exec / Lead:</span>
                      <span>{acc.am}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-slate-500">Day {acc.daysInOnboarding} of {acc.totalDaysTarget}</span>
                      <span className="font-bold text-[#B91C1C] dark:text-rose-400">{progressPct}% Complete</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#B91C1C] to-rose-400 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* Right Column: Deep-Dive Onboarding Detail (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {!selectedClient ? (
            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-12 text-center text-slate-500 shadow-xs">
              <Rocket className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Active Onboarding Workflows</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Start a new 24-step onboarding workflow to transition signed commercial deals into delivery.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                + Start New Onboarding
              </button>
            </div>
          ) : (
            <>
              {/* Client Header Card */}
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0A1628] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {selectedClient.avatarText}
                    </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedClient.name}</h2>
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                      {selectedClient.contractTier}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>POC: <strong>{selectedClient.primaryContact.name}</strong> ({selectedClient.primaryContact.role})</span>
                    <span>•</span>
                    <span>AM: <strong>{selectedClient.am}</strong></span>
                    <span>•</span>
                    <span>PM: <strong>{selectedClient.pm}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onOpenClient360 && (
                  <button
                    onClick={() => onOpenClient360(selectedClient.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Client 360°</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    showToast(`Marking ${selectedClient.name} onboarding complete! Transitioned to Live Delivery.`, 'success');
                    setAccounts(prev => prev.map(a => a.id === selectedClient.id ? { ...a, stageIndex: 5, currentStage: 'Live Delivery Active', completedSteps: a.totalSteps, hasBlocker: false } : a));
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0A1628] hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Launch to Live Delivery</span>
                </button>
              </div>
            </div>

            {/* 5-Stage Stepper Progress Bar */}
            <div className="pt-4 pb-1">
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold mb-2">
                {[
                  '1. Sales Handoff',
                  '2. Assets & Access',
                  '3. Strategy & KPIs',
                  '4. Kickoff Call',
                  '5. Team Launch'
                ].map((stg, idx) => (
                  <div
                    key={stg}
                    className={`${
                      idx < selectedClient.stageIndex
                        ? 'text-emerald-600 font-bold'
                        : idx === selectedClient.stageIndex
                        ? 'text-[#B91C1C] dark:text-rose-400 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {stg}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full ${
                      idx < selectedClient.stageIndex
                        ? 'bg-emerald-500'
                        : idx === selectedClient.stageIndex
                        ? 'bg-[#B91C1C] animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Subtabs for Detail: Sales Handoff | Assets & Access | Strategy | Blockers | Timeline */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 pt-3 overflow-x-auto">
              <div className="flex items-center gap-1">
                {[
                  { id: 'handoff', label: 'Sales Handoff', icon: FileCheck },
                  { id: 'assets', label: 'Assets & Access Credentials', icon: Key },
                  { id: 'strategy', label: 'Strategy & North Star', icon: Target },
                  { id: 'blockers', label: 'Blockers & Risks', icon: ShieldAlert, badge: selectedClient.hasBlocker ? '2' : undefined },
                  { id: 'timeline', label: 'Milestone Timeline (24 Steps)', icon: Clock },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = detailTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDetailTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                        isActive
                          ? 'border-[#B91C1C] text-[#B91C1C] dark:text-rose-400'
                          : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px]">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: Sales Handoff */}
            {detailTab === 'handoff' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                      Commercial Scope &amp; SOW
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proposal Ref:</span>
                      <strong className="text-slate-800 dark:text-slate-200">QUO-2026-089 (CAPI Cloud)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contract Value:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">₹18,50,000 / mo + GST</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Billing Model:</span>
                      <span>Monthly Advance (Net 15)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kickoff Advance Recd:</span>
                      <span className="text-emerald-600 font-semibold">₹9,25,000 via NEFT ✓</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                      Key Commercial Deliverables
                    </span>
                    <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside">
                      <li>Server-side Conversion API (CAPI) on Google Cloud Run</li>
                      <li>GA4 BigQuery raw event pipeline with 100% attribution</li>
                      <li>Enterprise CRM bidirectional contact sync with OptiVir</li>
                      <li>Executive Weekly Dashboard with Automated ROAS Alerts</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Signed Master Services Agreement (MSA) counter-signed by Alex Morgan and Arjun Nair.</span>
                  </div>
                  <button
                    onClick={() => onNavigate && onNavigate('documents')}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0"
                  >
                    View in Documents Vault →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Assets & Access Credentials */}
            {detailTab === 'assets' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Access Credentials &amp; Infrastructure Matrix</h3>
                    <p className="text-slate-500 text-[11px]">Audit and track all 3rd-party accounts required for delivery</p>
                  </div>
                  <button
                    onClick={() => showToast('Access request link emailed to client technical contact.', 'info')}
                    className="px-3 py-1.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold transition cursor-pointer"
                  >
                    + Request Missing Credentials
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-[#0E1A2E] text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Credential / Service</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {credentials.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                          <td className="p-3 text-slate-500">{c.category}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${c.badgeColor}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setCredentials(prev => prev.map(x => x.id === c.id ? { ...x, status: 'Granted', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' } : x));
                                showToast(`Connection verified successfully for: ${c.name}`, 'success');
                              }}
                              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                            >
                              Test Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: Strategy & North Star KPIs */}
            {detailTab === 'strategy' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800">
                    <div className="text-slate-500 text-[11px] font-bold uppercase">North Star ROAS Target</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4.5x</div>
                    <p className="text-slate-500 text-[11px] mt-1">Blended across Paid Search &amp; Meta</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800">
                    <div className="text-slate-500 text-[11px] font-bold uppercase">Target Blended CAC</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹1,850</div>
                    <p className="text-slate-500 text-[11px] mt-1">Down from client benchmark of ₹2,800</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800">
                    <div className="text-slate-500 text-[11px] font-bold uppercase">Attribution Fidelity</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">98.5%</div>
                    <p className="text-slate-500 text-[11px] mt-1">CAPI server-side event match quality</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Target ICP &amp; Stakeholder Alignment</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Targeting enterprise IT leaders, CTOs, and Directors of Engineering in Indian FinTech &amp; SaaS sectors. Primary objective is establishing verified high-trust proof of compliance before commercial demonstration.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: Blockers & Risk Mitigation */}
            {detailTab === 'blockers' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Active Delivery Blockers</span>
                    </h3>
                    <p className="text-slate-500 text-[11px]">Unresolved items causing friction or SLA slippage</p>
                  </div>
                  <button
                    onClick={() => {
                      const newB = {
                        id: `blk-${Date.now()}`,
                        title: 'Technical Integration Review Needed',
                        severity: 'Medium' as const,
                        owner: 'Engineering Lead',
                        dateReported: 'Just now',
                        impact: 'Pending DNS verification & SSL certificate activation',
                        resolved: false
                      };
                      setBlockers(prev => [newB, ...prev]);
                      showToast('New blocker escalation ticket logged', 'action');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer"
                  >
                    + Log New Blocker
                  </button>
                </div>

                <div className="space-y-3">
                  {blockers.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{b.title}</span>
                          <span className="px-2 py-0.2 rounded bg-rose-600 text-white text-[10px] font-bold">
                            {b.severity} Severity
                          </span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Reported by: <strong>{b.owner}</strong> on {b.dateReported}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px]">{b.impact}</p>
                      </div>

                      <button
                        onClick={() => {
                          setBlockers(prev => prev.filter(x => x.id !== b.id));
                          showToast(`Blocker resolved: ${b.title}`, 'success');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold transition shrink-0 cursor-pointer"
                      >
                        Mark Resolved ✓
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: Milestone Timeline & 24-Step Checklist */}
            {detailTab === 'timeline' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">24-Step Onboarding Execution Checklist</h3>
                    <p className="text-slate-500 text-[11px]">Click items as they are audited and approved to advance the onboarding progress gauge</p>
                  </div>
                  <span className="font-bold text-[#B91C1C] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg">
                    18 of 24 Completed (75%)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'st-1', phase: 'Phase 1: Sales Intake', text: 'Countersigned MSA & SOW uploaded to vault' },
                    { id: 'st-2', phase: 'Phase 1: Sales Intake', text: 'Initial retainer advance deposit received & reconciled' },
                    { id: 'st-3', phase: 'Phase 1: Sales Intake', text: 'Client portal organization and user accounts provisioned' },
                    { id: 'st-4', phase: 'Phase 2: Assets & Access', text: 'Google Analytics 4 and Tag Manager admin access confirmed' },
                    { id: 'st-5', phase: 'Phase 2: Assets & Access', text: 'Meta Business Manager partnership request accepted' },
                    { id: 'st-6', phase: 'Phase 2: Assets & Access', text: 'Google Cloud Platform BigQuery dataset write permissions' },
                    { id: 'st-7', phase: 'Phase 3: Architecture', text: 'Server-side CAPI container deployment on Cloud Run' },
                    { id: 'st-8', phase: 'Phase 3: Architecture', text: 'DNS verification and custom tagging domain SSL provisioned' },
                    { id: 'st-9', phase: 'Phase 4: Alignment', text: 'Executive Kickoff Video Meet conducted with client leads' },
                    { id: 'st-10', phase: 'Phase 4: Alignment', text: 'North Star ROAS and monthly KPI targets formalized' },
                    { id: 'st-11', phase: 'Phase 5: Launch Ready', text: 'Conversion test event fires validated in live browser test' },
                    { id: 'st-12', phase: 'Phase 5: Launch Ready', text: 'Final client sign-off and transfer to Delivery Cockpit' },
                  ].map((step) => (
                    <div
                      key={step.id}
                      onClick={() => toggleChecklist(step.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                        checklist[step.id]
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                          : 'bg-white dark:bg-[#0E1A2E] border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="pt-0.5">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          checklist[step.id]
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {checklist[step.id] && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{step.phase}</div>
                        <div className={`font-semibold text-slate-900 dark:text-white ${checklist[step.id] ? 'line-through text-slate-400' : ''}`}>
                          {step.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  </div>

      {/* 4. Create New Onboarding Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0B1424] rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-[#B91C1C]" />
                <span>Start New Client Onboarding</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Financial Ltd"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Commercial Tier / Service Model</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                >
                  <option>Enterprise Retainer</option>
                  <option>Omnichannel Growth Retainer</option>
                  <option>AI CRM Acceleration</option>
                  <option>Performance Marketing SOW</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Monthly Contract Value (₹)</label>
                <input
                  type="text"
                  value={newContractVal}
                  onChange={(e) => setNewContractVal(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Assigned Account Exec</label>
                  <input
                    type="text"
                    defaultValue="Alex Morgan"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Target Live SLA</label>
                  <input
                    type="text"
                    defaultValue="14 Days"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newClientName) {
                    showToast('Please enter client name', 'error');
                    return;
                  }
                  const newAcc: OnboardingAccount = {
                    id: `onb-${Date.now()}`,
                    name: newClientName,
                    domain: `${newClientName.toLowerCase().replace(/\s+/g, '')}.com`,
                    avatarText: newClientName.slice(0, 2).toUpperCase(),
                    contractTier: newTier,
                    contractValue: newContractVal,
                    am: 'Alex Morgan',
                    pm: 'Elena Rostova',
                    currentStage: 'Sales Handoff & Intake',
                    stageIndex: 0,
                    daysInOnboarding: 1,
                    totalDaysTarget: 14,
                    completedSteps: 3,
                    totalSteps: 24,
                    hasBlocker: false,
                    primaryContact: {
                      name: 'Primary Contact',
                      role: 'Managing Director',
                      email: `contact@${newClientName.toLowerCase().replace(/\s+/g, '')}.com`,
                    }
                  };
                  setAccounts([newAcc, ...accounts]);
                  setSelectedClientId(newAcc.id);
                  setShowCreateModal(false);
                  setNewClientName('');
                  showToast(`Onboarding initialized for ${newClientName}!`, 'success');
                }}
                className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Initialize Onboarding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
