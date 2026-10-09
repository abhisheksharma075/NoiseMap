import React, { useState } from 'react';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { NoiseSourceType, NoiseZoneType } from '../../types';
import { Car, Hammer, Volume2, Factory, Plane, Bell, HelpCircle, CheckCircle2 } from 'lucide-react';

interface SourceTaggerModalProps {
  avgDb: number;
  peakDb: number;
  gridId: string;
  onConfirm: (source: NoiseSourceType, zone: NoiseZoneType) => void;
  onCancel: () => void;
}

export const SourceTaggerModal: React.FC<SourceTaggerModalProps> = ({
  avgDb,
  peakDb,
  gridId,
  onConfirm,
  onCancel,
}) => {
  const [selectedSource, setSelectedSource] = useState<NoiseSourceType>('traffic');
  const [selectedZone, setSelectedZone] = useState<NoiseZoneType>('residential');

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <VectorCard
          label="SAMPLE COMPLETED [METRICS CAPTURED]"
          tag="READY TO SUBMIT"
          variant="cyan"
          className="space-y-5"
        >
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 border border-white/10 rounded-lg font-mono text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">AVG LEVEL</span>
              <span className="text-xl font-bold text-cyan-300">{avgDb.toFixed(1)} dB</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">PEAK IMPULSE</span>
              <span className="text-xl font-bold text-rose-400">{peakDb.toFixed(1)} dB</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">GRID CELL</span>
              <span className="text-xs font-semibold text-slate-300 mt-1 block">{gridId}</span>
            </div>
          </div>

          {/* Noise Source Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 font-medium">
              <span>01. IDENTIFY NOISE SOURCE:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {sources.map((s) => {
                const isSelected = selectedSource === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSource(s.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left font-mono text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-glow-cyan/20'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {s.icon}
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Area Zone Classification */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 font-medium">
              <span>02. AREA ZONE CLASSIFICATION (CPCB LIMITS):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {zones.map((z) => {
                const isSelected = selectedZone === z.id;
                return (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZone(z.id)}
                    className={`flex flex-col p-2.5 rounded-lg border text-left font-mono text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/50 border-amber-400 text-amber-200'
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <TactileButton
              variant="ghost"
              className="flex-1"
              onClick={onCancel}
            >
              DISCARD SAMPLE
            </TactileButton>
            <TactileButton
              variant="cyan"
              className="flex-1"
              icon={<CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              onClick={() => onConfirm(selectedSource, selectedZone)}
            >
              SUBMIT TO SENSOR GRID
            </TactileButton>
          </div>
        </VectorCard>
      </div>
    </div>
  );
};
