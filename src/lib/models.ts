export interface GeminiModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  category: 'primary' | 'lite' | 'live' | 'legacy';
  recommendedFor?: string;
  freeTierFriendly?: boolean;
}

export const AVAILABLE_MODELS: GeminiModelOption[] = [
  {
    id: 'auto',
    name: 'Auto (Recommended - Dynamic Free-Tier Cascade)',
    badge: 'Smart Route',
    description: 'Attempts Gemini 3.7 Flash for deep intelligence and smoothly cascades to lighter models if rate-limited.',
    category: 'primary',
    recommendedFor: 'General CRM usage, lead analysis, high-speed drafting',
    freeTierFriendly: true,
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    badge: 'Flagship Speed',
    description: 'High-speed multimodal reasoning and rich outreach copywriting with state-of-the-art accuracy.',
    category: 'primary',
    recommendedFor: 'Complex proposal drafting & in-depth company digitalization audits',
    freeTierFriendly: true,
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    badge: 'Next-Gen Lite',
    description: 'Ultra-fast, high-throughput model engineered for high concurrency and robust daily workflows.',
    category: 'lite',
    recommendedFor: 'Rapid lead enrichment, quick email subject generation, batch processing',
    freeTierFriendly: true,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra-Low Latency',
    description: 'Optimized for near-instant responses with minimal quota consumption on free-tier keys.',
    category: 'lite',
    recommendedFor: 'Instant command palette responses, live search suggestions',
    freeTierFriendly: true,
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    badge: 'Free-Tier Resilient',
    description: 'Lightweight foundation model with generous free request limits and reliable structured output.',
    category: 'lite',
    recommendedFor: 'Budget accounts, high-frequency outreach drafting, fallback stability',
    freeTierFriendly: true,
  },
  {
    id: 'gemini-3-flash-live',
    name: 'Gemini 3 Flash Live',
    badge: 'Live Interactive',
    description: 'Sub-second conversational streaming and interactive co-pilot capabilities.',
    category: 'live',
    recommendedFor: 'Interactive voice/chat discovery, real-time command assistance',
    freeTierFriendly: true,
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    badge: 'Balanced',
    description: 'Solid balance of context handling and execution performance.',
    category: 'primary',
    recommendedFor: 'General outreach workflows',
    freeTierFriendly: true,
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    badge: 'Stable Track',
    description: 'Auto-updating stable flash alias ensuring continuous compatibility.',
    category: 'primary',
    recommendedFor: 'Production stability',
    freeTierFriendly: true,
  },
];

export function getModelMeta(modelId: string): GeminiModelOption {
  return AVAILABLE_MODELS.find((m) => m.id === modelId) || AVAILABLE_MODELS[0];
}
