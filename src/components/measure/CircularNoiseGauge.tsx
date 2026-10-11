import React from 'react';

interface CircularNoiseGaugeProps {
  decibels: number;
  peakDb?: number;
  isSampling?: boolean;
  countdown?: number;
  className?: string;
}

export const CircularNoiseGauge: React.FC<CircularNoiseGaugeProps> = ({
  decibels,
  peakDb = 0,
  isSampling = false,
  countdown = 10,
  className = '',
}) => {
  // Gauge range from 30 dB to 120 dB (span = 90)
  const minDb = 30;
  const maxDb = 120;
  const clampedDb = Math.min(Math.max(decibels, minDb), maxDb);
  const normalized = (clampedDb - minDb) / (maxDb - minDb);

  // 240-degree arc (starts at 150 deg, ends at 390 deg)
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - arcLength * normalized;

  // Determine dynamic zone style with deliberate palette tokens
  const getZoneStyle = (db: number) => {
    if (db < 50) return { stroke: '#354C3C', text: 'text-forest dark:text-lime-signal', label: 'SAFE (<50 dB)' };
    if (db < 70) return { stroke: '#798263', text: 'text-olive dark:text-lime-signal', label: 'MODERATE (50-70 dB)' };
    if (db < 85) return { stroke: '#C46E50', text: 'text-terracotta', label: 'HARMFUL (70-85 dB)' };
    return { stroke: '#B05E42', text: 'text-[#B05E42] dark:text-[#E2886A]', label: 'CRITICAL (>85 dB)' };
  };

  const zone = getZoneStyle(decibels);

  return (
    <div className={`relative flex flex-col items-center justify-center font-mono ${className}`}>
      <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90" viewBox="0 0 240 240">
        {/* Background track arc */}
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          className="text-paper-border dark:text-night-border transform rotate-[150deg] origin-center"
        />

        {/* Dynamic active decibel arc */}
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke={zone.stroke}
          strokeWidth="12"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transform rotate-[150deg] origin-center transition-all duration-150 ease-out"
        />

        {/* Concentric vector guide ticks */}
        <circle
          cx="120"
          cy="120"
          r="72"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 6"
          className="text-stone/30"
        />
      </svg>

      {/* Center Readout & Vector Telemetry */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
        {isSampling && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-subtle dark:bg-forest/30 border border-forest/30 text-forest dark:text-lime-signal text-[10px] mb-1 font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-lime-signal"></span>
            SAMPLING: {countdown}s
          </div>
        )}

        <div className="flex items-baseline justify-center">
          <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-graphite dark:text-night-text font-sans">
            {decibels > 0 ? decibels.toFixed(1) : '--.-'}
          </span>
          <span className="text-sm font-semibold text-graphite-secondary dark:text-night-secondary ml-1">dB(A)</span>
        </div>

        <span className={`text-xs font-semibold uppercase tracking-wider mt-1 ${zone.text}`}>
          {decibels > 0 ? zone.label : 'IDLE / READY'}
        </span>

        {peakDb > 0 && (
          <div className="text-[11px] text-graphite-secondary dark:text-night-secondary font-mono mt-2 flex items-center gap-1">
            <span>PEAK:</span>
            <strong className="text-terracotta dark:text-[#E2886A]">{peakDb.toFixed(1)} dB</strong>
          </div>
        )}
      </div>
    </div>
  );
};
