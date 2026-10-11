import React, { useState } from 'react';
import { UserPin, UserStreak, NoiseReading } from '../../types';
import { AlertPinsPanel } from './AlertPinsPanel';
import { BadgeDisplay } from './BadgeDisplay';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import {
  ShieldCheck,
  RefreshCw,
  Key,
  Mic,
  Activity,
  ChevronDown,
  ChevronUp,
  MapPin,
  Settings,
} from 'lucide-react';
import { locationService } from '../../services/locationService';
import { soundFeedback } from '../../services/soundFeedbackService';

interface ProfileViewProps {
  pins: UserPin[];
  onUpdatePins: (pins: UserPin[]) => void;
  streak: UserStreak;
  readings?: NoiseReading[];
}

/**
 * Simplified, Authentic Civic ID Experience:
 * Group 1: Civic Profile & Local Session Identity (Zero-KYC, Rotatable)
 * Group 2: Real Contribution Summary (Derived purely from authentic localStorage readings)
 * Group 3: Recent Activity (Expandable history list with honest empty state)
 * Settings Strip: Tap-sound effects toggle & optional voice feedback
 */
export const ProfileView: React.FC<ProfileViewProps> = ({
  pins,
  onUpdatePins,
  streak,
  readings = [],
}) => {
  const [sessionId, setSessionId] = useState<string>(() =>
    locationService.getOrCreateSessionId()
  );
  const [isActivityExpanded, setIsActivityExpanded] = useState<boolean>(false);
  const [tapSoundsEnabled, setTapSoundsEnabled] = useState<boolean>(() =>
    soundFeedback.isSoundEnabled()
  );
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() =>
    soundFeedback.isVoiceEnabled()
  );

  const handleRegenerateSession = () => {
    localStorage.removeItem('noisemap_anon_session_token');
    const newId = locationService.getOrCreateSessionId();
    setSessionId(newId);
    soundFeedback.playSuccess();
  };

  const handleToggleTapSounds = () => {
    const next = !tapSoundsEnabled;
    setTapSoundsEnabled(next);
    soundFeedback.setSoundEnabled(next);
    if (next) {
      soundFeedback.playTap();
    }
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    soundFeedback.setVoiceEnabled(next);
    if (next) {
      soundFeedback.speakStatus('Voice status announcements enabled');
    }
  };

  // Group readings belonging specifically to this active Civic ID session
  const userReadings = React.useMemo(() => {
    return readings.filter((r) => r.session_id === sessionId);
  }, [readings, sessionId]);

  // Distinct sectors monitored by user
  const monitoredSectorsCount = React.useMemo(() => {
    return new Set(userReadings.map((r) => r.grid_id)).size;
  }, [userReadings]);

  // Average decibels contributed by user
  const averageContributedDb = React.useMemo(() => {
    if (userReadings.length === 0) return 0;
    const sum = userReadings.reduce((acc, r) => acc + r.db_avg, 0);
    return sum / userReadings.length;
  }, [userReadings]);

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* =========================================================================
          GROUP 1 — CIVIC ID PROFILE & IDENTITY
          ========================================================================= */}
      <VectorCard
        label="EPHEMERAL CIVIC ID · ZERO-SURVEILLANCE IDENTITY"
        tag="100% PRIVATE"
        variant="forest"
        className="p-5 sm:p-6 space-y-5 shadow-field"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Field Instrument ID Hex Token */}
            <div className="w-12 h-12 rounded-2xl bg-forest dark:bg-[#1E2B22] border border-forest-border text-lime-signal flex items-center justify-center flex-shrink-0 shadow-sm">
              <Key className="w-6 h-6 text-lime-signal" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-graphite dark:text-night-text font-sans">
                  Anonymous Citizen Sensor
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest-subtle dark:bg-forest/30 border border-forest/30 text-forest dark:text-lime-signal font-semibold">
                  LOCAL ONLY
                </span>
              </div>
              <p className="text-xs text-graphite-secondary dark:text-night-secondary font-mono">
                TOKEN: <strong className="text-graphite dark:text-night-text">{sessionId}</strong>
              </p>
            </div>
          </div>

          <TactileButton
            variant="paper"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5 text-forest dark:text-lime-signal" />}
            onClick={handleRegenerateSession}
            className="w-full sm:w-auto font-sans"
          >
            Rotate Session Token
          </TactileButton>
        </div>

        {/* Authenticity & Privacy Description */}
        <div className="p-3 bg-paper dark:bg-night-bg rounded-xl border border-paper-border dark:border-night-border text-xs text-graphite-secondary dark:text-night-secondary font-mono flex items-start gap-2.5 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-forest dark:text-lime-signal flex-shrink-0 mt-0.5" />
          <span>
            NoiseMap uses cryptographic session rotation to verify independent peer consensus across ~100m sectors. No phone number, email, IMEI, or real-world KYC identity is ever linked.
          </span>
        </div>
      </VectorCard>

      {/* =========================================================================
          GROUP 2 — AUTHENTIC CONTRIBUTION SUMMARY (Derived from real storage)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border shadow-field font-mono">
          <div className="flex items-center justify-between text-xs text-graphite-secondary dark:text-night-secondary mb-1">
            <span>SAMPLES LOGGED</span>
            <Mic className="w-4 h-4 text-forest dark:text-lime-signal" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-graphite dark:text-night-text font-sans">
            {userReadings.length}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-night-muted mt-1">
            {userReadings.length > 0 ? 'Verified in client storage' : 'Zero samples recorded yet'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border shadow-field font-mono">
          <div className="flex items-center justify-between text-xs text-graphite-secondary dark:text-night-secondary mb-1">
            <span>SECTORS MONITORED</span>
            <MapPin className="w-4 h-4 text-olive dark:text-lime-signal" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-graphite dark:text-night-text font-sans">
            {monitoredSectorsCount}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-night-muted mt-1">
            ~100m spatial privacy sectors
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border shadow-field font-mono">
          <div className="flex items-center justify-between text-xs text-graphite-secondary dark:text-night-secondary mb-1">
            <span>AVG CONTRIBUTED SPL</span>
            <Activity className="w-4 h-4 text-terracotta" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-graphite dark:text-night-text font-sans">
            {averageContributedDb > 0 ? `${averageContributedDb.toFixed(1)} dB` : '--.- dB'}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-night-muted mt-1">
            {averageContributedDb > 0 ? 'Integrated Leq energy level' : 'Awaiting first sample'}
          </p>
        </div>
      </div>

      {/* =========================================================================
          GROUP 3 — RECENT ACTIVITY & CONTRIBUTIONS (Honest storage sync)
          ========================================================================= */}
      <VectorCard
        label="RECORDED FIELDWORK SAMPLES"
        tag={`${userReadings.length} ACTIVE IN CURRENT TOKEN`}
        variant="olive"
        className="p-5 sm:p-6 space-y-4 shadow-field"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-graphite dark:text-night-text font-sans">
            Session Acoustic History
          </h3>
          <span className="text-[11px] font-mono text-stone-500 dark:text-night-muted">
            Newest First
          </span>
        </div>

        {userReadings.length === 0 ? (
          <div className="text-center py-6 px-4 bg-paper dark:bg-night-bg rounded-2xl border border-paper-border dark:border-night-border space-y-2">
            <Mic className="w-6 h-6 text-stone-400 mx-auto" />
            <p className="text-xs text-graphite dark:text-night-text font-semibold font-sans">
              No samples recorded under this Civic ID token yet
            </p>
            <p className="text-[11px] text-graphite-secondary dark:text-night-secondary font-mono max-w-sm mx-auto">
              Take your first 10-second measurement on the Measure screen to start populating your anonymous civic contribution record.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Show top 3 or all depending on expansion */}
            {(isActivityExpanded ? userReadings : userReadings.slice(0, 3)).map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    r.db_avg < 50 ? 'bg-forest dark:bg-lime-signal' : r.db_avg < 70 ? 'bg-olive' : 'bg-terracotta'
                  }`} />
                  <div>
                    <span className="font-bold text-graphite dark:text-night-text text-sm">
                      {r.db_avg.toFixed(1)} dB(A)
                    </span>
                    <span className="text-stone-500 dark:text-night-muted ml-2 capitalize font-sans text-xs">
                      • {r.source_type}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-stone-500 dark:text-night-muted">
                  <div>Sector {r.grid_id}</div>
                  <div className="text-[10px]">{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}

            {userReadings.length > 3 && (
              <button
                type="button"
                onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-mono font-semibold text-forest dark:text-lime-signal hover:underline cursor-pointer"
              >
                <span>{isActivityExpanded ? 'Collapse activity history' : `View all ${userReadings.length} contributions`}</span>
                {isActivityExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        )}
      </VectorCard>

      {/* =========================================================================
          CONTROLLER: SOUND & PREFERENCE SETTINGS
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border shadow-field font-mono space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-paper-border dark:border-night-border">
          <div className="flex items-center gap-2 text-xs font-bold text-graphite dark:text-night-text">
            <Settings className="w-4 h-4 text-forest dark:text-lime-signal" />
            <span>INTERFACE AUDIO & ACCESSIBILITY CONTROLS</span>
          </div>
          <span className="text-[10px] text-stone-500 dark:text-night-muted uppercase">Preferences</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Tap Sounds Toggle */}
          <div className="p-3 rounded-xl bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-graphite dark:text-night-text block font-sans">
                Interface Tap Sounds
              </span>
              <span className="text-[10px] text-stone-500 dark:text-night-muted">
                Subtle audible feedback on button interactions
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={tapSoundsEnabled}
              onClick={handleToggleTapSounds}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                tapSoundsEnabled ? 'bg-forest dark:bg-lime-signal justify-end' : 'bg-stone-300 dark:bg-night-border justify-start'
              }`}
            >
              <span className={`w-4 h-4 rounded-full shadow-sm ${
                tapSoundsEnabled ? 'bg-lime-signal dark:bg-forest' : 'bg-white'
              }`} />
            </button>
          </div>

          {/* Voice Feedback Toggle */}
          <div className="p-3 rounded-xl bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-graphite dark:text-night-text block font-sans">
                Voice Status Prompts
              </span>
              <span className="text-[10px] text-stone-500 dark:text-night-muted">
                Spoken confirmation upon sample completion
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={voiceEnabled}
              onClick={handleToggleVoice}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                voiceEnabled ? 'bg-forest dark:bg-lime-signal justify-end' : 'bg-stone-300 dark:bg-night-border justify-start'
              }`}
            >
              <span className={`w-4 h-4 rounded-full shadow-sm ${
                voiceEnabled ? 'bg-lime-signal dark:bg-forest' : 'bg-white'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Civic Badges and Streak Rewards (Preserved) */}
      <BadgeDisplay streak={streak} />

      {/* Geofenced Monitored Sensitive Alert Pins (Preserved) */}
      <AlertPinsPanel pins={pins} onUpdatePins={onUpdatePins} />
    </div>
  );
};
