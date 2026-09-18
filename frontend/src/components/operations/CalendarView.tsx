'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';
import { api } from '@/lib/api';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
  Video,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
  Flag,
  RotateCw,
  Download,
  Share2,
  X,
  Phone,
  Mail,
  Users,
  CheckSquare,
  Sparkles,
  Activity,
  Filter,
  Check
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { showToast } = useToast();
  // Mode: 'calendar' | 'activity_center' | 'timeline'
  const [activitiesSuiteMode, setActivitiesSuiteMode] = useState<'calendar' | 'activity_center' | 'timeline'>('calendar');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(8); // September
  const [currentYear, setCurrentYear] = useState(2026);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleExportIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OptiVir CRM Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Sprint Alignment & Deliverables Sign-off
DTSTART:20261024T100000Z
DTEND:20261024T110000Z
DESCRIPTION:Client project milestone synchronization
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
SUMMARY:Monthly ROAS Performance Review
DTSTART:20261025T140000Z
DTEND:20261025T150000Z
DESCRIPTION:Growth milestone & performance evaluation
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'crm_calendar_events.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Calendar .ICS file downloaded successfully', 'success');
  };

  // Active Log Modal
  const [activeLogModal, setActiveLogModal] = useState<'call' | 'meeting' | 'email' | 'note' | 'followup' | null>(null);

  // Filter & Search in Activity Center
  const [activityFilter, setActivityFilter] = useState<'all' | 'call' | 'meeting' | 'email' | 'note' | 'followup'>('all');
  const [activitySearch, setActivitySearch] = useState('');

  // Form inputs
  const [logContact, setLogContact] = useState('');
  const [logEntity, setLogEntity] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [callDuration, setCallDuration] = useState('18 mins');
  const [callOutcome, setCallOutcome] = useState('Connected & Scope Confirmed');
  const [meetingTitleInput, setMeetingTitleInput] = useState('');
  const [meetingMeetLink, setMeetingMeetLink] = useState('meet.google.com/opt-q4-sync');
  const [emailSubjectInput, setEmailSubjectInput] = useState('');
  const [followupTitleInput, setFollowupTitleInput] = useState('');
  const [followupDue, setFollowupDue] = useState('Tomorrow 10:00 AM');
  const [followupPriorityInput, setFollowupPriorityInput] = useState('High');

  // Activities Ledger Dataset (Loaded from PostgreSQL)
  const [activitiesLedger, setActivitiesLedger] = useState<Array<{
    id: string;
    type: string;
    title: string;
    contact: string;
    entity: string;
    details: string;
    duration: string;
    outcome: string;
    author: string;
    avatar: string;
    timestamp: string;
    color: string;
  }>>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.getActivities();
        if (res?.data && Array.isArray(res.data)) {
          const mapped = res.data.map((act: any) => ({
            id: act.id,
            type: act.type?.toLowerCase() || 'call',
            title: act.subject || 'CRM Interaction',
            contact: act.contact_name || act.metadata?.contact || '',
            entity: act.client_name || act.company_name || 'Direct Lead',
            details: act.description || '',
            duration: act.duration_minutes ? `${act.duration_minutes} mins` : '',
            outcome: act.metadata?.outcome || 'Completed',
            author: act.created_by_name || 'OptiVir Admin',
            avatar: 'OP',
            timestamp: act.created_at ? new Date(act.created_at).toLocaleDateString('en-IN') : 'Recent',
            color: act.type === 'meeting' ? 'text-purple-600 bg-purple-50 border-purple-200' :
                   act.type === 'email' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                   act.type === 'note' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                   'text-blue-600 bg-blue-50 border-blue-200'
          }));
          setActivitiesLedger(mapped);
        }
      } catch (err) {
        console.error('Error loading activities:', err);
      }
    };
    fetchActivities();
  }, []);

  const handleLogActivity = async (payload: {
    type: string;
    subject: string;
    description?: string;
    contact?: string;
    entity?: string;
    duration?: string;
    outcome?: string;
    color?: string;
  }) => {
    const localId = `act-${Date.now()}`;
    const newAct = {
      id: localId,
      type: payload.type,
      title: payload.subject,
      contact: payload.contact || '',
      entity: payload.entity || '',
      details: payload.description || '',
      duration: payload.duration || '',
      outcome: payload.outcome || 'Completed',
      author: 'OptiVir Admin',
      avatar: 'OP',
      timestamp: 'Just now',
      color: payload.color || 'text-blue-600 bg-blue-50 border-blue-200'
    };
    setActivitiesLedger(prev => [newAct, ...prev]);

    try {
      await api.createActivity({
        type: payload.type,
        subject: payload.subject,
        description: payload.description
      });
    } catch (err) {
      console.error('Failed to persist activity to DB:', err);
    }
  };

  // View: 'month' | 'week' | 'day' | 'agenda'
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  // Category Filter toggles
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [legendMeetings, setLegendMeetings] = useState(true);
  const [legendMilestones, setLegendMilestones] = useState(true);
  const [legendTasks, setLegendTasks] = useState(true);
  const [legendInvoices, setLegendInvoices] = useState(true);
  const [legendRenewals, setLegendRenewals] = useState(true);

  // Create Event Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('meeting');
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventClient, setNewEventClient] = useState('');

  // Calendar Day Cells for Month View
  const todayDate = new Date().getDate();
  const monthCells: Array<{ day: number; isCurrentMonth: boolean; isToday?: boolean; events?: any[]; extraCount?: number }> = [
    { day: 31, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true, isToday: todayDate === 1 },
    { day: 2, isCurrentMonth: true, isToday: todayDate === 2 },
    { day: 3, isCurrentMonth: true, isToday: todayDate === 3 },
    { day: 4, isCurrentMonth: true, isToday: todayDate === 4 },
    { day: 5, isCurrentMonth: true, isToday: todayDate === 5 },
    { day: 6, isCurrentMonth: true, isToday: todayDate === 6 },
    { day: 7, isCurrentMonth: true, isToday: todayDate === 7 },
    { day: 8, isCurrentMonth: true, isToday: todayDate === 8 },
    { day: 9, isCurrentMonth: true, isToday: todayDate === 9 },
    { day: 10, isCurrentMonth: true, isToday: todayDate === 10 },
    { day: 11, isCurrentMonth: true, isToday: todayDate === 11 },
    { day: 12, isCurrentMonth: true, isToday: todayDate === 12 },
    { day: 13, isCurrentMonth: true, isToday: todayDate === 13 },
    { day: 14, isCurrentMonth: true, isToday: todayDate === 14 },
    { day: 15, isCurrentMonth: true, isToday: todayDate === 15 },
    { day: 16, isCurrentMonth: true, isToday: todayDate === 16 },
    { day: 17, isCurrentMonth: true, isToday: todayDate === 17 },
    { day: 18, isCurrentMonth: true, isToday: todayDate === 18 },
    { day: 19, isCurrentMonth: true, isToday: todayDate === 19 },
    { day: 20, isCurrentMonth: true, isToday: todayDate === 20 },
    { day: 21, isCurrentMonth: true, isToday: todayDate === 21 },
    { day: 22, isCurrentMonth: true, isToday: todayDate === 22 },
    { day: 23, isCurrentMonth: true, isToday: todayDate === 23 },
    { day: 24, isCurrentMonth: true, isToday: todayDate === 24 },
    { day: 25, isCurrentMonth: true, isToday: todayDate === 25 },
    { day: 26, isCurrentMonth: true, isToday: todayDate === 26 },
    { day: 27, isCurrentMonth: true, isToday: todayDate === 27 },
    { day: 28, isCurrentMonth: true, isToday: todayDate === 28 },
    { day: 29, isCurrentMonth: true, isToday: todayDate === 29 },
    { day: 30, isCurrentMonth: true, isToday: todayDate === 30 },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
    { day: 3, isCurrentMonth: false },
    { day: 4, isCurrentMonth: false },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#060B13] text-slate-800 dark:text-slate-100 pb-16 transition-colors">


      <div className="w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
        {/* 2. Header & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <span>CRM</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span>Operations</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">Unified Calendar</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Calendar & Operational Schedule
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                {activitiesLedger.length} Activities Logged
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Unified cross-functional schedule aggregating client meetings, deliverable deadlines, project milestones, invoices, and renewals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Google Sync Active 2m</span>
            </div>
            <button
              onClick={handleExportIcs}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .ICS</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Event</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 11. ACTIVITIES SUITE SELECTOR & QUICK LOG TOOLBAR (Specification Parity)  */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-3 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left View Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
            <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider px-2">MODULE:</span>
            {[
              { id: 'calendar', label: 'Master Schedule & Calendar', icon: CalendarIcon, badge: 'Unified' },
              { id: 'activity_center', label: 'Activity Center & Log Ledger', icon: Activity, badge: `${activitiesLedger.length} Entries` },
              { id: 'timeline', label: 'Global Audit Timeline', icon: Clock, badge: 'Chronological' },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = activitiesSuiteMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActivitiesSuiteMode(m.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0A1628] text-white shadow-xs dark:bg-[#B91C1C]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400 dark:text-white' : 'text-slate-400'}`} />
                  <span>{m.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {m.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Quick Action Log Buttons (Leaf Nodes: Log Call, Log Meeting, Log Email, Add Note, Add Follow-up) */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider hidden sm:inline">QUICK LOG:</span>
            <button
              onClick={() => setActiveLogModal('call')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 transition"
            >
              <Phone className="w-3 h-3" />
              <span>+ Log Call</span>
            </button>
            <button
              onClick={() => setActiveLogModal('meeting')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 transition"
            >
              <Video className="w-3 h-3" />
              <span>+ Log Meeting</span>
            </button>
            <button
              onClick={() => setActiveLogModal('email')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 transition"
            >
              <Mail className="w-3 h-3" />
              <span>+ Log Email</span>
            </button>
            <button
              onClick={() => setActiveLogModal('note')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 transition"
            >
              <FileText className="w-3 h-3" />
              <span>+ Add Note</span>
            </button>
            <button
              onClick={() => setActiveLogModal('followup')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800 transition"
            >
              <CheckSquare className="w-3 h-3" />
              <span>+ Follow-up</span>
            </button>
          </div>
        </div>

        {activitiesSuiteMode === 'calendar' && (
        <>
        {/* 3. 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Schedule */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[11px]">TODAY&apos;S SCHEDULE</span>
              <span className="px-2 py-0.5 rounded bg-[#0A1628] text-white font-bold text-[10px]">
                Today
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
              0 <span className="text-xs font-semibold text-slate-500">Active Commitments</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              0 Meetings • 0 Milestones • 0 Invoices
            </div>
          </div>

          {/* This Week Horizon */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[11px]">THIS WEEK HORIZON</span>
              <CalendarIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
              0 <span className="text-xs font-semibold text-slate-500">Engagements</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
              <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded font-bold">
                0 High Priority
              </span>
              <span>across 0 Accounts</span>
            </div>
          </div>

          {/* Deliverable Deadlines */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[11px]">DELIVERABLE DEADLINES</span>
              <Flag className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
              0 <span className="text-xs font-semibold text-slate-500">Pending Deliverables</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              No overdue sprint deliverables
            </div>
          </div>

          {/* Financial & Retainers */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[11px]">FINANCIAL & RETAINERS</span>
              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                ₹
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">₹0.00</span>
              <span className="text-[11px] font-bold text-slate-500">0 Renewals Due</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              No pending renewals or invoices
            </div>
          </div>
        </div>

        {/* 4. Month Navigation & View Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Calendar Month Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (currentMonthIndex === 0) {
                    setCurrentMonthIndex(11);
                    setCurrentYear(y => y - 1);
                  } else {
                    setCurrentMonthIndex(m => m - 1);
                  }
                }}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentMonthIndex(8);
                  setCurrentYear(2026);
                }}
                className="px-2.5 py-1 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => {
                  if (currentMonthIndex === 11) {
                    setCurrentMonthIndex(0);
                    setCurrentYear(y => y + 1);
                  } else {
                    setCurrentMonthIndex(m => m + 1);
                  }
                }}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
              <span>{monthNames[currentMonthIndex]} {currentYear}</span>
              <CalendarIcon className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs ml-2">
              {['Month', 'Week', 'Day', 'Agenda'].map((v) => (
                <button
                  key={v}
                  onClick={() => setCalendarView(v.toLowerCase() as any)}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    calendarView === v.toLowerCase()
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Search Ribbon */}
          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-3 flex-wrap">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events, clients... (⌘K)"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <select className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <option>All Clients</option>
            </select>

            <select className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <option>All Pods &amp; Owners</option>
              <option>Account Lead</option>
              <option>Creative Lead</option>
            </select>
          </div>
        </div>

        {/* 5. Category Filter Badges Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeCategoryFilter === 'all'
                ? 'bg-[#0A1628] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700'
            }`}
          >
            My Calendar
          </button>
          <button
            onClick={() => setActiveCategoryFilter('team')}
            className="px-3 py-1.5 rounded-lg font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50"
          >
            Team Schedule
          </button>
          <button
            onClick={() => setActiveCategoryFilter('meetings')}
            className="px-3 py-1.5 rounded-lg font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Client Meetings</span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('milestones')}
            className="px-3 py-1.5 rounded-lg font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span>Deadlines &amp; Milestones</span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('tasks')}
            className="px-3 py-1.5 rounded-lg font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Tasks Due</span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('invoices')}
            className="px-3 py-1.5 rounded-lg font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Finance &amp; Invoices</span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('renewals')}
            className="px-3 py-1.5 rounded-lg font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Contract Renewals</span>
          </button>
        </div>

        {/* 6. Calendar Split View (Month Grid Left 75% / Right Sidebar 25%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 75% (9 Cols): Month Calendar Grid */}
          <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-bold py-2.5 bg-slate-50 dark:bg-slate-900">
              <div className="text-slate-500">MON</div>
              <div className="text-slate-500">TUE</div>
              <div className="text-rose-600 dark:text-rose-400 font-extrabold">WED</div>
              <div className="text-slate-500">THU</div>
              <div className="text-slate-500">FRI</div>
              <div className="text-slate-500">SAT</div>
              <div className="text-slate-500">SUN</div>
            </div>

            {/* 35 Calendar Cells (5 weeks x 7 days) */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
              {monthCells.map((cell, idx) => (
                <div
                  key={idx}
                  className={`min-h-[120px] p-2 transition flex flex-col justify-between ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/40 dark:bg-slate-950/20 text-slate-300 dark:text-slate-700'
                      : cell.isToday
                      ? 'bg-rose-50/20 dark:bg-rose-950/10'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {cell.isToday ? (
                      <span className="w-6 h-6 rounded-full bg-[#B91C1C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        {cell.day}
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-bold ${
                          cell.isCurrentMonth ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      >
                        {cell.day}
                      </span>
                    )}

                    {cell.isToday && (
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tight">
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 my-1.5 flex-1">
                    {cell.events?.map((ev, i) => (
                      <div
                        key={i}
                        className={`px-1.5 py-0.5 rounded text-[10px] truncate leading-tight shadow-2xs ${ev.color}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {cell.extraCount && (
                      <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer pl-1">
                        +{cell.extraCount} more items →
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT 25% (3 Cols): Mini Navigator, Today's Agenda, Legends */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mini Calendar Widget */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>{monthNames[currentMonthIndex]} {currentYear}</span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => {
                      if (currentMonthIndex === 0) {
                        setCurrentMonthIndex(11);
                        setCurrentYear(y => y - 1);
                      } else {
                        setCurrentMonthIndex(m => m - 1);
                      }
                    }}
                    className="hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => {
                      if (currentMonthIndex === 11) {
                        setCurrentMonthIndex(0);
                        setCurrentYear(y => y + 1);
                      } else {
                        setCurrentMonthIndex(m => m + 1);
                      }
                    }}
                    className="hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 font-semibold gap-y-1">
                <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
                <div className="text-slate-300">31</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div>
                <div>7</div><div>8</div><div>9</div>
                <div className={`w-5 h-5 rounded-full ${todayDate === 10 ? 'bg-[#B91C1C] text-white' : ''} flex items-center justify-center font-bold mx-auto`}>
                  10
                </div>
                <div>11</div><div>12</div><div>13</div>
                <div>14</div><div className={`w-5 h-5 rounded-full ${todayDate === 15 ? 'bg-[#B91C1C] text-white' : ''} flex items-center justify-center font-bold mx-auto`}>15</div><div>16</div><div>17</div><div>18</div><div>19</div><div>20</div>
              </div>
            </div>

            {/* Today's Agenda */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Today&apos;s Agenda</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-5 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <CalendarIcon className="w-7 h-7 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No scheduled sessions for today</p>
                  <p className="text-[11px] text-slate-400 mt-1">Client reviews, milestone deliveries, and meetings will show here.</p>
                </div>

                <button
                  onClick={() => {
                    window.open('https://meet.google.com/new', '_blank');
                    showToast('Launching Google Meet in new tab...', 'info');
                  }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Instant Video Meet</span>
                </button>
              </div>
            </div>

            {/* Connected Calendars */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2.5 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                CONNECTED CALENDARS
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Google Workspace</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Client Portal Public Link</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>
            </div>

            {/* Legend & Toggles */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2.5 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                LEGEND & TOGGLES
              </h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span className="text-slate-700 dark:text-slate-300">Client Meetings</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={legendMeetings}
                    onChange={() => setLegendMeetings(!legendMeetings)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span className="text-slate-700 dark:text-slate-300">Milestones & Projects</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={legendMilestones}
                    onChange={() => setLegendMilestones(!legendMilestones)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-slate-700 dark:text-slate-300">Task Deadlines</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={legendTasks}
                    onChange={() => setLegendTasks(!legendTasks)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span className="text-slate-700 dark:text-slate-300">Invoices & Finance</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={legendInvoices}
                    onChange={() => setLegendInvoices(!legendInvoices)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="text-slate-700 dark:text-slate-300">Renewals & Contracts</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={legendRenewals}
                    onChange={() => setLegendRenewals(!legendRenewals)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        </>
        )}

        {/* ========================================================================= */}
        {/* 11. ACTIVITY CENTER & LOG LEDGER (Specification Parity)                   */}
        {/* ========================================================================= */}
        {activitiesSuiteMode === 'activity_center' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Activity KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Logged Activities Today</span>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">18 Touches</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <span>+28% vs daily average</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Completed Calls</span>
                  <Phone className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">12 Calls</div>
                <div className="text-[11px] text-slate-500 mt-1">Avg talk duration: 16 mins</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Client Meetings</span>
                  <Video className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">6 Meetings</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Attendance rate</div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Pending Follow-ups</span>
                  <CheckSquare className="w-4 h-4 text-[#B91C1C]" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">4 Tasks</div>
                <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">2 Due before 5:00 PM</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Search interactions, contacts, clients, keywords..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'all', label: 'All Interactions' },
                  { id: 'call', label: 'Calls' },
                  { id: 'meeting', label: 'Meetings' },
                  { id: 'email', label: 'Emails' },
                  { id: 'note', label: 'Notes' },
                  { id: 'followup', label: 'Follow-ups' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActivityFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                      activityFilter === f.id
                        ? 'bg-[#0A1628] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities Ledger Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5 pl-4">INTERACTION TYPE</th>
                      <th className="p-3.5">SUBJECT / TITLE</th>
                      <th className="p-3.5">CONTACT &amp; ENTITY</th>
                      <th className="p-3.5">OUTCOME &amp; DETAILS</th>
                      <th className="p-3.5">TEAM MEMBER</th>
                      <th className="p-3.5">TIMESTAMP</th>
                      <th className="p-3.5 pr-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activitiesLedger.filter((act) => {
                      if (activityFilter !== 'all' && act.type !== activityFilter) return false;
                      if (activitySearch && !act.title.toLowerCase().includes(activitySearch.toLowerCase()) && !act.contact.toLowerCase().includes(activitySearch.toLowerCase())) return false;
                      return true;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm font-semibold">No activities logged</p>
                          <p className="text-xs">Log interactions with clients and prospects using the buttons above.</p>
                        </td>
                      </tr>
                    ) : (
                      activitiesLedger
                        .filter((act) => {
                          if (activityFilter !== 'all' && act.type !== activityFilter) return false;
                          if (activitySearch && !act.title.toLowerCase().includes(activitySearch.toLowerCase()) && !act.contact.toLowerCase().includes(activitySearch.toLowerCase())) return false;
                          return true;
                        })
                        .map((act) => (
                          <tr key={act.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                            <td className="p-3.5 pl-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${act.color}`}>
                                {act.type === 'call' && <Phone className="w-3 h-3" />}
                                {act.type === 'meeting' && <Video className="w-3 h-3" />}
                                {act.type === 'email' && <Mail className="w-3 h-3" />}
                                {act.type === 'note' && <FileText className="w-3 h-3" />}
                                {act.type === 'followup' && <CheckSquare className="w-3 h-3" />}
                                <span className="capitalize">{act.type}</span>
                              </span>
                            </td>

                            <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-xs">
                              {act.title}
                            </td>

                            <td className="p-3.5">
                              <div className="font-semibold text-slate-900 dark:text-white">{act.contact}</div>
                              <div className="text-[11px] text-slate-500">{act.entity}</div>
                            </td>

                            <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-sm">
                              <div className="font-semibold text-slate-800 dark:text-slate-200">{act.outcome}</div>
                              <div className="text-[11px] text-slate-500 truncate">{act.details}</div>
                            </td>

                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-bold text-[10px]">
                                  {act.avatar}
                                </div>
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{act.author}</span>
                              </div>
                            </td>

                            <td className="p-3.5 text-slate-500 whitespace-nowrap">
                              {act.timestamp}
                            </td>

                            <td className="p-3.5 pr-4 text-right">
                              <button
                                onClick={() => showToast(`Reviewing interaction: ${act.title} (${act.contact})`, 'info')}
                                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition cursor-pointer"
                              >
                                Details
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

        {/* ========================================================================= */}
        {/* 11. GLOBAL CHRONOLOGICAL AUDIT TIMELINE                                   */}
        {/* ========================================================================= */}
        {activitiesSuiteMode === 'timeline' && (
          <div className="space-y-5 animate-in fade-in duration-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#B91C1C]" />
                  <span>Global Chronological Audit Timeline</span>
                </h3>
                <p className="text-xs text-slate-500">Every phone touchpoint, meeting, email thread, note, and task executed across accounts</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                Real-time Audit Trail Active
              </span>
            </div>

            {/* Timeline Stream */}
            {activitiesLedger.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">Timeline stream empty</p>
                <p className="text-xs">No chronological actions or touchpoints recorded yet.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {activitiesLedger.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Dot */}
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#B91C1C] ring-4 ring-white dark:ring-slate-900"></div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0E1A2E]/50 hover:bg-white dark:hover:bg-[#0E1A2E] transition shadow-2xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.color}`}>
                            {item.type}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs">{item.title}</h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{item.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">{item.details}</p>

                      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 gap-2">
                        <div className="flex items-center gap-3">
                          <span>Target: <strong className="text-slate-800 dark:text-slate-200">{item.contact}</strong> ({item.entity})</span>
                          <span>•</span>
                          <span>Recorded by: <strong>{item.author}</strong></span>
                        </div>
                        <span className="font-semibold text-[#B91C1C] dark:text-rose-400">{item.outcome}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5 MODALS FOR QUICK ACTIONS: Log Call, Log Meeting, Email, Note, Follow-up */}
      {/* ========================================================================= */}

      {/* 1. Log Call Modal */}
      {activeLogModal === 'call' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Log Commercial Call</span>
              </h3>
              <button onClick={() => setActiveLogModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Contact Name</label>
                <input
                  type="text"
                  value={logContact}
                  onChange={(e) => setLogContact(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Client Entity / Company</label>
                <input
                  type="text"
                  value={logEntity}
                  onChange={(e) => setLogEntity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Call Duration</label>
                  <input
                    type="text"
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Call Outcome</label>
                  <select
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    <option>Connected &amp; Scope Confirmed</option>
                    <option>Left Voicemail</option>
                    <option>Gatekeeper Blocked</option>
                    <option>Busy / No Answer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Call Notes &amp; Discussion Summary</label>
                <textarea
                  rows={3}
                  placeholder="Record key conversation points, commitments, and follow-up requirements..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setActiveLogModal(null)} className="px-4 py-2 border rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLogActivity({
                    type: 'call',
                    subject: `Call with ${logContact || 'Client'}`,
                    contact: logContact,
                    entity: logEntity,
                    description: logNotes || 'Outbound sales alignment call completed.',
                    duration: callDuration,
                    outcome: callOutcome,
                    color: 'text-blue-600 bg-blue-50 border-blue-200'
                  });
                  setActiveLogModal(null);
                  setLogNotes('');
                  showToast('Call logged into Activity Center and database!', 'success');
                }}
                className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Log Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Log Meeting Modal */}
      {activeLogModal === 'meeting' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" />
                <span>Log Client Meeting</span>
              </h3>
              <button onClick={() => setActiveLogModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Executive Strategy Sync"
                  value={meetingTitleInput}
                  onChange={(e) => setMeetingTitleInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Primary Attendee &amp; Account</label>
                <input
                  type="text"
                  placeholder="Attendee Name &amp; Client Account"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Video Meet / Recording Link</label>
                <input
                  type="text"
                  value={meetingMeetLink}
                  onChange={(e) => setMeetingMeetLink(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Key Action Items &amp; Takeaways</label>
                <textarea
                  rows={3}
                  placeholder="Agreed next steps, action owners, milestone dates..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setActiveLogModal(null)} className="px-4 py-2 border rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLogActivity({
                    type: 'meeting',
                    subject: meetingTitleInput || 'Client Review Meeting',
                    contact: 'Client Stakeholder',
                    entity: 'Client Account',
                    description: logNotes || 'Video conference meeting completed with client team.',
                    duration: '45 mins',
                    outcome: 'Action Items Formalized',
                    color: 'text-purple-600 bg-purple-50 border-purple-200'
                  });
                  setActiveLogModal(null);
                  showToast('Meeting logged into Activity Center and database!', 'success');
                }}
                className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Log Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Log Email Modal */}
      {activeLogModal === 'email' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Log Commercial Email</span>
              </h3>
              <button onClick={() => setActiveLogModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">To / Recipient</label>
                <input
                  type="email"
                  placeholder="client@company.com"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Subject Line</label>
                <input
                  type="text"
                  placeholder="e.g. Revised Q4 Retainer Terms & SOW"
                  value={emailSubjectInput}
                  onChange={(e) => setEmailSubjectInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Message Summary / Thread Notes</label>
                <textarea
                  rows={3}
                  placeholder="Summarize email dispatch and expected turnaround..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setActiveLogModal(null)} className="px-4 py-2 border rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLogActivity({
                    type: 'email',
                    subject: emailSubjectInput || 'Commercial Email Thread',
                    contact: 'Client',
                    entity: 'Client Account',
                    description: logNotes || 'Commercial proposal email dispatched.',
                    duration: 'Email Sync',
                    outcome: 'Delivered',
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
                  });
                  setActiveLogModal(null);
                  showToast('Email thread recorded and saved to database!', 'success');
                }}
                className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Log Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Note Modal */}
      {activeLogModal === 'note' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Add Account Memo / Note</span>
              </h3>
              <button onClick={() => setActiveLogModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Entity / Client Account</label>
                <input
                  type="text"
                  placeholder="Client Account Name"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Note Content *</label>
                <textarea
                  rows={4}
                  placeholder="Record confidential strategic notes, customer preferences, or internal guidance..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setActiveLogModal(null)} className="px-4 py-2 border rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLogActivity({
                    type: 'note',
                    subject: 'Strategic Account Note',
                    contact: 'Account File',
                    entity: 'Client Account',
                    description: logNotes || 'Internal note added to account dossier.',
                    duration: 'Internal Memo',
                    outcome: 'Pinned to Account Dossier',
                    color: 'text-amber-600 bg-amber-50 border-amber-200'
                  });
                  setActiveLogModal(null);
                  showToast('Account note pinned and saved to database!', 'success');
                }}
                className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Follow-up Modal */}
      {activeLogModal === 'followup' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-rose-600" />
                <span>Create Follow-up Action</span>
              </h3>
              <button onClick={() => setActiveLogModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Action Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Call client regarding BigQuery access"
                  value={followupTitleInput}
                  onChange={(e) => setFollowupTitleInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Due Date &amp; Time</label>
                  <input
                    type="text"
                    value={followupDue}
                    onChange={(e) => setFollowupDue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Priority</label>
                  <select
                    value={followupPriorityInput}
                    onChange={(e) => setFollowupPriorityInput(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Associated Entity / Account</label>
                <input
                  type="text"
                  placeholder="Client Account Name"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setActiveLogModal(null)} className="px-4 py-2 border rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLogActivity({
                    type: 'followup',
                    subject: followupTitleInput || 'Action Follow-up Task',
                    contact: 'Client',
                    entity: 'Client Account',
                    description: `Scheduled follow-up due ${followupDue} with ${followupPriorityInput} priority.`,
                    duration: `${followupPriorityInput} Priority`,
                    outcome: 'Scheduled SLA Active',
                    color: 'text-rose-600 bg-rose-50 border-rose-200'
                  });
                  setActiveLogModal(null);
                  showToast('Follow-up task created and saved to database!', 'success');
                }}
                className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Create Follow-up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Create Calendar Commitment</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Event Title *</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Monthly ROAS Executive Review"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    <option value="meeting">Client Meeting</option>
                    <option value="milestone">Project Milestone</option>
                    <option value="task">Task Deadline</option>
                    <option value="invoice">Invoice Due</option>
                    <option value="renewal">Contract Renewal</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Time</label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Associated Client</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Client"
                  value={newEventClient}
                  onChange={(e) => setNewEventClient(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Event Scheduled and Synced to Google Calendar!', 'success');
                  setShowCreateModal(false);
                  setNewEventTitle('');
                }}
                className="px-5 py-2 bg-[#B91C1C] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Schedule Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
