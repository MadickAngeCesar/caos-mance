/**
 * CAOS API Client
 * Proxies AI operations to backend with optional user API Key and model preference
 */

export const STORAGE_KEY_GEMINI_API = 'caos_gemini_api_key';
export const STORAGE_KEY_GEMINI_MODEL = 'caos_gemini_model_pref';

function getAIHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem(STORAGE_KEY_GEMINI_API);
    if (customKey && customKey.trim() !== '') {
      headers['x-gemini-api-key'] = customKey.trim();
    }
    const modelPref = localStorage.getItem(STORAGE_KEY_GEMINI_MODEL);
    if (modelPref && modelPref.trim() !== '') {
      headers['x-gemini-model-preference'] = modelPref.trim();
    }
  }

  return headers;
}

export async function testGeminiApiKey(apiKey?: string): Promise<{
  success: boolean;
  modelTested?: string;
  message?: string;
  error?: string;
}> {
  const headers = getAIHeaders();
  const response = await fetch('/api/ai/test-key', {
    method: 'POST',
    headers,
    body: JSON.stringify({ apiKey }),
  });
  return response.json();
}

export async function requestResearch(payload: {
  organization: any;
  profile: any;
  playbook?: any;
  userInstruction?: string;
  preferredModel?: string;
}) {
  const response = await fetch('/api/ai/research', {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Research request failed: ${response.statusText}`);
  }
  return response.json();
}

export async function requestOutreach(payload: {
  organization: any;
  contact?: any;
  profile: any;
  channel: string;
  playbook?: any;
  tone?: string;
  length?: string;
  userInstruction?: string;
  preferredModel?: string;
}) {
  const response = await fetch('/api/ai/outreach', {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Outreach draft failed: ${response.statusText}`);
  }
  return response.json();
}

export async function requestFollowup(payload: {
  organization: any;
  contact?: any;
  stepNumber: number;
  dayOffset: number;
  previousMessage?: string;
  channel: string;
  profile: any;
  playbook?: any;
  userInstruction?: string;
  preferredModel?: string;
}) {
  const response = await fetch('/api/ai/followup', {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Follow-up draft failed: ${response.statusText}`);
  }
  return response.json();
}

export async function requestContentIdeas(payload: {
  profile: any;
  topicSeed?: string;
  contentType?: string;
  count?: number;
  preferredModel?: string;
}) {
  const response = await fetch('/api/ai/content', {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Content generation failed: ${response.statusText}`);
  }
  return response.json();
}

export async function requestProposal(payload: {
  opportunity: any;
  organization: any;
  profile: any;
  discoveryNotes?: any;
  angle?: string;
  preferredModel?: string;
}) {
  const response = await fetch('/api/ai/proposal', {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Proposal generation failed: ${response.statusText}`);
  }
  return response.json();
}

export async function requestCommand(payload: {
  query: string;
  context?: any;
  crmSnapshot?: any;
  preferredModel?: string;
}) {
  const response = await fetch('/api/ai/command', {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Command failed: ${response.statusText}`);
  }
  return response.json();
}

