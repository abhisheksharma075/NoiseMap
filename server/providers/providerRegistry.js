/**
 * NoiseMap AI Copilot - Unified Provider Registry
 * Dispatches validation and text generation requests to the active provider (Gemini or OpenAI).
 */

import { validateGeminiKey, generateGeminiResponse, GEMINI_CONFIG } from './geminiProvider.js';
import { validateOpenAiKey, generateOpenAiResponse, OPENAI_CONFIG } from './openaiProvider.js';

export const SUPPORTED_PROVIDERS = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Connect using your Gemini API key.',
    defaultModel: GEMINI_CONFIG.DEFAULT_MODEL,
    officialKeyUrl: 'https://aistudio.google.com/apikey',
    recommended: true,
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'Connect using your OpenAI API key for GPT models.',
    defaultModel: OPENAI_CONFIG.DEFAULT_MODEL,
    officialKeyUrl: 'https://platform.openai.com/api-keys',
    recommended: false,
  },
};

/**
 * Validates credentials for the specified provider
 */
export async function validateProviderCredential(provider, apiKey, fetchFn = globalThis.fetch) {
  if (!provider || typeof provider !== 'string') {
    return {
      valid: false,
      code: 'UNSUPPORTED_PROVIDER',
      message: 'Provider is required and must be either "gemini" or "openai".',
    };
  }

  const normalized = provider.toLowerCase().trim();
  if (normalized === 'gemini') {
    return validateGeminiKey(apiKey, fetchFn);
  }
  if (normalized === 'openai') {
    return validateOpenAiKey(apiKey, fetchFn);
  }

  return {
    valid: false,
    code: 'UNSUPPORTED_PROVIDER',
    message: `Unsupported provider "${provider}". Supported options: "gemini", "openai".`,
  };
}

/**
 * Dispatches a chat generation request to the selected provider adapter
 */
export async function generateProviderResponse({
  provider = 'gemini',
  apiKey,
  model,
  message,
  history = [],
  context = {},
  timeoutMs,
  fetchFn = globalThis.fetch,
}) {
  const normalized = String(provider).toLowerCase().trim();

  if (normalized === 'gemini') {
    return generateGeminiResponse({
      apiKey,
      model,
      message,
      history,
      context,
      timeoutMs,
      fetchFn,
    });
  }

  if (normalized === 'openai') {
    return generateOpenAiResponse({
      apiKey,
      model,
      message,
      history,
      context,
      timeoutMs,
      fetchFn,
    });
  }

  const error = new Error(`Unsupported AI provider "${provider}".`);
  error.code = 'UNSUPPORTED_PROVIDER';
  error.statusCode = 400;
  throw error;
}
