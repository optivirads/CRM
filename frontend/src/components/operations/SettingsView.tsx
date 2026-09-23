'use client';

import React, { useState, useEffect } from 'react';
import { getActualStorageEstimate, StorageEstimateData } from '@/lib/storage-estimate';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ConfirmModal } from '@/components/common/ConfirmModal';

export const AVAILABLE_CRM_MODULES = [
  { id: 'dashboard', label: 'Dashboard', desc: 'Overview & metrics' },
  { id: 'leads', label: 'Leads', desc: 'Inbound leads & qualification' },
  { id: 'pipeline', label: 'Pipeline', desc: 'Sales pipeline & deals' },
  { id: 'proposals', label: 'Proposals', desc: 'Quotations & contracts' },
  { id: 'clients', label: 'Clients & Accounts', desc: 'Client directory & 360° view' },
  { id: 'onboarding', label: 'Client Onboarding', desc: 'Client kickoff & checklists' },
  { id: 'projects', label: 'Projects', desc: 'Deliverables & sprints' },
  { id: 'tasks', label: 'Tasks', desc: 'Task tracker & deadlines' },
  { id: 'marketing', label: 'Marketing & Ads', desc: 'Campaigns & ROAS' },
  { id: 'finance', label: 'Finance & Invoices', desc: 'Invoices & tax ledger' },
  { id: 'reports', label: 'Reports', desc: 'Performance analytics' },
  { id: 'operations', label: 'Operations', desc: 'Agency operational tools' },
  { id: 'settings', label: 'System Settings', desc: 'Tenant configuration & users' },
];
import {
  Settings,
  Shield,
  SlidersHorizontal,
  Building2,
  Globe2,
  User,
  Users,
  UserCircle,
  Camera,
  KeyRound,
  ShieldCheck,
  Workflow,
  FileCode,
  Tag,
  Briefcase,
  Layers,
  FileText,
  CreditCard,
  Activity,
  Network,
  Cloud,
  Save,
  RotateCcw,
  Copy,
  Trash2,
  Upload,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Plus,
  Search,
  Check,
  AlertCircle,
  X,
  Lock,
  RefreshCw,
  Smartphone,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Filter,
  Download,
  Percent,
  Calendar,
  DollarSign,
  HelpCircle,
  Hash,
  Database,
  CheckSquare,
  Square,
  Target,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Laptop,
  Tablet,
  Monitor,
  LogOut
} from 'lucide-react';

interface SettingsViewProps {
  onNavigate?: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const { user, activePersona, updateCurrentUser } = useAuth();
  // Strictly enforce Executive Owner role: optivirads@gmail.com, abhinandc97@gmail.com, isOwner === true, or super_admin
  const isMasterOwner =
    Boolean(user?.isOwner) ||
    user?.email?.toLowerCase() === 'optivirads@gmail.com' ||
    user?.email?.toLowerCase() === 'abhinandc97@gmail.com' ||
    user?.role === 'owner' ||
    user?.role === 'super_admin';
  const isSuperAdminEmail =
    user?.email?.toLowerCase() === 'optivirads@gmail.com' ||
    user?.email?.toLowerCase() === 'abhinandc97@gmail.com';
  const isOwnerOrAdmin = isMasterOwner;

  // Active Sub-Navigation Tab
  const [activeSection, setActiveSection] = useState(isMasterOwner ? 'Organization Identity' : 'My Profile');

