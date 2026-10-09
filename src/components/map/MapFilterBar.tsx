import React from 'react';
import { NoiseSourceType } from '../../types';
import { Filter, Clock, Volume2 } from 'lucide-react';

export type TimeFilterType = 'live' | '1h' | '24h' | '7d' | 'all';

interface MapFilterBarProps {
  timeFilter: TimeFilterType;
  onChangeTimeFilter: (filter: TimeFilterType) => void;
  sourceFilter: NoiseSourceType | 'all';
  onChangeSourceFilter: (source: NoiseSourceType | 'all') => void;
  activeCount: number;
}

export const MapFilterBar: React.FC<MapFilterBarProps> = ({
  timeFilter,
  onChangeTimeFilter,
  sourceFilter,
  onChangeSourceFilter,
  activeCount,
}) => {
  const timeOptions: { id: TimeFilterType; label: string }[] = [
    { id: 'live', label: 'LIVE (15m)' },
    { id: '1h', label: '1 HOUR' },
    { id: '24h', label: '24 HOURS' },
    { id: '7d', label: '7 DAYS' },
    { id: 'all', label: 'ALL TIME' },
  ];

  const sourceOptions: { id: NoiseSourceType | 'all'; label: string }[] = [
    { id: 'all', label: 'All Sources' },
    { id: 'traffic', label: 'Traffic' },
    { id: 'construction', label: 'Construction' },
    { id: 'loudspeaker', label: 'Loudspeakers' },
    { id: 'industrial', label: 'Industrial' },
    { id: 'aircraft', label: 'Aircraft' },
  ];

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-surface/90 backdrop-blur-md border border-white/10 rounded-xl font-mono text-xs">
      {/* Time Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
        <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mr-1" />
        {timeOptions.map((t) => (
          <button
            key={t.id}
            onClick={() => onChangeTimeFilter(t.id)}
            className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
              timeFilter === t.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Source Dropdown & Telemetry Count */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={sourceFilter}
            onChange={(e) => onChangeSourceFilter(e.target.value as NoiseSourceType | 'all')}
            className="bg-slate-900 border border-white/10 text-slate-200 rounded px-2.5 py-1 text-[11px] font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {sourceOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
          <Volume2 className="w-3 h-3 text-cyan-400" />
          <span>NODES: <strong className="text-white">{activeCount}</strong></span>
        </div>
      </div>
    </div>
  );
};
