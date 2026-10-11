import React from 'react';

interface NoiseMapLogoProps {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * NoiseMap Vector Brand Identity:
 * Concentric acoustic resonance arcs, precision crosshair, and bio-acoustic core.
 * Warm Paper / Deep Forest / Signal Lime palette.
 */
export const NoiseMapLogo: React.FC<NoiseMapLogoProps> = ({
  className = '',
  iconClassName = '',
  showWordmark = true,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-sm', badge: 'text-[9px] px-1 py-0.2' },
    md: { icon: 'w-9 h-9', text: 'text-base', badge: 'text-[10px] px-1.5 py-0.2' },
    lg: { icon: 'w-12 h-12', text: 'text-xl', badge: 'text-xs px-2 py-0.5' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Acoustic Vector Mark */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-forest dark:bg-[#1E2B22] border border-forest-border dark:border-forest/40 shadow-sm overflow-hidden flex-shrink-0 ${
          iconClassName || currentSize.icon
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Subtle Outer Boundary Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="#DCD9CE"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            strokeOpacity="0.45"
          />

          {/* Secondary Resonance Ring */}
          <circle
            cx="50"
            cy="50"
            r="32"
            stroke="#798263"
            strokeWidth="2"
            strokeOpacity="0.65"
          />

          {/* Signal Lime Primary Acoustic Wave */}
          <circle
            cx="50"
            cy="50"
            r="20"
            stroke="#D5E66B"
            strokeWidth="3"
            strokeDasharray="90 35"
          />

          {/* Sector Radar Sweep Beam */}
          <path
            d="M50 50 L78 22 A 38 38 0 0 0 50 12 Z"
            fill="#D5E66B"
            fillOpacity="0.28"
          />

          {/* Precision Alignment Crosshairs */}
          <line x1="50" y1="6" x2="50" y2="94" stroke="#F4F1E8" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="6" y1="50" x2="94" y2="50" stroke="#F4F1E8" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* Core Acoustic Micro-Transducer Node */}
          <circle cx="50" cy="50" r="5.5" fill="#D5E66B" stroke="#26382D" strokeWidth="2" />
        </svg>
      </div>

      {/* Editorial Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight font-sans text-graphite dark:text-night-text ${currentSize.text}`}
            >
              NOISE<span className="text-forest dark:text-lime-signal">MAP</span>
            </span>
            <span
              className={`font-mono rounded-md bg-paper-100 dark:bg-night-800 border border-paper-border dark:border-night-border text-graphite-secondary dark:text-night-secondary font-semibold uppercase tracking-wider ${currentSize.badge}`}
            >
              PWA
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-stone-500 dark:text-night-muted font-mono tracking-tight hidden sm:block">
            Civic Acoustic Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
