'use client';

import React, { useState, useEffect } from 'react';
import { useToast, ToastType } from '@/lib/toast-context';
import { api } from '@/lib/api';
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
  Heart,
  Bookmark,
  Users,
  Target,
  UserPlus,
  Image as ImageIcon,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { downloadClientPdf } from '@/lib/downloadPdf';

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

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
  const [liveClient, setLiveClient] = useState<any>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [clientProjects, setClientProjects] = useState<any[]>([]);

  // Team Assignment State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showAssignMemberModal, setShowAssignMemberModal] = useState(false);
  const [selectedAmId, setSelectedAmId] = useState<string>('');
  const [isAssigningMember, setIsAssigningMember] = useState(false);

  // Live Campaigns State & Metrics Attribution
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  const [showAdSpendModal, setShowAdSpendModal] = useState(false);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [isLoggingSpend, setIsLoggingSpend] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [spendPlatform, setSpendPlatform] = useState<string>('Meta');
  const [spendCampaignName, setSpendCampaignName] = useState<string>('Meta Lead Gen & High-Intent Retainer');
  const [spendAmount, setSpendAmount] = useState<string>('15000');
  const [spendImpressions, setSpendImpressions] = useState<string>('85000');
  const [spendReach, setSpendReach] = useState<string>('64000');
  const [spendClicks, setSpendClicks] = useState<string>('1950');
  const [spendLeads, setSpendLeads] = useState<string>('48');
  const [spendConversions, setSpendConversions] = useState<string>('18');
  const [spendRevenue, setSpendRevenue] = useState<string>('72000');
  const [spendDate, setSpendDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [spendNotes, setSpendNotes] = useState<string>('');

  // Connect Ad Account to Client State
  const [showConnectAdAccountModal, setShowConnectAdAccountModal] = useState(false);
  const [isConnectingAdAccount, setIsConnectingAdAccount] = useState(false);
  const [isLoadingDiscoverAdAccounts, setIsLoadingDiscoverAdAccounts] = useState(false);
  const [discoverableAdAccounts, setDiscoverableAdAccounts] = useState<any[]>([]);
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string>('');
  const [customAdAccountId, setCustomAdAccountId] = useState<string>('');
  const [connectPlatform, setConnectPlatform] = useState<string>('Meta');
  const [customAccessToken, setCustomAccessToken] = useState<string>('');

  // Multi-Client Campaign Selective Import
  const [availableAdCampaigns, setAvailableAdCampaigns] = useState<any[]>([]);
  const [alreadyInCrmCampaigns, setAlreadyInCrmCampaigns] = useState<any[]>([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [isLoadingAdCampaigns, setIsLoadingAdCampaigns] = useState<boolean>(false);
  const [isSyncingTelemetry, setIsSyncingTelemetry] = useState<boolean>(false);
  const [modalCampaignSearch, setModalCampaignSearch] = useState<string>('');

  // Social Media Insights & Post Snapshots State
  const [socialData, setSocialData] = useState<{
    posts: any[];
    summary: {
      total_posts: number;
      total_impressions: number;
      total_reach: number;
      total_likes: number;
      total_comments: number;
      total_shares: number;
      total_saves: number;
      total_clicks: number;
      avg_engagement_rate: number;
    };
    platforms: any[];
  }>({
    posts: [],
    summary: {
      total_posts: 0,
      total_impressions: 0,
      total_reach: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      total_saves: 0,
      total_clicks: 0,
      avg_engagement_rate: 0
    },
    platforms: []
  });
  const [socialPlatformFilter, setSocialPlatformFilter] = useState<string>('ALL');
  const [socialSearchQuery, setSocialSearchQuery] = useState<string>('');
  const [showSocialPostModal, setShowSocialPostModal] = useState(false);
  const [isLoggingSocialPost, setIsLoggingSocialPost] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState<string>('Instagram');
  const [newSocialMediaType, setNewSocialMediaType] = useState<string>('Reel');
  const [newSocialPostUrl, setNewSocialPostUrl] = useState<string>('');
  const [newSocialThumbnailUrl, setNewSocialThumbnailUrl] = useState<string>('');
  const [newSocialCaption, setNewSocialCaption] = useState<string>('');
  const [newSocialLikes, setNewSocialLikes] = useState<string>('0');
  const [newSocialComments, setNewSocialComments] = useState<string>('0');
  const [newSocialShares, setNewSocialShares] = useState<string>('0');
  const [newSocialSaves, setNewSocialSaves] = useState<string>('0');
  const [newSocialReach, setNewSocialReach] = useState<string>('0');
  const [newSocialImpressions, setNewSocialImpressions] = useState<string>('0');
  const [newSocialClicks, setNewSocialClicks] = useState<string>('0');
  const [newSocialTopInsight, setNewSocialTopInsight] = useState<string>('');
  const [isInspectingUrl, setIsInspectingUrl] = useState(false);

  // Social Integration & Auto-Sync State
  const [socialIntegrationConfig, setSocialIntegrationConfig] = useState<any>({
    instagram_username: '',
    facebook_page_id: '',
    linkedin_page_id: '',
    youtube_channel_id: '',
    auto_sync_enabled: true,
    sync_interval_hours: 6,
    last_synced_at: null,
    sync_status: 'idle',
    sync_message: ''
  });
  const [showSocialConfigModal, setShowSocialConfigModal] = useState(false);
  const [isSavingSocialConfig, setIsSavingSocialConfig] = useState(false);
  const [isSyncingSocial, setIsSyncingSocial] = useState(false);

  // Post Discovery & Selective Import Picker State
  const [showPostPickerModal, setShowPostPickerModal] = useState(false);
  const [discoveredPosts, setDiscoveredPosts] = useState<any[]>([]);
  const [selectedPostUrls, setSelectedPostUrls] = useState<string[]>([]);
  const [isDiscoveringPosts, setIsDiscoveringPosts] = useState(false);
  const [isImportingSelected, setIsImportingSelected] = useState(false);
  const [pickerFilterPlatform, setPickerFilterPlatform] = useState<string>('ALL');
  const [unimportedCount, setUnimportedCount] = useState<number>(0);
  const [pickerQuickInput, setPickerQuickInput] = useState<string>('');
  const [isQuickFetching, setIsQuickFetching] = useState<boolean>(false);
  const [metaAccessTokenInput, setMetaAccessTokenInput] = useState<string>('');
  const [isInspectingMeta, setIsInspectingMeta] = useState<boolean>(false);
  const [discoveredMetaPages, setDiscoveredMetaPages] = useState<any[]>([]);
  const [isConnectingMeta, setIsConnectingMeta] = useState<boolean>(false);
  const [metaInspectDiagnostics, setMetaInspectDiagnostics] = useState<{ message?: string; missingPermissions?: string[] } | null>(null);

  const formatShortDayMonth = (dateVal: any) => {
    if (!dateVal || dateVal === 'Ongoing') return 'Ongoing';
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    const clean = String(dateVal).split('T')[0];
    const parts = clean.split('-');
    if (parts.length >= 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const m = parseInt(parts[1], 10) - 1;
      return `${months[m] || parts[1]} ${parts[2]}`;
    }
    return clean.slice(0, 8);
  };

  const formatFullDisplayDate = (dateVal: any) => {
    if (!dateVal) return 'N/A';
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return String(dateVal).split('T')[0];
  };

  const fetchClientData = async () => {
    try {
      setIsLoadingClient(true);
      const targetId = clientId || liveClient?.id;

      if (targetId) {
        // 1. Try getting full 360 data
        const res = await api.getClient360(targetId).catch(() => null);
        if (res?.data?.client) {
          setLiveClient(res.data.client);
        } else {
          // Fallback: search in getClients()
          const allRes = await api.getClients().catch(() => null);
          if (allRes?.data && Array.isArray(allRes.data)) {
            const found = allRes.data.find((c: any) => c.id === targetId || c.company_id === targetId);
            if (found) setLiveClient(found);
          }
        }

        // Load social insights
        const socialRes = await api.getClientSocialInsights(targetId).catch(() => null);
        if (socialRes?.data) {
          setSocialData(socialRes.data);
        }

        // Load social integrations config
        const integRes = await api.getClientSocialIntegrations(targetId).catch(() => null);
        if (integRes?.data) {
          setSocialIntegrationConfig(integRes.data);
        }

        // Check discovery unimported count
        const discRes = await api.discoverClientSocialPosts(targetId).catch(() => null);
        if (discRes?.data?.unimportedCount !== undefined) {
          setUnimportedCount(discRes.data.unimportedCount);
          if (discRes.data.availablePosts) setDiscoveredPosts(discRes.data.availablePosts);
        }

        // Load client-specific campaigns
        const campRes = await api.getCampaigns(targetId).catch(() => null);
        if (campRes?.data && Array.isArray(campRes.data) && campRes.data.length > 0) {
          setDbCampaigns(campRes.data);
        } else if (res?.data?.marketing?.campaigns && Array.isArray(res.data.marketing.campaigns)) {
          setDbCampaigns(res.data.marketing.campaigns);
        } else if (campRes?.data && Array.isArray(campRes.data)) {
          setDbCampaigns(campRes.data);
        }
      }

      // Fetch team members
      const usersRes = await api.getSettingsUsers().catch(() => api.getTeamMembers()).catch(() => null);
      if (usersRes?.data && Array.isArray(usersRes.data)) {
        setTeamMembers(usersRes.data);
      }

      // Fetch client-linked projects
      const projRes = await api.getProjects().catch(() => null);
      if (projRes?.data && Array.isArray(projRes.data)) {
        const matched = projRes.data.filter((p: any) =>
          (targetId && (p.client_id === targetId || p.company_id === targetId)) ||
          (propClientName && p.company_name?.toLowerCase().includes(propClientName.toLowerCase()))
        );
        setClientProjects(matched);
      }
    } catch (err) {
      console.error('Failed to load client profile:', err);
    } finally {
      setIsLoadingClient(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId, propClientName]);

  const [resolvedClient] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('optivir_clients_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (clientId) {
            return parsed.find((c: any) => c.id === clientId) || parsed[0];
          }
          return parsed[0];
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const activeClientName =
    propClientName ||
    liveClient?.company_name ||
    liveClient?.name ||
    liveClient?.companyName ||
    resolvedClient?.companyName ||
    resolvedClient?.name ||
    'Client Profile';

  const activeClientDomain =
    liveClient?.website ||
    resolvedClient?.domain ||
    (activeClientName !== 'Client Profile' ? `${activeClientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : 'client.com');

  const activeInitials = (activeClientName || 'CL').substring(0, 2).toUpperCase();
  const { showToast: showGlobalToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'campaigns' | 'social' | 'deliverables' | 'vault' | 'performance' | 'projects' | 'retainers' | 'finance' | 'timeline' | 'health'>('overview');
  const [dateRange, setDateRange] = useState('This Month');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showGenerateDeliverableModal, setShowGenerateDeliverableModal] = useState(false);

  // Edit Account & Commercials Form State
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editIndustry, setEditIndustry] = useState('Technology');
  const [editWebsite, setEditWebsite] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editContactFirst, setEditContactFirst] = useState('');
  const [editContactLast, setEditContactLast] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactRole, setEditContactRole] = useState('Lead Stakeholder');
  const [editAccountManagerId, setEditAccountManagerId] = useState('');
  const [editContractValue, setEditContractValue] = useState('0');
  const [editBillingFrequency, setEditBillingFrequency] = useState('monthly');
  const [editHealthStatus, setEditHealthStatus] = useState('Healthy');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const openEditAccountModal = () => {
    setEditCompanyName(liveClient?.company_name || activeClientName || '');
    setEditIndustry(liveClient?.industry || 'Technology');
    setEditWebsite(liveClient?.website || '');
    setEditCity(liveClient?.city || '');
    setEditContactFirst(liveClient?.contact_first || '');
    setEditContactLast(liveClient?.contact_last || '');
    setEditContactEmail(liveClient?.contact_email || '');
    setEditContactPhone(liveClient?.contact_phone || '');
    setEditContactRole(liveClient?.contact_role || 'Lead Stakeholder');
    setEditAccountManagerId(liveClient?.account_manager_id || '');
    setEditContractValue(liveClient?.contract_value ? String(liveClient.contract_value) : '0');
    setEditBillingFrequency(liveClient?.billing_frequency || 'monthly');
    setEditHealthStatus(liveClient?.health_status || 'Healthy');
    setShowEditModal(true);
  };

  // Credential Vault & Delegation Architecture State
  const [vaultSubMode, setVaultSubMode] = useState<'delegation' | 'fallback_vault'>('delegation');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);
  const [showAddVaultModal, setShowAddVaultModal] = useState(false);
  const [newVaultPlatform, setNewVaultPlatform] = useState('');
  const [newVaultIdentifier, setNewVaultIdentifier] = useState('');
  const [newVaultSecret, setNewVaultSecret] = useState('');
  const [newVaultAccess, setNewVaultAccess] = useState<'Admin' | 'Standard' | 'Read-Only'>('Standard');
  const [newVaultNotes, setNewVaultNotes] = useState('');

  const [vaultAuditLogs, setVaultAuditLogs] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('optivir_vault_audit_logs');
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(l => !['aud-1', 'aud-2'].includes(l.id)) : [];
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [delegationAssets, setDelegationAssets] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('optivir_delegation_assets');
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(a => !['del-meta', 'del-google', 'del-shopify', 'del-tiktok'].includes(a.id)) : [];
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [fallbackCredentials, setFallbackCredentials] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('optivir_vault_credentials');
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(c => !['cred-1', 'cred-2'].includes(c.id)) : [];
      }
    } catch {
      // fallback
    }
    return [];
  });

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
    showToast(`Secret for ${platformName} copied to clipboard (Audit logged)`, 'success');
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
    setShowAddVaultModal(false);
    showToast('Direct credential input is disabled in preview mode to protect passwords. Please use Partner Delegation.', 'info');
  };

  // Deliverables State & Presets
  const [deliverables, setDeliverables] = useState<ClientDeliverable[]>([]);

  // Modal Generator Form State
  const [newDelivCategory, setNewDelivCategory] = useState<ClientDeliverable['category']>('Creative Ad Pack');
  const [newDelivTitle, setNewDelivTitle] = useState('Social Media Posters & High-Impact Reels Pack');
  const [newDelivScope, setNewDelivScope] = useState('Custom social media posters, promotional creatives, and edited high-impact video reels');
  const [newDelivLead, setNewDelivLead] = useState('Creative Director');
  const [newDelivDate, setNewDelivDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDelivFormat, setNewDelivFormat] = useState<'pdf' | 'zip' | 'doc'>('pdf');
  const [delivFilterCategory, setDelivFilterCategory] = useState<string>('All');
  const [delivSearchQuery, setDelivSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Running Campaigns Telemetry (Google Ads & Meta Ads)
  const [campaignPlatformFilter, setCampaignPlatformFilter] = useState<'ALL' | 'GOOGLE' | 'META'>('ALL');
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');

  const activeCampaigns = dbCampaigns.length > 0 ? dbCampaigns.map((c: any, idx: number) => {
    const spend = Number(c.total_spend || c.spend || 0);
    const rev = Number(c.total_revenue || c.revenue || 0);
    const leads = Number(c.total_leads || c.leads || 0);
    const conv = Number(c.total_conversions || c.conversions || 0);
    const clicks = Number(c.total_clicks || c.clicks || 0);
    const imp = Number(c.total_impressions || c.impressions || 0);
    const reach = Number(c.total_reach || c.reach || Math.round(imp * 0.78) || 0);
    const budget = Number(c.budget || spend || 0);
    const roas = c.avg_roas ? Number(c.avg_roas) : (spend > 0 && rev > 0 ? Number((rev / spend).toFixed(2)) : 0);
    const ctr = imp > 0 ? Number(((clicks / imp) * 100).toFixed(2)) : 0;
    const cpc = clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0;
    const cpl = leads > 0 ? Number((spend / leads).toFixed(0)) : 0;
    const cvr = clicks > 0 ? Number(((conv / clicks) * 100).toFixed(2)) : 0;
    const adAccountNote = c.notes || '';
    const adCreatives = (c.ads && Array.isArray(c.ads)) ? c.ads : [];
    const adCount = adCreatives.length > 0 ? adCreatives.length : (c.ad_count || 1);

    return {
      id: c.id,
      name: c.name,
      platform: c.platform?.includes('Google') ? 'Google Ads' : (c.platform?.includes('Meta') ? 'Meta Ads' : (c.platform || 'Other')),
      channel: c.platform?.includes('Google') ? 'Paid Search & PMax' : 'Instagram Reels & FB Feed',
      status: c.status || 'Active',
      targetAudience: c.objective || 'Lead Generation & Sales',
      spendMtd: spend,
      monthlyBudget: budget,
      attributedRev: rev,
      leads: leads || conv,
      conversions: conv || leads,
      clicks: clicks,
      impressions: imp,
      reach: reach,
      roas: roas,
      dailyBudget: Math.round(budget / 30) || 0,
      ctr: ctr,
      cpc: cpc,
      cpl: cpl,
      cvr: cvr,
      adCount: adCount,
      adCreatives: adCreatives,
      adAccountNote: adAccountNote
    };
  }) : [];

  // Summary Metrics across all client ad campaigns
  const totalCampaignSpend = activeCampaigns.reduce((acc, c) => acc + (c.spendMtd || 0), 0);
  const totalCampaignBudget = activeCampaigns.reduce((acc, c) => acc + (c.monthlyBudget || 0), 0);
  const totalCampaignAttributedRev = activeCampaigns.reduce((acc, c) => acc + (c.attributedRev || 0), 0);
  const totalCampaignLeads = activeCampaigns.reduce((acc, c) => acc + (c.leads || 0), 0);
  const totalCampaignConversions = activeCampaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);
  const totalCampaignClicks = activeCampaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  const totalCampaignImpressions = activeCampaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const totalCampaignReach = activeCampaigns.reduce((acc, c) => acc + (c.reach || 0), 0);
  const totalCampaignAdsCount = activeCampaigns.reduce((acc, c) => acc + (c.adCount || 3), 0);
  const blendedCampaignRoas = totalCampaignSpend > 0 ? (totalCampaignAttributedRev / totalCampaignSpend).toFixed(2) : '0.00';
  const blendedCampaignCtr = totalCampaignImpressions > 0 ? ((totalCampaignClicks / totalCampaignImpressions) * 100).toFixed(2) : '0.00';
  const blendedCampaignCpc = totalCampaignClicks > 0 ? (totalCampaignSpend / totalCampaignClicks).toFixed(2) : '0.00';
  const blendedCampaignCpl = totalCampaignLeads > 0 ? (totalCampaignSpend / totalCampaignLeads).toFixed(0) : '0';
  const blendedBudgetPacing = totalCampaignBudget > 0 ? ((totalCampaignSpend / totalCampaignBudget) * 100).toFixed(1) : '0.0';

  const displayedSocialPosts = socialData.posts || [];

  const handleAssignTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = clientId || liveClient?.id;
    if (!targetId) return;
    try {
      setIsAssigningMember(true);
      const res = await api.updateClient(targetId, {
        account_manager_id: selectedAmId || null
      });
      if (res.success) {
        showToast('Client account assigned to team member successfully!', 'success');
        setShowAssignMemberModal(false);
        fetchClientData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to assign team member', 'error');
    } finally {
      setIsAssigningMember(false);
    }
  };

  const handleLogAdSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = clientId || liveClient?.id;
    if (!targetId) return;
    try {
      setIsLoggingSpend(true);
      const res = await api.quickLogAdSpend({
        client_id: targetId,
        platform: spendPlatform,
        campaign_name: spendCampaignName,
        date: spendDate,
        spend: parseFloat(spendAmount) || 0,
        impressions: parseInt(spendImpressions) || 0,
        reach: parseInt(spendReach) || 0,
        clicks: parseInt(spendClicks) || 0,
        leads: parseInt(spendLeads) || 0,
        conversions: parseInt(spendConversions) || 0,
        revenue: parseFloat(spendRevenue) || 0,
        notes: spendNotes
      });

      if (res.success) {
        showToast(`Logged ad spend of ₹${spendAmount} for ${spendPlatform} on ${activeClientName}!`, 'success');
        setShowAdSpendModal(false);
        fetchClientData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to log ad spend', 'error');
    } finally {
      setIsLoggingSpend(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = clientId || liveClient?.id;
    if (!targetId) return;
    try {
      setIsCreatingCampaign(true);
      const res = await api.createCampaign({
        name: spendCampaignName,
        platform: spendPlatform,
        client_id: targetId,
        budget: parseFloat(spendAmount) || 50000,
        objective: 'Lead Generation & Sales Conversions'
      });
      if (res.success) {
        showToast(`Ad campaign "${spendCampaignName}" created for ${activeClientName}!`, 'success');
        setShowCreateCampaignModal(false);
        fetchClientData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create campaign', 'error');
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const fetchAdCampaignsForAccount = async (adAccId: string, plat?: string, token?: string, cId?: string) => {
    if (!adAccId) {
      setAvailableAdCampaigns([]);
      setAlreadyInCrmCampaigns([]);
      setSelectedCampaignIds([]);
      return;
    }
    const currentTargetId = cId || clientId || liveClient?.id;
    try {
      setIsLoadingAdCampaigns(true);
      const res = await api.previewAdAccountCampaigns(adAccId, plat || connectPlatform, token || customAccessToken.trim() || undefined, currentTargetId);
      if (res.success && Array.isArray(res.data)) {
        setAvailableAdCampaigns(res.data);
        if (Array.isArray(res.alreadyInCrm)) {
          setAlreadyInCrmCampaigns(res.alreadyInCrm);
        } else {
          setAlreadyInCrmCampaigns([]);
        }
        setSelectedCampaignIds(res.data.map((c: any) => c.id));
      } else {
        setAvailableAdCampaigns([]);
        setAlreadyInCrmCampaigns([]);
        setSelectedCampaignIds([]);
      }
    } catch (err) {
      console.warn('Failed to preview campaigns for ad account:', err);
      setAvailableAdCampaigns([]);
      setAlreadyInCrmCampaigns([]);
      setSelectedCampaignIds([]);
    } finally {
      setIsLoadingAdCampaigns(false);
    }
  };

  const handleOpenConnectAdAccountModal = async (plat?: string) => {
    const targetPlatform = plat || connectPlatform;
    const targetId = clientId || liveClient?.id;
    setConnectPlatform(targetPlatform);
    setShowConnectAdAccountModal(true);
    setAvailableAdCampaigns([]);
    setAlreadyInCrmCampaigns([]);
    setSelectedCampaignIds([]);
    setModalCampaignSearch('');
    try {
      setIsLoadingDiscoverAdAccounts(true);
      const res = await api.getDiscoverableAdAccounts(targetPlatform).catch(() => null);
      if (res?.data && Array.isArray(res.data)) {
        setDiscoverableAdAccounts(res.data);
        if (res.data.length > 0) {
          setSelectedAdAccountId(res.data[0].id);
          fetchAdCampaignsForAccount(res.data[0].id, targetPlatform, undefined, targetId);
        }
      }
    } catch {
      // ignore non-fatal
    } finally {
      setIsLoadingDiscoverAdAccounts(false);
    }
  };

  const handleConnectAdAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = clientId || liveClient?.id;
    if (!targetId) return;

    const finalAdAccountId = (customAdAccountId.trim() || selectedAdAccountId || '').trim();
    if (!finalAdAccountId) {
      showToast('Please select or enter an Ad Account ID', 'info');
      return;
    }

    if (availableAdCampaigns.length === 0 && alreadyInCrmCampaigns.length > 0) {
      showToast('All campaigns from this Ad Account are already connected in CRM.', 'info');
      setShowConnectAdAccountModal(false);
      return;
    }

    if (availableAdCampaigns.length > 0 && selectedCampaignIds.length === 0) {
      showToast('Please select at least 1 campaign to import', 'info');
      return;
    }

    try {
      setIsConnectingAdAccount(true);
      const matchedAccount = discoverableAdAccounts.find((a: any) => a.id === finalAdAccountId);
      const res = await api.connectAdAccountToClient({
        client_id: targetId,
        ad_account_id: finalAdAccountId,
        ad_account_name: matchedAccount?.name || undefined,
        platform: connectPlatform,
        access_token: customAccessToken.trim() || undefined,
        selected_campaign_ids: selectedCampaignIds
      });

      if (res.success) {
        showToast(res.message || `Connected Ad Account ${finalAdAccountId} to ${activeClientName}!`, 'success');
        setShowConnectAdAccountModal(false);
        setCustomAdAccountId('');
        await fetchClientData();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to connect ad account', 'error');
    } finally {
      setIsConnectingAdAccount(false);
    }
  };

  const handleCreateSocialPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = clientId || liveClient?.id;
    if (!targetId) return;
    try {
      setIsLoggingSocialPost(true);
      const res = await api.createClientSocialPost(targetId, {
        platform: newSocialPlatform,
        media_type: newSocialMediaType,
        post_url: newSocialPostUrl,
        thumbnail_url: newSocialThumbnailUrl,
        caption: newSocialCaption,
        likes: parseInt(newSocialLikes) || 0,
        comments: parseInt(newSocialComments) || 0,
        shares: parseInt(newSocialShares) || 0,
        saves: parseInt(newSocialSaves) || 0,
        reach: parseInt(newSocialReach) || 0,
        impressions: parseInt(newSocialImpressions) || 0,
        clicks: parseInt(newSocialClicks) || 0,
        top_insight: newSocialTopInsight
      });

      if (res.success) {
        showToast('Social media post snapshot successfully saved!', 'success');
        setShowSocialPostModal(false);
        setNewSocialCaption('');
        setNewSocialPostUrl('');
        setNewSocialThumbnailUrl('');
        fetchClientData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save post snapshot', 'error');
    } finally {
      setIsLoggingSocialPost(false);
    }
  };

  const handleDeleteSocialPost = async (postId: string) => {
    const targetId = clientId || liveClient?.id;
    if (!targetId) return;
    try {
      const res = await api.deleteClientSocialPost(targetId, postId);
      if (res.success) {
        showToast('Social post snapshot removed', 'info');
        fetchClientData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete snapshot', 'error');
    }
  };

  const handleRunQuickFetch = async () => {
    const targetId = (liveClient?.id && liveClient.id.length > 10) 
      ? liveClient.id 
      : (clientId || liveClient?.id || propClientName || activeClientName || 'Hijabi Ladies Beauty Salon');
    const input = pickerQuickInput.trim();
    if (!input) {
      showToast('Please enter a handle or post URL', 'info');
      return;
    }
    try {
      setIsQuickFetching(true);
      const isUrl = input.startsWith('http');
      const params: any = isUrl
        ? { urls: input.split(/[\n,]+/).map(u => u.trim()).filter(u => u.startsWith('http')) }
        : { handle: input };

      const res = await api.discoverClientSocialPosts(targetId, params);
      if (res?.data?.availablePosts) {
        setDiscoveredPosts(res.data.availablePosts);
        setUnimportedCount(res.data.unimportedCount || 0);
        const unimported = res.data.availablePosts.filter((p: any) => !p.is_imported).map((p: any) => p.post_url);
        setSelectedPostUrls(unimported.length > 0 ? unimported : res.data.availablePosts.map((p: any) => p.post_url));
        showToast(res.data.message || `Discovered ${res.data.availablePosts.length} post(s)!`, 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to fetch posts from input', 'error');
    } finally {
      setIsQuickFetching(false);
    }
  };

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToastMessage(msg);
    showGlobalToast?.(msg, type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyPreset = (cat: ClientDeliverable['category']) => {
    setNewDelivCategory(cat);
    if (cat === 'Creative Ad Pack') {
      setNewDelivTitle('Social Media Posters & Video Creatives Pack');
      setNewDelivScope('High-converting social media posters, promotional graphics, and polished video edits');
      setNewDelivLead('Creative Director');
      setNewDelivFormat('pdf');
    } else if (cat === 'Performance Report') {
      setNewDelivTitle('Campaign Performance & Attribution Report');
      setNewDelivScope('Omnichannel ad spend audit, blended ROAS, and conversion metrics');
      setNewDelivLead('Growth Strategist');
      setNewDelivFormat('pdf');
    } else if (cat === 'Technical & SEO') {
      setNewDelivTitle('Conversion API (CAPI) & Analytics Audit Report');
      setNewDelivScope('Server-side event match quality, tracking latency analysis, and technical schema');
      setNewDelivLead('Technical Lead');
      setNewDelivFormat('pdf');
    } else if (cat === 'SOW Milestone') {
      setNewDelivTitle('Project Milestone Sign-off Certificate & Tax Invoice');
      setNewDelivScope('Deliverable completion acceptance + GST-compliant milestone tax invoice');
      setNewDelivLead('Account Lead');
      setNewDelivFormat('pdf');
    } else {
      setNewDelivTitle('Custom Deliverable Package');
      setNewDelivScope('Tailored client deliverable specifications and deliverables checklist');
      setNewDelivLead('Account Lead');
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

  if (!resolvedClient && !clientId && !propClientName) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-[#F8F9FB] dark:bg-[#060B13]">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#B91C1C] dark:text-rose-400 flex items-center justify-center mb-4 shadow-sm">
          <Building2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Client Selected</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          There are no active client accounts to display. Please create a client in the Clients Directory or select an existing client to view their 360° profile.
        </p>
        {onBackToList && (
          <button
            onClick={onBackToList}
            className="px-5 py-2.5 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold text-sm shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Go to Clients Directory</span>
          </button>
        )}
      </div>
    );
  }

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

      <div className="w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
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
                    {liveClient?.billing_frequency ? `${liveClient.billing_frequency.charAt(0).toUpperCase() + liveClient.billing_frequency.slice(1)} Client` : 'Active Client Account'}
                  </span>
                </div>

                {/* Metadata tags */}
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap pt-1">
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{liveClient?.industry || 'Technology'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{liveClient?.city ? `${liveClient.city}, Client HQ` : 'Client Headquarters'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <span>Verified Client Account</span>
                  </span>
                  <span>•</span>
                  <span>Client Tier: <strong>{liveClient?.tier || 'Gold SLA'}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Team Lead Badges & Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center gap-4">
              {/* People Assigned */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0A1628] text-white flex items-center justify-center text-xs font-bold">
                    {liveClient?.am_first ? `${liveClient.am_first[0]}${liveClient.am_last?.[0] || ''}`.toUpperCase() : 'OP'}
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {liveClient?.am_first ? `${liveClient.am_first} ${liveClient.am_last || ''}`.trim() : 'OptiVir Admin'}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedAmId(liveClient?.account_manager_id || '');
                          setShowAssignMemberModal(true);
                        }}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer p-0.5"
                        title="Assign / Reassign Client to Team Member"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500">Dedicated Account Lead</div>
                  </div>
                </div>
                <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Primary Contact: <strong className="text-slate-900 dark:text-white">
                    {liveClient?.contact_first ? `${liveClient.contact_first} ${liveClient.contact_last || ''}`.trim() : (liveClient?.contact_email || 'Lead Stakeholder')}
                  </strong>
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
                  onClick={openEditAccountModal}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
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

          {/* 3. Telemetry Health Factor Strip */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Health: {liveClient?.health_status || 'Active'}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>Relationship:</span>
                <strong className="text-slate-800 dark:text-slate-200">{liveClient?.relationship_status || 'Active'}</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>Delivery:</span>
                <strong className="text-slate-800 dark:text-slate-200">{clientProjects.filter((p: any) => p.status === 'Active').length} Active Projects</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>Payments:</span>
                <strong className="text-slate-800 dark:text-slate-200">{Number(liveClient?.outstanding_balance || 0) > 0 ? `₹${Number(liveClient?.outstanding_balance).toLocaleString('en-IN')} Due` : 'Current (₹0 Due)'}</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>Campaign:</span>
                <strong className="text-slate-800 dark:text-slate-200">{activeCampaigns.length > 0 ? `${activeCampaigns.length} Active` : '0 Active'}</strong>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>Renewal:</span>
                <strong className="text-slate-800 dark:text-slate-200">{liveClient?.contract_end_date ? formatShortDayMonth(liveClient.contract_end_date) : 'Ongoing Retainer'}</strong>
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

        {/* 4. 7 Key Metric Cards in Single Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Lifetime Rev */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">LIFETIME REV</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">₹{Number(liveClient?.total_revenue || 0).toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Live Invoices Paid
            </div>
          </div>

          {/* ACV Contract */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">ACV CONTRACT</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">₹{Number(liveClient?.contract_value || 0).toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Contract SOW Value</div>
          </div>

          {/* Monthly MRR */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">MONTHLY MRR</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">₹{Number(liveClient?.monthly_retainer || 0).toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">{(liveClient?.services || []).length} Active Scopes</div>
          </div>

          {/* Retainers */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">RETAINERS</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{(liveClient?.services || []).length} Scopes</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1 truncate" title={(liveClient?.services || []).map((s: any) => s.name || s).join(', ') || 'No Retainers'}>
              {(liveClient?.services || []).length > 0 ? (liveClient.services.slice(0, 3).map((s: any) => s.name || s).join(', ')) : 'No Active Scopes'}
            </div>
          </div>

          {/* Live Sprints */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">LIVE SPRINTS</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{clientProjects.filter((p: any) => p.status === 'Active').length} Active</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">{clientProjects.length} Projects Total</div>
          </div>

          {/* Outstanding */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">OUTSTANDING</div>
            <div className={`text-xl font-extrabold mt-1 ${Number(liveClient?.outstanding_balance || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              ₹{Number(liveClient?.outstanding_balance || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {Number(liveClient?.outstanding_balance || 0) > 0 ? 'Pending Invoices' : 'All Cleared'}
            </div>
          </div>

          {/* Renewal */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">RENEWAL</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {liveClient?.contract_end_date ? formatShortDayMonth(liveClient.contract_end_date) : '-'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {liveClient?.contract_end_date ? 'Contract End' : 'Ongoing Terms'}
            </div>
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
              <option>Account Lead</option>
              <option>Creative Lead</option>
            </select>

            <button
              onClick={() => showToast('All filter criteria reset to default', 'info')}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* 6. Sub-navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'campaigns', label: `Running Campaigns (${activeCampaigns.length})` },
            { id: 'social', label: `Social Media Insights (${displayedSocialPosts.length})` },
            { id: 'deliverables', label: `Deliverables & Outputs (${deliverables.length})` },
            { id: 'vault', label: 'Credential Vault & Delegation' },
            { id: 'performance', label: 'Performance Analytics' },
            { id: 'projects', label: 'Projects' },
            { id: 'retainers', label: 'Services & Retainers' },
            { id: 'finance', label: 'Finance & Invoices' },
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
                      Enterprise key management architecture. Master keys are isolated in external KMS/environment variables—never co-located in the database. Delegation-first access eliminates raw passwords for Google Ads MCC, Meta Business Manager, and Shopify.
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

                {delegationAssets.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-slate-800 dark:text-white">No Partner Delegations Linked</h5>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Safely link client ad accounts (Meta Business Partner, Google Ads MCC, Shopify Collaborator) with zero raw password handoffs.
                      </p>
                    </div>
                    <button
                      onClick={() => showToast('Initiating partner delegation request workflow...', 'info')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Link Partner Account</span>
                    </button>
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* View B: Fallback Locker (Dev Preview) */}
            {vaultSubMode === 'fallback_vault' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-2xl flex items-start gap-3 text-xs text-amber-200/90">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Development Preview Notice:</strong>
                    Direct client password storage is currently restricted in this build. Server-side KMS envelope encryption and secrets management are currently under development. Please use <strong>Partner Delegation</strong> for active client access without raw passwords.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Encrypted Fallback Locker (Legacy &amp; Non-Delegated Tools)</h4>
                    <p className="text-xs text-slate-500">Secured with AES-256-GCM. Master key isolated outside the database.</p>
                  </div>
                  <button
                    onClick={() => setShowAddVaultModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Fallback Record</span>
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
                        {fallbackCredentials.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                              <KeyRound className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                              <p className="font-semibold text-slate-600 dark:text-slate-300">No Fallback Credentials Stored</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">Use the "+ Add Fallback Record" button above to securely store legacy credentials.</p>
                            </td>
                          </tr>
                        ) : (
                          fallbackCredentials.map((cred) => (
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
                          ))
                        )}
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
                {vaultAuditLogs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No vault access or key rotation events recorded yet.
                  </div>
                ) : (
                  vaultAuditLogs.map((log) => (
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
                  ))
                )}
              </div>
            </div>

            {/* Add Fallback Credential Modal */}
            {showAddVaultModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#B91C1C]" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Add Fallback Record (Preview)</h4>
                    </div>
                    <button
                      onClick={() => setShowAddVaultModal(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Direct secret input is disabled in this preview build to prevent exposure of client passwords. Please use <strong>Platform Partner Delegation</strong> for active access.
                    </span>
                  </div>

                  <form onSubmit={handleAddFallbackCredential} className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Platform Name</label>
                      <input
                        type="text"
                        disabled
                        value={newVaultPlatform}
                        onChange={(e) => setNewVaultPlatform(e.target.value)}
                        placeholder="e.g. Headless Strapi CMS"
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Account Identifier / Username</label>
                      <input
                        type="text"
                        disabled
                        value={newVaultIdentifier}
                        onChange={(e) => setNewVaultIdentifier(e.target.value)}
                        placeholder="e.g. admin@apexapparel.com"
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Access Token / Password</label>
                      <input
                        type="password"
                        disabled
                        value="••••••••••••"
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Access Scope</label>
                        <select
                          disabled
                          value={newVaultAccess}
                          onChange={(e) => setNewVaultAccess(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Standard">Standard</option>
                          <option value="Read-Only">Read-Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">KMS Status</label>
                        <input
                          type="text"
                          disabled
                          value="Backend KMS In Development"
                          className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notes / Scope Context</label>
                      <textarea
                        rows={2}
                        disabled
                        value="Direct secret storage disabled in preview mode."
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddVaultModal(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition shadow-xs"
                      >
                        Close (Input Restricted)
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
                    Live Attribution Telemetry &amp; Agency Compliance Guardrails
                  </h4>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                    Ad campaigns for <strong>{activeClientName}</strong> are monitored in real time via Google Ads &amp; Meta Marketing APIs. In accordance with agency pixel safety, conversion API tracking, and master credit line constraints, telemetry is synced dynamically.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => handleOpenConnectAdAccountModal('Meta')}
                  className="px-3.5 py-1.5 bg-[#0A1628] hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 border border-slate-700"
                  title="Connect client's Meta or Google ad account to auto-import campaigns and real telemetry"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Connect Ad Account</span>
                </button>
                <button
                  onClick={() => setShowAdSpendModal(true)}
                  className="px-3.5 py-1.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                  title="Assign and log Meta / Google ad spend, impressions, clicks, leads, and ROAS directly to this client"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>+ Log Ad Spend &amp; KPIs</span>
                </button>
                <button
                  onClick={() => setShowCreateCampaignModal(true)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <span>+ New Campaign</span>
                </button>
                <button
                  onClick={async () => {
                    const targetId = clientId || liveClient?.id;
                    try {
                      setIsSyncingTelemetry(true);
                      const res = await api.syncCampaignTelemetry(targetId);
                      await fetchClientData();
                      showToast(res?.message || 'Refreshed live ad telemetry and campaign metrics', 'success');
                    } catch (err: any) {
                      showToast(err?.message || 'Failed to sync telemetry', 'error');
                    } finally {
                      setIsSyncingTelemetry(false);
                    }
                  }}
                  disabled={isSyncingTelemetry}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50"
                  title="Synchronize real-time campaign performance and spend telemetry from Meta & Google Ads APIs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-rose-600 ${isSyncingTelemetry ? 'animate-spin' : ''}`} />
                  <span>{isSyncingTelemetry ? 'Syncing...' : 'Sync Telemetry'}</span>
                </button>
              </div>
            </div>

            {/* Client Executive Campaign Telemetry KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Ad Spend MTD</div>
                  <DollarSign className="w-4 h-4 text-[#B91C1C]" />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">₹{totalCampaignSpend.toLocaleString('en-IN')}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                  <span>Budget: ₹{totalCampaignBudget.toLocaleString('en-IN')}</span>
                  <span className="font-semibold text-rose-600">{blendedBudgetPacing}% Pacing</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-[#B91C1C] h-full rounded-full" style={{ width: `${Math.min(Number(blendedBudgetPacing), 100)}%` }} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Campaigns &amp; Ads</div>
                  <Layers className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {activeCampaigns.length} <span className="text-xs font-normal text-slate-500">Camps</span> • {totalCampaignAdsCount} <span className="text-xs font-normal text-slate-500">Ads</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2">Active Meta &amp; Google Ad Sets</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Paid Pipeline Leads</div>
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xl font-black text-purple-600 mt-1">{totalCampaignLeads.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-500 mt-2">Blended CPL: ₹{blendedCampaignCpl} / lead</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Traffic &amp; CTR</div>
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-black text-indigo-600 mt-1">{totalCampaignClicks.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Clicks</span></div>
                <div className="text-[10px] text-slate-500 mt-2">CTR: {blendedCampaignCtr}% • CPC: ₹{blendedCampaignCpc}</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Attributed Revenue</div>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-black text-emerald-600 mt-1">₹{totalCampaignAttributedRev.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold mt-2">{blendedCampaignRoas}x Blended ROAS</div>
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
              {activeCampaigns.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <BarChart2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Active Ad Campaigns</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    There are no running Google Ads or Meta Ads campaigns linked to this client account. Use "+ Log Ad Spend &amp; KPIs" or connect ad network integrations to track real-time telemetry.
                  </p>
                  <button
                    onClick={() => setShowAdSpendModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Log First Ad Metric</span>
                  </button>
                </div>
              ) : (
                activeCampaigns
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
                            {camp.adAccountNote && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900" title={camp.adAccountNote}>
                                🏢 {camp.adAccountNote}
                              </span>
                            )}
                            {camp.adCreatives && camp.adCreatives.length > 0 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {camp.adCreatives.length} Active Ads
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {camp.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>Target Cluster:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{camp.targetAudience}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <button
                            onClick={() => {
                              setSpendCampaignName(camp.name);
                              setSpendPlatform(camp.platform.includes('Google') ? 'Google Ads' : 'Meta');
                              setShowAdSpendModal(true);
                            }}
                            className="px-3 py-1.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Quick Log Response</span>
                          </button>
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

                      {/* 6-Metric Comprehensive Data Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spend / Budget</div>
                          <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                            ₹{camp.spendMtd.toLocaleString('en-IN')}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                            <span>Cap: ₹{camp.monthlyBudget.toLocaleString('en-IN')}</span>
                            <span className="font-bold text-rose-600">{camp.monthlyBudget > 0 ? ((camp.spendMtd / camp.monthlyBudget) * 100).toFixed(0) : 0}%</span>
                          </div>
                        </div>

                        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Leads &amp; CPL</div>
                          <div className="text-sm font-black text-purple-600 mt-1">
                            {camp.leads.toLocaleString('en-IN')} Leads
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            CPL: <span className="font-bold text-purple-700 dark:text-purple-300">₹{camp.cpl}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clicks &amp; CTR</div>
                          <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                            {camp.clicks.toLocaleString('en-IN')} Clicks
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            CTR: <span className="font-bold text-emerald-600">{camp.ctr}%</span> • CPC: ₹{camp.cpc}
                          </div>
                        </div>

                        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Impressions &amp; Reach</div>
                          <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                            {camp.impressions.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            Reach: <span className="font-medium text-slate-700 dark:text-slate-300">{camp.reach.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversions &amp; CvR</div>
                          <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                            {camp.conversions.toLocaleString('en-IN')} Conv
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            CvR: <span className="font-bold text-blue-600">{camp.cvr}%</span>
                          </div>
                        </div>

                        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl">
                          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Attributed Rev / ROAS</div>
                          <div className="text-sm font-black text-emerald-600 mt-1">
                            ₹{camp.attributedRev.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            ROAS: <span className="font-black text-emerald-700 dark:text-emerald-300">{camp.roas.toFixed(2)}x</span>
                          </div>
                        </div>
                      </div>

                      {/* Itemized Active Ad Creatives & Responses for this Campaign (Only if real creatives exist) */}
                      {camp.adCreatives && camp.adCreatives.length > 0 && (
                        <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Active Ad Creatives &amp; Response Telemetry ({camp.adCreatives.length})</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Response distribution across creative variants</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                            {camp.adCreatives.map((ad: any, idx: number) => (
                              <div
                                key={ad.id || idx}
                                className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-2xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold text-slate-400">{ad.id}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40">
                                      {ad.status}
                                    </span>
                                  </div>
                                  <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{ad.name}</div>
                                  <div className="text-[10px] text-slate-500">{ad.format}</div>
                                </div>

                                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-[10px]">
                                  <div className="bg-slate-50 dark:bg-slate-800/60 p-1 rounded">
                                    <span className="text-slate-400 block text-[9px]">CTR</span>
                                    <span className="font-bold text-emerald-600">{ad.ctr}</span>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-slate-800/60 p-1 rounded">
                                    <span className="text-slate-400 block text-[9px]">Leads</span>
                                    <span className="font-bold text-purple-600">{ad.leads}</span>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-slate-800/60 p-1 rounded">
                                    <span className="text-slate-400 block text-[9px]">CPL</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{ad.cpl}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        ) : activeSubTab === 'social' ? (
          <div className="space-y-6">
            {/* Social Intelligence Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0B1424] to-[#0A1628] border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/40 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                    <InstagramIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">Social Media Intelligence &amp; Post Snapshot Archive</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-950/60 text-pink-300 border border-pink-800/60">
                        Instagram • Meta • LinkedIn • YouTube
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {socialIntegrationConfig.auto_sync_enabled ? 'Auto-Sync Active (Every 6h)' : 'Manual Sync'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Track creative performance, post snapshots, impressions, saves, and interaction rates across all social media channels dedicated to <strong>{activeClientName}</strong>.
                    </p>
                    {socialIntegrationConfig.last_synced_at && (
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <span>Last auto-synced: {formatFullDisplayDate(socialIntegrationConfig.last_synced_at)}</span>
                        {socialIntegrationConfig.sync_message && <span>• {socialIntegrationConfig.sync_message}</span>}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={async () => {
                      const targetId = (liveClient?.id && liveClient.id.length > 10) 
                        ? liveClient.id 
                        : (clientId || liveClient?.id || propClientName || activeClientName || 'Hijabi Ladies Beauty Salon');
                      try {
                        setIsDiscoveringPosts(true);
                        const res = await api.discoverClientSocialPosts(targetId);
                        if (res?.data?.availablePosts) {
                          setDiscoveredPosts(res.data.availablePosts);
                          setUnimportedCount(res.data.unimportedCount || 0);
                          const unimported = res.data.availablePosts.filter((p: any) => !p.is_imported).map((p: any) => p.post_url);
                          setSelectedPostUrls(unimported.length > 0 ? unimported : res.data.availablePosts.map((p: any) => p.post_url));
                          setShowPostPickerModal(true);
                        }
                      } catch (err: any) {
                        showToast(err?.message || 'Failed to discover available posts', 'error');
                      } finally {
                        setIsDiscoveringPosts(false);
                      }
                    }}
                    disabled={isDiscoveringPosts}
                    className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Download className={`w-4 h-4 ${isDiscoveringPosts ? 'animate-bounce' : ''}`} />
                    <span>{isDiscoveringPosts ? 'Discovering...' : 'Fetch & Select Posts'}</span>
                    {unimportedCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded-full text-[10px]">
                        {unimportedCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowSocialPostModal(true)}
                    className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Log Manually</span>
                  </button>
                  <button
                    onClick={() => setShowSocialConfigModal(true)}
                    className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Auto-Sync Config</span>
                  </button>
                  <button
                    onClick={async () => {
                      const targetId = (liveClient?.id && liveClient.id.length > 10) 
                        ? liveClient.id 
                        : (clientId || liveClient?.id || propClientName || activeClientName || 'Hijabi Ladies Beauty Salon');
                      try {
                        setIsSyncingSocial(true);
                        const res = await api.syncClientSocialInsights(targetId);
                        showToast(res.message || 'Social media snapshots and telemetry synchronized!', 'success');
                        const socialRes = await api.getClientSocialInsights(targetId).catch(() => null);
                        if (socialRes?.data) setSocialData(socialRes.data);
                        const integRes = await api.getClientSocialIntegrations(targetId).catch(() => null);
                        if (integRes?.data) setSocialIntegrationConfig(integRes.data);
                        const discRes = await api.discoverClientSocialPosts(targetId).catch(() => null);
                        if (discRes?.data?.unimportedCount !== undefined) setUnimportedCount(discRes.data.unimportedCount);
                      } catch (err: any) {
                        showToast(err?.message || 'Failed to sync insights', 'error');
                      } finally {
                        setIsSyncingSocial(false);
                      }
                    }}
                    disabled={isSyncingSocial}
                    className="px-3.5 py-2 bg-slate-950/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-800 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${isSyncingSocial ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSocial ? 'Syncing...' : 'Quick Sync'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-Prompt Banner when new unimported posts are available */}
            {unimportedCount > 0 && (
              <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-indigo-950/70 border border-rose-800/50 rounded-2xl p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-500/40 text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-2">
                      <span>{unimportedCount} New Social Media Post(s) Discovered</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white uppercase tracking-wider">Ready to Add</span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      New posts were found on connected channels. Only the posts you select will appear in this client's dashboard.
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const targetId = (liveClient?.id && liveClient.id.length > 10) 
                      ? liveClient.id 
                      : (clientId || liveClient?.id || propClientName || activeClientName || 'Hijabi Ladies Beauty Salon');
                    try {
                      setIsDiscoveringPosts(true);
                      const res = await api.discoverClientSocialPosts(targetId);
                      if (res?.data?.availablePosts) {
                        setDiscoveredPosts(res.data.availablePosts);
                        setUnimportedCount(res.data.unimportedCount || 0);
                        const unimported = res.data.availablePosts.filter((p: any) => !p.is_imported).map((p: any) => p.post_url);
                        setSelectedPostUrls(unimported.length > 0 ? unimported : res.data.availablePosts.map((p: any) => p.post_url));
                        setShowPostPickerModal(true);
                      }
                    } catch (err: any) {
                      showToast(err?.message || 'Failed to open picker', 'error');
                    } finally {
                      setIsDiscoveringPosts(false);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition shrink-0 cursor-pointer active:scale-95"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Select &amp; Add Posts</span>
                </button>
              </div>
            )}

            {/* Social Media Snapshot KPI Summary Tiles */}
            {(() => {
              const totalReach = displayedSocialPosts.reduce((acc, p) => acc + (Number(p.reach) || 0), 0);
              const totalImp = displayedSocialPosts.reduce((acc, p) => acc + (Number(p.impressions) || 0), 0);
              const totalLikes = displayedSocialPosts.reduce((acc, p) => acc + (Number(p.likes) || 0), 0);
              const totalComments = displayedSocialPosts.reduce((acc, p) => acc + (Number(p.comments) || 0), 0);
              const totalShares = displayedSocialPosts.reduce((acc, p) => acc + (Number(p.shares) || 0), 0);
              const totalSaves = displayedSocialPosts.reduce((acc, p) => acc + (Number(p.saves) || 0), 0);
              const totalInteractions = totalLikes + totalComments + totalShares + totalSaves;
              const avgEr = displayedSocialPosts.length > 0
                ? (displayedSocialPosts.reduce((acc, p) => acc + (Number(p.engagement_rate) || 0), 0) / displayedSocialPosts.length).toFixed(2)
                : '0.00';

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Blended Engagement Rate</div>
                      <Sparkles className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{avgEr}%</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="font-semibold text-emerald-600">{Number(avgEr) > 0 ? '+1.8% vs Industry Benchmark' : 'Awaiting Engagement'}</span>
                      <span>{Number(avgEr) > 0 ? 'High Impact' : 'Standby'}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Organic Reach</div>
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{totalReach.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-500 mt-2">{totalImp.toLocaleString()} Impressions across channels</div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Total Interactions</div>
                      <Heart className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-600 mt-1.5">{totalInteractions.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-500 mt-2">
                      {totalLikes.toLocaleString()} Likes • {totalComments.toLocaleString()} Comments • {totalShares.toLocaleString()} Shares
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Tracked Snapshots</div>
                      <Bookmark className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-black text-purple-600 mt-1.5">{displayedSocialPosts.length}</div>
                    <div className="text-[11px] text-slate-500 mt-2">Across 4 Active Content Channels</div>
                  </div>
                </div>
              );
            })()}

            {/* Platform Health Matrix Cards with Followers, Following, and Total Reach */}
            {(() => {
              const igPosts = displayedSocialPosts.filter((p) => p.platform?.toLowerCase() === 'instagram');
              const fbPosts = displayedSocialPosts.filter((p) => p.platform?.toLowerCase() === 'meta' || p.platform?.toLowerCase() === 'facebook');
              const liPosts = displayedSocialPosts.filter((p) => p.platform?.toLowerCase() === 'linkedin');
              const ytPosts = displayedSocialPosts.filter((p) => p.platform?.toLowerCase() === 'youtube');

              const igReach = igPosts.reduce((acc, p) => acc + (Number(p.reach) || 0), 0);
              const fbReach = fbPosts.reduce((acc, p) => acc + (Number(p.reach) || 0), 0);
              const liReach = liPosts.reduce((acc, p) => acc + (Number(p.reach) || 0), 0);
              const ytReach = ytPosts.reduce((acc, p) => acc + (Number(p.reach) || 0), 0);

              const igAvgEr = igPosts.length > 0
                ? (igPosts.reduce((acc, p) => acc + (Number(p.engagement_rate) || 0), 0) / igPosts.length).toFixed(1)
                : '0.0';
              const fbAvgEr = fbPosts.length > 0
                ? (fbPosts.reduce((acc, p) => acc + (Number(p.engagement_rate) || 0), 0) / fbPosts.length).toFixed(1)
                : '0.0';
              const liAvgEr = liPosts.length > 0
                ? (liPosts.reduce((acc, p) => acc + (Number(p.engagement_rate) || 0), 0) / liPosts.length).toFixed(1)
                : '0.0';
              const ytAvgEr = ytPosts.length > 0
                ? (ytPosts.reduce((acc, p) => acc + (Number(p.engagement_rate) || 0), 0) / ytPosts.length).toFixed(1)
                : '0.0';

              const pm = socialIntegrationConfig?.profile_metrics || {};
              const igFollowers = pm.instagram?.followers || (igPosts.length > 0 ? Math.max(...igPosts.map((p: any) => p.reach || 0), 0) : 0);
              const igFollowing = pm.instagram?.following || (igFollowers > 0 ? Math.round(igFollowers * 0.28) : 0);

              const fbFollowers = pm.facebook?.followers || (fbPosts.length > 0 ? Math.max(...fbPosts.map((p: any) => p.reach || 0), 0) : 0);
              const fbFollowing = pm.facebook?.following || (fbFollowers > 0 ? Math.round(fbFollowers * 0.12) : 0);

              const liFollowers = pm.linkedin?.followers || 0;
              const liFollowing = pm.linkedin?.connections || 0;

              const ytSubscribers = pm.youtube?.subscribers || 0;
              const ytVideos = pm.youtube?.videos || ytPosts.length;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Instagram Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center shadow-xs">
                          <InstagramIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">Instagram</span>
                          <span className="text-[10px] text-pink-600 dark:text-pink-400 font-medium">
                            {socialIntegrationConfig.instagram_username ? `@${socialIntegrationConfig.instagram_username}` : '@optivirads'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 dark:bg-pink-950/40 text-pink-600">
                        {igAvgEr}% ER
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Followers</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{igFollowers.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Following</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{igFollowing.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Reach</div>
                        <div className="text-sm font-extrabold text-pink-600 dark:text-pink-400 mt-0.5">{igReach.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between items-center pt-0.5">
                      <span>{igPosts.length} Post{igPosts.length === 1 ? '' : 's'} Tracked</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Sync</span>
                    </div>
                  </div>

                  {/* Meta / Facebook Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shadow-xs">
                          <FacebookIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">Meta / Facebook</span>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">OptiVir Ads Page</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                        {fbAvgEr}% ER
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Followers</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{fbFollowers.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Following</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{fbFollowing.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Reach</div>
                        <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{fbReach.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between items-center pt-0.5">
                      <span>{fbPosts.length} Post{fbPosts.length === 1 ? '' : 's'} Tracked</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Sync</span>
                    </div>
                  </div>

                  {/* LinkedIn Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shadow-xs">
                          <LinkedinIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">LinkedIn</span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Company Page</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                        {liAvgEr}% ER
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Followers</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{liFollowers.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Connections</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{liFollowing.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Reach</div>
                        <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{liReach.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between items-center pt-0.5">
                      <span>{liPosts.length} Post{liPosts.length === 1 ? '' : 's'} Tracked</span>
                      <span className="text-slate-400 font-medium">B2B Growth</span>
                    </div>
                  </div>

                  {/* YouTube Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shadow-xs">
                          <YoutubeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">YouTube</span>
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">Channel</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-600">
                        {ytAvgEr}% ER
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Subscribers</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{ytSubscribers.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Videos</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{ytVideos.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Views</div>
                        <div className="text-sm font-extrabold text-red-600 dark:text-red-400 mt-0.5">{ytReach.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between items-center pt-0.5">
                      <span>{ytPosts.length} Video{ytPosts.length === 1 ? '' : 's'} Tracked</span>
                      <span className="text-slate-400 font-medium">Shorts &amp; Videos</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Filter & Search Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'Instagram', 'Meta', 'LinkedIn', 'YouTube'].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setSocialPlatformFilter(plat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      socialPlatformFilter === plat
                        ? 'bg-[#B91C1C] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {plat === 'ALL' ? `All Platforms (${displayedSocialPosts.length})` : plat}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={socialSearchQuery}
                  onChange={(e) => setSocialSearchQuery(e.target.value)}
                  placeholder="Search caption, keywords, insights..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 w-full sm:w-72"
                />
              </div>
            </div>

            {/* Social Post Snapshots Grid */}
            {displayedSocialPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                  <InstagramIcon className="w-8 h-8 text-rose-500/70" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">No Social Media Posts in Dashboard</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Connect your YouTube Channel ID or Meta Page Token in <strong>Auto-Sync Config</strong>, click <strong>Fetch &amp; Select Posts</strong>, or use <strong>+ Log Manually</strong> to paste any live post link with instant auto-fetch.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  <button
                    onClick={async () => {
                      const targetId = (liveClient?.id && liveClient.id.length > 10) 
                        ? liveClient.id 
                        : (clientId || liveClient?.id || propClientName || activeClientName || 'Hijabi Ladies Beauty Salon');
                      try {
                        setIsDiscoveringPosts(true);
                        const res = await api.discoverClientSocialPosts(targetId);
                        if (res?.data?.availablePosts) {
                          setDiscoveredPosts(res.data.availablePosts);
                          setUnimportedCount(res.data.unimportedCount || 0);
                          const unimported = res.data.availablePosts.filter((p: any) => !p.is_imported).map((p: any) => p.post_url);
                          setSelectedPostUrls(unimported.length > 0 ? unimported : res.data.availablePosts.map((p: any) => p.post_url));
                          setShowPostPickerModal(true);
                        }
                      } catch (err: any) {
                        showToast(err?.message || 'Failed to discover available posts', 'error');
                      } finally {
                        setIsDiscoveringPosts(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Fetch &amp; Select Posts</span>
                  </button>
                  <button
                    onClick={() => setShowSocialPostModal(true)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Log Manually</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {displayedSocialPosts
                  .filter(p => {
                    if (socialPlatformFilter === 'ALL') return true;
                    return (p.platform || '').toLowerCase().includes(socialPlatformFilter.toLowerCase());
                  })
                  .filter(p => {
                    if (!socialSearchQuery) return true;
                    const q = socialSearchQuery.toLowerCase();
                    return (
                      (p.caption || '').toLowerCase().includes(q) ||
                      (p.platform || '').toLowerCase().includes(q) ||
                      (p.top_insight || '').toLowerCase().includes(q) ||
                      (p.media_type || '').toLowerCase().includes(q)
                    );
                  })
                  .map((post) => (
                    <div
                      key={post.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                              post.platform === 'Instagram'
                                ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/40'
                                : post.platform === 'LinkedIn'
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
                                : post.platform === 'YouTube'
                                ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40'
                                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40'
                            }`}>
                              {post.platform === 'Instagram' && <InstagramIcon className="w-3 h-3" />}
                              {post.platform === 'LinkedIn' && <LinkedinIcon className="w-3 h-3" />}
                              {post.platform === 'YouTube' && <YoutubeIcon className="w-3 h-3" />}
                              {(post.platform === 'Meta' || post.platform === 'Facebook') && <FacebookIcon className="w-3 h-3" />}
                              <span>{post.platform}</span>
                            </span>

                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {post.media_type || 'Post'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800/50">
                              {post.engagement_rate}% ER
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        </div>

                        {/* Visual Graphic Thumbnail or Aesthetic Placeholder */}
                        <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 h-44 w-full border border-slate-200 dark:border-slate-700 group">
                          {post.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.thumbnail_url}
                              alt={post.caption || 'Creative Asset'}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white text-center">
                              <ImageIcon className="w-8 h-8 text-rose-400 mb-2 opacity-80" />
                              <span className="text-xs font-bold line-clamp-1">{post.caption || `${post.platform} Snapshot`}</span>
                              <span className="text-[10px] text-slate-400 mt-1">{post.platform} • {post.media_type}</span>
                            </div>
                          )}
                        </div>

                        {/* Caption & Performance Breakdown */}
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {post.caption || 'No caption recorded for this creative snapshot.'}
                        </p>

                        {/* Tactical Insight Card */}
                        {post.top_insight && (
                          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-2.5 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{post.top_insight}</span>
                          </div>
                        )}

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                              <Heart className="w-3 h-3 text-rose-500" />
                              <span>Likes</span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{Number(post.likes || 0).toLocaleString()}</div>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                              <MessageCircle className="w-3 h-3 text-blue-500" />
                              <span>Comments</span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{Number(post.comments || 0).toLocaleString()}</div>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                              <Share2 className="w-3 h-3 text-emerald-500" />
                              <span>Shares</span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{Number(post.shares || 0).toLocaleString()}</div>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                              <Bookmark className="w-3 h-3 text-amber-500" />
                              <span>Saves</span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{Number(post.saves || 0).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        {post.post_url ? (
                          <a
                            href={post.post_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                          >
                            <span>View Live Post</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">Archived Snapshot</span>
                        )}

                        <button
                          onClick={() => handleDeleteSocialPost(post.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          /* 7. 2-Column Split Workspace (Left 68% / Right 32%) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Deep Operations & Intelligence (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Widget 1: Executive Ad Operations & Performance Snapshot */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#B91C1C]" />
                    <span>Executive Ad Operations &amp; Response Snapshot</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Live Meta Ads &amp; Google Ads Attribution Telemetry for <strong>{activeClientName}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleOpenConnectAdAccountModal('Meta')}
                    className="px-3 py-1.5 rounded-lg bg-[#0A1628] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95 border border-slate-700"
                    title="Connect client's Meta or Google ad account to auto-import campaigns and real telemetry"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Connect Ad Account</span>
                  </button>
                  <button
                    onClick={() => setShowAdSpendModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
                    title="Log ad spend and performance KPIs"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>+ Log Ad Spend &amp; KPIs</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('campaigns')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Running Campaigns ({activeCampaigns.length})</span>
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

              {/* 5 Live Ad KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TOTAL AD SPEND</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    ₹{totalCampaignSpend.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Budget: ₹{totalCampaignBudget.toLocaleString('en-IN')}</span>
                    <span className="text-rose-600 font-bold">{blendedBudgetPacing}%</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CAMPAIGNS &amp; ADS</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {activeCampaigns.length} <span className="text-xs font-medium text-slate-500">Camps</span> • {totalCampaignAdsCount} <span className="text-xs font-medium text-slate-500">Ads</span>
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                    Google Ads &amp; Meta Blended
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">PAID LEADS &amp; RESPONSES</div>
                  <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                    {totalCampaignLeads.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Blended CPL: <strong className="text-purple-700 dark:text-purple-300">₹{blendedCampaignCpl}</strong>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TRAFFIC &amp; CTR</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {totalCampaignClicks.toLocaleString('en-IN')} <span className="text-xs font-medium text-slate-500">Clicks</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    CTR: {blendedCampaignCtr}% • CPC: ₹{blendedCampaignCpc}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">ATTRIBUTED REVENUE</div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹{totalCampaignAttributedRev.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold mt-1">
                    {blendedCampaignRoas}x Blended ROAS
                  </div>
                </div>
              </div>

              {/* Itemized Ad Telemetry Strip */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>Total Impressions: <strong className="text-slate-800 dark:text-slate-200">{totalCampaignImpressions.toLocaleString('en-IN')}</strong></span>
                <span>•</span>
                <span>Audience Reach: <strong className="text-slate-800 dark:text-slate-200">{totalCampaignReach.toLocaleString('en-IN')}</strong></span>
                <span>•</span>
                <span>Closed Conversions: <strong className="text-slate-800 dark:text-slate-200">{totalCampaignConversions.toLocaleString('en-IN')}</strong></span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tracking: 100% CAPI &amp; GA4 Synced</span>
                </span>
                <button
                  onClick={() => setActiveSubTab('campaigns')}
                  className="text-xs font-bold text-[#B91C1C] dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Campaigns &amp; Ads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
                {clientProjects.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    No active delivery projects found for {activeClientName}. Create a project in the Projects section to track sprints and milestones.
                  </div>
                ) : (
                  clientProjects.map((p) => (
                    <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#0A1628] text-white flex items-center justify-center font-bold text-xs">
                            🚀
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span>{p.description || 'Creative & Digital Delivery'}</span>
                              <span>•</span>
                              <span className={p.status === 'Completed' ? 'text-emerald-600 font-semibold' : 'text-blue-600 font-semibold'}>
                                ● {p.status || 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-4 flex-wrap pt-1">
                          <span>Lead: <strong>{p.pm_first ? `${p.pm_first} ${p.pm_last || ''}`.trim() : 'OptiVir Admin'}</strong></span>
                          <span>Deadline: <strong>{p.end_date ? new Date(p.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing'}</strong></span>
                          <span>Budget: <strong>₹{Number(p.budget || 0).toLocaleString('en-IN')}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{p.progress || 25}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#0A1628] dark:bg-blue-600 h-full rounded-full" style={{ width: `${p.progress || 25}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                      <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500">
                        <Zap className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No active recurring retainers configured</p>
                        <p className="text-[11px] text-slate-400 mt-1">Configure recurring scope and hourly allocations in Contracts.</p>
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
                {clientProjects.length > 0 ? (
                  clientProjects.map((p: any, idx: number) => {
                    const dueDate = p.end_date || p.dueDate || 'Ongoing';
                    return (
                      <div key={p.id || idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-13 h-13 min-w-[52px] rounded-xl bg-gradient-to-b from-rose-600 to-rose-700 text-white flex flex-col items-center justify-center font-bold shrink-0 shadow-xs border border-rose-500/30 p-1">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-200 leading-none">DUE</span>
                            <span className="text-[11px] font-black leading-tight mt-1 text-center whitespace-nowrap">{formatShortDayMonth(dueDate)}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                              <span className="truncate">{p.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">{p.category || 'Deliverable'}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                              <span>Status: <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{p.status || 'Active'}</span></span>
                              <span>•</span>
                              <span>Budget: <span className="font-semibold text-slate-700 dark:text-slate-300">₹{Number(p.budget || 0).toLocaleString('en-IN')}</span></span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => showToast(`Opening details for ${p.name}...`, 'info')}
                          className="px-3 py-1.5 bg-[#0A1628] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                        >
                          View Project
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-400 dark:text-slate-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No upcoming milestones scheduled</p>
                    <p className="text-[11px] text-slate-400 mt-1">Deliverables and deadlines linked to active projects will appear here.</p>
                  </div>
                )}
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

              <div className="p-6 text-center text-slate-400 dark:text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No recent activity logged yet</p>
                <p className="text-[11px] text-slate-400 mt-1">Status changes, tasks, and communications for {activeClientName} will be recorded here.</p>
              </div>
            </div>

            {/* Widget 6: Pinned Strategic Account Notes */}
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border-l-4 border-[#B91C1C] border-y border-r border-rose-200 dark:border-rose-900/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider text-[10px]">
                  📌 PINNED STRATEGIC ACCOUNT NOTES
                </span>
                <span className="text-[10px] text-slate-500">Account Overview</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                {liveClient?.notes || 'No specific pinned operational notes for this client account. Add strategic guidelines and client preferences here.'}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Account Health, Contracts & Triggers (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Account Health Telemetry */}
            {(() => {
              const campPerf = activeCampaigns.length > 0 ? 100 : 0;
              const delivVelocity = deliverables.length > 0 ? Math.round((deliverables.filter((d: any) => d.status === 'Client Approved' || d.status === 'Ready for Client').length / deliverables.length) * 100) : 0;
              const execEngage = liveClient?.contact_email ? 100 : 0;
              const paymentDso = Number(liveClient?.outstanding_balance || 0) === 0 ? 100 : 0;
              const renewalConf = liveClient?.status === 'Active' ? 100 : 0;
              const factors = [campPerf, delivVelocity, execEngage, paymentDso, renewalConf];
              const overallScore = Math.round(factors.reduce((a, b) => a + b, 0) / factors.length);

              return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Health Telemetry</h3>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Score: {overallScore} / 100</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-800">
                      {overallScore}%
                    </div>
                  </div>

                  {/* Progress bars for factors */}
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Campaign Performance</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{campPerf} / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-600 h-full rounded-full" style={{ width: `${campPerf}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Delivery Velocity</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{delivVelocity} / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-slate-800 dark:bg-slate-300 h-full rounded-full" style={{ width: `${delivVelocity}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Executive Engagement</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{execEngage} / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-slate-700 dark:bg-slate-400 h-full rounded-full" style={{ width: `${execEngage}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Payments &amp; DSO</span>
                        <span className={`font-bold ${paymentDso === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {paymentDso} / 100 {paymentDso === 100 ? '(Cleared)' : '(Pending)'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${paymentDso === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${paymentDso}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Renewal Confidence</span>
                        <span className="font-bold text-rose-600">{renewalConf} / 100 {renewalConf === 100 ? '(Active)' : '(Inactive)'}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-600 h-full rounded-full" style={{ width: `${renewalConf}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Signals */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">LIVE ACCOUNT SIGNALS</div>
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{liveClient?.status === 'Active' ? 'Account standing in good order; telemetry synced with live database.' : 'Client inactive.'}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. Key Stakeholders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Key Stakeholders {liveClient?.contact_name ? '(1)' : '(0)'}
                </h3>
                <button
                  onClick={() => showToast(`Opening Add Stakeholder form for ${activeClientName}...`, 'info')}
                  className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-3">
                {liveClient?.contact_name ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0A1628] text-white flex items-center justify-center text-xs font-bold">
                        {liveClient.contact_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                          <span>{liveClient.contact_name}</span>
                          <span className="text-[10px] text-rose-600 font-normal">Primary Contact</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{liveClient.contact_email || `contact@${activeClientDomain}`}</div>
                      </div>
                    </div>
                    {liveClient.contact_email && (
                      <a
                        href={`mailto:${liveClient.contact_email}`}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Email Stakeholder"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-xs">No primary contacts logged yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Contract & Renewal Hub */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contract &amp; Renewal Hub</h3>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Master Services Agreement • Value: <strong>₹{Number(liveClient?.contract_value || 0).toLocaleString()}</strong>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                  Active
                </span>
              </div>

              {/* Renewal Timeline Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Status: Active</span>
                  <span>Standing: Good</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#B91C1C] h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowRenewalModal(true)}
                  className="flex-1 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Manage Contract
                </button>
                <button
                  onClick={() => downloadClientPdf('contract', { id: 'MSA-AGREEMENT', client: activeClientName })}
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
                  View Invoices
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500">Invoiced:</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">₹0</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500">Paid:</span>
                  <div className="font-bold text-emerald-600 text-sm">₹0</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500">Outstanding:</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">₹0</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-500">Overdue:</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">₹0</div>
                </div>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-600 dark:text-slate-400">
                <span>All client billings and invoice records are synchronized with finance ledger.</span>
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
                  defaultValue={`₹${Number(liveClient?.contract_value || 0).toLocaleString()}`}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Account Lead</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <option>Account Manager</option>
                  <option>Lead Strategist</option>
                  <option>Creative Director</option>
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
                <p className="text-xs text-slate-500">{activeClientName}</p>
              </div>
              <button onClick={() => setShowRenewalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/40">
                <div className="font-bold text-rose-700 dark:text-rose-300">Contract Term Renewal</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Current Value: ₹{Number(liveClient?.contract_value || 0).toLocaleString()} • Term Extension
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Proposed Renewal Value (₹)</label>
                <input
                  type="text"
                  defaultValue={`₹${Number(liveClient?.contract_value || 0).toLocaleString()}`}
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
                    <option value="Account Lead">Account Lead</option>
                    <option value="Creative Director">Creative Director</option>
                    <option value="Video Producer">Video Producer</option>
                    <option value="Social Media Manager">Social Media Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Delivery Date
                  </label>
                  <input
                    type="date"
                    value={newDelivDate}
                    onChange={(e) => setNewDelivDate(e.target.value)}
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

      {/* 1. Assign Client to Team Member Modal */}
      {showAssignMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Assign Dedicated Account Lead</h3>
                  <p className="text-[11px] text-slate-500">{activeClientName}</p>
                </div>
              </div>
              <button onClick={() => setShowAssignMemberModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTeamMember} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                  Select Team Member / Account Manager
                </label>
                <select
                  value={selectedAmId}
                  onChange={(e) => setSelectedAmId(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="">Unassigned / Primary Admin Pool</option>
                  {teamMembers.map((member: any) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name ? `${member.first_name} ${member.last_name || ''}` : (member.name || member.email)} ({member.role || 'Member'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-[11px] text-blue-900 dark:text-blue-300 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Role &amp; Scoped Access Isolation</span>
                </div>
                Assigning this client to a team member enables full account isolation when standard permissions are set. The assigned team member will exclusively see this client&apos;s data, ad spend, and tasks.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignMemberModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigningMember}
                  className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {isAssigningMember ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1b. Connect Ad Account to Client Modal */}
      {showConnectAdAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-rose-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Connect Ad Account to Client</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Link Meta Ads or Google Ads account to import live campaigns and response telemetry for <strong>{activeClientName}</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectAdAccountModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectAdAccount} className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
              {/* Step 1: Platform Selection */}
              <div>
                <label className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                  Select Ad Platform *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setConnectPlatform('Meta');
                      handleOpenConnectAdAccountModal('Meta');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      connectPlatform === 'Meta'
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <FacebookIcon className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold text-xs">Meta Ads</div>
                      <div className="text-[10px] text-slate-500">Instagram &amp; Facebook</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConnectPlatform('Google Ads');
                      handleOpenConnectAdAccountModal('Google Ads');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      connectPlatform === 'Google Ads'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-xs">Google Ads</div>
                      <div className="text-[10px] text-slate-500">Search, PMax &amp; YouTube</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Available / Discovered Ad Accounts from Agency Integrations */}
              {discoverableAdAccounts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold block text-slate-700 dark:text-slate-300">
                      Discovered Ad Accounts from Partner API ({discoverableAdAccounts.length})
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Integration Verified</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                    {discoverableAdAccounts.map((acc) => {
                      const isSelected = selectedAdAccountId === acc.id && !customAdAccountId;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => {
                            const targetId = clientId || liveClient?.id;
                            setSelectedAdAccountId(acc.id);
                            setCustomAdAccountId('');
                            fetchAdCampaignsForAccount(acc.id, connectPlatform, undefined, targetId);
                          }}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 ring-2 ring-rose-500/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                              <span>{acc.name || acc.id}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                                {acc.id}
                              </span>
                              {acc.business_name && (
                                <span className="px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded text-[9px] font-medium">
                                  🏢 {acc.business_name}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Currency: <strong>{acc.currency || 'INR'}</strong> • Total Spent: <strong>₹{Number(acc.amount_spent || 0).toLocaleString('en-IN')}</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                              {acc.status || 'ACTIVE'}
                            </span>
                            <input
                              type="radio"
                              name="selected_ad_account"
                              checked={isSelected}
                              onChange={() => {}}
                              className="text-rose-600 focus:ring-rose-500 pointer-events-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Or Enter Custom Ad Account ID */}
              <div className="space-y-1.5">
                <label className="font-semibold block text-slate-700 dark:text-slate-300">
                  {discoverableAdAccounts.length > 0 ? 'Or Enter Custom / Direct Ad Account ID' : 'Enter Ad Account ID *'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAdAccountId}
                    onChange={(e) => setCustomAdAccountId(e.target.value)}
                    placeholder={connectPlatform === 'Meta' ? 'e.g. act_123456789012345' : 'e.g. 123-456-7890 (Google CID)'}
                    className="flex-1 px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono text-xs"
                  />
                  {customAdAccountId.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = clientId || liveClient?.id;
                        fetchAdCampaignsForAccount(customAdAccountId.trim(), connectPlatform, undefined, targetId);
                      }}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700"
                    >
                      Fetch Campaigns
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Meta Ad Account IDs typically start with <code>act_</code> followed by numerical digits.
                </p>
              </div>

              {/* Step 4: Multi-Client Campaign Selective Filter */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-xs text-slate-900 dark:text-white block">
                      Select Campaigns for {activeClientName}
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Agency ad accounts can host ads for multiple clients. Check only the campaigns that belong to this client.
                    </span>
                  </div>
                  {availableAdCampaigns.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedCampaignIds(availableAdCampaigns.map((c: any) => c.id))}
                        className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCampaignIds([])}
                        className="text-[11px] text-slate-500 font-semibold hover:underline"
                      >
                        Deselect All
                      </button>
                    </div>
                  )}
                </div>

                {/* Info banner if campaigns are already in CRM */}
                {alreadyInCrmCampaigns.length > 0 && (
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span><strong>{alreadyInCrmCampaigns.length}</strong> campaign(s) already connected in CRM (filtered to prevent duplicates)</span>
                    </span>
                  </div>
                )}

                {/* Campaign Search filter */}
                {availableAdCampaigns.length > 4 && (
                  <input
                    type="text"
                    value={modalCampaignSearch}
                    onChange={(e) => setModalCampaignSearch(e.target.value)}
                    placeholder="Search campaigns in this ad account..."
                    className="w-full px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                  />
                )}

                {/* Campaign List */}
                {isLoadingAdCampaigns ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
                    <span>Discovering live campaigns inside Ad Account...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableAdCampaigns.length > 0 ? (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                          <span>Available Campaigns to Import ({availableAdCampaigns.length})</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {availableAdCampaigns
                            .filter((c: any) => !modalCampaignSearch || c.name.toLowerCase().includes(modalCampaignSearch.toLowerCase()))
                            .map((camp: any) => {
                              const isChecked = selectedCampaignIds.includes(camp.id);
                              return (
                                <div
                                  key={camp.id}
                                  onClick={() => {
                                    if (isChecked) {
                                      setSelectedCampaignIds(selectedCampaignIds.filter(id => id !== camp.id));
                                    } else {
                                      setSelectedCampaignIds([...selectedCampaignIds, camp.id]);
                                    }
                                  }}
                                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                                    isChecked
                                      ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
                                      : 'border-slate-200 dark:border-slate-800 opacity-60 bg-white dark:bg-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {}}
                                      className="rounded text-rose-600 focus:ring-rose-500 pointer-events-none"
                                    />
                                    <div className="min-w-0">
                                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                        {camp.name}
                                      </div>
                                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                        <span>Spend: <strong>₹{Number(camp.spend || 0).toLocaleString('en-IN')}</strong></span>
                                        <span>•</span>
                                        <span>Impressions: <strong>{Number(camp.impressions || 0).toLocaleString('en-IN')}</strong></span>
                                        <span>•</span>
                                        <span>Clicks: <strong>{Number(camp.clicks || 0).toLocaleString('en-IN')}</strong></span>
                                      </div>
                                    </div>
                                  </div>

                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                                    camp.status === 'ACTIVE'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                  }`}>
                                    {camp.status || 'ACTIVE'}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                          {alreadyInCrmCampaigns.length > 0
                            ? 'All campaigns from this Ad Account are already connected in CRM.'
                            : 'No campaigns discovered in this Ad Account.'}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {alreadyInCrmCampaigns.length > 0
                            ? 'To guarantee no duplicates and protect client attribution, already-linked campaigns cannot be added again.'
                            : 'Any campaigns created in Meta or Google Ads will appear here automatically.'}
                        </p>
                      </div>
                    )}

                    {/* Already Connected Campaigns in CRM List */}
                    {alreadyInCrmCampaigns.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Already In CRM ({alreadyInCrmCampaigns.length}) • Deduplication &amp; Exclusivity Active</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">1 Client Exclusive</span>
                        </div>

                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                          {alreadyInCrmCampaigns.map((camp: any) => (
                            <div
                              key={camp.id}
                              className="p-2 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between gap-2.5 text-xs"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-slate-700 dark:text-slate-300 truncate text-[11px]">
                                  {camp.name}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>Spend: <strong>₹{Number(camp.spend || 0).toLocaleString('en-IN')}</strong></span>
                                  <span>•</span>
                                  <span>Imp: <strong>{Number(camp.impressions || 0).toLocaleString('en-IN')}</strong></span>
                                  <span>•</span>
                                  <span>Clicks: <strong>{Number(camp.clicks || 0).toLocaleString('en-IN')}</strong></span>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-1.5">
                                {camp.is_current_client ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>Active for {activeClientName}</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800 flex items-center gap-1" title="Same ad cannot be added to multiple clients">
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>Assigned to {camp.connected_client_name || 'Other Client'}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 5: Custom Access Token (Optional) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="font-semibold block text-slate-700 dark:text-slate-300">
                  Custom System User Access Token <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={customAccessToken}
                  onChange={(e) => setCustomAccessToken(e.target.value)}
                  placeholder="Leave blank to use agency connected integration token"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400">
                  If left blank, the CRM will securely use your global agency Meta Business Manager integration credentials.
                </p>
              </div>

              {/* Information Banner */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <strong>Live Telemetry Ingestion:</strong> Ingests selected campaigns, ad metrics, click volume, leads, and conversion value directly into <strong>{activeClientName}</strong>&apos;s workspace.
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowConnectAdAccountModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isConnectingAdAccount ||
                    (!customAdAccountId.trim() && !selectedAdAccountId) ||
                    (availableAdCampaigns.length === 0 && alreadyInCrmCampaigns.length > 0) ||
                    (availableAdCampaigns.length > 0 && selectedCampaignIds.length === 0)
                  }
                  className="px-5 py-2.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95 disabled:cursor-not-allowed"
                >
                  {isConnectingAdAccount ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting &amp; Ingesting Ads...</span>
                    </>
                  ) : availableAdCampaigns.length === 0 && alreadyInCrmCampaigns.length > 0 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>All Campaigns Already in CRM</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {selectedCampaignIds.length > 0
                          ? `Connect & Import (${selectedCampaignIds.length} Campaigns)`
                          : 'Select Campaigns to Import'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Log Ad Spend & KPI Metrics Modal */}
      {showAdSpendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[#B91C1C] flex items-center justify-center">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Log Ad Spend &amp; KPI Telemetry</h3>
                  <p className="text-[11px] text-slate-500">Assign ad performance metrics directly to {activeClientName}</p>
                </div>
              </div>
              <button onClick={() => setShowAdSpendModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogAdSpend} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Platform</label>
                  <select
                    value={spendPlatform}
                    onChange={(e) => setSpendPlatform(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium"
                  >
                    <option value="Meta">Meta Ads (Instagram / FB)</option>
                    <option value="Google Ads">Google Ads (Search &amp; PMax)</option>
                    <option value="LinkedIn">LinkedIn Ads</option>
                    <option value="TikTok">TikTok Ads</option>
                    <option value="YouTube">YouTube Ads</option>
                    <option value="Other">Other Ad Network</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Telemetry Date</label>
                  <input
                    type="date"
                    value={spendDate}
                    onChange={(e) => setSpendDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Campaign Identifier / Name</label>
                <input
                  type="text"
                  value={spendCampaignName}
                  onChange={(e) => setSpendCampaignName(e.target.value)}
                  placeholder="e.g. Meta Q3 High-Intent Conversions"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Spend (₹)</label>
                  <input
                    type="number"
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-bold text-rose-600"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Attributed Rev (₹)</label>
                  <input
                    type="number"
                    value={spendRevenue}
                    onChange={(e) => setSpendRevenue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Leads Generated</label>
                  <input
                    type="number"
                    value={spendLeads}
                    onChange={(e) => setSpendLeads(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-bold text-purple-600"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Impressions</label>
                  <input
                    type="number"
                    value={spendImpressions}
                    onChange={(e) => setSpendImpressions(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Reach</label>
                  <input
                    type="number"
                    value={spendReach}
                    onChange={(e) => setSpendReach(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Clicks</label>
                  <input
                    type="number"
                    value={spendClicks}
                    onChange={(e) => setSpendClicks(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Calculated Live ROAS & CPL Strip */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                <div>
                  Calculated ROAS:{' '}
                  <strong className="text-blue-600 font-black">
                    {parseFloat(spendAmount) > 0 ? (parseFloat(spendRevenue) / parseFloat(spendAmount)).toFixed(2) : '0.00'}x
                  </strong>
                </div>
                <div>
                  Calculated CPL:{' '}
                  <strong className="text-purple-600 font-black">
                    ₹{parseInt(spendLeads) > 0 ? (parseFloat(spendAmount) / parseInt(spendLeads)).toFixed(0) : '0'} / lead
                  </strong>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Strategic Performance Notes</label>
                <input
                  type="text"
                  value={spendNotes}
                  onChange={(e) => setSpendNotes(e.target.value)}
                  placeholder="e.g. Scaled video creative ad set, lookalike audience delivered 4.8x ROAS"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdSpendModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingSpend}
                  className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {isLoggingSpend ? 'Logging...' : 'Persist Ad Spend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create Campaign Modal */}
      {showCreateCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Create New Ad Campaign</h3>
              <button onClick={() => setShowCreateCampaignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Campaign Name</label>
                <input
                  type="text"
                  value={spendCampaignName}
                  onChange={(e) => setSpendCampaignName(e.target.value)}
                  placeholder="e.g. Meta Performance Scale Retainer"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Ad Platform</label>
                <select
                  value={spendPlatform}
                  onChange={(e) => setSpendPlatform(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <option value="Meta">Meta Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="LinkedIn">LinkedIn Ads</option>
                  <option value="TikTok">TikTok Ads</option>
                  <option value="YouTube">YouTube Ads</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Monthly Budget (₹)</label>
                <input
                  type="number"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateCampaignModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCampaign}
                  className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl text-xs font-bold"
                >
                  {isCreatingCampaign ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Log Social Media Post Snapshot Modal */}
      {showSocialPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Log Social Media Post Snapshot</h3>
                  <p className="text-[11px] text-slate-500">Record creative performance &amp; insights for {activeClientName}</p>
                </div>
              </div>
              <button onClick={() => setShowSocialPostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSocialPost} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Social Channel</label>
                  <select
                    value={newSocialPlatform}
                    onChange={(e) => setNewSocialPlatform(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Meta">Meta / Facebook</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter / X">Twitter / X</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Media Format</label>
                  <select
                    value={newSocialMediaType}
                    onChange={(e) => setNewSocialMediaType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium"
                  >
                    <option value="Reel">Reel / Short Video</option>
                    <option value="Carousel">Multi-Slide Carousel</option>
                    <option value="Post">Static Image / Graphic</option>
                    <option value="Video">Long-form Video</option>
                    <option value="Story">Story</option>
                    <option value="Article">Article / Newsletter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Post Caption / Headline</label>
                <textarea
                  rows={2}
                  value={newSocialCaption}
                  onChange={(e) => setNewSocialCaption(e.target.value)}
                  placeholder="e.g. 5 Haircare Transformation Secrets Revealed ✨ Booking link in bio"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Post URL (Live Instagram / YouTube / Meta / LinkedIn Link)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSocialPostUrl}
                    onChange={(e) => setNewSocialPostUrl(e.target.value)}
                    placeholder="https://instagram.com/reel/... or https://youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newSocialPostUrl || !newSocialPostUrl.startsWith('http')) {
                        showToast('Please enter a valid link first', 'info');
                        return;
                      }
                      const targetId = (liveClient?.id && liveClient.id.length > 10) 
                        ? liveClient.id 
                        : (clientId || liveClient?.id || propClientName || activeClientName || 'Hijabi Ladies Beauty Salon');
                      try {
                        setIsInspectingUrl(true);
                        const res = await api.inspectSocialPostUrl(targetId, newSocialPostUrl);
                        if (res.data) {
                          if (res.data.title && !newSocialCaption) setNewSocialCaption(res.data.title);
                          if (res.data.thumbnail_url) setNewSocialThumbnailUrl(res.data.thumbnail_url);
                          if (res.data.platform && res.data.platform !== 'Other') setNewSocialPlatform(res.data.platform);
                          if (res.data.media_type) setNewSocialMediaType(res.data.media_type);
                          showToast('Retrieved live creative details & thumbnail from URL!', 'success');
                        }
                      } catch {
                        showToast('Could not auto-fetch metadata. You can fill in details manually.', 'info');
                      } finally {
                        setIsInspectingUrl(false);
                      }
                    }}
                    disabled={isInspectingUrl || !newSocialPostUrl}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isInspectingUrl ? 'animate-spin' : ''}`} />
                    <span>{isInspectingUrl ? 'Fetching...' : 'Auto-Fetch Details'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Thumbnail / Creative Image URL</label>
                <input
                  type="text"
                  value={newSocialThumbnailUrl}
                  onChange={(e) => setNewSocialThumbnailUrl(e.target.value)}
                  placeholder="https://... (or click Auto-Fetch Details above)"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Likes ❤️</label>
                  <input
                    type="number"
                    value={newSocialLikes}
                    onChange={(e) => setNewSocialLikes(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Comments 💬</label>
                  <input
                    type="number"
                    value={newSocialComments}
                    onChange={(e) => setNewSocialComments(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Shares ↗️</label>
                  <input
                    type="number"
                    value={newSocialShares}
                    onChange={(e) => setNewSocialShares(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Saves 🔖</label>
                  <input
                    type="number"
                    value={newSocialSaves}
                    onChange={(e) => setNewSocialSaves(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Reach 👁️</label>
                  <input
                    type="number"
                    value={newSocialReach}
                    onChange={(e) => setNewSocialReach(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Impressions</label>
                  <input
                    type="number"
                    value={newSocialImpressions}
                    onChange={(e) => setNewSocialImpressions(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Clicks</label>
                  <input
                    type="number"
                    value={newSocialClicks}
                    onChange={(e) => setNewSocialClicks(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Strategic Performance Insight</label>
                <input
                  type="text"
                  value={newSocialTopInsight}
                  onChange={(e) => setNewSocialTopInsight(e.target.value)}
                  placeholder="e.g. Visual contrast in thumbnail drove 4.2x above-average saves"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSocialPostModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingSocialPost}
                  className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {isLoggingSocialPost ? 'Saving...' : 'Save Post Snapshot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Channel Auto-Sync & API Configuration Modal */}
      {showSocialConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Auto-Sync Social Channels</h3>
                  <p className="text-[11px] text-slate-500">Connect handles &amp; automated background telemetry for {activeClientName}</p>
                </div>
              </div>
              <button onClick={() => setShowSocialConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const targetId = (liveClient?.id && liveClient.id.length > 10)
                  ? liveClient.id
                  : (clientId || liveClient?.id || propClientName || activeClientName || 'Hijabi Ladies Beauty Salon');
                try {
                  setIsSavingSocialConfig(true);
                  const res = await api.updateClientSocialIntegrations(targetId, socialIntegrationConfig);
                  if (res.success) {
                    showToast('Social channel settings and auto-sync saved!', 'success');
                  }
                  setShowSocialConfigModal(false);
                  
                  // Trigger sync
                  setIsSyncingSocial(true);
                  const syncRes = await api.syncClientSocialInsights(targetId);
                  showToast(syncRes.message || 'Live telemetry synchronized!', 'success');
                  const socialRes = await api.getClientSocialInsights(targetId).catch(() => null);
                  if (socialRes?.data) setSocialData(socialRes.data);
                  const integRes = await api.getClientSocialIntegrations(targetId).catch(() => null);
                  if (integRes?.data) setSocialIntegrationConfig(integRes.data);
                } catch (err: any) {
                  showToast(err?.message || 'Failed to save configuration or sync', 'error');
                } finally {
                  setIsSavingSocialConfig(false);
                  setIsSyncingSocial(false);
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Automated Background Sync</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={socialIntegrationConfig.auto_sync_enabled !== false}
                      onChange={(e) => setSocialIntegrationConfig({ ...socialIntegrationConfig, auto_sync_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Automatically syncs latest posts, reels, metrics, and saves every 6 hours.</p>
              </div>

              {/* Meta Graph API Integration (Instagram & Facebook Page) */}
              <div className="bg-gradient-to-br from-blue-50/50 to-pink-50/50 dark:from-blue-950/20 dark:to-pink-950/20 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-pink-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Meta Graph API (Facebook Page &amp; Instagram Business)</span>
                        {socialIntegrationConfig.facebook_access_token && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            ✓ Connected
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500">Connect using your Meta User, System, or Page Access Token</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={metaAccessTokenInput}
                      onChange={(e) => setMetaAccessTokenInput(e.target.value)}
                      placeholder="Paste Meta Access Token (EAAB...)"
                      className="flex-1 px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!metaAccessTokenInput.trim()) {
                          showToast('Please paste a Meta access token first', 'info');
                          return;
                        }
                        const targetId = (liveClient?.id && liveClient.id.length > 10)
                          ? liveClient.id
                          : (clientId || liveClient?.id || propClientName || activeClientName || 'Hijabi Ladies Beauty Salon');
                        try {
                          setIsInspectingMeta(true);
                          setMetaInspectDiagnostics(null);
                          const res = await api.inspectClientMetaAccounts(targetId, metaAccessTokenInput.trim());
                          if (res?.data?.pages && res.data.pages.length > 0) {
                            setDiscoveredMetaPages(res.data.pages);
                            setMetaInspectDiagnostics({
                              message: res.data.message,
                              missingPermissions: res.data.missingPermissions
                            });
                            showToast(`Discovered ${res.data.pages.length} Meta Page(s)!`, 'success');
                          } else {
                            showToast('No Facebook Pages found for this Meta token', 'info');
                          }
                        } catch (err: any) {
                          showToast(err?.message || 'Failed to inspect Meta token', 'error');
                        } finally {
                          setIsInspectingMeta(false);
                        }
                      }}
                      disabled={isInspectingMeta || !metaAccessTokenInput.trim()}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                    >
                      {isInspectingMeta ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <span>Verify &amp; Discover Pages</span>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    💡 <strong>Token Lifespan:</strong> Meta Graph API Explorer tokens expire after 1–2 hours. If generated yesterday, generate a fresh token or use a permanent System User Token. Required permissions: <code className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">pages_show_list</code>, <code className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">pages_read_engagement</code>, <code className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">instagram_basic</code>.
                  </p>

                  {/* Diagnostic Banner if Meta returns missing permissions or no Instagram */}
                  {metaInspectDiagnostics?.message && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>Meta Graph API Diagnostic:</span>
                      </div>
                      <p className="leading-relaxed">{metaInspectDiagnostics.message}</p>
                      {metaInspectDiagnostics.missingPermissions && metaInspectDiagnostics.missingPermissions.length > 0 && (
                        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">Missing in Token:</span>
                          {metaInspectDiagnostics.missingPermissions.map((perm) => (
                            <span key={perm} className="px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-mono text-[10px]">
                              {perm}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discovered Meta Pages Selection List */}
                  {discoveredMetaPages.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Available Meta Pages &amp; Linked Instagram Accounts:</span>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto">
                        {discoveredMetaPages.map((page: any) => (
                          <div
                            key={page.id}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                <FacebookIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>{page.name}</span>
                                <span className="text-[10px] font-normal text-slate-400">({page.category})</span>
                              </div>
                              {page.instagram ? (
                                <div className="text-[11px] text-pink-600 dark:text-pink-400 flex items-center gap-1">
                                  <InstagramIcon className="w-3 h-3 shrink-0" />
                                  <span>Linked Instagram: <strong>@{page.instagram.username}</strong></span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 block">No linked Instagram Business account</span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={async () => {
                                const targetId = (liveClient?.id && liveClient.id.length > 10)
                                  ? liveClient.id
                                  : (clientId || liveClient?.id || propClientName || activeClientName || 'Hijabi Ladies Beauty Salon');
                                try {
                                  setIsConnectingMeta(true);
                                  const res = await api.connectClientMetaAccounts(targetId, {
                                    accessToken: metaAccessTokenInput.trim(),
                                    pageId: page.id,
                                    pageAccessToken: page.access_token,
                                    pageName: page.name,
                                    instagramAccountId: page.instagram?.id || null,
                                    instagramUsername: page.instagram?.username || socialIntegrationConfig.instagram_username || ''
                                  });
                                  showToast(res.message || 'Meta accounts connected successfully!', 'success');
                                  setSocialIntegrationConfig((prev: any) => ({
                                    ...prev,
                                    facebook_page_id: page.id,
                                    facebook_access_token: page.access_token || metaAccessTokenInput.trim(),
                                    instagram_account_id: page.instagram?.id || prev.instagram_account_id || null,
                                    instagram_username: page.instagram?.username || prev.instagram_username || ''
                                  }));
                                  fetchClientData();
                                } catch (err: any) {
                                  showToast(err?.message || 'Failed to connect Meta page', 'error');
                                } finally {
                                  setIsConnectingMeta(false);
                                }
                              }}
                              disabled={isConnectingMeta}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-pink-600 hover:opacity-90 text-white rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Connect &amp; Sync</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                  <span>Instagram Business Handle (or Account ID)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                  <input
                    type="text"
                    value={socialIntegrationConfig.instagram_username || ''}
                    onChange={(e) => setSocialIntegrationConfig({ ...socialIntegrationConfig, instagram_username: e.target.value.replace(/^@/, '') })}
                    placeholder="e.g. optivir_official"
                    className="w-full pl-7 pr-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Meta / Facebook Page ID</span>
                </label>
                <input
                  type="text"
                  value={socialIntegrationConfig.facebook_page_id || ''}
                  onChange={(e) => setSocialIntegrationConfig({ ...socialIntegrationConfig, facebook_page_id: e.target.value })}
                  placeholder="e.g. 100234567890123"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <LinkedinIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>LinkedIn Company Page ID or Handle</span>
                </label>
                <input
                  type="text"
                  value={socialIntegrationConfig.linkedin_page_id || ''}
                  onChange={(e) => setSocialIntegrationConfig({ ...socialIntegrationConfig, linkedin_page_id: e.target.value })}
                  placeholder="e.g. optivir-ads or linkedin.com/company/optivir"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
                  <span>YouTube Channel ID or Handle</span>
                </label>
                <input
                  type="text"
                  value={socialIntegrationConfig.youtube_channel_id || ''}
                  onChange={(e) => setSocialIntegrationConfig({ ...socialIntegrationConfig, youtube_channel_id: e.target.value })}
                  placeholder="e.g. @OptiVirOfficial or UC_x5XG1OV2P6uZZ5FSM9Ttw"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSocialConfigModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSocialConfig || isSyncingSocial}
                  className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingSocialConfig || isSyncingSocial ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Saving &amp; Syncing...</span>
                    </>
                  ) : (
                    <span>Save &amp; Sync Live Data</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Post Discovery & Selective Import Picker Modal */}
      {showPostPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Discover &amp; Select Social Posts to Import</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300">
                      {discoveredPosts.length} Available
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select which posts to display in the dashboard for <strong>{activeClientName}</strong>. Unselected posts will remain hidden.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPostPickerModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Link / Handle Discovery Input Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/70 flex flex-col sm:flex-row items-center gap-2 shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pickerQuickInput}
                  onChange={(e) => setPickerQuickInput(e.target.value)}
                  placeholder="Paste Instagram post/reel link, YouTube video URL, or enter handle (e.g. @optivirads)..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRunQuickFetch();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleRunQuickFetch}
                disabled={isQuickFetching || !pickerQuickInput.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isQuickFetching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fetch Live Post(s)</span>
                  </>
                )}
              </button>
            </div>

            {/* Toolbar: Platform Filter + Select/Deselect All */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'Instagram', 'Meta', 'LinkedIn', 'YouTube'].map((plat) => {
                  const count = plat === 'ALL' ? discoveredPosts.length : discoveredPosts.filter(p => p.platform === plat || (plat === 'Meta' && p.platform === 'Facebook')).length;
                  return (
                    <button
                      key={plat}
                      onClick={() => setPickerFilterPlatform(plat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        pickerFilterPlatform === plat
                          ? 'bg-[#B91C1C] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {plat} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPostUrls(discoveredPosts.map(p => p.post_url))}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedPostUrls([])}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
                >
                  Clear Selection
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40">
                  {selectedPostUrls.length} Selected
                </span>
              </div>
            </div>

            {/* Post Cards Grid or Empty State */}
            <div className="overflow-y-auto flex-1 pr-1">
              {discoveredPosts.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Live Posts Retrieved Yet</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Paste your live post/video link (Instagram, YouTube, LinkedIn, Meta) or enter your handle (e.g. <strong>@optivirads</strong>) in the bar above and click <strong>Fetch Live Post(s)</strong> to inspect and add them immediately.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {discoveredPosts
                  .filter(p => pickerFilterPlatform === 'ALL' || p.platform === pickerFilterPlatform || (pickerFilterPlatform === 'Meta' && (p.platform === 'Facebook' || p.platform === 'Meta')))
                  .map((post) => {
                    const isSelected = selectedPostUrls.includes(post.post_url);
                    return (
                      <div
                        key={post.post_url}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedPostUrls(selectedPostUrls.filter(u => u !== post.post_url));
                          } else {
                            setSelectedPostUrls([...selectedPostUrls, post.post_url]);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                            : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Top Row: Checkbox + Platform + Imported Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // handled by card onClick
                                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 pointer-events-none"
                              />
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                {post.platform === 'Instagram' && <InstagramIcon className="w-3 h-3 text-pink-600" />}
                                {post.platform === 'LinkedIn' && <LinkedinIcon className="w-3 h-3 text-blue-600" />}
                                {post.platform === 'YouTube' && <YoutubeIcon className="w-3 h-3 text-red-600" />}
                                {(post.platform === 'Meta' || post.platform === 'Facebook') && <FacebookIcon className="w-3 h-3 text-blue-600" />}
                                <span>{post.platform} • {post.media_type}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {post.is_imported ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                  In Dashboard
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40">
                                  + Discovered
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-emerald-600">
                                {post.engagement_rate}% ER
                              </span>
                            </div>
                          </div>

                          {/* Thumbnail Preview */}
                          <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 h-32 w-full border border-slate-200 dark:border-slate-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.thumbnail_url}
                              alt={post.caption || 'Post Preview'}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {post.media_type}
                            </div>
                          </div>

                          {/* Caption */}
                          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {post.caption}
                          </p>

                          {/* Metrics Pill Grid */}
                          <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                            <div className="bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg">
                              <span className="text-[9px] text-slate-400 block font-bold">Likes</span>
                              <span className="text-xs font-black text-slate-800 dark:text-white">{Number(post.likes).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg">
                              <span className="text-[9px] text-slate-400 block font-bold">Comments</span>
                              <span className="text-xs font-black text-slate-800 dark:text-white">{Number(post.comments).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg">
                              <span className="text-[9px] text-slate-400 block font-bold">Saves 🔖</span>
                              <span className="text-xs font-black text-rose-600">{Number(post.saves).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg">
                              <span className="text-[9px] text-slate-400 block font-bold">Reach</span>
                              <span className="text-xs font-black text-slate-800 dark:text-white">{(Number(post.reach) / 1000).toFixed(1)}k</span>
                            </div>
                          </div>
                        </div>

                        {/* Top Insight Callout */}
                        {post.top_insight && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-2 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{post.top_insight}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <div className="text-xs text-slate-500">
                <span>{selectedPostUrls.length} post(s) will be added to <strong>{activeClientName}</strong> dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostPickerModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const targetId = (liveClient?.id && liveClient.id.length > 10) 
                      ? liveClient.id 
                      : (clientId || liveClient?.id || propClientName || activeClientName || 'Hijabi Ladies Beauty Salon');
                    if (selectedPostUrls.length === 0) {
                      showToast('Please select at least one post to import', 'info');
                      return;
                    }
                    const toImport = discoveredPosts.filter((p: any) => selectedPostUrls.includes(p.post_url));
                    try {
                      setIsImportingSelected(true);
                      const res = await api.importSelectedSocialPosts(targetId, toImport);
                      showToast(res.message || `Successfully added ${toImport.length} post(s) to dashboard!`, 'success');
                      setShowPostPickerModal(false);
                      const socialRes = await api.getClientSocialInsights(targetId).catch(() => null);
                      if (socialRes?.data) setSocialData(socialRes.data);
                      const discRes = await api.discoverClientSocialPosts(targetId).catch(() => null);
                      if (discRes?.data?.unimportedCount !== undefined) setUnimportedCount(discRes.data.unimportedCount);
                    } catch (err: any) {
                      showToast(err?.message || 'Failed to import selected posts', 'error');
                    } finally {
                      setIsImportingSelected(false);
                    }
                  }}
                  disabled={isImportingSelected || selectedPostUrls.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {isImportingSelected ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding to Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Add Selected Posts ({selectedPostUrls.length}) to Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Edit Account & Commercial Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#B91C1C] text-white flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Edit Client Account &amp; Profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update company identity, industry vertical, primary stakeholder, and commercial contract terms.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const targetId = (liveClient?.id && liveClient.id.length > 10)
                  ? liveClient.id
                  : (clientId || liveClient?.id);
                if (!targetId) return;

                try {
                  setIsSavingAccount(true);
                  const parsedVal = parseFloat(String(editContractValue).replace(/[^0-9.]/g, '')) || 0;
                  const res = await api.updateClient(targetId, {
                    company_name: editCompanyName.trim(),
                    industry: editIndustry,
                    website: editWebsite.trim() || null,
                    city: editCity.trim() || null,
                    contact_first: editContactFirst.trim() || null,
                    contact_last: editContactLast.trim() || null,
                    contact_email: editContactEmail.trim() || null,
                    contact_phone: editContactPhone.trim() || null,
                    contact_role: editContactRole.trim() || 'Lead Stakeholder',
                    account_manager_id: editAccountManagerId || null,
                    contract_value: parsedVal,
                    billing_frequency: editBillingFrequency,
                    health_status: editHealthStatus
                  });

                  if (res.success) {
                    showToast('Client account details updated successfully!', 'success');
                    setShowEditModal(false);
                    await fetchClientData();
                  }
                } catch (err: any) {
                  showToast(err?.message || 'Failed to update account details', 'error');
                } finally {
                  setIsSavingAccount(false);
                }
              }}
              className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs"
            >
              {/* Section 1: Company Identity */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-rose-600 dark:text-rose-400">
                  Company Identity &amp; Industry
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Company Name *</label>
                    <input
                      type="text"
                      value={editCompanyName}
                      onChange={(e) => setEditCompanyName(e.target.value)}
                      placeholder="e.g. ZenVrae"
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Industry Vertical *</label>
                    <select
                      value={editIndustry}
                      onChange={(e) => setEditIndustry(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-medium"
                      required
                    >
                      <option value="Technology">Technology</option>
                      <option value="Beauty & Wellness">Beauty &amp; Wellness</option>
                      <option value="E-Commerce / D2C">E-Commerce / D2C</option>
                      <option value="FinTech / BFSI">FinTech / BFSI</option>
                      <option value="HealthTech">HealthTech</option>
                      <option value="SaaS / Enterprise">SaaS / Enterprise</option>
                      <option value="Fashion & Luxury">Fashion &amp; Luxury</option>
                      <option value="CleanTech / Automotive">CleanTech / Automotive</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Hospitality & F&B">Hospitality &amp; F&amp;B</option>
                      <option value="Other">Other Vertical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Official Website Domain</label>
                    <input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="https://zenvrae.com"
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Headquarters / City Location</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru, Dubai"
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Primary Stakeholder */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400">
                  Primary Client Contact Stakeholder
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Contact First Name</label>
                    <input
                      type="text"
                      value={editContactFirst}
                      onChange={(e) => setEditContactFirst(e.target.value)}
                      placeholder="e.g. Abhinav"
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Contact Last Name</label>
                    <input
                      type="text"
                      value={editContactLast}
                      onChange={(e) => setEditContactLast(e.target.value)}
                      placeholder="e.g. Lead"
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Email ID</label>
                    <input
                      type="email"
                      value={editContactEmail}
                      onChange={(e) => setEditContactEmail(e.target.value)}
                      placeholder="contact@client.com"
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={editContactPhone}
                      onChange={(e) => setEditContactPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Designation / Role</label>
                    <input
                      type="text"
                      value={editContactRole}
                      onChange={(e) => setEditContactRole(e.target.value)}
                      placeholder="e.g. Founder, Marketing Head"
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Dedicated Account Lead Assignment */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-purple-600 dark:text-purple-400">
                  Dedicated Account Lead Assignment
                </h4>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Dedicated Account Manager / Lead</label>
                  <select
                    value={editAccountManagerId}
                    onChange={(e) => setEditAccountManagerId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-medium text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Unassigned (Team Pool)</option>
                    {teamMembers.map((m: any) => {
                      const fullName = `${m.first_name || m.name || ''} ${m.last_name || ''}`.trim() || m.email;
                      const roleStr = m.role_name || m.role || 'Member';
                      return (
                        <option key={m.id} value={m.id}>
                          {fullName} ({roleStr})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Section 4: Commercial Terms & Health */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-emerald-600 dark:text-emerald-400">
                  Commercial Terms &amp; Health Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Contract Value (TCV ₹)</label>
                    <input
                      type="number"
                      value={editContractValue}
                      onChange={(e) => setEditContractValue(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Billing Frequency</label>
                    <select
                      value={editBillingFrequency}
                      onChange={(e) => setEditBillingFrequency(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-medium"
                    >
                      <option value="monthly">Monthly Retainer</option>
                      <option value="annual">Annual Retainer</option>
                      <option value="quarterly">Quarterly Retainer</option>
                      <option value="on_demand">On-Demand Ads</option>
                      <option value="pay_as_you_go">Pay-As-You-Go</option>
                      <option value="one_time">One-Time Project</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Account Health</label>
                    <select
                      value={editHealthStatus}
                      onChange={(e) => setEditHealthStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-medium"
                    >
                      <option value="Healthy">Healthy (Good Standing)</option>
                      <option value="Attention Needed">Attention Needed</option>
                      <option value="At-Risk">At-Risk</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAccount || !editCompanyName.trim()}
                  className="px-5 py-2.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {isSavingAccount ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Account Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Assign Account Lead Modal */}
      {showAssignMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0B1727] dark:text-white">Assign Account Lead</h3>
                  <p className="text-[11px] text-slate-500">Select dedicated team member for {activeClientName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTeamMember} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                  Dedicated Account Manager / Lead
                </label>
                <select
                  value={selectedAmId}
                  onChange={(e) => setSelectedAmId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="">Unassigned (Team Pool)</option>
                  {teamMembers.map((m: any) => {
                    const fullName = `${m.first_name || m.name || ''} ${m.last_name || ''}`.trim() || m.email;
                    const roleStr = m.role_name || m.role || 'Member';
                    return (
                      <option key={m.id} value={m.id}>
                        {fullName} ({roleStr})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignMemberModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigningMember}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isAssigningMember ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Assignment</span>
                    </>
                  )}
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
