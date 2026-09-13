'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  SlidersHorizontal,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Building,
  DollarSign,
  FileCheck,
  Briefcase,
  AlertCircle,
  Eye,
  PhoneCall,
  Check,
  X,
  Settings,
  Mail,
  VolumeX,
  Radio,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Inbox,
  CheckCheck,
  RotateCcw
} from 'lucide-react';

interface NotificationsViewProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigate }) => {
  // Main Page Filter Tabs
  const [mainTab, setMainTab] = useState('All (0)');

  // Floating Panel Visibility & Drawer State
  const [showFloatingPanel, setShowFloatingPanel] = useState(true);
  const [drawerTab, setDrawerTab] = useState<'All (0)' | 'Unread (0)' | 'Action Required (0)'>('All (0)');
  const [drawerEmptyState, setDrawerEmptyState] = useState(false);

  // Modals & Preferences
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifPage, setNotifPage] = useState(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Notification items state for Left Table
  const [tableNotifications, setTableNotifications] = useState<any[]>([]);

  // Notification items state for Floating Drawer (Matching Image 1 right panel)
  const [drawerNotifications, setDrawerNotifications] = useState<any[]>([]);

  const toggleReadDrawerItem = (id: string) => {
    setDrawerNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n)
    );
  };

  const markAllDrawerRead = () => {
    setDrawerNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('All drawer notifications marked as read');
  };

  const filteredDrawerNotifications = drawerNotifications.filter(n => {
    if (drawerTab === 'Unread (0)') return n.unread;
    if (drawerTab === 'Action Required (0)') return n.category === 'Action Required (0)';
    return true;
  });

  return (
    <div className="pb-16 transition-colors duration-200">
      {/* Top Status Header */}
      <div className="bg-[#0A1628] text-white px-6 py-2.5 text-xs flex flex-wrap items-center justify-between border-b border-[#14233D] gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 text-xs">Activity & Notification Center</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-time Feed Active
          </span>
          <span className="text-slate-600">|</span>
          <span>Node-US-04</span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1628] text-white px-4 py-3 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto relative">
        {/* 1. Header & Navigation Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium mb-1">
            <span className="text-[#DC2626] font-semibold">Operations</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">Notifications Hub</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mt-2">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC] tracking-tight">
                  Notifications & Alerts Hub
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Live Stream
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-3xl">
                Track commercial milestones, overdue tasks, invoice settlements, and system telemetry across all enterprise accounts.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#111E34] text-[#0B1727] dark:text-white text-xs font-semibold border border-[#E2E6EC] dark:border-[#152238] shadow-xs transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Notification Matrix</span>
              </button>

              <button
                onClick={() => setShowFloatingPanel(!showFloatingPanel)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A1628] dark:bg-[#112440] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Inbox className="w-4 h-4" />
                <span>Toggle Floating Panel</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Top Summary KPI Cards (3 Cards matching Image 1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: UNREAD ALERTS */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] text-[11px] font-bold tracking-wider uppercase">
              <span>UNREAD ALERTS</span>
              <div className="p-1 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950">
                <Bell className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#0B1727] dark:text-white tracking-tight">00</span>
              <span className="text-xs font-bold text-slate-500">
                +0 since 09:15 AM
              </span>
            </div>

            <div className="mt-2 text-[11px] flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Requires immediate triage</span>
              <span className="font-bold text-slate-500">0 High Priority</span>
            </div>
          </div>

          {/* Card 2: ACTION REQUIRED */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] text-[11px] font-bold tracking-wider uppercase">
              <span>ACTION REQUIRED</span>
              <div className="p-1 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#0B1727] dark:text-white tracking-tight">00</span>
              <span className="text-xs text-slate-500">
                Pending Signature/Settle
              </span>
            </div>

            <div className="mt-2 text-[11px] flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">0 Overdue Invoice • 0 Milestones</span>
              <span className="font-bold text-slate-500">0 Escalate</span>
            </div>
          </div>

          {/* Card 3: DIGEST & DISPATCH */}
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] text-[11px] font-bold tracking-wider uppercase">
              <span>DIGEST & DISPATCH</span>
              <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                <Mail className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#0B1727] dark:text-white tracking-tight">08:30 <span className="text-sm font-normal text-slate-500">IST</span></span>
            </div>

            <div className="mt-2 text-[11px] flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Daily Email Summary</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ✓ 100% Delivered
              </span>
            </div>
          </div>
        </div>

        {/* 3. Main Filter Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E2E6EC] dark:border-[#152238]">
          {[
            'All (0)',
            'Unread (0)',
            'Action Required (0)',
            'Finance (0)',
            'Commercial & Sales (0)',
            'Projects (0)'
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setMainTab(tab);
                showToast(`Filter: ${tab}`);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                mainTab === tab
                  ? 'bg-[#0A1628] dark:bg-[#112440] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0B1424] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E6EC] dark:border-[#152238] hover:text-[#0B1727]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. Left Content Table */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0B1727] dark:text-[#CBD5E1]">
              <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-[#64748B] dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider border-b border-[#E2E6EC] dark:border-[#152238]">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-[#B91C1C]" />
                  </th>
                  <th className="p-3.5">TYPE & SEVERITY</th>
                  <th className="p-3.5">SUBJECT / RECORD REFERENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
                {tableNotifications.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-16 text-slate-400">
                      <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-semibold">You're all caught up!</p>
                      <p className="text-xs">No pending notifications or system escalations.</p>
                    </td>
                  </tr>
                ) : (
                  tableNotifications.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-[#111E34]/50 transition">
                      <td className="p-3.5 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${row.dotColor}`}></span>
                      </td>

                      <td className="p-3.5 w-56">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${row.typeColor}`}>
                          {row.type}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <div className="font-bold text-[#0B1727] dark:text-white text-xs">
                              {row.subject}
                            </div>
                            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                              {row.reference}
                            </div>
                          </div>

                          {row.badge && (
                            <div className="flex items-center gap-3 shrink-0 text-xs">
                              <span className="text-rose-600 font-semibold">{row.badge}</span>
                              <span className="text-slate-400">{row.time}</span>
                              <span className="text-slate-400 font-medium">{row.statusText}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#E2E6EC] dark:border-[#152238] flex flex-col sm:flex-row justify-between items-center text-xs text-[#64748B] dark:text-[#94A3B8] gap-3">
            <span>Showing {tableNotifications.length === 0 ? '0' : notifPage === 1 ? '1 - 4' : '5 - 8'} of {tableNotifications.length} enterprise notifications</span>
            <div className="flex items-center gap-1 font-semibold">
              <button
                onClick={() => setNotifPage(p => Math.max(1, p - 1))}
                disabled={notifPage === 1}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setNotifPage(1)}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${notifPage === 1 ? 'bg-[#0A1628] text-white' : 'bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 text-slate-700 dark:text-slate-300'}`}
              >
                1
              </button>
              <button
                onClick={() => setNotifPage(2)}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${notifPage === 2 ? 'bg-[#0A1628] text-white' : 'bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 text-slate-700 dark:text-slate-300'}`}
              >
                2
              </button>
              <button
                onClick={() => setNotifPage(p => Math.min(2, p + 1))}
                disabled={notifPage === 2}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* 5. Bottom Simulation Banner (Zero Pending Backlog Simulation) */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#111E34] border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#0B1727] dark:text-white">
                Zero Pending Backlog Simulation
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Preview how the notification drawer renders when Marcus has cleared all 7 active items.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setDrawerEmptyState(!drawerEmptyState);
              showToast(drawerEmptyState ? 'Restored active notification queue' : 'Simulating empty zero-backlog state');
            }}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            {drawerEmptyState ? 'Restore Active Notifications' : 'Show Empty State in Drawer'}
          </button>
        </div>

        {/* 6. Persistent / Toggleable Floating Right Drawer (Matching Image 1 exact UI) */}
        {showFloatingPanel && (
          <div className="fixed top-20 right-6 w-96 bg-white dark:bg-[#0B1424] border border-[#CBD5E1] dark:border-[#1E3A6D] rounded-2xl shadow-2xl z-40 overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Drawer Header */}
            <div className="bg-[#0A1628] text-white p-3 px-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-white" />
                <span className="font-bold text-xs">Notifications</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-[#DC2626] text-white">
                  {drawerNotifications.filter(n => n.unread).length} unread
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <button onClick={markAllDrawerRead} title="Mark All as Read" className="hover:text-white">
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button onClick={() => setShowPreferencesModal(true)} title="Notification Preferences" className="hover:text-white">
                  <Settings className="w-4 h-4" />
                </button>
                <button onClick={() => setShowFloatingPanel(false)} title="Close Panel" className="hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Sub-tabs */}
            <div className="bg-slate-100 dark:bg-[#0A101C] p-1.5 flex gap-1 text-[11px] border-b border-slate-200 dark:border-slate-800">
              {(['All (0)', 'Unread (0)', 'Action Required (0)'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setDrawerTab(t as any)}
                  className={`flex-1 py-1 rounded-md font-semibold text-center transition ${
                    drawerTab === t
                      ? 'bg-white dark:bg-[#111E34] text-[#0B1727] dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Drawer Content */}
            <div className="max-h-[460px] overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs">
              {drawerEmptyState || filteredDrawerNotifications.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-900 dark:text-white text-xs">You're completely caught up!</p>
                  <p className="text-[11px] text-slate-500">Zero unread alerts or pending approvals remaining.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                    <span>TODAY</span>
                    <span>{filteredDrawerNotifications.length} updates</span>
                  </div>

                  {filteredDrawerNotifications.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#0E1A2E]/40 space-y-2 relative"
                    >
                      {item.unread && (
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
                      )}

                      <div className="flex items-start gap-2.5">
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${item.iconBg}`}>
                          <Bell className="w-3.5 h-3.5" />
                        </div>

                        <div className="space-y-0.5 flex-1 pr-3">
                          <h4 className="font-bold text-[#0B1727] dark:text-white text-[11px] leading-tight">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-snug">
                            {item.desc}
                          </p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                            <span className="font-medium text-slate-600 dark:text-slate-400">{item.code}</span>
                            <span>•</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                        {item.actionPrimary && (
                          <button
                            onClick={() => {
                              if (onNavigate && item.actionPrimary.nav) onNavigate(item.actionPrimary.nav);
                              else showToast(`Triggered: ${item.actionPrimary.label}`);
                            }}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                              item.actionPrimary.red
                                ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                                : 'bg-[#0A1628] dark:bg-[#112440] hover:bg-slate-800 text-white'
                            }`}
                          >
                            {item.actionPrimary.label}
                          </button>
                        )}

                        {item.actionSecondary && (
                          <button
                            onClick={() => {
                              if (item.actionSecondary.label === 'Mark Read') toggleReadDrawerItem(item.id);
                              else if (onNavigate && item.actionSecondary.nav) onNavigate(item.actionSecondary.nav);
                              else showToast(`Triggered: ${item.actionSecondary.label}`);
                            }}
                            className="px-2.5 py-1 rounded bg-white dark:bg-[#0B1424] border border-slate-300 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                          >
                            {item.actionSecondary.label}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-2.5 px-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A101C] flex items-center justify-between text-[11px]">
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('settings');
                  else showToast('Navigating to complete audit log');
                }}
                className="font-bold text-[#0B1727] dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Audit View</span>
                <ChevronRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => setShowPreferencesModal(true)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-semibold"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Configure Channels</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PREFERENCES MATRIX MODAL */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Settings className="w-4 h-4 text-[#B91C1C]" />
                <span>Notification & Webhook Preferences Matrix</span>
              </div>
              <button onClick={() => setShowPreferencesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-300">
              Configure which telemetry events broadcast instant sound alerts, email digests, or slack webhooks:
            </p>

            <div className="space-y-3">
              {[
                { title: 'Overdue Invoices & AR Dunning (>7 days)', channel: 'In-App + High-Priority Email', enabled: true },
                { title: 'Closed Won Proposal Countersigns', channel: 'In-App + Slack #revenue-wins', enabled: true },
                { title: 'Algorithmic Anomaly Spikes (CPA > +30%)', channel: 'In-App + SMS Alert', enabled: true },
                { title: 'SOW Sprint Burndown & Milestone Deadlines', channel: 'In-App Daily Digest', enabled: true },
                { title: 'Automated Daily Banking Discrepancies', channel: 'Digest Only (Muted In-App)', enabled: false }
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{pref.title}</span>
                    <span className="text-[10px] text-slate-500">{pref.channel}</span>
                  </div>
                  <input type="checkbox" defaultChecked={pref.enabled} className="rounded text-[#B91C1C]" />
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Notification matrix preferences saved!');
                  setShowPreferencesModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#B91C1C] text-white font-bold"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
