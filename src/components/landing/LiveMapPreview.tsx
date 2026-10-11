import React, { useState } from 'react';
import { LiveHeatmap } from '../map/LiveHeatmap';
import { NodePopupDetails } from '../map/NodePopupDetails';
import { TactileButton } from '../common/TactileButton';
import { NoiseReading, NoiseIncident } from '../../types';
import { Maximize2, Radio, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LiveMapPreviewProps {
  readings: NoiseReading[];
  incidents: NoiseIncident[];
  onOpenFullMap: () => void;
  onGenerateComplaint?: (incident: NoiseIncident) => void;
}

export const LiveMapPreview: React.FC<LiveMapPreviewProps> = ({
  readings,
  incidents,
  onOpenFullMap,
  onGenerateComplaint,
}) => {
  const [selectedNode, setSelectedNode] = useState<{
    reading?: NoiseReading;
    incident?: NoiseIncident;
  } | null>(null);

  const activeIncidents = incidents.filter((i) => i.status === 'active');

  return (
    <section className="w-full py-8 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-forest-subtle dark:bg-forest/25 border border-forest/20 text-forest dark:text-lime-signal font-mono text-xs mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>GEOSPATIAL HEATMAP PREVIEW</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite dark:text-night-text tracking-tight font-sans">
              Urban Field Cartography
            </h2>
            <p className="text-xs sm:text-sm text-graphite-secondary dark:text-night-secondary font-sans mt-1 max-w-xl">
              Crowdsourced acoustic measurements mapped to ~100m privacy sectors. Tap any marker to inspect decibel telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <TactileButton
              variant="forest"
              size="md"
              icon={<Maximize2 className="w-4 h-4 text-lime-signal" />}
              onClick={onOpenFullMap}
              className="font-sans text-xs sm:text-sm py-2.5 px-4 shadow-field"
            >
              Open Full Map View
            </TactileButton>
          </div>
        </div>

        {/* Live Heatmap Container */}
        <div className="relative rounded-3xl overflow-hidden border border-paper-border dark:border-night-border bg-paper-soft dark:bg-night-surface shadow-field-lg">
          {/* Top Status Strip */}
          <div className="p-3 bg-paper dark:bg-night-bg border-b border-paper-border dark:border-night-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-graphite dark:text-night-text">
                <span className="w-2 h-2 rounded-full bg-forest dark:bg-lime-signal animate-pulse" />
                <span className="font-semibold">RADAR ACTIVE</span>
              </div>
              <span className="text-paper-border dark:text-night-border">|</span>
              <span className="text-forest dark:text-lime-signal font-semibold">{readings.length} SAMPLES MAPPED</span>
            </div>

            <div className="flex items-center gap-3">
              {activeIncidents.length > 0 ? (
                <div className="flex items-center gap-1.5 text-terracotta font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{activeIncidents.length} VERIFIED VIOLATION BEACONS</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-forest dark:text-lime-signal font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ALL SECTORS WITHIN CPCB LIMITS</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Leaflet Map Canvas */}
          <div className="relative min-h-[440px] sm:min-h-[500px]">
            <LiveHeatmap
              readings={readings}
              incidents={incidents}
              onSelectNode={(node) => setSelectedNode(node)}
              className="h-[440px] sm:h-[500px]"
            />

            {/* Node Telemetry Inspector Popup */}
            {selectedNode && (
              <NodePopupDetails
                reading={selectedNode.reading}
                incident={selectedNode.incident}
                onClose={() => setSelectedNode(null)}
                onGenerateComplaint={onGenerateComplaint}
              />
            )}
          </div>

          {/* Bottom Fieldwork Legend */}
          <div className="p-3 bg-paper-soft dark:bg-night-surface border-t border-paper-border dark:border-night-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="text-graphite-secondary dark:text-night-secondary font-semibold">ACOUSTIC SPECTRUM:</span>
              <div className="flex items-center gap-1.5 text-forest dark:text-lime-signal">
                <span className="w-2 h-2 rounded-full bg-forest dark:bg-forest-light" />
                <span>&lt;50 dB (Safe)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#6D7722] dark:text-lime-signal">
                <span className="w-2 h-2 rounded-full bg-[#8F9F24] dark:bg-lime-signal" />
                <span>50-70 dB (Moderate)</span>
              </div>
              <div className="flex items-center gap-1.5 text-terracotta">
                <span className="w-2 h-2 rounded-full bg-terracotta" />
                <span>70-85 dB (Harmful)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#B05E42] dark:text-[#E2886A]">
                <span className="w-2 h-2 rounded-full bg-[#B05E42] animate-pulse" />
                <span>&gt;85 dB (Breach)</span>
              </div>
            </div>

            <button
              onClick={onOpenFullMap}
              className="text-forest dark:text-lime-signal hover:underline transition-colors flex items-center gap-1 cursor-pointer text-xs font-semibold"
            >
              <span>Full Controls & Time Windows</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
