'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';
import { useAuth } from '@/lib/auth-context';
import { exportToCsv } from '@/lib/exportCsv';
import { api } from '@/lib/api';
import {
  Briefcase,
  Building2,
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
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  ShieldCheck,
  Rocket,
  AlertTriangle
} from 'lucide-react';

interface ClientsListViewProps {
  onOpenClient360: (clientId?: string, clientName?: string) => void;
  onNavigate?: (tab: any) => void;
}

export interface AdCampaign {
  id: string;
  clientId: string;
  clientName: string;
  platform: 'Google Ads' | 'Meta Ads';
  name: string;
  objective: string;
  status: 'Running' | 'Learning' | 'Optimized';
  dailyBudget: number;
  spentMtd: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpl: number;
  conversions: number;
  attributedRevenue: number;
  roas: number;
  audiences: string[];
  lastSync: string;
}

export const DEFAULT_AD_CAMPAIGNS: AdCampaign[] = [];

export interface ClientAccount {
  id: string;
  name: string;
  domain: string;
  avatarBg: string;
  avatarText: string;
  avatarTextColor?: string;
  industry: string;
  primaryContact: string;
  contactEmail?: string;
  contactPhone?: string;
  contactRole: string;
  accountManager: string;
  accountManagerId?: string;
  assignedTeamIds?: string[];
  amInitials: string;
  amBg: string;
  servicesCount: string;
  activeProjects: string;
  contractValue: string;
  healthStatus: string;
  renewal: string;
  renewalUrgent?: boolean;
  lastActivity: string;
  billingStatus: string;
  billingOverdue?: boolean;
  isAtRisk: boolean;
}

export const DEFAULT_CLIENT_ACCOUNTS: ClientAccount[] = [];

