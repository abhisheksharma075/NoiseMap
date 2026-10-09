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
    if (s < 50) return { bar: 'bg-amber-400', glow: 'shadow-glow-amber', text: 'text-amber-400', label: 'MODERATE CONFIDENCE' };
    if (s < 75) return { bar: 'bg-orange-500', glow: 'shadow-glow-amber', text: 'text-orange-400', label: 'STRONG CORROBORATION' };
    return { bar: 'bg-rose-500', glow: 'shadow-glow-crimson', text: 'text-rose-400', label: 'LEGAL STATUTORY TEETH' };
  };

  const color = getColor(clampedScore);

  return (
    <div className={`space-y-1.5 font-mono text-xs ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          EVIDENCE CONFIDENCE SCORE:
        </span>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm ${color.text}`}>
            {clampedScore.toFixed(0)}%
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
            {color.label}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full h-2 rounded bg-slate-950 border border-white/10 overflow-hidden relative">
        <div
          className={`h-full rounded transition-all duration-300 ${color.bar}`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>

      {showBreakdown && (
        <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
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
