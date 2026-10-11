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
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-paper-50/95 dark:bg-night-850/95 backdrop-blur-md border border-paper-border dark:border-night-border rounded-xl font-mono text-xs shadow-sm">
      {/* 5-Option Time Filter Selector */}
      <div
        role="radiogroup"
        aria-label="Time window filter"
        className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none"
      >
        <Clock className="w-3.5 h-3.5 text-forest-700 dark:text-lime-400 flex-shrink-0 mr-1" aria-hidden="true" />
        {timeOptions.map((t) => {
          const isSelected = timeFilter === t.id;
          return (
            <button
              key={t.id}
              role="radio"
              aria-checked={isSelected}
              type="button"
              onClick={() => onChangeTimeFilter(t.id)}
              className={`relative min-h-[38px] px-3 py-1.5 rounded-lg text-[11px] whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-signal ${
                isSelected
                  ? 'bg-forest text-paper dark:bg-lime-signal dark:text-forest-deep font-bold border-2 border-forest dark:border-lime-signal shadow-sm'
                  : 'bg-paper-100 dark:bg-night-800 text-graphite-secondary dark:text-night-secondary hover:text-graphite dark:hover:text-night-text border border-paper-border dark:border-night-border hover:border-forest/50 font-medium'
              }`}
            >
              {/* Visible Selection Dot */}
              <span
                className={`w-1.5 h-1.5 rounded-full transition-transform ${
                  isSelected
                    ? 'bg-lime-signal dark:bg-forest scale-100'
                    : 'bg-stone-300 dark:bg-night-border scale-75'
                }`}
                aria-hidden="true"
              />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Source Dropdown & Telemetry Count */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-olive-600 dark:text-lime-400" />
          <select
            value={sourceFilter}
            onChange={(e) => onChangeSourceFilter(e.target.value as NoiseSourceType | 'all')}
            className="bg-paper-100 dark:bg-night-800 border border-paper-border dark:border-night-border text-graphite-800 dark:text-night-text rounded-lg px-2.5 py-1.5 text-[11px] font-mono focus:outline-none focus:border-forest-600 dark:focus:border-lime-400 cursor-pointer"
          >
            {sourceOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-paper-100 dark:bg-night-800 border border-paper-border dark:border-night-border text-stone-600 dark:text-night-muted text-[11px]">
          <Volume2 className="w-3 h-3 text-forest-700 dark:text-lime-400" />
          <span>NODES: <strong className="text-graphite-900 dark:text-night-text">{activeCount}</strong></span>
        </div>
      </div>
    </div>
  );
};
