'use client';

import React, { useEffect, useState } from 'react';
import { Kanban, Target, CheckCircle2, ChevronRight, Layers, Sparkles, Plus, LayoutGrid, List, X, Building2, Calendar, IndianRupee, Trash2, ExternalLink, FileText } from 'lucide-react';
import { api } from '@/lib/api';

const STAGE_COLOR_MAP: Record<string, string> = {
  'New': '#DC2626',
  'Contacted': '#0F2747',
  'Qualified': '#2563EB',
  'Discovery': '#60A5FA',
  'Opportunity': '#7C5CFC',
  'Proposal': '#D97706',
  'Negotiation': '#DC2626',
  'Won': '#16A34A',
  'Lost': '#DC2626',
};

interface PipelineViewProps {
  onNavigate?: (tab: string) => void;
}

const DEFAULT_STAGES = [
  { id: 'stage-qualified', name: 'Qualified', probability: 25 },
  { id: 'stage-discovery', name: 'Discovery', probability: 40 },
  { id: 'stage-proposal', name: 'Proposal', probability: 60 },
  { id: 'stage-negotiation', name: 'Negotiation', probability: 80 },
  { id: 'stage-won', name: 'Won', probability: 100 },
];

const DEFAULT_PIPELINE = {
  id: 'pipe-perf-mkt',
  name: 'Performance Marketing Pipeline (FY26)',
  stages: DEFAULT_STAGES
};

const DEFAULT_DEALS = [
  {
    id: 'deal-1',
    name: 'Zenith DTC Brands — Meta CAPI SOW',
    company_name: 'Zenith DTC Brands',
    value: 185000,
    probability: 60,
    stage_id: 'stage-proposal',
    status: 'open',
    expected_close_date: '2026-11-15'
  },
  {
    id: 'deal-2',
    name: 'Astra Health Tech — Full-Funnel Retainer',
    company_name: 'Astra Health Tech',
    value: 275000,
    probability: 80,
    stage_id: 'stage-negotiation',
    status: 'open',
    expected_close_date: '2026-10-31'
  },
  {
    id: 'deal-3',
    name: 'UrbanKulture — Creative Studio & UGC',
    company_name: 'UrbanKulture Apparels',
    value: 95000,
    probability: 100,
    stage_id: 'stage-won',
    status: 'won',
    expected_close_date: '2026-10-15'
  },
  {
    id: 'deal-4',
    name: 'Kavach FinTech — PMax & Search Engine',
    company_name: 'Kavach FinTech',
    value: 150000,
    probability: 40,
    stage_id: 'stage-discovery',
    status: 'open',
    expected_close_date: '2026-11-30'
  }
];

