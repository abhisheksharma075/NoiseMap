import React, { useState } from 'react';
import { NoiseIncident, NoiseReading } from '../../types';
import { IncidentCard } from './IncidentCard';
import { VectorCard } from '../common/VectorCard';
import { AlertTriangle, Flame, CheckCircle, ShieldCheck, Radio } from 'lucide-react';

interface IncidentsViewProps {
  incidents: NoiseIncident[];
  readings?: NoiseReading[];
  onGenerateComplaint?: (incident: NoiseIncident) => void;
  onViewOnMap?: (incident: NoiseIncident) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  readings = [],
  onGenerateComplaint,
  onViewOnMap,
}) => {
  const [filterTab, setFilterTab] = useState<'active' | 'hotspots' | 'resolved'>('active');

  const activeIncidents = incidents.filter((i) => i.status === 'active');
  const pendingConsensusReadings = readings.filter((r) => r.db_avg >= 68.0);

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-paper-50/95 dark:bg-night-850/95 border border-paper-border dark:border-night-border rounded-xl font-mono shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-graphite-900 dark:text-night-text tracking-wider">
              VERIFIED NOISE INCIDENTS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-terracotta-100 dark:bg-terracotta-950/60 border border-terracotta-300 dark:border-terracotta-700 text-terracotta-800 dark:text-terracotta-300 font-bold">
              {activeIncidents.length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-night-muted mt-1">
            Corroborated peer evidence engine · Eliminating single-user bias
          </p>
        </div>

        {/* Tab Selector */}
        <div
          role="tablist"
          aria-label="Incident status filters"
          className="flex items-center gap-1.5 p-1 bg-paper-100 dark:bg-night-900 rounded-xl border border-paper-border dark:border-night-border text-xs"
        >
          <button
            role="tab"
            aria-selected={filterTab === 'active'}
            type="button"
            onClick={() => setFilterTab('active')}
            className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-signal ${
              filterTab === 'active'
                ? 'bg-forest text-paper dark:bg-lime-signal dark:text-forest-deep font-bold border-2 border-forest dark:border-lime-signal shadow-xs'
                : 'text-stone-600 dark:text-night-muted hover:text-graphite-900 dark:hover:text-night-text border border-transparent'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active ({activeIncidents.length})</span>
          </button>
          <button
            role="tab"
            aria-selected={filterTab === 'hotspots'}
            type="button"
            onClick={() => setFilterTab('hotspots')}
            className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-signal ${
              filterTab === 'hotspots'
                ? 'bg-forest text-paper dark:bg-lime-signal dark:text-forest-deep font-bold border-2 border-forest dark:border-lime-signal shadow-xs'
                : 'text-stone-600 dark:text-night-muted hover:text-graphite-900 dark:hover:text-night-text border border-transparent'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Hotspots</span>
          </button>
          <button
            role="tab"
            aria-selected={filterTab === 'resolved'}
            type="button"
            onClick={() => setFilterTab('resolved')}
            className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-signal ${
              filterTab === 'resolved'
                ? 'bg-forest text-paper dark:bg-lime-signal dark:text-forest-deep font-bold border-2 border-forest dark:border-lime-signal shadow-xs'
                : 'text-stone-600 dark:text-night-muted hover:text-graphite-900 dark:hover:text-night-text border border-transparent'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </button>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {filterTab === 'active' && activeIncidents.length > 0 && (
          activeIncidents.map((inc) => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              onGenerateComplaint={onGenerateComplaint}
              onViewOnMap={onViewOnMap}
            />
          ))
        )}

        {filterTab === 'active' && activeIncidents.length === 0 && (
          <div className="space-y-4">
            <VectorCard
              label="INCIDENT SENSOR LOG"
              tag="ZERO ACTIVE HAZARDS"
              variant="forest"
              className="text-center py-8 space-y-3 font-mono shadow-sm"
            >
              <ShieldCheck className="w-12 h-12 text-forest-700 dark:text-lime-400 mx-auto" />
              <h3 className="text-lg font-bold text-graphite-900 dark:text-night-text">Grid Operating Within CPCB Limits</h3>
              <p className="text-xs text-stone-600 dark:text-night-muted max-w-md mx-auto leading-relaxed">
                No multi-contributor clusters (3+ devices exceeding 68 dB in a ~100m sector) active over the last 15 minutes.
              </p>
            </VectorCard>

            {pendingConsensusReadings.length > 0 && (
              <div className="p-3.5 bg-paper-50 dark:bg-night-850 border border-olive-500/40 rounded-xl font-mono text-xs space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-olive-800 dark:text-olive-300 font-semibold">
                  <Radio className="w-4 h-4 text-olive-600 dark:text-lime-400 animate-pulse" />
                  <span>{pendingConsensusReadings.length} Noise Exceedance Sample(s) Saved · Awaiting Peer Corroboration</span>
                </div>
                <p className="text-stone-600 dark:text-night-muted text-[11px] leading-relaxed">
                  Your submitted readings are safely stored in local memory and mapped on radar. Under CPCB statutory evidence rules, confirmed legal incidents require consensus from at least 3 distinct citizen nodes in the same grid sector.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {pendingConsensusReadings.slice(0, 2).map((r) => (
                    <div key={r.id} className="p-2.5 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border flex justify-between items-center text-[11px]">
                      <div>
                        <span className="text-forest-800 dark:text-lime-300 font-bold">{r.db_avg.toFixed(1)} dB</span>
                        <span className="text-stone-600 dark:text-night-muted ml-1.5 capitalize font-medium">({r.source_type})</span>
                      </div>
                      <span className="text-stone-500 dark:text-night-muted text-[10px]">Sector {r.grid_id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {filterTab === 'hotspots' && (
          <div className="space-y-4">
            {incidents.map((inc) => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                onGenerateComplaint={onGenerateComplaint}
                onViewOnMap={onViewOnMap}
              />
            ))}
          </div>
        )}

        {filterTab === 'resolved' && (
          <VectorCard
            label="HISTORICAL AUDIT LOG"
            tag="RESOLVED EVENTS"
            variant="default"
            className="text-center py-10 space-y-2 font-mono text-xs text-stone-600 dark:text-night-muted shadow-sm"
          >
            <CheckCircle className="w-8 h-8 text-forest-700 dark:text-lime-400 mx-auto" />
            <p>Historical resolved events are archived and available for municipal reporting.</p>
          </VectorCard>
        )}
      </div>
    </div>
  );
};
