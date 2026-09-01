/**
 * CAOS — Client Acquisition Operating System
 * Domain Types and Interfaces
 */

export type OrgStage = 
  | 'lead' 
  | 'researching' 
  | 'qualified' 
  | 'contacted' 
  | 'engaged' 
  | 'nurture' 
  | 'disqualified';

export type OppStage = 
  | 'discovery' 
  | 'proposal' 
  | 'negotiation' 
  | 'won' 
  | 'lost';

export type Priority = 'low' | 'medium' | 'high';

export type ActionClassification = 'Verified' | 'AI Inference' | 'AI Recommendation' | 'Unknown';

export interface CustomFieldDefinition {
  id: string;
  name: string;
  fieldType: 'text' | 'long_text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect' | 'url';
  options?: string[];
  isRequired: boolean;
  industryId?: string;
  entityType: 'organization' | 'opportunity';
  sortOrder: number;
  isActive: boolean;
}

export interface Contact {
  id: string;
  organizationId: string;
  name: string;
  jobTitle?: string;
  stakeholderType?: 'Decision Maker' | 'Technical Evaluator' | 'Financial Approver' | 'Influencer' | 'User' | 'Other';
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  whatsapp?: string;
  isDecisionMaker: boolean;
  notes?: string;
}

export interface DigitalizationDimensionScore {
  dimensionId: string;
  name: string;
  score: number; // 1 to 10
  source: 'manual' | 'ai_suggested';
  confirmed: boolean;
  confidence?: 'High' | 'Medium' | 'Low';
  evidence?: string;
  notes?: string;
}

export interface DigitalizationProfile {
  overallScore: number;
  updatedAt: string;
  scores: DigitalizationDimensionScore[];
}

export interface ResearchSection {
  text: string;
  classification: ActionClassification;
}

export interface ResearchResult {
  id: string;
  version: number;
  organizationId: string;
  organizationProfile: ResearchSection;
  digitalPresence: ResearchSection;
  existingSystems: ResearchSection;
  painPoints: { text: string; classification: ActionClassification }[];
  opportunities: { text: string; classification: ActionClassification }[];
  relevantServices: { text: string; classification: ActionClassification }[];
  decisionMakers: { text: string; classification: ActionClassification }[];
  personalizationNotes: ResearchSection;
  qualification: { text: string; classification: ActionClassification; suggestedScore?: number };
  recommendedApproach: ResearchSection;
  sources: { claim: string; url: string }[];
  createdAt: string;
  model?: string;
}

