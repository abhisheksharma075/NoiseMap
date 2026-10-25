/**
 * NoiseMap AI Copilot - Google Gemini Provider Adapter
 * Handles validation, function calling, and multi-turn generation for Gemini models.
 */

import {
  AI_CONFIG,
  TRUSTED_SYSTEM_INSTRUCTION,
  formatGeminiContents,
} from '../aiService.js';
import {
  getGeminiToolDeclarations,
  executeTool,
  getServerReadings,
} from '../noiseMapTools.js';

export const GEMINI_CONFIG = {
  DEFAULT_MODEL: 'gemini-2.5-flash',
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
};

/**
 * Validates a user-supplied Google Gemini API key by making a minimal test call.
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
  const url = `${GEMINI_CONFIG.API_BASE_URL}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cleanKey)}`;

  try {
    const response = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'ping' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2,
        },
      }),
    });

    if (response.ok) {
      return {
        valid: true,
        provider: 'gemini',
        model,
      };
    }

    let errBody = {};
    try {
      errBody = await response.json();
    } catch {
      // ignore
    }

    const status = response.status;
    const providerMsg = errBody?.error?.message || '';

    if (status === 400 || status === 403) {
      return {
        valid: false,
        code: 'INVALID_API_KEY',
        message: 'Invalid Google Gemini API key. Check your key at https://aistudio.google.com/apikey, then try again.',
      };
    }

    if (status === 429) {
      return {
        valid: false,
        code: 'QUOTA_EXCEEDED',
        message: 'Your Google Gemini API key has exceeded its rate or quota limit. Please review your quota in Google AI Studio.',
      };
    }

    return {
      valid: false,
      code: 'VALIDATION_FAILED',
      message: `Gemini validation rejected (HTTP ${status}): ${providerMsg || 'Please verify credentials.'}`,
    };
  } catch (err) {
    return {
      valid: false,
      code: 'NETWORK_ERROR',
      message: `Unable to connect to Google Gemini service (${err.message}). Please check your connection and retry.`,
    };
  }
}

/**
 * Executes a conversational request with multi-turn tool calling using a Gemini key.
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

  // Use client-provided readings snapshot if available, else server readings store
  const readingsDataset =
    Array.isArray(context?.readings) && context.readings.length > 0
      ? context.readings
      : getServerReadings();

  // Inject selected map and geolocation context if available
  let contextAugmentedMessage = message.trim();
  const contextHints = [];
  if (context?.selectedIncident) {
    contextHints.push(`[Active User Map Context: Viewing incident ${context.selectedIncident.id} in sector ${context.selectedIncident.grid_id} (${context.selectedIncident.avg_db} dB avg, source: ${context.selectedIncident.dominant_source})]`);
  } else if (context?.selectedGrid) {
    contextHints.push(`[Active User Map Context: Selected Sector Grid ${context.selectedGrid}]`);
  }
  if (context?.userCoordinates && typeof context.userCoordinates.lat === 'number') {
    contextHints.push(`[User GPS: (${context.userCoordinates.lat.toFixed(4)}, ${context.userCoordinates.lng.toFixed(4)})]`);
  }
  if (contextHints.length > 0) {
    contextAugmentedMessage = `${contextHints.join(' ')}\n\n${contextAugmentedMessage}`;
  }

  const contents = formatGeminiContents(history, contextAugmentedMessage);
  const tools = getGeminiToolDeclarations();

  const url = `${GEMINI_CONFIG.API_BASE_URL}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const toolsUsed = [];

  try {
    let iteration = 0;
    let finalAnswer = '';

    while (iteration < AI_CONFIG.MAX_TOOL_CALL_ITERATIONS) {
      iteration++;

      const requestBody = {
        contents,
        systemInstruction: {
          parts: [{ text: TRUSTED_SYSTEM_INSTRUCTION }],
        },
        tools,
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 1024,
        },
      };

      const response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          // ignore
        }

        const status = response.status;
        const providerMsg = errorData?.error?.message || 'Error communicating with Gemini service.';

        const error = new Error();
        error.statusCode = status;

        if (status === 429) {
          error.message = 'The Gemini service rate or quota limit has been exceeded. Please check your account quota.';
          error.code = 'RATE_LIMIT_EXCEEDED';
          error.retryable = true;
        } else if (status === 400 || status === 403) {
          error.message = 'Gemini authentication failure. Please check your API key.';
          error.code = 'AUTHENTICATION_ERROR';
          error.retryable = false;
        } else if (status >= 500) {
          error.message = 'Google Gemini service is temporarily unavailable. Please try again shortly.';
          error.code = 'PROVIDER_UNAVAILABLE';
          error.retryable = true;
        } else {
          error.message = `Gemini service error: ${providerMsg}`;
          error.code = 'PROVIDER_ERROR';
          error.retryable = false;
        }

        throw error;
      }

      const data = await response.json();
      const candidate = data?.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      // Check if model called a tool
      const functionCallPart = parts.find((p) => p.functionCall);

      if (functionCallPart && functionCallPart.functionCall) {
        const { name: toolName, args: toolArgs } = functionCallPart.functionCall;

        // Execute server-side tool safely
        const toolResult = executeTool(toolName, toolArgs, readingsDataset);
        toolsUsed.push({
          tool: toolName,
          args: toolArgs,
          resultSummary: {
            ok: toolResult.ok,
            recordsReturned: toolResult.returnedCount ?? toolResult.returnedClustersCount ?? toolResult.sampleCount ?? 0,
            action: toolResult.action,
            draft: toolResult.draft,
          },
        });

        // Append model's tool call turn to contents
        contents.push({
          role: 'model',
          parts: [functionCallPart],
        });

        // Append tool execution response as user turn
        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: toolName,
                response: {
                  result: toolResult,
                },
              },
            },
          ],
        });

        // Continue loop to allow Gemini to interpret the result
        continue;
      }

      // Model provided final text response
      const textPart = parts.find((p) => typeof p.text === 'string');
      if (textPart && textPart.text) {
        finalAnswer = textPart.text.trim();
        break;
      }

      if (typeof candidate?.content?.parts?.[0]?.text === 'string') {
        finalAnswer = candidate.content.parts[0].text.trim();
        break;
      }
    }

    clearTimeout(timeoutId);

    if (!finalAnswer) {
      finalAnswer =
        'NoiseMap Copilot analyzed the environmental data but was unable to formulate a complete answer. Please rephrase your question.';
    }

    return {
      message: finalAnswer,
      model,
      toolsUsed,
      provider: 'gemini',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error('Gemini request timed out after 25 seconds. Please try again.');
      timeoutError.statusCode = 504;
      timeoutError.code = 'REQUEST_TIMEOUT';
      timeoutError.retryable = true;
      throw timeoutError;
    }
    throw err;
  }
}
