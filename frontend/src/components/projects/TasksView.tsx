'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Upload,
  Download,
  MoreVertical,
  X,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Paperclip,
  Send,
  User,
  Building2,
  ExternalLink,
  Kanban,
  ListFilter,
  Trash2,
  ChevronLeft,
  ChevronsRight
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // State Simulator
  const [activeSimulatorTab, setActiveSimulatorTab] = useState('1. Tasks List (Table)');
  const [currentPage, setCurrentPage] = useState(1);

  // View Mode: 'list' | 'kanban' | 'detail' | 'calendar'
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'detail' | 'calendar'>('list');

  // Filter Tabs
  const [activeFilterTab, setActiveFilterTab] = useState('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Selection
  const [selectedTasks, setSelectedTasks] = useState<string[]>(['t1', 't2', 't3']);

  // Active Task Detail (Defaults to #OPT-9492 matching Image 4)
  const [activeTask, setActiveTask] = useState<any>(null);

  // Time Tracker Stopwatch
  const [timerRunning, setTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(2538); // 00:42:18

  // New Comment
  const [newComment, setNewComment] = useState('');

  // Subtask checkbox state
  const [subtasksState, setSubtasksState] = useState([
    { id: 's1', title: 'Configure GCP Cloud Run Service & Deploy Base Container image', hours: 'Rated SG • 1.5h', done: true },
    { id: 's2', title: 'Map CNAME tag.acmetech.io & SSL Cert Verification', hours: 'Rated SG • 1.0h', done: true },
    { id: 's3', title: 'Implement Meta CAPI Client Tag in sGTM with Event Deduplication', hours: 'Rated SG • 3.0h', done: true },
    { id: 's4', title: 'Run Synthetic GA4 Purchase Payload Simulation & QA in DebugView', hours: 'Pending • Est. 2.5h', done: false },
  ]);

  // Tasks dataset matching Reference Image 4
  const [tasks, setTasks] = useState([
    {
      id: 't1',
      code: '#OPT-9492',
      title: 'Configure GA4 Server-Side Container & Meta CAPI',
      subtasksCount: '3/4 done',
      subtasksBadge: 'Depends on DNS',
      clientName: 'Acme Technologies',
      clientAvatar: 'AT',
      clientAvatarBg: 'bg-[#0A1628]',
      project: 'Acme Growth Campaign',
      milestone: 'Tracking Architecture',
      assignee: 'Rahul Menon',
      assigneeInitials: 'RM',
      priority: 'Urgent',
      status: 'In Progress',
      statusBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      timeline: 'Due Today (10 Sep)',
      timelineStart: 'Start: 06 Sep',
      timelineUrgent: true,
      timeActual: '5.5h',
      timeEst: '8.0h',
      timePercent: 68,
    },
    {
      id: 't2',
      code: '#OPT-9488',
      title: 'Deliver Batch 4 Ad Creatives (12 Video Variations)',
      subtasksCount: '12 Figma assets',
      subtasksBadge: 'Motion graphics QA ready',
      clientName: 'Acme Technologies',
      clientAvatar: 'AT',
      clientAvatarBg: 'bg-[#0A1628]',
      project: 'Acme Growth Campaign',
      milestone: 'Creative Production',
      assignee: 'Maya Joseph',
      assigneeInitials: 'MJ',
      priority: 'High',
      status: 'Review',
      statusBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
      timeline: '15 Sep 2026',
      timelineStart: 'Start: 05 Sep',
      timelineUrgent: false,
      timeActual: '14h',
      timeEst: '16h',
      timePercent: 88,
    },
    {
      id: 't3',
      code: '#OPT-9472',
      title: 'Reconcile Q3 Retainer Invoices & Razorpay Payouts',
      subtasksCount: 'Finance Sync',
      subtasksBadge: 'Blocking invoice dispatch',
      clientName: 'Zenith Retail Global',
      clientAvatar: 'ZR',
      clientAvatarBg: 'bg-[#0A1628]',
      project: 'Retainer Billing Ops',
      milestone: 'Finance Sync',
      assignee: 'Alex Morgan',
      assigneeInitials: 'AM',
      priority: 'Medium',
      status: 'To Do',
      statusBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      timeline: '12 Sep 2026',
      timelineStart: 'Start: 11 Sep',
      timelineUrgent: false,
      timeActual: '0h',
      timeEst: '4.0h',
      timePercent: 0,
    },
    {
      id: 't4',
      code: '#OPT-9461',
      title: 'Fix Mobile Viewport Breakpoints on Checkout Step 2',
      subtasksCount: 'Frontend Dev',
      subtasksBadge: 'Blocked: Awaiting client staging credentials',
      subtasksBlocked: true,
      clientName: 'Vertex Solutions',
      clientAvatar: 'VS',
      clientAvatarBg: 'bg-[#FEE2E2]',
      clientAvatarTextColor: 'text-rose-600',
      project: 'Website Revamp & CRO',
      milestone: 'Frontend Dev',
      assignee: 'Rahul Menon',
      assigneeInitials: 'RM',
      priority: 'Urgent',
      status: 'Blocked',
      statusBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
      timeline: 'Overdue (09 Sep)',
      timelineStart: 'Start: 04 Sep',
      timelineUrgent: true,
      timeActual: '4h',
      timeEst: '6.5h',
      timePercent: 62,
    },
    {
      id: 't5',
      code: '#OPT-9455',
      title: 'Draft Executive QBR Strategy Deck & Attribution Report',
      subtasksCount: 'Strategy C-Level Deliverable',
      clientName: 'Nova Healthcare',
      clientAvatar: 'NH',
      clientAvatarBg: 'bg-[#0A1628]',
      project: 'Q3 Performance Review',
      milestone: 'Attribution Modeling',
      assignee: 'Alex Morgan',
      assigneeInitials: 'AM',
      priority: 'High',
      status: 'In Progress',
      statusBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      timeline: '14 Sep 2026',
      timelineStart: 'Start: 07 Sep',
      timelineUrgent: false,
      timeActual: '6.5h',
      timeEst: '10h',
      timePercent: 65,
    },
    {
      id: 't6',
      code: '#OPT-9430',
      title: 'Client Bi-Weekly Sync & Performance Briefing',
      subtasksCount: 'Recording uploaded & minutes shared',
      clientName: 'Acme Technologies',
      clientAvatar: 'AT',
      clientAvatarBg: 'bg-[#0A1628]',
      project: 'Account Management',
      milestone: 'Sprint Sync',
      assignee: 'Alex Morgan',
      assigneeInitials: 'AM',
      priority: 'Medium',
      status: 'Done',
      statusBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
      timeline: 'Completed Today',
      timelineStart: 'Sprint Sync',
      timelineUrgent: false,
      timeActual: '1.5h',
      timeEst: '2.0h',
      timePercent: 75,
    },
  ]);

  // Set default active task
  useEffect(() => {
    if (!activeTask) {
      setActiveTask(tasks[0]);
    }
  }, [tasks, activeTask]);

  // Stopwatch effect
  useEffect(() => {
    let interval: any;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatStopwatch = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map((t) => t.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSubtask = (id: string) => {
    setSubtasksState((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClient = selectedClient === 'All' || t.clientName.includes(selectedClient);
    const matchesAssignee = selectedAssignee === 'All' || t.assignee.includes(selectedAssignee);
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;

    if (activeFilterTab === 'my') return matchesSearch && t.assignee.includes('Alex');
    if (activeFilterTab === 'overdue') return matchesSearch && t.timeline.includes('Overdue');
    if (activeFilterTab === 'due_today') return matchesSearch && t.timeline.includes('Due Today');
    if (activeFilterTab === 'high') return matchesSearch && (t.priority === 'Urgent' || t.priority === 'High');
    if (activeFilterTab === 'completed') return matchesSearch && t.status === 'Done';

    return matchesSearch && matchesClient && matchesAssignee && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#060B13] text-slate-800 dark:text-slate-100 pb-16 transition-colors">
      {/* 1. Tasks Interactive Workspace State Simulator Banner (Exact match to Reference Image 4) */}
      <div className="bg-[#0A1628] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-rose-400 uppercase text-[11px]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tasks Interactive Workspace:</span>
          </div>
          <div className="flex items-center gap-1 bg-[#102038] p-0.5 rounded-md border border-[#1A2E4E] flex-wrap">
            {[
              { id: '1. Tasks List (Table)', label: '1. Tasks List (Table)' },
              { id: '2. Kanban Board', label: '2. Kanban Board' },
              { id: '3. Task Detail (70/30)', label: '3. Task Detail (70/30)' },
              { id: '4. Create Task Drawer', label: '4. Create Task Drawer' },
              { id: '5. Calendar / Timeline', label: '5. Calendar / Timeline' },
              { id: '6. Mobile & Empty State', label: '6. Mobile & Empty State' },
            ].map((state) => (
              <button
                key={state.id}
                onClick={() => {
                  setActiveSimulatorTab(state.id);
                  if (state.id.includes('Kanban')) setViewMode('kanban');
                  else if (state.id.includes('Detail')) setViewMode('detail');
                  else if (state.id.includes('Calendar')) setViewMode('calendar');
                  else setViewMode('list');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  activeSimulatorTab === state.id
                    ? 'bg-[#B91C1C] text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {state.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto p-6 space-y-6">
        {/* 2. Header & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <span>CRM</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span>Operations</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">Tasks</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Tasks</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                46 Total • 12 My Open
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Plan, assign, prioritize, and complete operational work across clients, projects, and retainers.
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
                  showToast(`Importing tasks from "${file.name}"...`, 'info');
                  setTimeout(() => {
                    showToast(`Imported tasks successfully from "${file.name}"`, 'success');
                  }, 1000);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
            <button
              onClick={() => {
                exportToCsv(
                  'optivir_tasks_export.csv',
                  tasks.map((t) => ({
                    ID: t.code,
                    Title: t.title,
                    Project: t.project,
                    Client: t.clientName,
                    Assignee: t.assignee,
                    Priority: t.priority,
                    Status: t.status,
                    Timeline: t.timeline,
                    Hours: `${t.timeActual}/${t.timeEst}`,
                  }))
                );
                showToast(`Exported ${tasks.length} tasks to CSV`, 'success');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Batch Import</span>
            </button>
            <button
              onClick={() => showToast('Active task automations: 6 webhooks & Slack triggers running', 'info')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Automations</span>
            </button>
            <button
              onClick={() => {
                const newTask = {
                  id: `t-${Date.now()}`,
                  code: `#OPT-${Math.floor(1000 + Math.random() * 9000)}`,
                  title: 'New Commercial Deliverable Spec',
                  subtasksCount: '0/3 Subtasks',
                  subtasksBadge: 'Pending Kickoff',
                  clientName: 'Acme Technologies',
                  clientAvatar: 'AT',
                  clientAvatarBg: 'bg-[#0A1628]',
                  project: 'Enterprise Retainer',
                  milestone: 'Sprint Planning',
                  assignee: 'Alex Morgan',
                  assigneeInitials: 'AM',
                  priority: 'Medium',
                  status: 'In Progress',
                  statusBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
                  timeline: 'Next Week',
                  timelineStart: 'Today',
                  timelineUrgent: false,
                  timeActual: '0.0h',
                  timeEst: '8.0h',
                  timePercent: 0,
                };
                setTasks([newTask, ...tasks]);
                setActiveTask(newTask);
                setViewMode('detail');
                showToast('Draft task initialized in workspace detail', 'success');
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Task</span>
            </button>
          </div>
        </div>

        {/* 3. 5 KPI Summary Cards (Exact match to Reference Image 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* My Open Tasks */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-rose-600 dark:text-rose-400">MY OPEN TASKS</span>
              <CheckSquare className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">12</div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
              <span>● 4 urgent / high priority</span>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-rose-600 dark:text-rose-400">OVERDUE</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1.5">03</div>
            <div className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              <span>Requires escalation</span>
            </div>
          </div>

          {/* Due Today */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">DUE TODAY</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">07</div>
            <div className="text-[11px] text-slate-500 mt-1">Scheduled across 4 clients</div>
          </div>

          {/* Due This Week */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">DUE THIS WEEK</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">24</div>
            <div className="text-[11px] text-slate-500 mt-1">5 sprint 4 deliverables</div>
          </div>

          {/* Completed (MTD) */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">COMPLETED (MTD)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">86</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">94.2% on-time rate</div>
          </div>
        </div>

        {/* 4. Filter Tabs & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* View switch buttons */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'list'
                  ? 'bg-[#0A1628] text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'kanban'
                  ? 'bg-[#0A1628] text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'detail'
                  ? 'bg-[#0A1628] text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Task Detail (70/30)</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'calendar'
                  ? 'bg-[#0A1628] text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'my', label: 'My Tasks (12)' },
              { id: 'overdue', label: 'Overdue (3)', isAlert: true },
              { id: 'due_today', label: 'Due Today (7)' },
              { id: 'high', label: 'High Priority (9)' },
              { id: 'team', label: 'Team Tasks (34)' },
              { id: 'completed', label: 'Completed (86)' },
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
        </div>

        {/* 5. Search Ribbon & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, tags, clients, assignees... (⌘K)"
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-3 flex-wrap">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">All Clients</option>
              <option value="Acme Technologies">Acme Technologies</option>
              <option value="Zenith Retail Global">Zenith Retail Global</option>
              <option value="Vertex Solutions">Vertex Solutions</option>
              <option value="Nova Healthcare">Nova Healthcare</option>
            </select>

            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Assignee: All Team</option>
              <option value="Rahul Menon">Rahul Menon</option>
              <option value="Maya Joseph">Maya Joseph</option>
              <option value="Alex Morgan">Alex Morgan</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Priority: All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedClient('All');
                setSelectedAssignee('All');
                setSelectedPriority('All');
              }}
              className="text-xs font-semibold text-rose-600 px-2 py-1.5 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>

        {/* 6. Multi-Select Bar (Shown when items selected, exact match to Image 4) */}
        {selectedTasks.length > 0 && (
          <div className="bg-[#0A1628] text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-[#14233D] animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center">
                {selectedTasks.length}
              </span>
              <span className="text-xs font-bold">Tasks Selected</span>
              <button
                onClick={() => setSelectedTasks([])}
                className="text-slate-400 text-xs hover:text-white underline"
              >
                Deselect all
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => showToast(`Assigned ${selectedTasks.length} tasks to Maya Joseph`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium border border-slate-700 transition cursor-pointer"
              >
                Assign
              </button>
              <button
                onClick={() => showToast(`Set priority to High for ${selectedTasks.length} tasks`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium border border-slate-700 transition cursor-pointer"
              >
                Priority
              </button>
              <button
                onClick={() => showToast(`Due date shifted to Next Sprint for ${selectedTasks.length} tasks`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium border border-slate-700 transition cursor-pointer"
              >
                Due Date
              </button>
              <button
                onClick={() => showToast(`Added #SprintTarget tag to ${selectedTasks.length} tasks`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium border border-slate-700 transition cursor-pointer"
              >
                Add Tag
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedTasks.length} tasks?`)) {
                    setTasks(tasks.filter((t) => !selectedTasks.includes(t.id)));
                    setSelectedTasks([]);
                  }
                }}
                className="px-3 py-1 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded font-bold transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* 7. Tasks Table (Top half of Image 4) */}
        {(viewMode === 'list' || viewMode === 'detail') && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedTasks.length === tasks.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">TASK NAME & SUBTASKS</th>
                    <th className="p-3.5">CLIENT & CONTEXT</th>
                    <th className="p-3.5">PROJECT / MILESTONE</th>
                    <th className="p-3.5">ASSIGNEE</th>
                    <th className="p-3.5">PRIORITY</th>
                    <th className="p-3.5">STATUS</th>
                    <th className="p-3.5">TIMELINE</th>
                    <th className="p-3.5 pr-4">TIME (ACT/EST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTasks.map((task) => {
                    const isSelected = selectedTasks.includes(task.id);
                    const isActive = activeTask?.id === task.id;

                    return (
                      <tr
                        key={task.id}
                        onClick={() => {
                          setActiveTask(task);
                          setViewMode('detail');
                        }}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                          isActive
                            ? 'bg-rose-50/30 dark:bg-rose-950/20 border-l-4 border-[#B91C1C]'
                            : isSelected
                            ? 'bg-slate-50 dark:bg-slate-800/30'
                            : ''
                        }`}
                      >
                        <td className="p-3.5 pl-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(task.id)}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                        </td>

                        {/* Task Name & Subtasks */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 dark:text-white hover:text-rose-600 transition">
                              {task.title}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span>{task.subtasksCount}</span>
                              {task.subtasksBadge && (
                                <>
                                  <span>•</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded font-semibold ${
                                      task.subtasksBlocked
                                        ? 'text-rose-600 font-bold'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    {task.subtasksBadge}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Client & Context */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded ${task.clientAvatarBg} flex items-center justify-center text-[10px] font-bold ${
                                task.clientAvatarTextColor || 'text-white'
                              }`}
                            >
                              {task.clientAvatar}
                            </div>
                            <span className="font-semibold text-rose-600 dark:text-rose-400">
                              {task.clientName}
                            </span>
                          </div>
                        </td>

                        {/* Project / Milestone */}
                        <td className="p-3.5">
                          <div>
                            <div className="font-semibold text-rose-600 dark:text-rose-400">
                              {task.project}
                            </div>
                            <div className="text-[11px] text-slate-500">{task.milestone}</div>
                          </div>
                        </td>

                        {/* Assignee */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                              {task.assigneeInitials}
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {task.assignee}
                            </span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              task.priority === 'Urgent'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : task.priority === 'High'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${task.statusBg}`}>
                            {task.status}
                          </span>
                        </td>

                        {/* Timeline */}
                        <td className="p-3.5">
                          <div>
                            <div
                              className={`font-semibold ${
                                task.timelineUrgent
                                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {task.timeline}
                            </div>
                            <div className="text-[11px] text-slate-400">{task.timelineStart}</div>
                          </div>
                        </td>

                        {/* Time (Act/Est) */}
                        <td className="p-3.5 pr-4">
                          <div className="w-24 space-y-1">
                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                              {task.timeActual} / {task.timeEst}
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  task.priority === 'Urgent'
                                    ? 'bg-rose-600'
                                    : 'bg-[#0A1628] dark:bg-blue-500'
                                }`}
                                style={{ width: `${task.timePercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0A101C] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Showing 1-6 of 14 total tasks</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${
                      currentPage === p
                        ? 'font-bold bg-[#0A1628] text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. 70/30 Task Detail View (Exact match to Bottom half of Reference Image 4) */}
        {viewMode === 'detail' && activeTask && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-6 animate-in fade-in">
            {/* Detail Navigation Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Tasks Table</span>
              </button>
              <div className="text-slate-500 font-medium">
                Entity Task ID: <strong className="text-slate-900 dark:text-white">{activeTask.code}</strong>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  onClick={() => {
                    const currentIndex = tasks.findIndex(t => t.id === activeTask.id);
                    if (currentIndex > 0) {
                      setActiveTask(tasks[currentIndex - 1]);
                    } else {
                      showToast('Already on the first task', 'info');
                    }
                  }}
                  className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Previous
                </button>
                <span>|</span>
                <button
                  onClick={() => {
                    const currentIndex = tasks.findIndex(t => t.id === activeTask.id);
                    if (currentIndex < tasks.length - 1) {
                      setActiveTask(tasks[currentIndex + 1]);
                    } else {
                      showToast('Already on the last task', 'info');
                    }
                  }}
                  className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Task Header & Context */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
                <span className="bg-[#0A1628] text-white px-2 py-0.5 rounded text-[11px] font-bold">
                  {activeTask.clientName} Pvt Ltd
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                  {activeTask.project} — Q3 Scale
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                  {activeTask.milestone}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {activeTask.title}
              </h2>

              {/* Status Chips Bar */}
              <div className="flex items-center gap-4 pt-2 flex-wrap text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Assignee</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeTask.assignee}</span>
                  </div>
                </div>
                <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Status</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                    {activeTask.status} ▾
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Priority</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 mt-0.5 inline-block">
                    {activeTask.priority}
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Due Date</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                    Today, 10 Sep 2026
                  </span>
                </div>
              </div>
            </div>

            {/* 70/30 Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT 70%: Scope, Subtasks, Dependencies, Discussion */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Technical Scope & Acceptance Criteria */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Technical Scope & Acceptance Criteria
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Provision and deploy the Google Cloud Run server-side Tag Manager container under the custom subdomain <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-rose-600">tag.acmetech.io</code>. Ensure first-party cookie isolation and route Meta Conversions API (CAPI) events with deduplicated <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-rose-600">event_id</code> parameters matching client-side pixel triggers.
                  </p>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-5 pt-1">
                    <li>Provision Cloud Run cluster with multi-region failover (US-East / EU-Central).</li>
                    <li>Validate SSL termination on custom domain delegation.</li>
                    <li>Configure hash-parameter sanitization for user-provided identifiers (SHA-256 email, phone).</li>
                    <li>Benchmark payload latency (&lt;120ms round-trip to Meta Graph API).</li>
                  </ul>
                </div>

                {/* 2. Subtasks */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Subtasks (3 of 4 Completed 75%)
                    </span>
                    <button
                      onClick={() => {
                        const newSub = prompt('New subtask title:');
                        if (newSub) {
                          setSubtasksState([...subtasksState, { id: `s-${Date.now()}`, title: newSub, hours: 'Est. 1.0h', done: false }]);
                        }
                      }}
                      className="text-rose-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Subtask</span>
                    </button>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0A1628] dark:bg-blue-600 h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>

                  <div className="space-y-2">
                    {subtasksState.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => toggleSubtask(sub.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer hover:bg-slate-100 transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={sub.done}
                            onChange={() => toggleSubtask(sub.id)}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                          />
                          <span className={sub.done ? 'line-through text-slate-400' : 'font-medium text-slate-800 dark:text-slate-200'}>
                            {sub.title}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">{sub.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Task Dependencies */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Task Dependencies
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                      <div className="text-slate-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Depends On (Prerequisite)</span>
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        DNS Zone Delegation verified
                      </div>
                      <div className="text-[10px] text-slate-400">Completed by Cloud DevOps • 04 Sep</div>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-1">
                      <div className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Blocks (Blocking Dependent Task)</span>
                      </div>
                      <div className="font-bold text-rose-700 dark:text-rose-300">
                        Client ROAS Attribution blocking
                      </div>
                      <div className="text-[10px] text-rose-600 font-medium">Blocked until this task is completed</div>
                    </div>
                  </div>
                </div>

                {/* 4. Attachments */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-slate-500">Attachments (3)</h3>
                    <button
                      onClick={() => showToast('Opening file picker to attach asset to task...', 'info')}
                      className="text-rose-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Asset</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">Tag_Matrix.xlsx</div>
                        <div className="text-[10px] text-slate-400">142 KB • v2.1</div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">Cloud_Run_Config.json</div>
                        <div className="text-[10px] text-slate-400">18 KB • Terraform</div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">Architecture_Diagram.png</div>
                        <div className="text-[10px] text-slate-400">1.8 MB • High-res</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Activity & Discussion */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Activity & Discussion</h3>

                  {/* Comment Editor */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 space-y-2">
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Leave a note or tag team member with @... (Markdown supported)"
                      className="w-full text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                    ></textarea>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-slate-400">
                        <button onClick={() => showToast('Bold applied', 'info')} className="hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xs cursor-pointer">B</button>
                        <button onClick={() => showToast('Italic applied', 'info')} className="hover:text-slate-600 dark:hover:text-slate-200 italic text-xs cursor-pointer">I</button>
                        <button onClick={() => showToast('Code block formatted', 'info')} className="hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer">&lt;/&gt;</button>
                        <button onClick={() => showToast('Link inserted', 'info')} className="hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer">🔗</button>
                      </div>
                      <button
                        onClick={() => {
                          if (newComment) {
                            showToast(`Posted comment: "${newComment}"`, 'success');
                            setNewComment('');
                          }
                        }}
                        className="px-4 py-1.5 bg-[#0A1628] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>

                  {/* Comments Thread */}
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        RM
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">Rahul Menon</span>
                          <span className="text-[10px] text-slate-400">2 hours ago</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          CNAME verification completed on Acme&apos;s DNS. Have run 5 test event packets and Meta CAPI is reporting an 8.9/10 Event Quality Match score. Only synthetic purchases remain.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#B91C1C] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        MV
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">Marcus Vance (VP Ops)</span>
                          <span className="text-[10px] text-slate-400">Yesterday at 16:40</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          @Rahul Menon Ensure the client&apos;s legal team has signed off on the server-side hashing privacy policy amendment before pushing live payload to Meta.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT 30%: Time Tracking Stopwatch & Connected CRM Entities */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. Time Tracking Stopwatch */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-500">Time Tracking</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live Stopwatch</span>
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <div className="text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                      {formatStopwatch(timerSeconds)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Active Session • Task {activeTask.code}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        timerRunning
                          ? 'bg-[#B91C1C] hover:bg-[#991B1B] text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{timerRunning ? 'Pause Timer' : 'Resume'}</span>
                    </button>

                    <button
                      onClick={() => showToast('Logged 42 minutes to commercial retainer timesheet', 'success')}
                      className="py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Log Hours
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Tagged vs Estimate:</span>
                      <strong className="text-slate-800 dark:text-slate-200">5h 15m / 8h 00m (65%)</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Billable to Client Retainer:</span>
                      <strong className="text-emerald-600 font-bold">YES • ₹4,500/hr</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Connected CRM Entities */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-slate-500">
                    Connected CRM Entities
                  </h3>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#0A1628] text-white font-bold flex items-center justify-center text-[10px]">
                        AT
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Acme Technologies Pvt Ltd</div>
                        <div className="text-[10px] text-slate-500">Tier 1 Enterprise • APAC HQ</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Project:</span>
                      <strong className="text-slate-900 dark:text-white">Acme Growth Campaign</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Retainer:</span>
                      <strong className="text-rose-600">Performance Mktg ₹1.5L/mo</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SLA Policy:</span>
                      <span className="font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                        Urgent (24h SLA Target)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Created By:</span>
                      <span>Alex Morgan (05 Sep)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Workspace Actions */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
                    WORKSPACE ACTIONS
                  </h3>
                  <button
                    onClick={() => showToast(`Task ${activeTask.code} duplicated as draft`, 'success')}
                    className="w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer"
                  >
                    Duplicate Task
                  </button>
                  <button
                    onClick={() => showToast(`Task ${activeTask.code} converted to client milestone`, 'success')}
                    className="w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer"
                  >
                    Convert to Project Milestone
                  </button>
                  <button
                    onClick={() => showToast(`Task ${activeTask.code} moved to archive`, 'info')}
                    className="w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-rose-600 font-medium transition cursor-pointer"
                  >
                    Archive Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
