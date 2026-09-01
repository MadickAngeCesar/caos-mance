import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Dynamic initializer for Gemini client (supporting request-specific key or env key)
function getAIForRequest(req: express.Request): { client: GoogleGenAI | null; apiKeyUsed: boolean } {
  const customKey = (req.headers["x-gemini-api-key"] as string) || (req.body && req.body.apiKey);
  const key = customKey && customKey.trim() !== "" ? customKey.trim() : process.env.GEMINI_API_KEY;
  if (!key) return { client: null, apiKeyUsed: false };

  const client = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  return { client, apiKeyUsed: true };
}

// Model fallback cascade optimized for free-tier credits & reliability
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

async function generateWithBestModel(
  ai: GoogleGenAI,
  contents: string,
  systemInstruction: string,
  preferredModel?: string,
  temperature: number = 0.4
): Promise<{ text: string; modelUsed: string; fallbackOccurred: boolean }> {
  const modelList = preferredModel && preferredModel !== "auto"
    ? [preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== preferredModel)]
    : CANDIDATE_MODELS;

  let lastError: any = null;
  for (let i = 0; i < modelList.length; i++) {
    const model = modelList[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature,
        },
      });
      return {
        text: response.text || "{}",
        modelUsed: model,
        fallbackOccurred: i > 0,
      };
    } catch (err: any) {
      console.warn(`Model attempt ${model} failed, trying next candidate:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error("All candidate Gemini models failed to respond.");
}

// 1. Health check & status
app.get("/api/health", (req, res) => {
  const customKey = req.headers["x-gemini-api-key"] as string;
  const hasEnvKey = !!process.env.GEMINI_API_KEY;
  res.json({ 
    status: "ok", 
    aiConfigured: hasEnvKey || (!!customKey && customKey.trim() !== ""),
    envConfigured: hasEnvKey,
    defaultRecommendedModel: "gemini-2.5-flash"
  });
});

// Test custom API Key endpoint
app.post("/api/ai/test-key", async (req, res) => {
  const { apiKey } = req.body;
  const keyToTest = apiKey || (req.headers["x-gemini-api-key"] as string) || process.env.GEMINI_API_KEY;

  if (!keyToTest) {
    return res.status(400).json({ success: false, error: "No API key provided to test." });
  }

  try {
    const testAi = new GoogleGenAI({ apiKey: keyToTest.trim() });
    const result = await testAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Respond with strict JSON: {\"status\": \"ok\", \"message\": \"API Key Validated\"}",
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(result.text || "{}");
    res.json({
      success: true,
      modelTested: "gemini-2.5-flash",
      message: "API Key is active and operational for free-tier and standard operations.",
      details: parsed,
    });
  } catch (error: any) {
    // Try fallback to gemini-2.0-flash or gemini-1.5-flash
    try {
      const testAi = new GoogleGenAI({ apiKey: keyToTest.trim() });
      const fallbackResult = await testAi.models.generateContent({
        model: "gemini-1.5-flash",
        contents: "Respond with strict JSON: {\"status\": \"ok\", \"message\": \"API Key Validated on Fallback\"}",
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });
      const parsed = JSON.parse(fallbackResult.text || "{}");
      return res.json({
        success: true,
        modelTested: "gemini-1.5-flash",
        message: "API Key validated successfully on high-rate-limit fallback model (Gemini 1.5 Flash).",
        details: parsed,
      });
    } catch (fallbackError: any) {
      res.status(400).json({
        success: false,
        error: error.message || fallbackError.message || "Failed to validate API key with Gemini.",
      });
    }
  }
});

// 2. AI Research with Gemini
app.post("/api/ai/research", async (req, res) => {
  try {
    const { organization, profile, playbook, userInstruction, preferredModel } = req.body;
    const { client: ai } = getAIForRequest(req);

    if (!ai) {
      // Fallback structured simulation if key not yet provided
      return res.json({
        success: true,
        data: generateSimulatedResearch(organization),
        simulated: true,
        model: "offline-fallback",
      });
    }

    const systemInstruction = `You are an expert B2B client acquisition researcher and digital transformation consultant assisting a solo freelance technology consultant.
Analyze the target organization and provide a comprehensive, realistic, and highly actionable research report.
Output STRICT JSON matching this schema:
{
  "organizationProfile": { "text": string, "classification": "Verified" | "AI Inference" | "AI Recommendation" | "Unknown" },
  "digitalPresence": { "text": string, "classification": "Verified" | "AI Inference" | "AI Recommendation" | "Unknown" },
  "existingSystems": { "text": string, "classification": "Verified" | "AI Inference" | "AI Recommendation" | "Unknown" },
  "painPoints": [{ "text": string, "classification": "Verified" | "AI Inference" | "AI Recommendation" | "Unknown" }],
  "opportunities": [{ "text": string, "classification": "Verified" | "AI Inference" | "AI Recommendation" | "Unknown" }],
  "relevantServices": [{ "text": string, "classification": "Verified" | "AI Inference" | "AI Recommendation" | "Unknown" }],
  "decisionMakers": [{ "text": string, "classification": "Verified" | "AI Inference" | "AI Recommendation" | "Unknown" }],
  "personalizationNotes": { "text": string, "classification": "Verified" | "AI Inference" | "AI Recommendation" | "Unknown" },
  "qualification": { "text": string, "classification": "Verified" | "AI Inference" | "AI Recommendation" | "Unknown", "suggestedScore": number },
  "recommendedApproach": { "text": string, "classification": "Verified" | "AI Inference" | "AI Recommendation" | "Unknown" },
  "sources": [{ "claim": string, "url": string }]
}`;

    const prompt = `TARGET ORGANIZATION:
Name: ${organization.name}
Type: ${organization.organizationType || "Institution"}
Website: ${organization.website || "N/A"}
Location: ${organization.city || ""}, ${organization.country || ""}
Notes: ${organization.notes || ""}
Custom Attributes: ${JSON.stringify(organization.customFields || {})}

FREELANCE CONSULTANT PROFILE:
Niche: ${profile?.niche || "Digital Transformation & Custom Software Development"}
Services: ${JSON.stringify(profile?.services || ["Student Portals", "Cloud Migration", "Automated Workflows"])}
Positioning: ${profile?.positioningStatement || "Building modern, reliable software for expanding educational institutions."}

PLAYBOOK RULES:
${playbook?.instructions || "Be precise, identify concrete digital modernization opportunities, avoid generic buzzwords."}

${userInstruction ? `ADDITIONAL USER INSTRUCTION: ${userInstruction}` : ""}`;

    const modelPref = preferredModel || (req.headers["x-gemini-model-preference"] as string);
    const { text, modelUsed, fallbackOccurred } = await generateWithBestModel(
      ai,
      prompt,
      systemInstruction,
      modelPref,
      0.3
    );

    const parsed = JSON.parse(text || "{}");
    res.json({
      success: true,
      data: parsed,
      model: modelUsed,
      fallbackOccurred,
    });
  } catch (error: any) {
    console.error("AI Research Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate research" });
  }
});

// 3. AI Outreach Composer
app.post("/api/ai/outreach", async (req, res) => {
  try {
    const { organization, contact, profile, channel, playbook, tone, length, userInstruction, preferredModel } = req.body;
    const { client: ai } = getAIForRequest(req);

    if (!ai) {
      return res.json({
        success: true,
        data: {
          subject: channel === "email" ? `Modernizing digital infrastructure at ${organization?.name || "your institution"}` : undefined,
          body: `Hi ${contact?.name || "there"},\n\nI noticed ${organization?.name || "your organization"} is expanding its academic programs. Many institutions in ${organization?.city || "the region"} face friction managing student admissions and portal workflows.\n\nI specialize in tailored digitalization systems for higher education. Would you be open to a 10-minute introductory conversation this Thursday to share how other institutions streamlined their registration?`,
          channel,
        },
        simulated: true,
      });
    }

    const systemInstruction = `You are a high-performing outreach copywriter for a solo freelance software engineer / digital transformation consultant.
Generate an authentic, concise, highly personalized outreach message for the specified channel.
Strictly adhere to:
- No pushy sales jargon ("supercharge", "synergy", "game-changer").
- Sound like a respected, pragmatic technical peer.
- Channel constraints:
  * Email: include a sharp subject line and 3-paragraph body.
  * WhatsApp / SMS: friendly, concise (under 80 words), clear single question CTA.
  * LinkedIn: personalized connection/inMail note, reference specific mutual context.
  * Phone Script: conversational talking points and hook.
Output JSON: { "subject": string (optional), "body": string, "hookReason": string }`;

    const prompt = `PROSPECT & CONTACT:
Organization: ${organization?.name} (${organization?.city || ""}, ${organization?.country || ""})
Website: ${organization?.website || "N/A"}
Contact: ${contact?.name || "Decision Maker"} (${contact?.jobTitle || "Director / Dean"})
Channel: ${channel}
Tone: ${tone || "professional, consultative"}
Length: ${length || "medium"}

RESEARCH HIGHLIGHTS:
${organization?.latestResearchSummary || "Focus on digital student management and portal modernization"}

FREELANCE PROFILE:
Positioning: ${profile?.positioningStatement || "Modern digital systems for institutions"}
Offers: ${JSON.stringify(profile?.offers || [])}

PLAYBOOK INSTRUCTIONS:
${playbook?.instructions || "Focus on practical problem-solving rather than self-promotion."}

${userInstruction ? `SPECIFIC INSTRUCTION: ${userInstruction}` : ""}`;

    const modelPref = preferredModel || (req.headers["x-gemini-model-preference"] as string);
    const { text, modelUsed, fallbackOccurred } = await generateWithBestModel(
      ai,
      prompt,
      systemInstruction,
      modelPref,
      0.5
    );

    const parsed = JSON.parse(text || "{}");
    res.json({ success: true, data: parsed, model: modelUsed, fallbackOccurred });
  } catch (error: any) {
    console.error("AI Outreach Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate outreach" });
  }
});

// 4. AI Follow-up Generator
app.post("/api/ai/followup", async (req, res) => {
  try {
    const { organization, contact, stepNumber, dayOffset, previousMessage, channel, profile, playbook, userInstruction, preferredModel } = req.body;
    const { client: ai } = getAIForRequest(req);

    if (!ai) {
      return res.json({
        success: true,
        data: {
          subject: channel === "email" ? `Quick follow-up regarding ${organization?.name || "our discussion"}` : undefined,
          body: `Hi ${contact?.name || "there"},\n\nFollowing up on my previous note. I put together a 1-page breakdown of how modern campus portals reduce student registration drop-off by 30%.\n\nHappy to forward it over if you'd find it useful for ${organization?.name || "your team"}.`,
        },
        simulated: true,
      });
    }

    const systemInstruction = `You are an expert client acquisition assistant. Draft a graceful, value-first follow-up message.
Rules:
- Never guilt the recipient ("Checking if you saw my email", "I haven't heard back").
- Provide a new useful angle, observation, or light case insight.
- Keep it brief (under 90 words for email, under 50 words for chat/messaging).
Output JSON: { "subject": string (optional), "body": string }`;

    const prompt = `FOLLOW-UP CONTEXT:
Organization: ${organization?.name}
Contact: ${contact?.name || "Stakeholder"}
Follow-up Sequence Step: Step ${stepNumber} (Day +${dayOffset})
Channel: ${channel}
Previous Sent Message: """${previousMessage || "Initial outreach introducing digital audit services"}"""

PLAYBOOK:
${playbook?.instructions || "Gentle, value-adding check-in."}
${userInstruction ? `USER INSTRUCTION: ${userInstruction}` : ""}`;

    const modelPref = preferredModel || (req.headers["x-gemini-model-preference"] as string);
    const { text, modelUsed, fallbackOccurred } = await generateWithBestModel(
      ai,
      prompt,
      systemInstruction,
      modelPref,
      0.4
    );

    const parsed = JSON.parse(text || "{}");
    res.json({ success: true, data: parsed, model: modelUsed, fallbackOccurred });
  } catch (error: any) {
    console.error("AI Follow-up Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate follow-up" });
  }
});

