import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export type GuardianState = 'idle' | 'monitoring' | 'data' | 'alert';

interface AcousticGuardianAvatarProps {
  state?: GuardianState;
  hasActiveAlerts?: boolean;
  interactive?: boolean;
  className?: string;
}

export const AcousticGuardianAvatar: React.FC<AcousticGuardianAvatarProps> = ({
  state: externalState,
  hasActiveAlerts = false,
  interactive = true,
  className = '',
}) => {
  // If external state is provided use it; otherwise compute based on active alerts
  const defaultState: GuardianState = hasActiveAlerts ? 'alert' : 'idle';
  const [internalState, setInternalState] = useState<GuardianState>(externalState || defaultState);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (externalState) {
      setInternalState(externalState);
    } else if (hasActiveAlerts) {
      setInternalState('alert');
    }
  }, [externalState, hasActiveAlerts]);

  const currentState = internalState;

  // Mode cycle on click when interactive
  const handleToggleState = () => {
    if (!interactive) return;
    const states: GuardianState[] = ['idle', 'monitoring', 'data', 'alert'];
    const currentIndex = states.indexOf(currentState);
    const nextState = states[(currentIndex + 1) % states.length];
    setInternalState(nextState);
  };

  // State-specific theme tokens
  const stateThemes = {
    idle: {
      primaryColor: '#00F2FE',
      secondaryColor: '#8B5CF6',
      accentGlow: 'rgba(0, 242, 254, 0.4)',
      statusLabel: 'STANDBY · HARMONIC IDLE',
      statusClass: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
      pulseSpeed: '3s',
      rotationSpeed: '28s',
    },
    monitoring: {
      primaryColor: '#06B6D4',
      secondaryColor: '#3B82F6',
      accentGlow: 'rgba(6, 182, 212, 0.55)',
      statusLabel: 'MONITORING · ACOUSTIC SENSORS',
      statusClass: 'text-blue-400 border-blue-500/40 bg-blue-950/40',
      pulseSpeed: '1.8s',
      rotationSpeed: '18s',
    },
    data: {
      primaryColor: '#10B981',
      secondaryColor: '#00F2FE',
      accentGlow: 'rgba(16, 185, 129, 0.5)',
      statusLabel: 'DATA STREAM · CITIZEN TELEMETRY',
      statusClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
      pulseSpeed: '2.2s',
      rotationSpeed: '22s',
    },
    alert: {
      primaryColor: '#EF4444',
      secondaryColor: '#F59E0B',
      accentGlow: 'rgba(239, 68, 68, 0.55)',
      statusLabel: 'EXCEEDANCE HAZARD DETECTED',
      statusClass: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
      pulseSpeed: '1.2s',
      rotationSpeed: '12s',
    },
  };

  const theme = stateThemes[currentState];

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Holographic Glow Aura */}
      <div
        className="absolute w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 rounded-full pointer-events-none transition-all duration-700 blur-3xl opacity-40 sm:opacity-50"
        style={{
          background: `radial-gradient(circle, ${theme.accentGlow} 0%, rgba(139, 92, 246, 0.15) 45%, transparent 70%)`,
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        }}
      />

      {/* Retro-Futuristic Hologram HUD Frame */}
      <div className="relative w-64 h-64 sm:w-76 sm:h-76 md:w-84 md:h-84 flex items-center justify-center">
        {/* SVG Cybernetic Avatar Construction */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full filter drop-shadow-[0_0_24px_rgba(0,242,254,0.25)] transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.02)' : 'scale(1)' }}
          role="img"
          aria-label="Acoustic Guardian AI Avatar"
        >
          <defs>
            {/* Hologram Gradients */}
            <linearGradient id="cyanVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.primaryColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={theme.secondaryColor} stopOpacity="0.75" />
            </linearGradient>

            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0B0F17" stopOpacity="0.95" />
            </linearGradient>

            <radialGradient id="sensorCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="35%" stopColor={theme.primaryColor} stopOpacity="0.85" />
              <stop offset="75%" stopColor={theme.secondaryColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Glowing Drop Shadows */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. OUTER RING: Rotating telemetry compass */}
          <g
            className="origin-center transition-all duration-1000"
            style={{
              animation: `spin-slow ${theme.rotationSpeed} linear infinite`,
            }}
          >
            <circle
              cx="200"
              cy="200"
              r="185"
              fill="none"
              stroke={theme.primaryColor}
              strokeWidth="1.2"
              strokeDasharray="4 8"
              strokeOpacity="0.3"
            />
            <circle
              cx="200"
              cy="200"
              r="176"
              fill="none"
              stroke={theme.secondaryColor}
              strokeWidth="1"
              strokeDasharray="40 18"
              strokeOpacity="0.45"
            />
            {/* Orbital telemetry pips */}
            <circle cx="200" cy="15" r="3" fill={theme.primaryColor} filter="url(#neonGlow)" />
            <circle cx="385" cy="200" r="3" fill={theme.secondaryColor} />
            <circle cx="200" cy="385" r="3" fill={theme.primaryColor} />
            <circle cx="15" cy="200" r="3" fill={theme.secondaryColor} />
          </g>

          {/* 2. MIDDLE RING: Counter-rotating frequency resonance brackets */}
          <g
            className="origin-center transition-all duration-1000"
            style={{
              animation: `spin-reverse-slow ${theme.rotationSpeed} linear infinite`,
            }}
          >
            <circle
              cx="200"
              cy="200"
              r="152"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
            {/* Harmonic Arcs */}
            <path
              d="M 200,48 A 152,152 0 0,1 352,200"
              fill="none"
              stroke={theme.primaryColor}
              strokeWidth="2.5"
              strokeDasharray="8 6 24 6"
              strokeOpacity="0.75"
              filter="url(#neonGlow)"
            />
            <path
              d="M 200,352 A 152,152 0 0,1 48,200"
              fill="none"
              stroke={theme.secondaryColor}
              strokeWidth="2.5"
              strokeDasharray="12 4 18 4"
              strokeOpacity="0.75"
              filter="url(#neonGlow)"
            />
          </g>

          {/* 3. CONCENTRIC SOUND WAVE PULSES */}
          <g className="origin-center">
            <circle
              cx="200"
              cy="200"
              r="128"
              fill="none"
              stroke={theme.primaryColor}
              strokeWidth="1.5"
              strokeOpacity="0.35"
              className="animate-ping origin-center"
              style={{ animationDuration: theme.pulseSpeed }}
            />
            <circle
              cx="200"
              cy="200"
              r="115"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          </g>

          {/* 4. SYMMETRIC FLANKING ACOUSTIC EQUALIZER BARS */}
          {/* Left Flank Bars */}
          <g opacity="0.8">
            <rect x="75" y="180" width="3" height="40" rx="1.5" fill={theme.primaryColor} className="animate-pulse" style={{ animationDuration: '1.2s' }} />
            <rect x="85" y="165" width="3" height="70" rx="1.5" fill={theme.primaryColor} className="animate-pulse" style={{ animationDuration: '1.8s' }} />
            <rect x="95" y="175" width="3" height="50" rx="1.5" fill={theme.secondaryColor} className="animate-pulse" style={{ animationDuration: '1.4s' }} />
            <rect x="105" y="155" width="3" height="90" rx="1.5" fill={theme.primaryColor} className="animate-pulse" style={{ animationDuration: '2.1s' }} />
          </g>
          {/* Right Flank Bars */}
          <g opacity="0.8">
            <rect x="292" y="155" width="3" height="90" rx="1.5" fill={theme.primaryColor} className="animate-pulse" style={{ animationDuration: '2.1s' }} />
            <rect x="302" y="175" width="3" height="50" rx="1.5" fill={theme.secondaryColor} className="animate-pulse" style={{ animationDuration: '1.4s' }} />
            <rect x="312" y="165" width="3" height="70" rx="1.5" fill={theme.primaryColor} className="animate-pulse" style={{ animationDuration: '1.8s' }} />
            <rect x="322" y="180" width="3" height="40" rx="1.5" fill={theme.primaryColor} className="animate-pulse" style={{ animationDuration: '1.2s' }} />
          </g>

          {/* 5. GUARDIAN CYBERNETIC MASK / SILHOUETTE */}
          <g filter="url(#neonGlow)">
            {/* Outer Protective Armor Shell */}
            <path
              d="M 200,95 L 268,142 L 264,228 L 200,285 L 136,228 L 132,142 Z"
              fill="url(#shieldGrad)"
              stroke={theme.primaryColor}
              strokeWidth="2"
              strokeOpacity="0.85"
            />

            {/* Inner Angular Facet Lines */}
            <path
              d="M 200,95 L 200,285 M 132,142 L 268,142 M 136,228 L 264,228"
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />

            {/* Futuristic Acoustic Visor Horizontal Bar */}
            <path
              d="M 152,185 L 248,185 L 238,205 L 162,205 Z"
              fill="rgba(11, 15, 23, 0.9)"
              stroke={theme.secondaryColor}
              strokeWidth="1.5"
            />

            {/* Acoustic Visor Dynamic Waveform Spark */}
            <path
              d="M 160,195 L 180,195 L 190,188 L 200,202 L 210,190 L 220,195 L 240,195"
              fill="none"
              stroke={theme.primaryColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
              style={{ animationDuration: '0.8s' }}
            />

            {/* Central Bio-Acoustic Sensor Sphere */}
            <circle
              cx="200"
              cy="235"
              r="22"
              fill="url(#sensorCoreGlow)"
              className="animate-pulse"
              style={{ animationDuration: theme.pulseSpeed }}
            />

            {/* Inner Precision Geometric Diode */}
            <polygon
              points="200,223 210,235 200,247 190,235"
              fill="#FFFFFF"
              opacity="0.9"
            />
            <circle cx="200" cy="235" r="2.5" fill={theme.primaryColor} />

            {/* Guardian Brow / Acoustic Antenna Fin */}
            <path
              d="M 200,82 L 208,102 L 192,102 Z"
              fill={theme.primaryColor}
              opacity="0.8"
            />
          </g>

          {/* 6. CORNER VECTOR CROSSHAIRS (Precision Scientific Framing) */}
          <g stroke="rgba(255,255,255,0.25)" strokeWidth="1">
            <line x1="30" y1="20" x2="30" y2="40" />
            <line x1="20" y1="30" x2="40" y2="30" />
            <line x1="370" y1="20" x2="370" y2="40" />
            <line x1="360" y1="30" x2="380" y2="30" />
            <line x1="30" y1="370" x2="30" y2="390" />
            <line x1="20" y1="380" x2="40" y2="380" />
            <line x1="370" y1="370" x2="370" y2="390" />
            <line x1="360" y1="380" x2="380" y2="380" />
          </g>
        </svg>

        {/* Tactical Corner HUD Telemetry Coordinates */}
        <div className="absolute -top-1 -left-1 text-[9px] font-mono text-slate-500 pointer-events-none hidden sm:block">
          NODE: GUARDIAN-AI
        </div>
        <div className="absolute -top-1 -right-1 text-[9px] font-mono text-cyan-400 pointer-events-none hidden sm:block">
          FREQ: 20Hz-20kHz
        </div>
        <div className="absolute -bottom-1 -left-1 text-[9px] font-mono text-slate-500 pointer-events-none hidden sm:block">
          DSP: TRANSIENT RAM
        </div>
        <div className="absolute -bottom-1 -right-1 text-[9px] font-mono text-slate-400 pointer-events-none hidden sm:block">
          RES: 100M_GRID
        </div>
      </div>

      {/* Dynamic Status HUD Pill & Interactive State Switcher */}
      <div className="mt-3 flex flex-col items-center gap-1.5 z-10">
        <button
          type="button"
          onClick={handleToggleState}
          title={interactive ? "Click to cycle sentinel telemetry modes" : undefined}
          className={`px-3 py-1 rounded-full border text-[11px] font-mono font-medium flex items-center gap-2 backdrop-blur-md transition-all duration-300 ${
            theme.statusClass
          } ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-md' : 'cursor-default'}`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: theme.primaryColor }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: theme.primaryColor }}
            />
          </span>
          <span className="tracking-wide">{theme.statusLabel}</span>
          {interactive && (
            <Sparkles className="w-3 h-3 text-slate-400 ml-0.5 hover:text-white" />
          )}
        </button>

        <p className="text-[10px] text-slate-400 font-mono text-center">
          Decentralized Acoustic Sentinel · Zero Audio Stored
        </p>
      </div>
    </div>
  );
};
