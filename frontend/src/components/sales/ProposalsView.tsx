'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';
import { api } from '@/lib/api';
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
  brandName?: string;
  targetRegion?: string;
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
  salutationIntro?: string;
  month1Goal?: string;
  month3Goal?: string;
  planIntro?: string;
  planBullets?: string[];
  scopeIntro?: string;
  includedScope?: string[];
  excludedScope?: string[];
  metaAdSpendText?: string;
  investmentNote?: string;
  paymentSchedule?: { milestone: string; amount: string; due: string }[];
  upiId?: string;
  bankDetails?: string;
  engagementTerms?: string[];
  timelineBullets?: string[];
  nextStepText?: string;
  startDateText?: string;
  signerName?: string;
  signerRole?: string;
  signerPhone?: string;
  signerEmail?: string;
  signerWebsite?: string;
}

const DEFAULT_PLAN_INTRO = "You're not starting from zero — past traction proves the product works. The focus is visibility, high-converting creative messaging, and a consistent lead flow into direct communication channels. The growth roadmap:";

const DEFAULT_PLAN_BULLETS = [
  '5-8 reels/month — process, purity & craft story, product usage, and real customer reviews, tuned to peak audience engagement. Reel script and creative direction provided.',
  'Meta ads built on top-performing creative angles, targeted to Kerala health-conscious buyers, with product variants tested separately to maximize conversions',
  'Direct messaging conversion funnel — every ad and reel routes to dedicated WhatsApp/DM channels with structured response templates, so no lead sits unanswered',
  'Weekly Monday report: reach, leads generated, and feedback conversion data — so we optimize on real performance metrics, not guesses'
];

const DEFAULT_SCOPE_INTRO = 'Keeping scope clear upfront ensures full transparency and aligned expectations:';

const DEFAULT_INCLUDED_SCOPE = [
  'Full content strategy, reel scripting & video editing, Meta ad setup & optimization',
  'Direct funnel workflow to WhatsApp / DM channels with response templates',
  'Weekly telemetry reporting & performance reviews',
  'Up to 2 revision rounds per creative asset'
];

const DEFAULT_EXCLUDED_SCOPE = [
  'On-site videography shoots (client provides raw footage/photos)',
  'Meta media ad spend (billed directly by Meta to client ad account)',
  'Third-party influencer sponsorship fees & commissions',
  'Custom website redevelopment or complex backend integrations'
];

const DEFAULT_TIMELINE_BULLETS = [
  'Week 1: Content calendar, first reels, WhatsApp funnel + ad account setup',
  'Week 2-3: Ads live, daily posting, lead flow into WhatsApp, mid-point optimization',
  'Week 4: Full report + clear go/no-go recommendation for Month 2 scale-up the selling volume'
];

const DEFAULT_INVESTMENT_NOTE = "We start ad spend at ₹12,000 in Week 1. Based on real performance data by Day 10, we'll recommend whether to hold or scale to ₹15,000 for Weeks 3-4 — you approve any increase before it happens. This fits inside your ₹25,000-30,000 budget, and ad spend stays in your Meta account, fully visible and in your control at all times. Management fee includes all applicable taxes (inclusive of GST).";

const DEFAULT_ENGAGEMENT_TERMS = [
  '40% advance to begin content calendar and ad account setup',
  '30% on day 15, once first batch of content and ads are live',
  '30% on day 30, on delivery of the final report',
  'Ad spend billed separately, paid directly to Meta by you',
  'All reels and ad creatives become your property once fully paid; raw/unused drafts stay with us',
  'This is a 1-month engagement. Either side can choose not to continue after Month 1 with no further obligation',
  "If either side needs to exit mid-month, 7 days' written notice on WhatsApp/email is enough — work is billed pro-rata for days completed, rest refunded",
  'No fixed sale number is guaranteed — marketing drives reach and lead volume; final sales also depend on price, stock, delivery, and closing speed',
  'Management fee includes all applicable taxes (inclusive of GST)'
];

const DEFAULT_NEXT_STEP = "If this works for you, reply 'yes' and send the advance — we'll have the content calendar with you within 24 hours.";
const DEFAULT_START_DATE = "Work begins within 24 hours of advance payment. First content calendar shared in 24 hours.";

// 1. Pre-configured OptiVir Agency Packages (Clean Retainer Fees, No Arbitrary GST)
const DEFAULT_PACKAGES: AgencyPackage[] = [
  {
    id: 'pkg-social-mgmt',
    name: 'Social Media Management & Performance',
    tagline: 'Content Engine • Reels, Static Posts & Targeted Meta Ad Execution',
    category: 'Performance Marketing',
    monthlyFee: 20000,
    billingType: 'Monthly Retainer',
    sacCode: '998361',
    scopeItems: [
      'Weekly high-impact creative posters & branded visual content',
      'Video reel conceptualization, scripts, hooks & professional editing',
      'Targeted ad campaign setup, localized targeting & A/B creative testing',
      'Engaging direct-response ad copy, captions & call-to-actions',
      'Continuous KPI tracking, lead response metrics & bi-weekly reporting'
    ],
    sla: '24h emergency turnaround, 48h new creative iteration',
    recommendedFor: 'Growing brands looking to scale consistent social media presence and high-intent customer inquiries',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    accentText: 'text-emerald-600 dark:text-emerald-400'
  },
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
  },
  {
    id: 'pkg-social-posters',
    name: 'Social Media Posters & Brand Creatives Suite',
    tagline: 'High-Impact Brand Graphics, Carousel Sequences & Marketing Posters',
    category: 'Creative Studio',
    monthlyFee: 65000,
    billingType: 'Monthly Retainer',
    sacCode: '998361',
    scopeItems: [
      'High-converting social media posters & announcement creatives (Instagram, LinkedIn, X, Facebook)',
      'Multi-format export: 1:1 Feed Posts, 9:16 Story/Reels Covers, 16:9 Banner Formats',
      'Promotional launch creatives, educational carousel decks & seasonal festival posters',
      'Brand style consistency, custom typography hierarchy, color harmony & vector assets',
      'Full source files (Figma/PSD) with fast revision turnarounds within 24-48 hours'
    ],
    sla: '24h-48h turnaround per batch, 2 rounds of rapid revisions included',
    recommendedFor: 'Brands looking to establish premium visual consistency and high audience engagement across channels',
    accentBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40',
    accentText: 'text-rose-600 dark:text-rose-400'
  },
  {
    id: 'pkg-video-editing',
    name: 'Video Editing & High-Impact Reels Suite',
    tagline: 'Dynamic Short-Form Video Editing, Motion Hooks & Sound Design',
    category: 'Creative Studio',
    monthlyFee: 85000,
    billingType: 'Monthly Retainer',
    sacCode: '998361',
    scopeItems: [
      'Professional vertical video editing for Reels, YouTube Shorts, and TikTok (15s to 60s)',
      'Attention-grabbing visual hooks in first 3s with dynamic animated captions & kinetic typography',
      'Cinematic color grading, sound design, trending music sync & punchy jump cuts',
      'Long-form podcast/interview content repurposing into viral short-form micro-content',
      'High-definition exports optimized for mobile ad performance and organic algorithmic reach'
    ],
    sla: '48h delivery per reel deliverable, 2 rounds of creative revisions',
    recommendedFor: 'Creators and businesses wanting to scale short-form video reach and direct response ad conversions',
    accentBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/40',
    accentText: 'text-purple-600 dark:text-purple-400'
  }
];

