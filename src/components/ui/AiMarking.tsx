import React from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';

interface AiMarkingProps {
  isAiMarked?: boolean;
  badgeLabel?: string;
  badgeType?: 'default' | 'inference' | 'recommendation';
  children: React.ReactNode;
  className?: string;
}

export const AiMarking: React.FC<AiMarkingProps> = ({
  isAiMarked = true,
  badgeLabel,
  badgeType = 'default',
  children,
  className = '',
}) => {
  if (!isAiMarked) {
    return <div className={`transition-all duration-300 ${className}`}>{children}</div>;
  }

  let label = badgeLabel;
  let icon = <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />;

  if (!label) {
    if (badgeType === 'inference') {
      label = 'AI Inference';
    } else if (badgeType === 'recommendation') {
      label = 'AI Recommendation';
      icon = <Lightbulb className="w-3 h-3 text-purple-600 dark:text-purple-400" />;
    } else {
      label = 'AI-generated — review before acting';
    }
  }

  return (
    <div
      className={`relative pl-4 pr-3 py-3 rounded-r-md border-l-[3px] border-purple-600 dark:border-purple-400 bg-purple-50/60 dark:bg-purple-950/20 text-stone-900 dark:text-stone-100 transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium tracking-tight bg-purple-100/80 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-700/50 shadow-2xs">
          {icon}
          {label}
        </span>
      </div>
      {children}
    </div>
  );
};
