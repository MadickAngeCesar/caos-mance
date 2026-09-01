import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  SkipForward, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  ArrowLeft, 
  Flame, 
  AlertCircle,
  Building2,
  Send,
  FileText,
  CornerDownRight
} from 'lucide-react';
import { PlannedActivity } from '../../types';
import { AppStoreState } from '../../lib/storage';

interface GuidedSessionViewProps {
  plan: PlannedActivity[];
  state: AppStoreState;
  onCompleteSession: (completedActivities: any[]) => void;
  onCancelSession: () => void;
  onNavigateToDetail: (type: string, id: string) => void;
  onOpenOutreachForOrg: (orgId: string) => void;
}

export const GuidedSessionView: React.FC<GuidedSessionViewProps> = ({
  plan,
  state,
  onCompleteSession,
  onCancelSession,
  onNavigateToDetail,
  onOpenOutreachForOrg,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<{ activityId: string; title: string; action: 'completed' | 'skipped' | 'snoozed'; durationSeconds: number }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [showSkipReason, setShowSkipReason] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [snoozeOption, setSnoozeOption] = useState<'later' | 'tomorrow' | null>(null);

  // Timer loop
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  const currentActivity = plan[currentStepIndex];
  const totalSteps = plan.length;
  const progressPercent = Math.round(((currentStepIndex) / totalSteps) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleNextStep = (action: 'completed' | 'skipped' | 'snoozed') => {
    const updated = [
      ...completedActivities,
      {
        activityId: currentActivity?.id || `step-${currentStepIndex}`,
        title: currentActivity?.title || 'Activity',
        action,
        durationSeconds: elapsedSeconds,
      },
    ];
    setCompletedActivities(updated);
    setShowSkipReason(false);
    setSkipReason('');
    setSnoozeOption(null);

    if (currentStepIndex + 1 < totalSteps) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsFinished(true);
      onCompleteSession(updated);
    }
  };

  if (isFinished) {
    const completedCount = completedActivities.filter((a) => a.action === 'completed').length;

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Session Completed — Great Work!
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            You completed <span className="font-semibold text-teal-600 dark:text-teal-400">{completedCount} of {totalSteps}</span> planned activities in <span className="font-mono font-medium">{formatTime(elapsedSeconds)}</span>.
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4 text-left divide-y divide-stone-100 dark:divide-stone-800">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Session Recap</p>
          {completedActivities.map((act, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between text-sm">
              <span className="text-stone-800 dark:text-stone-200 truncate pr-2">{act.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-medium shrink-0 ${
                act.action === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
              }`}>
                {act.action === 'completed' ? '✓ Completed' : act.action}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={onCancelSession}
            className="px-6 py-2.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-xs transition-colors cursor-pointer"
          >
            Back to Home Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header: Step Indicator & Running Timer */}
      <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              {currentActivity?.title}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-stone-500 font-mono">
            <Clock className="w-4 h-4 text-stone-400" />
            <span className="text-teal-600 dark:text-teal-400 font-bold">{formatTime(elapsedSeconds)}</span>
            <span className="text-stone-400 text-xs">/ {state.todayTimeBudgetMinutes}m budget</span>
          </div>
        </div>

        {/* Thin Progress bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 dark:bg-teal-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Activity Working Slot */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-6 min-h-[380px] flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-mono text-stone-400 font-medium">
                  Activity Type: {currentActivity?.kind.replace('_', ' ')}
                </span>
                {currentActivity?.urgencyBadge && (
                  <span className="text-xs font-mono px-2 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                    {currentActivity.urgencyBadge.text}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-1">
                {currentActivity?.title}
              </h3>
              {currentActivity?.reason && (
                <p className="text-xs text-stone-500 mt-0.5">{currentActivity.reason}</p>
              )}
            </div>

            {currentActivity?.entityId && (
              <button
                onClick={() => {
                  if (currentActivity.entityType === 'organization') onNavigateToDetail('organization', currentActivity.entityId!);
                  else if (currentActivity.entityType === 'opportunity') onNavigateToDetail('opportunity', currentActivity.entityId!);
                }}
                className="px-3 py-1.5 rounded text-xs font-medium border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Embedded Context / Activity Body */}
          <div className="mt-6 space-y-4">
            {currentActivity?.kind === 'overdue_followup' && (
              <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    Follow-up Sequence Touch #{currentActivity.data?.stepIndex || 2}
                  </span>
                  <span>Channel: {currentActivity.data?.channel || 'Email'}</span>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 font-mono">
                  Previous: "{currentActivity.data?.previousMessageSnapshot || 'Initial outreach sent regarding campus portal...'}"
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => onOpenOutreachForOrg(currentActivity.entityId!)}
                    className="px-3 py-1.5 text-xs font-medium rounded bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Composer for Follow-up</span>
                  </button>
                </div>
              </div>
            )}

            {currentActivity?.kind === 'task_due_today' && (
              <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-3">
                <p className="text-sm text-stone-700 dark:text-stone-300">
                  {currentActivity.data?.description || 'Execute scheduled task for this prospect.'}
                </p>
                <div className="text-xs text-stone-400">
                  Priority: <span className="font-medium text-stone-700 dark:text-stone-300 uppercase">{currentActivity.data?.userPriority || 'Medium'}</span>
                </div>
              </div>
            )}

            {currentActivity?.kind === 'stale_high_priority_org' && (
              <div className="p-4 rounded-lg bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 space-y-3">
                <p className="text-sm text-stone-700 dark:text-stone-300">
                  This high-priority institution has had no recorded contact in over 7 days. Review their research summary and compose a new outreach message.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => onNavigateToDetail('organization', currentActivity.entityId!)}
                    className="px-3 py-1.5 text-xs font-medium rounded bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                  >
                    Review Research & Digitalization
                  </button>
                  <button
                    onClick={() => onOpenOutreachForOrg(currentActivity.entityId!)}
                    className="px-3 py-1.5 text-xs font-medium rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 cursor-pointer"
                  >
                    Draft Outreach
                  </button>
                </div>
              </div>
            )}

            {currentActivity?.kind === 'content_gap' && (
              <div className="p-4 rounded-lg bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <FileText className="w-4 h-4" />
                  <span>Authority Building Draft</span>
                </div>
                <p className="text-sm text-stone-800 dark:text-stone-200">
                  "{currentActivity.data?.title}"
                </p>
                <p className="text-xs text-stone-500 italic">
                  {currentActivity.data?.draft ? currentActivity.data.draft.slice(0, 160) + '...' : 'Idea ready to expand.'}
                </p>
              </div>
            )}

            {/* Skip Reason Expandable Input */}
            {showSkipReason && (
              <div className="p-3 bg-stone-100 dark:bg-stone-800/80 rounded-md border border-stone-200 dark:border-stone-700 space-y-2 animate-in fade-in duration-150">
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  Optional reason for skipping:
                </label>
                <input
                  type="text"
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder="e.g. Waiting on Dean to return from conference..."
                  className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleNextStep('skipped')}
                    className="px-3 py-1 text-xs bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 rounded font-medium"
                  >
                    Confirm Skip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Bar: [Skip] [Snooze ▾] [✓ Complete →] */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
          <div>
            {!showSkipReason ? (
              <button
                type="button"
                onClick={() => setShowSkipReason(true)}
                className="px-3.5 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors cursor-pointer"
              >
                Skip Step
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNextStep('snoozed')}
              className="px-3.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors cursor-pointer"
            >
              Snooze (Later Today)
            </button>

            <button
              type="button"
              onClick={() => handleNextStep('completed')}
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-emerald-600 dark:bg-teal-500 dark:hover:bg-emerald-500 dark:text-stone-950 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete & Next →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
