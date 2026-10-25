/**
 * NoiseMap AI Copilot - Ephemeral Provider Session Store
 * Secure, in-memory volatile session store for user-supplied AI provider credentials.
 * 
 * STRICT SECURITY INVARIANTS:
 * 1. Volatile memory only — NEVER persisted to disk, database, cookies, or localStorage.
 * 2. Short-lived idle expiration (30 minutes default) with periodic garbage collection.
 * 3. Cryptographically random session tokens (crypto.randomBytes).
 * 4. Bounded capacity (max 200 concurrent sessions) with LRU eviction.
 * 5. Redaction — complete raw API keys are NEVER printed, logged, or serialized in public summaries.
 */

import crypto from 'crypto';

export const SESSION_CONFIG = {
  IDLE_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  MAX_SESSIONS: 200,
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
};

class ProviderSessionStore {
  constructor() {
    this.sessions = new Map();
    this.cleanupTimer = null;
    this.startPeriodicCleanup();
  }

  /**
   * Starts periodic garbage collection of expired sessions
   */
  startPeriodicCleanup() {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => {
      this.cleanExpiredSessions();
    }, SESSION_CONFIG.CLEANUP_INTERVAL_MS);

    // Unref timer so it does not keep Node.js process alive in test suites
    if (this.cleanupTimer && typeof this.cleanupTimer.unref === 'function') {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Creates an ephemeral provider session
   */
  createSession({ provider, apiKey, model }) {
    if (!provider || !['gemini', 'openai'].includes(provider)) {
      throw new Error(`Invalid provider "${provider}". Supported providers: gemini, openai`);
    }
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new Error('API key must be a non-empty string.');
    }

    // Clean expired sessions if reaching capacity
    if (this.sessions.size >= SESSION_CONFIG.MAX_SESSIONS) {
      this.cleanExpiredSessions();
      // If still full, drop oldest session
      if (this.sessions.size >= SESSION_CONFIG.MAX_SESSIONS) {
        const oldestKey = this.sessions.keys().next().value;
        if (oldestKey) this.sessions.delete(oldestKey);
      }
    }

    const sessionToken = `nm_ps_${crypto.randomBytes(24).toString('hex')}`;
    const cleanKey = apiKey.trim();
    const now = Date.now();
    const expiresAt = now + SESSION_CONFIG.IDLE_TIMEOUT_MS;

    // Masked key preview for UI settings (e.g. AIza...4a89 or sk-p...3a12)
    const maskedKey =
      cleanKey.length > 8
        ? `${cleanKey.slice(0, 4)}...${cleanKey.slice(-4)}`
        : '••••••••';

    let activeModel = model || (provider === 'gemini' ? 'gemini-3.8-flash' : 'gpt-4o-mini');
    if (provider === 'gemini' && (activeModel === 'gemini-2.5-flash' || activeModel === 'models/gemini-2.5-flash')) {
      activeModel = 'gemini-3.8-flash';
    }

    const session = {
      id: sessionToken,
      provider,
      apiKey: cleanKey,
      model: activeModel,
      maskedKey,
      createdAt: now,
      lastUsedAt: now,
      expiresAt,
    };

    this.sessions.set(sessionToken, session);

    return {
      sessionToken,
      provider: session.provider,
      model: session.model,
      maskedKey: session.maskedKey,
      expiresAt,
    };
  }

  /**
   * Retrieves an active session and refreshes its idle expiration window
   */
  getSession(sessionToken) {
    if (!sessionToken || typeof sessionToken !== 'string') {
      return null;
    }

    const session = this.sessions.get(sessionToken);
    if (!session) {
      return null;
    }

    const now = Date.now();
    if (now > session.expiresAt) {
      this.sessions.delete(sessionToken);
      return null;
    }

    // Extend idle expiration window on active use
    session.lastUsedAt = now;
    session.expiresAt = now + SESSION_CONFIG.IDLE_TIMEOUT_MS;

    return session;
  }

  /**
   * Explicitly terminates a provider session on disconnect
   */
  deleteSession(sessionToken) {
    if (!sessionToken) return false;
    return this.sessions.delete(sessionToken);
  }

  /**
   * Purges all expired sessions from memory
   */
  cleanExpiredSessions() {
    const now = Date.now();
    for (const [token, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(token);
      }
    }
  }

  /**
   * Returns current active session count
   */
  getActiveCount() {
    this.cleanExpiredSessions();
    return this.sessions.size;
  }

  /**
   * Resets all in-memory sessions (for test suite isolation)
   */
  clearAll() {
    this.sessions.clear();
  }

  /**
   * Stops periodic cleanup timer
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.sessions.clear();
  }
}

export const sessionStore = new ProviderSessionStore();
