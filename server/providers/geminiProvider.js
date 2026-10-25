/**
 * NoiseMap AI Copilot - Google Gemini Provider Adapter
 * Implements Google GenAI Interactions API (@google/genai) with gemini-3.8-flash,
 * key validation, function calling, and multi-turn generation.
 */

import { GoogleGenAI } from '@google/genai';
import {
  AI_CONFIG,
  TRUSTED_SYSTEM_INSTRUCTION,
} from '../aiService.js';
import {
  getInteractionsToolDeclarations,
  executeTool,
  getServerReadings,
} from '../noiseMapTools.js';

export const GEMINI_CONFIG = {
  DEFAULT_MODEL: 'gemini-3.8-flash',
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
};

/**
 * Normalizes Gemini model identifiers.
 * Strips leading 'models/' prefix to prevent invalid paths (e.g. models/models/gemini-3.8-flash).
 * Upgrades deprecated 'gemini-2.5-flash' to 'gemini-3.8-flash'.
 */
export function normalizeGeminiModel(model) {
  if (!model || typeof model !== 'string') {
    return GEMINI_CONFIG.DEFAULT_MODEL;
  }
  let clean = model.trim();
  if (clean.startsWith('models/')) {
    clean = clean.slice(7);
  }
  if (clean === 'gemini-2.5-flash' || clean === '') {
    return GEMINI_CONFIG.DEFAULT_MODEL;
  }
  return clean;
}

/**
 * Adapter ensuring mock fetch functions and native Fetch API work seamlessly with @google/genai.
 */
function createFetchAdapter(fetchFn) {
  return async function adapterFetch(input, init) {
    if (typeof fetchFn !== 'function') {
      return globalThis.fetch(input, init);
    }
    let url = input;
    let options = init || {};
    if (input instanceof Request) {
      url = input.url;
      const headers = {};
      input.headers.forEach((v, k) => {
        headers[k] = v;
      });
      let body = init?.body;
      if (body === undefined) {
        try {
          body = await input.clone().text();
        } catch {
          // ignore
        }
      }
      options = {
        method: input.method,
        headers: { ...headers, ...(init?.headers || {}) },
        body,
        signal: input.signal || init?.signal,
      };
    }
    const raw = await fetchFn(url, options);
    if (raw instanceof Response) {
      return raw;
    }
    // If a test mock returned a plain object { ok, status, json }:
    if (raw && typeof raw === 'object' && typeof raw.json === 'function') {
      const data = await raw.json().catch(() => ({}));
      const headers =
        raw.headers instanceof Headers
          ? raw.headers
          : new Headers({ 'Content-Type': 'application/json' });
      return new Response(JSON.stringify(data), {
        status: raw.status || (raw.ok ? 200 : 500),
        statusText: raw.statusText || '',
        headers,
      });
    }
    return raw;
  };
}

/**
 * Validates a user-supplied Google Gemini API key by making a minimal test call via Interactions API.
 * Does NOT create a session if key is invalid or quota is exhausted.
 */
export async function validateGeminiKey(apiKey, fetchFn = globalThis.fetch) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return {
      valid: false,
      code: 'EMPTY_API_KEY',
      message: 'Please provide a non-empty Google Gemini API key.',
    };
  }

  const cleanKey = apiKey.trim();
  const model = GEMINI_CONFIG.DEFAULT_MODEL;

  try {
    const adapterFetch = createFetchAdapter(fetchFn);
    const ai = new GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: { fetch: adapterFetch },
    });

    const interaction = await ai.interactions.create({
      model,
      input: 'ping',
    });

    if (
      interaction &&
      (interaction.id ||
        interaction.output_text !== undefined ||
        interaction.status ||
        (Array.isArray(interaction.candidates) && interaction.candidates.length > 0) ||
        (Array.isArray(interaction.steps) && interaction.steps !== undefined))
    ) {
      return {
        valid: true,
        provider: 'gemini',
        model,
      };
    }

    return {
      valid: false,
      code: 'VALIDATION_FAILED',
      message: 'Gemini validation received an unexpected response format.',
    };
  } catch (err) {
    const status =
      err.status ||
      err.statusCode ||
      (typeof err.message === 'string' && err.message.includes('404')
        ? 404
        : err.message?.includes('400')
        ? 400
        : err.message?.includes('401')
        ? 401
        : err.message?.includes('403')
        ? 403
        : err.message?.includes('429')
        ? 429
        : 500);

    const providerMsg = err.message || '';

    if (status === 400 || status === 401 || status === 403) {
      return {
        valid: false,
        code: 'INVALID_API_KEY',
        message:
          'Invalid Google Gemini API key. Check your key at https://aistudio.google.com/apikey, then try again.',
      };
    }

    if (status === 429) {
      return {
        valid: false,
        code: 'QUOTA_EXCEEDED',
        message:
          'Your Google Gemini API key has exceeded its rate or quota limit. Please review your quota in Google AI Studio.',
      };
    }

    if (status === 404) {
      return {
        valid: false,
        code: 'MODEL_UNAVAILABLE',
        message: `Gemini model "${model}" is unavailable or not supported for this key on the Interactions API: ${providerMsg}`,
      };
    }

    return {
      valid: false,
      code: 'VALIDATION_FAILED',
      message: `Gemini validation rejected (HTTP ${status}): ${providerMsg || 'Please verify credentials.'}`,
    };
  }
}

