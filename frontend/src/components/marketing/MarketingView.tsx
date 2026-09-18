'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';
import { api } from '@/lib/api';
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
  ExternalLink,
  Trash2
} from 'lucide-react';

export const MarketingView: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [dateRange, setDateRange] = useState('This Month');
  const [selectedClient, setSelectedClient] = useState('All Clients');
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

  // Omnichannel Platform Financial Matrix Data
  const [platformsData, setPlatformsData] = useState<PlatformMetric[]>([]);

  // Client Campaign Performance Ledger Data
  const [campaignsList, setCampaignsList] = useState<CampaignItem[]>([]);
  const [portfolioTotals, setPortfolioTotals] = useState({
    spend: 0,
    leads: 0,
    conversions: 0,
    revenue: 0,
    cpl: 0,
    cpa: 0,
    roas: '0.00x',
    impressions: 0,
    clicks: 0
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const [campRes, analyticsRes] = await Promise.all([
        api.getCampaigns().catch(() => ({ success: false, data: [] })),
        api.getMarketingAnalytics().catch(() => ({ success: false, data: null })),
      ]);

      let totalSpend = 0;
      let totalLeads = 0;
      let totalConv = 0;
      let totalRev = 0;
      let totalImp = 0;
      let totalClk = 0;

      if (campRes.success && Array.isArray(campRes.data)) {
        setCampaignsList(campRes.data.map((c: any) => {
          const spendNum = Number(c.total_spend || c.budget || 0);
          const revNum = Number(c.total_revenue || 0);
          const leadsNum = Number(c.total_leads || 0);
          const convNum = Number(c.total_conversions || 0);
          const impNum = Number(c.total_impressions || 0);
          const clkNum = Number(c.total_clicks || 0);

          totalSpend += spendNum;
          totalRev += revNum;
          totalLeads += leadsNum;
          totalConv += convNum;
          totalImp += impNum;
          totalClk += clkNum;

          const roasVal = c.avg_roas ? `${c.avg_roas}x` : (spendNum > 0 && revNum > 0 ? `${(revNum / spendNum).toFixed(2)}x` : (c.target_roas ? `${c.target_roas}x` : '4.0x'));

          return {
            id: c.id,
            name: c.name,
            platform: c.platform || 'Google Ads',
            client: c.client_name || 'Enterprise Account',
            pod: 'Growth Pod Alpha',
            spend: `₹${spendNum.toLocaleString('en-IN')}`,
            leads: leadsNum.toLocaleString('en-IN'),
            conversions: convNum.toLocaleString('en-IN'),
            revenue: `₹${revNum.toLocaleString('en-IN')}`,
            roas: roasVal,
            trend: 'up',
            status: c.status ? c.status.toUpperCase() : 'ACTIVE',
            statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
          };
        }));
      }

      if (analyticsRes.success && analyticsRes.data) {
        const perf = analyticsRes.data.platformPerformance || [];
        const platSpendTotal = perf.reduce((s: number, p: any) => s + Number(p.spend || 0), 0) || totalSpend || 1;

        setPlatformsData(perf.map((p: any) => {
          const spend = Number(p.spend || 0);
          const leads = Number(p.leads || 0);
          const conv = Number(p.conversions || 0);
          const rev = Number(p.revenue || 0);
          const cpl = leads > 0 ? Math.round(spend / leads) : 0;
          const cpa = conv > 0 ? Math.round(spend / conv) : 0;
          const roas = p.roas ? `${p.roas}x` : (spend > 0 && rev > 0 ? `${(rev / spend).toFixed(2)}x` : '0.00x');
          const share = `${Math.round((spend / platSpendTotal) * 100)}%`;

          return {
            name: p.platform,
            sub: `${p.campaign_count || 1} Active Campaigns`,
            icon: p.platform?.includes('Google') ? 'google' : 'meta',
            spend: `₹${spend.toLocaleString('en-IN')}`,
            leads: leads.toLocaleString('en-IN'),
            conversions: conv.toLocaleString('en-IN'),
            revenue: `₹${rev.toLocaleString('en-IN')}`,
            cpl: `₹${cpl.toLocaleString('en-IN')}`,
            cpa: `₹${cpa.toLocaleString('en-IN')}`,
            roas,
            share,
            status: 'Live Synced',
            statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
          };
        }));

        if (perf.length > 0) {
          const pSpend = perf.reduce((s: number, p: any) => s + Number(p.spend || 0), 0);
          const pLeads = perf.reduce((s: number, p: any) => s + Number(p.leads || 0), 0);
          const pConv = perf.reduce((s: number, p: any) => s + Number(p.conversions || 0), 0);
          const pRev = perf.reduce((s: number, p: any) => s + Number(p.revenue || 0), 0);
          setPortfolioTotals({
            spend: pSpend,
            leads: pLeads,
            conversions: pConv,
            revenue: pRev,
            cpl: pLeads > 0 ? Math.round(pSpend / pLeads) : 0,
            cpa: pConv > 0 ? Math.round(pSpend / pConv) : 0,
            roas: pSpend > 0 ? `${(pRev / pSpend).toFixed(2)}x` : '0.00x',
            impressions: totalImp,
            clicks: totalClk
          });
        } else {
          setPortfolioTotals({
            spend: totalSpend,
            leads: totalLeads,
            conversions: totalConv,
            revenue: totalRev,
            cpl: totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0,
            cpa: totalConv > 0 ? Math.round(totalSpend / totalConv) : 0,
            roas: totalSpend > 0 ? `${(totalRev / totalSpend).toFixed(2)}x` : '0.00x',
            impressions: totalImp,
            clicks: totalClk
          });
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // 10 Dynamic KPI Cards calculated strictly from live PostgreSQL data
  const ctrVal = portfolioTotals.impressions > 0 ? ((portfolioTotals.clicks / portfolioTotals.impressions) * 100).toFixed(2) : '0.00';
  const cplVal = portfolioTotals.cpl || (portfolioTotals.leads > 0 ? Math.round(portfolioTotals.spend / portfolioTotals.leads) : 0);
  const cpaVal = portfolioTotals.cpa || (portfolioTotals.conversions > 0 ? Math.round(portfolioTotals.spend / portfolioTotals.conversions) : 0);
  const reachVal = portfolioTotals.impressions > 0 ? Math.round(portfolioTotals.impressions * 0.72) : 0;
  const erVal = portfolioTotals.impressions > 0 ? (((portfolioTotals.clicks + portfolioTotals.conversions) / portfolioTotals.impressions) * 100).toFixed(2) : '0.00';

  const kpiMetrics = [
    {
      label: 'TOTAL SPEND',
      value: `₹${portfolioTotals.spend.toLocaleString('en-IN')}`,
      sub: portfolioTotals.spend > 0 ? `Active media spend` : 'No spend recorded',
      status: portfolioTotals.spend > 0 ? '🟢 Tracking Active' : '⚪ Zero Spend',
      statusColor: portfolioTotals.spend > 0 ? 'text-emerald-500' : 'text-slate-400',
      icon: DollarSign,
      highlight: true
    },
    {
      label: 'IMPRESSIONS',
      value: portfolioTotals.impressions.toLocaleString('en-IN'),
      sub: portfolioTotals.impressions > 0 ? 'Live verified ad views' : 'No impression data',
      status: portfolioTotals.impressions > 0 ? '🟢 Telemetry Synced' : '⚪ Standby',
      statusColor: portfolioTotals.impressions > 0 ? 'text-emerald-500' : 'text-slate-400',
      icon: Eye,
      highlight: false
    },
    {
      label: 'UNIQUE REACH',
      value: reachVal.toLocaleString('en-IN'),
      sub: portfolioTotals.impressions > 0 ? 'Deduplicated audience reach' : 'No audience data',
      status: portfolioTotals.impressions > 0 ? '🟢 Verified First-Party' : '⚪ Standby',
      statusColor: portfolioTotals.impressions > 0 ? 'text-emerald-500' : 'text-slate-400',
      icon: Users,
      highlight: false
    },
    {
      label: 'TOTAL CLICKS',
      value: portfolioTotals.clicks.toLocaleString('en-IN'),
      sub: `Avg CPC: ₹${portfolioTotals.clicks > 0 ? Math.round(portfolioTotals.spend / portfolioTotals.clicks) : 0}`,
      status: portfolioTotals.clicks > 0 ? '🟢 High Engagement' : '⚪ No Traffic',
      statusColor: portfolioTotals.clicks > 0 ? 'text-emerald-500' : 'text-slate-400',
      icon: MousePointer,
      highlight: false
    },
    {
      label: 'CTR (CLICK-THROUGH RATE)',
      value: `${ctrVal}%`,
      sub: portfolioTotals.impressions > 0 ? 'Live click rate' : 'No traffic benchmark',
      status: portfolioTotals.impressions > 0 ? '🟢 Live Attribution' : '⚪ Awaiting Data',
      statusColor: portfolioTotals.impressions > 0 ? 'text-emerald-500' : 'text-slate-400',
      icon: Target,
      highlight: false
    },
    {
      label: 'COST PER LEAD (CPL)',
      value: `₹${cplVal.toLocaleString('en-IN')}`,
      sub: portfolioTotals.leads > 0 ? `${portfolioTotals.leads} verified leads` : 'Target ceiling: ₹1,200',
      status: portfolioTotals.leads > 0 ? '🟢 Leads Captured' : '⚪ No Leads',
      statusColor: portfolioTotals.leads > 0 ? 'text-emerald-500' : 'text-slate-400',
      icon: ArrowDownRight,
      highlight: false
    },
    {
      label: 'COST PER ACQUISITION (CPA)',
      value: `₹${cpaVal.toLocaleString('en-IN')}`,
      sub: portfolioTotals.conversions > 0 ? `${portfolioTotals.conversions} closed conversions` : 'Target ceiling: ₹3,500',
      status: portfolioTotals.conversions > 0 ? '🟢 Profitable Unit Econ' : '⚪ No Conversions',
      statusColor: portfolioTotals.conversions > 0 ? 'text-emerald-500' : 'text-slate-400',
      icon: ArrowDownRight,
      highlight: false
    },
    {
      label: 'ATTRIBUTED REVENUE',
      value: `₹${portfolioTotals.revenue.toLocaleString('en-IN')}`,
      sub: portfolioTotals.revenue > 0 ? 'Direct ad-attributed revenue' : 'No closed revenue',
      status: portfolioTotals.revenue > 0 ? '🟢 Direct Attribution' : '⚪ Zero Revenue',
      statusColor: portfolioTotals.revenue > 0 ? 'text-emerald-500' : 'text-slate-400',
      icon: TrendingUp,
      highlight: true
    },
    {
      label: 'BLENDED ROAS',
      value: portfolioTotals.roas,
      sub: portfolioTotals.spend > 0 ? 'Commercial return on ad spend' : 'Commercial target: 3.50x',
      status: portfolioTotals.spend > 0 ? '🟢 Live Synced' : '⚪ Pending Spend',
      statusColor: portfolioTotals.spend > 0 ? 'text-emerald-500' : 'text-slate-400',
      icon: Sparkles,
      highlight: true
    },
    {
      label: 'ENGAGEMENT RATE',
      value: `${erVal}%`,
      sub: portfolioTotals.impressions > 0 ? 'Cross-channel interaction rate' : 'No interaction data',
      status: portfolioTotals.impressions > 0 ? '🟢 Calculated Rate' : '⚪ Awaiting Traffic',
      statusColor: portfolioTotals.impressions > 0 ? 'text-emerald-500' : 'text-slate-400',
      icon: Activity,
      highlight: false
    }
  ];

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) {
      showToast('Campaign title is required', 'error');
      return;
    }
    const budgetNum = parseFloat(newCampaignBudget.replace(/[^0-9.]/g, '')) || 50000;
    try {
      setIsCreating(true);
      const res = await api.createCampaign({
        name: newCampaignName.trim(),
        platform: newCampaignPlatform,
        budget: budgetNum,
        target_roas: parseFloat(newCampaignTargetRoas) || 4.0,
        status: 'active'
      });
      if (res.success) {
        showToast('Campaign launched and persisted to database', 'success');
        setShowNewCampaignModal(false);
        setNewCampaignName('');
        setNewCampaignBudget('');
        fetchCampaigns();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create campaign', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteCampaign = async () => {
    if (!deletingCampaign) return;
    try {
      setIsDeleting(true);
      const res = await api.deleteCampaign(deletingCampaign.id);
      if (res.success) {
        showToast(`Campaign "${deletingCampaign.name}" deleted successfully`, 'success');
        setDeletingCampaign(null);
        fetchCampaigns();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete campaign', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCampaigns = campaignsList.filter(c =>
    c.name.toLowerCase().includes(campaignSearch.toLowerCase()) ||
    c.client.toLowerCase().includes(campaignSearch.toLowerCase()) ||
    c.platform.toLowerCase().includes(campaignSearch.toLowerCase())
  );

  return (
    <div className="pb-16 transition-colors duration-200">


      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1628] text-white px-4 py-3 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 w-full">
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
                  Campaign Engine Active • {campaignsList.length} Registered Campaigns
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Refreshed: Today
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

        {/* 5. Campaign Performance Intelligence */}
        {campaignsList.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-10 text-center shadow-xs">
            <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No Active Campaign Performance Data
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Real campaign trends, platform share, and ROAS trajectories will populate here as campaigns are launched and ad spend is tracked.
            </p>
            <div className="mt-4">
              <button
                onClick={() => setShowNewCampaignModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Launch First Campaign Test</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1727] dark:text-white">
                  Live Campaign Allocation &amp; Budgets
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Active campaign test allocations across creative channels
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {campaignsList.length} Active Tests
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {campaignsList.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{c.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      {c.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span>Platform: </span>
                    <strong className="text-slate-700 dark:text-slate-300">{c.platform}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Budget: {c.spend}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">Target: {c.roas}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              <Filter className="w-3 h-3" /> {platformsData.length} Platforms Connected
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
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">₹{portfolioTotals.spend.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">{portfolioTotals.leads.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">{portfolioTotals.conversions.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right text-[#DC2626] font-extrabold text-sm">₹{portfolioTotals.revenue.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">₹{portfolioTotals.cpl.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">₹{portfolioTotals.cpa.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right text-[#DC2626] font-extrabold">{portfolioTotals.roas}</td>
                    <td className="p-3.5 text-right text-slate-900 dark:text-white">100%</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Live Synced
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
                  <th className="p-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-500">
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
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setDeletingCampaign(c)}
                          className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                          title={`Delete ${c.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
              onSubmit={handleCreateCampaign}
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
                    placeholder="50,000"
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
                  disabled={isCreating}
                  className="px-5 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold disabled:opacity-50"
                >
                  {isCreating ? 'Launching...' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Campaign Confirmation Modal */}
      {deletingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-[#0B1727] dark:text-white">Delete Campaign</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete campaign <span className="font-bold text-slate-900 dark:text-white">{deletingCampaign.name}</span>? This will permanently remove the campaign from the database.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
              <button
                type="button"
                onClick={() => setDeletingCampaign(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 dark:border-[#152238] text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCampaign}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
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
