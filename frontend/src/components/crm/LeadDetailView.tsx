'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/toast-context';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Edit,
  Plus,
  Calendar,
  ArrowRightCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  Share2,
  MoreVertical,
  Download,
  Eye,
  Check,
  TrendingUp,
  Tag,
  Briefcase,
  Users,
  Video,
  Send,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Star,
  DollarSign,
  Layers,
  Sparkles,
  X,
  FileCheck,
  ChevronRight,
  UserCheck,
  Compass,
  FileCode,
  Paperclip,
  Globe,
  ArrowUpRight,
  Trash2,
  PhoneCall,
  Flame
} from 'lucide-react';

export interface LeadDetailData {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  location: string;
  company: string;
  companySubtitle?: string;
  designation: string;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedValue: number | string;
  owner: string;
  ownerRole?: string;
  source: string;
  service: string;
  createdDate: string;
  lastContact: string;
  nextFollowUp: string;
  campaign: string;
  budget: string;
  decisionAuthority: string;
  timeline: string;
  painPoint: string;
  targetObjective: string;
  fitScore: number;
  engagementScore: number;
  firmographicScore: number;
  velocityScore: number;
  tags: string[];
}

interface LeadDetailViewProps {
  lead: LeadDetailData;
  onBack: () => void;
  onConvertToOpportunity?: (lead: LeadDetailData) => void;
  onNavigate?: (tab: string) => void;
}

