import React from 'react';
import { InteractiveAcousticAvatar, AcousticAvatarState } from './InteractiveAcousticAvatar';
import { classifyNoiseLevel } from '../../utils/noiseClassification';

interface CircularNoiseGaugeProps {
  decibels: number;
  instantDb?: number;
  peakDb?: number;
  isSampling?: boolean;
  countdown?: number;
  avatarState?: AcousticAvatarState;
  onTapMeasurement?: () => void;
  className?: string;
}

export const CircularNoiseGauge: React.FC<CircularNoiseGaugeProps> = ({
  decibels,
  instantDb = 0,
  peakDb = 0,
  isSampling = false,
  countdown = 10,
  avatarState,
  onTapMeasurement,
  className = '',
}) => {
  // Gauge range from 30 dB to 120 dB (span = 90)
  const minDb = 30;
  const maxDb = 120;
  const displayDb = isSampling ? instantDb : decibels;
  const clampedDb = Math.min(Math.max(displayDb > 0 ? displayDb : minDb, minDb), maxDb);
  const normalized = (clampedDb - minDb) / (maxDb - minDb);

  // 240-degree arc (starts at 150 deg, ends at 390 deg)
  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - arcLength * normalized;

  // Derive classification using shared utility
  const classification = classifyNoiseLevel(decibels > 0 ? decibels : null);

  // Determine avatar state if not directly passed
  const effectiveAvatarState: AcousticAvatarState = React.useMemo(() => {
    if (avatarState) return avatarState;
    if (isSampling) return 'listening';
    if (!classification) return 'idle';
    return classification.band; // 'low' | 'moderate' | 'high'
  }, [avatarState, isSampling, classification]);

  const activeStroke = isSampling
    ? '#D5E66B'
    : classification
    ? classification.colorHex
    : '#798263';

  return (
    <div className={`relative flex flex-col items-center justify-center font-mono ${className}`}>
      {/* Interactive Circular Measurement Control */}
      <div
        role={onTapMeasurement ? 'button' : undefined}
        tabIndex={onTapMeasurement ? 0 : undefined}
        onClick={onTapMeasurement}
        onKeyDown={(e) => {
          if (onTapMeasurement && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onTapMeasurement();
          }
        }}
        aria-label={
          isSampling
            ? `Sampling sound: ${countdown} seconds remaining`
            : decibels > 0
            ? `Measured decibels: ${decibels.toFixed(1)} dB. Tap to measure again.`
            : 'Tap to start 10-second acoustic measurement'
        }
        className={`relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center select-none rounded-full transition-transform duration-150 ${
          onTapMeasurement ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-lime-signal' : ''
        }`}
      >
        {/* Outer Circular Gauge SVG */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none"
          viewBox="0 0 260 260"
        >
          {/* Background Track Arc */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            className="text-paper-border dark:text-night-border transform rotate-[150deg] origin-center"
          />

          {/* Dynamic Active Decibel Arc */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            stroke={activeStroke}
            strokeWidth="10"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transform rotate-[150deg] origin-center transition-all duration-150 ease-out"
            style={{ filter: isSampling ? 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.6))' : 'none' }}
          />

          {/* Precision calibration tick ring */}
          <circle
            cx="130"
            cy="130"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.3"
            className="text-stone dark:text-night-secondary pointer-events-none"
          />
        </svg>

        {/* Static Scale Marks around Gauge */}
        <div className="absolute inset-0 pointer-events-none select-none text-[9px] font-mono font-bold text-stone-400 dark:text-slate-500">
          <span className="absolute bottom-5 left-10">30dB</span>
          <span className="absolute top-16 left-6 text-emerald-600 dark:text-emerald-400">50dB</span>
          <span className="absolute top-3 inset-x-0 text-center text-amber-600 dark:text-amber-400">70dB</span>
          <span className="absolute top-16 right-6 text-orange-600 dark:text-orange-400">85dB</span>
          <span className="absolute bottom-5 right-8 text-rose-600 dark:text-rose-400">120dB</span>
        </div>

        {/* Center Companion Acoustic Avatar */}
        <div className="flex flex-col items-center justify-center z-10">
          <InteractiveAcousticAvatar
            state={effectiveAvatarState}
            decibels={decibels}
            instantDb={instantDb}
            countdown={countdown}
            size="md"
          />

          {/* Integrated Readout Below Avatar */}
          <div className="mt-2 text-center pointer-events-none">
            {isSampling ? (
              <div className="flex flex-col items-center">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-teal-signal dark:text-teal-signal font-mono animate-pulse drop-shadow-[0_0_12px_rgba(45,212,191,0.5)]">
                    {instantDb > 0 ? instantDb.toFixed(1) : '--.-'}
                  </span>
                  <span className="text-xs font-bold text-teal-signal ml-1">dB(A)</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-night-card border border-teal-signal/40 text-teal-signal text-[10px] font-bold mt-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-signal animate-ping" />
                  <span>INTEGRATING Leq · {countdown}s</span>
                </div>
              </div>
            ) : decibels > 0 ? (
              <div className="flex flex-col items-center leading-none">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-graphite dark:text-night-text font-sans">
                    {decibels.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-graphite-secondary dark:text-night-secondary ml-1">dB(A)</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-full border border-current/30 ${classification?.textColorClass || 'text-forest dark:text-teal-signal'}`}>
                  {classification?.shortLabel || 'MEASURED'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-graphite dark:text-night-text tracking-wider uppercase">
                  READY TO LISTEN
                </span>
                <span className="text-[10px] text-graphite-secondary dark:text-night-secondary font-mono mt-0.5">
                  Tap to sample 10s
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auxiliary Peak & Average Telemetry Strip */}
      <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3 text-[11px] font-mono text-graphite-secondary dark:text-night-secondary flex-wrap">
        {decibels > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper-soft dark:bg-night-card border border-paper-border dark:border-night-border shadow-xs">
            <span className="text-stone-400">Leq:</span>
            <strong className="text-graphite dark:text-night-text">{decibels.toFixed(1)} dB</strong>
          </div>
        )}

        {peakDb > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper-soft dark:bg-night-card border border-paper-border dark:border-night-border shadow-xs">
            <span className="text-stone-400">PEAK:</span>
            <strong className="text-terracotta dark:text-[#E2886A]">{peakDb.toFixed(1)} dB</strong>
          </div>
        )}

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-paper-soft dark:bg-night-card border border-paper-border dark:border-night-border text-[10px]">
          <span className="text-stone-400">CLASSIFICATION:</span>
          <strong className="text-teal-DEFAULT dark:text-teal-signal font-semibold">
            {decibels > 0 ? (decibels < 50 ? 'LOW (<50)' : decibels < 70 ? 'MODERATE (50-70)' : 'HIGH (≥70)') : 'STANDBY'}
          </strong>
        </div>
      </div>
    </div>
  );
};
