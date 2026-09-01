import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  Send, 
  Edit3, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Layers, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Download, 
  MessageSquare, 
  Phone, 
  Mail, 
  UserCheck, 
  ExternalLink,
  Save
} from 'lucide-react';
import { 
  Opportunity, 
  Organization, 
  Contact, 
  Activity, 
  CustomFieldDefinition, 
  FreelanceProfile, 
  Playbook 
} from '../../types';
import { requestProposal } from '../../lib/api';
import { AiMarking } from '../ui/AiMarking';

interface OpportunityDetailProps {
  opportunity: Opportunity;
  organization?: Organization;
  contacts: Contact[];
  activities: Activity[];
  customFields?: CustomFieldDefinition[];
  profile?: FreelanceProfile;
  playbooks?: Playbook[];
  onUpdateOpp: (oppId: string, patch: Partial<Opportunity>) => void;
  onDeleteOpp: (oppId: string) => void;
  onLogActivity: (activity: Partial<Activity>) => void;
  onNavigateToOrg: (orgId: string) => void;
  onBack: () => void;
}

const STAGES: { id: Opportunity['stage']; name: string; defaultProb: number }[] = [
  { id: 'discovery', name: 'Discovery', defaultProb: 10 },
  { id: 'proposal', name: 'Proposal', defaultProb: 40 },
  { id: 'negotiation', name: 'Negotiation', defaultProb: 70 },
  { id: 'won', name: 'Won', defaultProb: 100 },
  { id: 'lost', name: 'Lost', defaultProb: 0 },
];

