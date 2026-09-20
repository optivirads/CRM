'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/lib/toast-context';
import { api } from '@/lib/api';
import { downloadClientPdf } from '@/lib/downloadPdf';
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
  Plus,
  ExternalLink,
  Check,
  X,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Briefcase,
  FileText,
  Trash2,
  Save,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Activity,
  CheckSquare,
  Square,
  Globe,
  Share2,
  Smartphone,
  CreditCard,
  MessageCircle,
  Video,
  Server,
  Lock,
  Unlock,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';

interface ClientOnboardingViewProps {
  onOpenClient360?: (clientId?: string, clientName?: string) => void;
  onNavigate?: (tab: any) => void;
}

export interface AssetScopeConfig {
  meta: boolean;
  website: boolean;
  google_ads: boolean;
  gsc_ga4: boolean;
  gtm: boolean;
  payment_gateway: boolean;
  whatsapp: boolean;
  creative_vault: boolean;
  capi_dns: boolean;
  confirmed?: boolean;
}

export interface OnboardingAccount {
  id: string;
  name: string;
  domain: string;
  avatarText: string;
  contractTier: string;
  contractValue: string;
  am: string;
  pm: string;
  currentStage: string;
  stageIndex: number; // 0 to 6
  daysInOnboarding: number;
  totalDaysTarget: number;
  completedSteps: number;
  totalSteps: number;
  hasBlocker: boolean;
  blockerDesc?: string;
  proposalSent?: boolean;
  proposalApproved?: boolean;
  agreementSigned?: boolean;
  assetScope?: AssetScopeConfig;
  primaryContact: {
    name: string;
    role: string;
    email: string;
  };
}

export interface ChecklistStep {
  id: string;
  phaseId: number;
  phase: string;
  text: string;
  desc: string;
  channelKey?: keyof AssetScopeConfig;
}

export interface CredentialItem {
  id: string;
  name: string;
  category: string;
  channelKey?: keyof AssetScopeConfig;
  accessLevel: string;
  status: 'Granted' | 'Pending' | 'In Review' | 'Blocked';
  badgeColor: string;
  notes?: string;
}

export interface StrategyState {
  roasTarget: string;
  cacTarget: string;
  monthlySpendBudget: string;
  attributionFidelity: string;
  primaryChannels: string[];
  icpNotes: string;
  deliverablesNotes: string;
}

export interface BlockerItem {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  owner: string;
  dateReported: string;
  impact: string;
  resolved: boolean;
}

export const ONBOARDING_LIFECYCLE_STAGES = [
  { index: 0, label: '1. Proposal Sent', shortLabel: 'Proposal', desc: 'Commercial terms and SOW delivered to client' },
  { index: 1, label: '2. Proposal Approved', shortLabel: 'Approved', desc: 'Client leadership confirmed proposal approval' },
  { index: 2, label: '3. Agreement & SOW', shortLabel: 'Agreement', desc: 'Countersigned MSA & Master SOW locked in vault' },
  { index: 3, label: '4. Scope Confirmed', shortLabel: 'Scope Lock', desc: 'Active channels & asset scope confirmed' },
  { index: 4, label: '5. Credentials Collected', shortLabel: 'Credentials', desc: 'Platform access & delegation verified' },
  { index: 5, label: '6. Tech Setup & CAPI', shortLabel: 'Tech Setup', desc: 'CAPI DNS, pixel & measurement handshakes passed' },
  { index: 6, label: '7. Live Launch Active', shortLabel: 'Live Delivery', desc: 'Campaigns live & transitioned to pod delivery' },
];

export const STAGE_TO_TAB: Record<number, 'handoff' | 'scope' | 'assets' | 'strategy' | 'blockers' | 'timeline'> = {
  0: 'handoff',
  1: 'handoff',
  2: 'handoff',
  3: 'scope',
  4: 'assets',
  5: 'timeline',
  6: 'timeline'
};

export interface ChannelDefinition {
  key: keyof Omit<AssetScopeConfig, 'confirmed'>;
  name: string;
  category: string;
  icon: any;
  iconColor: string;
  description: string;
  requiredCredentials: Array<{
    id: string;
    name: string;
    category: string;
    accessLevel: string;
    notes: string;
  }>;
}

export const ASSET_CHANNEL_CATALOG: ChannelDefinition[] = [
  {
    key: 'meta',
    name: 'Meta Ads (Facebook & Instagram)',
    category: 'Ad Networks & Social',
    icon: Share2,
    iconColor: 'text-blue-500',
    description: 'Facebook Page Admin, Instagram Pro Account, Meta Business Portfolio & Pixel Datasets',
    requiredCredentials: [
      { id: 'meta-bm', name: 'Meta Business Portfolio / BM', category: 'Ad Networks', accessLevel: 'Partner Admin (Delegated)', notes: 'OptiVir Partner ID #9201948201' },
      { id: 'meta-page', name: 'Facebook Page & Instagram Account', category: 'Social Channels', accessLevel: 'Page Manager / Full Control', notes: 'Linked IG Pro Creator/Business' },
      { id: 'meta-adacc', name: 'Meta Ad Account & Pixel Datasets', category: 'Ad Networks', accessLevel: 'Ad Account Admin', notes: 'Dataset Pixel Access & CAPI token' }
    ]
  },
  {
    key: 'website',
    name: 'Website / E-Commerce (Shopify / Custom)',
    category: 'E-Commerce Platform',
    icon: Globe,
    iconColor: 'text-emerald-500',
    description: 'Shopify Collaborator or Custom Web Admin for theme scripts, checkout and webhooks',
    requiredCredentials: [
      { id: 'web-store', name: 'Shopify Store Collaborator / Web Admin', category: 'E-Commerce Platform', accessLevel: 'Collaborator (Themes, Apps & Scripts)', notes: 'Collaborator Code / Staff Account' }
    ]
  },
  {
    key: 'google_ads',
    name: 'Google Ads (MCC Link)',
    category: 'Search & Performance',
    icon: Target,
    iconColor: 'text-amber-500',
    description: 'Google Ads Manager Account link for Search, Shopping & Performance Max campaigns',
    requiredCredentials: [
      { id: 'gads-mcc', name: 'Google Ads MCC Manager Account', category: 'Search & Performance', accessLevel: 'Standard / Administrative Access', notes: 'MCC Link Request #842-192-0941' }
    ]
  },
  {
    key: 'gsc_ga4',
    name: 'Google Search Console & GA4',
    category: 'Analytics & SEO',
    icon: Activity,
    iconColor: 'text-cyan-500',
    description: 'Google Search Console DNS property and GA4 measurement stream administrator',
    requiredCredentials: [
      { id: 'gsc-prop', name: 'Google Search Console (GSC)', category: 'Analytics & SEO', accessLevel: 'Delegated Owner / Full User', notes: 'Domain Property Verification' },
      { id: 'ga4-stream', name: 'Google Analytics 4 (GA4)', category: 'Analytics & SEO', accessLevel: 'Administrator', notes: 'Measurement ID G-XXXXXXX' }
    ]
  },
  {
    key: 'gtm',
    name: 'Google Tag Manager (GTM)',
    category: 'Tag Management',
    icon: Layers,
    iconColor: 'text-indigo-500',
    description: 'GTM Web Container & Server-Side Cloud Run Container workspace access',
    requiredCredentials: [
      { id: 'gtm-container', name: 'Google Tag Manager Container', category: 'Tag Management', accessLevel: 'Administrator / Publish Rights', notes: 'GTM-XXXXXXX' }
    ]
  },
  {
    key: 'payment_gateway',
    name: 'Payment Gateway (Razorpay / Stripe)',
    category: 'Billing & Payments',
    icon: CreditCard,
    iconColor: 'text-purple-500',
    description: 'Payment gateway dashboard access for webhook reconciliation and conversion validation',
    requiredCredentials: [
      { id: 'pg-dash', name: 'Payment Gateway Dashboard (Razorpay/Stripe)', category: 'Billing & Payments', accessLevel: 'Operations / Read-Only Telemetry', notes: 'Webhook Verification' }
    ]
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp Cloud API / WABA',
    category: 'Communication',
    icon: MessageCircle,
    iconColor: 'text-emerald-600',
    description: 'WhatsApp Business API account and template manager for lead automation',
    requiredCredentials: [
      { id: 'waba-acc', name: 'WhatsApp Business Platform (WABA)', category: 'Communication', accessLevel: 'Admin / Template Manager', notes: 'WABA ID & Phone Number ID' }
    ]
  },
  {
    key: 'creative_vault',
    name: 'Brand Guidelines & RAW Creative Vault',
    category: 'Creative Assets',
    icon: Video,
    iconColor: 'text-rose-500',
    description: 'Brand book, vector logos, typography, and RAW video footage / UGC b-roll',
    requiredCredentials: [
      { id: 'brand-vault', name: 'Brand Identity & Vector Assets Vault', category: 'Creative Assets', accessLevel: 'Google Drive / Dropbox Editor', notes: 'Logos, Fonts & Brand Book' },
      { id: 'raw-footage', name: 'RAW Video B-Roll & UGC Footage', category: 'Creative Assets', accessLevel: 'Full Download Access', notes: 'Raw 4K / 1080p clips' }
    ]
  },
  {
    key: 'capi_dns',
    name: 'Server-Side CAPI & DNS (CNAME)',
    category: 'Cloud Infrastructure',
    icon: Server,
    iconColor: 'text-blue-600',
    description: 'DNS management access (Cloudflare/GoDaddy) for first-party subdomain routing and SSL handshake',
    requiredCredentials: [
      { id: 'capi-dns', name: 'DNS Delegation & Custom CAPI Subdomain', category: 'Cloud Infrastructure', accessLevel: 'CNAME Delegation', notes: 'capi.branddomain.com -> cdn.optivirads.com' }
    ]
  }
];

