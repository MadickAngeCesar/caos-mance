import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  Briefcase, 
  Building2, 
  Send, 
  TrendingUp, 
  ChevronRight,
  Edit2
} from 'lucide-react';
import { AppStoreState, generateDailyPlan } from '../../lib/storage';
import { PlannedActivity } from '../../types';

interface DailyCommandCenterProps {
  state: AppStoreState;
  onNavigate: (route: string, id?: string) => void;
  onStartSession: (plan: PlannedActivity[]) => void;
  onOpenAskCaos: (prompt?: string) => void;
  onUpdateTimeBudget: (mins: number) => void;
}

export const DailyCommandCenter: React.FC<DailyCommandCenterProps> = ({
  state,
  onNavigate,
  onStartSession,
  onOpenAskCaos,
  onUpdateTimeBudget,
}) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeBudgetInput, setTimeBudgetInput] = useState(state.todayTimeBudgetMinutes);
  const [askQuery, setAskQuery] = useState('');

  const plannedList = generateDailyPlan(state, state.todayTimeBudgetMinutes);

  // Compute pipeline values
  const activeOpps = state.opportunities.filter((o) => o.stage !== 'won' && o.stage !== 'lost');
  const weightedPipelineValue = activeOpps.reduce((sum, o) => sum + (o.weightedValue || 0), 0);
  const totalProspectsCount = state.organizations.filter((o) => !o.deletedAt).length;

  const hours = Math.floor(state.todayTimeBudgetMinutes / 60);
  const mins = state.todayTimeBudgetMinutes % 60;
  const timeFormatted = `${hours}h ${mins > 0 ? `${mins}m` : ''}`;

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTimeBudget(Number(timeBudgetInput) || 150);
    setIsEditingTime(false);
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (askQuery.trim()) {
      onOpenAskCaos(askQuery.trim());
      setAskQuery('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* 1. Greeting & Progress Bar Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              Good morning — you have <span className="font-mono text-teal-600 dark:text-teal-400">{timeFormatted}</span> today
            </h1>
            {!isEditingTime ? (
              <button
                onClick={() => setIsEditingTime(true)}
                className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-md shadow-xs border border-stone-200 dark:border-stone-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                Adjust Time
              </button>
            ) : (
              <form onSubmit={handleTimeSubmit} className="inline-flex items-center gap-2">
                <input
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={timeBudgetInput}
                  onChange={(e) => setTimeBudgetInput(Number(e.target.value))}
                  className="w-20 px-2 py-0.5 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                />
                <button type="submit" className="text-xs font-medium px-2 py-0.5 bg-teal-600 text-white rounded">
                  Save
                </button>
              </form>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Today's discipline:</span>
            </span>
            <div className="w-36 h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
              <div className="bg-teal-600 dark:bg-teal-400 h-full w-2/5 rounded-full" />
            </div>
            <span className="font-mono font-medium text-stone-700 dark:text-stone-300">2 / 5 activities completed</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
            <span className="font-mono font-bold">{state.streakCount}-day streak</span>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (65% width): Recommended Today Hero Card (radius-lg) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800/60">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>Recommended Today</span>
                  <span className="text-xs font-normal text-stone-500 font-mono">
                    ({plannedList.length} items • ~{plannedList.reduce((s, i) => s + i.estimatedMinutes, 0)}m)
                  </span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Deterministic priority queue calculated from overdue items and lead scores.
                </p>
              </div>
            </div>

            {/* Numbered Ranked Activity List */}
            <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-800/40">
              {plannedList.map((item, idx) => (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-3 group hover:bg-stone-50/80 dark:hover:bg-stone-800/30 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono text-xs flex items-center justify-center font-semibold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {item.urgencyBadge && (
                          <span
                            className={`text-[11px] font-medium px-2 py-0.2 rounded font-mono ${
                              item.urgencyBadge.variant === 'destructive'
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900'
                                : item.urgencyBadge.variant === 'warning'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                : 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            }`}
                          >
                            {item.urgencyBadge.text}
                          </span>
                        )}
                        <span className="text-xs text-stone-400 truncate">{item.reason}</span>
                        <span className="text-[11px] font-mono text-stone-400">~{item.estimatedMinutes}m</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (item.entityType === 'organization') onNavigate('prospect-detail', item.entityId);
                      else if (item.entityType === 'opportunity') onNavigate('opportunity-detail', item.entityId);
                      else if (item.entityType === 'content') onNavigate('content');
                      else onNavigate('outreach');
                    }}
                    className="shrink-0 px-2.5 py-1 text-xs font-medium rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Go</span>
                    <ChevronRight className="w-3 h-3 text-stone-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dominant Call-to-Action */}
          <button
            onClick={() => onStartSession(plannedList)}
            className="w-full py-3 px-4 rounded-md bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-stone-950 font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Guided Acquisition Session</span>
          </button>
        </div>

        {/* Right Column (35% width): Secondary Pipeline Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Pipeline Summary</span>
              </h3>
              <button
                onClick={() => onNavigate(activeOpps.length > 0 ? 'opportunities' : 'prospects')}
                className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Pipeline</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-md bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                <span className="text-xs text-stone-500">Mode A Prospects</span>
                <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
                  {totalProspectsCount}
                </p>
                <span className="text-[11px] text-stone-400">
                  {state.organizations.filter(o => o.stage === 'engaged').length} ready for Mode B
                </span>
              </div>

              <div className="p-3 rounded-md bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                <span className="text-xs text-stone-500">Active Deals</span>
                <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
                  {activeOpps.length}
                </p>
                <span className="text-[11px] text-stone-400">
                  {activeOpps.filter(o => o.stage === 'proposal').length} in proposal
                </span>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-md bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-600 dark:text-stone-400">Weighted Pipeline Value</span>
                  <p className="text-2xl font-bold font-mono text-teal-700 dark:text-teal-300 mt-0.5">
                    ${weightedPipelineValue.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-stone-400">Gross Value</span>
                  <p className="text-sm font-mono font-medium text-stone-600 dark:text-stone-300">
                    ${activeOpps.reduce((s, o) => s + o.estimatedValue, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
              <span>Overdue follow-ups:</span>
              <span className="font-mono font-bold text-red-600 dark:text-red-400">
                {state.sequenceStepInstances.filter(s => s.status === 'pending' && new Date(s.dueDate) < new Date()).length}
              </span>
            </div>
          </div>

          {/* Quick Authority Reminder */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Authority Content Ready</p>
                <p className="text-[11px] text-stone-500">
                  {state.contentItems.filter(c => c.status === 'ready').length} drafted post(s) ready to publish
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('content')}
              className="text-xs font-medium px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
            >
              Open
            </button>
          </div>
        </div>
      </div>

      {/* 3. Full-width Ask CAOS Quick Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-3 shadow-xs">
        <form onSubmit={handleAskSubmit} className="relative flex items-center">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3 shrink-0" />
          <input
            type="text"
            value={askQuery}
            onChange={(e) => setAskQuery(e.target.value)}
            placeholder="Ask CAOS: &quot;What should I focus on this week?&quot; or &quot;Which prospects need attention?&quot;"
            className="w-full pl-9 pr-24 py-2 text-sm bg-stone-50 dark:bg-stone-800/80 rounded-md border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/30"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 text-xs font-medium bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-800/60 transition-colors cursor-pointer"
          >
            Ask CAOS →
          </button>
        </form>
      </div>
    </div>
  );
};
