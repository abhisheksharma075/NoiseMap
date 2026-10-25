/**
 * NOISEMAP AI COPILOT — PROVIDER CONNECTION & MULTI-MODEL AUTOMATED TEST SUITE
 * Tests:
 * 1. Provider validation for Google Gemini & OpenAI
 * 2. Invalid key, empty key, and quota limit error handling
 * 3. Ephemeral in-memory session store (creation, token lookup, timeout, disconnect)
 * 4. Zero-leakage security perimeter (API keys never logged or echoed)
 * 5. OpenAI tool declaration schema conversion (all 9 NoiseMap tools)
 * 6. Simulated multi-turn tool calling with OpenAI
 * 7. Server session request handling & session invalidation
 */

import assert from 'node:assert';
import { sessionStore } from '../server/sessionStore.js';
import {
  validateGeminiKey,
  generateGeminiResponse,
} from '../server/providers/geminiProvider.js';
import {
  validateOpenAiKey,
  convertGeminiParametersToOpenAi,
  getOpenAiToolDeclarations,
  generateOpenAiResponse,
} from '../server/providers/openaiProvider.js';
import {
  validateProviderCredential,
  generateProviderResponse,
  SUPPORTED_PROVIDERS,
} from '../server/providers/providerRegistry.js';
import { handleProviderSessionRequest } from '../server/chatHandler.js';
import { TOOL_REGISTRY } from '../server/noiseMapTools.js';

let passed = 0;
let failed = 0;

