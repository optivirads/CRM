'use client';

import React, { useState, useEffect } from 'react';
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
  Square
} from 'lucide-react';

interface ClientOnboardingViewProps {
  onOpenClient360?: (clientId?: string, clientName?: string) => void;
  onNavigate?: (tab: any) => void;
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

export interface ChecklistStep {
  id: string;
  phaseId: number;
  phase: string;
  text: string;
  desc: string;
}

export interface CredentialItem {
  id: string;
  name: string;
  category: string;
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

export const ONBOARDING_24_STEPS: ChecklistStep[] = [
  // Phase 1: Sales Intake & Commercials (Steps 1 to 5)
  { id: 'st-1', phaseId: 1, phase: 'Phase 1: Sales Intake & Commercials', text: 'Countersigned MSA & Scope of Work (SOW) uploaded to vault', desc: 'Verify contract validity, billing SAC 998361 & signing authority' },
  { id: 'st-2', phaseId: 1, phase: 'Phase 1: Sales Intake & Commercials', text: 'Initial retainer advance deposit received & reconciled', desc: 'Ensure accounting ledger confirms invoice remittance' },
  { id: 'st-3', phaseId: 1, phase: 'Phase 1: Sales Intake & Commercials', text: 'Client portal organization and user accounts provisioned', desc: 'Create dedicated workspace and assign role privileges' },
  { id: 'st-4', phaseId: 1, phase: 'Phase 1: Sales Intake & Commercials', text: 'Account Manager (AM) & Pod delivery leads formally assigned', desc: 'Designate primary delivery contact and media specialist' },
  { id: 'st-5', phaseId: 1, phase: 'Phase 1: Sales Intake & Commercials', text: 'Dedicated Slack Connect or WhatsApp agency channel established', desc: 'Initialize VIP communications room with leadership' },

  // Phase 2: Assets & Platform Access (Steps 6 to 10)
  { id: 'st-6', phaseId: 2, phase: 'Phase 2: Assets & Platform Access', text: 'Meta Business Manager partnership access granted', desc: 'Verify pixel, ad account, product catalog & page admin roles' },
  { id: 'st-7', phaseId: 2, phase: 'Phase 2: Assets & Platform Access', text: 'Google Ads MCC & Google Analytics 4 (GA4) delegated', desc: 'Link Manager Account and test measurement streams' },
  { id: 'st-8', phaseId: 2, phase: 'Phase 2: Assets & Platform Access', text: 'Shopify Collaborator / Store Admin access verified', desc: 'Verify Theme, App & Checkout script permissions' },
  { id: 'st-9', phaseId: 2, phase: 'Phase 2: Assets & Platform Access', text: 'Google Tag Manager (GTM) & Server Container access provisioned', desc: 'Set up web & server-side container workspaces' },
  { id: 'st-10', phaseId: 2, phase: 'Phase 2: Assets & Platform Access', text: 'Brand guidelines, vector logos & raw creative assets collected', desc: 'Ingest visual identity, fonts, product b-roll & USPs' },

  // Phase 3: Architecture & Strategy Alignment (Steps 11 to 15)
  { id: 'st-11', phaseId: 3, phase: 'Phase 3: Architecture & Strategy Alignment', text: 'Server-side CAPI container deployment on Cloud Run verified', desc: 'Deploy first-party tracking container on custom sub-domain' },
  { id: 'st-12', phaseId: 3, phase: 'Phase 3: Architecture & Strategy Alignment', text: 'DNS verification & custom tagging SSL certificate active', desc: 'Ensure CNAME routing and SSL handshakes pass telemetry' },
  { id: 'st-13', phaseId: 3, phase: 'Phase 3: Architecture & Strategy Alignment', text: 'Historic account audit & blended CAC benchmark formalized', desc: 'Review past 90-day spend, ROAS leaks and wasted ad spend' },
  { id: 'st-14', phaseId: 3, phase: 'Phase 3: Architecture & Strategy Alignment', text: 'North Star ROAS & monthly CAC conversion targets defined', desc: 'Lock commercial scaling thresholds with client leadership' },
  { id: 'st-15', phaseId: 3, phase: 'Phase 3: Architecture & Strategy Alignment', text: 'Creative angle matrix & direct-response video hooks approved', desc: 'Plan initial sprint of 12 UGC video hooks and static ads' },

  // Phase 4: Alignment & Kickoff Call (Steps 16 to 20)
  { id: 'st-16', phaseId: 4, phase: 'Phase 4: Alignment & Kickoff Call', text: 'Executive Kickoff Video Meet conducted with client leads', desc: 'Align delivery timelines, SLA milestones and sprint cadence' },
  { id: 'st-17', phaseId: 4, phase: 'Phase 4: Alignment & Kickoff Call', text: 'Weekly reporting cadence & monthly review calendar locked', desc: 'Schedule recurring executive review video calls' },
  { id: 'st-18', phaseId: 4, phase: 'Phase 4: Alignment & Kickoff Call', text: 'Conversion test event fires validated in live browser test', desc: 'Simulate AddToCart & Purchase events through CAPI & pixel' },
  { id: 'st-19', phaseId: 4, phase: 'Phase 4: Alignment & Kickoff Call', text: 'First-week ad campaign drafts & ad copies submitted for review', desc: 'Deliver initial campaign structure in Meta & Google MCC' },
  { id: 'st-20', phaseId: 4, phase: 'Phase 4: Alignment & Kickoff Call', text: 'Commercial SOW deliverables & SAC compliance signed off', desc: 'Ensure contract SLA matrix is fully activated' },

  // Phase 5: Launch & Operational Delivery (Steps 21 to 24)
  { id: 'st-21', phaseId: 5, phase: 'Phase 5: Launch & Operational Delivery', text: 'Campaigns published live to Meta Graph API & Google Ads MCC', desc: 'Switch campaigns to Active with daily budget pacing' },
  { id: 'st-22', phaseId: 5, phase: 'Phase 5: Launch & Operational Delivery', text: 'Real-time telemetry streams & dashboard telemetry active', desc: 'Connect live analytics sync to OptiVir Executive Dashboard' },
  { id: 'st-23', phaseId: 5, phase: 'Phase 5: Launch & Operational Delivery', text: 'Initial 48-hour spend velocity & bid pacing check completed', desc: 'Audit CPMs, CPCs and conversion event delivery' },
  { id: 'st-24', phaseId: 5, phase: 'Phase 5: Launch & Operational Delivery', text: 'Final client handoff complete & transitioned to Live Delivery', desc: 'Transition account to continuous monthly retainer delivery' }
];

export const DEFAULT_CREDENTIALS: CredentialItem[] = [
  { id: 'cred-1', name: 'Meta Business Manager', category: 'Ad Networks', accessLevel: 'Partner Admin (Delegated)', status: 'Pending', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', notes: 'Partner ID #9201948201' },
  { id: 'cred-2', name: 'Google Ads MCC', category: 'Ad Networks', accessLevel: 'Standard Access', status: 'Pending', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', notes: 'MCC Link #842-192-0941' },
  { id: 'cred-3', name: 'Shopify Store Admin', category: 'E-Commerce Platform', accessLevel: 'Collaborator Access (Themes/Apps)', status: 'Pending', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', notes: 'Collaborator Code: 4892' },
  { id: 'cred-4', name: 'Google Tag Manager & GA4', category: 'Analytics & Tracking', accessLevel: 'Administrator', status: 'Granted', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', notes: 'GTM-KV92482 / G-9284291' },
  { id: 'cred-5', name: 'Server-Side CAPI DNS', category: 'Cloud Infrastructure', accessLevel: 'CNAME Delegation', status: 'Granted', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', notes: 'capi.branddomain.com -> cdn.optivirads.com' }
];

export const DEFAULT_ONBOARDING_ACCOUNTS: OnboardingAccount[] = [];

export const ClientOnboardingView: React.FC<ClientOnboardingViewProps> = ({ onOpenClient360, onNavigate }) => {
  const { showToast } = useToast();

  // Active selected client for detail view
  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optivir_selected_onboarding_id');
      if (saved) return saved;
    }
    return '';
  });

  // Detail Subtab: 'handoff' | 'assets' | 'strategy' | 'blockers' | 'timeline'
  const [detailTab, setDetailTab] = useState<'handoff' | 'assets' | 'strategy' | 'blockers' | 'timeline'>('handoff');

  // Filter stage
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

  // Sync tiers to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('optivir_onboarding_tiers', JSON.stringify(serviceTiers));
    } catch (e) { }
  }, [serviceTiers]);

