import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, HelpCircle, Shield, BookOpen } from 'lucide-react';

export type GuideMood = 'idle' | 'listening' | 'recorded' | 'submitted' | 'warning' | 'offline';

interface FieldGuideAvatarProps {
  mood?: GuideMood;
  customMessage?: string;
  className?: string;
  onActionClick?: () => void;
  compact?: boolean;
}

/**
 * The NoiseMap Field Guide ("Aura"):
 * An original, interactive civic companion for environmental acoustic monitoring.
 * Rendered with vector resonance rings, dynamic pulse state, and helpful field tips.
 */
export const FieldGuideAvatar: React.FC<FieldGuideAvatarProps> = ({
  mood = 'idle',
  customMessage,
  className = '',
  onActionClick,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Field note messages according to operational status
  const moodConfig: Record<
    GuideMood,
    { title: string; defaultNote: string; badge: string; color: string }
  > = {
    idle: {
      title: 'Field Guide · Ready',
      defaultNote: 'Ready to sample. Hold your device steady at chest height, away from clothing friction.',
      badge: 'STANDBY',
      color: 'forest',
    },
    listening: {
      title: 'Acoustic Integration Active',
      defaultNote: 'Integrating continuous sound pressure levels (Leq). Remain silent during the 10-second window.',
      badge: 'INTEGRATING Leq',
      color: 'terracotta',
    },
    recorded: {
      title: 'Sample Captured',
      defaultNote: 'Check your decibel reading. Select the dominant noise source and CPCB area zone before submitting.',
      badge: 'READY TO TAG',
      color: 'olive',
    },
    submitted: {
      title: 'Civic Data Transmitted',
      defaultNote: 'Acoustic reading registered! When 3 unique devices corroborate within your ~100m sector, a verified incident triggers.',
      badge: 'GRID UPDATED',
      color: 'lime',
    },
    warning: {
      title: 'Acoustic Anomaly',
      defaultNote: 'Ambient level exceeds statutory day limits. You can generate a CPCB legal dossier from the Dossier tab.',
      badge: 'HIGH SPL',
      color: 'terracotta',
    },
    offline: {
      title: 'Offline Storage Active',
      defaultNote: 'Hardware audio computation is operating locally. Readings will sync to local database storage immediately.',
      badge: 'OFFLINE BUFFER',
      color: 'forest',
    },
  };

  const current = moodConfig[mood] || moodConfig.idle;
  const message = customMessage || current.defaultNote;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-8 h-8 rounded-full bg-forest text-lime-signal border border-forest-border shadow-xs hover:scale-105 transition-transform cursor-pointer"
          aria-label="Open NoiseMap Field Notes"
        >
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full border border-lime-signal/40 animate-ping opacity-60 pointer-events-none" />
          <Sparkles className="w-4 h-4 text-lime-signal" />
        </button>

        {isOpen && (
          <div className="absolute right-4 top-14 z-50 max-w-xs p-3.5 bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border rounded-2xl shadow-field-lg font-mono text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-paper-border dark:border-night-border">
              <span className="font-bold text-forest dark:text-lime-signal text-[11px] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {current.title}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-graphite dark:hover:text-night-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-graphite-secondary dark:text-night-secondary leading-relaxed font-sans">
              {message}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`w-full p-3.5 sm:p-4 rounded-2xl bg-paper-soft/95 dark:bg-night-surface/95 border border-paper-border dark:border-night-border shadow-field font-mono text-xs transition-colors ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Vector Companion Avatar Avatar Ring */}
        <div className="relative flex-shrink-0 mt-0.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-forest dark:bg-[#1E2B22] border border-forest-border dark:border-forest/40 flex items-center justify-center text-lime-signal shadow-sm relative overflow-hidden">
            {/* Dynamic wave ring */}
            <svg viewBox="0 0 40 40" className="w-full h-full p-1" fill="none">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#DCD9CE"
                strokeWidth="1"
                strokeDasharray="2 2"
                strokeOpacity="0.4"
              />
              <circle
                cx="20"
                cy="20"
                r="11"
                stroke="#D5E66B"
                strokeWidth="2"
                strokeDasharray="40 15"
                className={mood === 'listening' ? 'animate-spin' : ''}
              />
              <circle cx="20" cy="20" r="4" fill="#D5E66B" />
              {/* Eye-like sensor slit */}
              <line x1="17" y1="20" x2="23" y2="20" stroke="#26382D" strokeWidth="1.5" />
            </svg>
          </div>
          {/* Status Indicator Pip */}
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-lime-signal dark:bg-lime-400 border-2 border-paper-soft dark:border-night-surface" />
        </div>

        {/* Companion Guidance & Dialogue */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-graphite dark:text-night-text font-sans text-xs sm:text-sm">
                The Field Guide
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-forest-subtle dark:bg-forest/20 text-forest dark:text-lime-signal font-semibold border border-forest/20">
                {current.badge}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-400 hover:text-forest dark:hover:text-lime-signal transition-colors p-1"
              title="Field handbook info"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="mt-1 text-xs text-graphite-secondary dark:text-night-secondary font-sans leading-relaxed">
            {message}
          </p>

          {/* Interactive Field Handbook Modal or Tray */}
          {isOpen && (
            <div className="mt-3 p-3 rounded-xl bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border text-[11px] space-y-1.5 animate-in fade-in">
              <div className="font-semibold text-graphite dark:text-night-text flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-forest dark:text-lime-signal" />
                <span>Field Operator Instructions:</span>
              </div>
              <ul className="text-stone-600 dark:text-night-muted list-disc list-inside space-y-0.5 font-sans">
                <li>Measure for the full 10-second duration to capture a representative Leq (equivalent continuous sound level).</li>
                <li>Avoid talking or brushing the phone mic against clothing.</li>
                <li>Grid snapping protects personal privacy by rounding coordinates to 100 meters.</li>
              </ul>
            </div>
          )}

          {onActionClick && (
            <button
              type="button"
              onClick={onActionClick}
              className="mt-2 text-forest dark:text-lime-signal hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Learn more about CPCB statutory guidelines</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
