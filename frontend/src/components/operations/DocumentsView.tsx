'use client';

import React, { useState, useEffect } from 'react';
import { getActualStorageEstimate, StorageEstimateData } from '@/lib/storage-estimate';
import {
  FileText,
  ShieldCheck,
  Download,
  Upload,
  FolderPlus,
  Archive,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  X,
  Link2,
  Unlink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  Building,
  HardDrive,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  Check,
  Move,
  Tag,
  Share2,
  Lock
} from 'lucide-react';
import { downloadClientPdf } from '@/lib/downloadPdf';

export const DocumentsView: React.FC = () => {
  // Category Tabs
  const [activeCategory, setActiveCategory] = useState('All Documents (0)');
  const [viewBy, setViewBy] = useState<'Category' | 'Client' | 'Project'>('Category');
  const [displayMode, setDisplayMode] = useState<'list' | 'grid'>('list');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types (PDF, DOC)');
  const [selectedClient, setSelectedClient] = useState('All Clients');
  const [selectedAuthor, setSelectedAuthor] = useState('All Authors');

  // Selection state
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [docPage, setDocPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Modals & Drawers
  const [showPreviewDrawer, setShowPreviewDrawer] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRelinkModal, setShowRelinkModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Actual Storage Space State
  const [storageData, setStorageData] = useState<StorageEstimateData>({
    usage: 0,
    quota: 0,
    formattedUsage: '0.0 MB',
    formattedQuota: 'Loading...',
    percent: 0
  });

  useEffect(() => {
    getActualStorageEstimate().then(setStorageData);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleSelectDoc = (id: string) => {
    if (selectedDocs.includes(id)) {
      setSelectedDocs(selectedDocs.filter(d => d !== id));
    } else {
      setSelectedDocs([...selectedDocs, id]);
    }
  };

  // 4 KPI Cards with Progress Bars
  const kpis = [
    {
      title: 'Total Documents',
      value: '0 Assets',
      sub: `${storageData.formattedUsage} of ${storageData.formattedQuota} Vault`,
      badge: '+0.0% MoM',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
      progress: 0,
      barColor: 'bg-blue-600',
      icon: FileText
    },
    {
      title: 'Legal & Contracts',
      value: '0 Executed',
      sub: '0 Valid & Stamped',
      badge: '0 renewals',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
      progress: 0,
      barColor: 'bg-emerald-500',
      icon: ShieldCheck
    },
    {
      title: 'Pending CRM Link',
      value: '0 Unlinked',
      sub: 'All records bound',
      badge: 'Healthy',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
      progress: 0,
      barColor: 'bg-orange-500',
      icon: Unlink
    },
    {
      title: 'Downloads & Views',
      value: '0 Views',
      sub: '0 Active Client Portals',
      badge: '100% SLA',
      badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400',
      progress: 0,
      barColor: 'bg-cyan-500',
      icon: Eye
    }
  ];

  // Documents List
  const documentsList: any[] = [];

  const filteredDocs = documentsList.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = selectedClient === 'All Clients' || d.client.includes(selectedClient.split(' ')[0]);
    return matchesSearch && matchesClient;
  });

  return (
    <div className="pb-16 transition-colors duration-200">


      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1628] text-white px-4 py-3 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">
        {/* 1. Header & Navigation */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1727] dark:text-[#F8FAFC] tracking-tight">
              Documents & Enterprise Digital Assets
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                0 Stored Assets • {storageData.formattedUsage} Encrypted Storage • Multi-Entity Indexed
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-3xl">
              Securely store, version, preview, audit, and associate legal contracts, proposals, invoices, QBR reports, and client media assets across the unified CRM relationship graph.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>+ Upload Document</span>
              <span className="text-[10px] bg-red-900/60 px-1 py-0.2 rounded ml-1">U</span>
            </button>

            <button
              onClick={() => showToast('Folder structure modal opened')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#111E34] text-[#0B1727] dark:text-white text-xs font-semibold border border-[#E2E6EC] dark:border-[#152238] shadow-xs transition"
            >
              <FolderPlus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>New Folder</span>
            </button>

            <button
              onClick={() => showToast('Batch archive job submitted')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#111E34] text-[#0B1727] dark:text-white text-xs font-semibold border border-[#E2E6EC] dark:border-[#152238] shadow-xs transition"
            >
              <Archive className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Batch Archive</span>
            </button>

            <button
              onClick={() => showToast('Vault security & compliance check: PASS')}
              className="p-2 rounded-lg bg-white dark:bg-[#0B1424] hover:bg-slate-50 dark:hover:bg-[#111E34] text-slate-600 dark:text-slate-300 border border-[#E2E6EC] dark:border-[#152238] shadow-xs"
              title="Security Controls"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* 2. 4 KPI Cards with Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] text-xs">
                    <span className="font-semibold">{k.title}</span>
                    <div className="p-1 rounded-md bg-slate-100 dark:bg-[#111E34]">
                      <Icon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-[#0B1727] dark:text-white tracking-tight">
                      {k.value}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${k.badgeColor}`}>
                      {k.badge}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                    {k.sub}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-2">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${k.barColor} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${k.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Category Tabs & View Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E2E6EC] dark:border-[#152238] gap-3 pb-px">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              'All Documents (0)',
              'Contracts & MSAs (0)',
              'Proposals (0)',
              'Quotations (0)',
              'Invoices & Billing (0)',
              'Executive Reports (0)'
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveCategory(tab);
                  showToast(`Filtered category: ${tab}`);
                }}
                className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap rounded-t-lg transition border-b-2 ${
                  activeCategory === tab
                    ? 'border-[#B91C1C] text-[#B91C1C] dark:text-rose-400 bg-white dark:bg-[#0B1424]'
                    : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0B1727] dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111E34] p-1 rounded-lg text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
            {(['Category', 'Client', 'Project'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewBy(mode)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition ${
                  viewBy === mode
                    ? 'bg-white dark:bg-[#0B1424] text-[#0B1727] dark:text-white shadow-xs'
                    : 'hover:text-[#0B1727] dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Filter Toolbar Strip */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search document name, client, record ID... ⌘K"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] text-xs focus:outline-none focus:border-[#B91C1C]"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-1.5 text-xs text-[#0B1727] dark:text-white font-medium"
            >
              <option value="All Types (PDF, DOC)">All Types (PDF, DOC)</option>
              <option value="PDF">PDF Only</option>
              <option value="DOCX">Word (.docx)</option>
              <option value="ZIP">ZIP Archives</option>
              <option value="CSV">CSV Data</option>
            </select>

            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-1.5 text-xs text-[#0B1727] dark:text-white font-medium"
            >
              <option value="All Clients">All Clients</option>
            </select>

            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-1.5 text-xs text-[#0B1727] dark:text-white font-medium"
            >
              <option value="All Authors">All Authors</option>
              <option value="OptiVir Team">OptiVir Team</option>
            </select>

            {/* List / Grid toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-[#111E34] rounded-lg p-0.5">
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-1.5 rounded-md ${displayMode === 'list' ? 'bg-white dark:bg-[#0B1424] shadow-xs' : 'text-slate-400'}`}
                title="List View"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDisplayMode('grid')}
                className={`p-1.5 rounded-md ${displayMode === 'grid' ? 'bg-white dark:bg-[#0B1424] shadow-xs' : 'text-slate-400'}`}
                title="Grid View"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => showToast('Filters panel opened')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111E34] text-xs font-semibold hover:bg-slate-200"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* 5. Selected Items Toolbar (Shown when items selected) */}
        {selectedDocs.length > 0 && (
          <div className="bg-slate-100 dark:bg-[#102038] border border-slate-300 dark:border-[#1E3A6D] rounded-xl p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#0B1727] dark:text-white">
                {selectedDocs.length} Document selected
              </span>
              <span className="text-slate-400">|</span>
              <button
                onClick={() => setShowPreviewDrawer(true)}
                className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold hover:text-[#B91C1C]"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open in Inspector</span>
              </button>
              <button
                onClick={() => showToast('Move folder dialog opened')}
                className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold hover:text-[#B91C1C]"
              >
                <Move className="w-3.5 h-3.5" />
                <span>Move</span>
              </button>
              <button
                onClick={() => setShowRelinkModal(true)}
                className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold hover:text-[#B91C1C]"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Relink Entity</span>
              </button>
              <button
                onClick={() => {
                  downloadClientPdf('contract', { id: selectedDocs[0] || 'DOC-MSA-TEMPL', client: 'Client Organization' });
                  showToast('Downloading verified contract PDF...');
                }}
                className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold hover:text-[#B91C1C]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Vector PDF</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedDocs([])}
              className="text-[#B91C1C] font-semibold hover:underline"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* 6. High-Density Documents Table */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0B1727] dark:text-[#CBD5E1]">
              <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-[#64748B] dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider border-b border-[#E2E6EC] dark:border-[#152238]">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedDocs.length === documentsList.length}
                      onChange={() => {
                        if (selectedDocs.length === documentsList.length) setSelectedDocs([]);
                        else setSelectedDocs(documentsList.map(d => d.id));
                      }}
                      className="rounded border-slate-300 text-[#B91C1C] focus:ring-[#B91C1C]"
                    />
                  </th>
                  <th className="p-3.5">DOCUMENT NAME & FILE ID</th>
                  <th className="p-3.5">CATEGORY</th>
                  <th className="p-3.5">CLIENT ENTITY</th>
                  <th className="p-3.5">RELATED CRM RECORD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-400">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-semibold">No documents found</p>
                      <p className="text-xs">Upload new contracts, proposals, or assets to get started.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const isSelected = selectedDocs.includes(doc.id);
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => {
                          toggleSelectDoc(doc.id);
                          if (doc.id === 'DOC-2026-089-MSA') setShowPreviewDrawer(true);
                        }}
                        className={`hover:bg-slate-50/70 dark:hover:bg-[#111E34]/50 transition cursor-pointer ${
                          isSelected ? 'bg-blue-50/40 dark:bg-[#132745]/30' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectDoc(doc.id)}
                            className="rounded border-slate-300 text-[#B91C1C] focus:ring-[#B91C1C]"
                          />
                        </td>

                        {/* File name with format icon */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg shrink-0 ${
                              doc.format === 'pdf' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                              doc.format === 'docx' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                              doc.format === 'zip' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>

                            <div>
                              <div className="font-bold text-[#0B1727] dark:text-white">
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2 mt-0.5">
                                <span>{doc.id}</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.version}</span>
                                <span>•</span>
                                <span>{doc.size}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-semibold border inline-flex items-center gap-1 ${doc.categoryBadge}`}>
                            <Tag className="w-3 h-3" />
                            {doc.category}
                          </span>
                        </td>

                        {/* Client Entity */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {doc.client}
                          </div>
                          <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                            {doc.clientCode}
                          </div>
                        </td>

                        {/* Related CRM Record */}
                        <td className="p-3.5">
                          {doc.recordType === 'unlinked' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRelinkModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-bold text-[11px] hover:bg-amber-100 transition"
                            >
                              <Unlink className="w-3.5 h-3.5 text-amber-600" />
                              <span>{doc.record}</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#111E34] text-slate-800 dark:text-slate-200 font-medium text-[11px] border border-slate-200 dark:border-slate-800">
                              <Link2 className="w-3 h-3 text-blue-600" />
                              <span>{doc.record}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-[#E2E6EC] dark:border-[#152238] flex flex-col sm:flex-row justify-between items-center text-xs text-[#64748B] dark:text-[#94A3B8] gap-3">
            <div className="flex items-center gap-2">
              <span>Showing <strong>{filteredDocs.length === 0 ? 0 : ((docPage - 1) * rowsPerPage) + 1} - {Math.min(docPage * rowsPerPage, filteredDocs.length)}</strong> of <strong>{filteredDocs.length}</strong> documents</span>
              <span className="ml-2">Per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setDocPage(1); }}
                className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E2E6EC] dark:border-[#152238] rounded px-2 py-1 text-xs cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1 font-semibold">
              <button
                onClick={() => setDocPage(1)}
                disabled={docPage === 1}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="First Page"
              >
                &lt;&lt;
              </button>
              <button
                onClick={() => setDocPage(p => Math.max(1, p - 1))}
                disabled={docPage === 1}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Previous Page"
              >
                &lt;
              </button>
              {[1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => setDocPage(num)}
                  className={`px-2.5 py-1 rounded cursor-pointer transition ${docPage === num ? 'bg-[#0A1628] text-white font-bold' : 'bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 text-slate-700 dark:text-slate-300'}`}
                >
                  {num}
                </button>
              ))}
              <span>...</span>
              <button
                onClick={() => setDocPage(7)}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${docPage === 7 ? 'bg-[#0A1628] text-white font-bold' : 'bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 text-slate-700 dark:text-slate-300'}`}
              >
                7
              </button>
              <button
                onClick={() => setDocPage(p => Math.min(7, p + 1))}
                disabled={docPage >= 7}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Next Page"
              >
                &gt;
              </button>
              <button
                onClick={() => setDocPage(7)}
                disabled={docPage >= 7}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-[#111E34] hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Last Page"
              >
                &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DRAWER: Preview & Audit Drawer (DOC-2026-089-MSA) */}
      {showPreviewDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-[#0B1424] w-full max-w-2xl h-full shadow-2xl border-l border-[#E2E6EC] dark:border-[#152238] flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#0A101C]">
              <div>
                <span className="text-[10px] font-bold text-[#B91C1C] uppercase tracking-wider">
                  Document Inspector & Audit Hash
                </span>
                <h3 className="text-base font-bold text-[#0B1727] dark:text-white mt-0.5">
                  Master_Services_Agreement_Template.pdf
                </h3>
                <p className="text-[11px] text-slate-500">
                  DOC-MSA-001 • SHA-256: 7f83b165...9481 • Verified Valid
                </p>
              </div>
              <button onClick={() => setShowPreviewDrawer(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1 custom-scrollbar">
              {/* Document Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] font-semibold block">CLIENT RELATIONSHIP</span>
                  <span className="font-bold text-slate-900 dark:text-white">Client Organization</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-semibold block">GOVERNING SOW / DEAL</span>
                  <span className="font-bold text-slate-900 dark:text-white">Active Retainer SOW</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-semibold block">LEGAL STATUS</span>
                  <span className="font-bold text-emerald-600">✓ Standard OptiVir Template</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-semibold block">RENEWAL HORIZON</span>
                  <span className="font-bold text-slate-900 dark:text-white">Annual Auto-Renew</span>
                </div>
              </div>

              {/* PDF Preview Canvas Simulation */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-[#060B13] shadow-inner space-y-3 font-serif">
                <div className="flex justify-between items-center border-b pb-2 text-[10px] text-slate-400 font-sans">
                  <span>PAGE 1 OF 14</span>
                  <span>CONFIDENTIAL & PROPRIETARY</span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white text-center">
                  MASTER SERVICES & SLA AGREEMENT
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  This Master Services Agreement ("Agreement") is made effective by and between OptiVir Ads ("Service Provider") and Client Organization ("Client").
                </p>
                <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded border border-slate-200 dark:border-slate-800 text-[10px] font-sans">
                  <strong className="text-slate-900 dark:text-white">Digital Security Certificate ID:</strong> OPTIVIR-SHA256-VERIFIED<br />
                  <strong>Service Provider:</strong> OptiVir Ads (optivirads@gmail.com)<br />
                  <strong>Client Signatory:</strong> Authorized Representative
                </div>
              </div>

              {/* Version History */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs font-sans">
                  Version History & Activity
                </h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0A101C] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">v3.2 (Final Countersigned)</span>
                      <span className="text-slate-400 block text-[10px]">Aug 14, 2026 • Marcus Vance</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Active</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0A101C] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">v3.1 (Legal Redlines Addressed)</span>
                      <span className="text-slate-400 block text-[10px]">Aug 10, 2026 • Legal Counsel</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">Superseded</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0A101C] flex justify-between items-center">
              <button
                onClick={() => {
                  downloadClientPdf('contract', { id: 'CERT-SHA256', client: 'Client Organization' });
                  showToast('Downloaded SHA-256 Audit Certificate PDF');
                }}
                className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50"
              >
                Export Audit Certificate
              </button>
              <button
                onClick={() => {
                  downloadClientPdf('contract', { id: 'DOC-MSA-001', client: 'Client Organization' });
                  showToast('Downloaded Master_Services_Agreement_Template.pdf');
                  setShowPreviewDrawer(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF (Vector)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Upload Document & OCR */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Upload className="w-4 h-4 text-[#B91C1C]" />
                <span>Upload Document to Enterprise Vault</span>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center space-y-2 hover:border-[#B91C1C] transition cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-900 dark:text-white">Click or drag file to upload</p>
              <p className="text-[11px] text-slate-400">Supports PDF, DOCX, XLSX, ZIP up to 250 MB</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Associate Client Entity</label>
                <input
                  type="text"
                  placeholder="Client Organization Name"
                  className="w-full bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Document Category</label>
                <select className="w-full bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs">
                  <option>Contract & Legal (MSA / NDA)</option>
                  <option>Proposal & SOW</option>
                  <option>Quotation</option>
                  <option>Tax Invoice</option>
                  <option>Brand Asset</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Document uploaded and OCR indexed in vault!');
                  setShowUploadModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#B91C1C] text-white font-bold"
              >
                Upload & Index
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Relink Entity */}
      {showRelinkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Link2 className="w-4 h-4 text-[#B91C1C]" />
                <span>Bind Document to CRM Entity</span>
              </div>
              <button onClick={() => setShowRelinkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-300">
              Select which Deal, Client 360°, Project, or Invoice record should be linked to this document:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Target Entity Type</label>
                <select className="w-full bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs">
                  <option>Revenue Opportunity / Proposal</option>
                  <option>Client 360° Profile</option>
                  <option>Project Delivery SOW</option>
                  <option>Finance Tax Invoice</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Target Record</label>
                <input
                  type="text"
                  placeholder="e.g. PROP-001 or Client Deal ID"
                  className="w-full bg-slate-50 dark:bg-[#0A101C] border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-[#0B1727] dark:text-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowRelinkModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast('Document successfully bound to CRM entity record!');
                  setShowRelinkModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-[#B91C1C] text-white font-bold"
              >
                Confirm Binding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
