import React, { useState } from 'react';
import { LiveHeatmap } from './LiveHeatmap';
import { MapFilterBar, TimeFilterType } from './MapFilterBar';
import { NodePopupDetails } from './NodePopupDetails';
import { MapKeyConfigModal } from './MapKeyConfigModal';
import { NoiseReading, NoiseIncident, NoiseSourceType } from '../../types';
import { AlertTriangle, Radio, Settings } from 'lucide-react';

interface MapViewProps {
  readings: NoiseReading[];
  incidents: NoiseIncident[];
  onGenerateComplaint?: (incident: NoiseIncident) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  readings,
  incidents,
  onGenerateComplaint,
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('live');
  const [sourceFilter, setSourceFilter] = useState<NoiseSourceType | 'all'>('all');
  const [selectedNode, setSelectedNode] = useState<{ reading?: NoiseReading; incident?: NoiseIncident } | null>(null);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [mapKey, setMapKey] = useState<number>(0);

  // Filter readings based on active controls
  const filteredReadings = readings.filter((r) => {
    if (sourceFilter !== 'all' && r.source_type !== sourceFilter) return false;
    return true;
  });

  return (
    <div className="w-full max-w-5xl space-y-4">
      {/* Top Map Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex-1 w-full">
          <MapFilterBar
            timeFilter={timeFilter}
            onChangeTimeFilter={setTimeFilter}
            sourceFilter={sourceFilter}
            onChangeSourceFilter={setSourceFilter}
            activeCount={filteredReadings.length}
          />
        </div>
        <button
          onClick={() => setShowKeyModal(true)}
          className="p-3 bg-surface/90 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5 font-mono text-xs cursor-pointer whitespace-nowrap"
          title="Configure Map Tile Provider & API Key"
        >
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">MAP SETTINGS</span>
        </button>
      </div>

      {/* Main Map Viewport with overlay popup */}
      <div className="relative">
        <LiveHeatmap
          key={mapKey}
          readings={filteredReadings}
          incidents={incidents}
          onSelectNode={(node) => setSelectedNode(node)}
        />

        {/* Node Telemetry Inspector */}
        {selectedNode && (
          <NodePopupDetails
            reading={selectedNode.reading}
            incident={selectedNode.incident}
            onClose={() => setSelectedNode(null)}
            onGenerateComplaint={onGenerateComplaint}
          />
        )}
      </div>

      {/* Realtime Consensus Banner */}
      <div className="p-3 bg-surface/90 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-slate-300">
            RADAR STATUS: <strong className="text-cyan-300">WEBSOCKET FEED ACTIVE</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{incidents.length} VERIFIED ACTIVE HOTSPOTS</span>
        </div>
      </div>

      {/* Map Key & Provider Config Modal */}
      <MapKeyConfigModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSaved={() => setMapKey((prev) => prev + 1)}
      />
    </div>
  );
};
