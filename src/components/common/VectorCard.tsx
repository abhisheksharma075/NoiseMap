import React from 'react';

interface VectorCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'cyan' | 'amber' | 'crimson' | 'emerald';
  label?: string;
  tag?: string;
}

export const VectorCard: React.FC<VectorCardProps> = ({
  children,
  className = '',
  variant = 'default',
  label,
  tag,
}) => {
  const borderVariants = {
    default: 'border-white/10 hover:border-white/20',
    cyan: 'border-cyan-500/30 hover:border-cyan-500/50 shadow-glow-cyan/20',
    amber: 'border-amber-500/30 hover:border-amber-500/50 shadow-glow-amber/20',
    crimson: 'border-rose-500/30 hover:border-rose-500/50 shadow-glow-crimson/20',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/50 shadow-glow-emerald/20',
  };

  const tagColors = {
    default: 'text-slate-400 bg-slate-800/60 border-slate-700',
    cyan: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
    amber: 'text-amber-400 bg-amber-950/60 border-amber-800',
    crimson: 'text-rose-400 bg-rose-950/60 border-rose-800',
    emerald: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
  };

  return (
    <div
      className={`relative bg-surface/90 backdrop-blur-md border rounded-xl p-5 transition-all duration-200 group ${borderVariants[variant]} ${className}`}
    >
      {/* 4-corner Vector Crosshairs */}
      <span className="absolute top-1.5 left-1.5 font-mono text-[10px] text-slate-500 select-none group-hover:text-cyan-400/80 transition-colors">
        +
      </span>
      <span className="absolute top-1.5 right-1.5 font-mono text-[10px] text-slate-500 select-none group-hover:text-cyan-400/80 transition-colors">
        +
      </span>
      <span className="absolute bottom-1.5 left-1.5 font-mono text-[10px] text-slate-500 select-none group-hover:text-cyan-400/80 transition-colors">
        +
      </span>
      <span className="absolute bottom-1.5 right-1.5 font-mono text-[10px] text-slate-500 select-none group-hover:text-cyan-400/80 transition-colors">
        +
      </span>

      {/* Optional micro HUD header bar */}
      {(label || tag) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 font-mono text-xs">
          {label && (
            <span className="tracking-wider text-slate-400 font-medium uppercase text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-slate-500 group-hover:bg-cyan-400 transition-colors"></span>
              {label}
            </span>
          )}
          {tag && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${tagColors[variant]}`}
            >
              {tag}
            </span>
          )}
        </div>
      )}

      {children}
    </div>
  );
};