  // Onboarding Accounts Dataset with localStorage
  const [accounts, setAccounts] = useState<OnboardingAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optivir_onboarding_accounts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
              .filter((a: any) => !['onb-1', 'onb-2', 'onb-3'].includes(a.id))
              .map((a: any) => ({
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
                currentStage: a.currentStage || 'Sales Handoff & Intake',
                stageIndex: typeof a.stageIndex === 'number' ? a.stageIndex : 0,
                daysInOnboarding: typeof a.daysInOnboarding === 'number' ? a.daysInOnboarding : 1,
                totalDaysTarget: typeof a.totalDaysTarget === 'number' ? a.totalDaysTarget : 14,
                completedSteps: typeof a.completedSteps === 'number' ? a.completedSteps : 0,
                totalSteps: 24,
                hasBlocker: Boolean(a.hasBlocker)
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
                  currentStage: c.status === 'Onboarding' ? 'Sales Handoff & Intake' : (c.onboarding_progress > 0 ? 'Technical Setup & CAPI' : 'Kickoff & Asset Collection'),
                  stageIndex: 0,
                  daysInOnboarding: 1,
                  totalDaysTarget: 14,
                  completedSteps: 0,
                  totalSteps: 24,
                  hasBlocker: c.health_status === 'At Risk',
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

  React.useEffect(() => {
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
  // TAB 2: Credentials Matrix State & Modals
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
    return DEFAULT_CREDENTIALS;
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
    setCredentials(DEFAULT_CREDENTIALS);
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
    showToast('Generating Asset Handover & Access Delegation PDF...', 'info');
    downloadClientPdf('report', {
      client: selectedClient.name,
      report_type: 'Client Onboarding Asset Handover & Access Delegation Matrix',
      tier: selectedClient.contractTier,
      lead: selectedClient.am
    });
  };

  // ==========================================
  // TAB 3: Strategy & North Star KPIs State
  // ==========================================
  const defaultStrategy: StrategyState = {
    roasTarget: '4.5x',
    cacTarget: '₹1,850',
    monthlySpendBudget: '₹5,00,000',
    attributionFidelity: '98.5%',
    primaryChannels: ['Meta Ads (Instagram / FB)', 'Google Search Intent', 'Shopify Headless CRO'],
    icpNotes: `Targeting enterprise buyers, high-intent consumers & decision makers. Primary objective is establishing verified high-trust proof of compliance, conversion optimization, and profitable scaling across omnichannel ad networks.`,
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
      showToast(`Strategy & North Star KPIs saved for ${selectedClient.name}!`, 'success');
    } catch {}
  };

  const toggleChannel = (ch: string) => {
    setStrategy(prev => {
      const exists = prev.primaryChannels.includes(ch);
      const updated = exists ? prev.primaryChannels.filter(c => c !== ch) : [...prev.primaryChannels, ch];
      return { ...prev, primaryChannels: updated };
    });
  };

  // ==========================================
  // TAB 4: Blockers & Risks State & Modals
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
      // Sync hasBlocker on the active account card
      const hasActiveBlockers = blockers.some(b => !b.resolved);
      setAccounts(prev => prev.map(a => a.id === selectedClient.id ? { ...a, hasBlocker: hasActiveBlockers } : a));
    }
  }, [blockers, selectedClient?.id]);

