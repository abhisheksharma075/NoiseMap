import React, { useEffect, useRef, useState } from 'react';
import { AUDIO_CONFIG } from '../../config/audioThresholds';
import { Mic, Square, Activity, HelpCircle } from 'lucide-react';

export interface LiveNoiseMeterProps {
  instantDb: number;
  avgDb: number;
  peakDb: number;
  isSampling: boolean;
  countdown?: number;
  onStartSampling?: () => void;
  onStopSampling?: () => void;
  className?: string;
  showControls?: boolean;
}

export const LiveNoiseMeter: React.FC<LiveNoiseMeterProps> = ({
  instantDb,
  avgDb,
  peakDb,
  isSampling,
  countdown = 10,
  onStartSampling,
  onStopSampling,
  className = '',
  showControls = true,
}) => {
  // Retain a rolling buffer of the last 24 readings for a micro sparkline trend
  const [historyBuffer, setHistoryBuffer] = useState<number[]>([]);
  const lastSampleTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isSampling) {
      return;
    }

    if (instantDb > 0 && Number.isFinite(instantDb)) {
      const now = Date.now();
      // Throttle sparkline samples to ~100ms
      if (now - lastSampleTimeRef.current >= 100) {
        lastSampleTimeRef.current = now;
        setHistoryBuffer((prev) => [...prev.slice(-23), instantDb]);
      }
    }
  }, [instantDb, isSampling]);

  // Reset trend when sampling restarts
  useEffect(() => {
    if (isSampling && historyBuffer.length > 0 && countdown === 10) {
      setHistoryBuffer([]);
    }
  }, [isSampling, countdown, historyBuffer.length]);

  // Determine classification using centralized configuration
  const getClassification = (db: number) => {
    if (!isSampling && db <= 0) {
      return {
        label: 'SENSOR STANDBY',
        color: 'text-stone-500 dark:text-night-muted',
        border: 'border-paper-border dark:border-night-border',
        bg: 'bg-paper-soft dark:bg-night-surface',
      };
    }
    if (db < 50) {
      return {
        label: 'SAFE ZONE (<50 dB)',
        color: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-300 dark:border-emerald-800/60',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      };
    }
    if (db <= AUDIO_CONFIG.DECIBEL_INCIDENT_THRESHOLD) {
      return {
        label: `MODERATE AMBIENT (50–${AUDIO_CONFIG.DECIBEL_INCIDENT_THRESHOLD} dB)`,
        color: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-800/60',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
      };
    }
    return {
      label: `ELEVATED INCIDENT (> ${AUDIO_CONFIG.DECIBEL_INCIDENT_THRESHOLD} dB)`,
      color: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800/60',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
    };
  };

  const displayDb = isSampling ? instantDb : avgDb > 0 ? avgDb : 0;
  const classification = getClassification(displayDb);

  return (
    <div
      className={`rounded-2xl border border-paper-border dark:border-night-border bg-paper dark:bg-night-card p-4 sm:p-5 space-y-4 font-mono shadow-sm transition-colors ${className}`}
      role="region"
      aria-label="Live Ambient Decibel Meter"
    >
      {/* Header telemetry info */}
      <div className="flex items-center justify-between pb-3 border-b border-paper-border/60 dark:border-night-border/70">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-forest dark:text-teal-signal" aria-hidden="true" />
          <h3 className="text-xs sm:text-sm font-bold text-graphite dark:text-night-text uppercase tracking-wide">
            Live Ambient Sound Level
          </h3>
        </div>

        <span
          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${classification.border} ${classification.bg} ${classification.color}`}
        >
          {classification.label}
        </span>
      </div>

      {/* Main Decibel Display & Dual Metric Readouts */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        {/* Big Decibel Readout */}
        <div className="flex items-baseline gap-2">
          <span className="text-5xl sm:text-6xl font-extrabold text-graphite dark:text-night-text tracking-tight">
            {isSampling
              ? instantDb.toFixed(1)
              : avgDb > 0
              ? avgDb.toFixed(1)
              : '--.-'}
          </span>
          <div className="space-y-0.5">
            <span className="text-sm sm:text-base font-bold text-forest dark:text-teal-signal block">
              dB(A)
            </span>
            <span className="text-[10px] text-stone-400 dark:text-night-muted block">
              {isSampling ? 'INSTANT' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Leq and Peak Telemetry Strip */}
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto text-xs">
          <div className="p-2.5 rounded-xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border text-center">
            <span className="text-[10px] text-stone-500 dark:text-night-muted block uppercase">
              LEQ ENERGY AVG
            </span>
            <strong className="text-sm font-bold text-graphite dark:text-night-text">
              {avgDb > 0 ? `${avgDb.toFixed(1)} dB` : '--.- dB'}
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border text-center">
            <span className="text-[10px] text-stone-500 dark:text-night-muted block uppercase">
              PEAK HOLD
            </span>
            <strong className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {peakDb > 0 ? `${peakDb.toFixed(1)} dB` : '--.- dB'}
            </strong>
          </div>
        </div>
      </div>

      {/* Rolling Trend Sparkline */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-stone-500 dark:text-night-muted">
          <span>RECENT MEASUREMENT TREND</span>
          <span>{isSampling ? `${countdown}s REMAINING` : 'AWAITING CAPTURE'}</span>
        </div>

        <div className="h-10 w-full rounded-lg bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border p-1 flex items-end gap-1 overflow-hidden">
          {historyBuffer.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 dark:text-night-muted">
              Trend line establishes during active sampling
            </div>
          ) : (
            historyBuffer.map((val, idx) => {
              // Normalize 30dB to 100dB across the 32px height
              const heightPct = Math.min(Math.max(((val - 30) / 70) * 100, 10), 100);
              const isPeak = val >= AUDIO_CONFIG.DECIBEL_INCIDENT_THRESHOLD;
              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-sm transition-all duration-75 ${
                    isPeak
                      ? 'bg-rose-500'
                      : val > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ height: `${heightPct}%` }}
                  title={`${val.toFixed(1)} dB`}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Calibration Limitations Notice */}
      <div className="p-2.5 rounded-xl bg-paper-soft dark:bg-night-surface/60 border border-paper-border dark:border-night-border text-[10px] font-mono text-stone-600 dark:text-night-muted flex items-start gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
        <p className="leading-tight">
          <strong>Indicative Screening Metric:</strong> Default calibration offset is {AUDIO_CONFIG.CALIBRATION_OFFSET_DEFAULT} dB SPL. Smartphone microphones provide Class 2 screening estimates; not legally certified.
        </p>
      </div>

      {/* Start / Stop Controls */}
      {showControls && (
        <div className="pt-1 flex gap-2">
          {!isSampling ? (
            <button
              type="button"
              onClick={onStartSampling}
              className="flex-1 py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-deep dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Mic className="w-4 h-4 text-lime-signal" />
              <span>START LIVE MONITORING</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopSampling}
              className="flex-1 py-2.5 px-4 rounded-xl bg-terracotta hover:bg-terracotta/90 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Square className="w-4 h-4 text-white" />
              <span>STOP MONITORING ({countdown}s)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
