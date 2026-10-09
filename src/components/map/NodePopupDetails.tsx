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
    if (db < 50) return { label: 'Compliant (Safe)', color: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (db < 70) return { label: 'Moderate Noise', color: 'text-amber-400', border: 'border-amber-500/30' };
    if (db < 85) return { label: 'Harmful Violation', color: 'text-orange-400', border: 'border-orange-500/40' };
    return { label: 'Hazardous Spikes', color: 'text-rose-400', border: 'border-rose-500/50' };
  };

  const severity = getSeverity(avgDb);

  return (
    <div className="absolute top-16 right-4 sm:right-6 z-[1000] w-[90%] max-w-sm animate-in fade-in slide-in-from-right-4 duration-200">
      <VectorCard
        label={isIncident ? "VERIFIED CIVIC INCIDENT" : "ACOUSTIC SENSOR NODE"}
        tag={isIncident ? "3+ PEERS VERIFIED" : "SINGLE SAMPLE"}
        variant={isIncident ? "crimson" : "cyan"}
        className="space-y-4 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header metrics */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono ${severity.color}`}>
                {avgDb.toFixed(1)} <span className="text-sm">dB</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Peak: <strong className="text-rose-400">{peakDb.toFixed(1)} dB</strong>
              </span>
            </div>
            <p className={`text-xs font-mono font-medium ${severity.color} mt-0.5`}>
              {severity.label}
            </p>
          </div>

          {isIncident && incident.evidence_score && (
            <div className="px-2 py-1 rounded bg-rose-950/70 border border-rose-500/50 text-right">
              <span className="text-[9px] font-mono text-slate-400 block">CONFIDENCE</span>
              <span className="text-xs font-mono font-bold text-rose-300">
                {incident.evidence_score.toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* Grid and details list */}
        <div className="space-y-2 p-2.5 bg-slate-950/80 rounded-lg border border-white/5 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>GRID LOCATION:</span>
            <span className="text-slate-200 font-semibold">{gridId}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>SOURCE TYPE:</span>
            <span className="text-cyan-300 capitalize">{source}</span>
          </div>
          {isIncident && (
            <>
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" /> CONTRIBUTORS:
                </span>
                <span className="text-cyan-300 font-bold">{incident.unique_users} Citizen Devices</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> DURATION:
                </span>
                <span className="text-amber-300">{incident.duration_min.toFixed(0)} min</span>
              </div>
            </>
          )}
        </div>

        {/* CPCB Regulatory note */}
        <div className="p-2 rounded bg-slate-900/60 border border-white/5 text-[10px] font-mono text-slate-400 flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            Exceeds CPCB daytime residential limit (55 dB) by <strong>+{(avgDb - 55 > 0 ? (avgDb - 55).toFixed(1) : 0)} dB</strong>.
          </span>
        </div>

        {/* Action Button */}
        {isIncident ? (
          <TactileButton
            variant="crimson"
            size="sm"
            className="w-full"
            icon={<FileText className="w-4 h-4 text-rose-300" />}
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
