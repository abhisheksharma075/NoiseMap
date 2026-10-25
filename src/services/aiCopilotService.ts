/**
 * NoiseMap AI Copilot - Frontend Service Client
 * Handles volatile ephemeral session management, multi-provider BYOK connection,
 * direct edge validation fallback (preventing HTTP 405/404 failures on static hosts),
 * and environmental context dispatch.
 */

import {
  ChatMessage,
  ChatApiResponse,
  ConnectProviderResponse,
  AIProviderType,
  ProviderSessionInfo,
  ToolCallExecution,
} from '../types/copilot';
import { NoiseDataService } from './noiseDataService';
import { NoiseReading, NoiseIncident } from '../types';

export class AiCopilotService {
  // Volatile in-memory session reference ONLY - never written to persistent browser storage
  private static activeSession: ProviderSessionInfo | null = null;

  /**
   * Returns the backend API base endpoint. Defaults to relative /api/chat
   * or uses configured VITE_API_URL when deployed to external backend (e.g. Agent 37 container).
   */
  public static getApiEndpoint(): string {
    const customBase = import.meta.env.VITE_API_URL;
    if (customBase && typeof customBase === 'string' && customBase.trim()) {
      return `${customBase.replace(/\/+$/, '')}/api/chat`;
    }
    return '/api/chat';
  }

  /**
   * Returns the backend provider session management endpoint.
   */
  public static getProviderSessionEndpoint(): string {
    const customBase = import.meta.env.VITE_API_URL;
    if (customBase && typeof customBase === 'string' && customBase.trim()) {
      return `${customBase.replace(/\/+$/, '')}/api/copilot/provider-session`;
    }
    return '/api/copilot/provider-session';
  }

  /**
   * Returns currently active in-memory provider session info (or null if not connected)
   */
  public static getActiveSession(): ProviderSessionInfo | null {
    return this.activeSession;
  }

  /**
   * Manually sets or clears the in-memory provider session
   */
  public static setActiveSession(session: ProviderSessionInfo | null): void {
    this.activeSession = session;
  }

  /**
   * Connects and validates a user-supplied API key with the selected provider (Gemini or OpenAI).
   * Attempts server-side validation first. If the host returns HTTP 405/404 or an unparseable response
   * (e.g. static CDN / Vercel without active backend container), gracefully falls back to direct edge validation.
   */
  public static async connectProvider(
    provider: AIProviderType,
    apiKey: string,
    testOnly: boolean = false
  ): Promise<ConnectProviderResponse> {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      const err = new Error('Please enter a valid API key.');
      (err as any).code = 'EMPTY_API_KEY';
      throw err;
    }

    const endpoint = this.getProviderSessionEndpoint();

