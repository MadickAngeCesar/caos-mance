import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Briefcase, 
  LayoutGrid, 
  List, 
  DollarSign, 
  Calendar, 
  Building2, 
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Target
} from 'lucide-react';
import { Opportunity, Organization } from '../../types';

interface OpportunityPipelineProps {
  opportunities: Opportunity[];
  organizations: Organization[];
  onSelectOpp: (id: string) => void;
  onAddOpp: (opp: Partial<Opportunity>) => void;
  onUpdateOppStage: (id: string, stage: Opportunity['stage']) => void;
}

const STAGES: { 
  id: Opportunity['stage']; 
  name: string; 
  defaultProb: number; 
  badgeColor: string;
  borderColor: string;
  bgLight: string;
}[] = [
  { 
    id: 'discovery', 
    name: 'Discovery', 
    defaultProb: 10, 
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    borderColor: 'border-t-blue-500',
    bgLight: 'bg-blue-500/5'
  },
  { 
    id: 'proposal', 
    name: 'Proposal', 
    defaultProb: 40, 
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    borderColor: 'border-t-amber-500',
    bgLight: 'bg-amber-500/5'
  },
  { 
    id: 'negotiation', 
    name: 'Negotiation', 
    defaultProb: 70, 
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    borderColor: 'border-t-purple-500',
    bgLight: 'bg-purple-500/5'
  },
  { 
    id: 'won', 
    name: 'Won', 
    defaultProb: 100, 
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    borderColor: 'border-t-emerald-500',
    bgLight: 'bg-emerald-500/5'
  },
  { 
    id: 'lost', 
    name: 'Lost', 
    defaultProb: 0, 
    badgeColor: 'bg-stone-500/10 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-800',
    borderColor: 'border-t-stone-400',
    bgLight: 'bg-stone-500/5'
  },
];

