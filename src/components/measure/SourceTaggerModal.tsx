import React, { useState } from 'react';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { NoiseSourceType, NoiseZoneType } from '../../types';
import {
  Car,
  Hammer,
  Volume2,
  Factory,
  Plane,
  Bell,
  HelpCircle,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

interface SourceTaggerModalProps {
  avgDb: number;
  peakDb: number;
  gridId: string;
  onConfirm: (source: NoiseSourceType, zone: NoiseZoneType) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const SourceTaggerModal: React.FC<SourceTaggerModalProps> = ({
  avgDb,
  peakDb,
  gridId,
  onConfirm,
  onCancel,
  isSubmitting = false,
}) => {
  const [selectedSource, setSelectedSource] = useState<NoiseSourceType>('traffic');
  const [selectedZone, setSelectedZone] = useState<NoiseZoneType>('residential');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const sources: { id: NoiseSourceType; label: string; icon: React.ReactNode }[] = [
    { id: 'traffic', label: 'Traffic & Honking', icon: <Car className="w-4 h-4 text-forest-600 dark:text-lime-400" /> },
    { id: 'construction', label: 'Construction Work', icon: <Hammer className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" /> },
    { id: 'loudspeaker', label: 'Loudspeaker / Events', icon: <Volume2 className="w-4 h-4 text-terracotta-700 dark:text-terracotta-300" /> },
    { id: 'industrial', label: 'Industrial Machinery', icon: <Factory className="w-4 h-4 text-olive-700 dark:text-olive-300" /> },
    { id: 'aircraft', label: 'Aviation / Aircraft', icon: <Plane className="w-4 h-4 text-forest-700 dark:text-forest-300" /> },
    { id: 'siren', label: 'Emergency Sirens', icon: <Bell className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" /> },
    { id: 'unknown', label: 'Unidentified Ambient', icon: <HelpCircle className="w-4 h-4 text-stone-500 dark:text-stone-400" /> },
  ];

  const zones: { id: NoiseZoneType; label: string; dayLimit: string; nightLimit: string }[] = [
    { id: 'residential', label: 'Residential Zone', dayLimit: '55 dB', nightLimit: '45 dB' },
    { id: 'commercial', label: 'Commercial Zone', dayLimit: '65 dB', nightLimit: '55 dB' },
    { id: 'industrial', label: 'Industrial Area', dayLimit: '75 dB', nightLimit: '70 dB' },
    { id: 'silence', label: 'Silence Zone (Hospital/School)', dayLimit: '50 dB', nightLimit: '40 dB' },
  ];

  const handleSubmit = async () => {
    if (!avgDb || avgDb <= 0) {
      setValidationError('Invalid acoustic sample: Decibel level must be greater than 0 dB.');
      return;
    }
    if (!selectedSource) {
      setValidationError('Please select a noise source classification.');
      return;
    }
    if (!selectedZone) {
      setValidationError('Please select a CPCB area zone category.');
      return;
    }

    setValidationError(null);
    try {
      await onConfirm(selectedSource, selectedZone);
    } catch (err) {
      console.error('[SourceTagger] Submission error:', err);
      setValidationError('Submission failed. Your sample is preserved—please try again.');
    }
  };

  const handleDiscardClick = () => {
    setShowDiscardConfirm(true);
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-graphite-950/65 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-lg my-auto max-h-[92vh] max-h-[92dvh] flex flex-col min-h-0 animate-in fade-in zoom-in-95 duration-200">
        <VectorCard
          label="SAMPLE COMPLETED · METRICS CAPTURED"
          tag={isSubmitting ? 'TRANSMITTING...' : 'READY FOR VERIFICATION'}
          variant={isSubmitting ? 'olive' : 'forest'}
          className="flex flex-col max-h-[92vh] max-h-[92dvh] min-h-0 p-4 sm:p-5 overflow-hidden shadow-xl"
        >
          {/* Top Dismiss Button */}
          <button
            onClick={handleDiscardClick}
            disabled={isSubmitting}
            aria-label="Discard Sample"
            className="absolute top-3 right-3 text-stone-500 hover:text-graphite-900 dark:hover:text-night-text p-1.5 rounded-md hover:bg-paper-200 dark:hover:bg-night-800 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Modal Body */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4 overscroll-contain pb-2">
            {/* Summary Metric Strip */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border rounded-lg font-mono text-center">
              <div>
                <span className="text-[10px] text-stone-500 dark:text-night-muted block uppercase tracking-wider font-semibold">Avg Leq</span>
                <span className="text-lg sm:text-xl font-bold text-forest-800 dark:text-lime-300 font-serif">{avgDb.toFixed(1)} <span className="text-xs font-mono font-normal">dB</span></span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 dark:text-night-muted block uppercase tracking-wider font-semibold">Peak Hold</span>
                <span className="text-lg sm:text-xl font-bold text-terracotta-600 dark:text-terracotta-400 font-serif">{peakDb.toFixed(1)} <span className="text-xs font-mono font-normal">dB</span></span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 dark:text-night-muted block uppercase tracking-wider font-semibold">Grid Cell</span>
                <span className="text-[11px] sm:text-xs font-semibold text-graphite-800 dark:text-night-text mt-1 block truncate">
                  {gridId}
                </span>
              </div>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3 bg-terracotta-50 dark:bg-terracotta-950/40 border border-terracotta-500/40 rounded-lg text-terracotta-800 dark:text-terracotta-200 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400 flex-shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Noise Source Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-graphite-800 dark:text-night-text flex items-center justify-between font-semibold">
                <span>01. IDENTIFY ACOUSTIC SOURCE:</span>
                <span className="text-[10px] text-stone-500 dark:text-night-muted font-normal uppercase">Single Selection</span>
              </label>
              <div
                role="radiogroup"
                aria-label="Acoustic noise source selection"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {sources.map((s) => {
                  const isSelected = selectedSource === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedSource(s.id);
                        setValidationError(null);
                      }}
                      className={`relative flex items-center justify-between p-2.5 min-h-[48px] rounded-xl border text-left font-mono text-xs transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-signal ${
                        isSelected
                          ? 'bg-forest text-paper dark:bg-lime-signal dark:text-forest-deep border-2 border-forest dark:border-lime-signal font-bold shadow-sm'
                          : 'bg-paper-50 dark:bg-night-800 border-paper-border dark:border-night-border text-graphite-700 dark:text-night-muted hover:border-forest/60 dark:hover:border-lime-400/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className={`flex-shrink-0 ${isSelected ? 'text-lime-signal dark:text-forest-deep' : ''}`}>
                          {s.icon}
                        </span>
                        <span className="truncate">{s.label}</span>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                          isSelected
                            ? 'bg-lime-signal text-forest-deep dark:bg-forest dark:text-lime-signal scale-100'
                            : 'border border-paper-border dark:border-night-border text-transparent scale-75'
                        }`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area Zone Classification */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-graphite-800 dark:text-night-text flex items-center justify-between font-semibold">
                <span>02. AREA ZONE CLASSIFICATION (CPCB LIMITS):</span>
                <span className="text-[10px] text-stone-500 dark:text-night-muted font-normal uppercase">Statutory Rule</span>
              </label>
              <div
                role="radiogroup"
                aria-label="CPCB area zone classification"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {zones.map((z) => {
                  const isSelected = selectedZone === z.id;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedZone(z.id);
                        setValidationError(null);
                      }}
                      className={`relative flex flex-col justify-between p-2.5 min-h-[56px] rounded-xl border text-left font-mono text-xs transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-signal ${
                        isSelected
                          ? 'bg-forest text-paper dark:bg-lime-signal dark:text-forest-deep border-2 border-forest dark:border-lime-signal shadow-sm font-semibold'
                          : 'bg-paper-50 dark:bg-night-800 border-paper-border dark:border-night-border text-graphite-700 dark:text-night-muted hover:border-forest/60 dark:hover:border-lime-400/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-semibold ${isSelected ? 'text-paper dark:text-forest-deep' : 'text-graphite-900 dark:text-night-text'}`}>
                          {z.label}
                        </span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                            isSelected
                              ? 'bg-lime-signal text-forest-deep dark:bg-forest dark:text-lime-signal font-bold'
                              : 'border border-paper-border dark:border-night-border text-transparent'
                          }`}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      </div>
                      <span className={`text-[10px] mt-1 ${isSelected ? 'text-paper-100/90 dark:text-forest-deep/80' : 'text-stone-500 dark:text-night-muted'}`}>
                        Day: {z.dayLimit} · Night: {z.nightLimit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions Container */}
          <div className="pt-3 mt-1 border-t border-paper-border dark:border-night-border flex-shrink-0">
            {showDiscardConfirm ? (
              <div className="p-3 bg-terracotta-50 dark:bg-night-900 border border-terracotta-300 dark:border-terracotta-700 rounded-lg space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-terracotta-900 dark:text-terracotta-200 font-mono text-xs font-semibold">
                  <Trash2 className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" />
                  <span>Discard this measurement sample?</span>
                </div>
                <p className="text-[11px] font-mono text-graphite-600 dark:text-night-muted leading-relaxed">
                  This will clear the current 10-second audio telemetry. Previous reports and user streaks will remain safe.
                </p>
                <div className="flex gap-2 pt-1">
                  <TactileButton
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowDiscardConfirm(false)}
                  >
                    KEEP SAMPLE
                  </TactileButton>
                  <TactileButton
                    variant="terracotta"
                    size="sm"
                    className="flex-1"
                    onClick={handleConfirmDiscard}
                  >
                    YES, DISCARD
                  </TactileButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <TactileButton
                  variant="ghost"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-3 text-xs sm:text-sm order-2 sm:order-1"
                  onClick={handleDiscardClick}
                >
                  DISCARD SAMPLE
                </TactileButton>
                <TactileButton
                  variant="forest"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-3 text-xs sm:text-sm order-1 sm:order-2"
                  icon={
                    isSubmitting ? (
                      <Loader2 className="w-4 h-4 text-lime-400 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-lime-300" />
                    )
                  }
                  onClick={handleSubmit}
                >
                  {isSubmitting ? 'TRANSMITTING TO GRID...' : 'SUBMIT TO SENSOR GRID'}
                </TactileButton>
              </div>
            )}
          </div>
        </VectorCard>
      </div>
    </div>
  );
};
