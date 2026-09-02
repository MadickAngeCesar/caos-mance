import { 
  Organization, 
  Contact, 
  Opportunity, 
  Activity, 
  Task, 
  ContentItem, 
  Session, 
  FreelanceProfile, 
  Playbook, 
  OutreachSequence, 
  SequenceStepInstance, 
  CustomFieldDefinition, 
  PlannedActivity,
  ResearchResult
} from '../types';

const STORAGE_KEY = 'caos_store_v1';

// Initial Realistic Seed Data for Higher Education & Digitalization Consulting
export const defaultFreelanceProfile: FreelanceProfile = {
  name: "Alexandre Vane",
  businessName: "Vane Digital Systems",
  location: "Douala, Cameroon / Sub-Saharan Africa",
  languages: ["English", "French"],
  experienceSummary: "8+ years engineering robust web applications, campus management portals, and cloud infrastructure for higher educational institutions and academies.",
  niche: "Higher Education Digitalization & Custom Academic Portals",
  industries: ["Higher Education", "Vocational Institutes", "Professional Training Centers"],
  idealClients: "Private and public universities with 1,500-15,000 students running fragmented legacy spreadsheets or outdated desktop software.",
  geographicMarkets: "Central & West Africa, Emerging Markets",
  positioningStatement: "We build reliable, mobile-first academic and student management portals that cut enrollment wait times by 80% and eliminate tuition reconciliation errors.",
  services: [
    "Modular Student Information & Enrollment Portals (SIS)",
    "Online Tuition & Mobile Money Payment Integration",
    "Digital Exam & Transcript Generation Workflows",
    "Campus Cloud Migration & Database Modernization"
  ],
  offers: [
    {
      id: "off-1",
      name: "Institutional Portal Sprint (Starter)",
      description: "Automated student registration, digital admissions, and fee payment reconciliation in 6 weeks.",
      deliverables: ["Admissions Portal", "Tuition Payment Gateway", "Admin Dashboard", "Staff Training"],
      price: "$4,500 - $8,000",
      terms: "50% upfront, 50% on UAT sign-off. Includes 60 days post-launch support.",
      isActive: true,
    },
    {
      id: "off-2",
      name: "Full Academic ERP Overhaul",
      description: "End-to-end digitalization covering grades, student records, course scheduling, and transcripts.",
      deliverables: ["Full SIS Architecture", "Student Mobile Portal", "Faculty Grading Module", "Security Audit"],
      price: "$12,000 - $25,000",
      terms: "Milestone-based (30/30/30/10). Annual SLA support option.",
      isActive: true,
    }
  ],
  preferredChannels: ["Email", "WhatsApp", "LinkedIn", "In-Person Meetings"],
  outreachStyle: "Consultative, problem-first, respectful, referencing concrete regional case metrics.",
  followupStyle: "Gentle, value-adding check-in sharing lightweight checklists or architecture insights.",
  communicationStyle: "Pragmatic, clear, jargon-free technical advisory.",
  workingDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
  dailyTimeBudgetMinutes: 150, // 2h 30m
  aiTone: "professional, consultative, concise",
  aiWritingStyle: "Technical clarity with high business empathy",
};

export const defaultCustomFields: CustomFieldDefinition[] = [
  {
    id: "cf-1",
    name: "Student Population",
    fieldType: "number",
    isRequired: false,
    entityType: "organization",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "cf-2",
    name: "Existing Software System",
    fieldType: "select",
    options: ["Paper & Spreadsheets", "Legacy Desktop App", "Open-Source CMS", "Proprietary ERP", "None"],
    isRequired: false,
    entityType: "organization",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "cf-3",
    name: "Number of Campuses",
    fieldType: "number",
    isRequired: false,
    entityType: "organization",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "cf-4",
    name: "Annual Intake Period",
    fieldType: "text",
    isRequired: false,
    entityType: "organization",
    sortOrder: 4,
    isActive: true,
  },
];

