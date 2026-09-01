import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  ChevronDown, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Globe,
  Database,
  Users,
  Target,
  FileCheck,
  TrendingUp
} from 'lucide-react';
import { ResearchResult, ActionClassification } from '../../types';
import { ClassificationBadge } from '../ui/Badge';
import { AiMarking } from '../ui/AiMarking';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface ResearchResultViewProps {
  research: ResearchResult;
  history?: ResearchResult[];
  onRerunResearch: () => void;
  isLoading?: boolean;
}

export const ResearchResultView: React.FC<ResearchResultViewProps> = ({
  research,
  history = [],
  onRerunResearch,
  isLoading = false,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<number>(research?.version || 1);
  const [showRerunConfirm, setShowRerunConfirm] = useState(false);

  const displayResult = history.find((h) => h.version === selectedVersion) || research;

  const sections = [
    {
      title: '1. Organization Profile',
      icon: Building,
      content: displayResult.organizationProfile?.text,
      classification: displayResult.organizationProfile?.classification || 'Verified',
    },
    {
      title: '2. Digital Presence & Web Architecture',
      icon: Globe,
      content: displayResult.digitalPresence?.text,
      classification: displayResult.digitalPresence?.classification || 'Verified',
    },
    {
      title: '3. Existing Systems & Legacy Software',
      icon: Database,
      content: displayResult.existingSystems?.text,
      classification: displayResult.existingSystems?.classification || 'AI Inference',
    },
    {
      title: '4. Operational Pain Points & Bottlenecks',
      icon: AlertCircle,
      list: displayResult.painPoints,
      defaultClass: 'AI Inference' as ActionClassification,
    },
    {
      title: '5. Digitalization Opportunities',
      icon: Sparkles,
      list: displayResult.opportunities,
      defaultClass: 'AI Recommendation' as ActionClassification,
    },
    {
      title: '6. Relevant Consulting Services & Solutions',
      icon: TrendingUp,
      list: displayResult.relevantServices,
      defaultClass: 'AI Recommendation' as ActionClassification,
    },
    {
      title: '7. Key Stakeholders & Decision Makers',
      icon: Users,
      list: displayResult.decisionMakers,
      defaultClass: 'AI Inference' as ActionClassification,
    },
    {
      title: '8. Personalization Hooks & Context',
      icon: Target,
      content: displayResult.personalizationNotes?.text,
      classification: displayResult.personalizationNotes?.classification || 'AI Recommendation',
    },
    {
      title: '9. Lead Qualification & Fit Assessment',
      icon: FileCheck,
      content: displayResult.qualification?.text,
      suggestedScore: displayResult.qualification?.suggestedScore,
      classification: displayResult.qualification?.classification || 'AI Recommendation',
    },
    {
      title: '10. Recommended Acquisition Approach',
      icon: CheckCircle2,
      content: displayResult.recommendedApproach?.text,
      classification: displayResult.recommendedApproach?.classification || 'AI Recommendation',
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider font-mono text-stone-500">
            Structured Research
          </span>

          {/* Version Selector */}
          {history.length > 1 && (
            <div className="relative inline-flex items-center">
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(Number(e.target.value))}
                className="text-xs font-mono font-medium pl-2 pr-6 py-0.5 rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 appearance-none cursor-pointer"
              >
                {history.map((h) => (
                  <option key={h.version} value={h.version}>
                    Version {h.version} ({new Date(h.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-400 absolute right-1.5 pointer-events-none" />
            </div>
          )}

          <span className="text-[11px] text-stone-400">
            Generated {new Date(displayResult.createdAt).toLocaleDateString()}
          </span>
        </div>

        <button
          onClick={() => setShowRerunConfirm(true)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-purple-200 dark:border-purple-800/70 bg-purple-50/70 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>↻ Re-run Research (1 request)</span>
        </button>
      </div>

      {/* 10 Classified Sections */}
      <div className="space-y-4">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;

          return (
            <div
              key={idx}
              className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-stone-500 shrink-0" />
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {sec.title}
                  </h4>
                  {sec.suggestedScore && (
                    <span className="text-xs font-mono font-bold px-2 py-0.2 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      Score: {sec.suggestedScore}/100
                    </span>
                  )}
                </div>

                {sec.classification && (
                  <ClassificationBadge classification={sec.classification} />
                )}
              </div>

              {/* Single Text Block with 3-part AI Marking */}
              {sec.content && (
                <AiMarking className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  <p>{sec.content}</p>
                </AiMarking>
              )}

              {/* List items with individual badges */}
              {sec.list && (
                <div className="space-y-2">
                  {sec.list.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="pl-3 py-1.5 rounded-r-md border-l-2 border-purple-500 dark:border-purple-400 bg-purple-50/40 dark:bg-purple-950/10 flex items-start justify-between gap-3 text-xs"
                    >
                      <span className="text-stone-800 dark:text-stone-200 font-medium">
                        • {item.text}
                      </span>
                      {item.classification && (
                        <ClassificationBadge classification={item.classification} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cited Sources */}
      {displayResult.sources && displayResult.sources.length > 0 && (
        <div className="p-3.5 rounded-lg bg-stone-100/60 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 text-xs space-y-1.5">
          <p className="font-semibold text-stone-600 dark:text-stone-300">Verified Evidence & Sources:</p>
          <ul className="space-y-1">
            {displayResult.sources.map((src, i) => (
              <li key={i} className="flex items-center gap-1.5 text-stone-500">
                <ExternalLink className="w-3 h-3 text-stone-400" />
                <span>{src.claim} —</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 dark:text-teal-400 hover:underline truncate max-w-xs font-mono"
                >
                  {src.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirmation Dialog for Re-running Research */}
      <ConfirmDialog
        isOpen={showRerunConfirm}
        title="Re-run Organization Research?"
        description="This will execute a new Gemini Deep Research query against the target organization and create a new versioned entry (v2+). Previous results will be preserved."
        confirmLabel="Continue (1 AI Request)"
        onConfirm={() => {
          setShowRerunConfirm(false);
          onRerunResearch();
        }}
        onCancel={() => setShowRerunConfirm(false)}
      />
    </div>
  );
};
