'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  SlidersHorizontal,
  Building2,
  Globe2,
  User,
  Users,
  KeyRound,
  ShieldCheck,
  Workflow,
  FileCode,
  Tag,
  Briefcase,
  Layers,
  FileText,
  CreditCard,
  Activity,
  Network,
  Cloud,
  Save,
  RotateCcw,
  Copy,
  Trash2,
  Upload,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  // Top Simulator Tabs
  const [simulatorTab, setSimulatorTab] = useState<
    'General & Org' |
    'Users & Matrix' |
    'Pipelines & Fields' |
    'Security & Telemetry' |
    'Integrations Hub' |
    'Lockdown & States'
  >('General & Org');

  // Active Sub-Navigation Tab
  const [activeSection, setActiveSection] = useState('Organization Identity');

  // Form Field States (OptiVir CRM Owner Company Details)
  const [orgLegalName, setOrgLegalName] = useState('OptiVir');
  const [taxGstin, setTaxGstin] = useState('');
  const [domainWebsite, setDomainWebsite] = useState('https://www.optivirads.com');
  const [industry, setIndustry] = useState('Performance Marketing & Advertising Agency');
  const [supportEmail, setSupportEmail] = useState('optivirads@gmail.com');
  const [switchboardPhone, setSwitchboardPhone] = useState('+919995037109');

  // Regionalization States
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST, UTC+05:30)');
  const [ledgerCurrency, setLedgerCurrency] = useState('INR (₹) - Indian Rupee [Master Ledger]');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY (24-Hour: 14:32)');
  const [fiscalYear, setFiscalYear] = useState('April 1st (Indian / UK Standard)');
  const [autoShiftAdjustment, setAutoShiftAdjustment] = useState(true);

  // Administrative Preferences States
  const [landingWorkspace, setLandingWorkspace] = useState('Executive Overview Dashboard');
  const [densityProfile, setDensityProfile] = useState<'Dense' | 'Comfortable'>('Dense');
  const [auditoryChimes, setAuditoryChimes] = useState(true);
  const [telemetryDiff, setTelemetryDiff] = useState(true);

  // Toast / Save notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyUUID = () => {
    navigator.clipboard.writeText('opt-tenant-optivirads');
    showToast('Tenant UUID copied to clipboard: opt-tenant-optivirads');
  };

  const handleSaveChanges = () => {
    showToast('All OptiVir tenant policies & configurations saved to master ledger [200 OK]');
  };

  const handleRollback = () => {
    showToast('Configuration state rolled back to checkpoint snapshot (v4.8.1)');
  };

  interface NavItemConfig {
    id: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
    redDot?: boolean;
    greenDot?: boolean;
  }

  // Sub-Navigation Sections matching Screenshot 2
  const navGroups: { title: string; count: number; items: NavItemConfig[] }[] = [
    {
      title: 'CORE & ORGANIZATION',
      count: 3,
      items: [
        { id: 'Organization Identity', icon: Building2 },
        { id: 'General Regional', icon: Globe2 },
        { id: 'My Preferences', icon: User }
      ]
    },
    {
      title: 'IDENTITY & ACCESS',
      count: 4,
      items: [
        { id: 'User Directory', icon: Users, badge: '1' },
        { id: 'Roles & Permissions', icon: KeyRound, redDot: true },
        { id: 'Teams & Pods', icon: Users },
        { id: 'SSO & Security 2FA', icon: ShieldCheck }
      ]
    },
    {
      title: 'REVENUE & OPERATIONS',
      count: 8,
      items: [
        { id: 'Pipelines & Stages', icon: Workflow },
        { id: 'Custom Fields', icon: FileCode },
        { id: 'System Tags', icon: Tag },
        { id: 'Services Catalog', icon: Briefcase },
        { id: 'Lead Sources', icon: Layers },
        { id: 'Document Templates', icon: FileText },
        { id: 'Billing & Currency', icon: CreditCard }
      ]
    },
    {
      title: 'COMPLIANCE & CONNECT',
      count: 2,
      items: [
        { id: 'Audit Telemetry', icon: Activity, badge: 'Live', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' },
        { id: 'Integrations Hub', icon: Network, greenDot: true }
      ]
    }
  ];

  return (
    <div className="pb-16 transition-colors duration-200">
      {/* 0. Top State Simulator Module Switcher Banner */}
      <div className="bg-[#0A1628] text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-rose-400 uppercase text-[11px]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>ENTERPRISE MODE:</span>
          </div>
          <div className="flex items-center gap-1 bg-[#102038] p-0.5 rounded-md border border-[#1A2E4E] flex-wrap">
            {[
              'General & Org',
              'Users & Matrix',
              'Pipelines & Fields',
              'Security & Telemetry',
              'Integrations Hub',
              'Lockdown & States'
            ].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setSimulatorTab(v as any);
                  if (v === 'General & Org') setActiveSection('Organization Identity');
                  if (v === 'Users & Matrix') setActiveSection('User Directory');
                  if (v === 'Pipelines & Fields') setActiveSection('Pipelines & Stages');
                  if (v === 'Security & Telemetry') setActiveSection('Audit Telemetry');
                  if (v === 'Integrations Hub') setActiveSection('Integrations Hub');
                  showToast(`Switched settings module: ${v}`);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  simulatorTab === v
                    ? 'bg-[#B91C1C] text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Status Strip with Rollback & Save */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-300 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Telemetry Synchronized (2.4k ops/s)
          </span>

          <button
            onClick={handleRollback}
            className="flex items-center gap-1 px-3 py-1 rounded bg-[#112440] hover:bg-[#162D50] border border-[#1D365D] text-xs font-semibold text-slate-200 transition"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Rollback</span>
          </button>

          <button
            onClick={handleSaveChanges}
            className="flex items-center gap-1 px-3.5 py-1 rounded bg-[#B91C1C] hover:bg-[#991B1B] text-xs font-bold text-white shadow-xs transition"
          >
            <Save className="w-3 h-3" />
            <span>Save Changes</span>
            <span className="text-[9px] bg-red-900/80 px-1 py-0.2 rounded ml-0.5">⌘S</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1628] text-white px-4 py-3 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* 1. Header & Navigation Breadcrumb */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B1727] dark:bg-[#111E34] text-white flex items-center justify-center shadow-xs shrink-0 border border-[#1E293B]">
              <Settings className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC] tracking-tight">
                  Settings & System Administration
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                  Enterprise Mode
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Global tenant policies, permissions, security enforcement & operational pipelines
              </p>
            </div>
          </div>
        </div>

        {/* 2. Main Two-Column Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SUB-NAVIGATION SIDEBAR (4 cols) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-3 shadow-xs space-y-4">
              {navGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span>{group.title}</span>
                    <span className="text-slate-400">{group.count}</span>
                  </div>

                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            showToast(`Navigated to ${item.id}`);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            isActive
                              ? 'bg-[#0A1628] text-white shadow-xs'
                              : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#111E34] hover:text-[#0B1727] dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span>{item.id}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                item.badgeColor || (isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')
                              }`}>
                                {item.badge}
                              </span>
                            )}
                            {item.redDot && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
                            )}
                            {item.greenDot && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            )}
                            {isActive && (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* TENANT QUOTA CARD (Bottom of Sidebar) */}
            <div className="bg-[#0A1628] text-white rounded-2xl p-4 shadow-xs space-y-3 border border-[#14233D]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[10px] tracking-wider uppercase text-slate-300">
                  TENANT QUOTA
                </span>
                <Cloud className="w-4 h-4 text-blue-400" />
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-400">Active Seats</span>
                <span className="font-bold text-white text-sm">1 / 50</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-400">Storage Index</span>
                  <span className="font-semibold text-slate-200 text-[11px]">0.0 GB / 500 GB</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN CONFIGURATION PANEL (8 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* TOP CARD: Organization Identity & Brand Core */}
            <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#0B1727] dark:text-white">
                      Organization Identity & Brand Core
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A1628] text-white">
                      Primary Tenant
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Core legal, corporate entity metadata, master branding, and global system identifiers.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Tenant UUID:</span>
                  <button
                    onClick={handleCopyUUID}
                    className="font-mono bg-slate-100 dark:bg-[#111E34] text-slate-800 dark:text-slate-200 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 hover:bg-slate-200 transition"
                  >
                    <span>opt-tenant-optivirads</span>
                    <Copy className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Logo Box & Main Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Master Logo Box (4 cols) */}
                <div className="md:col-span-4 bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    TENANT MASTER LOGO
                  </span>

                  {/* Logo Display */}
                  <div className="h-28 bg-white dark:bg-white rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-4 shadow-inner">
                    <img
                      src="/images/optivir-logo.png"
                      alt="OptiVir CRM"
                      className="h-14 w-auto max-w-full object-contain"
                    />
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Recommended resolution: 2171x724 SVG or transparent high-res PNG. Used in outbound proposals, PDF invoices & login portals.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => showToast('Asset upload dialog opened')}
                      className="flex-1 py-1.5 rounded-lg bg-white dark:bg-[#111E34] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-100 transition text-center"
                    >
                      Replace Asset
                    </button>
                    <button
                      onClick={() => showToast('Reset master logo to default')}
                      className="p-2 rounded-lg bg-white dark:bg-[#111E34] border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 transition"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Form Fields (8 cols) */}
                <div className="md:col-span-8 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Organization Legal Name
                      </label>
                      <input
                        type="text"
                        value={orgLegalName}
                        onChange={(e) => setOrgLegalName(e.target.value)}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tax / GSTIN / VAT ID
                      </label>
                      <input
                        type="text"
                        value={taxGstin}
                        onChange={(e) => setTaxGstin(e.target.value)}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Corporate Domain & Website
                      </label>
                      <div className="relative">
                        <Globe2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={domainWebsite}
                          onChange={(e) => setDomainWebsite(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg text-xs text-[#0B1727] dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Industry Classification
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                      >
                        <option>Enterprise B2B SaaS & Digital Transformation</option>
                        <option>Marketing Agency & Performance Media</option>
                        <option>Healthcare & Life Sciences Solutions</option>
                        <option>Global Retail & Consumer Products</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Primary Support Dispatch Email
                      </label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Primary HQ Phone Switchboard
                      </label>
                      <input
                        type="text"
                        value={switchboardPhone}
                        onChange={(e) => setSwitchboardPhone(e.target.value)}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM TWO CARDS: Regionalization & Currency + My Administrative Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CARD 1: Regionalization & Currency Localization */}
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1727] dark:text-white">
                      Regionalization & Currency Localization
                    </h3>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                      Determines default transaction valuation, timeline calculations, and pipeline aggregations.
                    </p>
                  </div>
                  <Globe2 className="w-4 h-4 text-blue-500 shrink-0" />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      Corporate Standard Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                    >
                      <option>Asia/Kolkata (IST, UTC+05:30)</option>
                      <option>America/New_York (EST, UTC-05:00)</option>
                      <option>Europe/London (GMT, UTC+00:00)</option>
                      <option>Asia/Dubai (GST, UTC+04:00)</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Local server offset: +00:00 drift measured</span>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      Reporting Ledger Base Currency
                    </label>
                    <select
                      value={ledgerCurrency}
                      onChange={(e) => setLedgerCurrency(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white font-semibold"
                    >
                      <option>INR (₹) - Indian Rupee [Master Ledger]</option>
                      <option>USD ($) - United States Dollar</option>
                      <option>EUR (€) - Eurozone</option>
                      <option>GBP (£) - British Pound</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Secondary auto-peg: 1 USD = 83.42 INR (Live FX API)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        Standard Date Format
                      </label>
                      <select
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                      >
                        <option>DD/MM/YYYY (24-Hour: 14:32)</option>
                        <option>MM/DD/YYYY (12-Hour: 02:32 PM)</option>
                        <option>YYYY-MM-DD (ISO 8601)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        Fiscal Year Cycle Start
                      </label>
                      <select
                        value={fiscalYear}
                        onChange={(e) => setFiscalYear(e.target.value)}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                      >
                        <option>April 1st (Indian / UK Standard)</option>
                        <option>January 1st (Calendar Year)</option>
                        <option>October 1st (Federal Fiscal)</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle: Automatic Global Regional Shift Adjustment */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 flex items-center justify-between mt-2">
                    <div className="flex items-start gap-2 pr-3">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                          Automatic Global Regional Shift Adjustment
                        </span>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          Converts deal target dates to user-local timezone dynamically in pipeline cards
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setAutoShiftAdjustment(!autoShiftAdjustment)}
                      className="shrink-0 text-[#0A1628] dark:text-white"
                    >
                      {autoShiftAdjustment ? (
                        <div className="w-10 h-5 bg-[#0A1628] rounded-full p-0.5 flex justify-end">
                          <span className="w-4 h-4 rounded-full bg-white block shadow-sm"></span>
                        </div>
                      ) : (
                        <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full p-0.5 flex justify-start">
                          <span className="w-4 h-4 rounded-full bg-white block shadow-sm"></span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: My Administrative Preferences */}
              <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#0B1727] dark:text-white">
                        My Administrative Preferences
                      </h3>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                        Root Access
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                      Marcus Vance (VP Operations, Super-Admin)
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Default Landing Workspace */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                      Default Landing Workspace
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Where OptiVir CRM launches on login
                    </p>
                    <select
                      value={landingWorkspace}
                      onChange={(e) => setLandingWorkspace(e.target.value)}
                      className="w-full bg-white dark:bg-[#111E34] border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold text-[#0B1727] dark:text-white"
                    >
                      <option>Executive Overview Dashboard</option>
                      <option>Client 360° Operating Profile</option>
                      <option>Sales Pipeline Kanban</option>
                      <option>Billing & Cashflow Ledger</option>
                    </select>
                  </div>

                  {/* Console Density Profile */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                        Console Density Profile
                      </span>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Row padding and table cell sizing
                      </p>
                    </div>

                    <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
                      <button
                        onClick={() => setDensityProfile('Dense')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${
                          densityProfile === 'Dense'
                            ? 'bg-white dark:bg-[#0B1424] text-[#0B1727] dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Dense
                      </button>
                      <button
                        onClick={() => setDensityProfile('Comfortable')}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${
                          densityProfile === 'Comfortable'
                            ? 'bg-white dark:bg-[#0B1424] text-[#0B1727] dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Comfortable
                      </button>
                    </div>
                  </div>

                  {/* Auditory Alert Shimes */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                        Auditory Alert Shimes
                      </span>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Deal win, threshold breach & chat chimes
                      </p>
                    </div>

                    <button
                      onClick={() => setAuditoryChimes(!auditoryChimes)}
                      className="shrink-0 text-[#0A1628] dark:text-white"
                    >
                      {auditoryChimes ? (
                        <div className="w-10 h-5 bg-[#DC2626] rounded-full p-0.5 flex justify-end">
                          <span className="w-4 h-4 rounded-full bg-white block shadow-sm"></span>
                        </div>
                      ) : (
                        <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full p-0.5 flex justify-start">
                          <span className="w-4 h-4 rounded-full bg-white block shadow-sm"></span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Telemetry Diff Highlighting */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                        Telemetry Diff Highlighting
                      </span>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        Show side-by-side JSON diffs in tables
                      </p>
                    </div>

                    <button
                      onClick={() => setTelemetryDiff(!telemetryDiff)}
                      className="shrink-0 text-[#0A1628] dark:text-white"
                    >
                      {telemetryDiff ? (
                        <div className="w-10 h-5 bg-[#0A1628] rounded-full p-0.5 flex justify-end">
                          <span className="w-4 h-4 rounded-full bg-white block shadow-sm"></span>
                        </div>
                      ) : (
                        <div className="w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full p-0.5 flex justify-start">
                          <span className="w-4 h-4 rounded-full bg-white block shadow-sm"></span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