export const PipelineView: React.FC<PipelineViewProps> = ({ onNavigate }) => {
  const [pipelines, setPipelines] = useState<any[]>([DEFAULT_PIPELINE]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(DEFAULT_PIPELINE.id);
  const [deals, setDeals] = useState<any[]>(DEFAULT_DEALS);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [loading, setLoading] = useState(false);

  // Add Deal Modal State
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [newDealName, setNewDealName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newDealValue, setNewDealValue] = useState('');
  const [newStageId, setNewStageId] = useState(DEFAULT_STAGES[0].id);
  const [newCloseDate, setNewCloseDate] = useState('');
  const [newProbability, setNewProbability] = useState('50');

  // Inspect Deal Modal State
  const [inspectDeal, setInspectDeal] = useState<any | null>(null);

  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        const res = await api.getPipelines();
        if (res.success && res.data && res.data.length > 0) {
          setPipelines(res.data);
          setSelectedPipelineId(res.data[0].id);
          if (res.data[0].stages?.length > 0) {
            setNewStageId(res.data[0].stages[0].id);
          }
          const dealsRes = await api.getDeals(res.data[0].id);
          if (dealsRes.success && dealsRes.data && dealsRes.data.length > 0) {
            setDeals(dealsRes.data);
          }
        }
      } catch (err) {
        // Graceful fallback to default agency pipeline
      }
    };
    fetchPipelines();
  }, []);

  const activePipeline = pipelines.find((p) => p.id === selectedPipelineId);
  const stages = activePipeline?.stages || [];

  const handleMoveStage = async (dealId: string, nextStageId: string) => {
    try {
      await api.updateDealStage(dealId, nextStageId);
      const res = await api.getDeals(selectedPipelineId);
      if (res.success) {
        setDeals(res.data);
      }
    } catch (err: any) {
      // Local optimistic update
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage_id: nextStageId } : d))
      );
    }
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealName || !newDealValue) return;

    const chosenStage = stages.find((s: any) => s.id === newStageId) || stages[0];
    const newDealObj = {
      id: `deal-${Date.now()}`,
      name: newDealName,
      company_name: newCompanyName || 'Enterprise Prospect',
      value: Number(newDealValue),
      stage_id: chosenStage?.id || (stages[0]?.id ?? 'stage-1'),
      status: 'open',
      probability: Number(newProbability) || chosenStage?.probability || 50,
      weighted_value: Math.round(Number(newDealValue) * ((Number(newProbability) || 50) / 100)),
      expected_close_date: newCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    setDeals([newDealObj, ...deals]);
    setShowAddDealModal(false);
    setNewDealName('');
    setNewCompanyName('');
    setNewDealValue('');
    setNewCloseDate('');
    setNewProbability('50');
  };

  const handleUpdateDealStatus = (dealId: string, newStatus: 'won' | 'lost' | 'open') => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, status: newStatus } : d))
    );
    if (inspectDeal && inspectDeal.id === dealId) {
      setInspectDeal({ ...inspectDeal, status: newStatus });
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    if (!confirm('Are you sure you want to remove this deal from the pipeline?')) return;
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
    setInspectDeal(null);
  };

  const totalPipelineVal = deals.filter(d => d.status === 'open').reduce((sum, d) => sum + Number(d.value || 0), 0);
  const weightedPipelineVal = deals.filter(d => d.status === 'open').reduce((sum, d) => sum + Number(d.weighted_value || (Number(d.value || 0) * 0.5)), 0);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto transition-colors duration-200">
      {/* Top Header & Weighted Pipeline Metrics Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FFFFFF] dark:bg-[#0F2747] border border-[#E5E7EB] dark:border-[#1E3A6D] p-5 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Kanban className="w-5 h-5 text-[#B91C1C]" />
            Deal Pipeline
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Visual deal flow with stage probability weighting and revenue forecasting in Indian Rupees (₹).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Pipeline Selector if multiple exist */}
          {pipelines.length > 1 && (
            <select
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E5E7EB] dark:border-[#1E3A6D] text-xs rounded-lg px-2.5 py-1.5 text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          {/* Kanban / List Toggle */}
          <div className="flex items-center bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-lg p-1 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-1 rounded font-medium transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#0F2747] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1 rounded font-medium transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#0F2747] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* Add Deal Button */}
          <button
            onClick={() => setShowAddDealModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="flex items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#0F2747] border border-[#E5E7EB] dark:border-[#1E3A6D] px-6 py-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-8">
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Active Deals</span>
            <p className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">{deals.filter(d => d.status === 'open').length}</p>
          </div>
          <div className="h-8 w-px bg-[#E5E7EB] dark:bg-[#1E3A6D]"></div>
          <div>
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Total Pipeline</span>
            <p className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {totalPipelineVal >= 10000000 
                ? `₹${(totalPipelineVal / 10000000).toFixed(2)} Cr`
                : `₹${(totalPipelineVal / 100000).toFixed(1)} Lakh`}
            </p>
          </div>
          <div className="h-8 w-px bg-[#E5E7EB] dark:bg-[#1E3A6D]"></div>
          <div>
            <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#B91C1C]" /> Weighted Forecast
            </span>
            <p className="text-lg font-bold text-[#16A34A] dark:text-[#4ADE80]">
              {weightedPipelineVal >= 10000000
                ? `₹${(weightedPipelineVal / 10000000).toFixed(2)} Cr`
                : `₹${(weightedPipelineVal / 100000).toFixed(1)} Lakh`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Won Deals</span>
          <p className="text-lg font-bold text-[#16A34A]">
            {deals.filter(d => d.status === 'won').length} deals (₹{(deals.filter(d => d.status === 'won').reduce((sum, d) => sum + Number(d.value || 0), 0) / 100000).toFixed(1)}L)
          </p>
        </div>
      </div>

      {/* VIEW MODE 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {stages.map((stage: any) => {
            const stageDeals = deals.filter((d) => d.stage_id === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
            const stageColor = STAGE_COLOR_MAP[stage.name] || stage.color || '#2563EB';

            return (
              <div
                key={stage.id}
                className="bg-[#FFFFFF] dark:bg-[#0F2747] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-2xl flex flex-col h-[680px] overflow-hidden shadow-xs"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-[#E5E7EB] dark:border-[#1E3A6D] bg-[#F8FAFC] dark:bg-[#0A101C]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stageColor }}
                      ></span>
                      {stage.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF] dark:bg-[#1E3A6D] text-[#64748B] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-[#1E3A6D]">
                      {stage.probability}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-2">
                    <span>{stageDeals.length} deals</span>
                    <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      ₹{(stageTotal / 100000).toFixed(1)}L
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar bg-[#F8FAFC]/50 dark:bg-[#0A101C]/40">
                  {stageDeals.map((deal: any) => (
                    <div
                      key={deal.id}
                      onClick={() => setInspectDeal(deal)}
                      className="p-4 bg-[#FFFFFF] dark:bg-[#162947] border border-[#E5E7EB] dark:border-[#1E3A6D] hover:border-[#B91C1C]/60 cursor-pointer rounded-xl space-y-2.5 shadow-xs transition hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] line-clamp-2">{deal.name}</h4>
                          {deal.status === 'won' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">WON</span>
                          )}
                          {deal.status === 'lost' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">LOST</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B] font-medium truncate mt-0.5">
                          {deal.company_name || 'Prospect'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1E3A6D] flex justify-between items-center text-xs">
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          ₹{Number(deal.value).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString('en-IN') : 'No date'}
                        </span>
                      </div>

                      {/* Quick Move Stage Control */}
                      <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1E3A6D] flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] text-[#64748B]">Move to:</span>
                        <div className="flex items-center gap-1">
                          {stages.map((st: any) => {
                            if (st.id === stage.id) return null;
                            const targetColor = STAGE_COLOR_MAP[st.name] || st.color || '#2563EB';
                            return (
                              <button
                                key={st.id}
                                title={`Move to ${st.name}`}
                                onClick={() => handleMoveStage(deal.id, st.id)}
                                className="w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center transition hover:scale-125 shadow-xs text-white"
                                style={{ backgroundColor: targetColor }}
                              >
                                {st.order_index || st.name[0]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-xs text-[#64748B] border border-dashed border-[#E5E7EB] dark:border-[#1E3A6D] rounded-xl">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-[#FFFFFF] dark:bg-[#0F2747] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-[#0F172A] dark:text-[#CBD5E1]">
            <thead className="bg-[#F8FAFC] dark:bg-[#0A101C] text-[#64748B] dark:text-[#94A3B8] text-[11px] uppercase tracking-wider border-b border-[#E5E7EB] dark:border-[#1E3A6D]">
              <tr>
                <th className="p-4">Deal Name</th>
                <th className="p-4">Account / Company</th>
                <th className="p-4 text-center">Stage</th>
                <th className="p-4 text-right">Value (₹)</th>
                <th className="p-4 text-center">Probability</th>
                <th className="p-4">Close Date</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E3A6D]">
              {deals.map((deal) => {
                const stage = stages.find((s: any) => s.id === deal.stage_id);
                const stageColor = STAGE_COLOR_MAP[stage?.name || ''] || '#2563EB';

                return (
                  <tr
                    key={deal.id}
                    onClick={() => setInspectDeal(deal)}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E3A6D]/20 cursor-pointer transition"
                  >
                    <td className="p-4 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {deal.name}
                    </td>
                    <td className="p-4 text-[#64748B] dark:text-[#94A3B8]">
                      {deal.company_name || 'Prospect'}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs inline-flex items-center gap-1"
                        style={{ backgroundColor: stageColor }}
                      >
                        {stage?.name || 'Stage'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      ₹{Number(deal.value).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {deal.probability || 50}%
                    </td>
                    <td className="p-4 text-[#64748B] dark:text-[#94A3B8]">
                      {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        deal.status === 'won' ? 'bg-emerald-100 text-emerald-700' :
                        deal.status === 'lost' ? 'bg-red-100 text-red-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {deal.status || 'open'}
                      </span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateDealStatus(deal.id, 'won')}
                          title="Mark Won"
                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 text-[10px] font-semibold transition"
                        >
                          Won ✓
                        </button>
                        <button
                          onClick={() => handleUpdateDealStatus(deal.id, 'lost')}
                          title="Mark Lost"
                          className="px-2 py-1 rounded bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-300 text-[10px] font-semibold transition"
                        >
                          Lost ✕
                        </button>
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          title="Delete Deal"
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-[#1E3A6D]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD DEAL MODAL */}
      {/* ========================================================================= */}
      {showAddDealModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#0F2747] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E7EB] dark:border-[#1E3A6D]">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#B91C1C]" />
                Add New Enterprise Opportunity Deal
              </h3>
              <button
                onClick={() => setShowAddDealModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
              <div>
                <label className="text-[#64748B] dark:text-[#CBD5E1] block mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud ERP Migration"
                  value={newDealName}
                  onChange={(e) => setNewDealName(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-lg p-2.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#B91C1C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#64748B] dark:text-[#CBD5E1] block mb-1">Account / Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Starlight Biosystems"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-lg p-2.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#64748B] dark:text-[#CBD5E1] block mb-1">Deal Value (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500000"
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-lg p-2.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#64748B] dark:text-[#CBD5E1] block mb-1">Pipeline Stage</label>
                  <select
                    value={newStageId}
                    onChange={(e) => setNewStageId(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-lg p-2.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                  >
                    {stages.map((st: any) => (
                      <option key={st.id} value={st.id}>{st.name} ({st.probability}%)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#64748B] dark:text-[#CBD5E1] block mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={newProbability}
                    onChange={(e) => setNewProbability(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-lg p-2.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#64748B] dark:text-[#CBD5E1] block mb-1">Expected Closing Date</label>
                <input
                  type="date"
                  value={newCloseDate}
                  onChange={(e) => setNewCloseDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-lg p-2.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB] dark:border-[#1E3A6D]">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#1E3A6D] text-[#64748B] dark:text-[#CBD5E1] font-semibold hover:bg-[#F8FAFC] dark:hover:bg-[#1E3A6D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold shadow-xs"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSPECT DEAL MODAL */}
      {/* ========================================================================= */}
      {inspectDeal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#0F2747] border border-[#E5E7EB] dark:border-[#1E3A6D] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-[#E5E7EB] dark:border-[#1E3A6D]">
              <div>
                <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
                  {inspectDeal.company_name || 'Account'}
                </span>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                  {inspectDeal.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectDeal(null)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A101C] border border-[#E5E7EB] dark:border-[#1E3A6D]">
              <div>
                <span className="text-[10px] text-[#64748B] block">Deal Capital</span>
                <span className="text-base font-bold text-[#16A34A]">
                  ₹{Number(inspectDeal.value).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block">Win Probability</span>
                <span className="text-base font-bold text-[#2563EB]">
                  {inspectDeal.probability || 50}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block">Expected Closing</span>
                <span className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                  {inspectDeal.expected_close_date ? new Date(inspectDeal.expected_close_date).toLocaleDateString('en-IN') : 'Unspecified'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block">Current Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                  inspectDeal.status === 'won' ? 'bg-emerald-100 text-emerald-700' :
                  inspectDeal.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {inspectDeal.status || 'open'}
                </span>
              </div>
            </div>

            {/* Quick Stage Stepper */}
            <div>
              <label className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] block mb-2">
                Progress Stage
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {stages.map((st: any) => {
                  const isCurrent = inspectDeal.stage_id === st.id;
                  const targetColor = STAGE_COLOR_MAP[st.name] || '#2563EB';
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        handleMoveStage(inspectDeal.id, st.id);
                        setInspectDeal({ ...inspectDeal, stage_id: st.id });
                      }}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition whitespace-nowrap ${
                        isCurrent
                          ? 'text-white shadow-xs'
                          : 'bg-[#F1F5F9] dark:bg-[#1E3A6D] text-[#64748B] hover:text-black dark:hover:text-white'
                      }`}
                      style={{ backgroundColor: isCurrent ? targetColor : undefined }}
                    >
                      {st.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] dark:border-[#1E3A6D]">
              <button
                onClick={() => handleDeleteDeal(inspectDeal.id)}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Deal</span>
              </button>

              <div className="flex items-center gap-2">
                {onNavigate && (
                  <button
                    onClick={() => {
                      setInspectDeal(null);
                      onNavigate('proposals');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#B91C1C]/40 text-[#B91C1C] hover:bg-[#B91C1C]/10 text-xs font-semibold transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Create Proposal</span>
                  </button>
                )}
                <button
                  onClick={() => handleUpdateDealStatus(inspectDeal.id, 'lost')}
                  className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold"
                >
                  Mark Lost
                </button>
                <button
                  onClick={() => handleUpdateDealStatus(inspectDeal.id, 'won')}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  Mark Won ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
