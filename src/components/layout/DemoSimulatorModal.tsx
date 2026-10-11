import React, { useState } from 'react';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { ShieldAlert, CheckCircle, RotateCcw, X, Volume2, CloudOff, Cloud } from 'lucide-react';
import { NoiseDataService } from '../../services/noiseDataService';
import { NoiseReading } from '../../types';

interface DemoSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectReadings: (readings: NoiseReading[]) => void;
  onResetToBaseline: () => void;
  activeCount: number;
}

export const DemoSimulatorModal: React.FC<DemoSimulatorModalProps> = ({
  isOpen,
  onClose,
  onInjectReadings,
  onResetToBaseline,
  activeCount,
}) => {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const isCloud = NoiseDataService.isCloudMode();

  if (!isOpen) return null;

  const handleSimulateClusterA = () => {
    // 3 citizens reporting 84 dB on Main Urban Sector
    const { readings } = NoiseDataService.generateSimulatedCluster(26.144, 91.736, 84.5);
    onInjectReadings(readings);
    setLastAction("Injected 3 Citizen Readings into Sector 26.144_91.736 (84.5 dB) -> Verified Incident Triggered!");
  };

  const handleSimulateSpikeB = () => {
    // Industrial machinery violation (92 dB)
    const { readings } = NoiseDataService.generateSimulatedCluster(26.152, 91.745, 92.0);
    onInjectReadings(readings);
    setLastAction("Injected 3 Industrial Impulse Readings into Sector 26.152_91.745 (92 dB) -> High-Priority Alert!");
  };

  const handleSimulateQuietC = () => {
    // Safe residential readings (44 dB)
    const newReading: NoiseReading = {
      id: 'sim_safe_' + crypto.randomUUID().slice(0, 6),
      session_id: 'citizen_quiet_' + Math.random().toString(36).substring(7),
      lat: 26.138,
      lng: 91.728,
      grid_id: '26.138_91.728',
      db_avg: 44.5,
      db_peak: 51.0,
      source_type: 'unknown',
      zone_type: 'residential',
      created_at: new Date().toISOString(),
    };
    onInjectReadings([newReading]);
    setLastAction("Injected Safe Compliant Sample in Sector 26.138_91.728 (44.5 dB Safe Green).");
  };

  return (
    <div className="fixed inset-0 bg-graphite-950/65 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-lg my-auto max-h-[92vh] max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <VectorCard
          label="FIELD TESTER DEMO SIMULATOR · EVALUATION TOOL"
          tag="LIVE INJECTION CONTROLLER"
          variant="forest"
          className="flex flex-col max-h-[92vh] max-h-[92dvh] overflow-y-auto p-4 sm:p-5 space-y-4 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-stone-500 hover:text-graphite-900 dark:hover:text-night-text p-1.5 rounded-md hover:bg-paper-200 dark:hover:bg-night-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Mode Status Pill */}
          <div className="flex items-center justify-between p-2.5 bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border rounded-lg font-mono text-xs">
            <div className="flex items-center gap-2">
              {isCloud ? (
                <div className="flex items-center gap-1.5 text-forest-700 dark:text-lime-400 font-semibold">
                  <Cloud className="w-4 h-4" />
                  <span>MODE: SUPABASE CLOUD SYNC</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-olive-700 dark:text-olive-300 font-semibold">
                  <CloudOff className="w-4 h-4" />
                  <span>MODE: AUTONOMOUS OFFLINE STORE</span>
                </div>
              )}
            </div>
            <span className="text-stone-600 dark:text-night-muted font-mono">
              ACTIVE NODES: <strong className="text-graphite-900 dark:text-night-text">{activeCount}</strong>
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-night-muted font-mono leading-relaxed">
            Trigger multi-device citizen consensus in real time to demonstrate algorithmic verification, confidence scores, and CPCB complaint PDF generation:
          </p>

          {/* Scenario Buttons */}
          <div className="space-y-2 font-mono text-xs">
            <button
              onClick={handleSimulateClusterA}
              className="w-full text-left p-3 min-h-[56px] rounded-lg border border-terracotta-300 dark:border-terracotta-700 bg-paper-50 dark:bg-night-800 hover:border-terracotta-500 text-graphite-900 dark:text-night-text transition-all cursor-pointer flex items-center justify-between shadow-xs"
            >
              <div>
                <span className="font-bold block text-terracotta-700 dark:text-terracotta-400">
                  01. SIMULATE 3 CITIZENS REPORTING NOISE (84 dB)
                </span>
                <span className="text-[11px] text-stone-500 dark:text-night-muted mt-0.5 block">
                  Injects 3 unique device tokens in Sector 26.144_91.736 to trigger incident consensus.
                </span>
              </div>
              <ShieldAlert className="w-5 h-5 text-terracotta-600 dark:text-terracotta-400 flex-shrink-0 ml-2" />
            </button>

            <button
              onClick={handleSimulateSpikeB}
              className="w-full text-left p-3 min-h-[56px] rounded-lg border border-olive-300 dark:border-olive-700 bg-paper-50 dark:bg-night-800 hover:border-olive-500 text-graphite-900 dark:text-night-text transition-all cursor-pointer flex items-center justify-between shadow-xs"
            >
              <div>
                <span className="font-bold block text-olive-800 dark:text-olive-300">
                  02. SIMULATE INDUSTRIAL VIOLATION SPIKE (92 dB)
                </span>
                <span className="text-[11px] text-stone-500 dark:text-night-muted mt-0.5 block">
                  Triggers acute impulse hazard breaching statutory limits by +37 dB.
                </span>
              </div>
              <Volume2 className="w-5 h-5 text-olive-700 dark:text-olive-400 flex-shrink-0 ml-2" />
            </button>

            <button
              onClick={handleSimulateQuietC}
              className="w-full text-left p-3 min-h-[56px] rounded-lg border border-forest-300 dark:border-forest-700 bg-paper-50 dark:bg-night-800 hover:border-forest-500 text-graphite-900 dark:text-night-text transition-all cursor-pointer flex items-center justify-between shadow-xs"
            >
              <div>
                <span className="font-bold block text-forest-800 dark:text-lime-400">
                  03. SIMULATE SAFE RESIDENTIAL READING (44.5 dB)
                </span>
                <span className="text-[11px] text-stone-500 dark:text-night-muted mt-0.5 block">
                  Demonstrates normal green compliant node on the interactive heatmap.
                </span>
              </div>
              <CheckCircle className="w-5 h-5 text-forest-700 dark:text-lime-400 flex-shrink-0 ml-2" />
            </button>
          </div>

          {/* Feedback ticker */}
          {lastAction && (
            <div className="p-2.5 bg-forest-50 dark:bg-night-900 border border-forest-400 dark:border-forest-700 rounded-lg text-forest-800 dark:text-lime-300 text-xs font-mono animate-in fade-in">
              {lastAction}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 font-mono">
            <TactileButton
              variant="ghost"
              size="md"
              icon={<RotateCcw className="w-4 h-4 text-stone-500" />}
              onClick={() => {
                onResetToBaseline();
                setLastAction("Reset dataset to clean baseline.");
              }}
            >
              RESET BASELINE
            </TactileButton>

            <TactileButton
              variant="forest"
              size="md"
              className="flex-1"
              onClick={onClose}
            >
              RETURN TO APP
            </TactileButton>
          </div>
        </VectorCard>
      </div>
    </div>
  );
};
