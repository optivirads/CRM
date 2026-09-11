'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';
import {
  FileText,
  FileCheck,
  Send,
  Download,
  Plus,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  X,
  Printer,
  Eye,
  ArrowRight,
  Clock,
  Receipt,
  Building2,
  Trash2,
  Check,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Upload,
  Layers,
  Edit3,
  Shield,
  Lock,
  GitBranch,
  AlertTriangle,
  History,
  Copy,
  ExternalLink,
  Save,
  CheckSquare,
  HelpCircle,
  Hash,
  Key,
  Package,
  Boxes,
  ArrowUpRight,
  DollarSign,
  Tag,
  Percent,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { downloadClientPdf } from '@/lib/downloadPdf';

export interface AgencyPackage {
  id: string;
  name: string;
  tagline: string;
  category: 'Performance Marketing' | 'Technical Tracking' | 'Creative Studio' | 'Omni-Channel' | 'SEO & Content';
  monthlyFee: number;
  billingType: 'Monthly Retainer' | 'Quarterly Retainer' | 'One-Time Project';
  sacCode: string; // 998361
  scopeItems: string[];
  sla: string;
  recommendedFor: string;
  accentBg: string;
  accentText: string;
}

export interface ProposalLineItem {
  id: string;
  description: string;
  sacCode: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface ProposalItem {
  id: string;
  code: string;
  name: string;
  packageId?: string;
  packageName?: string;
  clientName: string;
  contactPerson: string;
  contactEmail: string;
  opportunityName: string;
  ownerName: string;
  ownerInitials: string;
  ownerBg: string;
  contractValue: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  contractType: string;
  slaTag: string;
  sacCode: string;
  version: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Negotiation' | 'Accepted' | 'Rejected';
  createdDate: string;
  validUntil: string;
  lineItems: ProposalLineItem[];
  executiveSummary: string;
  solutionArchitecture: string;
  slaAssurance: string;
}

// 1. Pre-configured OptiVir Agency Packages (All adhering to CBIC SAC 998361)
const DEFAULT_PACKAGES: AgencyPackage[] = [
  {
    id: 'pkg-perf-growth',
    name: 'Performance Marketing Growth Retainer',
    tagline: 'Scale Tier • Meta Advantage+ & Google PPC Engine',
    category: 'Performance Marketing',
    monthlyFee: 150000,
    billingType: 'Monthly Retainer',
    sacCode: '998361',
    scopeItems: [
      'Meta Ads Full-Funnel Architecture (Spend management up to ₹20L/month)',
      'Google Search, Performance Max, and Shopping ROAS Architecture',
      'Continuous A/B Angle Testing for High-Converting Ad Hooks & Creatives',
      'Weekly Bid Automation, Search Query Harvesting & Negative Placements Sweep',
      'Bi-weekly Strategic Review & Executive Pipeline Performance Sync'
    ],
    sla: '24h emergency incident turnaround, 48h new creative iteration',
    recommendedFor: 'Growth-stage DTC and B2B brands scaling beyond ₹10L/mo media spend',
    accentBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40',
    accentText: 'text-rose-600 dark:text-rose-400'
  },
  {
    id: 'pkg-capi-stack',
    name: 'Meta CAPI & Server-Side Tracking Stack',
    tagline: '100% First-Party Data & iOS ATT Browser Privacy Armor',
    category: 'Technical Tracking',
    monthlyFee: 85000,
    billingType: 'One-Time Project',
    sacCode: '998361',
    scopeItems: [
      'Server-side Google Tag Manager (sGTM) deployed on private Google Cloud Run',
      'Meta Conversions API (CAPI) with SHA-256 advanced client data matching',
      'GA4 BigQuery Event Pipeline for Raw First-Party Telemetry Retention',
      'Algorithmic deduplication between client browser pixels and server telemetry',
      'Guaranteed 9.0+ Meta Event Match Quality (EMQ) score validation'
    ],
    sla: '99.9% serverless tracking uptime, zero client data leakage',
    recommendedFor: 'Brands experiencing dropped Meta EMQ scores or attribution blindspots',
    accentBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40',
    accentText: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'pkg-dtc-engine',
    name: 'Full-Funnel DTC Scale Engine',
    tagline: 'End-to-End Enterprise Growth: Media + Creative Studio + CRO',
    category: 'Omni-Channel',
    monthlyFee: 275000,
    billingType: 'Monthly Retainer',
    sacCode: '998361',
    scopeItems: [
      'Full Omnichannel Media Execution (Meta, Google, YouTube, LinkedIn Ads)',
      'Creative Studio Production (16 monthly high-impact video reels & static assets)',
      'Conversion Rate Optimization (CRO) Landing Page & Checkout Sprints',
      'Server-Side Tracking Stack + CAPI + Looker Studio Executive Dashboard',
      'Dedicated Growth Pod: Media Director, Creative Strategist, & Tracking Lead'
    ],
    sla: 'Weekly sprints, 4h SLA on client comms via Slack Connect',
    recommendedFor: 'High-growth brands with ₹25L+ monthly media budget seeking full takeover',
    accentBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/40',
    accentText: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'pkg-creative-ugc',
    name: 'Creative Studio & Direct-Response UGC Sprint',
    tagline: 'High-Velocity Video Ad Content That Converts',
    category: 'Creative Studio',
    monthlyFee: 95000,
    billingType: 'Monthly Retainer',
    sacCode: '998361',
    scopeItems: [
      '12 High-Converting UGC Reels & TikTok Formats (Scripted, Edited & Licensed)',
      '20 Dynamic Static Ad Hooks (Product Spotlights, Comparison Charts, Reviews)',
      'Creator Sourcing, Contracting, Shipping Logistics & Full IP Buyout',
      'Hook-Rate and Hold-Rate Video Analytics Optimization',
      'Raw Asset Library Access with Editable Project Files'
    ],
    sla: '5 business days initial batch delivery, 48h revision turnarounds',
    recommendedFor: 'E-Commerce brands experiencing creative fatigue needing fresh performance angles',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    accentText: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'pkg-google-domination',
    name: 'Brand Search & Google Shopping Domination',
    tagline: 'High-Intent Capture & Google Merchant Center Precision',
    category: 'Performance Marketing',
    monthlyFee: 110000,
    billingType: 'Monthly Retainer',
    sacCode: '998361',
    scopeItems: [
      'Google Merchant Center feed optimization & custom label architecture',
      'Performance Max asset group segmentation with custom intent signals',
      'High-intent Exact Match Brand & Competitor Conquest campaigns',
      'Negative keyword sculpt to eliminate ad spend bleed',
      'Weekly Search Query Reports and Impression Share Domination Tracking'
    ],
    sla: '48h feed error resolution, weekly campaign budget rebalances',
    recommendedFor: 'Catalog & retail brands with 100+ SKUs looking to maximize Google Shopping ROAS',
    accentBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    accentText: 'text-amber-600 dark:text-amber-400'
  }
];

// Initial Rich Default Proposals
const INITIAL_PROPOSALS: ProposalItem[] = [
  {
    id: 'prop-089',
    code: 'PROP-2026-089',
    name: 'Enterprise Growth Retainer & Meta CAPI Architecture',
    packageId: 'pkg-capi-stack',
    packageName: 'Meta CAPI & Server-Side Tracking Stack',
    clientName: 'Zenith DTC Brands',
    contactPerson: 'Arjun Mehta (VP Marketing)',
    contactEmail: 'arjun@zenithbrands.in',
    opportunityName: 'Zenith Q4 Growth Pipeline',
    ownerName: 'OptiVir Admin',
    ownerInitials: 'OP',
    ownerBg: 'bg-[#DC2626]',
    contractValue: '₹1,85,000',
    subtotal: 185000,
    gstRate: 18,
    gstAmount: 33300,
    totalAmount: 218300,
    contractType: 'Monthly Retainer',
    slaTag: '48h SLA • 99.9% Uptime',
    sacCode: '998361',
    version: 'v2.1 Draft',
    status: 'Draft',
    createdDate: '2026-10-01',
    validUntil: '2026-11-15',
    lineItems: [
      {
        id: 'li-1',
        description: 'Server-Side Google Tag Manager (sGTM) on Google Cloud Run',
        sacCode: '998361',
        quantity: 1,
        unitPrice: 85000,
        amount: 85000
      },
      {
        id: 'li-2',
        description: 'Meta CAPI SHA-256 Advanced Matching & Event Deduplication',
        sacCode: '998361',
        quantity: 1,
        unitPrice: 60000,
        amount: 60000
      },
      {
        id: 'li-3',
        description: 'GA4 BigQuery Event Pipeline & Executive ROAS Dashboard',
        sacCode: '998361',
        quantity: 1,
        unitPrice: 40000,
        amount: 40000
      }
    ],
    executiveSummary: 'In response to browser privacy restrictions, iOS ATT, and client-side ad blockers, OptiVir will deploy a bespoke Server-Side Google Tag Manager (sGTM) cluster natively on private Google Cloud Run containers. This architectural modernization eliminates reliance on fragile browser pixel telemetry, routing all first-party transaction streams directly to Meta, Google, and LinkedIn Marketing APIs.',
    solutionArchitecture: 'Full first-party sGTM Cloud Run deployment with encrypted SHA-256 PII hashing before payload dispatch. Direct integration into Meta CAPI and GA4 BigQuery for authoritative attribution.',
    slaAssurance: 'OptiVir guarantees 99.9% event delivery uptime with algorithmic event deduplication between client-side pixel events and server CAPI, recovering an estimated 18% to 24% previously unattributed conversions.'
  },
  {
    id: 'prop-074',
    code: 'PROP-2026-074',
    name: 'Full-Funnel Omni-Channel Growth Engine SOW',
    packageId: 'pkg-dtc-engine',
    packageName: 'Full-Funnel DTC Scale Engine',
    clientName: 'Astra Health Tech',
    contactPerson: 'Priya Sharma (Chief Commercial Officer)',
    contactEmail: 'priya@astrahealth.com',
    opportunityName: 'Astra Q4 Omni-Channel Expansion',
    ownerName: 'OptiVir Admin',
    ownerInitials: 'OP',
    ownerBg: 'bg-[#DC2626]',
    contractValue: '₹2,75,000',
    subtotal: 275000,
    gstRate: 18,
    gstAmount: 49500,
    totalAmount: 324500,
    contractType: 'Monthly Retainer',
    slaTag: 'Weekly Sprints • 4h Slack SLA',
    sacCode: '998361',
    version: 'v1.2 Sent',
    status: 'Sent',
    createdDate: '2026-09-28',
    validUntil: '2026-10-31',
    lineItems: [
      {
        id: 'li-101',
        description: 'Omnichannel Paid Media Management (Meta, Google, YouTube)',
        sacCode: '998361',
        quantity: 1,
        unitPrice: 150000,
        amount: 150000
      },
      {
        id: 'li-102',
        description: 'Creative Studio: 16 Direct-Response Video Reels & Static Hooks',
        sacCode: '998361',
        quantity: 1,
        unitPrice: 75000,
        amount: 75000
      },
      {
        id: 'li-103',
        description: 'Conversion Rate Optimization (CRO) Bi-Weekly Experiments',
        sacCode: '998361',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000
      }
    ],
    executiveSummary: 'Comprehensive end-to-end performance media execution combining high-intent search acquisition, top-of-funnel creative sprints, and aggressive landing page conversion rate optimization.',
    solutionArchitecture: 'Unified cross-channel ad operations managed through OptiVir performance trading desk with automated budget reallocation towards top ROAS ad sets.',
    slaAssurance: 'Dedicated growth pod with guaranteed 4h response time on Slack Connect and bi-weekly sprint deliverables.'
  },
  {
    id: 'prop-062',
    code: 'PROP-2026-062',
    name: 'Creative Studio & Direct-Response UGC Sprint',
    packageId: 'pkg-creative-ugc',
    packageName: 'Creative Studio & Direct-Response UGC Sprint',
    clientName: 'UrbanKulture Apparels',
    contactPerson: 'Vikram Joshi (Founder & CEO)',
    contactEmail: 'vikram@urbankulture.in',
    opportunityName: 'UrbanKulture Festive Q4 SOW',
    ownerName: 'OptiVir Admin',
    ownerInitials: 'OP',
    ownerBg: 'bg-[#DC2626]',
    contractValue: '₹95,000',
    subtotal: 95000,
    gstRate: 18,
    gstAmount: 17100,
    totalAmount: 112100,
    contractType: 'Monthly Retainer',
    slaTag: '5-Day Initial Batch Delivery',
    sacCode: '998361',
    version: 'v1.0 Accepted',
    status: 'Accepted',
    createdDate: '2026-09-15',
    validUntil: '2026-10-15',
    lineItems: [
      {
        id: 'li-201',
        description: '12 Scripted, Edited & Licensed High-Converting UGC Reels',
        sacCode: '998361',
        quantity: 1,
        unitPrice: 65000,
        amount: 65000
      },
      {
        id: 'li-202',
        description: '20 Dynamic Static Ad Hooks (Product Spotlights & Review Cards)',
        sacCode: '998361',
        quantity: 1,
        unitPrice: 30000,
        amount: 30000
      }
    ],
    executiveSummary: 'Full-service creator sourcing, production, and video ad formatting to resolve creative fatigue and unlock aggressive scale on Meta Reels and TikTok ads.',
    solutionArchitecture: 'Rapid creative iteration framework with proprietary hook-rate and hold-rate video analytics.',
    slaAssurance: '5-day turnaround on initial concept scripts, 48h turnaround on video post-production revisions.'
  }
];

interface ProposalsViewProps {
  onNavigateToInvoice?: (data: any) => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({ onNavigateToInvoice }) => {
  const { showToast } = useToast();

  // Primary view states: 'list' | 'detail' | 'packages'
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'packages'>('list');
  
  // Packages State (Persisted in localStorage)
  const [packages, setPackages] = useState<AgencyPackage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optivir_packages');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return DEFAULT_PACKAGES;
  });

  // Proposals State (Persisted in localStorage)
  const [proposals, setProposals] = useState<ProposalItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optivir_proposals');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return INITIAL_PROPOSALS;
  });

  // Currently selected / open proposal
  const [selectedProposal, setSelectedProposal] = useState<ProposalItem>(proposals[0] || INITIAL_PROPOSALS[0]);

  // Sub-tabs in Detail view
  const [activeDetailTab, setActiveDetailTab] = useState<
    '1. 3-Column Workspace' | '2. Document Preview' | '3. Pricing Engine' | '4. Packages Catalog' | '5. Version Tree'
  >('1. 3-Column Workspace');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'properties' | 'pricing' | 'validation'>('properties');
  const [activeSectionId, setActiveSectionId] = useState('s4');

  // Filter Tabs
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);
  const [showSwitchPackageModal, setShowSwitchPackageModal] = useState(false);

  // Package Edit State
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);

  // New / Edit Package Form State
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgTagline, setNewPkgTagline] = useState('');
  const [newPkgCategory, setNewPkgCategory] = useState<AgencyPackage['category']>('Performance Marketing');
  const [newPkgFee, setNewPkgFee] = useState(120000);
  const [newPkgBilling, setNewPkgBilling] = useState<AgencyPackage['billingType']>('Monthly Retainer');
  const [newPkgSac, setNewPkgSac] = useState('998361');
  const [newPkgScopes, setNewPkgScopes] = useState('Meta & Google Ads media execution\nServer-side CAPI tracking setup\nWeekly creative testing variations\nMonthly executive performance report');
  const [newPkgSla, setNewPkgSla] = useState('48h SLA turnaround on deliverables');
  const [newPkgRecommended, setNewPkgRecommended] = useState('Scaling brands with active marketing budgets');

  const openAddPackageModal = () => {
    setEditingPkgId(null);
    setNewPkgName('');
    setNewPkgTagline('');
    setNewPkgCategory('Performance Marketing');
    setNewPkgFee(120000);
    setNewPkgBilling('Monthly Retainer');
    setNewPkgSac('998361');
    setNewPkgScopes('Meta & Google Ads media execution\nServer-side CAPI tracking setup\nWeekly creative testing variations\nMonthly executive performance report');
    setNewPkgSla('48h SLA turnaround on deliverables');
    setNewPkgRecommended('Scaling brands with active marketing budgets');
    setShowAddPackageModal(true);
  };

  const openEditPackageModal = (pkg: AgencyPackage) => {
    setEditingPkgId(pkg.id);
    setNewPkgName(pkg.name);
    setNewPkgTagline(pkg.tagline);
    setNewPkgCategory(pkg.category);
    setNewPkgFee(pkg.monthlyFee);
    setNewPkgBilling(pkg.billingType);
    setNewPkgSac(pkg.sacCode || '998361');
    setNewPkgScopes(pkg.scopeItems.join('\n'));
    setNewPkgSla(pkg.sla);
    setNewPkgRecommended(pkg.recommendedFor || '');
    setShowAddPackageModal(true);
  };

  const handleDeletePackage = (pkgId: string, pkgName: string) => {
    if (confirm(`Are you sure you want to remove package "${pkgName}" from the vault?`)) {
      setPackages(prev => prev.filter(p => p.id !== pkgId));
      showToast(`Package "${pkgName}" removed from vault`, 'info');
    }
  };

  // New Proposal Form State
  const [newPropClient, setNewPropClient] = useState('Zenith DTC Brands');
  const [newPropContact, setNewPropContact] = useState('Arjun Mehta (VP Marketing)');
  const [newPropSelectedPkgId, setNewPropSelectedPkgId] = useState(packages[0]?.id || 'pkg-perf-growth');
  const [newPropCustomTitle, setNewPropCustomTitle] = useState('');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('optivir_packages', JSON.stringify(packages));
    } catch (e) { }
  }, [packages]);

  useEffect(() => {
    try {
      localStorage.setItem('optivir_proposals', JSON.stringify(proposals));
    } catch (e) { }
  }, [proposals]);

  // Outline Sections
  const [outlineSections, setOutlineSections] = useState([
    { id: 's1', title: '1. Cover Page & Meta', done: true, active: false },
    { id: 's2', title: '2. Executive Summary', done: true, active: false },
    { id: 's3', title: '3. Challenge Analysis', done: true, active: false },
    { id: 's4', title: '4. Proposed Solution & Architecture', done: false, active: true },
    { id: 's5', title: '5. Scopes of Work', done: true, active: false },
    { id: 's6', title: '6. Deliverables & SLA', done: true, active: false },
    { id: 's7', title: '7. Commercials Engine & Tax Breakdown', done: true, active: false },
    { id: 's8', title: '8. CBIC SAC 998361 Compliance Terms', done: true, active: false },
    { id: 's9', title: '9. Digital E-Signature Signoff', done: false, active: false }
  ]);

  // Handle Generating a Proposal directly based on a Selected Package
  const handleGenerateProposalFromPackage = (pkg: AgencyPackage, customClientName?: string, customContactName?: string) => {
    const code = `PROP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const client = customClientName || newPropClient || 'Client Organization';
    const contact = customContactName || newPropContact || 'Stakeholder Lead';
    const subtotal = pkg.monthlyFee;
    const gstRate = 18;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const totalAmount = subtotal + gstAmount;

    const lineItems: ProposalLineItem[] = pkg.scopeItems.map((item, idx) => {
      const priceShare = Math.round(subtotal / Math.max(1, pkg.scopeItems.length));
      return {
        id: `li-${Date.now()}-${idx + 1}`,
        description: item,
        sacCode: pkg.sacCode || '998361',
        quantity: 1,
        unitPrice: priceShare,
        amount: priceShare
      };
    });

    const newProposal: ProposalItem = {
      id: code.toLowerCase(),
      code: code,
      name: customClientName ? `${pkg.name} — ${client} SOW` : `${pkg.name} — Commercial SOW`,
      packageId: pkg.id,
      packageName: pkg.name,
      clientName: client,
      contactPerson: contact,
      contactEmail: `${contact.split(' ')[0].toLowerCase()}@${client.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      opportunityName: `${client} — ${pkg.category} SOW`,
      ownerName: 'OptiVir Admin',
      ownerInitials: 'OP',
      ownerBg: 'bg-[#DC2626]',
      contractValue: `₹${subtotal.toLocaleString('en-IN')}`,
      subtotal: subtotal,
      gstRate: gstRate,
      gstAmount: gstAmount,
      totalAmount: totalAmount,
      contractType: pkg.billingType,
      slaTag: pkg.sla,
      sacCode: pkg.sacCode || '998361',
      version: 'v1.0 Draft',
      status: 'Draft',
      createdDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: lineItems,
      executiveSummary: `OptiVir CRM Solutions presents this authoritative commercial Statement of Work (SOW) to ${client}. Configured under our specialized "${pkg.name}" offering, this engagement directly resolves operational bottlenecks with rigorous performance accountability.`,
      solutionArchitecture: `Delivery is structured across ${pkg.scopeItems.length} core workstreams: ${pkg.scopeItems.join('; ')}. All billing is governed under CBIC SAC 998361 (Advertising & Digital Marketing Services) at 18% GST.`,
      slaAssurance: pkg.sla
    };

    setProposals(prev => [newProposal, ...prev]);
    setSelectedProposal(newProposal);
    setCurrentView('detail');
    setActiveDetailTab('1. 3-Column Workspace');
    showToast(`Generated proposal ${code} from package "${pkg.name}"!`, 'success');
  };

  // Handle adding or updating a custom agency package
  const handleAddNewPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim()) {
      showToast('Please provide a package title', 'error');
      return;
    }

    const scopeList = newPkgScopes
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (editingPkgId) {
      // Update existing package in vault
      setPackages(prev =>
        prev.map(p => {
          if (p.id === editingPkgId) {
            return {
              ...p,
              name: newPkgName.trim(),
              tagline: newPkgTagline.trim() || p.tagline,
              category: newPkgCategory,
              monthlyFee: Number(newPkgFee) || p.monthlyFee,
              billingType: newPkgBilling,
              sacCode: newPkgSac.trim() || '998361',
              scopeItems: scopeList.length > 0 ? scopeList : p.scopeItems,
              sla: newPkgSla.trim() || p.sla,
              recommendedFor: newPkgRecommended.trim() || p.recommendedFor,
            };
          }
          return p;
        })
      );

      // Also update currently active proposal if it references this package
      if (selectedProposal && selectedProposal.packageId === editingPkgId) {
        setSelectedProposal(prev => ({
          ...prev,
          packageName: newPkgName.trim(),
          sacCode: newPkgSac.trim() || '998361',
        }));
      }

      showToast(`Package "${newPkgName.trim()}" updated successfully!`, 'success');
    } else {
      // Create new package
      const createdPkg: AgencyPackage = {
        id: `pkg-${Date.now()}`,
        name: newPkgName.trim(),
        tagline: newPkgTagline.trim() || 'Custom Agency Offering',
        category: newPkgCategory,
        monthlyFee: Number(newPkgFee) || 100000,
        billingType: newPkgBilling,
        sacCode: newPkgSac.trim() || '998361',
        scopeItems: scopeList.length > 0 ? scopeList : ['Deliverable 1: Comprehensive Marketing SOW', 'Deliverable 2: Bi-weekly Strategy Calls'],
        sla: newPkgSla.trim() || '48h SLA turnaround on deliverables',
        recommendedFor: newPkgRecommended.trim() || 'Enterprise accounts',
        accentBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40',
        accentText: 'text-rose-600 dark:text-rose-400'
      };

      setPackages(prev => [createdPkg, ...prev]);
      showToast(`Package "${createdPkg.name}" added to vault!`, 'success');
    }

    setShowAddPackageModal(false);
    setEditingPkgId(null);
    setNewPkgName('');
    setNewPkgTagline('');
    setNewPkgFee(120000);
  };

  // Switch package on currently open proposal
  const handleSwitchPackage = (pkg: AgencyPackage) => {
    if (!selectedProposal) return;
    const subtotal = pkg.monthlyFee;
    const gstRate = 18;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const totalAmount = subtotal + gstAmount;

    const updatedLineItems: ProposalLineItem[] = pkg.scopeItems.map((item, idx) => {
      const priceShare = Math.round(subtotal / Math.max(1, pkg.scopeItems.length));
      return {
        id: `li-${Date.now()}-${idx + 1}`,
        description: item,
        sacCode: pkg.sacCode || '998361',
        quantity: 1,
        unitPrice: priceShare,
        amount: priceShare
      };
    });

    const updatedProp: ProposalItem = {
      ...selectedProposal,
      packageId: pkg.id,
      packageName: pkg.name,
      contractValue: `₹${subtotal.toLocaleString('en-IN')}`,
      subtotal: subtotal,
      gstAmount: gstAmount,
      totalAmount: totalAmount,
      contractType: pkg.billingType,
      slaTag: pkg.sla,
      sacCode: pkg.sacCode || '998361',
      lineItems: updatedLineItems,
      solutionArchitecture: `Re-configured under ${pkg.name}: ${pkg.scopeItems.join('; ')}. CBIC SAC 998361.`,
      slaAssurance: pkg.sla
    };

    setSelectedProposal(updatedProp);
    setProposals(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
    setShowSwitchPackageModal(false);
    showToast(`Proposal updated to match package "${pkg.name}"!`, 'success');
  };

  // Update status (Draft, Sent, Viewed, Negotiation, Accepted)
  const handleUpdateStatus = (proposalId: string, newStatus: ProposalItem['status']) => {
    setProposals(prev =>
      prev.map(p => {
        if (p.id === proposalId) {
          const updated = { ...p, status: newStatus };
          if (selectedProposal?.id === proposalId) setSelectedProposal(updated);
          return updated;
        }
        return p;
      })
    );
    showToast(`Proposal status updated to "${newStatus}"`, 'success');
  };

  // Delete Proposal
  const handleDeleteProposal = (proposalId: string) => {
    setProposals(prev => prev.filter(p => p.id !== proposalId));
    if (selectedProposal?.id === proposalId) {
      const remaining = proposals.filter(p => p.id !== proposalId);
      if (remaining.length > 0) {
        setSelectedProposal(remaining[0]);
      }
      setCurrentView('list');
    }
    showToast('Proposal deleted', 'info');
  };

  // Convert to Tax Invoice & Route to Finance
  const handleConvertToInvoice = (prop: ProposalItem) => {
    if (onNavigateToInvoice) {
      onNavigateToInvoice({
        clientName: prop.clientName,
        invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        amount: prop.subtotal,
        sacCode: prop.sacCode || '998361',
        proposalCode: prop.code,
        items: prop.lineItems.map(li => ({
          description: li.description,
          sacCode: li.sacCode || '998361',
          qty: li.quantity,
          rate: li.unitPrice,
          amount: li.amount
        }))
      });
      showToast(`Proposal ${prop.code} converted! Routed to Invoicing Ledger.`, 'success');
    } else {
      showToast(`Proposal ${prop.code} converted to Invoice draft (SAC 998361)`, 'success');
    }
  };

  // Filtered Proposals
  const filteredProposals = proposals.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.packageName && p.packageName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilterTab === 'my') return p.ownerName === 'OptiVir Admin';
    if (activeFilterTab === 'awaiting') return p.status === 'Sent' || p.status === 'Viewed';
    if (activeFilterTab === 'negotiation') return p.status === 'Negotiation';
    if (activeFilterTab === 'accepted') return p.status === 'Accepted';
    return true;
  });

  // Calculate Metrics
  const totalDraftCount = proposals.filter(p => p.status === 'Draft').length;
  const totalSentCount = proposals.filter(p => p.status === 'Sent').length;
  const totalViewedCount = proposals.filter(p => p.status === 'Viewed').length;
  const totalNegoCount = proposals.filter(p => p.status === 'Negotiation').length;
  const totalAcceptedCount = proposals.filter(p => p.status === 'Accepted').length;
  const totalAcceptedVal = proposals
    .filter(p => p.status === 'Accepted')
    .reduce((acc, p) => acc + p.subtotal, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#060B13] text-slate-800 dark:text-slate-100 pb-16 transition-colors">
      {/* ========================================================================= */}
      {/* TOP NAVIGATION / SIMULATOR MODE BAR                                      */}
      {/* ========================================================================= */}
      <div className="bg-[#0A1628] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-rose-400 uppercase text-[11px]">
            <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-black text-[10px]">SOW</span>
            <span>PROPOSALS &amp; PACKAGES ENGINE:</span>
          </div>

          <div className="flex items-center gap-1 bg-[#102038] p-0.5 rounded-md border border-[#1A2E4E] flex-wrap">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                currentView === 'list'
                  ? 'bg-[#B91C1C] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              1. Proposals Directory ({proposals.length})
            </button>
            <button
              onClick={() => {
                if (!selectedProposal && proposals.length > 0) setSelectedProposal(proposals[0]);
                setCurrentView('detail');
              }}
              className={`px-3 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                currentView === 'detail'
                  ? 'bg-[#B91C1C] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              2. Proposal Workspace &amp; Editor
            </button>
            <button
              onClick={() => setCurrentView('packages')}
              className={`px-3 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                currentView === 'packages'
                  ? 'bg-[#B91C1C] text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-3 h-3 text-amber-400" />
              <span>3. Agency Packages Vault ({packages.length})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CBIC SAC 998361 Validated (18% GST)</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>Enterprise SOW Engine</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: PROPOSALS DIRECTORY LIST                                         */}
      {/* ========================================================================= */}
      {currentView === 'list' && (
        <div className="max-w-[1700px] mx-auto p-6 space-y-6">
          {/* Header & Quick Action Ribbon */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <span>CRM</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span>Revenue Engine</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-800 dark:text-slate-200 font-medium">Proposals Management</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Proposals</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                  <span>{proposals.length} Proposals • {packages.length} Active Packages</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
                  Q3/Q4-FY26
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generate, customize, and dispatch authoritative commercial contracts based on pre-configured service packages.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setCurrentView('packages')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-amber-500" />
                <span>Browse Packages ({packages.length})</span>
              </button>

              <button
                onClick={() => {
                  if (selectedProposal) {
                    downloadClientPdf('proposal', {
                      number: selectedProposal.code,
                      title: selectedProposal.name,
                      client: selectedProposal.clientName,
                      amount: selectedProposal.contractValue || `₹${selectedProposal.subtotal?.toLocaleString('en-IN')}`,
                      packageName: selectedProposal.packageName || 'Growth SOW',
                      sacCode: selectedProposal.sacCode || '998361'
                    });
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 shadow-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>Download SOW PDF</span>
              </button>

              <button
                onClick={() => setShowCreateProposalModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Create Proposal</span>
              </button>
            </div>
          </div>

          {/* 6 Metric KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>DRAFT</span>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {totalDraftCount} <span className="text-xs text-slate-400 font-normal">Active</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Scope editing stage</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>SENT</span>
                <Send className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {totalSentCount} <span className="text-xs text-slate-400 font-normal">Awaiting</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Dispatched to client</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>VIEWED</span>
                <Eye className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {totalViewedCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Client reading active</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-rose-600 uppercase">
                <span>NEGOTIATION</span>
                <Edit3 className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-xl font-bold text-rose-600 mt-1">
                {totalNegoCount}
              </div>
              <div className="text-[10px] text-rose-600 font-medium mt-0.5">Active redlining</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600 uppercase">
                <span>ACCEPTED MTD</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {totalAcceptedCount}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">₹{(totalAcceptedVal / 100000).toFixed(2)}L Won Value</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-600 uppercase">
                <span>PACKAGES</span>
                <Package className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-amber-600 mt-1">
                {packages.length}
              </div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">Service offerings</div>
            </div>
          </div>

          {/* Filter Ribbon & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'all', label: `All Proposals (${proposals.length})` },
                { id: 'my', label: `My Proposals` },
                { id: 'awaiting', label: `Awaiting (${totalSentCount + totalViewedCount})` },
                { id: 'negotiation', label: `● In Negotiation (${totalNegoCount})` },
                { id: 'accepted', label: `Accepted (${totalAcceptedCount})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveFilterTab(t.id)}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                    activeFilterTab === t.id
                      ? 'bg-[#0A1628] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search proposals, packages, clients..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>
              <button
                onClick={() => setCurrentView('packages')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-lg cursor-pointer hover:bg-rose-100 transition"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Select Package</span>
              </button>
            </div>
          </div>

          {/* Proposals Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-4">PROPOSAL NAME &amp; PACKAGE SCOPE</th>
                    <th className="p-3.5">CLIENT &amp; CONTACT</th>
                    <th className="p-3.5">CONTRACT VALUE</th>
                    <th className="p-3.5">STATUS</th>
                    <th className="p-3.5">SAC CODE</th>
                    <th className="p-3.5 pr-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProposals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No proposals found</p>
                        <p className="text-xs text-slate-400 mt-1">Select a package from the vault to generate your first proposal.</p>
                        <button
                          onClick={() => setCurrentView('packages')}
                          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Browse Agency Packages</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredProposals.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setSelectedProposal(p);
                          setCurrentView('detail');
                        }}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      >
                        <td className="p-3.5 pl-4">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 dark:text-white hover:text-rose-600 transition flex items-center gap-1.5">
                              <span>{p.name}</span>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                                {p.code}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              {p.packageName && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900/40">
                                  <Package className="w-2.5 h-2.5" />
                                  <span>{p.packageName}</span>
                                </span>
                              )}
                              <span>•</span>
                              <span>{p.lineItems.length} Deliverables</span>
                              <span>•</span>
                              <span>{p.contractType}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{p.clientName}</div>
                            <div className="text-[11px] text-slate-500">{p.contactPerson}</div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div>
                            <div className="font-bold text-rose-600 dark:text-rose-400 text-sm">{p.contractValue}</div>
                            <div className="text-[10px] text-slate-500">
                              +18% GST (Total: ₹{p.totalAmount.toLocaleString('en-IN')})
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <select
                              value={p.status}
                              onChange={(e) => handleUpdateStatus(p.id, e.target.value as any)}
                              className={`text-xs font-bold rounded-lg px-2 py-1 border cursor-pointer ${
                                p.status === 'Accepted'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : p.status === 'Sent'
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                  : p.status === 'Viewed'
                                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                  : p.status === 'Negotiation'
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <option value="Draft">Draft</option>
                              <option value="Sent">Sent</option>
                              <option value="Viewed">Viewed</option>
                              <option value="Negotiation">Negotiation</option>
                              <option value="Accepted">Accepted ✓</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                            {p.sacCode || '998361'}
                          </span>
                        </td>

                        <td className="p-3.5 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedProposal(p);
                                setCurrentView('detail');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition"
                              title="Open in Workspace"
                            >
                              Open SOW
                            </button>

                            <button
                              onClick={() => downloadClientPdf('proposal', {
                                number: p.code,
                                title: p.name,
                                client: p.clientName,
                                amount: p.contractValue || `₹${p.subtotal?.toLocaleString('en-IN')}`,
                                packageName: p.packageName || 'Growth SOW',
                                sacCode: p.sacCode || '998361'
                              })}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleConvertToInvoice(p)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-600 transition"
                              title="Convert to Tax Invoice (SAC 998361)"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteProposal(p.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                              title="Delete Proposal"
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

            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0A101C] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {filteredProposals.length} of {proposals.length} Proposals Total
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('packages')}
                  className="text-rose-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Package className="w-3 h-3" />
                  <span>Manage Agency Packages →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: AGENCY PACKAGES VAULT (ADD PACKAGES & GENERATE FROM PACKAGE)      */}
      {/* ========================================================================= */}
      {currentView === 'packages' && (
        <div className="max-w-[1700px] mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <button onClick={() => setCurrentView('list')} className="hover:underline">
                  Proposals
                </button>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-800 dark:text-slate-200 font-medium">Agency Packages Vault</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Agency Service Packages
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span>{packages.length} Standardized Packages</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select any package below to instantly generate an authoritative commercial proposal with pre-configured deliverables, pricing, and SAC 998361 billing terms.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCurrentView('list')}
                className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                ← Back to Proposals List
              </button>

              <button
                onClick={openAddPackageModal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Package</span>
              </button>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-rose-400/50 hover:shadow-md transition group"
              >
                <div className="space-y-4">
                  {/* Category, SAC badge & Quick Edit */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {pkg.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        SAC {pkg.sacCode || '998361'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPackageModal(pkg);
                        }}
                        className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Edit Package Specifications"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                    <div>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        ₹{pkg.monthlyFee.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {pkg.billingType} • 18% GST Extra
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Fixed SOW Rate
                    </span>
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      PACKAGE DELIVERABLES ({pkg.scopeItems.length})
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {pkg.scopeItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* SLA Tag */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span><strong>SLA:</strong> {pkg.sla}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateProposalFromPackage(pkg)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#0A1628] hover:bg-[#DC2626] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generate Proposal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditPackageModal(pkg)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Edit Package Specifications"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: PROPOSAL DETAIL & DOCUMENT WORKSPACE                              */}
      {/* ========================================================================= */}
      {currentView === 'detail' && selectedProposal && (
        <div className="space-y-4">
          {/* Top Detail Header Bar */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 shadow-xs">
            <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <button onClick={() => setCurrentView('list')} className="hover:underline">
                    Proposals
                  </button>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedProposal.code}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-500">{selectedProposal.clientName}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <FileText className="w-5 h-5 text-rose-600" />
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {selectedProposal.name}
                  </h1>

                  {/* Applied Package Pill */}
                  {selectedProposal.packageName && (
                    <button
                      onClick={() => setShowSwitchPackageModal(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                      title="Click to switch base package"
                    >
                      <Package className="w-3 h-3" />
                      <span>{selectedProposal.packageName}</span>
                      <ChevronDown className="w-3 h-3 text-rose-400" />
                    </button>
                  )}

                  {/* Status Indicator */}
                  <select
                    value={selectedProposal.status}
                    onChange={(e) => handleUpdateStatus(selectedProposal.id, e.target.value as any)}
                    className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Viewed">Viewed</option>
                    <option value="Negotiation">In Negotiation</option>
                    <option value="Accepted">Accepted ✓</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Valid until {selectedProposal.validUntil}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentView('list')}
                  className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  ← Directory
                </button>

                <button
                  onClick={() => {
                    setProposals(prev => prev.map(p => p.id === selectedProposal.id ? selectedProposal : p));
                    showToast(`Proposal ${selectedProposal.code} saved to workspace!`, 'success');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-slate-600" />
                  <span>Save Draft</span>
                </button>

                <button
                  onClick={() => handleConvertToInvoice(selectedProposal)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  title="Convert to CBIC SAC 998361 Tax Invoice"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Convert to Invoice</span>
                </button>

                <button
                  onClick={() => downloadClientPdf('proposal', {
                    number: selectedProposal.code,
                    title: selectedProposal.name,
                    client: selectedProposal.clientName,
                    amount: selectedProposal.contractValue || `₹${selectedProposal.subtotal?.toLocaleString('en-IN')}`,
                    packageName: selectedProposal.packageName || 'Growth SOW',
                    sacCode: selectedProposal.sacCode || '998361'
                  })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                  title="Download Client Proposal PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => {
                    handleUpdateStatus(selectedProposal.id, 'Sent');
                    showToast(`Proposal ${selectedProposal.code} dispatched to ${selectedProposal.clientName} for digital signature!`, 'success');
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Proposal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2">
            <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4 overflow-x-auto text-xs">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                {[
                  '1. 3-Column Workspace',
                  '2. Document Preview',
                  '3. Pricing Engine',
                  '4. Packages Catalog',
                  '5. Version Tree',
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveDetailTab(tab as any)}
                    className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                      activeDetailTab === tab
                        ? 'bg-[#0A1628] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-slate-500 shrink-0 text-xs">
                <span>Contract Total:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  ₹{selectedProposal.totalAmount.toLocaleString('en-IN')} (incl. 18% GST)
                </span>
                <button
                  onClick={() => setShowSwitchPackageModal(true)}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Change Package ▾
                </button>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* TAB 1: 3-COLUMN WORKSPACE                                             */}
          {/* ===================================================================== */}
          {activeDetailTab === '1. 3-Column Workspace' && (
            <div className="max-w-[1700px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Outline Column */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      Document Outline
                    </div>
                    <button
                      onClick={() => {
                        const newSec = { id: `s${outlineSections.length + 1}`, title: `${outlineSections.length + 1}. Additional Terms`, done: true, active: false };
                        setOutlineSections(prev => [...prev, newSec]);
                        showToast('Section added to outline', 'success');
                      }}
                      className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Section</span>
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    {outlineSections.map((sec) => (
                      <div
                        key={sec.id}
                        onClick={() => setActiveSectionId(sec.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          sec.id === activeSectionId
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border-l-3 border-[#B91C1C]'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {sec.done ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                          )}
                          <span className="truncate">{sec.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Linked Package Badge */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      BASE PACKAGE
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{selectedProposal.packageName || 'Custom SOW'}</span>
                        <Package className="w-3.5 h-3.5 text-rose-500" />
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Fixed rate: {selectedProposal.contractValue}
                      </div>
                      <button
                        onClick={() => setShowSwitchPackageModal(true)}
                        className="text-[10px] font-bold text-rose-600 hover:underline block pt-1 cursor-pointer"
                      >
                        Switch Base Package →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Canvas Column */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-md space-y-6 text-xs">
                  {/* Header Meta on Page */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    <span>STATEMENT OF WORK • REF {selectedProposal.code}</span>
                    <span className="uppercase tracking-wider font-bold text-rose-600">CBIC SAC 998361</span>
                  </div>

                  {/* Company & Client Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-[#0A1628] text-white flex items-center justify-center font-bold text-xs">
                        OV
                      </div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white">OPTIVIR CRM SOLUTIONS</div>
                        <div className="text-[10px] text-slate-500">Advertising &amp; Performance Marketing Practice</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Prepared exclusively for</div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {selectedProposal.clientName}
                      </div>
                      <div className="text-[11px] text-slate-500">{selectedProposal.contactPerson}</div>
                    </div>
                  </div>

                  {/* Proposal Title (Editable) */}
                  <div className="space-y-1 pt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      PROPOSAL TITLE
                    </label>
                    <input
                      type="text"
                      value={selectedProposal.name}
                      onChange={(e) => setSelectedProposal({ ...selectedProposal, name: e.target.value })}
                      className="w-full text-lg font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Executive Summary */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      EXECUTIVE SUMMARY
                    </label>
                    <textarea
                      rows={3}
                      value={selectedProposal.executiveSummary}
                      onChange={(e) => setSelectedProposal({ ...selectedProposal, executiveSummary: e.target.value })}
                      className="w-full text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-rose-500 leading-relaxed"
                    />
                  </div>

                  {/* Scope of Work Deliverables Matrix */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        Scope of Work Deliverables (SAC 998361)
                      </h4>
                      <button
                        onClick={() => {
                          const newItem: ProposalLineItem = {
                            id: `li-${Date.now()}`,
                            description: 'Additional Custom Performance Deliverable',
                            sacCode: '998361',
                            quantity: 1,
                            unitPrice: 25000,
                            amount: 25000
                          };
                          const newItems = [...selectedProposal.lineItems, newItem];
                          const newSub = newItems.reduce((a, b) => a + b.amount, 0);
                          const newGst = Math.round((newSub * 18) / 100);
                          setSelectedProposal({
                            ...selectedProposal,
                            lineItems: newItems,
                            subtotal: newSub,
                            gstAmount: newGst,
                            totalAmount: newSub + newGst,
                            contractValue: `₹${newSub.toLocaleString('en-IN')}`
                          });
                          showToast('Deliverable line item added', 'success');
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Deliverable</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {selectedProposal.lineItems.map((li, idx) => (
                        <div
                          key={li.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <input
                              type="text"
                              value={li.description}
                              onChange={(e) => {
                                const updated = [...selectedProposal.lineItems];
                                updated[idx].description = e.target.value;
                                setSelectedProposal({ ...selectedProposal, lineItems: updated });
                              }}
                              className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-200 outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono text-[10px] text-slate-400">SAC {li.sacCode}</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              ₹{li.amount.toLocaleString('en-IN')}
                            </span>
                            {selectedProposal.lineItems.length > 1 && (
                              <button
                                onClick={() => {
                                  const updated = selectedProposal.lineItems.filter((_, i) => i !== idx);
                                  const newSub = updated.reduce((a, b) => a + b.amount, 0);
                                  const newGst = Math.round((newSub * 18) / 100);
                                  setSelectedProposal({
                                    ...selectedProposal,
                                    lineItems: updated,
                                    subtotal: newSub,
                                    gstAmount: newGst,
                                    totalAmount: newSub + newGst,
                                    contractValue: `₹${newSub.toLocaleString('en-IN')}`
                                  });
                                }}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Commercial Summary Banner */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">TOTAL INVESTMENT</div>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        ₹{selectedProposal.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Subtotal ₹{selectedProposal.subtotal.toLocaleString('en-IN')} + 18% GST (₹{selectedProposal.gstAmount.toLocaleString('en-IN')})
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                        Rule 46 Compliant
                      </span>
                      <div className="text-[10px] text-slate-400">Billing: {selectedProposal.contractType}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Properties Column */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4 text-xs">
                  <div className="font-bold text-xs text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                    Proposal Controls
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Client Account</label>
                      <input
                        type="text"
                        value={selectedProposal.clientName}
                        onChange={(e) => setSelectedProposal({ ...selectedProposal, clientName: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Primary Contact</label>
                      <input
                        type="text"
                        value={selectedProposal.contactPerson}
                        onChange={(e) => setSelectedProposal({ ...selectedProposal, contactPerson: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Proposal Validity Date</label>
                      <input
                        type="date"
                        value={selectedProposal.validUntil}
                        onChange={(e) => setSelectedProposal({ ...selectedProposal, validUntil: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        TAXATION &amp; COMPLIANCE
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">CBIC SAC Code:</span>
                        <span className="font-mono font-bold text-emerald-600">998361</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">GST Rate:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">18% (9% CGST + 9% SGST)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Legal Jurisdiction:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">Bengaluru, Karnataka</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <button
                        onClick={() => handleConvertToInvoice(selectedProposal)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Convert to Tax Invoice</span>
                      </button>

                      <button
                        onClick={() => setShowSwitchPackageModal(true)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5 text-amber-500" />
                        <span>Switch Applied Package</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: DOCUMENT PREVIEW (HIGH-FIDELITY CLIENT SOW)                    */}
          {/* ===================================================================== */}
          {activeDetailTab === '2. Document Preview' && (
            <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-8 text-xs">
              {/* Header Cover Banner */}
              <div className="p-6 rounded-xl bg-[#0A1628] text-white flex items-center justify-between">
                <div>
                  <div className="text-rose-400 font-bold uppercase text-[10px] tracking-wider">
                    OPTIVIR COMMERCIAL STATEMENT OF WORK
                  </div>
                  <h2 className="text-2xl font-black mt-1 text-white">{selectedProposal.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">Contract Identifier: {selectedProposal.code}</p>
                </div>
                <div className="text-right">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center justify-center ml-auto">
                    OV
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Authoritative SOW</span>
                </div>
              </div>

              {/* Client & Commercial Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PREPARED FOR</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{selectedProposal.clientName}</div>
                  <div className="text-xs text-slate-500">{selectedProposal.contactPerson}</div>
                  <div className="text-xs text-slate-500">{selectedProposal.contactEmail}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">COMMERCIAL INVESTMENT</span>
                  <div className="font-bold text-sm text-rose-600 mt-0.5">
                    ₹{selectedProposal.totalAmount.toLocaleString('en-IN')} (incl. 18% GST)
                  </div>
                  <div className="text-xs text-slate-500">Service Category: CBIC SAC 998361</div>
                  <div className="text-xs text-slate-500">Contract Type: {selectedProposal.contractType}</div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-1">
                  1. Executive Summary &amp; Engagement Objectives
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {selectedProposal.executiveSummary}
                </p>
              </div>

              {/* Deliverables Matrix */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-1">
                  2. Detailed Scope of Services &amp; Deliverables
                </h3>
                <table className="w-full text-left border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">ITEM DESCRIPTION</th>
                      <th className="p-2.5">SAC CODE</th>
                      <th className="p-2.5 text-right">FEE (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedProposal.lineItems.map((li, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium">{li.description}</td>
                        <td className="p-2.5 font-mono text-emerald-600">{li.sacCode}</td>
                        <td className="p-2.5 text-right font-bold">₹{li.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold">
                      <td colSpan={2} className="p-2.5 text-right">Subtotal:</td>
                      <td className="p-2.5 text-right">₹{selectedProposal.subtotal.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold text-slate-600">
                      <td colSpan={2} className="p-2.5 text-right">Goods &amp; Services Tax (18% GST):</td>
                      <td className="p-2.5 text-right text-emerald-600">₹{selectedProposal.gstAmount.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="bg-rose-50/50 dark:bg-rose-950/20 font-black text-rose-600 text-sm">
                      <td colSpan={2} className="p-3 text-right">Total Contract Value:</td>
                      <td className="p-3 text-right">₹{selectedProposal.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Service Level Agreement */}
              <div className="space-y-1.5 p-3.5 bg-rose-50/40 dark:bg-rose-950/20 border-l-3 border-[#DC2626] rounded-xl">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-rose-600" />
                  <span>3. Service Level Assurance (SLA Target)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {selectedProposal.slaAssurance}
                </p>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-6">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">For OptiVir CRM Technologies</div>
                  <div className="h-12 border-b border-dashed border-slate-300 dark:border-slate-700 flex items-end pb-1 font-serif italic text-sm text-slate-700 dark:text-slate-300">
                    OptiVir Executive Authority
                  </div>
                  <div className="text-[10px] text-slate-500">Authorized Signatory • Bengaluru</div>
                </div>

                <div className="space-y-6">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">For {selectedProposal.clientName}</div>
                  <div className="h-12 border-b border-dashed border-slate-300 dark:border-slate-700 flex items-end pb-1 font-serif italic text-sm text-slate-700 dark:text-slate-300">
                    {selectedProposal.status === 'Accepted' ? selectedProposal.contactPerson : 'Awaiting Digital E-Signature...'}
                  </div>
                  <div className="text-[10px] text-slate-500">Client Authorized Signatory</div>
                </div>
              </div>

              {/* Bottom Print / Download Bar */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border rounded-lg hover:bg-slate-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Preview</span>
                </button>
                <button
                  onClick={() => downloadClientPdf('proposal', {
                    number: selectedProposal.code,
                    title: selectedProposal.name,
                    client: selectedProposal.clientName,
                    amount: selectedProposal.contractValue || `₹${selectedProposal.subtotal?.toLocaleString('en-IN')}`,
                    packageName: selectedProposal.packageName || 'Growth SOW',
                    sacCode: selectedProposal.sacCode || '998361'
                  })}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Client Vector PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: PRICING & COMMERCIALS ENGINE                                   */}
          {/* ===================================================================== */}
          {activeDetailTab === '3. Pricing Engine' && (
            <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-6 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Commercials &amp; Tax Calculation Engine
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Configure line items, billable quantities, and CBIC SAC 998361 tax rate breakdown.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newItem: ProposalLineItem = {
                      id: `li-${Date.now()}`,
                      description: 'Custom Service Scope Line Item',
                      sacCode: '998361',
                      quantity: 1,
                      unitPrice: 20000,
                      amount: 20000
                    };
                    const updated = [...selectedProposal.lineItems, newItem];
                    const newSub = updated.reduce((a, b) => a + b.amount, 0);
                    const newGst = Math.round((newSub * 18) / 100);
                    setSelectedProposal({
                      ...selectedProposal,
                      lineItems: updated,
                      subtotal: newSub,
                      gstAmount: newGst,
                      totalAmount: newSub + newGst,
                      contractValue: `₹${newSub.toLocaleString('en-IN')}`
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              {/* Line Items Editable Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 uppercase font-bold text-[10px] text-slate-500">
                    <tr>
                      <th className="p-3">SCOPE ITEM DESCRIPTION</th>
                      <th className="p-3 w-28">SAC CODE</th>
                      <th className="p-3 w-20">QTY</th>
                      <th className="p-3 w-32">RATE (₹)</th>
                      <th className="p-3 w-32 text-right">AMOUNT (₹)</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedProposal.lineItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...selectedProposal.lineItems];
                              updated[idx].description = e.target.value;
                              setSelectedProposal({ ...selectedProposal, lineItems: updated });
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800/60 border rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="p-3 font-mono">
                          <input
                            type="text"
                            value={item.sacCode}
                            onChange={(e) => {
                              const updated = [...selectedProposal.lineItems];
                              updated[idx].sacCode = e.target.value;
                              setSelectedProposal({ ...selectedProposal, lineItems: updated });
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800/60 border rounded px-2 py-1 text-xs font-mono font-bold text-emerald-600"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = Math.max(1, Number(e.target.value) || 1);
                              const updated = [...selectedProposal.lineItems];
                              updated[idx].quantity = qty;
                              updated[idx].amount = qty * updated[idx].unitPrice;
                              const newSub = updated.reduce((a, b) => a + b.amount, 0);
                              const newGst = Math.round((newSub * 18) / 100);
                              setSelectedProposal({
                                ...selectedProposal,
                                lineItems: updated,
                                subtotal: newSub,
                                gstAmount: newGst,
                                totalAmount: newSub + newGst,
                                contractValue: `₹${newSub.toLocaleString('en-IN')}`
                              });
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800/60 border rounded px-2 py-1 text-xs text-center"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step={1000}
                            value={item.unitPrice}
                            onChange={(e) => {
                              const price = Number(e.target.value) || 0;
                              const updated = [...selectedProposal.lineItems];
                              updated[idx].unitPrice = price;
                              updated[idx].amount = price * updated[idx].quantity;
                              const newSub = updated.reduce((a, b) => a + b.amount, 0);
                              const newGst = Math.round((newSub * 18) / 100);
                              setSelectedProposal({
                                ...selectedProposal,
                                lineItems: updated,
                                subtotal: newSub,
                                gstAmount: newGst,
                                totalAmount: newSub + newGst,
                                contractValue: `₹${newSub.toLocaleString('en-IN')}`
                              });
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800/60 border rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="p-3 text-right font-bold">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right">
                          {selectedProposal.lineItems.length > 1 && (
                            <button
                              onClick={() => {
                                const updated = selectedProposal.lineItems.filter((_, i) => i !== idx);
                                const newSub = updated.reduce((a, b) => a + b.amount, 0);
                                const newGst = Math.round((newSub * 18) / 100);
                                setSelectedProposal({
                                  ...selectedProposal,
                                  lineItems: updated,
                                  subtotal: newSub,
                                  gstAmount: newGst,
                                  totalAmount: newSub + newGst,
                                  contractValue: `₹${newSub.toLocaleString('en-IN')}`
                                });
                              }}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Commercials Calculation Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm ml-auto space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Net Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{selectedProposal.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (9%):</span>
                  <span className="font-mono text-emerald-600">
                    ₹{Math.round(selectedProposal.gstAmount / 2).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (9%):</span>
                  <span className="font-mono text-emerald-600">
                    ₹{Math.round(selectedProposal.gstAmount / 2).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200 dark:border-slate-700 text-rose-600">
                  <span>Grand Total (INR):</span>
                  <span>₹{selectedProposal.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: PACKAGES CATALOG TAB                                           */}
          {/* ===================================================================== */}
          {activeDetailTab === '4. Packages Catalog' && (
            <div className="max-w-[1700px] mx-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Package Catalog Selection
                  </h3>
                  <p className="text-xs text-slate-500">
                    Current proposal is based on: <strong>{selectedProposal.packageName || 'Custom Package'}</strong>
                  </p>
                </div>
                <button
                  onClick={openAddPackageModal}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Package</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-5 rounded-2xl border transition ${
                      selectedProposal.packageId === pkg.id
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-500 ring-2 ring-rose-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">{pkg.category}</span>
                      <div className="flex items-center gap-1.5">
                        {selectedProposal.packageId === pkg.id && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold">
                            Active on this SOW
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditPackageModal(pkg)}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Edit Package Specifications"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{pkg.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{pkg.tagline}</p>
                    <div className="text-lg font-black text-rose-600 mt-2">
                      ₹{pkg.monthlyFee.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">/ {pkg.billingType}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleSwitchPackage(pkg)}
                        className="flex-1 py-2 px-3 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-rose-600 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Apply this Package to SOW
                      </button>
                      <button
                        onClick={() => openEditPackageModal(pkg)}
                        className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs flex items-center gap-1 transition cursor-pointer"
                        title="Edit Package Details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: VERSION TREE                                                   */}
          {/* ===================================================================== */}
          {activeDetailTab === '5. Version Tree' && (
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">
                Version History &amp; Revision Log
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/40">
                  <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-300">
                    <span>v2.1 (Current Revision)</span>
                    <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded">Active</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    Applied {selectedProposal.packageName || 'Standard SOW'} package deliverables. Validated CBIC SAC 998361 (18% GST).
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">Edited just now by OptiVir Admin</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>v1.0 (Initial Proposal Draft)</span>
                    <span className="text-[10px] text-slate-400">Baseline</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Created initial proposal shell for {selectedProposal.clientName}.
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">Created {selectedProposal.createdDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE PROPOSAL (WITH PACKAGE SELECTOR)                            */}
      {/* ========================================================================= */}
      {showCreateProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Commercial Proposal</h3>
                  <p className="text-xs text-slate-500">Generate a proposal automatically based on a selected package.</p>
                </div>
              </div>
              <button onClick={() => setShowCreateProposalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block">Select Base Agency Package *</label>
                  <button
                    type="button"
                    onClick={() => setShowAddPackageModal(true)}
                    className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add New Package</span>
                  </button>
                </div>
                <select
                  value={newPropSelectedPkgId}
                  onChange={(e) => setNewPropSelectedPkgId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:border-rose-500"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — ₹{pkg.monthlyFee.toLocaleString('en-IN')} / {pkg.billingType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Package Preview Card */}
              {(() => {
                const chosen = packages.find(p => p.id === newPropSelectedPkgId) || packages[0];
                return (
                  <div className="p-3 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-300">
                      <span>{chosen.name}</span>
                      <span>₹{chosen.monthlyFee.toLocaleString('en-IN')} (SAC {chosen.sacCode || '998361'})</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{chosen.tagline}</p>
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 pt-1">
                      Includes {chosen.scopeItems.length} deliverables: {chosen.scopeItems.slice(0, 2).join(', ')}...
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Client Organization *</label>
                  <input
                    type="text"
                    value={newPropClient}
                    onChange={(e) => setNewPropClient(e.target.value)}
                    placeholder="e.g. Zenith DTC Brands"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Primary Stakeholder Contact</label>
                  <input
                    type="text"
                    value={newPropContact}
                    onChange={(e) => setNewPropContact(e.target.value)}
                    placeholder="e.g. Arjun Mehta (VP Marketing)"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowCreateProposalModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const chosen = packages.find(p => p.id === newPropSelectedPkgId) || packages[0];
                  setShowCreateProposalModal(false);
                  handleGenerateProposalFromPackage(chosen, newPropClient, newPropContact);
                }}
                className="px-5 py-2 text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
              >
                ⚡ Generate Proposal Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM AGENCY PACKAGE                                          */}
      {/* ========================================================================= */}
      {showAddPackageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${editingPkgId ? 'bg-rose-600' : 'bg-amber-500'} text-white flex items-center justify-center font-bold text-xs`}>
                  {editingPkgId ? <Edit3 className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {editingPkgId ? 'Edit Agency Package' : '+ Add Agency Package'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingPkgId ? 'Update pricing, deliverables, SAC code, and SLA commitments.' : 'Define a new standardized package in your agency vault.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddPackageModal(false);
                  setEditingPkgId(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewPackage} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={newPkgName}
                  onChange={(e) => setNewPkgName(e.target.value)}
                  placeholder="e.g. Headless E-Commerce CRO & Speed Sprint"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={newPkgTagline}
                  onChange={(e) => setNewPkgTagline(e.target.value)}
                  placeholder="e.g. Enterprise Tier • Full Funnel Conversion Lift"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newPkgCategory}
                    onChange={(e) => setNewPkgCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="Performance Marketing">Performance Marketing</option>
                    <option value="Technical Tracking">Technical Tracking</option>
                    <option value="Creative Studio">Creative Studio</option>
                    <option value="Omni-Channel">Omni-Channel</option>
                    <option value="SEO & Content">SEO & Content</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Billing Cycle</label>
                  <select
                    value={newPkgBilling}
                    onChange={(e) => setNewPkgBilling(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="Monthly Retainer">Monthly Retainer</option>
                    <option value="Quarterly Retainer">Quarterly Retainer</option>
                    <option value="One-Time Project">One-Time Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Base Price / Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    step={5000}
                    value={newPkgFee}
                    onChange={(e) => setNewPkgFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold text-rose-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">CBIC SAC Code (18% GST)</label>
                  <input
                    type="text"
                    value={newPkgSac}
                    onChange={(e) => setNewPkgSac(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Deliverables Checklist (1 item per line) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newPkgScopes}
                  onChange={(e) => setNewPkgScopes(e.target.value)}
                  placeholder="Meta Ads Advantage+ management&#10;Google PMax asset optimization&#10;Weekly creative video iteration"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Service Level Agreement (SLA)</label>
                <input
                  type="text"
                  value={newPkgSla}
                  onChange={(e) => setNewPkgSla(e.target.value)}
                  placeholder="e.g. 48h turnaround on revisions, 99.9% uptime"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPackageModal(false);
                    setEditingPkgId(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                >
                  {editingPkgId ? 'Save Package Changes' : 'Save Package to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SWITCH APPLIED PACKAGE ON ACTIVE PROPOSAL                          */}
      {/* ========================================================================= */}
      {showSwitchPackageModal && selectedProposal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Switch Package for this Proposal</h3>
              </div>
              <button onClick={() => setShowSwitchPackageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Selecting a new package will update this proposal’s deliverables checklist, billing fee, and SAC code to match the package.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleSwitchPackage(pkg)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                    selectedProposal.packageId === pkg.id
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-1 ring-rose-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{pkg.name}</div>
                    <div className="text-[10px] text-slate-500">{pkg.tagline}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xs text-rose-600">₹{pkg.monthlyFee.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-400">{pkg.billingType}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSwitchPackageModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
