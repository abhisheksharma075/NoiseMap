import React from 'react';
import { soundFeedback } from '../../services/soundFeedbackService';

export type ButtonVariant = 
  | 'forest' 
  | 'lime' 
  | 'terracotta' 
  | 'paper' 
  | 'ghost' 
  // Backwards compatibility mappings:
  | 'cyan' 
  | 'amber' 
  | 'crimson' 
  | 'emerald';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  active?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  variant = 'forest',
  size = 'md',
  icon,
  active = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    soundFeedback.playTap();
    if (onClick) {
      onClick(e);
    }
  };
  // 44px minimum touch targets on mobile for touch ergonomics
  const sizeStyles = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs gap-1.5',
    md: 'min-h-[44px] px-4 py-2.5 text-sm gap-2',
    lg: 'min-h-[48px] px-5 py-3 text-sm sm:text-base gap-2.5 font-semibold',
  };

  const getVariantStyles = (v: ButtonVariant) => {
    switch (v) {
      case 'lime':
      case 'amber':
        return `bg-lime-signal hover:bg-[#C2D356] text-graphite border border-lime-signal active:scale-[0.98] shadow-field font-semibold ${
          active ? 'ring-2 ring-forest' : ''
        }`;
      case 'terracotta':
      case 'crimson':
        return `bg-terracotta hover:bg-[#B05E42] text-white border border-terracotta active:scale-[0.98] shadow-field font-semibold ${
          active ? 'ring-2 ring-forest' : ''
        }`;
      case 'paper':
        return `bg-paper-soft hover:bg-paper text-graphite dark:bg-night-surface dark:hover:bg-night-card dark:text-night-text border border-paper-border dark:border-night-border active:scale-[0.98] shadow-field font-medium ${
          active ? 'border-forest ring-1 ring-forest' : ''
        }`;
      case 'ghost':
        return `bg-transparent hover:bg-paper-border/40 dark:hover:bg-night-border/40 text-graphite-secondary dark:text-night-secondary hover:text-graphite dark:hover:text-night-text border border-transparent active:scale-[0.98] ${
          active ? 'bg-paper-border/60 text-graphite dark:bg-night-border/60 dark:text-night-text' : ''
        }`;
      case 'forest':
      case 'cyan':
      case 'emerald':
      default:
        return `bg-forest hover:bg-forest-deep text-[#FBF9F2] border border-forest-deep active:scale-[0.98] shadow-field font-medium ${
          active ? 'ring-2 ring-lime-signal' : ''
        }`;
    }
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-sans rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${sizeStyles[size]} ${getVariantStyles(variant)} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
