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
    if (db < 50) return { label: 'SAFE', color: 'bg-forest', text: 'text-forest dark:text-lime-signal' };
    if (db < 70) return { label: 'MODERATE', color: 'bg-olive', text: 'text-olive dark:text-lime-signal' };
    if (db < 85) return { label: 'HARMFUL', color: 'bg-terracotta', text: 'text-terracotta' };
    return { label: 'CRITICAL / HAZARD', color: 'bg-[#B05E42]', text: 'text-[#B05E42] dark:text-[#E2886A]' };
  };

  const tone = getTone(decibels);
  const segments = Array.from({ length: 24 });

  return (
    <div className={`space-y-2 font-mono ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-graphite-secondary dark:text-night-secondary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-lime-signal"></span>
            ACOUSTIC INTENSITY
          </span>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm tracking-tight ${tone.text}`}>
              {decibels.toFixed(1)} <span className="text-xs text-graphite-secondary dark:text-night-secondary">dB(A)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-paper-border/50 dark:bg-night-border text-graphite dark:text-night-text border border-paper-border dark:border-night-border">
              {tone.label}
            </span>
          </div>
        </div>
      )}

      {/* Segmented LED meter */}
      <div className="grid grid-cols-24 gap-1 p-1 rounded-xl bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border">
        {segments.map((_, i) => {
          const segPercentage = (i / segments.length) * 100;
          const isActive = segPercentage <= percentage;
          const segDb = (i / segments.length) * maxDecibels;

          let segColor = 'bg-stone/15 dark:bg-stone/20';

          if (isActive) {
            if (segDb < 50) segColor = 'bg-forest dark:bg-forest-light';
            else if (segDb < 70) segColor = 'bg-[#8F9F24] dark:bg-lime-signal';
            else if (segDb < 85) segColor = 'bg-terracotta';
            else segColor = 'bg-[#B05E42]';
          }

          return (
            <div
              key={i}
              className={`h-4 rounded-[2px] transition-all duration-100 ${segColor}`}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] text-graphite-secondary dark:text-night-secondary font-mono">
        <span>0 dB (Silence)</span>
        <span>50 dB (Residential)</span>
        <span>70 dB (Commercial)</span>
        <span>85+ dB (WHO Limit)</span>
      </div>
    </div>
  );
};
