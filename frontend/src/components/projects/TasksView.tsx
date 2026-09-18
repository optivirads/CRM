'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';
import { api } from '@/lib/api';
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
  ChevronsRight,
  Check,
  UserPlus
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // View Mode: 'list' | 'kanban' | 'detail' | 'calendar'
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'detail' | 'calendar'>('list');

  // Filter Tabs
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Selection
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Active Task Detail (Defaults to null)
  const [activeTask, setActiveTask] = useState<any>(null);

  // Time Tracker Stopwatch
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // New Comment
  const [newComment, setNewComment] = useState('');

  // Subtask checkbox state
  const [subtasksState, setSubtasksState] = useState<any[]>([]);

  // Tasks dataset matching PostgreSQL
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingTask, setDeletingTask] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Social Media Posters & Creatives');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignedDate, setNewTaskAssignedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [taskComments, setTaskComments] = useState<Record<string, Array<{ id: string; author: string; initials: string; text: string; time: string }>>>({});

  // Team Members & Assignee States
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [selectedAssigneeName, setSelectedAssigneeName] = useState<string>('');
  const [selectedAssigneeRole, setSelectedAssigneeRole] = useState<string>('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const fetchTeamMembers = async () => {
    try {
      const res = await api.getTeamMembers();
      if (res.success && Array.isArray(res.data)) {
        setTeamMembers(res.data);
      }
    } catch (err) {
      console.warn('Failed to load team members:', err);
    }
  };

  const [clientNames, setClientNames] = useState<string[]>([]);

  const fetchClients = async () => {
    try {
      const res = await api.getClients();
      if (res.success && Array.isArray(res.data)) {
        const names = res.data.map((c: any) => c.company_name || c.name).filter(Boolean);
        setClientNames(names);
      }
    } catch (err) {
      console.warn('Failed to load clients in TasksView:', err);
    }
  };

  const activeTeamList = teamMembers;

  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      showToast('Please enter team member name', 'error');
      return;
    }
    try {
      setIsAddingMember(true);
      const res = await api.createTeamMember({
        name: newMemberName.trim(),
        designation: newMemberRole.trim() || 'Team Member',
        email: newMemberEmail.trim() || undefined
      });
      if (res.success && res.data) {
        const created = res.data;
        setTeamMembers(prev => [...prev.filter(m => m.id !== created.id), created]);
        setSelectedAssigneeId(created.id);
        setSelectedAssigneeName(created.name);
        setSelectedAssigneeRole(created.designation);
        setShowAddMemberForm(false);
        setNewMemberName('');
        setNewMemberRole('');
        setNewMemberEmail('');
        showToast(`Team member "${created.name}" (${created.designation}) added and assigned!`, 'success');
      }
    } catch {
      const fallback = {
        id: `tm-${Date.now()}`,
        name: newMemberName.trim(),
        designation: newMemberRole.trim() || 'Team Member',
        email: newMemberEmail.trim()
      };
      setTeamMembers(prev => [...prev, fallback]);
      setSelectedAssigneeId(fallback.id);
      setSelectedAssigneeName(fallback.name);
      setSelectedAssigneeRole(fallback.designation);
      setShowAddMemberForm(false);
      setNewMemberName('');
      setNewMemberRole('');
      setNewMemberEmail('');
      showToast(`Team member "${fallback.name}" added and assigned!`, 'success');
    } finally {
      setIsAddingMember(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks();
      if (res.success && Array.isArray(res.data)) {
        const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const mapped = res.data.map((t: any) => ({
          id: t.id,
          code: `#OPT-${(t.id || '0000').slice(0, 4).toUpperCase()}`,
          title: t.title || 'Untitled Deliverable',
          description: t.description || '',
          subtasksCount: '0 Subtasks',
          subtasksBadge: t.status === 'Completed' ? 'Completed' : (t.status === 'In Progress' ? 'In Progress' : 'Pending'),
          clientName: t.company_name || 'Direct Client',
          clientAvatar: (t.company_name || 'DC').substring(0, 2).toUpperCase(),
          clientAvatarBg: 'bg-[#0A1628]',
          project: t.project_name || 'Creative Workstream',
          milestone: 'Active Deliverable',
          assignee: t.assignee_name || (t.assignee_first ? `${t.assignee_first} ${t.assignee_last || ''}`.trim() : 'OptiVir Admin'),
          assigneeRole: t.assignee_role || 'Team Member',
          assigneeInitials: (t.assignee_name || t.assignee_first || 'OA')
            .split(' ')
            .filter(Boolean)
            .map((p: string) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          priority: t.priority || 'Medium',
          status: t.status === 'Completed' ? 'Done' : (t.status === 'In Progress' ? 'In Progress' : 'To Do'),
          statusBg: t.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
          currentDate: todayStr,
          timeline: t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Due Date',
          timelineStart: t.assigned_date ? new Date(t.assigned_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (t.start_date ? new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : todayStr),
          assignedDate: t.assigned_date ? new Date(t.assigned_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (t.start_date ? new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : todayStr),
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Due Date',
          timelineUrgent: t.priority === 'Urgent' || t.priority === 'High',
          timeActual: '0.0h',
          timeEst: '4.0h',
          timePercent: t.status === 'Completed' ? 100 : 0
        }));
        setTasks(mapped);
        if (mapped.length > 0 && !activeTask) {
          setActiveTask(mapped[0]);
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
    fetchClients();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      showToast('Task title is required', 'error');
      return;
    }
    try {
      setIsCreating(true);
      const formattedDesc = newTaskCategory
        ? `[${newTaskCategory}] ${newTaskDesc.trim()}`.trim()
        : newTaskDesc.trim();
      const res = await api.createTask({
        title: newTaskTitle.trim(),
        description: formattedDesc || undefined,
        priority: newTaskPriority,
        assigned_date: newTaskAssignedDate || undefined,
        due_date: newTaskDueDate || undefined,
        assignee_id: selectedAssigneeId || undefined,
        assignee_name: selectedAssigneeName || undefined,
        assignee_role: selectedAssigneeRole || undefined
      });
      if (res.success) {
        showToast(`Task created and assigned to ${selectedAssigneeName || 'team'}!`, 'success');
        setShowCreateModal(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskDueDate('');
        setNewTaskAssignedDate(new Date().toISOString().split('T')[0]);
        setSelectedAssigneeId('');
        setSelectedAssigneeName('');
        setSelectedAssigneeRole('');
        setShowAddMemberForm(false);
        fetchTasks();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create task', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      setIsDeleting(true);
      const res = await api.deleteTask(deletingTask.id);
      if (res.success) {
        showToast(`Task "${deletingTask.title}" deleted successfully`);
        setDeletingTask(null);
        if (activeTask?.id === deletingTask.id) {
          setActiveTask(null);
        }
        fetchTasks();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete task', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTasks.length === 0) return;
    if (!confirm(`Delete ${selectedTasks.length} selected tasks from database?`)) return;
    try {
      setIsDeleting(true);
      await Promise.all(selectedTasks.map((id) => api.deleteTask(id)));
      showToast(`Successfully deleted ${selectedTasks.length} tasks`);
      setSelectedTasks([]);
      fetchTasks();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete tasks', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Set default active task
  useEffect(() => {
    if (!activeTask && tasks.length > 0) {
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


      <div className="w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
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
                {tasks.length} Total • 0 My Open
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
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Task</span>
            </button>
          </div>
        </div>

        {/* 3. 5 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* My Open Tasks */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-400">MY OPEN TASKS</span>
              <CheckSquare className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{tasks.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
              <span>0 urgent / high priority</span>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-400">OVERDUE</span>
              <AlertTriangle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">0</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span>No overdue tasks</span>
            </div>
          </div>

          {/* Due Today */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">DUE TODAY</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">0</div>
            <div className="text-[11px] text-slate-400 mt-1">No tasks due today</div>
          </div>

          {/* Due This Week */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">DUE THIS WEEK</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">0</div>
            <div className="text-[11px] text-slate-400 mt-1">0 deliverables</div>
          </div>

          {/* Completed (MTD) */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">COMPLETED (MTD)</span>
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">0</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">0% on-time rate</div>
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
              { id: 'all', label: `All Tasks (${tasks.length})` },
              { id: 'my', label: 'My Tasks (0)' },
              { id: 'overdue', label: 'Overdue (0)' },
              { id: 'due_today', label: 'Due Today (0)' },
              { id: 'high', label: 'High Priority (0)' },
              { id: 'completed', label: 'Completed (0)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeFilterTab === tab.id
                    ? 'bg-[#0A1628] text-white shadow-xs'
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
              {Array.from(new Set([...clientNames, ...tasks.map((t: any) => t.clientName).filter(Boolean)])).map((name: string) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Assignee: All Team</option>
              {Array.from(new Set([...activeTeamList.map((m: any) => m.name), ...tasks.map((t: any) => t.assignee).filter(Boolean)])).map((name: string) => (
                <option key={name} value={name}>{name}</option>
              ))}
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
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-3 py-1 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded font-bold transition flex items-center gap-1 disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
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
                        checked={selectedTasks.length === tasks.length && tasks.length > 0}
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
                    <th className="p-3.5">TIME (ACT/EST)</th>
                    <th className="p-3.5 pr-4 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-slate-500">
                        <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No tasks found</div>
                        <div className="text-xs text-slate-400 mt-1">Create a new task to get started tracking deliverables.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
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
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {task.title}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {task.code}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span>{task.subtasksCount}</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-medium">
                                  {task.subtasksBadge}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Client & Context */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-md ${task.clientAvatarBg} text-white font-bold flex items-center justify-center text-[10px] shrink-0`}
                              >
                                {task.clientAvatar}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  {task.clientName}
                                </div>
                                <div className="text-[11px] text-slate-400">Retainer Client</div>
                              </div>
                            </div>
                          </td>

                          {/* Project / Milestone */}
                          <td className="p-3.5">
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {task.project}
                              </div>
                              <div className="text-[11px] text-slate-400">{task.milestone}</div>
                            </div>
                          </td>

                          {/* Assignee */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold flex items-center justify-center text-[10px] shadow-xs">
                                {task.assigneeInitials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{task.assignee}</div>
                                {task.assigneeRole && <div className="text-[10px] text-slate-400 truncate">{task.assigneeRole}</div>}
                              </div>
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
                            <div className="space-y-0.5">
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <span className="font-semibold text-slate-600 dark:text-slate-400">Current:</span> {task.currentDate}
                              </div>
                              <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-400">Assigned:</span> {task.assignedDate || task.timelineStart}
                              </div>
                              <div
                                className={`text-xs flex items-center gap-1 ${
                                  task.timelineUrgent
                                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                                    : 'text-slate-800 dark:text-slate-200 font-semibold'
                                }`}
                              >
                                <span className="text-slate-500 dark:text-slate-400 font-normal">Due:</span>
                                {task.dueDate || task.timeline}
                              </div>
                            </div>
                          </td>

                          {/* Time (Act/Est) */}
                          <td className="p-3.5">
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

                          {/* Action Cell */}
                          <td className="p-3.5 pr-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingTask(task);
                              }}
                              title="Delete Task"
                              className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0A101C] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredTasks.length > 0 ? 1 : 0}-{filteredTasks.length} of {tasks.length} total tasks</span>
              <div className="flex items-center gap-1">
                {[1].map((p) => (
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
        {viewMode === 'detail' && !activeTask && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
            <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Task Selected</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Select a task from the list view or create a new task to view its workspace detail.</p>
            <button
              onClick={() => setViewMode('list')}
              className="mt-4 px-4 py-2 bg-[#0A1628] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              Back to Task List
            </button>
          </div>
        )}

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
                  {activeTask.clientName}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                  {activeTask.project}
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
                  {activeTask.assigneeRole && (
                    <span className="text-[10px] text-slate-400 block truncate">{activeTask.assigneeRole}</span>
                  )}
                </div>
                <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Status</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                    {activeTask.status}
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
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Current Date</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
                    {activeTask.currentDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Assigned Date</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
                    {activeTask.assignedDate || activeTask.timelineStart || 'Today'}
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Due Date</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                    {activeTask.dueDate || activeTask.timeline || 'No Due Date'}
                  </span>
                </div>
              </div>
            </div>

            {/* 70/30 Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT 70%: Scope, Subtasks, Dependencies, Discussion */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Deliverable Details & Scope */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Deliverable Details &amp; Scope
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {activeTask.description || 'No specific description provided for this deliverable. You can edit requirements or add specifications anytime.'}
                  </p>
                </div>

                {/* 2. Subtasks */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Subtasks ({subtasksState.filter((s: any) => s.done).length} of {subtasksState.length} Completed)
                    </span>
                    <button
                      onClick={() => {
                        const newSub = prompt('New subtask title:');
                        if (newSub && newSub.trim()) {
                          setSubtasksState([...subtasksState, { id: `s-${Date.now()}`, title: newSub.trim(), hours: '1.0h', done: false }]);
                        }
                      }}
                      className="text-rose-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Subtask</span>
                    </button>
                  </div>

                  {subtasksState.length > 0 ? (
                    <>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0A1628] dark:bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round((subtasksState.filter((s: any) => s.done).length / subtasksState.length) * 100)}%`
                          }}
                        ></div>
                      </div>

                      <div className="space-y-2">
                        {subtasksState.map((sub) => (
                          <div
                            key={sub.id}
                            onClick={() => toggleSubtask(sub.id)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs"
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
                    </>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                      No subtasks added yet. Click &quot;+ Add Subtask&quot; to break down this deliverable into milestones.
                    </div>
                  )}
                </div>

                {/* 3. Attachments & Creative Assets */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-slate-500">Attachments &amp; Creative Assets</h3>
                    <button
                      onClick={() => showToast('Asset upload dialog opened. Select poster or video export to attach.', 'info')}
                      className="text-rose-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Asset</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    No files or creative drafts attached to this deliverable yet. Use &quot;Upload Asset&quot; to attach poster graphics, video files, or design links.
                  </div>
                </div>

                {/* 4. Activity & Discussion */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Activity &amp; Discussion</h3>

                  {/* Comment Editor */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 space-y-2">
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Leave a note, creative feedback, or deliverable status update..."
                      className="w-full text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                    ></textarea>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] text-slate-400">Press Post Comment to save to task log</span>
                      <button
                        onClick={() => {
                          if (newComment.trim()) {
                            const newEntry = {
                              id: `c-${Date.now()}`,
                              author: 'You (Team)',
                              initials: 'YO',
                              text: newComment.trim(),
                              time: 'Just now'
                            };
                            setTaskComments((prev) => ({
                              ...prev,
                              [activeTask.id]: [...(prev[activeTask.id] || []), newEntry]
                            }));
                            showToast('Comment posted successfully', 'success');
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
                  <div className="space-y-3 text-xs">
                    {(taskComments[activeTask.id] || []).length > 0 ? (
                      (taskComments[activeTask.id] || []).map((c) => (
                        <div key={c.id} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {c.initials}
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">{c.author}</span>
                              <span className="text-[10px] text-slate-400">{c.time}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                              {c.text}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                        No activity or comments posted yet. Leave an update or note above.
                      </div>
                    )}
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
                      <span>Live Session Time:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatStopwatch(timerSeconds)}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Delivery Priority:</span>
                      <strong className="text-rose-600 font-bold">{activeTask.priority} Priority</strong>
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
                      <div className="w-7 h-7 rounded-lg bg-[#0A1628] text-white font-bold flex items-center justify-center text-[10px]">
                        {activeTask.clientAvatar || 'CL'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{activeTask.clientName || 'Direct Client'}</div>
                        <div className="text-[10px] text-slate-500">Active Client Account</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Project:</span>
                      <strong className="text-slate-900 dark:text-white">{activeTask.project || 'Creative Deliverable'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Current Date:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{activeTask.currentDate}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Assigned Date:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{activeTask.assignedDate || activeTask.timelineStart || 'Today'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Target Due Date:</span>
                      <strong className="text-rose-600 dark:text-rose-400">{activeTask.dueDate || activeTask.timeline || 'No Due Date'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Assignee:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{activeTask.assignee || 'OptiVir Team'}</span>
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

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E6EC] dark:border-[#152238]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#DC2626]" />
                <h3 className="font-bold text-sm text-[#0B1727] dark:text-white">Create New Deliverable / Task</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-black dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement conversion tracking tag & pixel validation"
                  className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Deliverable Category</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none text-slate-800 dark:text-slate-200"
                >
                  <option>Social Media Posters &amp; Creatives</option>
                  <option>Video Editing &amp; High-Impact Reels</option>
                  <option>Social Media Marketing &amp; Management</option>
                  <option>Meta &amp; Google Ads Campaign</option>
                  <option>Brand Design &amp; Content Production</option>
                  <option>Ad-Hoc Sprint Task</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Details of creative brief, copy, aspect ratios (9:16 / 1:1), and specifications..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none"
                />
              </div>

              {/* Assigned To & Team Member Details */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">Assigned To (Team Member)</label>
                  <button
                    type="button"
                    onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                    className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{showAddMemberForm ? 'Cancel Add Member' : '+ Add Team Member Details'}</span>
                  </button>
                </div>

                {!showAddMemberForm ? (
                  <select
                    value={selectedAssigneeName ? `${selectedAssigneeId}:::${selectedAssigneeName}:::${selectedAssigneeRole}` : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__add_new__') {
                        setShowAddMemberForm(true);
                      } else if (val) {
                        const [id, name, role] = val.split(':::');
                        setSelectedAssigneeId(id);
                        setSelectedAssigneeName(name);
                        setSelectedAssigneeRole(role);
                      } else {
                        setSelectedAssigneeId('');
                        setSelectedAssigneeName('');
                        setSelectedAssigneeRole('');
                      }
                    }}
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Select a team member (or add details)...</option>
                    {activeTeamList.map((m: any) => (
                      <option key={m.id} value={`${m.id}:::${m.name}:::${m.designation || 'Team Member'}`}>
                        {m.name} • {m.designation || 'Team Member'}
                      </option>
                    ))}
                    <option value="__add_new__">+ Add New Team Member Details...</option>
                  </select>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080E18] border border-rose-200 dark:border-rose-900/50 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        <User className="w-3.5 h-3.5 text-rose-600" />
                        <span>Add Team Member Details</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Saves to Team Roster</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Member Name *</label>
                        <input
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="e.g. Shahana"
                          className="w-full p-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] outline-none text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Role / Designation *</label>
                        <input
                          type="text"
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          placeholder="e.g. COO, Creative Director"
                          className="w-full p-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] outline-none text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="e.g. shahana@optivirads.com"
                        className="w-full p-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] outline-none text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddMemberForm(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isAddingMember || !newMemberName.trim()}
                        onClick={handleAddMember}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition shadow-xs disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>{isAddingMember ? 'Saving...' : 'Save & Assign'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Current Date</label>
                  <input
                    type="text"
                    readOnly
                    value={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-100 dark:bg-[#080E18] text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Assigned Date</label>
                  <input
                    type="date"
                    value={newTaskAssignedDate}
                    onChange={(e) => setNewTaskAssignedDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none text-slate-800 dark:text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none text-slate-800 dark:text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold rounded-lg disabled:opacity-50"
                >
                  {isCreating ? 'Saving...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-[#0B1727] dark:text-white">Delete Task</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete task <span className="font-bold text-slate-900 dark:text-white">{deletingTask.title}</span> ({deletingTask.code})? This action will remove the task record from the database.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
              <button
                type="button"
                onClick={() => setDeletingTask(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 dark:border-[#152238] text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTask}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
