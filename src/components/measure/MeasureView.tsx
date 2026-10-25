import React, { useState } from 'react';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { CircularNoiseGauge } from './CircularNoiseGauge';
import { LiveWaveformVisualizer } from './LiveWaveformVisualizer';
import { RealTimeSoundSpectrum } from '../audio/RealTimeSoundSpectrum';
import { MicrophonePrivacyIndicator } from '../audio/MicrophonePrivacyIndicator';
import { NoiseEventHistory } from '../audio/NoiseEventHistory';
import { LiveNoiseMeter } from '../audio/LiveNoiseMeter';
import { SourceTaggerModal } from './SourceTaggerModal';
import { FieldGuideAvatar } from '../common/FieldGuideAvatar';
import { useAudioCapture } from '../../hooks/useAudioCapture';
import { NoiseSourceType, NoiseZoneType, NoiseReading } from '../../types';
import { soundFeedback } from '../../services/soundFeedbackService';
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
    privacyState,
    diagnosticInfo,
    spikeEvents,
    clearSpikeEvents,
    startSampling,
    stopSampling,
    reset,
  } = useAudioCapture();

  const [showTagger, setShowTagger] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [capturedSample, setCapturedSample] = useState<{ avgDb: number; peakDb: number } | null>(null);
  const [silentSampleError, setSilentSampleError] = useState<string | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<'spectrum' | 'waveform'>('spectrum');

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
      soundFeedback.playSuccess();
      soundFeedback.speakStatus('Sample successfully submitted to sensor grid');
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
        {/* Real-time Hardware Privacy Transparency Indicator */}
        <MicrophonePrivacyIndicator state={privacyState} />

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

        {/* Circular SVG Vector Gauge with Centered Acoustic Avatar */}
        <div className="flex justify-center py-2">
          <CircularNoiseGauge
            decibels={isSampling ? instantDb : avgDb > 0 ? avgDb : 0}
            instantDb={instantDb}
            peakDb={peakDb}
            isSampling={isSampling}
            countdown={countdown}
            onTapMeasurement={
              !isSampling
                ? () => {
                    setSilentSampleError(null);
                    startSampling();
                  }
                : undefined
            }
          />
        </div>

        {/* Dynamic Linear Decibel Spectrum Bar */}
        <div className="space-y-1.5 px-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-stone-500 dark:text-slate-400">
            <span>ACOUSTIC SPECTRUM:</span>
            <span className="font-bold">
              {isSampling ? `${instantDb.toFixed(1)} dB(A)` : avgDb > 0 ? `${avgDb.toFixed(1)} dB(A)` : 'STANDBY'}
            </span>
          </div>

          <div className="relative h-3 w-full rounded-full overflow-hidden bg-paper-border dark:bg-night-card flex border border-paper-border dark:border-night-border">
            <div className="h-full bg-emerald-500/80" style={{ width: '22%' }} title="Safe / Low (<50 dB)" />
            <div className="h-full bg-amber-500/80" style={{ width: '22%' }} title="Moderate (50-70 dB)" />
            <div className="h-full bg-orange-500/80" style={{ width: '17%' }} title="Harmful (70-85 dB)" />
            <div className="h-full bg-rose-500/80 flex-1" title="Breach (>85 dB)" />

            {/* Indicator Needle */}
            {(isSampling || avgDb > 0) && (
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)] transition-all duration-100 ease-out z-10"
                style={{
                  left: `${Math.min(Math.max(((isSampling ? instantDb : avgDb) - 30) / 90 * 100, 2), 98)}%`,
                }}
              />
            )}
          </div>

          <div className="flex justify-between text-[9px] font-mono text-stone-400 dark:text-slate-500 px-0.5">
            <span>&lt;50 Safe</span>
            <span>50–70 Moderate</span>
            <span>70–85 Harmful</span>
            <span>&gt;85 Breach</span>
          </div>
        </div>

        {/* Live Noise Level Meter with Rolling Trend Sparkline */}
        <LiveNoiseMeter
          instantDb={instantDb}
          avgDb={avgDb}
          peakDb={peakDb}
          isSampling={isSampling}
          countdown={countdown}
          showControls={false}
        />

        {/* Visualizer Mode Selection Tabs */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-500 dark:text-night-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-teal-signal"></span>
            <span>ACOUSTIC ANALYZER ENGINE:</span>
          </div>

          <div className="flex items-center bg-paper-border/40 dark:bg-night-surface p-0.5 rounded-lg border border-paper-border dark:border-night-border font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setVisualizerMode('spectrum')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-semibold ${
                visualizerMode === 'spectrum'
                  ? 'bg-paper dark:bg-night-card text-forest dark:text-teal-signal shadow-sm'
                  : 'text-stone-500 dark:text-night-muted hover:text-graphite dark:hover:text-night-text'
              }`}
            >
              FREQUENCY SPECTRUM (FFT)
            </button>
            <button
              type="button"
              onClick={() => setVisualizerMode('waveform')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-semibold ${
                visualizerMode === 'waveform'
                  ? 'bg-paper dark:bg-night-card text-forest dark:text-teal-signal shadow-sm'
                  : 'text-stone-500 dark:text-night-muted hover:text-graphite dark:hover:text-night-text'
              }`}
            >
              OSCILLOSCOPE (PCM)
            </button>
          </div>
        </div>

        {/* Selected Visualizer Canvas */}
        {visualizerMode === 'spectrum' ? (
          <RealTimeSoundSpectrum
            analyserNode={analyserNode}
            isActive={isSampling}
            permissionDenied={permissionDenied}
            error={error}
          />
        ) : (
          <LiveWaveformVisualizer
            analyserNode={analyserNode}
            isActive={isSampling}
          />
        )}

        {/* Transient Spike Event History Log */}
        <NoiseEventHistory
          events={spikeEvents}
          onClearHistory={clearSpikeEvents}
        />

        {/* Audio Diagnostics & Recovery Guidance */}
        {(error || silentSampleError || diagnosticInfo) && (
          <div className="p-4 bg-terracotta-subtle dark:bg-night-card border border-terracotta/40 dark:border-terracotta/50 rounded-2xl text-xs font-mono text-terracotta dark:text-[#E2886A] space-y-2 shadow-sm">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">
                  {diagnosticInfo?.title ||
                    (permissionDenied
                      ? "Microphone Access Denied"
                      : silentSampleError
                      ? "Zero Audio Signal Detected"
                      : "Hardware Audio Sensor Error")}
                </p>
                <p className="text-graphite-secondary dark:text-night-secondary mt-1 text-[11px] leading-relaxed">
                  {diagnosticInfo?.message || error || silentSampleError}
                </p>
              </div>
            </div>

            {/* Diagnostic Actionable Recovery Guidance */}
            {(diagnosticInfo?.recoveryInstruction || permissionDenied) && (
              <div className="p-3 rounded-xl bg-paper-soft dark:bg-night-surface border border-paper-border dark:border-night-border text-[11px] text-graphite-secondary dark:text-night-secondary space-y-1 mt-2">
                <span className="font-bold text-graphite dark:text-night-text block">Recommended Action:</span>
                <p>{diagnosticInfo?.recoveryInstruction || 'Please allow microphone access in browser settings to continue.'}</p>
                {permissionDenied && (
                  <div className="pt-1 text-[10px] space-y-0.5">
                    <p>• <strong>iOS Safari:</strong> Address bar "aA" → Website Settings → Microphone → "Allow".</p>
                    <p>• <strong>Chrome / Android:</strong> Lock/Tune icon → Permissions → Allow Microphone.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <TactileButton
                variant="terracotta"
                size="sm"
                onClick={() => {
                  setSilentSampleError(null);
                  startSampling();
                }}
              >
                RETRY PERMISSION
              </TactileButton>
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
