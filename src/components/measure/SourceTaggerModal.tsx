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
    { id: 'traffic', label: 'Traffic & Honking', icon: <Car className="w-4 h-4 text-cyan-400" /> },
    { id: 'construction', label: 'Construction Work', icon: <Hammer className="w-4 h-4 text-amber-400" /> },
    { id: 'loudspeaker', label: 'Loudspeaker / Events', icon: <Volume2 className="w-4 h-4 text-rose-400" /> },
    { id: 'industrial', label: 'Industrial Machinery', icon: <Factory className="w-4 h-4 text-orange-400" /> },
    { id: 'aircraft', label: 'Aviation / Aircraft', icon: <Plane className="w-4 h-4 text-blue-400" /> },
    { id: 'siren', label: 'Emergency Sirens', icon: <Bell className="w-4 h-4 text-red-500" /> },
    { id: 'unknown', label: 'Unidentified Ambient', icon: <HelpCircle className="w-4 h-4 text-slate-400" /> },
  ];

  const zones: { id: NoiseZoneType; label: string; dayLimit: string; nightLimit: string }[] = [
    { id: 'residential', label: 'Residential Zone', dayLimit: '55 dB', nightLimit: '45 dB' },
    { id: 'commercial', label: 'Commercial Zone', dayLimit: '65 dB', nightLimit: '55 dB' },
    { id: 'industrial', label: 'Industrial Area', dayLimit: '75 dB', nightLimit: '70 dB' },
    { id: 'silence', label: 'Silence Zone (Hospital/School)', dayLimit: '50 dB', nightLimit: '40 dB' },
  ];

  const handleSubmit = async () => {
    // Validation: Ensure valid metrics and selections
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-lg my-auto max-h-[92vh] max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <VectorCard
          label="SAMPLE COMPLETED [METRICS CAPTURED]"
          tag={isSubmitting ? 'TRANSMITTING...' : 'READY TO SUBMIT'}
          variant={isSubmitting ? 'amber' : 'cyan'}
          className="flex flex-col max-h-[92vh] max-h-[92dvh] p-4 sm:p-5"
        >
          {/* Top Dismiss Button */}
          <button
            onClick={handleDiscardClick}
            disabled={isSubmitting}
            aria-label="Discard Sample"
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 overscroll-contain pb-2">
            {/* Summary Metric Strip */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 border border-white/10 rounded-lg font-mono text-center">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Avg Level</span>
                <span className="text-lg sm:text-xl font-bold text-cyan-300">{avgDb.toFixed(1)} dB</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Peak Hold</span>
                <span className="text-lg sm:text-xl font-bold text-rose-400">{peakDb.toFixed(1)} dB</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Grid Cell</span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-300 mt-1 block truncate">
                  {gridId}
                </span>
              </div>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-lg text-rose-200 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Noise Source Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center justify-between font-medium">
                <span>01. IDENTIFY NOISE SOURCE:</span>
                <span className="text-[10px] text-slate-400 uppercase">Single Choice</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sources.map((s) => {
                  const isSelected = selectedSource === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedSource(s.id);
                        setValidationError(null);
                      }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left font-mono text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-glow-cyan/20 ring-1 ring-cyan-400/50'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="flex-shrink-0">{s.icon}</span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area Zone Classification */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center justify-between font-medium">
                <span>02. AREA ZONE CLASSIFICATION (CPCB LIMITS):</span>
                <span className="text-[10px] text-slate-400 uppercase">Statutory Category</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {zones.map((z) => {
                  const isSelected = selectedZone === z.id;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedZone(z.id);
                        setValidationError(null);
                      }}
                      className={`flex flex-col p-2.5 rounded-lg border text-left font-mono text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-glow-amber/20 ring-1 ring-amber-400/50'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="font-semibold text-white">{z.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Day: {z.dayLimit} · Night: {z.nightLimit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions Container */}
          <div className="pt-3 mt-1 border-t border-white/10 flex-shrink-0">
            {showDiscardConfirm ? (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-lg space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-200 font-mono text-xs font-semibold">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Discard this measurement sample?</span>
                </div>
                <p className="text-[11px] font-mono text-slate-300">
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
                    variant="crimson"
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
                  variant="cyan"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-3 text-xs sm:text-sm order-1 sm:order-2"
                  icon={
                    isSubmitting ? (
                      <Loader2 className="w-4 h-4 text-cyan-300 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
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
