'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';
import { api } from '@/lib/api';
import { ConfirmModal } from '@/components/common/ConfirmModal';
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
  UserPlus,
  Palette,
  Image as ImageIcon,
  Film,
  Link as LinkIcon,
  Sparkles,
  LayoutGrid,
  ArrowRight,
  ShieldCheck,
  Flag,
  Circle,
  MessageSquare,
  History,
  Users,
  Copy
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { WatermarkOverlay } from '@/components/common/WatermarkOverlay';

interface TasksViewProps {
  initialTaskId?: string;
  onNavigate?: (tab: any, ...args: any[]) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ initialTaskId, onNavigate }) => {
  const { user } = useAuth();
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
  const [unlinkingCreative, setUnlinkingCreative] = useState<{ id: string; name: string } | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Social Media Posters & Creatives');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignedDate, setNewTaskAssignedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTaskClientId, setNewTaskClientId] = useState('');
  const [newTaskProjectId, setNewTaskProjectId] = useState('');
  const [newTaskDeliverableType, setNewTaskDeliverableType] = useState<'VIDEO' | 'IMAGE' | 'GENERAL'>('VIDEO');
  const [newTaskScript, setNewTaskScript] = useState('');
  const [newTaskConcept, setNewTaskConcept] = useState('');
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [taskComments, setTaskComments] = useState<Record<string, Array<{ id: string; author: string; initials: string; text: string; time: string }>>>({});

  // Persisted Comments & Discussion Stream
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Concerned Stakeholders State
  const [stakeholderData, setStakeholderData] = useState<{ isConcerned: boolean; userRoleInTask: string; stakeholders: any[] } | null>(null);
  const [loadingStakeholders, setLoadingStakeholders] = useState(false);

  // Interactive Task Flow Transition State
  const [showStatusTransitionModal, setShowStatusTransitionModal] = useState<{ taskId: string; targetStatus: string } | null>(null);
  const [transitionNotes, setTransitionNotes] = useState('');
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

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

  // Linked Creatives State for Active Task
  const [taskCreatives, setTaskCreatives] = useState<any[]>([]);
  const [loadingCreatives, setLoadingCreatives] = useState(false);
  const [showLinkCreativeModal, setShowLinkCreativeModal] = useState(false);
  const [showCreateCreativeModal, setShowCreateCreativeModal] = useState(false);
  const [availableCreatives, setAvailableCreatives] = useState<any[]>([]);
  const [loadingAvailableCreatives, setLoadingAvailableCreatives] = useState(false);
  const [creativeSearchQuery, setCreativeSearchQuery] = useState('');
  const [linkingCreativeId, setLinkingCreativeId] = useState<string | null>(null);

  // Video Deliverable Quick Player Modal State
  const [previewingVideo, setPreviewingVideo] = useState<{
    url: string;
    title: string;
    format?: string;
    platform?: string;
  } | null>(null);

  // New Creative Modal Form States
  const [newCreativeName, setNewCreativeName] = useState('');
  const [newCreativePlatform, setNewCreativePlatform] = useState('META');
  const [newCreativeFormat, setNewCreativeFormat] = useState('IMAGE');
  const [newCreativeAspectRatio, setNewCreativeAspectRatio] = useState('1:1');
  const [newCreativeHeadline, setNewCreativeHeadline] = useState('');
  const [newCreativeCopy, setNewCreativeCopy] = useState('');
  const [newCreativeScript, setNewCreativeScript] = useState('');
  const [newCreativeConcept, setNewCreativeConcept] = useState('');
  const [newCreativeCta, setNewCreativeCta] = useState('Learn More');
  const [isCreatingCreative, setIsCreatingCreative] = useState(false);

  // Deliverable Script & Creative Idea State for Active Task
  const [taskDeliverableType, setTaskDeliverableType] = useState<'VIDEO' | 'IMAGE' | 'GENERAL'>('VIDEO');
  const [taskScript, setTaskScript] = useState('');
  const [taskConcept, setTaskConcept] = useState('');
  const [isSavingTaskScript, setIsSavingTaskScript] = useState(false);
  const [copiedScriptFeedback, setCopiedScriptFeedback] = useState(false);

  const fetchTaskCreatives = async (taskId: string) => {
    if (!taskId) return;
    try {
      setLoadingCreatives(true);
      const res = await api.getCreatives({ taskId });
      if (res.success && Array.isArray(res.creatives)) {
        setTaskCreatives(res.creatives);
      } else {
        setTaskCreatives([]);
      }
    } catch (err) {
      console.warn('Failed to load creatives for task:', err);
      setTaskCreatives([]);
    } finally {
      setLoadingCreatives(false);
    }
  };

  const fetchTaskComments = async (taskId: string) => {
    if (!taskId) return;
    try {
      setLoadingComments(true);
      const res = await api.getTaskComments(taskId);
      if (res.success && Array.isArray(res.data)) {
        setCommentsList(res.data);
      } else {
        setCommentsList([]);
      }
    } catch (err) {
      console.warn('Failed to load task comments:', err);
      setCommentsList([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchStakeholders = async (taskId: string) => {
    if (!taskId) return;
    try {
      setLoadingStakeholders(true);
      const res = await api.getTaskStakeholders(taskId);
      if (res.success && res.data) {
        setStakeholderData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load stakeholders:', err);
    } finally {
      setLoadingStakeholders(false);
    }
  };

  useEffect(() => {
    if (activeTask?.id) {
      fetchTaskCreatives(activeTask.id);
      fetchTaskComments(activeTask.id);
      fetchStakeholders(activeTask.id);
      setSubtasksState(Array.isArray(activeTask.subtasks) ? activeTask.subtasks : []);
    } else {
      setTaskCreatives([]);
      setCommentsList([]);
      setStakeholderData(null);
      setSubtasksState([]);
    }
  }, [activeTask?.id]);

  const fetchAvailableCreatives = async () => {
    try {
      setLoadingAvailableCreatives(true);
      const res = await api.getCreatives();
      if (res.success && Array.isArray(res.creatives)) {
        // Exclude creatives already linked to this task
        const unlinked = res.creatives.filter((c: any) => c.task_id !== activeTask?.id);
        setAvailableCreatives(unlinked);
      }
    } catch (err) {
      console.warn('Failed to load available creatives:', err);
    } finally {
      setLoadingAvailableCreatives(false);
    }
  };

  const handleOpenLinkModal = () => {
    fetchAvailableCreatives();
    setCreativeSearchQuery('');
    setShowLinkCreativeModal(true);
  };

  const handleLinkCreative = async (creativeId: string) => {
    if (!activeTask?.id) return;
    try {
      setLinkingCreativeId(creativeId);
      const res = await api.linkCreativeToTask(creativeId, activeTask.id);
      if (res.success) {
        showToast('Creative linked to task successfully!', 'success');
        fetchTaskCreatives(activeTask.id);
        fetchTasks();
        setShowLinkCreativeModal(false);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to link creative', 'error');
    } finally {
      setLinkingCreativeId(null);
    }
  };

  const handleUnlinkCreative = (creativeId: string, creativeName: string) => {
    setUnlinkingCreative({ id: creativeId, name: creativeName });
  };

  const confirmUnlinkCreative = async () => {
    if (!unlinkingCreative) return;
    try {
      const res = await api.linkCreativeToTask(unlinkingCreative.id, null);
      if (res.success) {
        showToast('Creative unlinked from task', 'success');
        if (activeTask?.id) {
          fetchTaskCreatives(activeTask.id);
          fetchTasks();
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to unlink creative', 'error');
    } finally {
      setUnlinkingCreative(null);
    }
  };

  const handleCreateCreativeForTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreativeName.trim()) {
      showToast('Creative name is required', 'error');
      return;
    }
    if (!activeTask?.id) return;

    try {
      setIsCreatingCreative(true);
      const res = await api.createCreative({
        name: newCreativeName.trim(),
        clientId: activeTask.client_id || undefined,
        projectId: activeTask.project_id || undefined,
        taskId: activeTask.id,
        targetPlatform: newCreativePlatform,
        adFormat: newCreativeFormat,
        aspectRatio: newCreativeAspectRatio,
        headline: newCreativeHeadline.trim() || undefined,
        primaryAdCopy: newCreativeCopy.trim() || undefined,
        scriptContent: newCreativeScript.trim() || undefined,
        conceptIdea: newCreativeConcept.trim() || undefined,
        callToAction: newCreativeCta || 'Learn More'
      });

      if (res.success) {
        showToast(`Creative "${newCreativeName}" created and linked to task!`, 'success');
        setShowCreateCreativeModal(false);
        setNewCreativeName('');
        setNewCreativeHeadline('');
        setNewCreativeCopy('');
        setNewCreativeScript('');
        setNewCreativeConcept('');
        fetchTaskCreatives(activeTask.id);
        fetchTasks();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create creative', 'error');
    } finally {
      setIsCreatingCreative(false);
    }
  };

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

  const fetchClientsAndProjects = async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        api.getClients().catch(() => ({ success: false, data: [] })),
        api.getProjects().catch(() => ({ success: false, data: [] })),
      ]);
      if (clientsRes.success && Array.isArray(clientsRes.data)) {
        setClientsList(clientsRes.data);
        const names = clientsRes.data.map((c: any) => c.company_name || c.name).filter(Boolean);
        setClientNames(names);
      }
      if (projectsRes.success && Array.isArray(projectsRes.data)) {
        setProjectsList(projectsRes.data);
      }
    } catch (err) {
      console.warn('Failed to load clients/projects in TasksView:', err);
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
        const mapped = res.data.map((t: any) => {
          const rawStatus = t.status || 'To Do';
          const numericProgress = typeof t.progress === 'number' ? t.progress : (rawStatus === 'Completed' ? 100 : (rawStatus === 'Review' ? 80 : (rawStatus === 'In Progress' ? 25 : 0)));
          const subtaskList = Array.isArray(t.subtasks) ? t.subtasks : [];
          const stageHistory = Array.isArray(t.stage_history) ? t.stage_history : [];
          const completedSubs = subtaskList.filter((s: any) => s.done).length;

          let statusBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
          if (rawStatus === 'Completed') {
            statusBg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
          } else if (rawStatus === 'In Progress') {
            statusBg = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
          } else if (rawStatus === 'Review') {
            statusBg = 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
          } else if (rawStatus === 'Blocked') {
            statusBg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
          }

          return {
            id: t.id,
            client_id: t.client_id,
            project_id: t.project_id,
            created_by: t.created_by,
            assignee_id: t.assignee_id,
            rawStatus,
            progress: numericProgress,
            subtasks: subtaskList,
            stage_history: stageHistory,
            comments_count: parseInt(t.comments_count || '0', 10),
            linked_creatives_count: parseInt(t.linked_creatives_count || '0', 10),
            code: `#OPT-${(t.id || '0000').slice(0, 4).toUpperCase()}`,
            title: t.title || 'Untitled Deliverable',
            description: t.description || '',
            deliverable_type: t.deliverable_type || (t.description?.toLowerCase().includes('video') ? 'VIDEO' : (t.description?.toLowerCase().includes('poster') ? 'IMAGE' : 'GENERAL')),
            script_content: t.script_content || '',
            concept_idea: t.concept_idea || '',
            subtasksCount: subtaskList.length > 0 ? `${completedSubs}/${subtaskList.length} Subtasks` : '0 Subtasks',
            subtasksBadge: rawStatus === 'Completed' ? 'Completed' : (rawStatus === 'In Progress' ? 'In Progress' : (rawStatus === 'Review' ? 'Review' : (rawStatus === 'Blocked' ? 'Blocked' : 'Pending'))),
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
            status: rawStatus === 'Completed' ? 'Done' : rawStatus,
            statusBg,
            currentDate: todayStr,
            timeline: t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Due Date',
            timelineStart: t.assigned_date ? new Date(t.assigned_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (t.start_date ? new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : todayStr),
            assignedDate: t.assigned_date ? new Date(t.assigned_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (t.start_date ? new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : todayStr),
            dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Due Date',
            timelineUrgent: t.priority === 'Urgent' || t.priority === 'High',
            timeActual: '0.0h',
            timeEst: '4.0h',
            timePercent: numericProgress
          };
        });
        setTasks(mapped);
        const targetTaskId = initialTaskId || (typeof window !== 'undefined' ? localStorage.getItem('optivir_crm_selected_task_id') : null);
        const matched = targetTaskId ? mapped.find((m: any) => m.id === targetTaskId) : null;

        if (matched) {
          setActiveTask(matched);
          setSubtasksState(matched.subtasks || []);
          setTaskDeliverableType(matched.deliverable_type || 'GENERAL');
          setTaskScript(matched.script_content || '');
          setTaskConcept(matched.concept_idea || '');
          // If task has specific client, ensure client filter includes it or resets to All
          if (matched.clientName) {
            setSelectedClient('All');
          }
        } else if (activeTask) {
          const fresh = mapped.find((m: any) => m.id === activeTask.id);
          if (fresh) {
            setActiveTask(fresh);
            setSubtasksState(fresh.subtasks);
            setTaskDeliverableType(fresh.deliverable_type || 'GENERAL');
            setTaskScript(fresh.script_content || '');
            setTaskConcept(fresh.concept_idea || '');
          }
        } else if (mapped.length > 0) {
          setActiveTask(mapped[0]);
          setSubtasksState(mapped[0].subtasks);
          setTaskDeliverableType(mapped[0].deliverable_type || 'GENERAL');
          setTaskScript(mapped[0].script_content || '');
          setTaskConcept(mapped[0].concept_idea || '');
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
    fetchClientsAndProjects();
  }, []);

  // When initialTaskId updates, auto-focus task
  useEffect(() => {
    if (tasks.length > 0 && initialTaskId) {
      const match = tasks.find((t: any) => t.id === initialTaskId);
      if (match) {
        setActiveTask(match);
        setSubtasksState(match.subtasks || []);
        setTaskDeliverableType(match.deliverable_type || 'GENERAL');
        setTaskScript(match.script_content || '');
        setTaskConcept(match.concept_idea || '');
      }
    }
  }, [initialTaskId, tasks]);

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
        client_id: newTaskClientId || undefined,
        project_id: newTaskProjectId || undefined,
        priority: newTaskPriority,
        assigned_date: newTaskAssignedDate || undefined,
        due_date: newTaskDueDate || undefined,
        assignee_id: selectedAssigneeId || undefined,
        assignee_name: selectedAssigneeName || undefined,
        assignee_role: selectedAssigneeRole || undefined,
        deliverable_type: newTaskDeliverableType,
        script_content: newTaskScript.trim() || undefined,
        concept_idea: newTaskConcept.trim() || undefined
      });
      if (res.success) {
        showToast(`Task created and assigned to ${selectedAssigneeName || 'team'}!`, 'success');
        window.dispatchEvent(new CustomEvent('notification_updated'));
        setShowCreateModal(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskDueDate('');
        setNewTaskAssignedDate(new Date().toISOString().split('T')[0]);
        setNewTaskClientId('');
        setNewTaskProjectId('');
        setNewTaskDeliverableType('VIDEO');
        setNewTaskScript('');
        setNewTaskConcept('');
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

  const handleSaveTaskScript = async () => {
    if (!activeTask) return;
    try {
      setIsSavingTaskScript(true);
      const res = await api.updateTaskScript(activeTask.id, {
        deliverable_type: taskDeliverableType,
        script_content: taskScript,
        concept_idea: taskConcept
      });
      if (res.success) {
        showToast(res.message || `Script & Concept saved! Assignee ${activeTask.assignee} notified via Email & CRM.`, 'success');
        setActiveTask((prev: any) => ({
          ...prev,
          deliverable_type: taskDeliverableType,
          script_content: taskScript,
          concept_idea: taskConcept
        }));
        fetchTaskCreatives(activeTask.id);
        fetchTasks();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save script', 'error');
    } finally {
      setIsSavingTaskScript(false);
    }
  };

  const handleCopyTaskScript = () => {
    const textToCopy = `DELIVERABLE: ${activeTask?.title || 'Task'}\nFORMAT: ${taskDeliverableType}\n\n[SCRIPT / COPY]:\n${taskScript || '(No script entered)'}\n\n[VISUAL CONCEPT]:\n${taskConcept || '(No concept entered)'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedScriptFeedback(true);
    showToast('Script & Concept copied to clipboard!', 'info');
    setTimeout(() => setCopiedScriptFeedback(false), 2000);
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

  const handleDeleteSelected = () => {
    if (selectedTasks.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
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
      setShowBulkDeleteModal(false);
    }
  };

  // Set default active task
  useEffect(() => {
    if (!activeTask && tasks.length > 0) {
      setActiveTask(tasks[0]);
    }
  }, [tasks, activeTask]);

  // Sync active task script, concept, and deliverable format
  useEffect(() => {
    if (activeTask) {
      setTaskDeliverableType(
        activeTask.deliverable_type || 
        (activeTask.description?.toLowerCase().includes('video') ? 'VIDEO' : 
        (activeTask.description?.toLowerCase().includes('poster') ? 'IMAGE' : 'GENERAL'))
      );
      setTaskScript(activeTask.script_content || '');
      setTaskConcept(activeTask.concept_idea || '');
    }
  }, [activeTask?.id, activeTask?.deliverable_type, activeTask?.script_content, activeTask?.concept_idea]);

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

  const handleAdvanceStatus = async (taskId: string, targetStatus: string, notes?: string) => {
    try {
      setIsUpdatingProgress(true);
      const res = await api.updateTaskStatus(taskId, targetStatus, notes);
      if (res.success) {
        showToast(`Task status transitioned to "${targetStatus}"`, 'success');
        setShowStatusTransitionModal(null);
        setTransitionNotes('');
        await fetchTasks();
        if (activeTask?.id === taskId) {
          fetchTaskComments(taskId);
          fetchStakeholders(taskId);
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status. Only concerned stakeholders can update progress.', 'error');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleUpdateProgress = async (taskId: string, newProgress: number) => {
    try {
      setIsUpdatingProgress(true);
      const res = await api.updateTask(taskId, { progress: newProgress });
      if (res.success) {
        showToast(`Task progress updated to ${newProgress}%`, 'success');
        setActiveTask((prev: any) => prev ? { ...prev, progress: newProgress, timePercent: newProgress } : null);
        fetchTasks();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update progress', 'error');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleToggleSubtask = async (subId: string) => {
    if (!activeTask?.id) return;
    const updated = subtasksState.map((s: any) => (s.id === subId ? { ...s, done: !s.done } : s));
    setSubtasksState(updated);
    const completedCount = updated.filter((s: any) => s.done).length;
    const autoProgress = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : activeTask.progress;
    try {
      const res = await api.updateTask(activeTask.id, { subtasks: updated, progress: autoProgress });
      if (res.success) {
        setActiveTask((prev: any) => ({ ...prev, subtasks: updated, progress: autoProgress, timePercent: autoProgress }));
        fetchTasks();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update subtask', 'error');
    }
  };

  const handleAddSubtask = async (title: string, hours: string = '1.0h') => {
    if (!activeTask?.id || !title.trim()) return;
    const newSub = { id: `s-${Date.now()}`, title: title.trim(), hours, done: false };
    const updated = [...subtasksState, newSub];
    setSubtasksState(updated);
    try {
      const res = await api.updateTask(activeTask.id, { subtasks: updated });
      if (res.success) {
        showToast('Subtask added', 'success');
        setActiveTask((prev: any) => ({ ...prev, subtasks: updated }));
        fetchTasks();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to add subtask', 'error');
    }
  };

  const handleDeleteSubtask = async (subId: string) => {
    if (!activeTask?.id) return;
    const updated = subtasksState.filter((s: any) => s.id !== subId);
    setSubtasksState(updated);
    try {
      const res = await api.updateTask(activeTask.id, { subtasks: updated });
      if (res.success) {
        showToast('Subtask removed', 'info');
        setActiveTask((prev: any) => ({ ...prev, subtasks: updated }));
        fetchTasks();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove subtask', 'error');
    }
  };

  const handlePostComment = async () => {
    if (!activeTask?.id || !newComment.trim()) return;
    try {
      setIsPostingComment(true);
      const res = await api.createTaskComment(activeTask.id, newComment.trim());
      if (res.success && res.data) {
        setCommentsList((prev) => [res.data, ...prev]);
        setNewComment('');
        showToast('Comment posted to task discussion stream', 'success');
        fetchTasks();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to post comment. You must be a concerned stakeholder.', 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  const isUserConcernedWithTask = (t: any) => {
    if (!user) return false;
    const userRole = (user.role || '').toLowerCase();
    const isLeadership = user.isOwner || (user as any).is_owner || ['owner', 'super_admin', 'admin', 'coo', 'operations_lead'].includes(userRole);
    if (isLeadership) return true;
    if (t.assignee_id && t.assignee_id === user.id) return true;
    if (t.created_by && t.created_by === user.id) return true;
    const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || '';
    if (userName && t.assignee?.toLowerCase().includes(userName.toLowerCase())) return true;
    return false;
  };

  const activeTasksCount = tasks.filter(t => t.rawStatus !== 'Completed').length;
  const myOpenTasksCount = tasks.filter(t => isUserConcernedWithTask(t) && t.rawStatus !== 'Completed').length;
  const inProgressCount = tasks.filter(t => t.rawStatus === 'In Progress').length;
  const reviewCount = tasks.filter(t => t.rawStatus === 'Review').length;
  const highPriorityCount = tasks.filter(t => (t.priority === 'Urgent' || t.priority === 'High') && t.rawStatus !== 'Completed').length;
  const completedCount = tasks.filter(t => t.rawStatus === 'Completed').length;

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

    if (!matchesSearch || !matchesClient || !matchesAssignee || !matchesPriority) {
      return false;
    }

    const isCompleted = t.rawStatus === 'Completed' || t.status === 'Done';

    // When viewing the Completed tab, show only completed tasks
    if (activeFilterTab === 'completed') {
      return isCompleted;
    }

    // In Kanban board view on the 'all' tab, keep all columns visible (including the Completed column)
    if (viewMode === 'kanban' && activeFilterTab === 'all') {
      return true;
    }

    // In all active list/detail/calendar tabs, completed tasks move to the Completed tab
    if (isCompleted) {
      return false;
    }

    if (activeFilterTab === 'my') return isUserConcernedWithTask(t);
    if (activeFilterTab === 'in_progress') return t.rawStatus === 'In Progress';
    if (activeFilterTab === 'review') return t.rawStatus === 'Review';
    if (activeFilterTab === 'overdue') return t.timeline.includes('Overdue');
    if (activeFilterTab === 'due_today') return t.timeline.includes('Due Today');
    if (activeFilterTab === 'high') return t.priority === 'Urgent' || t.priority === 'High';

    return true;
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
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{myOpenTasksCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
              <span>{tasks.filter(t => (t.priority === 'Urgent' || t.priority === 'High') && isUserConcernedWithTask(t)).length} high priority</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-400">IN PROGRESS</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1.5">{inProgressCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
              <span>Active execution</span>
            </div>
          </div>

          {/* In Review */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-400">IN REVIEW</span>
              <ShieldCheck className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1.5">{reviewCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Pending QA / Client Approval</div>
          </div>

          {/* Completed (MTD) */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-400">COMPLETED</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{completedCount}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">{tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}% completion rate</div>
          </div>

          {/* Total Deliverables */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-400">TOTAL TASKS</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{tasks.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Across all clients</div>
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
              { id: 'all', label: `Active Tasks (${activeTasksCount})` },
              { id: 'my', label: `My Tasks (${myOpenTasksCount})` },
              { id: 'in_progress', label: `In Progress (${inProgressCount})` },
              { id: 'review', label: `In Review (${reviewCount})` },
              { id: 'high', label: `High Priority (${highPriorityCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
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
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                                <span>{task.subtasksCount}</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-medium">
                                  {task.subtasksBadge}
                                </span>
                                {task.linked_creatives_count > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                      <Palette className="w-2.5 h-2.5" />
                                      <span>{task.linked_creatives_count} {task.linked_creatives_count === 1 ? 'Creative' : 'Creatives'}</span>
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
                          <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={task.rawStatus}
                              onChange={(e) => {
                                const targetStatus = e.target.value;
                                if (targetStatus !== task.rawStatus) {
                                  setShowStatusTransitionModal({ taskId: task.id, targetStatus });
                                }
                              }}
                              className={`text-[11px] font-semibold py-1 px-2 rounded-lg border cursor-pointer outline-none transition ${task.statusBg}`}
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Review">Review</option>
                              <option value="Completed">Completed</option>
                              <option value="Blocked">Blocked</option>
                            </select>
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

        {/* Kanban Board View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
            {[
              { id: 'To Do', label: 'To Do', color: 'border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300' },
              { id: 'In Progress', label: 'In Progress', color: 'border-blue-300 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300' },
              { id: 'Review', label: 'In Review', color: 'border-purple-300 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300' },
              { id: 'Completed', label: 'Completed', color: 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' },
            ].map((col) => {
              const columnTasks = filteredTasks.filter(t => t.rawStatus === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-col min-h-[500px]"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        col.id === 'Completed' ? 'bg-emerald-500' : col.id === 'Review' ? 'bg-purple-500' : col.id === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'
                      }`} />
                      <span>{col.label}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {columnTasks.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        No tasks in {col.label}
                      </div>
                    ) : (
                      columnTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setActiveTask(t);
                            setViewMode('detail');
                          }}
                          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition cursor-pointer space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400">{t.code}</span>
                            <div className="flex items-center gap-1">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                t.priority === 'Urgent' || t.priority === 'High'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {t.priority}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingTask(t);
                                }}
                                title="Delete task"
                                className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                            {t.title}
                          </h4>

                          <div className="text-[11px] text-slate-500 truncate">
                            {t.clientName}
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Progress</span>
                              <span className="font-mono font-bold">{t.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                                style={{ width: `${t.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500">
                            <div className="flex items-center gap-1.5 truncate">
                              <div className="w-5 h-5 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-bold text-[9px]">
                                {t.assigneeInitials}
                              </div>
                              <span className="truncate">{t.assignee}</span>
                            </div>
                            {t.dueDate && (
                              <span className="text-slate-400">{t.dueDate}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
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

            {/* Interactive Task Flow Pipeline Stepper */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Task Flow Pipeline
                    </h3>
                    {activeTask.rawStatus === 'Blocked' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse">
                        ⚠️ BLOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Deliverable progresses through 4 verified stages. All concerned stakeholders can view and update state.
                  </p>
                </div>

                {/* Stakeholder Authorization Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  {stakeholderData?.isConcerned ? (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Stakeholder Access: {stakeholderData.userRoleInTask || 'Concerned Member'} (Can Update Flow)</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Observer Mode (Stakeholders only can advance)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Pipeline Stepper Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { stage: 'To Do', label: '1. To Do', icon: Circle, desc: 'Scope defined' },
                  { stage: 'In Progress', label: '2. In Progress', icon: Play, desc: 'Under active work' },
                  { stage: 'Review', label: '3. In Review', icon: CheckSquare, desc: 'Client & QA review' },
                  { stage: 'Completed', label: '4. Completed', icon: CheckCircle2, desc: 'Approved & delivered' },
                ].map(({ stage, label, icon: Icon, desc }, idx) => {
                  const isCurrent = activeTask.rawStatus === stage;
                  const stageOrder = ['To Do', 'In Progress', 'Review', 'Completed'];
                  const currentIndex = stageOrder.indexOf(activeTask.rawStatus);
                  const isPast = currentIndex > idx;

                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => {
                        if (activeTask.rawStatus !== stage) {
                          setShowStatusTransitionModal({ taskId: activeTask.id, targetStatus: stage });
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/30'
                          : isPast
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{label}</span>
                        </span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        )}
                        {isPast && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                        )}
                      </div>
                      <span className={`text-[10px] ${isCurrent ? 'text-rose-100' : 'text-slate-400'}`}>
                        {desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Stage Action & Blocked Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2 flex-wrap">
                  {activeTask.rawStatus === 'To Do' && (
                    <button
                      type="button"
                      onClick={() => setShowStatusTransitionModal({ taskId: activeTask.id, targetStatus: 'In Progress' })}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Working → Move to In Progress</span>
                    </button>
                  )}
                  {activeTask.rawStatus === 'In Progress' && (
                    <button
                      type="button"
                      onClick={() => setShowStatusTransitionModal({ taskId: activeTask.id, targetStatus: 'Review' })}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Submit Deliverable → Move to Review</span>
                    </button>
                  )}
                  {activeTask.rawStatus === 'Review' && (
                    <button
                      type="button"
                      onClick={() => setShowStatusTransitionModal({ taskId: activeTask.id, targetStatus: 'Completed' })}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Complete Deliverable ✓</span>
                    </button>
                  )}
                  {activeTask.rawStatus === 'Completed' && (
                    <button
                      type="button"
                      onClick={() => setShowStatusTransitionModal({ taskId: activeTask.id, targetStatus: 'In Progress' })}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reopen Deliverable (In Progress)</span>
                    </button>
                  )}

                  {/* Blocked Button Toggle */}
                  {activeTask.rawStatus !== 'Blocked' ? (
                    <button
                      type="button"
                      onClick={() => setShowStatusTransitionModal({ taskId: activeTask.id, targetStatus: 'Blocked' })}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 text-xs font-medium transition cursor-pointer"
                    >
                      <span>Flag as Blocked...</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowStatusTransitionModal({ taskId: activeTask.id, targetStatus: 'In Progress' })}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <span>Unblock & Resume In Progress</span>
                    </button>
                  )}
                </div>

                {/* Stage History Count */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeTask.stage_history?.length || 0} stage transitions logged</span>
                </div>
              </div>

              {/* Numeric Progress Bar & Quick Presets */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Completion Progress</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                      {activeTask.progress}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    {[0, 25, 50, 75, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        disabled={isUpdatingProgress}
                        onClick={() => handleUpdateProgress(activeTask.id, preset)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          activeTask.progress === preset
                            ? 'bg-[#0A1628] text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${activeTask.progress}%` }}
                  ></div>
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

                {/* Deliverable Script & Creative Concept Workspace */}
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                  {/* Top Bar: Title, Asset Format Selector, and Quick Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/10 to-purple-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/50 dark:border-rose-900/50 shadow-2xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Deliverable Script &amp; Creative Concept
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            Draft Studio Sync
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Add the script, dialogue, or poster copy here. Auto-syncs to Creative Studio draft and alerts the assignee.
                        </p>
                      </div>
                    </div>

                    {/* Format Toggle & Copy Button */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setTaskDeliverableType('VIDEO')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                            taskDeliverableType === 'VIDEO'
                              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <Film className="w-3 h-3" />
                          <span>Video</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskDeliverableType('IMAGE')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                            taskDeliverableType === 'IMAGE'
                              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>Poster</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskDeliverableType('GENERAL')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                            taskDeliverableType === 'GENERAL'
                              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>General</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyTaskScript}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        title="Copy script & concept to clipboard"
                      >
                        {copiedScriptFeedback ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Block Snippets Toolbar */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-semibold text-slate-400">Quick Blocks:</span>
                    <button
                      type="button"
                      onClick={() => setTaskScript(prev => prev + (prev ? '\n\n' : '') + '[HOOK 0-3s]:\n')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      + Hook (0-3s)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskScript(prev => prev + (prev ? '\n\n' : '') + '[PROBLEM / PAIN POINT]:\n')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      + Problem
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskScript(prev => prev + (prev ? '\n\n' : '') + '[SOLUTION / OFFER DEMO]:\n')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      + Solution
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskScript(prev => prev + (prev ? '\n\n' : '') + '[CALL TO ACTION (CTA)]:\n')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      + Call To Action
                    </button>
                  </div>

                  {/* 1. Script / Dialogue Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {taskDeliverableType === 'VIDEO' ? (
                          <>
                            <Film className="w-3.5 h-3.5 text-rose-500" />
                            <span>Video Script &amp; Voiceover Breakdown</span>
                          </>
                        ) : taskDeliverableType === 'IMAGE' ? (
                          <>
                            <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                            <span>Poster Copy &amp; Primary Ad Text</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5 text-rose-500" />
                            <span>Deliverable Copy / Text Script</span>
                          </>
                        )}
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {taskScript.length} chars • {taskScript.trim() ? taskScript.trim().split(/\s+/).length : 0} words
                      </span>
                    </div>

                    <textarea
                      rows={5}
                      value={taskScript}
                      onChange={(e) => setTaskScript(e.target.value)}
                      placeholder={
                        taskDeliverableType === 'VIDEO'
                          ? "Write scene breakdown, spoken dialogue, voiceover notes, or timestamps...\n\n[HOOK 0-3s]: Stop scrolling if you're struggling with high CAC...\n[PROBLEM]: Most ad creatives fatigue within 4 days...\n[SOLUTION]: Here is how OptiVir scripts 10x variants in minutes...\n[CTA]: Click below to get your bespoke audit."
                          : "Write headline, subhead, hook, body copy, and CTA text for this graphic deliverable..."
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                    />
                  </div>

                  {/* 2. Visual Concept / Framing Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {taskDeliverableType === 'VIDEO'
                            ? 'Director’s Shot Direction & Visual Cues'
                            : 'Visual Concept, Layout & Art Direction'}
                        </span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {taskConcept.length} chars
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={taskConcept}
                      onChange={(e) => setTaskConcept(e.target.value)}
                      placeholder={
                        taskDeliverableType === 'VIDEO'
                          ? "Visual framing (9:16 vertical), camera angles, screen-recording overlays, green-screen effects, B-roll clips, background audio pace..."
                          : "Design mood, color palette, logo placement, typography style, product mockups, 1:1 square / 4:5 vertical proportions..."
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 text-xs leading-relaxed focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                    />
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>
                        Saves to task • Creates draft in Creative Studio • Notifies assignee in CRM &amp; email
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveTaskScript}
                        disabled={isSavingTaskScript}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
                      >
                        {isSavingTaskScript ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving Script...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Save Script to Task</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
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
                          handleAddSubtask(newSub.trim());
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
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs"
                          >
                            <div
                              onClick={() => handleToggleSubtask(sub.id)}
                              className="flex items-center gap-2.5 cursor-pointer flex-1"
                            >
                              <input
                                type="checkbox"
                                checked={sub.done}
                                onChange={() => handleToggleSubtask(sub.id)}
                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                              />
                              <span className={sub.done ? 'line-through text-slate-400' : 'font-medium text-slate-800 dark:text-slate-200'}>
                                {sub.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-400">{sub.hours || '1.0h'}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubtask(sub.id)}
                                title="Remove subtask"
                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
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

                {/* 3. Linked Creative Assets & Proofing */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Palette className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Linked Creative Assets &amp; Proofing
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {taskCreatives.length} Linked
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenLinkModal}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3 text-slate-500" />
                        <span>Link Existing</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewCreativeName(activeTask?.title || '');
                          setNewCreativeHeadline('');
                          setNewCreativeCopy(activeTask?.description || '');
                          setShowCreateCreativeModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create Creative</span>
                      </button>
                    </div>
                  </div>

                  {loadingCreatives ? (
                    <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading linked creatives...</span>
                    </div>
                  ) : taskCreatives.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {taskCreatives.map((creative) => {
                        const platformBg =
                          creative.target_platform === 'META'
                            ? 'bg-blue-600 text-white'
                            : creative.target_platform === 'TIKTOK'
                            ? 'bg-black text-white dark:bg-slate-800'
                            : creative.target_platform === 'GOOGLE_ADS'
                            ? 'bg-amber-600 text-white'
                            : creative.target_platform === 'LINKEDIN'
                            ? 'bg-sky-700 text-white'
                            : creative.target_platform === 'YOUTUBE'
                            ? 'bg-red-600 text-white'
                            : 'bg-purple-600 text-white';

                        const statusStyle =
                          creative.status === 'APPROVED' || creative.status === 'LIVE'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : creative.status === 'PENDING_CLIENT_APPROVAL'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : creative.status === 'CHANGES_REQUESTED'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

                        return (
                          <div
                            key={creative.id}
                            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                          >
                            <div>
                              {/* Thumbnail / Visual Box */}
                              <div className="relative w-full h-36 bg-gradient-to-br from-slate-800 to-slate-950 overflow-hidden flex items-center justify-center">
                                {(() => {
                                  const previewSrc = creative.previewUrl || creative.preview_url || creative.thumbnailUrl || creative.thumbnail_url || (creative.assets && creative.assets[0]?.viewingUrl);
                                  const isVideo = creative.ad_format === 'VIDEO' || creative.ad_format?.toUpperCase() === 'VIDEO' || (typeof previewSrc === 'string' && previewSrc.match(/\.(mp4|mov|webm|avi|mkv)($|\?)/i));

                                  if (previewSrc) {
                                    if (isVideo) {
                                      return (
                                        <div
                                          onClick={() => setPreviewingVideo({
                                            url: previewSrc,
                                            title: creative.name,
                                            format: creative.ad_format,
                                            platform: creative.target_platform
                                          })}
                                          className="w-full h-full flex items-center justify-center bg-slate-950 text-white relative cursor-pointer group/video"
                                          title="Click to preview video deliverable"
                                        >
                                          <video
                                            src={previewSrc}
                                            controlsList="nodownload"
                                            onContextMenu={(e) => e.preventDefault()}
                                            className="w-full h-full object-cover pointer-events-none"
                                            muted
                                            playsInline
                                          />
                                          <div className="absolute inset-0 bg-black/30 group-hover/video:bg-black/50 flex items-center justify-center transition">
                                            <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-xs flex items-center justify-center group-hover/video:scale-110 transition shadow-lg border border-white/30">
                                              <Play className="w-5 h-5 text-white fill-white ml-0.5 drop-shadow-md" />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }

                                    return (
                                      <img
                                        src={previewSrc}
                                        alt={creative.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    );
                                  }

                                  return (
                                    <div className="flex flex-col items-center gap-1.5 text-slate-400 p-4 text-center">
                                      {creative.ad_format === 'VIDEO' ? (
                                        <Film className="w-8 h-8 text-rose-500/80" />
                                      ) : (
                                        <ImageIcon className="w-8 h-8 text-purple-500/80" />
                                      )}
                                      <span className="text-[11px] font-semibold tracking-wide text-slate-300">
                                        {creative.ad_format || 'IMAGE'} • {creative.aspect_ratio || '1:1'}
                                      </span>
                                    </div>
                                  );
                                })()}
                                <WatermarkOverlay size="sm" />

                                {/* Overlay Badges */}
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase shadow-xs ${platformBg}`}>
                                    {creative.target_platform || 'ALL'}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                                    {creative.ad_format || 'IMAGE'}
                                  </span>
                                </div>

                                <div className="absolute top-2.5 right-2.5 z-20">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs border border-white/10">
                                    v{creative.active_version || 1}
                                  </span>
                                </div>
                              </div>

                              {/* Creative Content Details */}
                              <div className="p-3.5 space-y-2 text-xs">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 text-sm group-hover:text-rose-600 transition">
                                      {creative.name}
                                    </h4>
                                    {creative.headline && (
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic mt-0.5">
                                        &ldquo;{creative.headline}&rdquo;
                                      </p>
                                    )}
                                    {(creative.script_content || creative.concept_idea) && (
                                      <div className="mt-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-[#080E18] border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono line-clamp-2">
                                        <span className="font-bold text-[#DC2626]">
                                          {creative.ad_format === 'VIDEO' ? '🎬 Script: ' : '🎨 Concept: '}
                                        </span>
                                        {creative.script_content || creative.concept_idea}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap pt-1">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyle}`}>
                                    {String(creative.status || 'DRAFT').replace(/_/g, ' ')}
                                  </span>

                                  {parseInt(creative.unresolved_comments_count || '0', 10) > 0 ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                                      💬 {creative.unresolved_comments_count} Feedback Pins
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      ✓ Ready
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Card Actions Footer */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onNavigate) {
                                    onNavigate('creatives');
                                  } else {
                                    showToast(`Opening Creative Studio for ${creative.name}`, 'info');
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#0A1628] hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                              >
                                <span>Open in Creative Studio</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUnlinkCreative(creative.id, creative.name)}
                                title="Unlink creative from this task"
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-inner">
                        <Palette className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">No Creative Drafts Linked</h4>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Link existing multi-platform ad creative proofs to this task or generate a new creative brief directly linked to this deliverable.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleOpenLinkModal}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>Link Existing Creative</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewCreativeName(activeTask?.title || '');
                            setNewCreativeHeadline('');
                            setNewCreativeCopy(activeTask?.description || '');
                            setShowCreateCreativeModal(true);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Creative for Task</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Activity & Discussion */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>Activity &amp; Discussion</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {commentsList.length} Comments • {activeTask.stage_history?.length || 0} Stage Updates
                    </span>
                  </div>

                  {/* Comment Editor */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 space-y-2">
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={
                        stakeholderData?.isConcerned
                          ? "Leave a note, creative feedback, or deliverable status update..."
                          : "Stakeholder discussion (Observer read-only mode)..."
                      }
                      disabled={Boolean(stakeholderData && !stakeholderData.isConcerned)}
                      className="w-full text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none disabled:opacity-50"
                    ></textarea>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] text-slate-400">
                        {stakeholderData?.isConcerned
                          ? "Concerned stakeholders will be notified of updates"
                          : "You must be a stakeholder or assignee to post"}
                      </span>
                      <button
                        type="button"
                        disabled={Boolean(isPostingComment || !newComment.trim() || (stakeholderData && !stakeholderData.isConcerned))}
                        onClick={handlePostComment}
                        className="px-4 py-1.5 bg-[#0A1628] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isPostingComment ? 'Posting...' : 'Post Comment'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Combined Timeline & Comments Stream */}
                  <div className="space-y-3 text-xs">
                    {/* Stage Transition History Events */}
                    {activeTask.stage_history && activeTask.stage_history.length > 0 && (
                      <div className="space-y-2 pb-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <History className="w-3 h-3 text-slate-400" />
                          <span>Stage History</span>
                        </div>
                        {activeTask.stage_history.map((h: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5"
                          >
                            <div className="w-6 h-6 rounded-full bg-rose-600/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                              <History className="w-3 h-3" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                                  Stage Transition: <span className="text-rose-600">{h.stage}</span>
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {h.timestamp ? new Date(h.timestamp).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Recently'}
                                </span>
                              </div>
                              <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                                by <span className="font-semibold">{h.user_name || 'Stakeholder'}</span>
                                {h.notes && <span> &mdash; &ldquo;{h.notes}&rdquo;</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Persisted Discussion Comments */}
                    {loadingComments ? (
                      <div className="py-4 text-center text-slate-400 text-xs">Loading comments...</div>
                    ) : commentsList.length > 0 ? (
                      commentsList.map((c: any) => (
                        <div key={c.id} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {c.author_initials || (c.author_name || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white">{c.author_name || 'Team Member'}</span>
                                {c.author_role && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    {c.author_role}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Just now'}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                              {c.comment}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                        No team discussion posted yet. Leave an update or note above.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT 30%: Concerned Stakeholders, Time Tracking Stopwatch & Connected CRM Entities */}
              <div className="lg:col-span-4 space-y-6">
                {/* 0. Concerned Stakeholders Directory */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Concerned Stakeholders</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {stakeholderData?.stakeholders?.length || 1} Total
                    </span>
                  </div>

                  <div className="text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>Your Access Level:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {stakeholderData?.userRoleInTask || (stakeholderData?.isConcerned ? 'Stakeholder' : 'Observer')}
                    </strong>
                  </div>

                  <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {loadingStakeholders ? (
                      <div className="text-center py-3 text-slate-400 text-xs">Loading stakeholders...</div>
                    ) : stakeholderData?.stakeholders && stakeholderData.stakeholders.length > 0 ? (
                      stakeholderData.stakeholders.map((s: any, idx: number) => (
                        <div key={s.id || idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                              {(s.name || s.email || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate">{s.name || s.email}</div>
                              <div className="text-[10px] text-slate-400 truncate">{s.role || 'Member'}</div>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                            {s.relationship || 'Stakeholder'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-center py-2 text-xs">
                        Assignee: {activeTask.assignee}
                      </div>
                    )}
                  </div>
                </div>

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
                    className="w-full text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer"
                  >
                    Archive Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingTask(activeTask)}
                    className="w-full text-left py-2 px-3 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-rose-600 font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Deliverable</span>
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
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-4">
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

              {/* Client & Project Selection (Cascading Dropdown) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Client Account (Optional)</label>
                  <select
                    value={newTaskClientId}
                    onChange={(e) => {
                      const newCId = e.target.value;
                      setNewTaskClientId(newCId);
                      setNewTaskProjectId('');
                    }}
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="">No Client (Internal / General)</option>
                    {clientsList.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Project (Optional)</label>
                  <select
                    value={newTaskProjectId}
                    onChange={(e) => setNewTaskProjectId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="">
                      {newTaskClientId && projectsList.filter((p: any) => p.client_id === newTaskClientId).length === 0
                        ? 'No projects for this client'
                        : 'No Project (Ad-Hoc / General)'}
                    </option>
                    {(newTaskClientId
                      ? projectsList.filter((p: any) => p.client_id === newTaskClientId)
                      : projectsList
                    ).map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Deliverable Category</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setNewTaskCategory(cat);
                    const lower = cat.toLowerCase();
                    if (lower.includes('video') || lower.includes('reel')) {
                      setNewTaskDeliverableType('VIDEO');
                    } else if (lower.includes('poster') || lower.includes('creative') || lower.includes('brand')) {
                      setNewTaskDeliverableType('IMAGE');
                    }
                  }}
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

              {/* Deliverable Format Selector */}
              <div>
                <label className="block font-semibold mb-1">Deliverable Asset Format</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTaskDeliverableType('VIDEO')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      newTaskDeliverableType === 'VIDEO'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Video / Reel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskDeliverableType('IMAGE')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      newTaskDeliverableType === 'IMAGE'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Poster / Graphic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskDeliverableType('GENERAL')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      newTaskDeliverableType === 'GENERAL'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>General Task</span>
                  </button>
                </div>
              </div>

              {/* Script & Idea Space in Task Creation Window */}
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {newTaskDeliverableType === 'VIDEO'
                        ? 'Video Script & Scene Breakdown'
                        : newTaskDeliverableType === 'IMAGE'
                        ? 'Poster Copy & Creative Concept'
                        : 'Deliverable Script / Copy'}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Draft Studio Sync
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {newTaskDeliverableType === 'VIDEO'
                        ? 'Script / Dialogue / Voiceover Breakdown'
                        : 'Poster Copy / Ad Headline / Text'}
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setNewTaskScript(prev => prev + (prev ? '\n\n' : '') + '[HOOK 0-3s]: ')}
                        className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        + Hook
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setNewTaskScript(prev => prev + (prev ? '\n\n' : '') + '[PROBLEM / PAIN POINT]: ')}
                        className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        + Problem
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setNewTaskScript(prev => prev + (prev ? '\n\n' : '') + '[SOLUTION / OFFER]: ')}
                        className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        + Solution
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setNewTaskScript(prev => prev + (prev ? '\n\n' : '') + '[CALL TO ACTION]: ')}
                        className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        + CTA
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={newTaskScript}
                    onChange={(e) => setNewTaskScript(e.target.value)}
                    placeholder={
                      newTaskDeliverableType === 'VIDEO'
                        ? "Write video script, dialogue, or voiceover scene-by-scene...\n[HOOK]: Stop scrolling if...\n[PROBLEM]: Why most ads fail...\n[SOLUTION]: How our strategy converts...\n[CTA]: Click below..."
                        : "Write headline, subhead, hook, body copy, and CTA text for this graphic deliverable..."
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#080E18] outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {newTaskDeliverableType === 'VIDEO'
                      ? 'Visual Concept & Shot Direction (Framing, B-roll, Text Overlays)'
                      : 'Visual Concept & Art Direction (Colors, Mockup, Layout Style)'}
                  </label>
                  <textarea
                    rows={2}
                    value={newTaskConcept}
                    onChange={(e) => setNewTaskConcept(e.target.value)}
                    placeholder="Describe scene framing (9:16 vertical / 1:1), B-roll visual cues, on-screen text overlays, reference links..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#080E18] outline-none text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    When created, script automatically creates a <strong>DRAFT</strong> in Creative Studio and notifies assignee via CRM &amp; email.
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Task Requirements &amp; Scope Notes</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Additional delivery instructions, client guidelines, or SLA requirements..."
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

      {/* Link Existing Creative Modal */}
      {showLinkCreativeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E6EC] dark:border-[#152238]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0B1727] dark:text-white">Link Creative to Deliverable</h3>
                  <p className="text-[11px] text-slate-500">Attach an existing creative proof to this task</p>
                </div>
              </div>
              <button
                onClick={() => setShowLinkCreativeModal(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Task Banner */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Task</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeTask?.title}</span>
              </div>
              <span className="font-mono text-xs font-bold text-rose-600">{activeTask?.code}</span>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={creativeSearchQuery}
                onChange={(e) => setCreativeSearchQuery(e.target.value)}
                placeholder="Search creatives by title, platform, or format..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#080E18] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Available Creatives List */}
            <div className="overflow-y-auto flex-1 space-y-2 max-h-72 pr-1 custom-scrollbar">
              {loadingAvailableCreatives ? (
                <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading available creatives...</span>
                </div>
              ) : availableCreatives.filter((c: any) =>
                  c.name.toLowerCase().includes(creativeSearchQuery.toLowerCase()) ||
                  (c.target_platform || '').toLowerCase().includes(creativeSearchQuery.toLowerCase()) ||
                  (c.ad_format || '').toLowerCase().includes(creativeSearchQuery.toLowerCase())
                ).length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs space-y-2">
                  <Palette className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No unlinked creatives found</p>
                  <p className="text-[11px] text-slate-400">All creatives may already be linked, or try a different search term.</p>
                </div>
              ) : (
                availableCreatives
                  .filter((c: any) =>
                    c.name.toLowerCase().includes(creativeSearchQuery.toLowerCase()) ||
                    (c.target_platform || '').toLowerCase().includes(creativeSearchQuery.toLowerCase()) ||
                    (c.ad_format || '').toLowerCase().includes(creativeSearchQuery.toLowerCase())
                  )
                  .map((creative) => (
                    <div
                      key={creative.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900/60 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 text-white font-bold text-xs relative">
                          {(() => {
                            const modalPreviewSrc = creative.previewUrl || creative.preview_url || creative.thumbnailUrl || creative.thumbnail_url || (creative.assets && creative.assets[0]?.viewingUrl);
                            const isModalVideo = creative.ad_format === 'VIDEO' || creative.ad_format?.toUpperCase() === 'VIDEO' || (typeof modalPreviewSrc === 'string' && modalPreviewSrc.match(/\.(mp4|mov|webm|avi|mkv)($|\?)/i));

                            if (modalPreviewSrc) {
                              if (isModalVideo) {
                                return (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-950 relative">
                                    <video
                                      src={modalPreviewSrc}
                                      className="w-full h-full object-cover"
                                      muted
                                      playsInline
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <img
                                  src={modalPreviewSrc}
                                  alt={creative.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              );
                            }
                            return <Palette className="w-4 h-4 text-purple-400" />;
                          })()}
                          <WatermarkOverlay size="xs" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{creative.name}</h5>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 flex-wrap">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{creative.target_platform || 'ALL'}</span>
                            <span>•</span>
                            <span>{creative.ad_format || 'IMAGE'} ({creative.aspect_ratio || '1:1'})</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">{creative.status || 'DRAFT'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={linkingCreativeId === creative.id}
                        onClick={() => handleLinkCreative(creative.id)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>{linkingCreativeId === creative.id ? 'Linking...' : 'Link to Task'}</span>
                      </button>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#E2E6EC] dark:border-[#152238] text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowLinkCreativeModal(false);
                  setNewCreativeName(activeTask?.title || '');
                  setShowCreateCreativeModal(true);
                }}
                className="text-rose-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create new creative instead</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLinkCreativeModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Creative for Task Modal */}
      {showCreateCreativeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E6EC] dark:border-[#152238]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0B1727] dark:text-white">Create Creative for Task</h3>
                  <p className="text-[11px] text-slate-500">Creates creative proof linked to {activeTask?.code}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateCreativeModal(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCreativeForTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Creative Name *</label>
                <input
                  type="text"
                  required
                  value={newCreativeName}
                  onChange={(e) => setNewCreativeName(e.target.value)}
                  placeholder="e.g. DM series - Intro High Impact Reel"
                  className="w-full p-2.5 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Target Platform</label>
                  <select
                    value={newCreativePlatform}
                    onChange={(e) => setNewCreativePlatform(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-white outline-none"
                  >
                    <option value="META">Meta (FB / IG)</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="GOOGLE_ADS">Google Ads</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="ALL">All Platforms</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Ad Format</label>
                  <select
                    value={newCreativeFormat}
                    onChange={(e) => setNewCreativeFormat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-white outline-none"
                  >
                    <option value="IMAGE">Image / Graphic</option>
                    <option value="VIDEO">Video / Reel</option>
                    <option value="CAROUSEL">Carousel</option>
                    <option value="BANNER">Banner</option>
                    <option value="DOCUMENT">Document</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Aspect Ratio</label>
                  <select
                    value={newCreativeAspectRatio}
                    onChange={(e) => setNewCreativeAspectRatio(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-white outline-none"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="9:16">9:16 Story / Reel</option>
                    <option value="16:9">16:9 Landscape</option>
                    <option value="4:5">4:5 Feed Portrait</option>
                    <option value="1.91:1">1.91:1 Landscape</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Headline (Optional)</label>
                <input
                  type="text"
                  value={newCreativeHeadline}
                  onChange={(e) => setNewCreativeHeadline(e.target.value)}
                  placeholder="e.g. Master Digital Marketing in 30 Days"
                  className="w-full p-2.5 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Primary Ad Copy / Brief (Optional)</label>
                <textarea
                  rows={2}
                  value={newCreativeCopy}
                  onChange={(e) => setNewCreativeCopy(e.target.value)}
                  placeholder="Key messaging points, creative direction, or copy brief..."
                  className="w-full p-2.5 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-white outline-none resize-none"
                />
              </div>

              {/* Dynamic Scripting and Poster / Image Idea Workspace */}
              {newCreativeFormat === 'VIDEO' ? (
                <div className="space-y-3 p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/50">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <Film className="w-3.5 h-3.5" />
                    <span>Video Scripting &amp; Concept</span>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px] text-slate-700 dark:text-slate-300">
                      Video Script &amp; Scene Breakdown
                    </label>
                    <textarea
                      rows={3}
                      value={newCreativeScript}
                      onChange={(e) => setNewCreativeScript(e.target.value)}
                      placeholder="[0:00 - 0:03 HOOK]: Stop wasting hours on manual reporting!&#10;[0:03 - 0:15 SCENE 1]: Show dashboard animation with real-time analytics...&#10;[0:15 - 0:30 CTA]: Download free trial today!"
                      className="w-full p-2 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#080E18] text-slate-900 dark:text-white font-mono text-xs outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px] text-slate-700 dark:text-slate-300">
                      Video Concept &amp; Storyboard Idea
                    </label>
                    <textarea
                      rows={2}
                      value={newCreativeConcept}
                      onChange={(e) => setNewCreativeConcept(e.target.value)}
                      placeholder="UGC format, fast-paced transitions, energetic background beat, vibrant captions..."
                      className="w-full p-2 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#080E18] text-slate-900 dark:text-white font-mono text-xs outline-none resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Poster Idea &amp; Visual Concept</span>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px] text-slate-700 dark:text-slate-300">
                      Poster / Image Creative Idea
                    </label>
                    <textarea
                      rows={2}
                      value={newCreativeConcept}
                      onChange={(e) => setNewCreativeConcept(e.target.value)}
                      placeholder="e.g. Minimalist sleek dark mode poster with 3D floating dashboard icons, glowing gradient badge top-right..."
                      className="w-full p-2 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#080E18] text-slate-900 dark:text-white font-mono text-xs outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px] text-slate-700 dark:text-slate-300">
                      Poster Copy &amp; Text Layout
                    </label>
                    <textarea
                      rows={2}
                      value={newCreativeScript}
                      onChange={(e) => setNewCreativeScript(e.target.value)}
                      placeholder="Big Bold Header: 'SCALE 10X'&#10;Sub-bullets: '• Realtime Sync • Zero Setup'&#10;Corner Stamp: 'TRUSTED BY 500+ TEAMS'"
                      className="w-full p-2 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#080E18] text-slate-900 dark:text-white font-mono text-xs outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Call To Action</label>
                <select
                  value={newCreativeCta}
                  onChange={(e) => setNewCreativeCta(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-white outline-none"
                >
                  <option value="Learn More">Learn More</option>
                  <option value="Sign Up">Sign Up</option>
                  <option value="Shop Now">Shop Now</option>
                  <option value="Contact Us">Contact Us</option>
                  <option value="Apply Now">Apply Now</option>
                  <option value="Book Now">Book Now</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
                <button
                  type="button"
                  onClick={() => setShowCreateCreativeModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-[#111E34] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCreative}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isCreatingCreative ? 'Creating...' : 'Create & Link Creative'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Deliverable Quick Preview Modal */}
      {previewingVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase">
                  {previewingVideo.platform || 'VIDEO'}
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {previewingVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingVideo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
              <video
                src={previewingVideo.url}
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <WatermarkOverlay size="lg" className="z-20" />
            </div>
            <div className="p-3.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                Cloudflare R2 High-Resolution Deliverable Asset
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewingVideo(null);
                    if (onNavigate) onNavigate('creatives');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Open in Creative Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Status Transition Notes Modal */}
      {showStatusTransitionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E6EC] dark:border-[#152238]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm text-[#0B1727] dark:text-white">
                  Advance Flow: &quot;{showStatusTransitionModal.targetStatus}&quot;
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowStatusTransitionModal(null);
                  setTransitionNotes('');
                }}
                className="text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                You are moving this deliverable to{' '}
                <strong className="text-rose-600 dark:text-rose-400 font-bold">
                  {showStatusTransitionModal.targetStatus}
                </strong>
                . This change will be logged in stage history and visible to all concerned stakeholders.
              </p>

              {showStatusTransitionModal.targetStatus === 'Completed' && (
                <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                  <span>
                    <strong>Deliverable Flow:</strong> Tasks linked to creative deliverables automatically complete when the creative is client-approved and moved to Deployment Ready or Live Campaign.
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Transition Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="e.g. Uploaded final proofs for client sign-off, or why deliverable is paused..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E6EC] dark:border-[#152238]">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusTransitionModal(null);
                    setTransitionNotes('');
                  }}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUpdatingProgress}
                  onClick={() =>
                    handleAdvanceStatus(
                      showStatusTransitionModal.taskId,
                      showStatusTransitionModal.targetStatus,
                      transitionNotes
                    )
                  }
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isUpdatingProgress ? 'Updating...' : 'Confirm Transition'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Task Confirmation Modal */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E6EC] dark:border-[#152238]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0B1727] dark:text-white">Delete Deliverable / Task</h3>
                  <p className="text-[11px] text-slate-500">Permanently remove task from pipeline</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingTask(null)}
                className="text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-slate-400">{deletingTask.code || 'TASK'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {deletingTask.priority || 'Medium'} Priority
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {deletingTask.title}
                </h4>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>Client: <strong>{deletingTask.clientName || 'Assigned Client'}</strong></span>
                  {deletingTask.projectName && (
                    <>
                      <span>•</span>
                      <span>Project: <strong>{deletingTask.projectName}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {deletingTask.linkedCreativesCount > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
                  <span className="font-bold shrink-0">⚠️ Note:</span>
                  <span>This deliverable has {deletingTask.linkedCreativesCount} linked creative proof(s). Deleting the task will unlink the proofs without deleting the creative files.</span>
                </div>
              )}

              <p className="text-slate-600 dark:text-slate-400">
                Are you sure you want to delete this deliverable? This action will remove it from the active sprint pipeline.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E6EC] dark:border-[#152238]">
                <button
                  type="button"
                  onClick={() => setDeletingTask(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTask}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Deliverable'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Tasks Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkDeleteModal}
        title={`Delete ${selectedTasks.length} Deliverables`}
        badge={`${selectedTasks.length} Selected`}
        description={`Are you sure you want to permanently delete ${selectedTasks.length} selected tasks from the database?`}
        subDescription="Associated creative proof files will be unlinked safely so no artwork or media assets are destroyed."
        confirmText={`Delete ${selectedTasks.length} Deliverables`}
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmBulkDelete}
        onClose={() => setShowBulkDeleteModal(false)}
      />

      {/* Unlink Creative Confirmation Modal */}
      <ConfirmModal
        isOpen={!!unlinkingCreative}
        title="Unlink Creative Asset"
        description={`Are you sure you want to unlink creative "${unlinkingCreative?.name}" from this deliverable?`}
        subDescription="The creative remains intact and safe in the asset library, but will no longer be attached to this task."
        confirmText="Unlink Creative"
        cancelText="Keep Linked"
        variant="warning"
        onConfirm={confirmUnlinkCreative}
        onClose={() => setUnlinkingCreative(null)}
      />
    </div>
  );
};