// 5. AI Content Planner & Ideation
app.post("/api/ai/content", async (req, res) => {
  try {
    const { profile, topicSeed, contentType, count = 3, preferredModel } = req.body;
    const { client: ai } = getAIForRequest(req);

    if (!ai) {
      return res.json({
        success: true,
        data: {
          ideas: [
            {
              title: "3 Costly Mistakes Universities Make When Deploying Student Management Software",
              contentType: "article",
              angle: "Technical breakdown of off-the-shelf vs modular architecture.",
              draft: "When evaluating campus digitalization, leadership often buys oversized legacy ERPs that cost 5x more in maintenance than bespoke micro-services...",
            },
            {
              title: "Case Breakdown: Cutting Enrollment Queue Times from 4 Hours to 6 Minutes",
              contentType: "case_study",
              angle: "Pragmatic metrics from a recent university portal upgrade.",
              draft: "Last semester, we audited a 4,000-student faculty where registration queues wrapped around the registrar's office...",
            },
            {
              title: "Quick Checklist for Dean & IT Directors: Is Your Exam Portal Secure for 2026?",
              contentType: "post",
              angle: "Actionable 5-point security audit checklist.",
              draft: "Before mid-term exams kick off, verify these 5 vulnerability points in your server configuration...",
            },
          ],
        },
        simulated: true,
      });
    }

    const systemInstruction = `You are a strategic thought leadership content creator for technical consultants.
Generate ${count} high-authority content ideas and ready-to-refine drafts that demonstrate deep domain competence in the consultant's niche.
Output JSON:
{
  "ideas": [
    {
      "title": string,
      "contentType": "post" | "article" | "case_study" | "whatsapp_status",
      "angle": string,
      "draft": string
    }
  ]
}`;

    const prompt = `CONSULTANT PROFILE:
Niche: ${profile?.niche || "Education Technology & Institutional Portals"}
Positioning: ${profile?.positioningStatement || "Engineering high-reliability digital workflows for universities and academies"}
Target Audience: Deans, University Registrars, IT Directors, School Founders
${topicSeed ? `TOPIC SEED / FOCUS: ${topicSeed}` : "Generate trending authority topics for institutional decision makers."}
${contentType ? `PREFERRED FORMAT: ${contentType}` : ""}`;

    const modelPref = preferredModel || (req.headers["x-gemini-model-preference"] as string);
    const { text, modelUsed, fallbackOccurred } = await generateWithBestModel(
      ai,
      prompt,
      systemInstruction,
      modelPref,
      0.7
    );

    const parsed = JSON.parse(text || "{}");
    res.json({ success: true, data: parsed, model: modelUsed, fallbackOccurred });
  } catch (error: any) {
    console.error("AI Content Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate content" });
  }
});

