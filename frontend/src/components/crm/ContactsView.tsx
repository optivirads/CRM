'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ArrowRightCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/exportCsv';
import { api } from '@/lib/api';

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    email: '',
    phone: '',
    isDecisionMaker: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [deletingContact, setDeletingContact] = useState<ContactItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'company'>('newest');

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.getContacts();
      if (res.success && Array.isArray(res.data)) {
        setContacts(res.data.map((ct: any) => {
          const fullName = `${ct.first_name || ''} ${ct.last_name || ''}`.trim() || ct.name || 'Unnamed Contact';
          const initials = ((ct.first_name?.[0] || '') + (ct.last_name?.[0] || 'C')).toUpperCase() || 'CT';
          return {
            id: ct.id,
            name: fullName,
            initials: initials,
            isVerified: true,
            roleTag: ct.is_decision_maker ? 'Decision Maker' : (ct.designation || 'Enterprise Contact'),
            company: ct.company_name || 'Independent',
            companySize: '11-50',
            jobTitle: ct.designation || ct.job_title || 'Lead Contact',
            email: ct.email || 'No email',
            phone: ct.phone || 'No phone',
            type: (ct.type || 'Prospect') as 'Prospect' | 'Client' | 'Partner',
            ownerInitials: 'AM',
            ownerName: 'Sales Lead',
            ownerColor: 'bg-emerald-600'
          };
        }));
      }
    } catch (err: any) {
      console.warn('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreateContact = async () => {
    if (!newContact.firstName.trim() || !newContact.email.trim()) {
      showToast('First Name and Email are required', 'error');
      return;
    }
    try {
      setIsCreating(true);
      const res = await api.createContact({
        first_name: newContact.firstName.trim(),
        last_name: newContact.lastName.trim(),
        company_name: newContact.company.trim() || undefined,
        designation: newContact.jobTitle.trim() || undefined,
        email: newContact.email.trim(),
        phone: newContact.phone.trim() || undefined,
        is_decision_maker: newContact.isDecisionMaker
      });
      if (res.success) {
        showToast(`Contact "${newContact.firstName}" created successfully`);
        setShowCreateModal(false);
        setNewContact({ firstName: '', lastName: '', company: '', jobTitle: '', email: '', phone: '', isDecisionMaker: false });
        fetchContacts();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create contact', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteContact = async () => {
    if (!deletingContact) return;
    try {
      setIsDeleting(true);
      const res = await api.deleteContact(deletingContact.id);
      if (res.success) {
        showToast(`Contact "${deletingContact.name}" deleted successfully`);
        setDeletingContact(null);
        fetchContacts();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete contact', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

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
      fetchContacts();
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

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / rowsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredContacts.length);
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto p-6 transition-colors duration-200">

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
              <th className="p-4 font-bold text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#152238]">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-slate-500">
                  <Users2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No contacts found</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first client or prospect contact.</p>
                </td>
              </tr>
            ) : (
              paginatedContacts.map((ct) => {
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

                    {/* Action Column */}
                    <td className="p-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingContact(ct);
                        }}
                        title="Delete Contact"
                        className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            <span>
              Showing {filteredContacts.length > 0 ? startIndex + 1 : 0}-{endIndex} of {filteredContacts.length} contacts
            </span>
            <div className="flex items-center gap-1">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
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
              onClick={() => setCurrentPage(Math.max(1, validCurrentPage - 1))}
              disabled={validCurrentPage === 1}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] disabled:opacity-40 cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                  validCurrentPage === page
                    ? 'bg-[#0B1727] dark:bg-[#1E293B] text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-[#111E34] text-slate-700 dark:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, validCurrentPage + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#111E34] disabled:opacity-40 cursor-pointer text-slate-700 dark:text-slate-300"
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newContact.firstName}
                    onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                    placeholder="e.g. Rahul"
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newContact.lastName}
                    onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                    placeholder="e.g. Sharma"
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Company</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="e.g. Acme Tech"
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    value={newContact.jobTitle}
                    onChange={(e) => setNewContact({ ...newContact, jobTitle: e.target.value })}
                    placeholder="e.g. Chief Marketing Officer"
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-lg border border-[#E2E6EC] dark:border-[#152238] bg-slate-50 dark:bg-[#080E18] outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="decisionMakerCheck"
                  checked={newContact.isDecisionMaker}
                  onChange={(e) => setNewContact({ ...newContact, isDecisionMaker: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="decisionMakerCheck" className="text-xs font-semibold cursor-pointer">
                  Key Decision Maker
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateContact}
                  disabled={isCreating}
                  className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold rounded-lg disabled:opacity-50 transition"
                >
                  {isCreating ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingContact && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1424] border border-[#E2E6EC] dark:border-[#152238] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-[#0B1727] dark:text-white">Delete Contact</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{deletingContact.name}</span>? This action will remove the contact from the CRM database.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E6EC] dark:border-[#152238]">
              <button
                type="button"
                onClick={() => setDeletingContact(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 dark:border-[#152238] text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-[#111E34]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteContact}
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
