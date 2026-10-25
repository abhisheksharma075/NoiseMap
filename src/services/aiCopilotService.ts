/**
 * NoiseMap AI Copilot - Frontend API Client Service
 * Dispatches conversational requests and ephemeral provider session management
 * to the secure backend endpoints.
 * 
 * STRICT CLIENT SECURITY INVARIANTS:
 * 1. User API keys are NEVER stored in localStorage, sessionStorage, cookies, or IndexedDB.
 * 2. Only the ephemeral session token is held in volatile memory for the active browser session.
 * 3. Clearing or disconnecting wipes the token from application memory immediately.
 */

import {
  ChatApiResponse,
  ChatMessage,
  ToolCallExecution,
  AIProviderType,
  ProviderSessionInfo,
  ConnectProviderResponse,
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
   * If valid, establishes an ephemeral session in server memory and stores the opaque token in client RAM.
   */
  public static async connectProvider(
    provider: AIProviderType,
    apiKey: string,
    testOnly: boolean = false
  ): Promise<ConnectProviderResponse> {
    const endpoint = this.getProviderSessionEndpoint();

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim(),
          testOnly,
        }),
      });
    } catch (err: any) {
      throw new Error(`Unable to reach NoiseMap validation service (${err.message}). Check your network connection.`);
    }

    let data: ConnectProviderResponse;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Validation service returned an unparseable response (HTTP ${response.status}).`);
    }

    if (!response.ok || !data.success) {
      const errMsg = data?.error?.message || 'Failed to validate API key with provider.';
      const errObj = new Error(errMsg);
      (errObj as any).code = data?.error?.code || 'VALIDATION_FAILED';
      throw errObj;
    }

    if (!testOnly && data.sessionToken) {
      this.activeSession = {
        provider: data.provider || provider,
        model: data.model || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'),
        sessionToken: data.sessionToken,
        maskedKey: data.maskedKey,
        expiresAt: data.expiresAt,
        isServerDefault: false,
      };
    }

    return data;
  }

  /**
   * Explicitly disconnects and terminates the active ephemeral provider session
   */
  public static async disconnectProvider(): Promise<void> {
    const endpoint = this.getProviderSessionEndpoint();
    const token = this.activeSession?.sessionToken;

    if (token) {
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

    // Immediately purge token from application memory
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
        const data = await response.json();
        if (data.isServerDefault && !this.activeSession) {
          this.activeSession = {
            provider: data.provider || 'gemini',
            model: data.model || 'gemini-2.5-flash',
            isServerDefault: true,
          };
        }
        return data;
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
   * Dispatches a user query, conversation context, and environmental readings to the server.
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
      throw new Error(`Unable to connect to NoiseMap AI service at ${endpoint}. Please verify your network and server status.`);
    }

    let data: ChatApiResponse;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Server returned an unparseable response (HTTP ${response.status}).`);
    }

    if (!response.ok || !data.success) {
      // If session expired, automatically clear token
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
}