// Initial Proposals - Clean empty state, populated from PostgreSQL
const INITIAL_PROPOSALS: ProposalItem[] = [];

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

  // Proposals State (Loaded live from PostgreSQL)
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalItem | null>(null);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  const [showDocumentReviewModal, setShowDocumentReviewModal] = useState(false);
  const [reviewDocType, setReviewDocType] = useState<'proposal' | 'agreement'>('proposal');

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
  const [newPropClient, setNewPropClient] = useState('');
  const [newPropContact, setNewPropContact] = useState('');
  const [newPropSelectedPkgId, setNewPropSelectedPkgId] = useState(packages[0]?.id || 'pkg-perf-growth');
  const [newPropCustomTitle, setNewPropCustomTitle] = useState('');

  // Sync packages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('optivir_packages', JSON.stringify(packages));
    } catch (e) { }
  }, [packages]);

  // Load real Proposals and Clients from PostgreSQL
  const loadProposalsData = async () => {
    try {
      setIsLoading(true);
      const [propsRes, clientsRes, leadsRes, companiesRes] = await Promise.all([
        api.getProposals().catch(() => ({ success: false, data: [] })),
        api.getClients().catch(() => ({ success: false, data: [] })),
        api.getLeads().catch(() => ({ success: false, data: [] })),
        api.getCompanies().catch(() => ({ success: false, data: [] }))
      ]);

      const allClients: Array<{ id: string; name: string; contactPerson: string; contactEmail: string; source: string }> = [];

      // 1. From Clients
      if (clientsRes?.data && Array.isArray(clientsRes.data)) {
        clientsRes.data.forEach((c: any) => {
          const compName = c.company_name || c.name || c.client_name;
          const contact = [c.contact_first, c.contact_last].filter(Boolean).join(' ') || c.contact_person || c.contact_name || '';
          if (compName && !allClients.some(existing => existing.name.toLowerCase() === compName.toLowerCase())) {
            allClients.push({
              id: c.id || `client-${compName}`,
              name: compName,
              contactPerson: contact,
              contactEmail: c.contact_email || c.email || '',
              source: 'Client'
            });
          }
        });
      }

      // 2. From Leads
      if (leadsRes?.data && Array.isArray(leadsRes.data)) {
        leadsRes.data.forEach((l: any) => {
          const compName = l.company_name || `${l.first_name || ''} ${l.last_name || ''}`.trim();
          const contact = `${l.first_name || ''} ${l.last_name || ''}`.trim();
          if (compName && !allClients.some(existing => existing.name.toLowerCase() === compName.toLowerCase())) {
            allClients.push({
              id: l.id || `lead-${compName}`,
              name: compName,
              contactPerson: contact,
              contactEmail: l.email || '',
              source: 'Lead'
            });
          }
        });
      }

      // 3. From Companies
      if (companiesRes?.data && Array.isArray(companiesRes.data)) {
        companiesRes.data.forEach((comp: any) => {
          const compName = comp.name || comp.company_name;
          if (compName && !allClients.some(existing => existing.name.toLowerCase() === compName.toLowerCase())) {
            allClients.push({
              id: comp.id || `comp-${compName}`,
              name: compName,
              contactPerson: comp.primary_contact || '',
              contactEmail: comp.email || '',
              source: 'Company'
            });
          }
        });
      }


      setClientsList(allClients);

      if (propsRes?.data && Array.isArray(propsRes.data)) {
        const mapped: ProposalItem[] = propsRes.data.map((p: any) => {
          const content = typeof p.content === 'object' && p.content !== null ? p.content : {};
          return {
            id: p.id,
            code: p.proposal_number || `PROP-${p.id.slice(0, 6)}`,
            name: p.title || 'Commercial SOW',
            packageId: content.packageId || p.package_id || 'pkg-custom',
            packageName: content.packageName || p.package_name || 'Standard Agency Package',
            clientName: p.company_name || p.client_name || content.clientName || 'Client Organization',
            contactPerson: content.contactPerson || p.contact_person || '',
            contactEmail: content.contactEmail || p.contact_email || '',
            opportunityName: content.opportunityName || '',
            ownerName: 'OptiVir Admin',
            ownerInitials: 'OP',
            ownerBg: 'bg-[#DC2626]',
            contractValue: `₹${Number(p.total_amount || 0).toLocaleString('en-IN')}`,
            subtotal: Number(content.subtotal || p.total_amount || 0),
            gstRate: content.gstRate ?? 18,
            gstAmount: Number(content.gstAmount || Math.round((Number(p.total_amount || 0) * 18) / 118)),
            totalAmount: Number(p.total_amount || 0),
            contractType: content.contractType || 'Monthly Retainer',
            slaTag: content.slaTag || '48h SLA',
            sacCode: content.sacCode || '998361',
            version: p.version || 'v1.0 Draft',
            status: (['Draft', 'Sent', 'Viewed', 'Negotiation', 'Accepted', 'Rejected'].includes(p.status) ? p.status : 'Draft') as any,
            createdDate: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            validUntil: p.valid_until ? p.valid_until.split('T')[0] : '',
            lineItems: Array.isArray(content.lineItems) ? content.lineItems : [],
            executiveSummary: content.executiveSummary || '',
            solutionArchitecture: content.solutionArchitecture || '',
            slaAssurance: content.slaAssurance || ''
          };
        });
        setProposals(mapped);
        if (mapped.length > 0) {
          setSelectedProposal(mapped[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposalsData();
  }, []);

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
  const handleGenerateProposalFromPackage = async (pkg: AgencyPackage, customClientName?: string, customContactName?: string) => {
    const code = `PROP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const client = (customClientName || newPropClient || 'Client Organization').trim();
    const contact = (customContactName || newPropContact || 'Commercial Stakeholder').trim();
    const totalAmount = pkg.monthlyFee;
    const subtotal = Math.round(totalAmount / 1.18);
    const gstRate = 18;
    const gstAmount = totalAmount - subtotal;

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

    const proposalTitle = newPropCustomTitle.trim() || `${pkg.name} — ${client} SOW`;

    const contentPayload = {
      packageId: pkg.id,
      packageName: pkg.name,
      contactPerson: contact,
      contactEmail: `${contact.split(' ')[0].toLowerCase()}@${client.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      contractType: pkg.billingType,
      slaTag: pkg.sla,
      sacCode: pkg.sacCode || '998361',
      subtotal: subtotal,
      gstRate: 18,
      gstAmount: gstAmount,
      totalAmount: totalAmount,
      lineItems: lineItems,
      executiveSummary: `OptiVir CRM Solutions presents this commercial Statement of Work (SOW) to ${client}. Configured under our specialized "${pkg.name}" offering, this engagement establishes structured marketing operations, consistent creative output, and performance accountability.`,
      solutionArchitecture: `Delivery is structured across ${pkg.scopeItems.length} core workstreams: ${pkg.scopeItems.join('; ')}. All deliverables are managed under our dedicated performance workflow.`,
      slaAssurance: pkg.sla
    };

    try {
      const res = await api.createProposal({
        title: proposalTitle,
        proposal_number: code,
        client_name: client,
        total_amount: totalAmount,
        status: 'Draft',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        content: contentPayload
      });

      const serverId = res?.data?.id || code.toLowerCase();

      const newProposal: ProposalItem = {
        id: serverId,
        code: res?.data?.proposal_number || code,
        name: proposalTitle,
        packageId: pkg.id,
        packageName: pkg.name,
        clientName: client,
        contactPerson: contact,
        contactEmail: contentPayload.contactEmail,
        opportunityName: `${client} — ${pkg.category} SOW`,
        ownerName: 'OptiVir Admin',
        ownerInitials: 'OP',
        ownerBg: 'bg-[#DC2626]',
        contractValue: `₹${totalAmount.toLocaleString('en-IN')}`,
        subtotal: subtotal,
        gstRate: 18,
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
        executiveSummary: contentPayload.executiveSummary,
        solutionArchitecture: contentPayload.solutionArchitecture,
        slaAssurance: contentPayload.slaAssurance
      };

      setProposals(prev => [newProposal, ...prev.filter(p => p.id !== newProposal.id)]);
      setSelectedProposal(newProposal);
      setCurrentView('detail');
      setActiveDetailTab('1. 3-Column Workspace');
      setShowCreateProposalModal(false);
      showToast(`Generated & saved proposal ${code} to database!`, 'success');
    } catch (err: any) {
      console.error('Failed to create proposal in database:', err);
      showToast('Error saving proposal to database', 'error');
    }
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
        setSelectedProposal(prev => prev ? ({
          ...prev,
          packageName: newPkgName.trim(),
          sacCode: newPkgSac.trim() || '998361',
        }) : null);
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
    const totalAmount = pkg.monthlyFee;
    const subtotal = Math.round(totalAmount / 1.18);
    const gstRate = 18;
    const gstAmount = totalAmount - subtotal;

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
      contractValue: `₹${totalAmount.toLocaleString('en-IN')}`,
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
  const handleUpdateStatus = async (proposalId: string, newStatus: ProposalItem['status']) => {
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
    try {
      await api.updateProposal(proposalId, { status: newStatus });
      showToast(`Proposal status updated to "${newStatus}"`, 'success');
    } catch (err) {
      console.error('Failed to update proposal status in DB:', err);
      showToast(`Status updated to "${newStatus}" locally`, 'info');
    }
  };

  // Delete Proposal
  const handleDeleteProposal = async (proposalId: string) => {
    try {
      await api.deleteProposal(proposalId);
    } catch (err) {
      console.error('Failed to delete proposal from DB:', err);
    }
    setProposals(prev => prev.filter(p => p.id !== proposalId));
    if (selectedProposal?.id === proposalId) {
      const remaining = proposals.filter(p => p.id !== proposalId);
      if (remaining.length > 0) {
        setSelectedProposal(remaining[0]);
      } else {
        setSelectedProposal(null);
      }
      setCurrentView('list');
    }
    showToast('Proposal deleted successfully', 'info');
  };

  // Convert to Tax Invoice & Route to Finance
  const handleConvertToInvoice = (prop: ProposalItem) => {
    if (onNavigateToInvoice) {
      onNavigateToInvoice({
        clientName: prop.clientName,
        invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        amount: prop.totalAmount || prop.subtotal,
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
      {/* TOP NAVIGATION BAR                                                        */}
      {/* ========================================================================= */}
      <div className="bg-[#0A1628] text-white px-6 py-2 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[#102038] p-0.5 rounded-md border border-[#1A2E4E] flex-wrap">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                currentView === 'list'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Proposals Directory ({proposals.length})
            </button>
            <button
              onClick={() => {
                if (!selectedProposal && proposals.length > 0) setSelectedProposal(proposals[0]);
                setCurrentView('detail');
              }}
              className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                currentView === 'detail'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Proposal Workspace &amp; Editor
            </button>
            <button
              onClick={() => setCurrentView('packages')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'packages'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Agency Packages Vault ({packages.length})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SAC 998361 (18% GST Compliant)</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline">SOW Engine</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: PROPOSALS DIRECTORY LIST                                         */}
      {/* ========================================================================= */}
      {currentView === 'list' && (
        <div className="w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
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
                      brand: selectedProposal.clientName,
                      amount: selectedProposal.contractValue || `₹${selectedProposal.subtotal?.toLocaleString('en-IN')}`,
                      management_fee: `₹${(selectedProposal.subtotal || 25000).toLocaleString('en-IN')}`,
                      packageName: selectedProposal.packageName || 'Growth SOW',
                      valid_until: selectedProposal.validUntil
                    });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 shadow-xs transition cursor-pointer"
                title="Download 2-Page Model Proposal PDF"
              >
                <Download className="w-3.5 h-3.5 text-[#1E442B]" />
                <span>Proposal PDF</span>
              </button>

              <button
                onClick={() => {
                  if (selectedProposal) {
                    downloadClientPdf('agreement', {
                      number: selectedProposal.code,
                      title: selectedProposal.name,
                      client: selectedProposal.clientName,
                      brand: selectedProposal.clientName,
                      contact_person: selectedProposal.contactPerson,
                      management_fee: `₹${(selectedProposal.subtotal || 25000).toLocaleString('en-IN')}`,
                      meta_ad_spend: '₹12,000 to ₹14,000',
                      total_investment: `₹${((selectedProposal.subtotal || 25000) + 12000).toLocaleString('en-IN')}`,
                      advance_amount: `₹${Math.round((selectedProposal.subtotal || 25000) * 0.4).toLocaleString('en-IN')}`,
                      milestone2_amount: `₹${Math.round((selectedProposal.subtotal || 25000) * 0.3).toLocaleString('en-IN')}`,
                      milestone3_amount: `₹${Math.round((selectedProposal.subtotal || 25000) * 0.3).toLocaleString('en-IN')}`
                    });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 shadow-xs transition cursor-pointer"
                title="Download 2-Page Confirmation of Engagement Agreement PDF"
              >
                <FileText className="w-3.5 h-3.5 text-[#1E442B]" />
                <span>Agreement PDF</span>
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
                            <div className="text-[10px] text-emerald-600 font-medium">
                              Retainer (Includes GST)
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
                                setReviewDocType('proposal');
                                setShowDocumentReviewModal(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition"
                              title="Review Document (Live Preview)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

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
                                brand: p.clientName,
                                amount: p.contractValue || `₹${p.subtotal?.toLocaleString('en-IN')}`,
                                management_fee: `₹${(p.subtotal || 25000).toLocaleString('en-IN')}`,
                                packageName: p.packageName || 'Growth SOW',
                                valid_until: p.validUntil
                              })}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#1E442B] transition"
                              title="Download Proposal PDF (Model Format)"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => downloadClientPdf('agreement', {
                                number: p.code,
                                title: p.name,
                                client: p.clientName,
                                brand: p.clientName,
                                contact_person: p.contactPerson,
                                management_fee: `₹${(p.subtotal || 25000).toLocaleString('en-IN')}`,
                                meta_ad_spend: '₹12,000 to ₹14,000',
                                total_investment: `₹${((p.subtotal || 25000) + 12000).toLocaleString('en-IN')}`,
                                advance_amount: `₹${Math.round((p.subtotal || 25000) * 0.4).toLocaleString('en-IN')}`,
                                milestone2_amount: `₹${Math.round((p.subtotal || 25000) * 0.3).toLocaleString('en-IN')}`,
                                milestone3_amount: `₹${Math.round((p.subtotal || 25000) * 0.3).toLocaleString('en-IN')}`
                              })}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-700 transition"
                              title="Download Confirmation Agreement PDF (Model Format)"
                            >
                              <FileText className="w-3.5 h-3.5" />
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
        <div className="w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
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
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  onClick={() => {
                    setReviewDocType('proposal');
                    setShowDocumentReviewModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-slate-900 dark:bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-sm border border-slate-700 transition active:scale-95 cursor-pointer"
                  title="View Full Document Review / Live Print Preview"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>Review Document</span>
                </button>

                <button
                  onClick={() => downloadClientPdf('proposal', {
                    number: selectedProposal.code,
                    title: selectedProposal.name,
                    client: selectedProposal.clientName,
                    brand: selectedProposal.clientName,
                    amount: selectedProposal.contractValue || `₹${selectedProposal.subtotal?.toLocaleString('en-IN')}`,
                    management_fee: `₹${(selectedProposal.subtotal || 25000).toLocaleString('en-IN')}`,
                    packageName: selectedProposal.packageName || 'Growth SOW',
                    valid_until: selectedProposal.validUntil
                  })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                  title="Download Model Proposal PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[#1E442B]" />
                  <span>Proposal PDF</span>
                </button>

                <button
                  onClick={() => downloadClientPdf('agreement', {
                    number: selectedProposal.code,
                    title: selectedProposal.name,
                    client: selectedProposal.clientName,
                    brand: selectedProposal.clientName,
                    contact_person: selectedProposal.contactPerson,
                    management_fee: `₹${(selectedProposal.subtotal || 25000).toLocaleString('en-IN')}`,
                    meta_ad_spend: '₹12,000 to ₹14,000',
                    total_investment: `₹${((selectedProposal.subtotal || 25000) + 12000).toLocaleString('en-IN')}`,
                    advance_amount: `₹${Math.round((selectedProposal.subtotal || 25000) * 0.4).toLocaleString('en-IN')}`,
                    milestone2_amount: `₹${Math.round((selectedProposal.subtotal || 25000) * 0.3).toLocaleString('en-IN')}`,
                    milestone3_amount: `₹${Math.round((selectedProposal.subtotal || 25000) * 0.3).toLocaleString('en-IN')}`
                  })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                  title="Download Confirmation of Engagement Agreement PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-[#1E442B]" />
                  <span>Agreement PDF</span>
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
            <div className="w-full flex items-center justify-between gap-4 overflow-x-auto text-xs">
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
                    className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      activeDetailTab === tab
                        ? 'bg-[#0A1628] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab === '2. Document Preview' && <Eye className="w-3 h-3 text-rose-400" />}
                    <span>{tab}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-slate-500 shrink-0 text-xs">
                <span>Contract Total:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  ₹{selectedProposal.totalAmount.toLocaleString('en-IN')}
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
          {/* TAB 1: 3-COLUMN WORKSPACE (FULLY INTERACTIVE MULTI-SECTION EDITOR)    */}
          {/* ===================================================================== */}
          {activeDetailTab === '1. 3-Column Workspace' && (
            <div className="w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Outline Column */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      Document Outline
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {selectedProposal.status === 'Accepted' ? '9 Sections' : '8 Sections'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {[
                      { id: 's1', title: '1. Cover Page & Meta' },
                      { id: 's2', title: '2. Executive Summary & Goals' },
                      { id: 's3', title: '3. The Plan & Roadmaps' },
                      { id: 's4', title: '4. Scopes (Included / Excluded)' },
                      { id: 's5', title: '5. Deliverables & SLA Timeline' },
                      { id: 's6', title: '6. Commercials & Milestones' },
                      { id: 's7', title: '7. Key Engagement Terms' },
                      { id: 's8', title: '8. Digital Signoff & Authority' },
                      ...(selectedProposal.status === 'Accepted'
                        ? [{ id: 's_audit', title: '✓ Post-Acceptance Audit Matrix' }]
                        : [])
                    ].map((sec) => (
                      <div
                        key={sec.id}
                        onClick={() => setActiveSectionId(sec.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                          sec.id === activeSectionId
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border-l-4 border-[#DC2626] shadow-xs'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${sec.id === activeSectionId ? 'text-rose-600' : 'text-emerald-500'}`} />
                          <span className="truncate text-xs">{sec.title}</span>
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
                      <div className="text-[11px] text-slate-500 font-medium">
                        Retainer: ₹{selectedProposal.totalAmount.toLocaleString('en-IN')} (No GST)
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

              {/* Center Canvas Column: Dynamic Active Section Editor */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md space-y-6 text-xs">
                  {/* Header Meta */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    <span className="font-mono">STATEMENT OF WORK • REF {selectedProposal.code}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      EDITING SECTION: {activeSectionId.toUpperCase()}
                    </span>
                  </div>

                  {/* SECTION 1: COVER PAGE & METADATA */}
                  {activeSectionId === 's1' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="border-b pb-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Cover Page &amp; Document Metadata</h3>
                        <p className="text-[11px] text-slate-500">Configure client names, brand identity, region, and document header specifics.</p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Proposal SOW Title</label>
                          <input
                            type="text"
                            value={selectedProposal.name}
                            onChange={(e) => setSelectedProposal({ ...selectedProposal, name: e.target.value })}
                            className="w-full font-bold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-rose-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Client Company Name</label>
                            <input
                              type="text"
                              value={selectedProposal.clientName}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, clientName: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Brand / Product Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Chakkil Aattiya Velichenna"
                              value={selectedProposal.brandName || ''}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, brandName: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Primary Stakeholder / Contact</label>
                            <input
                              type="text"
                              value={selectedProposal.contactPerson}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, contactPerson: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Contact Email</label>
                            <input
                              type="email"
                              value={selectedProposal.contactEmail}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, contactEmail: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Target Market / Region Niche</label>
                            <input
                              type="text"
                              placeholder="e.g. Kerala food &amp; wellness"
                              value={selectedProposal.targetRegion || 'Kerala food & wellness'}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, targetRegion: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Validity Date</label>
                            <input
                              type="date"
                              value={selectedProposal.validUntil}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, validUntil: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: EXECUTIVE SUMMARY & GOALS */}
                  {activeSectionId === 's2' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="border-b pb-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Executive Summary &amp; Goals</h3>
                        <p className="text-[11px] text-slate-500">Personalized salutation narrative, launch targets, and growth roadmap goals.</p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Personalized Intro Narrative (Dear {selectedProposal.contactPerson || 'Client'})</label>
                          <textarea
                            rows={3}
                            value={selectedProposal.executiveSummary || selectedProposal.salutationIntro || `Below is a plan built specifically around what you shared — your stock, your order process, and your ${selectedProposal.targetRegion?.split(' ')[0] || 'Kerala'} launch goal of ${selectedProposal.month1Goal || '250-400L'} in Month 1, scaling toward ${selectedProposal.month3Goal || '2,500L'} by Month 3. This isn't a generic package; it's mapped to where your business already stands, and where marketing needs to pick up.`}
                            onChange={(e) => setSelectedProposal({ ...selectedProposal, executiveSummary: e.target.value, salutationIntro: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 outline-none focus:border-rose-500 leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Month 1 Target (e.g. 250-400L / 60-100 clients)</label>
                            <input
                              type="text"
                              placeholder="250-400L"
                              value={selectedProposal.month1Goal || '250-400L'}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, month1Goal: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Month 3 Target (Scale Goal)</label>
                            <input
                              type="text"
                              placeholder="2,500L"
                              value={selectedProposal.month3Goal || '2,500L'}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, month3Goal: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Strategic Focus &amp; Validation Objective</label>
                          <textarea
                            rows={3}
                            placeholder="This is the validation phase of the 3-month roadmap toward scaling customer volume..."
                            value={selectedProposal.solutionArchitecture}
                            onChange={(e) => setSelectedProposal({ ...selectedProposal, solutionArchitecture: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 outline-none focus:border-rose-500 leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 3: THE PLAN & ROADMAPS */}
                  {activeSectionId === 's3' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. The Plan &amp; Growth Roadmaps</h3>
                          <p className="text-[11px] text-slate-500">Customize the plan introductory paragraph and growth roadmap action points.</p>
                        </div>
                        <button
                          onClick={() => {
                            const current = selectedProposal.planBullets || DEFAULT_PLAN_BULLETS;
                            setSelectedProposal({
                              ...selectedProposal,
                              planBullets: [...current, 'New growth action point — describe reel strategy, Meta ads targeting, or direct funnel workflow.']
                            });
                            showToast('Plan action point added', 'success');
                          }}
                          className="text-xs font-bold text-[#1E442B] hover:underline flex items-center gap-1 cursor-pointer bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Action Point</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Plan Section Introduction</label>
                          <textarea
                            rows={2}
                            value={selectedProposal.planIntro || DEFAULT_PLAN_INTRO}
                            onChange={(e) => setSelectedProposal({ ...selectedProposal, planIntro: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-rose-500 leading-relaxed"
                          />
                        </div>

                        <div className="space-y-2.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Roadmap Action Points (Editable Bullets)</label>
                          {(selectedProposal.planBullets || DEFAULT_PLAN_BULLETS).map((bullet, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="flex items-start gap-2.5 flex-1 pt-0.5">
                                <span className="font-bold text-[#1E442B] text-sm shrink-0">•</span>
                                <textarea
                                  rows={2}
                                  value={bullet}
                                  onChange={(e) => {
                                    const current = [...(selectedProposal.planBullets || DEFAULT_PLAN_BULLETS)];
                                    current[idx] = e.target.value;
                                    setSelectedProposal({ ...selectedProposal, planBullets: current });
                                  }}
                                  className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-200 outline-none text-xs leading-relaxed resize-none"
                                />
                              </div>

                              {(selectedProposal.planBullets || DEFAULT_PLAN_BULLETS).length > 1 && (
                                <button
                                  onClick={() => {
                                    const current = (selectedProposal.planBullets || DEFAULT_PLAN_BULLETS).filter((_, i) => i !== idx);
                                    setSelectedProposal({ ...selectedProposal, planBullets: current });
                                  }}
                                  className="text-slate-400 hover:text-rose-600 cursor-pointer p-1 shrink-0"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 4: SCOPES (WHAT'S INCLUDED / EXCLUDED) */}
                  {activeSectionId === 's4' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="border-b pb-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">4. Scope of Work — Inclusions &amp; Exclusions</h3>
                        <p className="text-[11px] text-slate-500">Edit scope introduction, included items, and clearly defined excluded items.</p>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Scope Intro Header Note</label>
                        <input
                          type="text"
                          value={selectedProposal.scopeIntro || DEFAULT_SCOPE_INTRO}
                          onChange={(e) => setSelectedProposal({ ...selectedProposal, scopeIntro: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* Included Scope */}
                        <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                          <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/50">
                            <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>What's Included</span>
                            </div>
                            <button
                              onClick={() => {
                                const current = selectedProposal.includedScope || DEFAULT_INCLUDED_SCOPE;
                                setSelectedProposal({
                                  ...selectedProposal,
                                  includedScope: [...current, 'New included deliverable or service scope item']
                                });
                              }}
                              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(selectedProposal.includedScope || DEFAULT_INCLUDED_SCOPE).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/50 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                                <span className="text-emerald-600 font-bold shrink-0">•</span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const current = [...(selectedProposal.includedScope || DEFAULT_INCLUDED_SCOPE)];
                                    current[idx] = e.target.value;
                                    setSelectedProposal({ ...selectedProposal, includedScope: current });
                                  }}
                                  className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
                                />
                                {(selectedProposal.includedScope || DEFAULT_INCLUDED_SCOPE).length > 1 && (
                                  <button
                                    onClick={() => {
                                      const current = (selectedProposal.includedScope || DEFAULT_INCLUDED_SCOPE).filter((_, i) => i !== idx);
                                      setSelectedProposal({ ...selectedProposal, includedScope: current });
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Excluded Scope */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/50">
                            <div className="font-bold text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                              <X className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>What's Not Included</span>
                            </div>
                            <button
                              onClick={() => {
                                const current = selectedProposal.excludedScope || DEFAULT_EXCLUDED_SCOPE;
                                setSelectedProposal({
                                  ...selectedProposal,
                                  excludedScope: [...current, 'New excluded item (e.g. photoshoot, media ad spend, influencer fees)']
                                });
                              }}
                              className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(selectedProposal.excludedScope || DEFAULT_EXCLUDED_SCOPE).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                <span className="text-slate-400 font-bold shrink-0">•</span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const current = [...(selectedProposal.excludedScope || DEFAULT_EXCLUDED_SCOPE)];
                                    current[idx] = e.target.value;
                                    setSelectedProposal({ ...selectedProposal, excludedScope: current });
                                  }}
                                  className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none"
                                />
                                {(selectedProposal.excludedScope || DEFAULT_EXCLUDED_SCOPE).length > 1 && (
                                  <button
                                    onClick={() => {
                                      const current = (selectedProposal.excludedScope || DEFAULT_EXCLUDED_SCOPE).filter((_, i) => i !== idx);
                                      setSelectedProposal({ ...selectedProposal, excludedScope: current });
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 5: DELIVERABLES & SLA TIMELINE */}
                  {activeSectionId === 's5' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">5. Deliverables &amp; SLA Timeline</h3>
                          <p className="text-[11px] text-slate-500">Manage deliverable line items, turnaround SLA, and week-by-week timeline milestones.</p>
                        </div>
                        <button
                          onClick={() => {
                            const newItem: ProposalLineItem = {
                              id: `li-${Date.now()}`,
                              description: 'New Deliverable Task',
                              sacCode: '998361',
                              quantity: 1,
                              unitPrice: 0,
                              amount: 0
                            };
                            setSelectedProposal({
                              ...selectedProposal,
                              lineItems: [...selectedProposal.lineItems, newItem]
                            });
                            showToast('Deliverable added', 'success');
                          }}
                          className="text-xs font-bold text-[#1E442B] hover:underline flex items-center gap-1 cursor-pointer bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Deliverable</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deliverables Checklist</label>
                        <div className="space-y-2">
                          {selectedProposal.lineItems.map((li, idx) => (
                            <div
                              key={li.id}
                              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 flex-1">
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

                              {selectedProposal.lineItems.length > 1 && (
                                <button
                                  onClick={() => {
                                    const updated = selectedProposal.lineItems.filter((_, i) => i !== idx);
                                    setSelectedProposal({ ...selectedProposal, lineItems: updated });
                                  }}
                                  className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                                  title="Remove deliverable"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Service Level Turnaround (SLA)</label>
                          <input
                            type="text"
                            value={selectedProposal.slaAssurance}
                            onChange={(e) => setSelectedProposal({ ...selectedProposal, slaAssurance: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5"
                          />
                        </div>

                        {/* Timeline Milestones */}
                        <div className="pt-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Execution Roadmap Milestones (Timeline)</label>
                            <button
                              onClick={() => {
                                const current = selectedProposal.timelineBullets || DEFAULT_TIMELINE_BULLETS;
                                setSelectedProposal({
                                  ...selectedProposal,
                                  timelineBullets: [...current, 'Week X: New milestone step description']
                                });
                              }}
                              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <Plus className="w-3 h-3" /> Add Timeline Step
                            </button>
                          </div>
                          {(selectedProposal.timelineBullets || DEFAULT_TIMELINE_BULLETS).map((tBullet, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                              <span className="text-[#1E442B] font-bold text-sm shrink-0">•</span>
                              <input
                                type="text"
                                value={tBullet}
                                onChange={(e) => {
                                  const current = [...(selectedProposal.timelineBullets || DEFAULT_TIMELINE_BULLETS)];
                                  current[idx] = e.target.value;
                                  setSelectedProposal({ ...selectedProposal, timelineBullets: current });
                                }}
                                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
                              />
                              {(selectedProposal.timelineBullets || DEFAULT_TIMELINE_BULLETS).length > 1 && (
                                <button
                                  onClick={() => {
                                    const current = (selectedProposal.timelineBullets || DEFAULT_TIMELINE_BULLETS).filter((_, i) => i !== idx);
                                    setSelectedProposal({ ...selectedProposal, timelineBullets: current });
                                  }}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 6: COMMERCIALS & PAYMENT MILESTONES (NO GST) */}
                  {activeSectionId === 's6' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="border-b pb-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">6. Commercial Investment &amp; Payment Milestones</h3>
                        <p className="text-[11px] text-slate-500">Pure management fee retainer with customizable milestone installments, UPI, and bank details (No GST).</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Monthly Management Fee (₹)</label>
                          <input
                            type="number"
                            step={1000}
                            value={selectedProposal.subtotal}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setSelectedProposal({
                                ...selectedProposal,
                                subtotal: val,
                                totalAmount: val,
                                gstAmount: 0,
                                contractValue: `₹${val.toLocaleString('en-IN')} / month`
                              });
                            }}
                            className="w-full font-black text-sm text-[#1E442B] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Meta Ad Spend Budget Description</label>
                          <input
                            type="text"
                            value={selectedProposal.metaAdSpendText || '₹12,000 to start, up to ₹15,000'}
                            onChange={(e) => setSelectedProposal({ ...selectedProposal, metaAdSpendText: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-700 dark:text-slate-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Investment Explanatory Note</label>
                        <textarea
                          rows={3}
                          value={selectedProposal.investmentNote || DEFAULT_INVESTMENT_NOTE}
                          onChange={(e) => setSelectedProposal({ ...selectedProposal, investmentNote: e.target.value })}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-emerald-600 leading-relaxed"
                        />
                      </div>

                      {/* Milestone Breakdown Table */}
                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <div className="bg-[#1E442B] text-white p-2.5 font-bold text-[11px] grid grid-cols-12 gap-2">
                          <span className="col-span-5">Milestone Installment</span>
                          <span className="col-span-3 text-center">Amount (INR)</span>
                          <span className="col-span-4 text-center">Due Condition</span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          <div className="p-2.5 grid grid-cols-12 gap-2 items-center">
                            <span className="col-span-5 font-medium">1. Advance (40%) — begins work</span>
                            <span className="col-span-3 text-center font-bold text-slate-900 dark:text-white">₹{Math.round(selectedProposal.totalAmount * 0.4).toLocaleString('en-IN')}</span>
                            <span className="col-span-4 text-center text-slate-500 text-[11px]">On Confirmation</span>
                          </div>
                          <div className="p-2.5 grid grid-cols-12 gap-2 items-center">
                            <span className="col-span-5 font-medium">2. Milestone 2 (30%) — content + ads live</span>
                            <span className="col-span-3 text-center font-bold text-slate-900 dark:text-white">₹{Math.round(selectedProposal.totalAmount * 0.3).toLocaleString('en-IN')}</span>
                            <span className="col-span-4 text-center text-slate-500 text-[11px]">Day 15</span>
                          </div>
                          <div className="p-2.5 grid grid-cols-12 gap-2 items-center">
                            <span className="col-span-5 font-medium">3. Milestone 3 (30%) — final report</span>
                            <span className="col-span-3 text-center font-bold text-slate-900 dark:text-white">₹{Math.round(selectedProposal.totalAmount * 0.3).toLocaleString('en-IN')}</span>
                            <span className="col-span-4 text-center text-slate-500 text-[11px]">Day 30</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">UPI ID</label>
                          <input
                            type="text"
                            value={selectedProposal.upiId || 'optivirads@icici'}
                            onChange={(e) => setSelectedProposal({ ...selectedProposal, upiId: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Bank Account Details</label>
                          <input
                            type="text"
                            value={selectedProposal.bankDetails || 'OptiVir Ads / ICICI A/C 000205029481 / IFSC ICIC0000002'}
                            onChange={(e) => setSelectedProposal({ ...selectedProposal, bankDetails: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                        <span>Taxation Policy:</span>
                        <span className="font-bold">Management fee includes GST (applicable if registered)</span>
                      </div>
                    </div>
                  )}

                  {/* SECTION 7: KEY ENGAGEMENT TERMS */}
                  {activeSectionId === 's7' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">7. Key Engagement Terms &amp; Conditions</h3>
                          <p className="text-[11px] text-slate-500">Edit, add, or delete binding commercial terms governing the engagement.</p>
                        </div>
                        <button
                          onClick={() => {
                            const current = selectedProposal.engagementTerms || DEFAULT_ENGAGEMENT_TERMS;
                            setSelectedProposal({
                              ...selectedProposal,
                              engagementTerms: [...current, 'New custom term or condition agreed between client and agency.']
                            });
                            showToast('Term added', 'success');
                          }}
                          className="text-xs font-bold text-[#1E442B] hover:underline flex items-center gap-1 cursor-pointer bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Term</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {(selectedProposal.engagementTerms || DEFAULT_ENGAGEMENT_TERMS).map((term, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs">
                            <span className="text-[#1E442B] font-bold text-sm shrink-0 pt-0.5">•</span>
                            <textarea
                              rows={2}
                              value={term}
                              onChange={(e) => {
                                const current = [...(selectedProposal.engagementTerms || DEFAULT_ENGAGEMENT_TERMS)];
                                current[idx] = e.target.value;
                                setSelectedProposal({ ...selectedProposal, engagementTerms: current });
                              }}
                              className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none leading-relaxed resize-none font-medium"
                            />
                            {(selectedProposal.engagementTerms || DEFAULT_ENGAGEMENT_TERMS).length > 1 && (
                              <button
                                onClick={() => {
                                  const current = (selectedProposal.engagementTerms || DEFAULT_ENGAGEMENT_TERMS).filter((_, i) => i !== idx);
                                  setSelectedProposal({ ...selectedProposal, engagementTerms: current });
                                }}
                                className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                                title="Remove term"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Next Step CTA Narrative</label>
                          <textarea
                            rows={2}
                            value={selectedProposal.nextStepText || DEFAULT_NEXT_STEP}
                            onChange={(e) => setSelectedProposal({ ...selectedProposal, nextStepText: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Start Date / Kickoff Timeline</label>
                          <textarea
                            rows={2}
                            value={selectedProposal.startDateText || DEFAULT_START_DATE}
                            onChange={(e) => setSelectedProposal({ ...selectedProposal, startDateText: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 8: DIGITAL SIGNOFF & AUTHORITY */}
                  {activeSectionId === 's8' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="border-b pb-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">8. Digital E-Signature &amp; Signoff Authority</h3>
                        <p className="text-[11px] text-slate-500">Configure agency signatory and client representative contact details.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Agency Signatory */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 pb-1.5 border-b border-slate-200/60">
                            <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-5 w-auto object-contain" />
                            <span>Agency Authority (OptiVirAds)</span>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Signer Name</label>
                            <input
                              type="text"
                              value={selectedProposal.signerName || 'Abhinand C'}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, signerName: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Representation Title</label>
                            <input
                              type="text"
                              value={selectedProposal.signerRole || 'On behalf of OptiVirAds'}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, signerRole: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone</label>
                              <input
                                type="text"
                                value={selectedProposal.signerPhone || '9995037109'}
                                onChange={(e) => setSelectedProposal({ ...selectedProposal, signerPhone: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email</label>
                              <input
                                type="email"
                                value={selectedProposal.signerEmail || 'optivirads@gmail.com'}
                                onChange={(e) => setSelectedProposal({ ...selectedProposal, signerEmail: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Client Signatory */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                          <div className="font-bold text-xs text-slate-900 dark:text-white pb-1.5 border-b border-slate-200/60">
                            Client Signatory
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Client Entity</label>
                            <input
                              type="text"
                              value={selectedProposal.clientName}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, clientName: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Brand / Product</label>
                            <input
                              type="text"
                              value={selectedProposal.brandName || selectedProposal.clientName}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, brandName: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Signatory Name</label>
                            <input
                              type="text"
                              value={selectedProposal.contactPerson}
                              onChange={(e) => setSelectedProposal({ ...selectedProposal, contactPerson: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* POST-ACCEPTANCE AUDIT MATRIX (ONLY VISIBLE ON ACCEPTED / POST-ACCEPTANCE) */}
                  {activeSectionId === 's_audit' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="border-b pb-2 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase">
                              Post-Acceptance Only
                            </span>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Client Onboarding Readiness Audit</h3>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">Live technical checklist completed with the client after contract acceptance.</p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { key: 'Meta Ads setup', status: 'In Progress', note: 'Pixel setup needed, ad account access pending' },
                          { key: 'Creative asset bank', status: 'Needs Action', note: 'Product photos available; video clips needed for Reels' },
                          { key: 'Offer clarity', status: 'Ready', note: 'Key products and pricing confirmed' },
                          { key: 'Lead response time', status: 'Ready', note: 'WhatsApp Business active; ready for direct leads' },
                          { key: 'Tracking / CAPI', status: 'In Progress', note: 'Setup in Week 1 before scaling ad budget' }
                        ].map((item, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                            <div className="font-bold text-slate-900 dark:text-white w-36 shrink-0">{item.key}</div>
                            <div className="flex-1 text-slate-600 dark:text-slate-300 text-[11px]">{item.note}</div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Section Navigator Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        const ids = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', ...(selectedProposal.status === 'Accepted' ? ['s_audit'] : [])];
                        const curIdx = ids.indexOf(activeSectionId);
                        if (curIdx > 0) setActiveSectionId(ids[curIdx - 1]);
                      }}
                      disabled={activeSectionId === 's1'}
                      className={`px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold transition ${
                        activeSectionId === 's1' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
                      }`}
                    >
                      ← Previous Section
                    </button>

                    <button
                      onClick={() => {
                        setProposals(prev => prev.map(p => p.id === selectedProposal.id ? selectedProposal : p));
                        showToast(`All changes saved to proposal ${selectedProposal.code}!`, 'success');
                      }}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save All Changes</span>
                    </button>

                    <button
                      onClick={() => {
                        const ids = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', ...(selectedProposal.status === 'Accepted' ? ['s_audit'] : [])];
                        const curIdx = ids.indexOf(activeSectionId);
                        if (curIdx < ids.length - 1) setActiveSectionId(ids[curIdx + 1]);
                      }}
                      disabled={activeSectionId === 's8' || activeSectionId === 's_audit'}
                      className={`px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold transition ${
                        activeSectionId === 's8' || activeSectionId === 's_audit'
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-rose-600 cursor-pointer'
                      }`}
                    >
                      Next Section →
                    </button>
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
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Primary Stakeholder</label>
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
                        COMMERCIAL TERMS
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Retainer Fee</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹{selectedProposal.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">GST (18%)</span>
                        <span className="text-slate-400">Inclusive</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-bold text-rose-600">
                        <span>Total Due (Incl. Tax)</span>
                        <span>₹{selectedProposal.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <button
                        onClick={() => handleConvertToInvoice(selectedProposal)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Convert to Invoice</span>
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
          {/* TAB 2: DOCUMENT PREVIEW (PRINT-PERFECT LIVE 2-PAGE PROPOSAL/AGREEMENT)*/}
          {/* ===================================================================== */}
          {activeDetailTab === '2. Document Preview' && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
              {/* Document Type Switcher & Action Bar */}
              <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setReviewDocType('proposal')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      reviewDocType === 'proposal'
                        ? 'bg-[#1E442B] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Proposal (2 Pages)</span>
                  </button>
                  <button
                    onClick={() => setReviewDocType('agreement')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      reviewDocType === 'agreement'
                        ? 'bg-[#1E442B] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Confirmation Agreement (2 Pages)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border rounded-lg hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={() => downloadClientPdf(reviewDocType === 'proposal' ? 'proposal' : 'agreement', {
                      number: selectedProposal.code,
                      title: selectedProposal.name,
                      client: selectedProposal.clientName,
                      brand: selectedProposal.clientName,
                      amount: selectedProposal.contractValue || `₹${selectedProposal.subtotal?.toLocaleString('en-IN')}`,
                      management_fee: `₹${(selectedProposal.subtotal || 25000).toLocaleString('en-IN')}`,
                      packageName: selectedProposal.packageName || 'Growth SOW'
                    })}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {reviewDocType === 'proposal' ? 'Proposal' : 'Agreement'} PDF</span>
                  </button>
                </div>
              </div>

              {/* LIVE PROPOSAL DOCUMENT REVIEW (2 PAGES) */}
              {reviewDocType === 'proposal' && (
                <div className="space-y-8 max-w-4xl mx-auto w-full">
                  {/* PAGE 1 SHEET */}
                  <div className="bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
                    {/* Header with official green logo right */}
                    <div className="flex items-start justify-between border-b pb-4 pt-1">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          PROPOSAL
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{selectedProposal.name}</h2>
                        <div className="text-xs text-slate-600 italic">
                          Prepared for {selectedProposal.clientName} — {selectedProposal.brandName || selectedProposal.clientName}
                        </div>
                        <div className="text-xs text-slate-500 italic">
                          By OptiVirAds — helping Kerala food &amp; wellness brands grow online
                        </div>
                        <div className="text-[11px] text-slate-500 pt-0.5">
                          Valid till {selectedProposal.validUntil || '17/09/2026'}
                        </div>
                      </div>
                      <div className="shrink-0 pl-4">
                        <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-10 sm:h-12 w-auto object-contain" />
                      </div>
                    </div>

                    {/* Dear Client Salutation */}
                    <div className="space-y-2">
                      <div className="font-bold text-xs text-slate-900">Dear {selectedProposal.contactPerson || 'Client'},</div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {selectedProposal.executiveSummary || selectedProposal.salutationIntro || `Below is a plan built specifically around what you shared — your stock, your order process, and your ${selectedProposal.targetRegion?.split(' ')[0] || 'Kerala'} launch goal of ${selectedProposal.month1Goal || '250-400L'} in Month 1, scaling toward ${selectedProposal.month3Goal || '2,500L'} by Month 3. This isn't a generic package; it's mapped to where your business already stands, and where marketing needs to pick up.`}
                      </p>
                    </div>

                    {/* Section 1: The Plan */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">1. The Plan</h4>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {selectedProposal.planIntro || DEFAULT_PLAN_INTRO}
                      </p>
                      <ul className="space-y-2 text-xs text-slate-700 pt-1">
                        {(selectedProposal.planBullets || DEFAULT_PLAN_BULLETS).map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#1E442B] font-bold text-sm leading-none mt-0.5">•</span>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 2: What's Included / Not Included */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">2. What's Included / Not Included</h4>
                      </div>
                      <p className="text-xs text-slate-700">
                        {selectedProposal.scopeIntro || DEFAULT_SCOPE_INTRO}
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold text-sm leading-none mt-0.5">•</span>
                          <span><strong>Included</strong>: {(selectedProposal.includedScope || DEFAULT_INCLUDED_SCOPE).join(', ')}.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold text-sm leading-none mt-0.5">•</span>
                          <span><strong>Not included</strong>: {(selectedProposal.excludedScope || DEFAULT_EXCLUDED_SCOPE).join(', ')}.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold text-sm leading-none mt-0.5">•</span>
                          <span>Additional scope items or custom shoots can be quoted separately whenever needed.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Running Footer */}
                    <div className="pt-4 border-t text-[10px] text-slate-400 flex justify-between items-center">
                      <span>OptiVirAds | Performance Marketing for Growing Brands</span>
                      <span className="font-bold">Page 1 of 2</span>
                    </div>
                  </div>

                  {/* PAGE 2 SHEET */}
                  <div className="bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-3 pt-1">
                      <div className="font-mono text-xs font-bold text-slate-500">{selectedProposal.code}</div>
                      <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-9 w-auto object-contain" />
                    </div>

                    {/* Section: Investment */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Investment</h4>
                      </div>
                      <p className="text-xs text-slate-700">
                        One straightforward number, split so you always know where the money goes:
                      </p>
                      <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-[#1E442B] text-white text-xs font-bold">
                            <tr>
                              <th className="p-2.5">Item</th>
                              <th className="p-2.5 text-center w-48">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            <tr>
                              <td className="p-2.5 font-bold">Management fee (strategy, content, ads, funnel, reporting)</td>
                              <td className="p-2.5 text-center font-bold">₹{(selectedProposal.subtotal || selectedProposal.totalAmount || 20000).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 text-slate-700 font-bold">Meta ad spend (paid directly by you to Meta)</td>
                              <td className="p-2.5 text-center text-slate-700">{selectedProposal.metaAdSpendText || '₹12,000 to start, up to ₹15,000'}</td>
                            </tr>
                            <tr className="bg-[#EBF4EC] font-black text-slate-900 border-t-2 border-[#1E442B]">
                              <td className="p-2.5 font-bold">Total investment this month</td>
                              <td className="p-2.5 text-center font-bold text-sm">₹{((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) + 12000).toLocaleString('en-IN')} - {((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) + 15000).toLocaleString('en-IN')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[11px] text-slate-500 italic leading-relaxed">
                        {selectedProposal.investmentNote || DEFAULT_INVESTMENT_NOTE}
                      </p>
                    </div>

                    {/* Section: Engagement Terms */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Engagement Terms</h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold">•</span>
                          <span>40% (₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.4).toLocaleString('en-IN')}) advance to begin content calendar and ad account setup</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold">•</span>
                          <span>30% (₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.3).toLocaleString('en-IN')}) on day 15, once first batch of content and ads are live</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold">•</span>
                          <span>30% (₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.3).toLocaleString('en-IN')}) on day 30, on delivery of the final report</span>
                        </li>
                        {(selectedProposal.engagementTerms || DEFAULT_ENGAGEMENT_TERMS).map((term, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#1E442B] font-bold">•</span>
                            <span>{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section: Timeline */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Timeline</h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {(selectedProposal.timelineBullets || DEFAULT_TIMELINE_BULLETS).map((tb, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#1E442B] font-bold">•</span>
                            <span>{tb}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section: Next Step & Sign-off */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Next Step</h4>
                      </div>
                      <p className="text-xs text-slate-700">
                        {selectedProposal.nextStepText || DEFAULT_NEXT_STEP}
                      </p>
                      <p className="text-xs text-slate-800 italic">
                        Looking forward to taking {selectedProposal.brandName || selectedProposal.clientName}'s growth to the next level.
                      </p>
                    </div>

                    {/* Sign-off */}
                    <div className="pt-4 border-t flex items-center gap-4">
                      <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-10 w-auto object-contain" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{selectedProposal.signerName || 'Abhinand C'}</div>
                        <div className="text-[11px] text-slate-500">{selectedProposal.signerRole || 'On behalf of OptiVirAds'}</div>
                        <div className="text-[10px] text-slate-400">{selectedProposal.signerPhone || '9995037109'} | {selectedProposal.signerEmail || 'optivirads@gmail.com'} | {selectedProposal.signerWebsite || 'www.optivirads.com'}</div>
                      </div>
                    </div>

                    {/* Running Footer */}
                    <div className="pt-4 border-t text-[10px] text-slate-400 flex justify-between items-center">
                      <span>OptiVirAds | Performance Marketing for Growing Brands</span>
                      <span className="font-bold">Page 2 of 2</span>
                    </div>
                  </div>
                </div>
              )}

              {/* LIVE AGREEMENT / CONFIRMATION REVIEW (2 PAGES) */}
              {reviewDocType === 'agreement' && (
                <div className="space-y-8 max-w-4xl mx-auto w-full">
                  {/* PAGE 1 SHEET */}
                  <div className="bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
                    {/* Header with official green logo right */}
                    <div className="flex items-start justify-between border-b pb-4 pt-1">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          WRITTEN CONFIRMATION
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Confirmation of Engagement</h2>
                        <p className="text-xs text-slate-600 italic">
                          This confirms both sides' agreement to proceed, based on the proposal sent on {selectedProposal.validUntil || '17/08/2026'}.
                        </p>
                      </div>
                      <div className="shrink-0 pl-4">
                        <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-10 sm:h-12 w-auto object-contain" />
                      </div>
                    </div>

                    {/* Metadata Grid Box (2x2) */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300">
                        <div className="p-2.5 flex items-center gap-2">
                          <span className="font-bold text-slate-900 w-28">Confirmation #</span>
                          <span className="text-slate-700 font-mono">[{selectedProposal.code || 'OVA-2026-001'}]</span>
                        </div>
                        <div className="p-2.5 flex items-center gap-2">
                          <span className="font-bold text-slate-900 w-20">Date</span>
                          <span className="text-slate-700">[{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}]</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-300">
                        <div className="p-2.5 flex items-center gap-2">
                          <span className="font-bold text-slate-900 w-28">Client</span>
                          <span className="text-slate-700 font-medium">[{selectedProposal.clientName}]</span>
                        </div>
                        <div className="p-2.5 flex items-center gap-2">
                          <span className="font-bold text-slate-900 w-20">Brand</span>
                          <span className="text-slate-700 font-medium">{selectedProposal.brandName || selectedProposal.clientName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 1: What This Confirms */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">What This Confirms</h4>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        This document is a simple written record of what both sides agreed on WhatsApp/call — not a replacement for the full proposal, but a one-page reference so there's no confusion later about scope, price, or dates. Both sides keep a copy.
                      </p>
                      <p className="text-xs text-slate-700 italic">
                        If anything here differs from an earlier casual chat or quote, this confirmation is the final version both sides go by.
                      </p>
                    </div>

                    {/* Section 2: Month 1 Target */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Month 1 Target</h4>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {selectedProposal.solutionArchitecture || `This is the validation phase of the 3-month roadmap toward ${selectedProposal.month3Goal || '2,500'} customers. Based on the ad budget below, the realistic target for Month 1 is ${selectedProposal.month1Goal || '60-100'} customers — not the full ${selectedProposal.month3Goal || '2,500'}. Month 2-3 scale-up depends on Month 1 data and a fresh budget conversation, as outlined in the proposal.`}
                      </p>
                    </div>

                    {/* Section 3: Scope — Month 1 */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Scope — Month 1</h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {(selectedProposal.includedScope || DEFAULT_INCLUDED_SCOPE).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#1E442B] font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold">•</span>
                          <span>Not included: {(selectedProposal.excludedScope || DEFAULT_EXCLUDED_SCOPE).join(', ')}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Section 4: Investment */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Investment</h4>
                      </div>
                      <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-[#1E442B] text-white text-xs font-bold">
                            <tr>
                              <th className="p-2.5">Item</th>
                              <th className="p-2.5 text-center w-48">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            <tr>
                              <td className="p-2.5 font-bold">Management fee (strategy, content, ads, funnel, reporting)</td>
                              <td className="p-2.5 text-center font-bold">₹{(selectedProposal.subtotal || selectedProposal.totalAmount || 20000).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 text-slate-700 font-bold">Meta ad spend (billed separately, paid by client to Meta)</td>
                              <td className="p-2.5 text-center text-slate-700">{selectedProposal.metaAdSpendText || '₹12,000 to start, up to ₹15,000'}</td>
                            </tr>
                            <tr className="bg-[#EBF4EC] font-black text-slate-900 border-t-2 border-[#1E442B]">
                              <td className="p-2.5 font-bold">Total investment — Month 1</td>
                              <td className="p-2.5 text-center font-bold text-sm">₹{((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) + 12000).toLocaleString('en-IN')} - {((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) + 15000).toLocaleString('en-IN')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        {selectedProposal.investmentNote || DEFAULT_INVESTMENT_NOTE}
                      </p>
                    </div>

                    {/* Section 5: Payment Schedule */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Payment Schedule</h4>
                      </div>
                      <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                        <div className="bg-[#1E442B] text-white p-2.5 font-bold text-xs grid grid-cols-12 gap-2">
                          <span className="col-span-5">Milestone</span>
                          <span className="col-span-3 text-center">Amount</span>
                          <span className="col-span-4 text-center">Due</span>
                        </div>
                        <div className="divide-y divide-slate-200 text-xs">
                          <div className="p-2.5 grid grid-cols-12 gap-2 items-center">
                            <span className="col-span-5 font-medium">Advance (40%) — begins work</span>
                            <span className="col-span-3 text-center font-bold">₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.4).toLocaleString('en-IN')}</span>
                            <span className="col-span-4 text-center text-slate-600">On confirmation</span>
                          </div>
                          <div className="p-2.5 grid grid-cols-12 gap-2 items-center">
                            <span className="col-span-5 font-medium">Milestone 2 (30%) — content + ads live</span>
                            <span className="col-span-3 text-center font-bold">₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.3).toLocaleString('en-IN')}</span>
                            <span className="col-span-4 text-center text-slate-600">Day 15</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Running Footer */}
                    <div className="pt-4 border-t text-[10px] text-slate-400 flex justify-between items-center">
                      <span>OptiVirAds | Performance Marketing for Growing Brands</span>
                      <span className="font-bold">Page 1 of 2</span>
                    </div>
                  </div>

                  {/* PAGE 2 SHEET */}
                  <div className="bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-3 pt-1">
                      <div className="font-mono text-xs font-bold text-slate-500">{selectedProposal.code}</div>
                      <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-9 w-auto object-contain" />
                    </div>

                    {/* Milestone 3 row */}
                    <div className="space-y-2">
                      <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                        <div className="p-2.5 grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-5 font-medium">Milestone 3 (30%) — final report</span>
                          <span className="col-span-3 text-center font-bold">₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.3).toLocaleString('en-IN')}</span>
                          <span className="col-span-4 text-center text-slate-600">Day 30</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        Pay via UPI: {selectedProposal.upiId || 'optivirads@icici'} or bank transfer: {selectedProposal.bankDetails || 'OptiVir Ads / ICICI A/C 000205029481 / IFSC ICIC0000002'}. Send a screenshot after each payment for the record.
                      </p>
                    </div>

                    {/* Section 6: Key Terms */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Key Terms (from the proposal)</h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        <li className="flex items-start gap-2"><span className="text-[#1E442B] font-bold">•</span><span>This confirmation is read together with the proposal dated {selectedProposal.validUntil || '17/08/2026'} — where the two conflict on price, scope, or dates, this document governs</span></li>
                        <li className="flex items-start gap-2"><span className="text-[#1E442B] font-bold">•</span><span>If a milestone payment is more than 3 days late, work pauses until it's received — timeline shifts accordingly</span></li>
                        {(selectedProposal.engagementTerms || DEFAULT_ENGAGEMENT_TERMS).map((term, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#1E442B] font-bold">•</span>
                            <span>{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 7: Start Date */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Start Date</h4>
                      </div>
                      <p className="text-xs text-slate-700">
                        {selectedProposal.startDateText || `Work begins within 24 hours of advance payment (₹${Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.4).toLocaleString('en-IN')}). First content calendar shared by 24 hours upon payment.`}
                      </p>
                    </div>

                    {/* Section 8: Acknowledged By */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Acknowledged By</h4>
                      </div>
                      <p className="text-xs text-slate-500 italic">
                        By replying 'Confirmed' on WhatsApp/email, or signing below, both sides agree this reflects what was discussed.
                      </p>
                    </div>

                    {/* Dual Signatures */}
                    <div className="space-y-6 pt-2">
                      <div className="space-y-1">
                        <div className="border-b border-slate-400 w-64 pb-4"></div>
                        <div className="font-bold text-xs text-slate-900">[{selectedProposal.clientName}] | {selectedProposal.brandName || selectedProposal.clientName}</div>
                        <div className="text-[11px] text-slate-500">Authorized Signatory: {selectedProposal.contactPerson}</div>
                      </div>
                      <div className="space-y-1 pt-2">
                        <div className="border-b border-slate-400 w-64 pb-4"></div>
                        <div className="font-bold text-xs text-slate-900">[{selectedProposal.signerName || 'Abhinand C'}] | {selectedProposal.signerRole || 'On behalf of OptiVirAds'}</div>
                        <div className="text-[11px] text-slate-500">Date: {new Date().toLocaleDateString('en-GB')}</div>
                      </div>
                    </div>

                    {/* Running Footer */}
                    <div className="pt-4 border-t text-[10px] text-slate-400 flex justify-between items-center">
                      <span>OptiVirAds | Performance Marketing for Growing Brands</span>
                      <span className="font-bold">Page 2 of 2</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: PRICING & COMMERCIALS ENGINE (CLEAN RETAINER)                  */}
          {/* ===================================================================== */}
          {activeDetailTab === '3. Pricing Engine' && (
            <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-6 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Commercial Retainer &amp; Deliverables Configuration
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Configure deliverables checklist and monthly commercial retainer fee (includes GST).
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newItem: ProposalLineItem = {
                      id: `li-${Date.now()}`,
                      description: 'Custom Deliverable Item',
                      sacCode: '998361',
                      quantity: 1,
                      unitPrice: 0,
                      amount: 0
                    };
                    setSelectedProposal({
                      ...selectedProposal,
                      lineItems: [...selectedProposal.lineItems, newItem]
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Deliverable</span>
                </button>
              </div>

              {/* Line Items Editable List */}
              <div className="space-y-2">
                {selectedProposal.lineItems.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...selectedProposal.lineItems];
                          updated[idx].description = e.target.value;
                          setSelectedProposal({ ...selectedProposal, lineItems: updated });
                        }}
                        className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-200 outline-none text-xs"
                      />
                    </div>
                    {selectedProposal.lineItems.length > 1 && (
                      <button
                        onClick={() => {
                          const updated = selectedProposal.lineItems.filter((_, i) => i !== idx);
                          setSelectedProposal({ ...selectedProposal, lineItems: updated });
                        }}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Commercials Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm ml-auto space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Monthly Retainer Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{selectedProposal.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxation:</span>
                  <span className="text-emerald-600 font-medium">Includes GST (All-Inclusive)</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200 dark:border-slate-700 text-rose-600">
                  <span>Total Commercial Value:</span>
                  <span>₹{selectedProposal.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: PACKAGES CATALOG TAB                                           */}
          {/* ===================================================================== */}
          {activeDetailTab === '4. Packages Catalog' && (
            <div className="w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
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

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW PROPOSAL                                                */}
      {/* ========================================================================= */}
      {showCreateProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#DC2626]" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Create New Proposal</h3>
              </div>
              <button onClick={() => setShowCreateProposalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const chosenPkg = packages.find(p => p.id === newPropSelectedPkgId) || packages[0];
                if (!chosenPkg) {
                  showToast('Please configure at least one package in the vault first', 'error');
                  return;
                }
                handleGenerateProposalFromPackage(chosenPkg, newPropClient, newPropContact);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Target Client / Company *</label>
                {clientsList.length > 0 ? (
                  <div className="space-y-1.5">
                    <select
                      value={newPropClient}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewPropClient(val);
                        const match = clientsList.find(c => c.name === val);
                        if (match?.contactPerson) {
                          setNewPropContact(match.contactPerson);
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none"
                    >
                      <option value="">-- Select Existing Client / Lead ({clientsList.length} Available) --</option>
                      {clientsList.map((c) => (
                        <option key={c.id || c.name} value={c.name}>
                          {c.name} {c.source ? `[${c.source}]` : ''} {c.contactPerson ? `— ${c.contactPerson}` : ''}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newPropClient}
                      onChange={(e) => setNewPropClient(e.target.value)}
                      placeholder="Or enter / edit client company name..."
                      required
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={newPropClient}
                    onChange={(e) => setNewPropClient(e.target.value)}
                    placeholder="e.g. Hijabi Ladies Beauty Salon"
                    required
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
                  />
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Key Stakeholder / Contact Person</label>
                <input
                  type="text"
                  value={newPropContact}
                  onChange={(e) => setNewPropContact(e.target.value)}
                  placeholder="e.g. Fatima Al-Zahra (Director)"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Proposal Title (Optional)</label>
                <input
                  type="text"
                  value={newPropCustomTitle}
                  onChange={(e) => setNewPropCustomTitle(e.target.value)}
                  placeholder="Defaults to: [Package Name] — [Client Name] SOW"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Applied Agency Package *</label>
                <select
                  value={newPropSelectedPkgId}
                  onChange={(e) => setNewPropSelectedPkgId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — ₹{pkg.monthlyFee.toLocaleString('en-IN')} ({pkg.billingType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>Selected Package Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{(packages.find(p => p.id === newPropSelectedPkgId)?.monthlyFee || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxation:</span>
                  <span className="text-emerald-600 font-medium">Includes GST (All-Inclusive Retainer)</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Commercial Value:</span>
                  <span className="text-[#DC2626] font-black text-sm">
                    ₹{(packages.find(p => p.id === newPropSelectedPkgId)?.monthlyFee || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateProposalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Generate & Save Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN DOCUMENT REVIEW MODAL (LIVE PROPOSAL / AGREEMENT PREVIEW)       */}
      {/* ========================================================================= */}
      {showDocumentReviewModal && selectedProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-6 my-auto">
            {/* Modal Header Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap sm:flex-nowrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900 text-white font-bold">
                  <Eye className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Document Review &amp; Live Print Preview</h3>
                  <p className="text-xs text-slate-500">{selectedProposal.name} • Ref: {selectedProposal.code}</p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setReviewDocType('proposal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    reviewDocType === 'proposal'
                      ? 'bg-[#1E442B] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Proposal (2 Pages)</span>
                </button>

                <button
                  onClick={() => setReviewDocType('agreement')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    reviewDocType === 'agreement'
                      ? 'bg-[#1E442B] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Agreement (2 Pages)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border rounded-lg hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => downloadClientPdf(reviewDocType === 'proposal' ? 'proposal' : 'agreement', {
                    number: selectedProposal.code,
                    title: selectedProposal.name,
                    client: selectedProposal.clientName,
                    brand: selectedProposal.clientName,
                    amount: selectedProposal.contractValue || `₹${selectedProposal.subtotal?.toLocaleString('en-IN')}`,
                    management_fee: `₹${(selectedProposal.subtotal || 25000).toLocaleString('en-IN')}`,
                    packageName: selectedProposal.packageName || 'Growth SOW'
                  })}
                  className="px-3.5 py-1.5 text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setShowDocumentReviewModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* LIVE DOCUMENT PAGES CONTAINER */}
            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
              {reviewDocType === 'proposal' ? (
                <>
                  {/* PROPOSAL PAGE 1 */}
                  <div className="bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
                    {/* Header with official green logo right */}
                    <div className="flex items-start justify-between border-b pb-4 pt-1">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          PROPOSAL
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{selectedProposal.name}</h2>
                        <div className="text-xs text-slate-600 italic">
                          Prepared for {selectedProposal.clientName} — {selectedProposal.brandName || selectedProposal.clientName}
                        </div>
                        <div className="text-xs text-slate-500 italic">
                          By OptiVirAds — helping Kerala food &amp; wellness brands grow online
                        </div>
                        <div className="text-[11px] text-slate-500 pt-0.5">
                          Valid till {selectedProposal.validUntil || '17/09/2026'}
                        </div>
                      </div>
                      <div className="shrink-0 pl-4">
                        <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-10 sm:h-12 w-auto object-contain" />
                      </div>
                    </div>

                    {/* Dear Client Salutation */}
                    <div className="space-y-2">
                      <div className="font-bold text-xs text-slate-900">Dear {selectedProposal.contactPerson || 'Client'},</div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {selectedProposal.executiveSummary || selectedProposal.salutationIntro || `Below is a plan built specifically around what you shared — your stock, your order process, and your ${selectedProposal.targetRegion?.split(' ')[0] || 'Kerala'} launch goal of ${selectedProposal.month1Goal || '250-400L'} in Month 1, scaling toward ${selectedProposal.month3Goal || '2,500L'} by Month 3. This isn't a generic package; it's mapped to where your business already stands, and where marketing needs to pick up.`}
                      </p>
                    </div>

                    {/* Section 1: The Plan */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">1. The Plan</h4>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {selectedProposal.planIntro || DEFAULT_PLAN_INTRO}
                      </p>
                      <ul className="space-y-2 text-xs text-slate-700 pt-1">
                        {(selectedProposal.planBullets || DEFAULT_PLAN_BULLETS).map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#1E442B] font-bold text-sm leading-none mt-0.5">•</span>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 2: What's Included / Not Included */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">2. What's Included / Not Included</h4>
                      </div>
                      <p className="text-xs text-slate-700">
                        {selectedProposal.scopeIntro || DEFAULT_SCOPE_INTRO}
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold text-sm leading-none mt-0.5">•</span>
                          <span><strong>Included</strong>: {(selectedProposal.includedScope || DEFAULT_INCLUDED_SCOPE).join(', ')}.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold text-sm leading-none mt-0.5">•</span>
                          <span><strong>Not included</strong>: {(selectedProposal.excludedScope || DEFAULT_EXCLUDED_SCOPE).join(', ')}.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold text-sm leading-none mt-0.5">•</span>
                          <span>Additional scope items or custom shoots can be quoted separately whenever needed.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Running Footer */}
                    <div className="pt-4 border-t text-[10px] text-slate-400 flex justify-between items-center">
                      <span>OptiVirAds | Performance Marketing for Growing Brands</span>
                      <span className="font-bold">Page 1 of 2</span>
                    </div>
                  </div>

                  {/* PROPOSAL PAGE 2 */}
                  <div className="bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-3 pt-1">
                      <div className="font-mono text-xs font-bold text-slate-500">{selectedProposal.code}</div>
                      <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-9 w-auto object-contain" />
                    </div>

                    {/* Section: Investment */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Investment</h4>
                      </div>
                      <p className="text-xs text-slate-700">
                        One straightforward number, split so you always know where the money goes:
                      </p>
                      <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-[#1E442B] text-white text-xs font-bold">
                            <tr>
                              <th className="p-2.5">Item</th>
                              <th className="p-2.5 text-center w-48">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            <tr>
                              <td className="p-2.5 font-bold">Management fee (strategy, content, ads, funnel, reporting)</td>
                              <td className="p-2.5 text-center font-bold">₹{(selectedProposal.subtotal || selectedProposal.totalAmount || 20000).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 text-slate-700 font-bold">Meta ad spend (paid directly by you to Meta)</td>
                              <td className="p-2.5 text-center text-slate-700">{selectedProposal.metaAdSpendText || '₹12,000 to start, up to ₹15,000'}</td>
                            </tr>
                            <tr className="bg-[#EBF4EC] font-black text-slate-900 border-t-2 border-[#1E442B]">
                              <td className="p-2.5 font-bold">Total investment this month</td>
                              <td className="p-2.5 text-center font-bold text-sm">₹{((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) + 12000).toLocaleString('en-IN')} - {((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) + 15000).toLocaleString('en-IN')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[11px] text-slate-500 italic leading-relaxed">
                        {selectedProposal.investmentNote || DEFAULT_INVESTMENT_NOTE}
                      </p>
                    </div>

                    {/* Section: Engagement Terms */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Engagement Terms</h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold">•</span>
                          <span>40% (₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.4).toLocaleString('en-IN')}) advance to begin content calendar and ad account setup</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold">•</span>
                          <span>30% (₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.3).toLocaleString('en-IN')}) on day 15, once first batch of content and ads are live</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold">•</span>
                          <span>30% (₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.3).toLocaleString('en-IN')}) on day 30, on delivery of the final report</span>
                        </li>
                        {(selectedProposal.engagementTerms || DEFAULT_ENGAGEMENT_TERMS).map((term, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#1E442B] font-bold">•</span>
                            <span>{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section: Timeline */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Timeline</h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {(selectedProposal.timelineBullets || DEFAULT_TIMELINE_BULLETS).map((tb, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#1E442B] font-bold">•</span>
                            <span>{tb}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section: Next Step & Sign-off */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Next Step</h4>
                      </div>
                      <p className="text-xs text-slate-700">
                        {selectedProposal.nextStepText || DEFAULT_NEXT_STEP}
                      </p>
                      <p className="text-xs text-slate-800 italic">
                        Looking forward to taking {selectedProposal.brandName || selectedProposal.clientName}'s growth to the next level.
                      </p>
                    </div>

                    {/* Sign-off */}
                    <div className="pt-4 border-t flex items-center gap-4">
                      <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-10 w-auto object-contain" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{selectedProposal.signerName || 'Abhinand C'}</div>
                        <div className="text-[11px] text-slate-500">{selectedProposal.signerRole || 'On behalf of OptiVirAds'}</div>
                        <div className="text-[10px] text-slate-400">{selectedProposal.signerPhone || '9995037109'} | {selectedProposal.signerEmail || 'optivirads@gmail.com'} | {selectedProposal.signerWebsite || 'www.optivirads.com'}</div>
                      </div>
                    </div>

                    {/* Running Footer */}
                    <div className="pt-4 border-t text-[10px] text-slate-400 flex justify-between items-center">
                      <span>OptiVirAds | Performance Marketing for Growing Brands</span>
                      <span className="font-bold">Page 2 of 2</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* AGREEMENT PAGE 1 */}
                  <div className="bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
                    {/* Header with official green logo right */}
                    <div className="flex items-start justify-between border-b pb-4 pt-1">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          WRITTEN CONFIRMATION
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Confirmation of Engagement</h2>
                        <p className="text-xs text-slate-600 italic">
                          This confirms both sides' agreement to proceed, based on the proposal sent on {selectedProposal.validUntil || '17/08/2026'}.
                        </p>
                      </div>
                      <div className="shrink-0 pl-4">
                        <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-10 sm:h-12 w-auto object-contain" />
                      </div>
                    </div>

                    {/* Metadata Grid Box (2x2) */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300">
                        <div className="p-2.5 flex items-center gap-2">
                          <span className="font-bold text-slate-900 w-28">Confirmation #</span>
                          <span className="text-slate-700 font-mono">[{selectedProposal.code || 'OVA-2026-001'}]</span>
                        </div>
                        <div className="p-2.5 flex items-center gap-2">
                          <span className="font-bold text-slate-900 w-20">Date</span>
                          <span className="text-slate-700">[{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}]</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-300">
                        <div className="p-2.5 flex items-center gap-2">
                          <span className="font-bold text-slate-900 w-28">Client</span>
                          <span className="text-slate-700 font-medium">[{selectedProposal.clientName}]</span>
                        </div>
                        <div className="p-2.5 flex items-center gap-2">
                          <span className="font-bold text-slate-900 w-20">Brand</span>
                          <span className="text-slate-700 font-medium">{selectedProposal.brandName || selectedProposal.clientName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 1: What This Confirms */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">What This Confirms</h4>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        This document is a simple written record of what both sides agreed on WhatsApp/call — not a replacement for the full proposal, but a one-page reference so there's no confusion later about scope, price, or dates. Both sides keep a copy.
                      </p>
                      <p className="text-xs text-slate-700 italic">
                        If anything here differs from an earlier casual chat or quote, this confirmation is the final version both sides go by.
                      </p>
                    </div>

                    {/* Section 2: Month 1 Target */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Month 1 Target</h4>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {selectedProposal.solutionArchitecture || `This is the validation phase of the 3-month roadmap toward ${selectedProposal.month3Goal || '2,500'} customers. Based on the ad budget below, the realistic target for Month 1 is ${selectedProposal.month1Goal || '60-100'} customers — not the full ${selectedProposal.month3Goal || '2,500'}. Month 2-3 scale-up depends on Month 1 data and a fresh budget conversation, as outlined in the proposal.`}
                      </p>
                    </div>

                    {/* Section 3: Scope — Month 1 */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Scope — Month 1</h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {(selectedProposal.includedScope || DEFAULT_INCLUDED_SCOPE).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#1E442B] font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                        <li className="flex items-start gap-2">
                          <span className="text-[#1E442B] font-bold">•</span>
                          <span>Not included: {(selectedProposal.excludedScope || DEFAULT_EXCLUDED_SCOPE).join(', ')}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Section 4: Investment */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Investment</h4>
                      </div>
                      <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-[#1E442B] text-white text-xs font-bold">
                            <tr>
                              <th className="p-2.5">Item</th>
                              <th className="p-2.5 text-center w-48">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            <tr>
                              <td className="p-2.5 font-bold">Management fee (strategy, content, ads, funnel, reporting)</td>
                              <td className="p-2.5 text-center font-bold">₹{(selectedProposal.subtotal || selectedProposal.totalAmount || 20000).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 text-slate-700 font-bold">Meta ad spend (billed separately, paid by client to Meta)</td>
                              <td className="p-2.5 text-center text-slate-700">{selectedProposal.metaAdSpendText || '₹12,000 to start, up to ₹15,000'}</td>
                            </tr>
                            <tr className="bg-[#EBF4EC] font-black text-slate-900 border-t-2 border-[#1E442B]">
                              <td className="p-2.5 font-bold">Total investment — Month 1</td>
                              <td className="p-2.5 text-center font-bold text-sm">₹{((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) + 12000).toLocaleString('en-IN')} - {((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) + 15000).toLocaleString('en-IN')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        {selectedProposal.investmentNote || DEFAULT_INVESTMENT_NOTE}
                      </p>
                    </div>

                    {/* Section 5: Payment Schedule */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Payment Schedule</h4>
                      </div>
                      <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                        <div className="bg-[#1E442B] text-white p-2.5 font-bold text-xs grid grid-cols-12 gap-2">
                          <span className="col-span-5">Milestone</span>
                          <span className="col-span-3 text-center">Amount</span>
                          <span className="col-span-4 text-center">Due</span>
                        </div>
                        <div className="divide-y divide-slate-200 text-xs">
                          <div className="p-2.5 grid grid-cols-12 gap-2 items-center">
                            <span className="col-span-5 font-medium">Advance (40%) — begins work</span>
                            <span className="col-span-3 text-center font-bold">₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.4).toLocaleString('en-IN')}</span>
                            <span className="col-span-4 text-center text-slate-600">On confirmation</span>
                          </div>
                          <div className="p-2.5 grid grid-cols-12 gap-2 items-center">
                            <span className="col-span-5 font-medium">Milestone 2 (30%) — content + ads live</span>
                            <span className="col-span-3 text-center font-bold">₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.3).toLocaleString('en-IN')}</span>
                            <span className="col-span-4 text-center text-slate-600">Day 15</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Running Footer */}
                    <div className="pt-4 border-t text-[10px] text-slate-400 flex justify-between items-center">
                      <span>OptiVirAds | Performance Marketing for Growing Brands</span>
                      <span className="font-bold">Page 1 of 2</span>
                    </div>
                  </div>

                  {/* PAGE 2 SHEET */}
                  <div className="bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-3 pt-1">
                      <div className="font-mono text-xs font-bold text-slate-500">{selectedProposal.code}</div>
                      <img src="/images/optivir-logo-green.png" alt="OptiVirAds" className="h-9 w-auto object-contain" />
                    </div>

                    {/* Milestone 3 row */}
                    <div className="space-y-2">
                      <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                        <div className="p-2.5 grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-5 font-medium">Milestone 3 (30%) — final report</span>
                          <span className="col-span-3 text-center font-bold">₹{Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.3).toLocaleString('en-IN')}</span>
                          <span className="col-span-4 text-center text-slate-600">Day 30</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        Pay via UPI: {selectedProposal.upiId || 'optivirads@icici'} or bank transfer: {selectedProposal.bankDetails || 'OptiVir Ads / ICICI A/C 000205029481 / IFSC ICIC0000002'}. Send a screenshot after each payment for the record.
                      </p>
                    </div>

                    {/* Section 6: Key Terms */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Key Terms (from the proposal)</h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        <li className="flex items-start gap-2"><span className="text-[#1E442B] font-bold">•</span><span>This confirmation is read together with the proposal dated {selectedProposal.validUntil || '17/08/2026'} — where the two conflict on price, scope, or dates, this document governs</span></li>
                        <li className="flex items-start gap-2"><span className="text-[#1E442B] font-bold">•</span><span>If a milestone payment is more than 3 days late, work pauses until it's received — timeline shifts accordingly</span></li>
                        {(selectedProposal.engagementTerms || DEFAULT_ENGAGEMENT_TERMS).map((term, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#1E442B] font-bold">•</span>
                            <span>{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 7: Start Date */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Start Date</h4>
                      </div>
                      <p className="text-xs text-slate-700">
                        {selectedProposal.startDateText || `Work begins within 24 hours of advance payment (₹${Math.round((selectedProposal.subtotal || selectedProposal.totalAmount || 20000) * 0.4).toLocaleString('en-IN')}). First content calendar shared by 24 hours upon payment.`}
                      </p>
                    </div>

                    {/* Section 8: Acknowledged By */}
                    <div className="space-y-2">
                      <div className="border-b-2 border-slate-800 pb-1">
                        <h4 className="font-bold text-slate-900 text-sm">Acknowledged By</h4>
                      </div>
                      <p className="text-xs text-slate-500 italic">
                        By replying 'Confirmed' on WhatsApp/email, or signing below, both sides agree this reflects what was discussed.
                      </p>
                    </div>

                    {/* Dual Signatures */}
                    <div className="space-y-6 pt-2">
                      <div className="space-y-1">
                        <div className="border-b border-slate-400 w-64 pb-4"></div>
                        <div className="font-bold text-xs text-slate-900">[{selectedProposal.clientName}] | {selectedProposal.brandName || selectedProposal.clientName}</div>
                        <div className="text-[11px] text-slate-500">Authorized Signatory: {selectedProposal.contactPerson}</div>
                      </div>
                      <div className="space-y-1 pt-2">
                        <div className="border-b border-slate-400 w-64 pb-4"></div>
                        <div className="font-bold text-xs text-slate-900">[{selectedProposal.signerName || 'Abhinand C'}] | {selectedProposal.signerRole || 'On behalf of OptiVirAds'}</div>
                        <div className="text-[11px] text-slate-500">Date: {new Date().toLocaleDateString('en-GB')}</div>
                      </div>
                    </div>

                    {/* Running Footer */}
                    <div className="pt-4 border-t text-[10px] text-slate-400 flex justify-between items-center">
                      <span>OptiVirAds | Performance Marketing for Growing Brands</span>
                      <span className="font-bold">Page 2 of 2</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowDocumentReviewModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