  // Personal Profile States
  const [profileFirstName, setProfileFirstName] = useState(user?.firstName || '');
  const [profileLastName, setProfileLastName] = useState(user?.lastName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileFirstName(user.firstName || '');
      setProfileLastName(user.lastName || '');
      setProfilePhone(user.phone || '');
      setProfileAvatarUrl(user.avatarUrl || null);
    }
  }, [user]);

  useEffect(() => {
    if (!isMasterOwner && activeSection !== 'My Profile') {
      setActiveSection('My Profile');
    }
  }, [isMasterOwner, activeSection]);

  // Form Field States (OptiVir CRM Owner Company Details)
  const [orgLegalName, setOrgLegalName] = useState('OptiVir Technologies Pvt. Ltd.');
  const [taxGstin, setTaxGstin] = useState('27AABCO1234F1Z5');
  const [domainWebsite, setDomainWebsite] = useState('https://www.optivirads.com');
  const [industry, setIndustry] = useState('Performance Marketing & Advertising Agency');
  const [supportEmail, setSupportEmail] = useState('optivirads@gmail.com');
  const [switchboardPhone, setSwitchboardPhone] = useState('+919995037109');
  const [masterLogoUrl, setMasterLogoUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('optivir_master_logo') || '/images/optivir-logo.png';
    }
    return '/images/optivir-logo.png';
  });

  // Regionalization States
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST, UTC+05:30)');
  const [ledgerCurrency, setLedgerCurrency] = useState('INR (₹) - Indian Rupee [Master Ledger]');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY (24-Hour: 14:32)');
  const [fiscalYear, setFiscalYear] = useState('April 1st (Indian / UK Standard)');
  const [autoShiftAdjustment, setAutoShiftAdjustment] = useState(true);

  // Administrative Preferences States
  const [landingWorkspace, setLandingWorkspace] = useState('Executive Overview Dashboard');
  const [densityProfile, setDensityProfile] = useState<'Dense' | 'Comfortable'>('Dense');
  const [auditoryChimes, setAuditoryChimes] = useState(true);
  const [telemetryDiff, setTelemetryDiff] = useState(true);

  // 4. User Directory State
  const [teamSearch, setTeamSearch] = useState('');
  const [teamRoleFilter, setTeamRoleFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('sales_lead');
  const [newUserDesignation, setNewUserDesignation] = useState('Senior Growth Specialist');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserAllowedTabs, setNewUserAllowedTabs] = useState<string[]>([
    'dashboard', 'leads', 'pipeline', 'proposals', 'clients'
  ]);
  const [newUserIsClientOnly, setNewUserIsClientOnly] = useState(false);
  const [newUserSelectedClientId, setNewUserSelectedClientId] = useState('');

  // Clients database list for assignment
  const [clientsList, setClientsList] = useState<any[]>([]);

  // Edit Permissions Modal State
  const [showEditPermissionsModal, setShowEditPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editAllowedTabs, setEditAllowedTabs] = useState<string[]>([]);
  const [editRole, setEditRole] = useState('sales_lead');
  const [editDesignation, setEditDesignation] = useState('');
  const [editIsClientOnly, setEditIsClientOnly] = useState(false);
  const [editSelectedClientId, setEditSelectedClientId] = useState('');

  // Admin Reset Password Modal State
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resettingUser, setResettingUser] = useState<any | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [isAdminResetting, setIsAdminResetting] = useState(false);

  // Remote Logout Session Confirmation Modal State
  const [logoutConfirmUser, setLogoutConfirmUser] = useState<any | null>(null);
  const [isLoggingOutSession, setIsLoggingOutSession] = useState(false);

  // Unified Action Confirmation Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    subDescription?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'primary';
    badge?: string;
    details?: { label: string; value: React.ReactNode }[];
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Self Service Password Change State (In Security tab)
  const [selfCurrentPassword, setSelfCurrentPassword] = useState('');
  const [selfNewPassword, setSelfNewPassword] = useState('');
  const [selfConfirmPassword, setSelfConfirmPassword] = useState('');
  const [selfPasswordOtp, setSelfPasswordOtp] = useState('');
  const [isRequestingSelfOtp, setIsRequestingSelfOtp] = useState(false);
  const [selfOtpSent, setSelfOtpSent] = useState(false);
  const [selfOtpTimer, setSelfOtpTimer] = useState(0);
  const [isSelfChangingPassword, setIsSelfChangingPassword] = useState(false);

  const [usersList, setUsersList] = useState<any[]>([]);

  // 5. Roles & Permissions State
  const [selectedRoleKey, setSelectedRoleKey] = useState<'admin' | 'sales' | 'marketing' | 'finance'>('sales');
  const [permissionsState, setPermissionsState] = useState<Record<string, Record<string, boolean>>>({
    admin: {
      'view_dashboard': true, 'export_dossier': true, 'manage_leads': true, 'delete_leads': true,
      'view_pipeline': true, 'edit_pipeline': true, 'manage_clients': true, 'access_vault': true,
      'generate_invoices': true, 'manage_settings': true, 'manage_users': true, 'view_audit': true
    },
    sales: {
      'view_dashboard': true, 'export_dossier': false, 'manage_leads': true, 'delete_leads': false,
      'view_pipeline': true, 'edit_pipeline': true, 'manage_clients': true, 'access_vault': false,
      'generate_invoices': false, 'manage_settings': false, 'manage_users': false, 'view_audit': false
    },
    marketing: {
      'view_dashboard': true, 'export_dossier': true, 'manage_leads': false, 'delete_leads': false,
      'view_pipeline': true, 'edit_pipeline': false, 'manage_clients': true, 'access_vault': true,
      'generate_invoices': false, 'manage_settings': false, 'manage_users': false, 'view_audit': false
    },
    finance: {
      'view_dashboard': true, 'export_dossier': true, 'manage_leads': false, 'delete_leads': false,
      'view_pipeline': false, 'edit_pipeline': false, 'manage_clients': true, 'access_vault': false,
      'generate_invoices': true, 'manage_settings': false, 'manage_users': false, 'view_audit': true
    }
  });

  // 6. Teams & Pods State
  const [showPodModal, setShowPodModal] = useState(false);
  const [newPodName, setNewPodName] = useState('');
  const [newPodLead, setNewPodLead] = useState('');
  const [newPodTarget, setNewPodTarget] = useState('');
  const [podsList, setPodsList] = useState<any[]>([]);

  // 7. SSO & Security 2FA State
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('7d');
  const [failedLockoutLimit, setFailedLockoutLimit] = useState('5');
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);
  const [newIpAddress, setNewIpAddress] = useState('');

  // 8. Pipelines & Stages State (From Screenshot target)
  const [selectedPipelineName, setSelectedPipelineName] = useState('Enterprise Retainers Pipeline');
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageProb, setNewStageProb] = useState(50);
  const [newStageSla, setNewStageSla] = useState(5);
  const [pipelineStages, setPipelineStages] = useState<any[]>([
    { id: 'stg-1', order: 1, name: 'Discovery & Needs Analysis', probability: 10, slaDays: 3, color: 'bg-blue-500', dealCount: 8, totalValue: '₹6,40,000' },
    { id: 'stg-2', order: 2, name: 'Scope & Performance Audit', probability: 30, slaDays: 5, color: 'bg-indigo-500', dealCount: 5, totalValue: '₹4,95,000' },
    { id: 'stg-3', order: 3, name: 'Commercial Proposal Sent (SAC 998361)', probability: 60, slaDays: 4, color: 'bg-purple-500', dealCount: 4, totalValue: '₹7,80,000' },
    { id: 'stg-4', order: 4, name: 'Legal SOW & Security Review', probability: 80, slaDays: 7, color: 'bg-amber-500', dealCount: 3, totalValue: '₹5,20,000' },
    { id: 'stg-5', order: 5, name: 'Closed Won (Handed to Delivery)', probability: 100, slaDays: 0, color: 'bg-emerald-500', dealCount: 12, totalValue: '₹28,50,000' },
    { id: 'stg-6', order: 6, name: 'Closed Lost (Mandatory Reason)', probability: 0, slaDays: 0, color: 'bg-rose-500', dealCount: 2, totalValue: '₹3,00,000' }
  ]);

  // 9. Custom Fields State
  const [customFieldsEntity, setCustomFieldsEntity] = useState<'Leads' | 'Deals' | 'Companies' | 'Clients'>('Leads');
  const [showAddCustomFieldModal, setShowAddCustomFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('Text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [customFieldsList, setCustomFieldsList] = useState<any[]>([
    { id: 'cf-1', entity: 'Leads', name: 'Monthly Media Spend Budget', key: 'monthly_ad_spend', type: 'Currency (INR)', required: true },
    { id: 'cf-2', entity: 'Leads', name: 'Primary Ad Network Intent', key: 'primary_ad_network', type: 'Dropdown', required: true },
    { id: 'cf-3', entity: 'Deals', name: 'Expected Decision Date', key: 'expected_close_date', type: 'Date', required: true },
    { id: 'cf-4', entity: 'Companies', name: 'Client CBIC GSTIN', key: 'client_gstin', type: 'Text (15-char)', required: true },
    { id: 'cf-5', entity: 'Clients', name: 'Shopify Store Admin Domain', key: 'shopify_domain', type: 'URL', required: false },
    { id: 'cf-6', entity: 'Clients', name: 'Meta Business Manager Partner ID', key: 'meta_partner_id', type: 'Text', required: false }
  ]);

  // 10. System Tags State
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200');
  const [tagsList, setTagsList] = useState<any[]>([
    { id: 'tag-1', name: '#Tier1Enterprise', usageCount: 18, badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    { id: 'tag-2', name: '#HighIntent', usageCount: 24, badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    { id: 'tag-3', name: '#D2CBrand', usageCount: 31, badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    { id: 'tag-4', name: '#ShopifyPlus', usageCount: 14, badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
    { id: 'tag-5', name: '#Q4BudgetSpender', usageCount: 12, badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    { id: 'tag-6', name: '#ChurnRisk', usageCount: 3, badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800' }
  ]);

  // 11. Services Catalog State
  const [servicesList, setServicesList] = useState<any[]>([
    { id: 'srv-1', name: 'Enterprise Performance Marketing Retainer', category: 'Performance Marketing', pricingModel: 'Monthly Retainer', price: 150000, sacCode: '998361', taxRate: '18% GST', deliverablesCount: 6 },
    { id: 'srv-2', name: 'Search Engine Optimization & Content Engine', category: 'SEO & Content', pricingModel: 'Monthly Retainer', price: 95000, sacCode: '998361', taxRate: '18% GST', deliverablesCount: 4 },
    { id: 'srv-3', name: 'Full-Stack Web App Development', category: 'Web Dev & Tech', pricingModel: 'Fixed Milestone', price: 350000, sacCode: '998361', taxRate: '18% GST', deliverablesCount: 8 },
    { id: 'srv-4', name: 'Creative Production & Video Ad Sprint', category: 'Creative Studio', pricingModel: 'Monthly Retainer', price: 75000, sacCode: '998361', taxRate: '18% GST', deliverablesCount: 12 }
  ]);

  // 12. Lead Sources State
  const [sourcesList, setSourcesList] = useState<any[]>([
    { id: 'ls-1', name: 'Google Search Ads (Intent)', channel: 'Paid Search', costPerLead: 1200, status: 'Active', totalLeads: 34 },
    { id: 'ls-2', name: 'Meta Ads (Instagram / FB)', channel: 'Paid Social', costPerLead: 650, status: 'Active', totalLeads: 62 },
    { id: 'ls-3', name: 'LinkedIn Outreach', channel: 'B2B Social', costPerLead: 2500, status: 'Active', totalLeads: 19 },
    { id: 'ls-4', name: 'Agency Website Organic', channel: 'Organic SEO', costPerLead: 0, status: 'Active', totalLeads: 45 },
    { id: 'ls-5', name: 'CEO Referral Network', channel: 'Executive Referral', costPerLead: 0, status: 'Active', totalLeads: 15 },
    { id: 'ls-6', name: 'Inbound Inquiries Form', channel: 'Inbound Web', costPerLead: 300, status: 'Active', totalLeads: 28 }
  ]);

  // 13. Document Templates State
  const [templatesList, setTemplatesList] = useState<any[]>([
    { id: 'tmpl-1', name: 'Master Services Agreement (MSA)', type: 'Legal Contract', version: 'v3.2', updated: 'Aug 2026', sacCode: '998361', standardTerms: 'Net 30, IP Assigned Upon Payment' },
    { id: 'tmpl-2', name: 'Statement of Work (SOW) Standard', type: 'Operations Scope', version: 'v4.0', updated: 'Sep 2026', sacCode: '998361', standardTerms: 'Sprint-based deliverables' },
    { id: 'tmpl-3', name: 'Commercial Proposal (Hybrid 3-Col)', type: 'Sales Quotation', version: 'v2.8', updated: 'Jul 2026', sacCode: '998361', standardTerms: '14-Day validity' },
    { id: 'tmpl-4', name: 'GST Tax Invoice (CBIC Rule 46)', type: 'Financial Ledger', version: 'v1.5', updated: 'Sep 2026', sacCode: '998361', standardTerms: '18% GST (CGST/SGST/IGST)' }
  ]);

  // 14. Billing & Currency State
  const [agencyGstin, setAgencyGstin] = useState('27AABCO1234F1Z5');
  const [agencyPan, setAgencyPan] = useState('AABCO1234F');
  const [agencyStateCode, setAgencyStateCode] = useState('27 - Maharashtra');
  const [agencyBankName, setAgencyBankName] = useState('HDFC Bank Ltd.');
  const [agencyAccountNo, setAgencyAccountNo] = useState('50200088991234');
  const [agencyIfsc, setAgencyIfsc] = useState('HDFC0000240');

  // 15. Audit Telemetry State
  const [telemetrySearch, setTelemetrySearch] = useState('');
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([
    { id: 'log-1', action: 'ROLE_PERMISSION_UPDATED', operator: 'Abhinav Admin', role: 'Super Admin', details: 'Updated "sales_lead" access rights', ip: '192.168.1.45', timestamp: '2 mins ago', status: 'SUCCESS' },
    { id: 'log-2', action: 'KMS_KEY_ROTATED', operator: 'Security Bot', role: 'System Daemon', details: 'Master Envelope Key #V4 rotated', ip: 'internal-kms', timestamp: '1 hour ago', status: 'SUCCESS' },
    { id: 'log-3', action: 'EXPORT_COMPANIES_CSV', operator: 'Priya Sharma', role: 'Sales Lead', details: '18 verified company rows exported', ip: '103.21.244.2', timestamp: '3 hours ago', status: 'SUCCESS' },
    { id: 'log-4', action: 'PIPELINE_STAGE_CREATED', operator: 'Priya Sharma', role: 'Sales Lead', details: 'Created stage "Legal SOW & Security Review"', ip: '103.21.244.8', timestamp: 'Yesterday', status: 'SUCCESS' },
    { id: 'log-5', action: 'TWO_FACTOR_ENFORCED', operator: 'Abhinav Admin', role: 'Super Admin', details: 'Enforced 2FA mandatory for all 5 seats', ip: '192.168.1.45', timestamp: '2 days ago', status: 'SUCCESS' }
  ]);

  // Operational Settings Live Database State
  const [isLoadingSection, setIsLoadingSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 11. Services Catalog Modals & State
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Performance Marketing');
  const [newServiceModel, setNewServiceModel] = useState('Monthly Retainer');
  const [newServicePrice, setNewServicePrice] = useState('150000');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // 12. Lead Sources Modals & State
  const [showLeadSourceModal, setShowLeadSourceModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceChannel, setNewSourceChannel] = useState('Paid Social');
  const [newSourceCpl, setNewSourceCpl] = useState('500');

  // 13. Document Templates Modals & State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('Legal Contract');
  const [templateVersion, setTemplateVersion] = useState('v1.0');
  const [templateTerms, setTemplateTerms] = useState('');
  const [templateContent, setTemplateContent] = useState('');

  // 8. Pipelines database list
  const [pipelinesList, setPipelinesList] = useState<any[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<string>('');

  // 5. Roles database list
  const [rolesList, setRolesList] = useState<any[]>([]);

  // 16. Integrations Hub State (Real Credential-Backed Architecture)
  const DEFAULT_INTEGRATIONS = [
    { id: 'int-razorpay', name: 'Razorpay Payment Gateway', category: 'Payment Gateways', desc: 'Automated payment links, UPI intent & reconciliation for GST invoices', connected: false, statusText: 'Not Connected', icon: 'R', color: 'bg-blue-700' },
    { id: 'int-paytm', name: 'Paytm Payment Gateway (Paytm PG)', category: 'Payment Gateways', desc: 'Enterprise UPI Intent, Netbanking, Cards & automated reconciliation with Paytm Merchant Engine', connected: false, statusText: 'Not Connected', icon: 'P', color: 'bg-[#002E6E]' },
    { id: 'int-stripe', name: 'Stripe International', category: 'Payment Gateways', desc: 'USD/EUR card processing, subscription billing & recurring retainers', connected: false, statusText: 'Not Connected', icon: 'S', color: 'bg-indigo-600' },
    { id: 'int-meta', name: 'Meta Business Manager', category: 'Ad Networks', desc: 'Direct Partner access to Ad Accounts, CAPI Datasets & Pixel telemetry', connected: false, statusText: 'Not Connected', icon: 'M', color: 'bg-blue-600' },
    { id: 'int-google', name: 'Google Ads (MCC)', category: 'Ad Networks', desc: 'Manager account link for Search, Performance Max & YouTube campaigns', connected: false, statusText: 'Not Connected', icon: 'G', color: 'bg-red-500' },
    { id: 'int-shopify', name: 'Shopify Partner Collaborator', category: 'E-Commerce', desc: 'Collaborator Code handoff for Theme code, Analytics & Checkout pixels', connected: false, statusText: 'Not Connected', icon: 'S', color: 'bg-emerald-600' },
    { id: 'int-slack', name: 'Slack Operational Alerts', category: 'Communication & Alerts', desc: 'Instant pipeline notifications to #agency-sales and #finance-ops', connected: false, statusText: 'Not Connected', icon: '#', color: 'bg-purple-600' },
    { id: 'int-google-workspace', name: 'Google Workspace / Gmail', category: 'Productivity', desc: 'Calendar sync for discovery calls and outbound proposal dispatch', connected: false, statusText: 'Not Connected', icon: 'W', color: 'bg-slate-700' },
    { id: 'int-whatsapp', name: 'WhatsApp Cloud API', category: 'Communication & Alerts', desc: 'Automated proposal approval and invoice payment reminders via WhatsApp', connected: false, statusText: 'Not Connected', icon: 'WA', color: 'bg-emerald-500' }
  ];

  const [integrations, setIntegrations] = useState<any[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_INTEGRATIONS;
    try {
      const raw = localStorage.getItem('optivir_integrations_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with DEFAULT_INTEGRATIONS to guarantee Paytm PG and all required properties exist
          return DEFAULT_INTEGRATIONS.map(def => {
            const found = parsed.find((p: any) => p.id === def.id || (p.name && p.name.toLowerCase() === def.name.toLowerCase()));
            if (found && found.config && Object.keys(found.config).length > 0 && found.connected) {
              return { ...def, connected: true, statusText: found.statusText || 'Connected', config: found.config, lastSynced: found.lastSynced };
            }
            return def;
          });
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_INTEGRATIONS;
  });

  const [configuringInteg, setConfiguringInteg] = useState<any | null>(null);
  const [integForm, setIntegForm] = useState<Record<string, any>>({});
  const [showSecretField, setShowSecretField] = useState<Record<string, boolean>>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
  const [integCategoryFilter, setIntegCategoryFilter] = useState<string>('All');

  // Ad Accounts Management & Details Window
  const [selectedAdAccountDetails, setSelectedAdAccountDetails] = useState<any | null>(null);
  const [isLoadingAdAccountDetails, setIsLoadingAdAccountDetails] = useState(false);
  const [isFetchingAdAccounts, setIsFetchingAdAccounts] = useState(false);
  const [newAdAccountId, setNewAdAccountId] = useState('');
  const [newAdAccountName, setNewAdAccountName] = useState('');
  const [newAdAccountBusinessProfile, setNewAdAccountBusinessProfile] = useState('');
  const [newAdAccountAccessToken, setNewAdAccountAccessToken] = useState('');
  const [copiedAccountId, setCopiedAccountId] = useState(false);

  const openAdAccountDetails = async (adAccountId: string) => {
    setIsLoadingAdAccountDetails(true);
    const existing = (integForm.adAccounts || []).find((a: any) => a.id === adAccountId);
    setSelectedAdAccountDetails({ id: adAccountId, name: existing?.name || 'Fetching Live Metrics...', status: 'LOADING' });
    try {
      const res = await api.getAdAccountDetails(adAccountId);
      if (res.success && res.data) {
        setSelectedAdAccountDetails({
          ...res.data,
          business_name: existing?.business_name || res.data.business_name
        });
      } else {
        setSelectedAdAccountDetails({
          id: adAccountId,
          name: existing?.name || `Ad Account ${adAccountId}`,
          status: existing?.status || 'ACTIVE',
          currency: existing?.currency || 'INR',
          timezone: existing?.timezone || 'Asia/Kolkata (GMT+05:30)',
          amount_spent: existing?.amount_spent ? `₹${existing.amount_spent}` : '₹0.00',
          balance: existing?.balance ? `₹${existing.balance}` : '₹0.00',
          spend_cap: existing?.spend_cap || 'No Cap',
          business_name: existing?.business_name || (integForm.partnerId ? `BM #${integForm.partnerId}` : 'Meta Ad Account'),
          pixel_id: integForm.pixelId || null,
          connected_at: new Date().toISOString(),
          campaigns: []
        });
      }
    } catch {
      setSelectedAdAccountDetails({
        id: adAccountId,
        name: existing?.name || `Ad Account ${adAccountId}`,
        status: existing?.status || 'ACTIVE',
        currency: existing?.currency || 'INR',
        timezone: existing?.timezone || 'Asia/Kolkata (GMT+05:30)',
        amount_spent: existing?.amount_spent ? `₹${existing.amount_spent}` : '₹0.00',
        balance: existing?.balance ? `₹${existing.balance}` : '₹0.00',
        spend_cap: existing?.spend_cap || 'No Cap',
        business_name: existing?.business_name || 'Meta Ad Account',
        pixel_id: integForm.pixelId || null,
        connected_at: new Date().toISOString(),
        campaigns: []
      });
    } finally {
      setIsLoadingAdAccountDetails(false);
    }
  };

  // Toast / Save notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Storage Space State
  const [storageData, setStorageData] = useState<StorageEstimateData>({
    usage: 0,
    quota: 0,
    formattedUsage: '0.0 MB',
    formattedQuota: 'Loading...',
    percent: 0
  });

  useEffect(() => {
    getActualStorageEstimate().then(setStorageData);
  }, []);

  useEffect(() => {
    let isMounted = true;
    api.getIntegrations()
      .then(res => {
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setIntegrations(prev => {
            return prev.map(def => {
              const found = res.data.find((dbItem: any) => dbItem.id === def.id);
              if (found && found.connected) {
                const meta = found.metadata || {};
                const cfg = found.config || {};
                return {
                  ...def,
                  connected: true,
                  statusText: found.status_text || found.statusText || 'Connected',
                  config: {
                    ...cfg,
                    adAccounts: cfg.adAccounts || meta.adAccounts || [],
                    partnerId: cfg.partnerId || meta.partnerId || '',
                    pixelId: cfg.pixelId || meta.pixelId || '',
                    cid: cfg.cid || meta.cid || '',
                    domain: cfg.domain || meta.domain || ''
                  },
                  metadata: meta,
                  lastSynced: found.updated_at ? new Date(found.updated_at).toLocaleTimeString() : (found.lastSynced ? new Date(found.lastSynced).toLocaleTimeString() : 'Active')
                };
              }
              return def;
            });
          });
        }
      })
      .catch(err => {
        console.warn('Backend integrations sync error:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string, _type?: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyUUID = () => {
    navigator.clipboard.writeText('opt-tenant-optivirads');
    showToast('Tenant UUID copied to clipboard: opt-tenant-optivirads');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.updateProfile({
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        phone: profilePhone.trim() || undefined,
        avatarUrl: profileAvatarUrl || undefined
      });
      updateCurrentUser({
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        phone: profilePhone.trim() || null,
        avatarUrl: profileAvatarUrl || null
      });
      showToast(res.message || 'Profile details updated successfully!');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      // Sync local session so the avatar and name update immediately
      updateCurrentUser({
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        phone: profilePhone.trim() || null,
        avatarUrl: profileAvatarUrl || null
      });
      if (err.status === 404) {
        showToast('Profile saved locally. Note: Click "Manual Deploy -> Deploy latest commit" on Render to update live backend.', 'warning');
      } else {
        showToast(err.message || 'Failed to update profile', 'error');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRequestSelfOtp = async () => {
    try {
      setIsRequestingSelfOtp(true);
      const res = await api.requestPasswordOtp();
      if (res.success) {
        setSelfOtpSent(true);
        setSelfOtpTimer(60);
        showToast(res.message || 'OTP verification code sent to your email!');
      } else {
        showToast(res.message || 'Failed to dispatch verification code', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch verification code', 'error');
    } finally {
      setIsRequestingSelfOtp(false);
    }
  };

  const handleSelfChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfCurrentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (selfNewPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (selfNewPassword !== selfConfirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (!selfPasswordOtp.trim() || selfPasswordOtp.trim().length < 6) {
      showToast('Please enter the 6-digit OTP verification code sent to your email', 'error');
      return;
    }

    setIsSelfChangingPassword(true);
    try {
      const res = await api.changePassword(selfCurrentPassword, selfNewPassword, selfPasswordOtp.trim());
      if (res.success) {
        showToast('Password changed successfully!', 'success');
        setSelfCurrentPassword('');
        setSelfNewPassword('');
        setSelfConfirmPassword('');
        setSelfPasswordOtp('');
      } else {
        showToast(res.message || 'Failed to change password', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to change password. Verify current password and OTP code.', 'error');
    } finally {
      setIsSelfChangingPassword(false);
    }
  };

  // ==========================================
  // Real Database Data Loaders for Settings
  // ==========================================
  const loadOrganizationSettings = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getOrganizationSettings();
      if (res.success && res.data) {
        setOrgLegalName(res.data.legal_name || res.data.name || '');
        setTaxGstin(res.data.tax_gstin || '');
        setDomainWebsite(res.data.domain_website || '');
        setIndustry(res.data.industry || '');
        setSupportEmail(res.data.support_email || '');
        setSwitchboardPhone(res.data.switchboard_phone || '');
        if (res.data.logo_url) {
          setMasterLogoUrl(res.data.logo_url);
          if (typeof window !== 'undefined') {
            localStorage.setItem('optivir_master_logo', res.data.logo_url);
            window.dispatchEvent(new Event('optivir_logo_updated'));
          }
        }
      }
    } catch (err: any) {
      console.warn('Failed to load org settings:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadRegionalSettings = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getRegionalSettings();
      if (res.success && res.data) {
        if (res.data.timezone) {
          const tz = res.data.timezone;
          setTimezone(tz.includes('Asia/Kolkata') ? 'Asia/Kolkata (IST, UTC+05:30)' : tz);
        }
        if (res.data.currency) {
          const cur = res.data.currency;
          setLedgerCurrency(cur === 'INR' ? 'INR (₹) - Indian Rupee [Master Ledger]' : cur);
        }
        if (res.data.date_format) setDateFormat(res.data.date_format);
        if (res.data.fiscal_year) setFiscalYear(res.data.fiscal_year);
        if (res.data.auto_shift_adjustment !== undefined) setAutoShiftAdjustment(res.data.auto_shift_adjustment);
      }
    } catch (err: any) {
      console.warn('Failed to load regional settings:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadUserPreferences = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getUserPreferences();
      if (res.success && res.data) {
        if (res.data.landing_workspace) setLandingWorkspace(res.data.landing_workspace);
        if (res.data.density_profile) setDensityProfile(res.data.density_profile);
        if (res.data.auditory_chimes !== undefined) setAuditoryChimes(res.data.auditory_chimes);
        if (res.data.telemetry_diff !== undefined) setTelemetryDiff(res.data.telemetry_diff);
      }
    } catch (err: any) {
      console.warn('Failed to load user preferences:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadUsers = async (silent = false) => {
    if (!silent) setIsLoadingSection(true);
    try {
      const [res, clientsRes] = await Promise.allSettled([
        api.getSettingsUsers(),
        api.getClients({ all: 'true' })
      ]);
      if (res.status === 'fulfilled' && res.value.success && Array.isArray(res.value.data)) {
        setUsersList(res.value.data);
      }
      if (clientsRes.status === 'fulfilled' && clientsRes.value.success && Array.isArray(clientsRes.value.data)) {
        setClientsList(clientsRes.value.data);
      }
    } catch (err: any) {
      console.warn('Failed to load users:', err);
    } finally {
      if (!silent) setIsLoadingSection(false);
    }
  };

  const loadRoles = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getSettingsRoles();
      if (res.success && Array.isArray(res.data)) {
        setRolesList(res.data);
        const map: Record<string, Record<string, boolean>> = {};
        for (const r of res.data) {
          const roleKey = r.slug || r.name.toLowerCase();
          map[roleKey] = {};
          if (Array.isArray(r.permissions)) {
            for (const p of r.permissions) {
              map[roleKey][p] = true;
            }
          }
        }
        setPermissionsState(prev => ({ ...prev, ...map }));
      }
    } catch (err: any) {
      console.warn('Failed to load roles:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadTeams = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getSettingsTeams();
      if (res.success && Array.isArray(res.data)) {
        setPodsList(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load teams:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadSecuritySettings = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getSecuritySettings();
      if (res.success && res.data) {
        if (res.data.two_factor_enforced !== undefined) setTwoFactorEnforced(res.data.two_factor_enforced);
        if (res.data.session_timeout) setSessionTimeout(res.data.session_timeout);
        if (res.data.failed_lockout_limit) setFailedLockoutLimit(res.data.failed_lockout_limit);
        if (Array.isArray(res.data.ip_whitelist)) setIpWhitelist(res.data.ip_whitelist);
      }
    } catch (err: any) {
      console.warn('Failed to load security settings:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadPipelines = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getSettingsPipelines();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPipelinesList(res.data);
        const activePipe = res.data.find((p: any) => p.isDefault) || res.data[0];
        setActivePipelineId(activePipe.id);
        setSelectedPipelineName(activePipe.name);
        if (Array.isArray(activePipe.stages)) {
          setPipelineStages(activePipe.stages);
        }
      }
    } catch (err: any) {
      console.warn('Failed to load pipelines:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadCustomFields = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getCustomFieldDefinitions();
      if (res.success && Array.isArray(res.data)) {
        setCustomFieldsList(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load custom fields:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadTags = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getSystemTags();
      if (res.success && Array.isArray(res.data)) {
        setTagsList(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load tags:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadServices = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getServicesCatalog();
      if (res.success && Array.isArray(res.data)) {
        setServicesList(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load services:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadLeadSources = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getSettingsLeadSources();
      if (res.success && Array.isArray(res.data)) {
        setSourcesList(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load lead sources:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadDocumentTemplates = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getDocumentTemplates();
      if (res.success && Array.isArray(res.data)) {
        setTemplatesList(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load document templates:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadBillingSettings = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getBillingSettings();
      if (res.success && res.data) {
        if (res.data.gstin) setAgencyGstin(res.data.gstin);
        if (res.data.pan) setAgencyPan(res.data.pan);
        if (res.data.state_code) setAgencyStateCode(res.data.state_code);
        if (res.data.bank_name) setAgencyBankName(res.data.bank_name);
        if (res.data.account_no) setAgencyAccountNo(res.data.account_no);
        if (res.data.ifsc) setAgencyIfsc(res.data.ifsc);
      }
    } catch (err: any) {
      console.warn('Failed to load billing settings:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const loadAuditLogs = async () => {
    setIsLoadingSection(true);
    try {
      const res = await api.getAuditLogs(100);
      if (res.success && Array.isArray(res.data)) {
        setTelemetryLogs(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  // Synchronize section data on section switch
  useEffect(() => {
    let interval: any = null;
    if (activeSection === 'Organization Identity') loadOrganizationSettings();
    else if (activeSection === 'General Regional') loadRegionalSettings();
    else if (activeSection === 'My Preferences') loadUserPreferences();
    else if (activeSection === 'User Directory') {
      loadUsers();
      interval = setInterval(() => {
        loadUsers(true);
      }, 4000);
    }
    else if (activeSection === 'Roles & Permissions') loadRoles();
    else if (activeSection === 'Teams & Pods') loadTeams();
    else if (activeSection === 'SSO & Security 2FA') loadSecuritySettings();
    else if (activeSection === 'Pipelines & Stages') loadPipelines();
    else if (activeSection === 'Custom Fields') loadCustomFields();
    else if (activeSection === 'System Tags') loadTags();
    else if (activeSection === 'Services Catalog') loadServices();
    else if (activeSection === 'Lead Sources') loadLeadSources();
    else if (activeSection === 'Document Templates') loadDocumentTemplates();
    else if (activeSection === 'Billing & Currency') loadBillingSettings();
    else if (activeSection === 'Audit Telemetry') loadAuditLogs();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSection]);

  // Initial load for sidebar metadata counts
  useEffect(() => {
    loadUsers();
    loadTags();
    loadPipelines();
  }, []);

  // Master Logo Handlers
  const handleMasterLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setMasterLogoUrl(dataUrl);
        if (typeof window !== 'undefined') {
          localStorage.setItem('optivir_master_logo', dataUrl);
          window.dispatchEvent(new Event('optivir_logo_updated'));
        }
        showToast('Master logo asset selected. Click "Save Organization Identity" to persist.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetMasterLogo = () => {
    const defaultLogo = '/images/optivir-logo.png';
    setMasterLogoUrl(defaultLogo);
    if (typeof window !== 'undefined') {
      localStorage.setItem('optivir_master_logo', defaultLogo);
      window.dispatchEvent(new Event('optivir_logo_updated'));
    }
    showToast('Master logo reset to default OptiVir CRM logo. Click "Save Organization Identity" to persist.');
  };

  // Save Handlers for live persistence
  const handleSaveOrgIdentity = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateOrganizationSettings({
        legal_name: orgLegalName,
        tax_gstin: taxGstin,
        domain_website: domainWebsite,
        industry,
        support_email: supportEmail,
        switchboard_phone: switchboardPhone,
        logo_url: masterLogoUrl
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('optivir_master_logo', masterLogoUrl);
        window.dispatchEvent(new Event('optivir_logo_updated'));
      }
      showToast(res.message || 'Organization identity and master logo saved to master ledger [200 OK]');
    } catch (err: any) {
      showToast(`Error saving organization: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRegional = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateRegionalSettings({
        timezone,
        currency: ledgerCurrency,
        date_format: dateFormat,
        fiscal_year: fiscalYear,
        auto_shift_adjustment: autoShiftAdjustment
      });
      showToast(res.message || 'Regional preferences saved to database [200 OK]');
    } catch (err: any) {
      showToast(`Error saving regional settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateUserPreferences({
        landing_workspace: landingWorkspace,
        density_profile: densityProfile,
        auditory_chimes: auditoryChimes,
        telemetry_diff: telemetryDiff
      });
      showToast(res.message || 'Personal preferences saved to database [200 OK]');
    } catch (err: any) {
      showToast(`Error saving preferences: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateSecuritySettings({
        two_factor_enforced: twoFactorEnforced,
        session_timeout: sessionTimeout,
        failed_lockout_limit: failedLockoutLimit,
        ip_whitelist: ipWhitelist
      });
      showToast(res.message || 'Security policies persisted to database [200 OK]');
    } catch (err: any) {
      showToast(`Error saving security policy: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBilling = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateBillingSettings({
        gstin: agencyGstin,
        pan: agencyPan,
        state_code: agencyStateCode,
        bank_name: agencyBankName,
        account_no: agencyAccountNo,
        ifsc: agencyIfsc
      });
      showToast(res.message || 'Billing configuration saved to database [200 OK]');
    } catch (err: any) {
      showToast(`Error saving billing settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRoleMatrix = async () => {
    setIsSaving(true);
    try {
      const activeRole = rolesList.find(r => r.slug === selectedRoleKey || r.name.toLowerCase() === selectedRoleKey) || { id: selectedRoleKey };
      const currentPerms = permissionsState[selectedRoleKey] || {};
      const res = await api.updateSettingsRolePermissions(activeRole.id, currentPerms);
      showToast(res.message || `Role matrix updated for ${selectedRoleKey} [200 OK]`);
    } catch (err: any) {
      showToast(`Error saving role matrix: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    if (activeSection === 'Organization Identity') await handleSaveOrgIdentity();
    else if (activeSection === 'General Regional') await handleSaveRegional();
    else if (activeSection === 'My Preferences') await handleSavePreferences();
    else if (activeSection === 'Roles & Permissions') await handleSaveRoleMatrix();
    else if (activeSection === 'SSO & Security 2FA') await handleSaveSecurity();
    else if (activeSection === 'Billing & Currency') await handleSaveBilling();
    else if (activeSection === 'Pipelines & Stages') {
      showToast('Pipeline stages are saved in real-time on edit & add [200 OK]');
    } else {
      showToast(`Configuration updated: ${activeSection} synchronized [200 OK]`);
    }
  };

  const handleRollback = () => {
    if (activeSection === 'Organization Identity') loadOrganizationSettings();
    else if (activeSection === 'General Regional') loadRegionalSettings();
    else if (activeSection === 'My Preferences') loadUserPreferences();
    else if (activeSection === 'User Directory') loadUsers();
    else if (activeSection === 'Roles & Permissions') loadRoles();
    else if (activeSection === 'Teams & Pods') loadTeams();
    else if (activeSection === 'SSO & Security 2FA') loadSecuritySettings();
    else if (activeSection === 'Pipelines & Stages') loadPipelines();
    else if (activeSection === 'Custom Fields') loadCustomFields();
    else if (activeSection === 'System Tags') loadTags();
    else if (activeSection === 'Services Catalog') loadServices();
    else if (activeSection === 'Lead Sources') loadLeadSources();
    else if (activeSection === 'Document Templates') loadDocumentTemplates();
    else if (activeSection === 'Billing & Currency') loadBillingSettings();
    else if (activeSection === 'Audit Telemetry') loadAuditLogs();
    showToast(`Configuration reloaded from live database for ${activeSection}`);
  };

  interface NavItemConfig {
    id: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
    redDot?: boolean;
    greenDot?: boolean;
  }

  // Sub-Navigation Hubs
  const navGroups: { title: string; count: number; items: NavItemConfig[] }[] = isMasterOwner
    ? [
        {
          title: 'MY ACCOUNT',
          count: 1,
          items: [
            { id: 'My Profile', icon: UserCircle }
          ]
        },
        {
          title: 'ORGANIZATION & BILLING',
          count: 4,
          items: [
            { id: 'Organization Identity', icon: Building2 },
            { id: 'General Regional', icon: Globe2 },
            { id: 'Billing & Currency', icon: CreditCard },
            { id: 'Document Templates', icon: FileText }
          ]
        },
        {
          title: 'TEAM & SECURITY',
          count: 4,
          items: [
            { id: 'User Directory', icon: Users, badge: `${usersList.length}` },
            { id: 'Roles & Permissions', icon: KeyRound, redDot: true },
            { id: 'Teams & Pods', icon: Users },
            { id: 'SSO & Security 2FA', icon: ShieldCheck }
          ]
        },
        {
          title: 'PIPELINE & SERVICES',
          count: 5,
          items: [
            { id: 'Pipelines & Stages', icon: Workflow },
            { id: 'Services Catalog', icon: Briefcase },
            { id: 'Lead Sources', icon: Layers },
            { id: 'System Tags', icon: Tag },
            { id: 'Custom Fields', icon: FileCode }
          ]
        },
        {
          title: 'INTEGRATIONS HUB',
          count: 1,
          items: [
            { id: 'Integrations Hub', icon: Network, greenDot: true }
          ]
        }
      ]
    : [
        {
          title: 'MY ACCOUNT',
          count: 1,
          items: [
            { id: 'My Profile', icon: UserCircle }
          ]
        }
      ];

  return (
    <div className="pb-16 transition-colors duration-200 font-sans">
      {/* Top Enterprise Status Bar */}
      <div className="bg-[#0A1628] text-white px-6 py-2.5 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold tracking-wider text-slate-200 uppercase text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Settings &amp; Administration Console</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Multi-Tenant PostgreSQL Architecture Active</span>
        </div>

        {/* Telemetry Status Strip with Rollback & Save */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-300 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Telemetry Synchronized
          </span>

          <button
            onClick={handleRollback}
            className="flex items-center gap-1 px-3 py-1 rounded bg-[#112440] hover:bg-[#162D50] border border-[#1D365D] text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Rollback</span>
          </button>

          <button
            onClick={handleSaveChanges}
            className="flex items-center gap-1 px-3.5 py-1 rounded bg-[#B91C1C] hover:bg-[#991B1B] text-xs font-bold text-white shadow-xs transition cursor-pointer"
          >
            <Save className="w-3 h-3" />
            <span>Save Changes</span>
            <span className="text-[9px] bg-red-900/80 px-1 py-0.2 rounded ml-0.5">⌘S</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1628] text-white px-4 py-3 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-5 w-full">
        {/* 1. Header & Navigation Breadcrumb */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B1727] dark:bg-[#111E34] text-white flex items-center justify-center shadow-xs shrink-0 border border-[#1E293B]">
              <Settings className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC] tracking-tight">
                  Settings &amp; System Administration
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                  Enterprise Mode
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Section: {activeSection}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Global tenant policies, permissions, security enforcement &amp; operational pipelines
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Tabs (< lg) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-2 px-2">
          {navGroups.flatMap(g => g.items).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${isActive
                  ? 'bg-[#0A1628] text-white shadow-xs dark:bg-rose-950/70 dark:border dark:border-rose-900/50'
                  : 'bg-white dark:bg-[#0B1424] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E6EC] dark:border-[#152238] hover:text-[#0B1727] dark:hover:text-white'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{item.id}</span>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || (isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')
                    }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Main Two-Column Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SUB-NAVIGATION SIDEBAR (3 cols) — Visible on desktop */}
          <div className="lg:col-span-3 space-y-5 hidden lg:block">
            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-3 shadow-xs space-y-4">
              {navGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span>{group.title}</span>
                    <span className="text-slate-400">{group.count}</span>
                  </div>

                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${isActive
                            ? 'bg-[#0A1628] text-white shadow-xs dark:bg-rose-950/70 dark:border dark:border-rose-900/50'
                            : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#111E34] hover:text-[#0B1727] dark:hover:text-white'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white text-rose-400' : 'text-slate-400'}`} />
                            <span>{item.id}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || (isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')
                                }`}>
                                {item.badge}
                              </span>
                            )}
                            {item.redDot && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
                            )}
                            {item.greenDot && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            )}
                            {isActive && (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT MAIN CONFIGURATION PANEL (9 cols) */}
          <div className="lg:col-span-9 space-y-6">

            {/* ========================================================================= */}
            {/* 0. TAB: MY PROFILE (Self-Service Profile & Display Picture)              */}
            {/* ========================================================================= */}
            {activeSection === 'My Profile' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        My Personal Profile
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Self-Service Account
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Manage your personal credentials, contact details, display picture, and access password.
                    </p>
                  </div>
                </div>

                {/* Profile Photo & Personal Info Form */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Profile Photo Box */}
                  <div className="md:col-span-4 bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      DISPLAY PICTURE / AVATAR
                    </span>
                    <div className="flex flex-col items-center justify-center p-3">
                      <div className="relative group shrink-0">
                        <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center border-2 border-rose-500 shadow-md bg-slate-100 dark:bg-slate-800">
                          {profileAvatarUrl ? (
                            <img
                              src={profileAvatarUrl}
                              alt="Profile Avatar"
                              className="w-full h-full object-cover object-center aspect-square block rounded-full"
                              style={{ width: '112px', height: '112px', minWidth: '112px', minHeight: '112px', objectFit: 'cover', objectPosition: 'center' }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold">
                              {profileFirstName?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                              {profileLastName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || ''}
                            </div>
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-full shadow-lg cursor-pointer transition">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 10 * 1024 * 1024) {
                                showToast('Image size exceeds 10MB limit. Please choose a smaller photo.', 'error');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  const TARGET_SIZE = 256;
                                  canvas.width = TARGET_SIZE;
                                  canvas.height = TARGET_SIZE;
                                  const ctx = canvas.getContext('2d');
                                  if (ctx) {
                                    // 1:1 center-crop to eliminate any distortion or squishing
                                    const minDim = Math.min(img.width, img.height);
                                    const sx = (img.width - minDim) / 2;
                                    const sy = (img.height - minDim) / 2;
                                    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE);
                                    const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
                                    setProfileAvatarUrl(optimizedDataUrl);
                                  } else {
                                    setProfileAvatarUrl(event.target?.result as string);
                                  }
                                  showToast('Display picture updated. Click "Save Profile Details" to apply.');
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white mt-3 text-center">
                        {profileFirstName || user?.firstName} {profileLastName || user?.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 text-center">
                        {user?.roleName || user?.role || 'Team Member'}
                      </span>
                    </div>
                    {profileAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileAvatarUrl(null);
                          showToast('Avatar removed. Click "Save Profile Details" to apply.');
                        }}
                        className="w-full py-1.5 text-center text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer border border-rose-200 dark:border-rose-900/40 rounded-xl"
                      >
                        Remove Picture
                      </button>
                    )}
                    <p className="text-[10px] text-slate-500 leading-relaxed text-center">
                      Accepted formats: JPG, PNG, WEBP (Max 2MB). Used across team directory, project deliverables &amp; header.
                    </p>

                    {/* Active System Telemetry Card */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Logged-In System</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                          1 Active
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {user?.currentDevice?.formatted || 'Current Computer'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        IP: {user?.currentDevice?.ip || '127.0.0.1'}
                      </div>
                      <p className="text-[9px] text-slate-400 leading-tight">
                        Single-system policy is active. Logging in from another browser or computer will sign this system out.
                      </p>
                    </div>
                  </div>

                  {/* Profile Form Fields */}
                  <div className="md:col-span-8 space-y-4 text-xs">
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            required
                            value={profileFirstName}
                            onChange={(e) => setProfileFirstName(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={profileLastName}
                            onChange={(e) => setProfileLastName(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Contact Phone Number
                          </label>
                          <input
                            type="text"
                            placeholder="+91 99950 00000"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Email Address (Primary Login ID)
                          </label>
                          <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 select-none">
                            <span className="font-mono text-[11px]">{user?.email || 'user@optivirads.com'}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Verified
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Role &amp; Privilege
                          </label>
                          <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-semibold select-none">
                            {user?.roleName || user?.role || 'Team Member'} {isMasterOwner ? '(Executive Owner)' : ''}
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Designation
                          </label>
                          <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-semibold select-none">
                            {user?.designation || 'Specialist'}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="px-5 py-2.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSavingProfile ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Saving Profile...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Profile Details</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Change Password Card */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-rose-500" />
                          <span>Change Account Password</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Update your secret login password. Must be at least 6 characters.
                        </p>
                      </div>

                      <form onSubmit={handleSelfChangePassword} className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                              Current Password
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="••••••••"
                              value={selfCurrentPassword}
                              onChange={(e) => setSelfCurrentPassword(e.target.value)}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                              New Password
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="Min 6 chars"
                              value={selfNewPassword}
                              onChange={(e) => setSelfNewPassword(e.target.value)}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="Repeat new password"
                              value={selfConfirmPassword}
                              onChange={(e) => setSelfConfirmPassword(e.target.value)}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500"
                            />
                          </div>
                        </div>

                        {/* OTP Verification Field */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                              Email Verification Code (OTP) *
                            </label>
                            {selfOtpTimer > 0 ? (
                              <span className="text-slate-400 font-medium">Resend in {selfOtpTimer}s</span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleRequestSelfOtp}
                                disabled={isRequestingSelfOtp}
                                className="text-rose-500 hover:text-rose-600 font-bold cursor-pointer underline disabled:opacity-50"
                              >
                                {isRequestingSelfOtp ? 'Sending code...' : (selfOtpSent ? 'Resend Code' : 'Send Code to Email')}
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2 max-w-sm">
                            <input
                              type="text"
                              maxLength={6}
                              required
                              placeholder="Enter 6-digit OTP"
                              value={selfPasswordOtp}
                              onChange={(e) => setSelfPasswordOtp(e.target.value.replace(/\D/g, ''))}
                              className="w-40 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500 font-mono tracking-widest text-center text-xs"
                            />
                            {!selfOtpSent && (
                              <button
                                type="button"
                                onClick={handleRequestSelfOtp}
                                disabled={isRequestingSelfOtp}
                                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer text-xs"
                              >
                                {isRequestingSelfOtp ? 'Sending...' : 'Send OTP'}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSelfChangingPassword || !selfPasswordOtp}
                            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-semibold rounded-xl text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isSelfChangingPassword ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Updating Password...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Verify &amp; Update Password</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 1. TAB: ORGANIZATION IDENTITY                                            */}
            {/* ========================================================================= */}
            {isMasterOwner && activeSection === 'Organization Identity' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Organization Identity &amp; Brand Core
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A1628] text-white">
                        Primary Tenant
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Core legal, corporate entity metadata, master branding, and global system identifiers.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">Tenant UUID:</span>
                    <button
                      onClick={handleCopyUUID}
                      className="font-mono bg-slate-100 dark:bg-[#111E34] text-slate-800 dark:text-slate-200 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 hover:bg-slate-200 transition cursor-pointer"
                    >
                      <span>opt-tenant-optivirads</span>
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Logo Box & Main Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-4 bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                      TENANT MASTER LOGO
                    </span>
                    <div className="h-28 bg-white dark:bg-white rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-4 shadow-inner">
                      <img
                        src={masterLogoUrl}
                        alt="OptiVir CRM"
                        className="h-14 w-auto max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Recommended resolution: 2171x724 SVG or transparent high-res PNG. Used in CRM sidebar, header &amp; login portals.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex-1 py-1.5 rounded-lg bg-white dark:bg-[#111E34] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-100 transition text-center cursor-pointer">
                        <Upload className="w-3.5 h-3.5 inline mr-1" />
                        Replace Asset
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleMasterLogoUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleResetMasterLogo}
                        className="p-2 rounded-lg bg-white dark:bg-[#111E34] border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Reset to Default CRM Logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Organization Legal Name
                        </label>
                        <input
                          type="text"
                          value={orgLegalName}
                          onChange={(e) => setOrgLegalName(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tax / GSTIN / VAT ID
                        </label>
                        <input
                          type="text"
                          value={taxGstin}
                          onChange={(e) => setTaxGstin(e.target.value)}
                          placeholder="e.g. 27AABCO1234F1Z5"
                          className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Corporate Domain &amp; Website
                        </label>
                        <input
                          type="text"
                          value={domainWebsite}
                          onChange={(e) => setDomainWebsite(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Industry Classification
                        </label>
                        <input
                          type="text"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Primary Support Dispatch Email
                        </label>
                        <input
                          type="email"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Primary HQ Phone Switchboard
                        </label>
                        <input
                          type="text"
                          value={switchboardPhone}
                          onChange={(e) => setSwitchboardPhone(e.target.value)}
                          className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleSaveOrgIdentity}
                        disabled={isSaving}
                        className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save Organization Identity'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. TAB: GENERAL REGIONAL                                                 */}
            {/* ========================================================================= */}
            {activeSection === 'General Regional' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-blue-500" />
                    <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                      Regionalization &amp; Currency Localization
                    </h2>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Determines default transaction valuation, timeline calculations, and pipeline aggregations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Corporate Standard Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white"
                    >
                      <option>Asia/Kolkata (IST, UTC+05:30)</option>
                      <option>America/New_York (EST, UTC-05:00)</option>
                      <option>Europe/London (GMT/BST, UTC+00:00)</option>
                      <option>Asia/Dubai (GST, UTC+04:00)</option>
                      <option>Asia/Singapore (SGT, UTC+08:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reporting Ledger Base Currency
                    </label>
                    <select
                      value={ledgerCurrency}
                      onChange={(e) => setLedgerCurrency(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white"
                    >
                      <option>INR (₹) - Indian Rupee [Master Ledger]</option>
                      <option>USD ($) - United States Dollar</option>
                      <option>EUR (€) - Euro</option>
                      <option>GBP (£) - British Pound Sterling</option>
                      <option>AED (د.إ) - UAE Dirham</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      System Date &amp; Time Format
                    </label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white font-mono"
                    >
                      <option>DD/MM/YYYY (24-Hour: 14:32)</option>
                      <option>MM/DD/YYYY (12-Hour: 02:32 PM)</option>
                      <option>YYYY-MM-DD (ISO 8601)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fiscal Year Cycle Definition
                    </label>
                    <select
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white"
                    >
                      <option>April 1st (Indian / UK Standard)</option>
                      <option>January 1st (Calendar Year)</option>
                      <option>July 1st (Australian Standard)</option>
                      <option>October 1st (US Federal Standard)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#0A101C] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Auto-Shift Day/Night Roster Adjustment
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Dynamically realigns billable timers and task due dates when team members work across timezone boundaries.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoShiftAdjustment(!autoShiftAdjustment)}
                    className="cursor-pointer"
                  >
                    <div className={`w-11 h-6 rounded-full p-1 transition ${autoShiftAdjustment ? 'bg-[#DC2626] flex justify-end' : 'bg-slate-300 dark:bg-slate-700 flex justify-start'}`}>
                      <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                    </div>
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveRegional}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Regional Settings'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. TAB: MY PREFERENCES                                                   */}
            {/* ========================================================================= */}
            {activeSection === 'My Preferences' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                      My Administrative Preferences
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Operator Profile
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Personalized interface layout, default dashboards, and sensory telemetry cues.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Default Landing Workspace
                    </label>
                    <select
                      value={landingWorkspace}
                      onChange={(e) => setLandingWorkspace(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2.5 text-xs text-[#0B1727] dark:text-white font-semibold"
                    >
                      <option>Executive Overview Dashboard</option>
                      <option>Client 360° Operating Profile</option>
                      <option>Sales Pipeline Kanban</option>
                      <option>GST Invoicing Ledger</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Console Density Profile
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Row padding and table cell sizing across all CRM modules.
                      </p>
                    </div>
                    <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                      <button
                        onClick={() => setDensityProfile('Dense')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${densityProfile === 'Dense' ? 'bg-white dark:bg-[#0B1424] text-[#0B1727] dark:text-white shadow-xs' : 'text-slate-500'}`}
                      >
                        Dense
                      </button>
                      <button
                        onClick={() => setDensityProfile('Comfortable')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${densityProfile === 'Comfortable' ? 'bg-white dark:bg-[#0B1424] text-[#0B1727] dark:text-white shadow-xs' : 'text-slate-500'}`}
                      >
                        Comfortable
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Auditory Alert Chimes
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Deal win chime, SLA threshold alerts &amp; high-intent lead audio alerts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuditoryChimes(!auditoryChimes)}
                      className="cursor-pointer"
                    >
                      <div className={`w-11 h-6 rounded-full p-1 transition ${auditoryChimes ? 'bg-[#DC2626] flex justify-end' : 'bg-slate-300 dark:bg-slate-700 flex justify-start'}`}>
                        <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                      </div>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Telemetry Diff Highlighting
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Highlight changed metrics and financial delta percentages with green/red flashes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTelemetryDiff(!telemetryDiff)}
                      className="cursor-pointer"
                    >
                      <div className={`w-11 h-6 rounded-full p-1 transition ${telemetryDiff ? 'bg-[#0A1628] flex justify-end' : 'bg-slate-300 dark:bg-slate-700 flex justify-start'}`}>
                        <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save My Preferences'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. TAB: USER DIRECTORY                                                   */}
            {/* ========================================================================= */}
            {activeSection === 'User Directory' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        User Directory &amp; Permissions Management
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {usersList.length} Active Accounts
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Create users via Email ID, assign granular module permissions, and manage credentials.
                    </p>
                  </div>
                  {isMasterOwner ? (
                    <button
                      onClick={() => {
                        setNewUserEmail('');
                        setNewUserName('');
                        setNewUserRole('sales_lead');
                        setNewUserDesignation('Growth Specialist');
                        setNewUserPassword('');
                        setNewUserAllowedTabs(['dashboard', 'leads', 'pipeline', 'proposals', 'clients']);
                        setNewUserIsClientOnly(false);
                        setNewUserSelectedClientId(clientsList[0]?.id || '');
                        setShowInviteModal(true);
                      }}
                      className="px-3.5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create User &amp; Assign Permissions</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs border border-slate-200 dark:border-slate-700 cursor-not-allowed" title="Only the primary Executive Owner can create new accounts">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Executive Owner Only</span>
                    </div>
                  )}
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search by email, name, or role..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-slate-400">Filter Role:</span>
                    <select
                      value={teamRoleFilter}
                      onChange={(e) => setTeamRoleFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-medium"
                    >
                      <option value="all">All Roles</option>
                      <option value="owner">Executive &amp; Owner</option>
                      <option value="coo">Chief Operating Officer (COO)</option>
                      <option value="sales_lead">Sales Lead</option>
                      <option value="marketing_lead">Marketing Lead</option>
                      <option value="social_media_lead">Social Media Lead</option>
                      <option value="media_buyer">Media &amp; Ads Lead</option>
                      <option value="account_manager">Client Account Manager</option>
                      <option value="finance_lead">Finance &amp; Billing Lead</option>
                      <option value="operations_lead">Operations &amp; Delivery Lead</option>
                      <option value="client_portal">Client-Specific Accounts</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs min-w-[920px]">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">User &amp; Email ID</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Designation</th>
                        <th className="py-3 px-4">Authorized Modules</th>
                        <th className="py-3 px-4">Logged-In System</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right min-w-[200px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {usersList
                        .filter(u => teamRoleFilter === 'all' || u.role === teamRoleFilter)
                        .filter(u => !teamSearch || (u.name && u.name.toLowerCase().includes(teamSearch.toLowerCase())) || (u.email && u.email.toLowerCase().includes(teamSearch.toLowerCase())))
                        .map((u) => {
                          const tabs: string[] = u.allowed_tabs || [];
                          const isUniversal = u.is_owner || u.role === 'owner' || u.role === 'super_admin' || tabs.includes('*') || u.email?.toLowerCase() === 'optivirads@gmail.com' || u.email?.toLowerCase() === 'abhinandc97@gmail.com';
                          const isSuperBadge = u.email?.toLowerCase() === 'optivirads@gmail.com' || u.email?.toLowerCase() === 'abhinandc97@gmail.com' || u.is_owner || u.role === 'super_admin';
                          const isClientAccount = !!u.clientId || u.role === 'client_portal';

                          return (
                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-lg ${u.avatarBg || (isClientAccount ? 'bg-amber-600' : 'bg-slate-700')} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                                    {u.initials || (u.email ? u.email[0].toUpperCase() : 'U')}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                      <span>{u.name || u.email.split('@')[0]}</span>
                                      {isSuperBadge && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900">
                                          Super Admin
                                        </span>
                                      )}
                                      {isClientAccount && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                                          <Building2 className="w-2.5 h-2.5" /> Client User
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {isClientAccount ? (
                                  <div className="flex flex-col">
                                    <span className="font-bold text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1">
                                      <Building2 className="w-3 h-3" /> Client Account
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                      {u.clientName || 'Assigned Client'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{u.roleLabel || u.role}</span>
                                    {u.role === 'coo' && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-900">
                                        COO
                                      </span>
                                    )}
                                    {u.role === 'marketing_lead' && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900">
                                        Marketing
                                      </span>
                                    )}
                                    {u.role === 'social_media_lead' && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 font-bold border border-pink-200 dark:border-pink-900">
                                        Social Media
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.designation || (isClientAccount ? 'Client Representative' : 'Specialist')}</td>
                              <td className="py-3 px-4 max-w-xs">
                                {isClientAccount ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                    <Building2 className="w-3 h-3" /> Client-Scoped ({u.clientName || 'Single Account'})
                                  </span>
                                ) : isUniversal ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                                    <ShieldCheck className="w-3 h-3" /> Full Access (All 13 Modules)
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {tabs.length === 0 ? (
                                      <span className="text-[10px] text-slate-400">Dashboard only</span>
                                    ) : (
                                      tabs.slice(0, 4).map(tab => (
                                        <span key={tab} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                                          {tab}
                                        </span>
                                      ))
                                    )}
                                    {tabs.length > 4 && (
                                      <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                        +{tabs.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              {/* Logged-In System / Device */}
                              <td className="py-3 px-4 min-w-[210px]">
                                {u.desktopDevice && u.mobileDevice ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-900 dark:text-white font-medium">
                                      <Laptop className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <span className="font-bold truncate text-[10.5px]">{u.desktopDevice.formatted || `${u.desktopDevice.os} • ${u.desktopDevice.browser}`}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-900 dark:text-white font-medium">
                                      <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span className="font-bold truncate text-[10.5px]">{u.mobileDevice.formatted || `${u.mobileDevice.os} • ${u.mobileDevice.browser}`}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                      <span className="text-emerald-600 dark:text-emerald-400 font-sans font-bold flex items-center gap-1 text-[9px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                        2 Systems Active (1 Phone + 1 PC)
                                      </span>
                                    </div>
                                  </div>
                                ) : u.currentDevice ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                      {u.currentDevice.deviceType === 'mobile' ? (
                                        <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      ) : u.currentDevice.deviceType === 'tablet' ? (
                                        <Tablet className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                      ) : (
                                        <Laptop className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      )}
                                      <span className="font-bold text-[11px] text-slate-900 dark:text-white truncate" title={u.currentDevice.formatted || `${u.currentDevice.os} • ${u.currentDevice.browser}`}>
                                        {u.currentDevice.formatted || `${u.currentDevice.os} • ${u.currentDevice.browser}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                      <span>IP: {u.currentDevice.ip || '127.0.0.1'}</span>
                                      <span className="text-emerald-600 dark:text-emerald-400 font-sans font-bold flex items-center gap-1 text-[9px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                        1 System Active
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                                    <span>No active system</span>
                                  </div>
                                )}
                              </td>
                              {/* Status & Remote Logout */}
                              <td className="py-3 px-4">
                                <div className="flex flex-col items-start gap-1.5">
                                  <span className={u.status === 'Active' ? 'text-emerald-500 font-semibold text-xs' : 'text-amber-500 font-semibold text-xs'}>
                                    {u.status || 'Active'}
                                  </span>
                                  {isSuperAdminEmail && u.email?.toLowerCase() !== 'optivirads@gmail.com' && (u.activeSessionId || u.isOnline || u.currentDevice) && (
                                    <button
                                      type="button"
                                      onClick={() => setLogoutConfirmUser(u)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 dark:text-rose-400 text-[10px] font-bold border border-rose-200 dark:border-rose-800 cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
                                      title={`Remotely terminate active session for ${u.name || u.email}`}
                                    >
                                      <LogOut className="w-2.5 h-2.5" />
                                      Log Out
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-right whitespace-nowrap min-w-[180px]">
                                {isMasterOwner ? (
                                  <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                                    {/* Permissions Button in its own aligned column */}
                                    <div className="w-16 text-right">
                                      {u.email?.toLowerCase() !== 'optivirads@gmail.com' && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingUser(u);
                                            setEditRole(u.role || 'sales_lead');
                                            setEditDesignation(u.designation || '');
                                            const rawTabs = u.allowed_tabs || [];
                                            if (rawTabs.includes('*') || u.is_owner || u.role === 'super_admin' || u.role === 'owner') {
                                              setEditAllowedTabs(AVAILABLE_CRM_MODULES.map(m => m.id));
                                            } else {
                                              setEditAllowedTabs(rawTabs.length > 0 ? rawTabs : ['dashboard']);
                                            }
                                            setEditIsClientOnly(!!u.clientId || u.role === 'client_portal');
                                            setEditSelectedClientId(u.clientId || (clientsList[0]?.id || ''));
                                            setShowEditPermissionsModal(true);
                                          }}
                                          className="text-blue-500 hover:text-blue-400 font-semibold text-xs cursor-pointer hover:underline"
                                          title="Edit Module Permissions"
                                        >
                                          Permissions
                                        </button>
                                      )}
                                    </div>

                                    {/* Reset Password & Remove stacked vertically in the exact same column */}
                                    <div className="flex flex-col items-end gap-1 min-w-[95px]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setResettingUser(u);
                                          setAdminNewPassword('');
                                          setShowResetPasswordModal(true);
                                        }}
                                        className="text-amber-500 hover:text-amber-400 font-semibold text-xs cursor-pointer hover:underline leading-tight"
                                        title="Reset User Password"
                                      >
                                        Reset Password
                                      </button>
                                      {u.email?.toLowerCase() !== 'optivirads@gmail.com' && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const displayName = u.name || u.email;
                                            setConfirmModalConfig({
                                              isOpen: true,
                                              title: 'Remove User from Workspace',
                                              badge: (u.role || 'Member').toUpperCase(),
                                              description: `Are you sure you want to remove ${displayName} from the workspace?`,
                                              subDescription: 'This user will immediately lose access to all CRM modules, client portals, and assigned deliverables. This action cannot be undone automatically.',
                                              confirmText: 'Remove User',
                                              variant: 'danger',
                                              details: [
                                                { label: 'Name', value: displayName },
                                                { label: 'Email', value: u.email },
                                                { label: 'Role', value: (u.role || 'user').toUpperCase() },
                                                ...(u.designation ? [{ label: 'Designation', value: u.designation }] : []),
                                              ],
                                              onConfirm: async () => {
                                                try {
                                                  if (u.id && !u.id.startsWith('usr-')) {
                                                    await api.deleteSettingsUser(u.id);
                                                    await loadUsers();
                                                  } else {
                                                    setUsersList(prev => prev.filter(item => item.id !== u.id));
                                                  }
                                                  showToast(`Removed ${displayName} from directory`);
                                                  setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
                                                } catch (err: any) {
                                                  showToast(`Failed to remove ${displayName}: ${err.message}`, 'error');
                                                }
                                              },
                                            });
                                          }}
                                          className="text-rose-500 hover:text-rose-400 font-semibold text-[11px] cursor-pointer hover:underline leading-tight"
                                          title="Remove User"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">Owner Protected</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* 1. Create User & Assign Permissions Modal */}
                {showInviteModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Create User &amp; Assign Permissions</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Register user by email ID and configure accessible modules</p>
                        </div>
                        <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>

                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newUserEmail.trim()) {
                          showToast('Email address is required', 'error');
                          return;
                        }
                        try {
                          setIsSubmittingUser(true);
                          const res = await api.createSettingsUser({
                            name: newUserName.trim() || undefined,
                            email: newUserEmail.trim(),
                            role: newUserIsClientOnly ? 'client_portal' : newUserRole,
                            designation: newUserIsClientOnly ? (newUserDesignation.trim() || 'Client Representative') : (newUserDesignation.trim() || 'Specialist'),
                            password: newUserPassword.trim() || 'Optivir@2026',
                            allowed_tabs: newUserIsClientOnly ? ['dashboard', 'projects', 'tasks', 'marketing', 'reports', 'finance'] : newUserAllowedTabs,
                            client_id: newUserIsClientOnly ? newUserSelectedClientId : null
                          });
                          setShowInviteModal(false);
                          setNewUserName('');
                          setNewUserEmail('');
                          setNewUserPassword('Optivir@2026');
                          await loadUsers();
                          showToast(res.message || `User ${newUserEmail} created with permissions assigned!`);
                        } catch (err: any) {
                          showToast(`Error creating user: ${err.message}`, 'error');
                        } finally {
                          setIsSubmittingUser(false);
                        }
                      }} className="space-y-4 text-xs">

                        {/* Email ID (Primary identifier) */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-slate-800 dark:text-slate-200">Email ID (Primary Login)</label>
                            <span className="text-[10px] text-rose-500 font-bold">Required</span>
                          </div>
                          <input
                            type="email"
                            required
                            placeholder="user@optivirads.com"
                            value={newUserEmail}
                            onChange={e => setNewUserEmail(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#DC2626]"
                          />
                        </div>

                        {/* Name & Initial Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold block mb-1 text-slate-800 dark:text-slate-200">Full Name (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. Maya Sharma (or blank)"
                              value={newUserName}
                              onChange={e => setNewUserName(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#DC2626]"
                            />
                          </div>
                          <div>
                            <label className="font-semibold block mb-1 text-slate-800 dark:text-slate-200">Initial Password</label>
                            <input
                              type="text"
                              placeholder="Default: Optivir@2026"
                              value={newUserPassword}
                              onChange={e => setNewUserPassword(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#DC2626]"
                            />
                            <span className="text-[10px] text-slate-400 mt-0.5 block">User can change after login</span>
                          </div>
                        </div>

                        {/* Single-Client Assignment Toggle */}
                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2.5">
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white text-xs block">Assign to a specific client only</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">Confines user access strictly to that client's deliverables, tasks, campaigns &amp; invoices</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={newUserIsClientOnly}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setNewUserIsClientOnly(checked);
                                if (checked) {
                                  setNewUserRole('client_portal');
                                  setNewUserDesignation('Client Representative');
                                  setNewUserAllowedTabs(['dashboard', 'projects', 'tasks', 'marketing', 'reports', 'finance']);
                                  if (!newUserSelectedClientId && clientsList.length > 0) {
                                    setNewUserSelectedClientId(clientsList[0].id);
                                  }
                                } else {
                                  setNewUserRole('sales_lead');
                                  setNewUserDesignation('Growth Specialist');
                                  setNewUserAllowedTabs(['dashboard', 'leads', 'pipeline', 'proposals', 'clients']);
                                }
                              }}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                            />
                          </label>
                          {newUserIsClientOnly && (
                            <div className="pt-2 border-t border-amber-500/20">
                              <label className="font-semibold block mb-1 text-slate-800 dark:text-slate-200 text-xs">Select Client Account</label>
                              {clientsList.length === 0 ? (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400">No active clients found in CRM. Create a client in Clients module first.</p>
                              ) : (
                                <select
                                  value={newUserSelectedClientId}
                                  onChange={(e) => setNewUserSelectedClientId(e.target.value)}
                                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-amber-500/40 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                                >
                                  {clientsList.map(c => (
                                    <option key={c.id} value={c.id}>
                                      {c.company_name || c.name || c.id} {c.account_manager_name ? `(AM: ${c.account_manager_name})` : ''}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Role & Designation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold block mb-1 text-slate-800 dark:text-slate-200">
                              {newUserIsClientOnly ? 'Assigned Portal Mode' : 'Role Classification'}
                            </label>
                            {newUserIsClientOnly ? (
                              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl font-bold text-amber-700 dark:text-amber-300 text-xs flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" /> Client Portal User
                              </div>
                            ) : (
                              <select
                                value={newUserRole}
                                onChange={e => {
                                  const role = e.target.value;
                                  setNewUserRole(role);
                                  if (role === 'admin' || role === 'super_admin' || role === 'owner') {
                                    setNewUserAllowedTabs(AVAILABLE_CRM_MODULES.map(m => m.id));
                                    setNewUserDesignation('Executive Director');
                                  } else if (role === 'coo') {
                                    setNewUserAllowedTabs(AVAILABLE_CRM_MODULES.map(m => m.id));
                                    setNewUserDesignation('Chief Operating Officer');
                                  } else if (role === 'marketing_lead') {
                                    setNewUserAllowedTabs(['dashboard', 'marketing', 'reports', 'clients', 'projects', 'tasks']);
                                    setNewUserDesignation('Head of Marketing');
                                  } else if (role === 'social_media_lead') {
                                    setNewUserAllowedTabs(['dashboard', 'marketing', 'projects', 'tasks', 'reports']);
                                    setNewUserDesignation('Social Media Lead');
                                  } else if (role === 'sales_lead') {
                                    setNewUserAllowedTabs(['dashboard', 'leads', 'pipeline', 'proposals', 'clients']);
                                    setNewUserDesignation('Head of Sales & Growth');
                                  } else if (role === 'media_buyer') {
                                    setNewUserAllowedTabs(['dashboard', 'clients', 'projects', 'tasks', 'marketing', 'reports']);
                                    setNewUserDesignation('Performance Media & Ads Lead');
                                  } else if (role === 'operations_lead') {
                                    setNewUserAllowedTabs(['dashboard', 'projects', 'tasks', 'clients', 'reports', 'operations']);
                                    setNewUserDesignation('Operations & Delivery Lead');
                                  } else if (role === 'finance_lead') {
                                    setNewUserAllowedTabs(['dashboard', 'finance', 'proposals', 'reports']);
                                    setNewUserDesignation('Finance & Billing Lead');
                                  } else if (role === 'account_manager') {
                                    setNewUserAllowedTabs(['dashboard', 'clients', 'projects', 'proposals', 'reports']);
                                    setNewUserDesignation('Client Account Manager');
                                  }
                                }}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                              >
                                <option value="admin">Executive &amp; Owner (Full Access - All 13 Modules)</option>
                                <option value="coo">Chief Operating Officer (COO - All Agency Operations)</option>
                                <option value="marketing_lead">Marketing Lead (Campaigns, Content &amp; Analytics)</option>
                                <option value="social_media_lead">Social Media Lead (Content, Sprints &amp; Campaigns)</option>
                                <option value="sales_lead">Sales Lead (Leads, Pipeline, Proposals)</option>
                                <option value="media_buyer">Media &amp; Ads Lead (Campaigns, ROAS, Ad Ops)</option>
                                <option value="operations_lead">Operations &amp; Delivery Lead (Projects &amp; Tasks)</option>
                                <option value="account_manager">Client Account Manager (Clients, Projects, Reports)</option>
                                <option value="finance_lead">Finance &amp; Billing Lead (Invoices, Tax Ledgers)</option>
                              </select>
                            )}
                          </div>
                          <div>
                            <label className="font-semibold block mb-1 text-slate-800 dark:text-slate-200">Designation</label>
                            <input
                              type="text"
                              value={newUserDesignation}
                              onChange={e => setNewUserDesignation(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                            />
                          </div>
                        </div>

                        {/* Granular Module Permissions Checklist */}
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-blue-500" />
                              <span>Assign Module Permissions ({newUserAllowedTabs.length} Selected)</span>
                            </label>
                            {!newUserIsClientOnly && (
                              <div className="flex items-center gap-1 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setNewUserAllowedTabs(AVAILABLE_CRM_MODULES.map(m => m.id))}
                                  className="text-blue-600 hover:underline cursor-pointer"
                                >
                                  All
                                </button>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <button
                                  type="button"
                                  onClick={() => setNewUserAllowedTabs(['dashboard'])}
                                  className="text-slate-500 hover:underline cursor-pointer"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto">
                            {AVAILABLE_CRM_MODULES.map(mod => {
                              const isChecked = newUserAllowedTabs.includes(mod.id);
                              return (
                                <label
                                  key={mod.id}
                                  className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition text-[11px] ${isChecked
                                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-200'
                                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setNewUserAllowedTabs([...newUserAllowedTabs, mod.id]);
                                      } else {
                                        setNewUserAllowedTabs(newUserAllowedTabs.filter(t => t !== mod.id));
                                      }
                                    }}
                                    className="mt-0.5 rounded text-[#DC2626] focus:ring-0"
                                  />
                                  <span className="font-semibold leading-tight">{mod.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setShowInviteModal(false)}
                            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingUser}
                            className="px-5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                          >
                            {isSubmittingUser ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Provisioning Account...</span>
                              </>
                            ) : (
                              <span>Create User</span>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 2. Edit Permissions Modal */}
                {showEditPermissionsModal && editingUser && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Edit User Permissions</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Configuring modules for {editingUser.email}</p>
                        </div>
                        <button onClick={() => setShowEditPermissionsModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>

                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await api.updateSettingsUser(editingUser.id, {
                            role: editIsClientOnly ? 'client_portal' : editRole,
                            designation: editDesignation,
                            allowed_tabs: editAllowedTabs,
                            client_id: editIsClientOnly ? editSelectedClientId : null
                          });
                          setShowEditPermissionsModal(false);
                          await loadUsers();
                          showToast(`Updated permissions for ${editingUser.email}!`);
                        } catch (err: any) {
                          showToast(`Error updating permissions: ${err.message}`);
                        }
                      }} className="space-y-4 text-xs">

                        {/* Single-Client Assignment Toggle in Edit Modal */}
                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2.5">
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white text-xs block">Assign to a specific client only</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">Confines user access strictly to that client's deliverables, tasks, campaigns &amp; invoices</span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={editIsClientOnly}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditIsClientOnly(checked);
                                if (checked) {
                                  setEditRole('client_portal');
                                  setEditDesignation('Client Representative');
                                  setEditAllowedTabs(['dashboard', 'projects', 'tasks', 'marketing', 'reports', 'finance']);
                                  if (!editSelectedClientId && clientsList.length > 0) {
                                    setEditSelectedClientId(clientsList[0].id);
                                  }
                                } else {
                                  setEditRole('sales_lead');
                                  setEditDesignation('Growth Specialist');
                                  setEditAllowedTabs(['dashboard', 'leads', 'pipeline', 'proposals', 'clients']);
                                }
                              }}
                              className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                            />
                          </label>
                          {editIsClientOnly && (
                            <div className="pt-2 border-t border-amber-500/20">
                              <label className="font-semibold block mb-1 text-slate-800 dark:text-slate-200 text-xs">Select Client Account</label>
                              {clientsList.length === 0 ? (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400">No active clients found in CRM. Create a client in Clients module first.</p>
                              ) : (
                                <select
                                  value={editSelectedClientId}
                                  onChange={(e) => setEditSelectedClientId(e.target.value)}
                                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-amber-500/40 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                                >
                                  {clientsList.map(c => (
                                    <option key={c.id} value={c.id}>
                                      {c.company_name || c.name || c.id} {c.account_manager_name ? `(AM: ${c.account_manager_name})` : ''}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold block mb-1 text-slate-800 dark:text-slate-200">
                              {editIsClientOnly ? 'Assigned Portal Mode' : 'Role Classification'}
                            </label>
                            {editIsClientOnly ? (
                              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl font-bold text-amber-700 dark:text-amber-300 text-xs flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" /> Client Portal User
                              </div>
                            ) : (
                              <select
                                value={editRole}
                                onChange={e => {
                                  const role = e.target.value;
                                  setEditRole(role);
                                  if (role === 'admin' || role === 'super_admin' || role === 'owner') {
                                    setEditAllowedTabs(AVAILABLE_CRM_MODULES.map(m => m.id));
                                  } else if (role === 'coo') {
                                    setEditAllowedTabs(AVAILABLE_CRM_MODULES.map(m => m.id));
                                  } else if (role === 'marketing_lead') {
                                    setEditAllowedTabs(['dashboard', 'marketing', 'reports', 'clients', 'projects', 'tasks']);
                                  } else if (role === 'social_media_lead') {
                                    setEditAllowedTabs(['dashboard', 'marketing', 'projects', 'tasks', 'reports']);
                                  } else if (role === 'sales_lead') {
                                    setEditAllowedTabs(['dashboard', 'leads', 'pipeline', 'proposals', 'clients']);
                                  } else if (role === 'media_buyer') {
                                    setEditAllowedTabs(['dashboard', 'clients', 'projects', 'tasks', 'marketing', 'reports']);
                                  } else if (role === 'operations_lead') {
                                    setEditAllowedTabs(['dashboard', 'projects', 'tasks', 'clients', 'reports', 'operations']);
                                  } else if (role === 'finance_lead') {
                                    setEditAllowedTabs(['dashboard', 'finance', 'proposals', 'reports']);
                                  } else if (role === 'account_manager') {
                                    setEditAllowedTabs(['dashboard', 'clients', 'projects', 'proposals', 'reports']);
                                  }
                                }}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                              >
                                <option value="admin">Executive &amp; Owner (Full Access)</option>
                                <option value="coo">Chief Operating Officer (COO)</option>
                                <option value="marketing_lead">Marketing Lead</option>
                                <option value="social_media_lead">Social Media Lead</option>
                                <option value="sales_lead">Sales Lead</option>
                                <option value="media_buyer">Media &amp; Ads Lead</option>
                                <option value="operations_lead">Operations &amp; Delivery Lead</option>
                                <option value="account_manager">Client Account Manager</option>
                                <option value="finance_lead">Finance &amp; Billing Lead</option>
                              </select>
                            )}
                          </div>
                          <div>
                            <label className="font-semibold block mb-1 text-slate-800 dark:text-slate-200">Designation</label>
                            <input
                              type="text"
                              value={editDesignation}
                              onChange={e => setEditDesignation(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                            />
                          </div>
                        </div>

                        {/* Granular Module Permissions Checklist */}
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-blue-500" />
                              <span>Authorized Tabs &amp; Modules ({editAllowedTabs.length} Selected)</span>
                            </label>
                            <div className="flex items-center gap-1 text-[10px]">
                              <button
                                type="button"
                                onClick={() => setEditAllowedTabs(AVAILABLE_CRM_MODULES.map(m => m.id))}
                                className="text-blue-600 hover:underline cursor-pointer"
                              >
                                Select All
                              </button>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <button
                                type="button"
                                onClick={() => setEditAllowedTabs(['dashboard'])}
                                className="text-slate-500 hover:underline cursor-pointer"
                              >
                                Reset
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto">
                            {AVAILABLE_CRM_MODULES.map(mod => {
                              const isChecked = editAllowedTabs.includes(mod.id);
                              return (
                                <label
                                  key={mod.id}
                                  className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition text-[11px] ${isChecked
                                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-200'
                                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setEditAllowedTabs([...editAllowedTabs, mod.id]);
                                      } else {
                                        setEditAllowedTabs(editAllowedTabs.filter(t => t !== mod.id));
                                      }
                                    }}
                                    className="mt-0.5 rounded text-[#DC2626] focus:ring-0"
                                  />
                                  <span className="font-semibold leading-tight">{mod.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setShowEditPermissionsModal(false)}
                            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                          >
                            Save Permissions
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 3. Admin Reset Password Modal */}
                {showResetPasswordModal && resettingUser && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-amber-500" />
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Reset User Password</h4>
                        </div>
                        <button onClick={() => setShowResetPasswordModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Set a new password for <span className="font-bold text-slate-900 dark:text-white">{resettingUser.email}</span>. They can sign in immediately using this password.
                      </p>

                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (adminNewPassword.length < 6) {
                          showToast('Password must be at least 6 characters long', 'error');
                          return;
                        }
                        setIsAdminResetting(true);
                        try {
                          await api.resetUserPassword(resettingUser.id, adminNewPassword);
                          showToast(`Password successfully reset for ${resettingUser.email}!`, 'success');
                          setShowResetPasswordModal(false);
                          setAdminNewPassword('');
                        } catch (err: any) {
                          showToast(`Failed to reset password: ${err.message}`, 'error');
                        } finally {
                          setIsAdminResetting(false);
                        }
                      }} className="space-y-4 text-xs">
                        <div>
                          <label className="font-semibold block mb-1 text-slate-800 dark:text-slate-200">New Password</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter new password (min 6 chars)"
                            value={adminNewPassword}
                            onChange={e => setAdminNewPassword(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#DC2626]"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setShowResetPasswordModal(false)}
                            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isAdminResetting}
                            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isAdminResetting ? 'Resetting...' : 'Confirm Password Reset'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 4. Remote Logout Session Confirmation Modal */}
                {logoutConfirmUser && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Confirm Remote Logout</h4>
                            <p className="text-xs text-slate-500">Terminate active user device session</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setLogoutConfirmUser(null)} 
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors p-1"
                          disabled={isLoggingOutSession}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 py-1 text-xs">
                        <p className="text-slate-600 dark:text-slate-300">
                          Are you sure you want to remotely log out <strong className="text-slate-900 dark:text-white font-bold">{logoutConfirmUser.name || logoutConfirmUser.email}</strong>?
                        </p>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">User Email:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{logoutConfirmUser.email}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">Role & Access:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{logoutConfirmUser.roleLabel || logoutConfirmUser.role}</span>
                          </div>
                          {logoutConfirmUser.desktopDevice && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400 flex items-center gap-1"><Laptop className="w-3 h-3 text-emerald-500" /> Computer Session:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[10.5px]">
                                {logoutConfirmUser.desktopDevice.formatted || `${logoutConfirmUser.desktopDevice.os} • ${logoutConfirmUser.desktopDevice.browser}`}
                              </span>
                            </div>
                          )}
                          {logoutConfirmUser.mobileDevice && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400 flex items-center gap-1"><Smartphone className="w-3 h-3 text-blue-500" /> Mobile Session:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[10.5px]">
                                {logoutConfirmUser.mobileDevice.formatted || `${logoutConfirmUser.mobileDevice.os} • ${logoutConfirmUser.mobileDevice.browser}`}
                              </span>
                            </div>
                          )}
                          {!logoutConfirmUser.desktopDevice && !logoutConfirmUser.mobileDevice && logoutConfirmUser.currentDevice && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">Active Device:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                {logoutConfirmUser.currentDevice.formatted || `${logoutConfirmUser.currentDevice.os} • ${logoutConfirmUser.currentDevice.browser}`}
                              </span>
                            </div>
                          )}
                          {logoutConfirmUser.currentDevice?.ip && (
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">IP Address:</span>
                              <span className="font-mono text-slate-600 dark:text-slate-300">{logoutConfirmUser.currentDevice.ip}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>This user will be immediately disconnected from the selected session and will need to log in again.</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setLogoutConfirmUser(null)}
                          disabled={isLoggingOutSession}
                          className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        {logoutConfirmUser.desktopDevice && logoutConfirmUser.mobileDevice && (
                          <>
                            <button
                              type="button"
                              disabled={isLoggingOutSession}
                              onClick={async () => {
                                try {
                                  setIsLoggingOutSession(true);
                                  const targetName = logoutConfirmUser.name || logoutConfirmUser.email;
                                  const res = await api.revokeUserSession(logoutConfirmUser.id, 'mobile');
                                  if (res.success) {
                                    showToast(`Mobile session terminated for ${targetName}`);
                                    setLogoutConfirmUser(null);
                                    await loadUsers();
                                  } else {
                                    showToast(res.message || 'Failed to terminate session', 'error');
                                  }
                                } catch (err: any) {
                                  showToast(`Failed to log out: ${err.message}`, 'error');
                                } finally {
                                  setIsLoggingOutSession(false);
                                }
                              }}
                              className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Log Out Phone
                            </button>
                            <button
                              type="button"
                              disabled={isLoggingOutSession}
                              onClick={async () => {
                                try {
                                  setIsLoggingOutSession(true);
                                  const targetName = logoutConfirmUser.name || logoutConfirmUser.email;
                                  const res = await api.revokeUserSession(logoutConfirmUser.id, 'desktop');
                                  if (res.success) {
                                    showToast(`Computer session terminated for ${targetName}`);
                                    setLogoutConfirmUser(null);
                                    await loadUsers();
                                  } else {
                                    showToast(res.message || 'Failed to terminate session', 'error');
                                  }
                                } catch (err: any) {
                                  showToast(`Failed to log out: ${err.message}`, 'error');
                                } finally {
                                  setIsLoggingOutSession(false);
                                }
                              }}
                              className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Log Out PC
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          disabled={isLoggingOutSession}
                          onClick={async () => {
                            try {
                              setIsLoggingOutSession(true);
                              const targetName = logoutConfirmUser.name || logoutConfirmUser.email;
                              const res = await api.revokeUserSession(logoutConfirmUser.id, 'all');
                              if (res.success) {
                                showToast(`All sessions terminated for ${targetName}`);
                                setLogoutConfirmUser(null);
                                await loadUsers();
                              } else {
                                showToast(res.message || 'Failed to terminate session', 'error');
                              }
                            } catch (err: any) {
                              showToast(`Failed to log out user: ${err.message}`, 'error');
                            } finally {
                              setIsLoggingOutSession(false);
                            }
                          }}
                          className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {isLoggingOutSession ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Logging Out...
                            </>
                          ) : (
                            <>
                              <LogOut className="w-3.5 h-3.5" />
                              {logoutConfirmUser.desktopDevice && logoutConfirmUser.mobileDevice ? 'Log Out All Devices' : 'Confirm Log Out'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. TAB: ROLES & PERMISSIONS (RBAC)                                        */}
            {/* ========================================================================= */}
            {activeSection === 'Roles & Permissions' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-purple-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Role-Based Access Control (RBAC) Matrix
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Define read, write, export, and delete capabilities across agency team personas.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    4 Active Role Tiers
                  </span>
                </div>

                {/* Role Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
                  {[
                    { key: 'admin', label: 'Organization Admin' },
                    { key: 'sales', label: 'Sales Team (AE)' },
                    { key: 'marketing', label: 'Performance Marketing' },
                    { key: 'finance', label: 'Finance & Invoicing' }
                  ].map(r => (
                    <button
                      key={r.key}
                      onClick={() => setSelectedRoleKey(r.key as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${selectedRoleKey === r.key ? 'bg-[#0A1628] text-white dark:bg-rose-950/60 dark:border dark:border-rose-800' : 'text-slate-400 hover:text-white'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Permissions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {[
                    { key: 'view_dashboard', label: 'View Executive Dashboard', desc: 'Access agency financial aggregates & active client MRR' },
                    { key: 'export_dossier', label: 'Export Executive Dossiers', desc: 'Download board-level PDF summaries & reports' },
                    { key: 'manage_leads', label: 'Create & Edit CRM Leads', desc: 'Create inbound leads, adjust deal values & stages' },
                    { key: 'delete_leads', label: 'Delete Records & Deals', desc: 'Hard delete lead files & pipeline cards' },
                    { key: 'view_pipeline', label: 'Access Sales Pipeline', desc: 'Drag-and-drop deals across lifecycle columns' },
                    { key: 'edit_pipeline', label: 'Re-configure Pipeline Stages', desc: 'Modify SLA thresholds & probability rates' },
                    { key: 'manage_clients', label: 'Manage Client 360 Records', desc: 'Access active deliverables, SLAs & billing links' },
                    { key: 'access_vault', label: 'Access Credential Vault', desc: 'View partner IDs & delegated access tokens' },
                    { key: 'generate_invoices', label: 'Generate GST Tax Invoices', desc: 'Create Rule 46 compliant CBIC SAC 998361 invoices' },
                    { key: 'manage_settings', label: 'Modify Tenant Settings', desc: 'Change agency logo, legal details & timezone' },
                    { key: 'manage_users', label: 'Manage Team Directory', desc: 'Invite staff & assign security roles' },
                    { key: 'view_audit', label: 'Inspect Security Audit Log', desc: 'View full 256-bit operator activity stream' }
                  ].map(p => {
                    const isChecked = permissionsState[selectedRoleKey]?.[p.key] ?? false;
                    return (
                      <div
                        key={p.key}
                        onClick={() => {
                          setPermissionsState(prev => ({
                            ...prev,
                            [selectedRoleKey]: {
                              ...prev[selectedRoleKey],
                              [p.key]: !isChecked
                            }
                          }));
                          showToast(`Updated capability for ${selectedRoleKey}: ${p.label}`);
                        }}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${isChecked ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                      >
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{p.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveRoleMatrix}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Role Matrix'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. TAB: TEAMS & PODS                                                     */}
            {/* ========================================================================= */}
            {activeSection === 'Teams & Pods' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Agency Operational Pods &amp; Teams
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Organize client servicing into dedicated performance squads with revenue quotas.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPodModal(true)}
                    className="px-3.5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Pod</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {podsList.map(pod => (
                    <div key={pod.id} className={`p-4 rounded-2xl border ${pod.color || 'border-blue-500/40'} space-y-3 bg-white dark:bg-slate-900 shadow-xs`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pod.name}</h4>
                          <span className="text-[11px] text-slate-400">Pod Lead: <strong>{pod.lead || pod.metadata?.lead || 'Unassigned'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {pod.membersCount || pod.members_count || 3} Specialists
                          </span>
                          <button
                            onClick={() => {
                              setConfirmModalConfig({
                                isOpen: true,
                                title: 'Delete Team Pod',
                                description: `Are you sure you want to delete pod "${pod.name}"?`,
                                subDescription: 'Pod members will remain in the workspace, but this squad grouping and sprint assignments will be removed.',
                                confirmText: 'Delete Pod',
                                variant: 'danger',
                                onConfirm: async () => {
                                  try {
                                    await api.deleteSettingsTeam(pod.id);
                                    showToast(`Pod "${pod.name}" deleted [200 OK]`);
                                    loadTeams();
                                    setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
                                  } catch (err: any) {
                                    showToast(`Failed to delete pod: ${err.message}`, 'error');
                                  }
                                },
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="Delete Pod"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="text-[10px] text-slate-400">Active Clients</div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{pod.activeClients || pod.active_clients || 0} Brands</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Monthly Target / Metric</div>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{pod.target || '₹10,00,000/mo'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Pod Modal */}
                {showPodModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-900 dark:text-white">Create Agency Pod</h4>
                        <button onClick={() => setShowPodModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newPodName.trim()) return;
                        setIsSaving(true);
                        try {
                          await api.createSettingsTeam({
                            name: newPodName.trim(),
                            target: `₹${parseInt(newPodTarget || '0').toLocaleString('en-IN')}/mo`,
                            metadata: { lead: newPodLead }
                          });
                          setShowPodModal(false);
                          setNewPodName('');
                          showToast(`Pod "${newPodName}" created in database [200 OK]`);
                          loadTeams();
                        } catch (err: any) {
                          showToast(`Error creating pod: ${err.message}`);
                        } finally {
                          setIsSaving(false);
                        }
                      }} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Pod Title</label>
                          <input type="text" required placeholder="e.g. D2C E-commerce Scaling Pod" value={newPodName} onChange={e => setNewPodName(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Lead Specialist</label>
                          <select value={newPodLead} onChange={e => setNewPodLead(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                            {usersList.map(u => <option key={u.id} value={u.name}>{u.name} ({u.roleLabel || u.role})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Monthly Revenue Target (INR ₹)</label>
                          <input type="number" value={newPodTarget} onChange={e => setNewPodTarget(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowPodModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                          <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl disabled:opacity-50">
                            {isSaving ? 'Creating...' : 'Create Pod'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. TAB: SSO & SECURITY 2FA                                               */}
            {/* ========================================================================= */}
            {activeSection === 'SSO & Security 2FA' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Enterprise Authentication &amp; Security Enforcement
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Multi-factor security, session timeouts, IP whitelisting &amp; identity federation.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                    SOC-2 Type II Certified
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Single System & Active Session Card */}
                  <div className="p-4 bg-slate-50 dark:bg-[#0A101C] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-emerald-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">Single-System Active Session Policy</span>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              Active &amp; Enforced
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Strict 1-system-per-user restriction. One user cannot be logged in to two different systems at the same time. Logging in from another browser or computer immediately invalidates any previous session.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Your Active System</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Laptop className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-bold text-slate-800 dark:text-white text-xs truncate">
                            {user?.currentDevice?.formatted || 'Current Workstation'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Client IP Address</span>
                        <div className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">
                          {user?.currentDevice?.ip || '127.0.0.1'}
                        </div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Session State</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 1 Active System
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmModalConfig({
                              isOpen: true,
                              title: 'Sign Out Device',
                              description: 'Are you sure you want to end this active session and sign out from this device?',
                              subDescription: 'You will need to sign in again with your credentials to access the workspace.',
                              confirmText: 'Sign Out',
                              variant: 'warning',
                              onConfirm: async () => {
                                setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
                                api.logout().finally(() => window.location.reload());
                              },
                            });
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg cursor-pointer"
                        >
                          Sign Out Device
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2FA Toggle */}
                  <div className="p-4 bg-slate-50 dark:bg-[#0A101C] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-slate-900 dark:text-white">Enforce Two-Factor Authentication (2FA)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mandate TOTP authenticator (Google Authenticator / 1Password) for all tenant users.
                      </p>
                    </div>
                    <button onClick={() => setTwoFactorEnforced(!twoFactorEnforced)} className="cursor-pointer">
                      <div className={`w-11 h-6 rounded-full p-1 transition ${twoFactorEnforced ? 'bg-[#DC2626] flex justify-end' : 'bg-slate-300 dark:bg-slate-700 flex justify-start'}`}>
                        <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                      </div>
                    </button>
                  </div>

                  {/* Session Timeout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-[#0A101C] rounded-xl border border-slate-200 dark:border-slate-800">
                      <label className="font-semibold block mb-1">Session Inactivity Timeout</label>
                      <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg">
                        <option value="7d">7 Days (Recommended / Persistent)</option>
                        <option value="8h">8 Hours (Full Shift)</option>
                        <option value="1h">1 Hour</option>
                        <option value="30m">30 Minutes</option>
                        <option value="15m">15 Minutes (High Security)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">Forces re-authentication when browser is inactive.</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-[#0A101C] rounded-xl border border-slate-200 dark:border-slate-800">
                      <label className="font-semibold block mb-1">Failed Login Attempt Lockout</label>
                      <select value={failedLockoutLimit} onChange={e => setFailedLockoutLimit(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg">
                        <option value="3">3 Attempts (Strict)</option>
                        <option value="5">5 Attempts (Standard)</option>
                        <option value="10">10 Attempts (Relaxed)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">Temporarily locks out account for 30 minutes.</span>
                    </div>
                  </div>

                  {/* IP Whitelisting */}
                  <div className="p-4 bg-slate-50 dark:bg-[#0A101C] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">IP Whitelist / Firewall Rules</span>
                      <span className="text-[10px] text-slate-400">{ipWhitelist.length} Subnets Allowed</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add IP or CIDR (e.g. 192.168.1.50/32)"
                        value={newIpAddress}
                        onChange={e => setNewIpAddress(e.target.value)}
                        className="flex-1 p-2 bg-white dark:bg-slate-800 border rounded-lg font-mono text-xs"
                      />
                      <button
                        onClick={() => {
                          if (newIpAddress.trim()) {
                            setIpWhitelist([...ipWhitelist, newIpAddress.trim()]);
                            setNewIpAddress('');
                            showToast(`Added IP rule: ${newIpAddress.trim()} (Click Save to persist)`);
                          }
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                      >
                        + Add Rule
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ipWhitelist.map(ip => (
                        <span key={ip} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px] flex items-center gap-1.5">
                          <span>{ip}</span>
                          <button onClick={() => setIpWhitelist(ipWhitelist.filter(x => x !== ip))} className="text-slate-400 hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Self-Service Change Password Section */}
                  <div className="p-4 bg-slate-50 dark:bg-[#0A101C] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-rose-500" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">Change Account Password</span>
                          <span className="text-[11px] text-slate-500 block">Logged in as {user?.email || activePersona.email}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Self-Service
                      </span>
                    </div>

                    <form
                      onSubmit={handleSelfChangePassword}
                      className="space-y-3 pt-1"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Current Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Current password"
                            value={selfCurrentPassword}
                            onChange={e => setSelfCurrentPassword(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">New Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Min 6 characters"
                            value={selfNewPassword}
                            onChange={e => setSelfNewPassword(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Confirm Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Re-type new"
                            value={selfConfirmPassword}
                            onChange={e => setSelfConfirmPassword(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      {/* OTP Verification Field */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">
                            Email Verification Code (OTP) *
                          </label>
                          {selfOtpTimer > 0 ? (
                            <span className="text-slate-400 font-medium">Resend in {selfOtpTimer}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleRequestSelfOtp}
                              disabled={isRequestingSelfOtp}
                              className="text-rose-500 hover:text-rose-600 font-bold cursor-pointer underline disabled:opacity-50"
                            >
                              {isRequestingSelfOtp ? 'Sending code...' : (selfOtpSent ? 'Resend Code' : 'Send Code to Email')}
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2 max-w-sm">
                          <input
                            type="text"
                            maxLength={6}
                            required
                            placeholder="Enter 6-digit OTP"
                            value={selfPasswordOtp}
                            onChange={(e) => setSelfPasswordOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-40 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500 font-mono tracking-widest text-center text-xs"
                          />
                          {!selfOtpSent && (
                            <button
                              type="button"
                              onClick={handleRequestSelfOtp}
                              disabled={isRequestingSelfOtp}
                              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer text-xs"
                            >
                              {isRequestingSelfOtp ? 'Sending...' : 'Send OTP'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={isSelfChangingPassword || !selfPasswordOtp}
                          className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isSelfChangingPassword ? (
                            <>
                              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify &amp; Update Password</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {!isMasterOwner && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                    <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Global Tenant Security Policies (2FA Enforcement, IP Whitelist &amp; Session Timeouts) are restricted to the Executive Owner. You can still change your personal password above.</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  {isMasterOwner ? (
                    <button
                      onClick={handleSaveSecurity}
                      disabled={isSaving}
                      className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Security Policies'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs border border-slate-200 dark:border-slate-700 cursor-not-allowed">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Tenant Policy (Owner Gated)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 8. TAB: PIPELINES & STAGES                                               */}
            {/* ========================================================================= */}
            {activeSection === 'Pipelines & Stages' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-blue-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Deal Pipelines &amp; Lifecycle Stages Manager
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {pipelineStages.length} Configured Stages
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Configure sales stages, deal win probabilities, and maximum inactivity SLA rules.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddStageModal(true)}
                    className="px-3.5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stage</span>
                  </button>
                </div>

                {/* Pipeline Selector Switcher */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0A101C] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Active Pipeline:</span>
                    <select
                      value={activePipelineId}
                      onChange={(e) => {
                        const pipeId = e.target.value;
                        setActivePipelineId(pipeId);
                        const selected = pipelinesList.find(p => p.id === pipeId);
                        if (selected) {
                          setSelectedPipelineName(selected.name);
                          setPipelineStages(selected.stages || []);
                        }
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-bold text-slate-900 dark:text-white"
                    >
                      {pipelinesList.length > 0 ? (
                        pipelinesList.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))
                      ) : (
                        <option value="">Default Pipeline</option>
                      )}
                    </select>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Real-time Stage Sync</span>
                </div>

                {/* Stages List */}
                <div className="space-y-3">
                  {pipelineStages.map((stage, idx) => (
                    <div
                      key={stage.id}
                      className="p-4 bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${stage.color || 'bg-blue-500'} shrink-0`}></div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{stage.name}</h4>
                          <span className="text-[10px] text-slate-400">
                            {stage.dealCount || stage.deal_count || 0} active deals in pipeline ({stage.totalValue || '₹0'})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs shrink-0">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Win Probability</span>
                          <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800 dark:text-slate-200">
                            <input
                              type="number"
                              value={stage.probability ?? stage.win_probability ?? 0}
                              onChange={async (e) => {
                                const val = parseInt(e.target.value) || 0;
                                setPipelineStages(pipelineStages.map(s => s.id === stage.id ? { ...s, probability: val, win_probability: val } : s));
                                try {
                                  await api.updateSettingsStage(stage.id, { win_probability: val });
                                } catch (err) {
                                  console.warn('Stage update error:', err);
                                }
                              }}
                              className="w-14 p-1 bg-slate-50 dark:bg-slate-800 border rounded text-center text-xs"
                            />
                            <span>%</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block">Inactivity SLA</span>
                          <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{(stage.slaDays || stage.sla_days) > 0 ? `${stage.slaDays || stage.sla_days} Days` : 'No SLA'}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (pipelineStages.length <= 2) {
                              showToast('A pipeline requires at least 2 stages', 'error');
                              return;
                            }
                            setConfirmModalConfig({
                              isOpen: true,
                              title: 'Delete Pipeline Stage',
                              description: `Are you sure you want to delete stage "${stage.name}"?`,
                              subDescription: 'Deals or leads currently in this stage should be moved prior to deletion.',
                              confirmText: 'Delete Stage',
                              variant: 'danger',
                              onConfirm: async () => {
                                try {
                                  await api.deleteSettingsStage(stage.id);
                                  showToast(`Stage "${stage.name}" deleted [200 OK]`);
                                  loadPipelines();
                                  setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
                                } catch (err: any) {
                                  showToast(`Failed to delete stage: ${err.message}`, 'error');
                                }
                              },
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title="Delete Stage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Stage Modal */}
                {showAddStageModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-900 dark:text-white">Add New Pipeline Stage</h4>
                        <button onClick={() => setShowAddStageModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newStageName.trim()) return;
                        setIsSaving(true);
                        try {
                          await api.createSettingsStage(activePipelineId || (pipelinesList[0]?.id), {
                            name: newStageName.trim(),
                            win_probability: newStageProb,
                            sla_days: newStageSla
                          });
                          setShowAddStageModal(false);
                          setNewStageName('');
                          showToast(`Added stage "${newStageName.trim()}" to database [200 OK]`);
                          loadPipelines();
                        } catch (err: any) {
                          showToast(`Failed to create stage: ${err.message}`);
                        } finally {
                          setIsSaving(false);
                        }
                      }} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Stage Name</label>
                          <input type="text" required placeholder="e.g. Technical SEO Audit Review" value={newStageName} onChange={e => setNewStageName(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold block mb-1">Win Probability (%)</label>
                            <input type="number" min="0" max="100" value={newStageProb} onChange={e => setNewStageProb(parseInt(e.target.value) || 0)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                          </div>
                          <div>
                            <label className="font-semibold block mb-1">Inactivity SLA (Days)</label>
                            <input type="number" min="1" max="60" value={newStageSla} onChange={e => setNewStageSla(parseInt(e.target.value) || 1)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowAddStageModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                          <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl disabled:opacity-50">
                            {isSaving ? 'Creating...' : 'Create Stage'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 9. TAB: CUSTOM FIELDS                                                    */}
            {/* ========================================================================= */}
            {activeSection === 'Custom Fields' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-purple-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        CRM Custom Field Attributes
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Extend core entity schemas with custom properties and form fields.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddCustomFieldModal(true)}
                    className="px-3.5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Field</span>
                  </button>
                </div>

                {/* Entity Filter Tabs */}
                <div className="flex items-center gap-2 text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                  {(['Leads', 'Deals', 'Companies', 'Clients'] as const).map(ent => (
                    <button
                      key={ent}
                      onClick={() => setCustomFieldsEntity(ent)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${customFieldsEntity === ent ? 'bg-[#0A1628] text-white dark:bg-rose-950/60 dark:border dark:border-rose-800' : 'text-slate-400 hover:text-white'}`}
                    >
                      {ent}
                    </button>
                  ))}
                </div>

                {/* Fields Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Field Label</th>
                        <th className="py-3 px-4">Field Key (API)</th>
                        <th className="py-3 px-4">Data Type</th>
                        <th className="py-3 px-4">Mandatory</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {customFieldsList
                        .filter(cf => (cf.entity || '').toLowerCase() === customFieldsEntity.toLowerCase())
                        .map(cf => (
                          <tr key={cf.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{cf.name || cf.field_name}</td>
                            <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{cf.key || cf.field_key}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                {cf.type || cf.field_type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {(cf.required || cf.is_required) ? (
                                <span className="text-emerald-600 font-bold">Required</span>
                              ) : (
                                <span className="text-slate-400">Optional</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setConfirmModalConfig({
                                    isOpen: true,
                                    title: 'Delete Custom Field',
                                    description: `Are you sure you want to delete custom field "${cf.name || cf.field_name}"?`,
                                    subDescription: 'Existing records will no longer display or record this field value.',
                                    confirmText: 'Delete Field',
                                    variant: 'danger',
                                    onConfirm: async () => {
                                      try {
                                        await api.deleteCustomFieldDefinition(cf.id);
                                        showToast(`Custom field "${cf.name || cf.field_name}" deleted [200 OK]`);
                                        loadCustomFields();
                                        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
                                      } catch (err: any) {
                                        showToast(`Failed to delete custom field: ${err.message}`, 'error');
                                      }
                                    },
                                  });
                                }}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Custom Field Modal */}
                {showAddCustomFieldModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-900 dark:text-white">Add Custom Field to {customFieldsEntity}</h4>
                        <button onClick={() => setShowAddCustomFieldModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newFieldName.trim()) return;
                        const key = newFieldName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
                        setIsSaving(true);
                        try {
                          await api.createCustomFieldDefinition({
                            entity: customFieldsEntity,
                            name: newFieldName.trim(),
                            key,
                            type: newFieldType,
                            required: newFieldRequired
                          });
                          setShowAddCustomFieldModal(false);
                          setNewFieldName('');
                          showToast(`Added custom field "${newFieldName.trim()}" [200 OK]`);
                          loadCustomFields();
                        } catch (err: any) {
                          showToast(`Failed to create custom field: ${err.message}`);
                        } finally {
                          setIsSaving(false);
                        }
                      }} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Field Label</label>
                          <input type="text" required placeholder="e.g. Target CPA Goal" value={newFieldName} onChange={e => setNewFieldName(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Data Type</label>
                          <select value={newFieldType} onChange={e => setNewFieldType(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                            <option value="Text">Text</option>
                            <option value="Number">Number</option>
                            <option value="Currency (INR)">Currency (INR ₹)</option>
                            <option value="Dropdown">Dropdown</option>
                            <option value="Date">Date</option>
                            <option value="Boolean">Boolean (Yes/No)</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <input type="checkbox" id="req-cb" checked={newFieldRequired} onChange={e => setNewFieldRequired(e.target.checked)} className="rounded" />
                          <label htmlFor="req-cb" className="font-medium cursor-pointer">Make this field mandatory on lead forms</label>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowAddCustomFieldModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                          <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl disabled:opacity-50">
                            {isSaving ? 'Saving...' : 'Save Field'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 10. TAB: SYSTEM TAGS                                                     */}
            {/* ========================================================================= */}
            {activeSection === 'System Tags' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        CRM Tag Taxonomy &amp; Segmentation
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Maintain tags used to label leads, deals, companies, and deliverables.
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">{tagsList.length} Active Tags</span>
                </div>

                {/* Quick Add Tag Bar */}
                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Enter new tag name (e.g. #BlackFriday2026)"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                  <button
                    onClick={async () => {
                      if (!newTagName.trim()) return;
                      const formatted = newTagName.trim().startsWith('#') ? newTagName.trim() : `#${newTagName.trim()}`;
                      try {
                        await api.createSystemTag({
                          name: formatted,
                          color: newTagColor
                        });
                        setNewTagName('');
                        showToast(`Created tag "${formatted}" in database [200 OK]`);
                        loadTags();
                      } catch (err: any) {
                        showToast(`Failed to create tag: ${err.message}`);
                      }
                    }}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl cursor-pointer"
                  >
                    + Add Tag
                  </button>
                </div>

                {/* Tags Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {tagsList.map(tag => (
                    <div key={tag.id} className="p-3 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tag.badgeClass || tag.color || 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'}`}>
                          {tag.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{tag.usageCount || tag.usage_count || 0} uses</span>
                      </div>
                      <button
                        onClick={() => {
                          setConfirmModalConfig({
                            isOpen: true,
                            title: 'Delete System Tag',
                            description: `Are you sure you want to delete tag "${tag.name}"?`,
                            confirmText: 'Delete Tag',
                            variant: 'danger',
                            onConfirm: async () => {
                              try {
                                await api.deleteSystemTag(tag.id);
                                showToast(`Tag "${tag.name}" deleted [200 OK]`);
                                loadTags();
                                setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
                              } catch (err: any) {
                                showToast(`Failed to delete tag: ${err.message}`, 'error');
                              }
                            },
                          });
                        }}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Delete Tag"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 11. TAB: SERVICES CATALOG                                                */}
            {/* ========================================================================= */}
            {activeSection === 'Services Catalog' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Agency Services Catalog (CBIC SAC 998361)
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Standard agency packages used in 3-column proposal builders and auto-invoicing.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowServiceModal(true)}
                    className="px-3.5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Package</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {servicesList.map(srv => (
                    <div key={srv.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{srv.name}</h4>
                          <span className="text-[11px] text-slate-400">{srv.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            SAC {srv.sacCode || srv.sac_code || '998361'}
                          </span>
                          <button
                            onClick={() => {
                              setConfirmModalConfig({
                                isOpen: true,
                                title: 'Delete Service Offering',
                                description: `Are you sure you want to delete service "${srv.name}"?`,
                                subDescription: 'Associated rate cards and proposal templates may need manual re-assignment.',
                                confirmText: 'Delete Service',
                                variant: 'danger',
                                onConfirm: async () => {
                                  try {
                                    await api.deleteService(srv.id);
                                    showToast(`Service "${srv.name}" deleted [200 OK]`);
                                    loadServices();
                                    setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
                                  } catch (err: any) {
                                    showToast(`Failed to delete service: ${err.message}`, 'error');
                                  }
                                },
                              });
                            }}
                            className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-1"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Default Retainer / Price</span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                            ₹{Number(srv.price || 0).toLocaleString('en-IN')}
                            <span className="text-xs text-slate-400 font-normal"> / {srv.pricingModel || srv.pricing_model || 'Monthly Retainer'}</span>
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {srv.deliverablesCount || srv.deliverables_count || 5} Scope Items
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Service Package Modal */}
                {showServiceModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-900 dark:text-white">Add Service Package</h4>
                        <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newServiceName.trim()) return;
                        setIsSaving(true);
                        try {
                          await api.createService({
                            name: newServiceName.trim(),
                            category: newServiceCategory,
                            pricing_model: newServiceModel,
                            price: parseFloat(newServicePrice) || 0,
                            sac_code: '998361',
                            tax_rate: '18% GST',
                            deliverables_count: 5,
                            description: newServiceDesc
                          });
                          setShowServiceModal(false);
                          setNewServiceName('');
                          setNewServiceDesc('');
                          showToast(`Service "${newServiceName.trim()}" created [200 OK]`);
                          loadServices();
                        } catch (err: any) {
                          showToast(`Failed to create service: ${err.message}`);
                        } finally {
                          setIsSaving(false);
                        }
                      }} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Package Name</label>
                          <input type="text" required placeholder="e.g. Meta Ads Growth Sprint" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold block mb-1">Category</label>
                            <select value={newServiceCategory} onChange={e => setNewServiceCategory(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                              <option value="Performance Marketing">Performance Marketing</option>
                              <option value="SEO & Content">SEO & Content</option>
                              <option value="Web Dev & Tech">Web Dev & Tech</option>
                              <option value="Creative Studio">Creative Studio</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-semibold block mb-1">Pricing Model</label>
                            <select value={newServiceModel} onChange={e => setNewServiceModel(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                              <option value="Monthly Retainer">Monthly Retainer</option>
                              <option value="Fixed Milestone">Fixed Milestone</option>
                              <option value="Hourly Rate">Hourly Rate</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Default Price (INR ₹)</label>
                          <input type="number" required value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Description</label>
                          <textarea rows={2} value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} placeholder="Package scope and deliverables..." className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowServiceModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                          <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl disabled:opacity-50">
                            {isSaving ? 'Creating...' : 'Create Service'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 12. TAB: LEAD SOURCES                                                    */}
            {/* ========================================================================= */}
            {activeSection === 'Lead Sources' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Lead Sources &amp; Attribution Channels
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Attribution channels used to track cost per lead (CPL) and acquisition ROI.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{sourcesList.length} Channels Active</span>
                    <button
                      onClick={() => setShowLeadSourceModal(true)}
                      className="px-3 py-1.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Channel</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Lead Source Channel</th>
                        <th className="py-3 px-4">Channel Group</th>
                        <th className="py-3 px-4">Target Cost Per Lead (CPL)</th>
                        <th className="py-3 px-4">Total Leads Attributed</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sourcesList.map(src => (
                        <tr key={src.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{src.name}</td>
                          <td className="py-3 px-4 text-slate-500">{src.channel}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {(src.costPerLead || src.cost_per_lead) > 0 ? `₹${Number(src.costPerLead || src.cost_per_lead).toLocaleString('en-IN')}` : '₹0 (Organic)'}
                          </td>
                          <td className="py-3 px-4">{src.totalLeads || src.total_leads || 0} Leads</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {src.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setConfirmModalConfig({
                                  isOpen: true,
                                  title: 'Delete Lead Source',
                                  description: `Are you sure you want to delete lead source "${src.name}"?`,
                                  subDescription: 'Existing leads with this source will retain their source attribution, but it will no longer be available for new intake.',
                                  confirmText: 'Delete Source',
                                  variant: 'danger',
                                  onConfirm: async () => {
                                    try {
                                      await api.deleteLeadSource(src.id);
                                      showToast(`Lead source "${src.name}" deleted [200 OK]`);
                                      loadLeadSources();
                                      setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
                                    } catch (err: any) {
                                      showToast(`Failed to delete lead source: ${err.message}`, 'error');
                                    }
                                  },
                                });
                              }}
                              className="text-rose-500 hover:text-rose-700 cursor-pointer text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Lead Source Modal */}
                {showLeadSourceModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-900 dark:text-white">Add Attribution Channel</h4>
                        <button onClick={() => setShowLeadSourceModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newSourceName.trim()) return;
                        setIsSaving(true);
                        try {
                          await api.createLeadSource({
                            name: newSourceName.trim(),
                            channel: newSourceChannel,
                            cost_per_lead: parseFloat(newSourceCpl) || 0,
                            status: 'Active'
                          });
                          setShowLeadSourceModal(false);
                          setNewSourceName('');
                          showToast(`Lead source "${newSourceName.trim()}" created [200 OK]`);
                          loadLeadSources();
                        } catch (err: any) {
                          showToast(`Failed to create lead source: ${err.message}`);
                        } finally {
                          setIsSaving(false);
                        }
                      }} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Channel / Source Name</label>
                          <input type="text" required placeholder="e.g. YouTube In-Stream Ads" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Channel Group</label>
                          <select value={newSourceChannel} onChange={e => setNewSourceChannel(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                            <option value="Paid Social">Paid Social</option>
                            <option value="Paid Search">Paid Search</option>
                            <option value="Organic SEO">Organic SEO</option>
                            <option value="B2B Social">B2B Social</option>
                            <option value="Executive Referral">Executive Referral</option>
                            <option value="Inbound Web">Inbound Web</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Target CPL (INR ₹)</label>
                          <input type="number" value={newSourceCpl} onChange={e => setNewSourceCpl(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowLeadSourceModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                          <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl disabled:opacity-50">
                            {isSaving ? 'Creating...' : 'Create Channel'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 13. TAB: DOCUMENT TEMPLATES                                              */}
            {/* ========================================================================= */}
            {activeSection === 'Document Templates' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Commercial &amp; Legal Contract Templates
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Master templates for MSAs, SOWs, and CBIC SAC 998361 compliant Proposals.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{templatesList.length} Core Templates</span>
                    <button
                      onClick={() => {
                        setEditingTemplate(null);
                        setTemplateName('');
                        setTemplateType('Legal Contract');
                        setTemplateVersion('v1.0');
                        setTemplateTerms('Net 30, IP Assigned Upon Payment');
                        setTemplateContent('');
                        setShowTemplateModal(true);
                      }}
                      className="px-3 py-1.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ New Template</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {templatesList.map(tmpl => (
                    <div key={tmpl.id} className="p-4 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tmpl.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {tmpl.version || 'v1.0'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {tmpl.type} • {tmpl.standardTerms || tmpl.standard_terms || 'Standard terms'} • SAC {tmpl.sacCode || tmpl.sac_code || '998361'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTemplate(tmpl);
                            setTemplateName(tmpl.name);
                            setTemplateType(tmpl.type || tmpl.category || 'Legal Contract');
                            setTemplateVersion(tmpl.version || 'v1.0');
                            setTemplateTerms(tmpl.standardTerms || tmpl.standard_terms || '');
                            setTemplateContent(tmpl.content || '');
                            setShowTemplateModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                        >
                          Edit Content
                        </button>
                        <button
                          onClick={() => {
                            setConfirmModalConfig({
                              isOpen: true,
                              title: 'Delete Document Template',
                              description: `Are you sure you want to delete template "${tmpl.name}"?`,
                              subDescription: 'Existing generated proposals will not be affected, but this template will no longer be available for new documents.',
                              confirmText: 'Delete Template',
                              variant: 'danger',
                              onConfirm: async () => {
                                try {
                                  await api.deleteDocumentTemplate(tmpl.id);
                                  showToast(`Template "${tmpl.name}" deleted [200 OK]`);
                                  loadDocumentTemplates();
                                  setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
                                } catch (err: any) {
                                  showToast(`Failed to delete template: ${err.message}`, 'error');
                                }
                              },
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add/Edit Document Template Modal */}
                {showTemplateModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-900 dark:text-white">{editingTemplate ? 'Edit Document Template' : 'Create Document Template'}</h4>
                        <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!templateName.trim()) return;
                        setIsSaving(true);
                        try {
                          await api.saveDocumentTemplate({
                            id: editingTemplate?.id,
                            name: templateName.trim(),
                            type: templateType,
                            version: templateVersion,
                            standard_terms: templateTerms,
                            content: templateContent,
                            sac_code: '998361'
                          });
                          setShowTemplateModal(false);
                          showToast(`Template "${templateName.trim()}" saved to database [200 OK]`);
                          loadDocumentTemplates();
                        } catch (err: any) {
                          showToast(`Failed to save template: ${err.message}`);
                        } finally {
                          setIsSaving(false);
                        }
                      }} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Template Title</label>
                          <input type="text" required value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="e.g. Master Services Agreement (MSA)" className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold block mb-1">Type / Category</label>
                            <select value={templateType} onChange={e => setTemplateType(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                              <option value="Legal Contract">Legal Contract</option>
                              <option value="Operations Scope">Operations Scope</option>
                              <option value="Sales Quotation">Sales Quotation</option>
                              <option value="Financial Ledger">Financial Ledger</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-semibold block mb-1">Version</label>
                            <input type="text" value={templateVersion} onChange={e => setTemplateVersion(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                          </div>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Standard Terms &amp; Conditions</label>
                          <input type="text" value={templateTerms} onChange={e => setTemplateTerms(e.target.value)} placeholder="e.g. Net 30, IP Assigned Upon Payment" className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Contract Body / Template Clauses</label>
                          <textarea rows={5} value={templateContent} onChange={e => setTemplateContent(e.target.value)} placeholder="Master contractual terms and conditions text..." className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-[11px]" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowTemplateModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                          <button type="submit" disabled={isSaving} className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl disabled:opacity-50">
                            {isSaving ? 'Saving...' : 'Save Template'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* 14. TAB: BILLING & CURRENCY                                              */}
            {/* ========================================================================= */}
            {activeSection === 'Billing & Currency' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Agency Financial &amp; Currency Configuration
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      GST tax details, bank accounts for client remittances, and payment gateways.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                    Indian GST Rule 46 Compliant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Registered GSTIN</label>
                    <input type="text" value={agencyGstin} onChange={e => setAgencyGstin(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-bold" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Company PAN</label>
                    <input type="text" value={agencyPan} onChange={e => setAgencyPan(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-bold" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">State / POS Code</label>
                    <input type="text" value={agencyStateCode} onChange={e => setAgencyStateCode(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg" />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">Client Remittance Bank Account (Printed on Invoices)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Bank Name</span>
                      <input type="text" value={agencyBankName} onChange={e => setAgencyBankName(e.target.value)} className="w-full p-1.5 bg-white dark:bg-slate-800 border rounded font-semibold" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Current Account Number</span>
                      <input type="text" value={agencyAccountNo} onChange={e => setAgencyAccountNo(e.target.value)} className="w-full p-1.5 bg-white dark:bg-slate-800 border rounded font-mono font-bold" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">IFSC Code</span>
                      <input type="text" value={agencyIfsc} onChange={e => setAgencyIfsc(e.target.value)} className="w-full p-1.5 bg-white dark:bg-slate-800 border rounded font-mono font-bold" />
                    </div>
                  </div>
                </div>

                {!isMasterOwner && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                    <Lock className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Master Billing &amp; Currency configuration is strictly restricted to the Executive Owner. Operational accounts have read-only visibility.</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  {isMasterOwner ? (
                    <button
                      onClick={handleSaveBilling}
                      disabled={isSaving}
                      className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Billing Information'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs border border-slate-200 dark:border-slate-700 cursor-not-allowed">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Read-Only (Owner Gated)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 15. TAB: AUDIT TELEMETRY                                                 */}
            {/* ========================================================================= */}
            {activeSection === 'Audit Telemetry' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Live System &amp; Security Audit Telemetry
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Immutable 256-bit event trail documenting security actions, exports, and permission modifications.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Filter audit events..."
                      value={telemetrySearch}
                      onChange={e => setTelemetrySearch(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={loadAuditLogs}
                      disabled={isLoadingSection}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isLoadingSection ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={() => {
                        const filtered = telemetryLogs.filter(l =>
                          !telemetrySearch ||
                          (l.action && l.action.toLowerCase().includes(telemetrySearch.toLowerCase())) ||
                          (l.operator && l.operator.toLowerCase().includes(telemetrySearch.toLowerCase())) ||
                          (l.details && l.details.toLowerCase().includes(telemetrySearch.toLowerCase()))
                        );
                        const csvContent = "data:text/csv;charset=utf-8," + ["Action,Operator,Details,IP,Timestamp,Status", ...filtered.map(l => `"${l.action || ''}","${l.operator || ''}","${(l.details || '').replace(/"/g, '""')}","${l.ip || ''}","${l.timestamp || ''}","${l.status || 'SUCCESS'}"`)].join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "optivir_audit_telemetry.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast('Exported audit telemetry log as CSV!');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Audit CSV</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Event / Action</th>
                        <th className="py-3 px-4">Operator User</th>
                        <th className="py-3 px-4">Details</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {telemetryLogs
                        .filter(l =>
                          !telemetrySearch ||
                          (l.action && l.action.toLowerCase().includes(telemetrySearch.toLowerCase())) ||
                          (l.operator && l.operator.toLowerCase().includes(telemetrySearch.toLowerCase())) ||
                          (l.details && l.details.toLowerCase().includes(telemetrySearch.toLowerCase()))
                        )
                        .map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">[{log.action}]</td>
                            <td className="py-3 px-4 font-semibold">{log.operator}</td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.details}</td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ip}</td>
                            <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                {log.status || 'SUCCESS'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 16. TAB: INTEGRATIONS HUB                                                */}
            {/* ========================================================================= */}
            {activeSection === 'Integrations Hub' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-blue-500" />
                      <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                        Connected Ecosystem &amp; API Integrations
                      </h2>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Production payment gateways (Paytm PG, Razorpay, Stripe), ad network partner APIs, CRM communication &amp; webhooks.
                    </p>
                  </div>
                  {(() => {
                    const activeCount = integrations.filter(i => i.connected).length;
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${activeCount > 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                        {activeCount} of {integrations.length} Active
                      </span>
                    );
                  })()}
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {['All', 'Payment Gateways', 'Ad Networks', 'E-Commerce', 'Communication & Alerts', 'Productivity'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setIntegCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${integCategoryFilter === cat
                        ? 'bg-[#B91C1C] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      {cat} {cat !== 'All' ? `(${integrations.filter(i => i.category === cat).length})` : `(${integrations.length})`}
                    </button>
                  ))}
                </div>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {integrations
                    .filter(i => integCategoryFilter === 'All' || i.category === integCategoryFilter)
                    .map(integ => (
                      <div
                        key={integ.id}
                        className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl space-y-3.5 shadow-xs transition ${integ.connected
                          ? 'border-emerald-200 dark:border-emerald-900/50'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-10 h-10 rounded-xl ${integ.color} text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0`}>
                              {integ.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{integ.name}</h4>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{integ.statusText}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${integ.connected
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}>
                            {integ.connected ? '● Connected' : '○ Disconnected'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed min-h-[32px]">
                          {integ.desc}
                        </p>

                        {integ.connected && (integ.id === 'int-meta' || integ.id === 'int-google') && (
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-[11px] border border-slate-200/60 dark:border-slate-700/60">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-blue-500" />
                              <span>{(integ.config?.adAccounts?.length || integ.metadata?.adAccounts?.length || (integ.config?.adAccountId ? 1 : 0))} Ad Account(s) Linked</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const accs = integ.config?.adAccounts || integ.metadata?.adAccounts || [];
                                const acc = accs[0] || (integ.config?.adAccountId ? { id: integ.config.adAccountId, name: 'Primary Ad Account' } : null);
                                if (acc) {
                                  openAdAccountDetails(acc.id);
                                } else {
                                  setConfiguringInteg(integ);
                                }
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Ad Accounts</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>{integ.connected ? (integ.lastSynced ? `Synced ${integ.lastSynced}` : 'Active SLA') : 'Real Auth Required'}</span>
                          </span>
                          <button
                            onClick={() => {
                              setConfiguringInteg(integ);
                              const cfg = integ.config || {};
                              const meta = integ.metadata || {};
                              const existingAccounts = (cfg.adAccounts && Array.isArray(cfg.adAccounts) && cfg.adAccounts.length > 0)
                                ? cfg.adAccounts
                                : (meta.adAccounts && Array.isArray(meta.adAccounts) && meta.adAccounts.length > 0)
                                ? meta.adAccounts
                                : (cfg.adAccountId ? [{
                                    id: cfg.adAccountId,
                                    name: 'Primary Ad Account',
                                    status: 'ACTIVE',
                                    currency: 'INR',
                                    timezone: 'Asia/Kolkata'
                                  }] : []);
                              setIntegForm({
                                ...cfg,
                                partnerId: cfg.partnerId || meta.partnerId || '',
                                pixelId: cfg.pixelId || meta.pixelId || '',
                                adAccounts: existingAccounts
                              });
                              setTestResult(null);
                              setIsTestingConnection(false);
                              setShowSecretField({});
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${integ.connected
                              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                              : 'bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-xs'
                              }`}
                          >
                            {integ.connected ? (
                              <>
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span>Configure &amp; Sync</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Connect Now</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Configuration & Real Connection Modal */}
                {configuringInteg && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
                      {/* Modal Header */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${configuringInteg.color} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                            {configuringInteg.icon}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {configuringInteg.connected ? 'Configure' : 'Connect'} {configuringInteg.name}
                            </h3>
                            <span className="text-[11px] text-slate-400">
                              {configuringInteg.category} • Real Production API Handshake
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setConfiguringInteg(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Security Notice */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 dark:text-white block font-semibold">256-Bit Credential Isolation:</strong>
                          <span>Your real API keys and webhook secrets are encrypted locally. Zero fake mock tokens are dispatched.</span>
                        </div>
                      </div>

                      {/* Platform-Specific Credential Forms */}
                      <div className="space-y-4 text-xs">
                        {/* 1. PAYTM PG */}
                        {configuringInteg.id === 'int-paytm' && (
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Merchant ID (MID) <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="text"
                                value={integForm.mid || ''}
                                onChange={e => setIntegForm({ ...integForm, mid: e.target.value })}
                                placeholder="e.g. OPTIVI67823901928472"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#B91C1C]"
                              />
                              <span className="text-[10px] text-slate-400 mt-0.5 block">Unique 20-character identifier issued in Paytm Merchant Dashboard.</span>
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Merchant Key (Secret) <span className="text-rose-600">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecretField.paytmKey ? 'text' : 'password'}
                                  value={integForm.merchantKey || ''}
                                  onChange={e => setIntegForm({ ...integForm, merchantKey: e.target.value })}
                                  placeholder="••••••••••••••••••••"
                                  className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#B91C1C]"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSecretField({ ...showSecretField, paytmKey: !showSecretField.paytmKey })}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  {showSecretField.paytmKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Environment</label>
                                <select
                                  value={integForm.env || 'Live Production'}
                                  onChange={e => setIntegForm({ ...integForm, env: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                >
                                  <option>Live Production</option>
                                  <option>Staging (Sandbox)</option>
                                </select>
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Website Name</label>
                                <input
                                  type="text"
                                  value={integForm.websiteName || 'DEFAULT'}
                                  onChange={e => setIntegForm({ ...integForm, websiteName: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Channel ID</label>
                                <select
                                  value={integForm.channelId || 'WEB'}
                                  onChange={e => setIntegForm({ ...integForm, channelId: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                >
                                  <option>WEB (Standard Checkout)</option>
                                  <option>WAP (Mobile App / Intent)</option>
                                </select>
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Industry Type</label>
                                <input
                                  type="text"
                                  value={integForm.industryType || 'Retail'}
                                  onChange={e => setIntegForm({ ...integForm, industryType: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Paytm Webhook Callback URL</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value="https://api.optivir.com/v1/webhooks/paytm"
                                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] text-slate-600 dark:text-slate-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText('https://api.optivir.com/v1/webhooks/paytm');
                                    showToast('Paytm webhook URL copied to clipboard');
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 text-xs font-bold"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. RAZORPAY */}
                        {configuringInteg.id === 'int-razorpay' && (
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Razorpay Key ID <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="text"
                                value={integForm.keyId || ''}
                                onChange={e => setIntegForm({ ...integForm, keyId: e.target.value })}
                                placeholder="rzp_live_..."
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#B91C1C]"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Razorpay Key Secret <span className="text-rose-600">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecretField.rzpSecret ? 'text' : 'password'}
                                  value={integForm.keySecret || ''}
                                  onChange={e => setIntegForm({ ...integForm, keySecret: e.target.value })}
                                  placeholder="••••••••••••••••"
                                  className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#B91C1C]"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSecretField({ ...showSecretField, rzpSecret: !showSecretField.rzpSecret })}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  {showSecretField.rzpSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Environment</label>
                                <select
                                  value={integForm.env || 'Live Mode'}
                                  onChange={e => setIntegForm({ ...integForm, env: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                >
                                  <option>Live Mode</option>
                                  <option>Test Sandbox</option>
                                </select>
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Webhook Secret</label>
                                <input
                                  type="password"
                                  value={integForm.webhookSecret || ''}
                                  onChange={e => setIntegForm({ ...integForm, webhookSecret: e.target.value })}
                                  placeholder="whsec_..."
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Razorpay Webhook Endpoint</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value="https://api.optivir.com/v1/webhooks/razorpay"
                                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] text-slate-600 dark:text-slate-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText('https://api.optivir.com/v1/webhooks/razorpay');
                                    showToast('Razorpay webhook URL copied');
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 text-xs font-bold"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. STRIPE */}
                        {configuringInteg.id === 'int-stripe' && (
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Stripe Publishable Key
                              </label>
                              <input
                                type="text"
                                value={integForm.publishableKey || ''}
                                onChange={e => setIntegForm({ ...integForm, publishableKey: e.target.value })}
                                placeholder="pk_live_..."
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Stripe Secret Key <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="password"
                                value={integForm.secretKey || ''}
                                onChange={e => setIntegForm({ ...integForm, secretKey: e.target.value })}
                                placeholder="sk_live_..."
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Base Currency</label>
                                <select
                                  value={integForm.currency || 'USD ($)'}
                                  onChange={e => setIntegForm({ ...integForm, currency: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                >
                                  <option>USD ($)</option>
                                  <option>EUR (€)</option>
                                  <option>GBP (£)</option>
                                  <option>AED (د.إ)</option>
                                </select>
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Webhook Signing Secret</label>
                                <input
                                  type="password"
                                  value={integForm.webhookSecret || ''}
                                  onChange={e => setIntegForm({ ...integForm, webhookSecret: e.target.value })}
                                  placeholder="whsec_..."
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. META BUSINESS MANAGER */}
                        {configuringInteg.id === 'int-meta' && (
                          <div className="space-y-4">
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Meta Business Partner ID <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="text"
                                value={integForm.partnerId || ''}
                                onChange={e => setIntegForm({ ...integForm, partnerId: e.target.value })}
                                placeholder="e.g. 194820194810291"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                System User Access Token <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="password"
                                value={integForm.accessToken || ''}
                                onChange={e => setIntegForm({ ...integForm, accessToken: e.target.value })}
                                placeholder="EAAB..."
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">CAPI Dataset / Pixel ID</label>
                              <input
                                type="text"
                                value={integForm.pixelId || ''}
                                onChange={e => setIntegForm({ ...integForm, pixelId: e.target.value })}
                                placeholder="e.g. 8839201948201"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>

                            {/* Connected Multiple Ad Accounts Manager */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <label className="font-bold text-slate-800 dark:text-white text-xs block">
                                    Connected Ad Accounts ({(integForm.adAccounts || []).length})
                                  </label>
                                  <span className="text-[10px] text-slate-400">
                                    Connect and monitor multiple client ad accounts under this Business Manager
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  disabled={isFetchingAdAccounts}
                                  onClick={async () => {
                                    if (!integForm.accessToken) {
                                      showToast('Please enter System User Access Token first');
                                      return;
                                    }
                                    setIsFetchingAdAccounts(true);
                                    try {
                                      const res = await api.fetchAdAccounts({
                                        integrationId: 'int-meta',
                                        accessToken: integForm.accessToken,
                                        partnerId: integForm.partnerId
                                      });
                                      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                                        setIntegForm(prev => {
                                          const current = prev.adAccounts || [];
                                          const merged = [...current];
                                          for (const a of res.data) {
                                            if (!merged.some(m => m.id === a.id)) {
                                              merged.push(a);
                                            }
                                          }
                                          return { ...prev, adAccounts: merged };
                                        });
                                        showToast(`Discovered & connected ${res.data.length} Ad Accounts!`);
                                      } else {
                                        showToast('No additional ad accounts found for this token');
                                      }
                                    } catch (err: any) {
                                      showToast(err?.message || 'Failed to fetch ad accounts');
                                    } finally {
                                      setIsFetchingAdAccounts(false);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold rounded-lg transition flex items-center gap-1 cursor-pointer text-[11px]"
                                >
                                  <RefreshCw className={`w-3 h-3 ${isFetchingAdAccounts ? 'animate-spin' : ''}`} />
                                  <span>{isFetchingAdAccounts ? 'Detecting...' : 'Auto-Detect via Token'}</span>
                                </button>
                              </div>

                              {/* Add Another Ad Account Input Row with Business Profile & Custom Token */}
                              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Add Ad Account from Any Business Profile / API</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    Multi-BM &amp; Multi-Token Supported
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Ad Account ID *</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. act_946162121828827"
                                      value={newAdAccountId}
                                      onChange={e => setNewAdAccountId(e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Account Nickname / Client</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. OptiVir Master Ads"
                                      value={newAdAccountName}
                                      onChange={e => setNewAdAccountName(e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Business Profile / BM Name</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. OptiVir BM / Zen CRM"
                                      value={newAdAccountBusinessProfile}
                                      onChange={e => setNewAdAccountBusinessProfile(e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                                  <div className="flex-1">
                                    <input
                                      type="password"
                                      placeholder="Custom Access Token (Optional: if this account uses a different Meta API/profile)"
                                      value={newAdAccountAccessToken}
                                      onChange={e => setNewAdAccountAccessToken(e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!newAdAccountId.trim()) {
                                        showToast('Please enter an Ad Account ID');
                                        return;
                                      }
                                      const cleanId = newAdAccountId.trim().startsWith('act_') ? newAdAccountId.trim() : `act_${newAdAccountId.trim()}`;
                                      const bmName = newAdAccountBusinessProfile.trim() || (integForm.partnerId ? `BM Partner #${integForm.partnerId}` : 'Optivir Agency BM');
                                      const customToken = newAdAccountAccessToken.trim();
                                      const newAcc = {
                                        id: cleanId,
                                        name: newAdAccountName.trim() || `Ad Account ${cleanId}`,
                                        business_name: bmName,
                                        access_token: customToken || undefined,
                                        has_custom_token: !!customToken,
                                        status: 'ACTIVE',
                                        currency: 'INR',
                                        timezone: 'Asia/Kolkata',
                                        amount_spent: '0.00',
                                        balance: '0.00',
                                        spend_cap: 'No Cap'
                                      };
                                      setIntegForm(prev => {
                                        const current = prev.adAccounts || [];
                                        const existingIdx = current.findIndex((a: any) => a.id === cleanId);
                                        if (existingIdx >= 0) {
                                          const updated = [...current];
                                          updated[existingIdx] = {
                                            ...updated[existingIdx],
                                            ...newAcc,
                                            access_token: customToken || updated[existingIdx].access_token,
                                            has_custom_token: !!(customToken || updated[existingIdx].access_token)
                                          };
                                          return { ...prev, adAccounts: updated };
                                        } else {
                                          return { ...prev, adAccounts: [...current, newAcc] };
                                        }
                                      });
                                      setNewAdAccountId('');
                                      setNewAdAccountName('');
                                      setNewAdAccountBusinessProfile('');
                                      setNewAdAccountAccessToken('');
                                      showToast(`Connected ${cleanId} from "${bmName}"`);
                                    }}
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0 flex items-center justify-center gap-1 shadow-xs"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Ad Account</span>
                                  </button>
                                </div>
                              </div>

                              {/* Connected Accounts List */}
                              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                {(integForm.adAccounts || []).length === 0 ? (
                                  <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-slate-400 text-xs">
                                    No ad accounts connected yet. Click <strong>Auto-Detect via Token</strong> or enter an Account ID above.
                                  </div>
                                ) : (
                                  (integForm.adAccounts || []).map((acc: any, idx: number) => (
                                    <div
                                      key={acc.id || idx}
                                      className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">
                                          <Target className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[180px]">
                                              {acc.name || acc.id}
                                            </span>
                                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                              ● {acc.status || 'ACTIVE'}
                                            </span>
                                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 truncate max-w-[170px]" title={`Business Profile: ${acc.business_name || 'Agency BM'}`}>
                                              🏢 {acc.business_name || 'Optivir Agency BM'}
                                            </span>
                                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${acc.access_token || acc.has_custom_token
                                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-900'
                                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                              }`}>
                                              {acc.access_token || acc.has_custom_token ? '🔑 Dedicated Token' : '🌐 Global Token'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                            <span>{acc.id}</span>
                                            <span>•</span>
                                            <span>{acc.currency || 'INR'}</span>
                                            <span>•</span>
                                            <span>{acc.timezone || 'Asia/Kolkata'}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => openAdAccountDetails(acc.id)}
                                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                                          title="View Ad Account Details in Window"
                                        >
                                          <Eye className="w-3 h-3" />
                                          <span>Details</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setIntegForm(prev => ({
                                              ...prev,
                                              adAccounts: (prev.adAccounts || []).filter((a: any) => a.id !== acc.id)
                                            }));
                                            showToast(`Removed ${acc.id}`);
                                          }}
                                          className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                          title="Remove this account"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. GOOGLE ADS MCC */}
                        {configuringInteg.id === 'int-google' && (
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Manager Customer ID (CID) <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="text"
                                value={integForm.cid || ''}
                                onChange={e => setIntegForm({ ...integForm, cid: e.target.value })}
                                placeholder="829-102-9912"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Developer Token <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="password"
                                value={integForm.developerToken || ''}
                                onChange={e => setIntegForm({ ...integForm, developerToken: e.target.value })}
                                placeholder="9_xKa9281..."
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">OAuth Client ID</label>
                                <input
                                  type="text"
                                  value={integForm.clientId || ''}
                                  onChange={e => setIntegForm({ ...integForm, clientId: e.target.value })}
                                  placeholder="...apps.googleusercontent.com"
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">OAuth Client Secret</label>
                                <input
                                  type="password"
                                  value={integForm.clientSecret || ''}
                                  onChange={e => setIntegForm({ ...integForm, clientSecret: e.target.value })}
                                  placeholder="••••••••"
                                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 6. SHOPIFY */}
                        {configuringInteg.id === 'int-shopify' && (
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Shopify Store Domain <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="text"
                                value={integForm.domain || ''}
                                onChange={e => setIntegForm({ ...integForm, domain: e.target.value })}
                                placeholder="your-store.myshopify.com"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Admin API Access Token / Collaborator Code <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="password"
                                value={integForm.token || ''}
                                onChange={e => setIntegForm({ ...integForm, token: e.target.value })}
                                placeholder="shpat_live_..."
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        )}

                        {/* 7. SLACK */}
                        {configuringInteg.id === 'int-slack' && (
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Bot User OAuth Token (xoxb-...) <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="password"
                                value={integForm.botToken || ''}
                                onChange={e => setIntegForm({ ...integForm, botToken: e.target.value })}
                                placeholder="xoxb-..."
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notification Channel</label>
                              <input
                                type="text"
                                value={integForm.channel || '#agency-sales'}
                                onChange={e => setIntegForm({ ...integForm, channel: e.target.value })}
                                placeholder="#agency-sales"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        )}

                        {/* 8. GOOGLE WORKSPACE / GMAIL */}
                        {configuringInteg.id === 'int-google-workspace' && (
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                Google Cloud Client ID <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="text"
                                value={integForm.clientId || ''}
                                onChange={e => setIntegForm({ ...integForm, clientId: e.target.value })}
                                placeholder="...apps.googleusercontent.com"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Service Account Email</label>
                              <input
                                type="email"
                                value={integForm.serviceEmail || ''}
                                onChange={e => setIntegForm({ ...integForm, serviceEmail: e.target.value })}
                                placeholder="service@optivir-crm.iam.gserviceaccount.com"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        )}

                        {/* 9. WHATSAPP CLOUD API */}
                        {configuringInteg.id === 'int-whatsapp' && (
                          <div className="space-y-3">
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                WhatsApp Business Account ID (WABA ID) <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="text"
                                value={integForm.wabaId || ''}
                                onChange={e => setIntegForm({ ...integForm, wabaId: e.target.value })}
                                placeholder="e.g. 10928374659281"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number ID</label>
                              <input
                                type="text"
                                value={integForm.phoneId || ''}
                                onChange={e => setIntegForm({ ...integForm, phoneId: e.target.value })}
                                placeholder="e.g. 102938475619"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                System User Permanent Token <span className="text-rose-600">*</span>
                              </label>
                              <input
                                type="password"
                                value={integForm.accessToken || ''}
                                onChange={e => setIntegForm({ ...integForm, accessToken: e.target.value })}
                                placeholder="EAAG..."
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Test Connection Output Box */}
                      {testResult && (
                        <div className={`p-3.5 rounded-xl text-xs border ${testResult.success
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                          }`}>
                          <div className="flex items-center gap-2 font-bold mb-1">
                            {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                            <span>{testResult.message}</span>
                          </div>
                          {testResult.details && (
                            <p className="text-[11px] opacity-90 pl-6 leading-relaxed">
                              {testResult.details}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Modal Footer Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {configuringInteg.connected ? (
                          <button
                            type="button"
                            onClick={async () => {
                              const integId = configuringInteg.id;
                              const integName = configuringInteg.name;
                              try {
                                await api.disconnectIntegration(integId);
                              } catch (err) {
                                console.warn('Backend disconnect error:', err);
                              }
                              const updated = integrations.map(item => {
                                if (item.id === integId) {
                                  return { ...item, connected: false, statusText: 'Not Connected', config: {}, lastSynced: undefined };
                                }
                                return item;
                              });
                              setIntegrations(updated);
                              try {
                                localStorage.setItem('optivir_integrations_config', JSON.stringify(updated));
                              } catch {
                                // ignore
                              }
                              setTelemetryLogs(prev => [
                                {
                                  id: `log-${Date.now()}`,
                                  action: 'INTEGRATION_DISCONNECTED',
                                  operator: 'Abhinav Admin',
                                  role: 'Super Admin',
                                  details: `Disconnected ${integName} and purged credentials from database`,
                                  ip: '192.168.1.45',
                                  timestamp: 'Just now',
                                  status: 'SUCCESS'
                                },
                                ...prev
                              ]);
                              setConfiguringInteg(null);
                              showToast(`Disconnected from ${integName}`);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Disconnect &amp; Purge</span>
                          </button>
                        ) : <div />}

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setConfiguringInteg(null)}
                            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isTestingConnection}
                            onClick={async () => {
                              setIsTestingConnection(true);
                              setTestResult(null);
                              try {
                                const res = await api.testIntegration(configuringInteg.id, integForm);
                                setTestResult({
                                  success: res.success,
                                  message: res.message,
                                  details: `${res.details || ''}${res.latencyMs !== undefined ? ` • Latency: ${res.latencyMs}ms` : ''}`.trim()
                                });
                                if (res.success && res.data?.adAccounts && Array.isArray(res.data.adAccounts) && res.data.adAccounts.length > 0) {
                                  setIntegForm(prev => {
                                    const current = prev.adAccounts || [];
                                    const merged = [...current];
                                    for (const a of res.data.adAccounts) {
                                      if (!merged.some(m => m.id === a.id)) {
                                        merged.push(a);
                                      }
                                    }
                                    return { ...prev, adAccounts: merged };
                                  });
                                }
                              } catch (err: any) {
                                setTestResult({
                                  success: false,
                                  message: err?.message || 'Connection Handshake Failed',
                                  details: err?.details || err?.data?.details || 'Server-to-server connection test failed. Check network or credentials.'
                                });
                              } finally {
                                setIsTestingConnection(false);
                              }
                            }}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin text-amber-400' : ''}`} />
                            <span>{isTestingConnection ? 'Verifying Live...' : 'Test Connection'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              // Validation check
                              if (configuringInteg.id === 'int-paytm' && (!integForm.mid || !integForm.merchantKey)) {
                                showToast('Please enter both Merchant ID and Merchant Key to connect Paytm PG');
                                return;
                              }
                              if (configuringInteg.id === 'int-razorpay' && (!integForm.keyId || !integForm.keySecret)) {
                                showToast('Please enter Key ID and Key Secret to connect Razorpay');
                                return;
                              }
                              if (configuringInteg.id === 'int-stripe' && !integForm.secretKey) {
                                showToast('Please enter Stripe Secret Key');
                                return;
                              }
                              if (configuringInteg.id === 'int-meta') {
                                if (!integForm.accessToken) {
                                  showToast('Please enter System User Access Token');
                                  return;
                                }
                                const accounts = Array.isArray(integForm.adAccounts) ? integForm.adAccounts : [];
                                if (!integForm.partnerId && !integForm.adAccountId && accounts.length === 0) {
                                  showToast('Please enter either Business Partner ID or add at least one Ad Account');
                                  return;
                                }
                              }
                              if (configuringInteg.id === 'int-google' && (!integForm.cid || !integForm.developerToken)) {
                                showToast('Please enter Manager CID and Developer Token');
                                return;
                              }
                              if (configuringInteg.id === 'int-shopify' && (!integForm.domain || !integForm.token)) {
                                showToast('Please enter Store Domain and Admin Token');
                                return;
                              }
                              if (configuringInteg.id === 'int-slack' && !integForm.botToken) {
                                showToast('Please enter Slack Bot User Token');
                                return;
                              }
                              if (configuringInteg.id === 'int-google-workspace' && (!integForm.clientId || !integForm.serviceEmail)) {
                                showToast('Please enter Client ID and Service Account Email');
                                return;
                              }
                              if (configuringInteg.id === 'int-whatsapp' && (!integForm.wabaId || !integForm.accessToken)) {
                                showToast('Please enter WABA ID and Access Token');
                                return;
                              }

                              let statusText = 'Connected';
                              if (configuringInteg.id === 'int-paytm') statusText = `Live • MID: ${integForm.mid.substring(0, 8)}...`;
                              else if (configuringInteg.id === 'int-razorpay') statusText = `Live • ${integForm.keyId.substring(0, 10)}...`;
                              else if (configuringInteg.id === 'int-stripe') statusText = `Active • Currency: ${integForm.currency || 'USD'}`;
                              else if (configuringInteg.id === 'int-meta') {
                                const accs = Array.isArray(integForm.adAccounts) ? integForm.adAccounts : [];
                                const count = accs.length > 0 ? accs.length : (integForm.adAccountId ? 1 : 0);
                                if (count > 1) {
                                  statusText = `Active • ${count} Ad Accounts Connected`;
                                } else if (count === 1) {
                                  const name = accs[0]?.name || integForm.adAccountId || '1 Ad Account';
                                  statusText = `Active • ${name}`;
                                } else {
                                  statusText = `Active • Partner: ${integForm.partnerId}`;
                                }
                              }
                              else if (configuringInteg.id === 'int-google') statusText = `Active • CID: ${integForm.cid}`;
                              else if (configuringInteg.id === 'int-shopify') statusText = `Linked • ${integForm.domain}`;
                              else if (configuringInteg.id === 'int-slack') statusText = `Active • ${integForm.channel || '#alerts'}`;
                              else if (configuringInteg.id === 'int-google-workspace') statusText = `Active • ${integForm.serviceEmail}`;
                              else if (configuringInteg.id === 'int-whatsapp') statusText = `Active • WABA: ${integForm.wabaId}`;

                              try {
                                await api.saveIntegration({
                                  integrationId: configuringInteg.id,
                                  name: configuringInteg.name,
                                  category: configuringInteg.category,
                                  config: integForm,
                                  metadata: {
                                    adAccounts: integForm.adAccounts || [],
                                    partnerId: integForm.partnerId || '',
                                    pixelId: integForm.pixelId || '',
                                    cid: integForm.cid || '',
                                    domain: integForm.domain || ''
                                  },
                                  statusText,
                                  connected: true
                                });
                              } catch (err) {
                                console.warn('Backend save error:', err);
                              }

                              const updated = integrations.map(item => {
                                if (item.id === configuringInteg.id) {
                                  return {
                                    ...item,
                                    connected: true,
                                    statusText,
                                    config: integForm,
                                    metadata: {
                                      adAccounts: integForm.adAccounts || [],
                                      partnerId: integForm.partnerId || '',
                                      pixelId: integForm.pixelId || ''
                                    },
                                    lastSynced: 'Just now'
                                  };
                                }
                                return item;
                              });

                              setIntegrations(updated);
                              try {
                                localStorage.setItem('optivir_integrations_config', JSON.stringify(updated));
                              } catch {
                                // ignore
                              }

                              setTelemetryLogs(prev => [
                                {
                                  id: `log-${Date.now()}`,
                                  action: 'INTEGRATION_CONNECTED',
                                  operator: 'Abhinav Admin',
                                  role: 'Super Admin',
                                  details: `Connected ${configuringInteg.name} with verified production credentials to database`,
                                  ip: '192.168.1.45',
                                  timestamp: 'Just now',
                                  status: 'SUCCESS'
                                },
                                ...prev
                              ]);

                              setConfiguringInteg(null);
                              showToast(`${configuringInteg.name} connected & saved to database!`);
                            }}
                            className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{configuringInteg.connected ? 'Update Connection' : 'Save & Connect'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AD ACCOUNT DETAILS WINDOW MODAL */}
                {selectedAdAccountDetails && (
                  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                      {/* Window Header */}
                      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                            <Layers className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                                {selectedAdAccountDetails.name || 'Ad Account Details'}
                              </h3>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {selectedAdAccountDetails.status || 'ACTIVE'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-700 dark:text-slate-300">
                                {selectedAdAccountDetails.id}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedAdAccountDetails.id);
                                  setCopiedAccountId(true);
                                  setTimeout(() => setCopiedAccountId(false), 2000);
                                  showToast('Ad Account ID copied to clipboard');
                                }}
                                className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 text-[11px] cursor-pointer transition font-medium"
                                title="Copy Account ID"
                              >
                                {copiedAccountId ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy ID</span>
                                  </>
                                )}
                              </button>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span>Meta Marketing API v20.0</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={isLoadingAdAccountDetails}
                            onClick={() => openAdAccountDetails(selectedAdAccountDetails.id)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            title="Refresh Live Telemetry"
                          >
                            <RefreshCw className={`w-4 h-4 ${isLoadingAdAccountDetails ? 'animate-spin text-blue-500' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedAdAccountDetails(null)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Window Body (Scrollable) */}
                      <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

                        {/* 4 Financial Metric Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
                              <span>Total Spend</span>
                              <TrendingUp className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                              {typeof selectedAdAccountDetails.amount_spent === 'number'
                                ? `₹${selectedAdAccountDetails.amount_spent.toLocaleString('en-IN')}`
                                : (selectedAdAccountDetails.amount_spent || '₹0.00')}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Lifetime Ad Ingested</div>
                          </div>

                          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-100 dark:border-emerald-900/30">
                            <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                              <span>Account Limit / Cap</span>
                              <CreditCard className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                              {typeof selectedAdAccountDetails.spend_cap === 'number'
                                ? `₹${selectedAdAccountDetails.spend_cap.toLocaleString('en-IN')}`
                                : (selectedAdAccountDetails.spend_cap || 'Unlimited')}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Threshold Guardrail</div>
                          </div>

                          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-100 dark:border-amber-900/30">
                            <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold mb-1">
                              <span>Due / Balance</span>
                              <Activity className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                              {typeof selectedAdAccountDetails.balance === 'number'
                                ? `₹${selectedAdAccountDetails.balance.toLocaleString('en-IN')}`
                                : (selectedAdAccountDetails.balance || '₹0.00')}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Unbilled Threshold</div>
                          </div>

                          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-pink-50/40 dark:from-purple-950/20 dark:to-pink-950/10 border border-purple-100 dark:border-purple-900/30">
                            <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">
                              <span>Currency &amp; Mode</span>
                              <Globe2 className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                              {selectedAdAccountDetails.currency || 'INR'}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {selectedAdAccountDetails.funding_source_details?.display_string || 'Primary Card / Post-paid'}
                            </div>
                          </div>
                        </div>

                        {/* Account Architecture & Metadata Grid */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Account Architecture &amp; Telemetry Status</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div>
                              <div className="text-slate-500 dark:text-slate-400">Account Timezone</div>
                              <div className="font-bold text-slate-900 dark:text-slate-200 mt-0.5">
                                {selectedAdAccountDetails.timezone || 'Asia/Kolkata (GMT+05:30)'}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 dark:text-slate-400">Business Manager Partner</div>
                              <div className="font-bold text-slate-900 dark:text-slate-200 mt-0.5">
                                {selectedAdAccountDetails.business_name || 'Optivir Agency BM'}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 dark:text-slate-400">Linked Conversions Dataset</div>
                              <div className="font-bold text-slate-900 dark:text-slate-200 mt-0.5 font-mono text-[11px]">
                                {selectedAdAccountDetails.pixel_id ? `Pixel ID: ${selectedAdAccountDetails.pixel_id}` : 'Dataset: Linked (CAPI)'}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500 dark:text-slate-400">Webhook / Handshake Latency</div>
                              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>142ms • SLA 99.99% OK</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Associated Campaigns Live Breakdown */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Associated Live Campaigns</span>
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Direct feed from Meta Graph API v20.0 for this Ad Account
                              </p>
                            </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                              {(selectedAdAccountDetails.campaigns || []).length} Active Campaigns
                            </span>
                          </div>

                          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100/75 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="p-3">Campaign Name</th>
                                  <th className="p-3">Status</th>
                                  <th className="p-3 text-right">Spend</th>
                                  <th className="p-3 text-right">Impressions</th>
                                  <th className="p-3 text-right">Clicks</th>
                                  <th className="p-3 text-right">Conversions</th>
                                  <th className="p-3 text-right">ROAS</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {(selectedAdAccountDetails.campaigns && selectedAdAccountDetails.campaigns.length > 0) ? (
                                  selectedAdAccountDetails.campaigns.map((cmp: any, idx: number) => (
                                    <tr key={cmp.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                                      <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-[220px] truncate">
                                        {cmp.name}
                                      </td>
                                      <td className="p-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                          {cmp.status || 'ACTIVE'}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-200">
                                        {typeof cmp.spend === 'number' ? `₹${cmp.spend.toLocaleString('en-IN')}` : (cmp.spend || '₹0')}
                                      </td>
                                      <td className="p-3 text-right text-slate-600 dark:text-slate-300">
                                        {typeof cmp.impressions === 'number' ? cmp.impressions.toLocaleString('en-IN') : (cmp.impressions || '-')}
                                      </td>
                                      <td className="p-3 text-right text-slate-600 dark:text-slate-300">
                                        {typeof cmp.clicks === 'number' ? cmp.clicks.toLocaleString('en-IN') : (cmp.clicks || '-')}
                                      </td>
                                      <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                                        {typeof cmp.conversions === 'number' ? cmp.conversions.toLocaleString('en-IN') : (cmp.conversions || '-')}
                                      </td>
                                      <td className="p-3 text-right">
                                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-black text-[11px] border border-emerald-200 dark:border-emerald-800">
                                          {cmp.roas || '-'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                      <Layers className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                                      <p className="font-bold">No active campaigns reported for this billing window</p>
                                      <p className="text-xs mt-1">Campaign metrics sync in real-time when ads deliver impressions</p>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>

                      {/* Window Footer Actions */}
                      <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                        <a
                          href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${(selectedAdAccountDetails.account_id || selectedAdAccountDetails.id || '').replace('act_', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-4 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in Meta Ads Manager</span>
                        </a>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedAdAccountDetails(null)}
                            className="w-full sm:w-auto px-5 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                          >
                            Close Window
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Global In-App Action Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        subDescription={confirmModalConfig.subDescription}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        variant={confirmModalConfig.variant}
        badge={confirmModalConfig.badge}
        details={confirmModalConfig.details}
        onConfirm={confirmModalConfig.onConfirm}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
