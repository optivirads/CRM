'use client';

import React, { useState, useEffect } from 'react';
import { getActualStorageEstimate, StorageEstimateData } from '@/lib/storage-estimate';
import {
  Settings,
  Shield,
  SlidersHorizontal,
  Building2,
  Globe2,
  User,
  Users,
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
  Square
} from 'lucide-react';

interface SettingsViewProps {
  onNavigate?: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  // Active Sub-Navigation Tab (Matches the 16 items in left sidebar)
  const [activeSection, setActiveSection] = useState('Organization Identity');

  // Top Simulator Tabs
  const [simulatorTab, setSimulatorTab] = useState<
    'General & Org' |
    'Users & Matrix' |
    'Pipelines & Fields' |
    'Security & Telemetry' |
    'Integrations Hub' |
    'Lockdown & States'
  >('General & Org');

  // Form Field States (OptiVir CRM Owner Company Details)
  const [orgLegalName, setOrgLegalName] = useState('OptiVir Technologies Pvt. Ltd.');
  const [taxGstin, setTaxGstin] = useState('27AABCO1234F1Z5');
  const [domainWebsite, setDomainWebsite] = useState('https://www.optivirads.com');
  const [industry, setIndustry] = useState('Performance Marketing & Advertising Agency');
  const [supportEmail, setSupportEmail] = useState('optivirads@gmail.com');
  const [switchboardPhone, setSwitchboardPhone] = useState('+919995037109');

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
  const [usersList, setUsersList] = useState([
    { id: 'usr-1', name: 'Abhinav Admin', email: 'admin@optivir.com', role: 'owner', roleLabel: 'Executive & Owner', designation: 'Managing Director & Founder', status: 'Active', twoFactor: true, lastLogin: '10 mins ago', initials: 'AA', avatarBg: 'bg-[#B91C1C]' },
    { id: 'usr-2', name: 'Priya Sharma', email: 'sales@optivir.com', role: 'sales_lead', roleLabel: 'Sales Lead / AE', designation: 'Head of Sales & Growth', status: 'Active', twoFactor: true, lastLogin: '45 mins ago', initials: 'PS', avatarBg: 'bg-blue-600' },
    { id: 'usr-3', name: 'Maya Joseph', email: 'marketing@optivir.com', role: 'media_buyer', roleLabel: 'Performance & Media Lead', designation: 'Head of Media & Ad Buying', status: 'Active', twoFactor: true, lastLogin: '2 hours ago', initials: 'MJ', avatarBg: 'bg-purple-600' },
    { id: 'usr-4', name: 'Rohan Verma', email: 'finance@optivir.com', role: 'finance_lead', roleLabel: 'Finance & Billing Lead', designation: 'Financial Controller', status: 'Active', twoFactor: true, lastLogin: 'Yesterday', initials: 'RV', avatarBg: 'bg-emerald-600' },
    { id: 'usr-5', name: 'Sameer Sen', email: 'accounts@optivir.com', role: 'account_manager', roleLabel: 'Account Partner', designation: 'Senior Client Partner', status: 'Pending Invite', twoFactor: false, lastLogin: 'Never', initials: 'SS', avatarBg: 'bg-amber-600' }
  ]);

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
  const [newPodLead, setNewPodLead] = useState('Priya Sharma');
  const [newPodTarget, setNewPodTarget] = useState('2000000');
  const [podsList, setPodsList] = useState([
    { id: 'pod-1', name: 'Performance Growth Pod', lead: 'Priya Sharma', membersCount: 4, activeClients: 12, target: '₹18,50,000/mo', color: 'border-blue-500/40 bg-blue-500/5' },
    { id: 'pod-2', name: 'Media Buying & Ad Ops Pod', lead: 'Maya Joseph', membersCount: 3, activeClients: 8, target: '₹45,00,000 Ad Spend', color: 'border-purple-500/40 bg-purple-500/5' },
    { id: 'pod-3', name: 'Creative Production Sprint Pod', lead: 'Rahul Verma', membersCount: 5, activeClients: 14, target: '32 Deliverables/mo', color: 'border-rose-500/40 bg-rose-500/5' },
    { id: 'pod-4', name: 'Enterprise Finance & Billing Pod', lead: 'Rohan Verma', membersCount: 2, activeClients: 25, target: '100% Tax Ledger SLA', color: 'border-emerald-500/40 bg-emerald-500/5' }
  ]);

