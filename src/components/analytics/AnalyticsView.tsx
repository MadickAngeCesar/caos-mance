import React from 'react';
import { 
  TrendingUp, 
  Flame, 
  Building2, 
  Briefcase, 
  Send, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { AppStoreState } from '../../lib/storage';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface AnalyticsViewProps {
  state: AppStoreState;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state }) => {
  const activeOrgs = state.organizations.filter((o) => !o.deletedAt);
  const activeOpps = state.opportunities.filter((o) => o.stage !== 'won' && o.stage !== 'lost');

  const stageCounts = [
    { name: 'Lead', count: activeOrgs.filter((o) => o.stage === 'lead').length },
    { name: 'Research', count: activeOrgs.filter((o) => o.stage === 'researching').length },
    { name: 'Qualified', count: activeOrgs.filter((o) => o.stage === 'qualified').length },
    { name: 'Contacted', count: activeOrgs.filter((o) => o.stage === 'contacted').length },
    { name: 'Engaged', count: activeOrgs.filter((o) => o.stage === 'engaged').length },
  ];

  const oppStageData = [
    { name: 'Discovery', value: state.opportunities.filter((o) => o.stage === 'discovery').length, color: '#38bdf8' },
    { name: 'Proposal', value: state.opportunities.filter((o) => o.stage === 'proposal').length, color: '#fbbf24' },
    { name: 'Negotiation', value: state.opportunities.filter((o) => o.stage === 'negotiation').length, color: '#a855f7' },
    { name: 'Closing', value: state.opportunities.filter((o) => o.stage === 'closing').length, color: '#0d9488' },
    { name: 'Won', value: state.opportunities.filter((o) => o.stage === 'won').length, color: '#10b981' },
  ];

  const avgLeadScore = Math.round(
    activeOrgs.reduce((s, o) => s + (o.leadScore || 0), 0) / (activeOrgs.length || 1)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-2 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Acquisition Analytics & Momentum
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Measure conversion efficiency, pipeline velocity, and daily discipline
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium">Daily Streak Momentum</span>
          <div className="flex items-center gap-2 mt-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
              {state.streakCount} Days
            </p>
          </div>
          <span className="text-[11px] text-stone-400">Consistent execution habit</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium">Average Lead Score</span>
          <p className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-2">
            {avgLeadScore} / 100
          </p>
          <span className="text-[11px] text-stone-400">Calculated across {activeOrgs.length} institutions</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium">Weighted Deal Pipeline</span>
          <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-2">
            ${activeOpps.reduce((s, o) => s + (o.weightedValue || 0), 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-400">{activeOpps.length} deals in negotiation</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium">Follow-up Health</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            100%
          </p>
          <span className="text-[11px] text-stone-400">Zero orphaned accounts</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Stage Distribution */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Mode A Prospect Stage Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e2df" strokeOpacity={0.4} />
                <XAxis dataKey="name" stroke="#78716c" fontSize={11} />
                <YAxis stroke="#78716c" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Opportunity Stages */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Mode B Deals by Stage
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={oppStageData.filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {oppStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {oppStageData.filter(d => d.value > 0).map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name} ({d.value})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
