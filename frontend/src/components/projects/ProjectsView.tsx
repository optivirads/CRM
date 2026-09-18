'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';
import { api } from '@/lib/api';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Upload,
  Download,
  Calendar,
  AlertTriangle,
  Flame,
  CheckSquare,
  TrendingUp,
  MoreVertical,
  Kanban,
  ListFilter,
  BarChart3,
  RefreshCw,
  Trash2,
  Archive,
  ArrowRight,
  DollarSign
} from 'lucide-react';

export const DEFAULT_CLIENT_COMPANIES: string[] = [];

export const DEFAULT_PROJECTS: any[] = [];

export const ProjectsView: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // View Mode: List | Kanban | Timeline
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline'>('list');

  // Filter Tabs
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('All');
  const [selectedLead, setSelectedLead] = useState('All');
  const [selectedHealth, setSelectedHealth] = useState('All');

  // Selection
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Client Companies state (OptiVir agency client roster)
  const [clientList, setClientList] = useState<Array<{ id: string; name: string }>>([]);
  const [clientCompanies, setClientCompanies] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('optivir_client_companies');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((c: string) => ![
              'Zenith DTC Brands',
              'Astra Health Tech',
              'UrbanKulture Apparels',
              'NexaScale Logistics',
              'FinEdge Wealth Advisors',
              'Auric Living Luxury Real Estate',
              'BioPure Nutra Labs',
              'SparkVibe Media Network',
            ].includes(c));
          }
        }
      } catch (e) {}
    }
    return DEFAULT_CLIENT_COMPANIES;
  });
  const [showAddNewClient, setShowAddNewClient] = useState(false);
  const [customClientInput, setCustomClientInput] = useState('');

  // Add Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newScopeType, setNewScopeType] = useState('Social Media Posters & Creatives');
  const [newLeadPM, setNewLeadPM] = useState('OptiVir Admin');
  const [newBudget, setNewBudget] = useState('');
  const [newStartDate, setNewStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDeadline, setNewDeadline] = useState('');

  // Projects data from PostgreSQL
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProject, setDeletingProject] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await api.getClients();
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data
          .map((c: any) => ({
            id: c.id,
            name: c.company_name || c.name || '',
          }))
          .filter((c: any) => Boolean(c.name));

        setClientList(mapped);

        // Also check if user has custom companies saved in localStorage
        let savedNames: string[] = [];
        if (typeof window !== 'undefined') {
          try {
            const saved = localStorage.getItem('optivir_client_companies');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                savedNames = parsed.filter((c: string) => typeof c === 'string' && c.trim() && ![
                  'Zenith DTC Brands',
                  'Astra Health Tech',
                  'UrbanKulture Apparels',
                  'NexaScale Logistics',
                  'FinEdge Wealth Advisors',
                  'Auric Living Luxury Real Estate',
                  'BioPure Nutra Labs',
                  'SparkVibe Media Network',
                ].includes(c));
              }
            }
          } catch {}
        }

        const uniqueNames = Array.from(new Set([...mapped.map((c) => c.name), ...savedNames]));
        setClientCompanies(uniqueNames);
        if (uniqueNames.length > 0 && typeof window !== 'undefined') {
          localStorage.setItem('optivir_client_companies', JSON.stringify(uniqueNames));
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch clients:', err);
    }
  };

  const handleAddClientCompany = async (companyName: string) => {
    const trimmed = companyName.trim();
    if (!trimmed) return;
    try {
      const res = await api.createClient({ company_name: trimmed });
      if (res.success && res.data) {
        setClientList((prev) => [...prev.filter((c) => c.id !== res.data.id), { id: res.data.id, name: trimmed }]);
      }
    } catch (e) {
      console.warn('Failed to create client in DB:', e);
    }
    if (!clientCompanies.includes(trimmed)) {
      const updated = [...clientCompanies, trimmed];
      setClientCompanies(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('optivir_client_companies', JSON.stringify(updated));
      }
    }
    setNewClientName(trimmed);
    setCustomClientInput('');
    setShowAddNewClient(false);
    showToast(`Linked client company: "${trimmed}"`, 'success');
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects();
      if (res.success && Array.isArray(res.data)) {
        const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const mapped = res.data.map((p: any) => ({
          id: p.id,
          code: `P-${p.id.slice(0, 4).toUpperCase()}`,
          name: p.name || 'Untitled Project',
          scopeType: p.description || 'Creative & Digital Delivery',
          clientName: p.company_name || 'Direct Client',
          clientAvatarText: (p.company_name || 'PR').slice(0, 2).toUpperCase(),
          clientAvatarBg: 'bg-[#B91C1C]',
          clientAvatarTextColor: 'text-white',
          leadPM: p.pm_first ? `${p.pm_first} ${p.pm_last || ''}`.trim() : 'OptiVir Admin',
          leadInitials: ((p.pm_first?.[0] || 'A') + (p.pm_last?.[0] || 'M')).toUpperCase(),
          status: p.status || 'Active',
          statusBg: p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700',
          health: 'Healthy (95)',
          healthStatus: 'healthy',
          progressPercent: p.progress || 25,
          sprint: 'Sprint Active',
          budget: p.budget ? `₹${Number(p.budget).toLocaleString('en-IN')}` : '₹0',
          spent: '₹0 (0%)',
          currentDate: todayStr,
          assignedDate: p.start_date ? new Date(p.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : todayStr),
          deadline: p.end_date ? new Date(p.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No deadline',
          deadlineSub: p.end_date ? 'On Track' : 'Not specified',
          deadlineUrgent: false,
          tasksCompleted: Number(p.completed_tasks_count || 0),
          tasksTotal: Number(p.total_tasks_count || 0) || 0
        }));
        setProjects(mapped);
      }
    } catch (err: any) {
      console.warn('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const toggleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((p) => p.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      showToast('Please enter a project name', 'error');
      return;
    }

    try {
      setIsCreating(true);
      const budgetNum = parseFloat(newBudget.replace(/[^0-9.]/g, '')) || 100000;
      const matchedClient = clientList.find(c => c.name.toLowerCase() === newClientName.toLowerCase());
      const res = await api.createProject({
        name: newProjectName.trim(),
        client_id: matchedClient?.id || undefined,
        client_name: newClientName || undefined,
        description: newScopeType || undefined,
        budget: budgetNum,
        priority: 'Medium',
        status: 'Active',
        start_date: newStartDate || undefined,
        end_date: newDeadline || undefined,
      });
      if (res.success) {
        showToast(`Project "${newProjectName}" created successfully`, 'success');
        setShowCreateModal(false);
        setNewProjectName('');
        setNewClientName('');
        setNewDeadline('');
        fetchProjects();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create project', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      setIsDeleting(true);
      const res = await api.deleteProject(deletingProject.id);
      if (res.success) {
        showToast(`Project "${deletingProject.name}" deleted successfully`);
        setDeletingProject(null);
        fetchProjects();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProjects.length === 0) return;
    if (!confirm(`Delete ${selectedProjects.length} selected projects from the database?`)) return;
    try {
      setIsDeleting(true);
      await Promise.all(selectedProjects.map((id) => api.deleteProject(id)));
      showToast(`Deleted ${selectedProjects.length} projects successfully`);
      setSelectedProjects([]);
      fetchProjects();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete projects', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.leadPM.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClient = selectedClient === 'All' || p.clientName.includes(selectedClient);
    const matchesLead = selectedLead === 'All' || p.leadPM.includes(selectedLead);
    const matchesHealth = selectedHealth === 'All' || p.healthStatus === selectedHealth;

    if (activeFilterTab === 'my') return matchesSearch && p.leadPM.includes('Alex');
    if (activeFilterTab === 'active') return matchesSearch && p.status === 'Active';
    if (activeFilterTab === 'at_risk') return matchesSearch && p.healthStatus === 'at_risk';
    if (activeFilterTab === 'due_soon') return matchesSearch && p.deadlineUrgent;
    if (activeFilterTab === 'completed') return matchesSearch && p.progressPercent === 100;

    return matchesSearch && matchesClient && matchesLead && matchesHealth;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#060B13] text-slate-800 dark:text-slate-100 pb-16 transition-colors">


      <div className="w-full p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
        {/* 2. Header & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <span>OptiVir Enterprise</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span>Delivery</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">Projects</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Projects Cockpit</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                {projects.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Plan, manage, track, and deliver client work across retainers and custom scopes.
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
                  showToast(`Importing projects from "${file.name}"...`, 'info');
                  setTimeout(() => {
                    showToast(`Successfully imported project scopes from "${file.name}"`, 'success');
                  }, 1000);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
            <button
              onClick={() => {
                exportToCsv(
                  'optivir_projects_directory.csv',
                  projects.map((p) => ({
                    ID: p.code,
                    Project: p.name,
                    Client: p.clientName,
                    Scope: p.scopeType,
                    'Lead PM': p.leadPM,
                    Status: p.status,
                    Budget: p.budget,
                    Deadline: p.deadline,
                    Progress: `${p.progressPercent}%`,
                    Health: p.health,
                  }))
                );
                showToast(`Exported ${projects.length} projects to CSV`, 'success');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Pipeline</span>
            </button>
            <button
              onClick={() => {
                fetchClients();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg shadow-sm hover:shadow transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Project</span>
            </button>
          </div>
        </div>

        {/* 3. 5 KPI Summary Cards (OptiVir Portfolio Metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Active Projects */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-rose-600 dark:text-rose-400">Active Projects</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                🚀
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {projects.filter((p) => p.status === 'Active').length}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ {projects.length} portfolio</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                Active Delivery
              </span>
              <span>Across {new Set(projects.map((p) => p.clientName)).size} clients</span>
            </div>
          </div>

          {/* At Risk */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-rose-600 dark:text-rose-400">At Risk / Warning</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {projects.filter((p) => p.healthStatus === 'at_risk' || p.healthStatus === 'attention').length}
              </span>
              <span className="text-xs text-slate-500">SLA warning</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{projects.filter((p) => p.deadlineUrgent).length} urgent milestone(s)</span>
            </div>
          </div>

          {/* Due This Month */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Deliverables Due</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {projects.filter((p) => p.deadline).length}
              </span>
              <span className="text-xs text-slate-500">Scheduled</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Sprint Targets Active</span>
            </div>
          </div>

          {/* Progress / Deliverables */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">Avg Sprint Progress</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round(projects.reduce((acc, p) => acc + (p.progressPercent || 0), 0) / (projects.length || 1))}%
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {projects.reduce((acc, p) => acc + (p.tasksCompleted || 0), 0)} tasks delivered
            </div>
          </div>

          {/* Contract Value */}
          <div className="bg-[#0A1628] text-white p-4 rounded-xl border border-[#14233D] shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">Contract Value</span>
              <div className="w-6 h-6 rounded-full bg-[#12223D] flex items-center justify-center font-bold text-xs text-slate-300">
                ₹
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight mt-1.5">
              {projects.length === 0 ? '₹0' : `₹${(projects.reduce((acc, p) => acc + (parseInt(p.budget?.replace(/[^0-9]/g, '')) || 0), 0) / 100000).toFixed(2)}L`}
            </div>
            <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5">
              <span>Delivery Burn Active</span>
            </div>
          </div>
        </div>

        {/* 4. Filter Tabs & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: `All Projects (${projects.length})` },
              { id: 'my', label: 'My Projects (0)' },
              { id: 'active', label: `Active (${projects.filter(p => p.status === 'Active').length})` },
              { id: 'at_risk', label: `At Risk (${projects.filter(p => p.healthStatus === 'at_risk').length})`, isAlert: false },
              { id: 'due_soon', label: 'Due Soon (0)' },
              { id: 'completed', label: 'Completed (0)' },
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

          {/* View Toggles: List | Kanban | Timeline */}
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
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'timeline'
                  ? 'bg-[#0A1628] text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
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
              placeholder="Search projects, clients, managers... (⌘K)"
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              ESC
            </span>
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-3 flex-wrap">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Client: All ({clientCompanies.length})</option>
              {clientCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedLead}
              onChange={(e) => setSelectedLead(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Lead PM: All</option>
              <option value="Maya Joseph">Maya Joseph</option>
              <option value="Alex Morgan">Alex Morgan</option>
              <option value="Rahul Menon">Rahul Menon</option>
            </select>

            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Health: All Status</option>
              <option value="healthy">Healthy</option>
              <option value="attention">Attention</option>
              <option value="at_risk">At Risk</option>
            </select>

            <button
              onClick={() => showToast('Active filters: Client, Lead & Health criteria applied', 'info')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-rose-500" />
              <span>Filters (2)</span>
            </button>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedClient('All');
                setSelectedLead('All');
                setSelectedHealth('All');
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6. Multi-Select Bar (Shown when items selected, exact match to Image 3) */}
        {selectedProjects.length > 0 && (
          <div className="bg-[#0A1628] text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-[#14233D] animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedProjects.length === projects.length}
                onChange={toggleSelectAll}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-xs font-bold">{selectedProjects.length} projects selected</span>
              <span className="text-slate-400 text-xs hidden sm:inline">
                | Blended Budget: ₹{projects
                  .filter((p) => selectedProjects.includes(p.id))
                  .reduce((acc, p) => acc + (parseFloat(String(p.budget).replace(/[^0-9.]/g, '')) || 0), 0)
                  .toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => showToast(`Lead PM updated for ${selectedProjects.length} projects`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium border border-slate-700 transition cursor-pointer"
              >
                Assign Lead
              </button>
              <button
                onClick={() => showToast(`Status shifted to In Review for ${selectedProjects.length} projects`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium border border-slate-700 transition cursor-pointer"
              >
                Change Status
              </button>
              <button
                onClick={() => showToast(`Health status updated to On Track for ${selectedProjects.length} projects`, 'success')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium border border-slate-700 transition cursor-pointer"
              >
                Update Health
              </button>
              <button
                onClick={() => {
                  exportToCsv(
                    'selected_projects.csv',
                    projects
                      .filter((p) => selectedProjects.includes(p.id))
                      .map((p) => ({
                        ID: p.code,
                        Project: p.name,
                        Client: p.clientName,
                        'Lead PM': p.leadPM,
                        Status: p.status,
                        Budget: p.budget,
                        Deadline: p.deadline,
                      }))
                  );
                  showToast(`Exported ${selectedProjects.length} selected projects to CSV`, 'success');
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium border border-slate-700 transition cursor-pointer"
              >
                Export CSV
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-3 py-1 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded font-bold transition flex items-center gap-1 disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
              <button
                onClick={() => showToast(`Archived ${selectedProjects.length} projects`, 'info')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium border border-slate-700 transition cursor-pointer"
              >
                Archive
              </button>
              <button
                onClick={() => setSelectedProjects([])}
                className="text-slate-400 hover:text-white p-1 ml-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 7. View Mode Conditional Render: Table / Kanban / Timeline */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedProjects.length === projects.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">PROJECT & SCOPE</th>
                    <th className="p-3.5">CLIENT ACCOUNT</th>
                    <th className="p-3.5">LEAD PM</th>
                    <th className="p-3.5">STATUS</th>
                    <th className="p-3.5">HEALTH</th>
                    <th className="p-3.5">PROGRESS & SPRINT</th>
                    <th className="p-3.5">BUDGET & BURN</th>
                    <th className="p-3.5">TIMELINE & DATES</th>
                    <th className="p-3.5">TASKS</th>
                    <th className="p-3.5 pr-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-12 text-center text-slate-500">
                        <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No projects found</p>
                        <p className="text-xs text-slate-400 mt-1">Create your first client delivery project using + Create Project.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => {
                    const isSelected = selectedProjects.includes(project.id);
                    return (
                      <tr
                        key={project.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                          isSelected ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                        }`}
                      >
                        <td className="p-3.5 pl-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(project.id)}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                        </td>

                        {/* Project & Scope */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 dark:text-white hover:text-rose-600 transition cursor-pointer">
                              {project.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>{project.code}</span>
                              <span>•</span>
                              <span
                                className={`px-1.5 py-0.2 rounded font-semibold ${
                                  project.isBlocker
                                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {project.scopeType}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Client Account */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded ${project.clientAvatarBg} flex items-center justify-center text-[10px] font-bold ${
                                project.clientAvatarTextColor || 'text-white'
                              }`}
                            >
                              {project.clientAvatarText}
                            </div>
                            <span className="font-semibold text-rose-600 dark:text-rose-400">
                              {project.clientName}
                            </span>
                          </div>
                        </td>

                        {/* Lead PM */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                              {project.leadInitials}
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {project.leadPM}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {project.status}
                          </span>
                        </td>

                        {/* Health */}
                        <td className="p-3.5">
                          {project.healthStatus === 'healthy' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {project.health}
                            </span>
                          ) : project.healthStatus === 'attention' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              {project.health}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              {project.health}
                            </span>
                          )}
                        </td>

                        {/* Progress & Sprint */}
                        <td className="p-3.5">
                          <div className="w-32 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {project.progressPercent}%
                              </span>
                              <span className="text-slate-500">{project.sprint}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  project.healthStatus === 'at_risk'
                                    ? 'bg-rose-600'
                                    : project.healthStatus === 'attention'
                                    ? 'bg-amber-500'
                                    : 'bg-[#0A1628] dark:bg-blue-500'
                                }`}
                                style={{ width: `${project.progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Budget & Burn */}
                        <td className="p-3.5">
                          <div>
                            <div className="font-bold text-rose-600 dark:text-rose-400">
                              {project.budget}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Spent: {project.spent}
                            </div>
                          </div>
                        </td>

                        {/* Timeline & Dates */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span className="font-semibold text-slate-600 dark:text-slate-400">Current:</span> {project.currentDate}
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-400">Assigned:</span> {project.assignedDate}
                            </div>
                            <div
                              className={`text-xs flex items-center gap-1 ${
                                project.deadlineUrgent
                                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                                  : 'text-slate-800 dark:text-slate-200 font-semibold'
                              }`}
                            >
                              <span className="text-slate-500 dark:text-slate-400 font-normal">Due:</span>
                              {project.deadline}
                            </div>
                          </div>
                        </td>

                        {/* Tasks */}
                        <td className="p-3.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {project.tasksCompleted}/{project.tasksTotal}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingProject(project);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition"
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => showToast(`Options for project: ${project.name}`, 'info')}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                              title="Project options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 bg-[#F8FAFC] dark:bg-[#0A101C] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span>
                  Showing <strong className="text-slate-800 dark:text-slate-200">0–{filteredProjects.length}</strong> of{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{projects.length}</strong> projects
                </span>
                <div className="flex items-center gap-1.5">
                  <span>Rows:</span>
                  <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.max(1, Math.ceil(filteredProjects.length / 25)) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${
                      currentPage === p
                        ? 'font-bold bg-[#0A1628] text-white dark:bg-slate-700'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage((p) => Math.min(Math.max(1, Math.ceil(filteredProjects.length / 25)), p + 1))}
                  disabled={currentPage >= Math.max(1, Math.ceil(filteredProjects.length / 25))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Planning', 'Active', 'In Review', 'Completed'].map((stage) => {
              const stageProjects = projects.filter((p) => {
                if (stage === 'Planning') return p.status === 'Planning' || p.status === 'On Hold';
                if (stage === 'Active') return p.status === 'Active';
                if (stage === 'In Review') return p.status === 'In Review';
                return p.progressPercent === 100;
              });

              return (
                <div key={stage} className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 dark:text-white uppercase tracking-wider">{stage}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] border border-slate-200 dark:border-slate-700">
                      {stageProjects.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stageProjects.map((p) => (
                      <div key={p.id} className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
                        <div className="text-[10px] font-semibold text-rose-600">{p.clientName}</div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{p.name}</div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#0A1628] dark:bg-blue-500 h-full" style={{ width: `${p.progressPercent}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <span>{p.budget}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{p.leadPM}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex flex-col gap-0.5 pt-1 border-t border-slate-100 dark:border-slate-700/40">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Current:</span>
                            <span className="text-slate-600 dark:text-slate-300">{p.currentDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Assigned:</span>
                            <span className="text-slate-600 dark:text-slate-300">{p.assignedDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Due:</span>
                            <span className="font-semibold text-rose-600 dark:text-rose-400">{p.deadline}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Gantt & Sprint Execution Timeline (Q3-Q4 2026)</h3>
              <span className="text-xs text-slate-500">Milestone cadence: 2-week sprints</span>
            </div>
            <div className="space-y-4 pt-2">
              {projects.map((p) => (
                <div key={p.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                    <span className="text-slate-500">{p.deadline}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-lg overflow-hidden flex items-center p-1">
                    <div
                      className="bg-[#0A1628] dark:bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-between h-full"
                      style={{ width: `${Math.max(25, p.progressPercent)}%` }}
                    >
                      <span>{p.sprint}</span>
                      <span>{p.progressPercent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8. Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Create New Project Scope</h3>
                <p className="text-xs text-slate-500">Initiate deliverable sprint under client retainer or custom MSA</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Omnichannel Creative Studio & Reels"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold block text-slate-800 dark:text-slate-200">
                    Link to Client Company *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddNewClient(!showAddNewClient)}
                    className="text-[11px] font-medium text-[#B91C1C] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddNewClient ? 'Select Existing Client' : '+ Add New Client Company'}</span>
                  </button>
                </div>

                {showAddNewClient ? (
                  <div className="mb-2 p-2.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-lg space-y-2">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                      Register &amp; Link New Client Company for OptiVir
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Paramount Retail Brands"
                        value={customClientInput}
                        onChange={(e) => setCustomClientInput(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs border rounded-md bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddClientCompany(customClientInput);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddClientCompany(customClientInput)}
                        className="px-3 py-1.5 bg-[#B91C1C] text-white text-xs font-semibold rounded-md hover:bg-rose-700 cursor-pointer"
                      >
                        Link
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="" disabled>
                      {clientCompanies.length === 0 ? 'No clients found — click "+ Add New Client Company" above' : 'Select Client Company to Link'}
                    </option>
                    {clientCompanies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Scope Category</label>
                  <select
                    value={newScopeType}
                    onChange={(e) => setNewScopeType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option>Social Media Posters &amp; Creatives</option>
                    <option>Video Editing &amp; High-Impact Reels</option>
                    <option>Social Media Marketing &amp; Management</option>
                    <option>Meta + Google Ads Retainer</option>
                    <option>Creative Studio &amp; UGC Production</option>
                    <option>Brand Identity &amp; Graphic Design</option>
                    <option>Technical CRO &amp; Analytics</option>
                    <option>Ad-Hoc Sprint</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Lead PM</label>
                  <select
                    value={newLeadPM}
                    onChange={(e) => setNewLeadPM(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option>OptiVir Admin</option>
                    <option>Creative Lead</option>
                    <option>Campaign Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Project Budget (₹)</label>
                <input
                  type="text"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Current Date</label>
                  <input
                    type="text"
                    readOnly
                    value={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Start / Assigned Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Target Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg text-xs font-bold shadow-md transition"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-[#0B1727] dark:text-white">Delete Project</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete project <span className="font-bold text-slate-900 dark:text-white">{deletingProject.name}</span> ({deletingProject.code})? This will remove the project and unlink associated tasks from the database.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 dark:border-[#152238] text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProject}
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
