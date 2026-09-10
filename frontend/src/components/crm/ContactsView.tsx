'use client';

import React, { useState, useRef } from 'react';
import {
  Users2,
  TrendingUp,
  ShieldCheck,
  Clock,
  History,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Mail,
  Phone,
  Check,
  X,
  Trash2,
  UserCheck,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Briefcase,
  Building2,
  Calendar,
  Share2,
  ArrowRightCircle
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';

interface ContactItem {
  id: string;
  name: string;
  initials: string;
  isVerified?: boolean;
  roleTag: string;
  company: string;
  companySize: string;
  jobTitle: string;
  email: string;
  phone: string;
  type: 'Prospect' | 'Client' | 'Partner';
  ownerInitials: 'AM' | 'MJ';
  ownerName: string;
  ownerColor: string;
}

const INITIAL_CONTACTS: ContactItem[] = [];

const FILTER_TABS = [
  { id: 'all', label: 'All Contacts' },
  { id: 'my', label: 'My Contacts' },
  { id: 'decision', label: 'Decision Makers' },
  { id: 'clients', label: 'Clients' },
  { id: 'prospects', label: 'Prospects' },
  { id: 'followup', label: 'Needs Follow-up', hasDot: true },
  { id: 'recent', label: 'Recently Added' }
];

interface ContactsViewProps {
  onNavigate?: (tab: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contacts, setContacts] = useState<ContactItem[]>(INITIAL_CONTACTS);
  const [activeTab, setActiveTab] = useState('all');
  const [simulatorStep, setSimulatorStep] = useState('1. Contacts List');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'company'>('newest');

  const handleToggleSort = () => {
    if (sortBy === 'newest') {
      setSortBy('name');
      setContacts([...contacts].sort((a, b) => a.name.localeCompare(b.name)));
      showToast('Sorted contacts alphabetically (A-Z)', 'info');
    } else if (sortBy === 'name') {
      setSortBy('company');
      setContacts([...contacts].sort((a, b) => a.company.localeCompare(b.company)));
      showToast('Sorted contacts by company name', 'info');
    } else {
      setSortBy('newest');
      setContacts(INITIAL_CONTACTS);
      showToast('Sorted contacts by newest added', 'info');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      showToast(`Imported "${files[0].name}" successfully with verified enterprise contacts!`, 'success');
      e.target.value = '';
    }
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((i) => i !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.jobTitle.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto p-6 transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. STATE SIMULATOR BANNER (Matching Image 1)                             */}
      {/* ========================================================================= */}
      <div className="bg-[#0B1528] text-white p-2.5 rounded-xl border border-[#18263F] flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[11px] tracking-wider uppercase flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            STATE SIMULATOR
          </span>
          <span className="text-slate-400 hidden sm:inline">Toggle CRM Module Workspaces:</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {[
            '1. Contacts List',
            '2. Contact Detail',
            '3. Create Drawer',
            '3b. Validation State',
            '4. States & Feedback'
          ].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSimulatorStep(st);
                if (st.includes('Detail') && onNavigate) {
                  onNavigate('leads');
                } else if (st.includes('Create')) {
                  setShowCreateModal(true);
                }
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                simulatorStep === st
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-[#13233C]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BREADCRUMB, HEADER & ACTIONS (Matching Image 1)                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>CRM</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#0B1727] dark:text-white">Contacts</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-2xl font-bold text-[#0B1727] dark:text-white tracking-tight">
              Contacts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#111E34] text-slate-700 dark:text-slate-300 border border-[#E2E6EC] dark:border-[#152238]">
              {contacts.length} total
            </span>
          </div>
          <p className="text-xs text-red-700 dark:text-red-400 font-medium mt-1">
            Manage people, key enterprise relationships, and verified decision-makers across your business ecosystem.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,text/csv"
            onChange={handleFileImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-white shadow-2xs transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#5A6A80]" />
            <span>Import</span>
          </button>
          <button
            onClick={() => {
              exportToCsv('optivir_contacts_directory', contacts);
              showToast('Exported contacts directory to CSV', 'success');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-white dark:bg-[#0B1424] hover:bg-[#F8F9FB] dark:hover:bg-[#111E34] text-xs font-semibold text-[#0B1727] dark:text-white shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#5A6A80]" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create Contact</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 5 PRIMARY KPI SUMMARY CARDS (Matching Image 1)                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Total Contacts</span>
            <Users2 className="w-4 h-4 text-[#8492A6]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-white">{contacts.length}</span>
              <span className="text-[11px] font-semibold text-emerald-600">Live roster</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Clients</span>
            <TrendingUp className="w-4 h-4 text-[#8492A6]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0B1727] dark:text-white">
              {contacts.filter((c) => c.type === 'Client').length}
            </span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">Active client accounts</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Decision Makers</span>
            <ShieldCheck className="w-4 h-4 text-[#8492A6]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0B1727] dark:text-white">
              {contacts.filter((c) => c.roleTag === 'Decision Maker' || c.roleTag === 'C-Suite Key').length}
            </span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">Key Stakeholders</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Prospects</span>
            <History className="w-4 h-4 text-[#8492A6]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0B1727] dark:text-white">
              {contacts.filter((c) => c.type === 'Prospect').length}
            </span>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">Inbound pipeline</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider">Follow-Up Due</span>
            <Clock className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B1727] dark:text-white">0</span>
            </div>
            <span className="text-[11px] text-[#8492A6] block mt-0.5">Clear queue</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FILTER TABS ROW (Matching Image 1)                                    */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E6EC] dark:border-[#152238] pb-2 overflow-x-auto custom-scrollbar">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.id === 'all'
              ? contacts.length
              : tab.id === 'clients'
              ? contacts.filter((c) => c.type === 'Client').length
              : tab.id === 'prospects'
              ? contacts.filter((c) => c.type === 'Prospect').length
              : tab.id === 'decision'
              ? contacts.filter((c) => c.roleTag === 'Decision Maker' || c.roleTag === 'C-Suite Key').length
              : contacts.filter((c) => c.ownerName === 'Alex Morgan').length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-[#0B1727] dark:bg-[#1E293B] text-white shadow-xs'
                  : 'text-[#5A6A80] dark:text-[#94A3B8] hover:text-[#0B1727] hover:bg-slate-100 dark:hover:bg-[#111E34]'
              }`}
            >
              {tab.hasDot && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-[#0F1E36] text-[#5A6A80] dark:text-[#94A3B8]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 5. SEARCH & FILTER RIBBON (Matching Image 1)                             */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-3.5 h-3.5 text-[#8492A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts by name, email, c... ⌘K"
              className="w-full bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-xl pl-9 pr-10 py-2 text-xs text-[#0B1727] dark:text-white outline-none focus:ring-1 focus:ring-[#DC2626]"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8492A6] bg-white dark:bg-[#111E34] border border-[#E2E6EC] dark:border-[#152238] rounded px-1 py-0.5 font-mono">
              ⌘K
            </kbd>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Company: All</option>
            </select>

            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Owner: All</option>
              <option>OptiVir Lead</option>
            </select>

            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Type: All Types</option>
              <option>Prospect</option>
              <option>Client</option>
              <option>Partner</option>
            </select>

            <select className="bg-[#F8FAFC] dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded-lg px-3 py-2 text-xs text-[#0B1727] dark:text-white">
              <option>Status: Active</option>
              <option>Inactive</option>
            </select>

            <button
              onClick={() => showToast('All 11 verified contact fields active', 'info')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#DC2626]" />
              <span>Columns (11)</span>
            </button>

            <button
              onClick={handleToggleSort}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E2E6EC] dark:border-[#152238] text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
            >
              <span>⇅ Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'name' ? 'Name A-Z' : 'Company'}</span>
            </button>

            <button
              onClick={() => {
                setSearchQuery('');
                showToast('Cleared contact filters', 'info');
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Clear / Reset Filter"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Multi-Select Floating Ribbon (Matching Image 1) */}
        {selectedContacts.length > 0 && (
          <div className="p-3 bg-[#0B1727] text-white rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>{selectedContacts.length} contacts selected</span>
              </span>
              <span className="text-slate-400 font-medium">Bulk actions across selection:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setContacts(contacts.map(c => selectedContacts.includes(c.id) ? { ...c, ownerName: 'Maya Joseph', ownerInitials: 'MJ' } : c));
                    showToast(`Assigned Maya Joseph as owner for ${selectedContacts.length} contacts`, 'success');
                  }}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition flex items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Assign Owner</span>
                </button>
                <button
                  onClick={() => {
                    setContacts(contacts.map(c => selectedContacts.includes(c.id) ? { ...c, relationshipType: 'Client' } : c));
                    showToast(`Updated ${selectedContacts.length} contacts to Client type`, 'success');
                  }}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition flex items-center gap-1 cursor-pointer"
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Change Type</span>
                </button>
                <button
                  onClick={() => showToast(`Scheduled follow-up reminder for ${selectedContacts.length} contacts`, 'success')}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Schedule Follow-up</span>
                </button>
                <button
                  onClick={() => {
                    exportToCsv('selected_contacts', contacts.filter(c => selectedContacts.includes(c.id)));
                    showToast(`Exported ${selectedContacts.length} contacts to CSV`, 'success');
                  }}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] font-medium transition flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedContacts.length} contacts?`)) {
                    setContacts(contacts.filter((c) => !selectedContacts.includes(c.id)));
                    setSelectedContacts([]);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1 rounded bg-[#DC2626] hover:bg-[#B91C1C] font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedContacts.length})</span>
              </button>
              <button onClick={() => setSelectedContacts([])} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. MAIN CONTACTS TABLE (Matching Image 1)                                 */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-[#0B1727] dark:text-[#CBD5E1]">
          <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-[#64748B] dark:text-[#94A3B8] text-[11px] uppercase tracking-wider border-b border-[#E2E6EC] dark:border-[#152238]">
            <tr>
              <th className="p-4 w-10 text-center">
                <button onClick={toggleSelectAll} className="mt-1">
                  {selectedContacts.length === contacts.length && contacts.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#DC2626] fill-current" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="p-4 font-bold">CONTACT</th>
              <th className="p-4 font-bold">COMPANY</th>
              <th className="p-4 font-bold">JOB TITLE</th>
              <th className="p-4 font-bold">EMAIL</th>
              <th className="p-4 font-bold">PHONE</th>
              <th className="p-4 font-bold">TYPE</th>
              <th className="p-4 font-bold">OWNER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500">
                  <Users2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No contacts found</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first client or prospect contact.</p>
                </td>
              </tr>
            ) : (
              filteredContacts.map((ct) => {
                const isSelected = selectedContacts.includes(ct.id);
                return (
                  <tr
                    key={ct.id}
                    onClick={() => {
                      if (onNavigate) onNavigate('leads');
                    }}
                    className={`hover:bg-[#F8FAFC] dark:hover:bg-[#111E34] cursor-pointer transition ${
                      isSelected ? 'bg-red-50/20 dark:bg-[#DC2626]/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-4 text-center" onClick={(e) => toggleSelect(ct.id, e)}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#DC2626] fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </td>

                    {/* Contact Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0B1727] dark:bg-[#1E293B] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {ct.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0B1727] dark:text-white hover:text-[#DC2626]">
                              {ct.name}
                            </span>
                            {ct.isVerified && (
                              <Check className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                            )}
                          </div>
                          <span className="text-[11px] text-[#8492A6] block mt-0.5">{ct.roleTag}</span>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="p-4">
                      <p className="font-semibold text-[#0B1727] dark:text-white">{ct.company}</p>
                      <p className="text-[11px] text-[#8492A6]">{ct.companySize}</p>
                    </td>

                    {/* Job Title (Styled Crimson) */}
                    <td className="p-4">
                      <span className="font-semibold text-rose-800 dark:text-rose-400">
                        {ct.jobTitle}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="p-4 text-[#5A6A80] dark:text-[#94A3B8]">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ct.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="p-4 text-[#5A6A80] dark:text-[#94A3B8]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ct.phone}</span>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-[#111E34] text-slate-700 dark:text-slate-300 border border-[#E2E6EC] dark:border-[#152238]">
                        {ct.type}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${ct.ownerColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                          {ct.ownerInitials}
                        </div>
                        <span className="font-medium text-red-800 dark:text-red-300 text-xs">
                          {ct.ownerName}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E2E6EC] dark:border-[#152238] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#5A6A80] dark:text-[#94A3B8]">
          <div className="flex items-center gap-3">
            <span>Showing {filteredContacts.length > 0 ? 1 : 0}-{filteredContacts.length} of {filteredContacts.length} contacts</span>
            <div className="flex items-center gap-1">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-slate-50 dark:bg-[#080E18] border border-[#E2E6EC] dark:border-[#152238] rounded px-2 py-0.5 text-xs text-[#0B1727] dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                  showToast(`Navigated to page ${currentPage - 1}`, 'info');
                }
              }}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  showToast(`Navigated to page ${page}`, 'info');
                }}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                  currentPage === page
                    ? 'bg-[#0B1727] dark:bg-[#1E293B] text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-[#111E34] text-slate-700 dark:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
            <span className="px-1 text-slate-400">...</span>
            <button
              onClick={() => {
                setCurrentPage(50);
                showToast('Navigated to page 50', 'info');
              }}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                currentPage === 50
                  ? 'bg-[#0B1727] dark:bg-[#1E293B] text-white shadow-xs'
                  : 'hover:bg-slate-100 dark:hover:bg-[#111E34] text-slate-700 dark:text-slate-300'
              }`}
            >
              50
            </button>
            <button
              onClick={() => {
                if (currentPage < 50) {
                  setCurrentPage(currentPage + 1);
                  showToast(`Navigated to page ${currentPage + 1}`, 'info');
                }
              }}
              disabled={currentPage === 50}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Contact Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E6EC] dark:border-[#152238]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#DC2626]" />
                <h3 className="font-bold text-sm text-[#0B1727] dark:text-white">Create Enterprise Contact</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input type="text" placeholder="Full Name" className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Company</label>
                  <input type="text" placeholder="Company Name" className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Job Title</label>
                  <input type="text" placeholder="Job Title" className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email *</label>
                  <input type="email" placeholder="contact@company.com" className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input type="text" placeholder="+91 98765 43210" className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-[#DC2626] text-white font-semibold rounded-lg">Save Contact</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
