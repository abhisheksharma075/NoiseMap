import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface LiveWaveformVisualizerProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
  className?: string;
}

export const LiveWaveformVisualizer: React.FC<LiveWaveformVisualizerProps> = ({
  analyserNode,
  isActive,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bufferLength = 1024;
    let dataArray = new Uint8Array(bufferLength);

    if (analyserNode && isActive) {
      bufferLength = analyserNode.fftSize;
      dataArray = new Uint8Array(bufferLength);
    }

    const isDark = theme === 'dark';

    const draw = () => {
      animationFrameIdRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      // Clean canvas background
      ctx.fillStyle = isDark ? '#1C231E' : '#F4F1E8';
      ctx.fillRect(0, 0, width, height);

      // Subtle horizontal center grid guideline
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(37, 41, 34, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (analyserNode && isActive) {
        analyserNode.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = isDark ? '#D5E66B' : '#354C3C';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else {
        // Flat standby beam
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isDark ? 'rgba(213, 230, 107, 0.35)' : 'rgba(53, 76, 60, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [analyserNode, isActive, theme]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-paper-border dark:border-night-border bg-paper dark:bg-night-bg p-1 shadow-field ${className}`}>
      <div className="absolute top-1.5 left-2.5 font-mono text-[9px] text-graphite-secondary dark:text-night-secondary z-10 flex items-center gap-1.5 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-lime-signal"></span>
        FIELD OSCILLOSCOPE [CH1_PCM]
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={70}
        className="w-full h-16 block rounded-lg"
      />
    </div>
  );
};