  // Add Blocker Modal
  const [showAddBlockerModal, setShowAddBlockerModal] = useState(false);
  const [newBlockerTitle, setNewBlockerTitle] = useState('');
  const [newBlockerSeverity, setNewBlockerSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newBlockerOwner, setNewBlockerOwner] = useState('Alex Morgan');
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
      owner: newBlockerOwner.trim() || 'Delivery Lead',
      dateReported: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      impact: newBlockerImpact.trim() || 'May impact milestone turnaround if unresolved.',
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
  // TAB 5: 24-Step Milestone Checklist State
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
    return {};
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
    setChecklist({});
  }, [selectedClient?.id]);

  const toggleChecklist = (id: string) => {
    if (!selectedClient?.id) return;
    setChecklist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(`optivir_checklist_${selectedClient.id}`, JSON.stringify(next));
      } catch {}

      const completedCount = Object.values(next).filter(Boolean).length;
      // Calculate 5-phase milestone stageIndex (0 to 4)
      const stageIdx = Math.min(4, Math.floor(completedCount / 5));
      const stages = [
        '1. Sales Handoff',
        '2. Assets & Access',
        '3. Strategy & KPIs',
        '4. Kickoff Call',
        '5. Team Launch'
      ];

      setAccounts(accts =>
        accts.map(a =>
          a.id === selectedClient.id
            ? {
                ...a,
                completedSteps: completedCount,
                stageIndex: stageIdx,
                currentStage: stages[stageIdx]
              }
            : a
        )
      );

      return next;
    });
  };

  const completedStepsCount = Object.values(checklist).filter(Boolean).length;
  const progressPct = Math.round((completedStepsCount / 24) * 100);

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
            <span className="font-semibold uppercase tracking-wider text-[11px]">Active Onboardings</span>
            <Rocket className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{accounts.length} Accounts</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">100% Tracking</span>
            <span>Avg 14 Days SLA</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Retainer Value in Handoff</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{accounts.reduce((acc, a) => acc + (parseInt(a.contractValue?.replace(/[^0-9]/g, '') || '0', 10)), 0).toLocaleString('en-IN')} / mo
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 font-bold">{accounts.length} In Pipeline</span>
            <span>Commercial Value</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Active Progress</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{progressPct}%</div>
          <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold">
            <span>{completedStepsCount} of 24 Total Checkpoints</span>
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
                { id: 'in_progress', label: `Active (${accounts.filter(a => a.stageIndex < 4).length})` },
                { id: 'blocked', label: `Blocked (${accounts.filter(a => a.hasBlocker).length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
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
                const cardPct = Math.round((acc.completedSteps / 24) * 100);

                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setSelectedClientId(acc.id);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('optivir_selected_onboarding_id', acc.id);
                      }
                    }}
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
                        <span>Commercial Scope:</span>
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
                        const numVal = parseInt(selectedClient.contractValue?.replace(/[^0-9]/g, '') || '0', 10);
                        let finalId = selectedClient.id;

                        try {
                          if (selectedClient.id && selectedClient.id.startsWith('onb-')) {
                            const res = await api.createClient({
                              company_name: selectedClient.name,
                              contract_value: numVal,
                              billing_frequency: 'monthly',
                              status: 'Active',
                              website: selectedClient.domain ? `https://${selectedClient.domain}` : undefined,
                              contact_name: selectedClient.primaryContact?.name,
                              contact_email: selectedClient.primaryContact?.email
                            });
                            if (res.success && res.data?.id) {
                              finalId = res.data.id;
                            }
                          } else {
                            await api.updateClient(selectedClient.id, { status: 'Active' });
                          }
                        } catch (e) {
                          console.warn('Sync client on launch error:', e);
                        }

                        showToast(`Successfully launched ${selectedClient.name} to Live Delivery! Synchronized to Clients Directory.`, 'success');
                        setAccounts(prev => prev.map(a => a.id === selectedClient.id ? { ...a, id: finalId, stageIndex: 5, currentStage: 'Live Delivery Active', completedSteps: 24, hasBlocker: false } : a));
                        setSelectedClientId(finalId);
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
                            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
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
                        className={`h-2 rounded-full transition-all duration-300 ${
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
                      { id: 'assets', label: 'Assets & Access Credentials', icon: Key, badge: credentials.length },
                      { id: 'strategy', label: 'Strategy & North Star', icon: Target },
                      { id: 'blockers', label: 'Blockers & Risks', icon: ShieldAlert, badge: blockers.length > 0 ? String(blockers.length) : undefined },
                      { id: 'timeline', label: 'Milestone Timeline (24 Steps)', icon: Clock, badge: `${completedStepsCount}/24` },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = detailTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setDetailTab(tab.id as any)}
                          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
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
                          <strong className="text-slate-800 dark:text-slate-200">SOW-{selectedClient?.id ? selectedClient.id.toUpperCase() : '1'}</strong>
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
                          <span className="text-slate-500">Account Lead:</span>
                          <span className="text-slate-800 dark:text-slate-200">{selectedClient?.am || 'Alex Morgan'}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1A2E] border border-slate-100 dark:border-slate-800 space-y-2">
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                          Commercial Deliverables
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          Deliverables defined under <strong>{selectedClient?.contractTier || 'Enterprise Retainer'}</strong>. Workstreams and SLA checklists are synchronized directly with delivery pods.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Signed Master Services Agreement (MSA) counter-signed by OptiVir Lead and Authorized Client Representative.</span>
                      </div>
                      <button
                        onClick={() => onNavigate && onNavigate('documents')}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0 cursor-pointer"
                      >
                        View in Documents Vault →
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: Assets & Access Credentials */}
                {detailTab === 'assets' && (
                  <div className="p-5 space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-blue-500" />
                          <span>Access Credentials &amp; Infrastructure Matrix</span>
                        </h3>
                        <p className="text-slate-500 text-[11px]">Audit and manually enter all 3rd-party accounts required for delivery or export the handover document</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={handleDownloadAssetHandoverPdf}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Generate Access PDF</span>
                        </button>
                        <button
                          onClick={() => setShowAddCredModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Credential Manually</span>
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
                              <td colSpan={6} className="p-6 text-center text-slate-400">
                                No credentials logged yet. Click "+ Add Credential Manually" above.
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
                  </div>
                )}

                {/* TAB 3: Strategy & North Star KPIs */}
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
                        <p className="text-slate-500 text-[10px]">Blended across Paid Search &amp; Meta</p>
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

                    <div className="space-y-2">
                      <label className="font-bold text-slate-900 dark:text-white block">Primary Scaling Channels</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Meta Ads (Instagram / FB)',
                          'Google Search Intent',
                          'Performance Max',
                          'YouTube Video Action',
                          'Shopify Headless CRO',
                          'Organic SEO & Content',
                          'Influencer Whitelisting'
                        ].map(ch => {
                          const isSelected = strategy.primaryChannels.includes(ch);
                          return (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => toggleChannel(ch)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0A1628] text-white border-[#0A1628] dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}{ch}
                            </button>
                          );
                        })}
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

                {/* TAB 4: Blockers & Risk Mitigation */}
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

                {/* TAB 5: Milestone Timeline (24 Steps) */}
                {detailTab === 'timeline' && (
                  <div className="p-5 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>24-Step Onboarding SLA Execution Checklist</span>
                        </h3>
                        <p className="text-slate-500 text-[11px]">
                          Check items as they are audited to advance the 5-phase onboarding stepper and delivery timeline
                        </p>
                      </div>
                      <span className="font-bold text-[#B91C1C] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60">
                        {completedStepsCount} of 24 Completed ({progressPct}%)
                      </span>
                    </div>

                    <div className="space-y-6">
                      {[1, 2, 3, 4, 5].map((phaseNum) => {
                        const phaseSteps = ONBOARDING_24_STEPS.filter(s => s.phaseId === phaseNum);
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
                                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
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
                    currentStage: 'Sales Handoff & Intake',
                    stageIndex: 0,
                    daysInOnboarding: 1,
                    totalDaysTarget: 14,
                    completedSteps: 0,
                    totalSteps: 24,
                    hasBlocker: false,
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

      {/* MODAL 2: Add Credential Manually Modal */}
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
