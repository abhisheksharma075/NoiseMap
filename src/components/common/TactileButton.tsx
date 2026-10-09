import React from 'react';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'amber' | 'crimson' | 'emerald' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  active?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  icon,
  active = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    cyan: `bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:border-cyan-400 active:scale-[0.98] shadow-sm hover:shadow-glow-cyan/50 ${
      active ? 'bg-cyan-500/25 border-cyan-300 shadow-glow-cyan' : ''
    }`,
    amber: `bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:border-amber-400 active:scale-[0.98] shadow-sm hover:shadow-glow-amber/50 ${
      active ? 'bg-amber-500/25 border-amber-300 shadow-glow-amber' : ''
    }`,
    crimson: `bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:border-rose-400 active:scale-[0.98] shadow-sm hover:shadow-glow-crimson/50 ${
      active ? 'bg-rose-500/25 border-rose-300 shadow-glow-crimson' : ''
    }`,
    emerald: `bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 active:scale-[0.98] shadow-sm hover:shadow-glow-emerald/50 ${
      active ? 'bg-emerald-500/25 border-emerald-300 shadow-glow-emerald' : ''
    }`,
    ghost: `bg-transparent hover:bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10 active:scale-[0.98] ${
      active ? 'bg-white/10 text-white border-white/20' : ''
    }`,
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-mono font-medium rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
