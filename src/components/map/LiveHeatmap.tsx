import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { NoiseReading, NoiseIncident } from '../../types';
import { MapConfigService, TileLayerConfig } from '../../services/mapConfigService';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface LiveHeatmapProps {
  readings: NoiseReading[];
  incidents: NoiseIncident[];
  onSelectNode: (item: { reading?: NoiseReading; incident?: NoiseIncident }) => void;
  className?: string;
  onTileError?: (errorMsg: string) => void;
}

export const LiveHeatmap: React.FC<LiveHeatmapProps> = ({
  readings,
  incidents,
  onSelectNode,
  className = '',
  onTileError,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeTileConfig, setActiveTileConfig] = useState<TileLayerConfig>(() =>
    MapConfigService.getTileLayerConfig()
  );
  const [tileLoadError, setTileLoadError] = useState<string | null>(null);

  // Default coordinate center (universal viewport)
  const defaultCenter: [number, number] = [26.144, 91.736];

  // Helper to attach a tile layer and handle errors gracefully
  const attachTileLayer = useCallback((map: L.Map, config: TileLayerConfig) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    let errorCount = 0;
    const maxErrorsBeforeFallback = 3;

    const layer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abcd',
      attribution: config.attribution,
      className: config.className || '',
    });

    layer.on('tileerror', (errorEvent) => {
      errorCount++;
      console.warn(`[NoiseMap Tile Layer] Error loading tile from ${config.name}:`, errorEvent);

      if (errorCount >= maxErrorsBeforeFallback && config.provider !== 'osm_dark') {
        const warning = `Provider "${config.name}" tiles failed to load (Invalid key or network rejection). Automatically falling back to OpenStreetMap Standard.`;
        setTileLoadError(warning);
        if (onTileError) onTileError(warning);

        // Fall back automatically to OpenStreetMap Standard
        const fallbackConfig = MapConfigService.getTileLayerConfig('osm_dark');
        MapConfigService.setMapProvider('osm_dark');
        setActiveTileConfig(fallbackConfig);
        attachTileLayer(map, fallbackConfig);
      }
    });

    layer.on('load', () => {
      // Tiles loaded successfully
      if (errorCount === 0) {
        setTileLoadError(null);
      }
    });

    layer.addTo(map);
    tileLayerRef.current = layer;
  }, [onTileError]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: true, // Enable attribution display
      });

      // Position attribution in bottom-right with dark theme styling
      map.attributionControl.setPosition('bottomright');

      // Add custom positioned zoom controls
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Create Layer Group for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Attach tile layer
      const config = MapConfigService.getTileLayerConfig();
      setActiveTileConfig(config);
      attachTileLayer(map, config);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [attachTileLayer]);

  // Sync readings and verified incidents onto map canvas
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Render Individual Acoustic Node Markers
    readings.forEach((reading) => {
      const getZoneColor = (db: number) => {
        if (db < 50) return '#10B981'; // Emerald
        if (db < 70) return '#F59E0B'; // Amber
        if (db < 85) return '#F97316'; // Orange
        return '#EF4444'; // Crimson
      };

      const color = getZoneColor(reading.db_avg);
      const radius = Math.min(Math.max((reading.db_avg - 30) / 2.5, 8), 28);

      const circle = L.circleMarker([reading.lat, reading.lng], {
        radius: radius,
        fillColor: color,
        fillOpacity: 0.65,
        color: color,
        weight: 1.5,
      });

      circle.on('click', () => {
        onSelectNode({ reading });
      });

      circle.addTo(markersLayerRef.current!);
    });

    // 2. Render Verified Incidents with pulsing glowing beacons
    incidents.forEach((incident) => {
      const incidentIcon = L.divIcon({
        className: 'custom-incident-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-75"></span>
            <span class="relative inline-flex items-center justify-center rounded-full h-7 w-7 bg-rose-600 border-2 border-white text-[10px] font-bold text-white shadow-glow-crimson font-mono">
              ${incident.avg_db.toFixed(0)}
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([incident.center_lat, incident.center_lng], {
        icon: incidentIcon,
      });

      marker.on('click', () => {
        onSelectNode({ incident });
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [readings, incidents, onSelectNode]);

  const handleManualFallback = () => {
    if (mapInstanceRef.current) {
      MapConfigService.resetToDefault();
      const config = MapConfigService.getTileLayerConfig('osm_dark');
      setActiveTileConfig(config);
      attachTileLayer(mapInstanceRef.current, config);
      setTileLoadError(null);
    }
  };

  return (
    <div className={`relative w-full h-[520px] rounded-xl overflow-hidden border border-white/10 ${className}`}>
      {/* Map canvas container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#0B0F17]" />

      {/* Non-blocking tile error notification banner */}
      {tileLoadError && (
        <div className="absolute top-3 inset-x-0 mx-auto w-[92%] max-w-md z-[500] p-2.5 rounded-lg bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs font-mono shadow-xl flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="text-[11px] leading-tight">{tileLoadError}</span>
          </div>
          <button
            onClick={handleManualFallback}
            className="px-2 py-1 bg-slate-900 border border-white/20 rounded text-[10px] hover:text-white flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span>USE OSM</span>
          </button>
        </div>
      )}

      {/* Retro-vector crosshairs */}
      <span className="absolute top-2 left-2 font-mono text-xs text-slate-500 z-10 select-none pointer-events-none">+</span>
      <span className="absolute top-2 right-2 font-mono text-xs text-slate-500 z-10 select-none pointer-events-none">+</span>
      <span className="absolute bottom-2 left-2 font-mono text-xs text-slate-500 z-10 select-none pointer-events-none">+</span>
      <span className="absolute bottom-2 right-2 font-mono text-xs text-slate-500 z-10 select-none pointer-events-none">+</span>

      {/* Active Provider Indicator Badge */}
      <div className="absolute top-3 left-3 z-10 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded px-2 py-1 font-mono text-[10px] text-cyan-300 pointer-events-none select-none flex items-center gap-1.5 shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        <span>LAYER: {activeTileConfig.name}</span>
      </div>

      {/* Map Legend HUD */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-lg p-2.5 font-mono text-[10px] space-y-1 shadow-xl pointer-events-none select-none">
        <span className="text-slate-400 block font-semibold mb-1">ACOUSTIC SPECTRUM:</span>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>&lt;50 dB (Safe Zone)</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>50–70 dB (Moderate)</span>
        </div>
        <div className="flex items-center gap-1.5 text-orange-400">
          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
          <span>70–85 dB (Harmful Limit)</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>&gt;85 dB (CPCB Violation)</span>
        </div>
      </div>
    </div>
  );
};
