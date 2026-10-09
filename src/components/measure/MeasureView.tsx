import React, { useState } from 'react';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { CircularNoiseGauge } from './CircularNoiseGauge';
import { LiveWaveformVisualizer } from './LiveWaveformVisualizer';
import { SourceTaggerModal } from './SourceTaggerModal';
import { useAudioCapture } from '../../hooks/useAudioCapture';
import { NoiseSourceType, NoiseZoneType, NoiseReading } from '../../types';
import { Mic, Square, Shield, Info, CheckCircle2 } from 'lucide-react';
import { locationService } from '../../services/locationService';

interface MeasureViewProps {
  onReadingSubmitted?: (reading: NoiseReading) => void;
  onViewMap?: () => void;
}

export const MeasureView: React.FC<MeasureViewProps> = ({
  onReadingSubmitted,
  onViewMap,
}) => {
  const {
    isSampling,
    isComplete,
    countdown,
    instantDb,
    avgDb,
    peakDb,
    analyserNode,
    location,
    error,
    permissionDenied,
    startSampling,
    stopSampling,
    reset,
  } = useAudioCapture();

  const [showTagger, setShowTagger] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  // When 10s sampling finishes automatically, display source tagger
  React.useEffect(() => {
    if (isComplete && avgDb > 0 && !submissionSuccess) {
      setShowTagger(true);
    }
  }, [isComplete, avgDb, submissionSuccess]);

  const handleConfirmSubmission = (source: NoiseSourceType, zone: NoiseZoneType) => {
    const reading: NoiseReading = {
      id: crypto.randomUUID(),
      session_id: locationService.getOrCreateSessionId(),
      lat: location?.lat || 26.144,
      lng: location?.lng || 91.736,
      grid_id: location?.grid_id || '26.144_91.736',
      db_avg: avgDb,
      db_peak: peakDb,
      source_type: source,
      zone_type: zone,
      created_at: new Date().toISOString(),
    };

    if (onReadingSubmitted) {
      onReadingSubmitted(reading);
    }

    setShowTagger(false);
    setSubmissionSuccess(true);
  };

  const handleResetForNewSample = () => {
    setSubmissionSuccess(false);
    reset();
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <VectorCard
        label="ACOUSTIC SENSORY NODE [MEASURE]"
        tag={isSampling ? "SAMPLING AUDIO" : "IDLE / STANDBY"}
        variant={isSampling ? "amber" : "cyan"}
        className="space-y-6"
      >
        {/* Header telemetry text */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isSampling ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'}`}></span>
            {isSampling ? `SAMPLING ACTIVE: ${countdown}s` : '1-TAP AMBIENT SAMPLING'}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            Citizen Acoustic Sensor
          </h2>
          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
            All decibel processing occurs entirely in transient memory via the Web Audio API. Zero audio leaves your phone.
          </p>
        </div>

        {/* Circular SVG Vector Gauge */}
        <div className="flex justify-center py-2">
          <CircularNoiseGauge
            decibels={isSampling ? instantDb : avgDb > 0 ? avgDb : 0}
            peakDb={peakDb}
            isSampling={isSampling}
            countdown={countdown}
          />
        </div>

        {/* Live CRT Phosphor Oscilloscope Waveform */}
        <LiveWaveformVisualizer
          analyserNode={analyserNode}
          isActive={isSampling}
        />

        {/* Error / Permission Banner */}
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-xs font-mono text-rose-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{permissionDenied ? "Microphone Access Denied" : "Hardware Audio Error"}</p>
              <p className="text-slate-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Submission Confirmation Notification */}
        {submissionSuccess && (
          <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl font-mono text-xs text-emerald-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Sample Submitted to Grid!</p>
                <p className="text-slate-400 text-[11px]">Aggregated anonymously at ~100m cell: {location?.grid_id}</p>
              </div>
            </div>
            <TactileButton
              variant="emerald"
              size="sm"
              onClick={handleResetForNewSample}
            >
              NEW SAMPLE
            </TactileButton>
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          {!isSampling ? (
            <TactileButton
              variant="cyan"
              size="lg"
              icon={<Mic className="w-5 h-5 text-cyan-400" />}
              className="flex-1"
              onClick={startSampling}
            >
              START 10-SEC SAMPLE
            </TactileButton>
          ) : (
            <TactileButton
              variant="crimson"
              size="lg"
              icon={<Square className="w-5 h-5 text-rose-400" />}
              className="flex-1"
              onClick={stopSampling}
            >
              ABORT SAMPLING
            </TactileButton>
          )}

          {onViewMap && (
            <TactileButton
              variant="amber"
              size="lg"
              onClick={onViewMap}
            >
              LIVE MAP
            </TactileButton>
          )}
        </div>

        {/* Scientific Honesty & Mathematical Privacy Disclaimer */}
        <div className="p-3 bg-slate-900/60 border border-white/5 rounded-lg font-mono text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>SCIENTIFIC HONESTY & PRIVACY NOTICE</span>
          </div>
          <p>
            • Coordinates rounded to 3 decimals (~100m). Raw coordinates never leave client RAM.
          </p>
          <p>
            • Smartphones are uncalibrated ambient sensors. NoiseMap records crowdsourced relative acoustic estimates, not certified Type-1 SPL data.
          </p>
        </div>
      </VectorCard>

      {/* Source Tagger Modal */}
      {showTagger && (
        <SourceTaggerModal
          avgDb={avgDb}
          peakDb={peakDb}
          gridId={location?.grid_id || 'AUTO_GRID'}
          onConfirm={handleConfirmSubmission}
          onCancel={() => {
            setShowTagger(false);
            reset();
          }}
        />
      )}
    </div>
  );
};
