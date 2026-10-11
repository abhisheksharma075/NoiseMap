import React from 'react';

interface VectorCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'forest' | 'amber' | 'terracotta' | 'cyan' | 'crimson' | 'emerald' | 'olive' | 'lime';
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
    default: 'border-paper-border dark:border-night-border',
    forest: 'border-forest/40 dark:border-forest/60',
    cyan: 'border-forest/40 dark:border-forest/60',
    emerald: 'border-forest/40 dark:border-forest/60',
    amber: 'border-olive dark:border-olive/60',
    olive: 'border-olive dark:border-olive/60',
    lime: 'border-lime-signal/40 dark:border-lime-signal/60',
    crimson: 'border-terracotta/40 dark:border-terracotta/60',
    terracotta: 'border-terracotta/40 dark:border-terracotta/60',
  };

  const tagStyles = {
    default: 'text-graphite-secondary dark:text-night-secondary bg-paper dark:bg-night-bg border-paper-border dark:border-night-border',
    forest: 'text-forest dark:text-lime-signal bg-forest-subtle dark:bg-forest/30 border-forest/30 dark:border-forest/50 font-semibold',
    cyan: 'text-forest dark:text-lime-signal bg-forest-subtle dark:bg-forest/30 border-forest/30 dark:border-forest/50 font-semibold',
    emerald: 'text-forest dark:text-lime-signal bg-forest-subtle dark:bg-forest/30 border-forest/30 dark:border-forest/50 font-semibold',
    amber: 'text-[#626A50] dark:text-[#D5E66B] bg-olive-subtle dark:bg-olive/20 border-olive/30 font-semibold',
    olive: 'text-[#626A50] dark:text-[#D5E66B] bg-olive-subtle dark:bg-olive/20 border-olive/30 font-semibold',
    lime: 'text-forest-dark dark:text-lime-signal bg-lime-subtle dark:bg-lime/20 border-lime/30 font-semibold',
    crimson: 'text-terracotta dark:text-[#E2886A] bg-terracotta-subtle dark:bg-terracotta/20 border-terracotta/30 font-semibold',
    terracotta: 'text-terracotta dark:text-[#E2886A] bg-terracotta-subtle dark:bg-terracotta/20 border-terracotta/30 font-semibold',
  };

  return (
    <div
      className={`relative bg-paper-soft dark:bg-night-surface border rounded-2xl p-4 sm:p-5 transition-colors duration-150 shadow-field ${borderVariants[variant]} ${className}`}
    >
      {/* 4-corner Field Notebook Registration Ticks */}
      <span className="absolute top-1.5 left-1.5 font-mono text-[9px] text-stone dark:text-night-border select-none pointer-events-none">
        +
      </span>
      <span className="absolute top-1.5 right-1.5 font-mono text-[9px] text-stone dark:text-night-border select-none pointer-events-none">
        +
      </span>
      <span className="absolute bottom-1.5 left-1.5 font-mono text-[9px] text-stone dark:text-night-border select-none pointer-events-none">
        +
      </span>
      <span className="absolute bottom-1.5 right-1.5 font-mono text-[9px] text-stone dark:text-night-border select-none pointer-events-none">
        +
      </span>

      {/* Optional micro HUD header bar */}
      {(label || tag) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-paper-border/60 dark:border-night-border/60 font-mono text-xs">
          {label && (
            <span className="tracking-wider text-graphite-secondary dark:text-night-secondary font-medium uppercase text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-forest dark:bg-lime-signal"></span>
              {label}
            </span>
          )}
          {tag && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${tagStyles[variant]}`}
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
