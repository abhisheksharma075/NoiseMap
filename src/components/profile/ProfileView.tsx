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
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  pins,
  onUpdatePins,
  streak,
}) => {
  const [sessionId, setSessionId] = useState<string>(() =>
    locationService.getOrCreateSessionId()
  );

  const handleRegenerateSession = () => {
    localStorage.removeItem('noisemap_anon_session_token');
    const newId = locationService.getOrCreateSessionId();
    setSessionId(newId);
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Anonymous Civic Identity Security HUD */}
      <VectorCard
        label="EPHEMERAL CIVIC IDENTITY [CRYPTO RANDOM]"
        tag="100% ANONYMOUS"
        variant="emerald"
        className="space-y-4 font-mono text-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center">
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">LOCAL SESSION TOKEN:</span>
              <span className="text-sm font-bold text-white tracking-wider font-mono">
                {sessionId}
              </span>
            </div>
          </div>

          <TactileButton
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={handleRegenerateSession}
          >
            ROTATE SESSION ID
          </TactileButton>
        </div>

        <div className="p-2.5 bg-slate-950/80 rounded border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            This random token verifies independent contributor consensus without ever asking for your name, phone number, email, or device IMEI. You can rotate or flush this identity anytime.
          </span>
        </div>
      </VectorCard>

      {/* 24-Hour Diurnal Timeline Analytics */}
      <NoiseTimelineChart />

      {/* Civic Badges and Streak Rewards */}
      <BadgeDisplay streak={streak} />

      {/* Geofenced Monitored Sensitive Alert Pins */}
      <AlertPinsPanel pins={pins} onUpdatePins={onUpdatePins} />
    </div>
  );
};
