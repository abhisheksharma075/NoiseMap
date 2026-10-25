import React from 'react';
import { Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { DEFAULT_SUGGESTED_QUESTIONS, SuggestedQuestion } from '../../types/copilot';

interface WelcomeSectionProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  onSelectQuestion,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-6 sm:py-10 px-2 animate-in fade-in duration-300">
      {/* Soundwave / Environmental Emblem */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-forest-subtle dark:bg-teal-500/10 border border-forest/20 dark:border-teal-500/30 flex items-center justify-center shadow-lg">
          {/* Animated sound wave bars */}
          <div className="flex items-center gap-1.5 h-10">
            <span className="w-1.5 h-6 bg-forest dark:bg-teal-signal rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-9 bg-forest dark:bg-teal-signal rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-10 bg-forest dark:bg-teal-signal rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-1.5 h-7 bg-forest dark:bg-teal-signal rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
            <span className="w-1.5 h-5 bg-forest dark:bg-teal-signal rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-forest text-paper dark:bg-teal-600 dark:text-night-bg shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-lime-signal dark:text-teal-200" />
        </div>
      </div>

      {/* Main Title & Tagline */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-mono text-center text-graphite dark:text-night-text tracking-tight mb-2">
        Welcome to NoiseMap AI Copilot
      </h2>
      <p className="text-xs sm:text-sm text-center text-graphite-secondary dark:text-night-secondary max-w-xl font-sans mb-8 leading-relaxed">
        Ask me about noise pollution, sound levels, noise exposure, or practical ways to create quieter environments.
      </p>

      {/* Suggested Questions Grid */}
      <div className="w-full space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-night-muted px-1">
          <span className="uppercase font-semibold tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-forest dark:text-teal-signal" />
            Suggested Questions
          </span>
          <span className="text-[10px]">Click any to ask immediately</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEFAULT_SUGGESTED_QUESTIONS.map((item: SuggestedQuestion) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectQuestion(item.question)}
              className="group text-left p-3.5 rounded-2xl bg-paper dark:bg-night-card hover:bg-forest-subtle/50 dark:hover:bg-teal-900/20 border border-paper-border dark:border-night-border hover:border-forest/40 dark:hover:border-teal-500/50 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between gap-2 disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-paper-200 dark:bg-night-surface text-forest dark:text-teal-300">
                  {item.category}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-forest dark:group-hover:text-teal-signal group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-graphite dark:text-night-text group-hover:text-forest dark:group-hover:text-teal-signal transition-colors">
                "{item.question}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