export const defaultSequence: OutreachSequence = {
  id: "seq-default",
  name: "Standard Institutional Sequence (5-Touch)",
  isDefault: true,
  steps: [
    { id: "s-1", dayOffset: 0, stepType: "initial_outreach", defaultChannel: "email", sortOrder: 1 },
    { id: "s-2", dayOffset: 3, stepType: "followup_1", defaultChannel: "email", sortOrder: 2 },
    { id: "s-3", dayOffset: 7, stepType: "followup_2", defaultChannel: "whatsapp", sortOrder: 3 },
    { id: "s-4", dayOffset: 14, stepType: "value_asset", defaultChannel: "email", sortOrder: 4 },
    { id: "s-5", dayOffset: 30, stepType: "nurture_check", defaultChannel: "linkedin", sortOrder: 5 },
  ],
};

export const defaultPlaybooks: Playbook[] = [
  {
    id: "pb-research-1",
    name: "University Digital Infrastructure Research",
    workflowType: "research",
    instructions: "Identify student enrollment size, current registration bottlenecks, payment friction, and strategic faculty leaders.",
    tone: "Analytical, grounded, objective",
    rulesToFollow: [
      "Distinguish between verified domain facts and inferred operational pain points.",
      "Check if website has SSL, mobile responsiveness, and online application portal.",
      "Highlight potential ROI in saved administrative hours."
    ],
    thingsToAvoid: ["Do not assume western SaaS solutions fit without local payment gateway adaptations."],
    examples: [
      {
        inputContext: "University of Douala with 25k students, manual registration queues in August.",
        desiredOutput: "Focus on automated queue registration & MTN/Orange mobile money integration."
      }
    ],
    version: 1,
    isActive: true,
  },
  {
    id: "pb-outreach-1",
    name: "Consultative Education Outreach",
    workflowType: "outreach",
    instructions: "Write a 3-paragraph consultative note to the Dean or IT Director focusing on student registration speed and financial audit trails.",
    tone: "Respectful, peer-level technical advisor",
    rulesToFollow: [
      "Reference their specific city/context in the first sentence.",
      "Ask a single frictionless question at the end."
    ],
    thingsToAvoid: ["Do not pitch generic software packages in the first message."],
    examples: [
      {
        inputContext: "Vice Dean at ISET Yaoundé.",
        desiredOutput: "Subject: Streamlining September registration queues at ISET"
      }
    ],
    version: 1,
    isActive: true,
  },
  {
    id: "pb-content-1",
    name: "Authority & Case Insight Generator",
    workflowType: "content",
    instructions: "Generate actionable breakdowns and case analyses showcasing technical mastery in high-load educational systems.",
    tone: "Authoritative, educational, pragmatic",
    rulesToFollow: ["Use concrete numbers (hours, percentages, error rates)."],
    thingsToAvoid: ["Vague buzzwords without implementation details."],
    examples: [],
    version: 1,
    isActive: true,
  }
];

