import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  BookOpen, 
  Check, 
  AlertCircle, 
  FileText,
  Sliders
} from 'lucide-react';
import { Playbook } from '../../types';

interface PlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playbookData: Partial<Playbook>) => void;
  initialPlaybook?: Playbook | null;
}

export const PlaybookModal: React.FC<PlaybookModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlaybook,
}) => {
  const [name, setName] = useState('');
  const [workflowType, setWorkflowType] = useState<Playbook['workflowType']>('outreach');
  const [industryScope, setIndustryScope] = useState('');
  const [tone, setTone] = useState('Consultative, respectful, peer-level technical advisor');
  const [instructions, setInstructions] = useState('');
  const [rules, setRules] = useState<string[]>([]);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [avoidList, setAvoidList] = useState<string[]>([]);
  const [newAvoidInput, setNewAvoidInput] = useState('');
  const [examples, setExamples] = useState<{ inputContext?: string; desiredOutput: string }[]>([]);
  const [newExampleInput, setNewExampleInput] = useState('');
  const [newExampleOutput, setNewExampleOutput] = useState('');
  const [showAddExample, setShowAddExample] = useState(false);

  useEffect(() => {
    if (initialPlaybook) {
      setName(initialPlaybook.name);
      setWorkflowType(initialPlaybook.workflowType);
      setIndustryScope(initialPlaybook.industryScope || '');
      setTone(initialPlaybook.tone || 'Consultative, respectful');
      setInstructions(initialPlaybook.instructions || '');
      setRules(initialPlaybook.rulesToFollow || []);
      setAvoidList(initialPlaybook.thingsToAvoid || []);
      setExamples(initialPlaybook.examples || []);
    } else {
      setName('');
      setWorkflowType('outreach');
      setIndustryScope('Higher Education');
      setTone('Consultative, respectful, peer-level technical advisor');
      setInstructions('');
      setRules([
        'Reference their specific city or institution in the first paragraph',
        'Ask a single frictionless question at the end to invite discussion'
      ]);
      setAvoidList([
        'Do not pitch generic software packages in the first message'
      ]);
      setExamples([]);
    }
  }, [initialPlaybook, isOpen]);

  if (!isOpen) return null;

  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setRules([...rules, newRuleInput.trim()]);
    setNewRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleAddAvoid = () => {
    if (!newAvoidInput.trim()) return;
    setAvoidList([...avoidList, newAvoidInput.trim()]);
    setNewAvoidInput('');
  };

  const handleRemoveAvoid = (index: number) => {
    setAvoidList(avoidList.filter((_, i) => i !== index));
  };

  const handleAddExample = () => {
    if (!newExampleOutput.trim()) return;
    setExamples([
      ...examples,
      { inputContext: newExampleInput.trim() || undefined, desiredOutput: newExampleOutput.trim() }
    ]);
    setNewExampleInput('');
    setNewExampleOutput('');
    setShowAddExample(false);
  };

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialPlaybook?.id,
      name: name.trim(),
      workflowType,
      industryScope: industryScope.trim() || undefined,
      tone: tone.trim(),
      instructions: instructions.trim(),
      rulesToFollow: rules,
      thingsToAvoid: avoidList,
      examples,
      version: (initialPlaybook?.version || 0) + 1,
      isActive: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {initialPlaybook ? 'Edit Playbook Template' : 'Create New Playbook Template'}
              </h2>
              <p className="text-xs text-stone-500">
                Define reusable instructions, tone guidelines, and strategic rules for AI workflows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form id="playbook-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Playbook Template Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Higher Education Admissions Outreach"
                className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Workflow Category *
              </label>
              <select
                value={workflowType}
                onChange={(e) => setWorkflowType(e.target.value as Playbook['workflowType'])}
                className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="outreach">Outreach (Cold & Initial Messages)</option>
                <option value="followup">Follow-up Sequences</option>
                <option value="research">Account & Institutional Research</option>
                <option value="discovery">Discovery & Diagnostic Questions</option>
                <option value="proposal">Formal Proposals & Commercial Terms</option>
                <option value="content">Authority & Thought Leadership</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Industry Scope / Target Niche
              </label>
              <input
                type="text"
                value={industryScope}
                onChange={(e) => setIndustryScope(e.target.value)}
                placeholder="e.g. Higher Education, HealthTech, Enterprise"
                className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tone & Style */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Communication Tone & Voice
            </label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. Consultative, respectful, peer-level technical advisor"
              className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Core System Instructions */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Core Prompt Instructions & Strategy *
            </label>
            <textarea
              rows={3}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Detailed instructions for the AI engine. Describe the narrative structure, objective, key questions to surface, or ROI metrics to emphasize..."
              className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Strategic Rules To Follow */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Rules & Strategy to Enforce ({rules.length})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRuleInput}
                onChange={(e) => setNewRuleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
                placeholder="Add a rule (e.g. Keep email under 120 words)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {rules.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/60 text-xs text-stone-700 dark:text-stone-300"
                  >
                    <div className="flex items-start gap-1.5">
                      <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                      <span>{rule}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="text-stone-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Things to Avoid */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Negative Constraints / Things to Avoid ({avoidList.length})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAvoidInput}
                onChange={(e) => setNewAvoidInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAvoid();
                  }
                }}
                placeholder="Add negative constraint (e.g. Do not sound salesy or use jargon)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddAvoid}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {avoidList.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {avoidList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/60 text-xs text-stone-700 dark:text-stone-300"
                  >
                    <div className="flex items-start gap-1.5">
                      <span className="text-red-600 dark:text-red-400 font-bold">✕</span>
                      <span>{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAvoid(idx)}
                      className="text-stone-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Few-Shot Output Examples */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Few-Shot Reference Examples ({examples.length})
              </label>
              {!showAddExample && (
                <button
                  type="button"
                  onClick={() => setShowAddExample(true)}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Example</span>
                </button>
              )}
            </div>

            {showAddExample && (
              <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Input Context / Scenario (Optional)
                  </label>
                  <input
                    type="text"
                    value={newExampleInput}
                    onChange={(e) => setNewExampleInput(e.target.value)}
                    placeholder="e.g. Dean of Sciences struggling with exam grading bottlenecks"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Desired Output / Ideal Message Sample *
                  </label>
                  <textarea
                    rows={3}
                    value={newExampleOutput}
                    onChange={(e) => setNewExampleOutput(e.target.value)}
                    placeholder="Provide the ideal draft or answer snippet that the AI should mimic..."
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddExample(false)}
                    className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="px-3 py-1 text-xs font-semibold rounded bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Save Example
                  </button>
                </div>
              </div>
            )}

            {examples.length > 0 && (
              <div className="space-y-2">
                {examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 text-xs space-y-1 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(idx)}
                      className="absolute top-2 right-2 text-stone-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {ex.inputContext && (
                      <div className="text-[11px] font-medium text-stone-500">
                        Context: <span className="text-stone-700 dark:text-stone-300">{ex.inputContext}</span>
                      </div>
                    )}
                    <div className="text-stone-800 dark:text-stone-200 whitespace-pre-wrap font-sans text-xs">
                      {ex.desiredOutput}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="playbook-form"
            className="px-4 py-2 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{initialPlaybook ? 'Update Playbook' : 'Create Playbook'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
