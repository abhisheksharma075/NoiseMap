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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <VectorCard
          label="FIELD TESTER DEMO SIMULATOR [HACKATHON HUD]"
          tag="LIVE INJECTION CONTROLLER"
          variant="cyan"
          className="space-y-4"
        >
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Mode Status Pill */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-white/10 rounded-lg font-mono text-xs">
            <div className="flex items-center gap-2">
              {isCloud ? (
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Cloud className="w-4 h-4" />
                  <span>MODE: SUPABASE CLOUD SYNC</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <CloudOff className="w-4 h-4" />
                  <span>MODE: AUTONOMOUS OFFLINE STORE</span>
                </div>
              )}
            </div>
            <span className="text-slate-400">
              ACTIVE NODES: <strong className="text-white">{activeCount}</strong>
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            Trigger multi-device citizen consensus in real time to demonstrate algorithmic verification, confidence scores, and CPCB complaint PDF generation to judges:
          </p>

          {/* Scenario Buttons */}
          <div className="space-y-2 font-mono text-xs">
            <button
              onClick={handleSimulateClusterA}
              className="w-full text-left p-3 rounded-lg border border-rose-500/30 bg-rose-950/40 hover:bg-rose-950/70 text-white transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-bold block text-rose-300">
                  01. SIMULATE 3 CITIZENS REPORTING NOISE (84 dB)
                </span>
                <span className="text-[11px] text-slate-400">
                  Injects 3 unique device tokens in Sector 26.144_91.736 to trigger incident consensus.
                </span>
              </div>
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 ml-2" />
            </button>

            <button
              onClick={handleSimulateSpikeB}
              className="w-full text-left p-3 rounded-lg border border-amber-500/30 bg-amber-950/40 hover:bg-amber-950/70 text-white transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-bold block text-amber-300">
                  02. SIMULATE INDUSTRIAL VIOLATION SPIKE (92 dB)
                </span>
                <span className="text-[11px] text-slate-400">
                  Triggers acute impulse hazard breaching statutory limits by +37 dB.
                </span>
              </div>
              <Volume2 className="w-5 h-5 text-amber-400 flex-shrink-0 ml-2" />
            </button>

            <button
              onClick={handleSimulateQuietC}
              className="w-full text-left p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-950/70 text-white transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-bold block text-emerald-300">
                  03. SIMULATE SAFE RESIDENTIAL READING (44.5 dB)
                </span>
                <span className="text-[11px] text-slate-400">
                  Demonstrates normal green compliant node on the interactive heatmap.
                </span>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 ml-2" />
            </button>
          </div>

          {/* Feedback ticker */}
          {lastAction && (
            <div className="p-2.5 bg-cyan-950/50 border border-cyan-500/40 rounded text-cyan-300 text-xs font-mono animate-in fade-in">
              {lastAction}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 font-mono">
            <TactileButton
              variant="ghost"
              size="md"
              icon={<RotateCcw className="w-4 h-4 text-slate-400" />}
              onClick={() => {
                onResetToBaseline();
                setLastAction("Reset dataset to clean baseline.");
              }}
            >
              RESET TO BASELINE
            </TactileButton>

            <TactileButton
              variant="cyan"
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