/**
 * Executes a conversational request with multi-turn tool calling using a Gemini key and Interactions API.
 */
export async function generateGeminiResponse({
  apiKey,
  model = GEMINI_CONFIG.DEFAULT_MODEL,
  message,
  history = [],
  context = {},
  timeoutMs = AI_CONFIG.REQUEST_TIMEOUT_MS,
  fetchFn = globalThis.fetch,
}) {
  if (!apiKey) {
    const error = new Error('Gemini API key is required.');
    error.code = 'CONFIG_MISSING';
    error.statusCode = 401;
    throw error;
  }

  const cleanModel = normalizeGeminiModel(model);

  // Use client-provided readings snapshot if available, else server readings store
  const readingsDataset =
    Array.isArray(context?.readings) && context.readings.length > 0
      ? context.readings
      : getServerReadings();

  // Inject selected map and geolocation context if available
  let contextAugmentedMessage = message.trim();
  const contextHints = [];
  if (context?.selectedIncident) {
    contextHints.push(
      `[Active User Map Context: Viewing incident ${context.selectedIncident.id} in sector ${context.selectedIncident.grid_id} (${context.selectedIncident.avg_db} dB avg, source: ${context.selectedIncident.dominant_source})]`
    );
  } else if (context?.selectedGrid) {
    contextHints.push(`[Active User Map Context: Selected Sector Grid ${context.selectedGrid}]`);
  }
  if (context?.userCoordinates && typeof context.userCoordinates.lat === 'number') {
    contextHints.push(
      `[User GPS: (${context.userCoordinates.lat.toFixed(4)}, ${context.userCoordinates.lng.toFixed(4)})]`
    );
  }
  if (contextHints.length > 0) {
    contextAugmentedMessage = `${contextHints.join(' ')}\n\n${contextAugmentedMessage}`;
  }

  // Format multi-turn conversation into input
  let fullPrompt = contextAugmentedMessage;
  if (Array.isArray(history) && history.length > 0) {
    const historyLines = history
      .map((h) => `${h.role === 'user' ? 'Citizen' : 'NoiseMap Copilot'}: ${h.content}`)
      .join('\n\n');
    fullPrompt = `${historyLines}\n\nCitizen: ${contextAugmentedMessage}`;
  }

  const tools = getInteractionsToolDeclarations();
  const toolsUsed = [];

  const adapterFetch = createFetchAdapter(fetchFn);
  const ai = new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      timeout: timeoutMs,
      fetch: adapterFetch,
    },
  });

  try {
    let iteration = 0;
    let finalAnswer = '';
    let currentInteraction = null;

    while (iteration < AI_CONFIG.MAX_TOOL_CALL_ITERATIONS) {
      iteration++;

      if (iteration === 1) {
        currentInteraction = await ai.interactions.create({
          model: cleanModel,
          system_instruction: TRUSTED_SYSTEM_INSTRUCTION,
          input: fullPrompt,
          tools,
        });
      }

      // Check for function calls in steps or outputs or candidates
      let funcCall = null;

      if (Array.isArray(currentInteraction?.steps)) {
        funcCall = currentInteraction.steps.find(
          (s) => s.type === 'function_call' || s.function_call
        );
      }
      if (!funcCall && Array.isArray(currentInteraction?.outputs)) {
        funcCall = currentInteraction.outputs.find(
          (o) => o.type === 'function_call' || o.function_call
        );
      }
      if (!funcCall && Array.isArray(currentInteraction?.candidates)) {
        const parts = currentInteraction.candidates[0]?.content?.parts || [];
        const part = parts.find((p) => p.functionCall);
        if (part && part.functionCall) {
          funcCall = {
            id: `call_${Date.now()}`,
            name: part.functionCall.name,
            arguments: part.functionCall.args || {},
          };
        }
      }

      if (funcCall) {
        const toolName = funcCall.name;
        const toolArgs = funcCall.arguments || funcCall.args || {};
        const callId = funcCall.id || `call_${Date.now()}`;

        // Safely execute server-side tool
        const toolResult = executeTool(toolName, toolArgs, readingsDataset);
        toolsUsed.push({
          tool: toolName,
          args: toolArgs,
          resultSummary: {
            ok: toolResult.ok,
            recordsReturned:
              toolResult.returnedCount ??
              toolResult.returnedClustersCount ??
              toolResult.sampleCount ??
              0,
            action: toolResult.action,
            draft: toolResult.draft,
          },
        });

        // Submit function result back to Gemini via Interactions API
        currentInteraction = await ai.interactions.create({
          model: cleanModel,
          previous_interaction_id: currentInteraction.id,
          input: [
            {
              type: 'function_result',
              call_id: callId,
              name: toolName,
              result: toolResult,
            },
          ],
        });

        // Continue interaction loop
        continue;
      }

      // Model provided final text response
      if (
        typeof currentInteraction?.output_text === 'string' &&
        currentInteraction.output_text.trim()
      ) {
        finalAnswer = currentInteraction.output_text.trim();
        break;
      }

      if (
        typeof currentInteraction?.text === 'string' &&
        currentInteraction.text.trim()
      ) {
        finalAnswer = currentInteraction.text.trim();
        break;
      }

      if (Array.isArray(currentInteraction?.steps)) {
        const textStep = currentInteraction.steps.find(
          (s) => (s.type === 'model_output' || s.type === 'text') && s.text
        );
        if (textStep && textStep.text) {
          finalAnswer = textStep.text.trim();
          break;
        }
      }

      if (currentInteraction?.candidates?.[0]?.content?.parts?.[0]?.text) {
        finalAnswer = currentInteraction.candidates[0].content.parts[0].text.trim();
        break;
      }

      break;
    }

    if (!finalAnswer) {
      finalAnswer =
        'NoiseMap Copilot analyzed the environmental data but was unable to formulate a complete answer. Please rephrase your question.';
    }

    return {
      message: finalAnswer,
      model: cleanModel,
      toolsUsed,
      provider: 'gemini',
    };
  } catch (err) {
    const status =
      err.status ||
      err.statusCode ||
      (typeof err.message === 'string' && err.message.includes('404')
        ? 404
        : err.message?.includes('400')
        ? 400
        : err.message?.includes('401')
        ? 401
        : err.message?.includes('403')
        ? 403
        : err.message?.includes('429')
        ? 429
        : 500);

    const providerMsg = err.message || '';

    const error = new Error();
    error.statusCode = status;

    if (err.name === 'AbortError' || err.code === 'REQUEST_TIMEOUT') {
      error.message = 'Gemini request timed out after 30 seconds. Please try again.';
      error.statusCode = 504;
      error.code = 'REQUEST_TIMEOUT';
      error.retryable = true;
      throw error;
    }

    if (status === 429) {
      error.message =
        'The Gemini service rate or quota limit has been exceeded. Please check your account quota.';
      error.code = 'RATE_LIMIT_EXCEEDED';
      error.retryable = true;
    } else if (status === 400 || status === 401 || status === 403) {
      error.message = 'Gemini authentication failure. Please check your API key.';
      error.code = 'AUTHENTICATION_ERROR';
      error.retryable = false;
    } else if (status === 404) {
      error.message = `Gemini model "${cleanModel}" is unavailable on the Interactions API endpoint: ${providerMsg}`;
      error.code = 'MODEL_UNAVAILABLE';
      error.retryable = false;
    } else if (status >= 500) {
      error.message =
        'Google Gemini service is temporarily unavailable. Please try again shortly.';
      error.code = 'PROVIDER_UNAVAILABLE';
      error.retryable = true;
    } else {
      error.message = `Gemini service error: ${providerMsg || 'Unknown error'}`;
      error.code = 'PROVIDER_ERROR';
      error.retryable = false;
    }

    throw error;
  }
}
