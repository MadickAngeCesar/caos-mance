import React, { useState } from 'react';
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
  MoreVertical,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Opportunity, Organization } from '../../types';

interface OpportunityPipelineProps {
  opportunities: Opportunity[];
  organizations: Organization[];
  onSelectOpp: (id: string) => void;
  onAddOpp: (opp: Partial<Opportunity>) => void;
  onUpdateOppStage: (id: string, stage: Opportunity['stage']) => void;
}

const STAGES: { id: Opportunity['stage']; name: string; defaultProb: number; color: string }[] = [
  { id: 'discovery', name: 'Discovery', defaultProb: 10, color: 'border-blue-400 text-blue-700 dark:text-blue-300' },
  { id: 'proposal', name: 'Proposal', defaultProb: 40, color: 'border-amber-400 text-amber-700 dark:text-amber-300' },
  { id: 'negotiation', name: 'Negotiation', defaultProb: 70, color: 'border-purple-400 text-purple-700 dark:text-purple-300' },
  { id: 'won', name: 'Won', defaultProb: 100, color: 'border-emerald-500 text-emerald-700 dark:text-emerald-300' },
  { id: 'lost', name: 'Lost', defaultProb: 0, color: 'border-stone-400 text-stone-600 dark:text-stone-400' },
];

export const OpportunityPipeline: React.FC<OpportunityPipelineProps> = ({
  opportunities,
  organizations,
  onSelectOpp,
  onAddOpp,
  onUpdateOppStage,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Opp Form State
  const [newOppName, setNewOppName] = useState('');
  const [newOppOrgId, setNewOppOrgId] = useState(organizations[0]?.id || '');
  const [newOppValue, setNewOppValue] = useState(15000);
  const [newOppStage, setNewOppStage] = useState<Opportunity['stage']>('discovery');
  const [newOppDate, setNewOppDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));

  const totalGrossValue = opportunities.reduce((s, o) => s + (o.estimatedValue || 0), 0);
  const totalWeightedValue = opportunities
    .filter((o) => o.stage !== 'lost')
    .reduce((s, o) => s + (o.weightedValue || 0), 0);

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
      {/* 1. Pipeline Header & KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>Opportunity Pipeline</span>
            <span className="text-xs font-normal font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Mode B Active Deals
            </span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage high-touch proposals, contracts, and revenue forecasting
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Board/List toggle */}
          <div className="flex items-center rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-0.5 text-stone-600 dark:text-stone-300">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                viewMode === 'board' ? 'bg-stone-100 dark:bg-stone-700 font-semibold text-stone-900 dark:text-stone-100' : ''
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-stone-100 dark:bg-stone-700 font-semibold text-stone-900 dark:text-stone-100' : ''
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-stone-950 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* 2. Pipeline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium">Weighted Forecast</span>
          <p className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
            ${totalWeightedValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-400">Probability-adjusted revenue</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium">Gross Deal Value</span>
          <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
            ${totalGrossValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-400">{opportunities.length} total recorded deals</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium">Won Revenue</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ${opportunities.filter((o) => o.stage === 'won').reduce((s, o) => s + o.estimatedValue, 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-400">
            {opportunities.filter((o) => o.stage === 'won').length} contracts closed
          </span>
        </div>
      </div>

      {/* 3. Kanban Board or List */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto min-h-[500px] items-start pb-4">
          {STAGES.map((col) => {
            const colOpps = opportunities.filter((o) => o.stage === col.id);
            const colTotal = colOpps.reduce((s, o) => s + (o.estimatedValue || 0), 0);

            return (
              <div
                key={col.id}
                className="bg-stone-100/70 dark:bg-stone-900/50 rounded-lg p-3 border border-stone-200 dark:border-stone-800/80 flex flex-col min-w-[200px] space-y-3"
              >
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                      {col.name}
                    </h3>
                    <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                      ${colTotal.toLocaleString()} ({colOpps.length})
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">{col.defaultProb}%</span>
                </div>

                {/* Cards */}
                <div className="space-y-2.5 min-h-[100px]">
                  {colOpps.map((opp) => (
                    <div
                      key={opp.id}
                      onClick={() => onSelectOpp(opp.id)}
                      className="p-3 bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800 shadow-2xs hover:shadow-xs hover:border-teal-500/50 transition-all cursor-pointer space-y-2 group"
                    >
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-teal-600 line-clamp-2">
                        {opp.name}
                      </p>
                      <p className="text-xs text-stone-500 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>{opp.organizationName}</span>
                      </p>

                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100">
                          ${opp.estimatedValue.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1">
                          {/* Quick stage advance buttons */}
                          {col.id !== 'won' && col.id !== 'lost' && (
                            <select
                              value={opp.stage}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => onUpdateOppStage(opp.id, e.target.value as any)}
                              className="text-[10px] rounded px-1 py-0.5 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
                            >
                              <option value="discovery">Discovery</option>
                              <option value="proposal">Proposal</option>
                              <option value="negotiation">Negotiate</option>
                              <option value="closing">Closing</option>
                              <option value="won">Won</option>
                              <option value="lost">Lost</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colOpps.length === 0 && (
                    <div className="text-center py-6 text-[11px] text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-md">
                      No active deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Table View */
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Weighted</th>
                <th className="py-3 px-4">Expected Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-sm">
              {opportunities.map((opp) => (
                <tr
                  key={opp.id}
                  onClick={() => onSelectOpp(opp.id)}
                  className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100">{opp.name}</td>
                  <td className="py-3 px-4 text-xs text-stone-600 dark:text-stone-400">{opp.organizationName}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-medium uppercase font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800">
                      {opp.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                    ${opp.estimatedValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-teal-600 dark:text-teal-400">
                    ${(opp.weightedValue || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-stone-500">
                    {opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Add Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-teal-600" />
              <span>Create New Deal / Opportunity</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Opportunity Name *</label>
                <input
                  required
                  type="text"
                  value={newOppName}
                  onChange={(e) => setNewOppName(e.target.value)}
                  placeholder="e.g. Enterprise Portal Modernization Contract"
                  className="w-full mt-1 px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Target Organization *</label>
                <select
                  value={newOppOrgId}
                  onChange={(e) => setNewOppOrgId(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer"
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
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Stage</label>
                  <select
                    value={newOppStage}
                    onChange={(e) => setNewOppStage(e.target.value as any)}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="discovery">Discovery (10%)</option>
                    <option value="proposal">Proposal (40%)</option>
                    <option value="negotiation">Negotiation (70%)</option>
                    <option value="closing">Closing (90%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Target Close Date</label>
                <input
                  type="date"
                  value={newOppDate}
                  onChange={(e) => setNewOppDate(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded border border-stone-200 dark:border-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium rounded bg-teal-600 hover:bg-teal-700 text-white"
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
