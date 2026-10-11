import React from 'react';
import { NoiseReading, NoiseIncident } from '../../types';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { Clock, Users, ShieldAlert, FileText, X } from 'lucide-react';

interface NodePopupDetailsProps {
  reading?: NoiseReading;
  incident?: NoiseIncident;
  onClose: () => void;
  onGenerateComplaint?: (incident: NoiseIncident) => void;
}

export const NodePopupDetails: React.FC<NodePopupDetailsProps> = ({
  reading,
  incident,
  onClose,
  onGenerateComplaint,
}) => {
  if (!reading && !incident) return null;

  const isIncident = !!incident;
  const avgDb = incident ? incident.avg_db : reading!.db_avg;
  const peakDb = incident ? incident.peak_db : reading!.db_peak;
  const source = incident ? incident.dominant_source : reading!.source_type;
  const gridId = incident ? incident.grid_id : reading!.grid_id;

  const getSeverity = (db: number) => {
    if (db < 50) return { label: 'Compliant (Safe)', color: 'text-forest-700 dark:text-lime-400', border: 'border-forest-500/30' };
    if (db < 70) return { label: 'Moderate Ambient', color: 'text-olive-700 dark:text-olive-400', border: 'border-olive-500/30' };
    if (db < 85) return { label: 'Harmful Violation', color: 'text-terracotta-600 dark:text-terracotta-400', border: 'border-terracotta-500/40' };
    return { label: 'Hazardous Spikes', color: 'text-terracotta-700 dark:text-terracotta-300', border: 'border-terracotta-600/50' };
  };

  const severity = getSeverity(avgDb);

  return (
    <div className="absolute top-16 right-4 sm:right-6 z-[1000] w-[90%] max-w-sm animate-in fade-in slide-in-from-right-4 duration-200">
      <VectorCard
        label={isIncident ? "VERIFIED CIVIC INCIDENT" : "ACOUSTIC SENSOR NODE"}
        tag={isIncident ? "3+ PEERS VERIFIED" : "SINGLE SAMPLE"}
        variant={isIncident ? "terracotta" : "forest"}
        className="space-y-4 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-500 hover:text-graphite-900 dark:hover:text-night-text p-1 rounded-md hover:bg-paper-200 dark:hover:bg-night-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header metrics */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-serif ${severity.color}`}>
                {avgDb.toFixed(1)} <span className="text-sm font-mono font-normal">dB</span>
              </span>
              <span className="text-[11px] font-mono text-stone-500 dark:text-night-muted">
                Peak: <strong className="text-terracotta-600 dark:text-terracotta-400">{peakDb.toFixed(1)} dB</strong>
              </span>
            </div>
            <p className={`text-xs font-mono font-semibold ${severity.color} mt-0.5`}>
              {severity.label}
            </p>
          </div>

          {isIncident && incident.evidence_score && (
            <div className="px-2 py-1 rounded-lg bg-terracotta-50 dark:bg-terracotta-950/50 border border-terracotta-300 dark:border-terracotta-700 text-right">
              <span className="text-[9px] font-mono text-stone-500 dark:text-night-muted block uppercase font-semibold">CONFIDENCE</span>
              <span className="text-xs font-mono font-bold text-terracotta-700 dark:text-terracotta-300">
                {incident.evidence_score.toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* Grid and details list */}
        <div className="space-y-2 p-2.5 bg-paper-100 dark:bg-night-900 rounded-lg border border-paper-border dark:border-night-border font-mono text-xs">
          <div className="flex justify-between text-stone-600 dark:text-night-muted">
            <span>GRID LOCATION:</span>
            <span className="text-graphite-900 dark:text-night-text font-semibold">{gridId}</span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-night-muted">
            <span>SOURCE TYPE:</span>
            <span className="text-forest-700 dark:text-lime-400 capitalize font-medium">{source}</span>
          </div>
          {isIncident && (
            <>
              <div className="flex justify-between text-stone-600 dark:text-night-muted">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-forest-700 dark:text-lime-400" /> CONTRIBUTORS:
                </span>
                <span className="text-forest-800 dark:text-lime-300 font-bold">{incident.unique_users} Citizen Devices</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-night-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-olive-700 dark:text-olive-400" /> DURATION:
                </span>
                <span className="text-graphite-800 dark:text-night-text font-semibold">{incident.duration_min.toFixed(0)} min</span>
              </div>
            </>
          )}
        </div>

        {/* CPCB Regulatory note */}
        <div className="p-2 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border text-[10px] font-mono text-stone-600 dark:text-night-muted flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-terracotta-600 dark:text-terracotta-400 flex-shrink-0 mt-0.5" />
          <span>
            Exceeds CPCB daytime residential limit (55 dB) by <strong className="text-terracotta-700 dark:text-terracotta-400">+{(avgDb - 55 > 0 ? (avgDb - 55).toFixed(1) : 0)} dB</strong>.
          </span>
        </div>

        {/* Action Button */}
        {isIncident ? (
          <TactileButton
            variant="terracotta"
            size="sm"
            className="w-full"
            icon={<FileText className="w-4 h-4 text-paper-50" />}
            onClick={() => onGenerateComplaint && onGenerateComplaint(incident)}
          >
            GENERATE CPCB COMPLAINT DOSSIER
          </TactileButton>
        ) : (
          <TactileButton
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={onClose}
          >
            DISMISS TELEMETRY
          </TactileButton>
        )}
      </VectorCard>
    </div>
  );
};
