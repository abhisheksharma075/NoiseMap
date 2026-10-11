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
 * Interactive Acoustic Avatar ("The NoiseMap Guardian / Field Guide"):
 * Sits directly inside the circular measurement interface.
 * Features expressive vector facial features, attentive acoustic ears/antennas,
 * dynamic wave ripples responding to live decibels, and distinct expressions:
 * - idle: Neutral, welcoming, ready to listen
 * - listening: Focused, attentive, wave ripple around core
 * - low (<50 dB): Relaxed, friendly, gentle smile (Forest Green)
 * - moderate (50-70 dB): Alert, observant, attentive eyes (Muted Olive)
 * - high (≥70 dB): Concerned, wide alert eyes, warning arc (Terracotta)
 * - error: Neutral/concerned, straight mouth, unavailable
 * - submitted: Content, happy eyes, success nod
 */
export const InteractiveAcousticAvatar: React.FC<InteractiveAcousticAvatarProps> = ({
  state,
  decibels = 0,
  instantDb = 0,
  countdown = 10,
  className = '',
  size = 'md',
}) => {
  // Derive classification for completed samples
  const classification = classifyNoiseLevel(decibels);

  // Compute theme colors and expressions based on state
  const config = React.useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          faceBg: '#1E2B22',
          borderColor: '#D5E66B',
          pupilColor: '#D5E66B',
          glowColor: 'rgba(213, 230, 107, 0.35)',
          label: `Listening (${countdown}s)`,
          expression: 'listening',
        };
      case 'low':
        return {
          faceBg: '#26382D',
          borderColor: '#354C3C',
          pupilColor: '#D5E66B',
          glowColor: 'rgba(53, 76, 60, 0.4)',
          label: classification?.label || 'Low Noise Reading',
          expression: 'calm',
        };
      case 'moderate':
        return {
          faceBg: '#2A3024',
          borderColor: '#798263',
          pupilColor: '#D5E66B',
          glowColor: 'rgba(121, 130, 99, 0.4)',
          label: classification?.label || 'Moderate Noise Reading',
          expression: 'moderate',
        };
      case 'high':
        return {
          faceBg: '#352520',
          borderColor: '#C46E50',
          pupilColor: '#E2886A',
          glowColor: 'rgba(196, 110, 80, 0.4)',
          label: classification?.label || 'High Noise Reading',
          expression: 'high',
        };
      case 'submitted':
        return {
          faceBg: '#1E2B22',
          borderColor: '#D5E66B',
          pupilColor: '#D5E66B',
          glowColor: 'rgba(213, 230, 107, 0.45)',
          label: 'Sample Submitted',
          expression: 'submitted',
        };
      case 'error':
        return {
          faceBg: '#2D2826',
          borderColor: '#C46E50',
          pupilColor: '#C46E50',
          glowColor: 'rgba(196, 110, 80, 0.3)',
          label: 'Measurement Unavailable',
          expression: 'error',
        };
      case 'processing':
        return {
          faceBg: '#26382D',
          borderColor: '#798263',
          pupilColor: '#D5E66B',
          glowColor: 'rgba(121, 130, 99, 0.35)',
          label: 'Computing Leq...',
          expression: 'listening',
        };
      case 'idle':
      default:
        return {
          faceBg: '#26382D',
          borderColor: '#798263',
          pupilColor: '#D5E66B',
          glowColor: 'rgba(213, 230, 107, 0.2)',
          label: 'Ready to Listen',
          expression: 'idle',
        };
    }
  }, [state, countdown, classification]);

  const sizeDimensions = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32 sm:w-36 sm:h-36',
    lg: 'w-44 h-44',
  }[size];

  // Live dynamic scaling for the ripple ring when recording
  const liveRippleScale = state === 'listening' ? Math.min(1.25, Math.max(0.95, instantDb / 60)) : 1;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Outer Glow Halo */}
      <div
        className="absolute rounded-full transition-all duration-300 pointer-events-none blur-xl opacity-60"
        style={{
          width: '85%',
          height: '85%',
          backgroundColor: config.glowColor,
        }}
      />

      {/* Vector Avatar Face Body */}
      <div
        className={`relative ${sizeDimensions} rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-md overflow-hidden`}
        style={{
          backgroundColor: config.faceBg,
          borderColor: config.borderColor,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Acoustic Range Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="#DCD9CE"
            strokeWidth="0.8"
            strokeDasharray="2 3"
            strokeOpacity="0.4"
          />

          {/* Dynamic Wave Ring on Listening */}
          {state === 'listening' && (
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#D5E66B"
              strokeWidth="1.5"
              strokeDasharray="12 6"
              strokeOpacity="0.8"
              style={{
                transformOrigin: 'center',
                transform: `scale(${liveRippleScale})`,
                transition: 'transform 0.1s ease-out',
              }}
            />
          )}

          {/* Ears / Acoustic Antenna Nodes */}
          {/* Left Ear */}
          <path
            d="M 16 42 Q 10 50 16 58"
            stroke={config.borderColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {state === 'listening' && (
            <path
              d="M 11 39 Q 5 50 11 61"
              stroke="#D5E66B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.75"
            />
          )}

          {/* Right Ear */}
          <path
            d="M 84 42 Q 90 50 84 58"
            stroke={config.borderColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {state === 'listening' && (
            <path
              d="M 89 39 Q 95 50 89 61"
              stroke="#D5E66B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.75"
            />
          )}

          {/* EYEBROWS */}
          {config.expression === 'calm' && (
            <>
              <path d="M 32 36 Q 37 34 42 36" stroke="#DCD9CE" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 58 36 Q 63 34 68 36" stroke="#DCD9CE" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {config.expression === 'moderate' && (
            <>
              <path d="M 32 35 Q 37 32 42 35" stroke="#DCD9CE" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 58 35 Q 63 32 68 35" stroke="#DCD9CE" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {config.expression === 'high' && (
            <>
              {/* Concerned / angled eyebrows */}
              <path d="M 32 33 L 42 37" stroke="#E2886A" strokeWidth="2" strokeLinecap="round" />
              <path d="M 58 37 L 68 33" stroke="#E2886A" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
          {config.expression === 'error' && (
            <>
              <path d="M 33 35 L 42 36" stroke="#C46E50" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 58 36 L 67 35" stroke="#C46E50" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}

          {/* EYES */}
          {config.expression === 'calm' || config.expression === 'submitted' ? (
            <>
              {/* Happy / smiling curved eyes */}
              <path d="M 33 46 Q 38 40 43 46" stroke={config.pupilColor} strokeWidth="3" strokeLinecap="round" />
              <path d="M 57 46 Q 62 40 67 46" stroke={config.pupilColor} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : config.expression === 'high' ? (
            <>
              {/* Wide alert eyes */}
              <circle cx="38" cy="45" r="7.5" fill="#1B2B20" stroke="#C46E50" strokeWidth="1.5" />
              <circle cx="38" cy="45" r="4" fill="#E2886A" />
              <circle cx="36" cy="43" r="1.5" fill="#FFFFFF" />

              <circle cx="62" cy="45" r="7.5" fill="#1B2B20" stroke="#C46E50" strokeWidth="1.5" />
              <circle cx="62" cy="45" r="4" fill="#E2886A" />
              <circle cx="60" cy="43" r="1.5" fill="#FFFFFF" />
            </>
          ) : config.expression === 'listening' ? (
            <>
              {/* Attentive round focused eyes with small pulse */}
              <circle cx="38" cy="45" r="6" fill="#1B2B20" stroke="#D5E66B" strokeWidth="1.5" />
              <circle cx="38" cy="45" r="3.2" fill="#D5E66B" />
              <circle cx="36" cy="43" r="1.2" fill="#FFFFFF" />

              <circle cx="62" cy="45" r="6" fill="#1B2B20" stroke="#D5E66B" strokeWidth="1.5" />
              <circle cx="62" cy="45" r="3.2" fill="#D5E66B" />
              <circle cx="60" cy="43" r="1.2" fill="#FFFFFF" />
            </>
          ) : config.expression === 'moderate' ? (
            <>
              {/* Observant eyes */}
              <circle cx="38" cy="45" r="5.5" fill="#1B2B20" stroke="#798263" strokeWidth="1.5" />
              <circle cx="38" cy="45" r="3" fill="#D5E66B" />
              <circle cx="36.5" cy="43.5" r="1" fill="#FFFFFF" />

              <circle cx="62" cy="45" r="5.5" fill="#1B2B20" stroke="#798263" strokeWidth="1.5" />
              <circle cx="62" cy="45" r="3" fill="#D5E66B" />
              <circle cx="60.5" cy="43.5" r="1" fill="#FFFFFF" />
            </>
          ) : config.expression === 'error' ? (
            <>
              {/* Neutral / concerned dots */}
              <circle cx="38" cy="45" r="4" fill="#C46E50" />
              <circle cx="62" cy="45" r="4" fill="#C46E50" />
            </>
          ) : (
            <>
              {/* Idle friendly eyes */}
              <circle cx="38" cy="45" r="5" fill="#1B2B20" stroke="#798263" strokeWidth="1.5" />
              <circle cx="38" cy="45" r="2.8" fill="#D5E66B" />
              <circle cx="36.5" cy="43.5" r="1" fill="#FFFFFF" />

              <circle cx="62" cy="45" r="5" fill="#1B2B20" stroke="#798263" strokeWidth="1.5" />
              <circle cx="62" cy="45" r="2.8" fill="#D5E66B" />
              <circle cx="60.5" cy="43.5" r="1" fill="#FFFFFF" />
            </>
          )}

          {/* MOUTH */}
          {config.expression === 'calm' || config.expression === 'submitted' ? (
            <path
              d="M 40 60 Q 50 68 60 60"
              stroke="#D5E66B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ) : config.expression === 'moderate' ? (
            <path
              d="M 43 62 Q 50 64 57 62"
              stroke="#DCD9CE"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : config.expression === 'high' ? (
            <path
              d="M 42 65 Q 50 60 58 65"
              stroke="#E2886A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ) : config.expression === 'listening' ? (
            <ellipse
              cx="50"
              cy="62"
              rx="4"
              ry="5"
              fill="none"
              stroke="#D5E66B"
              strokeWidth="1.8"
            />
          ) : config.expression === 'error' ? (
            <line
              x1="43"
              y1="63"
              x2="57"
              y2="63"
              stroke="#C46E50"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            /* Idle gentle resting smile */
            <path
              d="M 43 61 Q 50 65 57 61"
              stroke="#DCD9CE"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}

          {/* Acoustic Transducer Micro-Pin in Center Forehead */}
          <circle cx="50" cy="24" r="2.2" fill="#D5E66B" />
        </svg>
      </div>

      {/* Accessible Screen Reader Announcement */}
      <span className="sr-only">
        {`NoiseMap acoustic companion state: ${config.label}`}
      </span>
    </div>
  );
};
