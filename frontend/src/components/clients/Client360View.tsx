'use client';

import React, { useState } from 'react';
import { useToast, ToastType } from '@/lib/toast-context';
import {
  Building2,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  BarChart2,
  Layers,
  ArrowRight,
  ShieldAlert,
  Globe,
  MapPin,
  Edit2,
  Printer,
  X,
  Search,
  Filter,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  Check,
  MoreVertical,
  Trash2,
  UserCheck,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  ChevronLeft,
  FileText,
  Video,
  FileCheck,
  Zap,
  PlayCircle,
  TrendingDown,
  MessageSquare,
  ShieldCheck,
  Share2,
  Receipt,
  CheckSquare,
  Package,
  Send,
  Eye,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { downloadClientPdf } from '@/lib/downloadPdf';

interface Client360ViewProps {
  clientId?: string;
  onBackToList?: () => void;
}

export interface ClientDeliverable {
  id: string;
  title: string;
  category: 'Creative Ad Pack' | 'Performance Report' | 'Technical & SEO' | 'SOW Milestone' | 'Strategy';
  scope: string;
  lead: string;
  dueDate: string;
  status: 'Ready for Client' | 'Client Approved' | 'In Production';
  fileType: 'pdf' | 'zip' | 'doc';
  downloadType: 'report' | 'invoice' | 'proposal' | 'contract';
  downloadParams: Record<string, any>;
}

export const Client360View: React.FC<Client360ViewProps> = ({ clientId, onBackToList }) => {
  const { showToast: showGlobalToast } = useToast();
  const [simulatorState, setSimulatorState] = useState('1. Overview (Command)');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'campaigns' | 'deliverables' | 'performance' | 'projects' | 'retainers' | 'finance' | 'timeline' | 'health'>('overview');
  const [dateRange, setDateRange] = useState('This Month');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showGenerateDeliverableModal, setShowGenerateDeliverableModal] = useState(false);

  // Deliverables State & Presets
  const [deliverables, setDeliverables] = useState<ClientDeliverable[]>([]);

  // Modal Generator Form State
  const [newDelivCategory, setNewDelivCategory] = useState<ClientDeliverable['category']>('Creative Ad Pack');
  const [newDelivTitle, setNewDelivTitle] = useState('Omnichannel Performance Creative Pack (Batch #5)');
  const [newDelivScope, setNewDelivScope] = useState('12 Performance Ad Banners + 4 Short-form Reels + 3 Copy Variations');
  const [newDelivLead, setNewDelivLead] = useState('Alex Morgan');
  const [newDelivDate, setNewDelivDate] = useState('Nov 15, 2026');
  const [newDelivFormat, setNewDelivFormat] = useState<'pdf' | 'zip' | 'doc'>('pdf');
  const [delivFilterCategory, setDelivFilterCategory] = useState<string>('All');
  const [delivSearchQuery, setDelivSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Running Campaigns Telemetry (Google Ads & Meta Ads)
  const [campaignPlatformFilter, setCampaignPlatformFilter] = useState<'ALL' | 'GOOGLE' | 'META'>('ALL');
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');
  const acmeCampaigns: any[] = [];

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToastMessage(msg);
    showGlobalToast?.(msg, type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyPreset = (cat: ClientDeliverable['category']) => {
    setNewDelivCategory(cat);
    if (cat === 'Creative Ad Pack') {
      setNewDelivTitle('Performance Ad Creative Batch #5');
      setNewDelivScope('12 High-converting static/carousel banners + 4 Motion Reels (9:16) + Copy angles');
      setNewDelivLead('Alex Morgan');
      setNewDelivFormat('pdf');
    } else if (cat === 'Performance Report') {
      setNewDelivTitle('Monthly Performance Attribution Dossier (Oct 2026)');
      setNewDelivScope('Omnichannel Google/Meta ad spend audit, blended ROAS, SQL velocity curves');
      setNewDelivLead('Maya Joseph');
      setNewDelivFormat('pdf');
    } else if (cat === 'Technical & SEO') {
      setNewDelivTitle('Conversion API (CAPI) & Core Web Vitals Audit Report');
      setNewDelivScope('Server-side GTM event match quality, latency analysis, and technical SEO schema');
      setNewDelivLead('Rahul Menon');
      setNewDelivFormat('pdf');
    } else if (cat === 'SOW Milestone') {
      setNewDelivTitle('Sprint 25 Milestone Sign-off Certificate & Tax Invoice');
      setNewDelivScope('Deliverable completion acceptance + GST-compliant milestone tax invoice');
      setNewDelivLead('Alex Morgan');
      setNewDelivFormat('pdf');
    } else {
      setNewDelivTitle('Custom Deliverable Package');
      setNewDelivScope('Tailored client deliverable specifications and deliverables checklist');
      setNewDelivLead('Sarah Jenkins');
      setNewDelivFormat('pdf');
    }
  };

  const handleGenerateDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `DELIV-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    let downType: 'report' | 'invoice' | 'proposal' | 'contract' = 'proposal';
    if (newDelivCategory === 'Performance Report') downType = 'report';
    else if (newDelivCategory === 'SOW Milestone') downType = 'invoice';
    else if (newDelivCategory === 'Technical & SEO') downType = 'contract';

    const newObj: ClientDeliverable = {
      id: newId,
      title: newDelivTitle,
      category: newDelivCategory,
      scope: newDelivScope,
      lead: newDelivLead,
      dueDate: newDelivDate,
      status: 'Ready for Client',
      fileType: newDelivFormat,
      downloadType: downType,
      downloadParams: {
        client: 'Acme Technologies',
        title: newDelivTitle,
        number: newId
      }
    };

    setDeliverables([newObj, ...deliverables]);
    setShowGenerateDeliverableModal(false);
    showToast(`Deliverable ${newId} generated successfully! Triggering vector PDF download...`);

    // Direct real vector PDF download
    downloadClientPdf(downType, {
      client: 'Acme Technologies',
      title: newDelivTitle,
      number: newId
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#060B13] text-slate-800 dark:text-slate-100 pb-16 transition-colors font-sans">
      {/* 1. Clean Header & Breadcrumb Bar */}
      <div className="bg-white dark:bg-[#0A1628] border-b border-slate-200 dark:border-[#14233D] px-6 py-2.5 flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="flex items-center gap-1 hover:text-[#B91C1C] transition font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Clients Directory</span>
            </button>
          )}
          {onBackToList && <span>/</span>}
          <span>Client 360° Profile</span>
          <span>/</span>
          <span className="font-bold text-slate-900 dark:text-white">Acme Technologies</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Active SLA • Sync Real-Time</span>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto p-6 space-y-6">
        {/* 2. Hero Client Profile Card Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar & Identity */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#0A1628] text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md">
                AT
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span>Clients</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Acme Technologies Pvt Ltd</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Acme Technologies
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                    Enterprise Retainer Client
                  </span>
                </div>

                {/* Metadata tags */}
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap pt-1">
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Technology & Software</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Bengaluru, KA, India</span>
                  </span>
                  <span>•</span>
                  <a
                    href="https://acmetechnologies.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>acmetechnologies.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <span>Client Since: <strong>05 Jan 2020</strong></span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-bold text-[11px]">
                    Gold SLA Tier
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Team Lead Badges & Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center gap-4">
              {/* People Assigned */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0A1628] text-white flex items-center justify-center text-xs font-bold">
                    AM
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">Alex Morgan</div>
                    <div className="text-[10px] text-slate-500">AM Lead</div>
                  </div>
                </div>
                <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Tech Lead: <strong className="text-slate-900 dark:text-white">Maya Joseph</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active
                </span>
                <button
                  onClick={() => setShowGenerateDeliverableModal(true)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#B91C1C] hover:bg-[#991B1B] text-white flex items-center gap-1.5 shadow-sm transition active:scale-95"
                  title="Generate performance ad creatives, reports, SOW milestones, or custom deliverables"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Generate Deliverables</span>
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Edit Account
                </button>
                <button
                  onClick={() => showToast('Activity logged with Acme Technologies', 'success')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  + Activity
                </button>
                <button
                  onClick={() => setShowCommercialModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1"
                >
                  <span>Commercials</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Telemetry Health Factor Strip (Exact match to Reference Image 1) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span>Health: 86 / 100 (Healthy)</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>Relationship:</span>
                <strong className="text-slate-800 dark:text-slate-200">Strong (91)</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>Delivery:</span>
                <strong className="text-slate-800 dark:text-slate-200">On Track (88)</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>Payments:</span>
                <strong className="text-slate-800 dark:text-slate-200">Current (79)</strong>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">(₹75K Due)</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>Campaign:</span>
                <strong className="text-slate-800 dark:text-slate-200">Above Target (92 • 4.8x ROAS)</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>Renewal:</span>
                <strong className="text-slate-800 dark:text-slate-200">124 Days Remaining</strong>
                <span className="text-slate-500">(10 Jan 2027)</span>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('health')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
            >
              <span>Telemetry Factors</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 4. 7 Key Metric Cards in Single Row (Exact match to Reference Image 1) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Lifetime Rev */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">LIFETIME REV</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">₹24.8L</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              +18.4% YoY avg
            </div>
          </div>

          {/* ACV Contract */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">ACV CONTRACT</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">₹18.5L</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Annual MSA</div>
          </div>

          {/* Monthly MRR */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">MONTHLY MRR</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">₹1.54L</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">3 Active Scopes</div>
          </div>

          {/* Retainers */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">RETAINERS</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">3 Scopes</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Perf, Social, SEO</div>
          </div>

          {/* Live Sprints */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">LIVE SPRINTS</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">2 Active</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">1 QA Review</div>
          </div>

          {/* Outstanding */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">OUTSTANDING</div>
            <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">₹2.5L</div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
              ₹75K in 2d
            </div>
          </div>

          {/* Renewal */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">RENEWAL</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">124 Days</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Auto-renew terms</div>
          </div>
        </div>

        {/* 5. Client Search & Time Range Ribbon */}
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search this client (contacts, tasks, invoices, docs, sprints)... ⌘K"
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-3 flex-wrap">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              {['This Month', 'Last 3M', 'YTD'].map((t) => (
                <button
                  key={t}
                  onClick={() => setDateRange(t)}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    dateRange === t
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <select className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <option>All Platforms (Blended)</option>
              <option>Meta Ads</option>
              <option>Google Ads</option>
              <option>LinkedIn</option>
            </select>

            <select className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <option>All Pod Leads</option>
              <option>Maya Joseph</option>
              <option>Rahul Menon</option>
            </select>

            <button
              onClick={() => showToast('All filter criteria reset to default', 'info')}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
            >
              Reset (3)
            </button>
          </div>
        </div>

        {/* 6. Sub-navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'campaigns', label: 'Running Campaigns (4)' },
            { id: 'deliverables', label: `Deliverables & Outputs (${deliverables.length})` },
            { id: 'performance', label: 'Performance Analytics' },
            { id: 'projects', label: 'Projects (2)' },
            { id: 'retainers', label: 'Services & Retainers (3)' },
            { id: 'finance', label: 'Finance & Invoices (12)' },
            { id: 'timeline', label: 'Canonical Timeline' },
            { id: 'health', label: 'Health Matrix' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'border-[#B91C1C] text-[#B91C1C] dark:text-rose-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 7. Deliverables Workspace or 2-Column Split Workspace */}
        {activeSubTab === 'deliverables' ? (
          <div className="space-y-6">
            {/* Top Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Deliverables</div>
                  <Package className="w-4 h-4 text-[#B91C1C]" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{deliverables.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">Across active client engagement</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Ready for Client</div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-1.5">
                  {deliverables.filter(d => d.status === 'Ready for Client').length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Verified & 1-click downloadable</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Client Approved</div>
                  <UserCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-600 mt-1.5">
                  {deliverables.filter(d => d.status === 'Client Approved').length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Signed off by Acme stakeholder</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">In Production</div>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-600 mt-1.5">
                  {deliverables.filter(d => d.status === 'In Production').length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Avg turnaround: 3.2 days</div>
              </div>
            </div>

            {/* Filter Bar + Search + Action */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {['All', 'Creative Ad Pack', 'Performance Report', 'Technical & SEO', 'SOW Milestone', 'Strategy'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDelivFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      delivFilterCategory === cat
                        ? 'bg-[#B91C1C] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={delivSearchQuery}
                    onChange={(e) => setDelivSearchQuery(e.target.value)}
                    placeholder="Search deliverables..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-[#B91C1C] w-48 sm:w-60"
                  />
                </div>
                <button
                  onClick={() => setShowGenerateDeliverableModal(true)}
                  className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-sm active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Generate Deliverable</span>
                </button>
              </div>
            </div>

            {/* Deliverables List */}
            <div className="space-y-3">
              {deliverables
                .filter(d => (delivFilterCategory === 'All' || d.category === delivFilterCategory))
                .filter(d => (!delivSearchQuery || d.title.toLowerCase().includes(delivSearchQuery.toLowerCase()) || d.id.toLowerCase().includes(delivSearchQuery.toLowerCase()) || d.scope.toLowerCase().includes(delivSearchQuery.toLowerCase())))
                .map((deliv) => (
                  <div
                    key={deliv.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                          {deliv.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {deliv.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          deliv.status === 'Ready for Client'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : deliv.status === 'Client Approved'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          ● {deliv.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {deliv.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {deliv.scope}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap pt-1">
                        <span>Production Lead: <strong className="text-slate-800 dark:text-slate-200">{deliv.lead}</strong></span>
                        <span>•</span>
                        <span>Target Due: <strong className="text-slate-800 dark:text-slate-200">{deliv.dueDate}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-rose-600 font-semibold">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Pure Vector PDF Engine</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => {
                          showToast(`Downloading vector PDF for ${deliv.title}...`);
                          downloadClientPdf(deliv.downloadType, deliv.downloadParams);
                        }}
                        className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>

                      <button
                        onClick={() => showToast(`Deliverable ${deliv.id} dispatched to Acme client portal!`)}
                        className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch to Portal</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText?.(`https://optivirads.com/portal/acme/deliverables/${deliv.id}`);
                          showToast(`Secure client link copied for ${deliv.id}!`);
                        }}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition"
                        title="Copy Secure Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

              {deliverables
                .filter(d => (delivFilterCategory === 'All' || d.category === delivFilterCategory))
                .filter(d => (!delivSearchQuery || d.title.toLowerCase().includes(delivSearchQuery.toLowerCase()) || d.id.toLowerCase().includes(delivSearchQuery.toLowerCase()) || d.scope.toLowerCase().includes(delivSearchQuery.toLowerCase()))).length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No deliverables match this filter</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try clearing the search or category filter, or generate a new deliverable package for Acme Technologies.
                  </p>
                  <button
                    onClick={() => { setDelivFilterCategory('All'); setDelivSearchQuery(''); }}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : activeSubTab === 'campaigns' ? (
          <div className="space-y-6">
            {/* Read-Only Safety & Webhook Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Live Attribution Telemetry & Agency Compliance Guardrails
                  </h4>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                    Ad campaigns for Acme Technologies are monitored in real time via Google Ads & Meta Marketing APIs. In accordance with agency pixel safety, conversion API tracking, and master credit line constraints, direct campaign creation is strictly handled inside Google Ads Console & Meta Ads Manager.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => showToast('Refreshed telemetry webhooks from Google Ads & Meta Ads APIs')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sync Telemetry</span>
                </button>
              </div>
            </div>

            {/* Acme Executive Campaign Telemetry KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Ad Spend MTD</div>
                  <DollarSign className="w-4 h-4 text-[#B91C1C]" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">₹8,76,000</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Budget: ₹11,00,000</span>
                  <span className="font-semibold text-emerald-600">79.6% Pacing</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-[#B91C1C] h-full rounded-full" style={{ width: '79.6%' }} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Attributed Revenue</div>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-1.5">₹42,00,000</div>
                <div className="text-[11px] text-slate-500 mt-2">Blended across 4 active campaigns</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Blended Account ROAS</div>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-600 mt-1.5">4.80x</div>
                <div className="text-[11px] text-slate-500 mt-2">Target benchmark: 3.80x (+26.3%)</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Paid Pipeline Leads</div>
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-purple-600 mt-1.5">1,756</div>
                <div className="text-[11px] text-slate-500 mt-2">Blended CPL: ₹498.86 / verified lead</div>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setCampaignPlatformFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    campaignPlatformFilter === 'ALL'
                      ? 'bg-[#B91C1C] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All Platforms ({acmeCampaigns.length})
                </button>
                <button
                  onClick={() => setCampaignPlatformFilter('GOOGLE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    campaignPlatformFilter === 'GOOGLE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Google Ads ({acmeCampaigns.filter(c => c.platform === 'Google Ads').length})
                </button>
                <button
                  onClick={() => setCampaignPlatformFilter('META')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    campaignPlatformFilter === 'META'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Meta Ads ({acmeCampaigns.filter(c => c.platform === 'Meta Ads').length})
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={campaignSearchQuery}
                  onChange={(e) => setCampaignSearchQuery(e.target.value)}
                  placeholder="Search campaign name, target or channel..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 w-full sm:w-72"
                />
              </div>
            </div>

            {/* Campaign Cards List */}
            <div className="space-y-4">
              {acmeCampaigns
                .filter(c => {
                  if (campaignPlatformFilter === 'GOOGLE') return c.platform === 'Google Ads';
                  if (campaignPlatformFilter === 'META') return c.platform === 'Meta Ads';
                  return true;
                })
                .filter(c => {
                  if (!campaignSearchQuery) return true;
                  const q = campaignSearchQuery.toLowerCase();
                  return (
                    c.name.toLowerCase().includes(q) ||
                    c.id.toLowerCase().includes(q) ||
                    c.targetAudience.toLowerCase().includes(q) ||
                    c.channel.toLowerCase().includes(q)
                  );
                })
                .map((camp) => (
                  <div
                    key={camp.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
                  >
                    {/* Campaign Card Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                            {camp.id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              camp.platform === 'Google Ads'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40'
                            }`}
                          >
                            {camp.platform} • {camp.channel}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {camp.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {camp.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span>Target Cluster:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{camp.targetAudience}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => showToast(`Audited tracking tags for ${camp.id}: 100% CAPI & GA4 synced`)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inspect Tags</span>
                        </button>
                        <button
                          onClick={() => setActiveSubTab('deliverables')}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-rose-200 dark:border-rose-900/40 cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Ad Creatives</span>
                        </button>
                      </div>
                    </div>

                    {/* 4-Metric Data Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spend / Budget</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                          ₹{camp.spendMtd.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>Cap: ₹{camp.monthlyBudget.toLocaleString()}</span>
                          <span className="font-bold text-rose-600">{((camp.spendMtd / camp.monthlyBudget) * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leads & CPL</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                          {camp.leads.toLocaleString()} Leads
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          CPL: <span className="font-bold text-slate-700 dark:text-slate-300">₹{camp.cpl}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Click & CTR Volume</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                          {camp.clicks.toLocaleString()} Clicks
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          CTR: <span className="font-bold text-emerald-600">{camp.ctr}%</span> • CPC: ₹{camp.cpc}
                        </div>
                      </div>

                      <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attributed Rev / ROAS</div>
                        <div className="text-sm font-black text-emerald-600 mt-1">
                          ₹{camp.attributedRev.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          ROAS: <span className="font-black text-blue-600">{camp.roas.toFixed(2)}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          /* 7. 2-Column Split Workspace (Left 68% / Right 32%) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Deep Operations & Intelligence (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Widget 1: Executive Performance Snapshot */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-rose-600" />
                    <span>Executive Performance Snapshot</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Blended Media & Lead Generation Attribution (Trailing 30 Days)
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveSubTab('campaigns')}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Campaigns (4)</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('performance')}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Top 4 Attribution KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">AD SPEND</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">₹4,20,000</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">On 85% pace</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">QUALIFIED LEADS</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">842</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">+18.7% vs bench</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">CONVERSIONS</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">124</div>
                  <div className="text-[10px] text-blue-600 font-semibold mt-0.5">+12.4% MoM</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">ATTRIB. REVENUE</div>
                  <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">₹20,16,000</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">4.8x Blended ROAS</div>
                </div>
              </div>

              {/* Bottom 4 secondary metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500">BLENDED ROAS:</span>
                  <div className="font-bold text-slate-900 dark:text-white">4.80x <span className="text-[10px] text-slate-400 font-normal">(Target: 3.8x)</span></div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">CPA (BLENDED):</span>
                  <div className="font-bold text-slate-900 dark:text-white">₹3,387 <span className="text-[10px] text-emerald-600 font-normal">(-6.2%)</span></div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">CPL (LEAD):</span>
                  <div className="font-bold text-slate-900 dark:text-white">₹499 <span className="text-[10px] text-slate-400 font-normal">(Efficiency max)</span></div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">QUALIFIED TRAFFIC:</span>
                  <div className="font-bold text-slate-900 dark:text-white">128,400 <span className="text-[10px] text-emerald-600 font-normal">(+21.5%)</span></div>
                </div>
              </div>

              {/* Mini Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Revenue Growth Spline Preview */}
                <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Revenue Growth vs Pipeline Target</span>
                    <span className="text-[10px] text-slate-400">Aug – Sep 2026</span>
                  </div>
                  <div className="h-28 flex items-end justify-between gap-2 px-2 pt-4 relative">
                    {/* SVG Curve */}
                    <svg className="absolute inset-0 w-full h-full p-2 overflow-visible" preserveAspectRatio="none" viewBox="0 0 200 60">
                      <path
                        d="M 0 50 Q 50 40, 100 25 T 200 10"
                        fill="none"
                        stroke="#B91C1C"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="200" cy="10" r="4" fill="#B91C1C" />
                    </svg>
                    <div className="text-[10px] text-slate-400 z-10">Week 1 (₹4.2L)</div>
                    <div className="text-[10px] text-slate-400 z-10">Week 2 (₹5.8L)</div>
                    <div className="text-[10px] text-slate-400 z-10">Week 3 (₹7.4L)</div>
                    <div className="text-[10px] font-bold text-rose-600 z-10">Current (₹9.5L)</div>
                  </div>
                </div>

                {/* ROAS Trajectory Bar Chart */}
                <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">ROAS Trajectory (Target: 3.8x)</span>
                    <span className="text-[10px] font-bold text-emerald-600">Current: 4.8x</span>
                  </div>
                  <div className="h-28 flex items-end justify-between gap-3 px-3 pt-3">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[10px] text-slate-500">3.6x</span>
                      <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-t h-14"></div>
                      <span className="text-[10px] text-slate-400">W10</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[10px] text-slate-500">4.1x</span>
                      <div className="w-full bg-slate-400 dark:bg-slate-600 rounded-t h-18"></div>
                      <span className="text-[10px] text-slate-400">W11</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[10px] text-slate-500">4.4x</span>
                      <div className="w-full bg-slate-500 dark:bg-slate-500 rounded-t h-22"></div>
                      <span className="text-[10px] text-slate-400">W12</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[10px] font-bold text-rose-600">4.8x</span>
                      <div className="w-full bg-[#B91C1C] rounded-t h-26"></div>
                      <span className="text-[10px] font-bold text-rose-600">W13</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 1.5: Client Deliverables & Production Outputs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-rose-600" />
                    <span>Client Deliverables & Production Outputs</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                      {deliverables.length} Live
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Generate, track and download creative packs, attribution dossiers & SOW milestones with 1-click vector PDF
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowGenerateDeliverableModal(true)}
                    className="px-3 py-1.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Generate Deliverables</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('deliverables')}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <span>View All ({deliverables.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {deliverables.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {item.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {item.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'Ready for Client'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : item.status === 'Client Approved'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          ● {item.status}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {item.scope}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                        <span>Lead: <strong className="text-slate-700 dark:text-slate-300">{item.lead}</strong></span>
                        <span>•</span>
                        <span>Due: <strong className="text-slate-700 dark:text-slate-300">{item.dueDate}</strong></span>
                        <span>•</span>
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Vector PDF</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          showToast(`Downloading vector PDF for ${item.title}...`);
                          downloadClientPdf(item.downloadType, item.downloadParams);
                        }}
                        className="px-3 py-1.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        onClick={() => showToast(`Deliverable ${item.id} dispatched to Acme client portal!`)}
                        className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 transition"
                        title="Dispatch to Portal"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Active Projects Matrix */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-rose-600" />
                    <span>Active Projects Matrix</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Live Sprints & Deliverables Under MSA
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubTab('projects')}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>View Kanban Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Project 1 */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0A1628] text-white flex items-center justify-center font-bold text-xs">
                        🚀
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          Acme Growth Campaign — Q3 Scale
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>Sprint 4 of 6</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">● On Track</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-4 flex-wrap pt-1">
                      <span>Lead: <strong>Maya Joseph</strong></span>
                      <span>Deadline: <strong>30 Sep 2026</strong></span>
                      <span>Budget: <strong>₹4,50,000</strong></span>
                      <span>Spent: <strong>₹3,06,000 (68%)</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-36 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">68%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#0A1628] dark:bg-blue-600 h-full rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Project 2 */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0A1628] text-white flex items-center justify-center font-bold text-xs">
                        💻
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          Website Revamp & CRO Architecture
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>Sprint 1 of 4</span>
                          <span>•</span>
                          <span className="text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            Client Approval Pending
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-4 flex-wrap pt-1">
                      <span>Lead: <strong>Rahul Menon</strong></span>
                      <span>Deadline: <strong>20 Oct 2026</strong></span>
                      <span>Budget: <strong>₹2,20,000</strong></span>
                      <span className="text-rose-600 font-bold">Stalled: 4 Days on Wireframes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-36 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">20%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 3: Active Retainers & Scope Burn */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-600" />
                    <span>Active Retainers & Scope Burn</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Fixed Recurring Scopes Billed on 1st of Each Month
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubTab('retainers')}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Scopes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">RETAINER SCOPE</th>
                      <th className="p-3">MONTHLY RATE</th>
                      <th className="p-3">LEAD</th>
                      <th className="p-3">HOUR BURN (MTD)</th>
                      <th className="p-3">HEALTH STATUS</th>
                      <th className="p-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-rose-600" />
                        <span>Performance Marketing (Growth)</span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">₹1,50,000 / mo</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">Alex Morgan</td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">64h / 90h max</div>
                        <div className="text-[10px] text-slate-400">(80%)</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Above Target
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => showToast('Managing Service: Performance Marketing & Paid Ads (Alex Morgan)', 'info')}
                          className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Social Media & Community Mgmt</span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">₹75,000 / mo</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">Maya Joseph</td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">42h / 50h max</div>
                        <div className="text-[10px] text-slate-400">(84%)</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          On Target
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => showToast('Managing Service: Social Media & Community Mgmt (Maya Joseph)', 'info')}
                          className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Technical SEO & Content Ops</span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">₹50,000 / mo</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">Rahul Menon</td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">18h / 40h max</div>
                        <div className="text-[10px] text-slate-400">(45%)</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Pacing Low
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => showToast('Managing Service: Technical SEO & Content Ops (Rahul Menon)', 'info')}
                          className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Widget 4: Upcoming Key Touchpoints & Deadlines */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    <span>Upcoming Key Touchpoints & Deadlines</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Next 30 Days Operational Milestones
                  </p>
                </div>
                <button
                  onClick={() => showToast('Synchronizing calendar schedules with Acme Google Workspace', 'info')}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Schedule Sync</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Touchpoint 1 */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-[#B91C1C] text-white flex flex-col items-center justify-center font-bold shrink-0">
                      <span className="text-[9px] uppercase tracking-wider">SEP</span>
                      <span className="text-base leading-none">10</span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Monthly Performance & ROAS Executive Review</span>
                        <span className="text-[10px] text-slate-500 font-normal">11:00 AM IST</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Alex Morgan with Arjun Nair (Marketing Director) • Google Meet
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('Meeting confirmed: Monthly Performance & ROAS Executive Review', 'success')}
                      className="px-2.5 py-1 rounded text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => showToast('Opening meeting agenda & slide deck...', 'info')}
                      className="px-3 py-1 bg-[#0A1628] text-white rounded text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      Open Agenda
                    </button>
                  </div>
                </div>

                {/* Touchpoint 2 */}
                <div className="p-3.5 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-rose-600 text-white flex flex-col items-center justify-center font-bold shrink-0">
                      <span className="text-[9px] uppercase tracking-wider">SEP</span>
                      <span className="text-base leading-none">12</span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Retainer Invoice Due: INV-2026-082</span>
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded">
                          Due in 48h
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Amount: ₹75,000 • Assigned to Sara Menon (Billing Lead)
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Opening Retainer Invoice INV-2026-082 (₹75,000)...', 'info')}
                    className="px-3 py-1 bg-[#B91C1C] text-white rounded text-xs font-bold hover:bg-[#991B1B] transition cursor-pointer"
                  >
                    View Invoice
                  </button>
                </div>

                {/* Touchpoint 3 */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-[#0A1628] text-white flex flex-col items-center justify-center font-bold shrink-0">
                      <span className="text-[9px] uppercase tracking-wider">SEP</span>
                      <span className="text-base leading-none">15</span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        Mid-Sprint Campaign Milestone Delivery
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Lead: Maya Joseph • Deliver creative batch 4 & LinkedIn Ad structure
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Opening Mid-Sprint Campaign Milestone Delivery dossier...', 'info')}
                    className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                  >
                    Milestone Details
                  </button>
                </div>
              </div>
            </div>

            {/* Widget 5: Recent Account Activities Stream */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>Recent Account Activities Stream</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time telemetry across revenue, pods, and client interactions
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubTab('timeline')}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>View Canonical Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1 shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Today, 10:10 AM</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                        Performance
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Weekly ROAS Attribution Report reviewed and approved by <strong>Arjun Nair</strong>. Noted positive feedback on Meta CPL reductions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Today, 08:15 AM</span>
                      <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 rounded text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                        Meeting
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Client bi-weekly operational sync completed. Notes logged by <strong>Alex Morgan</strong>. Next checkpoint set for 10 Sep.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Yesterday, 05:40 PM</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        Finance
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Invoice payment received: <strong>₹1,50,000 (INV-2026-081)</strong> via NEFT transfer. Reconciled in Razorpay ledger.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-1 shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">07 Sep 2026</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                        Delivery
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Sprint deliverable signed off: <em>Ad Creative Batch 3</em> (12 video iterations uploaded to client Google Drive).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 6: Pinned Strategic Account Notes */}
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border-l-4 border-[#B91C1C] border-y border-r border-rose-200 dark:border-rose-900/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider text-[10px]">
                  📌 PINNED STRATEGIC ACCOUNT NOTES
                </span>
                <span className="text-[10px] text-slate-500">Updated 05 Sep by Alex Morgan</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                “Client strictly prefers monthly strategy reviews on the first Thursday. Arjun Nair requires performance attribution reports delivered before the 5th business day. Primary sponsor is Founder/CEO Sara Nair, any commercial expansions exceeding ₹25L must include Sara Menon in quotation drafts.”
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Account Health, Contracts & Triggers (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Account Health Telemetry */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Health Telemetry</h3>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Score: 86 / 100</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-800">
                  86%
                </div>
              </div>

              {/* Progress bars for factors */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Campaign Performance</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">92 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Delivery Velocity</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">88 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-slate-800 dark:bg-slate-300 h-full rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Executive Engagement</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">84 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-slate-700 dark:bg-slate-400 h-full rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Payments & DSO</span>
                    <span className="font-bold text-amber-600">79 / 100 (Amber)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '79%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Renewal Confidence</span>
                    <span className="font-bold text-rose-600">87 / 100 (High)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>

              {/* Signals */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                <div className="text-[10px] font-bold text-slate-500 uppercase">LIVE ACCOUNT SIGNALS</div>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Campaign ROAS +1.4% vs benchmark; zero meeting absences in Q3.</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>₹75K invoice due in 48h; Web revamp design review waiting 4 days.</span>
                </div>
              </div>
            </div>

            {/* 2. Key Stakeholders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Stakeholders (3)</h3>
                <button
                  onClick={() => showToast('Opening Add Stakeholder form for Acme Technologies...', 'info')}
                  className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#0A1628] text-white flex items-center justify-center text-xs font-bold">
                      AN
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                        <span>Arjun Nair</span>
                        <span className="text-[10px] text-rose-600 font-normal">Decision Maker</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Marketing Director • arjun.nair@acme...</div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Drafting email to Arjun Nair (arjun.nair@acme.com)...', 'info')}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Email Arjun Nair"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#B91C1C] text-white flex items-center justify-center text-xs font-bold">
                      SM
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                        <span>Sara Menon</span>
                        <span className="text-[10px] text-slate-500 font-normal">Economic Buyer</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Billing & Finance • sara.menon@acme...</div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Drafting email to Sara Menon (sara.menon@acme.com)...', 'info')}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Email Sara Menon"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                      RD
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">Rohan Deshmukh</div>
                      <div className="text-[10px] text-slate-500">VP Technology • rohan.d@acmetech.in</div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Drafting email to Rohan Deshmukh (rohan.d@acmetech.in)...', 'info')}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Email Rohan Deshmukh"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Contract & Renewal Hub */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contract & Renewal Hub</h3>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    MSA-2026-ACME-01 • Value: <strong>₹18.5L / yr</strong>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                  124d Remaining
                </span>
              </div>

              {/* Renewal Timeline Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span className="text-rose-600 font-bold">120d (Now)</span>
                  <span>90d (Early)</span>
                  <span>60d (Draft)</span>
                  <span>30d (Signing)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#B91C1C] h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div className="flex items-center justify-between">
                  <span>Renewal Probability:</span>
                  <strong className="text-emerald-600 font-bold">High (87%)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Term Period:</span>
                  <span>05 Jan 2026 – 04 Jan 2027</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auto-renew Clause:</span>
                  <span>30-day notice period</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowRenewalModal(true)}
                  className="flex-1 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Initiate Renewal
                </button>
                <button
                  onClick={() => downloadClientPdf('contract', { id: 'MSA-2026-ACME-01', client: 'Acme Technologies' })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 transition"
                  title="Download Master Services Agreement PDF"
                >
                  <Download className="w-3 h-3 text-[#B91C1C]" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* 4. Financial Ledger Status */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial Ledger Status</h3>
                <button
                  onClick={() => {
                    setActiveSubTab('finance');
                    showToast('Switched to client Invoices & Financials ledger tab', 'info');
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  View All 12
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500">Invoiced:</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">₹12.5L</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500">Paid:</span>
                  <div className="font-bold text-emerald-600 text-sm">₹10.2L</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500">Outstanding:</span>
                  <div className="font-bold text-rose-600 text-sm">₹2.2L</div>
                </div>
                <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40">
                  <span className="text-[10px] text-rose-600">Due in 48h:</span>
                  <div className="font-bold text-rose-600 text-sm">₹75K</div>
                </div>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-600 dark:text-slate-400">
                <span>INV-2026-082 Due 12 Sep • Sent to Sara Menon: </span>
                <strong className="text-slate-900 dark:text-white">₹75,000</strong>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => showToast('Opening invoice creation wizard for Acme Technologies', 'info')}
                  className="flex-1 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  + Generate Invoice
                </button>
                <button
                  onClick={() => showToast('Payment reconciliation modal opened for Acme Technologies', 'info')}
                  className="flex-1 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </div>

            {/* 5. Classification Tags */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">CLASSIFICATION TAGS</h3>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium">
                  #Enterprise
                </span>
                <span className="px-2.5 py-1 bg-[#B91C1C] text-white rounded-md font-bold">
                  #High-Value
                </span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium">
                  #Retainer-Tier-1
                </span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium">
                  #Technology
                </span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium">
                  #Priority-Account
                </span>
              </div>
            </div>

            {/* 6. Operational Quick Triggers */}
            <div className="bg-[#0A1628] text-white rounded-2xl p-5 shadow-md border border-[#14233D] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                OPERATIONAL QUICK TRIGGERS
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => showToast('Task creation drawer opened for Acme Technologies', 'info')}
                  className="flex items-center gap-1.5 p-2 bg-[#12223D] hover:bg-[#1A3157] rounded-lg border border-[#1C335A] font-medium transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-400" />
                  <span>Create Task</span>
                </button>
                <button
                  onClick={() => showToast('Meeting scheduler opened with Acme stakeholders', 'info')}
                  className="flex items-center gap-1.5 p-2 bg-[#12223D] hover:bg-[#1A3157] rounded-lg border border-[#1C335A] font-medium transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Book Meeting</span>
                </button>
                <button
                  onClick={() => showToast('Commercial invoice modal opened for Acme Technologies', 'info')}
                  className="flex items-center gap-1.5 p-2 bg-[#12223D] hover:bg-[#1A3157] rounded-lg border border-[#1C335A] font-medium transition cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Log Invoice</span>
                </button>
                <button
                  onClick={() => showToast('Internal note saved to Acme profile', 'success')}
                  className="flex items-center gap-1.5 p-2 bg-[#12223D] hover:bg-[#1A3157] rounded-lg border border-[#1C335A] font-medium transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Note</span>
                </button>
                <button
                  onClick={() => showToast('Project creation wizard launched for Acme Technologies', 'info')}
                  className="flex items-center gap-1.5 p-2 bg-[#12223D] hover:bg-[#1A3157] rounded-lg border border-[#1C335A] font-medium transition cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>New Project</span>
                </button>
                <button
                  onClick={() => showToast('QBR Executive Deck generated & export ready for Acme Technologies', 'success')}
                  className="flex items-center gap-1.5 p-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg font-bold transition cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Generate QBR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Edit Account Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Edit Client Account Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Company Name</label>
                <input
                  type="text"
                  defaultValue="Acme Technologies Pvt Ltd"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Annual Contract Value (₹)</label>
                <input
                  type="text"
                  defaultValue="₹18,50,000"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Account Manager</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <option>Alex Morgan</option>
                  <option>Maya Joseph</option>
                  <option>Marcus Vance</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Renewal Drawer/Modal */}
      {showRenewalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Initiate Enterprise Contract Renewal</h3>
                <p className="text-xs text-slate-500">Acme Technologies • MSA-2026-ACME-01</p>
              </div>
              <button onClick={() => setShowRenewalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/40">
                <div className="font-bold text-rose-700 dark:text-rose-300">Renewal Term: 05 Jan 2027 – 04 Jan 2028</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Current Value: ₹18.5L/yr • Recommended Renewal with 15% Expansion: <strong>₹21.2L/yr</strong>
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Proposed Renewal ACV (₹)</label>
                <input
                  type="text"
                  defaultValue="₹21,27,500"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Commercial Proposal Add-ons</label>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-rose-600" />
                    <span>Include AI Search Engine Optimization Add-on (+₹25K/mo)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-rose-600" />
                    <span>Extend SLA to 4h Dedicated Response Tier</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowRenewalModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Renewal proposal dispatched to Arjun Nair & Sara Menon!');
                  setShowRenewalModal(false);
                }}
                className="px-5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold"
              >
                Dispatch Renewal Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Deliverables Modal */}
      {showGenerateDeliverableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0A1628] to-[#12223D] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B91C1C] text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>Generate Client Deliverable</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Acme Technologies
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Generate production ad packs, performance dossiers, audits & SOW milestones with direct vector PDF download
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateDeliverableModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleGenerateDeliverable} className="p-6 space-y-5 text-xs">
              {/* Presets Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Select Deliverable Blueprint / Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Creative Ad Pack', icon: '🎨', label: 'Ad Creative Pack' },
                    { id: 'Performance Report', icon: '📈', label: 'Attribution Report' },
                    { id: 'Technical & SEO', icon: '⚙️', label: 'CAPI & SEO Audit' },
                    { id: 'SOW Milestone', icon: '💼', label: 'SOW & Tax Invoice' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.id as any)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition ${
                        newDelivCategory === preset.id
                          ? 'border-[#B91C1C] bg-rose-50/70 dark:bg-rose-950/30 text-[#B91C1C] dark:text-rose-300 font-bold shadow-xs ring-1 ring-[#B91C1C]'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 font-medium'
                      }`}
                    >
                      <span className="text-base">{preset.icon}</span>
                      <span className="text-[11px]">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deliverable Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDelivTitle}
                    onChange={(e) => setNewDelivTitle(e.target.value)}
                    placeholder="e.g., Omnichannel Ad Creative Batch #5"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B91C1C] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newDelivCategory}
                    onChange={(e) => handleApplyPreset(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B91C1C] outline-hidden"
                  >
                    <option value="Creative Ad Pack">Creative Ad Pack</option>
                    <option value="Performance Report">Performance Report</option>
                    <option value="Technical & SEO">Technical & SEO</option>
                    <option value="SOW Milestone">SOW Milestone</option>
                    <option value="Strategy">Strategy</option>
                  </select>
                </div>
              </div>

              {/* Scope & Deliverables Description */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deliverables Scope & Itemized Specifications
                </label>
                <textarea
                  rows={3}
                  value={newDelivScope}
                  onChange={(e) => setNewDelivScope(e.target.value)}
                  placeholder="List assets, ad dimensions, key metrics, attribution models, and sign-off criteria..."
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B91C1C] outline-hidden"
                />
              </div>

              {/* Pod Lead, Due Date & Export Engine */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Production Pod Lead
                  </label>
                  <select
                    value={newDelivLead}
                    onChange={(e) => setNewDelivLead(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B91C1C] outline-hidden"
                  >
                    <option value="Alex Morgan">Alex Morgan (AM Lead)</option>
                    <option value="Maya Joseph">Maya Joseph (Creative/Tech)</option>
                    <option value="Rahul Menon">Rahul Menon (Attribution)</option>
                    <option value="Sarah Jenkins">Sarah Jenkins (Strategy)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Delivery Date
                  </label>
                  <input
                    type="text"
                    value={newDelivDate}
                    onChange={(e) => setNewDelivDate(e.target.value)}
                    placeholder="e.g. Oct 28, 2026"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#B91C1C] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Output Engine
                  </label>
                  <div className="px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-between">
                    <span>Pure Vector PDF</span>
                    <span className="text-[10px] bg-[#B91C1C] text-white px-1.5 py-0.5 rounded font-black">
                      PDFKit
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Output Notice */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Clicking <strong>Generate & Download Vector PDF</strong> will compile and trigger a pure vector PDF document download into your browser and log the deliverable directly inside Acme Technologies' account profile.
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenerateDeliverableModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md transition active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <Download className="w-4 h-4" />
                  <span>Generate & Download Vector PDF</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1628] text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium">{toastMessage}</div>
        </div>
      )}
    </div>
  );
};
