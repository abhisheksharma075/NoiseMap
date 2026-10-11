import React from 'react';

interface EvidenceScoreBarProps {
  score: number; // 0 to 100
  showBreakdown?: boolean;
  className?: string;
}

export const EvidenceScoreBar: React.FC<EvidenceScoreBarProps> = ({
  score,
  showBreakdown = true,
  className = '',
}) => {
  const clampedScore = Math.min(Math.max(score, 0), 100);

  const getColor = (s: number) => {
    if (s < 50) return { bar: 'bg-olive-600 dark:bg-olive-400', text: 'text-olive-700 dark:text-olive-300', label: 'MODERATE CONFIDENCE' };
    if (s < 75) return { bar: 'bg-terracotta-500 dark:text-terracotta-400', text: 'text-terracotta-600 dark:text-terracotta-300', label: 'STRONG CORROBORATION' };
    return { bar: 'bg-terracotta-600 dark:bg-terracotta-500', text: 'text-terracotta-700 dark:text-terracotta-300', label: 'LEGAL STATUTORY TEETH' };
  };

  const color = getColor(clampedScore);

  return (
    <div className={`space-y-1.5 font-mono text-xs ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-stone-600 dark:text-night-muted flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-forest-600 dark:bg-lime-400"></span>
          EVIDENCE CONFIDENCE SCORE:
        </span>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm ${color.text}`}>
            {clampedScore.toFixed(0)}%
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border text-graphite-800 dark:text-night-text font-semibold">
            {color.label}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full h-2 rounded-full bg-paper-200 dark:bg-night-900 border border-paper-border dark:border-night-border overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color.bar}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>

      {showBreakdown && (
        <div className="flex justify-between text-[10px] text-stone-500 dark:text-night-muted pt-0.5">
          <span>Density: 25%</span>
          <span>Peers: 25%</span>
          <span>Duration: 20%</span>
          <span>Avg: 15%</span>
          <span>Peak: 15%</span>
        </div>
      )}
    </div>
  );
};
