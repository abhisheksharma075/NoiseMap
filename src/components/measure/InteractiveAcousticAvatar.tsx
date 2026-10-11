import React from 'react';
import { classifyNoiseLevel } from '../../utils/noiseClassification';

export type AcousticAvatarState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'low'
  | 'moderate'
  | 'high'
  | 'error'
  | 'submitted';

interface InteractiveAcousticAvatarProps {
  state: AcousticAvatarState;
  decibels?: number;
  instantDb?: number;
  countdown?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Interactive Acoustic Avatar ("The NoiseMap Guardian"):
 * High-classic environmental acoustic character sitting inside the circular sensor interface.
 * Features:
 * - Real-time reading HUD directly over the companion when sampling
 * - Unique, high-classic color palette (Deep Forest #141E17, Sage #798E69, Signal Lime #D5E66B, Amber Terracotta #C46E50)
 * - Articulated vector acoustic headsets / ear transducers
 * - Live animated soundwave oscillations scaling with live decibels
 * - Expressive eyebrows, responsive pupils, and mouth states
 */
export const InteractiveAcousticAvatar: React.FC<InteractiveAcousticAvatarProps> = ({
  state,
  decibels = 0,
  instantDb = 0,
  countdown = 10,
  className = '',
  size = 'md',
}) => {
  const classification = classifyNoiseLevel(decibels);

  const config = React.useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          faceBg: '#121D15',
          borderColor: '#D5E66B',
          pupilColor: '#D5E66B',
          headsetColor: '#CDE350',
          glowColor: 'rgba(213, 230, 107, 0.45)',
          badgeColor: 'bg-lime-signal text-graphite font-bold',
          label: `Sampling (${countdown}s)`,
          expression: 'listening',
        };
      case 'low':
        return {
          faceBg: '#18261C',
          borderColor: '#354C3C',
          pupilColor: '#D5E66B',
          headsetColor: '#798E69',
          glowColor: 'rgba(53, 76, 60, 0.5)',
          badgeColor: 'bg-forest-subtle text-forest dark:text-lime-signal',
          label: classification?.label || 'Low Noise Reading',
          expression: 'calm',
        };
      case 'moderate':
        return {
          faceBg: '#21271B',
          borderColor: '#798E69',
          pupilColor: '#E2F075',
          headsetColor: '#8DA737',
          glowColor: 'rgba(121, 142, 105, 0.45)',
          badgeColor: 'bg-olive-subtle text-olive dark:text-lime-signal',
          label: classification?.label || 'Moderate Noise Reading',
          expression: 'moderate',
        };
      case 'high':
        return {
          faceBg: '#2E1D19',
          borderColor: '#C46E50',
          pupilColor: '#F59E0B',
          headsetColor: '#E2886A',
          glowColor: 'rgba(196, 110, 80, 0.55)',
          badgeColor: 'bg-terracotta-subtle text-terracotta dark:text-[#E2886A]',
          label: classification?.label || 'High Noise Reading',
          expression: 'high',
        };
      case 'submitted':
        return {
          faceBg: '#121D15',
          borderColor: '#D5E66B',
          pupilColor: '#D5E66B',
          headsetColor: '#CDE350',
          glowColor: 'rgba(213, 230, 107, 0.5)',
          badgeColor: 'bg-lime-signal text-graphite font-bold',
          label: 'Sample Submitted',
          expression: 'submitted',
        };
      case 'error':
        return {
          faceBg: '#27201F',
          borderColor: '#C46E50',
          pupilColor: '#C46E50',
          headsetColor: '#A35338',
          glowColor: 'rgba(196, 110, 80, 0.35)',
          badgeColor: 'bg-terracotta-subtle text-terracotta',
          label: 'Measurement Unavailable',
          expression: 'error',
        };
      case 'processing':
        return {
          faceBg: '#18261C',
          borderColor: '#798E69',
          pupilColor: '#D5E66B',
          headsetColor: '#798E69',
          glowColor: 'rgba(121, 142, 105, 0.4)',
          badgeColor: 'bg-forest-subtle text-forest dark:text-lime-signal',
          label: 'Integrating Leq...',
          expression: 'listening',
        };
      case 'idle':
      default:
        return {
          faceBg: '#1A271E',
          borderColor: '#798E69',
          pupilColor: '#D5E66B',
          headsetColor: '#798E69',
          glowColor: 'rgba(213, 230, 107, 0.25)',
          badgeColor: 'bg-paper dark:bg-night-bg text-graphite-secondary',
          label: 'Ready to Listen',
          expression: 'idle',
        };
    }
  }, [state, countdown, classification]);

  const sizeDimensions = {
    sm: 'w-28 h-28',
    md: 'w-36 h-36 sm:w-40 sm:h-40',
    lg: 'w-48 h-48',
  }[size];

  // Live dynamic scaling for the ripple ring when recording
  const liveRippleScale = state === 'listening' ? Math.min(1.22, Math.max(0.96, instantDb / 55)) : 1;
  const currentDbDisplay = state === 'listening' ? instantDb : decibels;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Outer Glow Aura */}
      <div
        className="absolute rounded-full transition-all duration-300 pointer-events-none blur-2xl opacity-70"
        style={{
          width: '90%',
          height: '90%',
          backgroundColor: config.glowColor,
        }}
      />

      {/* Vector Avatar Housing */}
      <div
        className={`relative ${sizeDimensions} rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-field-lg overflow-hidden`}
        style={{
          backgroundColor: config.faceBg,
          borderColor: config.borderColor,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Instrument Reticle */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="#DCD7C9"
            strokeWidth="0.8"
            strokeDasharray="2 3"
            strokeOpacity="0.35"
          />

          {/* Dynamic Live Audio Ripple Ring when Recording */}
          {state === 'listening' && (
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#D5E66B"
              strokeWidth="2"
              strokeDasharray="14 6"
              strokeOpacity="0.85"
              style={{
                transformOrigin: 'center',
                transform: `scale(${liveRippleScale})`,
                transition: 'transform 0.08s ease-out',
              }}
            />
          )}

          {/* High-Classic Audio Headset Transducers (Over Ears) */}
          {/* Left Headset Can */}
          <rect
            x="7"
            y="37"
            width="8"
            height="26"
            rx="4"
            fill={config.headsetColor}
            stroke="#141E17"
            strokeWidth="1.5"
          />
          <path d="M 11 37 Q 11 26 26 21" stroke={config.headsetColor} strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Right Headset Can */}
          <rect
            x="85"
            y="37"
            width="8"
            height="26"
            rx="4"
            fill={config.headsetColor}
            stroke="#141E17"
            strokeWidth="1.5"
          />
          <path d="M 89 37 Q 89 26 74 21" stroke={config.headsetColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* Headband Connection Bridge */}
          <path d="M 26 21 Q 50 14 74 21" stroke={config.headsetColor} strokeWidth="3" strokeLinecap="round" />

          {/* EYEBROWS */}
          {config.expression === 'calm' && (
            <>
              <path d="M 31 38 Q 38 35 45 38" stroke="#DCD7C9" strokeWidth="2" strokeLinecap="round" />
              <path d="M 55 38 Q 62 35 69 38" stroke="#DCD7C9" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
          {config.expression === 'moderate' && (
            <>
              <path d="M 31 37 Q 38 34 45 37" stroke="#DCD7C9" strokeWidth="2" strokeLinecap="round" />
              <path d="M 55 37 Q 62 34 69 37" stroke="#DCD7C9" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
          {config.expression === 'high' && (
            <>
              {/* Concerned angled brows */}
              <path d="M 31 35 L 45 40" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 55 40 L 69 35" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}
          {config.expression === 'error' && (
            <>
              <path d="M 32 37 L 44 38" stroke="#C46E50" strokeWidth="2" strokeLinecap="round" />
              <path d="M 56 38 L 68 37" stroke="#C46E50" strokeWidth="2" strokeLinecap="round" />
            </>
          )}

          {/* EYES */}
          {config.expression === 'calm' || config.expression === 'submitted' ? (
            <>
              {/* Smiling curved eyes with high-classic lime glow */}
              <path d="M 32 47 Q 38 41 44 47" stroke={config.pupilColor} strokeWidth="3.2" strokeLinecap="round" />
              <path d="M 56 47 Q 62 41 68 47" stroke={config.pupilColor} strokeWidth="3.2" strokeLinecap="round" />
            </>
          ) : config.expression === 'high' ? (
            <>
              {/* Alert wide amber eyes */}
              <circle cx="38" cy="47" r="8" fill="#141E17" stroke="#C46E50" strokeWidth="2" />
              <circle cx="38" cy="47" r="4.5" fill="#F59E0B" />
              <circle cx="36" cy="45" r="1.8" fill="#FFFFFF" />

              <circle cx="62" cy="47" r="8" fill="#141E17" stroke="#C46E50" strokeWidth="2" />
              <circle cx="62" cy="47" r="4.5" fill="#F59E0B" />
              <circle cx="60" cy="45" r="1.8" fill="#FFFFFF" />
            </>
          ) : config.expression === 'listening' ? (
            <>
              {/* Highly focused attentive listening pupils */}
              <circle cx="38" cy="47" r="6.8" fill="#141E17" stroke="#D5E66B" strokeWidth="2" />
              <circle cx="38" cy="47" r="3.6" fill="#D5E66B" />
              <circle cx="36" cy="45" r="1.5" fill="#FFFFFF" />

              <circle cx="62" cy="47" r="6.8" fill="#141E17" stroke="#D5E66B" strokeWidth="2" />
              <circle cx="62" cy="47" r="3.6" fill="#D5E66B" />
              <circle cx="60" cy="45" r="1.5" fill="#FFFFFF" />
            </>
          ) : (
            <>
              {/* Resting attentive eyes */}
              <circle cx="38" cy="47" r="6" fill="#141E17" stroke="#798E69" strokeWidth="1.8" />
              <circle cx="38" cy="47" r="3.2" fill="#D5E66B" />
              <circle cx="36.5" cy="45.5" r="1.2" fill="#FFFFFF" />

              <circle cx="62" cy="47" r="6" fill="#141E17" stroke="#798E69" strokeWidth="1.8" />
              <circle cx="62" cy="47" r="3.2" fill="#D5E66B" />
              <circle cx="60.5" cy="45.5" r="1.2" fill="#FFFFFF" />
            </>
          )}

          {/* MOUTH & LIVE SOUNDWAVE */}
          {config.expression === 'listening' ? (
            /* Oscillating acoustic wave mouth while listening */
            <g>
              <ellipse cx="50" cy="64" rx="4.5" ry="5.5" fill="none" stroke="#D5E66B" strokeWidth="2" />
              {/* Subtle acoustic emission arcs under mouth */}
              <path d="M 44 73 Q 50 76 56 73" stroke="#D5E66B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
            </g>
          ) : config.expression === 'calm' || config.expression === 'submitted' ? (
            <path d="M 39 63 Q 50 72 61 63" stroke="#D5E66B" strokeWidth="3" strokeLinecap="round" />
          ) : config.expression === 'high' ? (
            <path d="M 41 68 Q 50 61 59 68" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          ) : config.expression === 'moderate' ? (
            <path d="M 43 65 Q 50 67 57 65" stroke="#DCD7C9" strokeWidth="2.5" strokeLinecap="round" />
          ) : config.expression === 'error' ? (
            <line x1="42" y1="65" x2="58" y2="65" stroke="#C46E50" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            <path d="M 42 63 Q 50 67 58 63" stroke="#DCD7C9" strokeWidth="2.2" strokeLinecap="round" />
          )}

          {/* Forehead Micro-Transducer Pin */}
          <circle cx="50" cy="27" r="2.5" fill="#D5E66B" />
        </svg>

        {/* Real-Time Live Decibel Overlay when Sampling */}
        {state === 'listening' && currentDbDisplay > 0 && (
          <div className="absolute inset-x-0 bottom-2.5 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-mono font-black text-lime-signal drop-shadow-md">
              {currentDbDisplay.toFixed(1)} dB
            </span>
          </div>
        )}
      </div>

      <span className="sr-only">{`Acoustic Companion: ${config.label}`}</span>
    </div>
  );
};