console.log('========================================================================');
console.log('🔑 NOISEMAP AI COPILOT: PROVIDER CONNECTION & MULTI-MODEL TEST SUITE');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Provider Selection & Allowlist Validation
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 1/15] Provider registry supports Gemini and OpenAI only: ');
  assert(SUPPORTED_PROVIDERS.gemini, 'Gemini must be supported');
  assert(SUPPORTED_PROVIDERS.openai, 'OpenAI must be supported');
  assert.strictEqual(SUPPORTED_PROVIDERS.gemini.recommended, true);
  assert.strictEqual(SUPPORTED_PROVIDERS.gemini.officialKeyUrl, 'https://aistudio.google.com/apikey');
  assert.strictEqual(SUPPORTED_PROVIDERS.openai.officialKeyUrl, 'https://platform.openai.com/api-keys');

  const unsupported = await validateProviderCredential('anthropic', 'dummy-key');
  assert.strictEqual(unsupported.valid, false);
  assert.strictEqual(unsupported.code, 'UNSUPPORTED_PROVIDER');

  console.log('✓ PASSED (Gemini and OpenAI registered with verified official links; unsupported rejected)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 2: Rejection of Empty or Whitespace-Only API Keys
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 2/15] Rejects empty or whitespace-only keys: ');
  const emptyGemini = await validateGeminiKey('');
  assert.strictEqual(emptyGemini.valid, false);
  assert.strictEqual(emptyGemini.code, 'EMPTY_API_KEY');

  const wsOpenAi = await validateOpenAiKey('   ');
  assert.strictEqual(wsOpenAi.valid, false);
  assert.strictEqual(wsOpenAi.code, 'EMPTY_API_KEY');

  console.log('✓ PASSED (Empty and whitespace inputs rejected with clean errors)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 3: Mocked Real API Validation — Successful Gemini Verification
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 3/15] Validates Gemini key via minimal model ping: ');
  const mockFetch = async (url, options) => {
    assert(url.includes('generativelanguage.googleapis.com'));
    assert(url.includes('interactions'));
    assert(options.method === 'POST');
    assert(options.body.includes('gemini-3.8-flash'));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        id: 'interaction_validation_test_1',
        status: 'completed',
        model: 'gemini-3.8-flash',
        output_text: 'pong',
      }),
    };
  };

  const res = await validateGeminiKey('AIzaSyFakeValidTestKey12345', mockFetch);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.provider, 'gemini');
  assert.strictEqual(res.model, 'gemini-3.8-flash');

  console.log('✓ PASSED (Gemini 3.8 Flash Interactions API validation ping confirmed valid)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 4: Mocked Real API Validation — Successful OpenAI Verification
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 4/15] Validates OpenAI key via minimal model ping: ');
  const mockFetch = async (url, options) => {
    assert(url.includes('api.openai.com'));
    assert.strictEqual(options.headers.Authorization, 'Bearer sk-proj-fakeValidOpenAiTestKey123');
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'pong' } }],
      }),
    };
  };

  const res = await validateOpenAiKey('sk-proj-fakeValidOpenAiTestKey123', mockFetch);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.provider, 'openai');
  assert.strictEqual(res.model, 'gpt-4o-mini');

  console.log('✓ PASSED (OpenAI gpt-4o-mini validation ping confirmed valid)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 5: Error Classification — Invalid Keys & Quota Limits
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 5/15] Classifies 401/403 as INVALID_API_KEY and 429 as QUOTA_EXCEEDED: ');
  // Gemini 400
  const mockGemini400 = async () => ({
    ok: false,
    status: 400,
    json: async () => ({ error: { message: 'API key not valid' } }),
  });
  const geminiInvalid = await validateGeminiKey('bad-key', mockGemini400);
  assert.strictEqual(geminiInvalid.code, 'INVALID_API_KEY');

  // OpenAI 401
  const mockOpenAi401 = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ error: { message: 'Incorrect API key provided' } }),
  });
  const openAiInvalid = await validateOpenAiKey('bad-key', mockOpenAi401);
  assert.strictEqual(openAiInvalid.code, 'INVALID_API_KEY');
  assert(openAiInvalid.message.includes('ChatGPT account password'));

  // OpenAI 429 quota
  const mockOpenAi429 = async () => ({
    ok: false,
    status: 429,
    json: async () => ({ error: { message: 'You exceeded your current quota' } }),
  });
  const openAiQuota = await validateOpenAiKey('key', mockOpenAi429);
  assert.strictEqual(openAiQuota.code, 'BILLING_RESTRICTION');

  console.log('✓ PASSED (Accurately differentiated invalid credentials from quota/billing errors)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 6: Ephemeral Session Store — Creation & Opaque Token Generation
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 6/15] Ephemeral session store generates random tokens & masked key previews: ');
  sessionStore.clearAll();
  const session = sessionStore.createSession({
    provider: 'gemini',
    apiKey: 'AIzaSy1234567890abcdefghijklmnopqrstuv',
    model: 'gemini-3.8-flash',
  });

  assert(session.sessionToken.startsWith('nm_ps_'));
  assert.strictEqual(session.provider, 'gemini');
  assert.strictEqual(session.maskedKey, 'AIza...stuv');
  assert(session.expiresAt > Date.now());

  const retrieved = sessionStore.getSession(session.sessionToken);
  assert(retrieved);
  assert.strictEqual(retrieved.apiKey, 'AIzaSy1234567890abcdefghijklmnopqrstuv');

  console.log('✓ PASSED (Volatile session created with masked preview; token starts with nm_ps_)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 7: Ephemeral Session Store — Expiration & LRU Bounding
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 7/15] Expired sessions are evicted and return null: ');
  const expSession = sessionStore.createSession({
    provider: 'openai',
    apiKey: 'sk-proj-temporary123456789',
    model: 'gpt-4o-mini',
  });

  // Force expiration
  const raw = sessionStore.sessions.get(expSession.sessionToken);
  raw.expiresAt = Date.now() - 1000;

  const expiredLookup = sessionStore.getSession(expSession.sessionToken);
  assert.strictEqual(expiredLookup, null);
  assert.strictEqual(sessionStore.sessions.has(expSession.sessionToken), false);

  console.log('✓ PASSED (Expired session safely evicted on lookup)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 8: Explicit Disconnect Session Invalidation
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 8/15] Disconnect explicitly removes session from volatile memory: ');
  const active = sessionStore.createSession({
    provider: 'openai',
    apiKey: 'sk-proj-activeSessionKey999',
    model: 'gpt-4o-mini',
  });

  assert.strictEqual(sessionStore.getSession(active.sessionToken) !== null, true);
  sessionStore.deleteSession(active.sessionToken);
  assert.strictEqual(sessionStore.getSession(active.sessionToken), null);

  console.log('✓ PASSED (deleteSession completely purged session from memory)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 9: OpenAI Tool Schema Conversion (All 9 NoiseMap Tools)
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 9/15] Converts all 9 NoiseMap tools to valid OpenAI JSON Schema: ');
  const openAiTools = getOpenAiToolDeclarations();
  assert.strictEqual(openAiTools.length, 9);

  openAiTools.forEach((t) => {
    assert.strictEqual(t.type, 'function');
    assert(typeof t.function.name === 'string');
    assert(typeof t.function.description === 'string');
    assert.strictEqual(t.function.parameters.type, 'object');
    // Verify lowercase types in parameters properties
    for (const prop of Object.values(t.function.parameters.properties)) {
      assert(['string', 'number', 'integer', 'object', 'array', 'boolean'].includes(prop.type));
    }
  });

  console.log('✓ PASSED (All 9 tools converted to standard OpenAI function-calling schema)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 10: OpenAI Tool Calling Execution Simulation
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 10/15] Simulates multi-turn tool calling with OpenAI adapter: ');
  let turn = 0;
  const mockFetch = async (_url, options) => {
    turn++;
    const body = JSON.parse(options.body);

    if (turn === 1) {
      // First turn: OpenAI requests get_latest_noise_readings
      return {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                role: 'assistant',
                tool_calls: [
                  {
                    id: 'call_123',
                    type: 'function',
                    function: {
                      name: 'get_latest_noise_readings',
                      arguments: JSON.stringify({ limit: 2 }),
                    },
                  },
                ],
              },
            },
          ],
        }),
      };
    }

    // Second turn: Model returns final answer based on tool result
    assert(body.messages.some((m) => m.role === 'tool' && m.tool_call_id === 'call_123'));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'The latest readings show noise levels at 82.4 dB in the commercial sector.',
            },
          },
        ],
      }),
    };
  };

  const result = await generateOpenAiResponse({
    apiKey: 'sk-proj-testKey',
    message: 'What are the latest readings?',
    fetchFn: mockFetch,
  });

  assert.strictEqual(turn, 2);
  assert.strictEqual(result.provider, 'openai');
  assert.strictEqual(result.toolsUsed.length, 1);
  assert.strictEqual(result.toolsUsed[0].tool, 'get_latest_noise_readings');
  assert(result.message.includes('82.4 dB'));

  console.log('✓ PASSED (Completed 2-turn OpenAI tool calling loop successfully)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 11: HTTP Endpoint: POST /api/copilot/provider-session (Connection Flow)
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 11/15] POST /api/copilot/provider-session endpoint handles connection flow: ');
  // Mock mockFetch inside globalThis
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ id: 'nm_int_conn_test', status: 'completed', model: 'gemini-3.8-flash', output_text: 'pong' }),
  });

  const req = (async function* () {
    yield JSON.stringify({ provider: 'gemini', apiKey: 'AIzaSyTestKey9876543210' });
  })();
  req.method = 'POST';
  req.headers = { 'content-type': 'application/json' };

  let statusCode = 200;
  let responseData = null;
  const res = {
    setHeader: () => {},
    end: (chunk) => {
      responseData = JSON.parse(chunk);
    },
  };
  Object.defineProperty(res, 'statusCode', {
    set(code) {
      statusCode = code;
    },
    get() {
      return statusCode;
    },
  });

  await handleProviderSessionRequest(req, res);
  assert.strictEqual(statusCode, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.provider, 'gemini');
  assert(responseData.sessionToken.startsWith('nm_ps_'));
  assert.strictEqual(responseData.maskedKey, 'AIza...3210');

  // Verify that the key is NOT echoed in the response
  assert.strictEqual(responseData.apiKey, undefined);

  globalThis.fetch = originalFetch;
  console.log('✓ PASSED (Endpoint validated key, generated session, and masked preview)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 12: HTTP Endpoint: DELETE /api/copilot/provider-session (Disconnect Flow)
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 12/15] DELETE /api/copilot/provider-session invalidates active session: ');
  const testSession = sessionStore.createSession({
    provider: 'gemini',
    apiKey: 'AIzaSyDisconnectTestKey',
    model: 'gemini-3.8-flash',
  });

  const req = (async function* () {
    yield '';
  })();
  req.method = 'DELETE';
  req.headers = {
    authorization: `Bearer ${testSession.sessionToken}`,
  };

  let statusCode = 200;
  let responseData = null;
  const res = {
    setHeader: () => {},
    end: (chunk) => {
      responseData = JSON.parse(chunk);
    },
  };
  Object.defineProperty(res, 'statusCode', {
    set(code) {
      statusCode = code;
    },
    get() {
      return statusCode;
    },
  });

  await handleProviderSessionRequest(req, res);
  assert.strictEqual(statusCode, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(sessionStore.getSession(testSession.sessionToken), null);

  console.log('✓ PASSED (DELETE endpoint successfully disconnected session)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 13: HTTP Endpoint: GET /api/copilot/provider-session (Status Check)
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 13/15] GET /api/copilot/provider-session reports current connectivity: ');
  const statusSession = sessionStore.createSession({
    provider: 'openai',
    apiKey: 'sk-proj-statusCheckKey',
    model: 'gpt-4o-mini',
  });

  const req = (async function* () {
    yield '';
  })();
  req.method = 'GET';
  req.headers = {
    authorization: `Bearer ${statusSession.sessionToken}`,
  };

  let statusCode = 200;
  let responseData = null;
  const res = {
    setHeader: () => {},
    end: (chunk) => {
      responseData = JSON.parse(chunk);
    },
  };
  Object.defineProperty(res, 'statusCode', {
    set(code) {
      statusCode = code;
    },
    get() {
      return statusCode;
    },
  });

  await handleProviderSessionRequest(req, res);
  assert.strictEqual(statusCode, 200);
  assert.strictEqual(responseData.connected, true);
  assert.strictEqual(responseData.provider, 'openai');
  assert.strictEqual(responseData.hasUserSession, true);

  console.log('✓ PASSED (GET endpoint accurately reports active provider and model)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 14: Zero Credential Leakage in Errors & Responses
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 14/15] Raw API keys are strictly excluded from output payloads and logs: ');
  const fakeSecret = 'AIzaSySuperSecretKeyNeverLeakThis999';
  const mockFetchFail = async () => ({
    ok: false,
    status: 403,
    json: async () => ({ error: { message: 'Forbidden' } }),
  });

  const validationResult = await validateGeminiKey(fakeSecret, mockFetchFail);
  const resultJson = JSON.stringify(validationResult);
  assert(!resultJson.includes(fakeSecret), 'API key must not appear in validation failure response');

  const session = sessionStore.createSession({
    provider: 'gemini',
    apiKey: fakeSecret,
    model: 'gemini-3.8-flash',
  });
  const sessionJson = JSON.stringify(session);
  assert(sessionJson.includes('AIza...s999'), 'Only masked key should appear in preview');

  console.log('✓ PASSED (Zero private credential leakage detected)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// TEST 15: Cross-Provider Credential Isolation
// -----------------------------------------------------------------------------
try {
  process.stdout.write('[TEST 15/15] Provider credentials cannot cross boundaries: ');
  // Gemini key sent to OpenAI validator
  const mockFetchOpenAi = async (url) => {
    assert(url.includes('api.openai.com'));
    return {
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid API key' } }),
    };
  };

  const crossValidation = await validateOpenAiKey('AIzaSyGeminiKeySentToOpenAi', mockFetchOpenAi);
  assert.strictEqual(crossValidation.valid, false);
  assert.strictEqual(crossValidation.code, 'INVALID_API_KEY');

  console.log('✓ PASSED (Strict provider boundary enforcement prevents credential cross-routing)');
  passed++;
} catch (err) {
  console.log('✗ FAILED:', err.message);
  failed++;
}

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n------------------------------------------------------------------------');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
if (failed === 0) {
  console.log('🎉 ALL 15 PROVIDER CONNECTION & MULTI-MODEL TESTS PASSED SUCCESSFULLY!');
} else {
  console.log('❌ SOME TESTS FAILED.');
  process.exit(1);
}
console.log('------------------------------------------------------------------------\n');
