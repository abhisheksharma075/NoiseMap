import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Mic, MicOff, Lock, ChevronDown, ChevronUp } from 'lucide-react';

export type MicrophonePrivacyState =
  | 'inactive'
  | 'requesting_permission'
  | 'active'
  | 'processing'
  | 'permission_denied'
  | 'device_unavailable'
  | 'initialization_failed'
  | 'stopped';

export interface MicrophonePrivacyIndicatorProps {
  state: MicrophonePrivacyState;
  className?: string;
  showDetailsToggle?: boolean;
}

export const MicrophonePrivacyIndicator: React.FC<MicrophonePrivacyIndicatorProps> = ({
  state,
  className = '',
  showDetailsToggle = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const getStateConfig = () => {
    switch (state) {
      case 'active':
      case 'processing':
        return {
          icon: Mic,
          dotColor: 'bg-emerald-500 animate-pulse',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60',
          textColor: 'text-emerald-800 dark:text-emerald-300',
          label: 'MIC ACTIVE · LOCAL RAM ONLY',
          description: 'Microphone stream is being analyzed in browser memory. Zero audio is recorded or uploaded.',
        };
      case 'requesting_permission':
        return {
          icon: Mic,
          dotColor: 'bg-amber-500 animate-ping',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60',
          textColor: 'text-amber-800 dark:text-amber-300',
          label: 'REQUESTING MIC ACCESS',
          description: 'Awaiting user authorization through the browser permission dialog.',
        };
      case 'permission_denied':
        return {
          icon: Lock,
          dotColor: 'bg-rose-500',
          badgeBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/60',
          textColor: 'text-rose-800 dark:text-rose-300',
          label: 'MIC ACCESS BLOCKED',
          description: 'Microphone permission was denied by the browser.',
        };
      case 'device_unavailable':
      case 'initialization_failed':
        return {
          icon: ShieldAlert,
          dotColor: 'bg-terracotta',
          badgeBg: 'bg-terracotta-subtle dark:bg-terracotta/20 border-terracotta/30',
          textColor: 'text-terracotta dark:text-rose-300',
          label: 'MIC SENSOR UNAVAILABLE',
          description: 'Audio input hardware is inaccessible or blocked by another application.',
        };
      case 'stopped':
        return {
          icon: MicOff,
          dotColor: 'bg-stone-400',
          badgeBg: 'bg-paper-100 dark:bg-night-surface border-paper-border dark:border-night-border',
          textColor: 'text-stone-600 dark:text-night-muted',
          label: 'MIC DISCONNECTED · TRACKS RELEASED',
          description: 'Hardware audio tracks have been completely terminated.',
        };
      case 'inactive':
      default:
        return {
          icon: MicOff,
          dotColor: 'bg-stone-400 dark:bg-slate-600',
          badgeBg: 'bg-paper-50 dark:bg-night-card border-paper-border dark:border-night-border',
          textColor: 'text-stone-600 dark:text-night-muted',
          label: 'MIC INACTIVE · STANDBY',
          description: 'Microphone is completely powered down. No acoustic data is processed in standby.',
        };
    }
  };

  const config = getStateConfig();
  const StateIcon = config.icon;

  return (
    <div
      className={`rounded-xl border ${config.badgeBg} p-3 font-mono text-xs transition-colors select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dotColor} flex-shrink-0`} />
          <StateIcon className={`w-3.5 h-3.5 ${config.textColor} flex-shrink-0`} aria-hidden="true" />
          <span className={`font-bold tracking-tight text-[11px] sm:text-xs ${config.textColor}`}>
            {config.label}
          </span>
        </div>

        {showDetailsToggle && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-night-muted hover:text-graphite dark:hover:text-night-text cursor-pointer transition-colors"
            aria-expanded={isExpanded}
            aria-label="Toggle Privacy Guarantee Details"
          >
            <span>PRIVACY PROMISE</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Expanded Privacy Transparency Checklist */}
      {isExpanded && (
        <div className="mt-3 pt-2.5 border-t border-paper-border/60 dark:border-night-border/70 text-[11px] font-sans space-y-2 animate-in fade-in">
          <p className="text-graphite-secondary dark:text-night-secondary leading-tight">
            {config.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px] pt-1">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3 flex-shrink-0" />
              <span>Zero Raw Audio Upload</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3 flex-shrink-0" />
              <span>Transient RAM Only</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3 flex-shrink-0" />
              <span>100% Local DSP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