// 6. AI Proposal & Solution Generator
app.post("/api/ai/proposal", async (req, res) => {
  try {
    const { opportunity, organization, profile, discoveryNotes, angle, preferredModel } = req.body;
    const { client: ai } = getAIForRequest(req);

    if (!ai) {
      return res.json({
        success: true,
        data: {
          proposalContent: `PROPOSAL: ${opportunity?.name || "Digital Transformation Solution"}\n\nPREPARED FOR: ${organization?.name || "Client Institution"}\nPREPARED BY: ${profile?.name || "Vane Digital Systems"}\n\n1. EXECUTIVE SUMMARY\n${organization?.name || "The institution"} requires a robust, scalable digital solution to streamline operations and eliminate manual friction.\n\n2. PROPOSED SOLUTION & SCOPE\n- Deployment of automated web portal and administrative ledger\n- Secure cloud infrastructure and staff training\n\n3. COMMERCIAL TERMS & TIMELINE\n- Total Investment: $${opportunity?.estimatedValue || 7500}\n- Delivery Timeline: 4-6 weeks\n- Payment Terms: 50% upfront deposit, 50% upon successful acceptance test.`,
          features: [
            "Online self-service portal with responsive UI",
            "Automated payment and transaction reconciliation",
            "Real-time administrative analytics dashboard",
            "Staff training and 60-day post-launch support"
          ],
          timeline: "Week 1-2: Core DB & API Setup; Week 3-4: Portal UI; Week 5: Testing & Training; Week 6: Production Launch.",
          deliverables: ["Custom Web Application", "Admin Management Console", "User Documentation", "Deployment & Hosting Config"],
        },
        simulated: true,
      });
    }

    const systemInstruction = `You are an elite B2B technology proposal writer and solutions architect for a solo software engineering consultant.
Generate a structured, persuasive, and commercially compelling formal project proposal and technical solution breakdown based on the client's discovery notes.
Output STRICT JSON:
{
  "proposalContent": string,
  "problemSummary": string,
  "proposedSolution": string,
  "features": string[],
  "deliverables": string[],
  "architectureApproach": string,
  "timeline": string,
  "pricing": string
}`;

    const prompt = `CLIENT & OPPORTUNITY CONTEXT:
Organization: ${organization?.name || "Institutional Client"} (${organization?.city || ""}, ${organization?.country || ""})
Opportunity Name: ${opportunity?.name || "Modernization Project"}
Estimated Deal Value: $${opportunity?.estimatedValue || 0}
Recurring Value: $${opportunity?.recurringValue || 0} / month

CONSULTANT PROFILE:
Name: ${profile?.name || "Consultant"}
Business: ${profile?.businessName || "Digital Consulting"}
Positioning: ${profile?.positioningStatement || "Engineering high-reliability digital workflows"}
Services Offered: ${JSON.stringify(profile?.services || [])}

DISCOVERY NOTES & REQUIREMENTS:
${JSON.stringify(discoveryNotes || opportunity?.discoveryNotes || {})}
${angle ? `SPECIAL FOCUS / ANGLE: ${angle}` : ""}`;

    const modelPref = preferredModel || (req.headers["x-gemini-model-preference"] as string);
    const { text, modelUsed, fallbackOccurred } = await generateWithBestModel(
      ai,
      prompt,
      systemInstruction,
      modelPref,
      0.3
    );

    const parsed = JSON.parse(text || "{}");
    res.json({ success: true, data: parsed, model: modelUsed, fallbackOccurred });
  } catch (error: any) {
    console.error("AI Proposal Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate proposal" });
  }
});

