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

  // Filter readings based on active temporal and source controls
  const now = Date.now();
  const filteredReadings = readings.filter((r) => {
    // 1. Source filter
    if (sourceFilter !== 'all' && r.source_type !== sourceFilter) {
      return false;
    }

    // 2. Time filter
    if (timeFilter !== 'all') {
      const readingTime = new Date(r.created_at).getTime();
      const ageMs = now - readingTime;

      switch (timeFilter) {
        case 'live':
          if (ageMs > 15 * 60 * 1000) return false; // 15 minutes
          break;
        case '1h':
          if (ageMs > 60 * 60 * 1000) return false; // 1 hour
          break;
        case '24h':
          if (ageMs > 24 * 60 * 60 * 1000) return false; // 24 hours
          break;
        case '7d':
          if (ageMs > 7 * 24 * 60 * 60 * 1000) return false; // 7 days
          break;
      }
    }

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
          className="min-h-[44px] p-3 bg-paper-50 dark:bg-night-850 border border-paper-border dark:border-night-border rounded-xl text-stone-600 dark:text-night-muted hover:text-forest-800 dark:hover:text-lime-300 hover:border-forest-600 dark:hover:border-lime-400 transition-colors flex items-center gap-2 font-mono text-xs cursor-pointer whitespace-nowrap shadow-sm"
          title="Configure Map Tile Provider & API Key"
        >
          <Settings className="w-4 h-4 text-forest-700 dark:text-lime-400" />
          <span className="hidden md:inline font-semibold">MAP SETTINGS</span>
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
      <div className="p-3 bg-paper-50/95 dark:bg-night-850/95 border border-paper-border dark:border-night-border rounded-xl flex items-center justify-between text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-forest-700 dark:text-lime-400 animate-pulse" />
          <span className="text-graphite-700 dark:text-night-muted">
            RADAR STATUS: <strong className="text-forest-800 dark:text-lime-300">WEBSOCKET FEED ACTIVE</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-terracotta-700 dark:text-terracotta-400 font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
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