export const defaultOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "University of Douala (Faculty of Sciences)",
    organizationType: "Public University Faculty",
    country: "Cameroon",
    city: "Douala",
    address: "Campus Principal, PK17",
    website: "https://univ-douala.cm",
    email: "rectorat@univ-douala.cm",
    phone: "+237 233 42 15 28",
    stage: "engaged",
    priority: "high",
    leadScore: 84,
    nextAction: "Send Digital Architecture Proposal draft",
    nextActionDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days overdue for realistic demonstration
    lastContactDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    tags: ["High Volume", "Academic Portal", "Active Lead"],
    notes: "Met Dean of Faculty last Tuesday. They are losing 3 weeks every semester reconciling bank deposit slips manually.",
    customFields: {
      "cf-1": 14000,
      "cf-2": "Paper & Spreadsheets",
      "cf-3": 2,
      "cf-4": "September & February"
    },
    digitalizationProfile: {
      overallScore: 4.8,
      updatedAt: new Date().toISOString(),
      scores: [
        { dimensionId: "d1", name: "Website & Public Info", score: 6, source: "manual", confirmed: true },
        { dimensionId: "d2", name: "Online Admissions", score: 3, source: "ai_suggested", confirmed: true, confidence: "High" },
        { dimensionId: "d3", name: "Student Portal / Grades", score: 4, source: "ai_suggested", confirmed: true, confidence: "High" },
        { dimensionId: "d4", name: "Tuition / Fee Payment", score: 2, source: "manual", confirmed: true },
        { dimensionId: "d5", name: "Exam & Transcript Processing", score: 3, source: "ai_suggested", confirmed: true },
        { dimensionId: "d6", name: "Staff & Faculty Management", score: 5, source: "manual", confirmed: true },
        { dimensionId: "d7", name: "Library & Digital Resources", score: 7, source: "manual", confirmed: true },
        { dimensionId: "d8", name: "Reporting & Auditing", score: 4, source: "ai_suggested", confirmed: true },
      ]
    },
    latestResearch: {
      id: "res-1",
      version: 1,
      organizationId: "org-1",
      organizationProfile: {
        text: "University of Douala is one of the premier academic hubs in Central Africa with over 45,000 students across multiple faculties.",
        classification: "Verified"
      },
      digitalPresence: {
        text: "Official website is static WordPress; no self-service student dashboard or automated course enrollment.",
        classification: "Verified"
      },
      existingSystems: {
        text: "Local standalone desktop spreadsheets in registrar's office. Tuition is paid in bank branches and verified via paper slips.",
        classification: "AI Inference"
      },
      painPoints: [
        { text: "Long physical queues stretching 4+ hours during peak registration weeks", classification: "AI Inference" },
        { text: "Revenue leakages and 14-day delays in bank payment verification", classification: "AI Inference" },
        { text: "Manual transcript calculation creating 2-month graduate backlog", classification: "Verified" }
      ],
      opportunities: [
        { text: "Deploy a custom modern student portal with Orange & MTN Mobile Money API reconciliation", classification: "AI Recommendation" },
        { text: "Digitize grades upload module for professors with automated GPA calculation", classification: "AI Recommendation" }
      ],
      relevantServices: [
        { text: "Modular SIS Portal Sprint ($6,500)", classification: "AI Recommendation" },
        { text: "Cloud Hosting & Automated Backups", classification: "AI Recommendation" }
      ],
      decisionMakers: [
        { text: "Prof. Emmanuel N. (Faculty Dean) — Approver", classification: "AI Inference" },
        { text: "Dr. Paul M. (Director of IT) — Technical Evaluator", classification: "AI Inference" }
      ],
      personalizationNotes: {
        text: "Highlight elimination of long queues and instant SMS confirmation of fee payments.",
        classification: "AI Recommendation"
      },
      qualification: {
        text: "Premier target: massive student base, vocal leadership desire to modernize, funded budget.",
        classification: "AI Recommendation",
        suggestedScore: 88
      },
      recommendedApproach: {
        text: "Deliver a clickable prototype demonstrating the 3-step online enrollment flow.",
        classification: "AI Recommendation"
      },
      sources: [
        { claim: "Official university registry", url: "https://univ-douala.cm/about" }
      ],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "org-2",
    name: "ISET Yaoundé (Higher Institute of Tech)",
    organizationType: "Private Engineering Institute",
    country: "Cameroon",
    city: "Yaoundé",
    address: "Biyem-Assi, Yaoundé",
    website: "https://isetyaounde.org",
    email: "contact@isetyaounde.org",
    phone: "+237 677 88 99 00",
    stage: "contacted",
    priority: "high",
    leadScore: 76,
    nextAction: "Send Day 3 follow-up regarding portal security audit",
    nextActionDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day overdue
    lastContactDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    tags: ["Engineering", "Private Institute"],
    notes: "Sent initial outreach on Friday. Dean showed interest in student attendance tracking.",
    customFields: {
      "cf-1": 3200,
      "cf-2": "Legacy Desktop App",
      "cf-3": 1,
      "cf-4": "October"
    },
    digitalizationProfile: {
      overallScore: 5.2,
      updatedAt: new Date().toISOString(),
      scores: [
        { dimensionId: "d1", name: "Website & Public Info", score: 7, source: "manual", confirmed: true },
        { dimensionId: "d2", name: "Online Admissions", score: 4, source: "ai_suggested", confirmed: true },
        { dimensionId: "d3", name: "Student Portal / Grades", score: 5, source: "manual", confirmed: true },
        { dimensionId: "d4", name: "Tuition / Fee Payment", score: 3, source: "manual", confirmed: true },
        { dimensionId: "d5", name: "Exam & Transcript Processing", score: 4, source: "ai_suggested", confirmed: true },
        { dimensionId: "d6", name: "Staff & Faculty Management", score: 6, source: "manual", confirmed: true },
        { dimensionId: "d7", name: "Library & Digital Resources", score: 6, source: "manual", confirmed: true },
        { dimensionId: "d8", name: "Reporting & Auditing", score: 5, source: "ai_suggested", confirmed: true },
      ]
    },
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "org-3",
    name: "St. Jerome Catholic University Institute",
    organizationType: "Private Catholic University",
    country: "Cameroon",
    city: "Douala",
    website: "https://univ-saintjerome.org",
    email: "info@univ-saintjerome.org",
    phone: "+237 233 40 50 60",
    stage: "lead",
    priority: "medium",
    leadScore: 62,
    nextAction: "Execute initial Research with Gemini",
    nextActionDate: new Date().toISOString(), // Due today
    tags: ["High Prestige", "Polytechnic"],
    notes: "Well funded private institution. High tuition fees, quality-conscious leadership.",
    customFields: {
      "cf-1": 2800,
      "cf-2": "Proprietary ERP",
      "cf-3": 1
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "org-4",
    name: "PKFokam Institute of Excellence",
    organizationType: "Business & Tech Academy",
    country: "Cameroon",
    city: "Yaoundé",
    website: "https://pkfokam-ie.org",
    stage: "qualified",
    priority: "medium",
    leadScore: 58,
    nextAction: "Draft initial personalized email to Registrar",
    nextActionDate: new Date(Date.now() + 86400000 * 1).toISOString(), // Due tomorrow
    tags: ["American Curriculum", "Premium"],
    notes: "Affiliated with US universities. Looking for modern e-learning integrations.",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "org-5",
    name: "National Polytechnic Bambili",
    organizationType: "Technical University",
    country: "Cameroon",
    city: "Bamenda",
    website: "https://npb-edu.org",
    stage: "lead",
    priority: "low",
    leadScore: 40,
    nextAction: "Verify contact details for ICT department",
    nextActionDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    tags: ["Public Polytechnic"],
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

export const defaultContacts: Contact[] = [
  {
    id: "con-1",
    organizationId: "org-1",
    name: "Prof. Emmanuel Ndjock",
    jobTitle: "Dean of Faculty of Sciences",
    stakeholderType: "Decision Maker",
    email: "e.ndjock@univ-douala.cm",
    phone: "+237 699 11 22 33",
    linkedinUrl: "https://linkedin.com/in/prof-ndjock",
    isDecisionMaker: true,
    notes: "Direct budget authority. Prefers WhatsApp voice briefings or in-person demonstrations."
  },
  {
    id: "con-2",
    organizationId: "org-1",
    name: "Dr. Paul Manga",
    jobTitle: "Chief Technology & Infrastructure Officer",
    stakeholderType: "Technical Evaluator",
    email: "p.manga@univ-douala.cm",
    phone: "+237 677 44 55 66",
    isDecisionMaker: false,
    notes: "Concerned about data backup security and server maintenance costs."
  },
  {
    id: "con-3",
    organizationId: "org-2",
    name: "Dr. Sylvie Kenfack",
    jobTitle: "Academic Director & Registrar",
    stakeholderType: "Decision Maker",
    email: "s.kenfack@isetyaounde.org",
    phone: "+237 655 22 33 44",
    isDecisionMaker: true,
    notes: "Focuses heavily on student satisfaction and reducing queue bottlenecks."
  }
];

export const defaultOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    organizationId: "org-1",
    organizationName: "University of Douala (Faculty of Sciences)",
    name: "Student Registration & Online Payment Portal",
    description: "Deployment of custom modular student admissions, mobile payment gateway, and digital clearance portal.",
    stage: "discovery",
    estimatedValue: 7500,
    probability: 60,
    weightedValue: 4500,
    expectedCloseDate: new Date(Date.now() + 86400000 * 20).toISOString(),
    nextAction: "Finalize Discovery notes & generate formal Proposal",
    nextActionDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    discoveryNotes: {
      questions: "1. What is the current delay in fee reconciliation?\n2. What mobile money APIs are required (Orange / MTN)?",
      painPoints: "14,000 students queuing at physical bank branches. Manual receipt auditing takes 3 weeks.",
      goals: "100% online self-registration for next academic semester.",
      requirements: "Mobile Money API, Student ID card barcode scanner, Cloud hosting on VPS.",
      budget: "$6,000 - $8,500 allocated for Q4 tech modernize fund.",
      timeline: "6 weeks rollout before October intake.",
      decisionMakers: "Dean Emmanuel Ndjock (Approver), IT Director Manga (Technical Sign-off).",
      nextSteps: "Present architecture brief and price breakdown on Friday.",
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    solutionDraft: {
      version: 1,
      problem: "Manual student fee verification causes massive administrative bottlenecks and revenue leakages during enrollment.",
      proposedSolution: "Custom React/Node portal with integrated Mobile Money webhook listener and instant student clearance PDF generation.",
      features: [
        "Self-service student enrollment form with document upload",
        "Instant Orange Money & MTN MoMo payment confirmation",
        "Automated PDF registration slip with verifiable QR Code",
        "Real-time administrative ledger and daily cash reconciliation dashboard"
      ],
      architectureApproach: "Containerized Docker app, PostgreSQL/SQLite local cache, automated nightly cloud backups.",
      deliverables: ["Admissions Portal", "Admin Management Console", "Payment Webhook Engine", "3x Staff Training Sessions"],
      timeline: "Week 1-2: Core DB & Payment API; Week 3-4: Student Portal UI; Week 5: Testing & Staff Training; Week 6: Launch.",
      pricing: "$7,500 flat milestone package ($3,750 on contract, $3,750 on delivery).",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    proposalDraft: {
      version: 1,
      status: "draft",
      content: `PROPOSAL: MODERN DIGITAL REGISTRATION & PAYMENT PORTAL
PREPARED FOR: University of Douala (Faculty of Sciences)
PREPARED BY: Alexandre Vane (Vane Digital Systems)

1. EXECUTIVE SUMMARY
University of Douala manages over 14,000 science students. The current manual registration process requires students to make physical bank deposits, causing 3-week clearance delays and heavy administrative overhead. Vane Digital Systems proposes a modern, secure, web-based Student Registration & Automated Payment Portal.

2. CORE DELIVERABLES
- Automated Student Registration & Document Verification
- Direct Orange Money & MTN MoMo Payment Gateway
- Instant Verifiable Registration Slips with QR Code Verification
- Registrar Finance Dashboard with Real-Time Reconciliation

3. TIMELINE & INVESTMENT
Total Project Fee: $7,500 USD
Timeline: 6 weeks from kickoff to production deployment.
Includes 60 days of full warranty and staff onboarding.`,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

export const defaultSequenceStepInstances: SequenceStepInstance[] = [
  {
    id: "ssi-1",
    organizationId: "org-1",
    organizationName: "University of Douala (Faculty of Sciences)",
    contactId: "con-1",
    contactName: "Prof. Emmanuel Ndjock",
    sequenceId: "seq-default",
    stepIndex: 2,
    dayOffset: 3,
    channel: "email",
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days overdue
    status: "pending",
    previousMessageSnapshot: "Hi Prof. Ndjock, I noticed your faculty is expanding enrollment this season. We recently deployed an automated registration system cutting queue wait times by 80%..."
  },
  {
    id: "ssi-2",
    organizationId: "org-2",
    organizationName: "ISET Yaoundé (Higher Institute of Tech)",
    contactId: "con-3",
    contactName: "Dr. Sylvie Kenfack",
    sequenceId: "seq-default",
    stepIndex: 2,
    dayOffset: 3,
    channel: "email",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day overdue
    status: "pending",
    previousMessageSnapshot: "Hi Dr. Kenfack, following up on our discussion regarding digital student attendance and fee management..."
  }
];

export const defaultContentItems: ContentItem[] = [
  {
    id: "cnt-1",
    contentType: "case_study",
    title: "How University of Buea Reduced Registration Delays by 75% Using a Lightweight SIS",
    idea: "Break down the architecture of replacing manual paper bank slips with direct mobile payment verification.",
    draft: "When evaluating campus digitalization, administrators often believe they must purchase expensive monolithic ERP software costing $50,000+. In this technical teardown, we analyze how a tailored 4-module portal achieved superior results in 6 weeks...",
    status: "draft",
    isAiAssisted: true,
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "cnt-2",
    contentType: "post",
    title: "5 Hidden Security Vulnerabilities in Legacy Campus Portals",
    idea: "Actionable checklist for Deans and IT Directors prior to semester exam season.",
    draft: "Before mid-term registrations open, verify these 5 vulnerability points in your campus database...",
    status: "ready",
    isAiAssisted: true,
    scheduledDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

export const defaultActivities: Activity[] = [
  {
    id: "act-1",
    entityType: "organization",
    entityId: "org-1",
    contactId: "con-1",
    contactNameSnapshot: "Prof. Emmanuel Ndjock",
    activityType: "meeting",
    channel: "In-Person",
    content: "30-minute discovery meeting in Dean's office. Reviewed current fee collection pain and agreed to review proposal on Friday.",
    outcome: "Advanced to Engaged stage. Agreed to prepare proposal.",
    occurredAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "act-2",
    entityType: "organization",
    entityId: "org-2",
    contactId: "con-3",
    contactNameSnapshot: "Dr. Sylvie Kenfack",
    activityType: "email",
    channel: "Email",
    content: "Sent initial personalized consultative outreach note highlighting automated enrollment workflows.",
    occurredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

export const defaultTasks: Task[] = [
  {
    id: "tsk-1",
    title: "Review University of Douala Architecture Proposal",
    description: "Polish deliverables and pricing breakdown before sending to Dean Ndjock.",
    entityType: "opportunity",
    entityId: "opp-1",
    entityName: "University of Douala (Faculty of Sciences)",
    dueDate: new Date().toISOString(),
    estimatedDurationMinutes: 25,
    userPriority: "high",
    status: "pending",
    source: "manual"
  },
  {
    id: "tsk-2",
    title: "Send Day 3 follow-up to Dr. Kenfack (ISET Yaoundé)",
    description: "Follow up with portal security case breakdown.",
    entityType: "organization",
    entityId: "org-2",
    entityName: "ISET Yaoundé (Higher Institute of Tech)",
    dueDate: new Date().toISOString(),
    estimatedDurationMinutes: 10,
    userPriority: "high",
    status: "pending",
    source: "sequence"
  },
  {
    id: "tsk-3",
    title: "Research digital infrastructure at St. Jerome Catholic University",
    description: "Run Gemini Deep Research to uncover current software and leadership contacts.",
    entityType: "organization",
    entityId: "org-3",
    entityName: "St. Jerome Catholic University Institute",
    dueDate: new Date().toISOString(),
    estimatedDurationMinutes: 15,
    userPriority: "medium",
    status: "pending",
    source: "manual"
  }
];

// App Store State
export interface AppStoreState {
  profile: FreelanceProfile;
  organizations: Organization[];
  contacts: Contact[];
  opportunities: Opportunity[];
  activities: Activity[];
  tasks: Task[];
  contentItems: ContentItem[];
  playbooks: Playbook[];
  sequences: OutreachSequence[];
  sequenceStepInstances: SequenceStepInstance[];
  customFields: CustomFieldDefinition[];
  sessions: Session[];
  activeSession: Session | null;
  todayTimeBudgetMinutes: number;
  streakCount: number;
}

// Deterministic Lead Scoring Formula (SRS BR-002)
export function computeLeadScore(org: Partial<Organization>): number {
  let score = 0;
  
  // 1. Field completeness (0-30 pts)
  let fieldsFilled = 0;
  const targetFields = [org.name, org.organizationType, org.city, org.country, org.website, org.phone, org.email, org.notes];
  targetFields.forEach(f => { if (f && String(f).trim().length > 0) fieldsFilled++; });
  score += Math.round((fieldsFilled / targetFields.length) * 30);

  // 2. Engagement Recency (0-30 pts)
  if (org.lastContactDate) {
    const daysSince = Math.floor((Date.now() - new Date(org.lastContactDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 3) score += 30;
    else if (daysSince <= 7) score += 25;
    else if (daysSince <= 14) score += 18;
    else if (daysSince <= 30) score += 10;
    else score += 4;
  } else {
    score += 8; // Fresh lead baseline
  }

  // 3. Stage Progression (0-25 pts)
  const stageWeights: Record<string, number> = {
    lead: 6,
    researching: 10,
    qualified: 15,
    contacted: 20,
    engaged: 25,
    nurture: 8,
    disqualified: 0
  };
  score += stageWeights[org.stage || 'lead'] || 5;

  // 4. Priority Boost (0-15 pts)
  if (org.priority === 'high') score += 15;
  else if (org.priority === 'medium') score += 10;
  else score += 5;

  return Math.min(100, Math.max(0, score));
}

// Deterministic Daily Planning Engine (SRS FR-PLAN-002 / SDD §8.1)
export function generateDailyPlan(state: AppStoreState, availableMinutes: number = 150): PlannedActivity[] {
  const now = new Date();
  const candidates: PlannedActivity[] = [];

  // 1. Overdue Sequence Follow-ups (Rank score 100+)
  state.sequenceStepInstances
    .filter(s => s.status === 'pending' && new Date(s.dueDate) < now)
    .forEach(seq => {
      const daysOverdue = Math.max(1, Math.floor((now.getTime() - new Date(seq.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
      candidates.push({
        id: `plan-seq-${seq.id}`,
        kind: 'overdue_followup',
        title: `Follow up: ${seq.organizationName}`,
        entityType: 'organization',
        entityId: seq.organizationId,
        entityName: seq.organizationName,
        reason: `Overdue ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`,
        urgencyBadge: { text: `Overdue ${daysOverdue}d`, variant: daysOverdue > 2 ? 'destructive' : 'warning' },
        estimatedMinutes: 6,
        rankScore: 100 + daysOverdue * 10,
        data: seq,
      });
    });

  // 2. Tasks Due Today / Overdue (Rank score 80)
  state.tasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .forEach(t => {
      const isOverdue = t.dueDate && new Date(t.dueDate) < now;
      candidates.push({
        id: `plan-task-${t.id}`,
        kind: 'task_due_today',
        title: t.title,
        entityType: t.entityType,
        entityId: t.entityId,
        entityName: t.entityName,
        reason: isOverdue ? 'Action needed today' : 'Scheduled task',
        urgencyBadge: isOverdue ? { text: 'Due Today', variant: 'warning' } : undefined,
        estimatedMinutes: t.estimatedDurationMinutes || 15,
        rankScore: t.userPriority === 'high' ? 85 : 75,
        data: t,
      });
    });

  // 3. Stale High Priority Prospects (Rank score 60)
  state.organizations
    .filter(o => o.priority === 'high' && !o.deletedAt && (!o.lastContactDate || (now.getTime() - new Date(o.lastContactDate).getTime()) > 86400000 * 7))
    .forEach(o => {
      if (!candidates.some(c => c.entityId === o.id)) {
        candidates.push({
          id: `plan-org-${o.id}`,
          kind: 'stale_high_priority_org',
          title: `Research & Reach Out: ${o.name}`,
          entityType: 'organization',
          entityId: o.id,
          entityName: o.name,
          reason: 'High priority with no recent activity',
          urgencyBadge: { text: 'Stale Lead', variant: 'info' },
          estimatedMinutes: 12,
          rankScore: 65,
          data: o,
        });
      }
    });

  // 4. Content Creation Gaps (Rank score 35)
  const draftContent = state.contentItems.find(c => c.status === 'idea' || c.status === 'draft');
  if (draftContent) {
    candidates.push({
      id: `plan-content-${draftContent.id}`,
      kind: 'content_gap',
      title: `Authority Post: ${draftContent.title}`,
      entityType: 'content',
      entityId: draftContent.id,
      reason: 'Regular weekly thought leadership',
      estimatedMinutes: 15,
      rankScore: 35,
      data: draftContent,
    });
  }

  // Sort descending by rank
  candidates.sort((a, b) => b.rankScore - a.rankScore);

  // Greedy time-box against availableMinutes
  const plan: PlannedActivity[] = [];
  let usedMinutes = 0;
  for (const c of candidates) {
    if (usedMinutes + c.estimatedMinutes <= availableMinutes + 10) {
      plan.push(c);
      usedMinutes += c.estimatedMinutes;
    }
  }

  // Fallback suggestion if empty
  if (plan.length === 0) {
    plan.push({
      id: 'plan-fallback-1',
      kind: 'prospecting_backlog',
      title: 'Source 3 New Educational Institutions',
      reason: 'Keep pipeline active with new prospects',
      estimatedMinutes: 20,
      rankScore: 20,
    });
  }

  return plan;
}

// Storage Load / Save
export function loadStore(): AppStoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        profile: parsed.profile || defaultFreelanceProfile,
        organizations: parsed.organizations || defaultOrganizations,
        contacts: parsed.contacts || defaultContacts,
        opportunities: parsed.opportunities || defaultOpportunities,
        activities: parsed.activities || defaultActivities,
        tasks: parsed.tasks || defaultTasks,
        contentItems: parsed.contentItems || defaultContentItems,
        playbooks: parsed.playbooks || defaultPlaybooks,
        sequences: parsed.sequences || [defaultSequence],
        sequenceStepInstances: parsed.sequenceStepInstances || defaultSequenceStepInstances,
        customFields: parsed.customFields || defaultCustomFields,
        sessions: parsed.sessions || [],
        activeSession: parsed.activeSession || null,
        todayTimeBudgetMinutes: parsed.todayTimeBudgetMinutes || 150,
        streakCount: parsed.streakCount || 5,
      };
    }
  } catch (e) {
    console.error("Failed to load store, using seed defaults:", e);
  }

  return {
    profile: defaultFreelanceProfile,
    organizations: defaultOrganizations,
    contacts: defaultContacts,
    opportunities: defaultOpportunities,
    activities: defaultActivities,
    tasks: defaultTasks,
    contentItems: defaultContentItems,
    playbooks: defaultPlaybooks,
    sequences: [defaultSequence],
    sequenceStepInstances: defaultSequenceStepInstances,
    customFields: defaultCustomFields,
    sessions: [],
    activeSession: null,
    todayTimeBudgetMinutes: 150,
    streakCount: 5,
  };
}

export function calculateLeadScore(org: Partial<Organization>, contacts: Contact[] = []): number {
  let score = computeLeadScore(org);
  // Bonus if decision maker contact exists
  if (contacts.some(c => c.isDecisionMaker || c.stakeholderType === 'Decision Maker')) {
    score = Math.min(100, score + 10);
  }
  // Bonus if deep research has been completed
  if (org.latestResearch) {
    score = Math.min(100, score + 10);
  }
  return score;
}

export function resetStoreToSeed(): AppStoreState {
  const seedState: AppStoreState = {
    profile: defaultFreelanceProfile,
    organizations: [],
    contacts: [],
    opportunities: [],
    activities: [],
    tasks: [],
    contentItems: [],
    playbooks: defaultPlaybooks,
    sequences: [defaultSequence],
    sequenceStepInstances: [],
    customFields: defaultCustomFields,
    sessions: [],
    activeSession: null,
    todayTimeBudgetMinutes: 150,
    streakCount: 0,
  };
  saveStore(seedState);
  return seedState;
}

export function saveStore(state: AppStoreState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save store:", e);
  }
}