// 7. AI Command Center ("Ask CAOS")
app.post("/api/ai/command", async (req, res) => {
  try {
    const { query, context, crmSnapshot, preferredModel } = req.body;
    const { client: ai } = getAIForRequest(req);

    if (!ai) {
      return res.json({
        success: true,
        data: {
          narrative: `Based on your current pipeline with ${crmSnapshot?.prospectsCount || 0} prospects and ${crmSnapshot?.activeOppsCount || 0} active opportunities, your highest priority today is following up with overdue leads. You have 2 follow-ups ready for dispatch.`,
          actionChips: [
            { type: "START_SESSION", label: "Start Guided Session", target: "/session" },
            { type: "FOLLOW_UPS", label: "Open Follow-up Queue", target: "/outreach" },
            { type: "NEW_PROSPECT", label: "Add New Prospect", target: "/prospects" },
          ],
        },
        simulated: true,
      });
    }

    const systemInstruction = `You are CAOS, the intelligent Client Acquisition Operating System co-pilot.
Your mission is to keep the freelance developer focused, calm, and moving high-value acquisition activities forward.
Analyze the user's question, provide a succinct, actionable answer (under 120 words), and propose 1 to 4 actionable CRM chips.
Output JSON:
{
  "narrative": string,
  "actionChips": [
    {
      "type": "NAVIGATE" | "CREATE_TASK" | "GENERATE_MESSAGE" | "RESEARCH_PROSPECT" | "SCHEDULE_FOLLOWUP" | "OPEN_OPPORTUNITY",
      "label": string,
      "payload"?: any
    }
  ]
}`;

    const prompt = `USER QUERY: "${query}"
CURRENT CONTEXT ANCHOR: ${JSON.stringify(context || { scope: "General" })}

LIVE CRM METRICS:
Total Prospects: ${crmSnapshot?.prospectsCount || 0}
Active Opportunities: ${crmSnapshot?.activeOppsCount || 0}
Pipeline Value: $${crmSnapshot?.pipelineValue || 0}
Overdue Follow-ups: ${crmSnapshot?.overdueCount || 0}
Today's Scheduled Tasks: ${crmSnapshot?.tasksDueToday || 0}
Top Urgent Prospects: ${JSON.stringify(crmSnapshot?.topUrgent || [])}`;

    const modelPref = preferredModel || (req.headers["x-gemini-model-preference"] as string);
    const { text, modelUsed, fallbackOccurred } = await generateWithBestModel(
      ai,
      prompt,
      systemInstruction,
      modelPref,
      0.3
    );

    const parsed = JSON.parse(text || "{}");
    res.json({ success: true, data: parsed, model: modelUsed, fallbackOccurred });
  } catch (error: any) {
    console.error("AI Command Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to process command" });
  }
});

