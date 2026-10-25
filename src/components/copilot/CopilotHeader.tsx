import React from 'react';
import { RotateCcw, Bot, Key, BookOpen } from 'lucide-react';

interface CopilotHeaderProps {
  onNewConversation: () => void;
  messageCount: number;
  onOpenSettings: () => void;
}

export const CopilotHeader: React.FC<CopilotHeaderProps> = ({
  onNewConversation,
  messageCount,
  onOpenSettings,
}) => {
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
              NOISEMAP COPILOT
            </h1>

            {/* Offline FAQ Mode Status Pill */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border bg-forest/10 text-forest dark:text-teal-300 border-forest/30 dark:border-teal-500/30"
              title="Operating in deterministic local FAQ mode without external cloud AI connections"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-teal-signal" />
              <BookOpen className="w-3 h-3 text-forest dark:text-teal-signal" />
              <span>FAQ MODE · Offline Assistant</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-graphite-secondary dark:text-night-secondary font-sans hidden sm:block">
            Instant Answers • Decibels • Measurements • Incidents • Reporting
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Demo API Key Placeholder Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="px-2.5 py-1.5 rounded-xl border border-paper-border dark:border-night-border bg-paper hover:bg-paper-200 dark:bg-night-card dark:hover:bg-night-surface text-graphite dark:text-night-text transition-all font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="Open simulated Gemini API Key demonstration placeholder"
          aria-label="Demo API Key Placeholder"
        >
          <Key className="w-3.5 h-3.5 text-forest dark:text-teal-signal" />
          <span className="hidden xs:inline">DEMO API KEY</span>
        </button>

        {/* Clear / New Conversation Button */}
        {messageCount > 0 && (
          <button
            type="button"
            onClick={onNewConversation}
            className="px-2.5 py-1.5 rounded-xl border border-paper-border dark:border-night-border bg-paper hover:bg-paper-200 dark:bg-night-card dark:hover:bg-night-surface text-graphite dark:text-night-text transition-all font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Reset conversation and start new session"
            aria-label="New Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500 hover:rotate-180 transition-transform duration-300" />
            <span className="hidden sm:inline">NEW CHAT</span>
          </button>
        )}
      </div>
    </div>
  );
};