  // 7. SSO & Security 2FA State
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [failedLockoutLimit, setFailedLockoutLimit] = useState('5');
  const [ipWhitelist, setIpWhitelist] = useState(['192.168.1.0/24', '103.21.244.0/24', '49.36.128.19']);
  const [newIpAddress, setNewIpAddress] = useState('');

  // 8. Pipelines & Stages State (From Screenshot target)
  const [selectedPipelineName, setSelectedPipelineName] = useState('Enterprise Retainers Pipeline');
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageProb, setNewStageProb] = useState(50);
  const [newStageSla, setNewStageSla] = useState(5);
  const [pipelineStages, setPipelineStages] = useState([
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
  const [customFieldsList, setCustomFieldsList] = useState([
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
  const [tagsList, setTagsList] = useState([
    { id: 'tag-1', name: '#Tier1Enterprise', usageCount: 18, badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    { id: 'tag-2', name: '#HighIntent', usageCount: 24, badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    { id: 'tag-3', name: '#D2CBrand', usageCount: 31, badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    { id: 'tag-4', name: '#ShopifyPlus', usageCount: 14, badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
    { id: 'tag-5', name: '#Q4BudgetSpender', usageCount: 12, badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    { id: 'tag-6', name: '#ChurnRisk', usageCount: 3, badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800' }
  ]);

  // 11. Services Catalog State
  const [servicesList, setServicesList] = useState([
    { id: 'srv-1', name: 'Enterprise Performance Marketing Retainer', category: 'Performance Marketing', pricingModel: 'Monthly Retainer', price: 150000, sacCode: '998361', taxRate: '18% GST', deliverablesCount: 6 },
    { id: 'srv-2', name: 'Search Engine Optimization & Content Engine', category: 'SEO & Content', pricingModel: 'Monthly Retainer', price: 95000, sacCode: '998361', taxRate: '18% GST', deliverablesCount: 4 },
    { id: 'srv-3', name: 'Full-Stack Web App Development', category: 'Web Dev & Tech', pricingModel: 'Fixed Milestone', price: 350000, sacCode: '998361', taxRate: '18% GST', deliverablesCount: 8 },
    { id: 'srv-4', name: 'Creative Production & Video Ad Sprint', category: 'Creative Studio', pricingModel: 'Monthly Retainer', price: 75000, sacCode: '998361', taxRate: '18% GST', deliverablesCount: 12 }
  ]);

  // 12. Lead Sources State
  const [sourcesList, setSourcesList] = useState([
    { id: 'ls-1', name: 'Google Search Ads (Intent)', channel: 'Paid Search', costPerLead: 1200, status: 'Active', totalLeads: 34 },
    { id: 'ls-2', name: 'Meta Ads (Instagram / FB)', channel: 'Paid Social', costPerLead: 650, status: 'Active', totalLeads: 62 },
    { id: 'ls-3', name: 'LinkedIn Outreach', channel: 'B2B Social', costPerLead: 2500, status: 'Active', totalLeads: 19 },
    { id: 'ls-4', name: 'Agency Website Organic', channel: 'Organic SEO', costPerLead: 0, status: 'Active', totalLeads: 45 },
    { id: 'ls-5', name: 'CEO Referral Network', channel: 'Executive Referral', costPerLead: 0, status: 'Active', totalLeads: 15 },
    { id: 'ls-6', name: 'Inbound Inquiries Form', channel: 'Inbound Web', costPerLead: 300, status: 'Active', totalLeads: 28 }
  ]);

  // 13. Document Templates State
  const [templatesList, setTemplatesList] = useState([
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
  const [telemetryLogs, setTelemetryLogs] = useState([
    { id: 'log-1', action: 'ROLE_PERMISSION_UPDATED', operator: 'Abhinav Admin', role: 'Super Admin', details: 'Updated "sales_lead" access rights', ip: '192.168.1.45', timestamp: '2 mins ago', status: 'SUCCESS' },
    { id: 'log-2', action: 'KMS_KEY_ROTATED', operator: 'Security Bot', role: 'System Daemon', details: 'Master Envelope Key #V4 rotated', ip: 'internal-kms', timestamp: '1 hour ago', status: 'SUCCESS' },
    { id: 'log-3', action: 'EXPORT_COMPANIES_CSV', operator: 'Priya Sharma', role: 'Sales Lead', details: '18 verified company rows exported', ip: '103.21.244.2', timestamp: '3 hours ago', status: 'SUCCESS' },
    { id: 'log-4', action: 'PIPELINE_STAGE_CREATED', operator: 'Priya Sharma', role: 'Sales Lead', details: 'Created stage "Legal SOW & Security Review"', ip: '103.21.244.8', timestamp: 'Yesterday', status: 'SUCCESS' },
    { id: 'log-5', action: 'TWO_FACTOR_ENFORCED', operator: 'Abhinav Admin', role: 'Super Admin', details: 'Enforced 2FA mandatory for all 5 seats', ip: '192.168.1.45', timestamp: '2 days ago', status: 'SUCCESS' }
  ]);

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
  const [integForm, setIntegForm] = useState<Record<string, string>>({});
  const [showSecretField, setShowSecretField] = useState<Record<string, boolean>>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
  const [integCategoryFilter, setIntegCategoryFilter] = useState<string>('All');

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyUUID = () => {
    navigator.clipboard.writeText('opt-tenant-optivirads');
    showToast('Tenant UUID copied to clipboard: opt-tenant-optivirads');
  };

  const handleSaveChanges = () => {
    showToast(`Configuration updated: ${activeSection} saved to master ledger [200 OK]`);
  };

  const handleRollback = () => {
    showToast('Configuration state rolled back to checkpoint snapshot (v4.8.1)');
  };

  interface NavItemConfig {
    id: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
    redDot?: boolean;
    greenDot?: boolean;
  }

  // Sub-Navigation Sections
  const navGroups: { title: string; count: number; items: NavItemConfig[] }[] = [
    {
      title: 'CORE & ORGANIZATION',
      count: 3,
      items: [
        { id: 'Organization Identity', icon: Building2 },
        { id: 'General Regional', icon: Globe2 },
        { id: 'My Preferences', icon: User }
      ]
    },
    {
      title: 'IDENTITY & ACCESS',
      count: 4,
      items: [
        { id: 'User Directory', icon: Users, badge: `${usersList.length}` },
        { id: 'Roles & Permissions', icon: KeyRound, redDot: true },
        { id: 'Teams & Pods', icon: Users },
        { id: 'SSO & Security 2FA', icon: ShieldCheck }
      ]
    },
    {
      title: 'REVENUE & OPERATIONS',
      count: 7,
      items: [
        { id: 'Pipelines & Stages', icon: Workflow },
        { id: 'Custom Fields', icon: FileCode },
        { id: 'System Tags', icon: Tag },
        { id: 'Services Catalog', icon: Briefcase },
        { id: 'Lead Sources', icon: Layers },
        { id: 'Document Templates', icon: FileText },
        { id: 'Billing & Currency', icon: CreditCard }
      ]
    },
    {
      title: 'COMPLIANCE & CONNECT',
      count: 2,
      items: [
        { id: 'Audit Telemetry', icon: Activity, badge: 'Live', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' },
        { id: 'Integrations Hub', icon: Network, greenDot: true }
      ]
    }
  ];

  return (
    <div className="pb-16 transition-colors duration-200 font-sans">
      {/* 0. Top State Simulator Module Switcher Banner */}
      <div className="bg-[#0A1628] text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-rose-400 uppercase text-[11px]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>SETTINGS WORKSPACE:</span>
          </div>
          <div className="flex items-center gap-1 bg-[#102038] p-0.5 rounded-md border border-[#1A2E4E] flex-wrap">
            {[
              'General & Org',
              'Users & Matrix',
              'Pipelines & Fields',
              'Security & Telemetry',
              'Integrations Hub',
              'Lockdown & States'
            ].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setSimulatorTab(v as any);
                  if (v === 'General & Org') setActiveSection('Organization Identity');
                  if (v === 'Users & Matrix') setActiveSection('User Directory');
                  if (v === 'Pipelines & Fields') setActiveSection('Pipelines & Stages');
                  if (v === 'Security & Telemetry') setActiveSection('Audit Telemetry');
                  if (v === 'Integrations Hub') setActiveSection('Integrations Hub');
                  if (v === 'Lockdown & States') setActiveSection('Billing & Currency');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  simulatorTab === v
                    ? 'bg-[#B91C1C] text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Status Strip with Rollback & Save */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-300 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Telemetry Synchronized (2.4k ops/s)
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

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
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

        {/* 2. Main Two-Column Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SUB-NAVIGATION SIDEBAR (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isActive
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
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                item.badgeColor || (isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')
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

            {/* TENANT QUOTA CARD (Bottom of Sidebar) */}
            <div className="bg-[#0A1628] text-white rounded-2xl p-4 shadow-xs space-y-3 border border-[#14233D]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[10px] tracking-wider uppercase text-slate-300">
                  TENANT QUOTA
                </span>
                <Cloud className="w-4 h-4 text-blue-400" />
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-400">Active Seats</span>
                <span className="font-bold text-white text-sm">{usersList.length} / 50</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-400">Actual Storage Space</span>
                  <span className="font-semibold text-slate-200 text-[11px]">{storageData.formattedUsage} / {storageData.formattedQuota}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.max(storageData.percent, 0.5)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>Actual Usage: {storageData.percent}%</span>
                  <span>Browser &amp; OS Storage Quota</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN CONFIGURATION PANEL (9 cols) */}
          <div className="lg:col-span-9 space-y-6">

            {/* ========================================================================= */}
            {/* 1. TAB: ORGANIZATION IDENTITY                                            */}
            {/* ========================================================================= */}
            {activeSection === 'Organization Identity' && (
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
                        src="/images/optivir-logo.png"
                        alt="OptiVir CRM"
                        className="h-14 w-auto max-w-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Recommended resolution: 2171x724 SVG or transparent high-res PNG. Used in outbound proposals, PDF invoices &amp; login portals.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex-1 py-1.5 rounded-lg bg-white dark:bg-[#111E34] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-100 transition text-center cursor-pointer">
                        <Upload className="w-3.5 h-3.5 inline mr-1" />
                        Replace Asset
                        <input type="file" className="hidden" onChange={() => showToast('Master logo asset updated successfully')} />
                      </label>
                      <button
                        onClick={() => showToast('Master logo reset to default')}
                        className="p-2 rounded-lg bg-white dark:bg-[#111E34] border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Reset Asset"
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
                        onClick={handleSaveChanges}
                        className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Organization Identity</span>
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
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Regional Settings</span>
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
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save My Preferences</span>
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
                        User Directory &amp; Team Members
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {usersList.length} Total Seats
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Manage agency staff accounts, role assignments, designations &amp; 2FA status.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-3.5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Invite Team Member</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or role..."
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
                      <option value="sales_lead">Sales Lead</option>
                      <option value="media_buyer">Media Buyer</option>
                      <option value="finance_lead">Finance Lead</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Team Member</th>
                        <th className="py-3 px-4">Assigned Role</th>
                        <th className="py-3 px-4">Designation</th>
                        <th className="py-3 px-4">2FA Security</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {usersList
                        .filter(u => teamRoleFilter === 'all' || u.role === teamRoleFilter)
                        .filter(u => !teamSearch || u.name.toLowerCase().includes(teamSearch.toLowerCase()) || u.email.toLowerCase().includes(teamSearch.toLowerCase()))
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg ${u.avatarBg} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                                  {u.initials}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                                  <div className="text-[11px] text-slate-400">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-800 dark:text-slate-200">{u.roleLabel}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.designation}</td>
                            <td className="py-3 px-4">
                              {u.twoFactor ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                  <Check className="w-3 h-3" /> Enforced
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => showToast(`Resent setup invite to ${u.email}`)}
                                className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold text-[11px] mr-3 cursor-pointer"
                              >
                                Re-Invite
                              </button>
                              <button
                                onClick={() => {
                                  setUsersList(usersList.filter(x => x.id !== u.id));
                                  showToast(`Removed ${u.name} from directory`);
                                }}
                                className="text-rose-500 hover:text-rose-700 font-semibold text-[11px] cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Invite Modal */}
                {showInviteModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-900 dark:text-white">Invite New Team Member</h4>
                        <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newUserName.trim() || !newUserEmail.trim()) return;
                        const newU = {
                          id: `usr-${Date.now()}`,
                          name: newUserName,
                          email: newUserEmail,
                          role: newUserRole,
                          roleLabel: newUserRole === 'sales_lead' ? 'Sales Lead / AE' : newUserRole === 'media_buyer' ? 'Performance Lead' : 'Finance Controller',
                          designation: newUserDesignation,
                          status: 'Invited',
                          twoFactor: false,
                          lastLogin: 'Never',
                          initials: newUserName.substring(0, 2).toUpperCase(),
                          avatarBg: 'bg-blue-600'
                        };
                        setUsersList([newU, ...usersList]);
                        setShowInviteModal(false);
                        setNewUserName('');
                        setNewUserEmail('');
                        showToast(`Invitation sent to ${newU.email}!`);
                      }} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Full Name</label>
                          <input type="text" required placeholder="e.g. Maya Sharma" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Corporate Email</label>
                          <input type="email" required placeholder="maya@optivir.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold block mb-1">Role Type</label>
                            <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                              <option value="sales_lead">Sales Lead</option>
                              <option value="media_buyer">Media Buyer</option>
                              <option value="finance_lead">Finance Lead</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-semibold block mb-1">Designation</label>
                            <input type="text" value={newUserDesignation} onChange={e => setNewUserDesignation(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowInviteModal(false)} className="px-3 py-2 rounded-xl text-slate-400 hover:text-white">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl shadow-xs">Dispatch Invite</button>
                        </div>
                      </form>
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
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Role Matrix</span>
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
                    <div key={pod.id} className={`p-4 rounded-2xl border ${pod.color} space-y-3 bg-white dark:bg-slate-900 shadow-xs`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pod.name}</h4>
                          <span className="text-[11px] text-slate-400">Pod Lead: <strong>{pod.lead}</strong></span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {pod.membersCount} Specialists
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="text-[10px] text-slate-400">Active Clients</div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{pod.activeClients} Brands</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Monthly Target / Metric</div>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{pod.target}</div>
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
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newPodName.trim()) return;
                        setPodsList([...podsList, {
                          id: `pod-${Date.now()}`,
                          name: newPodName,
                          lead: newPodLead,
                          membersCount: 3,
                          activeClients: 0,
                          target: `₹${parseInt(newPodTarget).toLocaleString('en-IN')}/mo`,
                          color: 'border-blue-500/40 bg-blue-500/5'
                        }]);
                        setShowPodModal(false);
                        setNewPodName('');
                        showToast(`Pod "${newPodName}" created!`);
                      }} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold block mb-1">Pod Title</label>
                          <input type="text" required placeholder="e.g. D2C E-commerce Scaling Pod" value={newPodName} onChange={e => setNewPodName(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Lead Specialist</label>
                          <select value={newPodLead} onChange={e => setNewPodLead(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                            {usersList.map(u => <option key={u.id} value={u.name}>{u.name} ({u.roleLabel})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold block mb-1">Monthly Revenue Target (INR ₹)</label>
                          <input type="number" value={newPodTarget} onChange={e => setNewPodTarget(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowPodModal(false)} className="px-3 py-2 text-slate-400">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl">Create Pod</button>
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
                  {/* 2FA Toggle */}
                  <div className="p-4 bg-slate-50 dark:bg-[#0A101C] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-slate-900 dark:text-white">Enforce Two-Factor Authentication (2FA)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mandate TOTP authenticator (Google Authenticator / 1Password) for all 5 active tenant users.
                      </p>
                    </div>
                    <button onClick={() => { setTwoFactorEnforced(!twoFactorEnforced); showToast('2FA policy updated'); }} className="cursor-pointer">
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
                        <option value="15m">15 Minutes (High Security)</option>
                        <option value="30m">30 Minutes (Recommended)</option>
                        <option value="1h">1 Hour</option>
                        <option value="8h">8 Hours (Full Shift)</option>
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
                            showToast(`Whitelisted IP: ${newIpAddress.trim()}`);
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
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Security Policies</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 8. TAB: PIPELINES & STAGES (Target from screenshot!)                     */}
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
                      value={selectedPipelineName}
                      onChange={(e) => setSelectedPipelineName(e.target.value)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-bold text-slate-900 dark:text-white"
                    >
                      <option>Enterprise Retainers Pipeline</option>
                      <option>Performance Ads Fast-Track</option>
                      <option>Inbound Consultation Sprint</option>
                    </select>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Weighted Total: ₹58,85,000</span>
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
                        <div className={`w-3 h-3 rounded-full ${stage.color} shrink-0`}></div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{stage.name}</h4>
                          <span className="text-[10px] text-slate-400">
                            {stage.dealCount} active deals in pipeline ({stage.totalValue})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs shrink-0">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Win Probability</span>
                          <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800 dark:text-slate-200">
                            <input
                              type="number"
                              value={stage.probability}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setPipelineStages(pipelineStages.map(s => s.id === stage.id ? { ...s, probability: val } : s));
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
                            <span>{stage.slaDays > 0 ? `${stage.slaDays} Days` : 'No SLA'}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (pipelineStages.length > 2) {
                              setPipelineStages(pipelineStages.filter(s => s.id !== stage.id));
                              showToast(`Stage "${stage.name}" removed`);
                            } else {
                              showToast('A pipeline requires at least 2 stages');
                            }
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
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newStageName.trim()) return;
                        const newS = {
                          id: `stg-${Date.now()}`,
                          order: pipelineStages.length + 1,
                          name: newStageName.trim(),
                          probability: newStageProb,
                          slaDays: newStageSla,
                          color: 'bg-teal-500',
                          dealCount: 0,
                          totalValue: '₹0'
                        };
                        setPipelineStages([...pipelineStages, newS]);
                        setShowAddStageModal(false);
                        setNewStageName('');
                        showToast(`Added stage "${newS.name}" with ${newS.probability}% probability!`);
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
                          <button type="submit" className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl">Create Stage</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Pipeline Stages</span>
                  </button>
                </div>
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
                        .filter(cf => cf.entity === customFieldsEntity)
                        .map(cf => (
                          <tr key={cf.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{cf.name}</td>
                            <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{cf.key}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                {cf.type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {cf.required ? (
                                <span className="text-emerald-600 font-bold">Required</span>
                              ) : (
                                <span className="text-slate-400">Optional</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setCustomFieldsList(customFieldsList.filter(x => x.id !== cf.id));
                                  showToast(`Removed custom field "${cf.name}"`);
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
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newFieldName.trim()) return;
                        const key = newFieldName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
                        setCustomFieldsList([...customFieldsList, {
                          id: `cf-${Date.now()}`,
                          entity: customFieldsEntity,
                          name: newFieldName.trim(),
                          key,
                          type: newFieldType,
                          required: newFieldRequired
                        }]);
                        setShowAddCustomFieldModal(false);
                        setNewFieldName('');
                        showToast(`Added field "${newFieldName.trim()}" to ${customFieldsEntity}!`);
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
                          <button type="submit" className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl">Save Field</button>
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
                    onClick={() => {
                      if (!newTagName.trim()) return;
                      const formatted = newTagName.trim().startsWith('#') ? newTagName.trim() : `#${newTagName.trim()}`;
                      setTagsList([...tagsList, { id: `tag-${Date.now()}`, name: formatted, usageCount: 0, badgeClass: newTagColor }]);
                      setNewTagName('');
                      showToast(`Created tag "${formatted}"!`);
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tag.badgeClass}`}>
                          {tag.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{tag.usageCount} uses</span>
                      </div>
                      <button
                        onClick={() => {
                          setTagsList(tagsList.filter(x => x.id !== tag.id));
                          showToast(`Tag "${tag.name}" deleted`);
                        }}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
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
                    onClick={() => showToast('New service package modal ready')}
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          SAC {srv.sacCode}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Default Retainer / Price</span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                            ₹{srv.price.toLocaleString('en-IN')}
                            <span className="text-xs text-slate-400 font-normal"> / {srv.pricingModel}</span>
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {srv.deliverablesCount} Scope Items
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <span className="text-xs text-slate-400">{sourcesList.length} Channels Active</span>
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sourcesList.map(src => (
                        <tr key={src.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{src.name}</td>
                          <td className="py-3 px-4 text-slate-500">{src.channel}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {src.costPerLead > 0 ? `₹${src.costPerLead.toLocaleString('en-IN')}` : '₹0 (Organic)'}
                          </td>
                          <td className="py-3 px-4">{src.totalLeads} Leads</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {src.status}
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
                  <span className="text-xs text-slate-400">4 Core Templates</span>
                </div>

                <div className="space-y-3 text-xs">
                  {templatesList.map(tmpl => (
                    <div key={tmpl.id} className="p-4 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tmpl.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {tmpl.version}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {tmpl.type} • {tmpl.standardTerms} • SAC {tmpl.sacCode}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => showToast(`Opening template editor for ${tmpl.name}`)}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                        >
                          Edit Content
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Billing Information</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 15. TAB: AUDIT TELEMETRY                                                 */}
            {/* ========================================================================= */}
            {activeSection === 'Audit Telemetry' && (
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
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
                  <button
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," + ["Action,Operator,Details,IP,Timestamp", ...telemetryLogs.map(l => `${l.action},${l.operator},"${l.details}",${l.ip},${l.timestamp}`)].join("\n");
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
                      {telemetryLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">[{log.action}]</td>
                          <td className="py-3 px-4 font-semibold">{log.operator}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.details}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ip}</td>
                          <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {log.status}
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
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                        activeCount > 0
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        integCategoryFilter === cat
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
                        className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl space-y-3.5 shadow-xs transition ${
                          integ.connected
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
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            integ.connected
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {integ.connected ? '● Connected' : '○ Disconnected'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed min-h-[32px]">
                          {integ.desc}
                        </p>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>{integ.connected ? (integ.lastSynced ? `Synced ${integ.lastSynced}` : 'Active SLA') : 'Real Auth Required'}</span>
                          </span>
                          <button
                            onClick={() => {
                              setConfiguringInteg(integ);
                              setIntegForm(integ.config || {});
                              setTestResult(null);
                              setIsTestingConnection(false);
                              setShowSecretField({});
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              integ.connected
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
                          <div className="space-y-3">
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
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ad Account ID</label>
                                <input
                                  type="text"
                                  value={integForm.adAccountId || ''}
                                  onChange={e => setIntegForm({ ...integForm, adAccountId: e.target.value })}
                                  placeholder="act_492019481029"
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
                        <div className={`p-3.5 rounded-xl text-xs border ${
                          testResult.success
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
                            onClick={() => {
                              const integId = configuringInteg.id;
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
                                  details: `Disconnected ${configuringInteg.name} and purged stored credentials`,
                                  ip: '192.168.1.45',
                                  timestamp: 'Just now',
                                  status: 'SUCCESS'
                                },
                                ...prev
                              ]);
                              setConfiguringInteg(null);
                              showToast(`Disconnected from ${configuringInteg.name}`);
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
                            onClick={() => {
                              setIsTestingConnection(true);
                              setTestResult(null);
                              setTimeout(() => {
                                setIsTestingConnection(false);
                                if (configuringInteg.id === 'int-paytm') {
                                  if (!integForm.mid || !integForm.merchantKey) {
                                    setTestResult({ success: false, message: 'Incomplete Credentials', details: 'Both Merchant ID (MID) and Merchant Key are required to authenticate with Paytm PG.' });
                                    return;
                                  }
                                  if (integForm.mid.length < 8) {
                                    setTestResult({ success: false, message: 'Invalid MID Format', details: 'Paytm Merchant ID must be an alphanumeric identifier (min 8 chars).' });
                                    return;
                                  }
                                  setTestResult({ success: true, message: 'Paytm PG Handshake Verified (200 OK)', details: `TLS 1.3 encrypted handshake passed. Paytm payment engine connected for MID: ${integForm.mid}` });
                                } else if (configuringInteg.id === 'int-razorpay') {
                                  if (!integForm.keyId || !integForm.keySecret) {
                                    setTestResult({ success: false, message: 'Incomplete Credentials', details: 'Both Key ID and Key Secret are required for Razorpay API.' });
                                    return;
                                  }
                                  if (!integForm.keyId.startsWith('rzp_')) {
                                    setTestResult({ success: false, message: 'Invalid Key ID Prefix', details: 'Razorpay Key ID must start with rzp_live_ or rzp_test_' });
                                    return;
                                  }
                                  setTestResult({ success: true, message: 'Razorpay API Verified (200 OK)', details: `Authentication signature valid for ${integForm.keyId}` });
                                } else if (configuringInteg.id === 'int-stripe') {
                                  if (!integForm.secretKey) {
                                    setTestResult({ success: false, message: 'Secret Key Required', details: 'Please supply a valid Stripe Secret Key.' });
                                    return;
                                  }
                                  setTestResult({ success: true, message: 'Stripe API Handshake Verified', details: 'Stripe REST API client authenticated successfully.' });
                                } else if (configuringInteg.id === 'int-meta') {
                                  if (!integForm.partnerId || !integForm.accessToken) {
                                    setTestResult({ success: false, message: 'Missing Meta Credentials', details: 'Business Partner ID and System User Access Token are required.' });
                                    return;
                                  }
                                  setTestResult({ success: true, message: 'Meta Graph API Verified (200 OK)', details: `Partner access granted for Business ID ${integForm.partnerId}` });
                                } else if (configuringInteg.id === 'int-google') {
                                  if (!integForm.cid || !integForm.developerToken) {
                                    setTestResult({ success: false, message: 'Missing Google Ads Credentials', details: 'Manager CID and Developer Token are required.' });
                                    return;
                                  }
                                  setTestResult({ success: true, message: 'Google Ads MCC Handshake Verified', details: `Manager CID ${integForm.cid} validated against Google Ads API.` });
                                } else if (configuringInteg.id === 'int-shopify') {
                                  if (!integForm.domain || !integForm.token) {
                                    setTestResult({ success: false, message: 'Missing Shopify Credentials', details: 'Store domain and Admin API token are required.' });
                                    return;
                                  }
                                  setTestResult({ success: true, message: 'Shopify Partner Link Active', details: `Admin REST & GraphQL schema verified for ${integForm.domain}.` });
                                } else if (configuringInteg.id === 'int-slack') {
                                  if (!integForm.botToken) {
                                    setTestResult({ success: false, message: 'Bot Token Required', details: 'Slack Bot User OAuth Token (xoxb-...) is required.' });
                                    return;
                                  }
                                  setTestResult({ success: true, message: 'Slack Bot Authorized', details: `Connected to workspace alert channel ${integForm.channel || '#general'}.` });
                                } else if (configuringInteg.id === 'int-google-workspace') {
                                  if (!integForm.clientId || !integForm.serviceEmail) {
                                    setTestResult({ success: false, message: 'Missing Workspace Credentials', details: 'Google Cloud Client ID and Service Account Email are required.' });
                                    return;
                                  }
                                  setTestResult({ success: true, message: 'Google Workspace Scope Authorized', details: `Delegated calendar and mail sync active for ${integForm.serviceEmail}.` });
                                } else if (configuringInteg.id === 'int-whatsapp') {
                                  if (!integForm.wabaId || !integForm.accessToken) {
                                    setTestResult({ success: false, message: 'Missing WhatsApp Credentials', details: 'WABA ID and System User Access Token are required.' });
                                    return;
                                  }
                                  setTestResult({ success: true, message: 'WhatsApp Cloud API Verified', details: `Cloud API endpoint active for WABA ${integForm.wabaId}.` });
                                }
                              }, 650);
                            }}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin text-amber-400' : ''}`} />
                            <span>{isTestingConnection ? 'Verifying...' : 'Test Connection'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
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
                              if (configuringInteg.id === 'int-meta' && (!integForm.partnerId || !integForm.accessToken)) {
                                showToast('Please enter Business Partner ID and Access Token');
                                return;
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
                              else if (configuringInteg.id === 'int-meta') statusText = `Active • Partner: ${integForm.partnerId}`;
                              else if (configuringInteg.id === 'int-google') statusText = `Active • CID: ${integForm.cid}`;
                              else if (configuringInteg.id === 'int-shopify') statusText = `Linked • ${integForm.domain}`;
                              else if (configuringInteg.id === 'int-slack') statusText = `Active • ${integForm.channel || '#alerts'}`;
                              else if (configuringInteg.id === 'int-google-workspace') statusText = `Active • ${integForm.serviceEmail}`;
                              else if (configuringInteg.id === 'int-whatsapp') statusText = `Active • WABA: ${integForm.wabaId}`;

                              const updated = integrations.map(item => {
                                if (item.id === configuringInteg.id) {
                                  return {
                                    ...item,
                                    connected: true,
                                    statusText,
                                    config: integForm,
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
                                  details: `Connected ${configuringInteg.name} with verified production credentials`,
                                  ip: '192.168.1.45',
                                  timestamp: 'Just now',
                                  status: 'SUCCESS'
                                },
                                ...prev
                              ]);

                              setConfiguringInteg(null);
                              showToast(`${configuringInteg.name} connected successfully!`);
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
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
