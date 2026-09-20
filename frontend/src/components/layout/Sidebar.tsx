'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users2,
  Contact2,
  Building2,
  Kanban,
  FolderClosed,
  BarChart3,
  Receipt,
  FileText,
  FileCheck,
  Activity,
  FileSpreadsheet,
  Settings,
  Rocket,
  CheckSquare,
  Palette,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export type NavItem =
  | 'dashboard'
  | 'leads'
  | 'contacts'
  | 'companies'
  | 'opportunities'
  | 'pipeline'
  | 'proposals'
  | 'clients'
  | 'client-360'
  | 'onboarding'
  | 'projects'
  | 'tasks'
  | 'creatives'
  | 'sales'
  | 'marketing'
  | 'finance'
  | 'documents'
  | 'activities'
  | 'reports'
  | 'notifications'
  | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, isOpen = false, onClose }) => {
  const { canAccessTab } = useAuth();

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'CRM & PIPELINE',
      items: [
        { id: 'leads' as NavItem, label: 'Leads', icon: Users2 },
        { id: 'contacts' as NavItem, label: 'Contacts', icon: Contact2 },
        { id: 'clients' as NavItem, label: 'Clients', icon: Building2 },
        { id: 'pipeline' as NavItem, label: 'Pipeline', icon: Kanban },
        { id: 'proposals' as NavItem, label: 'Proposals', icon: FileCheck },
      ]
    },
    {
      title: 'DELIVERY',
      items: [
        { id: 'onboarding' as NavItem, label: 'Onboarding', icon: Rocket },
        { id: 'projects' as NavItem, label: 'Projects', icon: FolderClosed },
        { id: 'tasks' as NavItem, label: 'Tasks', icon: CheckSquare },
        { id: 'creatives' as NavItem, label: 'Creative Studio', icon: Palette },
      ]
    },
    {
      title: 'REVENUE & ADS',
      items: [
        { id: 'marketing' as NavItem, label: 'Marketing', icon: BarChart3 },
        { id: 'finance' as NavItem, label: 'Finance', icon: Receipt },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'activities' as NavItem, label: 'Activities', icon: Activity },
        { id: 'documents' as NavItem, label: 'Documents', icon: FileText },
        { id: 'reports' as NavItem, label: 'Reports', icon: FileSpreadsheet },
        { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 lg:w-[264px] bg-[#0A1628] dark:bg-[#070E1A] text-slate-300 border-r border-[#14233D] dark:border-[#0E1A2E] flex flex-col h-screen select-none shrink-0 transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 md:z-auto
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* 1. Header Brand — OptiVir CRM */}
        <div className="p-3 border-b border-[#14233D] bg-[#070E1A]/60 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              onTabChange('dashboard');
              onClose && onClose();
            }}
            className="flex-1 flex items-center justify-center p-2 rounded-xl bg-white hover:bg-slate-50 shadow-sm border border-slate-200/40 transition cursor-pointer"
            title="OptiVir CRM Overview"
          >
            <img
              src="/images/optivir-logo.png"
              alt="OptiVir CRM"
              className="h-8 w-auto max-w-full object-contain"
            />
          </button>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#101F38] transition shrink-0"
            title="Close Menu"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5 custom-scrollbar min-h-0">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter((item) => canAccessTab(item.id));
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <p className="text-[10px] font-bold text-[#627797] tracking-widest px-2.5 uppercase">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          onClose && onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition duration-150 text-left ${
                          isActive
                            ? 'bg-[#0E274D] text-white font-semibold shadow-sm border border-[#1A3D73]'
                            : 'text-[#94A3B8] hover:text-white hover:bg-[#101F38]'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition ${
                            isActive ? 'text-blue-300 dark:text-white' : 'text-[#64748B]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Footer System Status & Quick Nav */}
        <div className="p-3 border-t border-[#14233D] bg-[#070F1C] flex items-center justify-between text-xs text-[#64748B] shrink-0 whitespace-nowrap gap-1.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-[#94A3B8] whitespace-nowrap">System Status</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0"></span>
              <span className="text-emerald-400 font-semibold text-[11px]">Operational</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#94A3B8] font-mono shrink-0">
            <span className="hidden sm:inline text-[10px]">Quick Nav</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#112440] border border-[#1D365D] text-[10px] text-[#CBD5E1]">⌘K</kbd>
          </div>
        </div>
      </aside>
    </>
  );
};
