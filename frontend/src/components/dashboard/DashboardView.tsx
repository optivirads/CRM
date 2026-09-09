'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Target,
  ArrowUpRight,
  Calendar,
  Layers,
  BarChart3,
  UserPlus,
  ChevronDown,
  Plus,
  Briefcase,
  FileText,
  CreditCard,
  CheckSquare,
  ArrowUp,
  Radio,
  Globe,
  Shield,
  Download,
  Check,
  X,
  Send,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
  FileCheck,
  Receipt,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  AlertCircle,
  HelpCircle,
  MoreVertical,
  Sliders,
  DollarSign,
  UserCheck,
  FolderClosed,
  LayoutDashboard,
  Trophy,
  Award,
  Zap,
  Timer,
  Printer
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onCreateInvoice?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onCreateInvoice }) => {
  const { showToast } = useToast();
  // 02. DASHBOARD Switcher: 'management' | 'sales' | 'marketing' | 'finance' | 'my'
  const [activeDashboardMode, setActiveDashboardMode] = useState<'management' | 'sales' | 'marketing' | 'finance' | 'my'>('management');

  // My Dashboard stopwatch state
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(1420); // 23m 40s

  // Filter Dropdowns
  const [selectedDateRange, setSelectedDateRange] = useState('This Month (Oct 1 – Oct 31, 2026)');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Revenue chart filter
  const [chartMetric, setChartMetric] = useState<'Revenue' | 'ARR' | 'Cash Flow'>('Revenue');
  const [chartInterval, setChartInterval] = useState<'Mo' | 'Qtr' | 'Yr'>('Mo');

  // Priority tasks state
  const [tasksState, setTasksState] = useState<{ [key: string]: boolean }>({
    't1': false,
    't2': false,
    't3': false,
    't4': false,
  });

  // Action Reminders state
  const [reminders, setReminders] = useState<{ [key: string]: string }>({});
  const [dismissedEscalations, setDismissedEscalations] = useState(false);
  const [deals, setDeals] = useState([
    { name: 'Acme Tech Q4 Cloud Scale', client: 'Acme Technologies Pvt Ltd', amount: '₹18,50,000', stage: 'Proposal & SOW', prob: '85%', owner: 'Alex Morgan', action: 'Advance to Legal' },
    { name: 'Zenith Omnichannel Migration', client: 'Zenith Retail Global', amount: '₹24,00,000', stage: 'Legal & Security', prob: '90%', owner: 'Sarah Chen', action: 'Request Signature' },
    { name: 'Vertex Enterprise AI Suite', client: 'Vertex Solutions Inc', amount: '₹12,50,000', stage: 'Technical Eval', prob: '60%', owner: 'Marcus Vance', action: 'Schedule Demo' },
    { name: 'Nova Patient Portal Retainer', client: 'Nova Healthcare Labs', amount: '₹16,00,000', stage: 'Discovery', prob: '45%', owner: 'David Ross', action: 'Send Intake Form' },
  ]);

  const toggleTask = (id: string) => {
    setTasksState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleActionClick = (key: string, label: string) => {
    setReminders((prev) => ({ ...prev, [key]: 'Action Dispatched ✓' }));
    setTimeout(() => {
      setReminders((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 2500);
  };

  const completedTasksCount = Object.values(tasksState).filter(Boolean).length;

  return (
    <div className="pb-16 transition-colors duration-200">
      <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* ========================================================================= */}
      {/* 1. TOP GREETING & COMMAND CONTROLS (Matching Image 2)                    */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs transition-colors duration-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Greeting with console glyph icon */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0B1727] dark:bg-[#111E34] text-white flex items-center justify-center shadow-xs shrink-0 border border-[#1E293B]">
              <div className="w-5 h-5 border-2 border-slate-300 rounded-sm p-0.5 flex flex-col justify-between">
                <span className="block w-2 h-0.5 bg-white"></span>
                <span className="block w-3 h-0.5 bg-slate-400"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC] tracking-tight">
                  Good morning, Alex
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#111E34] border border-[#E2E6EC] dark:border-[#152238] text-[10px] font-bold text-[#5A6A80] dark:text-[#94A3B8] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Q4 Command Mode
                </span>
              </div>
              <p className="text-xs text-[#5A6A80] dark:text-[#94A3B8] mt-0.5">
                Here is your consolidated operational trajectory for today, October 24, 2026.
              </p>
            </div>
          </div>

          {/* Right Action Controls: Date, Team, Export, + Create */}
          <div className="flex flex-wrap items-center gap-2.5 relative">
            {/* Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown);
                  setShowTeamDropdown(false);
                  setShowCreateDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] border border-[#E2E6EC] dark:border-[#152238] text-xs text-[#0B1727] dark:text-[#F8FAFC] font-medium shadow-2xs transition"
              >
                <Calendar className="w-3.5 h-3.5 text-[#5A6A80]" />
                <span>{selectedDateRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8492A6]" />
              </button>

              {showDateDropdown && (
                <div className="absolute left-0 top-10 w-64 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-50 p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {[
                    'This Month (Oct 1 – Oct 31, 2026)',
                    'Previous Month (Sep 1 – Sep 30, 2026)',
                    'Q4 FY2026 (Oct 1 – Dec 31, 2026)',
                    'Year to Date (FY2026)'
                  ].map((d) => (
                    <div
                      key={d}
                      onClick={() => {
                        setSelectedDateRange(d);
                        setShowDateDropdown(false);
                      }}
                      className={`px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] cursor-pointer flex items-center justify-between text-[#0B1727] dark:text-[#F8FAFC] ${
                        selectedDateRange === d ? 'font-bold bg-slate-100 dark:bg-[#16253C]' : ''
                      }`}
                    >
                      <span>{d}</span>
                      {selectedDateRange === d && <Check className="w-3.5 h-3.5 text-[#DC2626]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Teams Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTeamDropdown(!showTeamDropdown);
                  setShowDateDropdown(false);
                  setShowCreateDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] border border-[#E2E6EC] dark:border-[#152238] text-xs text-[#0B1727] dark:text-[#F8FAFC] font-medium shadow-2xs transition"
              >
                <Users className="w-3.5 h-3.5 text-[#5A6A80]" />
                <span>{selectedTeam}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8492A6]" />
              </button>

              {showTeamDropdown && (
                <div className="absolute left-0 top-10 w-44 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-50 p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['All Teams', 'Revenue Team', 'Engineering Team', 'Marketing Team', 'Operations Team'].map((t) => (
                    <div
                      key={t}
                      onClick={() => {
                        setSelectedTeam(t);
                        setShowTeamDropdown(false);
                      }}
                      className={`px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] cursor-pointer flex items-center justify-between text-[#0B1727] dark:text-[#F8FAFC] ${
                        selectedTeam === t ? 'font-bold bg-slate-100 dark:bg-[#16253C]' : ''
                      }`}
                    >
                      <span>{t}</span>
                      {selectedTeam === t && <Check className="w-3.5 h-3.5 text-[#DC2626]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowExportDropdown(!showExportDropdown);
                  setShowCreateDropdown(false);
                  setShowDateDropdown(false);
                  setShowTeamDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-[#0B1727] dark:text-[#F8FAFC] text-xs font-semibold border border-[#E2E6EC] dark:border-[#152238] shadow-2xs transition"
              >
                <Download className="w-3.5 h-3.5 text-[#5A6A80]" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 text-[#5A6A80] ml-0.5" />
              </button>

              {showExportDropdown && (
                <div className="absolute right-0 top-10 w-64 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-50 p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <a
                    href="/OPTIVIR_CRM_UI_STRUCTURE.pdf"
                    download="OPTIVIR_CRM_UI_STRUCTURE.pdf"
                    onClick={() => setShowExportDropdown(false)}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2.5 text-[#0B1727] dark:text-white group"
                  >
                    <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-950/40 text-[#DC2626]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100">Download Architecture PDF</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Actual 7-page native vector PDF file</div>
                    </div>
                  </a>
                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      window.print();
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2.5 text-[#0B1727] dark:text-white border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                  >
                    <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100">Print Live Dashboard</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Send dashboard view to printer</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* + Create Black/Navy Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCreateDropdown(!showCreateDropdown);
                  setShowDateDropdown(false);
                  setShowTeamDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0B1727] hover:bg-[#111E34] text-white text-xs font-semibold shadow-xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {showCreateDropdown && (
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-50 p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      onNavigate('leads');
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>New Lead</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      onNavigate('pipeline');
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>New Deal</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      if (onCreateInvoice) onCreateInvoice();
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    <span>New Invoice</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 02. DASHBOARD PERSPECTIVE SELECTOR (Specification Parity)                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>View:</span>
          </div>

          {[
            { id: 'management', label: 'Management Dashboard', icon: LayoutDashboard, badge: 'Unified' },
            { id: 'sales', label: 'Sales Dashboard', icon: TrendingUp, badge: 'Pipeline' },
            { id: 'marketing', label: 'Marketing Dashboard', icon: BarChart3, badge: 'ROAS' },
            { id: 'finance', label: 'Finance Dashboard', icon: CreditCard, badge: 'Cashflow' },
            { id: 'my', label: 'My Dashboard', icon: UserCheck, badge: 'Personal' },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = activeDashboardMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveDashboardMode(mode.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0A1628] text-white shadow-xs border border-[#14233D] dark:bg-[#B91C1C] dark:border-rose-900'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111E34]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400 dark:text-white' : 'text-slate-400'}`} />
                <span>{mode.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {mode.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Stream Active</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono">Auto-Sync 10s</span>
        </div>
      </div>

      {activeDashboardMode === 'management' && (
      <>
      {/* ========================================================================= */}
      {/* 2. OPERATIONAL FRICTION BANNER (Matching Image 2)                         */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main friction badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[11px] tracking-wider uppercase shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>OPERATIONAL FRICTION</span>
            <span className="bg-white/25 text-white px-1.5 py-0.2 rounded text-[10px]">5 Items</span>
          </div>

          {/* Friction items */}
          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Overdue Tasks</span>
            <span className="font-bold text-red-600">4</span>
          </button>

          <button
            onClick={() => onNavigate('finance')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Unpaid Invoices</span>
            <span className="font-bold text-red-600">₹14,200</span>
          </button>

          <button
            onClick={() => onNavigate('leads')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Stale Leads (&gt;24h)</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">9</span>
          </button>

          <button
            onClick={() => onNavigate('proposals')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Pending Proposals</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">3</span>
          </button>

          <button
            onClick={() => onNavigate('projects')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Project At-Risk</span>
            <span className="font-bold text-red-600">1</span>
          </button>
        </div>

        <button
          onClick={() => onNavigate('tasks')}
          className="text-xs font-semibold text-[#0B1727] dark:text-[#F8FAFC] hover:text-[#DC2626] flex items-center gap-1 transition pr-2"
        >
          <span>Review Queue</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. 4 PRIMARY KEY METRIC CARDS (Matching Image 2)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: TOTAL REVENUE */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#111E34] flex items-center justify-center text-slate-600 dark:text-slate-300">
              <span className="text-xs font-bold">₹</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">₹48,250</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +12.5%
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex justify-between text-[11px] text-[#8492A6] mb-1">
                <span>Target: ₹50,000</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">96.5%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#111E34] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0B1727] dark:bg-white h-full rounded-full" style={{ width: '96.5%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: ACTIVE CLIENTS */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Active Clients</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#111E34] flex items-center justify-center text-slate-600 dark:text-slate-300">
              <FolderClosed className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">142</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +8.2%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8492A6] mt-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Quarter Net Additions</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">+12 onboarded</span>
            </div>
          </div>
        </div>

        {/* Metric 3: NEW PIPELINE LEADS */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">New Pipeline Leads</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#111E34] flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">1,482</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +18.7%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8492A6] mt-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>MQL to SQL</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">38.2% conversion</span>
            </div>
          </div>
        </div>

        {/* Metric 4: DEAL WIN VELOCITY */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Deal Win Velocity</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#111E34] flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">24.8%</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +4.1%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8492A6] mt-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Industry Benchmark</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">19.4% (+5.4% lead)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CHARTS ROW: REVENUE OVERVIEW & LEAD INGESTION (Matching Image 2)      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Chart: Revenue Overview & Projections (7 of 12 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC]">
                    Revenue Overview &amp; Projections
                  </h3>
                  <HelpCircle className="w-3.5 h-3.5 text-[#8492A6]" />
                </div>
                <p className="text-[11px] text-[#5A6A80] dark:text-[#94A3B8]">
                  Comparative historical billing versus forecast closing pipeline
                </p>
              </div>

              {/* Metric & Interval Toggles */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-[#111E34] p-0.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] text-[11px]">
                  {(['Revenue', 'ARR', 'Cash Flow'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setChartMetric(m)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition ${
                        chartMetric === m
                          ? 'bg-white dark:bg-[#0B1424] text-[#0B1727] dark:text-white shadow-2xs'
                          : 'text-[#64748B] hover:text-[#0B1727]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-[#111E34] p-0.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] text-[11px]">
                  {(['Mo', 'Qtr', 'Yr'] as const).map((intv) => (
                    <button
                      key={intv}
                      onClick={() => setChartInterval(intv)}
                      className={`px-2 py-1 rounded-md font-semibold transition ${
                        chartInterval === intv
                          ? 'bg-white dark:bg-[#0B1424] text-[#0B1727] dark:text-white shadow-2xs'
                          : 'text-[#64748B] hover:text-[#0B1727]'
                      }`}
                    >
                      {intv}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs mt-3 text-[#5A6A80] dark:text-[#94A3B8]">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#0B1727] dark:bg-white"></span>
                <span>Actuals: <strong className="text-slate-800 dark:text-white">₹48,250</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Subscriptions: <strong className="text-slate-800 dark:text-white">₹36,100</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Services: <strong className="text-slate-800 dark:text-white">₹12,150</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 border-t-2 border-dashed border-blue-400"></span>
                <span>Target Target Line</span>
              </div>
            </div>

            {/* SVG Curvilinear Smooth Spline Chart */}
            <div className="mt-4 relative h-60 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B1727" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0B1727" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="190" x2="600" y2="190" stroke="#E2E8F0" />

                {/* Filled Area Gradient */}
                <path
                  d="M 30 150 C 110 135, 190 105, 270 110 C 350 115, 430 85, 510 70 L 510 190 L 30 190 Z"
                  fill="url(#revGrad)"
                />

                {/* Subscriptions Area */}
                <path
                  d="M 30 165 C 110 150, 190 130, 270 135 C 350 138, 430 115, 510 95 L 510 190 L 30 190 Z"
                  fill="url(#blueGrad)"
                />

                {/* Target Dashed Line */}
                <path
                  d="M 30 140 C 120 120, 250 90, 510 70 L 580 50"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Actual Spline Line */}
                <path
                  d="M 30 150 C 110 135, 190 105, 270 110 C 350 115, 430 85, 510 70"
                  fill="none"
                  stroke="#0B1727"
                  strokeWidth="3"
                  className="dark:stroke-white"
                />

                {/* Dotted Projection line to Nov Forecast */}
                <path
                  d="M 510 70 C 530 65, 560 55, 580 50"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeDasharray="3 3"
                />

                {/* Data Points */}
                <circle cx="30" cy="150" r="3.5" fill="#0B1727" className="dark:fill-white" />
                <circle cx="110" cy="135" r="3.5" fill="#0B1727" className="dark:fill-white" />
                <circle cx="190" cy="105" r="3.5" fill="#0B1727" className="dark:fill-white" />
                <circle cx="270" cy="110" r="3.5" fill="#0B1727" className="dark:fill-white" />
                <circle cx="350" cy="115" r="3.5" fill="#0B1727" className="dark:fill-white" />
                <circle cx="430" cy="85" r="3.5" fill="#0B1727" className="dark:fill-white" />
                <circle cx="510" cy="70" r="5" fill="#0B1727" stroke="#FFFFFF" strokeWidth="2" className="dark:fill-white" />
                <circle cx="580" cy="50" r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              {/* Tooltip over October point (Matching Image 2) */}
              <div className="absolute top-7 left-[80%] -translate-x-1/2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] px-3 py-1.5 rounded-lg shadow-xl text-[11px] font-bold text-center pointer-events-none z-10">
                <span>OCTOBER ACTUAL</span>
                <span className="block text-xs font-extrabold">₹48,250 MTD</span>
              </div>
            </div>

            {/* X-Axis Month Labels (Matching Image 2) */}
            <div className="flex justify-between items-center text-[11px] text-[#8492A6] px-2 pt-2">
              <span>May (₹28.4k)</span>
              <span>Jun (₹32.1k)</span>
              <span>Jul (₹39.8k)</span>
              <span>Aug (₹38.2k)</span>
              <span>Sep (₹44.9k)</span>
              <span className="font-bold text-[#0B1727] dark:text-white">Oct (₹48.2k)</span>
              <span className="text-blue-600 font-semibold">Nov Forecast (~₹54.5k)</span>
            </div>
          </div>
        </div>

        {/* Right Chart: Lead Ingestion Channel Donut (5 of 12 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC]">
                  Lead Ingestion Channel
                </h3>
                <p className="text-[11px] text-[#5A6A80] dark:text-[#94A3B8]">
                  Attribution breakdown (MTD)
                </p>
              </div>
              <button
                onClick={() => showToast('Lead Ingestion attribution: Organic (42%), Meta (28%), Google (20%), Direct (10%)', 'info')}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="View attribution breakdown"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Circular Donut Diagram */}
            <div className="relative flex items-center justify-center my-4">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="11" />
                {/* Organic Search (42%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#0B1727"
                  strokeWidth="11"
                  strokeDasharray="100.2 238.7"
                  strokeDashoffset="0"
                  className="dark:stroke-white"
                />
                {/* LinkedIn B2B (26%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#2563EB"
                  strokeWidth="11"
                  strokeDasharray="62.1 238.7"
                  strokeDashoffset="-100.2"
                />
                {/* Partner & Referral (18%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#38BDF8"
                  strokeWidth="11"
                  strokeDasharray="43 238.7"
                  strokeDashoffset="-162.3"
                />
                {/* Direct Paid Social (8%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#DC2626"
                  strokeWidth="11"
                  strokeDasharray="19.1 238.7"
                  strokeDashoffset="-205.3"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">1,482</span>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-[#8492A6]">
                  Total Leads
                </span>
              </div>
            </div>

            {/* Channels Breakdown List (Matching Image 2) */}
            <div className="space-y-2.5 text-xs mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B1727] dark:bg-white shrink-0"></span>
                  <span className="text-[#0B1727] dark:text-[#F8FAFC] font-medium truncate max-w-[140px]">
                    Organic Search &amp; Web
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">622</span>
                  <span className="text-[#8492A6]">42%</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#111E34] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    31% conv
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                  <span className="text-[#0B1727] dark:text-[#F8FAFC] font-medium truncate max-w-[140px]">
                    LinkedIn B2B Campa...
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">385</span>
                  <span className="text-[#8492A6]">26%</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#111E34] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    28% conv
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0"></span>
                  <span className="text-[#0B1727] dark:text-[#F8FAFC] font-medium truncate max-w-[140px]">
                    Partner &amp; Client Refe...
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">267</span>
                  <span className="text-[#8492A6]">18%</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#111E34] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    44% conv
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
                  <span className="text-[#0B1727] dark:text-[#F8FAFC] font-medium truncate max-w-[140px]">
                    Direct Paid Social
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">133</span>
                  <span className="text-[#8492A6]">8%</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#111E34] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    16% conv
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. EXECUTIVE DEAL PIPELINE PROGRESSION (Matching Image 2)                */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC]">
              Executive Deal Pipeline Progression
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              456 Active Deals • ₹121.8L Pipeline
            </span>
          </div>
          <button
            onClick={() => onNavigate('pipeline')}
            className="text-xs font-semibold text-[#0B1727] dark:text-[#F8FAFC] hover:text-[#DC2626] flex items-center gap-1 transition"
          >
            <span>Open Full Kanban</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 7 Stage Progression Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
          {/* Stage 1: Inbound New */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>1. Inbound New</span>
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">184</span>
              <p className="text-[10px] text-slate-500">Volume count</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-[#0B1727] dark:text-white">₹18.2L</span>
              <span className="block text-[10px] text-slate-400">Avg cycle: 2.1d</span>
            </div>
          </div>

          {/* Stage 2: Contacted */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>2. Contacted</span>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">112</span>
              <p className="text-[10px] text-slate-500">Active outreach</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-[#0B1727] dark:text-white">₹14.8L</span>
              <span className="block text-[10px] text-slate-400">Avg cycle: 4.8d</span>
            </div>
          </div>

          {/* Stage 3: Qualified */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>3. Qualified</span>
              <span className="w-2 h-2 rounded-full bg-[#0B1727] dark:bg-white"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">68</span>
              <p className="text-[10px] text-slate-500">Solution fit</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-[#0B1727] dark:text-white">₹22.4L</span>
              <span className="block text-[10px] text-slate-400">Avg cycle: 7.2d</span>
            </div>
          </div>

          {/* Stage 4: Proposal (Bottleneck alert) */}
          <div className="p-3.5 rounded-xl border-2 border-red-400 dark:border-red-600 bg-red-50/20 dark:bg-red-950/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
              <span>4. Proposal</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-red-700 dark:text-red-400">34</span>
              <span className="block text-[10px] text-red-600 font-semibold">3 stuck &gt;14d</span>
            </div>
            <div className="mt-3 pt-2 border-t border-red-200 dark:border-red-800/60 text-[11px]">
              <span className="font-bold text-[#0B1727] dark:text-white">₹16.1L</span>
              <span className="block text-[10px] text-red-600 font-bold">Bottleneck alert</span>
            </div>
          </div>

          {/* Stage 5: Negotiation */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>5. Negotiation</span>
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">19</span>
              <p className="text-[10px] text-slate-500">Procurement legal</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-[#0B1727] dark:text-white">₹11.5L</span>
              <span className="block text-[10px] text-slate-400">Win prob: 78%</span>
            </div>
          </div>

          {/* Stage 6: Closed Won */}
          <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <span>6. Closed Won</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">28</span>
              <p className="text-[10px] text-slate-500">This period</p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-[11px]">
              <span className="font-bold text-[#0B1727] dark:text-white">₹32.8L</span>
              <span className="block text-[10px] text-emerald-600 font-semibold">100% booked</span>
            </div>
          </div>

          {/* Stage 7: Closed Lost */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>7. Closed Lost</span>
              <X className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">11</span>
              <p className="text-[10px] text-slate-500">Disqualified / Lost</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-[#0B1727] dark:text-white">₹6.2L</span>
              <span className="block text-[10px] text-slate-400">Budget constraints</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. BOTTOM 3-COLUMN WIDGETS ROW (Matching Image 2)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Column 1: Live CRM Stream */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC]">
                    Live CRM Stream
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-[#5A6A80] dark:text-[#94A3B8]">
                  Real-time organizational timeline
                </p>
              </div>
            </div>

            <div className="space-y-3.5 mt-4 text-xs">
              {/* Stream Item 1 */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <UserPlus className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <p className="text-[#0B1727] dark:text-slate-200">
                    <strong className="font-semibold">Sarah Jenkins</strong> (Apex Global) assigned to <strong>Mark D.</strong>
                  </p>
                  <p className="text-[10px] text-[#8492A6]">5 mins ago • Inbound Web Form</p>
                </div>
              </div>

              {/* Stream Item 2 */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Send className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <p className="text-[#0B1727] dark:text-slate-200">
                    Proposal sent: <strong className="font-semibold">Enterprise SLA</strong> to <strong>FinEdge Labs</strong> (₹8,400)
                  </p>
                  <p className="text-[10px] text-[#8492A6]">32 mins ago • by Marcus Vance</p>
                </div>
              </div>

              {/* Stream Item 3 */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <p className="text-[#0B1727] dark:text-slate-200">
                    Payment received: Invoice <strong className="font-semibold">#INV-2026-88</strong> from <strong>Vortex Retail</strong> (₹12,598)
                  </p>
                  <p className="text-[10px] text-[#8492A6]">1 hour ago • Stripe Integrated</p>
                </div>
              </div>

              {/* Stream Item 4 */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <p className="text-[#0B1727] dark:text-slate-200">
                    Demo executed with <strong className="font-semibold">Horizon Group Tech</strong>
                  </p>
                  <p className="text-[10px] text-[#8492A6]">2 hours ago • by Elena Rostova</p>
                </div>
              </div>

              {/* Stream Item 5 */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCw className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <p className="text-[#0B1727] dark:text-slate-200">
                    Lead status elevated: <strong className="font-semibold">OmniTech Industries</strong> to Negotiation
                  </p>
                  <p className="text-[10px] text-[#8492A6]">3 hours ago • Valuation ₹11.5L</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-[#0B1727] dark:text-[#F8FAFC] hover:text-[#DC2626] flex items-center gap-1 transition"
            >
              <span>View Detailed Audit Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 2: Priority Tasks */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC]">
                  Priority Tasks
                </h3>
                <p className="text-[11px] text-[#5A6A80] dark:text-[#94A3B8]">
                  Key action items assigned to you &amp; leadership
                </p>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-[#DC2626] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              {/* Task 1 */}
              <div
                onClick={() => toggleTask('t1')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#111E34] cursor-pointer transition flex items-start gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={tasksState['t1'] || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleTask('t1');
                  }}
                  className="mt-0.5 rounded text-[#DC2626] focus:ring-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B1727] dark:text-white">
                      David K. (CTO, QuantumSoft)
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-700 dark:text-slate-300">
                      HIGH
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Discovery call &amp; architecture walkthrough
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Today, 11:30 AM • 👤 Alex
                  </p>
                </div>
              </div>

              {/* Task 2 */}
              <div
                onClick={() => toggleTask('t2')}
                className="p-2.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/20 dark:bg-red-950/20 hover:bg-red-50/30 cursor-pointer transition flex items-start gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={tasksState['t2'] || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleTask('t2');
                  }}
                  className="mt-0.5 rounded text-[#DC2626] focus:ring-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B1727] dark:text-white">
                      Send Proposal: Lumina Dyna...
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[9px] font-bold">
                      OVERDUE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Custom SLA clause approval from legal team
                  </p>
                  <p className="text-[10px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Today, 2:00 PM (Late)
                  </p>
                </div>
              </div>

              {/* Task 3 */}
              <div
                onClick={() => toggleTask('t3')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#111E34] cursor-pointer transition flex items-start gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={tasksState['t3'] || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleTask('t3');
                  }}
                  className="mt-0.5 rounded text-[#DC2626] focus:ring-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B1727] dark:text-white">
                      Quarterly Client Review
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-700 dark:text-slate-300">
                      STANDARD
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Vertex Corp account health and expansion check
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Tomorrow, 10:00 AM
                  </p>
                </div>
              </div>

              {/* Task 4 */}
              <div
                onClick={() => toggleTask('t4')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#111E34] cursor-pointer transition flex items-start gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={tasksState['t4'] || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleTask('t4');
                  }}
                  className="mt-0.5 rounded text-[#DC2626] focus:ring-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B1727] dark:text-white">
                      Prepare Q3 Board Deck
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-700 dark:text-slate-300">
                      BOARD
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Revenue and churn analysis synthesis
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due Oct 28 (in 4 days)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 text-xs">
            <span className="text-[#8492A6]">
              {completedTasksCount + 4} of 12 tasks completed
            </span>
            <button
              onClick={() => onNavigate('tasks')}
              className="font-semibold text-[#0B1727] dark:text-[#F8FAFC] hover:text-[#DC2626] flex items-center gap-1 transition"
            >
              <span>Open Taskboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 3: Escalations Queue */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC]">
                    Escalations Queue
                  </h3>
                  <span className="px-2 py-0.2 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-bold">
                    Action Required
                  </span>
                </div>
                <p className="text-[11px] text-[#5A6A80] dark:text-[#94A3B8]">
                  High-impact blockers requiring executive nudge
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              {/* Escalation 1 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-600 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> OVERDUE AR INVOICE
                  </span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.2 rounded">
                    14d Late
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <div>
                    <p className="font-bold text-[#0B1727] dark:text-white">Zenith Corp (#INV-1044)</p>
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">₹8,200</p>
                  </div>
                  <button
                    onClick={() => handleActionClick('esc1', 'Remind Finance')}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] shadow-2xs transition"
                  >
                    {reminders['esc1'] || 'Remind Finance'}
                  </button>
                </div>
              </div>

              {/* Escalation 2 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-600 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> OVERDUE AR INVOICE
                  </span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.2 rounded">
                    5d Late
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <div>
                    <p className="font-bold text-[#0B1727] dark:text-white">Starlight Inc (#INV-1049)</p>
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">₹6,600</p>
                  </div>
                  <button
                    onClick={() => handleActionClick('esc2', 'Remind Finance')}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] shadow-2xs transition"
                  >
                    {reminders['esc2'] || 'Remind Finance'}
                  </button>
                </div>
              </div>

              {/* Escalation 3 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> STALLED LEAD NUDGE
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                    28h Unanswered
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <div>
                    <p className="font-bold text-[#0B1727] dark:text-white">Rachel Adams (Enterprise)</p>
                    <p className="text-[11px] text-slate-500">Assigned to: Inbound Queue</p>
                  </div>
                  <button
                    onClick={() => handleActionClick('esc3', 'Quick Reassign')}
                    className="px-2.5 py-1 rounded-lg bg-[#0B1727] hover:bg-slate-800 text-white font-semibold text-[11px] shadow-2xs transition"
                  >
                    {reminders['esc3'] || 'Quick Reassign'}
                  </button>
                </div>
              </div>

              {/* Escalation 4 */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-600 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> BOTTLENECKED DEAL
                  </span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.2 rounded">
                    21d in Stage
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <div>
                    <p className="font-bold text-[#0B1727] dark:text-white">Nimbus Cloud Integration</p>
                    <p className="text-[11px] text-slate-500">₹18,500 • Owner: David S.</p>
                  </div>
                  <button
                    onClick={() => handleActionClick('esc4', 'Nudge Owner')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[#0B1727] dark:text-white font-semibold text-[11px] border border-slate-200 dark:border-slate-700 transition"
                  >
                    {reminders['esc4'] || 'Nudge Owner'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => {
                setDismissedEscalations(true);
                showToast('All 3 reviewed escalation items dismissed.', 'success');
              }}
              className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition text-center cursor-pointer"
            >
              {dismissedEscalations ? 'Escalation Items Dismissed ✓' : 'Dismiss Reviewed Items (3)'}
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      {/* ========================================================================= */}
      {/* 2. SALES DASHBOARD MODE                                                   */}
      {/* ========================================================================= */}
      {activeDashboardMode === 'sales' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Sales KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Total Active Pipeline</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹2,45,00,000</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">+18.4%</span>
                <span>vs last month (42 active deals)</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Weighted Forecast</span>
                <Target className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹1,82,40,000</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">74.3% Conf</span>
                <span>Closing by Oct 31, 2026</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Commercial Win Rate</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">68.4%</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">+4.2%</span>
                <span>Industry benchmark: 48%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Avg Sales Velocity</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">24 Days</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">-3.8 Days</span>
                <span>Fastest cycle in SaaS &amp; Cloud</span>
              </div>
            </div>
          </div>

          {/* Leaderboard & Stage Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Sales Rep Quota Leaderboard (7 Cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#B91C1C]" />
                    <span>Sales Rep Quota Attainment (Q4 FY26)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Monthly quota pacing and closed volume by revenue team member</p>
                </div>
                <button
                  onClick={() => onNavigate('pipeline')}
                  className="text-xs text-[#B91C1C] dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>View Pipeline Kanban</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Marcus Vance', role: 'Head of Enterprise Sales', closed: '₹51.2L', quota: '₹36.0L', pct: 142, deals: 8, badge: '🏆 #1 Top Performer', bg: 'bg-amber-500' },
                  { name: 'Alex Morgan (You)', role: 'VP Growth & Solutions', closed: '₹42.5L', quota: '₹36.0L', pct: 118, deals: 6, badge: '⭐ Quota Exceeded', bg: 'bg-[#B91C1C]' },
                  { name: 'Sarah Chen', role: 'Senior Account Exec', closed: '₹33.8L', quota: '₹36.0L', pct: 94, deals: 5, badge: '🔥 Closing Fast', bg: 'bg-blue-600' },
                  { name: 'David Ross', role: 'Strategic Partnerships', closed: '₹31.6L', quota: '₹36.0L', pct: 88, deals: 4, badge: 'Pacing On-Track', bg: 'bg-purple-600' },
                ].map((rep) => (
                  <div key={rep.name} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0E1A2E]/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-bold text-xs">
                          {rep.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{rep.name}</span>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">({rep.role})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{rep.deals} Deals Closed • {rep.badge}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{rep.closed} / {rep.quota}</div>
                        <div className={`text-[11px] font-bold ${rep.pct >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {rep.pct}% Quota
                        </div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${rep.pct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-[#B91C1C] to-rose-400'}`}
                        style={{ width: `${Math.min(rep.pct, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deal Stage Funnel (5 Cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Pipeline Velocity Funnel</span>
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  42 In-Flight
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { stage: '1. Discovery & Needs Audit', count: 18, value: '₹58.0L', conv: '100%', color: 'bg-slate-500' },
                  { stage: '2. Technical Architecture Scope', count: 12, value: '₹64.5L', conv: '66.7%', color: 'bg-blue-600' },
                  { stage: '3. Commercial Proposal & SOW', count: 6, value: '₹48.0L', conv: '50.0%', color: 'bg-amber-600' },
                  { stage: '4. Legal & Security Review', count: 4, value: '₹38.5L', conv: '66.7%', color: 'bg-purple-600' },
                  { stage: '5. Contract Finalized / Won', count: 2, value: '₹36.0L', conv: '50.0%', color: 'bg-emerald-600' },
                ].map((s) => (
                  <div key={s.stage} className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1A2E]/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{s.stage}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{s.value}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1.5">
                      <span>{s.count} opportunities</span>
                      <span>Stage Conv: {s.conv}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: s.conv }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Deals Table */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#B91C1C]" />
                  <span>High-Value Deals in Motion</span>
                </h3>
                <p className="text-xs text-slate-500">Commercial opportunities expected to close within current billing cycle</p>
              </div>
              <button
                onClick={() => onNavigate('pipeline')}
                className="px-3 py-1.5 bg-[#0A1628] hover:bg-[#14233D] text-white text-xs font-bold rounded-lg transition"
              >
                Open Full Kanban
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0E1A2E] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 pl-4">Deal / Opportunity</th>
                    <th className="p-3">Client Entity</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Current Stage</th>
                    <th className="p-3">Win Probability</th>
                    <th className="p-3">Lead Owner</th>
                    <th className="p-3 pr-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {deals.map((d) => (
                    <tr key={d.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 pl-4 font-bold text-slate-900 dark:text-white">{d.name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{d.client}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{d.amount}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold text-[11px] border border-blue-200 dark:border-blue-800">
                          {d.stage}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{d.prob}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{d.owner}</td>
                      <td className="p-3 pr-4 text-right">
                        <button
                          onClick={() => {
                            showToast(`Advancing: ${d.name} (${d.action})`, 'success');
                            setDeals(prev => prev.map(item => item.name === d.name ? { ...item, stage: 'Under Final Review', prob: '95%', action: 'Signed & Closed' } : item));
                          }}
                          className="px-2.5 py-1 rounded bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold text-[11px] shadow-2xs transition cursor-pointer"
                        >
                          {d.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MARKETING DASHBOARD MODE                                               */}
      {/* ========================================================================= */}
      {activeDashboardMode === 'marketing' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Marketing KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Total Ad Spend (MTD)</span>
                <DollarSign className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹14,20,000</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">94.6% Budget Paced</span>
                <span>Cap: ₹15.0L</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Blended CAC</span>
                <Target className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹1,840</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">-12.8%</span>
                <span>CAC Efficiency Target Met</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Inbound Leads (MQLs)</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">842 MQLs</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">+28.4%</span>
                <span>vs previous cycle</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Attributed Pipeline</span>
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹1,15,00,000</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">5.8x ROAS</span>
                <span>Marketing-influenced</span>
              </div>
            </div>
          </div>

          {/* Channel Breakdown Matrix */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#B91C1C]" />
                  <span>Attribution Channel Matrix &amp; ROAS</span>
                </h3>
                <p className="text-xs text-slate-500">Cross-network traffic, acquisition economics, and qualified conversion volume</p>
              </div>
              <button
                onClick={() => onNavigate('marketing')}
                className="text-xs text-[#B91C1C] dark:text-rose-400 font-bold hover:underline"
              >
                Open Marketing Intelligence →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0E1A2E] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 pl-4">Channel / Campaign</th>
                    <th className="p-3">Ad Spend</th>
                    <th className="p-3">Clicks</th>
                    <th className="p-3">MQLs</th>
                    <th className="p-3">SQLs</th>
                    <th className="p-3">Cost / Lead</th>
                    <th className="p-3">Pipeline Attributed</th>
                    <th className="p-3 pr-4 text-right">ROAS Multiple</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { channel: 'Google Search & PMax', spend: '₹6,40,000', clicks: '14,200', mql: 420, sql: 96, cpl: '₹1,523', pipe: '₹58.0L', roas: '6.2x', roasColor: 'text-emerald-600' },
                    { channel: 'LinkedIn B2B Thought Leadership', spend: '₹4,20,000', clicks: '5,800', mql: 180, sql: 64, cpl: '₹2,333', pipe: '₹34.5L', roas: '5.4x', roasColor: 'text-emerald-600' },
                    { channel: 'Organic SEO & Tech Content', spend: '₹1,80,000', clicks: '28,400', mql: 160, sql: 48, cpl: '₹1,125', pipe: '₹14.0L', roas: '7.8x', roasColor: 'text-emerald-600' },
                    { channel: 'Partner Webinars & Co-Marketing', spend: '₹1,80,000', clicks: '2,100', mql: 82, sql: 28, cpl: '₹2,195', pipe: '₹8.5L', roas: '4.7x', roasColor: 'text-blue-600' },
                  ].map((c) => (
                    <tr key={c.channel} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 pl-4 font-bold text-slate-900 dark:text-white">{c.channel}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{c.spend}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{c.clicks}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{c.mql}</td>
                      <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{c.sql}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{c.cpl}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{c.pipe}</td>
                      <td className={`p-3 pr-4 text-right font-bold text-sm ${c.roasColor}`}>{c.roas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FINANCE DASHBOARD MODE                                                 */}
      {/* ========================================================================= */}
      {activeDashboardMode === 'finance' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Finance KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Net Collections (MTD)</span>
                <Receipt className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹78,40,000</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">+22.4%</span>
                <span>vs target (38 verified receipts)</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">AR Overdue &amp; Aging</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold text-rose-600 mt-2">₹14,80,000</div>
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/60 font-bold">3 Invoices Overdue</span>
                <span>Dunning workflows active</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Operating Runway</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">18.4 Months</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">₹1.45 Cr Liquid</span>
                <span>ICICI Corporate Reserve</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Delivery Gross Margin</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">68.2%</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">+3.1% YoY</span>
                <span>Blended retainer efficiency</span>
              </div>
            </div>
          </div>

          {/* Aging Receivables Breakdown & Inflow Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Aging Distribution (5 Cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#B91C1C]" />
                  <span>Accounts Receivable Aging</span>
                </h3>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                  Total: ₹63.5L
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { bucket: 'Current (< 30 Days)', amount: '₹38,20,000', count: '14 Invoices', pct: '60.1%', status: 'Within SLA', color: 'bg-emerald-500' },
                  { bucket: '31 – 60 Days Aging', amount: '₹18,40,000', count: '6 Invoices', pct: '28.9%', status: 'Follow-up Sent', color: 'bg-blue-500' },
                  { bucket: '61 – 90 Days Aging', amount: '₹4,80,000', count: '2 Invoices', pct: '7.5%', status: 'Warning Level 2', color: 'bg-amber-500' },
                  { bucket: '90+ Days Critical', amount: '₹2,10,000', count: '1 Invoice', pct: '3.3%', status: 'Escalated to Legal', color: 'bg-rose-600' },
                ].map((b) => (
                  <div key={b.bucket} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E1A2E]/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{b.bucket}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{b.amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1.5">
                      <span>{b.count} • {b.status}</span>
                      <span className="font-semibold">{b.pct}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${b.color}`} style={{ width: b.pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inflow Ledger (7 Cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Recent Settled Collections</span>
                  </h3>
                  <p className="text-xs text-slate-500">Real-time banking settlement feeds via ICICI API gateway</p>
                </div>
                <button
                  onClick={() => onNavigate('finance')}
                  className="text-xs text-[#B91C1C] dark:text-rose-400 font-bold hover:underline"
                >
                  Open Finance Ledger →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#0E1A2E] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3 pl-4">Client / Entity</th>
                      <th className="p-3">Invoice Ref</th>
                      <th className="p-3">Payment Mode</th>
                      <th className="p-3">Cleared Date</th>
                      <th className="p-3 pr-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { client: 'Acme Technologies Pvt Ltd', inv: 'INV-2026-089', mode: 'Bank NEFT', date: 'Today, 11:20 AM', amount: '₹9,25,000' },
                      { client: 'Zenith Retail Global Ltd', inv: 'INV-2026-088', mode: 'Direct Wire', date: 'Yesterday', amount: '₹12,00,000' },
                      { client: 'Vertex Solutions Inc', inv: 'INV-2026-085', mode: 'UPI Business', date: 'Oct 22, 2026', amount: '₹6,25,000' },
                      { client: 'Nova Healthcare Labs', inv: 'INV-2026-078', mode: 'RTGS Transfer', date: 'Oct 20, 2026', amount: '₹4,50,000' },
                    ].map((row) => (
                      <tr key={row.inv} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 pl-4 font-bold text-slate-900 dark:text-white">{row.client}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{row.inv}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                            {row.mode}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{row.date}</td>
                        <td className="p-3 pr-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MY DASHBOARD MODE (Alex Morgan Personal Cockpit)                       */}
      {/* ========================================================================= */}
      {activeDashboardMode === 'my' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Personal KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">My Active Deals</span>
                <Briefcase className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">6 In-Flight</div>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 font-bold">₹54.0L Value</span>
                <span>Avg size: ₹9.0L</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">My Quota Progress</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">118% Attained</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">₹42.5L / ₹36.0L</span>
                <span>Tier 1 Bonus Active 🏆</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Today&apos;s Schedule</span>
                <Calendar className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">5 Engagements</div>
              <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 font-bold">3 Client Calls</span>
                <span>Next at 11:00 AM</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Priority Action Tasks</span>
                <CheckSquare className="w-4 h-4 text-[#B91C1C]" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">4 Pending</div>
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/60 font-bold">2 Due Today</span>
                <span>1 High-severity review</span>
              </div>
            </div>
          </div>

          {/* Today's Agenda & Action Checklist with Live Stopwatch */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Today's Agenda (6 Cols) */}
            <div className="lg:col-span-6 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>My Day: October 24, 2026</span>
                  </h3>
                  <p className="text-xs text-slate-500">Upcoming client reviews, video meets, and key deadlines</p>
                </div>
                <button
                  onClick={() => onNavigate('activities')}
                  className="text-xs text-[#B91C1C] dark:text-rose-400 font-bold hover:underline"
                >
                  Full Calendar →
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { time: '09:30 AM', title: 'Inbound Lead Qualification Sprint', type: 'Call', with: 'Arjun Nair (Acme Tech)', status: 'Completed', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' },
                  { time: '11:00 AM', title: 'Acme Technologies Q4 Scope Alignment', type: 'Google Meet', with: 'Arjun Nair & Tech Lead', status: 'In 45 mins', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 font-bold' },
                  { time: '02:00 PM', title: 'Zenith Retail Omnichannel Demo', type: 'Client Sync', with: 'Elena Rostova (CTO)', status: 'Upcoming', color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
                  { time: '04:30 PM', title: 'Vertex Enterprise Security Review', type: 'Contract', with: 'Legal & Procurement', status: 'Upcoming', color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
                ].map((item) => (
                  <div key={item.time} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0E1A2E]/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white w-16 shrink-0">{item.time}</div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.with} • {item.type}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* My Execution Tasks & Stopwatch (6 Cols) */}
            <div className="lg:col-span-6 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              {/* Stopwatch Strip */}
              <div className="p-3 rounded-xl bg-[#0A1628] text-white flex items-center justify-between mb-4 border border-[#14233D]">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Task Timer</div>
                    <div className="font-mono font-bold text-base text-white">
                      {Math.floor(stopwatchSeconds / 60)}m {stopwatchSeconds % 60}s
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStopwatchRunning(!stopwatchRunning)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      stopwatchRunning ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-[#B91C1C] hover:bg-[#991B1B] text-white'
                    }`}
                  >
                    {stopwatchRunning ? 'Pause' : 'Start Focus'}
                  </button>
                  <button
                    onClick={() => { setStopwatchRunning(false); setStopwatchSeconds(0); }}
                    className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#B91C1C]" />
                  <span>My Deliverable Checklist</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">Click to mark complete</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'my-1', title: 'Send finalized SOW proposal to Acme Tech for sign-off', due: 'Due 12:00 PM', tag: 'High Priority' },
                  { id: 'my-2', title: 'Schedule technical integration follow-up with Vertex CTO', due: 'Due 03:00 PM', tag: 'Sales' },
                  { id: 'my-3', title: 'Review Q4 retainer marketing attribution numbers', due: 'Due 05:00 PM', tag: 'Marketing' },
                  { id: 'my-4', title: 'Prepare board update slides on enterprise conversion', due: 'Tomorrow', tag: 'Internal' },
                ].map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      tasksState[task.id]
                        ? 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 line-through'
                        : 'bg-white dark:bg-[#0E1A2E]/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="pt-0.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        tasksState[task.id] ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {tasksState[task.id] && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">{task.title}</div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{task.due}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-medium">{task.tag}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* 7. SYSTEM STATUS FOOTER (Matching Image 2)                               */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#5A6A80] dark:text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          <span>
            <strong className="text-[#0B1727] dark:text-white">OptiVir Core v4.12.8</strong> • PostgreSQL Cluster Sync: 12ms • Stripe &amp; Banking Feeds: Real-time
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-[#0B1727] dark:text-[#CBD5E1]">
          <button
            onClick={() => showToast('Opening API Documentation & Schema v4.12.8...', 'info')}
            className="hover:text-[#DC2626] transition cursor-pointer"
          >
            API Documentation
          </button>
          <span>•</span>
          <button
            onClick={() => showToast('Security & Audit SLA: SOC2 Type II & ISO 27001 verified active.', 'success')}
            className="hover:text-[#DC2626] transition cursor-pointer"
          >
            Security &amp; Audit SLA
          </button>
          <span>•</span>
          <button
            onClick={() => {
              const exportRows = deals.map(d => ({
                Deal: d.name,
                Client: d.client,
                Amount: d.amount,
                Stage: d.stage,
                Probability: d.prob,
                Owner: d.owner
              }));
              exportToCsv('dashboard_deals_summary.csv', exportRows);
              showToast('Exported dashboard deals summary to CSV', 'success');
            }}
            className="hover:text-[#DC2626] transition cursor-pointer"
          >
            Export CSV Datasets
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
