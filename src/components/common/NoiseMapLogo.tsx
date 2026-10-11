import React from 'react';

interface NoiseMapLogoProps {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * NoiseMap High-Classic Vector Brand Identity:
 * Combines topographic geodetic reticles, precision resonance arcs,
 * acoustic crests, and central bio-acoustic micro-transducer core.
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
      {/* High-Classic Vector Instrument Mark */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-[#1E2F23] dark:bg-[#141E17] border border-[#2D4634] dark:border-forest/50 shadow-sm overflow-hidden flex-shrink-0 ${
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
          {/* Subtle Outer Geodetic Boundary Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="#DCD7C9"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            strokeOpacity="0.4"
          />

          {/* Secondary Resonance Ring (Olive) */}
          <circle
            cx="50"
            cy="50"
            r="33"
            stroke="#798E69"
            strokeWidth="2"
            strokeOpacity="0.75"
          />

          {/* Primary Acoustic Wave Arc (Signal Lime Highlight) */}
          <circle
            cx="50"
            cy="50"
            r="21"
            stroke="#D5E66B"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray="90 35"
          />

          {/* Acoustic Wave Crests in Upper-Right Sector */}
          <path
            d="M 50 36 A 14 14 0 0 1 64 50"
            stroke="#E2F075"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />
          <path
            d="M 50 28 A 22 22 0 0 1 72 50"
            stroke="#CDE350"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />

          {/* Precision Alignment Crosshair */}
          <line x1="50" y1="5" x2="50" y2="95" stroke="#FAF8F2" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="#FAF8F2" strokeWidth="1" strokeOpacity="0.4" />

          {/* Core Acoustic Micro-Transducer Node */}
          <circle cx="50" cy="50" r="5" fill="#141E17" stroke="#DCD7C9" strokeWidth="1" />
          <circle cx="50" cy="50" r="3.2" fill="#D5E66B" />
        </svg>
      </div>

      {/* High-Classic Editorial Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight font-sans text-graphite dark:text-night-text ${currentSize.text}`}
            >
              NOISE<span className="text-[#354C3C] dark:text-lime-signal">MAP</span>
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
