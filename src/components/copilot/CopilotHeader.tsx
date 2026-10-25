import React from 'react';
import { RotateCcw, Bot, Settings, LogOut, Sparkles, Zap, ShieldAlert } from 'lucide-react';
import { ProviderSessionInfo } from '../../types/copilot';

interface CopilotHeaderProps {
  onNewConversation: () => void;
  messageCount: number;
  session: ProviderSessionInfo | null;
  onOpenSettings: () => void;
  onDisconnect: () => void;
}

export const CopilotHeader: React.FC<CopilotHeaderProps> = ({
  onNewConversation,
  messageCount,
  session,
  onOpenSettings,
  onDisconnect,
}) => {
  const isConnected = !!session;
  const isGemini = session?.provider === 'gemini';
  const isOpenAi = session?.provider === 'openai';

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paper-border dark:border-night-border select-none">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-forest/10 dark:bg-teal-500/15 border border-forest/30 dark:border-teal-500/40 flex items-center justify-center text-forest dark:text-teal-signal shadow-sm flex-shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold font-mono tracking-tight text-graphite dark:text-night-text">
              NOISEMAP AI COPILOT
            </h1>

            {/* Provider Connectivity Pill */}
            {isConnected ? (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                  isGemini
                    ? 'bg-forest/10 text-forest dark:text-teal-300 border-forest/30 dark:border-teal-500/30'
                    : 'bg-emerald-500/10 text-emerald-800 dark:text-lime-300 border-emerald-500/30 dark:border-lime-400/30'
                }`}
                title={`Active model: ${session.model || 'Standard'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isGemini ? (
                  <Sparkles className="w-3 h-3 text-forest dark:text-teal-signal" />
                ) : isOpenAi ? (
                  <Zap className="w-3 h-3 text-emerald-600 dark:text-lime-400" />
                ) : null}
                <span>
                  {session.isServerDefault
                    ? 'Server AI · Gemini'
                    : isGemini
                    ? 'Connected · Google Gemini'
                    : 'Connected · OpenAI'}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <ShieldAlert className="w-3 h-3" />
                <span>Not Connected</span>
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-graphite-secondary dark:text-night-secondary font-sans hidden sm:block">
            Understand Noise • Discover Insights • Create Quieter Spaces
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Settings / Change Provider Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="px-2.5 py-1.5 rounded-xl border border-paper-border dark:border-night-border bg-paper hover:bg-paper-200 dark:bg-night-card dark:hover:bg-night-surface text-graphite dark:text-night-text transition-all font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="Configure AI Provider & API Key"
          aria-label="Provider Settings"
        >
          <Settings className="w-3.5 h-3.5 text-forest dark:text-teal-signal" />
          <span className="hidden xs:inline">SETTINGS</span>
        </button>

        {/* Disconnect Provider Button (only if connected with user session) */}
        {isConnected && !session.isServerDefault && (
          <button
            type="button"
            onClick={onDisconnect}
            className="px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 transition-all font-mono text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
            title="Disconnect active provider session and wipe credentials from memory"
            aria-label="Disconnect AI Provider"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DISCONNECT</span>
          </button>
        )}

        {/* New Conversation Button */}
        {messageCount > 0 && (
          <button
            type="button"
            onClick={onNewConversation}
            className="px-3 py-1.5 rounded-xl border border-paper-border dark:border-night-border bg-paper hover:bg-paper-200 dark:bg-night-card dark:hover:bg-night-surface text-graphite dark:text-night-text transition-all font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-102"
            title="Start New Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-forest dark:text-teal-signal" />
            <span className="hidden xs:inline">NEW CHAT</span>
          </button>
        )}
      </div>
    </div>
  );
};
