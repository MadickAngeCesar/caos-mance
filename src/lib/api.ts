/**
 * CAOS API Client
 * Proxies AI operations to backend with optional user API Key and model preference
 */

export const STORAGE_KEY_GEMINI_API = 'caos_gemini_api_key';
export const STORAGE_KEY_GEMINI_MODEL = 'caos_gemini_model_pref';
export const STORAGE_KEY_GMAPS_API = 'caos_gmaps_api_key';
export const STORAGE_KEY_CUSTOM_API_URL = 'caos_custom_api_url';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_API_URL);
    if (customUrl && customUrl.trim() !== '') {
      return customUrl.trim().replace(/\/+$/, '');
    }
    // If running in packaged Electron or file:// protocol, target local backend or custom port
    if (window.location.protocol === 'file:' || (window as any).electronAPI?.isElectron) {
      return 'http://localhost:3000';
    }
  }
  return '';
}

export function apiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
}

export function getGoogleMapsApiKey(): string {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem(STORAGE_KEY_GMAPS_API);
    if (customKey && customKey.trim() !== '') {
      return customKey.trim();
    }
  }
  try {
    return (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  } catch {
    return '';
  }
}

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
    const gmapsKey = localStorage.getItem(STORAGE_KEY_GMAPS_API);
    if (gmapsKey && gmapsKey.trim() !== '') {
      headers['x-google-maps-api-key'] = gmapsKey.trim();
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
  const response = await fetch(apiUrl('/api/ai/test-key'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ apiKey }),
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text.slice(0, 200));
    throw new Error('Invalid JSON response from server');
  }
}

export async function requestResearch(payload: {
  organization: any;
  profile: any;
  playbook?: any;
  userInstruction?: string;
  preferredModel?: string;
}) {
  const response = await fetch(apiUrl('/api/ai/research'), {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Research request failed: ${response.statusText}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text.slice(0, 200));
    throw new Error('Invalid JSON response from server');
  }
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
  const response = await fetch(apiUrl('/api/ai/outreach'), {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Outreach draft failed: ${response.statusText}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text.slice(0, 200));
    throw new Error('Invalid JSON response from server');
  }
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
  const response = await fetch(apiUrl('/api/ai/followup'), {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Follow-up draft failed: ${response.statusText}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text.slice(0, 200));
    throw new Error('Invalid JSON response from server');
  }
}

export async function requestContentIdeas(payload: {
  profile: any;
  topicSeed?: string;
  contentType?: string;
  count?: number;
  preferredModel?: string;
}) {
  const response = await fetch(apiUrl('/api/ai/content'), {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Content generation failed: ${response.statusText}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text.slice(0, 200));
    throw new Error('Invalid JSON response from server');
  }
}

export async function requestProposal(payload: {
  opportunity: any;
  organization: any;
  profile: any;
  discoveryNotes?: any;
  angle?: string;
  preferredModel?: string;
}) {
  const response = await fetch(apiUrl('/api/ai/proposal'), {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Proposal generation failed: ${response.statusText}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text.slice(0, 200));
    throw new Error('Invalid JSON response from server');
  }
}

export async function requestCommand(payload: {
  query: string;
  context?: any;
  crmSnapshot?: any;
  preferredModel?: string;
}) {
  const response = await fetch(apiUrl('/api/ai/command'), {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Command failed: ${response.statusText}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text.slice(0, 200));
    throw new Error('Invalid JSON response from server');
  }
}

export async function fetchMapsConfig(): Promise<{
  status: string;
  hasKey: boolean;
  isEnvConfigured: boolean;
  demoKeyUrl: string;
  consoleKeyUrl: string;
}> {
  const response = await fetch(apiUrl('/api/maps/config'), {
    method: 'GET',
    headers: getAIHeaders(),
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text.slice(0, 200));
    throw new Error('Invalid JSON response from server');
  }
}

export async function searchGooglePlaces(payload: {
  query: string;
  locationBias?: { latitude: number; longitude: number; radius?: number };
  pageSize?: number;
  languageCode?: string;
}): Promise<{
  success: boolean;
  places: any[];
  count: number;
  error?: string;
  needApiKey?: boolean;
  demoKeyUrl?: string;
}> {
  const response = await fetch(apiUrl('/api/maps/places-search'), {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text.slice(0, 200));
    throw new Error('Invalid JSON response from server');
  }
  if (!response.ok) {
    throw new Error(data.error || `Places search failed with status ${response.status}`);
  }
  return data;
}

export async function findProspectsWithAI(payload: {
  industry?: string;
  city?: string;
  country?: string;
  searchQuery?: string;
  organizationType?: string;
  specificCriteria?: string;
  targetPainPoints?: string;
  targetSize?: string;
  quantity?: number;
  includeDigitalAudit?: boolean;
  profile?: any;
  preferredModel?: string;
}): Promise<{
  success: boolean;
  prospects: any[];
  count: number;
  model?: string;
  fallbackOccurred?: boolean;
  simulated?: boolean;
  error?: string;
}> {
  const response = await fetch(apiUrl('/api/ai/find-prospects'), {
    method: 'POST',
    headers: getAIHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON response:', text.slice(0, 200));
    throw new Error('Invalid JSON response from server');
  }
  if (!response.ok) {
    throw new Error(data.error || `AI Prospect search failed with status ${response.status}`);
  }
  return data;
}


