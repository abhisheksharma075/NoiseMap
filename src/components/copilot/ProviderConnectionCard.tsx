import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { AIProviderType, ProviderSessionInfo } from '../../types/copilot';
import { AiCopilotService } from '../../services/aiCopilotService';

interface ProviderConnectionCardProps {
  onConnected: (session: ProviderSessionInfo) => void;
  onCancel?: () => void;
  isSettingsMode?: boolean;
  currentSession?: ProviderSessionInfo | null;
}

export const ProviderConnectionCard: React.FC<ProviderConnectionCardProps> = ({
  onConnected,
  onCancel,
  isSettingsMode = false,
  currentSession,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(
    currentSession?.provider || 'gemini'
  );
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleProviderSelect = (provider: AIProviderType) => {
    if (provider !== selectedProvider) {
      setSelectedProvider(provider);
      setApiKey(''); // Clear previous key to avoid sending credential to wrong provider
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  };

  const handleValidation = async (testOnly: boolean = false) => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setErrorMessage(
        `Please paste your ${selectedProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'} API key.`
      );
      setErrorCode('EMPTY_KEY');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    if (testOnly) {
      setIsTesting(true);
    } else {
      setIsValidating(true);
    }

    try {
      const response = await AiCopilotService.connectProvider(selectedProvider, trimmed, testOnly);

      if (testOnly) {
        setSuccessMessage(
          `Verified! Your ${selectedProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'} key is valid and responsive.`
        );
      } else if (response.sessionToken) {
        setSuccessMessage('Connected successfully! Activating NoiseMap Copilot...');
        setTimeout(() => {
          onConnected({
            provider: response.provider || selectedProvider,
            model: response.model || (selectedProvider === 'gemini' ? 'gemini-3.8-flash' : 'gpt-4o-mini'),
            sessionToken: response.sessionToken,
            maskedKey: response.maskedKey,
            expiresAt: response.expiresAt,
          });
        }, 600);
      }
    } catch (err: any) {
      const code = err.code || 'VALIDATION_FAILED';
      setErrorCode(code);
      if (code === 'INVALID_API_KEY') {
        setErrorMessage(
          `Invalid API key. Check your key and ensure it belongs to ${
            selectedProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'
          }, then try again.`
        );
      } else if (code === 'QUOTA_EXCEEDED' || code === 'BILLING_RESTRICTION') {
        setErrorMessage(
          err.message ||
            'Quota or billing limit reached for this API key. Please check your provider account billing dashboard.'
        );
      } else if (code === 'NETWORK_ERROR') {
        setErrorMessage('Unable to reach the AI provider. Check your network connection and retry.');
      } else {
        setErrorMessage(err.message || 'Failed to validate API key. Please try again.');
      }
    } finally {
      setIsValidating(false);
      setIsTesting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-auto p-4 sm:p-6 bg-paper-50 dark:bg-night-card border border-paper-border dark:border-night-border rounded-2xl shadow-field animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-paper-border/80 dark:border-night-border/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest/10 dark:bg-teal-500/15 border border-forest/30 dark:border-teal-500/40 flex items-center justify-center text-forest dark:text-teal-signal">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-mono font-bold text-graphite dark:text-night-text">
              {isSettingsMode ? 'AI Provider Configuration' : 'Connect Your AI Provider'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-stone-600 dark:text-night-secondary font-sans leading-relaxed">
            Connect NoiseMap AI Copilot using your own Gemini or OpenAI API key. Choose your preferred AI provider, securely validate your key, and start chatting.
          </p>
        </div>

        {isSettingsMode && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-paper-200 dark:hover:bg-night-surface transition-colors cursor-pointer"
            title="Close Settings"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Provider Selector Cards */}
      <div className="mt-4 space-y-2">
        <label className="block font-mono text-[11px] font-semibold text-stone-700 dark:text-night-muted uppercase tracking-wider">
          Select AI Provider
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Option A: Google Gemini */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleProviderSelect('gemini')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleProviderSelect('gemini');
              }
            }}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              selectedProvider === 'gemini'
                ? 'bg-forest/10 dark:bg-teal-500/15 border-forest dark:border-teal-400 ring-2 ring-forest/20 dark:ring-teal-400/20 shadow-sm'
                : 'bg-paper dark:bg-night-850 border-paper-border dark:border-night-border hover:border-forest/50 dark:hover:border-teal-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest dark:text-teal-signal" />
                <span className="font-mono text-sm font-bold text-graphite dark:text-night-text">
                  Google Gemini
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-forest/15 dark:bg-teal-500/25 text-forest dark:text-teal-300 border border-forest/30 dark:border-teal-500/30">
                RECOMMENDED
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-500 dark:text-night-secondary font-sans leading-tight">
              Connect using your Gemini API key (supports Gemini 2.5 Flash with full NoiseMap tools).
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono text-forest dark:text-teal-signal hover:underline"
            >
              <span>Get Gemini Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Option B: OpenAI */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleProviderSelect('openai')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleProviderSelect('openai');
              }
            }}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              selectedProvider === 'openai'
                ? 'bg-forest/10 dark:bg-teal-500/15 border-forest dark:border-teal-400 ring-2 ring-forest/20 dark:ring-teal-400/20 shadow-sm'
                : 'bg-paper dark:bg-night-850 border-paper-border dark:border-night-border hover:border-forest/50 dark:hover:border-teal-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-lime-400" />
                <span className="font-mono text-sm font-bold text-graphite dark:text-night-text">
                  OpenAI
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-stone-500 dark:text-night-secondary font-sans leading-tight">
              Connect using your OpenAI API key for GPT models (gpt-4o-mini with tool calling).
            </p>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-lime-400 hover:underline"
            >
              <span>Get OpenAI Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* OpenAI Password Warning Notice */}
        {selectedProvider === 'openai' && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 font-sans leading-relaxed">
            <strong>Important:</strong> An OpenAI API key is separate from your personal ChatGPT login password. ChatGPT Plus subscription billing and API platform credits are billed separately.
          </div>
        )}
      </div>

      {/* API Key Input Field */}
      <div className="mt-4 space-y-1.5">
        <label
          htmlFor="api-key-input"
          className="block font-mono text-[11px] font-semibold text-stone-700 dark:text-night-muted uppercase tracking-wider"
        >
          {selectedProvider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
        </label>

        <div className="relative flex items-center">
          <input
            id="api-key-input"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={
              selectedProvider === 'gemini'
                ? 'Paste your Gemini API key (e.g. AIzaSy...)'
                : 'Paste your OpenAI API key (e.g. sk-proj-...)'
            }
            autoComplete="off"
            spellCheck="false"
            disabled={isValidating || isTesting}
            className="w-full px-3.5 py-2.5 pr-20 rounded-xl bg-paper dark:bg-night-850 border border-paper-border dark:border-night-border text-graphite dark:text-night-text font-mono text-xs focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-teal-400 focus:border-transparent transition-all placeholder:text-stone-400 dark:placeholder:text-night-muted"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {apiKey.length > 0 && (
              <button
                type="button"
                onClick={() => setApiKey('')}
                disabled={isValidating || isTesting}
                className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-night-text transition-colors"
                title="Clear input"
                aria-label="Clear API key input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              disabled={isValidating || isTesting}
              className="p-1.5 rounded text-stone-500 hover:text-graphite dark:hover:text-night-text transition-colors"
              title={showKey ? 'Hide key' : 'Show key'}
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Existing masked key display in settings mode */}
        {isSettingsMode && currentSession?.maskedKey && !apiKey && (
          <p className="text-[11px] font-mono text-stone-500 dark:text-night-muted">
            Current active key: <code>{currentSession.maskedKey}</code> (leave blank to keep current session)
          </p>
        )}
      </div>

      {/* Validation / Error Feedback Banner */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-sans">
            <span className="font-semibold block font-mono text-[11px]">
              {errorCode ? `ERROR: ${errorCode}` : 'CONNECTION FAILED'}
            </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-teal-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-teal-signal flex-shrink-0" />
          <span className="font-sans font-medium">{successMessage}</span>
        </div>
      )}

      {/* Security and Ephemeral Privacy Notice */}
      <div className="mt-4 p-3 rounded-xl bg-forest/5 dark:bg-night-850/70 border border-forest/15 dark:border-teal-500/20 text-[11px] text-stone-600 dark:text-night-muted font-sans leading-relaxed">
        <div className="flex items-center gap-1.5 font-mono font-semibold text-forest dark:text-teal-signal text-[10px] uppercase mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Volatile Session Privacy Guarantee</span>
        </div>
        Your API key is sent securely to the NoiseMap backend to validate and process AI requests. It is kept temporarily in server memory for your session and is not intentionally stored in browser storage, a database, or persistent application logs. API usage may count against your provider's quota or billing account.
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-paper-border/80 dark:border-night-border/80 flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => handleValidation(true)}
          disabled={isValidating || isTesting || apiKey.trim().length === 0}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-paper-border dark:border-night-border bg-paper hover:bg-paper-200 dark:bg-night-surface dark:hover:bg-night-850 text-graphite dark:text-night-text font-mono text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm"
        >
          {isTesting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-forest dark:text-teal-signal" />
              <span>Testing...</span>
            </>
          ) : (
            <span>Test Connection</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleValidation(false)}
          disabled={isValidating || isTesting || apiKey.trim().length === 0}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-paper dark:text-night-bg font-mono text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {isValidating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Validating API key...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Connect & Start Chatting</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
