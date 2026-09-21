'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Calendar,
  AlertTriangle,
  CheckSquare,
  TrendingUp,
  RefreshCw,
  Trash2,
  DollarSign,
  Edit2,
  User,
  Users,
  Flag,
  Layers,
  FileText,
  Check,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Image,
  Film,
  Palette,
  Play
} from 'lucide-react';
import { WatermarkOverlay } from '@/components/common/WatermarkOverlay';

interface ProjectDetailsModalProps {
  projectId: string;
  onClose: () => void;
  onProjectUpdated: () => void;
  onDeleteProject?: (project: any) => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  projectId,
  onClose,
  onProjectUpdated,
  onDeleteProject,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'creatives' | 'financials' | 'edit'>('overview');
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [creatives, setCreatives] = useState<any[]>([]);
  const [loadingCreatives, setLoadingCreatives] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editSpent, setEditSpent] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editProgress, setEditProgress] = useState(25);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quick Add Task state
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Status updating state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      const [projRes, teamRes] = await Promise.all([
        api.getProject(projectId).catch(() => null),
        api.getTeamMembers().catch(() => null)
      ]);

      if (projRes?.success && projRes.data) {
        const p = projRes.data;
        setProjectData(p);
        setTasks(p.tasks || []);

        // Pre-fill edit form
        setEditName(p.name || '');
        setEditDescription(p.description || '');
        setEditBudget(p.budget ? String(p.budget) : '0');
        setEditSpent(p.spent ? String(p.spent) : '0');
        setEditStatus(p.status || 'Active');
        setEditPriority(p.priority || 'Medium');
        setEditProgress(p.progress || 0);
        setEditStartDate(p.start_date ? String(p.start_date).split('T')[0] : '');
        setEditEndDate(p.end_date ? String(p.end_date).split('T')[0] : '');
      } else {
        // Fallback: fetch from getProjects() list
        const listRes = await api.getProjects().catch(() => null);
        if (listRes?.success && Array.isArray(listRes.data)) {
          const found = listRes.data.find((item: any) => item.id === projectId);
          if (found) {
            setProjectData(found);
            setEditName(found.name || '');
            setEditDescription(found.description || '');
            setEditBudget(found.budget ? String(found.budget) : '0');
            setEditStatus(found.status || 'Active');
            setEditPriority(found.priority || 'Medium');
            setEditProgress(found.progress || 0);
          }
        }
        // Fetch tasks separately
        const tasksRes = await api.getTasks({ projectId }).catch(() => null);
        if (tasksRes?.success && Array.isArray(tasksRes.data)) {
          setTasks(tasksRes.data);
        }
      }

      if (teamRes?.success && Array.isArray(teamRes.data)) {
        setTeamMembers(teamRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load project details:', err);
      showToast('Could not load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectCreatives = async () => {
    try {
      setLoadingCreatives(true);
      const res = await api.getCreatives({ projectId }).catch(() => null);
      if (res?.success && Array.isArray(res.creatives)) {
        setCreatives(res.creatives);
      }
    } catch (err: any) {
      console.error('Failed to load project creatives:', err);
    } finally {
      setLoadingCreatives(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }
  }, [projectId]);

  useEffect(() => {
    if (activeTab === 'creatives' && creatives.length === 0) {
      loadProjectCreatives();
    }
  }, [activeTab]);

  const handleQuickStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await api.updateProject(projectId, { status: newStatus });
      if (res.success) {
        setEditStatus(newStatus);
        setProjectData((prev: any) => ({ ...prev, status: newStatus }));
        showToast(`Project status updated to ${newStatus}`, 'success');
        onProjectUpdated();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleQuickProgressChange = async (newProgress: number) => {
    try {
      setEditProgress(newProgress);
      const res = await api.updateProject(projectId, { progress: newProgress });
      if (res.success) {
        setProjectData((prev: any) => ({ ...prev, progress: newProgress }));
        showToast(`Progress updated to ${newProgress}%`, 'success');
        onProjectUpdated();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update progress', 'error');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Project name is required', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: editName.trim(),
        description: editDescription.trim(),
        budget: parseFloat(editBudget) || 0,
        spent: parseFloat(editSpent) || 0,
        status: editStatus,
        priority: editPriority,
        progress: editProgress,
        start_date: editStartDate || null,
        end_date: editEndDate || null
      };

      const res = await api.updateProject(projectId, payload);
      if (res.success) {
        showToast('Project details saved successfully', 'success');
        setProjectData((prev: any) => ({ ...prev, ...payload }));
        setActiveTab('overview');
        onProjectUpdated();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'To Do' : 'Completed';
    try {
      const res = await api.updateTaskStatus(taskId, nextStatus);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
        );
        showToast(nextStatus === 'Completed' ? 'Task marked as completed' : 'Task reopened', 'success');
        onProjectUpdated();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update task status', 'error');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    try {
      setIsCreatingTask(true);
      const selectedMember = teamMembers.find((m) => m.id === newTaskAssigneeId);
      const assigneeName = selectedMember
        ? selectedMember.name || `${selectedMember.first_name || ''} ${selectedMember.last_name || ''}`.trim() || selectedMember.email
        : undefined;

      const payload = {
        title: newTaskTitle.trim(),
        project_id: projectId,
        client_id: projectData?.client_id || undefined,
        assignee_id: newTaskAssigneeId || undefined,
        assignee_name: assigneeName,
        assignee_role: selectedMember?.designation || selectedMember?.role_name || undefined,
        priority: newTaskPriority,
        due_date: newTaskDueDate || undefined
      };

      const res = await api.createTask(payload);
      if (res.success && res.data) {
        setTasks((prev) => [...prev, res.data]);
        setNewTaskTitle('');
        setNewTaskAssigneeId('');
        setNewTaskDueDate('');
        setShowAddTaskForm(false);
        showToast('Task added to project', 'success');
        onProjectUpdated();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create task', 'error');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const totalTasksCount = tasks.length;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const budgetNum = parseFloat(String(projectData?.budget || '0')) || 0;
  const spentNum = parseFloat(String(projectData?.spent || '0')) || 0;
  const remainingBudget = Math.max(0, budgetNum - spentNum);
  const burnPercent = budgetNum > 0 ? Math.min(100, Math.round((spentNum / budgetNum) * 100)) : 0;

  const formattedStartDate = projectData?.start_date
    ? new Date(projectData.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not set';

  const formattedEndDate = projectData?.end_date
    ? new Date(projectData.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'No deadline';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A1220] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-600/20 shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {projectData?.id ? `P-${projectData.id.slice(0, 4).toUpperCase()}` : 'PROJECT'}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {projectData?.name || 'Project Details'}
                </h2>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <div className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                  <div className="w-4 h-4 rounded bg-rose-500/10 flex items-center justify-center text-[10px] font-bold">
                    {(projectData?.client_name || 'CL').slice(0, 2).toUpperCase()}
                  </div>
                  <span>{projectData?.client_name || 'Direct Client'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Lead PM: {projectData?.pm_first ? `${projectData.pm_first} ${projectData.pm_last || ''}`.trim() : (projectData?.leadPM || 'OptiVir Admin')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Status Dropdown */}
            <select
              value={projectData?.status || editStatus}
              onChange={(e) => handleQuickStatusChange(e.target.value)}
              disabled={updatingStatus}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                projectData?.status === 'Completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : projectData?.status === 'In Review'
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                  : projectData?.status === 'Planning'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
              }`}
            >
              <option value="Active">Active</option>
              <option value="Planning">Planning</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-100/60 dark:bg-[#070D18] border-b border-slate-200 dark:border-slate-800/80 text-xs">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[11px] block mb-1 font-medium">Sprint Progress</span>
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span>{projectData?.progress || editProgress}%</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">Active</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-rose-600 h-full transition-all duration-300"
                style={{ width: `${projectData?.progress || editProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[11px] block mb-1 font-medium">Contract Budget</span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              ₹{budgetNum.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Spent: ₹{spentNum.toLocaleString('en-IN')} ({burnPercent}%)
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[11px] block mb-1 font-medium">Due Date / SLA</span>
            <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
              {formattedEndDate}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Started: {formattedStartDate}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[11px] block mb-1 font-medium">Task Velocity</span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">
              {completedTasksCount} / {totalTasksCount} Tasks
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {taskCompletionRate}% Delivered
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1424] overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Scope', icon: Layers },
            { id: 'tasks', label: `Tasks & Sprints (${tasks.length})`, icon: CheckSquare },
            { id: 'creatives', label: `Creatives (${creatives.length})`, icon: Palette },
            { id: 'financials', label: 'Budget & Financials', icon: DollarSign },
            { id: 'edit', label: 'Edit Project Details', icon: Edit2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-500" />
              <p className="text-xs">Loading project details...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Scope Description Box */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Scope of Work &amp; Deliverables
                    </h3>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                      {projectData?.description || 'No detailed scope description provided for this project.'}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-rose-500" />
                        <span>Client &amp; Account Information</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-slate-500">Client Account:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{projectData?.client_name || 'Direct Client'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-slate-500">Project Code:</span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {projectData?.id ? `P-${projectData.id.slice(0, 4).toUpperCase()}` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Priority Level:</span>
                          <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            {projectData?.priority || 'Medium'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>Timeline &amp; Milestones</span>
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-slate-500">Start / Kickoff:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{formattedStartDate}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-slate-500">Target Completion:</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">{formattedEndDate}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Sprint Cadence:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">Active Sprint (2-Week Cycle)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Progress Slider */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Execution &amp; Delivery Progress</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{projectData?.progress || editProgress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={projectData?.progress || editProgress}
                      onChange={(e) => handleQuickProgressChange(parseInt(e.target.value, 10))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0% Kickoff</span>
                      <span>25% Planning</span>
                      <span>50% In Production</span>
                      <span>75% Client Review</span>
                      <span>100% Completed</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Work Items &amp; Tasks</h3>
                      <p className="text-xs text-slate-500">Manage deliverables and subtasks tied directly to this scope</p>
                    </div>

                    <button
                      onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddTaskForm ? 'Cancel' : 'Add Task'}</span>
                    </button>
                  </div>

                  {/* Add Task Inline Form */}
                  {showAddTaskForm && (
                    <form onSubmit={handleCreateTask} className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-4 space-y-3 animate-in fade-in">
                      <div className="font-bold text-xs text-rose-700 dark:text-rose-300">
                        Create New Task under {projectData?.name}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="font-semibold block mb-1">Task Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Design 10 Instagram Story templates"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Assignee</label>
                          <select
                            value={newTaskAssigneeId}
                            onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email} ({m.designation || m.role_name || 'Member'})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold block mb-1">Priority</label>
                          <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-semibold block mb-1">Due Date</label>
                          <input
                            type="date"
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddTaskForm(false)}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingTask}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isCreatingTask ? 'Creating...' : 'Create Task'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Task List */}
                  {tasks.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                      <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">No tasks created yet</p>
                      <p className="text-[11px] text-slate-400">Click &quot;+ Add Task&quot; above to add deliverables for this project.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => {
                        const isCompleted = task.status === 'Completed';
                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                              isCompleted
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40 text-slate-500'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0 ${
                                  isCompleted
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-rose-500'
                                }`}
                              >
                                {isCompleted && <Check className="w-3.5 h-3.5" />}
                              </button>

                              <div className="min-w-0 space-y-0.5">
                                <span className={`text-xs font-semibold block truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                                  {task.title}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                                  <span>{task.assignee_name || 'Unassigned'}</span>
                                  {task.due_date && (
                                    <>
                                      <span>•</span>
                                      <span>Due {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                    </>
                                  )}
                                  {parseInt(task.linked_creatives_count || '0', 10) > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400">
                                        <Palette className="w-3 h-3" />
                                        <span>{task.linked_creatives_count} {parseInt(task.linked_creatives_count, 10) === 1 ? 'Creative' : 'Creatives'}</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  task.priority === 'High' || task.priority === 'Urgent'
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {task.priority || 'Medium'}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isCompleted
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                }`}
                              >
                                {task.status || 'To Do'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CREATIVES */}
              {activeTab === 'creatives' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Creatives & Proofing</h3>
                      <p className="text-xs text-slate-500">All creative assets linked to this project scope</p>
                    </div>
                    <button
                      onClick={loadProjectCreatives}
                      disabled={loadingCreatives}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingCreatives ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loadingCreatives ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-500" />
                      <p className="text-xs">Loading creatives...</p>
                    </div>
                  ) : creatives.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto">
                        <Palette className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">No creatives linked yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Create creatives in the Creatives module and link them to this project.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {creatives.map((creative) => {
                        const statusColors: Record<string, string> = {
                          DRAFT: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                          INTERNAL_REVIEW: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
                          PENDING_CLIENT_APPROVAL: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
                          CHANGES_REQUESTED: 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300',
                          APPROVED: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
                          DEPLOYMENT_READY: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300',
                          LIVE: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
                        };
                        const statusLabel: Record<string, string> = {
                          DRAFT: 'Draft',
                          INTERNAL_REVIEW: 'In Review',
                          PENDING_CLIENT_APPROVAL: 'Client Approval',
                          CHANGES_REQUESTED: 'Changes Requested',
                          APPROVED: 'Approved',
                          DEPLOYMENT_READY: 'Ready to Deploy',
                          LIVE: 'Live',
                        };
                        const statusClass = statusColors[creative.status] || statusColors.DRAFT;
                        const hasThumb = creative.thumbnail_url || creative.preview_url || creative.previewUrl;
                        const isVideo = creative.ad_format === 'VIDEO' || creative.target_platform === 'YOUTUBE';

                        return (
                          <div
                            key={creative.id}
                            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-rose-400 dark:hover:border-rose-700 hover:shadow-md transition-all duration-200"
                          >
                            {/* Thumbnail / Preview */}
                            <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
                              {hasThumb ? (
                                isVideo || hasThumb.match(/\.(mp4|mov|webm|avi|mkv)($|\?)/i) ? (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white relative">
                                    <video
                                      src={hasThumb}
                                      className="w-full h-full object-cover"
                                      muted
                                      playsInline
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:scale-110 transition">
                                      <Play className="w-6 h-6 text-white drop-shadow-md" />
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={hasThumb}
                                    alt={creative.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                )
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {isVideo
                                    ? <Film className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                                    : <Image className="w-10 h-10 text-slate-400 dark:text-slate-600" />}
                                </div>
                              )}
                              {hasThumb && <WatermarkOverlay size="sm" />}
                              {/* Version badge */}
                              {creative.version_count > 0 && (
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-md z-20">
                                  v{creative.active_version || 1}
                                </div>
                              )}
                              {/* Status badge */}
                              <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md z-20 ${statusClass}`}>
                                {statusLabel[creative.status] || creative.status}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="p-3 space-y-1.5">
                              <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                {creative.name}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                                {creative.target_platform && (
                                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium">
                                    {creative.target_platform}
                                  </span>
                                )}
                                {creative.ad_format && (
                                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium">
                                    {creative.ad_format}
                                  </span>
                                )}
                                {creative.task_title && (
                                  <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded font-semibold truncate max-w-[140px]">
                                    Task: {creative.task_title}
                                  </span>
                                )}
                                {creative.unresolved_comments_count > 0 && (
                                  <span className="ml-auto px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded font-bold">
                                    {creative.unresolved_comments_count} pin{creative.unresolved_comments_count > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              {creative.designer_name && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <User className="w-3 h-3" />
                                  <span>{creative.designer_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FINANCIALS */}
              {activeTab === 'financials' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs text-slate-500 font-medium">Total Contract Scope</span>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        ₹{budgetNum.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-400">Fixed Retainer / Project Fee</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs text-slate-500 font-medium">Realized Burn / Cost</span>
                      <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                        ₹{spentNum.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-400">{burnPercent}% of allocated budget</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs text-slate-500 font-medium">Remaining Margin</span>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{remainingBudget.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-emerald-500 font-semibold">{100 - burnPercent}% available</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4 text-xs text-blue-900 dark:text-blue-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span>Commercials &amp; Milestone Billing</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Deliverable milestones are connected to client commercial retainers. Invoices and payments can be tracked in the Finance module.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: EDIT FORM */}
              {activeTab === 'edit' && (
                <form onSubmit={handleSaveEdit} className="space-y-4 animate-in fade-in text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Project Name *</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Scope Description</label>
                      <textarea
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Budget (₹)</label>
                      <input
                        type="number"
                        value={editBudget}
                        onChange={(e) => setEditBudget(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Spent (₹)</label>
                      <input
                        type="number"
                        value={editSpent}
                        onChange={(e) => setEditSpent(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Planning">Planning</option>
                        <option value="In Review">In Review</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Start Date</label>
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Target End Date</label>
                      <input
                        type="date"
                        value={editEndDate}
                        onChange={(e) => setEditEndDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                    {onDeleteProject ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onDeleteProject(projectData);
                        }}
                        className="px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Project</span>
                      </button>
                    ) : <div></div>}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A1220] flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-2">
            <span>Project ID:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{projectId}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0A1628] dark:bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
