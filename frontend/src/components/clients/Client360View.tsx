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
  EyeOff,
  Lock,
  KeyRound,
  Copy,
  Shield,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { downloadClientPdf } from '@/lib/downloadPdf';

interface Client360ViewProps {
  clientId?: string;
  clientName?: string;
  onBackToList?: () => void;
  onNavigate?: (tab: string) => void;
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

export const Client360View: React.FC<Client360ViewProps> = ({
  clientId,
  clientName: propClientName,
  onBackToList,
  onNavigate
}) => {
  const activeClientName = propClientName || (clientId ? `Client #${clientId}` : 'Client 360° Profile');
  const activeClientDomain = activeClientName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  const activeInitials = activeClientName.substring(0, 2).toUpperCase();
  const { showToast: showGlobalToast } = useToast();
  const [simulatorState, setSimulatorState] = useState('1. Overview (Command)');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'campaigns' | 'deliverables' | 'vault' | 'performance' | 'projects' | 'retainers' | 'finance' | 'timeline' | 'health'>('overview');
  const [dateRange, setDateRange] = useState('This Month');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showGenerateDeliverableModal, setShowGenerateDeliverableModal] = useState(false);

  // Credential Vault & Delegation Architecture State
  const [vaultSubMode, setVaultSubMode] = useState<'delegation' | 'fallback_vault'>('delegation');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);
  const [showAddVaultModal, setShowAddVaultModal] = useState(false);
  const [newVaultPlatform, setNewVaultPlatform] = useState('Shopify Custom App Token');
  const [newVaultIdentifier, setNewVaultIdentifier] = useState('shpat_live_8910482019482');
  const [newVaultSecret, setNewVaultSecret] = useState('shpss_9904291840291');
  const [newVaultAccess, setNewVaultAccess] = useState<'Admin' | 'Standard' | 'Read-Only'>('Standard');
  const [newVaultNotes, setNewVaultNotes] = useState('Private integration token for store telemetry');

  const [vaultAuditLogs, setVaultAuditLogs] = useState<any[]>([
    { id: 'aud-1', action: 'DELEGATION_VERIFIED', asset: 'Meta Business Manager (Partner 194820194810291)', operator: 'Maya Joseph', timestamp: 'Today, 04:15 PM' },
    { id: 'aud-2', action: 'KMS_KEY_ROTATED', asset: 'Master Key Envelope #V4 (AWS KMS)', operator: 'Security Bot', timestamp: 'Yesterday, 12:00 AM' }
  ]);

  const [delegationAssets, setDelegationAssets] = useState<any[]>([
    {
      id: 'del-meta',
      platform: 'Meta Business Manager',
      iconBg: 'bg-blue-600',
      partnerId: '194820194810291',
      clientAccountId: 'act_492019481029',
      status: 'Active',
      permissions: ['Manage Campaigns', 'CAPI Conversion Dataset', 'Ad Account Admin'],
      method: 'Partner Business ID Request (No Password Shared)',
      lastVerified: '10 mins ago',
    },
    {
      id: 'del-google',
      platform: 'Google Ads (MCC)',
      iconBg: 'bg-red-500',
      partnerId: '829-102-9912',
      clientAccountId: 'cid-910-244-8891',
      status: 'Active',
      permissions: ['Standard Access', 'Billing Audit', 'Performance Max Execution'],
      method: 'Manager Link CID Request (No Password Shared)',
      lastVerified: '25 mins ago',
    },
    {
      id: 'del-shopify',
      platform: 'Shopify Partner Collaborator',
      iconBg: 'bg-emerald-600',
      partnerId: 'OPTI-COL-8821',
      clientAccountId: 'apex-apparel-india.myshopify.com',
      status: 'Approved',
      permissions: ['Themes & Assets', 'Products & Orders', 'Analytics Telemetry'],
      method: 'Collaborator Access Code (Zero Password Handoff)',
      lastVerified: '1 hour ago',
    },
    {
      id: 'del-tiktok',
      platform: 'TikTok Business Center',
      iconBg: 'bg-slate-900',
      partnerId: '71982910283',
      clientAccountId: 'tt-org-8839210',
      status: 'Active',
      permissions: ['Spark Ads', 'Pixel Telemetry'],
      method: 'Business Center Partner Linking',
      lastVerified: '3 hours ago',
    }
  ]);

  const [fallbackCredentials, setFallbackCredentials] = useState<any[]>([
    {
      id: 'cred-1',
      platform: 'Headless CMS Admin (Strapi)',
      category: 'Content API & Landing Pages',
      identifier: 'admin@apexapparel.com',
      secret: 'strp_live_sec_994204_x8a!K',
      accessLevel: 'Admin',
      kmsKeyVersion: 'AWS-KMS-v4 (Envelope Isolated)',
      lastRotated: '14 days ago',
      notes: 'No delegation available. Secured with AES-256-GCM envelope cipher.'
    },
    {
      id: 'cred-2',
      platform: 'Private SFTP Asset Server',
      category: 'Raw Video B-Roll & High-Res Catalog',
      identifier: 'sftp_optivir_sync',
      secret: 'sftp#Apex2026@secure-vault',
      accessLevel: 'Standard',
      kmsKeyVersion: 'AWS-KMS-v4 (Envelope Isolated)',
      lastRotated: '30 days ago',
      notes: 'Isolated static delivery pipeline.'
    }
  ]);

  const handleToggleReveal = (id: string, platformName: string) => {
    setRevealedSecrets(prev => ({ ...prev, [id]: !prev[id] }));
    const newLog = {
      id: `aud-${Date.now()}`,
      action: !revealedSecrets[id] ? 'REVEAL_SECRET' : 'MASK_SECRET',
      asset: platformName,
      operator: 'Active Operator',
      timestamp: 'Just now'
    };
    setVaultAuditLogs(prev => [newLog, ...prev]);
  };

  const handleCopySecret = (id: string, secret: string, platformName: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedSecretId(id);
    showToast(`Encrypted secret for ${platformName} copied to clipboard (Audit logged)`, 'success');
    const newLog = {
      id: `aud-${Date.now()}`,
      action: 'COPY_CLIPBOARD',
      asset: platformName,
      operator: 'Active Operator',
      timestamp: 'Just now'
    };
    setVaultAuditLogs(prev => [newLog, ...prev]);
    setTimeout(() => setCopiedSecretId(null), 2500);
  };

  const handleAddFallbackCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultIdentifier.trim() || !newVaultSecret.trim()) return;

    const newRecord = {
      id: `cred-${Date.now()}`,
      platform: newVaultPlatform,
      category: 'Agency Tool Integration',
      identifier: newVaultIdentifier,
      secret: newVaultSecret,
      accessLevel: newVaultAccess,
      kmsKeyVersion: 'AWS-KMS-v4 (Envelope Isolated)',
      lastRotated: 'Today',
      notes: newVaultNotes
    };

    setFallbackCredentials(prev => [newRecord, ...prev]);
    setShowAddVaultModal(false);
    showToast(`Saved encrypted credential for ${newVaultPlatform} with AES-256-GCM envelope`, 'success');

    const newLog = {
      id: `aud-${Date.now()}`,
      action: 'ADD_CREDENTIAL',
      asset: newVaultPlatform,
      operator: 'Active Operator',
      timestamp: 'Just now'
    };
    setVaultAuditLogs(prev => [newLog, ...prev]);
  };

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
  const activeCampaigns: any[] = [];

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
        client: activeClientName,
        title: newDelivTitle,
        number: newId
      }
    };

    setDeliverables([newObj, ...deliverables]);
    setShowGenerateDeliverableModal(false);
    showToast(`Deliverable ${newId} generated successfully! Triggering vector PDF download...`);

    // Direct real vector PDF download
    downloadClientPdf(downType, {
      client: activeClientName,
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
          <span className="font-bold text-slate-900 dark:text-white">{activeClientName}</span>
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
                {activeInitials}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span>Clients</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{activeClientName}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {activeClientName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                    Enterprise Retainer Client
                  </span>
                </div>

                {/* Metadata tags */}
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap pt-1">
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Technology &amp; Performance</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Client Headquarters</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <span>Verified Client Account</span>
                  </span>
                  <span>•</span>
                  <span>Client Tier: <strong>Gold SLA</strong></span>
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
                  onClick={() => showToast('Activity logged for client account', 'success')}
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
            { id: 'vault', label: 'Credential Vault & Delegation' },
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

        {/* 7. Credential Vault Workspace */}
        {activeSubTab === 'vault' ? (
          <div className="space-y-6">
            {/* Security & Key Isolation Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0B1424] to-[#0A1628] border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/40 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">Credential Vault &amp; Partner Delegation Hub</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                        KMS Key Isolated
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60">
                        AES-256-GCM Envelope
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Enterprise key management architecture. Master keys are isolated in external KMS/environment variables—never co-located in the database. Delegation-first access eliminates raw passwords for Google, Meta, and Shopify.
                    </p>
                  </div>
                </div>

                {/* Sub-mode Navigation Pill */}
                <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 shrink-0">
                  <button
                    onClick={() => setVaultSubMode('delegation')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                      vaultSubMode === 'delegation'
                        ? 'bg-[#B91C1C] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Partner Delegation
                  </button>
                  <button
                    onClick={() => setVaultSubMode('fallback_vault')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                      vaultSubMode === 'fallback_vault'
                        ? 'bg-[#B91C1C] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Encrypted Fallback Locker
                  </button>
                </div>
              </div>

              {/* Security Advisory Callout */}
              <div className="p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-xl flex items-start gap-3 text-xs text-rose-200/90">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-white">OptiVir Delegation Policy:</strong> Never store or request raw passwords for platforms supporting native agency partner links (Meta Business Manager, Google MCC, Shopify Collaborator). Raw password encryption in the fallback locker is strictly reserved for legacy servers and custom APIs.
                </div>
              </div>
            </div>

            {/* View A: Partner Delegation Hub */}
            {vaultSubMode === 'delegation' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Agency Asset Delegations</h4>
                    <p className="text-xs text-slate-500">Authorized platform connections operating with zero raw credential exposure</p>
                  </div>
                  <button
                    onClick={() => showToast('Refreshed partner API delegation permissions from ad networks', 'info')}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Audit Partner Permissions</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {delegationAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl ${asset.iconBg} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                            {asset.platform.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">{asset.platform}</h5>
                            <span className="text-[11px] text-slate-500 font-mono">{asset.clientAccountId}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{asset.status}</span>
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Agency Partner ID:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{asset.partnerId}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Delegation Protocol:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{asset.method}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Last Verified:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{asset.lastVerified}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Authorized Permissions:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {asset.permissions.map((p: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>Zero Password Risk</span>
                        </span>
                        <button
                          onClick={() => showToast(`Delegation handshake verified for ${asset.platform}`, 'success')}
                          className="text-xs font-bold text-[#B91C1C] dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          Verify Handshake →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View B: Encrypted Fallback Locker */}
            {vaultSubMode === 'fallback_vault' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Encrypted Fallback Locker (Legacy &amp; Non-Delegated Tools)</h4>
                    <p className="text-xs text-slate-500">Secured with AES-256-GCM. Master key isolated outside the database.</p>
                  </div>
                  <button
                    onClick={() => setShowAddVaultModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Fallback Credential</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Platform &amp; Purpose</th>
                          <th className="py-3 px-4">Identifier / Username</th>
                          <th className="py-3 px-4">Secret (AES-256-GCM)</th>
                          <th className="py-3 px-4">Access Level</th>
                          <th className="py-3 px-4">Key Isolation</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {fallbackCredentials.map((cred) => (
                          <tr key={cred.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">{cred.platform}</div>
                              <div className="text-[10px] text-slate-400">{cred.category}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                              {cred.identifier}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-[11px]">
                                  {revealedSecrets[cred.id] ? cred.secret : '••••••••••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleReveal(cred.id, cred.platform)}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title={revealedSecrets[cred.id] ? 'Mask password' : 'Reveal password'}
                                >
                                  {revealedSecrets[cred.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopySecret(cred.id, cred.secret, cred.platform)}
                                  className="text-slate-400 hover:text-[#B91C1C]"
                                  title="Copy to clipboard (audited)"
                                >
                                  {copiedSecretId === cred.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                {cred.accessLevel}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {cred.kmsKeyVersion}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleCopySecret(cred.id, cred.secret, cred.platform)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                              >
                                Copy Secret
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

            {/* Audit & Access Telemetry Stream */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Vault Access &amp; Operator Audit Trail
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400">Immutable 256-Bit Log Stream</span>
              </div>

              <div className="space-y-2">
                {vaultAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">[{log.action}]</span>
                      <span className="text-slate-600 dark:text-slate-400">{log.asset}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Operator: <strong>{log.operator}</strong></span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Fallback Credential Modal */}
            {showAddVaultModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#B91C1C]" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Add Encrypted Fallback Secret</h4>
                    </div>
                    <button
                      onClick={() => setShowAddVaultModal(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddFallbackCredential} className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Platform Name</label>
                      <input
                        type="text"
                        required
                        value={newVaultPlatform}
                        onChange={(e) => setNewVaultPlatform(e.target.value)}
                        placeholder="e.g. Headless Strapi CMS"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Account Identifier / Username</label>
                      <input
                        type="text"
                        required
                        value={newVaultIdentifier}
                        onChange={(e) => setNewVaultIdentifier(e.target.value)}
                        placeholder="e.g. admin@apexapparel.com"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Access Token / Password</label>
                      <input
                        type="password"
                        required
                        value={newVaultSecret}
                        onChange={(e) => setNewVaultSecret(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Access Scope</label>
                        <select
                          value={newVaultAccess}
                          onChange={(e) => setNewVaultAccess(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Standard">Standard</option>
                          <option value="Read-Only">Read-Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Cipher Standard</label>
                        <input
                          type="text"
                          disabled
                          value="AES-256-GCM (Isolated)"
                          className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notes / Scope Context</label>
                      <textarea
                        rows={2}
                        value={newVaultNotes}
                        onChange={(e) => setNewVaultNotes(e.target.value)}
                        placeholder="Context for team members accessing this fallback credential..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddVaultModal(false)}
                        className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl transition shadow-xs"
                      >
                        Encrypt &amp; Save to Vault
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : activeSubTab === 'deliverables' ? (
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
                <div className="text-[11px] text-slate-500 mt-1">Signed off by client stakeholder</div>
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
                        onClick={() => showToast(`Deliverable ${deliv.id} dispatched to client portal!`)}
                        className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch to Portal</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText?.(`https://optivirads.com/portal/deliverables/${deliv.id}`);
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
                    Try clearing the search or category filter, or generate a new deliverable package for {activeClientName}.
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
                    Ad campaigns for this client account are monitored in real time via Google Ads &amp; Meta Marketing APIs. In accordance with agency pixel safety, conversion API tracking, and master credit line constraints, direct campaign creation is strictly handled inside Google Ads Console &amp; Meta Ads Manager.
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

            {/* Client Executive Campaign Telemetry KPIs */}
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
                  All Platforms ({activeCampaigns.length})
                </button>
                <button
                  onClick={() => setCampaignPlatformFilter('GOOGLE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    campaignPlatformFilter === 'GOOGLE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Google Ads ({activeCampaigns.filter(c => c.platform === 'Google Ads').length})
                </button>
                <button
                  onClick={() => setCampaignPlatformFilter('META')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    campaignPlatformFilter === 'META'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Meta Ads ({activeCampaigns.filter(c => c.platform === 'Meta Ads').length})
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
              {activeCampaigns
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
                        onClick={() => showToast(`Deliverable ${item.id} dispatched to ${activeClientName} client portal!`)}
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
                          {activeClientName} Growth Campaign — Q3 Scale
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
                  onClick={() => showToast(`Synchronizing calendar schedules with ${activeClientName} Google Workspace`, 'info')}
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
                        Alex Morgan with Client Stakeholder • Google Meet
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
                      Weekly ROAS Attribution Report reviewed and approved by <strong>Key Stakeholder</strong>. Noted positive feedback on Meta CPL reductions.
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
                “Client strictly prefers monthly strategy reviews on the first Thursday. Executive stakeholders require performance attribution reports delivered before the 5th business day. Commercial expansions exceeding ₹25L must include the designated finance lead in quotation drafts.”
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
                  onClick={() => showToast(`Opening Add Stakeholder form for ${activeClientName}...`, 'info')}
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
                      MD
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                        <span>Marketing Director</span>
                        <span className="text-[10px] text-rose-600 font-normal">Decision Maker</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Growth &amp; Brand • marketing@{activeClientDomain}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Drafting email to marketing@${activeClientDomain}...`, 'info')}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Email Marketing Director"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#B91C1C] text-white flex items-center justify-center text-xs font-bold">
                      BF
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                        <span>Finance Director</span>
                        <span className="text-[10px] text-slate-500 font-normal">Economic Buyer</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Billing &amp; Finance • billing@{activeClientDomain}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Drafting email to billing@${activeClientDomain}...`, 'info')}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Email Finance Lead"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                      VT
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">VP Technology</div>
                      <div className="text-[10px] text-slate-500">Infrastructure &amp; CAPI • tech@{activeClientDomain}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Drafting email to tech@${activeClientDomain}...`, 'info')}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Email VP Technology"
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contract &amp; Renewal Hub</h3>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    MSA-2026-01 • Value: <strong>₹18.5L / yr</strong>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                  124d Remaining
                </span>
              </div>

              {/* Renewal Timeline Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Signed: 05 Jan 2026</span>
                  <span>Expires: 04 Jan 2027</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#B91C1C] h-full rounded-full" style={{ width: '66%' }}></div>
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
                  onClick={() => downloadClientPdf('contract', { id: 'MSA-2026-01', client: activeClientName })}
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
                  onClick={() => showToast(`Opening invoice creation wizard for ${activeClientName}`, 'info')}
                  className="flex-1 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  + Generate Invoice
                </button>
                <button
                  onClick={() => showToast(`Payment reconciliation modal opened for ${activeClientName}`, 'info')}
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
                  onClick={() => showToast(`Task creation drawer opened for ${activeClientName}`, 'info')}
                  className="flex items-center gap-1.5 p-2 bg-[#12223D] hover:bg-[#1A3157] rounded-lg border border-[#1C335A] font-medium transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-400" />
                  <span>Create Task</span>
                </button>
                <button
                  onClick={() => showToast(`Meeting scheduler opened with ${activeClientName} stakeholders`, 'info')}
                  className="flex items-center gap-1.5 p-2 bg-[#12223D] hover:bg-[#1A3157] rounded-lg border border-[#1C335A] font-medium transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Book Meeting</span>
                </button>
                <button
                  onClick={() => showToast(`Commercial invoice modal opened for ${activeClientName}`, 'info')}
                  className="flex items-center gap-1.5 p-2 bg-[#12223D] hover:bg-[#1A3157] rounded-lg border border-[#1C335A] font-medium transition cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Log Invoice</span>
                </button>
                <button
                  onClick={() => showToast(`Internal note saved to ${activeClientName} profile`, 'success')}
                  className="flex items-center gap-1.5 p-2 bg-[#12223D] hover:bg-[#1A3157] rounded-lg border border-[#1C335A] font-medium transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Note</span>
                </button>
                <button
                  onClick={() => showToast(`Project creation wizard launched for ${activeClientName}`, 'info')}
                  className="flex items-center gap-1.5 p-2 bg-[#12223D] hover:bg-[#1A3157] rounded-lg border border-[#1C335A] font-medium transition cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>New Project</span>
                </button>
                <button
                  onClick={() => showToast(`QBR Executive Deck generated & export ready for ${activeClientName}`, 'success')}
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
                  defaultValue={activeClientName}
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
                <p className="text-xs text-slate-500">{activeClientName} • MSA-2026-01</p>
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
                  showToast(`Renewal proposal dispatched to ${activeClientName} executive team!`);
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
                      {activeClientName}
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
                  Clicking <strong>Generate & Download Vector PDF</strong> will compile and trigger a pure vector PDF document download into your browser and log the deliverable directly inside {activeClientName}&apos;s account profile.
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