export const DEFAULT_ASSET_SCOPE: AssetScopeConfig = {
  meta: true,
  website: true,
  google_ads: false,
  gsc_ga4: false,
  gtm: true,
  payment_gateway: false,
  whatsapp: false,
  creative_vault: true,
  capi_dns: true,
  confirmed: false,
};

export const DEFAULT_SERVICE_TIERS = [
  'Enterprise Retainer',
  'Social Media Management',
  'Omnichannel Growth Retainer',
  'Performance Marketing SOW',
  'Meta CAPI & Server-Side Tracking',
  'Creative Studio & Direct-Response UGC',
  'Brand Search & Google Shopping Domination',
  'Ad-Hoc / On-Demand Ads (No Fixed ACV)',
  'Pay-As-You-Go Ad Campaigns',
  'AI CRM Acceleration'
];

export const ONBOARDING_LIFECYCLE_STEPS: ChecklistStep[] = [
  // Phase 1: Proposal & Commercials
  { id: 'st-1', phaseId: 1, phase: 'Phase 1: Proposal & Commercial Intake', text: 'Formal proposal and commercial SOW drafted and delivered', desc: 'Establish scope deliverables, media budget model and commercial terms' },
  { id: 'st-2', phaseId: 1, phase: 'Phase 1: Proposal & Commercial Intake', text: 'Client executive leadership formally approves proposal', desc: 'Receive commercial sign-off from authorized decision maker' },
  { id: 'st-3', phaseId: 1, phase: 'Phase 1: Proposal & Commercial Intake', text: 'Countersigned MSA & Master Agreement locked in Vault', desc: 'Verify contract validity, billing SAC 998361 & signing authority' },
  { id: 'st-4', phaseId: 1, phase: 'Phase 1: Proposal & Commercial Intake', text: 'Initial retainer advance deposit received & ledger reconciled', desc: 'Ensure accounting ledger confirms invoice remittance' },

  // Phase 2: Scope Definition & Channel Confirmation
  { id: 'st-5', phaseId: 2, phase: 'Phase 2: Asset Scope Definition', text: 'Channel scope audit conducted with client POC', desc: 'Identify which platforms apply (Meta, Website, Google Ads, GSC, etc.)' },
  { id: 'st-6', phaseId: 2, phase: 'Phase 2: Asset Scope Definition', text: 'Asset Scope Confirmed & Locked in Cockpit', desc: 'Filter requirement matrix strictly to confirmed client platforms' },
  { id: 'st-7', phaseId: 2, phase: 'Phase 2: Asset Scope Definition', text: 'Dedicated Slack Connect or VIP WhatsApp agency channel initialized', desc: 'Initialize VIP communications room with leadership and Pod AM' },

  // Phase 3: Platform Delegation & Credential Collection
  { id: 'st-8', phaseId: 3, phase: 'Phase 3: Credentials Collection', text: 'Meta Business Portfolio / Page Partner access granted', desc: 'Verify pixel, ad account, product catalog & page admin roles', channelKey: 'meta' },
  { id: 'st-9', phaseId: 3, phase: 'Phase 3: Credentials Collection', text: 'Website / Shopify Collaborator permissions provisioned', desc: 'Verify theme code, scripts, checkout & webhook permissions', channelKey: 'website' },
  { id: 'st-10', phaseId: 3, phase: 'Phase 3: Credentials Collection', text: 'Google Ads MCC Manager Account delegation linked', desc: 'Link MCC Manager Account and check billing profile', channelKey: 'google_ads' },
  { id: 'st-11', phaseId: 3, phase: 'Phase 3: Credentials Collection', text: 'Google Search Console & GA4 measurement stream access', desc: 'Verify DNS property ownership and GA4 stream telemetry', channelKey: 'gsc_ga4' },
  { id: 'st-12', phaseId: 3, phase: 'Phase 3: Credentials Collection', text: 'Google Tag Manager (GTM) Container admin delegated', desc: 'Set up web & server-side container workspaces', channelKey: 'gtm' },
  { id: 'st-13', phaseId: 3, phase: 'Phase 3: Credentials Collection', text: 'Payment Gateway webhook & transaction log read access', desc: 'Verify Razorpay / Stripe merchant telemetry', channelKey: 'payment_gateway' },
  { id: 'st-14', phaseId: 3, phase: 'Phase 3: Credentials Collection', text: 'WhatsApp Cloud API / WABA account ID linked', desc: 'Verify WABA phone number ID and template rights', channelKey: 'whatsapp' },
  { id: 'st-15', phaseId: 3, phase: 'Phase 3: Credentials Collection', text: 'Brand guidelines, vector logos & RAW footage collected', desc: 'Ingest visual identity, fonts, product b-roll & USPs', channelKey: 'creative_vault' },

  // Phase 4: Technical Setup & Infrastructure
  { id: 'st-16', phaseId: 4, phase: 'Phase 4: Technical Setup & Handshake', text: 'Server-side CAPI container deployment on Cloud Run verified', desc: 'Deploy first-party tracking container on custom sub-domain', channelKey: 'capi_dns' },
  { id: 'st-17', phaseId: 4, phase: 'Phase 4: Technical Setup & Handshake', text: 'DNS verification & custom tagging SSL certificate active', desc: 'Ensure CNAME routing and SSL handshakes pass telemetry', channelKey: 'capi_dns' },
  { id: 'st-18', phaseId: 4, phase: 'Phase 4: Technical Setup & Handshake', text: 'Conversion test event fires validated in live browser test', desc: 'Simulate AddToCart & Purchase events through CAPI & pixel' },
  { id: 'st-19', phaseId: 4, phase: 'Phase 4: Technical Setup & Handshake', text: 'Historic account audit & blended CAC benchmark formalized', desc: 'Review past 90-day spend, ROAS leaks and wasted ad spend' },

  // Phase 5: Kickoff & Strategy Alignment
  { id: 'st-20', phaseId: 5, phase: 'Phase 5: Kickoff & Strategy Alignment', text: 'Executive Kickoff Video Meet conducted with client leads', desc: 'Align delivery timelines, SLA milestones and sprint cadence' },
  { id: 'st-21', phaseId: 5, phase: 'Phase 5: Kickoff & Strategy Alignment', text: 'North Star ROAS & monthly CAC conversion targets locked', desc: 'Lock commercial scaling thresholds with client leadership' },
  { id: 'st-22', phaseId: 5, phase: 'Phase 5: Kickoff & Strategy Alignment', text: 'First-sprint creative ad angles & copy drafts approved', desc: 'Deliver initial campaign structure and UGC hooks' },

  // Phase 6: Live Launch & Operational Delivery
  { id: 'st-23', phaseId: 6, phase: 'Phase 6: Live Launch & Operational Delivery', text: 'Campaigns published live to Meta Graph API & Google Ads MCC', desc: 'Switch campaigns to Active with daily budget pacing' },
  { id: 'st-24', phaseId: 6, phase: 'Phase 6: Live Launch & Operational Delivery', text: 'Real-time telemetry stream connected & handoff complete', desc: 'Transition account to continuous monthly retainer delivery' }
];

