import React, { useState } from 'react';
import { NoiseIncident } from '../../types';
import { IncidentCard } from './IncidentCard';
import { VectorCard } from '../common/VectorCard';
import { AlertTriangle, Flame, CheckCircle, ShieldCheck } from 'lucide-react';

interface IncidentsViewProps {
  incidents: NoiseIncident[];
  onGenerateComplaint?: (incident: NoiseIncident) => void;
  onViewOnMap?: (incident: NoiseIncident) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onGenerateComplaint,
  onViewOnMap,
}) => {
  const [filterTab, setFilterTab] = useState<'active' | 'hotspots' | 'resolved'>('active');

  const activeIncidents = incidents.filter((i) => i.status === 'active');

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surface/90 border border-white/10 rounded-xl font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-wider">
              VERIFIED NOISE INCIDENTS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-300 font-bold">
              {activeIncidents.length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Corroborated peer evidence engine · Eliminating single-user bias
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setFilterTab('active')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
              filterTab === 'active'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active ({activeIncidents.length})</span>
          </button>
          <button
            onClick={() => setFilterTab('hotspots')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
              filterTab === 'hotspots'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Hotspots</span>
          </button>
          <button
            onClick={() => setFilterTab('resolved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
              filterTab === 'resolved'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
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
          <VectorCard
            label="INCIDENT SENSOR LOG"
            tag="ZERO ACTIVE HAZARDS"
            variant="emerald"
            className="text-center py-12 space-y-3 font-mono"
          >
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Grid Operating Within CPCB Limits</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No continuous clusters exceeding statutory thresholds detected in your sector over the last 15 minutes.
            </p>
          </VectorCard>
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
            className="text-center py-10 space-y-2 font-mono text-xs text-slate-400"
          >
            <CheckCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <p>Historical resolved events are archived and available for municipal reporting.</p>
          </VectorCard>
        )}
      </div>
    </div>
  );
};
