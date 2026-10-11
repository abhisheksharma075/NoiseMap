import React from 'react';

interface StatusBadgeProps {
  label: string;
  variant?: 'forest' | 'lime' | 'terracotta' | 'olive' | 'slate' | 'cyan' | 'amber' | 'crimson' | 'emerald';
  pulse?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'forest',
  pulse = false,
  icon,
  className = '',
}) => {
  const badgeStyles = {
    forest: 'bg-forest-subtle dark:bg-forest/30 border-forest/30 text-forest dark:text-lime-signal font-semibold',
    lime: 'bg-lime-subtle dark:bg-lime-signal/20 border-lime-dark/30 text-[#4E5B10] dark:text-lime-signal font-semibold',
    terracotta: 'bg-terracotta-subtle dark:bg-terracotta/25 border-terracotta/30 text-terracotta dark:text-[#E2886A] font-semibold',
    olive: 'bg-olive-subtle dark:bg-olive/25 border-olive/30 text-[#545B41] dark:text-[#CCD6AC] font-semibold',
    slate: 'bg-paper dark:bg-night-surface border-paper-border dark:border-night-border text-graphite-secondary dark:text-night-secondary',
    // Compatibility aliases:
    cyan: 'bg-forest-subtle dark:bg-forest/30 border-forest/30 text-forest dark:text-lime-signal font-semibold',
    amber: 'bg-lime-subtle dark:bg-lime-signal/20 border-lime-dark/30 text-[#4E5B10] dark:text-lime-signal font-semibold',
    crimson: 'bg-terracotta-subtle dark:bg-terracotta/25 border-terracotta/30 text-terracotta dark:text-[#E2886A] font-semibold',
    emerald: 'bg-forest-subtle dark:bg-forest/30 border-forest/30 text-forest dark:text-lime-signal font-semibold',
  };

  const dotStyles = {
    forest: 'bg-forest dark:bg-lime-signal',
    lime: 'bg-[#8D9F1B] dark:bg-lime-signal',
    terracotta: 'bg-terracotta',
    olive: 'bg-olive',
    slate: 'bg-stone',
    cyan: 'bg-forest dark:bg-lime-signal',
    amber: 'bg-[#8D9F1B] dark:bg-lime-signal',
    crimson: 'bg-terracotta',
    emerald: 'bg-forest dark:bg-lime-signal',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] tracking-wide uppercase ${badgeStyles[variant]} ${className}`}
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
