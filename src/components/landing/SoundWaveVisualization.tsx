import React, { useState, useEffect } from 'react';
import { Play, Pause, Waves } from 'lucide-react';

interface SoundWaveVisualizationProps {
  className?: string;
  isLiveRecording?: boolean;
  currentDecibels?: number;
}

export const SoundWaveVisualization: React.FC<SoundWaveVisualizationProps> = ({
  className = '',
  isLiveRecording = false,
  currentDecibels = 0,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simulatedPreset, setSimulatedPreset] = useState<'ambient' | 'urban' | 'pulse'>('ambient');
  const [phase, setPhase] = useState<number>(0);

  // Smooth animation frame loop for wave oscillation
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const animate = () => {
      setPhase((prev) => (prev + 0.08) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Total bars across width
  const totalBars = 42;

  const presetConfigs = {
    ambient: {
      label: 'QUIET AMBIENT (42 dB)',
      multiplier: 1.0,
      baseDb: 42,
      color: 'from-cyan-500 to-blue-500',
    },
    urban: {
      label: 'URBAN TRAFFIC (68 dB)',
      multiplier: 1.8,
      baseDb: 68,
      color: 'from-cyan-400 via-sky-400 to-indigo-500',
    },
    pulse: {
      label: 'INDUSTRIAL PEAK (84 dB)',
      multiplier: 2.6,
      baseDb: 84,
      color: 'from-amber-400 via-rose-400 to-purple-500',
    },
  };

  const currentConfig = presetConfigs[simulatedPreset];

  return (
    <div className={`w-full max-w-xl mx-auto rounded-xl p-3 sm:p-4 bg-surface/70 border border-white/10 backdrop-blur-md font-mono text-xs ${className}`}>
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
        <div className="flex items-center gap-2 text-cyan-400">
          <Waves className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold tracking-wider">
            {isLiveRecording ? 'REAL-TIME MICROPHONE DSP WAVEFORM' : 'ACOUSTIC SPECTRUM HARMONICS'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!isLiveRecording && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>STANDBY DECORATIVE</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause Waveform" : "Resume Waveform"}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Dynamic Sound Wave Equalizer Bars */}
      <div className="h-20 sm:h-24 flex items-center justify-between gap-[2px] sm:gap-1 px-1 my-1 overflow-hidden">
        {Array.from({ length: totalBars }).map((_, index) => {
          // Compute harmonic wave heights symmetrically around center
          const normalizedPos = Math.abs(index - totalBars / 2) / (totalBars / 2);
          const wave1 = Math.sin(phase + index * 0.28);
          const wave2 = Math.cos(phase * 1.5 - index * 0.35);
          const combined = (wave1 + wave2) / 2;

          let heightPct = 15;
          if (isLiveRecording && currentDecibels > 0) {
            heightPct = Math.min(Math.max((currentDecibels / 120) * 100 * (1 - normalizedPos * 0.5) + combined * 15, 12), 98);
          } else {
            heightPct = Math.min(
              Math.max(
                (20 + combined * 30 * currentConfig.multiplier) * (1 - normalizedPos * 0.4),
                10
              ),
              96
            );
          }

          return (
            <div
              key={index}
              className="flex-1 flex flex-col justify-center items-center h-full"
            >
              <div
                className={`w-full rounded-full bg-gradient-to-t ${currentConfig.color} transition-all duration-75`}
                style={{
                  height: `${heightPct}%`,
                  opacity: Math.max(0.4, 1 - normalizedPos * 0.5),
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Preset Switcher & Disclaimer */}
      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 uppercase">Profile:</span>
          {(['ambient', 'urban', 'pulse'] as const).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSimulatedPreset(preset)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                simulatedPreset === preset
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {preset.toUpperCase()}
            </button>
          ))}
        </div>

        <span className="text-slate-500 italic">
          Zero mic access until sampling starts
        </span>
      </div>
    </div>
  );
};
