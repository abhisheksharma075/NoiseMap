import React from 'react';
import { NoiseReading, NoiseIncident } from '../../types';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { Clock, Users, ShieldAlert, FileText, X, CheckCircle2 } from 'lucide-react';
import { LiveGridActivity, NoiseActivityLifecycleService } from '../../services/noiseActivityLifecycleService';

export interface NodePopupDetailsProps {
  reading?: NoiseReading;
  incident?: NoiseIncident;
  activity?: LiveGridActivity;
  onClose: () => void;
  onGenerateComplaint?: (incident: NoiseIncident) => void;
}

export const NodePopupDetails: React.FC<NodePopupDetailsProps> = ({
  reading,
  incident,
  activity,
  onClose,
  onGenerateComplaint,
}) => {
  if (!reading && !incident && !activity) return null;

  const targetReading = reading || activity?.latestReading;
  const isIncident = !!incident;
  const avgDb = incident ? incident.avg_db : targetReading!.db_avg;
  const peakDb = incident ? incident.peak_db : targetReading!.db_peak;
  const source = incident ? incident.dominant_source : targetReading!.source_type;
  const gridId = incident ? incident.grid_id : targetReading!.grid_id;

  // Observation age calculation
  const rawTimestamp = incident ? (incident.last_seen_at || incident.created_at) : targetReading?.created_at;
  const ageMinutes = activity
    ? activity.ageMinutes
    : NoiseActivityLifecycleService.getMeasurementAgeMinutes(rawTimestamp);

  const formatAge = (min: number): string => {
    if (!Number.isFinite(min) || min === Infinity) return 'Unknown age';
    if (min < 1) return 'Just now (<1 min ago)';
    if (min < 60) return `${Math.round(min)} min${Math.round(min) === 1 ? '' : 's'} ago`;
    if (min < 1440) {
      const h = Math.floor(min / 60);
      const m = Math.round(min % 60);
      return `${h}h ${m}m ago`;
    }
    const d = Math.floor(min / 1440);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  };

  const formattedTime = rawTimestamp
    ? new Date(rawTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Unknown time';

  const activityState = activity?.activityState || (
    isIncident
      ? incident.status
      : (ageMinutes <= 15 ? (avgDb >= 68 ? 'active' : 'quiet') : 'stale')
  );

  const getSeverity = (db: number) => {
    if (db < 50) return { label: 'Compliant (Safe Zone)', color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' };
    if (db < 68) return { label: 'Moderate Ambient', color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' };
    if (db < 85) return { label: 'Active Noise Breach', color: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/40' };
    return { label: 'Severe CPCB Breach', color: 'text-rose-600 dark:text-rose-400', border: 'border-rose-600/50' };
  };

  const severity = getSeverity(avgDb);

  return (
    <div className="absolute top-16 right-4 sm:right-6 z-[1000] w-[90%] max-w-sm animate-in fade-in slide-in-from-right-4 duration-200">
      <VectorCard
        label={isIncident ? "VERIFIED CIVIC INCIDENT" : "ACOUSTIC SENSOR NODE"}
        tag={isIncident ? (incident.status === 'resolved' ? "RESOLVED INCIDENT" : "3+ CITIZEN NODES") : "INDICATIVE SCREENING"}
        variant={isIncident ? (incident.status === 'resolved' ? "forest" : "terracotta") : (activityState === 'active' ? "terracotta" : "forest")}
        className="space-y-4 shadow-2xl bg-paper dark:bg-night-card border border-paper-border dark:border-night-border"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-500 hover:text-graphite-900 dark:hover:text-night-text p-1 rounded-md hover:bg-paper-200 dark:hover:bg-night-surface transition-colors"
          title="Dismiss Details"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lifecycle Status Pill */}
        <div className="flex items-center gap-2">
          {activityState === 'active' ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              ACTIVE NOISE (≥68 dB)
            </span>
          ) : activityState === 'quiet' ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              QUIET &amp; SAFE (&lt;68 dB)
            </span>
          ) : activityState === 'resolved' ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/30">
              <CheckCircle2 className="w-3 h-3 text-slate-400" />
              RESOLVED INCIDENT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/20">
              <Clock className="w-3 h-3 text-slate-400" />
              STALE OBSERVATION (&gt;15m)
            </span>
          )}

          <span className="text-[10px] font-mono text-stone-500 dark:text-slate-400 ml-auto flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400 dark:text-slate-500" />
            {formatAge(ageMinutes)}
          </span>
        </div>

        {/* Header metrics */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono ${severity.color}`}>
                {avgDb.toFixed(1)} <span className="text-sm font-mono font-normal">dB</span>
              </span>
              <span className="text-[11px] font-mono text-stone-500 dark:text-night-muted">
                Peak: <strong className="text-terracotta dark:text-rose-400">{peakDb.toFixed(1)} dB</strong>
              </span>
            </div>
            <p className={`text-xs font-mono font-semibold ${severity.color} mt-0.5`}>
              {severity.label}
            </p>
          </div>

          {isIncident && incident.evidence_score && (
            <div className="px-2 py-1 rounded-lg bg-terracotta-50 dark:bg-rose-950/40 border border-terracotta-300 dark:border-rose-800/60 text-right">
              <span className="text-[9px] font-mono text-stone-500 dark:text-night-muted block uppercase font-semibold">CONFIDENCE</span>
              <span className="text-xs font-mono font-bold text-terracotta dark:text-rose-300">
                {incident.evidence_score.toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* Confidence progress bar for corroborated incidents */}
        {isIncident && incident.evidence_score && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-stone-500 dark:text-night-muted">
              <span>EVIDENCE CONSENSUS SCORE</span>
              <span className="font-semibold text-graphite dark:text-night-text">{incident.evidence_score.toFixed(0)} / 100</span>
            </div>
            <div className="w-full h-1.5 bg-paper-200 dark:bg-night-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(incident.evidence_score, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Grid and details list */}
        <div className="space-y-2 p-3 bg-paper-100 dark:bg-night-surface rounded-xl border border-paper-border dark:border-night-border font-mono text-xs">
          <div className="flex justify-between text-stone-600 dark:text-night-muted">
            <span>SECTOR GRID ID:</span>
            <span className="text-graphite-900 dark:text-night-text font-semibold">{gridId}</span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-night-muted">
            <span>MEASURED AT:</span>
            <span className="text-graphite-900 dark:text-night-text font-medium">{formattedTime}</span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-night-muted">
            <span>DOMINANT SOURCE:</span>
            <span className="text-forest-700 dark:text-teal-signal capitalize font-semibold">{source}</span>
          </div>
          <div className="flex justify-between text-stone-600 dark:text-night-muted">
            <span>DATA PROVENANCE:</span>
            <span className="text-graphite-900 dark:text-night-text font-medium text-[11px]">
              {isIncident ? 'Multi-Device Consensus' : 'Indicative Phone Sensor'}
            </span>
          </div>
          {activity && activity.totalObservations > 1 && (
            <div className="flex justify-between text-stone-600 dark:text-night-muted">
              <span>READING SAMPLES:</span>
              <span className="text-forest-800 dark:text-teal-signal font-semibold">
                {activity.totalObservations} readings recorded
              </span>
            </div>
          )}
          {isIncident && (
            <>
              <div className="flex justify-between text-stone-600 dark:text-night-muted">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-forest-700 dark:text-teal-signal" /> VERIFYING NODES:
                </span>
                <span className="text-forest-800 dark:text-teal-signal font-bold">{incident.unique_users} Citizen Devices</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-night-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-olive-700 dark:text-amber-400" /> DURATION:
                </span>
                <span className="text-graphite-800 dark:text-night-text font-semibold">{incident.duration_min.toFixed(0)} min</span>
              </div>
            </>
          )}
        </div>

        {/* CPCB Regulatory note */}
        <div className="p-2.5 rounded-lg bg-paper-100 dark:bg-night-surface border border-paper-border dark:border-night-border text-[10px] font-mono text-stone-600 dark:text-night-muted flex items-start gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-terracotta dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <span>
            CPCB daytime residential threshold is <strong>55 dB</strong>. Current delta: <strong className={avgDb > 55 ? "text-terracotta dark:text-rose-400" : "text-emerald-600 dark:text-teal-signal"}>
              {avgDb > 55 ? `+${(avgDb - 55).toFixed(1)} dB (Exceeded)` : `${(avgDb - 55).toFixed(1)} dB (Compliant)`}
            </strong>
          </span>
        </div>

        {/* Action Button */}
        {isIncident && incident.status === 'active' ? (
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
