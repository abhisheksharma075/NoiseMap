import React from 'react';
import { Home, Mic, Map, AlertTriangle, FileText, UserCheck } from 'lucide-react';
import { soundFeedback } from '../../services/soundFeedbackService';

export type TabType = 'home' | 'measure' | 'map' | 'incidents' | 'evidence' | 'profile';

interface NavigationBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  hasActiveIncidents?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onChangeTab,
  hasActiveIncidents = true,
}) => {
  const handleSelectTab = (tab: TabType) => {
    soundFeedback.playSelection();
    onChangeTab(tab);
  };
  const tabs = [
    { id: 'home' as TabType, label: 'OVERVIEW', icon: Home },
    { id: 'measure' as TabType, label: 'MEASURE', icon: Mic, isPrimary: true },
    { id: 'map' as TabType, label: 'MAP', icon: Map },
    {
      id: 'incidents' as TabType,
      label: 'INCIDENTS',
      icon: AlertTriangle,
      badge: hasActiveIncidents,
    },
    { id: 'evidence' as TabType, label: 'DOSSIER', icon: FileText },
    { id: 'profile' as TabType, label: 'CIVIC ID', icon: UserCheck },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Application Navigation"
      className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-lg z-50 bg-paper-soft/95 dark:bg-night-surface/95 backdrop-blur-xl border-t border-paper-border dark:border-night-border pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-1 px-2 shadow-field-lg transition-colors duration-150"
    >
      <div className="flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isPrimary) {
            // Elevated Primary Action Button (Measure)
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                aria-label="Start Acoustic Measurement"
                aria-current={isActive ? 'page' : undefined}
                className={`relative -top-2 flex flex-col items-center justify-center min-w-[52px] min-h-[52px] sm:min-w-[56px] sm:min-h-[56px] rounded-2xl transition-all duration-150 cursor-pointer select-none shadow-md ${
                  isActive
                    ? 'bg-forest dark:bg-teal-600 text-paper dark:text-night-bg ring-2 ring-forest dark:ring-teal-signal scale-105 shadow-[0_0_15px_rgba(45,212,191,0.35)]'
                    : 'bg-forest hover:bg-forest-deep dark:bg-teal-700 dark:hover:bg-teal-600 text-[#FBF9F2] hover:scale-102'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[9px] font-mono font-bold tracking-tight mt-0.5 text-lime-signal dark:text-teal-200">
                  MEASURE
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-h-[48px] px-1.5 sm:px-2.5 rounded-xl transition-all duration-150 select-none cursor-pointer flex-1 ${
                isActive
                  ? 'text-forest dark:text-teal-signal font-bold'
                  : 'text-graphite-secondary dark:text-night-secondary hover:text-graphite dark:hover:text-night-text'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta dark:bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta dark:bg-rose-500"></span>
                  </span>
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-mono tracking-tight mt-1 transition-colors ${
                isActive ? 'font-bold underline decoration-forest dark:decoration-teal-signal underline-offset-4' : 'font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