    let response: Response | null = null;
    let endpointFailed = false;

    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          apiKey: cleanKey,
          testOnly,
        }),
      });
    } catch {
      endpointFailed = true;
    }

    // Inspect server response if received
    if (!endpointFailed && response) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        let data: ConnectProviderResponse | null = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (data) {
          if (response.ok && data.success) {
            if (!testOnly && data.sessionToken) {
              this.activeSession = {
                provider: data.provider || provider,
                model: data.model || (provider === 'gemini' ? 'gemini-3.8-flash' : 'gpt-4o-mini'),
                sessionToken: data.sessionToken,
                maskedKey: data.maskedKey,
                expiresAt: data.expiresAt,
                isServerDefault: false,
                mode: 'server_session',
              };
            }
            return data;
          }

          // Structured error from backend
          if (data.error) {
            const errObj = new Error(data.error.message || 'Failed to validate API key with provider.');
            (errObj as any).code = data.error.code || 'VALIDATION_FAILED';
            throw errObj;
          }
        }
      }
    }

    // If server returned HTTP 405 (Method Not Allowed), 404, or non-JSON HTML error page
    // (typical when deployed as a static site on Vercel without container backend),
    // fallback seamlessly to direct Edge verification!
    return this.validateDirectAtEdge(provider, cleanKey, testOnly);
  }

  /**
   * Direct Edge validation connecting directly from the client to the AI provider.
   * Eliminates HTTP 405/404 blockers on static web hosts.
   */
  private static async validateDirectAtEdge(
    provider: AIProviderType,
    cleanKey: string,
    testOnly: boolean
  ): Promise<ConnectProviderResponse> {
    if (provider === 'gemini') {
      const model = 'gemini-3.8-flash';
      // Attempt 1: Google Interactions API (Google recommended for gemini-3.8-flash)
      // Attempt 2: generateContent fallback
      let pingRes: Response | null = null;

      try {
        pingRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(cleanKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              input: 'ping',
            }),
          }
        );

        // If Interactions API returns 404 (endpoint variant), try generateContent
        if (pingRes.status === 404) {
          pingRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cleanKey)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
                generationConfig: { maxOutputTokens: 2 },
              }),
            }
          );
        }

        if (pingRes.ok) {
          const maskedKey =
            cleanKey.length > 8 ? `${cleanKey.slice(0, 4)}...${cleanKey.slice(-4)}` : '••••••••';
          const sessionToken = `nm_edge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const expiresAt = Date.now() + 3600000;

          const successData: ConnectProviderResponse = {
            success: true,
            valid: true,
            provider: 'gemini',
            model,
            sessionToken,
            maskedKey,
            expiresAt,
            message: 'Google Gemini 3.8 Flash API key verified and connected successfully.',
          };

          if (!testOnly) {
            this.activeSession = {
              provider: 'gemini',
              model,
              sessionToken,
              maskedKey,
              expiresAt,
              isServerDefault: false,
              apiKey: cleanKey,
              mode: 'client_direct',
            };
          }

          return successData;
        }

        let errBody: any = {};
        try {
          errBody = await pingRes.json();
        } catch {
          // ignore
        }

        const status = pingRes.status;
        const providerMsg = errBody?.error?.message || '';

        if (status === 400 || status === 401 || status === 403) {
          const err = new Error('Invalid Google Gemini API key. Check your key at https://aistudio.google.com/apikey, then try again.');
          (err as any).code = 'INVALID_API_KEY';
          throw err;
        }

        if (status === 429) {
          const err = new Error('Your Google Gemini API key has exceeded its rate or quota limit. Please review your quota in Google AI Studio.');
          (err as any).code = 'QUOTA_EXCEEDED';
          throw err;
        }

        if (status === 404) {
          const err = new Error(`Gemini model "${model}" is unavailable on this endpoint: ${providerMsg}`);
          (err as any).code = 'MODEL_UNAVAILABLE';
          throw err;
        }

        const err = new Error(`Gemini validation rejected (HTTP ${status}): ${providerMsg || 'Please verify credentials.'}`);
        (err as any).code = 'VALIDATION_FAILED';
        throw err;
      } catch (err: any) {
        if (err.code) throw err;
        const netErr = new Error(`Unable to reach Google Gemini API (${err.message}). Check your network connection.`);
        (netErr as any).code = 'NETWORK_ERROR';
        throw netErr;
      }
    }

    if (provider === 'openai') {
      const model = 'gpt-4o-mini';
      const url = 'https://api.openai.com/v1/chat/completions';

      try {
        const pingRes = await fetch(url, {
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

        if (pingRes.ok) {
          const maskedKey =
            cleanKey.length > 8 ? `${cleanKey.slice(0, 4)}...${cleanKey.slice(-4)}` : '••••••••';
          const sessionToken = `nm_edge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const expiresAt = Date.now() + 3600000;

          const successData: ConnectProviderResponse = {
            success: true,
            valid: true,
            provider: 'openai',
            model,
            sessionToken,
            maskedKey,
            expiresAt,
            message: 'OpenAI API key verified and connected successfully.',
          };

          if (!testOnly) {
            this.activeSession = {
              provider: 'openai',
              model,
              sessionToken,
              maskedKey,
              expiresAt,
              isServerDefault: false,
              apiKey: cleanKey,
              mode: 'client_direct',
            };
          }

          return successData;
        }

        let errBody: any = {};
        try {
          errBody = await pingRes.json();
        } catch {}

        const status = pingRes.status;
        const msg = errBody?.error?.message || '';

        if (status === 401 || status === 403) {
          const err = new Error('Invalid OpenAI API key. Check your key at https://platform.openai.com/api-keys, then try again.');
          (err as any).code = 'INVALID_API_KEY';
          throw err;
        }

        if (status === 429) {
          const err = new Error('Your OpenAI API key has exceeded its rate or billing quota. Please check your usage at https://platform.openai.com/usage.');
          (err as any).code = 'QUOTA_EXCEEDED';
          throw err;
        }

        const err = new Error(`OpenAI validation rejected (HTTP ${status}): ${msg || 'Please verify credentials.'}`);
        (err as any).code = 'VALIDATION_FAILED';
        throw err;
      } catch (err: any) {
        if (err.code) throw err;
        const netErr = new Error(`Unable to reach OpenAI API (${err.message}). Check your network connection.`);
        (netErr as any).code = 'NETWORK_ERROR';
        throw netErr;
      }
    }

    const err = new Error(`Unsupported provider "${provider}".`);
    (err as any).code = 'UNSUPPORTED_PROVIDER';
    throw err;
  }

  /**
   * Explicitly disconnects and terminates the active ephemeral provider session
   */
  public static async disconnectProvider(): Promise<void> {
    const endpoint = this.getProviderSessionEndpoint();
    const token = this.activeSession?.sessionToken;

    if (token && this.activeSession?.mode !== 'client_direct') {
      try {
        await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionToken: token }),
        });
      } catch {
        // Safe to ignore network disconnect errors - local token will be wiped regardless
      }
    }

    // Immediately purge session and key from application memory
    this.activeSession = null;
  }

  /**
   * Checks backend connectivity and determines if server-default environment provider is available
   */
  public static async checkProviderStatus(): Promise<{
    connected: boolean;
    provider?: AIProviderType;
    model?: string;
    isServerDefault?: boolean;
    hasUserSession?: boolean;
    maskedKey?: string;
  }> {
    const endpoint = this.getProviderSessionEndpoint();
    const token = this.activeSession?.sessionToken;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (data.isServerDefault && !this.activeSession) {
            this.activeSession = {
              provider: data.provider || 'gemini',
              model: data.model || 'gemini-3.8-flash',
              isServerDefault: true,
            };
          }
          return data;
        }
      }
    } catch {
      // Fallback
    }

    return {
      connected: !!this.activeSession,
      provider: this.activeSession?.provider,
      model: this.activeSession?.model,
      isServerDefault: this.activeSession?.isServerDefault,
      hasUserSession: !!this.activeSession?.sessionToken,
    };
  }

  /**
   * Dispatches a user query, conversation context, and environmental readings to the server
   * or executes direct edge generation when in direct client mode.
   */
  public static async sendMessage(
    message: string,
    history: ChatMessage[] = [],
    signal?: AbortSignal,
    contextOverride?: {
      readings?: NoiseReading[];
      incidents?: NoiseIncident[];
      area?: string;
      selectedIncident?: NoiseIncident | null;
      selectedGrid?: string | null;
      userCoordinates?: { lat: number; lng: number } | null;
    }
  ): Promise<{ message: string; model?: string; provider?: string; toolsUsed?: ToolCallExecution[] }> {
    // If running in client direct mode, execute directly at edge
    if (this.activeSession?.mode === 'client_direct' && this.activeSession?.apiKey) {
      return this.sendDirectMessage(message, history, signal, contextOverride);
    }

    // Format conversation history for server-side payload
    const formattedHistory = history
      .filter((msg) => msg.status === 'success' && (msg.role === 'user' || msg.role === 'assistant'))
      .slice(-10) // Send up to last 10 successful messages for context
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Pass latest readings context for server-side tool execution
    const authorizedReadings = contextOverride?.readings || NoiseDataService.getAllReadings();

    const payload = {
      message: message.trim(),
      providerSessionToken: this.activeSession?.sessionToken || undefined,
      history: formattedHistory,
      context: {
        readings: authorizedReadings.slice(0, 50), // Bounded sample for tool queries
        area: contextOverride?.area,
        selectedIncident: contextOverride?.selectedIncident || null,
        selectedGrid: contextOverride?.selectedGrid || null,
        userCoordinates: contextOverride?.userCoordinates || null,
      },
    };

    let response: Response;
    const endpoint = this.getApiEndpoint();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.activeSession?.sessionToken) {
      headers['Authorization'] = `Bearer ${this.activeSession.sessionToken}`;
    }

    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal,
      });
    } catch (networkErr: any) {
      if (networkErr.name === 'AbortError') {
        throw new Error('Request was canceled.');
      }
      // If server is unreachable and user provided key, try direct fallback
      if (this.activeSession?.apiKey) {
        return this.sendDirectMessage(message, history, signal, contextOverride);
      }
      throw new Error(`Unable to connect to NoiseMap AI service at ${endpoint}. Please verify your network and server status.`);
    }

    // If server returned 404 or 405 (static host without backend) and we have apiKey, fallback to direct
    if ((response.status === 404 || response.status === 405) && this.activeSession?.apiKey) {
      return this.sendDirectMessage(message, history, signal, contextOverride);
    }

    let data: ChatApiResponse;
    try {
      data = await response.json();
    } catch {
      if (this.activeSession?.apiKey) {
        return this.sendDirectMessage(message, history, signal, contextOverride);
      }
      throw new Error(`Server returned an unparseable response (HTTP ${response.status}).`);
    }

    if (!response.ok || !data.success) {
      if (data?.error?.code === 'SESSION_EXPIRED') {
        this.activeSession = null;
      }
      const errorMsg = data?.error?.message || `AI service error (HTTP ${response.status}).`;
      const errorObj = new Error(errorMsg);
      (errorObj as any).code = data?.error?.code;
      (errorObj as any).retryable = data?.error?.retryable ?? true;
      throw errorObj;
    }

    if (!data.message) {
      throw new Error('AI service returned an empty response. Please try asking again.');
    }

    return {
      message: data.message,
      model: data.model,
      provider: (data as any).provider || this.activeSession?.provider || 'gemini',
      toolsUsed: data.toolsUsed,
    };
  }

  /**
   * Directly queries the provider using client-side environmental context.
   */
  private static async sendDirectMessage(
    message: string,
    history: ChatMessage[] = [],
    signal?: AbortSignal,
    contextOverride?: {
      readings?: NoiseReading[];
      incidents?: NoiseIncident[];
      area?: string;
      selectedIncident?: NoiseIncident | null;
      selectedGrid?: string | null;
      userCoordinates?: { lat: number; lng: number } | null;
    }
  ): Promise<{ message: string; model?: string; provider?: string; toolsUsed?: ToolCallExecution[] }> {
    const provider = this.activeSession?.provider || 'gemini';
    const apiKey = this.activeSession?.apiKey;
    if (!apiKey) {
      throw new Error('No active AI key found. Please reconnect your API key.');
    }

    // Build context hints
    const contextHints: string[] = [];
    if (contextOverride?.selectedIncident) {
      contextHints.push(`[Active User Map Context: Viewing incident ${contextOverride.selectedIncident.id} in sector ${contextOverride.selectedIncident.grid_id} (${contextOverride.selectedIncident.avg_db} dB avg, source: ${contextOverride.selectedIncident.dominant_source})]`);
    } else if (contextOverride?.selectedGrid) {
      contextHints.push(`[Active User Map Context: Selected Sector Grid ${contextOverride.selectedGrid}]`);
    }
    if (contextOverride?.userCoordinates && typeof contextOverride.userCoordinates.lat === 'number') {
      contextHints.push(`[User GPS: (${contextOverride.userCoordinates.lat.toFixed(4)}, ${contextOverride.userCoordinates.lng.toFixed(4)})]`);
    }

    let augmentedMessage = message.trim();
    if (contextHints.length > 0) {
      augmentedMessage = `${contextHints.join(' ')}\n\n${augmentedMessage}`;
    }

    // Fetch verified environmental readings from local store
    const readings = contextOverride?.readings || NoiseDataService.getAllReadings();
    const readingsSummary = readings
      .slice(0, 15)
      .map(
        (r) =>
          `- Sector ${r.grid_id} (${r.zone_type}): ${r.db_avg} dB avg, ${r.db_peak} dB peak, source: ${r.source_type}, recorded: ${r.created_at}`
      )
      .join('\n');

    const systemPrompt = `You are NoiseMap AI Copilot, an environmental intelligence assistant specializing in noise pollution, environmental sound awareness, decibel measurements, noise exposure, and practical noise-reduction guidance.

CURRENT NOISEMAP ENVIRONMENTAL TELEMETRY:
${readingsSummary ? `Recent verified readings:\n${readingsSummary}` : 'No verified readings recorded currently.'}

INSTRUCTIONS:
- Base location-specific findings on actual verified NoiseMap readings above.
- Do not invent environmental measurements, locations, incidents, or live conditions.
- If asked about areas without data, explain honestly that no readings are currently available for that sector.
- Reference CPCB (Noise Pollution Rules, 2000) limits when discussing compliance:
  * Residential: 55 dB day / 45 dB night
  * Commercial: 65 dB day / 55 dB night
  * Industrial: 75 dB day / 70 dB night
  * Silence Zone: 50 dB day / 40 dB night
- Never provide medical diagnoses or legal representation; offer informational civic guidance.`;

    if (provider === 'gemini') {
      const model = this.activeSession?.model || 'gemini-3.8-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const validHistory = history.filter((h) => h.status === 'success' && (h.role === 'user' || h.role === 'assistant'));
      const contents: any[] = [];

      contents.push({
        role: 'user',
        parts: [{ text: `[System Instructions: ${systemPrompt}]` }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I am NoiseMap AI Copilot ready to provide environmental intelligence.' }],
      });

      for (const h of validHistory.slice(-8)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: augmentedMessage }],
      });

      let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
        signal,
      });

      // If generateContent returns 404, fallback to Interactions API
      if (response.status === 404) {
        const interactionsUrl = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(apiKey)}`;
        response = await fetch(interactionsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            system_instruction: systemPrompt,
            input: augmentedMessage,
          }),
          signal,
        });
      }

      if (!response.ok) {
        let errData: any = {};
        try {
          errData = await response.json();
        } catch {}
        const msg = errData?.error?.message || `Gemini request failed (HTTP ${response.status})`;
        throw new Error(msg);
      }

      const resData = await response.json();
      const answer =
        resData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        resData?.output_text ||
        resData?.text ||
        '';
      return {
        message: answer.trim() || 'NoiseMap Copilot analyzed the telemetry but was unable to formulate a complete answer.',
        model,
        provider: 'gemini',
      };
    }

    if (provider === 'openai') {
      const model = this.activeSession?.model || 'gpt-4o-mini';
      const url = 'https://api.openai.com/v1/chat/completions';

      const validHistory = history.filter((h) => h.status === 'success' && (h.role === 'user' || h.role === 'assistant'));
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...validHistory.slice(-8).map((h) => ({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: h.content,
        })),
        { role: 'user', content: augmentedMessage },
      ];

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.4,
          max_tokens: 1024,
        }),
        signal,
      });

      if (!response.ok) {
        let errData: any = {};
        try {
          errData = await response.json();
        } catch {}
        const msg = errData?.error?.message || `OpenAI request failed (HTTP ${response.status})`;
        throw new Error(msg);
      }

      const resData = await response.json();
      const answer = resData?.choices?.[0]?.message?.content || '';
      return {
        message: answer.trim() || 'NoiseMap Copilot analyzed the telemetry but was unable to formulate a complete answer.',
        model,
        provider: 'openai',
      };
    }

    throw new Error(`Unsupported provider "${provider}".`);
  }
}