// Helper for offline fallback
function generateSimulatedResearch(org: any) {
  return {
    organizationProfile: {
      text: `${org?.name || "The institution"} is an established educational organization in ${org?.city || "the region"}. They cater to an estimated student body of 2,500+ with ongoing infrastructure modernization.`,
      classification: "Verified",
    },
    digitalPresence: {
      text: "Website has basic information but lacks a mobile-optimized student portal and automated self-service registration.",
      classification: "Verified",
    },
    existingSystems: {
      text: "Primarily legacy desktop databases and paper-based accounting workflows with disjointed spreadsheets.",
      classification: "AI Inference",
    },
    painPoints: [
      { text: "Long queue times during semester enrollment causing student drop-off", classification: "AI Inference" },
      { text: "Lack of centralized fee reconciliation leading to revenue leakages", classification: "AI Inference" },
      { text: "Delays in transcript and certificate generation", classification: "AI Inference" },
    ],
    opportunities: [
      { text: "Deploy a lightweight modular Student Management & Portal System", classification: "AI Recommendation" },
      { text: "Automate tuition collection with integrated mobile money / card gateway", classification: "AI Recommendation" },
    ],
    relevantServices: [
      { text: "Custom Web Application Development", classification: "AI Recommendation" },
      { text: "Database Modernization & Cloud Hosting", classification: "AI Recommendation" },
    ],
    decisionMakers: [
      { text: "Vice Chancellor / Dean (Strategic Approver)", classification: "AI Inference" },
      { text: "Director of ICT / Academic Registrar (Technical Evaluator)", classification: "AI Inference" },
    ],
    personalizationNotes: {
      text: "Highlight reduction in registration wait times and automated financial audit trails in all conversations.",
      classification: "AI Recommendation",
    },
    qualification: {
      text: "High fit — substantial student volume, existing infrastructure pain, and clear budget capacity for modernization.",
      classification: "AI Recommendation",
      suggestedScore: 84,
    },
    recommendedApproach: {
      text: "Initiate consultative outreach offering a complimentary 15-minute Digital Infrastructure Assessment.",
      classification: "AI Recommendation",
    },
    sources: [
      { claim: "Institutional profile & domain records", url: org?.website || "https://example.edu" },
    ],
  };
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CAOS backend and client running on http://localhost:${PORT}`);
  });
}

startServer();
