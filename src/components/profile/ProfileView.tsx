import React, { useState } from 'react';
import { UserPin, UserStreak } from '../../types';
import { AlertPinsPanel } from './AlertPinsPanel';
import { BadgeDisplay } from './BadgeDisplay';
import { NoiseTimelineChart } from '../analytics/NoiseTimelineChart';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { ShieldCheck, RefreshCw, Key } from 'lucide-react';
import { locationService } from '../../services/locationService';

interface ProfileViewProps {
  pins: UserPin[];
  onUpdatePins: (pins: UserPin[]) => void;
  streak: UserStreak;
  readings?: import('../../types').NoiseReading[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  pins,
  onUpdatePins,
  streak,
  readings = [],
}) => {
  const [sessionId, setSessionId] = useState<string>(() =>
    locationService.getOrCreateSessionId()
  );

  const handleRegenerateSession = () => {
    localStorage.removeItem('noisemap_anon_session_token');
    const newId = locationService.getOrCreateSessionId();
    setSessionId(newId);
  };

  const userReadings = React.useMemo(() => {
    return readings.filter((r) => r.session_id === sessionId);
  }, [readings, sessionId]);

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Anonymous Civic Identity Security HUD */}
      <VectorCard
        label="EPHEMERAL CIVIC IDENTITY · CRYPTOGRAPHIC TOKEN"
        tag="100% ANONYMOUS"
        variant="forest"
        className="space-y-4 font-mono text-xs shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border flex items-center justify-center flex-shrink-0">
              <Key className="w-5 h-5 text-forest-700 dark:text-lime-400" />
            </div>
            <div>
              <span className="text-stone-500 dark:text-night-muted text-[11px] block uppercase font-semibold">LOCAL SESSION TOKEN:</span>
              <span className="text-sm font-bold text-graphite-900 dark:text-night-text tracking-wider font-mono">
                {sessionId}
              </span>
            </div>
          </div>

          <TactileButton
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5 text-forest-700 dark:text-lime-400" />}
            onClick={handleRegenerateSession}
          >
            ROTATE SESSION ID
          </TactileButton>
        </div>

        <div className="p-3 bg-paper-100 dark:bg-night-900 rounded-lg border border-paper-border dark:border-night-border text-[11px] text-stone-600 dark:text-night-muted flex items-start gap-2 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-forest-700 dark:text-lime-400 flex-shrink-0 mt-0.5" />
          <span>
            This random cryptographic token verifies independent contributor consensus without ever asking for your name, phone number, email, or device IMEI. You can rotate or flush this identity anytime.
          </span>
        </div>

        {/* Real User Contribution Records */}
        <div className="pt-2 border-t border-paper-border dark:border-night-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-graphite-800 dark:text-night-text font-semibold text-xs">YOUR CONTRIBUTED SAMPLES ({userReadings.length})</span>
            <span className="text-[10px] text-stone-500 dark:text-night-muted uppercase">Synchronized from local storage</span>
          </div>

          {userReadings.length === 0 ? (
            <p className="text-stone-500 dark:text-night-muted text-[11px] italic py-1">
              No samples recorded under this Civic ID yet. Take your first 10-second sample in the Measure tab.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {userReadings.slice(0, 5).map((r) => (
                <div key={r.id} className="p-2.5 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forest-600 dark:bg-lime-400"></span>
                    <span className="font-bold text-graphite-900 dark:text-night-text font-serif">{r.db_avg.toFixed(1)} dB</span>
                    <span className="text-stone-600 dark:text-night-muted capitalize">({r.source_type})</span>
                  </div>
                  <div className="text-stone-500 dark:text-night-muted font-mono text-[10px]">
                    Sector {r.grid_id} · {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {userReadings.length > 5 && (
                <div className="text-[10px] text-stone-500 dark:text-night-muted text-center pt-1 font-medium">
                  + {userReadings.length - 5} earlier contributions archived
                </div>
              )}
            </div>
          )}
        </div>
      </VectorCard>

      {/* 24-Hour Diurnal Timeline Analytics */}
      <NoiseTimelineChart readings={readings} />

      {/* Civic Badges and Streak Rewards */}
      <BadgeDisplay streak={streak} />

      {/* Geofenced Monitored Sensitive Alert Pins */}
      <AlertPinsPanel pins={pins} onUpdatePins={onUpdatePins} />
    </div>
  );
};
