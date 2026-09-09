'use client';

import React, { useState } from 'react';
import { Sidebar, NavItem } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { Client360View } from '@/components/clients/Client360View';
import { LeadsView } from '@/components/crm/LeadsView';
import { ContactsView } from '@/components/crm/ContactsView';
import { CompaniesView } from '@/components/crm/CompaniesView';
import { OpportunitiesView } from '@/components/crm/OpportunitiesView';
import { PipelineView } from '@/components/sales/PipelineView';
import { ClientsListView } from '@/components/clients/ClientsListView';
import { ClientOnboardingView } from '@/components/clients/ClientOnboardingView';
import { ProjectsView } from '@/components/projects/ProjectsView';
import { TasksView } from '@/components/projects/TasksView';
import { MarketingView } from '@/components/marketing/MarketingView';
import { FinanceView } from '@/components/finance/FinanceView';
import { ReportsView } from '@/components/reports/ReportsView';
import { ProposalsView } from '@/components/sales/ProposalsView';
import { CalendarView } from '@/components/operations/CalendarView';
import { DocumentsView } from '@/components/operations/DocumentsView';
import { NotificationsView } from '@/components/operations/NotificationsView';
import { SettingsView } from '@/components/operations/SettingsView';
import { useAuth } from '@/lib/auth-context';
import { ShieldAlert } from 'lucide-react';

export default function Home() {
  const { isLoading, canAccessTab, activePersona } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [invoiceTransferData, setInvoiceTransferData] = useState<any>(null);
  const [openCreateInvoiceTrigger, setOpenCreateInvoiceTrigger] = useState(false);

  const handleOpenCreateInvoice = () => {
    setInvoiceTransferData(null);
    setOpenCreateInvoiceTrigger(true);
    setCurrentTab('finance');
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
      case 'companies':
        return { title: 'Companies & Stakeholders', subtitle: 'Accounts, decision makers, and organization contacts' };
      case 'opportunities':
        return { title: 'Revenue Opportunities', subtitle: 'Track potential revenue from qualification through commercial close' };
      case 'pipeline':
        return { title: 'Deal Pipeline Kanban', subtitle: 'Stage progression with weighted closing revenue forecast' };
      case 'proposals':
        return { title: 'Commercial Proposals & SOW Quotations', subtitle: 'Draft, negotiate, send and track client proposals and contracts in ₹' };
      case 'clients':
        return { title: 'Active Client Accounts', subtitle: 'Retainers, SLAs, health scores, and renewal timelines' };
      case 'onboarding':
        return { title: 'Client Onboarding & Handoff Suite', subtitle: '24-step SLA orchestration from Sales SOW sign-off to full technical kickoff and live delivery' };
      case 'projects':
        return { title: 'Service Delivery Projects', subtitle: 'Agency deliverables, budgets, and milestone progress' };
      case 'tasks':
        return { title: 'Tasks & Operational Kanban', subtitle: 'Team workloads, deliverables, and overdue tracking' };
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

  const { title, subtitle } = getHeaderDetails();

  return (
    <div className="flex h-screen w-full bg-[#F8F9FB] dark:bg-[#060B13] text-[#0B1727] dark:text-[#F8FAFC] overflow-hidden font-sans transition-colors duration-200">
      {/* 1. Sidebar */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          currentTab={currentTab}
          onQuickAction={() => setCurrentTab('leads')}
          onNavigate={setCurrentTab}
          onCreateInvoice={handleOpenCreateInvoice}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FB] dark:bg-[#060B13] custom-scrollbar">
          {!canAccessTab(currentTab) ? (
            <div className="max-w-xl mx-auto my-16 p-8 bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl text-center space-y-4">
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
                  Your active role (<strong>{activePersona.roleLabel}</strong>) does not have permission to view the <strong>{title}</strong> workspace.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-left text-xs border border-slate-200 dark:border-slate-700 space-y-1 max-w-md mx-auto">
                <div className="font-bold text-slate-700 dark:text-slate-300">RBAC Identity Details:</div>
                <div className="text-[11px] text-slate-500">
                  User: <strong>{activePersona.name}</strong> ({activePersona.email})
                </div>
                <div className="text-[11px] text-slate-500">
                  Role: <strong className="text-rose-600 dark:text-rose-400">{activePersona.roleLabel}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Allowed Modules: {activePersona.allowedTabs.join(', ')}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentTab(activePersona.allowedTabs[0] === '*' ? 'dashboard' : activePersona.allowedTabs[0] as any)}
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
                  onNavigate={(tab) => setCurrentTab(tab)}
                  onCreateInvoice={handleOpenCreateInvoice}
                />
              )}
              {currentTab === 'client-360' && <Client360View onBackToList={() => setCurrentTab('clients')} />}
              {currentTab === 'leads' && <LeadsView onNavigate={(tab: any) => setCurrentTab(tab)} />}
              {currentTab === 'contacts' && <ContactsView onNavigate={(tab: any) => setCurrentTab(tab)} />}
              {currentTab === 'companies' && <CompaniesView />}
              {currentTab === 'opportunities' && <OpportunitiesView onNavigate={(tab: any) => setCurrentTab(tab)} />}
              {currentTab === 'pipeline' && <PipelineView onNavigate={(tab: any) => setCurrentTab(tab)} />}
              {currentTab === 'proposals' && (
                <ProposalsView
                  onNavigateToInvoice={(data) => {
                    setInvoiceTransferData(data);
                    setOpenCreateInvoiceTrigger(false);
                    setCurrentTab('finance');
                  }}
                />
              )}
              {currentTab === 'clients' && (
                <ClientsListView
                  onOpenClient360={() => setCurrentTab('client-360')}
                  onNavigate={(tab) => setCurrentTab(tab)}
                />
              )}
              {currentTab === 'onboarding' && (
                <ClientOnboardingView
                  onOpenClient360={() => setCurrentTab('client-360')}
                  onNavigate={(tab) => setCurrentTab(tab)}
                />
              )}
              {currentTab === 'projects' && <ProjectsView />}
              {currentTab === 'tasks' && <TasksView />}
              {currentTab === 'sales' && <PipelineView onNavigate={(tab: any) => setCurrentTab(tab)} />}
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
              {currentTab === 'notifications' && <NotificationsView onNavigate={(tab) => setCurrentTab(tab as any)} />}
              {currentTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
