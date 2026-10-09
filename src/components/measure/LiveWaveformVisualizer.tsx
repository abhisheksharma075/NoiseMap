import React, { useEffect, useRef } from 'react';

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

    const draw = () => {
      animationFrameIdRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      // Dark background with slight phosphor persistence trail
      ctx.fillStyle = 'rgba(11, 15, 23, 0.35)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle horizontal center grid guideline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (analyserNode && isActive) {
        analyserNode.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00F2FE';
        ctx.shadowColor = '#00F2FE';
        ctx.shadowBlur = 8;
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
        ctx.shadowBlur = 0; // reset
      } else {
        // Flat standby beam
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
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
  }, [analyserNode, isActive]);

  return (
    <div className={`relative rounded-lg overflow-hidden border border-white/10 bg-slate-950 p-1 ${className}`}>
      <div className="absolute top-1 left-2 font-mono text-[9px] text-cyan-400/80 z-10 flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
        CRT OSCILLOSCOPE [CH1_PCM]
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={70}
        className="w-full h-16 block rounded"
      />
    </div>
  );
};
