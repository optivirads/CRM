'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  Layers,
  Sparkles,
  Plus,
  X,
  Printer,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Eye,
  MousePointer,
  Users,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Zap,
  Activity,
  Share2,
  Radio,
  Clock,
  Settings2,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export const MarketingView: React.FC = () => {
  // Simulator subviews
  const [simulatorView, setSimulatorView] = useState<
    '1. Marketing Performance Dashboard' |
    '2. Campaign Health & Alerts' |
    '3. Platform Attribution Matrix' |
    '4. Export & Report Generator' |
    '5. Data Sync View'
  >('1. Marketing Performance Dashboard');

  // Filters
  const [dateRange, setDateRange] = useState('This Month');
  const [selectedClient, setSelectedClient] = useState('All Clients (12)');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedServiceLine, setSelectedServiceLine] = useState('All Service Lines');
  const [selectedOwner, setSelectedOwner] = useState('Owner: All Pods');
  const [campaignSearch, setCampaignSearch] = useState('');

  // Modals & Drawers
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeAlertDetail, setActiveAlertDetail] = useState<any>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Campaign Form State
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignClient, setNewCampaignClient] = useState('');
  const [newCampaignPlatform, setNewCampaignPlatform] = useState('Google Ads');
  const [newCampaignBudget, setNewCampaignBudget] = useState('');
  const [newCampaignTargetRoas, setNewCampaignTargetRoas] = useState('4.0x');

  const triggerAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  interface AnomalyAlert {
    id: string;
    severity: string;
    tag: string;
    title: string;
    actions: string[];
    color: string;
    badgeColor: string;
    client: string;
    details: string;
  }

  interface PlatformMetric {
    name: string;
    sub: string;
    icon: string;
    spend: string;
    leads: string;
    conversions: string;
    revenue: string;
    cpl: string;
    cpa: string;
    roas: string;
    share: string;
    status: string;
    statusColor: string;
  }

  interface CampaignItem {
    id: string;
    name: string;
    platform: string;
    client: string;
    pod: string;
    spend: string;
    leads: string;
    conversions: string;
    revenue: string;
    roas: string;
    trend: string;
    status: string;
    statusColor: string;
  }

  const anomalyAlerts: AnomalyAlert[] = [];

  // 10 KPI Cards
  const kpiMetrics = [
    {
      label: 'TOTAL SPEND',
      value: '₹0',
      sub: 'Budget: ₹0 (0% Pacing)',
      status: '⚪ No Active Spend',
      statusColor: 'text-slate-400',
      icon: DollarSign,
      highlight: false
    },
    {
      label: 'IMPRESSIONS',
      value: '0',
      sub: '0 vs previous quarter',
      status: '⚪ Awaiting Data',
      statusColor: 'text-slate-400',
      icon: Eye,
      highlight: false
    },
    {
      label: 'UNIQUE REACH',
      value: '0',
      sub: 'Frequency: 0.00 / user',
      status: '⚪ Awaiting Data',
      statusColor: 'text-slate-400',
      icon: Users,
      highlight: false
    },
    {
      label: 'TOTAL CLICKS',
      value: '0',
      sub: 'Avg CPC: ₹0',
      status: '⚪ Awaiting Data',
      statusColor: 'text-slate-400',
      icon: MousePointer,
      highlight: false
    },
    {
      label: 'CTR (CLICK-THROUGH RATE)',
      value: '0.00%',
      sub: 'Industry Avg: 1.75%',
      status: '⚪ Baseline',
      statusColor: 'text-slate-400',
      icon: Target,
      highlight: false
    },
    {
      label: 'COST PER LEAD (CPL)',
      value: '₹0',
      sub: 'Target ceiling: ₹0',
      status: '⚪ Baseline',
      statusColor: 'text-slate-400',
      icon: ArrowDownRight,
      highlight: false
    },
    {
      label: 'COST PER ACQUISITION (CPA)',
      value: '₹0',
      sub: 'Target ceiling: ₹0',
      status: '⚪ Baseline',
      statusColor: 'text-slate-400',
      icon: ArrowDownRight,
      highlight: false
    },
    {
      label: 'ATTRIBUTED REVENUE',
      value: '₹0',
      sub: 'Net closed from MQLs',
      status: '⚪ Baseline',
      statusColor: 'text-slate-400',
      icon: TrendingUp,
      highlight: false
    },
    {
      label: 'BLENDED ROAS',
      value: '0.00x',
      sub: 'Commercial target: 3.50x',
      status: '⚪ Baseline',
      statusColor: 'text-slate-400',
      icon: Sparkles,
      highlight: false
    },
    {
      label: 'ENGAGEMENT RATE',
      value: '0.00%',
      sub: 'Benchmark floor: 3.8%',
      status: '⚪ Baseline',
      statusColor: 'text-slate-400',
      icon: Activity,
      highlight: false
    }
  ];

  // Omnichannel Platform Financial Matrix Data
  const platformsData: PlatformMetric[] = [];

  // Client Campaign Performance Ledger Data
  const [campaignsList, setCampaignsList] = useState<CampaignItem[]>([]);

  const filteredCampaigns = campaignsList.filter(c =>
    c.name.toLowerCase().includes(campaignSearch.toLowerCase()) ||
    c.client.toLowerCase().includes(campaignSearch.toLowerCase()) ||
    c.platform.toLowerCase().includes(campaignSearch.toLowerCase())
  );

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
              '1. Marketing Performance Dashboard',
              '2. Campaign Health & Alerts',
              '3. Platform Attribution Matrix',
              '4. Export & Report Generator',
              '5. Data Sync View'
            ].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setSimulatorView(v as any);
                  triggerAction(`Switched to ${v}`);
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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ad Intelligence Engine v4.2 Active
          </span>
          <span className="text-slate-600">|</span>
          <span>Live Sync: 4 mins ago</span>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1628] text-white px-4 py-3 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* 1. Header & Navigation Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium mb-1">
            <span className="text-[#DC2626] font-semibold">CRM</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span>Revenue Engine</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#DC2626] font-semibold">Marketing</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">Performance Intelligence</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mt-2">
            <div>
              <h1 className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC] tracking-tight">
                Marketing Performance
              </h1>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-3xl">
                Analyze campaign and channel performance across clients, track cross-channel ROAS, and optimize media spend efficiency.
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Live Ads API Sync: Meta/Google, LinkedIn • FY26 Q3 • 12 Active Client Accounts
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Refreshed: 14:32 IST Today
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                onClick={() => triggerAction('CSV Attribution Export downloaded')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#111E34] text-[#0B1727] dark:text-white text-xs font-semibold border border-[#E2E6EC] dark:border-[#152238] shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#111E34] text-[#0B1727] dark:text-white text-xs font-semibold border border-[#E2E6EC] dark:border-[#152238] shadow-xs transition"
              >
                <FileText className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Generate Report PDF</span>
              </button>

              <button
                onClick={() => setShowNewCampaignModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Campaign Test</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Horizontal Filter Strip */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Date Selector Pills */}
          <div className="flex items-center bg-[#F1F5F9] dark:bg-[#0A101C] p-1 rounded-lg border border-[#E2E6EC] dark:border-[#152238]">
            {['This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'This Year'].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setDateRange(range);
                  triggerAction(`Timeframe changed to ${range}`);
                }}
                className={`px-3 py-1.5 rounded-md font-semibold text-[11px] transition ${
                  dateRange === range
                    ? 'bg-white dark:bg-[#111E34] text-[#0B1727] dark:text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0B1727] dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Select Dropdowns */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedClient}
              onChange={(e) => {
                setSelectedClient(e.target.value);
                triggerAction(`Client filter: ${e.target.value}`);
              }}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] text-[#0B1727] dark:text-white rounded-lg px-3 py-1.5 font-medium text-xs focus:outline-none focus:border-[#B91C1C]"
            >
              <option value="All Clients">All Clients</option>
            </select>

            <select
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                triggerAction(`Platform filter: ${e.target.value}`);
              }}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] text-[#0B1727] dark:text-white rounded-lg px-3 py-1.5 font-medium text-xs focus:outline-none focus:border-[#B91C1C]"
            >
              <option value="All Platforms">All Platforms</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Meta Ads Manager">Meta Ads Manager</option>
              <option value="LinkedIn Campaign Mgr">LinkedIn Campaign Mgr</option>
              <option value="DV360 Programmatic">DV360 Programmatic</option>
            </select>

            <select
              value={selectedServiceLine}
              onChange={(e) => setSelectedServiceLine(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] text-[#0B1727] dark:text-white rounded-lg px-3 py-1.5 font-medium text-xs focus:outline-none focus:border-[#B91C1C]"
            >
              <option value="All Service Lines">All Service Lines</option>
              <option value="Performance Search">Performance Search</option>
              <option value="Social & CAPI">Social & CAPI</option>
              <option value="B2B ABM Funnels">B2B ABM Funnels</option>
            </select>

            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] text-[#0B1727] dark:text-white rounded-lg px-3 py-1.5 font-medium text-xs focus:outline-none focus:border-[#B91C1C]"
            >
              <option value="Owner: All Pods">Owner: All Pods</option>
              <option value="Growth Pod CMM-01">Growth Pod CMM-01</option>
              <option value="Global Growth Wing">Global Growth Wing</option>
              <option value="Falcon Commercial">Falcon Commercial</option>
            </select>

            <button
              onClick={() => {
                setSelectedClient('All Clients (12)');
                setSelectedPlatform('All Platforms');
                setSelectedServiceLine('All Service Lines');
                setSelectedOwner('Owner: All Pods');
                setDateRange('This Month');
                triggerAction('Filters reset to default');
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => triggerAction('Saved View: "Executive ROAS Overview" loaded')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111E34] text-[#0B1727] dark:text-white text-xs font-semibold hover:bg-slate-200 transition"
            >
              <span>Saved Views</span>
            </button>
          </div>
        </div>

        {/* 3. Algorithmic Anomaly Detection & Spend Pacing Alerts (5 Cards) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B1727] dark:text-white">
                Algorithmic Anomaly Detection & Spend Pacing Alerts
              </h2>
            </div>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Automated intelligence triggers requiring action
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {anomalyAlerts.length === 0 ? (
              <div className="col-span-full p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 bg-white dark:bg-[#0B1424]">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <div className="font-semibold text-slate-700 dark:text-slate-300">No active anomaly alerts</div>
                <div className="text-[11px] text-slate-400 mt-0.5">All campaigns are performing within algorithmic thresholds.</div>
              </div>
            ) : (
              anomalyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border ${alert.color} flex flex-col justify-between space-y-3 transition hover:shadow-md cursor-pointer`}
                  onClick={() => setActiveAlertDetail(alert)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase ${alert.badgeColor}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-300">
                        {alert.tag}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold leading-snug line-clamp-3 text-[#0B1727] dark:text-slate-100">
                      {alert.title}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 font-bold">
                      {alert.actions.map((act, i) => (
                        <span
                          key={act}
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerAction(`Triggered: ${act} for ${alert.client}`);
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          {act} {i < alert.actions.length - 1 && '• '}
                        </span>
                      ))}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Executive Marketing Key Performance Indicators (10 Cards) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B1727] dark:text-white">
              Executive Marketing Key Performance Indicators
            </h2>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Benchmark SLA: FY26 Baseline • Omnichannel Blended Attribution
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {kpiMetrics.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    kpi.highlight
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 ring-1 ring-rose-400/30'
                      : 'bg-white dark:bg-[#0B1424] border-[#E2E6EC] dark:border-[#152238] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      {kpi.label}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${kpi.highlight ? 'text-rose-600' : 'text-slate-400'}`} />
                  </div>

                  <div className={`text-2xl font-bold tracking-tight ${
                    kpi.highlight ? 'text-[#DC2626] dark:text-rose-400' : 'text-[#0B1727] dark:text-white'
                  }`}>
                    {kpi.value}
                  </div>

                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 truncate">
                    {kpi.sub}
                  </div>

                  <div className={`text-[10px] font-semibold mt-2 ${kpi.statusColor}`}>
                    {kpi.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Analytical 4-Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Spend vs Attributed Revenue Velocity */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1727] dark:text-white">
                    Spend vs Attributed Revenue Velocity
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Monthly progression comparing capital deployed against closed pipeline revenue (₹ Lakhs)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-[#0A1628] dark:text-slate-300">
                    <span className="w-2.5 h-2.5 bg-[#0A1628] dark:bg-slate-500 rounded-xs"></span>
                    Media Spend
                  </span>
                  <span className="flex items-center gap-1 text-[#DC2626]">
                    <span className="w-2.5 h-0.5 bg-[#DC2626]"></span>
                    Attributed Revenue
                  </span>
                </div>
              </div>

              {/* Chart SVG Canvas */}
              <div className="h-56 mt-4 relative flex items-end justify-between px-3 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                {[
                  { month: 'May 2025', spend: 48, rev: 140, roas: '2.9x' },
                  { month: 'Jun 2025', spend: 52, rev: 170, roas: '3.2x' },
                  { month: 'Jul 2025', spend: 58, rev: 200, roas: '3.4x' },
                  { month: 'Aug 2025', spend: 61, rev: 220, roas: '3.6x' },
                  { month: 'Sep 2025', spend: 64.8, rev: 248, roas: '3.83x' },
                  { month: 'Oct 2025 (Fcst)', spend: 70, rev: 275, roas: '3.92x' }
                ].map((item, idx) => {
                  const spendHeight = (item.spend / 75) * 100;
                  const revTopPercent = 100 - (item.rev / 280) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer px-1">
                      {/* Tooltip */}
                      <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition bg-[#0A1628] text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                        Spend: ₹{item.spend}L • Rev: ₹{(item.rev / 100).toFixed(2)} Cr • ROAS {item.roas}
                      </div>

                      {/* Revenue Dot */}
                      <div
                        className="absolute w-2.5 h-2.5 rounded-full bg-[#DC2626] border-2 border-white dark:border-[#0B1424] shadow-xs z-10"
                        style={{ bottom: `${(item.rev / 290) * 100}%` }}
                      ></div>

                      {/* Bar for Spend */}
                      <div
                        className="w-8 rounded-t bg-[#0A1628] dark:bg-[#1E3A6D] group-hover:bg-[#B91C1C] transition duration-200"
                        style={{ height: `${spendHeight}%` }}
                      ></div>

                      <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8] font-semibold mt-2 truncate max-w-[70px] text-center">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insight Banner */}
            <div className="mt-3 p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  Blended multiplier reached <strong>3.83x</strong> in Sep, with paid media scale driving exponential closed deals.
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                +24.8% Net Gain
              </span>
            </div>
          </div>

          {/* Chart 2: Lead Quality & Qualification Trajectory */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1727] dark:text-white">
                    Lead Quality & Qualification Trajectory
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Tracking Marketing Qualified Leads (MQL) vs Sales Qualified Leads (SQL) over 12 weeks
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-[#2563EB]">
                    <span className="w-2.5 h-0.5 bg-[#2563EB]"></span>
                    MQLs
                  </span>
                  <span className="flex items-center gap-1 text-[#0A1628] dark:text-slate-300">
                    <span className="w-2.5 h-0.5 bg-[#0A1628] dark:bg-slate-400"></span>
                    SQLs (Clients)
                  </span>
                </div>
              </div>

              {/* Trajectory SVG */}
              <div className="h-56 mt-4 relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mqlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#E2E8F0" strokeDasharray="3 3" strokeOpacity="0.5" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#E2E8F0" strokeDasharray="3 3" strokeOpacity="0.5" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#E2E8F0" strokeDasharray="3 3" strokeOpacity="0.5" />

                  {/* MQL curve */}
                  <path
                    d="M 20 135 C 80 130, 150 115, 220 95 C 290 75, 380 50, 480 35"
                    fill="none"
                    stroke="#0A1628"
                    strokeWidth="2.5"
                  />
                  {/* SQL curve */}
                  <path
                    d="M 20 155 C 80 152, 150 142, 220 128 C 290 112, 380 95, 480 72"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                  />

                  {/* Markers */}
                  <circle cx="20" cy="135" r="3.5" fill="#0A1628" />
                  <circle cx="480" cy="35" r="4.5" fill="#0A1628" />
                  <text x="440" y="25" fill="#0A1628" fontSize="10" fontWeight="bold">640 MQL</text>

                  <circle cx="20" cy="155" r="3.5" fill="#2563EB" />
                  <circle cx="480" cy="72" r="4.5" fill="#2563EB" />
                  <text x="440" y="90" fill="#2563EB" fontSize="10" fontWeight="bold">82 SQL</text>
                </svg>
                {/* Week Labels */}
                <div className="absolute bottom-1 w-full flex justify-between px-4 text-[9px] text-[#64748B] font-semibold">
                  <span>W1</span>
                  <span>W3</span>
                  <span>W5</span>
                  <span>W7</span>
                  <span>W9</span>
                  <span>W11</span>
                  <span>W12 (Latest)</span>
                </div>
              </div>
            </div>

            {/* Insight Banner */}
            <div className="mt-3 p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  Conversion velocity rose from <strong>7.4%</strong> in W1 to <strong>12.7%</strong> in W12 after ICP retargeting refinement.
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                +5.3% Conv Efficiency
              </span>
            </div>
          </div>

          {/* Chart 3: Target ROAS vs Blended Acquisition Cost */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1727] dark:text-white">
                    Target ROAS vs Blended Acquisition Cost
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Commercial target floor (3.2x) against actual sanity ROAS delivery
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-[#0A1628] dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#0A1628] dark:bg-slate-400"></span>
                    Actual ROAS
                  </span>
                  <span className="flex items-center gap-1 text-[#DC2626]">
                    <span className="w-2.5 h-0.5 bg-[#DC2626] border border-dashed"></span>
                    3.2x Target Floor
                  </span>
                </div>
              </div>

              {/* ROAS Trend Canvas */}
              <div className="h-56 mt-4 relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                  {/* Floor Line */}
                  <line x1="20" y1="110" x2="480" y2="110" stroke="#DC2626" strokeWidth="2" strokeDasharray="5 5" />
                  <text x="410" y="105" fill="#DC2626" fontSize="10" fontWeight="bold">3.2x Target</text>

                  {/* Actual ROAS Curve */}
                  <path
                    d="M 30 130 Q 120 120 200 95 T 380 60 T 470 42"
                    fill="none"
                    stroke="#0A1628"
                    strokeWidth="3"
                  />

                  {/* Points */}
                  {[
                    { x: 30, y: 130, val: '2.9x' },
                    { x: 120, y: 120, val: '3.1x' },
                    { x: 200, y: 95, val: '3.4x' },
                    { x: 290, y: 80, val: '3.55x' },
                    { x: 380, y: 60, val: '3.72x' },
                    { x: 470, y: 42, val: '3.83x' }
                  ].map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#0A1628" stroke="#FFFFFF" strokeWidth="2" />
                      <text x={p.x - 12} y={p.y - 10} fill="#0A1628" fontSize="10" fontWeight="bold">{p.val}</text>
                    </g>
                  ))}
                </svg>

                <div className="absolute bottom-1 w-full flex justify-between px-6 text-[9px] text-[#64748B] font-semibold">
                  <span>Aug W1</span>
                  <span>Aug W3</span>
                  <span>Sep W1</span>
                  <span>Sep W2</span>
                  <span>Oct W1</span>
                  <span>Oct W3</span>
                </div>
              </div>
            </div>

            {/* Insight Banner */}
            <div className="mt-3 p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  Blended CPA dropped from <strong>₹12,000</strong> to <strong>₹10,588</strong>, creating an overall ₹7.12L media arbitrage advantage.
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                7.12L CAC Savings
              </span>
            </div>
          </div>

          {/* Chart 4: Platform Efficiency & Volume Contribution */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1727] dark:text-white">
                    Platform Efficiency & Volume Contribution
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Attributed ROAS vs Volume Share across Top 4 Media Channels
                  </p>
                </div>
                <button
                  onClick={() => triggerAction('Metrics view toggled: Normalized distribution')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A1628] text-white"
                >
                  Normalized
                </button>
              </div>

              {/* Progress Breakdown Bars */}
              <div className="mt-5 space-y-4">
                {[
                  {
                    name: 'Google Search & PMax',
                    spend: '₹29.1L',
                    roas: '4.24x ROAS',
                    tag: 'Top Efficiency',
                    share: 45,
                    revenue: '₹1.24 Cr Attributed Rev',
                    color: 'bg-blue-600'
                  },
                  {
                    name: 'Meta Ads (FB/IG Reels)',
                    spend: '₹21.7L',
                    roas: '3.89x ROAS',
                    tag: 'High Volume',
                    share: 33,
                    revenue: '₹84.2L Attributed Rev',
                    color: 'bg-indigo-600'
                  },
                  {
                    name: 'LinkedIn Sponsored Content',
                    spend: '₹11.4L',
                    roas: '3.22x ROAS',
                    tag: 'B2B Quality',
                    share: 17,
                    revenue: '₹36.7L Attributed Rev',
                    color: 'bg-sky-600'
                  },
                  {
                    name: 'Programmatic DV360 & CTV',
                    spend: '₹2.6L',
                    roas: '2.84x ROAS',
                    tag: 'Top Funnel Reach',
                    share: 4,
                    revenue: '₹7.4L Attributed Rev',
                    color: 'bg-slate-600'
                  }
                ].map((row, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0B1727] dark:text-white">{row.name}</span>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                          Spend: {row.spend} • <strong className="text-[#0B1727] dark:text-white">{row.roas}</strong> ({row.tag})
                        </span>
                      </div>
                      <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {row.revenue}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                      <div className={`${row.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${row.share}%` }}></div>
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] flex justify-between">
                      <span>{row.share}% of total budget</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Ad Ops Shortcut */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-[#64748B]">
              <span>Need granular bidding adjustment?</span>
              <button
                onClick={() => triggerAction('Opening Bid Strategy Configuration')}
                className="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-1"
              >
                Configure Ad Engine Targets <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 6. Omnichannel Platform Financial Matrix Table */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E6EC] dark:border-[#152238] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B1727] dark:text-white">
                Omnichannel Platform Financial Matrix
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Granular channel economics, concentration, and attribution
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 bg-slate-100 dark:bg-[#111E34] px-2.5 py-1 rounded-md">
              <Filter className="w-3 h-3" /> 5 Platforms Connected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0B1727] dark:text-[#CBD5E1]">
              <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-[#64748B] dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider border-b border-[#E2E6EC] dark:border-[#152238]">
                <tr>
                  <th className="p-3.5">PLATFORM / CHANNEL</th>
                  <th className="p-3.5 text-right">SPEND</th>
                  <th className="p-3.5 text-right">LEADS</th>
                  <th className="p-3.5 text-right">CONVERSIONS</th>
                  <th className="p-3.5 text-right">ATTRIBUTED REVENUE</th>
                  <th className="p-3.5 text-right">CPL</th>
                  <th className="p-3.5 text-right">CPA</th>
                  <th className="p-3.5 text-right">ROAS</th>
                  <th className="p-3.5 text-right">SPEND SHARE</th>
                  <th className="p-3.5 text-center">STATUS / TIER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
                {platformsData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-500">
                      <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                      <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No advertising platform data connected</div>
                      <div className="text-xs text-slate-400 mt-1">Connect Meta, Google Ads, or LinkedIn APIs to view real-time attribution and unit economics.</div>
                    </td>
                  </tr>
                ) : (
                  platformsData.map((plat) => (
                    <tr key={plat.name} className="hover:bg-slate-50/70 dark:hover:bg-[#111E34]/50 transition">
                      <td className="p-3.5 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{plat.icon}</span>
                          <div>
                            <div className="text-slate-900 dark:text-white font-bold">{plat.name}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{plat.sub}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-medium">{plat.spend}</td>
                      <td className="p-3.5 text-right text-slate-600 dark:text-slate-300">{plat.leads}</td>
                      <td className="p-3.5 text-right font-semibold text-slate-900 dark:text-white">{plat.conversions}</td>
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">{plat.revenue}</td>
                      <td className="p-3.5 text-right text-slate-600 dark:text-slate-300">{plat.cpl}</td>
                      <td className="p-3.5 text-right text-slate-600 dark:text-slate-300">{plat.cpa}</td>
                      <td className="p-3.5 text-right font-bold text-[#0B1727] dark:text-emerald-400">{plat.roas}</td>
                      <td className="p-3.5 text-right text-slate-500">{plat.share}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${plat.statusColor}`}>
                          {plat.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Total Blended Portfolio Summary Row */}
              {platformsData.length > 0 && (
                <tfoot className="bg-[#F1F5F9] dark:bg-[#0A101C] font-bold border-t-2 border-[#E2E6EC] dark:border-[#1E293B]">
                  <tr>
                    <td className="p-3.5 text-slate-900 dark:text-white">
                      Total / Blended Portfolio
                    </td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">₹0</td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">0</td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">0</td>
                    <td className="p-3.5 text-right text-[#DC2626] font-extrabold text-sm">₹0</td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">₹0</td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">₹0</td>
                    <td className="p-3.5 text-right text-[#DC2626] font-extrabold">0.00x</td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">0.0%</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300">
                        Baseline
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* 7. Client Campaign Performance Ledger */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E6EC] dark:border-[#152238] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B1727] dark:text-white">
                Client Campaign Performance Ledger
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Active growth experiments, tracking status, and algorithmic pacing health
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter campaigns..."
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] text-xs focus:outline-none focus:border-[#B91C1C]"
                />
              </div>
              <button
                onClick={() => triggerAction('Campaign filter modal opened')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111E34] text-xs font-semibold hover:bg-slate-200 transition"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0B1727] dark:text-[#CBD5E1]">
              <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-[#64748B] dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider border-b border-[#E2E6EC] dark:border-[#152238]">
                <tr>
                  <th className="p-3.5">CAMPAIGN / OBJECTIVE & PLATFORM</th>
                  <th className="p-3.5">CLIENT ENTITY & POD</th>
                  <th className="p-3.5 text-right">SPEND</th>
                  <th className="p-3.5 text-right">LEADS</th>
                  <th className="p-3.5 text-right">CONVERSIONS</th>
                  <th className="p-3.5 text-right">ATTRIBUTED REV</th>
                  <th className="p-3.5 text-right">ROAS</th>
                  <th className="p-3.5 text-center">7D VELOCITY</th>
                  <th className="p-3.5 text-center">HEALTH STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-500">
                      <Target className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                      <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No campaigns found</div>
                      <div className="text-xs text-slate-400 mt-1">Launch a new marketing campaign or sync external ad accounts.</div>
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-[#111E34]/50 transition">
                      <td className="p-3.5 font-bold">
                        <div className="text-[#0B1727] dark:text-white font-bold">{c.name}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{c.platform}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{c.client}</div>
                        <div className="text-[10px] text-slate-400">{c.pod}</div>
                      </td>
                      <td className="p-3.5 text-right font-medium">{c.spend}</td>
                      <td className="p-3.5 text-right text-slate-600 dark:text-slate-300">{c.leads}</td>
                      <td className="p-3.5 text-right font-semibold text-slate-900 dark:text-white">{c.conversions}</td>
                      <td className={`p-3.5 text-right font-bold ${
                        c.trend === 'down-red' ? 'text-[#DC2626]' : 'text-slate-900 dark:text-white'
                      }`}>
                        {c.revenue}
                      </td>
                      <td className={`p-3.5 text-right font-bold ${
                        c.trend === 'down-red' ? 'text-[#DC2626]' : 'text-slate-900 dark:text-white'
                      }`}>
                        {c.roas}
                      </td>
                      <td className="p-3.5 text-center">
                        {/* Mini Sparkline SVG */}
                        <div className="inline-block w-16 h-4">
                          <svg className="w-full h-full" viewBox="0 0 60 16">
                            {c.trend === 'up' && (
                              <path d="M 2 12 L 18 10 L 32 6 L 46 8 L 58 2" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                            )}
                            {c.trend === 'flat' && (
                              <path d="M 2 8 L 18 8 L 32 9 L 46 7 L 58 8" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                            )}
                            {c.trend === 'down-amber' && (
                              <path d="M 2 4 L 18 6 L 32 9 L 46 11 L 58 13" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                            )}
                            {c.trend === 'down-red' && (
                              <path d="M 2 3 L 18 5 L 32 8 L 46 13 L 58 15" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                            )}
                          </svg>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.statusColor}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: Launch Campaign Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#B91C1C]" />
                <h3 className="text-base font-bold text-[#0B1727] dark:text-white">
                  Launch Omni-Channel Campaign Test
                </h3>
              </div>
              <button
                onClick={() => setShowNewCampaignModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerAction(`Campaign "${newCampaignName}" initiated with ₹${newCampaignBudget} budget!`);
                setShowNewCampaignModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[#64748B] dark:text-slate-300 mb-1 font-semibold">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 High-Intent Retargeting CAPI"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] dark:text-slate-300 mb-1 font-semibold">
                    Client Account
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Client Account Name"
                    value={newCampaignClient}
                    onChange={(e) => setNewCampaignClient(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] dark:text-slate-300 mb-1 font-semibold">
                    Target Platform
                  </label>
                  <select
                    value={newCampaignPlatform}
                    onChange={(e) => setNewCampaignPlatform(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white"
                  >
                    <option value="Google Ads">Google Ads (Search & PMax)</option>
                    <option value="Meta Ads Manager">Meta Ads Manager (Reels/CAPI)</option>
                    <option value="LinkedIn Campaign Manager">LinkedIn Campaign Manager</option>
                    <option value="DV360 Programmatic">DV360 Programmatic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] dark:text-slate-300 mb-1 font-semibold">
                    Initial Ad Spend (₹)
                  </label>
                  <input
                    type="text"
                    value={newCampaignBudget}
                    onChange={(e) => setNewCampaignBudget(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] dark:text-slate-300 mb-1 font-semibold">
                    Target ROAS Floor
                  </label>
                  <input
                    type="text"
                    value={newCampaignTargetRoas}
                    onChange={(e) => setNewCampaignTargetRoas(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCampaignModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Alert Detail & Diagnostics */}
      {activeAlertDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase ${activeAlertDetail.badgeColor}`}>
                  {activeAlertDetail.severity}
                </span>
                <span className="text-xs font-bold text-[#0B1727] dark:text-white">
                  {activeAlertDetail.tag} • {activeAlertDetail.client}
                </span>
              </div>
              <button
                onClick={() => setActiveAlertDetail(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeAlertDetail.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-[#0A101C] p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
                {activeAlertDetail.details}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  triggerAction(`Diagnostics report generated for ${activeAlertDetail.client}`);
                  setActiveAlertDetail(null);
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#111E34] text-xs font-semibold hover:bg-slate-200"
              >
                Run Deep Diagnostics
              </button>
              <button
                onClick={() => {
                  triggerAction(`Applied automated optimization rule for ${activeAlertDetail.client}`);
                  setActiveAlertDetail(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold"
              >
                Apply Automated Fix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Generate Report PDF */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-[#DC2626]">
                <FileText className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#0B1727] dark:text-white">
                  Marketing Dossier Generator
                </h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Generate a high-resolution PDF report containing full attribution breakdown, ROAS by client pod, and pacing warnings.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked id="inc-spend" />
                <label htmlFor="inc-spend" className="text-slate-800 dark:text-slate-200">Include Spend vs Attributed Revenue Chart</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked id="inc-anom" />
                <label htmlFor="inc-anom" className="text-slate-800 dark:text-slate-200">Include Algorithmic Anomaly Logs</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked id="inc-pod" />
                <label htmlFor="inc-pod" className="text-slate-800 dark:text-slate-200">Include Client Pod Performance Ledger</label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  triggerAction('Rendering PDF Dossier... Download starting shortly');
                  setShowReportModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
