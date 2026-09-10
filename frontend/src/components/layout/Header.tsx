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
  Shield,
  LogOut,
  Settings,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  Users2,
  Receipt,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import { useAuth, AGENCY_PERSONAS } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { useToast } from '@/lib/toast-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
  currentTab?: string;
  onQuickAction?: () => void;
  onNavigate?: (tab: any) => void;
  onCreateInvoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  currentTab = 'dashboard',
  onQuickAction,
  onNavigate,
  onCreateInvoice
}) => {
  const { user, activePersona, switchPersona, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    desc: string;
    time: string;
    unread: boolean;
    type: string;
  }>>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getBreadcrumbLabel = () => {
    if (currentTab === 'leads') return { section: 'CRM', page: 'Leads' };
    if (currentTab === 'dashboard') return { section: 'Dashboard', page: 'Executive Overview' };
    if (currentTab === 'pipeline') return { section: 'CRM', page: 'Pipeline' };
    if (currentTab === 'companies') return { section: 'CRM', page: 'Companies' };
    if (currentTab === 'clients') return { section: 'Delivery', page: 'Clients' };
    if (currentTab === 'finance') return { section: 'Revenue', page: 'Finance' };
    if (currentTab === 'marketing') return { section: 'Revenue', page: 'Marketing' };
    return { section: 'CRM', page: title };
  };

  const breadcrumb = getBreadcrumbLabel();

  return (
    <header className="h-14 border-b border-[#E2E6EC] dark:border-[#152238] bg-[#FFFFFF] dark:bg-[#0A121F] px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* 1. Left Breadcrumbs matching reference screenshot */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="text-[#64748B] hover:text-[#0B1727] dark:hover:text-white p-1 rounded-md transition"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="flex items-center gap-1.5 hover:opacity-85 transition cursor-pointer"
            title="OptiVir CRM Dashboard"
          >
            <img
              src="/images/optivir-logo.png"
              alt="OptiVir CRM"
              className="h-5.5 w-auto object-contain"
            />
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">{breadcrumb.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-[#0B1727] dark:text-[#F8FAFC] font-semibold">{breadcrumb.page}</span>
        </div>
      </div>

      {/* 2. Center Global Search (Matching Image 1 & 2) */}
      <div className="hidden md:flex items-center w-80 lg:w-[420px] relative">
        <div
          onClick={() => setShowSearchModal(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F1A2C] border border-[#E2E6EC] dark:border-[#1B2B44] text-xs text-[#64748B] dark:text-[#94A3B8] hover:border-[#CBD5E1] cursor-pointer transition shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-xs">Search leads, deals, metrics...</span>
          </div>
          <kbd className="text-[10px] text-[#64748B] dark:text-[#94A3B8] bg-white dark:bg-[#16253C] border border-[#E2E6EC] dark:border-[#223552] rounded px-1.5 py-0.5 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* 3. Right Action Tools: + New (Red), Theme Toggle, Bell, Profile */}
      <div className="flex items-center gap-3 relative">
        {/* + New Red Button */}
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New</span>
          </button>

          {showNewMenu && (
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-50 p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  onNavigate && onNavigate('leads');
                }}
                className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
              >
                <Users2 className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Create Lead</span>
              </button>
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  onNavigate && onNavigate('pipeline');
                }}
                className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Create Opportunity</span>
              </button>
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  if (onCreateInvoice) onCreateInvoice();
                }}
                className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#0B1727] dark:text-white"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Generate Invoice</span>
              </button>
            </div>
          )}
        </div>

        {/* Backdrop for open menus */}
        {(showNewMenu || showNotifications || showPersonaMenu || showProfileMenu) && (
          <div
            className="fixed inset-0 z-40 bg-transparent cursor-default"
            onClick={() => {
              setShowNewMenu(false);
              setShowNotifications(false);
              setShowPersonaMenu(false);
              setShowProfileMenu(false);
            }}
          />
        )}

        {/* Theme Toggle (Sun / Moon) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#64748B] hover:text-[#0B1727] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111E34] transition relative z-50 cursor-pointer"
          title="Toggle color theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Bell with Counter */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-[#64748B] hover:text-[#0B1727] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111E34] transition relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white dark:ring-[#0B1424]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-50 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-white">Notifications</span>
                <span className="text-[10px] text-[#DC2626] font-semibold">{unreadCount} unread</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
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
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    if (onNavigate) onNavigate('notifications');
                  }}
                  className="text-[11px] font-bold text-[#DC2626] hover:underline w-full py-1 text-center"
                >
                  View All in Notifications Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Persona Switcher (RBAC) */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1C2C45] bg-slate-50 dark:bg-[#0D1829] hover:bg-slate-100 dark:hover:bg-[#13233B] transition text-xs shadow-2xs"
            title="Switch User Persona & Access Role"
          >
            <div className={`w-5 h-5 rounded-md ${activePersona.avatarBg} text-white flex items-center justify-center font-black text-[10px]`}>
              {activePersona.avatarText}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-none">
                {activePersona.name}
              </span>
              <span className="text-[9px] text-[#DC2626] dark:text-rose-400 font-semibold leading-tight mt-0.5">
                {activePersona.roleLabel}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 top-11 w-72 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-2xl z-50 p-2 text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                    Role & Persona Switcher
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-[9px]">
                    RBAC Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select a persona to test role-specific view permissions and data access
                </p>
              </div>

              <div className="space-y-1 max-h-80 overflow-y-auto">
                {AGENCY_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchPersona(p.id);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full p-2 rounded-lg text-left flex items-start gap-2.5 transition ${
                      activePersona.id === p.id
                        ? 'bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60'
                        : 'hover:bg-slate-50 dark:hover:bg-[#111E34] border border-transparent'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${p.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs`}>
                      {p.avatarText}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {p.name}
                        </span>
                        {activePersona.id === p.id && (
                          <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                        {p.roleLabel}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {p.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34] transition"
          >
            <div className={`w-7 h-7 rounded-full ${activePersona.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden`}>
              <span>{activePersona.avatarText}</span>
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0B1727] dark:text-[#F8FAFC] leading-none">
                {activePersona.name}
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-tight">
                {activePersona.designation}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-11 w-52 bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xl z-50 p-2 text-xs space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">{activePersona.name}</p>
                <p className="text-[11px] text-slate-500">{activePersona.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onNavigate) onNavigate('settings');
                  showToast(`Opened profile settings for ${activePersona.name}`, 'info');
                }}
                className="w-full px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  showToast('Signed out of OptiVir CRM session', 'info');
                }}
                className="w-full px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] text-left flex items-center gap-2 text-[#DC2626] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal (⌘K) */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-24 p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-xl w-full p-4 shadow-2xl space-y-3">
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
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase px-2">Quick Navigation</p>
              {[
                { name: 'Executive Overview Dashboard', sub: 'Revenue, performance metrics & operations', tab: 'dashboard' },
                { name: 'Leads & Opportunities', sub: 'Inbound acquisition, conversion & qualification', tab: 'leads' },
                { name: 'Sales Pipeline Kanban', sub: 'Commercial deals & closing stages', tab: 'pipeline' },
                { name: 'Clients & Accounts Directory', sub: 'Client accounts, 360° view & onboarding', tab: 'clients' },
                { name: 'Finance & Invoicing Ledger', sub: 'Tax invoices, payments & receivables', tab: 'finance' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setShowSearchModal(false);
                    onNavigate && onNavigate(item.tab);
                  }}
                  className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#111E34] cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.sub}</p>
                  </div>
                  <span className="text-[10px] text-[#DC2626]">Jump ↗</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSearchModal(false)}
                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800"
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
