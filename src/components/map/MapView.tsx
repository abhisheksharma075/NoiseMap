import React, { useState, useEffect, useMemo } from 'react';
import { LiveHeatmap } from './LiveHeatmap';
import { MapFilterBar, TimeFilterType } from './MapFilterBar';
import { NodePopupDetails } from './NodePopupDetails';
import { MapKeyConfigModal } from './MapKeyConfigModal';
import { NoiseReading, NoiseIncident, NoiseSourceType } from '../../types';
import { AlertTriangle, Radio, Settings, Clock } from 'lucide-react';
import { AUDIO_CONFIG } from '../../config/audioThresholds';
import { NoiseActivityLifecycleService, LiveGridActivity } from '../../services/noiseActivityLifecycleService';

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
  const [selectedNode, setSelectedNode] = useState<{
    reading?: NoiseReading;
    incident?: NoiseIncident;
    activity?: LiveGridActivity;
  } | null>(null);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [mapKey, setMapKey] = useState<number>(0);

  // Dynamic clock tick: re-evaluates marker freshness every 30 seconds and on window focus
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, AUDIO_CONFIG.MAP_REFRESH_INTERVAL_MS);

    const handleFocus = () => setCurrentTime(Date.now());
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Spatial-temporal aggregation: exactly one marker per ~100m grid cell.
  // Newest measurements strictly supersede older measurements for each grid cell.
  const gridActivities = useMemo(() => {
    let sourceFiltered = readings;
    if (sourceFilter !== 'all') {
      sourceFiltered = readings.filter((r) => r.source_type === sourceFilter);
    }

    const aggregated = NoiseActivityLifecycleService.aggregateGridActivity(
      sourceFiltered,
      currentTime,
      AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES
    );

    return NoiseActivityLifecycleService.filterActivitiesByTime(
      aggregated,
      timeFilter,
      AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES
    );
  }, [readings, sourceFilter, timeFilter, currentTime]);

  // Synchronize incidents: in 'live' mode, only show incidents with active fresh evidence
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (timeFilter === 'live') {
        const isFresh = NoiseActivityLifecycleService.isMeasurementFresh(
          inc.last_seen_at || inc.created_at,
          currentTime,
          AUDIO_CONFIG.ACTIVE_NOISE_WINDOW_MINUTES
        );
        return inc.status === 'active' && isFresh;
      }
      return true;
    });
  }, [incidents, timeFilter, currentTime]);

  const activeIncidentsCount = useMemo(() => {
    return filteredIncidents.filter((i) => i.status === 'active').length;
  }, [filteredIncidents]);

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
            activeCount={gridActivities.length}
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
          gridActivities={gridActivities}
          readings={gridActivities.map((g) => g.latestReading)}
          incidents={filteredIncidents}
          onSelectNode={(node) => setSelectedNode(node)}
        />

        {/* Node Telemetry Inspector */}
        {selectedNode && (
          <NodePopupDetails
            reading={selectedNode.reading}
            incident={selectedNode.incident}
            activity={selectedNode.activity}
            onClose={() => setSelectedNode(null)}
            onGenerateComplaint={onGenerateComplaint}
          />
        )}
      </div>

      {/* Realtime Consensus Banner with Auto-Expiry Telemetry */}
      <div className="p-3 bg-paper-50/95 dark:bg-night-card border border-paper-border dark:border-night-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-forest-700 dark:text-teal-signal animate-pulse" />
          <span className="text-graphite-700 dark:text-night-muted">
            LIFECYCLE STATUS:{' '}
            <strong className="text-forest-800 dark:text-teal-300">
              {timeFilter === 'live' ? 'AUTO-EXPIRING (<15m ACTIVE)' : `${timeFilter.toUpperCase()} HISTORICAL VIEW`}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-night-muted text-[11px]">
            <Clock className="w-3.5 h-3.5 text-forest dark:text-teal-signal" />
            <span>30s Refresh</span>
          </div>

          <div className="flex items-center gap-1.5 text-terracotta dark:text-rose-400 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{activeIncidentsCount} VERIFIED ACTIVE HOTSPOTS</span>
          </div>
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
