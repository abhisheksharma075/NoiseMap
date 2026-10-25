/**
 * NoiseMap AI Copilot - OpenAI Provider Adapter
 * Implements authentication validation, Chat Completions API with tool calling,
 * and multi-turn conversational responses for GPT models.
 */

import {
  AI_CONFIG,
  TRUSTED_SYSTEM_INSTRUCTION,
} from '../aiService.js';
import {
  TOOL_REGISTRY,
  executeTool,
  getServerReadings,
} from '../noiseMapTools.js';

export const OPENAI_CONFIG = {
  DEFAULT_MODEL: 'gpt-4o-mini',
  API_BASE_URL: 'https://api.openai.com/v1',
};

/**
 * Recursively converts Gemini-formatted parameters to standard OpenAI JSON Schema
 */
export function convertGeminiParametersToOpenAi(geminiParams) {
  if (!geminiParams || typeof geminiParams !== 'object') {
    return { type: 'object', properties: {} };
  }

  const mapType = (t) => {
    if (!t) return 'string';
    const upper = String(t).toUpperCase();
    switch (upper) {
      case 'OBJECT':
        return 'object';
      case 'STRING':
        return 'string';
      case 'NUMBER':
        return 'number';
      case 'INTEGER':
        return 'integer';
      case 'BOOLEAN':
        return 'boolean';
      case 'ARRAY':
        return 'array';
      default:
        return 'string';
    }
  };

  const schema = {
    type: mapType(geminiParams.type),
    properties: {},
  };

  if (geminiParams.properties) {
    for (const [propName, propDef] of Object.entries(geminiParams.properties)) {
      schema.properties[propName] = {
        type: mapType(propDef.type),
        description: propDef.description || '',
      };
      if (propDef.properties) {
        schema.properties[propName].properties = convertGeminiParametersToOpenAi(propDef).properties;
      }
    }
  }

  if (Array.isArray(geminiParams.required)) {
    schema.required = [...geminiParams.required];
  }

  return schema;
}

/**
 * Returns formatted tool definitions matching OpenAI Chat Completions API specification
 */
export function getOpenAiToolDeclarations() {
  return Object.values(TOOL_REGISTRY).map((entry) => ({
    type: 'function',
    function: {
      name: entry.declaration.name,
      description: entry.declaration.description,
      parameters: convertGeminiParametersToOpenAi(entry.declaration.parameters),
    },
  }));
}

/**
 * Validates a user-supplied OpenAI API key by performing a real minimal request.
 * Does NOT accept ChatGPT web login passwords.
 */
export async function validateOpenAiKey(apiKey, fetchFn = globalThis.fetch) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return {
      valid: false,
      code: 'EMPTY_API_KEY',
      message: 'Please provide a non-empty OpenAI API key.',
    };
  }

  const cleanKey = apiKey.trim();
  const model = OPENAI_CONFIG.DEFAULT_MODEL;
  const url = `${OPENAI_CONFIG.API_BASE_URL}/chat/completions`;

  try {
    const response = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 2,
      }),
    });

    if (response.ok) {
      return {
        valid: true,
        provider: 'openai',
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

    if (status === 401) {
      return {
        valid: false,
        code: 'INVALID_API_KEY',
        message:
          'Invalid OpenAI API key. Check your key at https://platform.openai.com/api-keys. Note: An OpenAI API key is separate from your personal ChatGPT account password.',
      };
    }

    if (status === 429) {
      const isBilling = providerMsg.toLowerCase().includes('billing') || providerMsg.toLowerCase().includes('quota');
      return {
        valid: false,
        code: isBilling ? 'BILLING_RESTRICTION' : 'QUOTA_EXCEEDED',
        message: isBilling
          ? 'OpenAI quota or billing limit exceeded. Please verify your account credits at https://platform.openai.com/account/billing.'
          : 'OpenAI rate limit reached. Please wait a moment before reconnecting.',
      };
    }

    return {
      valid: false,
      code: 'VALIDATION_FAILED',
      message: `OpenAI validation rejected (HTTP ${status}): ${providerMsg || 'Please check your API key.'}`,
    };
  } catch (err) {
    return {
      valid: false,
      code: 'NETWORK_ERROR',
      message: `Unable to connect to OpenAI service (${err.message}). Please check your connection and retry.`,
    };
  }
}

