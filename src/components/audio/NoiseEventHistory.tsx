import React from 'react';
import { NoiseSpikeEvent } from '../../services/noiseSpikeDetectionService';
import { Zap, AlertTriangle, Trash2, Clock, Volume2, Shield } from 'lucide-react';

export interface NoiseEventHistoryProps {
  events: NoiseSpikeEvent[];
  onClearHistory?: () => void;
  maxEvents?: number;
  className?: string;
}

export const NoiseEventHistory: React.FC<NoiseEventHistoryProps> = ({
  events,
  onClearHistory,
  maxEvents = 20,
  className = '',
}) => {
  const displayedEvents = events.slice(0, maxEvents);

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getBadge = (event: NoiseSpikeEvent) => {
    switch (event.classification) {
      case 'spike_and_incident':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/60',
          text: 'text-rose-700 dark:text-rose-300',
          label: 'SPIKE & STATUTORY BREACH',
          icon: AlertTriangle,
        };
      case 'high_level_only':
        return {
          bg: 'bg-terracotta-subtle dark:bg-terracotta/20 border-terracotta/30',
          text: 'text-terracotta dark:text-[#E2886A]',
          label: 'HIGH AMBIENT LEVEL',
          icon: Volume2,
        };
      case 'spike_only':
      default:
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60',
          text: 'text-amber-800 dark:text-amber-300',
          label: 'TRANSIENT SPIKE',
          icon: Zap,
        };
    }
  };

  return (
    <div
      className={`rounded-xl border border-paper-border dark:border-night-border bg-paper dark:bg-night-card p-3 sm:p-4 space-y-3 font-mono shadow-sm ${className}`}
      role="region"
      aria-label="Transient Noise Event History"
    >
      {/* Header with Title and Clear Action */}
      <div className="flex items-center justify-between pb-2 border-b border-paper-border/60 dark:border-night-border/70">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" aria-hidden="true" />
          <h3 className="text-xs sm:text-sm font-bold text-graphite dark:text-night-text uppercase tracking-wide">
            Transient Event Log
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border text-stone-500 dark:text-night-muted font-semibold">
            {events.length} {events.length === 1 ? 'EVENT' : 'EVENTS'}
          </span>
        </div>

        {events.length > 0 && onClearHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1 text-[10px] text-stone-500 hover:text-terracotta dark:text-night-muted dark:hover:text-rose-400 cursor-pointer transition-colors p-1 rounded"
            title="Clear local event history (does not stop recording)"
          >
            <Trash2 className="w-3 h-3" />
            <span>CLEAR LOG</span>
          </button>
        )}
      </div>

      {/* Event List or Empty State */}
      {displayedEvents.length === 0 ? (
        <div className="py-6 text-center space-y-1.5">
          <div className="w-8 h-8 mx-auto rounded-full bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border flex items-center justify-center text-stone-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <p className="text-xs text-graphite dark:text-night-text font-semibold">
            No Acoustic Spikes Detected
          </p>
          <p className="text-[11px] text-graphite-secondary dark:text-night-secondary font-sans max-w-sm mx-auto">
            Transient surges (+15 dB within 300ms) will be logged here in real time as you monitor.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {displayedEvents.map((event) => {
            const badge = getBadge(event);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={event.id}
                className="p-2.5 rounded-lg bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border text-xs space-y-1.5 animate-in fade-in"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${badge.bg} ${badge.text}`}
                    >
                      <BadgeIcon className="w-2.5 h-2.5" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-night-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(event.timestamp)}
                    </span>
                  </div>

                  {/* Decibel Transition Pill */}
                  <div className="text-[11px] font-bold text-graphite dark:text-night-text">
                    <span className="text-stone-400 dark:text-night-secondary font-normal">
                      {event.previousDb.toFixed(1)} dB →
                    </span>{' '}
                    <span className="text-amber-600 dark:text-amber-400">
                      {event.currentDb.toFixed(1)} dB
                    </span>{' '}
                    <span className="text-rose-600 dark:text-rose-400 text-[10px]">
                      (+{event.deltaDb.toFixed(1)} dB)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-graphite-secondary dark:text-night-secondary font-sans leading-tight">
                  {event.message}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Scope Disclaimer */}
      <div className="pt-1.5 border-t border-paper-border/60 dark:border-night-border/70 text-[10px] text-stone-500 dark:text-night-muted font-sans flex items-center gap-1.5">
        <Shield className="w-3 h-3 text-forest dark:text-teal-signal flex-shrink-0" />
        <span>Local client screening log · Verified incidents require 3+ multi-device consensus.</span>
      </div>
    </div>
  );
};
