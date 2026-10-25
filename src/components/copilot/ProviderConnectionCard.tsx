import React, { useState } from 'react';
import {
  ShieldAlert,
  Key,
  Eye,
  EyeOff,
  X,
  Info,
  Sparkles,
} from 'lucide-react';

interface ProviderConnectionCardProps {
  onCancel?: () => void;
  isSettingsMode?: boolean;
}

export const ProviderConnectionCard: React.FC<ProviderConnectionCardProps> = ({
  onCancel,
  isSettingsMode = false,
}) => {
  const [demoKey, setDemoKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [demoStatusMessage, setDemoStatusMessage] = useState<string | null>(null);

  const handlePreviewDemo = () => {
    // Purely simulated UI feedback - zero network calls, zero storage, zero credentials
    setDemoStatusMessage('Demo interface preview activated. No API connection was created.');
  };

  const handleResetOrClear = () => {
    setDemoKey('');
    setDemoStatusMessage(null);
  };

  const handleClose = () => {
    handleResetOrClear();
    if (onCancel) {
      onCancel();
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
              {isSettingsMode ? 'Demonstration Configuration' : 'Simulated Provider Interface'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-stone-600 dark:text-night-secondary font-sans leading-relaxed">
            This demonstration element illustrates an API-key configuration interface. The FAQ chatbot operates locally and does not require or use an API key.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-night-text hover:bg-paper-200 dark:hover:bg-night-surface transition-colors cursor-pointer"
            title="Close Demonstration Dialog"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Demonstration Notice Box */}
      <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 font-sans flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-mono uppercase block text-[10px] tracking-wider mb-0.5">
            Offline FAQ Mode Active
          </strong>
          NoiseMap Copilot is functioning in deterministic FAQ mode. It answers questions instantly using local predefined answers. No real API key is required or used.
        </div>
      </div>

      {/* API Key Input Field (Simulated Demo Only) */}
      <div className="mt-4 space-y-1.5">
        <label
          htmlFor="demo-api-key-input"
          className="block font-mono text-[11px] font-bold text-stone-700 dark:text-night-muted uppercase tracking-wider"
        >
          Gemini API Key — Demo UI Only
        </label>

        <div className="relative flex items-center">
          <input
            id="demo-api-key-input"
            type={showKey ? 'text' : 'password'}
            value={demoKey}
            onChange={(e) => {
              setDemoKey(e.target.value);
              if (demoStatusMessage) setDemoStatusMessage(null);
            }}
            placeholder="Enter a demo value only"
            autoComplete="off"
            spellCheck="false"
            className="w-full px-3.5 py-2.5 pr-20 rounded-xl bg-paper dark:bg-night-850 border border-paper-border dark:border-night-border text-graphite dark:text-night-text font-mono text-xs focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-teal-400 focus:border-transparent transition-all placeholder:text-stone-400 dark:placeholder:text-night-muted"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {demoKey.length > 0 && (
              <button
                type="button"
                onClick={() => setDemoKey('')}
                className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-night-text transition-colors cursor-pointer"
                title="Clear input"
                aria-label="Clear demo key input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="p-1.5 rounded text-stone-500 hover:text-graphite dark:hover:text-night-text transition-colors cursor-pointer"
              title={showKey ? 'Hide value' : 'Show value'}
              aria-label={showKey ? 'Hide demo value' : 'Show demo value'}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Required Demonstration Notice immediately below field */}
        <p className="text-[11px] text-stone-500 dark:text-night-secondary font-sans leading-relaxed pt-1">
          This is a demonstration placeholder. It does not connect to Gemini or validate API credentials. Do not enter a real API key. The FAQ chatbot works without an API key.
        </p>
      </div>

      {/* Simulated Preview Feedback Banner */}
      {demoStatusMessage && (
        <div className="mt-3 p-3 rounded-xl bg-forest/10 dark:bg-teal-500/15 border border-forest/30 dark:border-teal-500/40 text-forest-800 dark:text-teal-200 text-xs flex items-center gap-2 animate-in fade-in">
          <Info className="w-4 h-4 text-forest dark:text-teal-signal flex-shrink-0" />
          <span className="font-sans font-medium">{demoStatusMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-paper-border/80 dark:border-night-border/80 flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-paper-border dark:border-night-border bg-paper hover:bg-paper-200 dark:bg-night-surface dark:hover:bg-night-850 text-graphite dark:text-night-text font-mono text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            Close
          </button>
        )}

        <button
          type="button"
          onClick={handlePreviewDemo}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-paper dark:text-night-bg font-mono text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Preview Demo UI</span>
        </button>
      </div>
    </div>
  );
};
