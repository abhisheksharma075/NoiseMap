import { NoiseReading, NoiseIncident } from './index';

export type ChatRole = 'user' | 'assistant';
export type AIProviderType = 'gemini' | 'openai';

export interface ProviderSessionInfo {
  provider: AIProviderType;
  model: string;
  sessionToken?: string;
  maskedKey?: string;
  expiresAt?: number;
  isServerDefault?: boolean;
  apiKey?: string;
  mode?: 'server_session' | 'client_direct';
}

export interface ConnectProviderRequest {
  provider: AIProviderType;
  apiKey: string;
  testOnly?: boolean;
}

export interface ConnectProviderResponse {
  success: boolean;
  valid?: boolean;
  provider?: AIProviderType;
  model?: string;
  sessionToken?: string;
  maskedKey?: string;
  expiresAt?: number;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface MapActionPayload {
  type: 'focus_location' | 'show_incident' | 'open_incident_details';
  params: {
    lat?: number;
    lng?: number;
    zoom?: number;
    incident_id?: string;
    grid_id?: string;
  };
  label?: string;
}

export interface ComplaintDraftPayload {
  draftId?: string;
  incidentId?: string | null;
  locationName: string;
  zoneType?: string;
  dominantSource: string;
  description: string;
  averageDb?: number;
  peakDb?: number;
  cpcbLimit?: number;
  exceedanceDb?: number;
  contributorCount?: number;
  evidenceConfidenceScore?: number;
}

export interface ToolCallExecution {
  tool: string;
  args?: Record<string, any>;
  resultSummary?: {
    ok?: boolean;
    recordsReturned?: number;
    action?: any;
    draft?: any;
  };
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  status?: 'sending' | 'success' | 'error';
  errorMessage?: string;
  toolsUsed?: ToolCallExecution[];
  suggestedAction?: MapActionPayload;
  complaintDraft?: ComplaintDraftPayload;
  relatedQuestions?: string[];
}

export type FaqCategoryType =
  | 'ABOUT NOISEMAP'
  | 'UNDERSTANDING NOISE LEVELS'
  | 'NOISE MAP'
  | 'NOISE INCIDENTS'
  | 'REPORTING NOISE'
  | 'PRIVACY AND SECURITY';

export interface FaqItem {
  id: string;
  category: FaqCategoryType;
  question: string;
  alternatives: string[];
  keywords: string[];
  answer: string;
  relatedQuestions?: string[];
  relatedAction?: MapActionPayload;
}

export interface ChatApiRequest {
  message: string;
  providerSessionToken?: string;
  history?: Array<{
    role: 'user' | 'assistant' | 'model';
    content: string;
  }>;
  context?: {
    readings?: NoiseReading[];
    incidents?: NoiseIncident[];
    area?: string;
    selectedIncident?: NoiseIncident | null;
    selectedGrid?: string | null;
    userCoordinates?: { lat: number; lng: number } | null;
  };
}

export interface ChatApiResponse {
  success: boolean;
  message?: string;
  model?: string;
  toolsUsed?: ToolCallExecution[];
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
}

export interface SuggestedQuestion {
  id: string;
  category: string;
  question: string;
}

export const DEFAULT_SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: 'q1',
    category: 'LIVE DATA',
    question: 'What are the latest noise readings?',
  },
  {
    id: 'q2',
    category: 'INCIDENTS',
    question: 'Are there any active noise incidents right now?',
  },
  {
    id: 'q3',
    category: 'TRENDS',
    question: 'Has the noise level increased or decreased in the last 24 hours?',
  },
  {
    id: 'q4',
    category: 'STATISTICS',
    question: 'Give me a noise summary and CPCB exceedance breakdown.',
  },
  {
    id: 'q5',
    category: 'HEALTH & SAFETY',
    question: 'How can I reduce my daily noise exposure?',
  },
  {
    id: 'q6',
    category: 'COVERAGE',
    question: 'What is the current NoiseMap data coverage and availability?',
  },
];