export const DEFAULT_ONBOARDING_ACCOUNTS: OnboardingAccount[] = [];

export const ClientOnboardingView: React.FC<ClientOnboardingViewProps> = ({ onOpenClient360, onNavigate }) => {
  const { showToast } = useToast();

  // Active selected client
  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optivir_selected_onboarding_id');
      if (saved) return saved;
    }
    return '';
  });

  // Detail Subtab: 'handoff' | 'scope' | 'assets' | 'strategy' | 'blockers' | 'timeline'
  const [detailTab, setDetailTab] = useState<'handoff' | 'scope' | 'assets' | 'strategy' | 'blockers' | 'timeline'>('handoff');

  // Filter stage & search
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'blocked' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Commercial tiers state
  const [serviceTiers, setServiceTiers] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optivir_onboarding_tiers');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) { }
      }
    }
    return DEFAULT_SERVICE_TIERS;
  });
  const [showAddTierInput, setShowAddTierInput] = useState(false);
  const [customTierInput, setCustomTierInput] = useState('');

  // Create Onboarding modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newTier, setNewTier] = useState(DEFAULT_SERVICE_TIERS[0]);
  const [newContractVal, setNewContractVal] = useState('₹1,85,000 / mo');

  // Accounts state
  const [accounts, setAccounts] = useState<OnboardingAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optivir_onboarding_accounts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((a: any) => ({
              ...a,
              primaryContact: (a.primaryContact && typeof a.primaryContact === 'object')
                ? {
                    name: a.primaryContact.name || 'Primary Contact',
                    role: a.primaryContact.role || 'Managing Director',
                    email: a.primaryContact.email || 'contact@example.com'
                  }
                : {
                    name: typeof a.primaryContact === 'string' ? a.primaryContact : 'Primary Contact',
                    role: 'Managing Director',
                    email: 'contact@example.com'
                  },
              avatarText: a.avatarText || (a.name ? a.name.slice(0, 2).toUpperCase() : 'CL'),
              contractTier: a.contractTier || 'Enterprise Retainer',
              contractValue: a.contractValue || '₹1,00,000 / mo',
              am: a.am || 'Alex Morgan',
              pm: a.pm || 'Elena Rostova',
              currentStage: a.currentStage || ONBOARDING_LIFECYCLE_STAGES[0].label,
              stageIndex: typeof a.stageIndex === 'number' ? a.stageIndex : 0,
              daysInOnboarding: typeof a.daysInOnboarding === 'number' ? a.daysInOnboarding : 1,
              totalDaysTarget: typeof a.totalDaysTarget === 'number' ? a.totalDaysTarget : 14,
              completedSteps: typeof a.completedSteps === 'number' ? a.completedSteps : 0,
              totalSteps: 24,
              hasBlocker: Boolean(a.hasBlocker),
              proposalSent: a.proposalSent !== undefined ? Boolean(a.proposalSent) : true,
              proposalApproved: Boolean(a.proposalApproved),
              agreementSigned: Boolean(a.agreementSigned),
              assetScope: a.assetScope || DEFAULT_ASSET_SCOPE
            }));
          }
        } catch (e) { }
      }
    }
    return DEFAULT_ONBOARDING_ACCOUNTS;
  });

  // Load database clients automatically
  useEffect(() => {
    const fetchDbClients = async () => {
      try {
        const res = await api.getClients();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setAccounts(prev => {
            const existingNames = new Set(prev.map(a => a.name.toLowerCase()));
            const newMapped: OnboardingAccount[] = [];
            for (const c of res.data) {
              const name = c.company_name || c.name;
              if (name && !existingNames.has(name.toLowerCase())) {
                newMapped.push({
                  id: c.id,
                  name: name,
                  domain: c.website || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                  avatarText: name.slice(0, 2).toUpperCase(),
                  contractTier: c.billing_frequency ? `${c.billing_frequency.toUpperCase()} Retainer` : 'Enterprise Retainer',
                  contractValue: c.contract_value ? `₹${Number(c.contract_value).toLocaleString('en-IN')} / mo` : '₹1,00,000 / mo',
                  am: c.am_first ? `${c.am_first} ${c.am_last || ''}`.trim() : 'Alex Morgan',
                  pm: 'Elena Rostova',
                  currentStage: c.onboarding_stage || (c.status === 'Active' ? ONBOARDING_LIFECYCLE_STAGES[6].label : ONBOARDING_LIFECYCLE_STAGES[0].label),
                  stageIndex: c.status === 'Active' ? 6 : 0,
                  daysInOnboarding: 1,
                  totalDaysTarget: 14,
                  completedSteps: 0,
                  totalSteps: 24,
                  hasBlocker: c.health_status === 'At Risk',
                  proposalSent: true,
                  proposalApproved: c.status === 'Active',
                  agreementSigned: c.status === 'Active',
                  assetScope: c.asset_scope || DEFAULT_ASSET_SCOPE,
                  primaryContact: {
                    name: `${c.contact_first || 'Primary'} ${c.contact_last || 'Contact'}`.trim(),
                    role: 'Managing Director',
                    email: c.contact_email || `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                  }
                });
              }
            }
            if (newMapped.length > 0) {
              const merged = [...prev, ...newMapped];
              try {
                localStorage.setItem('optivir_onboarding_accounts', JSON.stringify(merged));
              } catch {}
              return merged;
            }
            return prev;
          });
        }
      } catch (e) {
        console.warn('Failed to load DB clients for onboarding:', e);
      }
    };
    fetchDbClients();
  }, []);

  // Sync accounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('optivir_onboarding_accounts', JSON.stringify(accounts));
    } catch (e) { }
  }, [accounts]);

  const selectedClient = accounts.find(a => a.id === selectedClientId) || accounts[0];

  useEffect(() => {
    if (selectedClient && !selectedClientId) {
      setSelectedClientId(selectedClient.id);
    }
  }, [selectedClient, selectedClientId]);

  // ==========================================
  // ASSET SCOPE STATE & CONFIGURATION
  // ==========================================
  const [assetScope, setAssetScope] = useState<AssetScopeConfig>(() => {
    if (typeof window !== 'undefined' && selectedClient?.id) {
      const saved = localStorage.getItem(`optivir_scope_${selectedClient.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return selectedClient?.assetScope || DEFAULT_ASSET_SCOPE;
  });

  useEffect(() => {
    if (!selectedClient?.id) return;
    const saved = localStorage.getItem(`optivir_scope_${selectedClient.id}`);
    if (saved) {
      try {
        setAssetScope(JSON.parse(saved));
        return;
      } catch {}
    }
    setAssetScope(selectedClient.assetScope || DEFAULT_ASSET_SCOPE);
  }, [selectedClient?.id]);

  const handleToggleChannelScope = (key: keyof Omit<AssetScopeConfig, 'confirmed'>) => {
    setAssetScope(prev => {
      const next = { ...prev, [key]: !prev[key], confirmed: false };
      return next;
    });
  };

  const handleConfirmAssetScope = async () => {
    if (!selectedClient?.id) return;
    const updatedScope = { ...assetScope, confirmed: true };
    setAssetScope(updatedScope);

    try {
      localStorage.setItem(`optivir_scope_${selectedClient.id}`, JSON.stringify(updatedScope));
    } catch {}

    // Regenerate credential matrix based strictly on active scope
    const tailoredCreds: CredentialItem[] = [];
    ASSET_CHANNEL_CATALOG.forEach(ch => {
      if (updatedScope[ch.key]) {
        ch.requiredCredentials.forEach(rc => {
          tailoredCreds.push({
            id: `cred-${rc.id}-${selectedClient.id}`,
            name: rc.name,
            category: rc.category,
            channelKey: ch.key,
            accessLevel: rc.accessLevel,
            status: 'Pending',
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
            notes: rc.notes
          });
        });
      }
    });

    setCredentials(tailoredCreds);
    try {
      localStorage.setItem(`optivir_creds_${selectedClient.id}`, JSON.stringify(tailoredCreds));
    } catch {}

    // Advance to stage 4 (Credentials Collected) and switch to credentials tab
    const nextStageIdx = Math.max(selectedClient.stageIndex, 4);
    const nextStageLabel = ONBOARDING_LIFECYCLE_STAGES[nextStageIdx].label;
    setDetailTab('assets');

    setAccounts(prev =>
      prev.map(a =>
        a.id === selectedClient.id
          ? { ...a, assetScope: updatedScope, stageIndex: nextStageIdx, currentStage: nextStageLabel }
          : a
      )
    );

    // Sync to database if client has uuid
    if (selectedClient.id && !selectedClient.id.startsWith('onb-')) {
      try {
        await api.updateClient(selectedClient.id, {
          asset_scope: updatedScope,
          onboarding_stage: nextStageLabel
        });
      } catch (e) {
        console.warn('Backend sync asset_scope note:', e);
      }
    }

    showToast(`Asset Scope confirmed for ${selectedClient.name}! Requisite credentials matrix tailored.`, 'success');
  };

  // ==========================================
  // CREDENTIALS MATRIX STATE
  // ==========================================
  const [credentials, setCredentials] = useState<CredentialItem[]>(() => {
    if (typeof window !== 'undefined' && selectedClient?.id) {
      const saved = localStorage.getItem(`optivir_creds_${selectedClient.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    // Generate initial from default scope
    const initial: CredentialItem[] = [];
    ASSET_CHANNEL_CATALOG.forEach(ch => {
      if (DEFAULT_ASSET_SCOPE[ch.key]) {
        ch.requiredCredentials.forEach(rc => {
          initial.push({
            id: `cred-${rc.id}`,
            name: rc.name,
            category: rc.category,
            channelKey: ch.key,
            accessLevel: rc.accessLevel,
            status: rc.id === 'capi-dns' ? 'Granted' : 'Pending',
            badgeColor: rc.id === 'capi-dns'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
            notes: rc.notes
          });
        });
      }
    });
    return initial;
  });

  useEffect(() => {
    if (!selectedClient?.id) return;
    const saved = localStorage.getItem(`optivir_creds_${selectedClient.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCredentials(parsed);
          return;
        }
      } catch {}
    }
  }, [selectedClient?.id]);

  useEffect(() => {
    if (selectedClient?.id && credentials.length > 0) {
      try {
        localStorage.setItem(`optivir_creds_${selectedClient.id}`, JSON.stringify(credentials));
      } catch {}
    }
  }, [credentials, selectedClient?.id]);

  // Add Credential Modal
  const [showAddCredModal, setShowAddCredModal] = useState(false);
  const [newCredName, setNewCredName] = useState('');
  const [newCredCategory, setNewCredCategory] = useState('Ad Networks');
  const [newCredAccessLevel, setNewCredAccessLevel] = useState('Standard Access');
  const [newCredStatus, setNewCredStatus] = useState<'Granted' | 'Pending' | 'In Review' | 'Blocked'>('Pending');
  const [newCredNotes, setNewCredNotes] = useState('');

  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredName.trim()) {
      showToast('Please enter credential / service name', 'error');
      return;
    }
    const badgeColor =
      newCredStatus === 'Granted'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
        : newCredStatus === 'Blocked'
        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';

    const item: CredentialItem = {
      id: `cred-${Date.now()}`,
      name: newCredName.trim(),
      category: newCredCategory,
      accessLevel: newCredAccessLevel,
      status: newCredStatus,
      badgeColor,
      notes: newCredNotes.trim() || undefined
    };

    setCredentials(prev => [item, ...prev]);
    setShowAddCredModal(false);
    setNewCredName('');
    setNewCredNotes('');
    showToast(`Added credential record: ${item.name}`, 'success');
  };

  const handleToggleCredStatus = (credId: string) => {
    setCredentials(prev =>
      prev.map(c => {
        if (c.id === credId) {
          const nextStatus = c.status === 'Granted' ? 'Pending' : 'Granted';
          const badgeColor =
            nextStatus === 'Granted'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
          return { ...c, status: nextStatus, badgeColor };
        }
        return c;
      })
    );
    showToast('Credential verification status updated', 'success');
  };

  const handleDeleteCred = (credId: string) => {
    setCredentials(prev => prev.filter(c => c.id !== credId));
    showToast('Credential record removed', 'info');
  };

  const handleDownloadAssetHandoverPdf = () => {
    if (!selectedClient) return;
    showToast('Generating Tailored Asset Handover & Access PDF...', 'info');
    downloadClientPdf('report', {
      client: selectedClient.name,
      report_type: 'Client Onboarding Asset Handover & Access Delegation Matrix',
      tier: selectedClient.contractTier,
      lead: selectedClient.am
    });
  };

  // ==========================================
  // STRATEGY & NORTH STAR KPIS
  // ==========================================
  const defaultStrategy: StrategyState = {
    roasTarget: '4.5x',
    cacTarget: '₹1,850',
    monthlySpendBudget: '₹5,00,000',
    attributionFidelity: '98.5%',
    primaryChannels: ['Meta Ads (Instagram / FB)', 'Google Search Intent', 'Shopify Headless CRO'],
    icpNotes: `Targeting enterprise buyers, high-intent consumers & decision makers. Primary objective is establishing verified high-trust proof of compliance, conversion optimization, and profitable scaling across confirmed channels.`,
    deliverablesNotes: `Deliverables defined under ${selectedClient?.contractTier || 'Enterprise Retainer'}. Workstreams and SLA checklists are synchronized directly with delivery pods.`
  };

  const [strategy, setStrategy] = useState<StrategyState>(() => {
    if (typeof window !== 'undefined' && selectedClient?.id) {
      const saved = localStorage.getItem(`optivir_strat_${selectedClient.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return defaultStrategy;
  });

  useEffect(() => {
    if (!selectedClient?.id) return;
    const saved = localStorage.getItem(`optivir_strat_${selectedClient.id}`);
    if (saved) {
      try {
        setStrategy(JSON.parse(saved));
        return;
      } catch {}
    }
    setStrategy(defaultStrategy);
  }, [selectedClient?.id]);

  const handleSaveStrategy = () => {
    if (!selectedClient?.id) return;
    try {
      localStorage.setItem(`optivir_strat_${selectedClient.id}`, JSON.stringify(strategy));
      showToast(`Saved growth strategy & KPIs for ${selectedClient.name}`, 'success');
    } catch {}
  };

  const toggleChannel = (ch: string) => {
    setStrategy(prev => {
      const exists = prev.primaryChannels.includes(ch);
      const next = exists ? prev.primaryChannels.filter(c => c !== ch) : [...prev.primaryChannels, ch];
      return { ...prev, primaryChannels: next };
    });
  };

  // ==========================================
  // BLOCKERS & RISKS
  // ==========================================
  const [blockers, setBlockers] = useState<BlockerItem[]>(() => {
    if (typeof window !== 'undefined' && selectedClient?.id) {
      const saved = localStorage.getItem(`optivir_blockers_${selectedClient.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });

  useEffect(() => {
    if (!selectedClient?.id) return;
    const saved = localStorage.getItem(`optivir_blockers_${selectedClient.id}`);
    if (saved) {
      try {
        setBlockers(JSON.parse(saved));
        return;
      } catch {}
    }
    setBlockers([]);
  }, [selectedClient?.id]);

  useEffect(() => {
    if (selectedClient?.id) {
      try {
        localStorage.setItem(`optivir_blockers_${selectedClient.id}`, JSON.stringify(blockers));
      } catch {}
    }
  }, [blockers, selectedClient?.id]);

  const [showAddBlockerModal, setShowAddBlockerModal] = useState(false);
  const [newBlockerTitle, setNewBlockerTitle] = useState('');
  const [newBlockerSeverity, setNewBlockerSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newBlockerOwner, setNewBlockerOwner] = useState(selectedClient?.am || 'Alex Morgan');
  const [newBlockerImpact, setNewBlockerImpact] = useState('');

  const handleAddBlocker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockerTitle.trim()) {
      showToast('Please enter blocker title', 'error');
      return;
    }
    const item: BlockerItem = {
      id: `blk-${Date.now()}`,
      title: newBlockerTitle.trim(),
      severity: newBlockerSeverity,
      owner: newBlockerOwner.trim() || 'Alex Morgan',
      dateReported: new Date().toISOString().split('T')[0],
      impact: newBlockerImpact.trim() || 'Awaiting resolution to clear launch SLA.',
      resolved: false
    };
    setBlockers(prev => [item, ...prev]);
    setShowAddBlockerModal(false);
    setNewBlockerTitle('');
    setNewBlockerImpact('');
    showToast(`Blocker logged: ${item.title}`, 'action');
  };

  const handleResolveBlocker = (id: string) => {
    setBlockers(prev => prev.filter(b => b.id !== id));
    showToast('Blocker marked resolved and removed ✓', 'success');
  };

  // ==========================================
  // MILESTONE CHECKLIST (DYNAMICALLY FILTERED)
  // ==========================================
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>(() => {
    if (typeof window !== 'undefined' && selectedClient?.id) {
      const saved = localStorage.getItem(`optivir_checklist_${selectedClient.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return { 'st-1': true };
  });

  useEffect(() => {
    if (!selectedClient?.id) return;
    const saved = localStorage.getItem(`optivir_checklist_${selectedClient.id}`);
    if (saved) {
      try {
        setChecklist(JSON.parse(saved));
        return;
      } catch {}
    }
    setChecklist({ 'st-1': true });
  }, [selectedClient?.id]);

  // Active applicable steps based strictly on confirmed scope
  const activeChecklistSteps = useMemo(() => {
    return ONBOARDING_LIFECYCLE_STEPS.filter(step => {
      if (!step.channelKey) return true;
      return Boolean(assetScope[step.channelKey]);
    });
  }, [assetScope]);

  const toggleChecklist = (id: string) => {
    if (!selectedClient?.id) return;
    setChecklist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(`optivir_checklist_${selectedClient.id}`, JSON.stringify(next));
      } catch {}

      const completedCount = activeChecklistSteps.filter(s => next[s.id]).length;

      setAccounts(accts =>
        accts.map(a =>
          a.id === selectedClient.id
            ? {
                ...a,
                completedSteps: completedCount
              }
            : a
        )
      );

      return next;
    });
  };

  // Lifecycle Stage Handlers
  const handleSetStage = async (stageIdx: number, autoSwitchTab: boolean = true) => {
    if (!selectedClient?.id) return;
    const clamped = Math.max(0, Math.min(6, stageIdx));
    const stageObj = ONBOARDING_LIFECYCLE_STAGES[clamped];

    const proposalApproved = clamped >= 1;
    const agreementSigned = clamped >= 2;
    const isLive = clamped >= 6;

    setAccounts(prev =>
      prev.map(a =>
        a.id === selectedClient.id
          ? {
              ...a,
              stageIndex: clamped,
              currentStage: stageObj.label,
              proposalApproved,
              agreementSigned
            }
          : a
      )
    );

    if (autoSwitchTab) {
      const targetTab = STAGE_TO_TAB[clamped] || 'handoff';
      setDetailTab(targetTab);
    }

    if (selectedClient.id && !selectedClient.id.startsWith('onb-')) {
      try {
        await api.updateClient(selectedClient.id, {
          onboarding_stage: stageObj.label,
          status: isLive ? 'Active' : 'Onboarding'
        });
      } catch (e) {
        console.warn('Sync stage to client note:', e);
      }
    }

    showToast(`Switched to: ${stageObj.label}`, 'success');
  };

  // Calculations
  const completedStepsCount = activeChecklistSteps.filter(s => checklist[s.id]).length;
  const totalActiveSteps = Math.max(1, activeChecklistSteps.length);
  const progressPct = Math.round((completedStepsCount / totalActiveSteps) * 100);

  const grantedCredsCount = credentials.filter(c => c.status === 'Granted').length;
  const totalCredsCount = Math.max(1, credentials.length);
  const credsPct = Math.round((grantedCredsCount / totalCredsCount) * 100);

  const activeChannelsCount = ASSET_CHANNEL_CATALOG.filter(ch => assetScope[ch.key]).length;

  const filteredAccounts = accounts.filter(acc => {
    if (activeFilter === 'in_progress' && acc.stageIndex >= 6) return false;
    if (activeFilter === 'blocked' && !acc.hasBlocker) return false;
    if (activeFilter === 'completed' && acc.stageIndex < 6) return false;
    if (searchQuery && !acc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 w-full pb-16">
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
              Client Onboarding &amp; SLA Handoff
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs font-bold flex items-center gap-1">
              <Rocket className="w-3.5 h-3.5" />
              <span>{accounts.length} In-Flight</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            7-stage visual lifecycle: Proposal Sent → Approved → Agreement Signed → Scope Confirmed → Credentials → Tech Setup → Live Launch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate && onNavigate('clients')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-[#0B1424] text-slate-700 dark:text-slate-200 border border-[#E2E6EC] dark:border-[#152238] rounded-xl hover:bg-slate-50 shadow-2xs transition cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Clients Directory</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
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
            <span className="font-semibold uppercase tracking-wider text-[11px]">Active Pipelines</span>
            <Rocket className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{accounts.length} Accounts</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">7-Stage Lifecycle</span>
            <span>Avg 14 Days SLA</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Confirmed Asset Scope</span>
            <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {activeChannelsCount} of {ASSET_CHANNEL_CATALOG.length} Platforms
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">
              {assetScope.confirmed ? 'Scope Confirmed & Locked' : 'Scope In Definition'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Requisite Credentials</span>
            <Key className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {grantedCredsCount} / {credentials.length} Granted ({credsPct}%)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold">
            <span>{credentials.filter(c => c.status === 'Pending').length} Pending Access Handover</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1424] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-rose-600">Active Action Blockers</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">{blockers.length} Blockers</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span>{blockers.filter(b => b.severity === 'Critical').length} Critical Risk</span>
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
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0E1A2E] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold overflow-x-auto">
              {[
                { id: 'all', label: `All (${accounts.length})` },
                { id: 'in_progress', label: `Active (${accounts.filter(a => a.stageIndex < 6).length})` },
                { id: 'blocked', label: `Blocked (${accounts.filter(a => a.hasBlocker).length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-[#0A1628] text-white dark:bg-rose-950/60 dark:text-rose-300'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account Cards */}
          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredAccounts.length === 0 ? (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-8 text-center text-slate-400 text-xs shadow-xs">
                No client onboardings found.
              </div>
            ) : (
              filteredAccounts.map((acc) => {
                const isSelected = acc.id === selectedClient?.id;
                const cardPct = Math.round(((acc.stageIndex + 1) / 7) * 100);

                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setSelectedClientId(acc.id);
                      try {
                        localStorage.setItem('optivir_selected_onboarding_id', acc.id);
                      } catch {}
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-white dark:bg-[#0E1A2E] border-[#B91C1C] dark:border-rose-500 shadow-md ring-2 ring-rose-500/20'
                        : 'bg-white dark:bg-[#0B1424] border-[#E2E6EC] dark:border-[#152238] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0A1628] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                          {acc.avatarText}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{acc.name}</h4>
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
                        <span>Commercial Scope:</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{acc.contractValue}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Account Lead:</span>
                        <span>{acc.am}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center text-[11px] mb-1">
                        <span className="text-slate-500">Stage {acc.stageIndex + 1} of 7</span>
                        <span className="font-bold text-[#B91C1C] dark:text-rose-400">{cardPct}% Complete</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#B91C1C] to-rose-400 rounded-full transition-all duration-300"
                          style={{ width: `${cardPct}%` }}
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
                Start a new 7-stage client onboarding workflow to transition signed deals into delivery.
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
              {/* 1. Client Header Card & 7-Stage Stepper */}
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0A1628] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {selectedClient?.avatarText || selectedClient?.name?.slice(0, 2)?.toUpperCase() || 'CL'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedClient?.name || 'Client'}</h2>
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                          {selectedClient?.contractTier || 'Enterprise Retainer'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>POC: <strong>{selectedClient?.primaryContact?.name || 'Primary Contact'}</strong> {selectedClient?.primaryContact?.role ? `(${selectedClient.primaryContact.role})` : ''}</span>
                        <span>•</span>
                        <span>AM: <strong>{selectedClient?.am || 'Alex Morgan'}</strong></span>
                        <span>•</span>
                        <span>PM: <strong>{selectedClient?.pm || 'Elena Rostova'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenClient360 && (
                      <button
                        onClick={async () => {
                          if (selectedClient.id && selectedClient.id.startsWith('onb-')) {
                            try {
                              const numVal = parseInt(selectedClient.contractValue?.replace(/[^0-9]/g, '') || '0', 10);
                              const res = await api.createClient({
                                company_name: selectedClient.name,
                                contract_value: numVal,
                                billing_frequency: 'monthly',
                                status: 'Onboarding',
                                website: selectedClient.domain ? `https://${selectedClient.domain}` : undefined
                              });
                              if (res.success && res.data?.id) {
                                const newId = res.data.id;
                                setAccounts(prev => prev.map(a => a.id === selectedClient.id ? { ...a, id: newId } : a));
                                setSelectedClientId(newId);
                                onOpenClient360(newId, selectedClient.name);
                                return;
                              }
                            } catch (e) {
                              console.warn('Auto-sync client on 360 open error:', e);
                            }
                          }
                          onOpenClient360(selectedClient.id, selectedClient.name);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Client 360°</span>
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await handleSetStage(6);
                        showToast(`Successfully launched ${selectedClient.name} to Live Delivery! Synchronized to Clients Directory.`, 'success');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0A1628] hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Launch to Live Delivery</span>
                    </button>
                  </div>
                </div>

                {/* 7-Stage Visual Lifecycle Stepper */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
                      <span>Onboarding Lifecycle Roadmap ({selectedClient.stageIndex + 1} of 7)</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSetStage(selectedClient.stageIndex - 1)}
                        disabled={selectedClient.stageIndex === 0}
                        className="px-2 py-1 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 cursor-pointer"
                      >
                        ← Revert Stage
                      </button>
                      <button
                        onClick={() => handleSetStage(selectedClient.stageIndex + 1)}
                        disabled={selectedClient.stageIndex >= 6}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-rose-50 dark:bg-rose-950/60 text-[#B91C1C] dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 disabled:opacity-40 hover:bg-rose-100 cursor-pointer"
                      >
                        Advance Stage →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold">
                    {ONBOARDING_LIFECYCLE_STAGES.map((stg) => {
                      const isPast = stg.index < selectedClient.stageIndex;
                      const isCurrent = stg.index === selectedClient.stageIndex;
                      return (
                        <button
                          key={stg.index}
                          onClick={() => handleSetStage(stg.index)}
                          className={`p-1.5 rounded-lg border transition text-center cursor-pointer ${
                            isPast
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : isCurrent
                              ? 'bg-rose-50 dark:bg-rose-950/50 border-[#B91C1C] dark:border-rose-600 text-[#B91C1C] dark:text-rose-300 font-bold shadow-2xs'
                              : 'bg-slate-50 dark:bg-[#0E1A2E] border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <div className="truncate font-bold">{stg.shortLabel}</div>
                          <div className="text-[9px] opacity-80 mt-0.5">{isPast ? '✓ Passed' : isCurrent ? 'Active' : 'Pending'}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 pt-0.5">
                    {ONBOARDING_LIFECYCLE_STAGES.map((stg) => (
                      <div
                        key={stg.index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          stg.index < selectedClient.stageIndex
                            ? 'bg-emerald-500'
                            : stg.index === selectedClient.stageIndex
                            ? 'bg-[#B91C1C] animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtabs for Detail: Sales Handoff | Asset Scope | Requisite Credentials | Strategy | Blockers | Timeline */}
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl shadow-xs overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 pt-3 overflow-x-auto">
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'handoff', label: '1. Commercial & Handoff', icon: FileCheck },
                      { id: 'scope', label: '2. Asset Scope Configurator', icon: SlidersHorizontal, badge: `${activeChannelsCount} Active` },
                      { id: 'assets', label: '3. Requisite Credentials Matrix', icon: Key, badge: `${grantedCredsCount}/${credentials.length}` },
                      { id: 'strategy', label: '4. Strategy & KPIs', icon: Target },
                      { id: 'blockers', label: '5. Risks & Blockers', icon: ShieldAlert, badge: blockers.length > 0 ? String(blockers.length) : undefined },
                      { id: 'timeline', label: '6. SLA Execution Checklist', icon: Clock, badge: `${completedStepsCount}/${totalActiveSteps}` },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = detailTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setDetailTab(tab.id as any)}
                          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                            isActive
                              ? 'border-[#B91C1C] text-[#B91C1C] dark:text-rose-400'
                              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                          {tab.badge && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              tab.id === 'blockers'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TAB 1: Commercial & Handoff */}
                {detailTab === 'handoff' && (
                  <div className="p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Commercial Scope Card */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-3">
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                          Commercial Scope &amp; Retainer SOW
                        </span>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Proposal Reference:</span>
                            <strong className="text-slate-800 dark:text-slate-200">SOW-{selectedClient?.id ? selectedClient.id.slice(0, 8).toUpperCase() : '1'}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Contract Value:</span>
                            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedClient?.contractValue || '₹1,00,000 / mo'}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tier / Scope:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedClient?.contractTier || 'Enterprise Retainer'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Assigned Pod AM:</span>
                            <span className="text-slate-800 dark:text-slate-200">{selectedClient?.am || 'Alex Morgan'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Proposal & Agreement Sign-off Actions */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-3">
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                          Lifecycle Sign-off Controls
                        </span>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">Proposal Sent &amp; Approved</div>
                              <div className="text-[10px] text-slate-500">Commercial pitch and pricing sign-off</div>
                            </div>
                            <button
                              onClick={() => handleSetStage(selectedClient.stageIndex >= 1 ? 0 : 1)}
                              className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                                selectedClient.stageIndex >= 1
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-emerald-50'
                              }`}
                            >
                              {selectedClient.stageIndex >= 1 ? '✓ Approved' : 'Mark Approved'}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">Master Agreement &amp; SOW</div>
                              <div className="text-[10px] text-slate-500">Signed legal contract and SAC 998361</div>
                            </div>
                            <button
                              onClick={() => handleSetStage(selectedClient.stageIndex >= 2 ? 1 : 2)}
                              className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                                selectedClient.stageIndex >= 2
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-emerald-50'
                              }`}
                            >
                              {selectedClient.stageIndex >= 2 ? '✓ Signed & Locked' : 'Mark Signed'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Signed Master Services Agreement (MSA) &amp; Scope of Work (SOW) synchronized to Documents Vault.</span>
                      </div>
                      <button
                        onClick={() => onNavigate && onNavigate('documents')}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0 cursor-pointer"
                      >
                        View in Documents Vault →
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Commercials &amp; Agreements Ready?</div>
                        <div className="text-[11px] text-slate-500">Proceed to define and lock active platform channels (Meta, Website, Google Ads, GSC, etc.)</div>
                      </div>
                      <button
                        onClick={() => handleSetStage(3)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl shadow-xs transition cursor-pointer text-xs shrink-0"
                      >
                        <span>Proceed to Asset Scope Configurator →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: Asset Scope Configurator */}
                {detailTab === 'scope' && (
                  <div className="p-5 space-y-5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                          <SlidersHorizontal className="w-4 h-4 text-[#B91C1C]" />
                          <span>Step 1: Confirm What Platforms &amp; Assets Apply to {selectedClient.name}</span>
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                          Not all clients have every platform. Toggle ONLY the channels applicable for this client (e.g., Meta FB/IG only, Shopify + Meta, or full omnichannel). The credential checklist will automatically adapt!
                        </p>
                      </div>

                      <button
                        onClick={handleConfirmAssetScope}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold transition shadow-xs shrink-0 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{assetScope.confirmed ? 'Update & Re-Lock Scope' : 'Confirm & Lock Scope'}</span>
                      </button>
                    </div>

                    {/* Channel Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {ASSET_CHANNEL_CATALOG.map((ch) => {
                        const isEnabled = Boolean(assetScope[ch.key]);
                        const Icon = ch.icon;

                        return (
                          <div
                            key={ch.key}
                            onClick={() => handleToggleChannelScope(ch.key)}
                            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between select-none ${
                              isEnabled
                                ? 'bg-white dark:bg-[#0E1A2E] border-rose-400 dark:border-rose-800 shadow-xs ring-1 ring-rose-400/20'
                                : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg ${isEnabled ? 'bg-rose-50 dark:bg-rose-950/60' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                    <Icon className={`w-4 h-4 ${isEnabled ? ch.iconColor : 'text-slate-400'}`} />
                                  </div>
                                  <span className="font-bold text-slate-900 dark:text-white">{ch.name}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                                  isEnabled ? 'bg-[#B91C1C] border-[#B91C1C] text-white' : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                  {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                {ch.description}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-semibold">{ch.category}</span>
                              <span className={`font-bold ${isEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                {isEnabled ? `${ch.requiredCredentials.length} Requisite Items` : 'Excluded'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Active Channels Selected?</div>
                        <div className="text-[11px] text-slate-500">Lock scope and generate the tailored platform credentials checklist</div>
                      </div>
                      <button
                        onClick={handleConfirmAssetScope}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl shadow-xs transition cursor-pointer text-xs shrink-0"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm Scope &amp; Open Credentials Matrix →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: Requisite Credentials Matrix */}
                {detailTab === 'assets' && (
                  <div className="p-5 space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                          <Key className="w-4 h-4 text-blue-500" />
                          <span>Step 2: Collect &amp; Verify Confirmed Platform Credentials</span>
                        </h3>
                        <p className="text-slate-500 text-[11px]">
                          Tailored strictly to the confirmed platforms for {selectedClient.name} ({activeChannelsCount} active channels).
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={handleDownloadAssetHandoverPdf}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export Tailored PDF</span>
                        </button>
                        <button
                          onClick={() => setShowAddCredModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Custom Credential</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-[#0E1A2E] text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="p-3">Credential / Service</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Access Level</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Account Details / Notes</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {credentials.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400">
                                No credentials configured yet. Click "2. Asset Scope Configurator" above to select and lock channels.
                              </td>
                            </tr>
                          ) : (
                            credentials.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                                <td className="p-3 text-slate-500">{c.category}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{c.accessLevel}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${c.badgeColor}`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-500 text-[11px] max-w-[200px] truncate">{c.notes || '—'}</td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleToggleCredStatus(c.id)}
                                      className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                                        c.status === 'Granted'
                                          ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold'
                                      }`}
                                    >
                                      {c.status === 'Granted' ? 'Set Pending' : 'Mark Granted ✓'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCred(c.id)}
                                      className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                      title="Remove credential"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Credentials Matrix Collected?</div>
                        <div className="text-[11px] text-slate-500">Advance to Technical Setup, CAPI DNS verification &amp; Milestone SLA Execution</div>
                      </div>
                      <button
                        onClick={() => handleSetStage(5)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl shadow-xs transition cursor-pointer text-xs shrink-0"
                      >
                        <span>Proceed to Technical Setup &amp; Checklist →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: Strategy & North Star KPIs */}
                {detailTab === 'strategy' && (
                  <div className="p-5 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-purple-500" />
                          <span>Strategy &amp; North Star KPI Architecture</span>
                        </h3>
                        <p className="text-slate-500 text-[11px]">Define and edit custom targets, scaling budget, and conversion benchmarks for {selectedClient.name}</p>
                      </div>
                      <button
                        onClick={handleSaveStrategy}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold transition shadow-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Strategy &amp; KPIs</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-1">
                        <label className="text-slate-500 text-[11px] font-bold uppercase block">North Star ROAS Target</label>
                        <input
                          type="text"
                          value={strategy.roasTarget}
                          onChange={(e) => setStrategy({ ...strategy, roasTarget: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-lg font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                        <p className="text-slate-500 text-[10px]">Blended Target ROAS</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-1">
                        <label className="text-slate-500 text-[11px] font-bold uppercase block">Target Blended CAC</label>
                        <input
                          type="text"
                          value={strategy.cacTarget}
                          onChange={(e) => setStrategy({ ...strategy, cacTarget: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-lg font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                        <p className="text-slate-500 text-[10px]">Customer Acquisition Cost cap</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-1">
                        <label className="text-slate-500 text-[11px] font-bold uppercase block">Monthly Media Budget</label>
                        <input
                          type="text"
                          value={strategy.monthlySpendBudget}
                          onChange={(e) => setStrategy({ ...strategy, monthlySpendBudget: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-lg font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                        <p className="text-slate-500 text-[10px]">Estimated monthly media spend</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-1">
                        <label className="text-slate-500 text-[11px] font-bold uppercase block">Attribution Fidelity</label>
                        <input
                          type="text"
                          value={strategy.attributionFidelity}
                          onChange={(e) => setStrategy({ ...strategy, attributionFidelity: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-lg font-bold text-emerald-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                        <p className="text-slate-500 text-[10px]">CAPI server match score</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-2">
                      <label className="font-bold text-slate-900 dark:text-white block">Target ICP &amp; Growth Strategy Brief</label>
                      <textarea
                        rows={3}
                        value={strategy.icpNotes}
                        onChange={(e) => setStrategy({ ...strategy, icpNotes: e.target.value })}
                        className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 5: Blockers & Risk Mitigation */}
                {detailTab === 'blockers' && (
                  <div className="p-5 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>Active Delivery Blockers ({blockers.length})</span>
                        </h3>
                        <p className="text-slate-500 text-[11px]">Track operational blockers preventing technical launch or SLA fulfillment</p>
                      </div>
                      <button
                        onClick={() => setShowAddBlockerModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer"
                      >
                        + Log New Blocker
                      </button>
                    </div>

                    {blockers.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 dark:bg-[#0E1A2E] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                        <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                        <h4 className="font-bold text-slate-900 dark:text-white">Zero Active Blockers</h4>
                        <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                          All platform credentials, technical CAPI tracking, and commercial agreements are fully clear for launch.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {blockers.map((b) => (
                          <div
                            key={b.id}
                            className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">{b.title}</span>
                                <span className={`px-2 py-0.2 rounded text-white text-[10px] font-bold ${
                                  b.severity === 'Critical' ? 'bg-rose-700' : b.severity === 'High' ? 'bg-rose-600' : 'bg-amber-600'
                                }`}>
                                  {b.severity} Severity
                                </span>
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                                Reported by: <strong>{b.owner}</strong> on {b.dateReported}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-[11px]">{b.impact}</p>
                            </div>

                            <button
                              onClick={() => handleResolveBlocker(b.id)}
                              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold transition shrink-0 cursor-pointer"
                            >
                              Mark Resolved ✓
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 6: Milestone SLA Checklist (Tailored) */}
                {detailTab === 'timeline' && (
                  <div className="p-5 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>SLA Execution Checklist (Tailored to Active Scope)</span>
                        </h3>
                        <p className="text-slate-500 text-[11px]">
                          Check items as they are verified to advance the onboarding roadmap
                        </p>
                      </div>
                      <span className="font-bold text-[#B91C1C] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60">
                        {completedStepsCount} of {totalActiveSteps} Completed ({progressPct}%)
                      </span>
                    </div>

                    <div className="space-y-6">
                      {[1, 2, 3, 4, 5, 6].map((phaseNum) => {
                        const phaseSteps = activeChecklistSteps.filter(s => s.phaseId === phaseNum);
                        if (phaseSteps.length === 0) return null;

                        const phaseName = phaseSteps[0]?.phase || `Phase ${phaseNum}`;
                        const phaseCompletedCount = phaseSteps.filter(s => checklist[s.id]).length;

                        return (
                          <div key={phaseNum} className="space-y-2.5">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-extrabold">
                                  {phaseNum}
                                </span>
                                <span>{phaseName}</span>
                              </span>
                              <span className="text-[11px] text-slate-400 font-semibold">
                                {phaseCompletedCount} / {phaseSteps.length} Completed
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {phaseSteps.map((step) => {
                                const isChecked = Boolean(checklist[step.id]);
                                return (
                                  <div
                                    key={step.id}
                                    onClick={() => toggleChecklist(step.id)}
                                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 select-none ${
                                      isChecked
                                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60'
                                        : 'bg-white dark:bg-[#0E1A2E] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                  >
                                    <div className="pt-0.5 shrink-0">
                                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                                        isChecked
                                          ? 'bg-emerald-600 border-emerald-600 text-white'
                                          : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                                      }`}>
                                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                      </div>
                                    </div>
                                    <div className="min-w-0">
                                      <div className={`font-semibold text-slate-900 dark:text-white ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                                        {step.text}
                                      </div>
                                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        {step.desc}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL 1: Create New Onboarding Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0B1424] rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-[#B91C1C]" />
                <span>Start New Client Onboarding</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold block">Commercial Tier / Service Model</label>
                  <button
                    type="button"
                    onClick={() => setShowAddTierInput(!showAddTierInput)}
                    className="text-[11px] font-medium text-[#B91C1C] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddTierInput ? 'Close' : '+ Add Custom Tier'}</span>
                  </button>
                </div>

                {showAddTierInput && (
                  <div className="mb-2 p-2.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-lg space-y-2">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Create New Service Model / Commercial Tier</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Meta Reels & Influencer Sprint"
                        value={customTierInput}
                        onChange={(e) => setCustomTierInput(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs border rounded-md bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customTierInput.trim()) {
                              const trimmed = customTierInput.trim();
                              if (!serviceTiers.includes(trimmed)) {
                                setServiceTiers([...serviceTiers, trimmed]);
                              }
                              setNewTier(trimmed);
                              setCustomTierInput('');
                              setShowAddTierInput(false);
                              showToast(`Added custom tier: "${trimmed}"`, 'success');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customTierInput.trim()) {
                            const trimmed = customTierInput.trim();
                            if (!serviceTiers.includes(trimmed)) {
                              setServiceTiers([...serviceTiers, trimmed]);
                            }
                            setNewTier(trimmed);
                            setCustomTierInput('');
                            setShowAddTierInput(false);
                            showToast(`Added custom tier: "${trimmed}"`, 'success');
                          }
                        }}
                        className="px-2.5 py-1.5 bg-[#B91C1C] text-white text-xs font-semibold rounded-md hover:bg-rose-700 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                <select
                  value={newTier}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewTier(val);
                    if (val.includes('Ad-Hoc') || val.includes('On-Demand') || val.includes('Pay-As-You-Go')) {
                      setNewContractVal('On-Demand (As Needed)');
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  {serviceTiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold block">Monthly Contract Value / Retainer</label>
                  <button
                    type="button"
                    onClick={() => setNewContractVal('On-Demand (As Needed)')}
                    className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                  >
                    Set to On-Demand (No Fixed ACV)
                  </button>
                </div>
                <input
                  type="text"
                  value={newContractVal}
                  onChange={(e) => setNewContractVal(e.target.value)}
                  placeholder="e.g. ₹1,85,000 / mo or On-Demand (As Needed)"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Assigned Account Exec</label>
                  <input
                    type="text"
                    defaultValue="Alex Morgan"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Target Live SLA</label>
                  <input
                    type="text"
                    defaultValue="14 Days"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newClientName.trim()) {
                    showToast('Please enter client name', 'error');
                    return;
                  }
                  const numVal = parseInt(newContractVal?.replace(/[^0-9]/g, '') || '0', 10);
                  let finalId = `onb-${Date.now()}`;
                  try {
                    const res = await api.createClient({
                      company_name: newClientName.trim(),
                      contract_value: numVal,
                      billing_frequency: 'monthly',
                      status: 'Onboarding',
                      website: `https://${newClientName.trim().toLowerCase().replace(/\s+/g, '')}.com`
                    });
                    if (res.success && res.data?.id) {
                      finalId = res.data.id;
                    }
                  } catch (e) {
                    console.warn('API client creation for onboarding note:', e);
                  }

                  const newAcc: OnboardingAccount = {
                    id: finalId,
                    name: newClientName.trim(),
                    domain: `${newClientName.trim().toLowerCase().replace(/\s+/g, '')}.com`,
                    avatarText: newClientName.trim().slice(0, 2).toUpperCase(),
                    contractTier: newTier,
                    contractValue: newContractVal,
                    am: 'Alex Morgan',
                    pm: 'Elena Rostova',
                    currentStage: ONBOARDING_LIFECYCLE_STAGES[0].label,
                    stageIndex: 0,
                    daysInOnboarding: 1,
                    totalDaysTarget: 14,
                    completedSteps: 0,
                    totalSteps: 24,
                    hasBlocker: false,
                    proposalSent: true,
                    proposalApproved: false,
                    agreementSigned: false,
                    assetScope: DEFAULT_ASSET_SCOPE,
                    primaryContact: {
                      name: 'Primary Contact',
                      role: 'Managing Director',
                      email: `contact@${newClientName.trim().toLowerCase().replace(/\s+/g, '')}.com`,
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

      {/* MODAL 2: Add Custom Credential Modal */}
      {showAddCredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0B1424] rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-500" />
                <span>Add Platform Credential / Asset</span>
              </h3>
              <button onClick={() => setShowAddCredModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCredential} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Service / Platform Name</label>
                <input
                  type="text"
                  placeholder="e.g. Klaviyo Email Admin, AWS S3 Brand Vault"
                  value={newCredName}
                  onChange={(e) => setNewCredName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newCredCategory}
                    onChange={(e) => setNewCredCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Ad Networks">Ad Networks</option>
                    <option value="Analytics & Tracking">Analytics & Tracking</option>
                    <option value="E-Commerce Platform">E-Commerce Platform</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Creative Vault">Creative Vault</option>
                    <option value="Communication">Communication</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Access Status</label>
                  <select
                    value={newCredStatus}
                    onChange={(e) => setNewCredStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Granted">Granted</option>
                    <option value="In Review">In Review</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Access Level / Delegation Role</label>
                <input
                  type="text"
                  placeholder="e.g. Partner Admin, Delegated Standard, Collaborator"
                  value={newCredAccessLevel}
                  onChange={(e) => setNewCredAccessLevel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Account ID / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. BM #92018401, client@domain.com"
                  value={newCredNotes}
                  onChange={(e) => setNewCredNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCredModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Add Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Log New Blocker Modal */}
      {showAddBlockerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0B1424] rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Log New Delivery Blocker</span>
              </h3>
              <button onClick={() => setShowAddBlockerModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBlocker} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Blocker Summary / Issue</label>
                <input
                  type="text"
                  placeholder="e.g. Meta 2FA SMS code required from client CEO"
                  value={newBlockerTitle}
                  onChange={(e) => setNewBlockerTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Risk Severity</label>
                  <select
                    value={newBlockerSeverity}
                    onChange={(e) => setNewBlockerSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Critical">Critical (Blocks Launch)</option>
                    <option value="High">High Severity</option>
                    <option value="Medium">Medium (Attention Needed)</option>
                    <option value="Low">Low Risk</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Assigned Owner</label>
                  <input
                    type="text"
                    value={newBlockerOwner}
                    onChange={(e) => setNewBlockerOwner(e.target.value)}
                    placeholder="e.g. Alex Morgan, Client POC"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Operational Impact &amp; Next Steps</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Pixel CAPI test events cannot be verified until DNS CNAME record is configured on Cloudflare."
                  value={newBlockerImpact}
                  onChange={(e) => setNewBlockerImpact(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBlockerModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Log Blocker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
