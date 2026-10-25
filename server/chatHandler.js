/**
 * NoiseMap AI Copilot - Server Request Handler
 * Handles POST /api/chat and /api/copilot/provider-session requests.
 * Manages ephemeral provider sessions, sanitizes errors, and enforces security.
 */

import { validateChatPayload, rateLimiter } from './aiService.js';
import { sessionStore } from './sessionStore.js';
import {
  validateProviderCredential,
  generateProviderResponse,
} from './providers/providerRegistry.js';

/**
 * Handles incoming chat API request and writes JSON response.
 * Compatible with Node http, Express, and Vite middleware.
 */
export async function handleChatApiRequest(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Enforce method
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST requests are supported.' },
      })
    );
    return;
  }

  // Rate limiting check by remote client identifier
  const clientIp =
    req.headers['x-forwarded-for'] ||
    req.socket?.remoteAddress ||
    'anonymous_client';

  if (rateLimiter.isRateLimited(clientIp)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait a minute before sending another question.',
          retryable: true,
        },
      })
    );
    return;
  }

  // Parse JSON body
  let rawBody = '';
  try {
    for await (const chunk of req) {
      rawBody += chunk;
      if (rawBody.length > 50000) {
        throw new Error('Payload too large');
      }
    }
  } catch {
    res.statusCode = 413;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request payload exceeded maximum size.' },
      })
    );
    return;
  }

  let body;
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' },
      })
    );
    return;
  }

  // Validate payload
  const validation = validateChatPayload(body);
  if (!validation.valid) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: { code: validation.code, message: validation.error },
      })
    );
    return;
  }

  // Resolve active AI provider and credentials
  let sessionToken = body.providerSessionToken || null;
  const authHeader = req.headers['authorization'];
  if (!sessionToken && authHeader && authHeader.startsWith('Bearer ')) {
    sessionToken = authHeader.slice(7).trim();
  }

  let activeProvider = 'gemini';
  let activeApiKey = null;
  let activeModel = null;

  if (sessionToken) {
    const session = sessionStore.getSession(sessionToken);
    if (!session) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: {
            code: 'SESSION_EXPIRED',
            message: 'Your AI provider session has expired or is invalid. Please reconnect your API key in settings.',
            retryable: false,
          },
        })
      );
      return;
    }
    activeProvider = session.provider;
    activeApiKey = session.apiKey;
    activeModel = session.model;
  } else {
    // Fall back to server environment default
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
      activeProvider = 'gemini';
      activeApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      activeModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    } else if (process.env.OPENAI_API_KEY) {
      activeProvider = 'openai';
      activeApiKey = process.env.OPENAI_API_KEY;
      activeModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    } else {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: {
            code: 'NO_PROVIDER_CONNECTED',
            message: 'No AI provider is connected. Please connect your Google Gemini or OpenAI API key to use NoiseMap AI Copilot.',
            retryable: false,
          },
        })
      );
      return;
    }
  }

  // Execute request through the active provider adapter
  try {
    const result = await generateProviderResponse({
      provider: activeProvider,
      apiKey: activeApiKey,
      model: activeModel,
      message: body.message,
      history: body.history || [],
      context: body.context || {},
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        message: result.message,
        model: result.model,
        provider: result.provider || activeProvider,
        toolsUsed: result.toolsUsed || [],
      })
    );
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: err.code || 'INTERNAL_ERROR',
          message: err.message || 'An unexpected error occurred while processing your request.',
          retryable: !!err.retryable,
        },
      })
    );
  }
}

/**
 * Handles incoming provider session requests:
 * POST /api/copilot/provider-session  -> Validate and create ephemeral session
 * DELETE /api/copilot/provider-session -> Invalidate active session
 * GET /api/copilot/provider-session   -> Check session connectivity status
 */
export async function handleProviderSessionRequest(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Rate limiting check for session actions
  const clientIp =
    req.headers['x-forwarded-for'] ||
    req.socket?.remoteAddress ||
    'anonymous_client';

  if (rateLimiter.isRateLimited(`session_${clientIp}`)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many connection attempts. Please wait a minute before trying again.',
          retryable: true,
        },
      })
    );
    return;
  }

  if (req.method === 'POST') {
    let rawBody = '';
    try {
      for await (const chunk of req) {
        rawBody += chunk;
        if (rawBody.length > 10000) {
          throw new Error('Payload too large');
        }
      }
    } catch {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Payload too large.' } }));
      return;
    }

    let body = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON request body.' } }));
      return;
    }

    const { provider, apiKey, testOnly = false } = body;

    if (!provider || !['gemini', 'openai'].includes(String(provider).toLowerCase())) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: { code: 'INVALID_PROVIDER', message: 'Supported providers are "gemini" and "openai".' },
        })
      );
      return;
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: { code: 'EMPTY_API_KEY', message: 'Please enter a valid API key.' },
        })
      );
      return;
    }

    const cleanProvider = String(provider).toLowerCase().trim();
    const cleanKey = apiKey.trim();

    // Perform minimal real validation call to chosen provider
    const validation = await validateProviderCredential(cleanProvider, cleanKey);

    if (!validation.valid) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: { code: validation.code, message: validation.message },
        })
      );
      return;
    }

    // If testOnly action requested, return validation confirmation without session creation
    if (testOnly) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: true,
          valid: true,
          provider: validation.provider,
          model: validation.model,
          message: `${validation.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} API key verified successfully.`,
        })
      );
      return;
    }

    // Create ephemeral provider session
    const session = sessionStore.createSession({
      provider: validation.provider,
      apiKey: cleanKey,
      model: validation.model,
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        provider: session.provider,
        model: session.model,
        sessionToken: session.sessionToken,
        maskedKey: session.maskedKey,
        expiresAt: session.expiresAt,
        message: 'AI provider connected successfully. NoiseMap AI Copilot is ready.',
      })
    );
    return;
  }

  if (req.method === 'DELETE') {
    let token = '';
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    if (!token) {
      let rawBody = '';
      try {
        for await (const chunk of req) rawBody += chunk;
        const b = rawBody ? JSON.parse(rawBody) : {};
        token = b.sessionToken || '';
      } catch {
        // ignore
      }
    }

    if (token) {
      sessionStore.deleteSession(token);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        message: 'AI provider disconnected successfully.',
      })
    );
    return;
  }

  if (req.method === 'GET') {
    let token = '';
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    const session = token ? sessionStore.getSession(token) : null;
    const hasServerGemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    const hasServerOpenAi = !!process.env.OPENAI_API_KEY;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        connected: !!session || hasServerGemini || hasServerOpenAi,
        hasUserSession: !!session,
        provider: session?.provider || (hasServerGemini ? 'gemini' : hasServerOpenAi ? 'openai' : null),
        model:
          session?.model ||
          (hasServerGemini
            ? process.env.GEMINI_MODEL || 'gemini-2.5-flash'
            : hasServerOpenAi
            ? process.env.OPENAI_MODEL || 'gpt-4o-mini'
            : null),
        maskedKey: session?.maskedKey || null,
        isServerDefault: !session && (hasServerGemini || hasServerOpenAi),
      })
    );
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed.' } }));
}
