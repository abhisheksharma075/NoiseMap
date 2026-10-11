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
      variant={isHighSeverity ? 'terracotta' : 'olive'}
      className="space-y-4 shadow-md"
    >
      {/* Header telemetry metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-serif text-graphite-900 dark:text-night-text">
              {incident.avg_db.toFixed(1)} <span className="text-sm font-mono font-normal text-stone-500 dark:text-night-muted">dB(A)</span>
            </span>
            <span className="text-xs font-mono text-terracotta-600 dark:text-terracotta-400 font-semibold">
              Peak: <strong>{incident.peak_db.toFixed(1)} dB</strong>
            </span>
          </div>
          <p className="text-xs font-mono text-graphite-700 dark:text-night-muted mt-0.5">
            {incident.location_name} · Sector <strong className="text-forest-800 dark:text-lime-300">{incident.grid_id}</strong>
          </p>
        </div>

        {/* Source and duration pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border text-forest-800 dark:text-lime-300 capitalize font-medium">
            {incident.dominant_source}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border text-olive-800 dark:text-olive-300 font-medium">
            <Clock className="w-3 h-3 text-olive-600 dark:text-lime-400" />
            {incident.duration_min.toFixed(0)}m duration
          </span>
        </div>
      </div>

      {/* Algorithmic Verification Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-paper-100 dark:bg-night-900 rounded-lg border border-paper-border dark:border-night-border font-mono text-xs">
        <div className="flex items-center gap-1.5 text-forest-700 dark:text-lime-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>~100m Grid Proximity</span>
        </div>
        <div className="flex items-center gap-1.5 text-forest-700 dark:text-lime-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>15-min Temporal Window</span>
        </div>
        <div className="flex items-center gap-1.5 text-forest-700 dark:text-lime-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{incident.unique_users}+ Independent Devices</span>
        </div>
      </div>

      {/* Mathematical Confidence Progress Bar */}
      <EvidenceScoreBar score={incident.evidence_score} />

      {/* Statutory breach citation */}
      <div className="p-2.5 bg-terracotta-50 dark:bg-night-900 border border-terracotta-300 dark:border-terracotta-700 rounded-lg font-mono text-xs text-terracotta-900 dark:text-terracotta-200 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400 flex-shrink-0 mt-0.5" />
        <div>
          <span>
            Breaches CPCB 2000 Statutory Residential Threshold by{' '}
            <strong className="text-terracotta-700 dark:text-terracotta-300 font-bold">+{(incident.avg_db - 55 > 0 ? (incident.avg_db - 55).toFixed(1) : 0)} dB</strong>.
          </span>
          <p className="text-[11px] text-stone-600 dark:text-night-muted mt-0.5">
            Corroborated by {incident.reading_count} citizen samples from {incident.unique_users} independent nodes.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1 font-mono">
        <TactileButton
          variant="terracotta"
          size="sm"
          className="flex-1"
          icon={<FileText className="w-4 h-4 text-paper-50" />}
          onClick={() => onGenerateComplaint && onGenerateComplaint(incident)}
        >
          GENERATE CPCB COMPLAINT PDF
        </TactileButton>

        {onViewOnMap && (
          <TactileButton
            variant="forest"
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