export const LeadDetailView: React.FC<LeadDetailViewProps> = ({
  lead,
  onBack,
  onConvertToOpportunity,
  onNavigate
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'communication' | 'opportunities' | 'documents' | 'notes' | 'audit'>('overview');
  const [taskDone, setTaskDone] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [activityFilter, setActivityFilter] = useState<'All' | 'Calls' | 'Emails' | 'Meetings'>('All');

  const [notesList, setNotesList] = useState([
    {
      id: 'n1',
      author: 'Alex Morgan',
      date: 'Added 08 Sep 2026 by Alex Morgan',
      pinned: true,
      text: 'Client is primarily focused on reducing CPL while maintaining lead quality. Founder is involved in the final decision. Emphasize multi-touch attribution reporting and 30-day quick wins during the next review call.'
    }
  ]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setNotesList([
      ...notesList,
      {
        id: `n-${Date.now()}`,
        author: 'Alex Morgan',
        date: 'Added Today by Alex Morgan',
        pinned: false,
        text: newNoteText.trim()
      }
    ]);
    setNewNoteText('');
    setShowAddNoteModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP BREADCRUMBS & SYNC STATUS (Matching Image 3 & 4)                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-[#F8FAFC] shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Leads</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-[#5A6A80] dark:text-[#94A3B8]">
            <span className="hover:underline cursor-pointer" onClick={onBack}>CRM</span>
            <span>/</span>
            <span className="hover:underline cursor-pointer" onClick={onBack}>Leads</span>
            <span>/</span>
            <span className="font-semibold text-[#0B1727] dark:text-[#F8FAFC]">{lead.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Synced to Salesforce - ID: #LD-90281</span>
            <RefreshCw className="w-3 h-3 ml-1 cursor-pointer hover:rotate-180 transition duration-300" />
            <ExternalLink className="w-3 h-3 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LEAD PROFILE HEADER (Matching Image 3 & 4)                            */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          {/* Avatar & Main Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0B1727] dark:bg-[#1E293B] text-white text-2xl font-bold flex items-center justify-center shadow-md shrink-0 border border-[#1E293B]">
              {lead.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC] tracking-tight">
                  {lead.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  ● QUALIFIED
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-red-600" />
                  HIGH PRIORITY
                </span>
              </div>

              {/* Company & Contact Vector Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#5A6A80] dark:text-[#94A3B8] mt-2">
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('companies');
                    else showToast(`Navigating to company record for ${lead.company}`, 'info');
                  }}
                  className="flex items-center gap-1 font-semibold text-[#0B1727] dark:text-white hover:text-[#DC2626] cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.company}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-[#DC2626]">
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  <span>{lead.email}</span>
                </a>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-red-500" />
                  <span>{lead.phone}</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => showToast(`Opening edit details drawer for ${lead.name}`, 'info')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-[#F8FAFC] shadow-2xs transition cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-[#5A6A80]" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => showToast(`Log call / activity for ${lead.name}`, 'info')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-[#F8FAFC] shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#5A6A80]" />
              <span>Add Activity</span>
            </button>
            <button
              onClick={() => showToast(`Follow-up scheduled with ${lead.name} on Google Calendar`, 'success')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-[#F8FAFC] shadow-2xs transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#5A6A80]" />
              <span>Schedule Follow-up</span>
            </button>
            <button
              onClick={() => onConvertToOpportunity && onConvertToOpportunity(lead)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <ArrowRightCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Convert to Opportunity</span>
            </button>
            <button
              onClick={() => showToast(`Actions menu for ${lead.name}`, 'info')}
              className="p-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] hover:bg-slate-50 dark:hover:bg-[#111E34] text-slate-400 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Ribbon (Matching Image 3 & 4) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block">Estimated Value</span>
            <span className="font-bold text-base text-[#0B1727] dark:text-white mt-0.5 block">
              {lead.estimatedValue}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block">Lead Owner</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-5 h-5 rounded-full bg-[#0B1727] text-white text-[9px] font-bold flex items-center justify-center">
                AM
              </span>
              <span className="font-semibold text-[#0B1727] dark:text-white">{lead.owner}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block">Source Channel</span>
            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Inbound {lead.source}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block">Service Interest</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block truncate">
              {lead.service}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block">Created Date</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
              {lead.createdDate}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block">Last Contact</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
              {lead.lastContact}
            </span>
          </div>

          {/* Next Follow-Up Highlighted Box */}
          <div className="p-2 rounded-lg bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
            <span className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3 h-3 text-red-600" /> Next Follow-Up
            </span>
            <span className="font-bold text-xs text-red-700 dark:text-red-300 mt-0.5 block">
              {lead.nextFollowUp}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TABS NAVIGATION (Matching Image 3 & 4)                                */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-[#E2E6EC] dark:border-[#152238] overflow-x-auto custom-scrollbar pb-1 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'activities', label: 'Activities (14)' },
          { id: 'communication', label: 'Communication' },
          { id: 'opportunities', label: 'Opportunities (1)' },
          { id: 'documents', label: 'Documents (3)' },
          { id: 'notes', label: 'Notes (4)' },
          { id: 'audit', label: 'Audit Timeline' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-t-lg transition whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-white dark:bg-[#0B1424] text-[#0B1727] dark:text-white border-b-2 border-[#DC2626] font-bold'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0B1727]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN TWO-COLUMN WORKSPACE (Left 68%, Right 32%)                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Deep Operational Profile (8 of 12 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card A: IMMEDIATE HIGH-LEVERAGE TASK (Matching Image 4) */}
          <div className="bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/60 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                      IMMEDIATE HIGH-LEVERAGE TASK
                    </span>
                    <span className="text-[10px] text-slate-500">• Due Today at 11:00 AM</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#0B1727] dark:text-white mt-0.5">
                    Call Arjun regarding revised inbound ROI projection model
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Proposal revision sent yesterday at 4:30 PM. Lead opened attachment twice this morning from Bengaluru IP.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setTaskDone(!taskDone)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition ${
                    taskDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0B1727] hover:bg-slate-800 text-white'
                  }`}
                >
                  {taskDone ? 'Completed ✓' : 'Mark Done'}
                </button>
                <button
                  onClick={() => showToast(`Rescheduled call with ${lead.name} to tomorrow 11:00 AM`, 'info')}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-[#111E34] transition cursor-pointer"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Lead Information & Contact Vectors (Matching Image 4) */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC] flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Lead Information &amp; Contact Vectors</span>
              </h3>
              <button
                onClick={() => showToast(`Edit modal opened for ${lead.name}`, 'info')}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#DC2626] flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3 h-3" />
                <span>Edit Record</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 mt-4 text-xs">
              <div>
                <span className="text-[11px] text-[#8492A6] block">Full Legal Name</span>
                <span className="font-bold text-[#0B1727] dark:text-white mt-0.5 block">{lead.name}</span>
              </div>

              <div>
                <span className="text-[11px] text-[#8492A6] block">Acquisition Channel</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  Organic Search (Google SEO)
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#8492A6] block">Account / Organization</span>
                <span className="font-bold text-[#0B1727] dark:text-white mt-0.5 block">
                  {lead.company} Pvt Ltd
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#8492A6] block">Attribution Campaign</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  Q3 B2B Tech Retargeting
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#8492A6] block">Work Email Address</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {lead.email}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#8492A6] block">Target Service Tier</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  Omnichannel Scale Retainer
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#8492A6] block">Primary Mobile Number</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {lead.phone}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#8492A6] block">Assigned Lead Owner</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  Alex Morgan (Sr. Enterprise AE)
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#8492A6] block">Designation / Role</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {lead.designation}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#8492A6] block">Timezone / Location</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  Asia/Kolkata (UTC +5:30)
                </span>
              </div>
            </div>
          </div>

          {/* Card C: Qualification & Discovery Intelligence (BANT Framework) (Matching Image 4) */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC] flex items-center gap-2">
                <Compass className="w-4 h-4 text-red-600" />
                <span>Qualification &amp; Discovery Intelligence</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                BANT Framework Confirmed
              </span>
            </div>

            {/* 3 Metric blocks row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C]">
                <span className="text-[10px] font-bold uppercase text-[#8492A6]">Allocated Monthly Budget</span>
                <span className="font-bold text-base text-[#0B1727] dark:text-white mt-1 block">
                  ₹1.00L – ₹1.50L
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Pre-approved FY26
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C]">
                <span className="text-[10px] font-bold uppercase text-[#8492A6]">Decision Authority</span>
                <span className="font-bold text-base text-[#0B1727] dark:text-white mt-1 block">
                  High (Sign-off)
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Joint sign with CFO (Meera Sen)
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C]">
                <span className="text-[10px] font-bold uppercase text-[#8492A6]">Implementation Timeline</span>
                <span className="font-bold text-base text-[#0B1727] dark:text-white mt-1 block">
                  &lt; 30 Days
                </span>
                <span className="text-[10px] text-red-600 font-semibold mt-0.5 flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> Immediate onboarding wanted
                </span>
              </div>
            </div>

            {/* Primary Strategic Pain Point */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080E18] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                PRIMARY STRATEGIC PAIN POINT
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {lead.painPoint}
              </p>
            </div>

            {/* Target 90-Day Conversion Objective */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080E18] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                TARGET 90-DAY CONVERSION OBJECTIVE
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {lead.targetObjective}
              </p>
            </div>
          </div>

          {/* Card D: Company Profile — Acme Technologies (Matching Image 4) */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Company Profile — {lead.company}</span>
              </h3>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('companies');
                  else showToast(`Navigating to company profile for ${lead.company}`, 'info');
                }}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#DC2626] flex items-center gap-1 cursor-pointer"
              >
                <span>View Company Record</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0A101C]">
                <span className="text-[10px] font-bold uppercase text-[#8492A6]">Industry Vertical</span>
                <span className="font-semibold text-slate-800 dark:text-white mt-1 block">
                  Enterprise SaaS / Cloud HRTech
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0A101C]">
                <span className="text-[10px] font-bold uppercase text-[#8492A6]">Headcount Size</span>
                <span className="font-semibold text-slate-800 dark:text-white mt-1 block">
                  140 FTE (51-200 Tier)
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0A101C]">
                <span className="text-[10px] font-bold uppercase text-[#8492A6]">Annual Revenue</span>
                <span className="font-bold text-[#0B1727] dark:text-white mt-1 block">
                  ₹32 Cr ARR (~$3.9M USD)
                </span>
              </div>
            </div>

            {/* Location Map & HQ Vector */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0A101C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-[#1E293B] flex items-center justify-center shrink-0 overflow-hidden border border-slate-300 dark:border-slate-700">
                  <MapPin className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <span className="font-bold text-[#0B1727] dark:text-white block">Global Headquarters</span>
                  <p className="text-[11px] text-red-600 font-medium mt-0.5">
                    Outer Ring Road, Koramangala 4th Block, Bengaluru 560034
                  </p>
                  <p className="text-[10px] text-slate-400">URL: acmetechnologies.io</p>
                </div>
              </div>
              <button
                onClick={() => showToast('Technology stack: Next.js, AWS, Segment, HubSpot, Google Tag Manager', 'info')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-[#111E34] transition cursor-pointer"
              >
                Explore Tech Stack
              </button>
            </div>
          </div>

          {/* Card E: Recent Engagements (Matching Image 4) */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC] flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Recent Engagements</span>
              </h3>
              <button
                onClick={() => {
                  setActiveTab('activities');
                  showToast('Viewing full chronological engagement timeline', 'info');
                }}
                className="text-xs font-semibold text-[#0B1727] dark:text-white hover:text-[#DC2626] cursor-pointer"
              >
                View All 14 Activities →
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Engagement 1 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0A101C] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0B1727] dark:text-white">
                      Email Proposal Opened (Revision v2.1)
                    </span>
                    <span className="text-[10px] text-slate-400">08 Sep - 04:42 PM</span>
                  </div>
                  <p className="text-[11px] text-red-600 mt-1">
                    Arjun opened attachment &ldquo;OptiVir_Growth_Engine_SOW_Acme.pdf&rdquo; from macOS Mail Client.
                  </p>
                </div>
              </div>

              {/* Engagement 2 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0A101C] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0B1727] dark:text-white">
                      Discovery &amp; Technical Review Call
                    </span>
                    <span className="text-[10px] text-slate-400">07 Sep - 02:30 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Duration 38 min. Discussed attribution discrepancies. CFO approved preliminary procurement packet.
                  </p>
                </div>
              </div>

              {/* Engagement 3 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0A101C] flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0B1727] dark:text-white">
                      Website Form Submission: Tier-1 Enterprise Audit
                    </span>
                    <span className="text-[10px] text-slate-400">05 Sep - 10:15 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Lead entered system via high-intent pricing calculator page.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card F: Internal Strategic Notes (Matching Image 3) */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-[#0B1727] dark:text-[#F8FAFC] flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Internal Strategic Notes</span>
              </h3>
              <button
                onClick={() => setShowAddNoteModal(true)}
                className="text-xs font-semibold text-[#DC2626] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>

            {notesList.map((n) => (
              <div key={n.id} className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                    PINNED EXECUTIVE NOTE
                  </span>
                  <span className="text-[10px] text-slate-400">{n.date}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed italic">
                  &ldquo;{n.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Account Ownership, Fit Score & Shortcuts (4 of 12 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Account Ownership (Matching Image 4) */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block mb-3">
              Account Ownership
            </span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0F2747] to-[#DC2626] text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                  alt="Alex Morgan"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span>AM</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0B1727] dark:text-white">Alex Morgan</h4>
                <p className="text-[11px] text-slate-500">Senior Enterprise Director - Revenue Team</p>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online &amp; Available
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
              <button 
                onClick={() => showToast('Slack direct message channel opened with Alex Morgan', 'info')}
                className="py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#111E34] text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Slack DM</span>
              </button>
              <button 
                onClick={() => showToast('Reassign Account: Select new account owner from dropdown in edit lead', 'info')}
                className="py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#111E34] text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reassign</span>
              </button>
            </div>
          </div>

          {/* Card 2: Predictive Fit Score (Gauge) (Matching Image 4) */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider">
                Predictive Fit Score
              </span>
              <span className="px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                92nd Percentile
              </span>
            </div>

            {/* Circular Gauge Diagram */}
            <div className="relative flex items-center justify-center my-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="9" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#0B1727"
                  strokeWidth="9"
                  strokeDasharray="195 238.7"
                  strokeDashoffset="0"
                  className="dark:stroke-white"
                />
              </svg>
              <div className="absolute text-center pointer-events-none">
                <span className="text-2xl font-black text-[#0B1727] dark:text-white">82</span>
                <span className="text-[10px] text-slate-400 block font-bold">/ 100 SCORE</span>
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Engagement Frequency</span>
                  <span className="font-bold text-slate-900 dark:text-white">38 / 40</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#111E34] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#0B1727] dark:bg-white h-full rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Firmographic ICP Alignment</span>
                  <span className="font-bold text-slate-900 dark:text-white">28 / 30</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#111E34] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '93%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Pipeline Velocity Index</span>
                  <span className="font-bold text-slate-900 dark:text-white">16 / 30</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#111E34] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '53%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Classification & Tags (Matching Image 4) */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block mb-3">
              Classification &amp; Tags
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {['#B2B-SaaS', '#Koramangala-Hub', '#Fast-Close-Q3', '#Attribution-Upgrade', '#Budget-Approved'].map((t) => (
                <span
                  key={t}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                    t === '#Fast-Close-Q3'
                      ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900'
                      : 'bg-slate-100 dark:bg-[#111E34] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t}
                </span>
              ))}
              <button 
                onClick={() => {
                  const tag = window.prompt('Enter new classification tag:');
                  if (tag) showToast(`Added tag #${tag.replace(/^#/, '')} to lead`, 'success');
                }}
                className="px-2 py-1 rounded-md border border-dashed border-slate-300 dark:border-slate-700 text-[11px] text-slate-500 hover:text-black dark:hover:text-white transition cursor-pointer"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* Card 4: Associated Records (Matching Image 4) */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs space-y-2.5">
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block">
              Associated Records
            </span>

            <div 
              onClick={() => showToast('Navigating to linked Deal: Acme Tech Retainer', 'info')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#111E34] cursor-pointer transition"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-bold text-xs text-[#0B1727] dark:text-white">Acme Tech Retainer</p>
                  <p className="text-[10px] text-slate-500">Qualified Stage • ₹75k/mo</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div 
              onClick={() => showToast('Navigating to contact record: Meera Sen (CFO)', 'info')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101C] flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#111E34] cursor-pointer transition"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-bold text-xs text-[#0B1727] dark:text-white">Meera Sen (CFO)</p>
                  <p className="text-[10px] text-slate-500">Financial Sign-off Contact</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Card 5: Execution Shortcuts (Matching Image 4) */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs">
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block mb-3">
              Execution Shortcuts
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button 
                onClick={() => showToast(`NDA packet dispatched to ${lead.email || lead.company}`, 'success')}
                className="py-2.5 px-3 rounded-xl bg-[#0B1727] hover:bg-slate-800 text-white flex items-center gap-2 transition cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send NDA</span>
              </button>

              <button 
                onClick={() => showToast(`Custom pricing quote generated for ${lead.company}`, 'success')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#111E34] text-slate-800 dark:text-white flex items-center gap-2 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Quote</span>
              </button>

              <button 
                onClick={() => {
                  showToast('Starting Optivir Video Conference Room...', 'info');
                  window.open('https://meet.google.com/new', '_blank');
                }}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#111E34] text-slate-800 dark:text-white flex items-center gap-2 transition cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Launch Zoom</span>
              </button>

              <button
                onClick={() => onConvertToOpportunity && onConvertToOpportunity(lead)}
                className="py-2.5 px-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center gap-2 transition cursor-pointer"
              >
                <ArrowRightCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Convert Deal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-[#0B1727] dark:text-white">Add Internal Strategic Note</h4>
              <button onClick={() => setShowAddNoteModal(false)} className="text-slate-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-3 text-xs">
              <textarea
                rows={4}
                required
                placeholder="Write strategic observation or meeting takeaway..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] text-[#0B1727] dark:text-white outline-none focus:border-[#DC2626]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#DC2626] text-white font-semibold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
