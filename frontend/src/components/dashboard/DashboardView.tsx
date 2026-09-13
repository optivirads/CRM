'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';
import { useAuth } from '@/lib/auth-context';
import { exportToCsv } from '@/lib/exportCsv';
import { api } from '@/lib/api';
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
  BookOpen,
  Rocket
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onCreateInvoice?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onCreateInvoice }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'short' });
  const currentYear = new Date().getFullYear();
  // 02. DASHBOARD Switcher: 'management' | 'sales' | 'marketing' | 'finance' | 'my'
  const [activeDashboardMode, setActiveDashboardMode] = useState<'management' | 'sales' | 'marketing' | 'finance' | 'my'>('management');

  // My Dashboard stopwatch state
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  // Filter Dropdowns
  const [selectedDateRange, setSelectedDateRange] = useState(`This Month (${currentMonthName} ${currentYear})`);
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

  // Client Onboarding Dashboard State
  const [onboardingAccounts, setOnboardingAccounts] = useState<any[]>([]);
  const [dbClients, setDbClients] = useState<any[]>([]);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onboardingClientName, setOnboardingClientName] = useState('');
  const [onboardingTier, setOnboardingTier] = useState('Enterprise Retainer');
  const [onboardingValue, setOnboardingValue] = useState('₹1,00,000 / mo');
  const [onboardingLeadPM, setOnboardingLeadPM] = useState('Elena Rostova');

  // Live PostgreSQL Dashboard Stats
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingStats(true);
        const [statsRes, dealsRes, clientsRes] = await Promise.all([
          api.getDashboardStats().catch(() => ({ success: false, data: null })),
          api.getDeals().catch(() => ({ success: false, data: [] })),
          api.getClients().catch(() => ({ success: false, data: [] }))
        ]);

        if (statsRes?.data) {
          setStats(statsRes.data);
        }

        if (dealsRes?.data && Array.isArray(dealsRes.data)) {
          setDeals(dealsRes.data.map((d: any) => ({
            name: d.name,
            client: d.company_name || 'Direct Client',
            amount: `₹${Number(d.value || 0).toLocaleString('en-IN')}`,
            stage: d.stage_name || d.stage || 'Pipeline Lead',
            prob: `${d.probability || 50}%`,
            owner: 'OptiVir Admin',
            action: 'Send Follow-up'
          })));
        }

        if (clientsRes?.data && Array.isArray(clientsRes.data)) {
          setDbClients(clientsRes.data);
          if (clientsRes.data.length > 0 && !onboardingClientName) {
            setOnboardingClientName(clientsRes.data[0].company_name || clientsRes.data[0].name || '');
          }

          // Load existing onboarding accounts from localStorage
          let savedAccounts: any[] = [];
          if (typeof window !== 'undefined') {
            try {
              const saved = localStorage.getItem('optivir_onboarding_accounts');
              if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  savedAccounts = parsed.filter((a: any) => !['onb-1', 'onb-2', 'onb-3'].includes(a.id));
                }
              }
            } catch {}
          }

          // Merge database clients into onboarding list
          const existingNames = new Set(savedAccounts.map((a: any) => a.name?.toLowerCase()));
          const autoCandidates: any[] = [];
          for (const c of clientsRes.data) {
            const cName = c.company_name || c.name;
            if (cName && !existingNames.has(cName.toLowerCase())) {
              autoCandidates.push({
                id: c.id,
                name: cName,
                avatarText: cName.slice(0, 2).toUpperCase(),
                contractTier: c.billing_frequency ? `${c.billing_frequency.toUpperCase()} Retainer` : 'Enterprise Retainer',
                contractValue: c.contract_value ? `₹${Number(c.contract_value).toLocaleString('en-IN')} / mo` : '₹1,00,000 / mo',
                am: c.am_first ? `${c.am_first} ${c.am_last || ''}`.trim() : 'OptiVir Admin',
                pm: 'Elena Rostova',
                currentStage: c.status === 'Onboarding' ? 'Sales Handoff & Intake' : (c.onboarding_progress > 0 ? 'Technical Setup & CAPI' : 'Kickoff & Asset Collection'),
                stageIndex: c.onboarding_progress >= 100 ? 4 : (c.onboarding_progress >= 75 ? 3 : (c.onboarding_progress >= 40 ? 2 : (c.onboarding_progress > 0 ? 1 : 0))),
                completedSteps: Math.max(3, Math.round(((c.onboarding_progress || 12) / 100) * 24)),
                totalSteps: 24,
                daysInOnboarding: 1,
                totalDaysTarget: 14,
                hasBlocker: c.health_status === 'At Risk',
                status: c.status || 'Active'
              });
            }
          }

          const mergedOnboarding = [...savedAccounts, ...autoCandidates];
          setOnboardingAccounts(mergedOnboarding);
          if (autoCandidates.length > 0 && typeof window !== 'undefined') {
            try {
              localStorage.setItem('optivir_onboarding_accounts', JSON.stringify(mergedOnboarding));
            } catch {}
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLaunchOnboarding = (accountOrClient: any) => {
    const accId = accountOrClient.id;
    const accName = accountOrClient.name || accountOrClient.company_name || 'Client';
    if (typeof window !== 'undefined') {
      localStorage.setItem('optivir_selected_onboarding_id', accId);
    }
    showToast(`Opening 24-Step Onboarding Engine for ${accName}...`, 'success');
    onNavigate('onboarding');
  };

  const handleCreateOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingClientName.trim()) {
      showToast('Please select or enter client name', 'error');
      return;
    }
    const trimmed = onboardingClientName.trim();
    const matched = dbClients.find(c => (c.company_name || c.name)?.toLowerCase() === trimmed.toLowerCase());
    const newAcc = {
      id: matched?.id || `onb-${Date.now()}`,
      name: trimmed,
      avatarText: trimmed.slice(0, 2).toUpperCase(),
      contractTier: onboardingTier,
      contractValue: onboardingValue,
      am: 'OptiVir Admin',
      pm: onboardingLeadPM,
      currentStage: 'Sales Handoff & Intake',
      stageIndex: 0,
      completedSteps: 3,
      totalSteps: 24,
      daysInOnboarding: 1,
      totalDaysTarget: 14,
      hasBlocker: false,
      primaryContact: {
        name: 'Managing Director',
        role: 'Client Leadership',
        email: `contact@${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      }
    };

    const updated = [newAcc, ...onboardingAccounts.filter((a: any) => a.name.toLowerCase() !== trimmed.toLowerCase())];
    setOnboardingAccounts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('optivir_onboarding_accounts', JSON.stringify(updated));
      localStorage.setItem('optivir_selected_onboarding_id', newAcc.id);
    }
    setShowOnboardingModal(false);
    showToast(`Onboarding initialized for ${trimmed}!`, 'success');
    onNavigate('onboarding');
  };

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

  // Computed live metrics from PostgreSQL
  const overdueTasksCount = Number(stats?.projects?.overdue_tasks || 0);
  const unpaidInvoicesAmount = Number(stats?.finance?.outstanding_receivables || 0);
  const staleLeadsCount = Array.isArray(stats?.actionCenter?.urgentFollowups) ? stats.actionCenter.urgentFollowups.length : 0;
  const pendingProposalsCount = Number(stats?.sales?.active_deals || 0);
  const projectsAtRiskCount = Number(stats?.clients?.clients_at_risk || 0);
  const totalFrictionItems = overdueTasksCount + (unpaidInvoicesAmount > 0 ? 1 : 0) + staleLeadsCount + projectsAtRiskCount;

  const totalRevenue = Number(stats?.finance?.total_collected || stats?.clients?.total_annual_contract_value || 0);
  const targetRevenue = Math.max(totalRevenue, Number(stats?.clients?.total_annual_contract_value || 100000));
  const activeClientsCount = Number(stats?.clients?.active_clients ?? stats?.clients?.total_clients ?? 0);
  const newLeadsCount = Number(stats?.sales?.total_leads || 0);
  const wonDealsCount = Number(stats?.sales?.won_deals || 0);
  const winVelocityRate = newLeadsCount > 0 ? Math.round((wonDealsCount / newLeadsCount) * 100) : 0;

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
                  {(() => {
                    const hour = new Date().getHours();
                    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
                    const name = user?.firstName || (user?.email ? user.email.split('@')[0] : 'Admin');
                    return `${greeting}, ${name}`;
                  })()}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#111E34] border border-[#E2E6EC] dark:border-[#152238] text-[10px] font-bold text-[#5A6A80] dark:text-[#94A3B8] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Command Mode
                </span>
              </div>
              <p className="text-xs text-[#5A6A80] dark:text-[#94A3B8] mt-0.5">
                Here is your consolidated operational trajectory for today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
              </p>
            </div>
          </div>

          {/* Right Action Controls: Date, Team, Export, + Create */}
          <div className="flex flex-wrap items-center gap-2.5 relative">
            {(showDateDropdown || showTeamDropdown || showExportDropdown || showCreateDropdown) && (
              <div
                className="fixed inset-0 z-20 bg-transparent cursor-default"
                onClick={() => {
                  setShowDateDropdown(false);
                  setShowTeamDropdown(false);
                  setShowExportDropdown(false);
                  setShowCreateDropdown(false);
                }}
              />
            )}
            {/* Date Range Selector */}
            <div className="relative z-20">
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
                <div className="absolute left-0 top-10 w-64 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-30 p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {[
                    `This Month (${currentMonthName} ${currentYear})`,
                    'Previous Month',
                    `Current Quarter (${currentYear})`,
                    `Year to Date (${currentYear})`
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
            <div className="relative z-20">
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
                <div className="absolute left-0 top-10 w-44 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-30 p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
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
            <div className="relative z-20">
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
                <ChevronDown className="w-3.5 h-3.5 text-[#5A6A80] ml-0.5" />
              </button>

              {showExportDropdown && (
                <div className="absolute right-0 top-10 w-72 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-30 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <a
                    href="/OPTIVIR_CRM_MASTER_GUIDE.pdf"
                    download="OPTIVIR_CRM_MASTER_GUIDE.pdf"
                    onClick={() => setShowExportDropdown(false)}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2.5 text-[#0B1727] dark:text-white group transition"
                  >
                    <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>Download Master Architecture PDF</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="text-[10px] text-slate-500">12-page comprehensive enterprise spec</div>
                    </div>
                  </a>
                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      onNavigate('reports');
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2.5 text-[#0B1727] dark:text-white group transition"
                  >
                    <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold">Export QBR Dossier</div>
                      <div className="text-[10px] text-slate-500">Generate executive business review dossier</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      window.print();
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2.5 text-[#0B1727] dark:text-white group transition"
                  >
                    <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600">
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
            <div className="relative z-20">
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
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-30 p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
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
                      onNavigate('proposals');
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>New Proposal</span>
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
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setShowOnboardingModal(true);
                    }}
                    className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white cursor-pointer"
                  >
                    <Rocket className="w-3.5 h-3.5 text-rose-600" />
                    <span>Start Onboarding</span>
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
            <span className="bg-white/25 text-white px-1.5 py-0.2 rounded text-[10px]">{totalFrictionItems} Items</span>
          </div>

          {/* Friction items */}
          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className={`w-2 h-2 rounded-full ${overdueTasksCount > 0 ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
            <span>Overdue Tasks</span>
            <span className="font-bold text-slate-600 dark:text-slate-400">{overdueTasksCount}</span>
          </button>

          <button
            onClick={() => onNavigate('finance')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className={`w-2 h-2 rounded-full ${unpaidInvoicesAmount > 0 ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
            <span>Unpaid Invoices</span>
            <span className="font-bold text-slate-600 dark:text-slate-400">₹{unpaidInvoicesAmount.toLocaleString('en-IN')}</span>
          </button>

          <button
            onClick={() => onNavigate('leads')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className={`w-2 h-2 rounded-full ${staleLeadsCount > 0 ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
            <span>Stale Leads (&gt;24h)</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{staleLeadsCount}</span>
          </button>

          <button
            onClick={() => onNavigate('proposals')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Pending Proposals</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{pendingProposalsCount}</span>
          </button>

          <button
            onClick={() => onNavigate('projects')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-[#16253C] text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition"
          >
            <span className={`w-2 h-2 rounded-full ${projectsAtRiskCount > 0 ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
            <span>Project At-Risk</span>
            <span className="font-bold text-slate-600 dark:text-slate-400">{projectsAtRiskCount}</span>
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
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">₹{totalRevenue.toLocaleString('en-IN')}</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex justify-between text-[11px] text-[#8492A6] mb-1">
                <span>Target: ₹{targetRevenue.toLocaleString('en-IN')}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {targetRevenue > 0 ? Math.min(100, Math.round((totalRevenue / targetRevenue) * 100)) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#111E34] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#0B1727] dark:bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${targetRevenue > 0 ? Math.min(100, Math.round((totalRevenue / targetRevenue) * 100)) : 0}%` }}
                ></div>
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
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">{activeClientsCount}</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8492A6] mt-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <Rocket className="w-3 h-3 text-[#B91C1C]" />
                <span>Onboarding Starting</span>
              </span>
              <button
                onClick={() => onNavigate('onboarding')}
                className="font-semibold text-slate-800 dark:text-slate-200 hover:text-[#B91C1C] dark:hover:text-rose-400 transition cursor-pointer"
              >
                {onboardingAccounts.length > 0 ? `${onboardingAccounts.length} active in suite →` : `${activeClientsCount} onboarded`}
              </button>
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
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">{newLeadsCount}</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8492A6] mt-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>MQL to SQL</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {newLeadsCount > 0 ? 'Active pipeline' : '0.0% conversion'}
              </span>
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
              <span className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC]">{winVelocityRate}%</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Live
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8492A6] mt-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Won Deals</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{wonDealsCount} closed</span>
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
                <span>CURRENT MONTH ACTUAL</span>
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
      {/* 5B. CLIENT ONBOARDING STARTING & HANDOFF ENGINE                           */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#B91C1C] dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/60 shrink-0 shadow-2xs">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC]">
                  Client Onboarding Starting &amp; Handoff Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-[#B91C1C] dark:text-rose-300 text-[10px] font-bold">
                  24-Step Blueprint
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#111E34] text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                  {onboardingAccounts.length} Active {onboardingAccounts.length === 1 ? 'Account' : 'Accounts'}
                </span>
              </div>
              <p className="text-[11px] text-[#5A6A80] dark:text-[#94A3B8]">
                Closed-won deal transitions, asset intake, Meta/Google CAPI verification, and SLA pacing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Client Onboarding</span>
            </button>
            <button
              onClick={() => onNavigate('onboarding')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#111E34] hover:bg-slate-100 dark:hover:bg-[#16253C] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <span>Open Suite</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Phases Milestone Quick Progress Bar Guide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-1">
          {[
            { phase: 'Phase 1', title: 'Sales Handoff & Intake', steps: 'Steps 1–6', active: true, color: 'border-rose-500/80 bg-rose-50/40 dark:bg-rose-950/20' },
            { phase: 'Phase 2', title: 'Asset & Credential Vault', steps: 'Steps 7–12', active: false, color: 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0A101C]' },
            { phase: 'Phase 3', title: 'CAPI & Tracking Setup', steps: 'Steps 13–18', active: false, color: 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0A101C]' },
            { phase: 'Phase 4', title: 'SOW Go-Live & Sprint', steps: 'Steps 19–24', active: false, color: 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0A101C]' },
          ].map((step, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border ${step.color} flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{step.phase}</span>
                <span className="text-[10px] text-slate-400 font-mono">{step.steps}</span>
              </div>
              <div className="font-semibold text-xs text-slate-900 dark:text-white mt-1">
                {step.title}
              </div>
            </div>
          ))}
        </div>

        {/* Active Onboarding Client Cards List */}
        <div className="mt-4 space-y-3">
          {onboardingAccounts.length > 0 ? (
            onboardingAccounts.map((acc: any) => {
              const progressPct = Math.min(100, Math.round(((acc.completedSteps || 3) / (acc.totalSteps || 24)) * 100));
              return (
                <div
                  key={acc.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0A101C] hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-[260px]">
                    <div className="w-10 h-10 rounded-xl bg-[#B91C1C] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {acc.avatarText || (acc.name || 'CL').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {acc.name}
                        </span>
                        <span className="px-2 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                          Starting Onboarding
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{acc.contractTier || 'Enterprise Retainer'}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{acc.contractValue || '₹1,00,000 / mo'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stage & Progress */}
                  <div className="flex-1 max-w-md w-full">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#B91C1C]" />
                        <span>{acc.currentStage || 'Phase 1: Sales Handoff & Intake'}</span>
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        {acc.completedSteps || 3} of 24 Steps ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#B91C1C] h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Team & SLA */}
                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <div className="hidden sm:block text-right">
                      <div className="text-[11px] text-slate-400">Target SLA</div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>14 Days (On Track)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchOnboarding(acc)}
                      className="px-3.5 py-2 rounded-lg bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] hover:bg-[#15243B] dark:hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>Launch 24-Step Blueprint</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-[#0A101C]">
              <Rocket className="w-8 h-8 mx-auto mb-2 text-rose-500/60" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No client onboarding starting currently</p>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                When a deal closes or a new client is signed, launch the 24-step onboarding engine to coordinate handoffs.
              </p>
              {dbClients.length > 0 && (
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs text-slate-500">Quick start:</span>
                  {dbClients.slice(0, 3).map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => handleLaunchOnboarding(c)}
                      className="px-3 py-1.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-semibold cursor-pointer transition shadow-xs"
                    >
                      Start Onboarding for {c.company_name || c.name} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
                <span>Active pipeline target</span>
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
      {/* 5. MY DASHBOARD MODE (Personal Cockpit)                                   */}
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

      {/* Quick Start Client Onboarding Modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[#B91C1C] dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/60">
                  <Rocket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Start Client Onboarding Engine
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Initialize the 24-step agency kickoff blueprint for an account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOnboardingModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOnboardingSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Client Company *
                </label>
                {dbClients.length > 0 ? (
                  <select
                    value={onboardingClientName}
                    onChange={(e) => setOnboardingClientName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-[#080E18] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="" disabled>Select client account...</option>
                    {dbClients.map((c: any) => {
                      const name = c.company_name || c.name;
                      return (
                        <option key={c.id} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={onboardingClientName}
                    onChange={(e) => setOnboardingClientName(e.target.value)}
                    placeholder="e.g. Hijabi Ladies Beauty Salon"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-[#080E18] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Service Retainer Tier
                  </label>
                  <select
                    value={onboardingTier}
                    onChange={(e) => setOnboardingTier(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-[#080E18] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option>Enterprise Retainer</option>
                    <option>Omnichannel Growth Retainer</option>
                    <option>Performance Marketing SOW</option>
                    <option>Creative Studio &amp; UGC Production</option>
                    <option>Meta + Google CAPI Tracking</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Contract Value / mo (₹)
                  </label>
                  <input
                    type="text"
                    value={onboardingValue}
                    onChange={(e) => setOnboardingValue(e.target.value)}
                    placeholder="e.g. ₹1,00,000 / mo"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-[#080E18] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Lead PM Assigned
                  </label>
                  <select
                    value={onboardingLeadPM}
                    onChange={(e) => setOnboardingLeadPM(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-[#080E18] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option>Elena Rostova</option>
                    <option>Alex Morgan</option>
                    <option>OptiVir Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Target SLA
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="14 Calendar Days"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>24-Step Lifecycle Automation</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Initializes Sales Handoff, Credential Vault setup, Pixel CAPI event tracking, and SOW kickoff.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOnboardingModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Launch 24-Step Blueprint</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
