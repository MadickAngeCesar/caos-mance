import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  Send, 
  ArrowRight, 
  Briefcase, 
  Plus, 
  Users, 
  Clock, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Check, 
  Award,
  MoreVertical,
  Trash2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Organization, Contact, CustomFieldDefinition, Activity } from '../../types';
import { StageBadge, PriorityBadge } from '../ui/Badge';
import { CustomFieldRenderer } from '../ui/CustomFieldRenderer';
import { ResearchResultView } from './ResearchResultView';
import { DigitalizationModal } from './DigitalizationModal';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface ProspectDetailProps {
  organization: Organization;
  contacts: Contact[];
  customFields: CustomFieldDefinition[];
  activities: Activity[];
  onUpdateOrg: (patch: Partial<Organization>) => void;
  onDeleteOrg: (id: string) => void;
  onAddContact: (contact: Partial<Contact>) => void;
  onConvertToOpportunity: (org: Organization) => void;
  onOpenOutreach: (orgId: string, contactId?: string) => void;
  onTriggerResearch: (orgId: string) => void;
  onLogActivity: (activity: Partial<Activity>) => void;
  isResearching?: boolean;
}

export const ProspectDetail: React.FC<ProspectDetailProps> = ({
  organization,
  contacts,
  customFields,
  activities,
  onUpdateOrg,
  onDeleteOrg,
  onAddContact,
  onConvertToOpportunity,
  onOpenOutreach,
  onTriggerResearch,
  onLogActivity,
  isResearching = false,
}) => {
  const [activeTab, setActiveTab] = useState<'research' | 'timeline' | 'notes'>('research');
  const [isDigitalizationModalOpen, setIsDigitalizationModalOpen] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showLogActivityModal, setShowLogActivityModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // New contact form state
  const [newContactName, setNewContactName] = useState('');
  const [newContactTitle, setNewContactTitle] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactIsDM, setNewContactIsDM] = useState(false);

  // New activity form state
  const [newActType, setNewActType] = useState<Activity['activityType']>('note');
  const [newActContent, setNewActContent] = useState('');
  const [newActOutcome, setNewActOutcome] = useState('');

  const orgContacts = contacts.filter((c) => c.organizationId === organization.id);
  const orgActivities = activities.filter(
    (a) => a.entityType === 'organization' && a.entityId === organization.id
  );

  const radarData = (organization.digitalizationProfile?.scores || []).map((s) => ({
    subject: s.name,
    score: s.score || 0,
  }));

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    onAddContact({
      organizationId: organization.id,
      name: newContactName.trim(),
      jobTitle: newContactTitle.trim() || undefined,
      email: newContactEmail.trim() || undefined,
      phone: newContactPhone.trim() || undefined,
      isDecisionMaker: newContactIsDM,
      stakeholderType: newContactIsDM ? 'Decision Maker' : 'Influencer',
    });
    setNewContactName('');
    setNewContactTitle('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactIsDM(false);
    setShowAddContactModal(false);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActContent.trim()) return;
    onLogActivity({
      entityType: 'organization',
      entityId: organization.id,
      activityType: newActType,
      content: newActContent.trim(),
      outcome: newActOutcome.trim() || undefined,
      occurredAt: new Date().toISOString(),
    });
    setNewActContent('');
    setNewActOutcome('');
    setShowLogActivityModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Sticky Header Bar (Fixed at the top of the scroll container) */}
      <div className="sticky -top-6 lg:-top-8 -mt-6 lg:-mt-8 z-20 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
            {organization.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                {organization.name}
              </h1>
              <StageBadge stage={organization.stage} />
              <PriorityBadge priority={organization.priority} />
              <div className="flex items-center gap-1 text-xs font-mono text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                <span>Score:</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{organization.leadScore}</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 truncate mt-0.5">
              {organization.organizationType || 'Institution'} • {organization.city || ''}{organization.city ? ', ' : ''}{organization.country || ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Research Trigger */}
          <button
            onClick={() => onTriggerResearch(organization.id)}
            disabled={isResearching}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isResearching ? 'animate-spin' : ''}`} />
            <span>{isResearching ? 'Researching...' : 'Research'}</span>
          </button>

          {/* Generate Outreach */}
          <button
            onClick={() => onOpenOutreach(organization.id)}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Outreach</span>
          </button>

          {/* Convert to Opportunity (Progressive disclosure: visible when Engaged+) */}
          {(organization.stage === 'engaged' || organization.stage === 'contacted') && (
            <button
              onClick={() => onConvertToOpportunity(organization)}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-stone-950 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Opportunity</span>
            </button>
          )}

          {/* Delete Option */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete prospect"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Two Column Hub Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (40% width): Identity & Custom Fields + Contacts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Core Fields Card */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Identity & Core Attributes</span>
              </h3>
              <span className="text-[11px] text-stone-400 italic">Autosaves on edit</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Organization Name</label>
                <input
                  type="text"
                  value={organization.name}
                  onChange={(e) => onUpdateOrg({ name: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 text-sm rounded border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Stage</label>
                  <select
                    value={organization.stage}
                    onChange={(e) => onUpdateOrg({ stage: e.target.value as any })}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
                  >
                    <option value="lead">Lead</option>
                    <option value="researching">Researching</option>
                    <option value="qualified">Qualified</option>
                    <option value="contacted">Contacted</option>
                    <option value="engaged">Engaged</option>
                    <option value="nurture">Nurture</option>
                    <option value="disqualified">Disqualified</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Priority</label>
                  <select
                    value={organization.priority}
                    onChange={(e) => onUpdateOrg({ priority: e.target.value as any })}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Website</label>
                <div className="relative mt-1 flex items-center">
                  <input
                    type="url"
                    value={organization.website || ''}
                    onChange={(e) => onUpdateOrg({ website: e.target.value })}
                    placeholder="https://example.edu"
                    className="w-full pl-3 pr-8 py-1.5 text-xs font-mono rounded border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                  {organization.website && (
                    <a
                      href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-2.5 text-stone-400 hover:text-teal-600"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">City</label>
                  <input
                    type="text"
                    value={organization.city || ''}
                    onChange={(e) => onUpdateOrg({ city: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Country</label>
                  <input
                    type="text"
                    value={organization.country || ''}
                    onChange={(e) => onUpdateOrg({ country: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Institutional Notes</label>
                <textarea
                  rows={2}
                  value={organization.notes || ''}
                  onChange={(e) => onUpdateOrg({ notes: e.target.value })}
                  placeholder="Key background, campus leadership observations..."
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
          </div>

          {/* Custom Fields Card */}
          {customFields.length > 0 && (
            <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Education & Custom Criteria
              </h3>
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {customFields.map((cf) => (
                  <CustomFieldRenderer
                    key={cf.id}
                    definition={cf}
                    value={organization.customFields?.[cf.id]}
                    onChange={(val) => {
                      const updated = { ...(organization.customFields || {}), [cf.id]: val };
                      onUpdateOrg({ customFields: updated });
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Contacts List Card */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Stakeholders & Contacts ({orgContacts.length})</span>
              </h3>
              <button
                onClick={() => setShowAddContactModal(true)}
                className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>

            {orgContacts.length === 0 ? (
              <div className="text-center py-4 text-xs text-stone-400">
                No contacts recorded yet. Add key decision makers to personalize outreach.
              </div>
            ) : (
              <div className="space-y-3">
                {orgContacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-md bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{c.name}</p>
                        {c.isDecisionMaker && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                            Decision Maker
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500">{c.jobTitle || 'Faculty Leader'}</p>
                      {c.email && (
                        <p className="text-xs font-mono text-stone-400 truncate mt-1 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-stone-400" /> {c.email}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onOpenOutreach(organization.id, c.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 text-teal-600 dark:text-teal-400 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>Reach out</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (60% width): Digitalization Widget + Research + Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Digitalization Profile Widget */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Digitalization Profile
                </h3>
              </div>
              <button
                onClick={() => setIsDigitalizationModalOpen(true)}
                className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Expand 8-Dimension Scoring</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4 p-3 rounded-md bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 text-center">
                <span className="text-xs text-stone-500">Maturity Score</span>
                <p className="text-3xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                  {organization.digitalizationProfile?.overallScore || '5.0'}
                  <span className="text-xs font-normal text-stone-400"> / 10</span>
                </p>
                <span className="text-[11px] text-stone-400 block mt-1">
                  {organization.digitalizationProfile?.scores?.filter(s => s.confirmed).length || 8} criteria audited
                </span>
              </div>

              <div className="sm:col-span-8 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                    <PolarGrid stroke="#e4e2df" strokeOpacity={0.4} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a8a29e', fontSize: 9 }} />
                    <Radar dataKey="score" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabbed Working Panel: Research vs Timeline */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
            <div className="px-5 pt-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('research')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'research'
                      ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300'
                      : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  ✨ AI Research Analysis
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'timeline'
                      ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300'
                      : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  Activity & Communication Timeline ({orgActivities.length})
                </button>
              </div>

              {activeTab === 'timeline' && (
                <button
                  onClick={() => setShowLogActivityModal(true)}
                  className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline mb-2 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Activity</span>
                </button>
              )}
            </div>

            <div className="p-5">
              {activeTab === 'research' && (
                <div>
                  {organization.latestResearch ? (
                    <ResearchResultView
                      research={organization.latestResearch}
                      history={organization.researchHistory}
                      onRerunResearch={() => onTriggerResearch(organization.id)}
                      isLoading={isResearching}
                    />
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        No Structured Research Generated Yet
                      </h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Run Gemini Deep Research to uncover digital presence, enrollment bottlenecks, and strategic decision makers.
                      </p>
                      <button
                        onClick={() => onTriggerResearch(organization.id)}
                        disabled={isResearching}
                        className="px-4 py-2 rounded-md text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        {isResearching ? 'Analyzing...' : 'Run Research with Gemini'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  {orgActivities.length === 0 ? (
                    <div className="text-center py-8 text-xs text-stone-400">
                      No outreach or activities logged yet.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
                      {orgActivities.map((act) => (
                        <div key={act.id} className="relative group">
                          <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white dark:bg-stone-900 border-2 border-teal-600 flex items-center justify-center" />
                          <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-md border border-stone-100 dark:border-stone-800 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">
                                {act.activityType.replace('_', ' ')} • {act.channel || 'Direct'}
                              </span>
                              <span className="text-[11px] text-stone-400 font-mono">
                                {new Date(act.occurredAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-300 whitespace-pre-wrap">{act.content}</p>
                            {act.outcome && (
                              <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">Outcome: {act.outcome}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Digitalization Radar Modal */}
      {organization.digitalizationProfile && (
        <DigitalizationModal
          isOpen={isDigitalizationModalOpen}
          onClose={() => setIsDigitalizationModalOpen(false)}
          organizationName={organization.name}
          profile={organization.digitalizationProfile}
          onUpdateScores={(scores) => {
            const overall = Number((scores.reduce((s, d) => s + (d.score || 0), 0) / scores.length).toFixed(1));
            onUpdateOrg({
              digitalizationProfile: {
                overallScore: overall,
                updatedAt: new Date().toISOString(),
                scores,
              },
            });
          }}
        />
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Add Stakeholder / Contact</h3>
            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Full Name *</label>
                <input
                  required
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Prof. Emmanuel Ndjock"
                  className="w-full mt-1 px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Job Title / Faculty Role</label>
                <input
                  type="text"
                  value={newContactTitle}
                  onChange={(e) => setNewContactTitle(e.target.value)}
                  placeholder="e.g. Dean of Sciences / Registrar"
                  className="w-full mt-1 px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Email</label>
                  <input
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Phone</label>
                  <input
                    type="tel"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newContactIsDM}
                  onChange={(e) => setNewContactIsDM(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600"
                />
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">Is Final Decision Maker (Budget Approver)</span>
              </label>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded border border-stone-200 dark:border-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium rounded bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {showLogActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Log Interaction Activity</h3>
            <form onSubmit={handleSaveActivity} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Activity Type</label>
                <select
                  value={newActType}
                  onChange={(e) => setNewActType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer"
                >
                  <option value="meeting">Meeting (In-Person / Zoom)</option>
                  <option value="phone_call">Phone Call</option>
                  <option value="whatsapp">WhatsApp Message</option>
                  <option value="email">Email</option>
                  <option value="note">Internal Research Note</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Content / Summary *</label>
                <textarea
                  required
                  rows={3}
                  value={newActContent}
                  onChange={(e) => setNewActContent(e.target.value)}
                  placeholder="Key talking points, institutional requests discussed..."
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Outcome / Next Commitment</label>
                <input
                  type="text"
                  value={newActOutcome}
                  onChange={(e) => setNewActOutcome(e.target.value)}
                  placeholder="e.g. Agreed to review proposal on Friday"
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogActivityModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded border border-stone-200 dark:border-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium rounded bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={`Delete "${organization.name}"?`}
        description="This will remove the organization and archive associated history. This action can be undone from Settings."
        confirmLabel="Delete Prospect"
        variant="destructive"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteOrg(organization.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