export const OpportunityDetail: React.FC<OpportunityDetailProps> = ({
  opportunity,
  organization,
  contacts,
  activities,
  customFields = [],
  profile,
  playbooks = [],
  onUpdateOpp,
  onDeleteOpp,
  onLogActivity,
  onNavigateToOrg,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'discovery' | 'solution' | 'proposal' | 'activities'>('overview');

  // Core Form State
  const [name, setName] = useState(opportunity.name);
  const [description, setDescription] = useState(opportunity.description || '');
  const [stage, setStage] = useState<Opportunity['stage']>(opportunity.stage);
  const [estimatedValue, setEstimatedValue] = useState(opportunity.estimatedValue || 0);
  const [recurringValue, setRecurringValue] = useState(opportunity.recurringValue || 0);
  const [probability, setProbability] = useState(opportunity.probability ?? 50);
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    opportunity.expectedCloseDate ? opportunity.expectedCloseDate.slice(0, 10) : ''
  );
  const [nextAction, setNextAction] = useState(opportunity.nextAction || '');
  const [nextActionDate, setNextActionDate] = useState(
    opportunity.nextActionDate ? opportunity.nextActionDate.slice(0, 10) : ''
  );
  const [notes, setNotes] = useState(opportunity.notes || '');

  // Discovery Matrix State
  const [discovery, setDiscovery] = useState(opportunity.discoveryNotes || {
    questions: '',
    painPoints: '',
    goals: '',
    requirements: '',
    budget: '',
    timeline: '',
    decisionMakers: '',
    objections: '',
    nextSteps: ''
  });

  // Solution Architecture State
  const [solution, setSolution] = useState(opportunity.solutionDraft || {
    version: 1,
    problem: '',
    proposedSolution: '',
    features: ['Modular Web Portal', 'Automated Payment Webhook', 'Administrative Reporting Dashboard'],
    architectureApproach: '',
    deliverables: ['Web Application Source Code', 'Admin Management Panel', 'Staff Training & User Manual'],
    timeline: '4-6 weeks rollout',
    pricing: `$${opportunity.estimatedValue || 7500} fixed milestone fee`,
    createdAt: new Date().toISOString()
  });

  // Proposal State
  const [proposal, setProposal] = useState(opportunity.proposalDraft || {
    version: 1,
    status: 'draft' as const,
    content: `PROPOSAL: ${opportunity.name}\n\nPREPARED FOR: ${opportunity.organizationName}\n\n1. EXECUTIVE SUMMARY\nModernization of institutional processes to eliminate manual registration friction.\n\n2. DELIVERABLES\n- Online student and admissions portal\n- Automated payment verification gateway\n- Comprehensive administrative console\n\n3. TIMELINE & TERMS\nTotal investment: $${opportunity.estimatedValue || 7500}\nTimeline: 6 weeks`,
    createdAt: new Date().toISOString()
  });

  // Feature / Deliverable Tag Input state
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newDeliverableInput, setNewDeliverableInput] = useState('');

  // AI Generation State
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [proposalAngle, setProposalAngle] = useState('Emphasize instant ROI and elimination of manual registration queues');
  const [isCopied, setIsCopied] = useState(false);
  const [isSavedFlash, setIsSavedFlash] = useState(false);

  // Quick Activity Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [activityType, setActivityType] = useState<Activity['activityType']>('meeting');
  const [activityChannel, setActivityChannel] = useState('In-Person / Video Call');
  const [activityContent, setActivityContent] = useState('');
  const [activityOutcome, setActivityOutcome] = useState('');

  const weightedValue = Math.round(estimatedValue * (probability / 100));

  const handleSaveAll = () => {
    onUpdateOpp(opportunity.id, {
      name: name.trim(),
      description: description.trim(),
      stage,
      estimatedValue: Number(estimatedValue),
      recurringValue: Number(recurringValue),
      probability: Number(probability),
      weightedValue,
      expectedCloseDate: expectedCloseDate || undefined,
      nextAction: nextAction.trim() || undefined,
      nextActionDate: nextActionDate || undefined,
      notes: notes.trim() || undefined,
      discoveryNotes: {
        ...discovery,
        updatedAt: new Date().toISOString(),
      },
      solutionDraft: {
        ...solution,
        pricing: solution.pricing || `$${estimatedValue} milestone package`,
      },
      proposalDraft: proposal,
    });

    setIsSavedFlash(true);
    setTimeout(() => setIsSavedFlash(false), 2500);
  };

  const handleStageChange = (newStage: Opportunity['stage']) => {
    setStage(newStage);
    const stageMeta = STAGES.find((s) => s.id === newStage);
    if (stageMeta) {
      setProbability(stageMeta.defaultProb);
    }
  };

  const handleGenerateAIProposal = async () => {
    setIsGeneratingProposal(true);
    try {
      const response = await requestProposal({
        opportunity: {
          ...opportunity,
          name,
          estimatedValue,
          recurringValue,
        },
        organization,
        profile,
        discoveryNotes: discovery,
        angle: proposalAngle,
      });

      if (response.success && response.data) {
        const data = response.data;
        if (data.proposalContent) {
          setProposal((prev) => ({
            ...prev,
            content: data.proposalContent,
            version: (prev?.version || 1) + 1,
            status: 'draft',
          }));
        }
        if (data.features && Array.isArray(data.features)) {
          setSolution((prev) => ({
            ...prev,
            features: data.features,
            deliverables: data.deliverables || prev.deliverables,
            timeline: data.timeline || prev.timeline,
            problem: data.problemSummary || prev.problem,
            proposedSolution: data.proposedSolution || prev.proposedSolution,
            architectureApproach: data.architectureApproach || prev.architectureApproach,
          }));
        }
        setActiveTab('proposal');
      }
    } catch (err) {
      console.error('Failed to generate proposal with AI:', err);
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const handleCopyProposal = () => {
    if (!proposal?.content) return;
    navigator.clipboard.writeText(proposal.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadProposal = () => {
    if (!proposal?.content) return;
    const blob = new Blob([proposal.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${opportunity.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_proposal.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkProposalSent = () => {
    const updated = {
      ...proposal,
      status: 'sent' as const,
      sentAt: new Date().toISOString(),
    };
    setProposal(updated);
    setStage('proposal');
    setProbability(40);

    onLogActivity({
      entityType: 'opportunity',
      entityId: opportunity.id,
      activityType: 'proposal',
      channel: 'Email',
      content: `Sent official Proposal v${updated.version} for ${opportunity.name} ($${estimatedValue.toLocaleString()}).`,
      outcome: 'Proposal delivered. Awaiting client review and commercial discussion.',
      occurredAt: new Date().toISOString(),
    });

    handleSaveAll();
  };

  const handleLogActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityContent.trim()) return;

    onLogActivity({
      entityType: 'opportunity',
      entityId: opportunity.id,
      activityType,
      channel: activityChannel,
      content: activityContent.trim(),
      outcome: activityOutcome.trim() || undefined,
      occurredAt: new Date().toISOString(),
    });

    setActivityContent('');
    setActivityOutcome('');
    setShowLogModal(false);
  };

  const handleDeleteOpportunity = () => {
    if (window.confirm(`Are you sure you want to delete the opportunity "${opportunity.name}"? This action cannot be undone.`)) {
      onDeleteOpp(opportunity.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 pb-16">
      {/* 1. Sticky Navigation & Action Header */}
      <div className="sticky -top-6 lg:-top-8 -mt-6 lg:-mt-8 z-20 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            title="Back to Pipeline"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 truncate">
                {name || 'Untitled Opportunity'}
              </h1>
              <span className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                stage === 'won'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : stage === 'lost'
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700'
                  : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800'
              }`}>
                {stage}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
              <span>Pipeline</span>
              {organization && (
                <>
                  <span className="text-stone-300 dark:text-stone-700">/</span>
                  <button
                    onClick={() => onNavigateToOrg(organization.id)}
                    className="font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Building2 className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{organization.name}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setShowLogModal(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Log</span>
          </button>

          <button
            onClick={handleGenerateAIProposal}
            disabled={isGeneratingProposal}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400 dark:text-teal-600" />
            <span>{isGeneratingProposal ? 'Generating...' : 'Proposal'}</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-stone-950 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            {isSavedFlash ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavedFlash ? 'Saved!' : 'Save'}</span>
          </button>

          <button
            onClick={handleDeleteOpportunity}
            className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md cursor-pointer transition-colors"
            title="Delete Opportunity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Visual Stage Stepper */}
      <div className="grid grid-cols-5 gap-1.5 bg-white dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs">
        {STAGES.map((s) => {
          const isCurrent = stage === s.id;
          return (
            <button
              key={s.id}
              onClick={() => handleStageChange(s.id)}
              className={`py-1.5 px-2 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isCurrent
                  ? s.id === 'won'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : s.id === 'lost'
                    ? 'bg-stone-700 text-white font-bold shadow-xs'
                    : 'bg-teal-600 dark:bg-teal-500 text-white dark:text-stone-950 font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <span>{s.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({s.defaultProb}%)</span>
            </button>
          );
        })}
      </div>

      {/* 3. Deal Overview KPIs Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
          <span className="text-[11px] text-stone-500 font-medium">Estimated Deal Value</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-stone-400">$</span>
            <input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(Number(e.target.value))}
              className="w-full text-lg font-bold font-mono text-stone-900 dark:text-stone-100 bg-transparent border-b border-transparent hover:border-stone-300 dark:hover:border-stone-700 focus:border-teal-500 focus:outline-hidden"
            />
          </div>
          <span className="text-[10px] text-stone-400">One-time implementation fee</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
          <span className="text-[11px] text-stone-500 font-medium">Monthly Recurring (MRR)</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-stone-400">$</span>
            <input
              type="number"
              value={recurringValue}
              onChange={(e) => setRecurringValue(Number(e.target.value))}
              className="w-full text-lg font-bold font-mono text-stone-900 dark:text-stone-100 bg-transparent border-b border-transparent hover:border-stone-300 dark:hover:border-stone-700 focus:border-teal-500 focus:outline-hidden"
            />
          </div>
          <span className="text-[10px] text-stone-400">Maintenance & SLA support</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-500 font-medium">Win Probability</span>
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{probability}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={probability}
            onChange={(e) => setProbability(Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
          <div className="text-[10px] text-stone-400 flex items-center justify-between">
            <span>Weighted:</span>
            <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">${weightedValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
          <span className="text-[11px] text-stone-500 font-medium">Target Close Date</span>
          <input
            type="date"
            value={expectedCloseDate}
            onChange={(e) => setExpectedCloseDate(e.target.value)}
            className="w-full text-xs font-medium text-stone-900 dark:text-stone-100 bg-transparent border border-stone-200 dark:border-stone-700 rounded px-2 py-1 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
          />
          <span className="text-[10px] text-stone-400">
            {expectedCloseDate ? `${Math.ceil((new Date(expectedCloseDate).getTime() - Date.now()) / (86400000))} days remaining` : 'No date set'}
          </span>
        </div>
      </div>

      {/* 4. Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-stone-200 dark:border-stone-800 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Commercials & Overview' },
          { id: 'discovery', label: 'Discovery Matrix' },
          { id: 'solution', label: 'Solution Architecture' },
          { id: 'proposal', label: 'Proposal & Contract' },
          { id: 'activities', label: `Activity Timeline (${activities.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:border-stone-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5. Tab Content Panes */}

      {/* TAB 1: OVERVIEW & COMMERCIALS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main deal info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Deal Scope & Objective</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Opportunity Title
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Scope Summary & Background Notes
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the core objective, client needs, and commercial context..."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Next Critical Action
                  </label>
                  <input
                    type="text"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    placeholder="e.g. Present technical architecture proposal"
                    className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Next Action Due Date
                  </label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Custom fields if any */}
            {customFields.length > 0 && (
              <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Custom Opportunity Attributes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customFields.map((cf) => (
                    <div key={cf.id}>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                        {cf.name}
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${cf.name.toLowerCase()}...`}
                        className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info: Organization & Contacts */}
          <div className="space-y-6">
            {organization && (
              <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span>Client Account</span>
                  </h3>
                  <button
                    onClick={() => onNavigateToOrg(organization.id)}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                  <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                    {organization.name}
                  </p>
                  <p>{organization.organizationType} • {organization.city}, {organization.country}</p>
                  {organization.website && (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-600 dark:text-teal-400 hover:underline block truncate"
                    >
                      {organization.website}
                    </a>
                  )}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-stone-500">
                    <span>Lead Score:</span>
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-300">{organization.leadScore || 0}/100</span>
                  </div>
                </div>

                {/* Key Stakeholders in this account */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                  <h4 className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Key Stakeholders ({contacts.length})
                  </h4>
                  {contacts.length === 0 ? (
                    <p className="text-xs text-stone-400">No contacts recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {contacts.map((con) => (
                        <div key={con.id} className="p-2 rounded bg-stone-50 dark:bg-stone-800/50 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-stone-900 dark:text-stone-100">{con.name}</span>
                            {con.isDecisionMaker && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                                Decision Maker
                              </span>
                            )}
                          </div>
                          <p className="text-stone-500 text-[11px]">{con.jobTitle || con.stakeholderType}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DISCOVERY MATRIX */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Institutional Discovery & Diagnostic Framework
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Record critical insights from client interviews to fuel precision proposal generation
                </p>
              </div>

              <button
                onClick={handleSaveAll}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-700 self-start sm:self-auto cursor-pointer"
              >
                Save Discovery Notes
              </button>
            </div>

            {/* Matrix Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  1. Current Operational Pain Points & Bottlenecks
                </label>
                <textarea
                  rows={3}
                  value={discovery.painPoints || ''}
                  onChange={(e) => setDiscovery({ ...discovery, painPoints: e.target.value })}
                  placeholder="e.g. 14,000 students queuing at physical bank branches. Manual receipt reconciliation takes 3 weeks every semester."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  2. Strategic Goals & Desired Outcomes
                </label>
                <textarea
                  rows={3}
                  value={discovery.goals || ''}
                  onChange={(e) => setDiscovery({ ...discovery, goals: e.target.value })}
                  placeholder="e.g. 100% online student self-registration before October intake with zero bank slip backlog."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  3. Technical & System Requirements
                </label>
                <textarea
                  rows={3}
                  value={discovery.requirements || ''}
                  onChange={(e) => setDiscovery({ ...discovery, requirements: e.target.value })}
                  placeholder="e.g. Direct Orange Money & MTN MoMo payment webhooks, QR code verification on registration slips, role-based admin console."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  4. Budget & Commercial Constraints
                </label>
                <textarea
                  rows={3}
                  value={discovery.budget || ''}
                  onChange={(e) => setDiscovery({ ...discovery, budget: e.target.value })}
                  placeholder="e.g. $6,000 - $8,500 allocated for tech modernization. Can pay 50% on signature, 50% on acceptance."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  5. Target Timeline & Launch Deadlines
                </label>
                <textarea
                  rows={3}
                  value={discovery.timeline || ''}
                  onChange={(e) => setDiscovery({ ...discovery, timeline: e.target.value })}
                  placeholder="e.g. 6-week turnaround. Must be live and tested by September 15th before admissions open."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  6. Decision Makers & Key Approvers
                </label>
                <textarea
                  rows={3}
                  value={discovery.decisionMakers || ''}
                  onChange={(e) => setDiscovery({ ...discovery, decisionMakers: e.target.value })}
                  placeholder="e.g. Dean Emmanuel Ndjock (Final Financial Sign-off), IT Director Paul Manga (Technical validation)."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  7. Potential Objections & Risks
                </label>
                <textarea
                  rows={3}
                  value={discovery.objections || ''}
                  onChange={(e) => setDiscovery({ ...discovery, objections: e.target.value })}
                  placeholder="e.g. Server hosting costs, data privacy compliance, staff resistance to digital grading."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  8. Agreed Next Steps
                </label>
                <textarea
                  rows={3}
                  value={discovery.nextSteps || ''}
                  onChange={(e) => setDiscovery({ ...discovery, nextSteps: e.target.value })}
                  placeholder="e.g. Deliver formal proposal and deliverables schedule for review by Friday."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOLUTION ARCHITECTURE */}
      {activeTab === 'solution' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Solution Architecture & Technical Deliverables
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Structure the deliverables, features, and timeline for execution
                </p>
              </div>

              <button
                onClick={handleSaveAll}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-700 self-start sm:self-auto cursor-pointer"
              >
                Save Solution Scope
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Problem Statement
                </label>
                <textarea
                  rows={2}
                  value={solution.problem || ''}
                  onChange={(e) => setSolution({ ...solution, problem: e.target.value })}
                  placeholder="Summarize the core technical and operational friction to be solved..."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Proposed Solution Architecture
                </label>
                <textarea
                  rows={3}
                  value={solution.proposedSolution || ''}
                  onChange={(e) => setSolution({ ...solution, proposedSolution: e.target.value })}
                  placeholder="Describe the application architecture, tech stack, and workflow approach..."
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Feature Scope Checklist */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  Feature Scope Items ({solution.features?.length || 0})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newFeatureInput.trim()) {
                          setSolution({
                            ...solution,
                            features: [...(solution.features || []), newFeatureInput.trim()],
                          });
                          setNewFeatureInput('');
                        }
                      }
                    }}
                    placeholder="Add a feature item (e.g. Student self-registration portal with photo upload)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFeatureInput.trim()) {
                        setSolution({
                          ...solution,
                          features: [...(solution.features || []), newFeatureInput.trim()],
                        });
                        setNewFeatureInput('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer"
                  >
                    Add Feature
                  </button>
                </div>

                <div className="space-y-1 pt-1">
                  {solution.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-1.5 rounded bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/60 text-xs text-stone-800 dark:text-stone-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSolution({
                            ...solution,
                            features: solution.features?.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-stone-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliverables List */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                  Key Deliverables & Milestones ({solution.deliverables?.length || 0})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeliverableInput}
                    onChange={(e) => setNewDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newDeliverableInput.trim()) {
                          setSolution({
                            ...solution,
                            deliverables: [...(solution.deliverables || []), newDeliverableInput.trim()],
                          });
                          setNewDeliverableInput('');
                        }
                      }
                    }}
                    placeholder="Add deliverable (e.g. Admissions Web Application, Staff Training Workshop)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDeliverableInput.trim()) {
                        setSolution({
                          ...solution,
                          deliverables: [...(solution.deliverables || []), newDeliverableInput.trim()],
                        });
                        setNewDeliverableInput('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer"
                  >
                    Add Deliverable
                  </button>
                </div>

                <div className="space-y-1 pt-1">
                  {solution.deliverables?.map((del, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-1.5 rounded bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        <span>{del}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSolution({
                            ...solution,
                            deliverables: solution.deliverables?.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-stone-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline & Pricing breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Timeline & Schedule
                  </label>
                  <input
                    type="text"
                    value={solution.timeline || ''}
                    onChange={(e) => setSolution({ ...solution, timeline: e.target.value })}
                    placeholder="e.g. 6 weeks rollout (Sprint 1: Core Portal, Sprint 2: Payments)"
                    className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Commercial Terms / Milestone Pricing
                  </label>
                  <input
                    type="text"
                    value={solution.pricing || ''}
                    onChange={(e) => setSolution({ ...solution, pricing: e.target.value })}
                    placeholder="e.g. $7,500 total (50% on signature, 50% on delivery)"
                    className="w-full px-3 py-2 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROPOSAL DRAFTER */}
      {activeTab === 'proposal' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
            {/* Proposal Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Proposal Drafter (v{proposal.version || 1})</span>
                </h3>

                <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded border ${
                  proposal.status === 'accepted'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold'
                    : proposal.status === 'sent'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                }`}>
                  Status: {proposal.status || 'draft'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyProposal}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownloadProposal}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .md</span>
                </button>

                {proposal.status !== 'sent' && proposal.status !== 'accepted' && (
                  <button
                    onClick={handleMarkProposalSent}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Mark as Sent</span>
                  </button>
                )}
              </div>
            </div>

            {/* AI Generator Panel */}
            <div className="p-4 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Generate / Regenerate with Gemini
                  </h4>
                </div>
                <AiMarking />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={proposalAngle}
                  onChange={(e) => setProposalAngle(e.target.value)}
                  placeholder="Specify strategic focus or pricing structure..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-md border border-teal-200 dark:border-teal-800 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                />
                <button
                  onClick={handleGenerateAIProposal}
                  disabled={isGeneratingProposal}
                  className="px-4 py-1.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingProposal ? 'Generating Proposal...' : 'Run Proposal AI'}</span>
                </button>
              </div>
            </div>

            {/* Proposal Markdown / Text Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <label className="font-semibold text-stone-700 dark:text-stone-300">
                  Proposal Content (Markdown Supported)
                </label>
                <span>{proposal.content ? proposal.content.split(/\s+/).filter(Boolean).length : 0} words</span>
              </div>
              <textarea
                rows={16}
                value={proposal.content || ''}
                onChange={(e) => setProposal({ ...proposal, content: e.target.value })}
                placeholder="Write or edit formal proposal..."
                className="w-full p-4 font-mono text-xs leading-relaxed rounded-md border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/50 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVITY TIMELINE */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Opportunity Interaction Timeline ({activities.length})
              </h3>
              <button
                onClick={() => setShowLogModal(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Event</span>
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12 text-xs text-stone-400">
                No activity logged yet for this opportunity. Click "Log Event" to record calls, meetings, and emails.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
                {activities.map((act) => (
                  <div key={act.id} className="relative space-y-1.5">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-600 border-2 border-white dark:border-stone-900"></span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase">
                        {act.activityType}
                      </span>
                      {act.channel && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {act.channel}
                        </span>
                      )}
                      <span className="text-[11px] text-stone-400 ml-auto font-mono">
                        {new Date(act.occurredAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/40 p-3 rounded-md border border-stone-100 dark:border-stone-800">
                      {act.content}
                    </p>

                    {act.outcome && (
                      <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                        Outcome: {act.outcome}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Log Activity on {opportunity.name}
            </h3>

            <form onSubmit={handleLogActivitySubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as Activity['activityType'])}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="call">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="proposal">Proposal</option>
                    <option value="note">Internal Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Channel
                  </label>
                  <input
                    type="text"
                    value={activityChannel}
                    onChange={(e) => setActivityChannel(e.target.value)}
                    placeholder="e.g. WhatsApp, Zoom"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Activity Notes & Discussion Points *
                </label>
                <textarea
                  rows={3}
                  required
                  value={activityContent}
                  onChange={(e) => setActivityContent(e.target.value)}
                  placeholder="What was discussed or agreed upon?"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Outcome & Next Step (Optional)
                </label>
                <input
                  type="text"
                  value={activityOutcome}
                  onChange={(e) => setActivityOutcome(e.target.value)}
                  placeholder="e.g. Scheduled architecture demo for Thursday"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