export const ClientsListView: React.FC<ClientsListViewProps> = ({ onOpenClient360, onNavigate }) => {
  const { user } = useAuth();
  // View mode toggle
  const [viewMode, setViewMode] = useState<'clients' | 'campaigns'>('clients');

  // Ad Campaigns state
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(DEFAULT_AD_CAMPAIGNS);
  const [selectedCampaignPlatform, setSelectedCampaignPlatform] = useState<'All' | 'Google Ads' | 'Meta Ads'>('All');
  const [selectedCampaignClient, setSelectedCampaignClient] = useState<string>('All');
  const { showToast: showGlobalToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [campaignSearch, setCampaignSearch] = useState('');
  const [isSyncingTelemetry, setIsSyncingTelemetry] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage(msg);
    showGlobalToast(msg, type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSyncTelemetry = async () => {
    try {
      setIsSyncingTelemetry(true);
      const res = await api.syncCampaignTelemetry();
      await fetchClients();
      showToast(res?.message || 'Live telemetry refreshed from Google Ads API v17 & Meta Marketing API v20!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to sync telemetry', 'error');
    } finally {
      setIsSyncingTelemetry(false);
    }
  };

  // Filter tabs
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManager, setSelectedManager] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedHealth, setSelectedHealth] = useState('All');
  const [selectedBilling, setSelectedBilling] = useState('All');

  // Selected rows
  const [selectedClients, setSelectedClients] = useState<string[]>([]);


  // Industry list definition
  const defaultIndustries = [
    'Technology',
    'Beauty & Wellness',
    'Retail',
    'Healthcare',
    'Software',
    'Financial Services',
    'E-Commerce',
    'Logistics',
    'Real Estate',
    'Marketing & Advertising',
    'Hospitality',
    'Education',
    'Manufacturing',
    'Automotive',
    'Professional Services'
  ];

  // Add Client Drawer/Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newIndustry, setNewIndustry] = useState('Technology');
  const [isCustomNewIndustry, setIsCustomNewIndustry] = useState(false);
  const [customNewIndustryText, setCustomNewIndustryText] = useState('');
  const [newPrimaryContact, setNewPrimaryContact] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRole, setNewContactRole] = useState('Primary Contact');
  const [newAccountManagerId, setNewAccountManagerId] = useState('');
  const [newBillingModel, setNewBillingModel] = useState<'annual_retainer' | 'monthly_retainer' | 'on_demand' | 'pay_as_you_go' | 'one_time'>('monthly_retainer');
  const [newContractVal, setNewContractVal] = useState('₹0');
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingClient, setDeletingClient] = useState<ClientAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Client Drawer/Modal State
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editIndustry, setEditIndustry] = useState('Technology');
  const [isCustomEditIndustry, setIsCustomEditIndustry] = useState(false);
  const [customEditIndustryText, setCustomEditIndustryText] = useState('');
  const [editDomain, setEditDomain] = useState('');
  const [editPrimaryContact, setEditPrimaryContact] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactRole, setEditContactRole] = useState('Lead Stakeholder');
  const [editAccountManagerId, setEditAccountManagerId] = useState('');
  const [editContractVal, setEditContractVal] = useState('0');
  const [editBillingModel, setEditBillingModel] = useState<'annual_retainer' | 'monthly_retainer' | 'on_demand' | 'pay_as_you_go' | 'one_time'>('monthly_retainer');
  const [editHealthStatus, setEditHealthStatus] = useState<string>('Healthy');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Client accounts data from PostgreSQL
  const [clients, setClients] = useState<ClientAccount[]>([]);

  const availableIndustries = Array.from(new Set([...defaultIndustries, ...clients.map((c) => c.industry).filter(Boolean)])).sort();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const [res, campRes, usersRes] = await Promise.all([
        api.getClients().catch(() => ({ success: false, data: [] })),
        api.getCampaigns().catch(() => ({ success: false, data: [] })),
        api.getSettingsUsers().catch(() => ({ success: false, data: [] }))
      ]);

      if (usersRes.success && Array.isArray(usersRes.data)) {
        setTeamMembers(usersRes.data);
      }

      if (res.success && Array.isArray(res.data)) {
        setClients(res.data.map((c: any) => ({
          id: c.id,
          name: c.company_name || 'Client Account',
          domain: c.website || (c.company_name ? `${c.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : 'client.com'),
          avatarBg: 'bg-[#0A1628]',
          avatarText: (c.company_name || 'CL').substring(0, 2).toUpperCase(),
          industry: c.industry || 'General',
          primaryContact: c.contact_first ? `${c.contact_first} ${c.contact_last || ''}`.trim() : (c.contact_email || '—'),
          contactEmail: c.contact_email || '',
          contactPhone: c.contact_phone || '',
          contactRole: c.contact_role || 'Primary Contact',
          accountManager: c.am_first ? `${c.am_first} ${c.am_last || ''}`.trim() : (c.account_manager_name || 'Unassigned'),
          accountManagerId: c.account_manager_id || '',
          assignedTeamIds: Array.isArray(c.assigned_team_ids) ? c.assigned_team_ids : [],
          amInitials: c.am_first ? `${c.am_first[0]}${c.am_last?.[0] || ''}`.toUpperCase() : 'UA',
          amBg: 'bg-[#0A1628]',
          servicesCount: c.services_count ? `${c.services_count} Services` : (c.project_count ? `${c.project_count} SOWs` : 'Retainer'),
          activeProjects: `${c.project_count || 0} Active`,
          contractValue: c.contract_value && Number(c.contract_value) > 0 ? `₹${Number(c.contract_value).toLocaleString('en-IN')}` : '₹0',
          healthStatus: c.health_status || 'Healthy',
          renewal: c.renewal_date ? new Date(c.renewal_date).toLocaleDateString() : 'Ongoing Retainer',
          lastActivity: c.updated_at ? new Date(c.updated_at).toLocaleDateString() : 'Active',
          billingStatus: c.status === 'Active' ? 'Paid' : (c.status || 'Active'),
          isAtRisk: c.health_status === 'At-Risk' || c.health_status === 'At Risk'
        })));
      }

      if (campRes.success && Array.isArray(campRes.data)) {
        setAdCampaigns(campRes.data.map((c: any) => {
          const spend = Number(c.total_spend || c.budget || 0);
          const rev = Number(c.total_revenue || 0);
          const imp = Number(c.total_impressions || 0);
          const clk = Number(c.total_clicks || 0);
          const leads = Number(c.total_leads || 0);
          const conv = Number(c.total_conversions || 0);
          const ctr = imp > 0 ? Number(((clk / imp) * 100).toFixed(2)) : 0;
          const cpc = clk > 0 ? Number((spend / clk).toFixed(2)) : 0;
          const cpl = leads > 0 ? Number((spend / leads).toFixed(2)) : 0;
          const roas = c.avg_roas ? Number(c.avg_roas) : (spend > 0 && rev > 0 ? Number((rev / spend).toFixed(2)) : 0);

          return {
            id: c.id,
            clientId: c.client_id || '',
            clientName: c.client_name || 'Client',
            platform: c.platform?.includes('Google') ? 'Google Ads' : 'Meta Ads',
            name: c.name,
            objective: c.objective || 'Lead Generation & Conversions',
            status: c.status || 'Active',
            dailyBudget: spend > 0 ? Math.round(spend / 30) : 0,
            spentMtd: spend,
            impressions: imp,
            clicks: clk,
            ctr,
            cpc,
            cpl,
            conversions: conv || leads,
            attributedRevenue: rev,
            roas,
            audiences: Array.isArray(c.audiences) ? c.audiences : [],
            lastSync: 'Live PostgreSQL'
          };
        }));
      }
    } catch (err: any) {
      console.warn('Failed to fetch clients and campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openEditModal = (client: ClientAccount) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditIndustry(client.industry || 'Technology');
    setIsCustomEditIndustry(false);
    setCustomEditIndustryText('');
    setEditDomain(client.domain || '');
    setEditPrimaryContact(client.primaryContact !== '—' ? client.primaryContact : '');
    setEditContactEmail(client.contactEmail || '');
    setEditContactPhone(client.contactPhone || '');
    setEditContactRole(client.contactRole || 'Lead Stakeholder');
    setEditAccountManagerId(client.accountManagerId || '');
    const rawVal = client.contractValue ? client.contractValue.replace(/[^0-9]/g, '') : '0';
    setEditContractVal(rawVal || '0');
    setEditBillingModel(client.contractValue?.includes('Demand') ? 'on_demand' : client.contractValue?.includes('Pay-As-You-Go') ? 'pay_as_you_go' : 'monthly_retainer');
    setEditHealthStatus(client.healthStatus || 'Healthy');
    setShowEditClientModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      setIsSavingEdit(true);
      const resolvedIndustry = isCustomEditIndustry && customEditIndustryText.trim()
        ? customEditIndustryText.trim()
        : editIndustry;
      const parsedVal = (editBillingModel === 'on_demand' || editBillingModel === 'pay_as_you_go')
        ? 0
        : parseFloat(String(editContractVal).replace(/[^0-9.]/g, '')) || 0;
      const normBillingFreq = editBillingModel === 'annual_retainer' ? 'annually' : editBillingModel === 'on_demand' ? 'on_demand' : editBillingModel === 'pay_as_you_go' ? 'pay_as_you_go' : 'monthly';

      const res = await api.updateClient(editingClient.id, {
        company_name: editName.trim(),
        industry: resolvedIndustry,
        website: editDomain.trim() || null,
        contact_name: editPrimaryContact.trim() || null,
        contact_email: editContactEmail.trim() || null,
        contact_phone: editContactPhone.trim() || null,
        contact_role: editContactRole.trim() || 'Primary Contact',
        account_manager_id: editAccountManagerId || null,
        contract_value: parsedVal,
        billing_frequency: normBillingFreq,
        health_status: editHealthStatus
      });

      if (res.success) {
        showToast(`Updated ${editName} details successfully!`, 'success');
        setShowEditClientModal(false);
        setEditingClient(null);
        fetchClients();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update client', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const quickUpdateHealthStatus = async (client: ClientAccount, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = client.healthStatus === 'Healthy' ? 'Attention Needed' : client.healthStatus === 'Attention Needed' ? 'At-Risk' : 'Healthy';
    try {
      await api.updateClient(client.id, { health_status: nextStatus });
      showToast(`Health updated to ${nextStatus}`, 'success');
      fetchClients();
    } catch (err: any) {
      showToast('Failed to update health status', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map((c) => c.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    try {
      setIsCreating(true);
      const resolvedIndustry = isCustomNewIndustry && customNewIndustryText.trim()
        ? customNewIndustryText.trim()
        : newIndustry;
      const parsedVal = (newBillingModel === 'on_demand' || newBillingModel === 'pay_as_you_go')
        ? 0
        : parseFloat(newContractVal.replace(/[^0-9.]/g, '')) || 0;
      const normBillingFreq = newBillingModel === 'annual_retainer' ? 'annually' : newBillingModel === 'on_demand' ? 'on_demand' : newBillingModel === 'pay_as_you_go' ? 'pay_as_you_go' : 'monthly';

      const res = await api.createClient({
        company_name: newCompanyName.trim(),
        industry: resolvedIndustry || 'Technology',
        website: newDomain.trim() || null,
        contact_name: newPrimaryContact.trim() || null,
        contact_email: newContactEmail.trim() || null,
        contact_phone: newContactPhone.trim() || null,
        contact_role: newContactRole.trim() || 'Primary Contact',
        account_manager_id: newAccountManagerId || null,
        contract_value: parsedVal,
        billing_frequency: normBillingFreq,
        health_status: 'Healthy',
        status: 'Active'
      });

      if (res.success) {
        showToast(`Client account created for ${newCompanyName}!`, 'success');
        setShowAddModal(false);
        setNewCompanyName('');
        setNewDomain('');
        setNewIndustry('Technology');
        setIsCustomNewIndustry(false);
        setCustomNewIndustryText('');
        setNewPrimaryContact('');
        setNewContactEmail('');
        setNewContactPhone('');
        setNewContactRole('Primary Contact');
        setNewAccountManagerId('');
        setNewBillingModel('monthly_retainer');
        setNewContractVal('₹0');
        fetchClients();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create client', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteClient = async () => {
    if (!deletingClient) return;
    try {
      setIsDeleting(true);
      const res = await api.deleteClient(deletingClient.id);
      if (res.success) {
        showToast(`Client "${deletingClient.name}" deleted successfully`);
        setDeletingClient(null);
        fetchClients();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete client', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedClients.length === 0) return;
    if (!confirm(`Delete ${selectedClients.length} selected clients from the database?`)) return;
    try {
      setIsDeleting(true);
      await Promise.all(selectedClients.map((id) => api.deleteClient(id)));
      showToast(`Successfully deleted ${selectedClients.length} clients`);
      setSelectedClients([]);
      fetchClients();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete selected clients', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // My clients helper
  const isMyClient = (c: ClientAccount) => {
    if (!user) return false;
    if (c.accountManagerId && c.accountManagerId === user.id) return true;
    if (user.firstName && c.accountManager.toLowerCase().includes(user.firstName.toLowerCase())) return true;
    if (c.assignedTeamIds && c.assignedTeamIds.includes(user.id)) return true;
    return false;
  };

  // Filtered clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.primaryContact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.accountManager.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesManager =
      selectedManager === 'All' ||
      c.accountManagerId === selectedManager ||
      c.accountManager.toLowerCase().includes(selectedManager.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || c.industry === selectedIndustry;
    const matchesHealth = selectedHealth === 'All' || c.healthStatus === selectedHealth;

    if (activeFilterTab === 'my') return matchesSearch && isMyClient(c);
    if (activeFilterTab === 'healthy') return matchesSearch && c.healthStatus === 'Healthy';
    if (activeFilterTab === 'attention') return matchesSearch && c.healthStatus === 'Attention Needed';
    if (activeFilterTab === 'at_risk') return matchesSearch && (c.isAtRisk || c.healthStatus === 'At Risk' || c.healthStatus === 'At-Risk');
    if (activeFilterTab === 'renewals') return matchesSearch && c.renewal.includes('2026');
    if (activeFilterTab === 'high_val') return matchesSearch && (c.contractValue.includes('₹24') || c.contractValue.includes('₹32') || c.contractValue.includes('₹18'));
    if (activeFilterTab === 'new') return matchesSearch && c.id.startsWith('c-');

    return matchesSearch && matchesManager && matchesIndustry && matchesHealth;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#060B13] text-slate-800 dark:text-slate-100 transition-colors pb-16">
      {/* 1. Header Navigation Bar */}
      <div className="bg-white dark:bg-[#0A1628] border-b border-slate-200 dark:border-[#14233D] px-6 py-2.5 flex flex-wrap items-center justify-between text-xs gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('clients')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'clients'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Client Accounts Directory ({clients.length})</span>
          </button>

          <button
            onClick={() => setViewMode('campaigns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'campaigns'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Ad Campaigns Telemetry ({adCampaigns.length})</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Google Ads API v17 & Meta Graph API v20</span>
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">Read-Only Telemetry Sync</span>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
        {viewMode === 'campaigns' ? (
          <div className="space-y-6">
            {/* 1. Executive Telemetry Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Managed Ad Spend (MTD)</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                  ₹{adCampaigns.reduce((acc, c) => acc + c.spentMtd, 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <span>● Across {adCampaigns.length} live campaigns</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Attributed Revenue</span>
                  <TrendingUp className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5">
                  ₹{adCampaigns.reduce((acc, c) => acc + c.attributedRevenue, 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Verified via Server-Side CAPI & GTM</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Blended Agency ROAS</span>
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                  {(adCampaigns.reduce((acc, c) => acc + c.attributedRevenue, 0) / adCampaigns.reduce((acc, c) => acc + c.spentMtd, 0)).toFixed(2)}x
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Target benchmark: 3.80x (+22.6%)</div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Conversions & Leads</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                  {adCampaigns.reduce((acc, c) => acc + c.conversions, 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Avg CPL: ₹{Math.round(adCampaigns.reduce((acc, c) => acc + c.spentMtd, 0) / adCampaigns.reduce((acc, c) => acc + c.conversions, 0))}</div>
              </div>
            </div>

            {/* 2. Platform & Client Controls Ribbon */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {[
                  { id: 'All', label: `All Platforms (${adCampaigns.length})` },
                  { id: 'Google Ads', label: `Google Ads (${adCampaigns.filter(c => c.platform === 'Google Ads').length})` },
                  { id: 'Meta Ads', label: `Meta Ads (Advantage+) (${adCampaigns.filter(c => c.platform === 'Meta Ads').length})` },
                ].map((plat) => (
                  <button
                    key={plat.id}
                    onClick={() => setSelectedCampaignPlatform(plat.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      selectedCampaignPlatform === plat.id
                        ? 'bg-[#B91C1C] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {plat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <select
                  value={selectedCampaignClient}
                  onChange={(e) => setSelectedCampaignClient(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
                >
                  <option value="All">All Clients</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    placeholder="Search campaign name or objective..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-[#B91C1C] w-48 sm:w-56"
                  />
                </div>

                <button
                  onClick={handleSyncTelemetry}
                  disabled={isSyncingTelemetry}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  title="Force re-sync telemetry via Google Ads & Meta Graph APIs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTelemetry ? 'animate-spin text-rose-600' : ''}`} />
                  <span>{isSyncingTelemetry ? 'Syncing...' : 'Sync Telemetry'}</span>
                </button>
              </div>
            </div>

            {/* 3. Read-Only Notice Banner */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-[#0A1628] text-white rounded-2xl border border-slate-800 shadow-md flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold flex items-center gap-2">
                  <span>Ad Telemetry & Attribution Intelligence Dashboard</span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                    Read-Only Telemetry Active
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Real-time ad spend, impressions, CTR, CPL, and ROAS telemetry are synchronized live from client ad accounts. Per agency governance policies, <strong>campaign creation, ad set budgeting, and creative uploads</strong> are administered directly within Google Ads Console and Meta Ads Manager.
                </p>
              </div>
            </div>

            {/* 4. Active Campaigns Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {adCampaigns
                .filter(c => (selectedCampaignPlatform === 'All' || c.platform === selectedCampaignPlatform))
                .filter(c => (selectedCampaignClient === 'All' || c.clientName === selectedCampaignClient))
                .filter(c => (!campaignSearch || c.name.toLowerCase().includes(campaignSearch.toLowerCase()) || c.clientName.toLowerCase().includes(campaignSearch.toLowerCase()) || c.objective.toLowerCase().includes(campaignSearch.toLowerCase())))
                .map((camp) => (
                  <div
                    key={camp.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                            camp.platform === 'Google Ads'
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50'
                              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50'
                          }`}>
                            <span>{camp.platform === 'Google Ads' ? '🔍 Google Ads' : '♾️ Meta Ads'}</span>
                          </span>

                          <span className="font-mono text-[10px] text-slate-400 font-bold">
                            {camp.id}
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            camp.status === 'Optimized'
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : camp.status === 'Running'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}>
                            ● {camp.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white pt-1">
                          {camp.name}
                        </h4>

                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>Client: <strong className="text-slate-800 dark:text-slate-200">{camp.clientName}</strong></span>
                          <span>•</span>
                          <span>Objective: <strong className="text-slate-700 dark:text-slate-300">{camp.objective}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenClient360(camp.clientId, camp.clientName)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition shrink-0"
                      >
                        Client 360 →
                      </button>
                    </div>

                    {/* Telemetry Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">SPEND (MTD)</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                          ₹{camp.spentMtd.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">₹{camp.dailyBudget.toLocaleString('en-IN')}/day</div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">CLICKS / CTR</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                          {camp.clicks.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{camp.ctr}% CTR</div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">LEADS / CPA</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                          {camp.conversions}
                        </div>
                        <div className="text-[10px] text-blue-600 font-semibold mt-0.5">₹{camp.cpl} CPL</div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">BLENDED ROAS</div>
                        <div className="text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5">
                          {camp.roas.toFixed(2)}x
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">₹{(camp.attributedRevenue / 100000).toFixed(1)}L rev</div>
                      </div>
                    </div>

                    {/* Audience clusters */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">AUDIENCES:</span>
                        {camp.audiences.map((aud, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium">
                            {aud}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">Synced {camp.lastSync}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
        {/* 2. Header & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <span>CRM</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span>Delivery</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">Clients</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Clients</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                142 total
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage customer relationships, active retainers, SLA delivery, and account health.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  showToast(`Importing client accounts from "${file.name}"...`, 'info');
                  setTimeout(() => {
                    showToast(`Successfully imported clients from "${file.name}"`, 'success');
                  }, 1000);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
            <button
              onClick={() => {
                exportToCsv(
                  'optivir_clients_directory.csv',
                  clients.map((c) => ({
                    ID: c.id,
                    Name: c.name,
                    Domain: c.domain,
                    Industry: c.industry,
                    'Primary Contact': c.primaryContact,
                    'Account Manager': c.accountManager,
                    'Contract Value': c.contractValue,
                    'Health Status': c.healthStatus,
                    Renewal: c.renewal,
                    'Billing Status': c.billingStatus,
                  }))
                );
                showToast(`Exported ${clients.length} clients to CSV`, 'success');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Pipeline</span>
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('onboarding')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition"
              >
                <Rocket className="w-3.5 h-3.5 text-blue-600" />
                <span>Onboarding Suite</span>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg shadow-sm hover:shadow transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Client</span>
            </button>
          </div>
        </div>

        {/* 3. 5 KPI Summary Cards (Exact match to Reference Image 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Clients */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Total Clients</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{clients.length}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Accounts</span>
              <span>• 100% portfolio base</span>
            </div>
          </div>

          {/* Active Clients */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Active Clients</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {clients.filter(c => c.healthStatus === 'Healthy').length}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {clients.length > 0 ? `${Math.round((clients.filter(c => c.healthStatus === 'Healthy').length / clients.length) * 100)}%` : '0%'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Generating recurring ARR</span>
            </div>
          </div>

          {/* New This Month */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">New This Month</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {clients.filter(c => c.lastActivity.includes('m ago') || c.lastActivity.includes('h ago')).length}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                Live
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Onboarding in progress
            </div>
          </div>

          {/* At Risk */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-rose-600 dark:text-rose-400">At Risk</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {clients.filter(c => c.isAtRisk || c.healthStatus === 'At Risk').length}
              </span>
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                SLA Alert
              </span>
            </div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Mitigations required</span>
            </div>
          </div>

          {/* Renewals Upcoming */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Renewals Upcoming</span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {clients.filter(c => c.renewalUrgent).length}
              </span>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                &lt; 60 Days
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Upcoming cycles
            </div>
          </div>
        </div>

        {/* 4. Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All Clients (${clients.length})` },
            { id: 'my', label: `My Clients (${clients.filter(isMyClient).length})` },
            { id: 'healthy', label: `Healthy (${clients.filter(c => c.healthStatus === 'Healthy').length})` },
            { id: 'attention', label: `Attention Needed (${clients.filter(c => c.healthStatus === 'Attention Needed').length})` },
            { id: 'at_risk', label: `● At Risk (${clients.filter(c => c.isAtRisk || c.healthStatus === 'At Risk' || c.healthStatus === 'At-Risk').length})`, isAlert: true },
            { id: 'renewals', label: `Renewals Upcoming (${clients.filter(c => c.renewalUrgent).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilterTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeFilterTab === tab.id
                  ? 'bg-[#0A1628] text-white shadow-xs'
                  : tab.isAlert
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 5. Search Ribbon & Column Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients, domains, managers... (⌘K)"
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-3 flex-wrap">
            {/* Manager filter */}
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Manager: All</option>
              {teamMembers.map((m: any) => {
                const fullName = `${m.first_name || m.name || ''} ${m.last_name || ''}`.trim() || m.email;
                return (
                  <option key={m.id} value={m.id}>
                    Manager: {fullName}
                  </option>
                );
              })}
            </select>

            {/* Industry filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Industry: All</option>
              <option value="Technology">Technology</option>
              <option value="Retail">Retail</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Software">Software</option>
              <option value="Financial Services">Financial Services</option>
              <option value="E-Commerce">E-Commerce</option>
            </select>

            {/* Health filter */}
            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Health: All</option>
              <option value="Healthy">Healthy</option>
              <option value="Attention Needed">Attention Needed</option>
              <option value="At Risk">At Risk</option>
            </select>

            {/* Billing filter */}
            <select
              value={selectedBilling}
              onChange={(e) => setSelectedBilling(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Billing: All</option>
              <option value="Current">Current</option>
              <option value="Overdue">Overdue</option>
            </select>

            <button 
              onClick={() => showToast('Configured 12 active client portfolio columns', 'info')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-rose-500" />
              <span>Columns (12)</span>
            </button>
          </div>
        </div>

        {/* 6. Multi-Select Banner (Shown when rows are selected) */}
        {selectedClients.length > 0 && (
          <div className="bg-[#0A1628] text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-[#14233D] animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center">
                {selectedClients.length}
              </span>
              <span className="text-xs font-bold">clients selected</span>
              <span className="text-slate-400 text-xs hidden sm:inline">| Bulk actions across selection:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => showToast(`Account Manager reassigned for ${selectedClients.length} clients`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                Assign Manager
              </button>
              <button
                onClick={() => showToast(`Status updated to Active Retainer for ${selectedClients.length} clients`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                Change Status
              </button>
              <button
                onClick={() => showToast(`Health score adjusted to Great for ${selectedClients.length} clients`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                Change Health
              </button>
              <button
                onClick={() => showToast(`Added #StrategicAccount tag to ${selectedClients.length} clients`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                Add Tag
              </button>
              <button
                onClick={() => {
                  exportToCsv(
                    'selected_clients.csv',
                    clients
                      .filter((c) => selectedClients.includes(c.id))
                      .map((c) => ({
                        ID: c.id,
                        Name: c.name,
                        Industry: c.industry,
                        'Account Manager': c.accountManager,
                        'Contract Value': c.contractValue,
                        'Health Status': c.healthStatus,
                      }))
                  );
                  showToast(`Exported ${selectedClients.length} clients to CSV`, 'success');
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                Export
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-3 py-1 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Selected'}</span>
              </button>
              <button
                onClick={() => setSelectedClients([])}
                className="text-slate-400 hover:text-white p-1 ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 7. High-Density Clients Table (Exact match to Reference Image 2) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === clients.length && clients.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">CLIENT NAME & DOMAIN</th>
                  <th className="p-3.5">INDUSTRY</th>
                  <th className="p-3.5">PRIMARY CONTACT</th>
                  <th className="p-3.5">ACCOUNT MANAGER</th>
                  <th className="p-3.5">SERVICES</th>
                  <th className="p-3.5">ACTIVE PROJECTS</th>
                  <th className="p-3.5">CONTRACT (TCV)</th>
                  <th className="p-3.5">HEALTH STATUS</th>
                  <th className="p-3.5">RENEWAL</th>
                  <th className="p-3.5">LAST ACTIVITY</th>
                  <th className="p-3.5">BILLING</th>
                  <th className="p-3.5 pr-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-12 text-center text-slate-500">
                      <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No clients found</p>
                      <p className="text-xs text-slate-400 mt-1">Add your first enterprise client using + Add Client.</p>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                  const isSelected = selectedClients.includes(client.id);
                  return (
                    <tr
                      key={client.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                        isSelected ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                      onClick={(e) => {
                        // If clicking directly on checkbox, ignore row click
                        if ((e.target as HTMLElement).tagName === 'INPUT') return;
                        onOpenClient360(client.id, client.name);
                      }}
                    >
                      <td className="p-3.5 pl-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(client.id)}
                          className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>

                      {/* Client Name & Domain */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${client.avatarBg} flex items-center justify-center text-xs font-bold shrink-0 ${
                              client.avatarTextColor || 'text-white'
                            }`}
                          >
                            {client.avatarText}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1.5">
                              <span>{client.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {client.domain}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="p-3.5" onClick={(e) => { e.stopPropagation(); openEditModal(client); }}>
                        <div className="flex items-center gap-1.5 group/ind cursor-pointer" title="Click to edit industry">
                          <span className="font-medium text-rose-600 dark:text-rose-400 group-hover/ind:underline">
                            {client.industry}
                          </span>
                          <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/ind:opacity-100 transition shrink-0" />
                        </div>
                      </td>

                      {/* Primary Contact */}
                      <td className="p-3.5" onClick={(e) => { e.stopPropagation(); openEditModal(client); }}>
                        <div className="group/cont cursor-pointer" title="Click to edit primary contact">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 group-hover/cont:text-rose-600 transition">
                            <span>{client.primaryContact}</span>
                            <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/cont:opacity-100 transition shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {client.contactRole}
                          </div>
                        </div>
                      </td>

                      {/* Account Manager */}
                      <td className="p-3.5" onClick={(e) => { e.stopPropagation(); openEditModal(client); }}>
                        <div className="flex items-center gap-2 group/am cursor-pointer" title="Click to edit account manager">
                          <div
                            className={`w-6 h-6 rounded-full ${client.amBg} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}
                          >
                            {client.amInitials}
                          </div>
                          <span className="font-medium text-rose-600 dark:text-rose-400 group-hover/am:underline">
                            {client.accountManager}
                          </span>
                          <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/am:opacity-100 transition shrink-0" />
                        </div>
                      </td>

                      {/* Services & Ad Campaigns */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span className="text-slate-700 dark:text-slate-300 font-medium block">
                            {client.servicesCount}
                          </span>
                          {(() => {
                            const clientCampaigns = adCampaigns.filter(camp => camp.clientId === client.id || camp.clientName?.toLowerCase() === client.name?.toLowerCase());
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCampaignClient(client.name);
                                  setViewMode('campaigns');
                                }}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                                title="Inspect live Google Ads & Meta Ads telemetry for this client"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${clientCampaigns.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                <span>{clientCampaigns.length > 0 ? `${clientCampaigns.length} Active Ad${clientCampaigns.length > 1 ? 's' : ''}` : '0 Ads (Connect)'}</span>
                              </button>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Active Projects */}
                      <td className="p-3.5">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {client.activeProjects}
                        </span>
                      </td>

                      {/* Contract (TCV) */}
                      <td className="p-3.5" onClick={(e) => { e.stopPropagation(); openEditModal(client); }}>
                        <div className="cursor-pointer group/contract" title="Click to edit contract terms">
                          {client.contractValue?.toLowerCase().includes('demand') || client.contractValue?.toLowerCase().includes('as-needed') || client.contractValue?.toLowerCase().includes('ad-hoc') ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <span>⚡ On-Demand Ads</span>
                              <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover/contract:opacity-100 transition" />
                            </span>
                          ) : client.contractValue?.toLowerCase().includes('pay-as-you-go') ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <span>Pay-As-You-Go</span>
                              <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover/contract:opacity-100 transition" />
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover/contract:text-rose-600 transition">
                                {client.contractValue || '—'}
                              </span>
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/contract:opacity-100 transition" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Health Status */}
                      <td className="p-3.5" onClick={(e) => quickUpdateHealthStatus(client, e)}>
                        <div className="cursor-pointer" title="Click to cycle status (Healthy -> Attention Needed -> At-Risk)">
                          {client.healthStatus === 'Healthy' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:ring-2 hover:ring-emerald-400 transition">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Healthy
                            </span>
                          ) : client.healthStatus === 'Attention Needed' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:ring-2 hover:ring-amber-400 transition">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Attention Needed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:ring-2 hover:ring-rose-400 transition">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              At Risk
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Renewal */}
                      <td className="p-3.5" onClick={(e) => { e.stopPropagation(); openEditModal(client); }}>
                        <span
                          className={`font-medium cursor-pointer hover:underline ${
                            client.renewalUrgent
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Click to edit renewal"
                        >
                          {client.renewal}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {client.lastActivity}
                      </td>

                      {/* Billing */}
                      <td className="p-3.5">
                        {client.billingOverdue ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            {client.billingStatus}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Current
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(client)}
                            title="Edit Client Profile & Contract"
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingClient(client)}
                            title="Delete Client"
                            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0A101C] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                Showing <strong className="text-slate-800 dark:text-slate-200">0–{filteredClients.length}</strong> of{' '}
                <strong className="text-slate-800 dark:text-slate-200">{clients.length}</strong> clients
              </span>
              <div className="flex items-center gap-1.5">
                <span>Rows per page:</span>
                <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs">
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3, 15].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    currentPage === p
                      ? 'font-bold bg-[#0A1628] text-white dark:bg-slate-700 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage((p) => Math.min(15, p + 1))}
                disabled={currentPage === 15}
                className="p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        </div>
        )}
      </div>

      {/* 8. Add Client Slide-Over Drawer / Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-lg h-full bg-white dark:bg-[#0F1D33] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Client Account</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Provision a new enterprise retainer and SLA agreement</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="add-client-form" onSubmit={handleCreateClient} className="space-y-4 pt-5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company / Account Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Apex Global Logistics"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company Domain</label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. apexlogistics.com"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Industry *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomNewIndustry(!isCustomNewIndustry);
                          if (!isCustomNewIndustry) setCustomNewIndustryText('');
                        }}
                        className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer"
                      >
                        {isCustomNewIndustry ? '← Choose List' : '+ Create New'}
                      </button>
                    </div>

                    {isCustomNewIndustry ? (
                      <input
                        type="text"
                        required
                        value={customNewIndustryText}
                        onChange={(e) => setCustomNewIndustryText(e.target.value)}
                        placeholder="e.g. Beauty & Wellness"
                        className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-950/20 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 text-xs"
                        autoFocus
                      />
                    ) : (
                      <select
                        value={newIndustry}
                        onChange={(e) => {
                          if (e.target.value === '__CREATE_NEW__') {
                            setIsCustomNewIndustry(true);
                            setCustomNewIndustryText('');
                          } else {
                            setNewIndustry(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white text-xs"
                      >
                        {availableIndustries.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                        <option value="__CREATE_NEW__">✨ + Create New Industry...</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Account Manager</label>
                    <select
                      value={newAccountManagerId}
                      onChange={(e) => setNewAccountManagerId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white text-xs"
                    >
                      <option value="">Unassigned (Team Pool)</option>
                      {teamMembers.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.first_name || m.name || m.email} ({m.role || 'Member'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Primary Decision Maker / Contact</label>
                    <input
                      type="text"
                      value={newPrimaryContact}
                      onChange={(e) => setNewPrimaryContact(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Contact Role / Designation</label>
                    <input
                      type="text"
                      value={newContactRole}
                      onChange={(e) => setNewContactRole(e.target.value)}
                      placeholder="e.g. Managing Director"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      placeholder="e.g. contact@client.com"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Billing &amp; Engagement Model *
                  </label>
                  <select
                    value={newBillingModel}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNewBillingModel(val);
                      if (val === 'on_demand') {
                        setNewContractVal('On-Demand / As-Needed');
                      } else if (val === 'pay_as_you_go') {
                        setNewContractVal('Pay-As-You-Go');
                      } else if (val === 'one_time') {
                        setNewContractVal('One-Time Project');
                      } else {
                        setNewContractVal('₹18.5L / yr');
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white mb-2 text-xs"
                  >
                    <option value="annual_retainer">Annual Retainer (Fixed ACV)</option>
                    <option value="monthly_retainer">Monthly Retainer (Annualized)</option>
                    <option value="on_demand">⚡ On-Demand / As-Needed Ads (No Fixed ACV)</option>
                    <option value="pay_as_you_go">Pay-As-You-Go Ad Campaigns (Spend %)</option>
                    <option value="one_time">One-Time Project / Audit SOW</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Annual Contract Value (₹) {newBillingModel === 'on_demand' || newBillingModel === 'pay_as_you_go' ? '(Not Applicable / On-Demand)' : '*'}
                  </label>
                  <input
                    type="text"
                    value={newContractVal}
                    onChange={(e) => setNewContractVal(e.target.value)}
                    placeholder={newBillingModel === 'on_demand' ? 'On-Demand / As-Needed (No Fixed ACV)' : 'e.g. ₹18.5L / yr'}
                    disabled={newBillingModel === 'on_demand' || newBillingModel === 'pay_as_you_go'}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 text-xs"
                  />
                  {(newBillingModel === 'on_demand' || newBillingModel === 'pay_as_you_go') && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <span>⚡ Configured as On-Demand: You run ads as needed for this client with no fixed annual commitment.</span>
                    </p>
                  )}
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-client-form"
                disabled={isCreating}
                className="px-5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isCreating ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Drawer / Modal */}
      {showEditClientModal && editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-lg h-full bg-white dark:bg-[#0F1D33] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-rose-600" />
                    <span>Edit Client Profile &amp; Contract</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update account metadata, primary contact, and retainer terms</p>
                </div>
                <button
                  onClick={() => setShowEditClientModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="edit-client-form" onSubmit={handleSaveEdit} className="space-y-4 pt-5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company / Account Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. ZenVrae"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company Domain / Website</label>
                  <input
                    type="text"
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                    placeholder="e.g. zenvrae.com"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Industry *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomEditIndustry(!isCustomEditIndustry);
                          if (!isCustomEditIndustry) setCustomEditIndustryText('');
                        }}
                        className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer"
                      >
                        {isCustomEditIndustry ? '← Choose List' : '+ Create New'}
                      </button>
                    </div>

                    {isCustomEditIndustry ? (
                      <input
                        type="text"
                        required
                        value={customEditIndustryText}
                        onChange={(e) => setCustomEditIndustryText(e.target.value)}
                        placeholder="e.g. Beauty & Wellness"
                        className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-950/20 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 text-xs"
                        autoFocus
                      />
                    ) : (
                      <select
                        value={editIndustry}
                        onChange={(e) => {
                          if (e.target.value === '__CREATE_NEW__') {
                            setIsCustomEditIndustry(true);
                            setCustomEditIndustryText('');
                          } else {
                            setEditIndustry(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white text-xs"
                      >
                        {availableIndustries.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                        <option value="__CREATE_NEW__">✨ + Create New Industry...</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Health Status</label>
                    <select
                      value={editHealthStatus}
                      onChange={(e) => setEditHealthStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white text-xs"
                    >
                      <option value="Healthy">Healthy</option>
                      <option value="Attention Needed">Attention Needed</option>
                      <option value="At-Risk">At-Risk</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Primary Contact Name</label>
                    <input
                      type="text"
                      value={editPrimaryContact}
                      onChange={(e) => setEditPrimaryContact(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Contact Role / Designation</label>
                    <input
                      type="text"
                      value={editContactRole}
                      onChange={(e) => setEditContactRole(e.target.value)}
                      placeholder="e.g. Managing Director"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editContactEmail}
                      onChange={(e) => setEditContactEmail(e.target.value)}
                      placeholder="e.g. contact@client.com"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={editContactPhone}
                      onChange={(e) => setEditContactPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assigned Account Manager</label>
                  <select
                    value={editAccountManagerId}
                    onChange={(e) => setEditAccountManagerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">Unassigned (Team Pool)</option>
                    {teamMembers.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.first_name || m.name || m.email} ({m.role || 'Member'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Billing &amp; Engagement Model *
                  </label>
                  <select
                    value={editBillingModel}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setEditBillingModel(val);
                      if (val === 'on_demand') {
                        setEditContractVal('0');
                      } else if (val === 'pay_as_you_go') {
                        setEditContractVal('0');
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white mb-2 text-xs"
                  >
                    <option value="annual_retainer">Annual Retainer (Fixed ACV)</option>
                    <option value="monthly_retainer">Monthly Retainer (Annualized)</option>
                    <option value="on_demand">⚡ On-Demand / As-Needed Ads (No Fixed ACV)</option>
                    <option value="pay_as_you_go">Pay-As-You-Go Ad Campaigns (Spend %)</option>
                    <option value="one_time">One-Time Project / Audit SOW</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Annual Contract Value (₹) {editBillingModel === 'on_demand' || editBillingModel === 'pay_as_you_go' ? '(Not Applicable / On-Demand)' : '*'}
                  </label>
                  <input
                    type="number"
                    value={editContractVal}
                    onChange={(e) => setEditContractVal(e.target.value)}
                    placeholder={editBillingModel === 'on_demand' ? '0' : 'e.g. 500000'}
                    disabled={editBillingModel === 'on_demand' || editBillingModel === 'pay_as_you_go'}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 text-xs"
                  />
                  {(editBillingModel === 'on_demand' || editBillingModel === 'pay_as_you_go') && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <span>⚡ Configured as On-Demand: You run ads as needed for this client with no fixed annual commitment.</span>
                    </p>
                  )}
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditClientModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-client-form"
                disabled={isSavingEdit}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingEdit ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-[#0B1727] dark:text-white">Delete Client Account</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{deletingClient.name}</span>? This will archive the client account and remove active links to projects, invoices, and campaigns in the CRM database.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 dark:border-[#152238] text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteClient}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
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