/**
 * Executes a conversational request with multi-turn tool calling using an OpenAI key.
 */
export async function generateOpenAiResponse({
  apiKey,
  model = OPENAI_CONFIG.DEFAULT_MODEL,
  message,
  history = [],
  context = {},
  timeoutMs = AI_CONFIG.REQUEST_TIMEOUT_MS,
  fetchFn = globalThis.fetch,
}) {
  if (!apiKey) {
    const error = new Error('OpenAI API key is required.');
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
    contextHints.push(
      `[Active User Map Context: Viewing incident ${context.selectedIncident.id} in sector ${context.selectedIncident.grid_id} (${context.selectedIncident.avg_db} dB avg, source: ${context.selectedIncident.dominant_source})]`
    );
  } else if (context?.selectedGrid) {
    contextHints.push(`[Active User Map Context: Selected Sector Grid ${context.selectedGrid}]`);
  }
  if (context?.userCoordinates && typeof context.userCoordinates.lat === 'number') {
    contextHints.push(`[User GPS: (${context.userCoordinates.lat.toFixed(4)}, ${context.userCoordinates.lng.toFixed(4)})]`);
  }
  if (contextHints.length > 0) {
    contextAugmentedMessage = `${contextHints.join(' ')}\n\n${contextAugmentedMessage}`;
  }

  // Build OpenAI messages array
  const messages = [
    {
      role: 'system',
      content: TRUSTED_SYSTEM_INSTRUCTION,
    },
  ];

  if (Array.isArray(history)) {
    const boundedHistory = history.slice(-AI_CONFIG.MAX_HISTORY_ITEMS);
    for (const msg of boundedHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content.trim(),
      });
    }
  }

  // Current user query
  messages.push({
    role: 'user',
    content: contextAugmentedMessage,
  });

  const tools = getOpenAiToolDeclarations();
  const url = `${OPENAI_CONFIG.API_BASE_URL}/chat/completions`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const toolsUsed = [];

  try {
    let iteration = 0;
    let finalAnswer = '';

    while (iteration < AI_CONFIG.MAX_TOOL_CALL_ITERATIONS) {
      iteration++;

      const requestBody = {
        model,
        messages,
        tools,
        tool_choice: 'auto',
        temperature: 0.4,
        max_tokens: 1024,
      };

      const response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
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
        const providerMsg = errorData?.error?.message || 'Error communicating with OpenAI service.';

        const error = new Error();
        error.statusCode = status;

        if (status === 401) {
          error.message = 'OpenAI authentication failure. Please check your API key.';
          error.code = 'AUTHENTICATION_ERROR';
          error.retryable = false;
        } else if (status === 429) {
          error.message = 'OpenAI rate or quota limit exceeded. Please check your account billing.';
          error.code = 'RATE_LIMIT_EXCEEDED';
          error.retryable = true;
        } else if (status >= 500) {
          error.message = 'OpenAI service is temporarily unavailable. Please try again shortly.';
          error.code = 'PROVIDER_UNAVAILABLE';
          error.retryable = true;
        } else {
          error.message = `OpenAI service error: ${providerMsg}`;
          error.code = 'PROVIDER_ERROR';
          error.retryable = false;
        }

        throw error;
      }

      const data = await response.json();
      const choice = data?.choices?.[0];
      const assistantMessage = choice?.message;

      if (!assistantMessage) {
        break;
      }

      // Check if model called any tools
      if (Array.isArray(assistantMessage.tool_calls) && assistantMessage.tool_calls.length > 0) {
        // Append assistant's tool-call response to messages
        messages.push(assistantMessage);

        for (const tc of assistantMessage.tool_calls) {
          const toolName = tc.function?.name;
          let toolArgs = {};
          try {
            toolArgs = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
          } catch {
            toolArgs = {};
          }

          // Execute read-only tool
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

          // Append tool execution response
          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(toolResult),
          });
        }

        // Loop to let OpenAI formulate the answer with tool results
        continue;
      }

      // Model provided final text
      if (assistantMessage.content) {
        finalAnswer = assistantMessage.content.trim();
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
      provider: 'openai',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error('OpenAI request timed out after 25 seconds. Please try again.');
      timeoutError.statusCode = 504;
      timeoutError.code = 'REQUEST_TIMEOUT';
      timeoutError.retryable = true;
      throw timeoutError;
    }
    throw err;
  }
}
