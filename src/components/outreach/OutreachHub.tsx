import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  Linkedin, 
  FileText, 
  Clock, 
  Copy, 
  Check, 
  Flame, 
  Layers, 
  ChevronRight,
  Play,
  RotateCw,
  Edit2,
  Plus,
  Trash2,
  Edit,
  BookOpen,
  Search,
  SlidersHorizontal,
  ArrowRight,
  HelpCircle,
  Tag
} from 'lucide-react';
import { Organization, Contact, SequenceStepInstance, Playbook, FreelanceProfile } from '../../types';
import { AiMarking } from '../ui/AiMarking';
import { requestOutreach } from '../../lib/api';
import { PlaybookModal } from './PlaybookModal';

interface OutreachHubProps {
  organizations: Organization[];
  contacts: Contact[];
  sequences: SequenceStepInstance[];
  playbooks: Playbook[];
  profile?: FreelanceProfile;
  selectedOrgId?: string;
  onExecuteSequenceStep: (stepId: string) => void;
  onSkipSequenceStep: (stepId: string) => void;
  onLogOutreachSent: (orgId: string, channel: string, message: string, contactId?: string) => void;
  onAddPlaybook?: (pb: Partial<Playbook>) => void;
  onUpdatePlaybook?: (id: string, patch: Partial<Playbook>) => void;
  onDeletePlaybook?: (id: string) => void;
}

