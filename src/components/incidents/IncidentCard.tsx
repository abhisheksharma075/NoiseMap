import React from 'react';
import { NoiseIncident } from '../../types';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { EvidenceScoreBar } from './EvidenceScoreBar';
import { Clock, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface IncidentCardProps {
  incident: NoiseIncident;
  onGenerateComplaint?: (incident: NoiseIncident) => void;
  onViewOnMap?: (incident: NoiseIncident) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onGenerateComplaint,
  onViewOnMap,
}) => {
  const isHighSeverity = incident.avg_db >= 80;

  return (
    <VectorCard
      label={`VERIFIED INCIDENT #${incident.id.slice(-6).toUpperCase()}`}
      tag={incident.status === 'active' ? 'ACTIVE HAZARD' : 'RESOLVED'}
      variant={isHighSeverity ? 'crimson' : 'amber'}
      className="space-y-4"
    >
      {/* Header telemetry metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {incident.avg_db.toFixed(1)} <span className="text-sm text-slate-400">dB(A)</span>
            </span>
            <span className="text-xs font-mono text-rose-400">
              Peak: <strong>{incident.peak_db.toFixed(1)} dB</strong>
            </span>
          </div>
          <p className="text-xs font-mono text-slate-300 mt-0.5">
            {incident.location_name} · Sector <strong className="text-cyan-300">{incident.grid_id}</strong>
          </p>
        </div>

        {/* Source and duration pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 capitalize">
            {incident.dominant_source}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300">
            <Clock className="w-3 h-3" />
            {incident.duration_min.toFixed(0)}m duration
          </span>
        </div>
      </div>

      {/* Algorithmic Verification Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-slate-950/80 rounded-lg border border-white/5 font-mono text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>~100m Grid Proximity</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>15-min Temporal Window</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{incident.unique_users}+ Independent Devices</span>
        </div>
      </div>

      {/* Mathematical Confidence Progress Bar */}
      <EvidenceScoreBar score={incident.evidence_score} />

      {/* Statutory breach citation */}
      <div className="p-2.5 bg-slate-900/60 border border-white/5 rounded-lg font-mono text-xs text-slate-400 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span>
            Breaches CPCB 2000 Statutory Residential Threshold by{' '}
            <strong className="text-rose-400">+{(incident.avg_db - 55 > 0 ? (incident.avg_db - 55).toFixed(1) : 0)} dB</strong>.
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Corroborated by {incident.reading_count} citizen samples from {incident.unique_users} independent nodes.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1 font-mono">
        <TactileButton
          variant="crimson"
          size="sm"
          className="flex-1"
          icon={<FileText className="w-4 h-4 text-rose-300" />}
          onClick={() => onGenerateComplaint && onGenerateComplaint(incident)}
        >
          GENERATE CPCB COMPLAINT PDF
        </TactileButton>

        {onViewOnMap && (
          <TactileButton
            variant="cyan"
            size="sm"
            onClick={() => onViewOnMap(incident)}
          >
            LOCATE ON RADAR
          </TactileButton>
        )}
      </div>
    </VectorCard>
  );
};
