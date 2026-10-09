import React from 'react';

interface StatusBadgeProps {
  label: string;
  variant?: 'cyan' | 'amber' | 'crimson' | 'emerald' | 'slate';
  pulse?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'cyan',
  pulse = false,
  icon,
  className = '',
}) => {
  const badgeStyles = {
    cyan: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300',
    amber: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
    crimson: 'bg-rose-950/70 border-rose-500/40 text-rose-300',
    emerald: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
    slate: 'bg-slate-900/80 border-slate-700/50 text-slate-400',
  };

  const dotStyles = {
    cyan: 'bg-cyan-400',
    amber: 'bg-amber-400',
    crimson: 'bg-rose-400',
    emerald: 'bg-emerald-400',
    slate: 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-[11px] font-medium tracking-wide uppercase ${badgeStyles[variant]} ${className}`}
    >
      {pulse ? (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles[variant]}`}
          ></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles[variant]}`}></span>
        </span>
      ) : (
        icon || <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`}></span>
      )}
      <span>{label}</span>
    </span>
  );
};
