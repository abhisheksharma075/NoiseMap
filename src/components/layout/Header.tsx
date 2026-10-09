import React from 'react';
import { Radio, Navigation, ShieldCheck, Activity } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface HeaderProps {
  currentGrid?: string;
  activeIncidentsCount?: number;
  isCapturing?: boolean;
  onOpenDemoToolbar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGrid = 'AUTO_DETECT',
  activeIncidentsCount = 1,
  isCapturing = false,
  onOpenDemoToolbar,
}) => {
  return (
    <header className="border-b border-white/10 bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Instrument Identity */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center bg-cyan-950/60 border border-cyan-500/50 rounded-lg overflow-hidden group shadow-glow-cyan/30">
            {/* Spinning radar sweep background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.15)_0,transparent_70%)]"></div>
            <div className="absolute inset-0 border border-cyan-500/20 rounded-lg"></div>
            <Radio className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider font-mono text-base text-white">
                NOISE<span className="text-cyan-400">MAP</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-600/40 text-amber-300">
                PWA v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden md:block">
              Privacy-First Crowdsourced Acoustic Sensor Grid
            </p>
          </div>
        </div>

        {/* Live HUD Telemetry Strip */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
          {/* Active Incident Counter */}
          {activeIncidentsCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/50 border border-rose-500/40 text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span>{activeIncidentsCount} ACTIVE HAZARDS</span>
            </div>
          )}

          {/* Grid Snap Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-slate-500">GRID:</span>
            <span className="text-cyan-300 font-semibold">{currentGrid}</span>
          </div>

          {/* Privacy Seal */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ZERO AUDIO RAM</span>
          </div>

          {/* Capturing Live Indicator */}
          {isCapturing && (
            <StatusBadge label="SAMPLING" variant="amber" pulse={true} />
          )}

          {/* Interactive Demo Simulator Opener */}
          {onOpenDemoToolbar && (
            <button
              onClick={onOpenDemoToolbar}
              className="px-2.5 py-1 rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">SIMULATOR</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
