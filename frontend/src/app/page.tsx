'use client';

import React, { useState } from 'react';
import { Sidebar, NavItem } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { Client360View } from '@/components/clients/Client360View';
import { LeadsView } from '@/components/crm/LeadsView';
import { ContactsView } from '@/components/crm/ContactsView';
import { OpportunitiesView } from '@/components/crm/OpportunitiesView';
import { PipelineView } from '@/components/sales/PipelineView';
import { ClientsListView } from '@/components/clients/ClientsListView';
import { ClientOnboardingView } from '@/components/clients/ClientOnboardingView';
import { ProjectsView } from '@/components/projects/ProjectsView';
import { TasksView } from '@/components/projects/TasksView';
import { CreativeProofingView } from '@/components/creatives/CreativeProofingView';
import { MarketingView } from '@/components/marketing/MarketingView';
import { FinanceView } from '@/components/finance/FinanceView';
import { ReportsView } from '@/components/reports/ReportsView';
import { ProposalsView } from '@/components/sales/ProposalsView';
import { CalendarView } from '@/components/operations/CalendarView';
import { DocumentsView } from '@/components/operations/DocumentsView';
import { NotificationsView } from '@/components/operations/NotificationsView';
import { SettingsView } from '@/components/operations/SettingsView';
import { LoginView } from '@/components/auth/LoginView';
import { LogoLoader } from '@/components/common/LogoLoader';
import { useAuth } from '@/lib/auth-context';
import { ShieldAlert, Lock } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = React.useState(false);
  const { user, token, isLoading, canAccessTab, activePersona } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [selectedClient360Id, setSelectedClient360Id] = useState<string | undefined>(undefined);
  const [selectedClient360Name, setSelectedClient360Name] = useState<string | undefined>(undefined);
  const [invoiceTransferData, setInvoiceTransferData] = useState<any>(null);
  const [openCreateInvoiceTrigger, setOpenCreateInvoiceTrigger] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restore navigation state on initial mount from URL query params or localStorage
  React.useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab') as NavItem | null;
        const clientParam = urlParams.get('clientId') || undefined;
        const clientNameParam = urlParams.get('clientName') || undefined;
        const savedTab = localStorage.getItem('optivir_crm_active_tab') as NavItem | null;
        const savedClientId = localStorage.getItem('optivir_crm_client_id') || undefined;
        const savedClientName = localStorage.getItem('optivir_crm_client_name') || undefined;

        const validTabs: NavItem[] = [
          'dashboard', 'leads', 'contacts', 'companies', 'opportunities',
          'pipeline', 'proposals', 'clients', 'client-360', 'onboarding',
          'projects', 'tasks', 'creatives', 'sales', 'marketing', 'finance',
          'documents', 'activities', 'reports', 'notifications', 'settings'
        ];

        const targetTab = (tabParam && validTabs.includes(tabParam))
          ? tabParam
          : (savedTab && validTabs.includes(savedTab))
            ? savedTab
            : 'dashboard';

        const targetClientId = clientParam || savedClientId;
        const targetClientName = clientNameParam || savedClientName;

        setCurrentTab(targetTab);
        if (targetClientId) {
          setSelectedClient360Id(targetClientId);
        }
        if (targetClientName) {
          setSelectedClient360Name(targetClientName);
        }

        // Keep URL synchronized
        const url = new URL(window.location.href);
        url.searchParams.set('tab', targetTab);
        if (targetClientId && targetTab === 'client-360') {
          url.searchParams.set('clientId', targetClientId);
          if (targetClientName) {
            url.searchParams.set('clientName', targetClientName);
          }
        }
        window.history.replaceState({}, '', url.toString());
      } catch (err) {
        console.warn('Navigation state restoration error:', err);
      }
    }
  }, []);

  // Sync tab navigation when browser Back/Forward buttons are clicked
  React.useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as NavItem | null;
      const clientParam = urlParams.get('clientId') || undefined;
      const clientNameParam = urlParams.get('clientName') || undefined;
      if (tabParam) {
        setCurrentTab(tabParam);
        if (clientParam) setSelectedClient360Id(clientParam);
        if (clientNameParam) setSelectedClient360Name(clientNameParam);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Unified navigation function that updates state, localStorage, and URL search parameters
  const navigateTo = (tab: NavItem, clientId?: string, clientName?: string) => {
    setCurrentTab(tab);
    if (clientId !== undefined) {
      setSelectedClient360Id(clientId);
    }
    if (clientName !== undefined) {
      setSelectedClient360Name(clientName);
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('optivir_crm_active_tab', tab);
        if (clientId) {
          localStorage.setItem('optivir_crm_client_id', clientId);
        } else if (tab !== 'client-360') {
          localStorage.removeItem('optivir_crm_client_id');
        }

        if (clientName) {
          localStorage.setItem('optivir_crm_client_name', clientName);
        } else if (tab !== 'client-360') {
          localStorage.removeItem('optivir_crm_client_name');
        }

        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        if (clientId) {
          url.searchParams.set('clientId', clientId);
          if (clientName) {
            url.searchParams.set('clientName', clientName);
          } else {
            url.searchParams.delete('clientName');
          }
        } else if (tab !== 'client-360') {
          url.searchParams.delete('clientId');
          url.searchParams.delete('clientName');
        }
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        console.warn('Navigation state persistence error:', e);
      }
    }
  };

  const handleOpenCreateInvoice = () => {
    setInvoiceTransferData(null);
    setOpenCreateInvoiceTrigger(true);
    navigateTo('finance');
  };

  const getHeaderDetails = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Executive Management Dashboard', subtitle: 'Real-time agency operating intelligence & action center' };
      case 'client-360':
        return { title: 'Client 360° Operating Profile', subtitle: 'Single source of truth for full client relationship & performance' };
      case 'leads':
        return { title: 'Leads & Prospect Qualification', subtitle: 'Inbound & outbound pipeline qualification' };
      case 'contacts':
        return { title: 'Contacts Directory', subtitle: 'Manage people, key enterprise relationships, and verified decision-makers' };
      case 'clients':
      case 'companies':
        return { title: 'Clients & Accounts', subtitle: 'Company accounts, retainers, SLAs, health scores, and client 360°' };
      case 'opportunities':
      case 'onboarding':
        return { title: 'Client Onboarding & Handoff Suite', subtitle: '24-step SLA orchestration from Sales SOW sign-off to full technical kickoff and live delivery' };
      case 'projects':
        return { title: 'Service Delivery Projects', subtitle: 'Agency deliverables, budgets, and milestone progress' };
      case 'tasks':
        return { title: 'Tasks & Operational Kanban', subtitle: 'Team workloads, deliverables, and overdue tracking' };
      case 'creatives':
        return { title: 'Creative Studio & Client Proofing', subtitle: 'Multi-platform ad creative proofing, immutable versioning, video frame annotations & Cloudflare R2 client sign-offs' };
      case 'marketing':
        return { title: 'Marketing Intelligence & Attribution', subtitle: 'Omni-channel ROAS, conversions, and Paid vs Organic breakdown' };
      case 'finance':
        return { title: 'Billing & Cashflow Ledger', subtitle: 'Invoices, balance reconciliation, and payment logs' };
      case 'activities':
        return { title: 'Calendar & Operational Schedule', subtitle: 'Unified cross-functional schedule aggregating client meetings, deliverable deadlines, project milestones, invoices, and renewals' };
      case 'documents':
        return { title: 'Documents & Enterprise Digital Assets', subtitle: 'Securely store, version, preview, audit, and associate legal contracts, proposals, invoices, and client assets' };
      case 'reports':
        return { title: 'Reports & Business Intelligence Center', subtitle: 'Generate, schedule, audit, and distribute automated performance dossiers, executive QBRs, and client commercial telemetry' };
      case 'notifications':
        return { title: 'Notifications & Alerts Hub', subtitle: 'Track commercial milestones, overdue tasks, invoice settlements, and system telemetry' };
      case 'settings':
        return { title: 'Settings & System Administration', subtitle: 'Global tenant policies, permissions, security enforcement & operational pipelines' };
      default:
        return { title: 'OptiVir CRM', subtitle: 'Performance Marketing & Agency Operating System' };
    }
  };

  // 1. Session Initialization Splash (guarantees SSR/CSR hydration parity)
  if (!mounted || isLoading) {
    return (
      <LogoLoader
        fullScreen
        text="OptiVir CRM"
        subtext="Verifying Agency Security Session & RBAC Policy..."
      />
    );
  }

  // 2. Auth Wall: Gate with Login Screen if not authenticated
  if (!user || !token) {
    return <LoginView />;
  }

  const { title, subtitle } = getHeaderDetails();

  return (
    <div className="flex h-screen w-full bg-[#F8F9FB] dark:bg-[#060B13] text-[#0B1727] dark:text-[#F8FAFC] overflow-hidden font-sans transition-colors duration-200">
      {/* 1. Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={navigateTo}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          currentTab={currentTab}
          onQuickAction={() => navigateTo('leads')}
          onNavigate={navigateTo}
          onCreateInvoice={handleOpenCreateInvoice}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FB] dark:bg-[#060B13] custom-scrollbar isolate relative z-0">
          {!canAccessTab(currentTab) ? (
            <div className="max-w-xl mx-auto my-8 sm:my-16 p-5 sm:p-8 bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#DC2626] mx-auto flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900/40">
                  HTTP 403 • Role Access Policy
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2">
                  Module Access Restricted
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your active role (<strong>{user?.roleName || activePersona.roleLabel}</strong>) does not have permission to view the <strong>{title}</strong> workspace.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-left text-xs border border-slate-200 dark:border-slate-700 space-y-1 max-w-md mx-auto">
                <div className="font-bold text-slate-700 dark:text-slate-300">RBAC Identity Details:</div>
                <div className="text-[11px] text-slate-500">
                  User: <strong>{user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : activePersona.name}</strong> ({user?.email || activePersona.email})
                </div>
                <div className="text-[11px] text-slate-500">
                  Role: <strong className="text-rose-600 dark:text-rose-400">{user?.roleName || activePersona.roleLabel}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Allowed Modules: {(user?.allowed_tabs || activePersona.allowedTabs).join(', ')}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigateTo((user?.allowed_tabs?.[0] === '*' || activePersona.allowedTabs[0] === '*') ? 'dashboard' : ((user?.allowed_tabs?.[0] || activePersona.allowedTabs[0]) as any))}
                  className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Return to My Workspace
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  onNavigate={(tab) => navigateTo(tab)}
                  onCreateInvoice={handleOpenCreateInvoice}
                />
              )}
              {currentTab === 'client-360' && (
                <Client360View
                  clientId={selectedClient360Id}
                  clientName={selectedClient360Name}
                  onBackToList={() => navigateTo('clients')}
                />
              )}
              {currentTab === 'leads' && <LeadsView onNavigate={(tab: any) => navigateTo(tab)} />}
              {currentTab === 'contacts' && <ContactsView onNavigate={(tab: any) => navigateTo(tab)} />}
              {(currentTab === 'clients' || currentTab === 'companies') && (
                <ClientsListView
                  onOpenClient360={(cid, cname) => {
                    navigateTo('client-360', cid, cname);
                  }}
                  onNavigate={(tab) => navigateTo(tab)}
                />
              )}
              {currentTab === 'opportunities' && <OpportunitiesView onNavigate={(tab: any) => navigateTo(tab)} />}
              {currentTab === 'pipeline' && <PipelineView onNavigate={(tab: any) => navigateTo(tab)} />}
              {currentTab === 'proposals' && (
                <ProposalsView
                  onNavigateToInvoice={(data) => {
                    setInvoiceTransferData(data);
                    setOpenCreateInvoiceTrigger(false);
                    navigateTo('finance');
                  }}
                />
              )}
              {currentTab === 'onboarding' && (
                <ClientOnboardingView
                  onOpenClient360={(cid, cname) => {
                    navigateTo('client-360', cid, cname);
                  }}
                  onNavigate={(tab) => navigateTo(tab)}
                />
              )}
              {currentTab === 'projects' && <ProjectsView />}
              {currentTab === 'tasks' && <TasksView onNavigate={(tab: any, ...args: any[]) => navigateTo(tab, ...args)} />}
              {currentTab === 'creatives' && <CreativeProofingView onNavigate={(tab) => navigateTo(tab)} />}
              {currentTab === 'sales' && <PipelineView onNavigate={(tab: any) => navigateTo(tab)} />}
              {currentTab === 'marketing' && <MarketingView />}
              {currentTab === 'finance' && (
                <FinanceView
                  initialInvoiceData={invoiceTransferData}
                  openCreateModal={openCreateInvoiceTrigger}
                />
              )}
              {currentTab === 'documents' && <DocumentsView />}
              {currentTab === 'activities' && <CalendarView />}
              {currentTab === 'reports' && <ReportsView />}
              {currentTab === 'notifications' && <NotificationsView onNavigate={(tab) => navigateTo(tab as any)} />}
              {currentTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
