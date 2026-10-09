import React from 'react';

interface AcousticGaugeBarProps {
  decibels: number;
  maxDecibels?: number;
  showLabels?: boolean;
  className?: string;
}

export const AcousticGaugeBar: React.FC<AcousticGaugeBarProps> = ({
  decibels,
  maxDecibels = 120,
  showLabels = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((decibels / maxDecibels) * 100, 0), 100);

  const getTone = (db: number) => {
    if (db < 50) return { label: 'SAFE', color: 'bg-emerald-400', glow: 'shadow-glow-emerald', text: 'text-emerald-400' };
    if (db < 70) return { label: 'MODERATE', color: 'bg-amber-400', glow: 'shadow-glow-amber', text: 'text-amber-400' };
    if (db < 85) return { label: 'HARMFUL', color: 'bg-orange-500', glow: 'shadow-glow-amber', text: 'text-orange-400' };
    return { label: 'CRITICAL / HAZARD', color: 'bg-rose-500', glow: 'shadow-glow-crimson', text: 'text-rose-400' };
  };

  const tone = getTone(decibels);
  const segments = Array.from({ length: 24 });

  return (
    <div className={`space-y-2 font-mono ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            ACOUSTIC INTENSITY
          </span>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm tracking-tight ${tone.text}`}>
              {decibels.toFixed(1)} <span className="text-xs text-slate-400">dB(A)</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {tone.label}
            </span>
          </div>
        </div>
      )}

      {/* Segmented phosphor LED bar */}
      <div className="grid grid-cols-24 gap-1 p-1 rounded-lg bg-slate-950 border border-white/10">
        {segments.map((_, i) => {
          const segPercentage = (i / segments.length) * 100;
          const isActive = segPercentage <= percentage;
          const segDb = (i / segments.length) * maxDecibels;

          let segColor = 'bg-emerald-500/20';
          if (segDb >= 50) segColor = 'bg-amber-500/20';
          if (segDb >= 70) segColor = 'bg-orange-500/20';
          if (segDb >= 85) segColor = 'bg-rose-500/20';

          if (isActive) {
            if (segDb < 50) segColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]';
            else if (segDb < 70) segColor = 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]';
            else if (segDb < 85) segColor = 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]';
            else segColor = 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]';
          }

          return (
            <div
              key={i}
              className={`h-4 rounded-[2px] transition-all duration-100 ${segColor}`}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>0 dB (Silence)</span>
        <span>50 dB (Residential)</span>
        <span>70 dB (Commercial)</span>
        <span>85+ dB (WHO Limit)</span>
      </div>
    </div>
  );
};
