import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Building2, 
  Users, 
  Briefcase, 
  Play, 
  CheckSquare, 
  Plus, 
  ArrowRight,
  Settings,
  Flame,
  FileText
} from 'lucide-react';
import { AppStoreState } from '../../lib/storage';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppStoreState;
  onNavigate: (route: string, id?: string) => void;
  onOpenAskCaosWithPrompt?: (prompt: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  state,
  onNavigate,
  onOpenAskCaosWithPrompt,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : void 0;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAskMode = query.trim().endsWith('?') || query.toLowerCase().startsWith('ask') || query.toLowerCase().startsWith('why') || query.toLowerCase().startsWith('how');

  // Build searchable items
  const items: { id: string; category: string; title: string; subtitle?: string; icon: React.ReactNode; action: () => void }[] = [];

  // Default / Quick actions
  if (!query) {
    items.push({
      id: 'act-session',
      category: 'Actions',
      title: 'Start Daily Guided Session',
      subtitle: `Today's plan (${state.todayTimeBudgetMinutes}m budget)`,
      icon: <Play className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
      action: () => { onNavigate('session'); onClose(); },
    });
    items.push({
      id: 'act-new-org',
      category: 'Actions',
      title: 'Add New Organization / Prospect',
      subtitle: 'Create a new client prospect record',
      icon: <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
      action: () => { onNavigate('prospects', 'new'); onClose(); },
    });
    items.push({
      id: 'act-followups',
      category: 'Actions',
      title: 'Review Due Follow-ups',
      subtitle: `${state.sequenceStepInstances.filter(s => s.status === 'pending').length} sequence items pending`,
      icon: <Flame className="w-4 h-4 text-amber-600" />,
      action: () => { onNavigate('outreach'); onClose(); },
    });
    items.push({
      id: 'act-content',
      category: 'Actions',
      title: 'Open Authority & Content Planner',
      subtitle: 'Draft ideas and case studies',
      icon: <FileText className="w-4 h-4 text-purple-600" />,
      action: () => { onNavigate('content'); onClose(); },
    });
  }

  // Filter prospects
  state.organizations
    .filter(o => !o.deletedAt && (o.name.toLowerCase().includes(query.toLowerCase()) || o.city?.toLowerCase().includes(query.toLowerCase())))
    .slice(0, 5)
    .forEach(org => {
      items.push({
        id: `org-${org.id}`,
        category: 'Prospects',
        title: org.name,
        subtitle: `${org.city || ''} • Stage: ${org.stage} • Score: ${org.leadScore}`,
        icon: <Building2 className="w-4 h-4 text-stone-500" />,
        action: () => { onNavigate('prospect-detail', org.id); onClose(); },
      });
    });

  // Filter opportunities
  state.opportunities
    .filter(opp => opp.name.toLowerCase().includes(query.toLowerCase()) || opp.organizationName.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .forEach(opp => {
      items.push({
        id: `opp-${opp.id}`,
        category: 'Opportunities',
        title: opp.name,
        subtitle: `${opp.organizationName} • $${opp.estimatedValue} (${opp.stage})`,
        icon: <Briefcase className="w-4 h-4 text-teal-500" />,
        action: () => { onNavigate('opportunity-detail', opp.id); onClose(); },
      });
    });

  // If query is a question, add Ask CAOS prompt
  if (query.trim()) {
    items.unshift({
      id: 'ai-prompt',
      category: 'Ask CAOS AI',
      title: `Ask CAOS: "${query}"`,
      subtitle: 'Ask AI assistant to analyze or execute',
      icon: <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />,
      action: () => {
        if (onOpenAskCaosWithPrompt) {
          onOpenAskCaosWithPrompt(query);
        }
        onClose();
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Search input bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800">
          {isAskMode ? (
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3 shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-stone-400 mr-3 shrink-0" />
          )}
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search prospects, opportunities, or ask CAOS... (⌘K)"
            className="w-full text-base bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden"
          />
          <span className="text-[11px] font-mono text-stone-400 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded bg-stone-50 dark:bg-stone-800">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-stone-100 dark:divide-stone-800/50">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500">
              No results found for "{query}".
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id}
                onClick={item.action}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                  idx === selectedIndex
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">{item.icon}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-stone-400 truncate">{item.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">{item.category}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-2">
            <span>Navigate <kbd className="px-1 py-0.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">↑↓</kbd></span>
            <span>Select <kbd className="px-1 py-0.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">↵</kbd></span>
          </span>
          <span>Tip: End with '?' for AI answers</span>
        </div>
      </div>
    </div>
  );
};
