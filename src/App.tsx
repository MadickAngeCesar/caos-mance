import React, { useState, useEffect, useMemo } from 'react';
import { 
  loadStore, 
  saveStore, 
  AppStoreState, 
  calculateLeadScore, 
  resetStoreToSeed 
} from './lib/storage';
import { 
  Organization, 
  Opportunity, 
  Contact, 
  Activity, 
  CustomFieldDefinition, 
  ContentItem, 
  PlannedActivity,
  FreelanceProfile,
  Playbook
} from './types';
import { requestResearch } from './lib/api';

// Components
import { Shell } from './components/layout/Shell';
import { CommandPalette } from './components/layout/CommandPalette';
import { AskCaosPanel } from './components/layout/AskCaosPanel';
import { DailyCommandCenter } from './components/home/DailyCommandCenter';
import { GuidedSessionView } from './components/session/GuidedSessionView';
import { ProspectList } from './components/prospects/ProspectList';
import { ProspectDetail } from './components/prospects/ProspectDetail';
import { OpportunityPipeline } from './components/opportunities/OpportunityPipeline';
import { OpportunityDetail } from './components/opportunities/OpportunityDetail';
import { OutreachHub } from './components/outreach/OutreachHub';
import { ContentPlanner } from './components/content/ContentPlanner';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  const [state, setState] = useState<AppStoreState>(() => loadStore());
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [initialCreateOpen, setInitialCreateOpen] = useState(false);

  // Global Modals & Panels
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAskCaosOpen, setIsAskCaosOpen] = useState(false);
  const [askCaosPrompt, setAskCaosPrompt] = useState<string | undefined>(undefined);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('caos_theme');
      if (saved) return saved === 'dark';
      return false; // Default to clean light mode
    }
    return false;
  });
  const [isResearchingMap, setIsResearchingMap] = useState<Record<string, boolean>>({});

  // Synchronize Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('caos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('caos_theme', 'light');
    }
  }, [isDark]);

  // Persist State Changes
  const updateState = (updater: (prev: AppStoreState) => AppStoreState) => {
    setState((prev) => {
      const next = updater(prev);
      saveStore(next);
      return next;
    });
  };

  // Keyboard Shortcuts (⌘K, ⌘J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsAskCaosOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation Helper
  const navigate = (route: string, id?: string) => {
    if (id === 'new') {
      setCurrentRoute('prospects');
      setInitialCreateOpen(true);
      return;
    }
    setCurrentRoute(route);
    if (id) setSelectedEntityId(id);
  };

  // Active Context Anchor for Ask CAOS
  const currentOrg = useMemo(() => {
    if (currentRoute === 'prospect-detail' && selectedEntityId) {
      return state.organizations.find((o) => o.id === selectedEntityId);
    }
    return null;
  }, [currentRoute, selectedEntityId, state.organizations]);

  const currentOpp = useMemo(() => {
    if (currentRoute === 'opportunity-detail' && selectedEntityId) {
      return state.opportunities.find((o) => o.id === selectedEntityId);
    }
    return null;
  }, [currentRoute, selectedEntityId, state.opportunities]);

  const contextAnchor = currentOrg
    ? { type: 'Prospect', id: currentOrg.id, name: currentOrg.name }
    : currentOpp
    ? { type: 'Opportunity', id: currentOpp.id, name: currentOpp.name }
    : null;

  // Breadcrumbs calculation
  const breadcrumbs = useMemo(() => {
    if (currentRoute === 'home') return ['Home'];
    if (currentRoute === 'prospects') return ['Home', 'Prospects'];
    if (currentRoute === 'prospect-detail' && currentOrg) return ['Home', 'Prospects', currentOrg.name];
    if (currentRoute === 'opportunities') return ['Home', 'Opportunities'];
    if (currentRoute === 'opportunity-detail' && currentOpp) return ['Home', 'Opportunities', currentOpp.name];
    if (currentRoute === 'outreach') return ['Home', 'Outreach & Queue'];
    if (currentRoute === 'content') return ['Home', 'Authority & Content'];
    if (currentRoute === 'ask-caos') return ['Home', 'Ask CAOS'];
    if (currentRoute === 'analytics') return ['Home', 'Analytics'];
    if (currentRoute === 'settings') return ['Home', 'Settings'];
    if (currentRoute === 'session') return ['Home', 'Daily Guided Session'];
    return ['Home'];
  }, [currentRoute, currentOrg, currentOpp]);

  // --- Handlers ---

  // 1. Organization Management
  const handleAddOrg = (newOrgData: Partial<Organization>) => {
    const newOrg: Organization = {
      id: `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newOrgData.name || 'New Organization',
      organizationType: newOrgData.organizationType || 'Private University',
      city: newOrgData.city,
      country: newOrgData.country || 'Cameroon',
      website: newOrgData.website,
      stage: newOrgData.stage || 'lead',
      priority: newOrgData.priority || 'medium',
      leadScore: 30,
      notes: newOrgData.notes,
      customFields: newOrgData.customFields || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newOrg.leadScore = calculateLeadScore(newOrg, []);

    // Handle optional contacts passed from discovery
    let newContacts: Contact[] = [];
    if ((newOrgData as any).contacts && Array.isArray((newOrgData as any).contacts)) {
      newContacts = (newOrgData as any).contacts.map((c: any) => ({
        id: `cnt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        organizationId: newOrg.id,
        name: c.name || 'Decision Maker',
        role: c.role || 'Executive',
        email: c.email || '',
        phone: c.phone || '',
        isPrimary: true,
        customFields: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    updateState((prev) => ({
      ...prev,
      organizations: [newOrg, ...prev.organizations],
      contacts: [...newContacts, ...prev.contacts],
      activities: [
        {
          id: `act-${Date.now()}`,
          entityType: 'organization',
          entityId: newOrg.id,
          activityType: 'note',
          content: 'Prospect organization created in CAOS pipeline.',
          occurredAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        ...prev.activities,
      ],
    }));

    navigate('prospect-detail', newOrg.id);
  };

  const handleUpdateOrg = (patch: Partial<Organization>) => {
    if (!selectedEntityId) return;
    updateState((prev) => {
      const orgs = prev.organizations.map((o) => {
        if (o.id === selectedEntityId) {
          const updated = { ...o, ...patch, updatedAt: new Date().toISOString() };
          const orgContacts = prev.contacts.filter((c) => c.organizationId === o.id);
          updated.leadScore = calculateLeadScore(updated, orgContacts);
          return updated;
        }
        return o;
      });
      return { ...prev, organizations: orgs };
    });
  };

  const handleUpdateOrgStage = (orgId: string, stage: Organization['stage']) => {
    updateState((prev) => {
      const orgs = prev.organizations.map((o) => {
        if (o.id === orgId) {
          const updated = { ...o, stage, updatedAt: new Date().toISOString() };
          const orgContacts = prev.contacts.filter((c) => c.organizationId === o.id);
          updated.leadScore = calculateLeadScore(updated, orgContacts);
          return updated;
        }
        return o;
      });
      return { ...prev, organizations: orgs };
    });
  };

  const handleDeleteOrg = (orgId: string) => {
    updateState((prev) => ({
      ...prev,
      organizations: prev.organizations.map((o) =>
        o.id === orgId ? { ...o, deletedAt: new Date().toISOString() } : o
      ),
    }));
    navigate('prospects');
  };

  // 2. Contacts
  const handleAddContact = (contactData: Partial<Contact>) => {
    if (!selectedEntityId) return;
    const newContact: Contact = {
      id: `cnt-${Date.now()}`,
      organizationId: selectedEntityId,
      name: contactData.name || 'Contact',
      jobTitle: contactData.jobTitle,
      email: contactData.email,
      phone: contactData.phone,
      isDecisionMaker: !!contactData.isDecisionMaker,
      stakeholderType: contactData.stakeholderType || 'Influencer',
    };

    updateState((prev) => {
      const contacts = [...prev.contacts, newContact];
      const orgs = prev.organizations.map((o) => {
        if (o.id === selectedEntityId) {
          const orgContacts = contacts.filter((c) => c.organizationId === o.id);
          return { ...o, leadScore: calculateLeadScore(o, orgContacts) };
        }
        return o;
      });
      return { ...prev, contacts, organizations: orgs };
    });
  };

  // 3. Convert to Opportunity (Mode A -> Mode B)
  const handleConvertToOpportunity = (org: Organization) => {
    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      organizationId: org.id,
      organizationName: org.name,
      name: `${org.name} - Enterprise Solution Proposal`,
      estimatedValue: 20000,
      probability: 40,
      weightedValue: 8000,
      stage: 'proposal',
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      opportunities: [newOpp, ...prev.opportunities],
      organizations: prev.organizations.map((o) =>
        o.id === org.id ? { ...o, stage: 'engaged' } : o
      ),
    }));

    navigate('opportunities');
  };

  // 4. Opportunities Management
  const handleAddOpp = (oppData: Partial<Opportunity>) => {
    const val = oppData.estimatedValue || 10000;
    const prob = oppData.probability || 20;
    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      organizationId: oppData.organizationId || state.organizations[0]?.id || '',
      organizationName: oppData.organizationName || 'Client',
      name: oppData.name || 'New Deal',
      estimatedValue: val,
      probability: prob,
      weightedValue: Math.round(val * (prob / 100)),
      stage: oppData.stage || 'discovery',
      expectedCloseDate: oppData.expectedCloseDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      opportunities: [newOpp, ...prev.opportunities],
    }));
  };

  const handleUpdateOppStage = (oppId: string, stage: Opportunity['stage']) => {
    const stageProbs: Record<Opportunity['stage'], number> = {
      discovery: 10,
      proposal: 40,
      negotiation: 70,
      won: 100,
      lost: 0,
    };

    updateState((prev) => ({
      ...prev,
      opportunities: prev.opportunities.map((o) => {
        if (o.id === oppId) {
          const prob = stageProbs[stage] || 20;
          return {
            ...o,
            stage,
            probability: prob,
            weightedValue: Math.round(o.estimatedValue * (prob / 100)),
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      }),
    }));
  };

  const handleUpdateOpp = (oppId: string, patch: Partial<Opportunity>) => {
    updateState((prev) => ({
      ...prev,
      opportunities: prev.opportunities.map((o) =>
        o.id === oppId ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o
      ),
    }));
  };

  const handleDeleteOpp = (oppId: string) => {
    updateState((prev) => ({
      ...prev,
      opportunities: prev.opportunities.filter((o) => o.id !== oppId),
    }));
    navigate('opportunities');
  };

  // Playbook CRUD
  const handleAddPlaybook = (playbookData: Partial<Playbook>) => {
    const newPlaybook: Playbook = {
      id: `pb-${Date.now()}`,
      name: playbookData.name || 'New Playbook Template',
      workflowType: playbookData.workflowType || 'outreach',
      industryScope: playbookData.industryScope,
      instructions: playbookData.instructions || '',
      tone: playbookData.tone || 'Consultative, respectful',
      rulesToFollow: playbookData.rulesToFollow || [],
      thingsToAvoid: playbookData.thingsToAvoid || [],
      examples: playbookData.examples || [],
      version: 1,
      isActive: true,
    };

    updateState((prev) => ({
      ...prev,
      playbooks: [newPlaybook, ...prev.playbooks],
    }));
  };

  const handleUpdatePlaybook = (id: string, patch: Partial<Playbook>) => {
    updateState((prev) => ({
      ...prev,
      playbooks: prev.playbooks.map((pb) =>
        pb.id === id ? { ...pb, ...patch, version: (pb.version || 1) + 1 } : pb
      ),
    }));
  };

  const handleDeletePlaybook = (id: string) => {
    updateState((prev) => ({
      ...prev,
      playbooks: prev.playbooks.filter((pb) => pb.id !== id),
    }));
  };

  // 5. Research Trigger with Gemini API
  const handleTriggerResearch = async (orgId: string) => {
    const org = state.organizations.find((o) => o.id === orgId);
    if (!org) return;

    setIsResearchingMap((prev) => ({ ...prev, [orgId]: true }));

    try {
      const res = await requestResearch({
        organization: org,
        profile: state.profile,
      });

      if (res.data) {
        const nextVersion = (org.latestResearch?.version || 0) + 1;
        const newResearch = {
          ...res.data,
          version: nextVersion,
          createdAt: new Date().toISOString(),
        };

        const existingHistory = org.researchHistory || (org.latestResearch ? [org.latestResearch] : []);

        updateState((prev) => {
          const orgs = prev.organizations.map((o) => {
            if (o.id === orgId) {
              const updated = {
                ...o,
                latestResearch: newResearch,
                researchHistory: [newResearch, ...existingHistory],
                updatedAt: new Date().toISOString(),
              };
              const orgContacts = prev.contacts.filter((c) => c.organizationId === o.id);
              updated.leadScore = calculateLeadScore(updated, orgContacts);
              return updated;
            }
            return o;
          });

          const newActivity: Activity = {
            id: `act-${Date.now()}`,
            entityType: 'organization',
            entityId: orgId,
            activityType: 'note',
            content: `✨ Completed Gemini Deep Research (Version ${nextVersion}). 10-section analysis generated.`,
            occurredAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };

          return {
            ...prev,
            organizations: orgs,
            activities: [newActivity, ...prev.activities],
          };
        });
      }
    } catch (err: any) {
      alert(`Research failed: ${err.message || 'Network error'}`);
    } finally {
      setIsResearchingMap((prev) => ({ ...prev, [orgId]: false }));
    }
  };

  // 6. Log Activity / Outreach
  const handleLogActivity = (actData: Partial<Activity>) => {
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      entityType: actData.entityType || 'organization',
      entityId: actData.entityId || selectedEntityId || '',
      activityType: actData.activityType || 'note',
      channel: actData.channel,
      content: actData.content || '',
      outcome: actData.outcome,
      occurredAt: actData.occurredAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      activities: [newAct, ...prev.activities],
    }));
  };

  const handleLogOutreachSent = (orgId: string, channel: string, message: string, contactId?: string) => {
    handleLogActivity({
      entityType: 'organization',
      entityId: orgId,
      activityType: channel === 'whatsapp' ? 'whatsapp' : channel === 'email' ? 'email' : 'note',
      channel,
      content: `Dispatched outreach message:\n${message.slice(0, 200)}...`,
      outcome: 'Dispatched, awaiting reply',
    });

    const targetOrg = state.organizations.find((o) => o.id === orgId);
    if (targetOrg && (targetOrg.stage === 'lead' || targetOrg.stage === 'qualified')) {
      handleUpdateOrgStage(orgId, 'contacted');
    }
  };

  // 7. Sequence steps execution
  const handleExecuteSequenceStep = (stepId: string) => {
    updateState((prev) => ({
      ...prev,
      sequenceStepInstances: prev.sequenceStepInstances.map((s) =>
        s.id === stepId ? { ...s, status: 'sent' } : s
      ),
    }));
  };

  const handleSkipSequenceStep = (stepId: string) => {
    updateState((prev) => ({
      ...prev,
      sequenceStepInstances: prev.sequenceStepInstances.map((s) =>
        s.id === stepId ? { ...s, status: 'skipped' } : s
      ),
    }));
  };

  // 8. Content management
  const handleAddContent = (itemData: Partial<ContentItem>) => {
    const newItem: ContentItem = {
      id: `cnt-${Date.now()}`,
      title: itemData.title || 'New Authority Post',
      contentType: itemData.contentType || 'article',
      status: itemData.status || 'idea',
      idea: itemData.idea,
      draft: itemData.draft,
      scheduledDate: itemData.scheduledDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      contentItems: [newItem, ...prev.contentItems],
    }));
  };

  const handleUpdateContent = (id: string, patch: Partial<ContentItem>) => {
    updateState((prev) => ({
      ...prev,
      contentItems: prev.contentItems.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c)),
    }));
  };

  const handleDeleteContent = (id: string) => {
    updateState((prev) => ({
      ...prev,
      contentItems: prev.contentItems.filter((c) => c.id !== id),
    }));
  };

  // 9. Guided Session Actions
  const [activeSessionPlan, setActiveSessionPlan] = useState<PlannedActivity[] | null>(null);

  const handleStartSession = (plan: PlannedActivity[]) => {
    setActiveSessionPlan(plan);
    updateState((prev) => ({
      ...prev,
      activeSession: {
        id: `sess-${Date.now()}`,
        startedAt: new Date().toISOString(),
        plannedMinutes: prev.todayTimeBudgetMinutes,
        status: 'active',
        activitiesCompleted: 0,
        activitiesSkipped: 0,
        completedActivities: [],
      },
    }));
    setCurrentRoute('session');
  };

  const handleCompleteSession = (completedActs: any[]) => {
    updateState((prev) => ({
      ...prev,
      activeSession: null,
      streakCount: prev.streakCount + 1,
    }));
  };

  const handleCancelSession = () => {
    updateState((prev) => ({
      ...prev,
      activeSession: null,
    }));
    navigate('home');
  };

  // 10. Custom Fields & Settings
  const handleAddCustomField = (fieldData: Partial<CustomFieldDefinition>) => {
    const newField: CustomFieldDefinition = {
      id: `cf-${Date.now()}`,
      entityType: fieldData.entityType || 'organization',
      name: fieldData.name || 'Custom Field',
      fieldType: fieldData.fieldType || 'text',
      isRequired: !!fieldData.isRequired,
      options: fieldData.options,
      sortOrder: state.customFields.length + 1,
      isActive: true,
    };

    updateState((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));
  };

  const handleDeleteCustomField = (fieldId: string) => {
    updateState((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((f) => f.id !== fieldId),
    }));
  };

  return (
    <Shell
      currentRoute={currentRoute}
      onNavigate={navigate}
      breadcrumbs={breadcrumbs}
      state={state}
      onToggleTheme={() => setIsDark((prev) => !prev)}
      isDark={isDark}
      onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      onToggleAskCaos={() => setIsAskCaosOpen((prev) => !prev)}
    >
      {/* 1. Daily Command Center Home */}
      {currentRoute === 'home' && (
        <DailyCommandCenter
          state={state}
          onNavigate={navigate}
          onStartSession={handleStartSession}
          onOpenAskCaos={(prompt) => {
            setAskCaosPrompt(prompt);
            setIsAskCaosOpen(true);
          }}
          onUpdateTimeBudget={(mins) => {
            updateState((prev) => ({ ...prev, todayTimeBudgetMinutes: mins }));
          }}
        />
      )}

      {/* 2. Mode A Prospects List */}
      {currentRoute === 'prospects' && (
        <ProspectList
          organizations={state.organizations}
          customFields={state.customFields.filter((c) => c.entityType === 'organization')}
          onSelectOrg={(id) => navigate('prospect-detail', id)}
          onAddOrg={handleAddOrg}
          onUpdateOrgStage={handleUpdateOrgStage}
          onDeleteOrg={handleDeleteOrg}
          onOpenOutreach={(orgId) => {
            setSelectedEntityId(orgId);
            navigate('outreach');
          }}
          onTriggerResearch={handleTriggerResearch}
          initialCreateOpen={initialCreateOpen}
        />
      )}

      {/* 3. Prospect Detail Hub */}
      {currentRoute === 'prospect-detail' && currentOrg && (
        <ProspectDetail
          organization={currentOrg}
          contacts={state.contacts}
          customFields={state.customFields.filter((c) => c.entityType === 'organization')}
          activities={state.activities}
          onUpdateOrg={handleUpdateOrg}
          onDeleteOrg={handleDeleteOrg}
          onAddContact={handleAddContact}
          onConvertToOpportunity={handleConvertToOpportunity}
          onOpenOutreach={(orgId) => {
            setSelectedEntityId(orgId);
            navigate('outreach');
          }}
          onTriggerResearch={handleTriggerResearch}
          onLogActivity={handleLogActivity}
          isResearching={!!isResearchingMap[currentOrg.id]}
        />
      )}

      {/* 4. Mode B Deals Pipeline */}
      {currentRoute === 'opportunities' && (
        <OpportunityPipeline
          opportunities={state.opportunities}
          organizations={state.organizations.filter((o) => !o.deletedAt)}
          onSelectOpp={(id) => navigate('opportunity-detail', id)}
          onAddOpp={handleAddOpp}
          onUpdateOppStage={handleUpdateOppStage}
        />
      )}

      {/* Mode B Opportunity Detail */}
      {currentRoute === 'opportunity-detail' && currentOpp && (
        <OpportunityDetail
          opportunity={currentOpp}
          organization={state.organizations.find((o) => o.id === currentOpp.organizationId)}
          contacts={state.contacts.filter((c) => c.organizationId === currentOpp.organizationId)}
          activities={state.activities.filter(
            (a) =>
              (a.entityType === 'opportunity' && a.entityId === currentOpp.id) ||
              (a.entityType === 'organization' && a.entityId === currentOpp.organizationId)
          )}
          customFields={state.customFields.filter((c) => c.entityType === 'opportunity')}
          profile={state.profile}
          playbooks={state.playbooks}
          onUpdateOpp={handleUpdateOpp}
          onDeleteOpp={handleDeleteOpp}
          onLogActivity={handleLogActivity}
          onNavigateToOrg={(orgId) => navigate('prospect-detail', orgId)}
          onBack={() => navigate('opportunities')}
        />
      )}

      {/* 5. Outreach & Sequence Hub */}
      {currentRoute === 'outreach' && (
        <OutreachHub
          organizations={state.organizations.filter((o) => !o.deletedAt)}
          contacts={state.contacts}
          sequences={state.sequenceStepInstances}
          playbooks={state.playbooks}
          profile={state.profile}
          selectedOrgId={selectedEntityId || undefined}
          onExecuteSequenceStep={handleExecuteSequenceStep}
          onSkipSequenceStep={handleSkipSequenceStep}
          onLogOutreachSent={handleLogOutreachSent}
          onAddPlaybook={handleAddPlaybook}
          onUpdatePlaybook={handleUpdatePlaybook}
          onDeletePlaybook={handleDeletePlaybook}
        />
      )}

      {/* 6. Authority & Content Planner */}
      {currentRoute === 'content' && (
        <ContentPlanner
          contentItems={state.contentItems}
          profile={state.profile}
          onAddContent={handleAddContent}
          onUpdateContent={handleUpdateContent}
          onDeleteContent={handleDeleteContent}
        />
      )}

      {/* 7. Analytics & Momentum */}
      {currentRoute === 'analytics' && <AnalyticsView state={state} />}

      {/* 8. Full Page Ask CAOS */}
      {currentRoute === 'ask-caos' && (
        <div className="max-w-4xl mx-auto py-4">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Ask CAOS Command Center
          </h1>
          <p className="text-xs text-stone-500 mb-6">
            Use the right-side co-pilot drawer (⌘J) for continuous contextual guidance or click below.
          </p>
          <div className="bg-white dark:bg-stone-900 p-6 rounded-lg border border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setIsAskCaosOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
            >
              Open Ask CAOS Drawer (⌘J)
            </button>
          </div>
        </div>
      )}

      {/* 9. Settings & Customization */}
      {currentRoute === 'settings' && (
        <SettingsView
          state={state}
          onUpdateProfile={(patch) => {
            updateState((prev) => ({
              ...prev,
              profile: { ...prev.profile, ...patch },
            }));
          }}
          onAddCustomField={handleAddCustomField}
          onDeleteCustomField={handleDeleteCustomField}
          onImportState={(newState) => {
            saveStore(newState);
            setState(newState);
          }}
          onResetToSeed={() => {
            const fresh = resetStoreToSeed();
            setState(fresh);
          }}
        />
      )}

      {/* 10. Guided Acquisition Session */}
      {currentRoute === 'session' && activeSessionPlan && (
        <GuidedSessionView
          plan={activeSessionPlan}
          state={state}
          onCompleteSession={handleCompleteSession}
          onCancelSession={handleCancelSession}
          onNavigateToDetail={(type, id) => {
            if (type === 'organization') navigate('prospect-detail', id);
            else if (type === 'opportunity') navigate('opportunity-detail', id);
          }}
          onOpenOutreachForOrg={(orgId) => {
            setSelectedEntityId(orgId);
            navigate('outreach');
          }}
        />
      )}

      {/* Global ⌘K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        state={state}
        onNavigate={navigate}
        onOpenAskCaosWithPrompt={(prompt) => {
          setAskCaosPrompt(prompt);
          setIsAskCaosOpen(true);
        }}
      />

      {/* Global ⌘J Ask CAOS Side Panel */}
      <AskCaosPanel
        isOpen={isAskCaosOpen}
        onClose={() => {
          setIsAskCaosOpen(false);
          setAskCaosPrompt(undefined);
        }}
        state={state}
        contextAnchor={contextAnchor}
        onNavigate={navigate}
        initialPrompt={askCaosPrompt}
      />
    </Shell>
  );
}