export interface Activity {
  id: string;
  entityType: 'organization' | 'opportunity';
  entityId: string;
  contactId?: string;
  contactNameSnapshot?: string;
  activityType: 'email' | 'whatsapp' | 'linkedin' | 'phone_call' | 'meeting' | 'note' | 'follow_up' | 'proposal' | 'stage_change';
  channel?: string;
  content: string;
  response?: string;
  outcome?: string;
  occurredAt: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  organizationType?: string;
  industryId?: string;
  country?: string;
  city?: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  socialAccounts?: { linkedin?: string; twitter?: string; facebook?: string };
  stage: OrgStage;
  priority: Priority;
  leadScore: number; // computed deterministically 0-100
  nextAction?: string;
  nextActionDate?: string;
  lastContactDate?: string;
  tags?: string[];
  notes?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  rating?: number;
  userRatingsTotal?: number;
  customFields?: Record<string, any>;
  digitalizationProfile?: DigitalizationProfile;
  latestResearch?: ResearchResult;
  researchHistory?: ResearchResult[];
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveredProspect {
  id: string;
  name: string;
  organizationType?: string;
  industry?: string;
  city?: string;
  country?: string;
  address?: string;
  website?: string;
  phone?: string;
  rating?: number;
  userRatingsTotal?: number;
  googlePlaceId?: string;
  latitude?: number;
  longitude?: number;
  source: 'google_maps' | 'gemini' | 'hybrid';
  estimatedSize?: string;
  currentDigitalState?: string;
  keyPainPoints?: string[];
  recommendedAngle?: string;
  estimatedLeadScore?: number;
  suggestedNextStep?: string;
  isExisting?: boolean;
}

export interface Opportunity {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  description?: string;
  stage: OppStage;
  estimatedValue: number;
  recurringValue?: number;
  probability: number; // 0 to 100
  weightedValue: number; // estimatedValue * (probability / 100)
  expectedCloseDate?: string;
  nextAction?: string;
  nextActionDate?: string;
  notes?: string;
  discoveryNotes?: {
    questions?: string;
    painPoints?: string;
    goals?: string;
    requirements?: string;
    budget?: string;
    timeline?: string;
    decisionMakers?: string;
    objections?: string;
    nextSteps?: string;
    updatedAt?: string;
  };
  auditDraft?: {
    version: number;
    content: string;
    isAiGenerated: boolean;
    createdAt: string;
  };
  solutionDraft?: {
    version: number;
    problem?: string;
    proposedSolution?: string;
    features?: string[];
    architectureApproach?: string;
    deliverables?: string[];
    timeline?: string;
    pricing?: string;
    createdAt: string;
  };
  proposalDraft?: {
    version: number;
    content: string;
    status: 'draft' | 'sent' | 'negotiation' | 'accepted' | 'rejected';
    sentAt?: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SequenceStep {
  id: string;
  dayOffset: number;
  stepType: string;
  defaultChannel: 'email' | 'whatsapp' | 'linkedin' | 'phone_call' | 'sms';
  sortOrder: number;
}

export interface OutreachSequence {
  id: string;
  name: string;
  isDefault: boolean;
  steps: SequenceStep[];
}

export interface SequenceStepInstance {
  id: string;
  organizationId: string;
  organizationName: string;
  contactId?: string;
  contactName?: string;
  sequenceId: string;
  stepIndex: number;
  dayOffset: number;
  channel: string;
  dueDate: string;
  status: 'pending' | 'sent' | 'responded' | 'skipped';
  previousMessageSnapshot?: string;
}

export interface ContentItem {
  id: string;
  contentType: 'post' | 'article' | 'case_study' | 'whatsapp_status';
  title: string;
  idea?: string;
  draft?: string;
  status: 'idea' | 'draft' | 'ready' | 'published';
  scheduledDate?: string;
  publishedAt?: string;
  isAiAssisted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  taskType?: string;
  entityType?: 'organization' | 'opportunity';
  entityId?: string;
  entityName?: string;
  contactId?: string;
  dueDate?: string;
  estimatedDurationMinutes?: number;
  userPriority: Priority;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedAt?: string;
  source: 'manual' | 'sequence' | 'ai_suggested';
  notes?: string;
}

export interface PlannedActivity {
  id: string;
  kind: 'overdue_followup' | 'task_due_today' | 'stale_high_priority_org' | 'opportunity_next_action' | 'content_gap' | 'prospecting_backlog';
  title: string;
  entityType?: 'organization' | 'opportunity' | 'content' | 'task';
  entityId?: string;
  entityName?: string;
  reason?: string;
  urgencyBadge?: { text: string; variant: 'warning' | 'destructive' | 'info' };
  estimatedMinutes: number;
  rankScore: number;
  data?: any;
}

export interface Session {
  id: string;
  startedAt: string;
  endedAt?: string;
  plannedMinutes: number;
  actualMinutes?: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  activitiesCompleted: number;
  activitiesSkipped: number;
  completedActivities: {
    activityId: string;
    title: string;
    action: 'completed' | 'skipped' | 'snoozed';
    durationSeconds: number;
  }[];
}

export interface FreelanceProfile {
  name: string;
  businessName: string;
  location: string;
  languages: string[];
  experienceSummary: string;
  niche: string;
  industries: string[];
  idealClients: string;
  geographicMarkets: string;
  positioningStatement: string;
  services: string[];
  offers: {
    id: string;
    name: string;
    description: string;
    deliverables: string[];
    price: string;
    terms: string;
    isActive: boolean;
  }[];
  preferredChannels: string[];
  outreachStyle: string;
  followupStyle: string;
  communicationStyle: string;
  workingDays: string[]; // e.g. ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  dailyTimeBudgetMinutes: number; // default 150 (2h30m)
  aiTone: string;
  aiWritingStyle: string;
}

export interface Playbook {
  id: string;
  name: string;
  workflowType: 'research' | 'outreach' | 'followup' | 'discovery' | 'proposal' | 'content';
  industryScope?: string;
  instructions: string;
  tone: string;
  rulesToFollow: string[];
  thingsToAvoid: string[];
  examples: { inputContext?: string; desiredOutput: string; isPinned?: boolean }[];
  version: number;
  isActive: boolean;
}
