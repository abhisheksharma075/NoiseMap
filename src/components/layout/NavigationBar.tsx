import React from 'react';
import { Activity, Map, AlertTriangle, FileText, UserCheck } from 'lucide-react';

export type TabType = 'measure' | 'map' | 'incidents' | 'evidence' | 'profile';

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
  const tabs = [
    { id: 'measure' as TabType, label: 'MEASURE', icon: Activity },
    { id: 'map' as TabType, label: 'MAP', icon: Map },
    {
      id: 'incidents' as TabType,
      label: 'INCIDENTS',
      icon: AlertTriangle,
      badge: hasActiveIncidents,
    },
    { id: 'evidence' as TabType, label: 'CPCB DOSSIER', icon: FileText },
    { id: 'profile' as TabType, label: 'CIVIC ID', icon: UserCheck },
  ];

  return (
    <nav className="fixed bottom-4 inset-x-0 mx-auto w-[94%] max-w-lg bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-1.5 shadow-2xl z-50">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 select-none cursor-pointer ${
                isActive
                  ? 'text-cyan-300 bg-cyan-950/60 shadow-[inset_0_0_12px_rgba(0,242,254,0.15)] border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 scale-105' : 'text-slate-400'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono tracking-wider font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
