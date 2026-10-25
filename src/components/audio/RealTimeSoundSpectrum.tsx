import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Activity, Mic, Square, AlertCircle, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface RealTimeSoundSpectrumProps {
  analyserNode?: AnalyserNode | null;
  isActive?: boolean;
  onStart?: () => void | Promise<void>;
  onStop?: () => void;
  permissionDenied?: boolean;
  error?: string | null;
  className?: string;
  showControls?: boolean;
}

// Standard acoustic frequency octave-band center markers for axis labeling
const FREQUENCY_AXIS_MARKERS = [
  { label: '63Hz', freq: 63 },
  { label: '125Hz', freq: 125 },
  { label: '250Hz', freq: 250 },
  { label: '500Hz', freq: 500 },
  { label: '1kHz', freq: 1000 },
  { label: '2kHz', freq: 2000 },
  { label: '4kHz', freq: 4000 },
  { label: '8kHz', freq: 8000 },
  { label: '16kHz', freq: 16000 },
];

const NUM_BARS = 48; // Number of responsive perceptual frequency bars

export const RealTimeSoundSpectrum: React.FC<RealTimeSoundSpectrumProps> = ({
  analyserNode = null,
  isActive = false,
  onStart,
  onStop,
  permissionDenied = false,
  error = null,
  className = '',
  showControls = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const peakHoldRef = useRef<Float32Array>(new Float32Array(NUM_BARS));
  const peakDecayRef = useRef<Float32Array>(new Float32Array(NUM_BARS));
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeFrequencyBand, setActiveFrequencyBand] = useState<string>('Standby');
  const [peakFrequencyHz, setPeakFrequencyHz] = useState<number | null>(null);

  // Clean animation loop and canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let isSubscribed = true;

    // Allocate memory once outside the frame loop to prevent garbage collection pauses
    let dataArray: Uint8Array | null = null;
    let sampleRate = 48000;
    let binCount = 1024;

    if (analyserNode && isActive) {
      binCount = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(binCount);
      if (analyserNode.context && analyserNode.context.sampleRate) {
        sampleRate = analyserNode.context.sampleRate;
      }
    }

    const render = () => {
      if (!isSubscribed) return;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Background
      ctx.fillStyle = isDark ? '#0A0F1D' : '#F4F1E8';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Subtle Background Horizontal Division Grid (dB reference lines)
      ctx.lineWidth = 1;
      const gridSteps = 4;
      for (let s = 1; s < gridSteps; s++) {
        const yPos = (height / gridSteps) * s;
        ctx.strokeStyle = isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(226, 232, 240, 0.9)';
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos);
        ctx.stroke();
      }

      // 3. Active Mode: Query frequency data from Web Audio AnalyserNode
      if (analyserNode && isActive && dataArray) {
        analyserNode.getByteFrequencyData(dataArray as unknown as Uint8Array<ArrayBuffer>);

        const nyquist = sampleRate / 2;
        const barSpacing = 2;
        const totalSpacing = barSpacing * (NUM_BARS - 1);
        const barWidth = Math.max((width - totalSpacing) / NUM_BARS, 1);

        // Minimum and maximum perceptual frequencies (20 Hz to 20,000 Hz)
        const minLog = Math.log10(20);
        const maxLog = Math.log10(Math.min(20000, nyquist));
        const logStep = (maxLog - minLog) / NUM_BARS;

        let maxVal = 0;
        let dominantBin = 0;

        for (let b = 0; b < NUM_BARS; b++) {
          // Logarithmic bin mapping: human ear perceives frequency on a log/Bark scale
          const startFreq = Math.pow(10, minLog + b * logStep);
          const endFreq = Math.pow(10, minLog + (b + 1) * logStep);

          const startBin = Math.max(0, Math.floor((startFreq / nyquist) * binCount));
          const endBin = Math.min(binCount - 1, Math.ceil((endFreq / nyquist) * binCount));

          // Compute average magnitude within the frequency partition
          let sum = 0;
          let count = 0;
          for (let k = startBin; k <= endBin; k++) {
            sum += dataArray[k];
            count++;
            if (dataArray[k] > maxVal) {
              maxVal = dataArray[k];
              dominantBin = k;
            }
          }
          const rawMag = count > 0 ? sum / count : 0; // 0..255

          // Normalize magnitude to canvas height (giving headroom for labels)
          const normHeight = (rawMag / 255) * (height - 18);

          // Update peak-hold and decay
          if (normHeight > peakHoldRef.current[b]) {
            peakHoldRef.current[b] = normHeight;
            peakDecayRef.current[b] = 0;
          } else {
            peakDecayRef.current[b] += 0.3;
            peakHoldRef.current[b] = Math.max(0, peakHoldRef.current[b] - peakDecayRef.current[b]);
          }

          const x = b * (barWidth + barSpacing);
          const y = height - normHeight - 4;

          // Multi-stage Environmental Tech Color Gradient (Teal -> Amber -> Crimson)
          const ratio = normHeight / (height - 18);
          let barColor = isDark ? '#2DD4BF' : '#0D9488'; // Compliant / Quiet Teal
          if (ratio > 0.75) {
            barColor = isDark ? '#F43F5E' : '#E11D48'; // High energy / Peak Crimson
          } else if (ratio > 0.5) {
            barColor = isDark ? '#F59E0B' : '#D97706'; // Moderate / Warning Amber
          }

          // Draw Frequency Bar
          ctx.fillStyle = barColor;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(x, y, barWidth, normHeight, [2, 2, 0, 0]) : ctx.rect(x, y, barWidth, normHeight);
          ctx.fill();

          // Draw Peak Hold Cap
          const peakY = height - peakHoldRef.current[b] - 5;
          if (peakHoldRef.current[b] > 2) {
            ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
            ctx.fillRect(x, Math.max(0, peakY), barWidth, 2);
          }
        }

        // Compute dominant frequency in Hz
        if (maxVal > 15) {
          const domHz = Math.round((dominantBin * sampleRate) / (binCount * 2));
          setPeakFrequencyHz(domHz);
          if (domHz < 250) setActiveFrequencyBand('Low Frequencies (Bass / Engines)');
          else if (domHz < 2000) setActiveFrequencyBand('Mid Frequencies (Speech / Ambience)');
          else setActiveFrequencyBand('High Frequencies (Horns / Squeals)');
        } else {
          setActiveFrequencyBand('Quiet Ambient');
          setPeakFrequencyHz(null);
        }
      } else {
        // 4. Inactive / Standby Mode: Render baseline indicators with zero fake activity
        const barSpacing = 2;
        const totalSpacing = barSpacing * (NUM_BARS - 1);
        const barWidth = Math.max((width - totalSpacing) / NUM_BARS, 1);

        ctx.fillStyle = isDark ? 'rgba(45, 212, 191, 0.15)' : 'rgba(13, 148, 136, 0.15)';
        for (let b = 0; b < NUM_BARS; b++) {
          const x = b * (barWidth + barSpacing);
          const y = height - 6;
          ctx.fillRect(x, y, barWidth, 2);
        }
      }

      // Schedule next frame only while subscribed
      if (isSubscribed) {
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    // Start single animation loop
    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isSubscribed = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [analyserNode, isActive, isDark]);

  // Handle responsive canvas dimensions with Device Pixel Ratio (DPR)
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const targetWidth = Math.max(Math.floor(rect.width), 280);
    const targetHeight = 120; // Optimal height for mobile and desktop

    if (canvas.width !== targetWidth * dpr || canvas.height !== targetHeight * dpr) {
      canvas.width = targetWidth * dpr;
      canvas.height = targetHeight * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [updateCanvasSize]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-paper-border dark:border-night-border bg-paper dark:bg-night-card p-3 sm:p-4 space-y-3 font-mono shadow-sm select-none transition-colors ${className}`}
      role="region"
      aria-label="Real-Time Sound Spectrum"
    >
      {/* Component Header & Telemetry Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-paper-border/60 dark:border-night-border/70">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-forest dark:text-teal-signal" aria-hidden="true" />
            <h3 className="text-xs sm:text-sm font-bold text-graphite dark:text-night-text uppercase tracking-wide">
              Real-Time Sound Spectrum
            </h3>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isActive
                  ? 'bg-forest-subtle dark:bg-teal-500/20 text-forest dark:text-teal-signal border border-forest/30 dark:border-teal-500/40 animate-pulse'
                  : 'bg-paper-soft dark:bg-night-surface text-stone-500 dark:text-night-muted border border-paper-border dark:border-night-border'
              }`}
            >
              {isActive ? 'ANALYZING LIVE' : 'STANDBY'}
            </span>
          </div>
          <p className="text-[11px] text-graphite-secondary dark:text-night-secondary font-sans mt-0.5">
            Real-time Web Audio Fast Fourier Transform (FFT) frequency magnitude distribution across audible octaves.
          </p>
        </div>

        {/* Real-time telemetry: dominant pitch readout */}
        <div className="flex items-center gap-2 text-xs">
          {isActive && peakFrequencyHz ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border">
              <span className="text-[10px] text-stone-500 dark:text-night-muted uppercase">PEAK PITCH:</span>
              <strong className="text-forest dark:text-teal-signal font-bold">{peakFrequencyHz} Hz</strong>
            </div>
          ) : (
            <div className="text-[10px] text-stone-500 dark:text-night-muted">
              {isActive ? 'Awaiting acoustic signal...' : 'Sensor idle'}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative rounded-lg overflow-hidden border border-paper-border dark:border-night-border bg-[#0A0F1D]">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '120px' }}
          className="block"
          aria-label="Acoustic frequency spectrum display"
          role="img"
        />

        {/* Inactive Standby Overlay Badge */}
        {!isActive && !error && !permissionDenied && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none">
            <div className="text-center px-4 py-2 rounded-xl bg-night-card/90 border border-night-border text-slate-300 text-xs">
              <p className="font-semibold text-teal-300">Microphone Inactive</p>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Start acoustic measurement to render real-time frequency distribution.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Frequency Axis Octave Labels */}
      <div className="flex justify-between items-center text-[9px] text-stone-500 dark:text-night-muted px-1 font-mono tracking-tight overflow-x-auto scrollbar-none">
        {FREQUENCY_AXIS_MARKERS.map((m) => (
          <span key={m.freq} title={`${m.freq} Hertz`}>
            {m.label}
          </span>
        ))}
      </div>

      {/* Dominant Band Classification & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-graphite-secondary dark:text-night-secondary font-sans border-t border-paper-border/60 dark:border-night-border/70">
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-teal-signal" />
          <span>DOMINANT SPECTRUM:</span>
          <strong className="text-graphite dark:text-night-text font-semibold">{activeFrequencyBand}</strong>
        </div>
        <div className="text-[10px] text-stone-500 dark:text-night-muted font-mono">
          <span>0 dBFS</span>
          <span className="mx-1">→</span>
          <span>-96 dBFS [IEC 61672]</span>
        </div>
      </div>

      {/* Permission Denied / Error State Notice */}
      {(permissionDenied || error) && (
        <div
          className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs space-y-1.5 animate-in fade-in"
          role="alert"
        >
          <div className="flex items-start gap-2">
            {permissionDenied ? (
              <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-xs">
                {permissionDenied ? 'Microphone Access Required' : 'Audio Hardware Sensor Error'}
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 font-sans mt-0.5">
                {error || 'Microphone access is needed to visualize live frequency data. Please allow microphone access in your browser settings.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Start/Stop Controls (Rendered only when showControls is true) */}
      {showControls && (
        <div className="pt-1 flex gap-2">
          {!isActive ? (
            <button
              type="button"
              onClick={onStart}
              className="flex-1 py-2 px-3 rounded-lg bg-forest hover:bg-forest-deep dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>START SPECTRUM CAPTURE</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStop}
              className="flex-1 py-2 px-3 rounded-lg bg-terracotta hover:bg-terracotta/90 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Square className="w-3.5 h-3.5" />
              <span>STOP SPECTRUM CAPTURE</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
