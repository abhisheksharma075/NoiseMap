import React, { useState } from 'react';
import { BookOpen, ArrowRight, HelpCircle } from 'lucide-react';
import { FAQ_CATEGORIES } from '../../data/noiseMapFaqData';
import { FaqChatbotService } from '../../services/faqChatbotService';
import { FaqCategoryType } from '../../types/copilot';

interface WelcomeSectionProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  onSelectQuestion,
  disabled = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategoryType>('ABOUT NOISEMAP');

  const questionsForCategory = FaqChatbotService.getQuestionsByCategory(selectedCategory);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-4 sm:py-8 px-2 animate-in fade-in duration-300">
      {/* Soundwave Emblem */}
      <div className="relative mb-3 flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-forest-subtle dark:bg-teal-500/10 border border-forest/20 dark:border-teal-500/30 flex items-center justify-center shadow-md">
          <div className="flex items-center gap-1.5 h-8">
            <span className="w-1.5 h-4 bg-forest dark:bg-teal-signal rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-7 bg-forest dark:bg-teal-signal rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-8 bg-forest dark:bg-teal-signal rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-1.5 h-5 bg-forest dark:bg-teal-signal rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
            <span className="w-1.5 h-3 bg-forest dark:bg-teal-signal rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-forest text-paper dark:bg-teal-600 dark:text-night-bg shadow-sm">
          <BookOpen className="w-3 h-3 text-lime-signal dark:text-teal-200" />
        </div>
      </div>

      {/* Main Title & Tagline */}
      <h2 className="text-lg sm:text-2xl font-extrabold font-mono text-center text-graphite dark:text-night-text tracking-tight mb-1.5">
        NoiseMap FAQ Assistant
      </h2>
      <p className="text-xs sm:text-sm text-center text-graphite-secondary dark:text-night-secondary max-w-xl font-sans mb-5 leading-relaxed">
        Instant, deterministic answers about sound exposure, decibel levels, noise map telemetry, incident tracking, and reporting. Operates completely offline without an API key.
      </p>

      {/* Category Tabs */}
      <div className="w-full mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-forest dark:bg-teal-600 text-white dark:text-night-bg shadow-sm'
                : 'bg-paper-200 dark:bg-night-surface text-stone-600 dark:text-night-secondary hover:bg-paper-300 dark:hover:bg-night-850'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Suggested Questions Grid for Selected Category */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-night-muted px-1">
          <span className="uppercase font-semibold tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-forest dark:text-teal-signal" />
            {selectedCategory}
          </span>
          <span className="text-[10px]">Click any to view answer</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {questionsForCategory.slice(0, 6).map((q) => (
            <button
              key={q}
              type="button"
              disabled={disabled}
              onClick={() => onSelectQuestion(q)}
              className="group text-left p-3 rounded-xl bg-paper dark:bg-night-card hover:bg-forest-subtle/50 dark:hover:bg-teal-900/20 border border-paper-border dark:border-night-border hover:border-forest/40 dark:hover:border-teal-500/50 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-2 disabled:opacity-50"
            >
              <p className="text-xs font-medium text-graphite dark:text-night-text group-hover:text-forest dark:group-hover:text-teal-signal transition-colors line-clamp-2">
                "{q}"
              </p>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 text-stone-400 group-hover:text-forest dark:group-hover:text-teal-signal group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
