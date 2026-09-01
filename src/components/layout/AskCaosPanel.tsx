import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  ArrowRight, 
  CornerDownLeft, 
  Loader2, 
  Tag, 
  CheckCircle2, 
  Play,
  Flame,
  Building2
} from 'lucide-react';
import { AppStoreState } from '../../lib/storage';
import { requestCommand, STORAGE_KEY_GEMINI_MODEL } from '../../lib/api';
import { AVAILABLE_MODELS, getModelMeta } from '../../lib/models';
import { AiMarking } from '../ui/AiMarking';

interface AskCaosPanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppStoreState;
  contextAnchor?: { type: string; id: string; name: string } | null;
  onClearContext?: () => void;
  onNavigate: (route: string, id?: string) => void;
  initialPrompt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actionChips?: { type: string; label: string; payload?: any; target?: string }[];
  timestamp: string;
}

export const AskCaosPanel: React.FC<AskCaosPanelProps> = ({
  isOpen,
  onClose,
  state,
  contextAnchor,
  onClearContext,
  onNavigate,
  initialPrompt,
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('auto');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: "Good day. I'm CAOS, your client acquisition co-pilot. How can I assist your pipeline today?",
      actionChips: [
        { type: 'NAVIGATE', label: 'What should I do today?', payload: 'What should I prioritize today?' },
        { type: 'NAVIGATE', label: 'Which prospects need attention?', payload: 'Which prospects need attention?' },
        { type: 'NAVIGATE', label: 'Summarize pipeline value', payload: 'Summarize my pipeline value' },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) || 'auto';
      setCurrentModel(saved);
    }
  }, [isOpen]);

  const handleModelChange = (newModel: string) => {
    setCurrentModel(newModel);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_GEMINI_MODEL, newModel);
    }
  };

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build CRM snapshot for accurate context
      const crmSnapshot = {
        prospectsCount: state.organizations.filter((o) => !o.deletedAt).length,
        activeOppsCount: state.opportunities.filter((o) => o.stage !== 'won' && o.stage !== 'lost').length,
        pipelineValue: state.opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0),
        overdueCount: state.sequenceStepInstances.filter((s) => s.status === 'pending' && new Date(s.dueDate) < new Date()).length,
        tasksDueToday: state.tasks.filter((t) => t.status === 'pending').length,
        topUrgent: state.organizations.slice(0, 3).map((o) => ({ name: o.name, stage: o.stage, score: o.leadScore })),
      };

      const res = await requestCommand({
        query: q.trim(),
        context: contextAnchor ? { scope: `${contextAnchor.type}: ${contextAnchor.name}`, id: contextAnchor.id } : { scope: 'General' },
        crmSnapshot,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.data?.narrative || 'Action processed.',
        actionChips: res.data?.actionChips || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Unable to process request: ${err.message || 'Network error'}. You can still use manual CRM controls.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip: any) => {
    if (chip.target) {
      onNavigate(chip.target.replace('/', ''));
    } else if (chip.payload) {
      handleSend(chip.payload);
    } else if (chip.type === 'START_SESSION') {
      onNavigate('session');
    } else if (chip.type === 'FOLLOW_UPS') {
      onNavigate('outreach');
    } else if (chip.type === 'NEW_PROSPECT') {
      onNavigate('prospects', 'new');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 max-w-full bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/80 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              Ask CAOS
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                AI Copilot
              </span>
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Context Scope & Model Selector Bar */}
      <div className="px-4 py-2 bg-stone-100/60 dark:bg-stone-800/40 border-b border-stone-200 dark:border-stone-800 flex flex-col gap-1.5 text-xs text-stone-500">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 truncate">
            <Tag className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="text-stone-400">Context:</span>
            <span className="font-medium text-stone-700 dark:text-stone-200 truncate">
              {contextAnchor ? `${contextAnchor.type}: ${contextAnchor.name}` : 'General Pipeline'}
            </span>
          </span>
          {contextAnchor && onClearContext && (
            <button
              onClick={onClearContext}
              className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline shrink-0 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 dark:border-stone-700/50 text-[11px]">
          <span className="text-stone-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>Model:</span>
          </span>
          <select
            value={currentModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="text-[11px] bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5 text-stone-800 dark:text-stone-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-purple-500 max-w-[200px] truncate cursor-pointer"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            {m.sender === 'user' ? (
              <div className="max-w-[85%] px-3.5 py-2.5 rounded-lg bg-teal-600 text-white text-sm shadow-xs">
                {m.text}
              </div>
            ) : (
              <div className="w-full">
                <AiMarking className="text-sm leading-relaxed">
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </AiMarking>

                {/* Inline Action Chips */}
                {m.actionChips && m.actionChips.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 pl-4">
                    {m.actionChips.map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => handleChipClick(chip)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors shadow-2xs"
                      >
                        <ArrowRight className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <span className="text-[10px] text-stone-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 pl-4 py-2 text-xs text-purple-600 dark:text-purple-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>✨ Thinking & analyzing CRM...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask CAOS anything..."
            className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-1.5 rounded text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 disabled:opacity-30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="mt-1.5 text-[11px] text-center text-stone-400">
          AI prepares, human decides • Press ⌘J to toggle
        </p>
      </div>
    </div>
  );
};
