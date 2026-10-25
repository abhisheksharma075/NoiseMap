import React from 'react';
import { Navigation, Sun, Moon, Activity, Bot } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { NoiseMapLogo } from '../common/NoiseMapLogo';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  currentGrid?: string;
  activeIncidentsCount?: number;
  isCapturing?: boolean;
  isCopilotActive?: boolean;
  onOpenDemoToolbar?: () => void;
  onNavigateHome?: () => void;
  onNavigateCopilot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGrid = 'AUTO_DETECT',
  activeIncidentsCount = 1,
  isCapturing = false,
  isCopilotActive = false,
  onOpenDemoToolbar,
  onNavigateHome,
  onNavigateCopilot,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-paper-border dark:border-night-border bg-paper-soft/95 dark:bg-night-surface/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-5 py-2.5 select-none transition-colors duration-150">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Field Instrument Identity */}
        <div
          onClick={onNavigateHome}
          className={`flex items-center ${onNavigateHome ? 'cursor-pointer group' : ''}`}
          title={onNavigateHome ? 'Return to Overview' : undefined}
        >
          <NoiseMapLogo size="md" className="group-hover:opacity-90 transition-opacity" />
        </div>

        {/* Real-time Field Telemetry Strip & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 font-mono text-xs">
          {/* AI Copilot Quick Launch Button */}
          {onNavigateCopilot && (
            <button
              type="button"
              onClick={onNavigateCopilot}
              className={`px-2.5 py-1.5 rounded-xl border transition-all font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-field ${
                isCopilotActive
                  ? 'border-forest dark:border-teal-signal bg-forest dark:bg-teal-600 text-paper dark:text-night-bg shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                  : 'border-emerald-500/30 dark:border-teal-500/40 bg-emerald-500/10 dark:bg-teal-500/15 text-forest dark:text-teal-300 hover:bg-emerald-500/20'
              }`}
              title="Open NoiseMap AI Copilot"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">AI COPILOT</span>
            </button>
          )}

          {/* Active Hazard Counter */}
          {activeIncidentsCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-terracotta-subtle dark:bg-rose-950/40 border border-terracotta/30 dark:border-rose-800/60 text-terracotta dark:text-rose-300 text-[10px] sm:text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta dark:bg-rose-500 animate-pulse"></span>
              <span>{activeIncidentsCount} <span className="hidden xs:inline">HOTSPOTS</span></span>
            </div>
          )}

          {/* Grid Snap Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper dark:bg-night-card border border-paper-border dark:border-night-border text-graphite-secondary dark:text-night-secondary text-xs">
            <Navigation className="w-3.5 h-3.5 text-forest dark:text-teal-signal" />
            <span className="text-graphite dark:text-night-text font-semibold">{currentGrid}</span>
          </div>

          {/* Capturing Live Indicator */}
          {isCapturing && (
            <StatusBadge label="SAMPLING" variant="lime" pulse={true} />
          )}

          {/* Daylight / Night Field Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Daylight Field Mode' : 'Switch to Night Monitoring Mode'}
            title={theme === 'dark' ? 'Switch to Daylight Field Mode' : 'Switch to Night Monitoring Mode'}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-paper-border dark:border-night-border bg-paper dark:bg-night-card text-graphite dark:text-night-text hover:bg-paper-border/30 dark:hover:bg-night-border/30 transition-colors flex items-center justify-center cursor-pointer shadow-field"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-teal-signal" />
            ) : (
              <Moon className="w-4 h-4 text-forest" />
            )}
          </button>

          {/* Interactive Field Simulator Opener */}
          {onOpenDemoToolbar && (
            <button
              onClick={onOpenDemoToolbar}
              className="px-2.5 py-1.5 rounded-xl border border-forest/30 dark:border-teal-500/40 bg-forest-subtle dark:bg-teal-500/10 text-forest dark:text-teal-signal hover:bg-forest/15 dark:hover:bg-teal-500/20 transition-colors text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer shadow-field"
              title="Open Cluster Simulator"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">SIMULATOR</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
