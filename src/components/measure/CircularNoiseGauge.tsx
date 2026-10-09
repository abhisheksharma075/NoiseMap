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

  // Determine dynamic zone color
  const getZoneStyle = (db: number) => {
    if (db < 50) return { stroke: '#10B981', glow: 'drop-shadow(0 0 12px rgba(16,185,129,0.5))', text: 'text-emerald-400', label: 'SAFE (<50 dB)' };
    if (db < 70) return { stroke: '#F59E0B', glow: 'drop-shadow(0 0 12px rgba(245,158,11,0.5))', text: 'text-amber-400', label: 'MODERATE (50-70 dB)' };
    if (db < 85) return { stroke: '#F97316', glow: 'drop-shadow(0 0 14px rgba(249,115,22,0.6))', text: 'text-orange-400', label: 'HARMFUL (70-85 dB)' };
    return { stroke: '#EF4444', glow: 'drop-shadow(0 0 18px rgba(239,68,68,0.8))', text: 'text-rose-400', label: 'CRITICAL (>85 dB)' };
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
          stroke="#1E293B"
          strokeWidth="12"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          className="transform rotate-[150deg] origin-center"
        />

        {/* Dynamic active phosphor decibel arc */}
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
          style={{ filter: zone.glow }}
          className="transform rotate-[150deg] origin-center transition-all duration-150 ease-out"
        />

        {/* Concentric vector guide ticks */}
        <circle
          cx="120"
          cy="120"
          r="72"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      </svg>

      {/* Center Readout & Vector Telemetry */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
        {isSampling && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[10px] mb-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            SAMPLING: {countdown}s REMAINING
          </div>
        )}

        <div className="flex items-baseline justify-center">
          <span className={`text-5xl sm:text-6xl font-extrabold tracking-tighter ${zone.text}`}>
            {decibels > 0 ? decibels.toFixed(1) : '--.-'}
          </span>
          <span className="text-sm font-semibold text-slate-400 ml-1">dB(A)</span>
        </div>

        <span className={`text-xs font-semibold uppercase tracking-wider mt-1 ${zone.text}`}>
          {decibels > 0 ? zone.label : 'IDLE / READY'}
        </span>

        {peakDb > 0 && (
          <div className="text-[11px] text-slate-400 font-mono mt-2 flex items-center gap-2">
            <span>PEAK: <strong className="text-rose-400">{peakDb.toFixed(1)} dB</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
