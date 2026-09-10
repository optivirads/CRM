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
  Printer,
  BookOpen
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
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

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
  const [tasksState, setTasksState] = useState<{ [key: string]: boolean }>({});

  // Action Reminders state
  const [reminders, setReminders] = useState<{ [key: string]: string }>({});
  const [dismissedEscalations, setDismissedEscalations] = useState(false);
  const [deals, setDeals] = useState<Array<{ name: string; client: string; amount: string; stage: string; prob: string; owner: string; action: string }>>([]);

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
            {(showDateDropdown || showTeamDropdown || showExportDropdown || showCreateDropdown) && (
              <div
                className="fixed inset-0 z-40 bg-transparent cursor-default"
                onClick={() => {
                  setShowDateDropdown(false);
                  setShowTeamDropdown(false);
                  setShowExportDropdown(false);
                  setShowCreateDropdown(false);
                }}
              />
            )}
            {/* Date Range Selector */}
            <div className="relative z-50">
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
            <div className="relative z-50">
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
            <div className="relative z-50">
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
                <div className="absolute right-0 top-10 w-72 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-50 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <a
                    href="/OPTIVIR_CRM_MASTER_GUIDE.pdf"
                    download="OPTIVIR_CRM_MASTER_GUIDE.pdf"
                    onClick={() => setShowExportDropdown(false)}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2.5 text-[#0B1727] dark:text-white group transition"
                  >
                    <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100">Download Master Tutorial Guide</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Complete 10-page agency operating manual (PDF)</div>
                    </div>
                  </a>

                  <a
                    href="/OPTIVIR_CRM_UI_STRUCTURE.pdf"
                    download="OPTIVIR_CRM_UI_STRUCTURE.pdf"
                    onClick={() => setShowExportDropdown(false)}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2.5 text-[#0B1727] dark:text-white group transition"
                  >
                    <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-950/40 text-[#DC2626]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100">Download Architecture PDF</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Actual 7-page native vector UI architecture</div>
                    </div>
                  </a>

                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      window.print();
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2.5 text-[#0B1727] dark:text-white border-t border-slate-100 dark:border-slate-800 mt-1 pt-2 transition cursor-pointer"
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
            <div className="relative z-50">
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
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] tracking-wider uppercase shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>OPERATIONAL FRICTION</span>
            <span className="bg-white/25 text-white px-1.5 py-0.2 rounded text-[10px]">0 Items</span>
          </div>

          {/* Friction items */}
          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Overdue Tasks</span>
            <span className="font-bold text-slate-600 dark:text-slate-400">0</span>
          </button>

          <button
            onClick={() => onNavigate('finance')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Unpaid Invoices</span>
            <span className="font-bold text-slate-600 dark:text-slate-400">₹0</span>
          </button>

          <button
            onClick={() => onNavigate('leads')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Stale Leads (&gt;24h)</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">0</span>
          </button>

          <button
            onClick={() => onNavigate('proposals')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Pending Proposals</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">0</span>
          </button>

          <button
            onClick={() => onNavigate('projects')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Project At-Risk</span>
            <span className="font-bold text-slate-600 dark:text-slate-400">0</span>
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
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">₹0.00</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +0.0%
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex justify-between text-[11px] text-[#8492A6] mb-1">
                <span>Target: ₹0.00</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">0.0%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#111E34] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0B1727] dark:bg-white h-full rounded-full" style={{ width: '0%' }}></div>
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
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">0</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +0.0%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8492A6] mt-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Quarter Net Additions</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">0 onboarded</span>
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
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">0</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +0.0%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8492A6] mt-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>MQL to SQL</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">0.0% conversion</span>
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
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">0.0%</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +0.0%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8492A6] mt-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Industry Benchmark</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">0.0% baseline</span>
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
                <span>Actuals: <strong className="text-slate-800 dark:text-white">₹0.00</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Subscriptions: <strong className="text-slate-800 dark:text-white">₹0.00</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Services: <strong className="text-slate-800 dark:text-white">₹0.00</strong></span>
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
                  d="M 30 190 L 580 190 Z"
                  fill="url(#revGrad)"
                />

                {/* Actual Baseline Line */}
                <path
                  d="M 30 190 L 580 190"
                  fill="none"
                  stroke="#0B1727"
                  strokeWidth="2"
                  className="dark:stroke-white"
                />

                {/* Data Points */}
                <circle cx="30" cy="190" r="3" fill="#0B1727" className="dark:fill-white" />
                <circle cx="110" cy="190" r="3" fill="#0B1727" className="dark:fill-white" />
                <circle cx="190" cy="190" r="3" fill="#0B1727" className="dark:fill-white" />
                <circle cx="270" cy="190" r="3" fill="#0B1727" className="dark:fill-white" />
                <circle cx="350" cy="190" r="3" fill="#0B1727" className="dark:fill-white" />
                <circle cx="430" cy="190" r="3" fill="#0B1727" className="dark:fill-white" />
                <circle cx="510" cy="190" r="4" fill="#0B1727" stroke="#FFFFFF" strokeWidth="2" className="dark:fill-white" />
                <circle cx="580" cy="190" r="3" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              {/* Tooltip over October point */}
              <div className="absolute top-7 left-[80%] -translate-x-1/2 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] px-3 py-1.5 rounded-lg shadow-xl text-[11px] font-bold text-center pointer-events-none z-10">
                <span>OCTOBER ACTUAL</span>
                <span className="block text-xs font-extrabold">₹0.00 MTD</span>
              </div>
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between items-center text-[11px] text-[#8492A6] px-2 pt-2">
              <span>May (₹0)</span>
              <span>Jun (₹0)</span>
              <span>Jul (₹0)</span>
              <span>Aug (₹0)</span>
              <span>Sep (₹0)</span>
              <span className="font-bold text-[#0B1727] dark:text-white">Oct (₹0)</span>
              <span className="text-blue-600 font-semibold">Nov Forecast (~₹0)</span>
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
                onClick={() => showToast('Lead Ingestion channels are currently clear.', 'info')}
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
              </svg>

              {/* Center Donut Label */}
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">0</span>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-[#8492A6]">
                  Total Leads
                </span>
              </div>
            </div>

            {/* Channels Breakdown List */}
            <div className="space-y-2.5 text-xs mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B1727] dark:bg-white shrink-0"></span>
                  <span className="text-[#0B1727] dark:text-[#F8FAFC] font-medium truncate max-w-[140px]">
                    Organic Search &amp; Web
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">0</span>
                  <span className="text-[#8492A6]">0%</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#111E34] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    0.0% conv
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
                  <span className="font-bold text-slate-800 dark:text-slate-200">0</span>
                  <span className="text-[#8492A6]">0%</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#111E34] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    0.0% conv
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
                  <span className="font-bold text-slate-800 dark:text-slate-200">0</span>
                  <span className="text-[#8492A6]">0%</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#111E34] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    0.0% conv
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
                  <span className="font-bold text-slate-800 dark:text-slate-200">0</span>
                  <span className="text-[#8492A6]">0%</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#111E34] text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    0.0% conv
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
              0 Active Deals • ₹0.00 Pipeline
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mt-4">
          {/* Stage 1: Inbound New */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>1. Inbound New</span>
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">0</span>
              <p className="text-[10px] text-slate-500">Volume count</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-[#0B1727] dark:text-white">₹0</span>
              <span className="block text-[10px] text-slate-400">Avg cycle: 0d</span>
            </div>
          </div>

          {/* Stage 2: Contacted */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>2. Contacted</span>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">0</span>
              <p className="text-[10px] text-slate-500">Active outreach</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-[#0B1727] dark:text-white">₹0</span>
              <span className="block text-[10px] text-slate-400">Avg cycle: 0d</span>
            </div>
          </div>

          {/* Stage 3: Qualified */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>3. Qualified</span>
              <span className="w-2 h-2 rounded-full bg-[#0B1727] dark:bg-white"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">0</span>
              <p className="text-[10px] text-slate-500">Solution fit</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-[#0B1727] dark:text-white">₹0</span>
              <span className="block text-[10px] text-slate-400">Avg cycle: 0d</span>
            </div>
          </div>

          {/* Stage 4: Proposal */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>4. Proposal</span>
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">0</span>
              <span className="block text-[10px] text-slate-500">0 stuck</span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
              <span className="font-bold text-[#0B1727] dark:text-white">₹0</span>
              <span className="block text-[10px] text-slate-400">Normal pipeline</span>
            </div>
          </div>

          {/* Stage 5: Negotiation */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>5. Negotiation</span>
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">0</span>
              <p className="text-[10px] text-slate-500">Procurement legal</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-[#0B1727] dark:text-white">₹0</span>
              <span className="block text-[10px] text-slate-400">Win prob: 0%</span>
            </div>
          </div>

          {/* Stage 6: Closed Won */}
          <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <span>6. Closed Won</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">0</span>
              <p className="text-[10px] text-slate-500">This period</p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-[11px]">
              <span className="font-bold text-[#0B1727] dark:text-white">₹0</span>
              <span className="block text-[10px] text-emerald-600 font-semibold">0 booked</span>
            </div>
          </div>

          {/* Stage 7: Closed Lost */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>7. Closed Lost</span>
              <X className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">0</span>
              <p className="text-[10px] text-slate-500">Disqualified / Lost</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-[#0B1727] dark:text-white">₹0</span>
              <span className="block text-[10px] text-slate-400">No lost deals</span>
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
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-[11px] text-[#5A6A80] dark:text-[#94A3B8]">
                  Real-time organizational timeline
                </p>
              </div>
            </div>

            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <Activity className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
              <p className="text-xs font-medium">No live stream activity recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Events and actions will appear here in real-time</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-[#0B1727] dark:text-[#F8FAFC] hover:text-[#DC2626] flex items-center gap-1 transition"
            >
              <span>View Audit Logs</span>
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

            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <CheckSquare className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
              <p className="text-xs font-medium">No priority tasks scheduled</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Create tasks to track action items and deadlines</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 text-xs">
            <span className="text-[#8492A6]">
              0 of 0 tasks completed
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
                  <span className="px-2 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    Clear
                  </span>
                </div>
                <p className="text-[11px] text-[#5A6A80] dark:text-[#94A3B8]">
                  High-impact blockers requiring executive nudge
                </p>
              </div>
            </div>

            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-emerald-500/60" />
              <p className="text-xs font-medium">No active escalations or blockers</p>
              <p className="text-[11px] text-slate-400 mt-0.5">All operational queues and invoices are running within SLA</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => {
                setDismissedEscalations(true);
                showToast('All escalation queues clear.', 'success');
              }}
              className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition text-center cursor-pointer"
            >
              {dismissedEscalations ? 'Escalations Clear ✓' : 'Queue Status: Optimal'}
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
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹0.00</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">+0.0%</span>
                <span>vs last month (0 active deals)</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Weighted Forecast</span>
                <Target className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹0.00</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">0.0% Conf</span>
                <span>Closing by Oct 31, 2026</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Commercial Win Rate</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">0.0%</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">+0.0%</span>
                <span>Industry benchmark: 0.0%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Avg Sales Velocity</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">0 Days</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">0 Days</span>
                <span>No historical deals closed</span>
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

              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Award className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                <p className="text-xs font-medium">No sales rep quota targets recorded</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Quota performance and closed volume will appear here</p>
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
                  0 In-Flight
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { stage: '1. Discovery & Needs Audit', count: 0, value: '₹0', conv: '0.0%', color: 'bg-slate-500' },
                  { stage: '2. Technical Architecture Scope', count: 0, value: '₹0', conv: '0.0%', color: 'bg-blue-600' },
                  { stage: '3. Commercial Proposal & SOW', count: 0, value: '₹0', conv: '0.0%', color: 'bg-amber-600' },
                  { stage: '4. Legal & Security Review', count: 0, value: '₹0', conv: '0.0%', color: 'bg-purple-600' },
                  { stage: '5. Contract Finalized / Won', count: 0, value: '₹0', conv: '0.0%', color: 'bg-emerald-600' },
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
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <Briefcase className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                        No active commercial deals in motion
                      </td>
                    </tr>
                  ) : (
                    deals.map((d) => (
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
                    ))
                  )}
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
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹0.00</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">0.0% Budget Paced</span>
                <span>Cap: ₹0.00</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Blended CAC</span>
                <Target className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹0.00</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">+0.0%</span>
                <span>CAC Target Met</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Inbound Leads (MQLs)</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">0 MQLs</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">+0.0%</span>
                <span>vs previous cycle</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Attributed Pipeline</span>
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹0.00</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">0.0x ROAS</span>
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
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                      No marketing attribution campaign data recorded
                    </td>
                  </tr>
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
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹0.00</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">+0.0%</span>
                <span>vs target (0 verified receipts)</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">AR Overdue &amp; Aging</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹0.00</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">0 Invoices Overdue</span>
                <span>No active aging receivables</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Operating Runway</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">0 Months</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">₹0.00 Liquid</span>
                <span>ICICI Corporate Reserve</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Delivery Gross Margin</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">0.0%</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">+0.0% YoY</span>
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
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Total: ₹0.00
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { bucket: 'Current (< 30 Days)', amount: '₹0', count: '0 Invoices', pct: '0.0%', status: 'Within SLA', color: 'bg-emerald-500' },
                  { bucket: '31 – 60 Days Aging', amount: '₹0', count: '0 Invoices', pct: '0.0%', status: 'Clear', color: 'bg-blue-500' },
                  { bucket: '61 – 90 Days Aging', amount: '₹0', count: '0 Invoices', pct: '0.0%', status: 'Clear', color: 'bg-amber-500' },
                  { bucket: '90+ Days Critical', amount: '₹0', count: '0 Invoices', pct: '0.0%', status: 'Clear', color: 'bg-rose-600' },
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
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <Receipt className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                        No settled collections or banking inflows recorded
                      </td>
                    </tr>
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
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">0 In-Flight</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">₹0.00 Value</span>
                <span>Avg size: ₹0.00</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">My Quota Progress</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">0% Attained</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">₹0.00 / ₹0.00</span>
                <span>No active quota tier</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Today&apos;s Schedule</span>
                <Calendar className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">0 Engagements</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">0 Client Calls</span>
                <span>Next: None</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Priority Action Tasks</span>
                <CheckSquare className="w-4 h-4 text-[#B91C1C]" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">0 Pending</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">0 Due Today</span>
                <span>All actions resolved</span>
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
                    <span>My Day: Today</span>
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

              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Calendar className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                <p className="text-xs font-medium">No meetings or client reviews scheduled for today</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Your personal agenda is completely clear</p>
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

              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <CheckSquare className="w-7 h-7 mx-auto mb-2 text-emerald-500/60" />
                <p className="text-xs font-medium">All deliverables completed</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending action items currently assigned to you</p>
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
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#0B1727] dark:text-[#CBD5E1]">
          <a
            href="/OPTIVIR_CRM_MASTER_GUIDE.pdf"
            download="OPTIVIR_CRM_MASTER_GUIDE.pdf"
            className="hover:text-[#DC2626] transition cursor-pointer flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>CRM Master Tutorial (PDF)</span>
          </a>
          <span>•</span>
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
