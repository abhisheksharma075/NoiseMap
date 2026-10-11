import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { NoiseReading, NoiseIncident } from '../../types';
import { MapConfigService, TileLayerConfig } from '../../services/mapConfigService';
import { locationService } from '../../services/locationService';
import { AlertCircle, RotateCcw, Crosshair, Loader2 } from 'lucide-react';

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
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hasAutoCenteredRef = useRef<boolean>(false);

  const [activeTileConfig, setActiveTileConfig] = useState<TileLayerConfig>(() =>
    MapConfigService.getTileLayerConfig()
  );
  const [tileLoadError, setTileLoadError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Default fallback coordinate center (universal viewport)
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
      if (errorCount === 0) {
        setTileLoadError(null);
      }
    });

    layer.addTo(map);
    tileLayerRef.current = layer;
  }, [onTileError]);

  // Center on coordinates and place/update the yellow live-location marker
  const updateLiveLocationMarker = useCallback((lat: number, lng: number, accuracyMeters?: number, isLive: boolean = true) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Create high-visibility pulsing yellow live-location pin
    const yellowLiveIcon = L.divIcon({
      className: 'custom-live-user-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full ${isLive ? 'bg-amber-400' : 'bg-slate-400'} opacity-75"></span>
          <span class="relative inline-flex items-center justify-center rounded-full h-5 w-5 ${isLive ? 'bg-amber-400' : 'bg-slate-300'} border-2 border-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.9)]">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
          </span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
      userMarkerRef.current.setIcon(yellowLiveIcon);
    } else {
      userMarkerRef.current = L.marker([lat, lng], {
        icon: yellowLiveIcon,
        zIndexOffset: 1000, // Keep user marker on top of noise circles
      }).addTo(map);

      userMarkerRef.current.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; color: #1e293b; padding: 2px;">
          <strong style="color: ${isLive ? '#d97706' : '#475569'};">${isLive ? 'YOUR LIVE LOCATION' : 'LAST RECORDED LOCATION'}</strong><br/>
          Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°<br/>
          ${accuracyMeters ? `GPS Precision: ±${accuracyMeters}m` : ''}
        </div>
      `);
    }
  }, []);

  // Center map on user location
  const centerOnUserLocation = useCallback(async (isManualTrigger: boolean = false) => {
    setIsLocating(true);
    setLocationStatus(null);

    try {
      const pos = await locationService.getQuantizedPosition();
      if (mapInstanceRef.current) {
        updateLiveLocationMarker(pos.lat, pos.lng, pos.accuracyMeters, true);
        mapInstanceRef.current.setView([pos.lat, pos.lng], 15, { animate: true });
        hasAutoCenteredRef.current = true;
      }
    } catch (locErr) {
      console.warn('[LiveHeatmap] Geolocation query failed or denied:', locErr);

      // Check for cached previous location
      const cached = locationService.getLastKnownLocation();
      if (cached && mapInstanceRef.current) {
        updateLiveLocationMarker(cached.lat, cached.lng, cached.accuracyMeters, false);
        if (isManualTrigger || !hasAutoCenteredRef.current) {
          mapInstanceRef.current.setView([cached.lat, cached.lng], 15, { animate: true });
          hasAutoCenteredRef.current = true;
        }
        setLocationStatus('Using last known location (GPS unavailable)');
      } else if (readings.length > 0 && readings[0] && mapInstanceRef.current) {
        // If no GPS, center on user's most recent submitted sample
        const latestReading = readings[0];
        updateLiveLocationMarker(latestReading.lat, latestReading.lng, 100, false);
        if (isManualTrigger || !hasAutoCenteredRef.current) {
          mapInstanceRef.current.setView([latestReading.lat, latestReading.lng], 15, { animate: true });
          hasAutoCenteredRef.current = true;
        }
        setLocationStatus('Centered on recent reading sector');
      } else {
        if (isManualTrigger) {
          setLocationStatus('GPS permission denied. Using universal map center.');
        }
      }
    } finally {
      setIsLocating(false);
      setTimeout(() => setLocationStatus(null), 5000);
    }
  }, [readings, updateLiveLocationMarker]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Determine initial center
      const cached = locationService.getLastKnownLocation();
      const initialCenter: [number, number] = cached ? [cached.lat, cached.lng] : defaultCenter;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: true,
      });

      map.attributionControl.setPosition('bottomright');
      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      const config = MapConfigService.getTileLayerConfig();
      setActiveTileConfig(config);
      attachTileLayer(map, config);

      if (cached) {
        updateLiveLocationMarker(cached.lat, cached.lng, cached.accuracyMeters, false);
      }

      // Request fresh GPS location and center map automatically
      centerOnUserLocation(false);

      // Invalidate Leaflet canvas size to ensure crisp rendering after layout paint
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        userMarkerRef.current = null;
        hasAutoCenteredRef.current = false;
      }
    };
  }, [attachTileLayer, centerOnUserLocation, updateLiveLocationMarker]);

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
      const config = MapConfigService.getTileLayerConfig('stadia_dark');
      setActiveTileConfig(config);
      attachTileLayer(mapInstanceRef.current, config);
      setTileLoadError(null);
    }
  };

  return (
    <div className={`relative w-full h-[520px] rounded-xl overflow-hidden border border-paper-border dark:border-night-border shadow-md ${className}`}>
      {/* Map canvas container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-paper-200 dark:bg-[#121714]" />

      {/* Non-blocking tile error notification banner */}
      {tileLoadError && (
        <div className="absolute top-3 inset-x-0 mx-auto w-[92%] max-w-md z-[500] p-2.5 rounded-lg bg-terracotta-50/95 dark:bg-night-900/95 border border-terracotta-300 dark:border-terracotta-700 text-terracotta-900 dark:text-terracotta-200 text-xs font-mono shadow-xl flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400 flex-shrink-0" />
            <span className="text-[11px] leading-tight">{tileLoadError}</span>
          </div>
          <button
            onClick={handleManualFallback}
            className="px-2 py-1 bg-paper-100 dark:bg-night-800 border border-paper-border dark:border-night-border rounded text-[10px] font-semibold text-graphite-900 dark:text-night-text hover:bg-paper-200 flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <RotateCcw className="w-3 h-3 text-forest-700 dark:text-lime-400" />
            <span>USE STADIA</span>
          </button>
        </div>
      )}

      {/* Retro-vector crosshairs */}
      <span className="absolute top-2 left-2 font-mono text-xs text-stone-400 dark:text-stone-600 z-10 select-none pointer-events-none">+</span>
      <span className="absolute top-2 right-2 font-mono text-xs text-stone-400 dark:text-stone-600 z-10 select-none pointer-events-none">+</span>
      <span className="absolute bottom-2 left-2 font-mono text-xs text-stone-400 dark:text-stone-600 z-10 select-none pointer-events-none">+</span>
      <span className="absolute bottom-2 right-2 font-mono text-xs text-stone-400 dark:text-stone-600 z-10 select-none pointer-events-none">+</span>

      {/* Active Provider Indicator Badge & Locate Me Button */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-paper-50/95 dark:bg-night-900/90 backdrop-blur-md border border-paper-border dark:border-night-border rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-graphite-800 dark:text-lime-300 pointer-events-none select-none flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-forest-600 dark:bg-lime-400"></span>
          <span className="font-semibold">LAYER: {activeTileConfig.name}</span>
        </div>

        <button
          onClick={() => centerOnUserLocation(true)}
          disabled={isLocating}
          className="bg-paper-50/95 hover:bg-paper-100 dark:bg-night-900/90 dark:hover:bg-night-800 backdrop-blur-md border border-forest-600/40 hover:border-forest-700 dark:border-lime-400/40 text-forest-800 dark:text-lime-300 rounded-lg px-3 py-1.5 font-mono text-[10px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          title="Center Map on Live Location"
        >
          {isLocating ? (
            <Loader2 className="w-3 h-3 text-forest-600 dark:text-lime-400 animate-spin" />
          ) : (
            <Crosshair className="w-3 h-3 text-forest-700 dark:text-lime-400" />
          )}
          <span>{isLocating ? 'LOCATING...' : 'LOCATE ME'}</span>
        </button>
      </div>

      {/* Geolocation status banner */}
      {locationStatus && (
        <div className="absolute top-12 left-3 z-10 bg-paper-50/95 dark:bg-night-900/95 border border-forest-600/30 text-forest-800 dark:text-lime-300 rounded-lg px-2.5 py-1 font-mono text-[10px] shadow-sm animate-in fade-in select-none pointer-events-none">
          {locationStatus}
        </div>
      )}

      {/* Map Legend HUD */}
      <div className="absolute bottom-4 left-4 z-10 bg-paper-50/95 dark:bg-night-900/90 backdrop-blur-md border border-paper-border dark:border-night-border rounded-lg p-2.5 font-mono text-[10px] space-y-1 shadow-md pointer-events-none select-none text-graphite-800 dark:text-night-text">
        <span className="text-stone-500 dark:text-night-muted block font-semibold mb-1 uppercase tracking-wider">ACOUSTIC SPECTRUM:</span>
        <div className="flex items-center gap-1.5 text-forest-700 dark:text-forest-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-forest-600"></span>
          <span>&lt;50 dB (Safe Zone)</span>
        </div>
        <div className="flex items-center gap-1.5 text-olive-700 dark:text-olive-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-olive-500"></span>
          <span>50–70 dB (Moderate)</span>
        </div>
        <div className="flex items-center gap-1.5 text-terracotta-600 dark:text-terracotta-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-terracotta-500"></span>
          <span>70–85 dB (Harmful Limit)</span>
        </div>
        <div className="flex items-center gap-1.5 text-terracotta-700 dark:text-terracotta-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-terracotta-600 animate-pulse"></span>
          <span>&gt;85 dB (CPCB Violation)</span>
        </div>
      </div>
    </div>
  );
};
