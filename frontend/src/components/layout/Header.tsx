'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  ChevronRight,
  Menu,
  ChevronDown,
  User,
  LogOut,
  Settings,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Users2,
  Receipt,
  Check,
  X,
  FileCheck,
  KeyRound,
  Laptop
} from 'lucide-react';
import { useAuth, AGENCY_PERSONAS } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { useToast } from '@/lib/toast-context';
import { api } from '@/lib/api';

interface HeaderProps {
  title: string;
  subtitle?: string;
  currentTab?: string;
  onQuickAction?: () => void;
  onNavigate?: (tab: any) => void;
  onCreateInvoice?: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  currentTab = 'dashboard',
  onQuickAction,
  onNavigate,
  onCreateInvoice,
  onToggleSidebar
}) => {
  const { user, activePersona, switchPersona, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Change Password Modal State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [isRequestingPasswordOtp, setIsRequestingPasswordOtp] = useState(false);
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [devPasswordOtp, setDevPasswordOtp] = useState<string | null>(null);
  const [passwordOtpTimer, setPasswordOtpTimer] = useState(0);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (passwordOtpTimer > 0) {
      const t = setTimeout(() => setPasswordOtpTimer(passwordOtpTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [passwordOtpTimer]);

  const handleRequestPasswordOtp = async () => {
    try {
      setIsRequestingPasswordOtp(true);
      setPasswordError('');
      const res = await api.requestPasswordOtp();
      if (res.success) {
        setPasswordOtpSent(true);
        setPasswordOtpTimer(60);
        showToast(res.message || 'OTP verification code sent to your email!', 'success');
        if (res.devOtp) {
          setDevPasswordOtp(res.devOtp);
          setPasswordOtp(res.devOtp);
        }
      } else {
        setPasswordError(res.message || 'Failed to send OTP verification code');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to dispatch verification code');
    } finally {
      setIsRequestingPasswordOtp(false);
    }
  };

  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    desc: string;
    time: string;
    unread: boolean;
    type: string;
  }>>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch notification count from activities or real source
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await api.getActivities();
        if (res?.success && Array.isArray(res.data)) {
          const unread = res.data.filter((a: any) => !a.read_at).slice(0, 9);
          setUnreadCount(unread.length);
          setNotifications(unread.map((a: any, i: number) => ({
            id: i,
            title: a.subject || a.type || 'Activity',
            desc: a.description || '',
            time: a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Recently',
            unread: !a.read_at,
            type: a.type || 'info'
          })));
        }
      } catch {
        // Silently fail — notifications are non-critical
      }
    };
    fetchNotificationCount();
  }, []);

  // Global shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowNotifications(false);
        setShowProfileMenu(false);
        setShowNewMenu(false);
        setShowChangePasswordModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getBreadcrumbLabel = () => {
    if (currentTab === 'leads') return { section: 'CRM', page: 'Leads' };
    if (currentTab === 'dashboard') return { section: 'Dashboard', page: 'Overview' };
    if (currentTab === 'pipeline') return { section: 'CRM', page: 'Pipeline' };
    if (currentTab === 'companies' || currentTab === 'clients') return { section: 'CRM', page: 'Clients' };
    if (currentTab === 'finance') return { section: 'Revenue', page: 'Finance' };
    if (currentTab === 'marketing') return { section: 'Revenue', page: 'Marketing' };
    if (currentTab === 'tasks') return { section: 'Delivery', page: 'Tasks' };
    if (currentTab === 'projects') return { section: 'Delivery', page: 'Projects' };
    if (currentTab === 'proposals') return { section: 'CRM', page: 'Proposals' };
    if (currentTab === 'settings') return { section: 'System', page: 'Settings' };
    if (currentTab === 'reports') return { section: 'Ops', page: 'Reports' };
    if (currentTab === 'notifications') return { section: 'Ops', page: 'Alerts' };
    return { section: 'CRM', page: title.length > 20 ? title.slice(0, 18) + '…' : title };
  };

  const breadcrumb = getBreadcrumbLabel();

  return (
    <header className="h-14 border-b border-[#E2E6EC] dark:border-[#152238] bg-[#FFFFFF] dark:bg-[#0A121F] px-3 sm:px-4 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200 shrink-0">
      {/* 1. Left — Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          onClick={() => onToggleSidebar ? onToggleSidebar() : onNavigate && onNavigate('dashboard')}
          className="text-[#64748B] hover:text-[#0B1727] dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34] transition shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1 sm:gap-2 text-xs min-w-0">
          <button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="shrink-0 flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer"
            title="OptiVir CRM Dashboard"
          >
            <img
              src="/images/optivir-icon.png"
              alt="OptiVir CRM"
              className="h-4.5 w-4.5 rounded-full object-contain shrink-0"
              onError={(e) => {
                // Fallback to text if icon file issue
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-bold text-[#DC2626] text-xs tracking-tight">OptiVir</span>
          </button>
          <ChevronRight className="w-3 h-3 text-[#94A3B8] shrink-0" />
          <span className="text-[#64748B] dark:text-[#94A3B8] font-medium truncate max-w-[80px] lg:max-w-none">{breadcrumb.section}</span>
          <ChevronRight className="w-3 h-3 text-[#94A3B8] shrink-0" />
          <span className="text-[#0B1727] dark:text-[#F8FAFC] font-semibold truncate max-w-[100px] sm:max-w-[180px] lg:max-w-none">{breadcrumb.page}</span>
        </div>
      </div>

      {/* 2. Center Global Search (Desktop only) */}
      <div className="hidden md:flex items-center w-72 lg:w-[400px] xl:w-[480px] relative">
        <div
          onClick={() => setShowSearchModal(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F1A2C] border border-[#E2E6EC] dark:border-[#1B2B44] text-xs text-[#64748B] dark:text-[#94A3B8] hover:border-[#CBD5E1] cursor-pointer transition shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <span className="text-xs truncate">Search leads, deals, metrics...</span>
          </div>
          <kbd className="text-[10px] text-[#64748B] dark:text-[#94A3B8] bg-white dark:bg-[#16253C] border border-[#E2E6EC] dark:border-[#223552] rounded px-1.5 py-0.5 font-mono shrink-0 hidden lg:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* 3. Right Action Tools */}
      <div className="flex items-center gap-1 sm:gap-2 relative shrink-0">

        {/* Mobile Search Button */}
        <button
          onClick={() => { setShowSearchModal(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
          className="md:hidden p-2 rounded-lg text-[#64748B] hover:text-[#0B1727] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111E34] transition"
          title="Search"
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* + New Red Button */}
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span className="hidden sm:inline">New</span>
          </button>

          {showNewMenu && (
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-50 p-1 text-xs">
              <button
                onClick={() => { setShowNewMenu(false); onNavigate && onNavigate('leads'); }}
                className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
              >
                <Users2 className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                <span>Create Lead</span>
              </button>
              <button
                onClick={() => { setShowNewMenu(false); onNavigate && onNavigate('pipeline'); }}
                className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Create Opportunity</span>
              </button>
              <button
                onClick={() => { setShowNewMenu(false); onNavigate && onNavigate('proposals'); }}
                className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
              >
                <FileCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Create Proposal</span>
              </button>
              <button
                onClick={() => { setShowNewMenu(false); if (onCreateInvoice) onCreateInvoice(); }}
                className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Generate Invoice</span>
              </button>
            </div>
          )}
        </div>

        {/* Backdrop for open menus */}
        {(showNewMenu || showNotifications || showProfileMenu) && (
          <div
            className="fixed inset-0 z-40 bg-transparent cursor-default"
            onClick={() => {
              setShowNewMenu(false);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
          />
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#64748B] hover:text-[#0B1727] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111E34] transition relative z-50 cursor-pointer"
          title="Toggle color theme"
          aria-label="Toggle dark/light mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-[#64748B] hover:text-[#0B1727] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111E34] transition relative z-50"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white dark:ring-[#0B1424]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-72 sm:w-80 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-50 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-white">Notifications</span>
                <span className="text-[10px] text-[#DC2626] font-semibold">{unreadCount} unread</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 dark:text-slate-500">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500/70" />
                    <p className="text-xs font-medium">All caught up!</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">No unread notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-lg bg-slate-50 dark:bg-[#111E34] hover:bg-slate-100 transition">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.desc}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => { setShowNotifications(false); if (onNavigate) onNavigate('notifications'); }}
                  className="text-[11px] font-bold text-[#DC2626] hover:underline w-full py-1 text-center"
                >
                  View All in Notifications Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl border border-slate-200 dark:border-[#1C2C45] bg-slate-50 dark:bg-[#0D1829] hover:bg-slate-100 dark:hover:bg-[#13233B] transition text-xs shadow-sm cursor-pointer z-50 relative"
            title="User Profile & Account Menu"
          >
            <div className={`w-7 h-7 rounded-lg ${user?.avatarUrl ? 'bg-transparent' : (user?.role === 'coo' ? 'bg-purple-700' : (user?.isOwner ? 'bg-[#B91C1C]' : activePersona.avatarBg))} text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden shrink-0`}>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full object-cover object-center rounded-lg"
                  style={{ width: '28px', height: '28px', objectFit: 'cover', objectPosition: 'center' }}
                />
              ) : (
                <span>{user ? ((user.firstName?.[0] || '') + (user.lastName?.[0] || user.email?.[0] || 'U')).toUpperCase() : activePersona.avatarText}</span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left min-w-0">
              <span className="text-xs font-bold text-[#0B1727] dark:text-[#F8FAFC] leading-none truncate max-w-[90px]">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : activePersona.name}
              </span>
              <span className="text-[10px] text-[#DC2626] dark:text-rose-400 font-semibold leading-tight mt-0.5 truncate max-w-[90px]">
                {user?.roleName || (user?.role === 'coo' ? 'Chief Operating Officer' : (user?.isOwner ? 'Executive & Owner' : activePersona.roleLabel))}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-11 w-72 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl shadow-2xl z-50 p-2 text-xs space-y-2">
              {/* Active User Details */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                    {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : activePersona.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 font-bold text-[9px] border border-emerald-200 dark:border-emerald-800/40 shrink-0 ml-2">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || activePersona.email}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {user?.designation || (user?.role === 'coo' ? 'Chief Operating Officer • OptiVir' : (user?.isOwner ? 'Managing Director • OptiVir' : activePersona.designation))}
                </p>
                {user?.currentDevice && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 min-w-0">
                      <Laptop className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate font-medium">{user.currentDevice.formatted || `${user.currentDevice.os} • ${user.currentDevice.browser}`}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[8px] shrink-0 border border-emerald-200 dark:border-emerald-800">
                      1 Device Active
                    </span>
                  </div>
                )}
              </div>

              {/* Role Switcher (Visible to Executive Owner) */}
              {(user?.isOwner || user?.email?.toLowerCase() === 'optivirads@gmail.com' || user?.role === 'owner') ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Switch Persona (RBAC)</span>
                    <span className="text-[9px] text-rose-500 font-semibold">1-Click Test</span>
                  </div>
                  <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar">
                    {AGENCY_PERSONAS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { switchPersona(p.id); setShowProfileMenu(false); }}
                        className={`w-full p-2 rounded-xl text-left flex items-center gap-2.5 transition cursor-pointer ${
                          activePersona.id === p.id
                            ? 'bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60'
                            : 'hover:bg-slate-50 dark:hover:bg-[#111E34] border border-transparent'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md ${p.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm`}>
                          {p.avatarText}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white text-[11px] truncate">{p.name}</span>
                            {activePersona.id === p.id && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                          </div>
                          <div className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 truncate">{p.roleLabel}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-2.5 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Assigned Role:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{user?.roleName || user?.role?.toUpperCase()}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setPasswordError('');
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setShowChangePasswordModal(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer transition"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); if (onNavigate) onNavigate('settings'); showToast('Opened settings', 'info'); }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer transition"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile & Tenant Settings</span>
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); showToast('Signed out of OptiVir CRM session', 'info'); }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left flex items-center gap-2 text-[#DC2626] font-semibold cursor-pointer transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal (⌘K) */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl w-full max-w-xl p-4 shadow-2xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, companies, pipeline deals, metrics..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] text-sm text-[#0B1727] dark:text-[#F8FAFC] outline-none focus:border-[#DC2626]"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase px-2">Quick Navigation</p>
              {[
                { name: 'Executive Overview Dashboard', sub: 'Revenue, performance metrics & operations', tab: 'dashboard' },
                { name: 'Leads & Opportunities', sub: 'Inbound acquisition, conversion & qualification', tab: 'leads' },
                { name: 'Sales Pipeline Kanban', sub: 'Commercial deals & closing stages', tab: 'pipeline' },
                { name: 'Clients & Accounts Directory', sub: 'Client accounts, 360° view & onboarding', tab: 'clients' },
                { name: 'Finance & Invoicing Ledger', sub: 'Tax invoices, payments & receivables', tab: 'finance' }
              ].filter(item => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sub.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => { setShowSearchModal(false); onNavigate && onNavigate(item.tab); setSearchQuery(''); }}
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] cursor-pointer flex justify-between items-center"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{item.sub}</p>
                  </div>
                  <span className="text-[10px] text-[#DC2626] shrink-0 ml-2">Jump ↗</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => { setShowSearchModal(false); setSearchQuery(''); }}
                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Account Password</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">Update credentials for {user?.email || activePersona.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowChangePasswordModal(false); setPasswordError(''); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPasswordError('');
                if (!oldPassword) { setPasswordError('Please enter your current password'); return; }
                if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
                if (newPassword !== confirmPassword) { setPasswordError('New password and confirm password do not match'); return; }
                if (!passwordOtp.trim() || passwordOtp.trim().length < 6) {
                  setPasswordError('Please enter the 6-digit OTP verification code sent to your email');
                  return;
                }
                setIsChangingPassword(true);
                try {
                  const res = await api.changePassword(oldPassword, newPassword, passwordOtp.trim());
                  if (res && res.success) {
                    showToast('Password changed successfully!', 'success');
                    setShowChangePasswordModal(false);
                    setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordOtp(''); setDevPasswordOtp(null);
                  } else {
                    setPasswordError(res?.message || 'Failed to update password');
                  }
                } catch (err: any) {
                  setPasswordError(err?.message || 'Failed to update password. Please verify your current password and OTP code.');
                } finally {
                  setIsChangingPassword(false);
                }
              }}
              className="space-y-3.5 text-xs"
            >
              {[
                { label: 'Current Password', val: oldPassword, setter: setOldPassword, placeholder: 'Enter current password' },
                { label: 'New Password', val: newPassword, setter: setNewPassword, placeholder: 'Minimum 6 characters' },
                { label: 'Confirm New Password', val: confirmPassword, setter: setConfirmPassword, placeholder: 'Re-enter new password' },
              ].map(({ label, val, setter, placeholder }) => (
                <div key={label} className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">{label}</label>
                  <input
                    type="password"
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-white outline-none focus:border-[#DC2626] transition text-xs"
                  />
                </div>
              ))}

              {/* Email OTP Security Verification Field */}
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    6-Digit Email Verification Code *
                  </label>
                  {passwordOtpTimer > 0 ? (
                    <span className="text-[11px] text-slate-400 font-medium">Resend in {passwordOtpTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestPasswordOtp}
                      disabled={isRequestingPasswordOtp}
                      className="text-[11px] text-[#DC2626] hover:underline font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isRequestingPasswordOtp ? 'Sending...' : (passwordOtpSent ? 'Resend Code' : 'Send Code to Email')}
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={passwordOtp}
                    onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-white outline-none focus:border-[#DC2626] tracking-widest font-mono text-center transition text-xs"
                  />
                  {!passwordOtpSent && (
                    <button
                      type="button"
                      onClick={handleRequestPasswordOtp}
                      disabled={isRequestingPasswordOtp}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer text-xs"
                    >
                      {isRequestingPasswordOtp ? 'Sending...' : 'Send OTP'}
                    </button>
                  )}
                </div>

                {devPasswordOtp && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-400 flex items-center justify-between mt-1">
                    <span>Dev Code: <strong className="font-mono text-white">{devPasswordOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setPasswordOtp(devPasswordOtp)}
                      className="underline font-bold cursor-pointer text-[10px]"
                    >
                      Fill
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowChangePasswordModal(false); setPasswordError(''); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordOtp(''); }}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword || !passwordOtp}
                  className="px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold transition cursor-pointer disabled:opacity-50 text-xs"
                >
                  {isChangingPassword ? 'Updating...' : 'Verify & Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