export const OutreachHub: React.FC<OutreachHubProps> = ({
  organizations,
  contacts,
  sequences,
  playbooks,
  profile,
  selectedOrgId,
  onExecuteSequenceStep,
  onSkipSequenceStep,
  onLogOutreachSent,
  onAddPlaybook,
  onUpdatePlaybook,
  onDeletePlaybook,
}) => {
  const [activeTab, setActiveTab] = useState<'composer' | 'queue' | 'playbooks'>('composer');

  // Composer Form State
  const [targetOrgId, setTargetOrgId] = useState(selectedOrgId || organizations[0]?.id || '');
  const [targetContactId, setTargetContactId] = useState('');
  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'linkedin' | 'formal_letter'>('email');
  const [angle, setAngle] = useState('Digital Portal & Examination Modernization');
  const [tone, setTone] = useState<'formal' | 'consultative' | 'concise' | 'visionary'>('consultative');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [isGenerating, setIsGenerating] = useState(false);

  // Playbook Management State
  const [playbookModalOpen, setPlaybookModalOpen] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState<Playbook | null>(null);
  const [playbookFilter, setPlaybookFilter] = useState<string>('all');
  const [playbookSearch, setPlaybookSearch] = useState<string>('');
  const [copiedPlaybookId, setCopiedPlaybookId] = useState<string | null>(null);

  // Draft state with AI marking
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [subjectLine, setSubjectLine] = useState('');
  const [isUserEdited, setIsUserEdited] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const selectedOrg = organizations.find((o) => o.id === targetOrgId);
  const orgContacts = contacts.filter((c) => c.organizationId === targetOrgId);
  const selectedContact = contacts.find((c) => c.id === targetContactId);

  const pendingSequences = sequences.filter((s) => s.status === 'pending');

  const filteredPlaybooks = playbooks.filter((pb) => {
    if (playbookFilter !== 'all' && pb.workflowType !== playbookFilter) return false;
    if (playbookSearch.trim()) {
      const q = playbookSearch.toLowerCase();
      return (
        pb.name.toLowerCase().includes(q) ||
        pb.instructions.toLowerCase().includes(q) ||
        (pb.industryScope && pb.industryScope.toLowerCase().includes(q)) ||
        pb.workflowType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreatePlaybook = () => {
    setEditingPlaybook(null);
    setPlaybookModalOpen(true);
  };

  const handleOpenEditPlaybook = (pb: Playbook) => {
    setEditingPlaybook(pb);
    setPlaybookModalOpen(true);
  };

  const handleSavePlaybook = (playbookData: Partial<Playbook>) => {
    if (editingPlaybook && onUpdatePlaybook) {
      onUpdatePlaybook(editingPlaybook.id, playbookData);
    } else if (onAddPlaybook) {
      onAddPlaybook(playbookData);
    }
  };

  const handleDeletePlaybookClick = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the playbook template "${name}"?`)) {
      if (onDeletePlaybook) {
        onDeletePlaybook(id);
      }
    }
  };

  const handleUsePlaybookInComposer = (pb: Playbook) => {
    if (pb.tone) {
      const lower = pb.tone.toLowerCase();
      if (lower.includes('formal')) setTone('formal');
      else if (lower.includes('concise') || lower.includes('direct')) setTone('concise');
      else if (lower.includes('visionary')) setTone('visionary');
      else setTone('consultative');
    }
    setAngle(`${pb.name}: ${pb.instructions}`);
    setActiveTab('composer');
    setCopiedPlaybookId(pb.id);
    setTimeout(() => setCopiedPlaybookId(null), 2500);
  };

  const handleDuplicatePlaybook = (pb: Playbook) => {
    if (onAddPlaybook) {
      onAddPlaybook({
        name: `${pb.name} (Copy)`,
        workflowType: pb.workflowType,
        industryScope: pb.industryScope,
        instructions: pb.instructions,
        tone: pb.tone,
        rulesToFollow: [...(pb.rulesToFollow || [])],
        thingsToAvoid: [...(pb.thingsToAvoid || [])],
        examples: [...(pb.examples || [])],
        version: 1,
        isActive: true,
      });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    setIsGenerating(true);
    setIsUserEdited(false);

    try {
      const res = await requestOutreach({
        organization: selectedOrg,
        contact: selectedContact,
        profile: profile || {
          name: 'Alexandre Vane',
          businessName: 'Vane Digital Systems',
          niche: 'Higher Education Digitalization',
        },
        channel,
        tone,
        userInstruction: `Focus angle: ${angle}. Language: ${language === 'fr' ? 'French' : 'English'}.`,
      });

      setSubjectLine(res.data?.subjectLine || 'Modernization Partnership Inquiry');
      setGeneratedDraft(res.data?.draft || res.data?.body || 'Dear Leadership...');
    } catch (err: any) {
      setGeneratedDraft(`Hello ${selectedContact?.name || 'Leadership'},\n\nI am writing to share our recent work in digital transformation for institutions in ${selectedOrg.city || 'the region'}. Given your focus on student excellence, we would appreciate 15 minutes to demonstrate our campus integration software.\n\nBest regards,\nCAOS Solutions`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = channel === 'email' && subjectLine ? `Subject: ${subjectLine}\n\n${generatedDraft}` : generatedDraft || '';
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRecordSent = () => {
    if (!targetOrgId || !generatedDraft) return;
    onLogOutreachSent(targetOrgId, channel, generatedDraft, targetContactId || undefined);
    alert('Outreach logged successfully to timeline!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Outreach & Follow-up Sequences
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Hyper-personalized multi-channel messaging backed by AI research
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingSequences.length > 0 && (
            <div className="px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingSequences.length} follow-ups in queue</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 text-xs font-semibold border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveTab('composer')}
          className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'composer'
              ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          ✨ AI Outreach Composer
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'queue'
              ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Follow-up Sequence Queue ({pendingSequences.length})
        </button>
        <button
          onClick={() => setActiveTab('playbooks')}
          className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'playbooks'
              ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Playbook Templates ({playbooks.length})
        </button>
      </div>

      {/* Tab 1: Composer */}
      {activeTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Configure Outreach Parameters</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Target Organization *</label>
                <select
                  value={targetOrgId}
                  onChange={(e) => {
                    setTargetOrgId(e.target.value);
                    setTargetContactId('');
                  }}
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
                >
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.city || 'Cameroon'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Recipient Contact (Optional)</label>
                <select
                  value={targetContactId}
                  onChange={(e) => setTargetContactId(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
                >
                  <option value="">General Leadership / Dean's Office</option>
                  {orgContacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.jobTitle ? `(${c.jobTitle})` : ''} {c.isDecisionMaker ? '★' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp Direct</option>
                    <option value="linkedin">LinkedIn InMail</option>
                    <option value="formal_letter">Formal Institutional Letter</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer"
                  >
                    <option value="en">English (Official)</option>
                    <option value="fr">French (Français officiel)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Value Proposition Angle</label>
                <input
                  type="text"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  placeholder="e.g. Student Portal, Offline Exams, Tuition Analytics..."
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Tone</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(['consultative', 'formal', 'concise', 'visionary'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`px-2.5 py-1.5 rounded text-xs capitalize text-left border transition-colors ${
                        tone === t
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 px-4 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating Draft...' : '✨ Generate Outreach Draft'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: AI Marked Draft Workspace */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Draft Workspace
              </h3>
              {generatedDraft && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 text-xs font-medium rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleRecordSent}
                    className="px-3 py-1 text-xs font-medium rounded bg-teal-600 hover:bg-teal-700 text-white shadow-2xs cursor-pointer"
                  >
                    Record as Sent
                  </button>
                </div>
              )}
            </div>

            {generatedDraft ? (
              <div className="space-y-3">
                {channel === 'email' && (
                  <div>
                    <label className="text-xs font-medium text-stone-500">Subject Line</label>
                    <input
                      type="text"
                      value={subjectLine}
                      onChange={(e) => {
                        setSubjectLine(e.target.value);
                        setIsUserEdited(true);
                      }}
                      className="w-full mt-1 px-3 py-1.5 text-sm font-medium rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                    />
                  </div>
                )}

                {/* 3-part AI marking with fade-out on edit */}
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-200 dark:border-stone-700/50">
                  <button 
                    type="button"
                    onClick={() => {
                      const prefix = channel === 'whatsapp' ? '*' : '**';
                      setGeneratedDraft(prev => prev + ` ${prefix}bold text${prefix} `);
                      setIsUserEdited(true);
                    }}
                    className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-400 font-serif font-bold text-sm"
                    title="Bold"
                  >
                    B
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const prefix = channel === 'whatsapp' ? '_' : '*';
                      setGeneratedDraft(prev => prev + ` ${prefix}italic text${prefix} `);
                      setIsUserEdited(true);
                    }}
                    className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-400 font-serif italic text-sm"
                    title="Italic"
                  >
                    I
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const prefix = channel === 'whatsapp' ? '~' : '~~';
                      setGeneratedDraft(prev => prev + ` ${prefix}strikethrough${prefix} `);
                      setIsUserEdited(true);
                    }}
                    className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded text-stone-600 dark:text-stone-400 font-serif line-through text-sm"
                    title="Strikethrough"
                  >
                    S
                  </button>
                  <div className="w-px h-4 bg-stone-300 dark:bg-stone-600 mx-1" />
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                    {channel === 'whatsapp' ? 'WhatsApp Formatting Active' : 'Email Markdown Active'}
                  </span>
                </div>
                <AiMarking isAiMarked={!isUserEdited}>
                  <textarea
                    rows={12}
                    value={generatedDraft}
                    onChange={(e) => {
                      setGeneratedDraft(e.target.value);
                      setIsUserEdited(true);
                    }}
                    className="w-full bg-transparent text-sm leading-relaxed focus:outline-hidden resize-y font-sans text-stone-900 dark:text-stone-100"
                  />
                </AiMarking>

                <p className="text-[11px] text-stone-400 italic">
                  {isUserEdited
                    ? 'Edited by user. Ready to dispatch.'
                    : 'AI-generated draft. Feel free to edit or personalize before sending.'}
                </p>
              </div>
            ) : (
              <div className="text-center py-16 text-stone-400 space-y-2">
                <Send className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700" />
                <p className="text-xs">Configure your parameters on the left and click Generate.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Follow-up Queue */}
      {activeTab === 'queue' && (
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Pending Follow-up Actions ({pendingSequences.length})
            </h3>
            <span className="text-xs text-stone-400">
              Never let high-value institutional conversations go cold
            </span>
          </div>

          {pendingSequences.length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-400">
              ✓ All follow-up queues are clear. Good work!
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {pendingSequences.map((seq) => {
                const org = organizations.find((o) => o.id === seq.organizationId);
                const isOverdue = new Date(seq.dueDate) < new Date();

                return (
                  <div key={seq.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                          {org?.name || 'Prospect'}
                        </span>
                        <span className="text-xs font-mono uppercase px-2 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          Touch #{seq.stepIndex} ({seq.channel})
                        </span>
                        {isOverdue && (
                          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500">
                        Due: {new Date(seq.dueDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSkipSequenceStep(seq.id)}
                        className="px-3 py-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                      >
                        Skip
                      </button>
                      <button
                        onClick={() => onExecuteSequenceStep(seq.id)}
                        className="px-3.5 py-1 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white shadow-2xs"
                      >
                        ✓ Mark Completed
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Playbooks */}
      {activeTab === 'playbooks' && (
        <div className="space-y-4">
          {/* Action Bar & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={playbookSearch}
                  onChange={(e) => setPlaybookSearch(e.target.value)}
                  placeholder="Search playbooks..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 w-48 sm:w-64 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {[
                  { id: 'all', label: 'All Workflows' },
                  { id: 'outreach', label: 'Outreach' },
                  { id: 'followup', label: 'Follow-up' },
                  { id: 'research', label: 'Research' },
                  { id: 'proposal', label: 'Proposal' },
                  { id: 'content', label: 'Content' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPlaybookFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      playbookFilter === tab.id
                        ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleOpenCreatePlaybook}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-stone-950 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Playbook Template</span>
            </button>
          </div>

          {/* Playbooks Grid */}
          {filteredPlaybooks.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No playbooks found</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {playbookSearch ? 'Try a different search query or filter.' : 'Create your first playbook template to guide AI generation.'}
                </p>
              </div>
              <button
                onClick={handleOpenCreatePlaybook}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Playbook</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlaybooks.map((pb) => (
                <div
                  key={pb.id}
                  className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-500/40 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{pb.name}</h4>
                          {pb.version && (
                            <span className="text-[10px] font-mono text-stone-400">v{pb.version}</span>
                          )}
                        </div>
                        {pb.industryScope && (
                          <span className="inline-block mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                            Scope: {pb.industryScope}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-semibold whitespace-nowrap">
                        {pb.workflowType}
                      </span>
                    </div>

                    {/* Tone info */}
                    {pb.tone && (
                      <div className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800/40 px-2.5 py-1 rounded">
                        <span className="font-semibold text-stone-500">Tone:</span>
                        <span>{pb.tone}</span>
                      </div>
                    )}

                    {/* System Instructions */}
                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3">
                      {pb.instructions}
                    </p>

                    {/* Rules to follow */}
                    {pb.rulesToFollow && pb.rulesToFollow.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1 text-xs text-stone-600 dark:text-stone-400">
                        <p className="font-semibold text-[11px] text-stone-500">Strategic Rules ({pb.rulesToFollow.length}):</p>
                        {pb.rulesToFollow.slice(0, 2).map((rule, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                            <span className="line-clamp-1">{rule}</span>
                          </div>
                        ))}
                        {pb.rulesToFollow.length > 2 && (
                          <span className="text-[11px] text-stone-400 italic">+{pb.rulesToFollow.length - 2} more rules</span>
                        )}
                      </div>
                    )}

                    {/* Things to Avoid */}
                    {pb.thingsToAvoid && pb.thingsToAvoid.length > 0 && (
                      <div className="pt-1 space-y-1 text-xs text-stone-600 dark:text-stone-400">
                        <p className="font-semibold text-[11px] text-red-600/80 dark:text-red-400/80">Negative Constraints ({pb.thingsToAvoid.length}):</p>
                        {pb.thingsToAvoid.slice(0, 1).map((avoid, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-red-500 font-bold">✕</span>
                            <span className="line-clamp-1">{avoid}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditPlaybook(pb)}
                        className="px-2.5 py-1 text-xs font-medium rounded text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                        title="Edit template instructions and rules"
                      >
                        <Edit className="w-3.5 h-3.5 text-stone-500" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDuplicatePlaybook(pb)}
                        className="px-2.5 py-1 text-xs font-medium rounded text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1 cursor-pointer"
                        title="Duplicate this template"
                      >
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Clone</span>
                      </button>

                      <button
                        onClick={() => handleDeletePlaybookClick(pb.id, pb.name)}
                        className="p-1 text-xs rounded text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title="Delete playbook template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleUsePlaybookInComposer(pb)}
                      className="px-3 py-1 text-xs font-semibold rounded bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Load into AI Outreach Composer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{copiedPlaybookId === pb.id ? 'Loaded in Composer!' : 'Use in Composer'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playbook Edit/Add Modal */}
      <PlaybookModal
        isOpen={playbookModalOpen}
        onClose={() => {
          setPlaybookModalOpen(false);
          setEditingPlaybook(null);
        }}
        onSave={handleSavePlaybook}
        initialPlaybook={editingPlaybook}
      />
    </div>
  );
};
