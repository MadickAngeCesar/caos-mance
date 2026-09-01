import React from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Lightbulb, 
  HelpCircle, 
  Flag, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  XCircle
} from 'lucide-react';
import { OrgStage, OppStage, Priority, ActionClassification } from '../../types';

interface StageBadgeProps {
  stage: OrgStage | OppStage;
  className?: string;
}

export const StageBadge: React.FC<StageBadgeProps> = ({ stage, className = '' }) => {
  switch (stage) {
    // Mode A Stages
    case 'lead':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
          Lead
        </span>
      );
    case 'researching':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 ${className}`}>
          <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
          Researching
        </span>
      );
    case 'qualified':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 ${className}`}>
          <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
          Qualified
        </span>
      );
    case 'contacted':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-400 dark:border-teal-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          Contacted
        </span>
      );
    case 'engaged':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-600 text-white shadow-xs ${className}`}>
          <Sparkles className="w-3 h-3" />
          Engaged
        </span>
      );
    case 'nurture':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-dashed border-stone-300 dark:border-stone-700 ${className}`}>
          <Clock className="w-3 h-3" />
          Nurture
        </span>
      );
    case 'disqualified':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 ${className}`}>
          <AlertCircle className="w-3 h-3" />
          Disqualified
        </span>
      );

    // Mode B Stages
    case 'discovery':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 ${className}`}>
          Discovery
        </span>
      );
    case 'proposal':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 border border-teal-400 dark:border-teal-700 ${className}`}>
          Proposal
        </span>
      );
    case 'negotiation':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-600 text-white ${className}`}>
          Negotiation
        </span>
      );
    case 'won':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-600 text-white shadow-xs ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Won
        </span>
      );
    case 'lost':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 ${className}`}>
          <XCircle className="w-3 h-3" />
          Lost
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-700 ${className}`}>
          {stage}
        </span>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({ priority, className = '' }) => {
  switch (priority) {
    case 'high':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 ${className}`}>
          <Flag className="w-3 h-3 fill-red-500 text-red-600 dark:text-red-400" />
          High
        </span>
      );
    case 'medium':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 ${className}`}>
          <Flag className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Medium
        </span>
      );
    case 'low':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 ${className}`}>
          <Flag className="w-3 h-3 text-stone-400" />
          Low
        </span>
      );
  }
};

export const ClassificationBadge: React.FC<{ classification: ActionClassification; className?: string }> = ({ classification, className = '' }) => {
  switch (classification) {
    case 'Verified':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Verified
        </span>
      );
    case 'AI Inference':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 ${className}`}>
          <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          AI Inference
        </span>
      );
    case 'AI Recommendation':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 ${className}`}>
          <Lightbulb className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          AI Recommendation
        </span>
      );
    case 'Unknown':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 ${className}`}>
          <HelpCircle className="w-3 h-3 text-stone-400" />
          Unknown
        </span>
      );
  }
};
