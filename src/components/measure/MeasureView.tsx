import React, { useState } from 'react';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { CircularNoiseGauge } from './CircularNoiseGauge';
import { LiveWaveformVisualizer } from './LiveWaveformVisualizer';
import { SourceTaggerModal } from './SourceTaggerModal';
import { FieldGuideAvatar } from '../common/FieldGuideAvatar';
import { useAudioCapture } from '../../hooks/useAudioCapture';
import { NoiseSourceType, NoiseZoneType, NoiseReading } from '../../types';
import { Mic, Square, Shield, Info, CheckCircle2, Map } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [capturedSample, setCapturedSample] = useState<{ avgDb: number; peakDb: number } | null>(null);
  const [silentSampleError, setSilentSampleError] = useState<string | null>(null);

  // When 10s sampling finishes automatically, handle metrics
  React.useEffect(() => {
    if (isComplete && !submissionSuccess) {
      if (avgDb > 0) {
        setCapturedSample({ avgDb, peakDb });
        setSilentSampleError(null);
        setShowTagger(true);
      } else {
        setSilentSampleError("No acoustic signal detected from your microphone. Please verify microphone hardware and browser permissions, then try again.");
      }
    }
  }, [isComplete, avgDb, peakDb, submissionSuccess]);

  const handleConfirmSubmission = async (source: NoiseSourceType, zone: NoiseZoneType) => {
    const finalAvg = capturedSample?.avgDb ?? avgDb;
    const finalPeak = capturedSample?.peakDb ?? peakDb;

    if (!finalAvg || finalAvg <= 0) {
      throw new Error("Cannot submit sample with 0 dB level.");
    }

    setIsSubmitting(true);
    try {
      const reading: NoiseReading = {
        id: crypto.randomUUID(),
        session_id: locationService.getOrCreateSessionId(),
        lat: location?.lat || 26.144,
        lng: location?.lng || 91.736,
        grid_id: location?.grid_id || '26.144_91.736',
        db_avg: finalAvg,
        db_peak: finalPeak,
        source_type: source,
        zone_type: zone,
        created_at: new Date().toISOString(),
      };

      if (onReadingSubmitted) {
        await onReadingSubmitted(reading);
      }

      setShowTagger(false);
      setSubmissionSuccess(true);
    } catch (err) {
      console.error('[MeasureView] Error submitting reading:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNewSample = () => {
    setSubmissionSuccess(false);
    reset();
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <VectorCard
        label="FIELD ACOUSTIC INSTRUMENT [MEASURE]"
        tag={isSampling ? "SAMPLING 10s" : "STANDBY · READY"}
        variant={isSampling ? "terracotta" : "forest"}
        className="space-y-6"
      >
        {/* Header telemetry text */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-subtle dark:bg-forest/25 border border-forest/20 text-forest dark:text-lime-signal text-xs font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isSampling ? 'bg-terracotta animate-ping' : 'bg-forest dark:bg-lime-signal'}`}></span>
            {isSampling ? `SAMPLING ACTIVE: ${countdown}s REMAINING` : '1-TAP AMBIENT FIELD MEASUREMENT'}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-graphite dark:text-night-text font-sans">
            Citizen Acoustic Sensor
          </h2>
          <p className="text-xs text-graphite-secondary dark:text-night-secondary font-sans max-w-md mx-auto">
            All decibel mathematics execute strictly in transient browser RAM. Zero raw audio recordings ever leave your device.
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

        {/* Live CRT Oscilloscope Waveform */}
        <LiveWaveformVisualizer
          analyserNode={analyserNode}
          isActive={isSampling}
        />

        {/* Error / Permission Banner */}
        {(error || silentSampleError) && (
          <div className="p-3.5 bg-terracotta-subtle dark:bg-terracotta/20 border border-terracotta/30 rounded-xl text-xs font-mono text-terracotta dark:text-[#E2886A] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {permissionDenied
                  ? "Microphone Access Denied"
                  : silentSampleError
                  ? "Zero Audio Signal Detected"
                  : "Hardware Audio Error"}
              </p>
              <p className="text-graphite-secondary dark:text-night-secondary mt-0.5">{error || silentSampleError}</p>
            </div>
          </div>
        )}

        {/* Submission Confirmation Notification */}
        {submissionSuccess && (
          <div className="p-4 bg-forest-subtle dark:bg-forest/20 border border-forest/30 dark:border-forest/50 rounded-2xl font-mono text-xs text-forest dark:text-lime-signal flex items-center justify-between gap-3 shadow-field">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-forest dark:text-lime-signal flex-shrink-0" />
              <div>
                <p className="font-bold text-graphite dark:text-night-text font-sans text-sm">Sample Submitted to Sensor Grid!</p>
                <p className="text-graphite-secondary dark:text-night-secondary text-[11px]">Aggregated anonymously in ~100m sector: {location?.grid_id}</p>
              </div>
            </div>
            <TactileButton
              variant="forest"
              size="sm"
              onClick={handleResetForNewSample}
            >
              NEW SAMPLE
            </TactileButton>
          </div>
        )}

        {/* Primary Controls (48px Touch Targets) */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          {!isSampling ? (
            <TactileButton
              variant="forest"
              size="lg"
              icon={<Mic className="w-5 h-5 text-lime-signal" />}
              className="flex-1 shadow-field"
              onClick={() => {
                setSilentSampleError(null);
                startSampling();
              }}
            >
              START 10-SEC SAMPLE
            </TactileButton>
          ) : (
            <TactileButton
              variant="terracotta"
              size="lg"
              icon={<Square className="w-5 h-5 text-white" />}
              className="flex-1 shadow-field"
              onClick={stopSampling}
            >
              ABORT SAMPLING
            </TactileButton>
          )}

          {onViewMap && (
            <TactileButton
              variant="paper"
              size="lg"
              icon={<Map className="w-4 h-4 text-forest dark:text-lime-signal" />}
              onClick={onViewMap}
            >
              LIVE MAP
            </TactileButton>
          )}
        </div>

        {/* The Field Guide Companion reacting to sampling state */}
        <FieldGuideAvatar
          mood={
            isSampling
              ? 'listening'
              : submissionSuccess
              ? 'submitted'
              : avgDb > 75
              ? 'warning'
              : 'idle'
          }
        />

        {/* Scientific Honesty & Mathematical Privacy Disclaimer */}
        <div className="p-3.5 bg-paper dark:bg-night-bg border border-paper-border dark:border-night-border rounded-xl font-mono text-[11px] text-graphite-secondary dark:text-night-secondary space-y-1">
          <div className="flex items-center gap-1.5 text-graphite dark:text-night-text font-semibold">
            <Shield className="w-3.5 h-3.5 text-forest dark:text-lime-signal" />
            <span>SCIENTIFIC HONESTY & PRIVACY NOTICE</span>
          </div>
          <p>
            • Coordinates rounded to 3 decimals (~100m). Raw coordinates never leave client RAM.
          </p>
          <p>
            • Smartphones are consumer acoustic sensors. NoiseMap records crowdsourced relative estimates, not certified Type-1 laboratory SPL data.
          </p>
        </div>
      </VectorCard>

      {/* Source Tagger Modal / Bottom Sheet */}
      {showTagger && (
        <SourceTaggerModal
          avgDb={capturedSample?.avgDb ?? avgDb}
          peakDb={capturedSample?.peakDb ?? peakDb}
          gridId={location?.grid_id || 'AUTO_GRID'}
          onConfirm={handleConfirmSubmission}
          onCancel={() => {
            setShowTagger(false);
            setCapturedSample(null);
            reset();
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