export const OpportunityPipeline: React.FC<OpportunityPipelineProps> = ({
  opportunities,
  organizations,
  onSelectOpp,
  onAddOpp,
  onUpdateOppStage,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [initialModalStage, setInitialModalStage] = useState<Opportunity['stage']>('discovery');

  // New Opp Form State
  const [newOppName, setNewOppName] = useState('');
  const [newOppOrgId, setNewOppOrgId] = useState(organizations[0]?.id || '');
  const [newOppValue, setNewOppValue] = useState(15000);
  const [newOppStage, setNewOppStage] = useState<Opportunity['stage']>('discovery');
  const [newOppDate, setNewOppDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));

  const filteredOpportunities = useMemo(() => {
    if (!searchQuery.trim()) return opportunities;
    const q = searchQuery.toLowerCase();
    return opportunities.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.organizationName && o.organizationName.toLowerCase().includes(q))
    );
  }, [opportunities, searchQuery]);

  const totalGrossValue = useMemo(
    () => filteredOpportunities.reduce((s, o) => s + (o.estimatedValue || 0), 0),
    [filteredOpportunities]
  );

  const totalWeightedValue = useMemo(
    () =>
      filteredOpportunities
        .filter((o) => o.stage !== 'lost')
        .reduce((s, o) => s + (o.weightedValue || (o.estimatedValue * ((o.probabilityPercent || 20) / 100))), 0),
    [filteredOpportunities]
  );

  const wonRevenue = useMemo(
    () =>
      filteredOpportunities
        .filter((o) => o.stage === 'won')
        .reduce((s, o) => s + (o.estimatedValue || 0), 0),
    [filteredOpportunities]
  );

  const handleOpenAddForStage = (stage: Opportunity['stage']) => {
    setInitialModalStage(stage);
    setNewOppStage(stage);
    setShowAddModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppName.trim() || !newOppOrgId) return;

    const org = organizations.find((o) => o.id === newOppOrgId);
    const stageMeta = STAGES.find((s) => s.id === newOppStage);
    const prob = stageMeta?.defaultProb || 20;

    onAddOpp({
      name: newOppName.trim(),
      organizationId: newOppOrgId,
      organizationName: org?.name || 'Client',
      estimatedValue: Number(newOppValue),
      probabilityPercent: prob,
      weightedValue: Math.round(Number(newOppValue) * (prob / 100)),
      stage: newOppStage,
      expectedCloseDate: newOppDate,
    });

    setNewOppName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Pipeline Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Opportunity Pipeline</span>
            </h1>
            <span className="text-xs font-medium font-mono px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Active Deal Flow
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage high-touch proposals, contracts, revenue stages, and probability-weighted forecasting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals or clients..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Board/List toggle */}
          <div className="flex items-center rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-0.5 text-stone-600 dark:text-stone-300 shadow-2xs">
            <button
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'board' ? 'bg-stone-100 dark:bg-stone-800 font-semibold text-stone-900 dark:text-stone-100 shadow-2xs' : 'hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-stone-100 dark:bg-stone-800 font-semibold text-stone-900 dark:text-stone-100 shadow-2xs' : 'hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenAddForStage('discovery')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-stone-950 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* 2. Pipeline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Weighted Forecast</span>
            <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
            ${Math.round(totalWeightedValue).toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-400">Probability-adjusted revenue expectation</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Gross Deal Value</span>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
            ${totalGrossValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-400">{filteredOpportunities.length} total active & closed deals</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Won Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ${wonRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-400">
            {filteredOpportunities.filter((o) => o.stage === 'won').length} contracts successfully secured
          </span>
        </div>
      </div>

      {/* 3. Spacious Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="flex gap-5 overflow-x-auto pb-6 pt-1 items-start min-h-[580px] custom-scrollbar">
          {STAGES.map((col) => {
            const colOpps = filteredOpportunities.filter((o) => o.stage === col.id);
            const colTotal = colOpps.reduce((s, o) => s + (o.estimatedValue || 0), 0);

            return (
              <div
                key={col.id}
                className={`w-[320px] min-w-[300px] flex-shrink-0 bg-stone-50/80 dark:bg-stone-900/60 rounded-xl p-3.5 border border-stone-200/80 dark:border-stone-800 border-t-4 ${col.borderColor} flex flex-col space-y-3.5 shadow-2xs`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                      {col.name}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {colOpps.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-stone-900 dark:text-stone-100">
                      ${colTotal.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      ({col.defaultProb}%)
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[220px]">
                  {colOpps.map((opp) => (
                    <div
                      key={opp.id}
                      onClick={() => onSelectOpp(opp.id)}
                      className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs hover:shadow-md hover:border-teal-500/60 transition-all cursor-pointer space-y-3 group relative"
                    >
                      {/* Deal Title */}
                      <div>
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-2 transition-colors">
                          {opp.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="font-medium truncate">{opp.organizationName}</span>
                        </div>
                      </div>

                      {/* Value & Probability Bar */}
                      <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Deal Value</span>
                          <span className="text-sm font-mono font-bold text-stone-900 dark:text-stone-100">
                            ${opp.estimatedValue.toLocaleString()}
                          </span>
                        </div>

                        {opp.expectedCloseDate && (
                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Target Close</span>
                            <span className="text-xs font-mono text-stone-600 dark:text-stone-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-stone-400" />
                              {new Date(opp.expectedCloseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stage Advance Dropdown */}
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
                        <span className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded-full border ${col.badgeColor}`}>
                          {col.name} ({opp.probabilityPercent || col.defaultProb}%)
                        </span>

                        <select
                          value={opp.stage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateOppStage(opp.id, e.target.value as any)}
                          className="text-[11px] rounded-md px-2 py-1 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="discovery">Discovery</option>
                          <option value="proposal">Proposal</option>
                          <option value="negotiation">Negotiation</option>
                          <option value="won">Won 🎉</option>
                          <option value="lost">Lost</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {/* Empty Stage Placeholder & Add Deal Trigger */}
                  {colOpps.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
                      <p className="text-xs text-stone-400 font-medium">No deals in {col.name}</p>
                      <button
                        onClick={() => handleOpenAddForStage(col.id)}
                        className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Deal</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Add Button at bottom of column */}
                  {colOpps.length > 0 && (
                    <button
                      onClick={() => handleOpenAddForStage(col.id)}
                      className="w-full py-2 px-3 text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/60 rounded-lg border border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to {col.name}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Table View */
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Weighted Forecast</th>
                  <th className="py-3 px-4">Expected Close</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-sm">
                {filteredOpportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    onClick={() => onSelectOpp(opp.id)}
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-stone-100">{opp.name}</td>
                    <td className="py-3.5 px-4 text-xs text-stone-600 dark:text-stone-400">{opp.organizationName}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium uppercase font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {opp.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                      ${opp.estimatedValue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-teal-600 dark:text-teal-400 font-semibold">
                      ${(opp.weightedValue || Math.round(opp.estimatedValue * ((opp.probabilityPercent || 20) / 100))).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-stone-500">
                      {opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={opp.stage}
                        onChange={(e) => onUpdateOppStage(opp.id, e.target.value as any)}
                        className="text-xs rounded px-2 py-1 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
                      >
                        <option value="discovery">Discovery</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Add Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Create New Deal / Opportunity</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Opportunity Name *</label>
                <input
                  required
                  type="text"
                  value={newOppName}
                  onChange={(e) => setNewOppName(e.target.value)}
                  placeholder="e.g. Enterprise Portal Modernization Contract"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Target Organization *</label>
                <select
                  value={newOppOrgId}
                  onChange={(e) => setNewOppOrgId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.city || 'Cameroon'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Contract Value ($)</label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={newOppValue}
                    onChange={(e) => setNewOppValue(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Stage</label>
                  <select
                    value={newOppStage}
                    onChange={(e) => setNewOppStage(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
                  >
                    <option value="discovery">Discovery (10%)</option>
                    <option value="proposal">Proposal (40%)</option>
                    <option value="negotiation">Negotiation (70%)</option>
                    <option value="won">Won (100%)</option>
                    <option value="lost">Lost (0%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Target Close Date</label>
                <input
                  type="date"
                  value={newOppDate}
                  onChange={(e) => setNewOppDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-stone-950 shadow-xs cursor-pointer"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
